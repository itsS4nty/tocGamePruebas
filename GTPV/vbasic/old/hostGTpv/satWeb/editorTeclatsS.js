(function () {
	
window.AppEditorTeclats = function() {
	var my = {}

	var S = {};
	
	var div0 = $("<div>")._100x100();
	
	var dialog = newAlertDialog().appendTo(div0);
	
	function showDialogAmbientYaExiste(text) {
		dialog.header(M("Error")).text(text)
		      .setButtons([M("Ok")], function(text, i) { redrawT(false); })
			  .show();
	}		  

	function showDialogBorrarAmbient(text) {
		dialog.header(M("Borrar?")).text(text)
	          .setButtons([M("Ok"), M("Cancel")], 
				  function(text, i) { 
					  if (i==0) { // OK
						  Teclats.delAmbient(teclatsTpv.getAmbientActual());
					  } 
					  redrawT(true);
	           }).show();
	}

	
	function setArtSelected(data) {
		S.artSelected = data;
		teclatsTpv.setCursorArticles((data == null) ? "auto" : "move");
	}
	
	var divEditor = $("<div>")._100x100().addClass("g-widget-content").appendTo(div0); 
	
	var divT = $("<div>").css({ position: "relative" }).appendTo(divEditor);
	var teclatsTpv = newSubAppTeclatsTpv();
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
				if (S.artSelected.codi != null) showColorDiv(but);
			} else {
				Teclats.changeArticle(S.artSelected, data, codiDep);
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
				var newAmb = Teclats.getAmbient(inp);
				if (newAmb != null) {
					dialogAmbientYaExiste.text(M("ambient ")+inp+M(" ja existeix")).show();
				} else {
					if (S.estado == "addGrup") {
						Teclats.addAmbient(inp, codiDep);
						teclatsTpv.setAmbientActual(inp);
					}
					if (S.estado == "renGrup") {
						Teclats.renAmbient(teclatsTpv.getAmbientActual(), inp, codiDep);
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
		hAmbientsTeclats : 0.75
	}

	function clickButsCol(e) {
		if (e.button !== 0) return;
		function getN(cssV) { return cssV.getFloatValue(cssV.CSS_NUMBER); }
		var rgb = window.getComputedStyle(this).getPropertyCSSValue("background-color").getRGBColorValue();
		var color = getN(rgb.red)*256*256+getN(rgb.green)*256+getN(rgb.blue);
		Teclats.changeColorArticle(S.artSelected, color, codiDep);
		setArtSelected(null);
		redrawT(false);
	}
	var selColorDiv = $("<div>")._100x100().css({ padding: SEP }).addClass("g-widget-content").appendTo(divT); 
	var selColorDiv2 = $("<div>").css({ position: "relative", height: "100%"}).appendTo(selColorDiv);
	var divSelColorModel = $("<div>").css({ padding: SEP, textAlign: "center" }).appendTo(selColorDiv2);
	var butsCol = []; 
	for (var y=0; y<8; y++) {
		for (var x=0; x<8; x++) {
			butsCol.push(gButton().css({ position: "absolute", backgroundColor: "hsl("+(y*8+x)*360/(8*8)+",100%,50%)" })
			                          .click(clickButsCol).appendTo(selColorDiv2)
						);
		}
	}

	function showColorDiv(model) {
		var w = model.oWidth(), h = model.oHeight();
		selColorDiv.showAlone();
		divSelColorModel.empty();
		var currentModel = model.clone(false).css({ position: "static", cursor: "auto", height: "100%" })
		                                     .appendTo(divSelColorModel)
										     .click(function(e) { 
											      if (e.button !== 0) return; 
											      setArtSelected(null); 
											      redrawT(false); 
											 });
		currentModel.width((w/currentModel.parent().oWidth())*100+"%");
		divSelColorModel.height((h/divSelColorModel.parent().oHeight())*100+"%");
		resize();
	}



	var divAccions = $("<div>").css({ position: "relative" }).appendTo(divEditor); 
	divAccions.css({ boxSizing: "border-box", textAlign: "center" });
	function showKeyboard(inputVal) {
		divK.showAlone();
		input.val(inputVal);
		keyboard.reset();
		resize();
	}
	
	function butAccionsHandler(e) {
		if (e.button !== 0) return;
		divAccions.children().removeClass("g-state-active");
		switch ($(this).data("data")) {
			case "addGrup" :
				$(this).addClass("g-state-active");
				S.estado = "addGrup";
				setArtSelected(null);
				showKeyboard("");
				break;
			case "renGrup" :
				if (teclatsTpv.getAmbientActual() != null) {
					$(this).addClass("g-state-active");
					S.estado = "renGrup";
					setArtSelected(null);
					showKeyboard(teclatsTpv.getAmbientActual());
				} 
				break;
			case "delGrup" :
				setArtSelected(null);
				redrawT(true);
				if (teclatsTpv.getAmbientActual() != null) {
					$(this).addClass("g-state-active");
					dialogBorrarAmbient.text(M("Borrar Grup ")+teclatsTpv.getAmbientActual()+" ?").show();
				} 
				break;
			case "delArticle" :
				if (S.artSelected != null) {
					Teclats.delArticle(S.artSelected);
					S.teclat.estado = null;
					setArtSelected(null);
					redrawT(false);
				}
				break;
		}
	}

	var butBuscarArticle = teclatsTpv.getButtonBuscarArticle();
	butBuscarArticle.css({ width: "15%", height: "100%", margin: "0 "+SEP })
	                .addClass("g-state-default ui-corner-all").appendTo(divAccions);
	butBuscarArticle.click(function(e) {
		if (e.button !== 0) return;
		teclatsTpv.getDiv().showAlone();
		divAccions.children().removeClass("g-state-active");
		butBuscarArticle.addClass("g-state-active");
	});
	var butAddGrup = gButton().data("data", "addGrup");
	var butModGrup = gButton().data("data", "renGrup");
	var butDelGrup = gButton().data("data", "delGrup");
	var butDelArticle = gButton().data("data", "delArticle");
	
	[butAddGrup, butModGrup, butDelGrup, butDelArticle].forEach(function(el) {
		el.css({ width: "15%", height: "100%", margin: "0 "+SEP }).addClass("g-state-default ui-corner-all")
		  .click(butAccionsHandler).appendTo(divAccions);
	});

	var resized = {};
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		S.teclat = {};
		S.artSelected = null;
		Resize.add(function() {
			resized = {};
			resize(); 
			if (dialog.getDiv().isVisible()) dialog.show(); 
		});
		teclatsTpv.init();
	};

	var mp;
	var codiDep;
	my.start = function(_mp) {
		mp = _mp;
		codiDep = mp.getCodiDepActual();
		S.artSelected = null;
		div0.showAlone();
//		S.estado = null;
//		S.teclat.estado = null;
		divEditor.showAlone();
//		divShow(teclatsTpv.getDiv());
//		teclatsTpv.redraw(S.teclat);
		redrawT(true);
	};

	function resize() {
		if (!divEditor.isVisible()) return; 
		teclatsTpv.redrawButtonBuscarArticle();
		butAddGrup.text(M("Nou Grup"));
		butModGrup.text(M("Renombrar Grup"));
		butDelGrup.text(M("Borrar Grup"));
		butDelArticle.text(M("Borrar Article"));
		
		var wDC = divEditor.width(), hDC = divEditor.height();
		
		divT.height(teclatsTpv.preferedHeight(Math.round(Config.hAmbientsTeclats*hDC)));
		
		if ((teclatsTpv.getDiv().isVisible()) && (!resized.divTeclats)) {
			teclatsTpv.resize();
			resized.divTeclats = true;
		}
		if ((divK.isVisible()) && (!resized.divK)) {
			var hInput = input.parent().oHeight();
			keyboard.absolutePosPx(0, hInput, divK.iWidth(), divK.iHeight());
			resized.divK = true;
		}
		if (selColorDiv.isVisible()) {
			var x0 = 0, y0 = divSelColorModel.oHeight(); 
			var w0 = selColorDiv2.oWidth(), h0 = selColorDiv2.oHeight()-y0;
			if (w0 > h0) {
				x0 += Math.round((w0-h0)/2);
				w0 = h0;	
			} else {
				y0 += Math.round((h0-w0)/2);
				h0 = w0;
			}
			for (var i=0, y=0; y<8; y++) {
				for (var x=0; x<8; x++, i++) {
					butsCol[i].absolutePosPx(x0+(x*(w0+2)/8), y0+(y*(h0+2)/8),
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
		teclatsTpv.getDiv().showAlone();
		setArtSelected(S.artSelected);
		/*if (fAll)*/ teclatsTpv.start(S.teclat);
		/*else teclatsTpv.redrawTeclat();*/
		divAccions.children().removeClass("g-state-active");
		if ((S.artSelected != null) && (S.artSelected.codi != null) && (S.artSelected.pos != null)) {
			butDelArticle.removeAttr("disabled");
		} else butDelArticle.attr("disabled", "disabled");
		resize();
	}
	
	return my;
}();

})(window);
