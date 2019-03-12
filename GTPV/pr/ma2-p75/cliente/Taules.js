var TaulesH = function() {
	var my = {};
	
	var arrayTaulesValides = [];

	var changeHandlers = [];

	function runChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var callbackInit;
	function runCallbackInit() {
		if (callbackInit != null) {
			callbackInit();
			callbackInit = null;
		}
	}
	
	var restored= false;
	function restoreTaules() {
		if (restored) return;
		arrayTaulesValides = [];
		var d = LS.get("TaulesValides");
		if (d != null) {
			arrayTaulesValides = d;
		}
		restored = true;
	}
	function save() {
		LS.save("TaulesValides", arrayTaulesValides);
	}
	
	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;	
		restoreTaules();
	}

	my.addChangeHandler = function(changeH) {
		changeHandlers.push(changeHandler);
	}
	
	my.getByNom = function(nom) {
		for (var i=0; i<arrayTaulesValides.length; i++) {
			var taula = arrayTaulesValides[i]; 
			if (taula.nom === nom) return taula;
		}
		return null;
	}

	var satellites = [];
	function findSat(idSat) {
		for (var i=0; i<satellites.length; i++) 
			if (satellites[i].id === idSat) return satellites[i];
		return null;	
	}

	function getComHandler(sat) {
		return function(ret) {
			sat.waitResponse = false;
			if (!sat.isLocal) doActualizationSat(sat);
		}
	}
	
	my.createSat = function(idSat) {
		var sat = findSat(idSat);
		if (sat != null) satellites.splice(satellites.indexOf(sat), 1);
		var newSat = {id: idSat, actualize: { All : true } , waitResponse: false};
		newSat.comHandler = getComHandler(newSat);
		satellites.push(newSat);
		CH.createObject("Taules", idSat, objSat, objLocal);
		doActualizationSat(newSat);		
	};
	
	function doActualizationSat(sat) {
		if (!sat.waitResponse) {
			if (sat.actualize.All) { 
				sat.waitResponse = true;	
				CH.callFunction("Taules", idSat, "actualize", [arrayTaulesValides], sat.comHandler);
				sat.actualize.All = false;
			} 
		}		
	}
	
	function actualizeSat(type) {
		if (type == null) type = "All";
		satellites.forEach(function(sat) {
			sat.actualize[type] = true;
			doActualizationSat(sat);
		});
	}

	var objLocal = {
		activate : function(infoSat, nom, set) {
			var taula = my.getByNom(nom);
			if (taula != null) taula.activa = set;
			save();
			runChangeHandlers();
			actualizeSat();
			return true;
		},
	}

	var objSat = function(host) {
		var myS = {};
		window.Taules = myS;
		
		var arrayTaulesValides;
		var arrayTaulesActives;

		var changeHandlers = [];
		
		function runChangeHandlers() {
			var args = arguments;
			changeHandlers.foreach(function(f) { f.apply(null, args); });
		}
	
		myS.addChangeHandler = function(changeHandler) {
			changeHandlers.push(changeHandler);
		}
	
		myS.activate = function(taula, set) { 
			taula.activa = set;
			host.call("activate", [taula.nom, set]);
			runChangeHandlers();
		}

		myS.getByIdx = function(idx) { return arrayTaulesValides[idx]; } 
		
		myS.getByNom = function(nom) {
			for (var i=0; i<arrayTaulesValides.length; i++) {
				var taula = arrayTaulesValides[i]; 
				if (taula.nom === nom) return taula;
			}
			return null;
		}

		myS.getActivaByIdx = function(idx) { return arrayTaulesActives[idx]; }
		
		var comSat = {
			actualize: function(_arrayTaulesValides) {
				arrayTaulesValides = _arrayTaulesValides;
				arrayTaulesActives = [];
				arrayTaulesValides.forEach(function(t) {
					if (t.activa) arrayTaulesActives.push(t);
				});
				runChangeHandlers();
				return true;
			},
		}
		return comSat;
	}
	
	return my;
}();

