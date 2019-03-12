H.Mesas = function() {
	var my = {};
	
	var arrayComedores = [];
	var version = 1; // version comunicación con satelites

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
	
	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;	
		H.DB.addReloadDBHandler(function() { obtenerDB(); });
		obtenerDB();
	}

	function obtenerDB() {
		arrayComedores = [];
		var ms = [];
		for (var i=1; i<20; i++) {
			ms.push({ name: ("0"+i).slice(-2) });
		}
		arrayComedores.push({name: "Comedor A", mesas:ms});
		var ms = [];
		for (var i=21; i<30; i++) {
			ms.push({ name: ("0"+i).slice(-2) });
		}
		arrayComedores.push({name: "Comedor B", mesas:ms});

		if (H.DebugDatos) {
			H.DebugDatos.arrayComedores = arrayComedores;
		}

		actualizeSat("All");
		runCallbackInit();
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
		var obj = sat.createObj("Mesas", createObjSat, createObjHost, null, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true };
		obj.data.comHandler = getComHandler(obj);
		obj.data.callbackCreateAct = callback;
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
		if (act.All) { 
			objSat.call("actualize", [arrayComedores, version], objSat.data.comHandler);
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
	
	// ejecutado en satelite
	var createObjSat = function (host) {
		return createMesasS(host);	
	}
	
	return my;
}();

H.Scripts.add("MesasS", "LTC", function() {

window.createMesasS = function(host) {
	window.createMesasS = null; // no double initialize
	
	var my = {};
	window.Mesas = my;
	
	var arrayComedores;
	
	var changeHandlers = [];
	
	function runChangeHandlers() {
//		var args = arguments;
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(); /*f.apply(null, args);*/ });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}

	my.get = function() {
		return $.extend(true, [], arrayComedores);
	}
	
	my.getRef = function() {
		return arrayComedores;
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
			arrayComedores = actData.arrayComedores;
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
		actualize: function(_arrayComedores, _version) {
			actData.arrayComedores = _arrayComedores;
			actData.version = _version;
			return processActData();
		}
	}
	return comFromHost;
}

window.StateMesas = (function() {
	var my = {};
	var comedores;
	var infoCs = {};
	var namesAllMs = [];
	var changeHandlers = [];

	function runChangeHandlers(mesa) {
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(mesa); });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}
	function changeMesas(fInitialize) {
		namesAllMs = [];
		savedGetOpens=null;
		comedores = Mesas.get();
		comedores.forEach(function(c) {
			c.mesas.forEach(function(m) {
				var idC = Comandes.getId('M', m.name);
				if (!infoCs.hasOwnProperty(idC)) {
					var C = Comandes.get(idC, changeComanda);
					infoCs[idC] = { C: C, name:m.name };
				}
				var C = infoCs[idC].C; 
				$.extend(infoCs[idC], {states : C.getStates(), isOpen : C.isOpen()});
				namesAllMs.push(m.name);
			});
		});
		if (!fInitialize) runChangeHandlers();
	}
	function changeComanda(C) {
		var c = infoCs[C.getId()];
		var newStates = C.getStates();
		var keys = Object.keys(c.states).concat(Object.keys(newStates));
		if (keys.every(function(k) { return c.states[k] === newStates; })) {
			return;	
		}
		c.states = newStates;
		c.isOpen = C.isOpen();
		savedGetOpens=null;
		runChangeHandlers(c.name);
	}
	
	var fInit = false;
	my.init = function(callback) {
		if (!fInit) {
			fInit = true;
			Mesas.addChangeHandler(changeMesas);
			changeMesas(true);
		}
	}
	
	my.getState = function(mesaName) {
		var idC = Comandes.getId('M', mesaName);
		if (infoCs.hasOwnProperty(idC)) 
			return $.extend(true, {}, infoCs[idC].states);
		return null;	
	}
	my.isOpen = function(mesaName) {
		var idC = Comandes.getId('M', mesaName);
		if (infoCs.hasOwnProperty(idC)) 
			return infoCs[idC].isOpen;
		return null;	
	}
	
	var savedGetOpens;
	my.getOpens = function() {
		if (savedGetOpens) return savedGetOpens;
		
		var names = [];
		
		comedores.forEach(function(c) {
			c.mesas.forEach(function(m) {
				if (names.indexOf(m.name) != -1) return;
				var idC = Comandes.getId('M', m.name);
				if (infoCs.hasOwnProperty(idC) && infoCs[idC].isOpen)
					names.push(m.name);
			});
		});
		names.sort();
		savedGetOpens = names;
		return names;
	}
	
	my.getNames = function() {
		return namesAllMs;
	}
	
	/*
	my.getFilterStates = function(filter) {
	}
	*/
	
	return my;
})();

}); // add Scripts Mesas
