addScript("layout", function(window) {

window.layoutPrincipal = function() {
	var my = {};
	var div = div100x100();
	my.menu = $("<div>").css({position: "absolute", boxSizing: "border-box"}).appendTo(div);
	my.content = $("<div>").css({position: "absolute", boxSizing: "border-box"}).appendTo(div);

/*  descomentar versión final, de momento para pruebas

	div.css({overflow: "hidden"});
	my.menu.css({overflow: "hidden"});
	my.content.css({overflow: "hidden"});
*/
	my.show = function() {
		div.appendTo("body");
		//divShow(div);  // no show applet
		div.show();
	};
	my.hide = function() {
		div.hide();
	};
	my.setLayout = function(posM, dimM) {
		var aPos = ["top", "right", "bottom", "left"], aDim = ["height", "width"];
		var iPos = aPos.indexOf(posM);
		var cssM = {}, cssC = {}, cssA = {};
		cssM[posM] = "0%";				cssM[aDim[iPos%2]] = dimM+"%"; 
		cssC[posM] = dimM+"%";			cssC[aDim[(iPos+1)%2]] = "100%";
		cssA[aPos[(iPos+1)%4]] = "0%";	cssA[aDim[(iPos+1)%2]] = "100%";
		my.menu.css(cssM).css(cssA);
		my.content.css(cssC).css(cssA);
	}
	my.setLayout("left", 20);
	return my;
}();

window.heightSubMenu = function() {
	var my = {};
	
	var hPerc = 15;
	
	my.getPX = function() { return Math.round(layoutPrincipal.content.height()*(hPerc/100)); };
	my.getPerc = function() { return hPerc; }
	
	return my;		
}();

window.SEP = "1em";
window.SEPpx = 16;

div100x100($("body")).css({margin : "0px"}).addClass("ui-widget");

(function() {
	var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
	SEPpx = testSep.outerHeight()/2;
	testSep.remove();
})()

layoutPrincipal.show();

function onbeforeunloadHandler() {
	return "Salir de GTPV?";
}

window.onbeforeunload = onbeforeunloadHandler;

window.Resize = function() {
	var my = {};
	var funcs = [];
	
	$(window).resize(function() {
		my.resize();
	});
	
	my.add = function(f, p) {
		if (p == null) p = 100;
		for (var i=0; i<funcs.length; i++) { if (p < funcs[i].p) break; }
		funcs.splice(i, 0, {f:f, p:p});
	}
	my.resize = function() {
		for (var i=0; i<funcs.length; i++) funcs[i].f();
	}
	return my;
}();

});
