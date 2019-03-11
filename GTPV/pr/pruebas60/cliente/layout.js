layoutPrincipal = function() {
	var my = {};
	var div = positionDiv(null, 0, 0, 100, 100);
	my.menu = positionDiv(null, 0, 0, 20, 100).appendTo(div);
	my.content = positionDiv(null, 20, 0, 100, 100).appendTo(div);

/*  descomentar versión final, de momento para pruebas

	div.css({overflow: "hidden"});
	my.menu.css({overflow: "hidden"});
	my.content.css({overflow: "hidden"});
*/
	my.show = function() {
		div.appendTo("body");
		div.siblings().hide();
		div.show();
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

