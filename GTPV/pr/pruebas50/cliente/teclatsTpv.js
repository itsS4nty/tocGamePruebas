function newDivTeclatsTpv() {
	var my = {};

//	var nX=6, nY=6;
	var D = {};

	// div Ambients Teclats
	var divAT = $("<div>").css({position: "absolute", left: "0px", top: "0px", width: "100%"});
	my.getDiv = function() { return divAT; }

	function changeDatosHandler() { if (divAT.offsetWidth > 0) my.redraw();	}
	my.init = function() { DatosTeclatsTpv.init(changeDatosHandler); }


	my.redraw = function(_datos) {
		D = _datos;
		
		ambientsScroll.removeAll();

		var posAct = -1, t;
		for (var i=0; (t=DatosTeclatsTpv.getAmbientByIndex(i)) != null; i++) {
			if (t.ambient == D.ambientActual) posAct=i;
			AmbientModel.clone(true).text(t.ambient)
			                        .data("ambient", t.ambient) 						
                                    .addClass("ui-state-default")
									.appendTo(ambientsScroll.newElement().css({ verticalAlign: "middle" }));
		}
		if (posAct == -1) {  // ambientActual ha desaparecido
			t = DatosTeclatsTpv.getAmbientByIndex(0);
			if (t != null) {
				posAct = 0;
				D.ambientActual = t.ambient; 	// cojer primer ambient
			} else D.ambientActual = null;   // no hay ambients
		} // no else!
/*		if (posAct != -1) {
			ambientsScroll.get(posAct).children().addClass("ui-state-active");	
			ambientsScroll.scrollTo(posAct, true)
		}
*/
		ambientsScroll.redraw();
		setAmbientActual(D.ambientActual);
		
//		redrawDivTBEP();
	}
//		setButtonsTeclatsTpv(ambientActual);

	var Config = {
		hAmbients : 0.15,
		hTeclado : 0.6,
		nButX : 6,
		nButY : 6,
	}

	my.resize = function() {
		var wDC = divAT.parent().width(), hDC = divAT.parent().height();

		ambientsScroll.getDiv().height(Math.round(Config.hAmbients*hDC));
		ambientsScroll.redraw();

		divTBEP.height(Math.round(Config.hTeclado*hDC));
		my.resizeDivTBEP();
		divAT.height(ambientsScroll.getDiv().height()+divTBEP.height());
	}

	var ambientsScroll = new myScroll("_lr", nX);
	ambientsScroll.getDiv().appendTo(divAT);
	
	function setAmbientActual(newAmbient) {
		var el;
//		if (ambientActual != null) {
			for (var i=0; (el = ambientsScroll.get(i)) != null; i++) {
				el = el.children();
				if (D.ambientActual == el.data("ambient")) {
					el.removeClass("ui-state-active");
				}
				if (newAmbient == el.data("ambient")) {
					el.addClass("ui-state-active");
					ambientsScroll.scrollTo(i, true);
				}
			}
//		}
		D.ambientActual = newAmbient;
		D.estado = "teclat";
		redrawDivTBEP();
//		setButtonsTeclatsTpv(D.ambientActual);
	}
	//my.getAmbientActual = function() { return ambientActual; }

	my.changeAmbientHandler = null;
	
	function clickButtonAmbient(e) {
		var ambient = $(this).data("ambient");
		if (typeof my.changeAmbientHandler == "function") my.changeAmbientHandler(ambient);
		setAmbientActual(ambient);
	}
    
	var AmbientModel = $("<button>").css({boxSizing: "border-box", width: "100%", height: "100%", margin: "0px"})
						            /*.addClass("ui-corner-all")*/
						            .mousedown(clickButtonAmbient);
	
	// div Teclats Buscar Entrar 
	var divTBE = $("<div>").appendTo(divAT);

	function redrawDivTBE() {
		divTBE.children().hide();
		switch (D.estado) {
			case "buscar" :
				divBuscar.show();
				break;
			case "entrar" :
				divEntrar.show();
				break;
			case "teclat" :
			default:	
				divTeclat.show();
				setButtonsTeclatsTpv(D.ambientActual);
		}
//		actualizarAmbients();
	}
	
	function resizeDivTBE() {
		function posAbsolute(div, x0, y0, x1, y1) {
			x0 = Math.round(x0); y0 = Math.round(y0);
			x1 = Math.round(x1); y1 = Math.round(y1);
			div.css({position: "absolute", left: x0+"px", top: y0+"px", width: (x1-x0)+"px", height: (y1-y0)+"px"}); 	
		}

		switch (D.estado) {
			case "buscar" :
				break;
			case "entrar" :
				break;
			case "teclat" :
			default :
				var w1=divTeclat.width(), h1=divTeclat.height();
				var nX = Config.nButX, nY = Config.nButY;
				for (var x=0; x<nX; x++) {
					for (var y=0; y<nY; y++) {
						posAbsolute(buttonsTeclat[x*nY+y], (x/nX)*w1, (y/nY)*h1, ((x+1)/nX)*w1, ((y+1)/nY)*h1);
					}
				}
		}
	}
	
	// Teclats Productes
	
	var divTeclat = $("<div>").addClass("ui-widget-content").css({position: "relative", height: "100%"})
	                          .appendTo(divTBE);

	my.selectedArticleHandler = null;
	
	function clickButtonTeclatTpv(e) {
		var data = $(this).data("data");
		if (typeof my.selectedArticleHandler == "function") my.selectedArticleHandler(data);
	}

	var buttonModel = $("<button>").css({boxSizing: "border-box", margin: "0px", 
								         color: "black", verticalAlign: "middle"})
						           /*.addClass("ui-corner-all")*/
						           .click(clickButtonTeclatTpv);
	var buttonsTeclat = [];
	var nX = Config.nButX, nY = Config.nButY;
	for (var x=0; x<nX; x++) {
		for (var y=0; y<nY; y++) {
			buttonsTeclats[x*nY+y] = buttonModel.clone(true).data("pos", x*nY+y).appendTo(divTeclat);
		}
	}
	
	function getBackgroundColor(color) {
		if ((typeof color == "number") && (color >= 0) && (color < 256*256*256)) 
			return "rgb("+[(color>>16)%256, (color>>8)%256, color%256].join(",")+")";
		return "";
	}
	function setButtonsTeclatsTpv(ambient) {
		var t = (DatosTeclatsTpv.getAmbient(ambient) || {buttons: []});
		
		for (var i=0; i<buttonsTeclat.length; i++) {
			var data = t.buttons[i], but = buttonsTeclat[i];
			
			if ((data == null) || (data.article == null)) {
				data = {};
				var text = "";
				var bg = "";
				var visibility = my.displayEmptyProductes; 
			} else { 
				var text = data.article.nom;
				var bg = getBackgroundColor(data.color);
				var visibility = true;
			}
			data.ambient = ambient; data.pos = i;
			but.text(text).data("data", data).css({ backgroundColor: bg, visibility: (visibility ? "visible" : "hidden") });
		}
	}

	// Buscar Productes
	
	function clickBuscarArticleHandler(e) {
			
	}
	var buttonBuscarArticle = $("<button>").text("Buscar Article").click(clickBuscarArticleHandler);
	
	var divBuscar = $("<div>").css({position: "relative", height: "100%"}).appendTo(divTBE);
	var buttonEntrarArticle = $("<button>").text("Entrar Producto").appendTo(divBuscar);

	var nivellsModel = $("<button>").css({width:"100%", height:"100%"}).mousedown(nivellsHandler);
	var defaultElementNivells = nivellsModel.clone(false).html("X<br>X");  
	var nivellsScroll = [];
	var numNivells = null;
/*	for (var i=1; i<=3; i++) {
		nivellsScroll[i] = new myScroll("_ud", null, defaultElementNivells); 
		nivellsScroll[i].getDiv().css({position: "absolute", top: "0px", height: "100%"}).appendTo(divBuscarProducte);
	}
*/

	function redrawBuscar() {
		var currentNumNivells = DatosTeclatsTpv.getNumNivellsFamilies(); 
		if (currentNumNivells == 0) {
			D.estado = "teclat";
			redrawDivTBE();
			return;
		}
		var fResize = false;
		if (numNivells != currentNumNivells) {
			fResize = true;	
			numNivells = currentNumNivells;
			for (var i=0; i<numNivells+1; i++) {
				if (nivellsScroll[i] == null) {
					nivellsScroll[i] = new myScroll("_ud", null, defaultElementNivells); 
					nivellsScroll[i].getDiv().css({position: "absolute", top: "0px", bottom: "0px"}).appendTo(divBuscar);
				}
				nivellsScroll[i].getDiv().show();
			}
			while (nivellsScroll[i] != null) { nivellsScroll[i].getDiv().hide(); i++ }
			D.buscar = null;
		}
		if (D.buscar != null) {
			if (numNivells+1 != D.buscar.length) D.buscar = null;
			else {
				for (var i=0; i<numNivells; i++) {
					if ((D.buscar[i] != null) && (D.buscar[i].obj != DatosTeclatsTpv.getFamilia(D.buscar[i].idx))) {
						D.buscar = null;
						break;
					}
				}
				if (i == numNivells) {
					if ((D.buscar[i] != null) && (D.buscar[i].obj != DatosTeclatsTpv.getArticle(D.buscar[i].idx))) {
						D.buscar = null;
					}
				}
			}
		} // no else
		if (D.buscar == null) {
			D.buscar = new Array(numNivells+1);
//			D.buscar[0] = {idx: my.getIdxNivell0(), obj: DatosTeclatsTpv.getFamilia(my.getIdxNivell0())};
		}
		var art = null, lastF = null;
		var fam = DatosTeclatsTpv.getFamilia(DatosTeclatsTpv.getNivell0());
		for (var niv=0; niv<numNivells; niv++) {
			nivellsScroll[niv].removeAll();

			var idxSubF = null, pos = null;
			var b = D.buscar[niv];
			if (b != null) { idxSubF = b.idx; }
			
			for (var i=0; i<fam.subF.length; i++) {
				var subF = DatosTeclatsTpv.getFamilia(fam.subF[i]);
				var el = nivellsModel.clone(true).text(subF.nom)
				                                .data("familia", subF)
								        	    .addClass("ui-state-default")
									            .appendTo(nivellsScroll[niv].newElement().css({ verticalAlign: "middle" }));
				if (idxSubF == fam.subF[i]) el.addClass("ui-state-active");
				pos = i;
			}
			if (pos != null) nivellsScroll[niv].scrollTo(pos, true); 
			nivellsScroll[niv].redraw();	

			if (b != null) { fam = b.obj; } 
			else break;
		}
		for (; niv<numNivells; niv++) {
			nivellsScroll[niv].removeAll();
			nivellsScroll[niv].redraw();	
		}

		nivellsScroll[niv].removeAll();
		var b = D.buscar[niv];
		var idxArt = null, pos = null;
		if (b != null) { idxArt = DatosTeclatsTpv.getArticle(b.idx); }
		for (i=0; i<fam.art.length; i++) {
			var art = DatosTeclatsTpv.getArticle(fam.art[i]);
			var el = nivellsModel.clone(true).text(art.nom)
			                                 .data("article", art)
							        	     .addClass("ui-state-default")
								             .appendTo(nivellsScroll[niv].newElement().css({ verticalAlign: "middle" }));
			if (idxArt == fam.art[i]) el.addClass("ui-state-active");
			pos = i;
		}
		if (pos != null) nivellsScroll[niv].scrollTo(pos, true); 
		nivellsScroll[niv].redraw();	

		if (fResize) resizeDivBuscar(); 
	}
	function resizeDivBuscar() {
		var w0=divBuscar.width(), h0=divBuscar.height();
		var nW = numNivells+2;
		buttonEntrarArticle.width(Math.round(w0/nW));
		var top = buttonEntrarArticle.outterHeight(true), left = 0, nextLeft;
		for (var i=0; i<numNivells; i++) {
			nextLeft = Math.round((i+1)*w0/nW);
			nivellsScroll[i].getDiv().css({ left: left+"px", top: top+"px", width: (nextLeft-left)+"px" });
			left = nextLeft; top = 0;	
			nivellsScroll[i].redraw();	
		}
		nivellsScroll[i].getDiv().css({ left: left+"px", top: top+"px", width: (w0-left)+"px" });
		nivellsScroll[i].redraw();	
	}
	
	my.getButtonBuscarArticle = function() {
		return buttonBuscarArticle;
	}
	return my;
}


