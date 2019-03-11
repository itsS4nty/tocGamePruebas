(function () {

window.typeApp = "local";
window.SEP = "1em";
window.SEPpx = 16;

window.layout = function() {
	var my = {};
	var div = $("<div>")._100x100();
	my.menu = $("<div>").css({position: "absolute", boxSizing: "border-box"}).appendTo(div);
	my.content = $("<div>").css({position: "absolute", boxSizing: "border-box"}).appendTo(div);

	div.css({overflow: "hidden"});
	my.menu.css({overflow: "hidden"});
	my.content.css({overflow: "hidden"});

	my.show = function() {
		div.appendTo("body");
		//divShow(div);  // no show applet
		div.show();
	};
	my.hide = function() {
		div.hide();
	};
	my.setLayout = function(posM, valDimM) {
		var aPos = ["top", "right", "bottom", "left"], aDim = ["height", "width"];
		var iPos = aPos.indexOf(posM);
		var dimM = aDim[iPos%2],
		    nPosM = aPos[(iPos+2)%4],
			xPosM = aPos[(iPos+1)%4],
			xDimM = aDim[(iPos+1)%2];
		var cssM = {}, cssC = {}, cssA = {};
		cssM[posM] = "0%";				cssM[dimM] = valDimM+"%"; 
		cssC[posM] = valDimM+"%";		cssC[nPosM] = "0%";
		cssA[xPosM] = "0%";				cssA[xDimM] = "100%";
		my.menu.css(cssM).css(cssA);
		my.content.css(cssC).css(cssA);
	}
	my.setLayout("left", 20);

	my.init = function() {
//		$(document).mousedown(function(e) { e.preventDefault(); }); // no select text
		$("body")._100x100().css({margin : "0px", overflow : "hidden"});

		(function() {
			var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
			SEPpx = testSep.outerHeight()/2;
			testSep.remove();
		})();

		my.show();
	}

	my.hSubMenuPerc = 15;

	my.getHSubMenuPx = function() { return Math.round(my.content.height()*(my.hSubMenuPerc/100)); };
	my.getHSubMenuPerc = function() { return my.hSubMenuPerc; }

	return my;
}();

})(window);
