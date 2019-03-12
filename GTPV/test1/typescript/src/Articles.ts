/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="Sat_Comm.ts" />
/// <reference path="defDatosApp.ts" />

module Articles {


	my.getRefDatos = function() { return datosArticles; } // ????

	var changeHandlers:(()=>void)[] = [];
	function runChangeHandlers() {
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(); });
		},0);	
	}
	
	export function addChangeHandler(changeHandler:()=>void) {
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

	var mapCodiToArticle:{[codi:number]:D.article} = {};
	
	function createMapCodiToArticle() {
		mapCodiToArticle = Object.create(null);
		articles.forEach(function(art) { mapCodiToArticle[art.codi] = art; });
	}
	
	export function getByCodi(codi:number) { return mapCodiToArticle[codi]; } 
		
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

	var articles:D.article[] = [];
	var families:D.familia[] = [];
	var codisBarres:D.codiBarres[] = [];
	var host:Sat_Comm.IAppRObj;
	
	export function createStubSat(_host:Sat_Comm.IAppRObj) {
		host = _host;
		return {
			actualize: function(_articles, _families, _codisBarres) {
				articles = _articles;
				families = _families;
				codisBarres = _codisBarres;
				createMapCodiToArticle();
				runChangeHandlers();
			}
		}
	}
}