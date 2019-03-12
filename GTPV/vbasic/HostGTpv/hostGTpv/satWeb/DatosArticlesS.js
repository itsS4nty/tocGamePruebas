(function () {

window.createDatosArticlesS = function(host) {
	window.createDatosArticlesS  = null; // no double initialize

	var my = {};
	window.Articles = my;
	
	var datosArticles = [], datosFamilies = { idxN0: null, maxN :0, families: [] }, datosCodisBarres = [];
	var changeHandlers = [];

	my.getRefDatos = function() { return datosArticles; } // ????

	function runChangeHandlers() {
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(version); });
		},0);	
	}
	
//		my.reload = function() { obtenerDB(); }
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

	var codiToArticle = {};
	
	function createCodiToArticle() {
		codiToArticle = {};
		datosArticles.forEach(function(art) { codiToArticle[art.codi] = art; });
	}
	
	my.getByCodi = function(codi) { return codiToArticle[codi]; } 
		
	my.getArticleByIdx = function(idx) { return datosArticles[idx]; }
//		my.getIdxByArticle = function(art) { return datosArticles.indexOf(art); }
	my.getArticles	= function() { return datosArticles; }
	
	my.getFamiliaByIdx = function(idx) {
//		if (idx == null) idx = idxNivell0;
		return datosFamilies.families[idx];
	}
	my.getFamilies = function() { return datosFamilies.families; }
	
	my.getIdxNivell0 = function() { return datosFamiles.idxN0; }
	my.getNumNivellsFamilies = function() { return datosFamilies.maxN; }
	
	my.findCodiBarres = function(codi) {
		var inf = 0, sup = datosCodisBarres.length-1;
		while (inf <= sup) { 
			var mid = Math.floor((inf+sup)/2),
				midC = datosCodisBarres[mid];
			if (codi == midC.codi) return midC;
			if (codi < midC.codi) sup = mid-1;
			else inf = mid+1;
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
			datosArticles = actData.datosArticles;
			datosArticles.forEach(function(art) {
				art.compareNom = conversionForCompare(art.nom);
			});
			createCodiToArticle();
			datosFamilies = actData.datosFamilies;
			datosCodisBarres = actData.datosCodisBarres;
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
		actualize: function(_datosArticles, _datosFamilies, _datosCodisBarres, _version) {
			actData.datosArticles = _datosArticles;
			actData.datosFamilies = _datosFamilies;
			actData.datosCodisBarres = _datosCodisBarres;
			actData.version = _version;
			return processActData();
		}
	}
	return comHostToSat;
}
})(window);
