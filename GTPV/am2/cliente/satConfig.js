H.SatConfig = function() {
	var my = {};
	
	my.init = function(callbackInit) {
		if (callbackInit != null) callbackInit();
	}

	function getComHandler(obj) {
		return function(ret) {
		}
	}
	
	var sats = [];
	var objs = [];
	
	my.createSat = function(sat, callback) {
		var obj = sat.createObj("SatConfig", createObjSat, createObjHost, 
			function() { // callback asincrono
				my.refreshConfig(sat, callback);
			});
		sats.push(sat);
		objs.push(obj);
	};
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	
	my.refreshConfig = function(sat, callback) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			var obj = objs[idx];
			obj.call("refreshConfig", null, function(config) {
				obj.data.config = config;
				if (callback) callback();
			});
		} else if (callback) callback();
	}	
	
	my.getConfig = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			var obj = objs[idx];
			return obj.data.config;
		}
	}
	
	function createObjHost(objSat) {
		return $.extend(Object.create(null), {
		});
	}
	
	var createObjSat = function(host) {
		return createSatConfigS(host);	
	}
	
	return my;
}();


H.Scripts.add("SatConfigS", "L2C", function() {

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
}); // add Scripts datosArticlesS

