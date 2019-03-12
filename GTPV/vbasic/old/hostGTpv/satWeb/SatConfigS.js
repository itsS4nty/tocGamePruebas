(function () {

window.createSatConfigS = function(host) {
	window.createSatConfigS  = null; // no double initialize

	var my = {};
	
	var comHostToSat = {
		refreshConfig: function() {
			return { typeApp: window.typeApp };
		}
	}
	return comHostToSat;
}
})(window);
