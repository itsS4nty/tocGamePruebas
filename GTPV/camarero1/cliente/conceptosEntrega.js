
H.ConceptosEntrega = function() {
	var my = {};

	var conceptosEntrega = { O: [], A: [] };

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
	};

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
	
	my.createSat = function(sat, isAdmin, callback) {
		var obj = sat.createObj("ConceptosEntrega", [createObjSat, isAdmin], [createObjHost, isAdmin], null, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true };
		obj.data.comHandler = getComHandler(obj);
		obj.data.isAdmin = isAdmin;
		obj.data.callbackCreateAct = callback;
	};
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	
	function availableCommHandler(objSat) { // doActualizationSat
		var data = objSat.data;
		if (data.isAdmin && data.actualize.All) {
			objSat.call("actualize", [conceptosEntrega], data.comHandler);
		}	
		data.actualize.All = false;
	}
	
	function actualizeSat(type) {
		objs.forEach(function(obj) { 
			obj.data.actualize[type] = true; 
			obj.readyComm();	
		});
	}
	
	function obtenerDB() {
		var db = H.DB.openPrincipal();
		db.transaction(function (tx) {
			var stat = "SELECT tipo as tipo, texto as texto FROM ConceptosEntrega";
			H.DB.exec(tx, stat, [], function (tx,res) {
				conceptosEntrega = { O: [], A: [] };
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					if (conceptosEntrega[row.tipo] != null) {
						conceptosEntrega[row.tipo].push(row.texto);	
					}
				}
//				if (divES)) redrawES();
			});
		}, function (e) { conceptosEntrega = { O: [], A: [] }; runCallbackInit(); }, 
		   function() { runCallbackInit(); actualizeSat("All"); });
	}

	function createObjHost(objSat, isAdmin) {
		return $.extend(Object.create(null), {
		});
	}

	// ejecutado en satelite
	var createObjSat = function(host, isAdmin) {
		return createConceptosEntrega(host, isAdmin);	
	}
	
	return my;
}();

H.Scripts.add("conceptosEntregaS", "LTC", function() {

window.createConceptosEntrega = function(host, isAdmin) {
	window.createConceptosEntrega = null; // no double initialize
	
	var my = {};
	window.ConceptosEntrega = my;

	var conceptosEntrega = { O: [], A: [] };

	var changeHandlers = [];
	
	function runChangeHandlers() {
		setTimeout(function() {
			changeHandlers.forEach(function(h) { h(); });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}
	
	my.get = function(tipo) {
		return conceptosEntrega[tipo];
	}

	var comFromHost = {
		actualize: function(_conceptosEntrega) {
			conceptosEntrega = _conceptosEntrega;
			runChangeHandlers();
			return true;
		}
	}	
	
	return comFromHost;
}
	
}); // add Scripts conceptosEntregaS
	