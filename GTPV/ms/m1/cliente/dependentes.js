H.Dependentes = function() {
	var my = {};
	
	var arrayDependentes = [];
	var arrayDepToSat = [];
	var CodiDepActives = [];
//	var DepActives = [];
	var version = 1;
	
	var changeHandlers = [];

	function runChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	my.addChangeHandler = function(changeH) {
		changeHandlers.push(changeHandler);
	}
	
	var callbackInit;
	function runCallbackInit() {
		if (callbackInit != null) {
			callbackInit();
			callbackInit = null;
		}
	}
	
	function testDepAct(dbName, callback) {
		if (dbName == null) {
			callback(false);
			return;
		}
		var db = H.DB.open(dbName);
		db.transaction(function(tx) {
			H.DB.exec(tx, "SELECT CodiDepAct FROM _g_CodiDepAct", [], function(tx,r) {
				if (r.rows.length > 0) {
					try {
						CodiDepActives = JSON.parse(r.rows.item(0).CodiDepAct);
					} catch(e) {}
				}
				callback(true);
			});
		}, function(e) { callback(false); })
	}
	
	var lastDBNameDepAct;
	
	function restoreCodiDepActives(callback) {
		lastDBNameDepAct = H.GlobalGTPV.get("lastDBNameDepAct");
		if (lastDBNameDepAct != null) {
			testDepAct(lastDBNameDepAct[0], function(testOk) {
				if (testOk) {
					lastDBNameDepAct = lastDBNameDepAct[0];
					callback();
				} else testDepAct(lastDBNameDepAct[1], function(testOk) {
					lastDBNameDepAct = lastDBNameDepAct[1];
					H.GlobalGTPV.save("lastDBNameDepAct", [lastDBNameDepAct, null], function() {
						callback();
					});			
				});
			});
		} else callback();
	}

	function sortVerifyCodiDepActives() {
		var depActives = [];
		CodiDepActives.forEach(function(codi) {
			var dep = my.getByCodi(codi);
			if (dep != null) depActives.push(dep);
		});
		depActives.sort(getSortFunction("compareNom"));
		CodiDepActives = [];
		depActives.forEach(function(dep) { CodiDepActives.push(dep.codi); });
	}
	
	
/*	var restored= false;
	function restoreActives() {
		if (restored) return;
		CodiDepActives = [];
		var d = LS.get("CodiDepActives");
		if (d instanceof Array)  {
			for (var i=0; i<d.length; i++) {
				var dep = getByCodi(d[i]);
				if (dep != null) CodiDepActives.push(d[i]);
			}
		}
		restored = true;
	}
	function save() {
		LS.save("CodiDepActives", CodiDepActives);
	}
*/
	
	// previene escribir simultaneamente las dep. actives en dos db diferentes en el cambio de mes
	// y modificar lastDBNameDepAct antes de escribir
	var waitFuncs = [];
	function waitSaveDepAct(f) {
		if (waitFuncs.push(f) === 1) f();
	}
	my.unWaitSaveDepAct = function() {
		waitFuncs.shift();
		if (waitFuncs.length === 0) return;
		setTimeout(waitFuncs[0], 0);
	}
	
	var savedCodiDepAct = [];
	
	my.preSave = function(sqlDate, callback) {
		// salvar copia antes de insertar en BD podria modificarse
		savedCodiDepAct.push(CodiDepActives.slice(0)); 
		waitSaveDepAct(function() {
			var nextDBNameDepAct = H.DB.getMensualName(sqlDate);
			if (lastDBNameDepAct != nextDBNameDepAct) {
				H.GlobalGTPV.save("lastDBNameDepAct", [nextDBNameDepAct, lastDBNameDepAct], function() {
					lastDBNameDepAct = nextDBNameDepAct;
					callback();
				}); 
			} else callback();
		})
	}
	my.save = function(tx) {
		H.DB.exec(tx,"CREATE TABLE IF NOT EXISTS [_g_CodiDepAct] (CodiDepAct text)",[]);
		H.DB.exec(tx,"DELETE FROM [_g_CodiDepAct] ", []);
		H.DB.exec(tx,"INSERT INTO [_g_CodiDepAct] (CodiDepAct) VALUES (?)",
			[JSON.stringify(savedCodiDepAct.shift())]);
		my.unWaitSaveDepAct(); 
	}
	
	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;	
		restoreCodiDepActives(function() {
			H.DB.addReloadDBHandler(function() { obtenerDB(); });
			obtenerDB();
		});
	}

	
