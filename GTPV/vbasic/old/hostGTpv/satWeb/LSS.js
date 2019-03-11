(function () {

window.LS = function () {
	var my = {};
	var prefijo = "";

	my.error = false;
	
	my.init = function(_prefijo) {
		prefijo = _prefijo; 
	}
	my.get = function(name) {
		var value = localStorage.getItem(prefijo+name);
		if (typeof value == "string") {
			try {
				return JSON.parse(value);	
			} catch(e) {
				my.error = true;
				my.errorValue = value;
			}
		}
		return null;
	}
	my.set = function(name, value) {
		if (value === undefined) {
//			my.remove(name);
			localStorage.removeItem(prefijo+name);	
		} else {
			localStorage.setItem(prefijo+name, JSON.stringify(value));
		}
	}
	my.remove = function(name) {
		localStorage.removeItem(prefijo+name);	
	}
	 function errorQuota(e) {
		var alertErrorDB = newAlertDialog().header(M("Error")).text(M("Error en base de datos")+": "+M("Quota LS"));
		alertErrorDB.appendTo("body").show();
	}
	my.save = function(name, value) {
		try {
			my.set(name, value);
		} catch(e) {
			errorQuota(e);
		}
	}
	return my;	
}();

})(window);