var DatosTeclatsTpv = (function(){
	var my = {};
	var datosTeclats = [], datosArticles = [], datosFamilies = [], idxNivell0 = null, maxNivell = 0;
	changeHandlers = [];

	function callbackChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var fInit = false;
	my.init = function(changeHandler) {
		if (typeof changeHandler == "function") { changeHandlers.push(changeHandler); }
		if (!fInit) {
			obtenerDB();
			callbackComunicacion.add(function() { callbackChangeHandlers();	});
			fInit = true;
		}
	}
	function getSortFunction(propName) {
		return function(a,b) { return ((a[propName] < b[propName]) ? -1 : ((a[propName] > b[propName])?1:0)); }	
	}
	my.getAmbient = function(ambient) {
		for (var i=0, t=null; i<datosTeclats.length; i++) {
			if (datosTeclats[i].ambient == ambient) {t=datosTeclats[i]; break;}
		}
		return t;
	}
	my.getAmbientByIndex = function(idx) { return datosTeclats[idx]; }
	my.newAmbient = function(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) {
			t = {ambient: ambient, buttons: []};
			datosTeclats.push(t);
			datosTeclats = datosTeclats.sort(getSortFunction("ambient"));
		}
		return t;
	}
	
	function insertArticleTeclat(but) {
		// sql -> delete, insert			
		var t = my.newAmbient(but.ambient);
		t.buttons[but.pos] = but;
		// sql delete -> insert
	}
	
	function getArticleTeclat(ambient, pos) {
		var t = my.getAmbient(ambient);
		if (t != null) return t.buttons[pos];
		else return null;
	}
	
	function deleteArticleTeclat(ambient, pos) {
		var t = my.getAmbient(ambient);
		if (t != null) {
			// sql delete
			t.buttons[pos] = null;
		}
	}
	
	my.getAticle = function(idx) { return datosArticles[idx]; }
	
	my.getFamilies = function(idx) {
//		if (idx == null) idx = idxNivell0;
		return datosFamilies[idx];
	}
	my.getIdxNivell0 = function() { return idxNivell0; }
	my.getNumNivellsFamilia = function() { return maxNivell; }
	
	function obtenerDB() {
		var db = DB.openPrincipal();
		var resTeclats = null, resArticles = null, resFamilies = null;
		
		function copyAsArray(rows) {
			var r=[];
			for (var i=0; i<rows.length; i++) r.push(rows.item(i));	
			return r;
		}
		db.transaction(function (tx) {
			var stat = "SELECT Ambient as ambient, Article as codiArticle, Pos as pos, Color as color FROM TeclatsTpv "/*WHERE (Llicencia = ?) OR (Llicencia IS NULL)*/;
			tx.executeSql(stat, [/*GlobalGTPV.get("Llicencia")*/], function (tx,res) {
				resTeclats = copyAsArray(res.rows);
				procesarDatos();
			});
			var stat = "SELECT Codi as codi, NOM as nom, PREU as preu, EsSumable as esSumable, Familia as familia FROM Articles ";
			tx.executeSql(stat, [], function (tx,res) {
				resArticles = copyAsArray(res.rows);
				procesarDatos();
			});
			var stat = "SELECT Nom as nom, Pare as pare, Nivell as nivell FROM Familes ";
			tx.executeSql(stat, [], function (tx,res) {
				resFamiles = copyAsArray(res.rows);
				procesarDatos();
			});
		});

		function procesarDatos() {

			if ((resTeclats == null) || (resArticles == null) || (resFamilies == null)) { return; }
			resArticles = resArticles.sort(getSortFunction("codi"));
			datosTeclats = [];

			function findArticle(codi) {
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
			for (var i=0; i<resTeclats.length; i++) {
				var article = findArticle(resTeclats[i].codiArticle);
				resTeclats[i].article = article;	
				insertProducteTeclat(resTeclats[i]); 
			}
			var nivellsSinNombre = [],
			    idxNivellSinNombre = resFamilies.length-1,
			    idxMaxNivellSinNombre = idxNivellSinNombre;
			
			idxNivell0 = null;
			for (var i=0; i<resFamilies.length; i++) {
				if (resFamilies[i].nivell == 0) {
					idxNivell0 = i;
					resFamilies[i] = {};
				}
				resFamilies[i].subF = [];
				resFamilies[i].art = [];
			}
			if (idxNivell0 == null) {
				idxNivell0 = resFamilies.length;
				resFamilies.push({ nivell: 0 });
			}
			var lenFamiles = resFamilies.length;
			var nivellsSinNombre = 0, idxNivellsSinNombre = idxNivell0;
			function getNivellSinNombre(nivell) {
				while (nivellsSinNombre <= nivell) {
					resFamilies[idxNivellsSinNombre].subF.push(resFamilies.length);
					nivellsSinNombre++;
					idxNivellsSinNombre = resFamilies.length;
					resFamilies.push({ nom: "Sin nombre", nivell: nivellsSinNombre, subF: [], art: [] });
				}
				return (lenFamilies+nivell);
			}
			function findPare(familia) {
				if (familia.nivell == 1) return idxNivell0;
				for (var i=0; i<lenFamilies; i++) {
					if ((familia.pare == resFamilies[i].nom) && (familia.nivell-1 == resFamiles[i].nivell))
						return i;
				}
				return null;
			}
			maxNivell = 0;
			for (var i=0; i<lenFamilies; i++) {
				var familia = resFamiles[i], nivell = familia.nivell;
				if (nivell > 0) {
					var idxPare = findPare(familia);
					if (idxPare == null) { idxPare = getNivellSinNombre(nivell); } 
					resFamilies[idxPare].subF.push(i);
					familia.idxPare = idxPare;
					if (maxNivell < nivell) maxNivell = nivell;
				}
			}
			
			function findFamilia(nom) {
				if (nom == null) return null;
				for (var i=0; i<resFamiles[i].length; i++) {
					if ((resFamiles[i].nom == nom) && (resFamiles[i].nivell > 0))
						return i;
				}
				return null;
			}
			for (var i=0; i<resArticles.length; i++) {
				var article = resArticles[i];
				var idxFamilia = findFamilia(article.familia);
				if (idxFamilia == null) { idxFamilia = getNivellSinNombre(1); }
				article.idxFamilia = idxFamilia;
			}
			if ((maxNivell == 0) && (resArticles.length > 0)) maxNivell = 1;

			datosArticles = resArticles;
			datosFamilies = resFamilies;

			callbackChangeHandlers();
		}
	}		
	
	return my;
})();


