H.Articles = function() {
	var my = {};
	var datosArticles = [], datosFamilies = { idxN0: null, maxN :0, families: [] }, datosCodisBarres = [];
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
		var resArticles = [], resFamilies = [], resCodisBarres = [];
		
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
			var stat = "SELECT [Codi] as [codi], [NOM] as [nom], [PREU] as [preu], [EsSumable] as [esSumable], [Familia] as [familia] "
			          +"FROM [Articles] ";
			H.DB.exec(tx, stat, [], function (tx,res) { resArticles = copyRows(res.rows); },
				function (tx,e) { return false; });
			var stat = "SELECT [Nom] as [nom], [Pare] as [pare], [Nivell] as [nivell] FROM [Families] ";
			H.DB.exec(tx, stat, [], function (tx,res) { resFamilies = copyRows(res.rows); },
				function (tx,e) { return false; });
			var stat = "SELECT [Codi] as [codi], [Producte] as [codiArt] FROM [CodisBarres]";
			H.DB.exec(tx, stat, [], function (tx,res) { resCodisBarres = copyRows(res.rows); },
				function (tx,e) { return false; });
		}, function(e) { procesarDatos(); }, function() { procesarDatos(); } );

		function procesarDatos() {

			for (var i=0; i<resArticles.length; ) {
				var el = resArticles[i];
				if (el.codi == null) {
					resArticles.splice(i, 1);
				} else {
					el.codi = Number(el.codi);
					if (el.nom == null) el.nom=""; 
					el.esSumable = (el.esSumable != 0); 
					el.compareNom = conversionForCompare(el.nom);
					i++;
				}
			}
//			resArticles = resArticles.sort(getSortFunction("codi"));

/*			function findArticleByCodi(codi) {
				var inf = 0, sup = resArticles.length-1;
				while (inf <= sup) { 
					var mid = Math.floor((inf+sup)/2),
						midArt = resArticles[mid];
					if (codi == midArt.codi) return midArt;
					if (codi < midArt.codi) sup = mid-1;
					else inf = mid+1;
				}
				return null;
			}
*/
/*			function findIdxArticleByCodi(codi) {
				var inf = 0, sup = resArticles.length-1;
				while (inf <= sup) { 
					var mid = Math.floor((inf+sup)/2),
						midArt = resArticles[mid];
					if (codi == midArt.codi) return mid;
					if (codi < midArt.codi) sup = mid-1;
					else inf = mid+1;
				}
				return null;
			}
*/			

			datosCodisBarres = [];
			for (var i=0; i<resCodisBarres.length; i++) {
				var cb = resCodisBarres[i];
				if ((cb.codi != null) && (cb.codi != "") && (cb.codiArt != null)) {
					cb.codiArt = Number(cb.codiArt);
//					cb.idxArticle = findIdxArticleByCodi(cb.codiArt);
					/*if (cb.idxArticle != null)*/ datosCodisBarres.push(cb);
				}
			}
			datosCodisBarres = datosCodisBarres.sort(getSortFunction("codi"));
			
//			for (var i=0; i<resArticles.length; i++) { resArticles[i].idxOld = i; }
			resArticles = resArticles.sort(getToLowerSortFunction("nom"));
/*			var translateIdx = new Array(resArticles.length);
			for (var i=0; i<resArticles.length; i++) { translateIdx[resArticles[i].idxOld] = i; delete resArticles[i].idxOld; }
//			datosTeclats.forEach(function(ambient) {
				for (var i=0; i<ambients.buttons.length; i++) ambients.buttons[i].idxArticle = translateIdx[ambients.buttons[i].idxArticle];  
			});
			datosCodisBarres.forEach(function(cb) { cb.idxArticle = translateIdx[cb.idxArticle]; });
*/			
			resFamilies = resFamilies.sort(getSortFunction("nom"));
			
			var nivellsSinNombre = [],
			    idxNivellSinNombre = resFamilies.length-1,
			    idxMaxNivellSinNombre = idxNivellSinNombre;
			
			datosFamilies.idxN0 = null;
			for (var i=0; i<resFamilies.length; i++) {
				var nivell = resFamilies[i].nivell; 
				if (nivell == 0) { datosFamilies.idxN0 = i; }
				resFamilies[i].subF = [];
				resFamilies[i].art = [];
			}
			if (datosFamilies.idxN0 == null) {
				datosFamilies.idxN0 = resFamilies.length;
				resFamilies.push({ nom: "", nivell: 0, subF:[], art: [] });
			}


			var lenFamilies = resFamilies.length;
			var lastNivellSinNombre = 0, idxLastNivellSinNombre = datosFamilies.idxN0;
			function getNivellSinNombre(nivell) {
				while (lastNivellSinNombre < nivell) {
					resFamilies[idxLastNivellSinNombre].subF.push(resFamilies.length);
					resFamilies.push({ nom: "Sin nombre", nivell: lastNivellSinNombre+1, 
					                   idxPare: idxLastNivellSinNombre, subF: [], art: [] });
					lastNivellSinNombre++;
					idxLastNivellSinNombre = resFamilies.length-1;
				}
				return ((idxLastNivellSinNombre-lastNivellSinNombre)+nivell);
			}
			function findPare(familia) {
				if (familia.nivell == 1) return datosFamilies.idxN0;
				for (var i=0; i<lenFamilies; i++) {
					if ((familia.pare == resFamilies[i].nom) && (familia.nivell-1 == resFamilies[i].nivell))
						return i;
				}
				return null;
			}
			for (var i=0; i<lenFamilies; i++) {
				var familia = resFamilies[i], nivell = familia.nivell;
				familia.nom = (familia.nom || "");
				if (nivell > 0) {
					var idxPare = findPare(familia);
					if (idxPare == null) { idxPare = getNivellSinNombre(nivell); } 
					resFamilies[idxPare].subF.push(i);
					familia.idxPare = idxPare;
				}
			}
			
			function findFamilia(nom) {
				if (nom == null) return null;
				for (var i=0; i<resFamilies.length; i++) {
					if ((resFamilies[i].nom == nom) && (resFamilies[i].nivell > 0))
						return i;
				}
				return null;
			}
			for (var i=0; i<resArticles.length; i++) {
				var article = resArticles[i];
				article.nom = (article.nom || "");
				var idxFamilia = findFamilia(article.familia);
				if (idxFamilia == null) { idxFamilia = getNivellSinNombre(1); }
				article.idxFamilia = idxFamilia;
				resFamilies[idxFamilia].art.push(i);
			}
//			if ((maxNivell == 0) && (resArticles.length > 0)) maxNivell = 1;
			

/*			function fSortSubF(a,b) {
				a=resFamilies[a].nom; b=resFamilies[b].nom; return ((a < b) ? -1 : ((a > b)?1:0)); 	
			}
			function fSortArt(a,b) {
				a=resArticles[a].nom; b=resArticles[b].nom; return ((a < b) ? -1 : ((a > b)?1:0)); 	
			}
			for (var i=0; i<resFamilies.length; i++) {  // ordenar
				var familia = resFamilies[i];
				familia.subF = familia.subF.sort(fSortSubF);
				familia.art = familia.art.sort(fSortArt);
			}
*/			for (var i=resFamilies.length-1; i>=lenFamilies; i--) { // sin nombre al final
				var subF = resFamilies[resFamilies[i].idxPare].subF;
				subF.splice(subF.indexOf(i),1); subF.push(i);
			}
			
			// eliminar familias sin elementos
			function deleteFamilia(i) {
				var fam = resFamilies[i];
				var idxPare = fam.idxPare;
				if (idxPare != null) {
					var pare = resFamilies[idxPare];
					pare.subF.splice(pare.subF.indexOf(i), 1);
					fam.idxPare = null;
					deleteIfNeeded(idxPare);
				}
			}
			function deleteIfNeeded(i) {
				var fam = resFamilies[i];
				if ((fam.subF.length == 0) && (fam.art.length == 0)) deleteFamilia(i);
			}
			for (var i=0; i<resFamilies.length; i++) {
				deleteIfNeeded(i);
			}

			datosFamilies.maxN = 0;

			for (var i=0; i<resFamilies.length; i++) {
				var fam = resFamilies[i];
				if ((fam.subF.length == 0) && (fam.art.length == 0)){
					if (datosFamilies.maxN < fam.nivell) datosFamilies.maxN = fam.nivell;
				}
			}
			
			datosArticles = resArticles;
			datosFamilies.families = resFamilies;
			version++;
						
//			callbackChangeHandlers();
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
		var obj = sat.createObj("Articles", createObjSat, createObjHost, null, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true  };
		obj.data.comHandler = getComHandler(obj);
		obj.data.callbackCreateAct = callback;
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
			objSat.call("actualize", [datosArticles, datosFamilies, datosCodisBarres, version], 
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
		return createDatosArticlesS(host);	
	}
	
	return my;
}();


H.Scripts.add("DatosArticlesS", "L2C", function() {

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
}); // add Scripts datosArticlesS

H.Scripts.add("CodisBarresS", "L2", function() {

window.CodisBarres = function(){
	var my = {};
	
	var registeredHandler = null;
	var buffer = "";
	
	function handler(e) {
		if (!window.Articles) return;
		if (buffer.length > 100) buffer = "";
		if ((e.which >= "0".charCodeAt(0)) && (e.which <= "9".charCodeAt(0))) {
			buffer+=String.fromCharCode(e.which);
		} else {
			if (buffer.length > 0) {
				var cb = Articles.findCodiBarres(buffer);
				if (registeredHandler != null) registeredHandler(cb);
				buffer = "";
			}
		}
	}
	
	my.init = function() {
		$(window).keypress(handler);	
	}
	my.register = function(_rh) {
		registeredHandler = _rh;
		buffer = ""; 	
	}
	return my;
}();

CodisBarres.init();

}); // add Scripts CodisBarresS

