procesoEditorTeclats = function() {
	var my = {}

	var S = {};
	
	var div0 = positionDiv(null,0,0,100,100);
	
	var dialogAmbientYaExiste = createAlertDialog().header("Error")
	                                               .setButtons(["Ok"], function(text, i) { 
	                                                   S.estado = null;
	                                                   redraw();
	                                                });
	dialogAmbientYaExiste.getDiv().appendTo(div0);
	var dialogBorrarAmbient = createAlertDialog().header("Error")
	                                             .setButtons(["Ok", "Cancel"], function(text, i) { 
													if (text=="Ok") {
														DatosArticles.delAmbient(S.delAmbient);
													}	
													S.delAmbient = null;
													S.estado = null;
													redraw();
	                                             });
	dialogBorrarAmbient.getDiv().appendTo(div0);
	
	var divEditor = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(div0); 
	
	var divT = $("<div>").css({ position: "relative" }).appendTo(divEditor);
	var teclatsTpv = newDivTeclatsTpv();
	teclatsTpv.getDiv().appendTo(divT);
	teclatsTpv.displayEmptyArticles = true;
	
	teclatsTpv.clickAmbientHandler = function(data) {};

	teclatsTpv.selectedArticleHandler = function(data, but) {
		if (S.artSelected == null) {
			S.artSelected = data;
			S.teclat.estado = null;
			redraw();
		} else {
			if ((S.artSelected.pos == null) && (data.pos == null)) {
				S.artSelected = data;
			} else if (S.artSelected == data) { 
				showColorDiv(but);
			} else {
				DatosArticles.changeArticleTeclat(S.artSelected, data);
				S.artSelected = null;
				S.teclat.estado = null;
				redraw();
			}
		}
	};
	
	var divK = $("<div>").css({ position: "relative", height: "100%" }).appendTo(divT);
	var input = $("<input>").css({ width: "70%"}).appendTo(
		$("<div>").css({ padding: "1em 0", textAlign: "center" }).appendTo(divK)
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
					S.teclat.estado = null;
					redraw();
				}
				break;
			case "cancel":
				redraw();
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
		S.artSelected = null;
		redraw();
	}
	var selColorDiv = positionDiv(null,0,0,100,100).css({ padding: "1em" }).addClass("ui-widget-content").appendTo(divT); 
	var selColorDiv2 = $("<div>").css({ position: "relative", height: "100%"}).appendTo(selColorDiv);
	var divSelColorModel = $("<div>").css({ padding: "1em", textAlign: "center" }).appendTo(selColorDiv2);
	var butsCol = []; 
	for (var y=0; y<8; y++) {
		for (var x=0; x<8; x++) {
			butsCol.push($("<button>").css({ position: "absolute", backgroundColor: "hsl("+(y*8+x)*360/(8*8)+",100%,50%)" })
			                          .click(clickButsCol).appendTo(selColorDiv2)
						);
		}
	}

	function showColorDiv(model) {
		selColorDiv.siblings().hide();
		selColorDiv.show();
		divSelColorModel.empty();
		var modelColorDiv = model.clone(false).css({ position: "static" })
		                                      .appendTo(divSelColorModel)
											  .click(function(e) { S.artSelected=null; redraw(); });
		setOW(modelColorDiv, getOW(model));
		setOH(modelColorDiv, getOH(model));
		resize();
	}



	var divAccions = $("<div>").css({ position: "relative" }).appendTo(divEditor); 
	divAccions.css({ boxSizing: "border-box", textAlign: "center" });
	function showKeyboard(inputVal) {
		divK.siblings().hide();
		divK.show();
		input.val(inputVal);
		keyboard.reset();
		resize();
	}
	
	function butAccionsHandler(e) {
		divAccions.children().removeClass("ui-state-active");
		$(this).addClass("ui-state-active");
		switch ($(this).data("data")) {
			case "addGrup" :
				showKeyboard("");
				break;
			case "renGrup" :
				showKeyboard(teclatsTpv.getAmbientActual());
				break;
			case "delGrup" :
				S.delAmbient = teclatsTpv.getAmbientActual();
				dialogBorrarAmbient.text("Borrar Grup "+S.delAmbient+" ?").show();
				break;
			case "delArticle" :
				divAccions.children().removeClass("ui-state-active");
				if (S.artSelected != null) {
					DatosArticles.delArticleTeclat(S.artSelected);
					S.artSelected = null;
					S.teclat.estado = null;
					redraw();
				}
				break;
		}
	}

	teclatsTpv.getButtonBuscarArticle().css({ width: "15%", height: "100%", margin: "0 1em" })
	                                   .addClass("ui-state-default ui-corner-all").appendTo(divAccions);
	var butAddGrup = $("<button>").text("Nou Grup").data("data", "addGrup");
	var butModGrup = $("<button>").text("Renombrar Grup").data("data", "renGrup");
	var butDelGrup = $("<button>").text("Borrar Grup").data("data", "delGrup");
	var butDelArticle = $("<button>").text("Borrar Article").data("data", "delArticle");
	
	[butAddGrup, butModGrup, butDelGrup, butDelArticle].forEach(function(el) {
		el.css({ width: "15%", height: "100%", margin: "0 1em" }).addClass("ui-state-default ui-corner-all")
		  .click(butAccionsHandler).appendTo(divAccions);
	});

	var fResize = {};
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		teclatsTpv.init();
		S.teclat = {};
		$(window).resize(function() {
			fResize = {};
			if (isDivVisible(divEditor)) resize(); 
			if (isDivVisible(dialogAmbientYaExiste.getDiv())) dialogAmbientYaExiste.show(); 
			if (isDivVisible(dialogBorrarAmbient.getDiv())) dialogBorrarAmbient.show(); 
			});
	};
	my.start = function(dep) {
		div0.siblings().hide();
		div0.show();
		S.teclat.estado = null;
		divEditor.siblings().hide();
		divEditor.show();
		teclatsTpv.getDiv().siblings().hide();
		teclatsTpv.getDiv().show();
		teclatsTpv.redraw(S.teclat);
		redraw();
	};

	function resize() {
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
	function redraw() {
		teclatsTpv.getDiv().siblings().hide();
		teclatsTpv.getDiv().show();
		teclatsTpv.setAmbientActual(teclatsTpv.getAmbientActual());
		divAccions.children().removeClass("ui-state-active");
		resize();
	}
	
	return my;
}();

