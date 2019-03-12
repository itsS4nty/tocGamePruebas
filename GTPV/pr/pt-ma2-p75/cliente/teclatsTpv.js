Scripts.addLE("teclatsTpvS", function(window) {

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
	my.appendTo = function(target) { divAT.appendTo(target); return my; } 

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

}); // Scripts.add teclaltsTpvS

