H.Teclats = function() {
	var my = {};
	var datosTeclats = [];
	var version = 1;

	var callbackInit;
	function runCallbackInit() {
		if (callbackInit != null) {
			callbackInit();
			callbackInit = null;
		}
	}
	
	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;	
		H.DB.addReloadDBHandler(function() { obtenerDB(); });
		obtenerDB();
	}

	function getAmbient(ambient) {
		for (var i=0, t=null; i<datosTeclats.length; i++) {
			if (datosTeclats[i].ambient == ambient) {t=datosTeclats[i]; break;}
		}
		return t;
	}

	function getOrNewAmbient(ambient) {
		var t =	getAmbient(ambient);
		if (t == null) {
			t = {ambient: ambient, buttons: []};
			datosTeclats.push(t);
		}
		return t;
	}

	function obtenerDB() {
		var db = H.DB.openPrincipal();
		var resTeclats = [];
		
		function copyRows(rows) {
			var res=[];
			for (var i=0; i<rows.length; i++) {
				var row = rows.item(i), obj = {}; // props de rows readonly, rows.item(i) obj es readonly
				for (var prop in row) { obj[prop] = row[prop]; }
				res.push(obj);	
			}
			return res;
		}
		db.transaction(function (tx) {
			var stat = "SELECT [Ambient] as [ambient], [Article] as [codi], [Pos] as [pos], [Color] as [color] "
			          +"FROM [TeclatsTpv] WHERE (([_tipo_sincro] = 'I') OR ([_tipo_sincro] IS NULL))";
			var params = [];
			if (H.GlobalGTPV.get("Llicencia") != null) {
				stat += " AND (([Llicencia] = ?) OR ([Llicencia] IS NULL))";
				params.push(H.GlobalGTPV.get("Llicencia"));
			}
			stat +=" ORDER BY [Data] ASC";
			H.DB.exec(tx, stat, params, function (tx,res) { resTeclats = copyRows(res.rows); },
				function (tx,e) { // editor teclats necesita la tabla creada
					H.DB.exec(tx, "CREATE TABLE IF NOT EXISTS [TeclatsTpv] ("
							     +"    Data text, Llicencia int, Maquina float, Dependenta float, Ambient text," 
							     +"    Article float, Pos float, Color float, _fecha_sincro text, _tipo_sincro text)", [],
								 null, function(tx,e) { return false; });
					return false; 
				}
			);
		}, function(e) { procesarDatos(); }, function() { procesarDatos(); } );

		function procesarDatos() {

			datosTeclats = [];
			for (var i=0; i<resTeclats.length; i++) {
				var but = resTeclats[i];
				if (but.ambient != null) getOrNewAmbient(but.ambient).buttons[but.pos] = but;
			}
			datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));

			version++;
						
			runCallbackInit();
			actualizeSat("All");
		}
	}		
	
	function getComHandler(obj) {
		return function(ret) {
		}
	}
	
	var sats = [];
	var objs = [];
	
	my.createSat = function(sat, callback) {
		var obj = sat.createObj("Teclats", createObjSat, createObjHost, callback, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true  };
		obj.data.comHandler = getComHandler(obj);
		//availableCommHandler(obj);		
	};
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	
	function availableCommHandler(objSat) {
		var act = objSat.data.actualize;
		if (act.All) {
			objSat.call("actualize" ,[datosTeclats, version], objSat.data.comHandler);
			act.All = false;	
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
			renAmbient : function(oldAmbient, newAmbient, codiDep, versionSat) {
				var t =	getAmbient(oldAmbient);
				if (t == null) return;
				t.ambient = newAmbient;
				t.buttons.forEach(function(el) { el.ambient = newAmbient; });
				datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));

				var buttons = [];
				t.buttons.forEach(function(but) { 
					var butT = {};
					["codi", "pos", "color"].forEach(function(p) { butT[p] = but[p]; });
					buttons.push(butT);
				});

				version++;
				actualizeSat("All", (version === versionSat) ? objSat : null);
				H.DB.preOpenPrincipal("TeclatsTpv", function(h) {
					var db = H.DB.open(h.dbName);
					H.DB.transactionWithErr(db, function(tx) {
						H.DB.sincroDelete_UD(h.dbName, tx, h.tableName, 
							{ ambient: oldAmbient }, h.mark);
						buttons.forEach(function(but) { 
							H.DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
								{ ambient: newAmbient, pos: but.pos, llicencia: H.GlobalGTPV.get("Llicencia") },
								{ article: but.codi, color: but.color, Dependenta: codiDep, 
								  Data: H.DB.DateToSql()}, h.mark);
						});
					});
				});
				return version;
			},

			delAmbient : function(ambient, versionSat) {
				var t =	getAmbient(ambient);
				if (t == null) return;
				datosTeclats.splice(datosTeclats.indexOf(t), 1);

				version++;
				actualizeSat("All", (version === versionSat) ? objSat : null);
				H.DB.preOpenPrincipal("TeclatsTpv", function(h) {
					var db = H.DB.open(h.dbName);
					H.DB.transactionWithErr(db, function(tx) {
						H.DB.sincroDelete_UD(h.dbName, tx, h.tableName, 
							{ ambient: ambient, llicencia: H.GlobalGTPV.get("Llicencia") }, h.mark);
					});
				});
				return version;
			},
			
			addArticle : function(but, codiDep, versionSat) {
				var t = getOrNewAmbient(but.ambient);
	//			but.idxArticle = findIdxArticleByCodi(but.codi);
				t.buttons[but.pos] = but;
				datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));

				version++;
				actualizeSat("All", (version === versionSat) ? objSat : null);
				H.DB.preOpenPrincipal("TeclatsTpv", function(h) {
					var db = H.DB.open(h.dbName);
					H.DB.transactionWithErr(db, function(tx) {
						H.DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
							{ ambient: but.ambient, pos: but.pos, llicencia: H.GlobalGTPV.get("Llicencia") },
							{ article: but.codi, color: but.color, Dependenta: codiDep, 
							  Data: H.DB.DateToSql() }, h.mark);
					});
				});
				return version;
			},
			
			delArticle : function(but, versionSat) {
				if ((but.pos == null) || (but.codi == null)) return;
	//			if (!H.DB.inTransaction(true, false)) return;
				var t = getAmbient(but.ambient);
				if (t != null) { delete t.buttons[but.pos]; }

				version++;
				actualizeSat("All", (version === versionSat) ? objSat : null);
				H.DB.preOpenPrincipal("TeclatsTpv", function(h) {
					var db = H.DB.open(h.dbName);
					H.DB.transactionWithErr(db, function(tx) {
						H.DB.sincroDelete_UD(h.dbName, tx, h.tableName, 
							{ ambient: but.ambient, pos: but.pos, llicencia: H.GlobalGTPV.get("Llicencia") }, h.mark);
					});
				});
				return version;
			},
			
			changeArticle : function(but1, but2, codiDep, versionSat) {
				var t1,t2;
	//			if (but1.codi != null) but1.idxArticle = findIdxArticleByCodi(but1.codi);
	//			if (but2.codi != null) but2.idxArticle = findIdxArticleByCodi(but2.codi);
				if (but1.pos != null) { t1 = getAmbient(but1.ambient); }
				if (but2.pos != null) { t2 = getAmbient(but2.ambient); }
				if (t1 != null) { t1.buttons[but1.pos] = $.extend({}, but2, {ambient: but1.ambient, pos: but1.pos}); }
				if (t2 != null) { t2.buttons[but2.pos] = $.extend({}, but1, {ambient: but2.ambient, pos: but2.pos}); }

				version++;
				actualizeSat("All", (version === versionSat) ? objSat : null);
				H.DB.preOpenPrincipal("TeclatsTpv", function(h) {
					var db = H.DB.open(h.dbName);
					H.DB.transactionWithErr(db, function(tx) {
						if (but1.pos != null) {
							H.DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
								{ ambient: but1.ambient, pos: but1.pos, llicencia: H.GlobalGTPV.get("Llicencia") },
								{ article: but2.codi, color: but2.color, Dependenta: codiDep, 
								  Data: H.DB.DateToSql() }, h.mark);
						}
						if (but2.pos != null) {
							H.DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
								{ ambient: but2.ambient, pos: but2.pos, llicencia: H.GlobalGTPV.get("Llicencia") },
								{ article: but1.codi, color: but1.color, Dependenta: codiDep, 
								  Data: H.DB.DateToSql() }, h.mark);
						}
					});
				});
				return version;
			},

			changeColorArticle : function(but, color, codiDep, versionSat) {
				var t = getAmbient(but.ambient);
				if (t == null) return;
	//			if (but.codi != null) but.idxArticle = findIdxArticleByCodi(but.codi);
				but.color = color;
				t.buttons[but.pos] = but;

				version++;
				actualizeSat("All", (version === versionSat) ? objSat : null);
				H.DB.preOpenPrincipal("TeclatsTpv", function(h) {
					var db = H.DB.open(h.dbName);
					H.DB.transactionWithErr(db, function(tx) {
						H.DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
							{ ambient: but.ambient, pos: but.pos, llicencia: H.GlobalGTPV.get("Llicencia") },
							{ color: color, Dependenta: codiDep, 
							  Data: H.DB.DateToSql() }, h.mark);
					});
				});
				return version;
			},

		});
	}
	
	var createObjSat = function(host) {
		return createTeclatsS(host);	
	}
	
	return my;
}();


