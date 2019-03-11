// Guarda scripts como strings para enviarlos y evaluarlos a los satelites
H.Scripts = function() {
	var my = {};
	var scripts = [];

	my.baseDir = "/";
	my.extension = ".js";
	
/*	my.handlerWeb = function(path, idSat, byName) {
		var findBy = byName ? "name" : "path";
		for (var i=0; i<scripts.length; i++) {
			var file = scripts[i];
			if (file[findBy] === path) {
//				if (CH.isLocalSat(idSat)) {
//					file.func(window);
//				} 
				return file; 
			}
		}
	};
*/
	my.handlerWeb = scripts;
	
	var dummyFunc = function() {};
	
	var le = { true: [], false: []};
	my.getLocalExec = function(registered) { return le[registered]; }
	var names = { true: [], false: []};
	my.getNames = function(registered) { return names[registered]; }
	
	my.addLocalExec = function(name, func, path, registered, type, utf8) {
		var s = my.add(name, func, path, registered, type, utf8);
		s.localExec();
		s.localExec = dummyFunc;
		if (le[s.registered].indexOf(s.name) === -1) 
			le[s.registered].push(s.name);
		return s;	
	}
	
	my.add = function(name, func, path, registered, type, utf8) {
		var s = {};

		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
		s.name = name;
		s.path = path;
		s.func = func;
		s.localExec = function() { func(window); }
		s.content = "("+func.toString()+")(window);\n";
		s.registered = ((registered == null) ? true : registered);
		s.type = type || "text/javascript";
		s.utf8 = ((utf8 == null) ? true : utf8);
		var sC; 
		for (var i=0; i<scripts.length; i++) {
			sC= scripts[i];
			if ((sC.name == s.name) && (sC.path == s.path) && (sC.registered == s.registered))
				break;	
		}
		if (i < scripts.length) {
			sC.content+=s.content;
			sC.localExec = function() { 
				sC.localExec(); 
				s.localExec(); 
			}	
		} else {
			scripts.push(s);
			names[s.registered].push(s.name);
		}
		return s;
	}
 		
	return my;
}();

// manager para ficheros de scripts usados para satelites locales o externos
// tratamiento diferente para satelite local o externo
// carga scripts con <script src="filename">, no con eval para poder debugar
H.ScriptsManager = function() {
	var my = {};

	var handler = [];
	function handlerWeb(path, idSat, byName) {
		return H.Comm.findWebPage(handler, path, idSat, byName)
	}
	my.addHandlerWeb = function(h) { handler.push(h); }
	
	my.init = function() {
		H.Comm.addHandlerWeb(handlerWeb);
	}

	function getComHandler(obj) {
		return function(ret) {
		}
	}
	
	var sats = [];
	var objs = [];

	function findObj(sat) {
		var idx = sats.indexOf(sat);
		if (idx === -1) return null;
		return obj[idx];
	}
	
	my.createSat = function(sat, callback) {
		var obj = sat.createObj("scriptsManager", createObjSat, createObjHost, callback, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.loadedScripts = [];
		obj.data.comHandler = getComHandler(obj);
		//availableCommHandler(obj);		
	};

	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}

	function availableCommHandler(objSat) { // doActualizationSat
	}
	
	my.addPreLoadedScripts = function(sat, names) {
		var obj = findObj(sat);
		if (!obj) return;
		names.forEach(function(name) {
			if (obj.data.loadedScripts.indexOf(name) === -1) 
				obj.data.loadedScripts.push(name);
		});
	}
	
	my.sendScript = function(sat, names, callback) {
		var obj = findObj(sat);
		if (!obj) return;
		var reqPath = [];
		names.forEach(function(name) {
			if (obj.data.loadedScripts.indexOf(name) === -1) {
				var file = handlerWeb(name, sat.getId(), true);
				if (file) {
					if (sat.isLocal()) { 
						file.localExec(); 
					} else reqPaths.push(file.path);
					obj.data.loadedScripts.push(name);
				}
			}
		});
		if (reqPath.length === 0) setTimeout(callback, 0);
		else obj.call("load", [reqPaths], function(ret) {
			callback();
		});
	}

	function createObjHost(objSat) {
		return Object.create(null);
	}	
	
	var objSat = function(host) {
		return createScriptsManagerS(host);	
	}
	
	return my;
}();

H.Scripts.addLocalExec("ScriptsManagerS", function() {
	
window.createScriptsManagerS = function(host) {
	window.createScriptsManagerS = null; // no double initialize
	
	var comFromHost = {
		load: function(paths) {
			var asyncRet = host.getAsyncRet();
			var n = paths.length;
			function loadHandler() {
				if (--n === 0) asyncRet(true);
			}
			paths.forEach(function(path) {
				$("<script>").attr("src", path).attr("type", "text/javascript")
				             .load(loadHandler).appendTo("head");
			});
			return asyncRet;
		}
	}

	return comFromHost;
}

}); // add Scripts ScriptsManagerS


H.HtmlFiles = function() {
	var my = {};

	my.baseDir = "/";
	my.extension = ".html";
	my.scriptsExt = ".js";

	var htmlFiles = [];

	var handlersScripts = [];
	my.addHandlerScripts = function(h) {
		handlersScripts.push(h);
	}
	
	my.scriptsTag = "<!--scripts-->\n";
	my.handlerWeb = function(path, idSat, byName/*=true -> name = path */) {
		var file = H.Comm.findWebPage(htmlFiles, path, idSat, byName);	
		if (file == null) return null;
		var idxS = file.content.indexOf(my.scriptsTag);
		if (idxS == -1) return file;
		for (var i=0; i<handlersScripts.length; i++) {
			var scripts = handlersScripts[i](file, idSat);
			if (scripts != null) {
				var fileTmp = {};
				for (var prop in file) fileTmp[prop] = file[prop];
				if (scripts instanceof Array) {
					var scriptsTmp="";
					for (var i=0; i<scripts.length; i++) {
						var path= (scripts[i].charAt(0) !== "/") ? my.baseDir+scripts[i]+my.scriptsExt : scripts[i];
						scriptsTmp += '<script src="'+path+'"></script>\n'; 	
					}
					H.ScriptsManager.addPreLoadedScripts(idSat, scripts);
					scripts = scriptsTmp;
				}
				fileTmp.content = file.content.slice(0,idxS)+scripts+file.content.slice(idxS+my.scriptsTag.length);
				return fileTmp; 	
			}
		}
		return null;
	}
	
	my.add = function(path, content, registered, type, utf8) {
		var h = {};

/*		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
*/		h.name = path;
		h.path = path;
		h.content = content;
		h.registered = ((registered == null) ? true : registered);
		h.type = type || "text/html";
		h.utf8 = ((utf8 == null) ? true : utf8);
		htmlFiles.push(h);
		return h;
	}
 	
	return my;	
}();