//	my.getByIdx = function(idx) { return arrayDependentes[idx]; }
	 
	my.getByCodi = function(codi) {
		for (var i=0; i<arrayDependentes.length; i++) {
			var dep = arrayDependentes[i];
			if (dep.codi === codi) return dep;
		}
		return null;
	}
	
	function obtenerDB() {
		var db = H.DB.openPrincipal()
		var stat = "SELECT d.codi as codi, d.nom as nom, p.valor as password, tt.valor as tipusTreballador " 
                  +"FROM dependentes as d "
				  +"INNER JOIN ("
				  +"    SELECT id, valor FROM dependentesextes "
				  +"    WHERE nom = 'PASSWORD'"
				  +") as p "
				  +"ON (d.codi = p.id) "
				  +"INNER JOIN ("
				  +"    SELECT id, valor FROM dependentesextes "
				  +"    WHERE nom = 'TIPUSTREBALLADOR'"
				  +") as tt "
				  +"ON (d.codi = tt.id) ";
		
		db.transaction(function (tx) {
			H.DB.exec(tx, stat, [], function (tx,res) { procesarDatos(res); });
		}, function(e) { procesarDatos({ rows:[] }); } );

		function procesarDatos(res) {
			arrayDependentes = [];
			var fHayResponsable = false;
			for (var i=0; i<res.rows.length; i++) {
				var row = res.rows.item(i), obj = {}; // props de rows readonly
				for (var prop in row) { obj[prop] = row[prop]; }
				if (obj.codi == null) continue;
				if (obj.nom == null) obj.nom = "";
				obj.compareNom = conversionForCompare(obj.nom);
				if (obj.tipusTreballador == "RESPONSABLE") {
					obj.esResponsable = true;
					fHayResponsable = true;
				} else { obj.esResponsable = false; }
				obj.noPassword = ((obj.password == null) || (obj.password === ""));	
				arrayDependentes.push(obj);
			}
			if (!fHayResponsable) { arrayDependentes.forEach(function(dep) { dep.esResponsable = true; }); }
			arrayDependentes = arrayDependentes.sort(getSortFunction("compareNom"));
			arrayDepToSat = arrayDependentes.map(function(dep) {
				var depSat = $.extend({}, dep);
				delete depSat.password;
				return depSat;
			});
//			restoreActives();
			sortVerifyCodiDepActives();
			actualizeSat("All");
//			runChangeHandlers();
			runCallbackInit();
		}
	}
	
	function getComHandler(obj) {
		return function(ret) {
		}
	}
	
	var sats = [];
	var objs = [];
	
	my.createSat = function(sat, callback) {
		var obj = sat.createObj("Dependentes", createObjSat, createObjHost, callback, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true };
		obj.data.comHandler = getComHandler(obj);
		//availableCommHandler(obj);		
	}
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	
	function availableCommHandler(objSat) {
		var act = objSat.data.actualize;
		if (act.All || act.Actives) { 
			objSat.call("actualize", 
				[act.All ? arrayDepToSat : null, CodiDepActives, version], 
				objSat.data.comHandler);
			act.All = act.Actives = false;
		} 
	}
	
	function actualizeSat(type, noActObj) {
		objs.forEach(function(obj) {
			if (noActObj === obj) return;
			obj.data.actualize[type] = true;
			obj.readyComm();
		});
	}

	function createObjHost(objSat) {
		return $.extend(Object.create(null), {
			addActiva : function(codi, password) { 
				var dep = my.getByCodi(codi);
				if (dep == null) {
					return null; // ????
				}
				if (CodiDepActives.indexOf(codi) !== -1)
					return true;
				if ((dep.password != null) && (dep.password != password))
					return false;
				for (var i=0; i<CodiDepActives.length; i++) { 
					var depI = my.getByCodi(CodiDepActives[i]);
					if (depI.compareNom > dep.compareNom) break;
				}	
				CodiDepActives.splice(i,0,codi);
				version++;
				actualizeSat("Actives", null);
				var sqlDate = H.DB.DateToSql(new Date());
				my.preSave(sqlDate, function() {
					H.DB.preOpenMensual(sqlDate, "V_Horaris_", function(h) {
						var db = H.DB.open(h.dbName);
						H.DB.transactionWithErr(db, function (tx) {
							H.DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
															+"[Dependenta] float, [Operacio] nvarchar(25), ");
							H.DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
															 [H.GlobalGTPV.get("Llicencia"), sqlDate, codi, "E"],
															 h.mark);
							my.save(tx);
						});	
					});	
				});
				return true;
			},
			delActiva : function(codi, versionSat) { 
				for (var i=0; i<CodiDepActives.length; i++) {
					if (CodiDepActives[i] === dep.codi) {
						CodiDepActives.splice(i,1);
						version++;
						actualizeSat("Actives", (version === versionSat) ? objSat : null);
						var sqlDate = H.DB.DateToSql(new Date());
						my.preSave(sqlDate, function() {
							H.DB.preOpenMensual(sqlDate, "V_Horaris_", function(h) {;
								var db = H.DB.open(h.dbName);
								H.DB.transactionWithErr(db, function (tx) {
									H.DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
																	+"[Dependenta] float, [Operacio] nvarchar(25), ");
									H.DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
																	  [H.GlobalGTPV.get("Llicencia"), sqlDate, dep.codi, "P"],
																	  h.mark);
									my.save(tx);
								});
							});
						});
					}
				}
				return version;
			}
		});
	}
	
	// ejecutado en satelite
	var createObjSat = function (host) {
		return createDependentesS(host);	
	}
	
	return my;
}();

