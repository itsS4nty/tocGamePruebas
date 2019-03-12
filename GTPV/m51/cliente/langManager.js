H.Scripts.add("langManagerS", "L2", function(window) {

window.AppLangManager = function() {
	var my = {};

	var div0 = $("<div>")._100x100();
	
	var divM = $("<div>")._100x100().addClass("g-widget-content").appendTo(div0);

	var langNames;
	var selectedL;
	
	var paramsLangsScroll = {
		arrows : "_ud",
		getNItems : function() { return langNames.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementLangs;
			var lang = langNames[idx];
			var el = langsModel.clone(true).text(lang);
			if (lang === selectedL) {
				el.addClass("g-state-active");
			}
			return el;
		},
	};

	var langsModel = gButton().addClass("g-state-default");

	var defaultElementLangs = langsModel.clone(false).html("X<br>X"); 
	var langsScroll = newGScroll(paramsLangsScroll);
	langsScroll.getDiv().css({ padding: SEP });
	langsScroll.getDiv().absolutePos(20, 20, 60, 80).appendTo(divM);
	
	langsModel.click(function (e) {
		if (e.button !== 0) return;
		selectedL = $(this).text();
		langsScroll.redraw(langNames.indexOf(selectedL));
	});
	
	var divButtons = $("<div>").css({ position: "absolute", right : "0px", bottom : "0px", padding: SEP, width: "30%"})
	                           .appendTo(divM);
	var butSel = gButton().css({width: "100%"}).appendTo(divButtons)
							  .click( function (e) {
										if (e.button !== 0) return;
										LS.set("lang", selectedL);
										messages.setLang(selectedL);
										mp.finApp();
									});
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
	}

	var mp;
	
	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
		divM.showAlone();
		butSel.text(M("Seleccionar"));
		langNames = messages.getLangNames();
		selectedL = LS.get("lang");	
		if (langNames.indexOf(selectedL) === -1) selectedL = langNames[0]; 
		langsScroll.redraw(langNames.indexOf(selectedL));
	}
	
	return my;
}();

}); // add scripts langManagerS
