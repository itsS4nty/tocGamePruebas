Scripts.add("teclatsTpv", function(window) {

window.newDivTeclatsTpv = function() {
	var my = {};

	var Config = {
		hAmbients : 0.25,
//		hTeclado : 0.6,
		nButX : 6,
		nButY : 6,
		wKeyboardEntrar: .7,
		hKeyboardEntrar: .8, //????????
	}

	var D = {};

	// div Ambients Teclats
	var divAT = div100x100();
	my.getDiv = function() { return divAT; }

	function changeDatosHandler() { if (isDivVisible(divAT)) my.redraw(D);	}
	my.init = function() { DatosArticles.addChangeHandler(changeDatosHandler); }

	function codiBarresHandler(cb) {
		if (cb == null) return;
		var art = DatosAricles.findArtByCodi(cb.codiArticle);
		if (art == null) return;
		if (!isDivVisible(divAT)) return;
		if (D.estado != "entrar") {
			my.selectedArticleHandler({ codiArticle: art.codi, color: null });
		} else {
//			var idx = cb.idxArticle;
			var numNivells = DatosArticles.getNumNivellsFamilies();
			D.buscar = new Array(numNivells+1);
			D.buscarRef = DatosArticles.getRefDatos();
			D.buscar[numNivells] = art/*{ idx: idx, obj: art }*/;
			var idxFam = art.idxFamilia;
			while (true) {
				var fam = DatosArticles.getFamiliaByIdx(idxFam);	
				if (fam.nivell == 0) break;
				D.buscar[fam.nivell-1] = fam/*{ idx: idxFam, obj:fam }*/;
				idxFam = fam.idxPare;
			} 
			D.estado = "buscar";
			redrawDivTBE();
		}
	}
	
	my.redraw = function(_datos) {
		D = (_datos || {});
		D.estado = (D.estado || "teclat");
		
		ambientsScroll.removeAll();

		var posAct = -1, t;
		for (var i=0; (t=DatosArticles.getAmbientByIndex(i)) != null; i++) {
			if (t.ambient == D.ambientActual) posAct=i;
			AmbientModel.clone(true).text(t.ambient)
			                        .data("ambient", t.ambient).data("idx", i) 						
                                    .addClass("ui-state-default")
									.appendTo(ambientsScroll.newElement());
		}
		if (posAct == -1) {  // ambientActual ha desaparecido
			t = DatosArticles.getAmbientByIndex(0);
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
		my.setAmbientActual(D.ambientActual);
		
//		redrawDivTBE();
		CodisBarres.register(codiBarresHandler);
	}
//		setButtonsTeclatsTpv(ambientActual);

	var fResize = {};
	
	my.preferedHeight = function(h) {
		var hTBE = h-heightSubMenu.getPX();
		hTBE -= (hTBE%Config.nButY);
		return heightSubMenu.getPX()+hTBE;
	}
	
	my.resize = function() {
		fResize = {};
		var wDC = divAT.width(), hDC = divAT.height();

		ambientsScroll.getDiv().height(heightSubMenu.getPX());
		ambientsScroll.redraw();

		var hTBE = hDC-heightSubMenu.getPX();
		divTBE.height(hTBE);
		resizeDivTBE();
//		divAT.height(ambientsScroll.getDiv().height()+divTBE.height());
	}
	
	var cursorArticles = "auto";
	my.setCursorArticles = function(_cursor) {
		cursorArticles = _cursor;
		$("button", divTeclat).css({ cursor: cursorArticles });
	}
	
	var ambientsScroll = new gScroll("_lr", Config.nButX);
	ambientsScroll.getDiv().appendTo(divAT);
	
	var elAmbientsScrollSelected;
	
	my.setAmbientActual = function(newAmbient) {
		var el;
		D.ambientActual = newAmbient;
		elAmbientsScrollSelected = null;
		for (var i=0; (el = ambientsScroll.get(i)) != null; i++) {
			el = el.children();
			if (newAmbient == el.data("ambient")) {
				el.addClass("ui-state-active");
				ambientsScroll.scrollTo(i, true);
				elAmbientsScrollSelected = el;
			} else { el.removeClass("ui-state-active"); }
		}
//		D.estado = "teclat";
		redrawDivTBE();
//		resizeDivTBE();
//		setButtonsTeclatsTpv(D.ambientActual);
	}
	my.getAmbientActual = function() { return D.ambientActual; }

	my.clickAmbientHandler = function() {};
	
	function clickButtonAmbient(e) {
		if (e.button !== 0) return;
		var el = $(this);
		my.clickAmbientHandler(el.data("ambient"), el.data("idx"));
		//my.setAmbientActual(el.data("ambient"));
		if (elAmbientsScrollSelected != null) elAmbientsScrollSelected.removeClass("ui-state-active");
		D.ambientActual = el.data("ambient");
		el.addClass("ui-state-active");
		elAmbientsScrollSelected = el;
		D.estado = "teclat";
		redrawDivTBE();
	}
    
	var AmbientModel = $("<button>").css({boxSizing: "border-box", width: "100%", height: "100%", margin: "0px"})
						            /*.addClass("ui-corner-all")*/
						            .mousedown(clickButtonAmbient);
	
	// div Teclats Buscar Entrar 
	var divTBE = $("<div>").appendTo(divAT);

	my.redrawTeclat = function() {
		redrawDivTBE();
	}
	my.r = function() {redrawDivTeclat();} // test
	function redrawDivTBE() {
		divShow(divAT);
		divTBE.children().hide();
		switch (D.estado) {
			case "teclat" :
			case null :
				divTeclat.show();
				redrawDivTeclat();
				break;
			case "buscar" :
				divBuscar.show();
				redrawDivBuscar();	
				break;
			case "entrar" :
				divEntrar.show();
				redrawDivEntrar();
				break;
		}
		resizeDivTBE();
	}
	
	function resizeDivTBE() {
		switch (D.estado) {
			case "teclat" :
			case null :
				resizeDivTeclat();
				break;
			case "buscar" :
				resizeDivBuscar();
				break;
			case "entrar" :
				resizeDivEntrar();
				break;
		}
	}
	
	// Teclats Articles
	
	var divTeclat = $("<div>").addClass("ui-widget-content").css({position: "relative", height: "100%"})
	                          .appendTo(divTBE);

	my.selectedArticleHandler = function() {};
	
	function clickButtonTeclatHandler(e) {
		if (e.button !== 0) return;
		var el = $(this);
		my.selectedArticleHandler(el.data("data"), el);
	}

	var buttonModel = $("<button>").css({boxSizing: "border-box", margin: "0px", 
								         color: "black", height: "100%", verticalAlign: "middle"})
						           .addClass("but_TeclatsTpv")
						           .mousedown(clickButtonTeclatHandler);
	var buttonsTeclat = [];
	var nX = Config.nButX, nY = Config.nButY;
	for (var y=0; y<nY; y++) {
		var divF = $("<div>").css({textAlign: "center"}).appendTo(divTeclat);
		for (var x=0; x<nX; x++) {
			buttonsTeclat[x*nY+y] = buttonModel.clone(true).data("pos", x*nY+y).appendTo(divF);
		}
	}
	
	function getBackgroundColor(color) {
		if ((typeof color == "number") && (color >= 0) && (color < 256*256*256)) 
			return "rgb("+[(color>>16)%256, (color>>8)%256, color%256].join(",")+")";
		return "";
	}
	my.displayEmptyArticles = false;
	function redrawDivTeclat() {
		var ambient = D.ambientActual;
		var t = (DatosArticles.getAmbient(ambient) || {buttons: []});
		
		for (var i=0; i<buttonsTeclat.length; i++) {
			var data = t.buttons[i], but = buttonsTeclat[i];

			var article;
			if (data != null) article = DatosArticles.findArtByCodi(data.codiArticle);

			if (article == null) {
				data = { codiArticle: null, ambient: ambient, pos: i, color: null };
				var text = "";
				var bg = "";
				var visibility = my.displayEmptyArticles; 
				var underline = false;
			} else { 
//				var article = DatosArticles.findArtByCodi(data.codiArticle);
				var text = article.nom || "";
				var bg = getBackgroundColor(data.color);
				var visibility = true;
				var underline = (!article.esSumable); 
			}
			but.text(text).data("data", data)
			              .css({ backgroundColor: bg, textDecoration: (underline ? "underline" : "none"), 
						         visibility: (visibility ? "visible" : "hidden") });
		}
	}

	function resizeDivTeclat() {
		if (fResize.divTeclat === false) return;
		var w1=divTeclat.width(), h1=divTeclat.height();
		var nX = Config.nButX, nY = Config.nButY;
		var wB=Math.floor(w1/nX), hB=Math.floor(h1/nY);
		divTeclat.children().height(hB);
		for (var x=0; x<nX; x++) {
			for (var y=0; y<nY; y++) {
				buttonsTeclat[x*nY+y].width(wB);
//				posAbsolutePX(buttonsTeclat[x*nY+y], (x/nX)*w1, (y/nY)*h1, ((x+1)/nX)*w1, ((y+1)/nY)*h1);
			}
		}
		fResize.divTeclat = false;
	}
				
	// Buscar Article
	
	function clickBuscarArticleHandler(e) {
		if (e.button !== 0) return;
		switch (D.estado) {
			case "buscar":
			case "entrar":
				D.estado = "teclat";
				break;
			case "teclat":
			case null:
			default:
				D.estado = "buscar";
		}	
		redrawDivTBE();
//		resizeDivTBE();
	}
	var buttonBuscarArticle = $("<button>").text("Buscar Article").click(clickBuscarArticleHandler);
	my.getButtonBuscarArticle = function() { return buttonBuscarArticle; }
	
	var divBuscar = $("<div>").css({position: "relative", height: "100%"}).appendTo(divTBE);
	
	function clickEntrarArticleHandler(e) {
		if (e.button !== 0) return;
		D.estado = "entrar";
		inputEntrar.val("");
		keyboardEntrar.reset();
		redrawDivTBE();
//		resizeDivTBE();
	}
	var buttonEntrarArticle = $("<button>").text("Entrar Producto").appendTo(divBuscar).click(clickEntrarArticleHandler);

	function clickNivellHandler(e) {
		if (e.button !== 0) return;
		var /*niv = $(this).data("niv"), idx = $(this).data("idx"),*/ fam = $(this).data("fam");
//		D.buscar[niv] = { idx: idx };
		var niv = fam.nivell;
		D.buscar[niv] = fam;
//		D.buscar[niv].obj = DatosArticles.getFamiliaByIdx(idx);
		for (var i=niv+1; i<numNivells+1; i++) D.buscar[i] = null;
		for (var i=0; (el = nivellsScroll[niv].get(i)) != null; i++) {
			el = el.children();
			el[(fam == el.data("fam")) ? "addClass" : "removeClass"]("ui-state-active");
		}
		redrawDivBuscar(niv+1);
	}
	var nivellArticleSelected = null;
	function clickNivellArticleHandler(e) {
		if (e.button !== 0) return;
		var art = this.gtpvUserData_art/*, idx = this.gtpvUserData.idx*/;
/*		var obj = DatosArticles.getArticleByIdx(idx);
		if (obj == art) { // no se si puede pasar
*/			if (nivellArticleSelected != null) nivellArticleSelected.removeClass("ui-state-active");
//			D.buscar[numNivells] = { idx: idx };
//			D.buscar[numNivells].obj = art;
			D.buscar[numNivells] = art;
			my.selectedArticleHandler({ codiArticle: art.codi, /*article: art,*/ /*idxArticle: idx,*/ color: null });
			nivellArticleSelected = $(this).addClass("ui-state-active");
//		}
	}

	var nivellModel = $("<button>").css({width:"100%", height:"100%"}).addClass("ui-state-default");
	var defaultElementNivells = nivellModel.clone(false).html("X<br>X");  
	var nivellsScroll = [];
	var numNivells = null;

	function redrawDivBuscar(nivInicial) {
		nivInicial = nivInicial || 0;
		var currentNumNivells = DatosArticles.getNumNivellsFamilies(); 
		if (currentNumNivells == 0) {
			D.estado = "teclat";
			redrawDivTBE();
			return;
		}
		if (numNivells != currentNumNivells) {
			numNivells = currentNumNivells;
			for (var i=0; i<numNivells+1; i++) {
				if (nivellsScroll[i] == null) {
					nivellsScroll[i] = new gScroll("_ud", defaultElementNivells.clone(false)); 
					nivellsScroll[i].getDiv().css({position: "absolute", top: "0px", bottom: "0px"}).appendTo(divBuscar);
				}
				nivellsScroll[i].getDiv().show();
				nivellsScroll[i].getDiv().css({ cursor: "auto" });
			}
			while (nivellsScroll[i] != null) { nivellsScroll[i].getDiv().hide(); i++ }
			D.buscar = null;
			nivInicial = 0;
			fResize.divBuscar = true;
		}
		if ((D.buscarRef != DatosArticles.getRefDatos()) ||
		    (D.buscar != null) && (D.buscar.length != numNivells+1)) {
			D.buscar = null;
		} // no else
		if (D.buscar == null) {	
			D.buscar = new Array(numNivells+1);	
			D.buscarRef != DatosArticles.getRefDatos();
		}

		var art = null, lastF = null;
		var fam = DatosArticles.getFamiliaByIdx(DatosArticles.getIdxNivell0());
		for (var niv=0; niv<numNivells; niv++) {
			var idxSubF = null, pos = null;
			var famB = D.buscar[niv];
//			if (b != null) { idxSubF = b.idx; }
			
			if (niv >= nivInicial) {
				nivellsScroll[niv].removeAll();
				for (var i=0; i<fam.subF.length; i++) {
					var subF = DatosArticles.getFamiliaByIdx(fam.subF[i]);
					var el = nivellModel.clone(true).text(subF.nom).data("niv", niv).data("idx", fam.subF[i])
					                                .mousedown(clickNivellHandler)
					                                .appendTo(nivellsScroll[niv].newElement());
					if (subF === famB) {
						el.addClass("ui-state-active");
						pos = i;
					}
				}
				if (pos != null) nivellsScroll[niv].scrollTo(pos, true); 
				nivellsScroll[niv].redraw();	
			}

			if (famB != null) { fam = famB; } 
			else { niv++; break; }
		}
		for (; niv<numNivells; niv++) {
			nivellsScroll[niv].removeAll();
			nivellsScroll[niv].redraw();	
		}

		if (niv >= nivInicial) {
			nivellsScroll[niv].removeAll();
			nivellsScroll[niv].setContentNewElement(nivellModel.clone(false).css({ cursor: cursorArticles }));
			var idxArt = null, pos = null;
			var artB = D.buscar[niv];
//			if (b != null) idxArt = b.idx;
			for (i=0; i<fam.art.length; i++) {
				var art = DatosArticles.getArticleByIdx(fam.art[i]);
				var el = nivellsScroll[niv].newElementWithContent();
				el.textContent = art.nom;
				el.gtpvUserData = { art: art/*, idx: fam.art[i]*/ };
				el.addEventListener("mousedown", clickNivellArticleHandler, false);
				if (art === artB/*idxArt == fam.art[i]*/) {
					nivellArticleSelected = $(el).addClass("ui-state-active");
					pos = i;
				}
			}
			if (pos != null) nivellsScroll[niv].scrollTo(pos, true); 
			nivellsScroll[niv].getDiv().css({ cursor: cursorArticles });
			nivellsScroll[niv].redraw();	
		}
	}
	function resizeDivBuscar() {
		if (fResize.divBuscar === false) return;
		var w0=divBuscar.width(), h0=divBuscar.height();
		var nW = numNivells+2;
		buttonEntrarArticle.width(Math.round(w0/nW));
		var top = buttonEntrarArticle.outerHeight(true), left = 0, nextLeft;
		for (var i=0; i<numNivells; i++) {
			nextLeft = Math.round((i+1)*w0/nW);
			nivellsScroll[i].getDiv().css({ left: left+"px", top: top+"px", width: (nextLeft-left)+"px" });
			left = nextLeft; top = 0;	
			nivellsScroll[i].redraw();	
		}
		nivellsScroll[i].getDiv().css({ left: left+"px", top: top+"px", width: (w0-left)+"px" });
		nivellsScroll[i].redraw();	
		fResize.divBuscar = false;
	}
	
	// Entrar Article
	
	var divEntrar = $("<div>").css({position: "relative", height: "100%"}).appendTo(divTBE);
	
	var inputEntrar = $("<input type='text'>").css({position: "absolute", margin: SEP}).appendTo(divEntrar);
	var keyboardEntrar = new Keyboard();
	keyboardEntrar.getDiv().css({position: "absolute"}).appendTo(divEntrar);
	keyboardEntrar.setInput(inputEntrar);
	keyboardEntrar.getButtons("enter").attr("disabled", "disabled");
	keyboardEntrar.setCallback(function(m) {
		switch(m) {
			case "cancel" :
				D.estado = "buscar";
				redrawDivTBE();
				break;
			case "change" :
				redrawDivEntrar();
				break;	
		}
	});
	function clickAutoCompleteEntrarHandler(e) {
		if (e.button !== 0) return;
		var art = this.gtpvUserData_art/*, idx = this.gtpvUserData.idx*/;
		var numNivells = DatosArticles.getNumNivellsFamilies();
		D.buscar = new Array(numNivells+1);
		D.buscarRef = DatosArticles.getRefDatos();
		D.buscar[numNivells] = art/*{ idx: idx, obj: art }*/;
		var idxFam = art.idxFamilia;
		while (true) {
			var fam = DatosArticles.getFamiliaByIdx(idxFam);	
			if (fam.nivell == 0) break;
			D.buscar[fam.nivell-1] = fam/*{ idx: idxFam, obj:fam }*/;
			idxFam = fam.idxPare;
		} 
		D.estado = "buscar";
		redrawDivTBE();
	}
	var modelAutoCompleteEntrar = $("<button>").css({width:"100%", height:"100%"}).addClass("ui-state-default");
	var defaultAutoCompleteElementEntrar = modelAutoCompleteEntrar.clone(false).html("X<br>X");
	var autoCompleteEntrar = new gScroll("_ud", defaultAutoCompleteElementEntrar);
	autoCompleteEntrar.getDiv().css({position: "absolute", margin: SEP}).appendTo(divEntrar);

	function redrawDivEntrar() {
		autoCompleteEntrar.removeAll();
		autoCompleteEntrar.setContentNewElement(modelAutoCompleteEntrar.clone(false).css({ cursor: cursorArticles }));
		var inputCompare = preProcessCompareNom(inputEntrar.val());
		if (inputCompare.length < 2) return;
		var art;
		for (var i=0; (art = DatosArticles.getArticleByIdx(i)) != null; i++) {
			if (art.compareNom.indexOf(inputCompare) != -1) {
				var el = autoCompleteEntrar.newElementWithContent();
				el.textContent = art.nom;
				el.gtpvUserData_art = art/* = { art: art, idx: i }*/;
				el.addEventListener("mousedown", clickAutoCompleteEntrarHandler, false);
			}
		}
		autoCompleteEntrar.redraw();
	}
	
	function resizeDivEntrar() {
		if (fResize.divEntrar === false) return;
		var w0 = divEntrar.width(), h0 = divEntrar.height();

		inputEntrar.css({left: "0px", width: (w0*Config.wKeyboardEntrar)+"px"});
		positionKeyboard(keyboardEntrar, SEPpx, getOH(inputEntrar), w0*Config.wKeyboardEntrar-SEPpx, h0-SEPpx);
		posAbsolutePX(autoCompleteEntrar.getDiv(), w0*Config.wKeyboardEntrar, 0, w0, h0);
		autoCompleteEntrar.redraw();
		fResize.divEntrar = false;
	}
	
	return my;
}

});

var DatosArticlesH = (function(){
	var my = {};
	var datosTeclats = [], datosArticles = [], datosFamilies = { idxN0: null, maxN :0, families: [] }, datosCodisBarres = [];
	var version = 0, versionArt = -1;
/*	var changeHandlers = [];

	function callbackChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
*/	
	var callbackInit;
	function runCallbackInit() {
		if (callbackInit != null) {
			callbackInit();
			callbackInit = null;
		}
	}
	
//	my.reload = function() { obtenerDB(); }

	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;	
		DB.addReloadDBHandler(function() { obtenerDB(); });
		obtenerDB();
	}

	function getAmbient(ambient) {
		for (var i=0, t=null; i<datosTeclats.length; i++) {
			if (datosTeclats[i].ambient == ambient) {t=datosTeclats[i]; break;}
		}
		return t;
	}
//	my.getAmbientByIndex = function(idx) { return datosTeclats[idx]; }

	function getOrNewAmbient(ambient) {
		var t =	getAmbient(ambient);
		if (t == null) {
			t = {ambient: ambient, buttons: []};
			datosTeclats.push(t);
		}
		return t;
	}

//	my.getArticleByIdx = function(idx) { return datosArticles[idx]; }
//	my.getIdxByArticle = function(art) { return datosArticles.indexOf(art); }
		
/*	function findIdxArticleByCodi(codi) {
		for (var i=0; i<datosArticles.length; i++) {
			if (datosArticles[i].codi == codi) return i;
		}	
		return null;	
	}	
*/
/*	my.getFamiliaByIdx = function(idx) {
//		if (idx == null) idx = idxNivell0;
		return datosFamilies[idx];
	}
	my.getIdxNivell0 = function() { return idxNivell0; }
	my.getNumNivellsFamilies = function() { return maxNivell; }
*/	
/*	my.findCodiBarres = function(codi) {
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
*/
/*	my.createTableTeclatsTpv = function() {
		var db = DB.openPrincipal();
		db.transaction(function(tx) {
			DB.exec(tx, "CREATE TABLE IF NOT EXISTS [TeclatsTpv] ("
			           +"     Data text, Llicencia int, Maquina float, Dependenta float, Ambient text," 
			           +"	  Article float, Pos float, Color float, _fecha_sincro text, _tipo_sincro text)", []);
		});
	}
*/	
	function obtenerDB() {
		var db = DB.openPrincipal();
		var resTeclats = [], resArticles = [], resFamilies = [], resCodisBarres = [];
		
		function copyRows(rows) {
			var res=[];
			for (var i=0; i<rows.length; i++) {
				var row = rows.item(i), obj = {}; // props de rows readonly
				for (var prop in row) { if (row.hasOwnProperty(prop)) { obj[prop] = row[prop]; } }
				res.push(obj);	
			}
			return res;
		}
		db.transaction(function (tx) {
			var stat = "SELECT [Ambient] as [ambient], [Article] as [codiArticle], [Pos] as [pos], [Color] as [color] "
			          +"FROM [TeclatsTpv] WHERE (([_tipo_sincro] = 'I') OR ([_tipo_sincro] IS NULL))";
			var params = [];
			if (GlobalGTPV.get("Llicencia") != null) {
				stat += " AND (([Llicencia] = ?) OR ([Llicencia] IS NULL))";
				params.push(GlobalGTPV.get("Llicencia"));
			}
			stat +=" ORDER BY [Data] ASC";
			DB.exec(tx, stat, params, function (tx,res) { resTeclats = copyRows(res.rows); },
				function (tx,e) { return false; });
			var stat = "SELECT [Codi] as [codi], [NOM] as [nom], [PREU] as [preu], [EsSumable] as [esSumable], [Familia] as [familia] "
			          +"FROM [Articles] ";
			DB.exec(tx, stat, [], function (tx,res) { resArticles = copyRows(res.rows); },
				function (tx,e) { return false; });
			var stat = "SELECT [Nom] as [nom], [Pare] as [pare], [Nivell] as [nivell] FROM [Families] ";
			DB.exec(tx, stat, [], function (tx,res) { resFamilies = copyRows(res.rows); },
				function (tx,e) { return false; });
			var stat = "SELECT [Codi] as [codi], [Producte] as [codiArticle] FROM [CodisBarres]";
			DB.exec(tx, stat, [], function (tx,res) { resCodisBarres = copyRows(res.rows); },
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
					el.compareNom = preProcessCompareNom(el.nom);
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
			datosTeclats = [];
			for (var i=0; i<resTeclats.length; i++) {
				var but = resTeclats[i];
//				but.idxArticle = findIdxArticleByCodi(but.codiArticle);	
				if (but.ambient != null) getOrNewAmbient(but.ambient).buttons[but.pos] = but;
			}
			datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));

			datosCodisBarres = [];
			for (var i=0; i<resCodisBarres.length; i++) {
				var cb = resCodisBarres[i];
				if ((cb.codi != null) && (cb.codi != "") && (cb.codiArticle != null)) {
					cb.codiArticle = Number(cb.codiArticle);
//					cb.idxArticle = findIdxArticleByCodi(cb.codiArticle);
					/*if (cb.idxArticle != null)*/ datosCodisBarres.push(cb);
				}
			}
			datosCodisBarres = datosCodisBarres.sort(getSortFunction("codi"));
			
//			for (var i=0; i<resArticles.length; i++) { resArticles[i].idxOld = i; }
			resArticles = resArticles.sort(getToLowerSortFunction("nom"));
/*			var translateIdx = new Array(resArticles.length);
			for (var i=0; i<resArticles.length; i++) { translateIdx[resArticles[i].idxOld] = i; delete resArticles[i].idxOld; }
			datosTeclats.forEach(function(ambient) {
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
			versionArt = version;
			
			actualizeSat();
//			callbackChangeHandlers();
			runCallbackInit();
		}
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
		var newSat = {id: idSat, isLocal: CH.isLocal(idSat), actualize: { All : true}, waitResponse: false};
		newSat.comHandler = getComHandler(newSat);
		satellites.push(newSat);
		CH.createObject("DatosArticles", idSat, objSat, objLocal);
		doActualizationSat(newSat);		
	};
	
	function doActualizationSat(sat) {
		if (!sat.waitResponse) {
			if (sat.actualize.All || sat.actualize.Teclats) {
				sat.waitResponse = true;	
				CH.callFunction("DatosArticles", sat.idSat, sat.actualize.All ? "actualize" : "actualizeSat", 
					sat.actualize.All ? [datosTeclats, datosArticles, datosFamilies, datosCodisBarres, version]
					                  : [datosTeclats, version], 
					sat.comHandler);
				sat.actualize.All = sat.actualize.Teclats = false;	
			}
		}		
	}
	
	function actualizeSat(type) {
		if (type == null) type="All";
		satellites.forEach(function(sat) {
			sat.actualize[type] = true;
			doActualizationSat(sat);
		});
	}
	
	function actualizeSatTeclatsTpv(infoSat) {
		satellites.forEach(function(sat) {
			if ((infoSat != null) && (infoSat.idSat === sat.idSat)) return;
			sat.actualizeTeclats = true;
			doActualizationSat(sat);
		});
	}

	var objLocal = {
		renAmbient : function(infoSat, oldAmbient, newAmbient, codiDep, versionSat) {
			if (!infoSat.isLocal) {
				var t =	getAmbient(oldAmbient);
				if (t == null) return;
				t.ambient = newAmbient;
				t.buttons.forEach(function(el) { el.ambient = newAmbient; });
				datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
			} else {
				var t = my.getAmbient(newAmbient);
			}
			var buttons = [];
			t.buttons.forEach(function(but) { 
				var butT = {};
				["codiArticle", "pos", "color"].forEach(function(p) { butT[p] = but[p]; });
				buttons.push(butT);
			});
			version++;
			actualizeSatTeclatsTpv((version === versionSat) ? infoSat : null);
			DB.preOpenPrincipal("TeclatsTpv", function(h) {
				var db = DB.open(h.dbName);
				DB.transactionWithErr(db, function(tx) {
					DB.sincroDelete_UD(h.dbName, tx, h.tableName, 
						{ ambient: oldAmbient }, h.mark);
					buttons.forEach(function(but) { 
						DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
							{ ambient: newAmbient, pos: but.pos, llicencia: GlobalGTPV.get("Llicencia") },
							{ article: but.codiArticle, color: but.color, Dependenta: codiDep, 
							  Data: DB.DateToSql()}, h.mark);
					});
				});
			});
			return version;
		},

		delAmbient : function(infoSat, ambient, versionSat) {
			if (!infoSat.isLocal) {
				var t =	getAmbient(ambient);
				if (t == null) return;
				datosTeclats.splice(datosTeclats.indexOf(t), 1);
			}
			version++;
			actualizeSatTeclatsTpv((version === versionSat) ? infoSat : null);
			DB.preOpenPrincipal("TeclatsTpv", function(h) {
				var db = DB.open(h.dbName);
				DB.transactionWithErr(db, function(tx) {
					DB.sincroDelete_UD(h.dbName, tx, h.tableName, 
						{ ambient: ambient, llicencia: GlobalGTPV.get("Llicencia") }, h.mark);
				});
			});
			return version;
		},
		
		addArticleTeclat : function(infoSat, but, codiDep, versionSat) {
			if (!infoSat.isLocal) {
				var t = getOrNewAmbient(but.ambient);
//				but.idxArticle = findIdxArticleByCodi(but.codiArticle);
				t.buttons[but.pos] = but;
				datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
			}
			version++;
			actualizeSatTeclatsTpv((version === versionSat) ? infoSat : null);
			DB.preOpenPrincipal("TeclatsTpv", function(h) {
				var db = DB.open(h.dbName);
				DB.transactionWithErr(db, function(tx) {
					DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
						{ ambient: but.ambient, pos: but.pos, llicencia: GlobalGTPV.get("Llicencia") },
						{ article: but.codiArticle, color: but.color, Dependenta: codiDep, 
						  Data: DB.DateToSql() }, h.mark);
				});
			});
			return version;
		},
		
		delArticleTeclat : function(infoSat, but, versionSat) {
			if (!infoSat.isLocal) {
				if ((but.pos == null) || (but.codiArticle == null)) return;
//			if (!DB.inTransaction(true, false)) return;
				var t = getAmbient(but.ambient);
				if (t != null) { delete t.buttons[but.pos]; }
			}
			version++;
			actualizeSatTeclatsTpv((version === versionSat) ? infoSat : null);
			DB.preOpenPrincipal("TeclatsTpv", function(h) {
				var db = DB.open(h.dbName);
				DB.transactionWithErr(db, function(tx) {
					DB.sincroDelete_UD(h.dbName, tx, h.tableName, 
						{ ambient: but.ambient, pos: but.pos, llicencia: GlobalGTPV.get("Llicencia") }, h.mark);
				});
			});
			return version;
		},
		
		changeArticleTeclat : function(infoSat, but1, but2, codiDep, versionSat) {
			if (!infoSat.isLocal) {
				var t1,t2;
//				if (but1.codiArticle != null) but1.idxArticle = findIdxArticleByCodi(but1.codiArticle);
//				if (but2.codiArticle != null) but2.idxArticle = findIdxArticleByCodi(but2.codiArticle);
				if (but1.pos != null) { t1 = getAmbient(but1.ambient); }
				if (but2.pos != null) { t2 = getAmbient(but2.ambient); }
				if (t1 != null) { t1.buttons[but1.pos] = $.extend({}, but2, {ambient: but1.ambient, pos: but1.pos}); }
				if (t2 != null) { t2.buttons[but2.pos] = $.extend({}, but1, {ambient: but2.ambient, pos: but2.pos}); }
			}
			version++;
			actualizeSatTeclatsTpv((version === versionSat) ? infoSat : null);
			DB.preOpenPrincipal("TeclatsTpv", function(h) {
				var db = DB.open(h.dbName);
				DB.transactionWithErr(db, function(tx) {
					if (but1.pos != null) {
						DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
							{ ambient: but1.ambient, pos: but1.pos, llicencia: GlobalGTPV.get("Llicencia") },
							{ article: but2.codiArticle, color: but2.color, Dependenta: codiDep, 
							  Data: DB.DateToSql() }, h.mark);
					}
					if (but2.pos != null) {
						DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
							{ ambient: but2.ambient, pos: but2.pos, llicencia: GlobalGTPV.get("Llicencia") },
							{ article: but1.codiArticle, color: but1.color, Dependenta: codiDep, 
							  Data: DB.DateToSql() }, h.mark);
					}
				});
			});
			return version;
		},

		changeColorArticleTeclat : function(infoSat, but, color, codiDep, versionSat) {
			if (!infoSat.isLocal) {
				var t = getAmbient(but.ambient);
				if (t == null) return;
//				if (but.codiArticle != null) but.idxArticle = findIdxArticleByCodi(but.codiArticle);
				but.color = color;
				t.buttons[but.pos] = but;
			}
			version++;
			actualizeSatTeclatsTpv((version === versionSat) ? infoSat : null);
			DB.preOpenPrincipal("TeclatsTpv", function(h) {
				var db = DB.open(h.dbName);
				DB.transactionWithErr(db, function(tx) {
					DB.sincroUpdate_UD(h.dbName, tx, h.tableName, 
						{ ambient: but.ambient, pos: but.pos, llicencia: GlobalGTPV.get("Llicencia") },
						{ color: color, Dependenta: codiDep, 
						  Data: DB.DateToSql() }, h.mark);
				});
			});
			return version;
		},

		createTableTeclatsTpv : function() {
			var db = DB.openPrincipal();
			db.transaction(function(tx) {
				DB.exec(tx, "CREATE TABLE IF NOT EXISTS [TeclatsTpv] ("
						   +"     Data text, Llicencia int, Maquina float, Dependenta float, Ambient text," 
						   +"	  Article float, Pos float, Color float, _fecha_sincro text, _tipo_sincro text)", []);
			});
		}
	
	};

	var objSat = function(host) {
		var my = {};
		window.DatosArticles = my;

		var datosTeclats = [], datosArticles = [], datosFamilies = { idxN0: null, maxN :0, families: [] }, datosCodisBarres = [];
		var changeHandlers = [];

		my.getRefDatos = function() { return datosArticles; }

		function callbackChangeHandlers() {
			for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
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
		my.getAmbient = function(ambient) {
			for (var i=0, t=null; i<datosTeclats.length; i++) {
				if (datosTeclats[i].ambient == ambient) {t=datosTeclats[i]; break;}
			}
			return t;
		}
		my.getAmbientByIndex = function(idx) { return datosTeclats[idx]; }

		function getOrNewAmbient(ambient) {
			var t =	my.getAmbient(ambient);
			if (t == null) {
				t = {ambient: ambient, buttons: []};
				datosTeclats.push(t);
			}
			return t;
		}
		
		var codiToArticle = {};
		
		function createCodiToArticle() {
			codiToArticle = {};
			datosArticles.forEach(function(art) { codiToArticle[art.codi] = art; });
		}
		
		my.findArtByCodi = function(codi) { return codiToArticle[codi]; }
		
		
		my.codiDepModTeclats = null;

/*		function copyButForHost(but) {
			if (host.isLocal) return but;
			var butT = {};
			["ambient", "pos", "codiArticle", "color"].forEach(function(p) { butT[p] = but[p]; });
			return butT;
		}		
*/		var waitComunication = 0;
		var waitVersion = 0;
		function waitFunction(versionH) {
			waitComunication--;
			waitVersion = versionH;
			processWaitData();
		}
		function getWaitFunction() {
			waitComunication++;
			return waitFunction;
		}
		var waitData = {};
		function processWaitData() {
			if (waitActualization > 0) return false;
			if (waitData.version >= waitVersion) {
				datosTeclats = waitData.datosTeclats;
				datosArticles = waitData.datosArticles;
				createCodiToArticle();
				datosFamilies = waitData.datosFamilies;
				datosCodisBarres = waitData.datosCodisBarres;
				version = waitData.version;
				waitData = {};
				callbackChangeHandlers();
				return true;
			}
			return false;		
		}

		function callHost(func, args) {
			version++;
			args.push(version);
			host.call(func,args,getWaitFunction());
		}
		
		my.addAmbient = function(ambient) {
			var t =	my.getAmbient(ambient);
			if (t != null) return;
			var but = { ambient: ambient, pos: 0, codiArticle: null, color: 0 };
			my.addArticleTeclat(but);
		}	
		
		my.renAmbient = function(oldAmbient, newAmbient) {
			var t =	my.getAmbient(oldAmbient);
			if (t == null) return;
//			if (!DB.inTransaction(true, false)) return;
			t.ambient = newAmbient;
			t.buttons.forEach(function(el) { el.ambient = newAmbient; });
			datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
			callHost("renAmbient", [oldAmbient, newAmbient, my.codiDepModTeclats]);
		}

		my.delAmbient = function(ambient) {
			var t =	my.getAmbient(ambient);
			if (t == null) return;
//			if (!DB.inTransaction(true, false)) return;
			datosTeclats.splice(datosTeclats.indexOf(t), 1);
			callHost("delAmbient", [ambient]);
		}
		
		my.addArticleTeclat = function(but) {
//			if (!DB.inTransaction(true, false)) return;
			var t = getOrNewAmbient(but.ambient);
			t.buttons[but.pos] = but;
			datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
			callHost("addArticleTeclat", [but, my.codiDepModTeclats]);
		}
		
		my.getArticleTeclat = function(ambient, pos) {
			var t = my.getAmbient(ambient);
			if (t != null) return t.buttons[pos];
			else return null;
		}
		
		my.delArticleTeclat = function(but) {
			if ((but.pos == null) || (but.codiArticle == null)) { callback(); return; }
//			if (!DB.inTransaction(true, false)) return;
			var t = my.getAmbient(but.ambient);
			if (t != null) { delete t.buttons[but.pos]; }
			callHost("delArticleTeclat", [but]);
		}
		
		my.changeArticleTeclat = function(but1, but2) {
//			if (!DB.inTransaction(true, false)) return;
			var t1,t2;
			if (but1.pos != null) { t1 = my.getAmbient(but1.ambient); }
			if (but2.pos != null) { t2 = my.getAmbient(but2.ambient); }
			if (t1 != null) { t1.buttons[but1.pos] = $.extend({}, but2, {ambient: but1.ambient, pos: but1.pos}); }
			if (t2 != null) { t2.buttons[but2.pos] = $.extend({}, but1, {ambient: but2.ambient, pos: but2.pos}); }
			callHost("changeArticleTeclat", [but1, but2, my.codiDepModTeclats]);
		}

		my.changeColorArticleTeclat = function(but, color) {
//			if (!DB.inTransaction(true)) return;
			var t = my.getAmbient(but.ambient);
			if (t == null) return;
			t.buttons[but.pos] = $.extend({}, but, { color: color });
			callHost("changeColorArticleTeclat", [but, color, my.codiDepModTeclats]);
		}
		
		my.getArticleByIdx = function(idx) { return datosArticles[idx]; }
//		my.getIdxByArticle = function(art) { return datosArticles.indexOf(art); }
			
		my.getFamiliaByIdx = function(idx) {
	//		if (idx == null) idx = idxNivell0;
			return datosFamilies.families[idx];
		}
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

		my.createTableTeclatsTpv = function() {
			host.call("createTableTeclatsTpv", []);
		}
		
		var comSat = {
			actualize: function(_datosTeclats, _datosArticles, _datosFamilies, _datosCodisBarres, _version) {
				waitData.datosTeclats = _datosTeclats;
				waitData.datosArticles = _datosArticles;
				waitData.datosFamilies = _datosFamilies;
				waitData.datosCodisBarres = _datosCodisBarres;
				waitData.version = _version;
				return processWaitData();
			},
			actualizeTeclats: function(_datosTeclats, _version) {
				waitData.datosTeclats = _datosTeclats;
				waitData.version = _version;
				return processWaitData();
			}
		}
		return comSat;
	}
	
	return my;
})();

Scripts.add("codisBarres", function(window) {

window.CodisBarres = function(){
	var my = {};
	
	var registeredHandler = null;
	var buffer = "";
	
	function handler(e) {
		if ((e.which >= "0".charCodeAt(0)) && (e.which <= "9".charCodeAt(0))) {
			buffer+=String.fromCharCode(e.which);
		} else {
			if (buffer.length > 0) {
				var cb = DatosArticles.findCodiBarres(buffer);
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

});
