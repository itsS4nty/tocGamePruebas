(function () {

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
		window.setTimeout(function() {
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
			if (actData.arrayDependentes) {
				arrayDependentes = actData.arrayDependentes;
				arrayDependentes.forEach(function(dep) {
					dep.compareNom = conversionForCompare(dep.nom);
				});
			}	
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
		}
	}
	return comFromHost;
}

})(window);