H.Scripts.add("DatosTeclatsS", "L2", function(window) {

window.createTeclatsS = function(host) {
	window.createTeclatsS  = null; // no double initialize

	var my = {};
	window.Teclats = my;
	
	var datosTeclats = [];
	var changeHandlers = [];

	function runChangeHandlers() {
		setTimeout(function() {
			changeHandlers.forEach(function(h) { h(version); });
		},0);	
	}
	
	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}
	function getSortFunction(propName) {
		return function(a,b) { a=a[propName]; b=b[propName]; return ((a < b) ? -1 : ((a > b)?1:0)); }	
	}
	function getToLowerSortFunction(propName) {
		return function(a,b) { 
			a=a[propName].toLowerCase(); b=b[propName].toLowerCase(); 
			return ((a < b) ? -1 : ((a > b)?1:0)); 
		}	
	}
	my.getAmbient = function(ambient) {
		for (var i=0; i<datosTeclats.length; i++) {
			if (datosTeclats[i].ambient === ambient) {
				return datosTeclats[i];
			}
		}
		return null;
	}
	my.getAmbientByIndex = function(idx) { return datosTeclats[idx]; }
	my.getAmbients = function() { 
		return datosTeclats.map(function(amb) { return amb.ambient; });  
	}
	
	function getOrNewAmbient(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) {
			t = {ambient: ambient, buttons: []};
			datosTeclats.push(t);
		}
		return t;
	}
		
	my.addAmbient = function(ambient, codiDep) {
		var t =	my.getAmbient(ambient);
		if (t != null) return;
		var but = { ambient: ambient, pos: 0, codi: null, color: 0 };
		my.addArticle(but, codiDep);
	}	
	
	my.renAmbient = function(oldAmbient, newAmbient, codiDep) {
		var t =	my.getAmbient(oldAmbient);
		if (t == null) return;
		t.ambient = newAmbient;
		t.buttons.forEach(function(el) { el.ambient = newAmbient; });
		datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
		callHost("renAmbient", [oldAmbient, newAmbient, codiDep]);
	}

	my.delAmbient = function(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) return;
		datosTeclats.splice(datosTeclats.indexOf(t), 1);
		callHost("delAmbient", [ambient]);
	}
	
	my.addArticle = function(but, codiDep) {
		var t = getOrNewAmbient(but.ambient);
		t.buttons[but.pos] = but;
		datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
		callHost("addArticle", [but, codiDep]);
	}
	
	my.getArticle = function(ambient, pos) {
		var t = my.getAmbient(ambient);
		if (t != null) return t.buttons[pos];
		else return null;
	}
	
	my.delArticle = function(but) {
		if ((but.pos == null) || (but.codi == null)) { callback(); return; }
		var t = my.getAmbient(but.ambient);
		if (t != null) { delete t.buttons[but.pos]; }
		callHost("delArticle", [but]);
	}
	
	my.changeArticle = function(but1, but2, codiDep) {
		var t1,t2;
		if (but1.pos != null) { t1 = my.getAmbient(but1.ambient); }
		if (but2.pos != null) { t2 = my.getAmbient(but2.ambient); }
		if (t1 != null) { t1.buttons[but1.pos] = $.extend({}, but2, {ambient: but1.ambient, pos: but1.pos}); }
		if (t2 != null) { t2.buttons[but2.pos] = $.extend({}, but1, {ambient: but2.ambient, pos: but2.pos}); }
		callHost("changeArticle", [but1, but2, codiDep]);
	}

	my.changeColorArticle = function(but, color, codiDep) {
		var t = my.getAmbient(but.ambient);
		if (t == null) return;
		t.buttons[but.pos] = $.extend({}, but, { color: color });
		callHost("changeColorArticle", [but, color, codiDep]);
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
			datosTeclats = actData.datosTeclats;
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
		runChangeHandlers();
		return version;
	}
	
	var comHostToSat = {
		actualize: function(_datosTeclats, _version) {
			actData.datosTeclats = _datosTeclats;
			actData.version = _version;
			return processActData();
		},
	}
	return comHostToSat;
}
}); // add Scripts datosTeclatsS

