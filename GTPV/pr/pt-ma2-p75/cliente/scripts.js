// Guarda scripts como strings para enviarlos y evaluarlos a los satelites
window.Scripts = (function() {
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
	
	var le = [];
	my.getLE = function() { return le; }
	
	my.addLE = function(name, func, path, registered, type, utf8) {
		var s = my.add(name, func, path, registered, type, utf8);
		s.localExec();
		s.localExec = dummyFunc;
		le.push(name);
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
		s.content = "("+func.toString()+")(window)\n";
		s.registered = registered || true;
		s.type = type || "text/javascript";
		s.utf8 = utf8 || false;
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
		} else 	scripts.push(s);
	}
 		
	return my;
})();

function findWebPage(handler, path, idSat, byName/*=true -> name = path */) {
	if (handler instanceof Array) {
		for (var i=0; i<handler.length; i++) { 
			var file = findWebPage(handler[i], path, idSat, byName);
			if (file != null) return file;
		}
		return null;
	} else {
		if (typeof handler === "function") {
			return handler(path, idSat, byName); 
		} else {
			var findBy = byName ? "name" : "path";
			if ((handler[findBy] === path) && 
				(((idSat != null) && (handler.registered !== false)) ||
				 ((idSat == null) && (handler.registered !== true)))) {
					return handler;
				}	
			return null;
		}
	}
}

// manager para ficheros de scripts usados para satelites locales o externos
// tratamiento diferente para satelite local o externo
window.ScriptsManagerH = (function(){
	var my = {};

	var handler = [];
	function handlerWeb(path, idSat, byName) {
		return findWebPage(handler, path, idSat, byName)
	}
	my.addHandlerWeb = function(h) { handler.push(h); }
	
	my.init = function() {
		CH.addHandlerWeb(handlerWeb);
	}

	var satellites = [];
	function findSat(idSat) {
		for (var i=0; i<satellites.length; i++) 
			if (satellites[i].id === idSat) return satellites[i];
		return null;	
	}

	my.createSat = function(idSat) {
		var sat = findSat(idSat);
		if (sat != null) satellites.splice(satellites.indexOf(sat), 1);
		var newSat = {id: idSat, isLocal: CH.isLocal(idSat), pendingScripts: [], loadedScripts: [], callbacks: []};
		satellites.push(newSat);
		if (CH.isLocal(idSat)) return;
		CH.createObject("scriptsManager", idSat, objSat, objHost, callback);
	}

	my.addPreLoadedScripts = function(idSat, names) {
		names.forEach(function(name) {
			if (sat.loadedScripts.indexOf(name) === -1) 
				sat.loadedScripts.push(name);
		});
	}
	
	my.sendScript = function(idSat, names, callback) {
		var sat = findSat(idSat);
		if (sat != null) {
			if (sat.isLocal) {
				names.forEach(function(name) {
					if (sat.loadedScripts.indexOf(name) === -1) {
						var file = handlerWeb(name, idSat, true);
						file.localExec();
						sat.loadedScripts.push(name);
					}
				});
				callback();
			} else {
				var files=[];
				names.forEach(function(name) {
					files.push(handlerWeb(name, idSat, true));
				});	
				var pendFlag = false;
				for (var i=0; i<files.length; i++) {
					if (sat.loadedScripts.indexOf(files[i].path) !== -1) files[i] = null;
					else pendFlag = true;
				}
				if (!pendFlag) {
					callback(); 
					return;
				} 
				var c = { paths: [], callback: callback };
				var reqPaths = [];
					
				files.forEach(function(file) {
					c.paths.push(file.path);
					if (sat.pendingScripts.indexOf(file.path) === -1) reqPaths.push(file.path);
				});
				sat.pendingScripts = sat.pendingScripts.concat(reqPaths);
				sat.callbacks.push(c);
				CH.callFunction("scriptsManager", idSat, "load", [reqPaths]);
			}
		}
	}

	var objHost = {
		loadRet : function(infoSat, path) {
			var sat = findSat(infoSat.idSat);
			if (sat != null) {
				var idx = sat.pendingScripts.indexOf(path);
				if (idx != -1) {
					sat.pendingScripts.splice(idx, 1);
					sat.loadedScripts.push(path);
				}
				for (var i=0; i<sat.callbacks.length; ) {
					var c = sat.callbacks[i];
					for (var j=0; j<c.paths.length; ) {
						if (path === c.paths[j]) c.paths.splice(j,1);
						else j++;
					}
					if (c.paths.length === 0) {
						sat.callbacks.splice(i,1);
						c.callback();
					} else i++;
				}
			}
		}
	}
	
	var objSat = function(host) {
		return createScriptsManagerS(host);	
	}
	
	return my;
})();

ScriptsManagerH.init();

Scripts.add("ScriptsManagerS", function(window) {
	window.createScriptsManagerS = function(host) {
		window.createScriptsManagerS = null; // no double initialize
		
		function getLoadHandler(path) {
			return function(e) {
				host.call("loadRet", path);
			}	
		}
		var comHostSat = {
			loadScript: function(paths) {
				paths.forEach(function(path) {
					$("<script>").attr("src", path).attr("type", "text/javascript").load(getLoadHandler(path)).appendTo("head");
				});
				return true;
			}
		}

		return comHostSat;
	}
});

ScriptsManagerH.addHandlerWeb(Scripts.handlerWeb);

window.HtmlFiles = (function() {
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
	my.handlerWeb = function(handler, path, idSat, byName/*=true -> name = path */) {
		var file = findWebPage(handler, path, idSat, byName);	
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
						scriptsTmp += '<script src="'+path+"'></script>\n"; 	
					}
					ScriptsManager.addPreLoadedScripts(idSat, scripts);
					scripts = scriptsTmp;
				}
				fileTmp.content = file.content.slice(0,idxS)+scripts+file.content.slice(idxS+my.scriptsTag.length);
				return fileTmp; 	
			}
		}
		return null;
	}
	
	my.add = function(name, content, path, registered, type, utf8) {
		var h = {};

		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
		h.name = name;
		h.path = path;
		h.content = content;
		h.registered = registered || true;
		h.type = type || "text/html";
		h.utf8 = utf8 || false;
		htmlFiles.path(h);
	}
 	
	return my;	
});


CH.addHandlerWeb(HtmlFiles.handlerWeb);
