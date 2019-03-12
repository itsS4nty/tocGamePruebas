(function () {

/*window.onbeforeunload = function () {
	return "Salir de GTPV?";
};*/

window.Resize = function() {
	var my = {};
	var funcs = [];
	
	$(window).resize(function() {
		my.resize();
	});
	
	my.add = function(f, p) { // p: orden prioridad, primero resize menor orden
		if (p == null) p = 100;
		for (var i=0; i<funcs.length; i++) { if (p < funcs[i].p) break; }
		funcs.splice(i, 0, {f:f, p:p});
	}
	my.resize = function() {
		for (var i=0; i<funcs.length; i++) funcs[i].f();
	}
	return my;
}();

window.setTitle = function() {
	window.parent.postMessage({type: "title", value: document.title}, "*");
}

})(window);