H.Scripts.addLocalExec("DependentesS", function(window) {

window.createDependentesS = function(host) {
	window.createDependentesS = null; // no double initialize
	
	var my = {};
	window.Dependentes = my;
	
	var arrayDependentes;
//	var DepActives;
	var CodiDepActives;
	
	var changeHandlers = [];
	
	function runChangeHandlers() {
//		var args = arguments;
		setTimeout(function() {
			changeHandlers.forEach(function(h) { h(); /*f.apply(null, args);*/ });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}

	my.addActiva = function(codiDep, password, callback) { 
		host.call("addActiva", [codiDep, password], callback);
	}
	my.delActiva = function(codiDep) { 
		var idx = CodiDepActives.indexOf(codiDep);
		if (idx === -1) return;
		CodiDepActives.splice(idx, 1);
		callHost("delActiva", [codiDep]);
		runChangeHandlers();
	}

//		my.getActual = function() { return depActual; }
	my.getByIdx = function(idx) { return arrayDependentes[idx]; }
	my.getDependentes = function() { return arrayDependentes; }	
//	my.getActivaByIdx = function(idx) { return DepActives[idx]; } 
	my.getCodiActives = function() { return CodiDepActives; }
	my.getByCodi = function(codi) {
		for (var i=0; i<arrayDependentes.length; i++) {
			var dep = arrayDependentes[i];
			if (dep.codi === codi) return dep;
		}
		return null;
	}
	
	
	var nWaits = 0;
	var waitVersion = 0;
	function waitFunction(versionH) {
		nWaits--;
		waitVersion = versionH;
		processActData();
	}
	function getWaitFunction() {
		nWaits++;
		return waitFunction;
	}
	var actData = { version: -1 };
	function processActData() {
		if (nWaits > 0) return false;
		if (actData.version >= waitVersion) { 
			if (actData.arrayDependentes) arrayDependentes = actData.arrayDependentes;
			CodiDepActives  = actData.CodiDepActives ;
			version = actData.version;
			actData = { version: -1 };
			runChangeHandlers();
			return true;
		}
		return false;		
	}

	var version = 0;
	function callHost(func, args) {
		version++;
		args.push(version);
		host.call(func,args,getWaitFunction());
	}
	
	var comFromHost = {
		actualize: function(_arrayDependentes, _CodiDepActives, _version) {
			if (_arrayDependentes != null) actData.arrayDependentes = _arrayDependentes;
			actData.CodiDepActives = _CodiDepActives;
//			DepActives = [];
//			CodiDepActives.forEach(function(codi) { DepActives.push(my.getByCodi(codi)); });
			actData.version = _version;
			return processActData();
		},
	}
	return comFromHost;
}

}); // add Scripts Dependentes
