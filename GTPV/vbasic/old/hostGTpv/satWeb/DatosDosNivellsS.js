(function () {

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
})(window);
