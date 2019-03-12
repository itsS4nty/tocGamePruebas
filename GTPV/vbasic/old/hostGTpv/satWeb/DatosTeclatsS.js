(function () {

window.createTeclatsS = function(host) {
	window.createTeclatsS  = null; // no double initialize

	var my = {};
	window.Teclats = my;
	
	var datosTeclats = [];
	var changeHandlers = [];

	function runChangeHandlers() {
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(version); });
		},0);	
	}
	
	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}
	function getSortFunction(propName) {
		return function(a,b) { a=a[propName]; b=b[propName]; return ((a < b) ? -1 : ((a > b)?1:0)); }	
	}
	function getToLowerSortFunction(propName) {
		return function(a,b) { 
			a=a[propName].toLowerCase(); b=b[propName].toLowerCase(); 
			return ((a < b) ? -1 : ((a > b)?1:0)); 
		}	
	}
	my.getAmbient = function(ambient) {
		for (var i=0; i<datosTeclats.length; i++) {
			if (datosTeclats[i].ambient === ambient) {
				return datosTeclats[i];
			}
		}
		return null;
	}
	my.getAmbientByIndex = function(idx) { return datosTeclats[idx]; }
	my.getAmbients = function() { 
		return datosTeclats.map(function(amb) { return amb.ambient; });  
	}
	
	function getOrNewAmbient(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) {
			t = {ambient: ambient, buttons: []};
			datosTeclats.push(t);
		}
		return t;
	}
		
	my.addAmbient = function(ambient, codiDep) {
		var t =	my.getAmbient(ambient);
		if (t != null) return;
		var but = { ambient: ambient, pos: 0, codi: null, color: 0 };
		my.addArticle(but, codiDep);
	}	
	
	my.renAmbient = function(oldAmbient, newAmbient, codiDep) {
		var t =	my.getAmbient(oldAmbient);
		if (t == null) return;
		t.ambient = newAmbient;
		t.buttons.forEach(function(el) { el.ambient = newAmbient; });
		datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
		callHost("renAmbient", [oldAmbient, newAmbient, codiDep]);
	}

	my.delAmbient = function(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) return;
		datosTeclats.splice(datosTeclats.indexOf(t), 1);
		callHost("delAmbient", [ambient]);
	}
	
	my.addArticle = function(but, codiDep) {
		var t = getOrNewAmbient(but.ambient);
		t.buttons[but.pos] = but;
		datosTeclats = datosTeclats.sort(getToLowerSortFunction("ambient"));
		callHost("addArticle", [but, codiDep]);
	}
	
	my.getArticle = function(ambient, pos) {
		var t = my.getAmbient(ambient);
		if (t != null) return t.buttons[pos];
		else return null;
	}
	
	my.delArticle = function(but) {
		if ((but.pos == null) || (but.codi == null)) { callback(); return; }
		var t = my.getAmbient(but.ambient);
		if (t != null) { delete t.buttons[but.pos]; }
		callHost("delArticle", [but]);
	}
	
	my.changeArticle = function(but1, but2, codiDep) {
		var t1,t2;
		if (but1.pos != null) { t1 = my.getAmbient(but1.ambient); }
		if (but2.pos != null) { t2 = my.getAmbient(but2.ambient); }
		if (t1 != null) { t1.buttons[but1.pos] = $.extend({}, but2, {ambient: but1.ambient, pos: but1.pos}); }
		if (t2 != null) { t2.buttons[but2.pos] = $.extend({}, but1, {ambient: but2.ambient, pos: but2.pos}); }
		callHost("changeArticle", [but1, but2, codiDep]);
	}

	my.changeColorArticle = function(but, color, codiDep) {
		var t = my.getAmbient(but.ambient);
		if (t == null) return;
		t.buttons[but.pos] = $.extend({}, but, { color: color });
		callHost("changeColorArticle", [but, color, codiDep]);
	}
	
	var nWaits = 0;
	var waitVersion = 0;
	function waitFunction(versionH) {
		nWaits--;
		waitVersion = versionH;
		processActData();
	}
	function getWaitFunction() {
		nWaits++;
		return waitFunction;
	}
	var actData = { version: -1 };
	function processActData() {
		if (nWaits > 0) return false;
		if (actData.version >= waitVersion) {
			datosTeclats = actData.datosTeclats;
			datosTeclats.forEach(function(amb) {
				for (var i=0; i<amb.buttons.length; i++) {
					if (amb.buttons[i] != null) {
						amb.buttons[i].ambient = amb.ambient;
						amb.buttons[i].pos = i;
					}
				}
			})
			version = actData.version;
			actData = { version: -1 };
			runChangeHandlers();
			return true;
		}
		return false;		
	}

	var version = 0;
	function callHost(func, args) {
		version++;
		args.push(version);
		host.call(func,args,getWaitFunction());
		runChangeHandlers();
		return version;
	}
	
	var comHostToSat = {
		actualize: function(_datosTeclats, _version) {
			actData.datosTeclats = _datosTeclats;
			actData.version = _version;
			return processActData();
		}
	}
	return comHostToSat;
}
})(window);
