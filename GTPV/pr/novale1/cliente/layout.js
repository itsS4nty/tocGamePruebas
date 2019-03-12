layoutPrincipal = function() {
	var my = {};
	var div = div100x100();
	my.menu = positionDiv(null, 0, 0, 20, 100).appendTo(div);
	my.content = positionDiv(null, 20, 0, 100, 100).appendTo(div);

/*  descomentar versión final, de momento para pruebas

	div.css({overflow: "hidden"});
	my.menu.css({overflow: "hidden"});
	my.content.css({overflow: "hidden"});
*/
	my.show = function() {
		div.appendTo("body");
		divShow(div);
	};
	my.hide = function() {
		div.hide();
	};
	return my;
}();

var heightSubMenu = function() {
	var my = {};
	
	var hPerc = 15;
	
	my.getPX = function() { return Math.round(layoutPrincipal.content.height()*(hPerc/100)); };
	my.getPerc = function() { return hPerc; }
	
	return my;		
}();

var SEP = "1em";
var SEPpx = 16;

var Resize = function() {
	var my = {};
	var funcs = [];
	
	$(window).resize(function() {
		for (var i=0; i<funcs.length; i++) funcs[i].f();
	});
	
	my.add = function(f, p) {
		if (p == null) p = 100;
		for (var i=0; i<funcs.length; i++) { if (p < funcs[i].p) break; }
		funcs.splice(i, 0, {f:f, p:p});
	}
	return my;
}();

