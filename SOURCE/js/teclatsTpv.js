H.Scripts.add("teclatsTpvS", "L2", function() {

window.newSubAppTeclatsTpv = function() {
	var my = {};

	var Config = {
		hAmbients : 0.25,
//		hTeclado : 0.6,
		nButX : 6,
		nButY : 6,
		wKeyboardEntrar: .7,
		hKeyboardEntrar: .8 //????????
	}

	var D = {};

	// div Ambients Teclats
	var divAT = $("<div>")._100x100();
	my.getDiv = function() { return divAT; }
	my.appendTo = function(target) { divAT.appendTo(target); return my; } 

	function changeDataHandler() { if (divAT.isVisible()) redraw();	}
	my.init = function() { 
		Articles.addChangeHandler(changeDataHandler); 
		Teclats.addChangeHandler(changeDataHandler); 
	}

	function codiBarresHandler(cb) {
		if (cb == null) return;
		var art = Articles.getByCodi(cb.codiArt);
		if (art == null) return;
		if (!divAT.isVisible()) return;
		if (D.estado != "entrar") {
			my.selectedArticleHandler({ codi: art.codi, color: null });
		} else {
			setArticleInBuscar(art);
		}
	}
	
	var ambients;
	
	my.start = function(_datos) {
		D = (_datos || {});
		redraw();
	}
	function redraw() {
		D.estado = (D.estado || "teclat");
		
		ambients = Teclats.getAmbients();
		if (ambients.indexOf(D.ambientActual) === -1) {
			D.ambientActual = (ambients.length > 0) ? ambients[0] : null;
		}
		
		if (D.posScroll == null) D.posScroll = { vis: ambients.indexOf(D.ambientActual) };
		ambientsScroll.setPos(D.posScroll);
		ambientsScroll.redraw();

//		my.setAmbientActual(D.ambientActual);
		
		redrawDivTBE();
		CodisBarres.register(codiBarresHandler);
	}
//		setButtonsTeclatsTpv(ambientActual);

	var resized = {};
	
	my.preferedHeight = function(h) {
		var hTBE = h-layout.getHSubMenuPx();
		hTBE -= (hTBE%Config.nButY);
		return layout.getHSubMenuPx()+hTBE;
	}
	
	my.resize = function() {
		resized = {};
		var wDC = divAT.width(), hDC = divAT.height();

		ambientsScroll.getDiv().height(layout.getHSubMenuPx());
		ambientsScroll.forceRedraw();

		var hTBE = hDC-layout.getHSubMenuPx();
		divTBE.height(hTBE);
		resizeDivTBE();
//		divAT.height(ambientsScroll.getDiv().height()+divTBE.height());
	}
	
	var cursorArticles = "auto";
	my.setCursorArticles = function(_cursor) {
		cursorArticles = _cursor;
		$("button", divTeclat).css({ cursor: cursorArticles });
	}
	
	var paramsAmbientsScroll = {
		arrows : "_lr",
		getNItems : function() { return ambients.length; },
		getItem : function(idx) {
			var amb = ambients[idx];
			var el = ambientModel.clone(true).text(amb)
			                                 .data("ambient", amb).data("idx", idx);
			if (amb === D.ambientActual) el.addClass("g-state-active");
			return el;
		},
		nElScroll : Config.nButX
	};
	
	var ambientsScroll = newGScroll(paramsAmbientsScroll);
	ambientsScroll.getDiv().appendTo(divAT);

	my.setAmbientActual = function(newAmbient) {
		D.ambientActual = newAmbient;
		D.posScroll = null;
		redraw();
	}
	
	my.getAmbientActual = function() { return D.ambientActual; }

	my.clickAmbientHandler = function() {};
	
	var ambientModel = gButton().css({boxSizing: "border-box", margin: "0px"})
						            .addClass("g-state-default")/*.addClass("ui-corner-all")*/;
									
									
	ambientModel.mousedown(function clickButtonAmbient(e) {
		if (e.button !== 0) return;
		var el = $(this);
		D.ambientActual = $(this).data("ambient");
		my.clickAmbientHandler(D.ambientActual);
		D.posScroll = null;
		redraw();
	});
    
	
	// div Teclats Buscar Entrar 
	var divTBE = $("<div>").appendTo(divAT);

	function redrawDivTBE() {
		divAT.showAlone();
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
	
	var divTeclat = $("<div>").addClass("g-widget-content").css({position: "relative", height: "100%"})
	                          .appendTo(divTBE);

	my.selectedArticleHandler = function() {};
	
	function clickButtonTeclatHandler(e) {
		if (e.button !== 0) return;
		var el = $(this);
		my.selectedArticleHandler(el.data("data"), el);
	}

	var buttonModel = gButton().css({boxSizing: "border-box", margin: "0px", 
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
		var t = (Teclats.getAmbient(ambient) || {buttons: []});
		
		for (var i=0; i<buttonsTeclat.length; i++) {
			var data = t.buttons[i], but = buttonsTeclat[i];

			var article = (data != null) ? Articles.getByCodi(data.codi) : null;

			if (article == null) {
				data = { codi: null, ambient: ambient, pos: i, color: null };
				var text = "";
				var bg = "";
				var visibility = my.displayEmptyArticles; 
				var underline = false;
			} else { 
				var text = article.nom || "";
				var bg = getBackgroundColor(data.color);
				var visibility = true;
				var underline = (!article.esSumable); 
			}
			but.text(text).data("data", data)
			              .css({ backgroundColor: bg, visibility: (visibility ? "visible" : "hidden") });
			getGButContent(but).css({textDecoration: (underline ? "underline" : "none")});					 
		}
	}

	function resizeDivTeclat() {
		if (resized.divTeclat) return;
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
		resized.divTeclat = true;
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
	var buttonBuscarArticle = gButton().click(clickBuscarArticleHandler);
	my.getButtonBuscarArticle = function() { return buttonBuscarArticle; }
	my.redrawButtonBuscarArticle = function() { buttonBuscarArticle.text(M("Buscar Article")); }
	
	var divBuscar = $("<div>").css({position: "relative", height: "100%"}).appendTo(divTBE);
	
	function clickEntrarArticleHandler(e) {
		if (e.button !== 0) return;
		D.estado = "entrar";
		inputEntrar.val("");
		keyboardEntrar.reset();
		redrawDivTBE();
//		resizeDivTBE();
	}
	var buttonEntrarArticle = gButton().text("Entrar Producto").appendTo(divBuscar).click(clickEntrarArticleHandler);

	function clickNivellHandler(e) {
		if (e.button !== 0) return;
		var fam = $(this).data("fam");
		var niv = fam.nivell;
		D.buscarSel[niv] = fam;
		D.buscarSel[niv+1] = null;
		D.buscarSel[numNivells] = null;
		D.buscarPos[numNivells] = {};
		redrawDivBuscar(niv);
	}
	function clickNivellArticleHandler(e) {
		if (e.button !== 0) return;
		var art = $(this).data("art");
		D.buscarSel[numNivells] = art;
		redrawDivBuscar(numNivells);
		my.selectedArticleHandler({ codi: art.codi, color: null });
	}
	
	function paramsNivellScroll_F(idxNiv) {
		return {
			arrows : "_ud",
			getNItems : function() { return nivellsData[idxNiv].length; },
			getItem : function(idx) {
				if (idx === -1) return defaultElementNivells;
				var fam = nivellsData[idxNiv];
				var subF = Articles.getFamilies()[fam.subF[idx]];
				var el = nivellModel.clone(true).text(subF.nom).data("niv", idxNiv).data("idx", fam.subF[idx])
												.mousedown(clickNivellHandler);
				if (subF === D.buscarSel[idxNiv]) {
					el.addClass("g-state-active");
				}
				return el;
			}
		};
	}

	function paramsNivellScroll_A(idxNiv) {
		return {
			arrows : "_ud",
			getNItems : function() { return nivellsData[idxNiv].length; },
			getItem : function(idx) {
				if (idx === -1) return defaultElementNivells;
				var fam = nivellsData[idxNiv];
				var art = Articles.getArticles()[fam.art[idx]];
				var el = nivellModel.clone(true).text(art.nom).data("niv", idxNiv).data("idx", fam.art[idx])
												.css({ cursor: cursorArticles })
												.mousedown(clickNivellArticleHandler);
				if (art === D.buscarSel[idxNiv]) {
					el.addClass("g-state-active");
				}
				return el;
			}
		};
	}
	
	var nivellModel = gButton().addClass("g-state-default");
	var defaultElementNivells = nivellModel.clone(false).html("X<br>X");  
	var nivellsScroll = [];
	var nivellsData = [];
	var numNivells;
	
	function redrawDivBuscar(nivInicial) {
		nivInicial = nivInicial || 0;
		numNivells = Articles.getNumNivellsFamilies(); 
		if (numNivells === 0) {
			D.estado = "teclat";
			redrawDivTBE();
			return;
		}
		if (numNivells+1 != nivellsScroll.length) {
			divBuscar.empty();
			nivellsScroll = [];
			var nivScr;
			for (var i=0; i<numNivells+1; i++) {
				if (i<numNivells) {
					nivScr = newGScroll(paramsNivellScroll_F(i));
				} else {
					nivScr = newGScroll(paramsNivellScroll_A(i));
					nivScr.getDiv().css({ cursor: cursorArticles });
				}
				nivScr.getDiv().css({position: "absolute", top: "0px", bottom: "0px"}).appendTo(divBuscar);
				nivellsScroll.push(nivScr);
			}
			D.buscarSel = null;
			nivellsData = [];
			nivInicial = 0;
			resized.divBuscar = false;
		}
		if (!D.buscarSel || (D.buscarSel.length !== numNivells+1) ||
			(D.buscarSel[0] && (Articles.getFamilies().indexOf(D.buscarSel[0]) === -1))) {
			D.buscarSel = new Array(numNivells+1);	
			D.buscarPos = D.buscarSel.map(function() { return {}; }); 
		}	
		
		var fam = Articles.getFamilies()[Articles.getIdxNivell0()];
		var famArt = fam;
		nivellsData = [];
		for (var i=0; i<numNivells; i++) {
			nivellsData.push(fam || []);
			if (!fam) D.buscarSel[i] = null;
			if (D.buscarSel[i] != null) {
				famArt = fam;
			} else D.buscarPos[i] = []; 
			fam = D.buscarSel[i];
		}
		nivellsData.push(famArt);
		for (var i=0; i<numNivells+1; i++) {
			nivellsScroll[i].setPos(D.buscarPos[i]);
		}	
		for (var i=nivInicial; i<numNivells+1; i++) {
			nivellsScroll[i].redraw();
		}
	}
	function resizeDivBuscar() {
		if (resized.divBuscar) return;
		var w0=divBuscar.width(), h0=divBuscar.height();
		var nW = numNivells+2;
		buttonEntrarArticle.text(M("Entrar Producto"));
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
		resized.divBuscar = true;
	}
	
	function setArticleInBuscar(art) {
		var numNivells = Articles.getNumNivellsFamilies();
		D.buscarSel = new Array(numNivells+1);
		D.buscarPos = D.buscarSel.map(function() { return {}; }); 
		D.buscarSel[numNivells] = art;
		var idxFam = art.idxFamilia;
		var fam = Articles.getFamilies()[idxFam];	
		D.buscarPos[numNivells].vis = fam.art.indexOf(Articles.getArticles().indexOf(art));
		while (true) {
			var nivell = fam.nivell;
			if (nivell == 0) break;
			D.buscarSel[nivell-1] = fam;
			var idxSubF = idxFam;
			idxFam = fam.idxPare;
			fam = Articles.getFamilies()[idxFam];
			D.buscarPos[nivell-1].vis = fam.subF.indexOf(idxSubF);
		} 
		D.estado = "buscar";
		redrawDivTBE();
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
	
	var paramsAutoCompleteEntrarScroll = {
		arrows : "_ud",
		getNItems : function() { return artAutoComplete.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultAutoCompleteElementEntrar;
			var art = artAutoComplete[idx];
			var el = autoCompleteEntrarModel.clone(true).css({ cursor: cursorArticles })
			                                            .text(art.nom).data("art", art);
			return el;
		}
	};
	
	var autoCompleteEntrarModel = gButton().addClass("g-state-default");
	var defaultAutoCompleteElementEntrar = autoCompleteEntrarModel.clone(false).html("X<br>X");
	var autoCompleteEntrarScroll = newGScroll(paramsAutoCompleteEntrarScroll);
	autoCompleteEntrarScroll.getDiv().css({position: "absolute", margin: SEP}).appendTo(divEntrar);

	autoCompleteEntrarModel.mousedown(function (e) {
		if (e.button !== 0) return;
		var art = $(this).data("art");
		setArticleInBuscar(art);
	});	

	var artAutoComplete = [];
	
	function redrawDivEntrar() {
		autoCompleteEntrar.removeAll();
		autoCompleteEntrar.setContentNewElement(autoCompleteEntrarModel.clone(false).css({ cursor: cursorArticles }));
		var inputCompare = conversionForCompare(inputEntrar.val());
		if (inputCompare.length === 0) artAutoComplete = Articles.getArticles();
		else {
			artAutoComplete = [];
			Articles.getArticles().forEach(function(art) {
				if (art.compareNom.indexOf(inputCompare) != -1)
					artAutoComplete.push(art);
			});
		}
		autoCompleteEntrarScroll.redraw(0);
	}
	
	function resizeDivEntrar() {
		if (resized.divEntrar) return;
		var w0 = divEntrar.width(), h0 = divEntrar.height();

		inputEntrar.css({left: "0px", width: (w0*Config.wKeyboardEntrar)+"px"});
		keyboardEntrar.absolutePosPx(SEPpx, inputEntrar.oHeight(), w0*Config.wKeyboardEntrar-SEPpx, h0-SEPpx);
		autoCompleteEntrar.getDiv().absolutePosPx(w0*Config.wKeyboardEntrar, 0, w0, h0);
		autoCompleteEntrar.redraw();
		resized.divEntrar = true;
	}
	
	return my;
}

}); // Scripts.add teclaltsTpvS