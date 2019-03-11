/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="db2.ts" />
/// <reference path="Host_Comm.ts" />
/// <reference path="defDatosApp.ts" />

module H_Dependentes {
	
	var arrayDependentes = [];
	var arrayDepToSat = []; // arrayDependentes sin passw
	var CodiDepActives = [];
//	var DepActives = [];
	var version = 1; // version comunicación con satelites

	var lastDBNameDepAct = null;
	var versionEnDB = 0;
	
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
				if (r.rows.length === 0) callback(false); // ??
				try {
					var codiDepActDB = JSON.parse(r.rows.item(0).CodiDepAct);
					if (codiDepActDB.ver < versionEnDB) throw 1;
				} catch(e) {
					callback(false);
					return;
				}
				versionEnDB = codiDepActDB.ver;
				CodiDepActives = codiDepActDB.codis; 
				callback(true);
			});
		}, function(e) { callback(false); })
	}
	
	function restoreCodiDepActives(callback) {
		lastDBNameDepAct = null;
		var dbNames = H.ConfigGTPV.get("lastDBNameDepAct");
		if (dbNames != null) {
			testDepAct(dbNames[0], function(testOk0) {
				testDepAct(dbNames[1], function(testOk1) {
					if (testOk0) lastDBNameDepAct = dbNames[0];
					else if (testOk1) lastDBNameDepAct = dbNames[1];
					else {
						callback();
						return;	
					}
					H.ConfigGTPV.set("lastDBNameDepAct", [lastDBNameDepAct, null], true, callback);			
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
	// y entrar en la transaccion del mes siguiente antes que el actual por que esta 
	// realizando otra transacción
	var waitFuncs = [];
	function waitSaveDepAct(f) {
		if (waitFuncs.push(f) === 1) f();
	}
	my.unWaitSaveDepAct = function() {
		waitFuncs.shift();
		if (waitFuncs.length === 0) return;
		window.setTimeout(waitFuncs[0], 0);
	}
	
	var savedCodiDepAct = []; // cola para guardar en DB
	
	my.preSave = function(sqlDate, callback) {
		// salvar copia antes de insertar en BD podria modificarse
		savedCodiDepAct.push(CodiDepActives.slice(0)); 
		waitSaveDepAct(function() {
			var nextDBNameDepAct = H.DB.getMensualName(sqlDate);
			if (lastDBNameDepAct != nextDBNameDepAct) {
				H.ConfigGTPV.set("lastDBNameDepAct", [nextDBNameDepAct, lastDBNameDepAct], true, function() {
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
			[JSON.stringify({ ver:++versionEnDB, codis:savedCodiDepAct.shift()})]);
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

	var dependentes:D.dependenta[] = [];
	var passwords:{[codi:number]:string} = Object.create(null);
	var mapCodiToDep:{[codi:number]:D.dependenta} = Object.create(null);
	var depActives:number[] = [];
	
	function setDataFromDB(_dependentes:D.dependenta[], _passwords:{[codi:number]:string}) {
		dependentes = _dependentes;
		passwords = _passwords;
		mapCodiToDep = Object.create(null);
		dependentes.forEach((dep) => mapCodiToDep[dep.codi] = dep);
	}	
	
	function readDB(callback:()=>void) {
		var objectNames = [DB.appObjectNames.dependentes, DB.appObjectNames.dependentesExtes]; //??
		DB.createTransaction(objectNames, false, function(tr) {
			var dependentes:D.dependenta[] = [];
			var passwords:{[codi:number]:string} = Object.create(null);
			
			var fHayResponsable=false;
	
			var nCallbackDep = 0;
			function getCallbackDependentes() {
				nCallbackDep++;
				return () => { nCallbackDep--; if (nCallbackDep == 0) postProcess(); }
			}
			var osDep = tr.objectStore(DB.appObjectNames.dependentes);
			var osExt = tr.objectStore(DB.appObjectNames.dependentesExtes);
	
			var cbDep0 = getCallbackDependentes();
	
			var req = osDep.openCursor();
			req.onsuccess = function(ev) {
				var cursor = <IDBCursorWithValue>req.result;
				if (cursor) {
					var val = <D.dependenta>cursor.value;
					// val.codi = Number(val.codi); no mantendria el orden
					if (val.nom == null) val.nom="sin nombre"; 
					val.compareNom = D.conversionForCompare(val.nom);
					var reqP = osExt.get([val.codi, "PASSWORD"]);
					reqP.onsuccess = function(ev) {
						var passw = reqP.result;
						val.noPassword = ((passw == null) || (passw === ""));	
						passwords[val.codi] = passw;
					}
					var cbDep = getCallbackDependentes();
					var reqT = osExt.get([val.codi, "TIPUSTREBALLADOR"]);
					reqT.onsuccess = function(ev) {
						var tipusTreballador = reqT.result;
						val.esResponsable =  (tipusTreballador === "RESPONSABLE");
						if (val.esResponsable) fHayResponsable = true;
						cbDep(); 
					}
				} else {
					cbDep0();
				}
			}
			
			function postProcess() {
				if (fHayResponsable) dependentes.forEach((d) => d.esResponsable=true);
				setDataFromDB(dependentes, passwords);
				actualizeSat("All");
				callback();
			}
		});	
	}
	
/*
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
*/	
	function respRObjHandler(ret:any) {
	}

	interface actualizeTypes {
		All?: boolean;
		Actives?: boolean;
	}
	var sats = <Host_Comm.IAppSat[]>[];
	var rObjs = <Host_Comm.IAppRObj[]>[];
	
	export function createSat(sat:Host_Comm.IAppSat, callback:()=>void) {
		var rObj = sat.createRObj("Dependentes", "return createArticles(host);", createStubHost, callback);
		rObj.commToSatAvailable = commToSatAvailable;
		sats.push(sat);
		rObjs.push(rObj);
		rObj.appData.actualize = <actualizeTypes>{ All : true };
		//obj.data.comHandler = getComHandler(obj);
		//obj.data.callbackCreateAct = callback;
	}
	
	export function destroySat(sat:Host_Comm.IAppSat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			rObjs.splice(idx, 1)[0].appData = null; // referencia ciclica
		}
	}
	
	function commToSatAvailable(rObj: Host_Comm.IAppRObj) {
		var act = <actualizeTypes>rObj.appData.actualize;
		if (act.All || act.Actives) { 
			rObj.call("actualize", 
				[act.All ? arrayDepToSat : null, CodiDepActives, version], 
				respRObjHandler);
			act.All = act.Actives = false;
		} 
	}
	
	function actualizeSat(type: string, rObjNoAct?: Host_Comm.IAppRObj) {
		rObjs.forEach(function(rObj) {
			if (rObjNoAct === rObj) return;
			rObj.appData.actualize[type] = true;
			rObj.sat.forceCommToSat();
		});
	}

	function createStubHost(idRObj: string) {
		return $.extend(Object.create(null), {
			entrarActiva : function(codi:number, password:string) { 
				var dep = mapCodiToDep[codi];
				if (dep == null) {
					return null; // ????
				}
				if (depActives.indexOf(codi) !== -1)
					return true;
				if ((passwords[codi] != null) && (passwords[codi] != password))
					return false;
				for (var i=0; i<depActives.length; i++) { 
					var depI = mapCodiToDep[depActives[i]];
					if (depI.compareNom > dep.compareNom) break;
				}	
				depActives.splice(i,0,codi);
				version++;
				actualizeSat("Actives", null);
				DB.createTransaction([DB.appObjectNames.horaris], true, function(tr) {
					
				});
				var sqlDate = H.DB.DateToSql(new Date());
				my.preSave(sqlDate, function() {
					H.DB.preOpenMensual(sqlDate, "V_Horaris_", function(h) {
						var db = H.DB.open(h.dbName);
						H.DB.transactionWithErr(db, function (tx) {
							H.DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
															+"[Dependenta] float, [Operacio] nvarchar(25), ");
							H.DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
															 [H.ConfigGTPV.get("Llicencia"), sqlDate, codi, "E"],
															 h.mark);
							my.save(tx);
						});	
					});	
				});
				return true;
			},
			delActiva : function(codi, versionSat) { 
				for (var i=0; i<CodiDepActives.length; i++) {
					if (CodiDepActives[i] === codi) {
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
																	  [H.ConfigGTPV.get("Llicencia"), sqlDate, codi, "P"],
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
	
}