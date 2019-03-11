procesoEditorTeclats = function() {
	var my = {}

	var S = {};
	
	var div0 = positionDiv(null,0,0,100,100);
	
	var dialogAmbientYaExiste = createAlertDialog().header("Error")
	                                               .setButtons(["Ok"], function(text, i) { 
	                                                   redrawT(false);
	                                                });
	dialogAmbientYaExiste.getDiv().appendTo(div0);
	var dialogBorrarAmbient = createAlertDialog().header("Borrar")
	                                             .setButtons(["Ok", "Cancel"], function(text, i) { 
													if (text=="Ok") {
														DatosArticles.delAmbient(teclatsTpv.getAmbientActual());
													}	
													redrawT(true);
	                                             });
	dialogBorrarAmbient.getDiv().appendTo(div0);

	function setArtSelected(data) {
		S.artSelected = data;
		teclatsTpv.setCursorArticles((data == null) ? "auto" : "move");
	}
	
	var divEditor = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(div0); 
	
	var divT = $("<div>").css({ position: "relative" }).appendTo(divEditor);
	var teclatsTpv = newDivTeclatsTpv();
	teclatsTpv.getDiv().appendTo(divT);
	teclatsTpv.displayEmptyArticles = true;
	
	teclatsTpv.clickAmbientHandler = function(data) {};

	teclatsTpv.selectedArticleHandler = function(data, but) {
		if (teclatsTpv.getAmbientActual() == null) {
			redrawT(true);
			return;
		}
		if (S.artSelected == null) {
			setArtSelected(data);
			redrawT(false);
		} else {
			if ((S.artSelected.pos == null) && (data.pos == null)) {
				setArtSelected(data);
			} else if (S.artSelected == data) { 
				if (S.artSelected.article != null) showColorDiv(but);
			} else {
				DatosArticles.changeArticleTeclat(S.artSelected, data);
				S.teclat.estado = null;
				setArtSelected(null);
				redrawT(false);
			}
		}
	};
	
	var divK = $("<div>").css({ position: "relative", height: "100%" }).appendTo(divT);
	var input = $("<input>").css({ width: "70%"}).appendTo(
		$("<div>").css({ padding: SEP+" 0", textAlign: "center" }).appendTo(divK)
	);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divK);
	keyboard.setInput(input);
	keyboard.setCallback(function(m) {
		switch(m) {
			case "enter":
				var inp = input.val();
				var newAmb = DatosArticles.getAmbient(inp);
				if (newAmb != null) {
					dialogAmbientYaExiste.text("ambient "+inp+" ja existeix").show();
				} else {
					if (S.estado == "addGrup") {
						DatosArticles.addAmbient(inp);
						teclatsTpv.setAmbientActual(inp);
					}
					if (S.estado == "renGrup") {
						DatosArticles.renAmbient(teclatsTpv.getAmbientActual(), inp);
						teclatsTpv.setAmbientActual(inp);
					}
					redrawT(true);
				}
				break;
			case "cancel":
				redrawT(false);
				break;
		}
	});
	var Config = {
//		hAmbients : 0.15,
//		hTeclado : 0.6,
		hAmbientsTeclats : 0.75,
	}

	function clickButsCol(e) {
		function getN(cssV) { return cssV.getFloatValue(cssV.CSS_NUMBER); }
		var rgb = window.getComputedStyle(this).getPropertyCSSValue("background-color").getRGBColorValue();
		var color = getN(rgb.red)*256*256+getN(rgb.green)*256+getN(rgb.blue);
		DatosArticles.changeColorArticleTeclat(S.artSelected, color); 
		setArtSelected(null);
		redrawT(false);
	}
	var selColorDiv = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(divT); 
	var selColorDiv2 = $("<div>").css({ position: "relative", height: "100%"}).appendTo(selColorDiv);
	var divSelColorModel = $("<div>").css({ padding: SEP, textAlign: "center" }).appendTo(selColorDiv2);
	var butsCol = []; 
	for (var y=0; y<8; y++) {
		for (var x=0; x<8; x++) {
			butsCol.push($("<button>").css({ position: "absolute", backgroundColor: "hsl("+(y*8+x)*360/(8*8)+",100%,50%)" })
			                          .click(clickButsCol).appendTo(selColorDiv2)
						);
		}
	}

	function showColorDiv(model) {
		divShow(selColorDiv);
		divSelColorModel.empty();
		var modelColorDiv = model.clone(false).css({ position: "static", cursor: "auto" })
		                                      .appendTo(divSelColorModel)
											  .click(function(e) { setArtSelected(null); redrawT(false); });
		setOW(modelColorDiv, getOW(model));
		setOH(modelColorDiv, getOH(model));
		resize();
	}



	var divAccions = $("<div>").css({ position: "relative" }).appendTo(divEditor); 
	divAccions.css({ boxSizing: "border-box", textAlign: "center" });
	function showKeyboard(inputVal) {
		divShow(divK);
		input.val(inputVal);
		keyboard.reset();
		resize();
	}
	
	function butAccionsHandler(e) {
		divAccions.children().removeClass("ui-state-active");
		switch ($(this).data("data")) {
			case "addGrup" :
				$(this).addClass("ui-state-active");
				S.estado = "addGrup";
				setArtSelected(null);
				showKeyboard("");
				break;
			case "renGrup" :
				if (teclatsTpv.getAmbientActual() != null) {
					$(this).addClass("ui-state-active");
					S.estado = "renGrup";
					setArtSelected(null);
					showKeyboard(teclatsTpv.getAmbientActual());
				} 
				break;
			case "delGrup" :
				setArtSelected(null);
				if (teclatsTpv.getAmbientActual() != null) {
					$(this).addClass("ui-state-active");
					dialogBorrarAmbient.text("Borrar Grup "+teclatsTpv.getAmbientActual()+" ?").show();
				} 
				break;
			case "delArticle" :
				if (S.artSelected != null) {
					DatosArticles.delArticleTeclat(S.artSelected);
					S.teclat.estado = null;
					setArtSelected(null);
					redrawT(false);
				}
				break;
		}
	}

	teclatsTpv.getButtonBuscarArticle().css({ width: "15%", height: "100%", margin: "0 "+SEP })
	                                   .addClass("ui-state-default ui-corner-all").appendTo(divAccions);
	var butAddGrup = $("<button>").text("Nou Grup").data("data", "addGrup");
	var butModGrup = $("<button>").text("Renombrar Grup").data("data", "renGrup");
	var butDelGrup = $("<button>").text("Borrar Grup").data("data", "delGrup");
	var butDelArticle = $("<button>").text("Borrar Article").data("data", "delArticle");
	
	[butAddGrup, butModGrup, butDelGrup, butDelArticle].forEach(function(el) {
		el.css({ width: "15%", height: "100%", margin: "0 "+SEP }).addClass("ui-state-default ui-corner-all")
		  .click(butAccionsHandler).appendTo(divAccions);
	});

	var fResize = {};
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		teclatsTpv.init();
		S.teclat = {};
		S.artSelected = null;
		Resize.add(function() {
			fResize = {};
			resize(); 
			if (isDivVisible(dialogAmbientYaExiste.getDiv())) dialogAmbientYaExiste.show(); 
			if (isDivVisible(dialogBorrarAmbient.getDiv())) dialogBorrarAmbient.show(); 
			});
	};
	var dep;
	my.start = function(_dep) {
		dep = _dep;
		S.artSelected = null;
		divShow(div0);
//		S.estado = null;
//		S.teclat.estado = null;
		divShow(divEditor);
//		divShow(teclatsTpv.getDiv());
//		teclatsTpv.redraw(S.teclat);
		redrawT(true);
	};

	function resize() {
		if (!isDivVisible(divEditor)) return; 
		var wDC = divEditor.width(), hDC = divEditor.height();
		
		divT.height(Math.round(Config.hAmbientsTeclats*hDC));
		
		if ((isDivVisible(teclatsTpv.getDiv())) && (fResize.divTeclats !== false)) {
			teclatsTpv.resize();
			fResize.divTeclats = false;
		}
		if ((isDivVisible(divK)) && (fResize.divK !== false)) {
			var hInput = getOH(input.parent());
			positionKeyboard(keyboard, 0, hInput, getIW(divK), getIH(divK));
			fResize.divK = false;
		}
		if (isDivVisible(selColorDiv)) {
			var x0 = 0, y0 = getOH(divSelColorModel); 
			var w0 = getOW(selColorDiv2), h0 = getOH(selColorDiv2)-y0;
			if (w0 > h0) {
				x0 += Math.round((w0-h0)/2);
				w0 = h0;	
			} else {
				y0 += Math.round((h0-w0)/2);
				h0 = w0;
			}
			for (var i=0, y=0; y<8; y++) {
				for (var x=0; x<8; x++, i++) {
					posAbsolutePX(butsCol[i], x0+(x*(w0+2)/8), y0+(y*(h0+2)/8),
					                          x0+((x+1)*(w0+2)/8)-2, y0+((y+1)*(h0+2)/8)-2);
				}
			}
		}
		var hAcc = hDC-Math.round(Config.hAmbientsTeclats*hDC), padAcc = Math.round(hAcc*0.10);
		divAccions.css({ padding: padAcc+"px 0px" });
		divAccions.height(hAcc);
	}
	function redrawT(fAll) {
		S.estado = null;
		S.teclat.estado = null;
		divShow(teclatsTpv.getDiv());
		setArtSelected(S.artSelected);
		if (fAll) teclatsTpv.redraw(S.teclat);
		else teclatsTpv.redrawTeclat();
		divAccions.children().removeClass("ui-state-active");
		resize();
	}
	
	return my;
}();

