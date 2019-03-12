H.DosNivells = function() {
	var my = {};
	var datosDosNivells = [];
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

	function obtenerDB() {
		var db = H.DB.openPrincipal();
		var resDosNivellsValid = [], resTags = [], resTextes = [];

		function copyRows(rows) {
			var res=[];
			for (var i=0; i<rows.length; i++) {
				// props de rows readonly, rows.item(i) obj es readonly
				res.push($.extend({}, rows.item(i)));	
			}
			return res;
		}
		
		db.transaction(function (tx) {
			var query;
			query = "select Valor as valor from ParamsTpv where Variable='DosNivells'";
			H.DB.exec(tx, query, [], function (tx,res) { resDosNivellsValid = copyRows(res.rows); },
				function (tx,e) { return false; });
			query = "select Variable as variable, Valor as valor from ParamsTpv where Variable like 'DosNivells%Tag' ";
			H.DB.exec(tx, query, [], function (tx,res) { resTags = copyRows(res.rows); },
				function (tx,e) { return false; });
			query = "select Variable as variable, Valor as valor from ParamsTpv where Variable like 'DosNivells%Texte' ";
			H.DB.exec(tx, query, [], function (tx,res) { resTextes = copyRows(res.rows); },
				function (tx,e) { return false; });
		}, function(e) { procesarDatos(); }, function() { procesarDatos(); } );

		function procesarDatos() {
			datosDosNivells = [];
			if ((resDosNivellsValid.length > 0) && 
			    (typeof resDosNivellsValid[0].valor == 'string') &&
                (resDosNivellsValid[0].valor.toLowerCase() == 'si')) {
				var contents={}, keys=[];
				resTags.forEach(function(el) {
					var variable = el.variable;
					if (typeof variable != 'string') return;
					var m = variable.toLowerCase().match(/dosnivells_([0-9]+)_tag/);
					if (m == null) return;
					var idx = parseInt(m[1]);
					if (isNaN(idx)) return;
					if (typeof el.valor != 'string') return;
					contents[idx] = {tag: el.valor};
					keys.push(idx);
				});   
				resTextes.forEach(function(el) {
					var variable = el.variable;
					if (typeof variable != 'string') return;
					var m = variable.toLowerCase().match(/dosnivells_([0-9]+)_texte/);
					if (m == null) return;
					var idx = parseInt(m[1]);
					if (isNaN(idx)) return;
					if (contents[idx] == null) return;
					if ((typeof el.valor != 'string') || (el.valor == "")) {
						delete contents[idx];
						return;
					}
					contents[idx].texte = el.valor;
				});   
				keys.sort();
				keys.forEach(function(k) { 
					if (contents[k] != null) datosDosNivells.push(contents[k]); 
				});
			}	  
			version++;
			
			if (H.DebugDatos) {
				H.DebugDatos.datosDosNivells = datosDosNivells;
			}
						
			runCallbackInit();
			actualizeSat("All");
		}
	}		
	
	function getComHandler(obj) {
		return function(ret) {
			if (obj.data.callbackCreateAct) {
				var f = obj.data.callbackCreateAct;
				obj.data.callbackCreateAct = null;
				f();
			}
		}
	}
	
	var sats = [];
	var objs = [];
	
	my.createSat = function(sat, callback) {
		var obj = sat.createObj("DosNivells", createObjSat, createObjHost, null, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true  };
		obj.data.comHandler = getComHandler(obj);
		obj.data.callbackCreateAct = callback;
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
			objSat.call("actualize", [datosDosNivells, version], 
				objSat.data.comHandler);
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
		});
	}
	
	var createObjSat = function(host) {
		return createDatosDosNivellsS(host);	
	}
	
	return my;
}();


H.Scripts.add("DatosDosNivellsS", "LTC", function() {

window.createDatosDosNivellsS = function(host) {
	window.createDatosDosNivellsS  = null; // no double initialize

	var my = {};
	window.DosNivells = my;
	
	var datosDosNivells = [];
	var changeHandlers = [];

	my.getRef = function() { return datosDosNivells; } // ????

	function runChangeHandlers() {
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(version); });
		},0);	
	}
	
//		my.reload = function() { obtenerDB(); }
	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
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
			datosDosNivells = actData.datosDosNivells;
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
		actualize: function(_datosDosNivells, _version) {
			actData.datosDosNivells = _datosDosNivells;
			actData.version = _version;
			return processActData();
		}
	}
	return comHostToSat;
}
}); // add Scripts datosDosNivellsS

H