(function () {

window.typeApp = "camarero";
window.SEP = "1em";
window.SEPpx = 16;

window.cam_layout = function() {
	var my = {};
	var div = $("<div>")._100x100();
	my.div = div;
	
	div.css({overflow: "hidden"});

	my.show = function() {
		div.appendTo("body");
		//divShow(div);  // no show applet
		div.show();
	};
	my.hide = function() {
		div.hide();
	};

	my.init = function() {
//		$(document).mousedown(function(e) { e.preventDefault(); }); // no select text
		$("body")._100x100().css({margin: "0px", overflow: "hidden", fontSize: "200%"});

		(function() {
			var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
			SEPpx = testSep.outerHeight()/2;
			testSep.remove();
		})();

		my.show();
	}

	return my;
}();

})(window);
