// Guarda scripts como strings para enviarlos y evaluarlos a los satelites

H.Web = function() {
	var my={};
	
	my.findFile = function(handler, path, idSat, byName/*=true -> name = path */) {
		if (handler instanceof Array) {
			for (var i=0; i<handler.length; i++) { 
				var file = my.findFile(handler[i], path, idSat, byName);
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

	return my;
}();

H.Scripts = function() {
	var my = {};

	my.baseDir = "/";
	my.extension = ".js";

	var scripts = [];
	
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
	
	my.start = function() {
		H.Comm.addHandlerWeb(my.handlerWeb);
	}

	var dummyFunc = function() {};
	
	var le = { true: [], false: []};
	my.getLocalExec = function(registered) { return le[registered]; }
	var names = { true: [], false: []};
	my.getNames = function(registered) { return names[registered]; }
	
	my.addLocalExec = function(name, func, path, registered, type, utf8) {
		var f = my.add(name, func, path, registered, type, utf8);
		f.localExec();
		f.localExec = dummyFunc;
		if (le[f.registered].indexOf(f.name) === -1) 
			le[f.registered].push(f.name);
		return f;	
	}
	
	my.add = function(name, func, path, registered, type, utf8) {
		var f = {};

		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
		f.name = name;
		f.path = path;
		f.func = func;
		f.localExec = function() { func(window); }
		f.content = (typeof func === "string") ? func : "("+func.toString()+")(window);\n";
		f.registered = ((registered == null) ? true : registered);
		f.utf8 = ((utf8 == null) ? true : utf8);
		if (type != null) f.type = type;
		else f.type = "text/javascript; charset="+(f.utf8 ? "utf-8" : "charset=iso-8859-1");
		var sC; 
		for (var i=0; i<scripts.length; i++) {
			sC= scripts[i];
			if ((sC.name == f.name) && (sC.path == f.path) && (sC.registered == f.registered))
				break;	
		}
		if (i < scripts.length) {
			sC.content+=f.content;
			sC.localExec = function() { 
				sC.localExec(); 
				f.localExec(); 
			}	
		} else {
			scripts.push(f);
			names[f.registered].push(f.name);
		}
		return f;
	}
 		
	return my;
}();

// manager para ficheros de scripts usados para satelites locales o externos
// tratamiento diferente para satelite local o externo
// carga scripts con <script src="filename">, no con eval para poder debugar
H.ScriptsManager = function() {
	var my = {};

	var handler = [];
	my.addHandlerWeb = function(h) { handler.push(h); }
	
/*	my.init = function() {
		H.Comm.addHandlerWeb(handlerWeb);
	}
*/
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
//		obj.data.loadedScripts = [];
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
	
/*	my.addPreLoadedScripts = function(sat, names) {
		var obj = findObj(sat);
		if (!obj) return;
		names.forEach(function(name) {
			if (obj.data.loadedScripts.indexOf(name) === -1) 
				obj.data.loadedScripts.push(name);
		});
	}
*/	
	my.sendScript = function(sat, names, callback) {
		var obj = findObj(sat);
		if (!obj) return;
		var reqPath = [];
		names.forEach(function(name) {
//			if (obj.data.loadedScripts.indexOf(name) === -1) {
				var file = H.Web.findFile(handler, name, sat.getId(), true);
				if (file) {
					if (sat.isLocal()) { 
						file.localExec(); 
					} else reqPaths.push(file.path);
//					obj.data.loadedScripts.push(name);
				}
//			}
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
H.ScriptsManager.addHandlerWeb(H.Scripts.handlerWeb);

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
	
	my.start = function() {
		H.Comm.addHandlerWeb(my.handlerWeb);
	}
	
	my.scriptsTag = "<!--scripts-->\n";
	my.handlerWeb = function(path, idSat, byName/*=true -> name = path */) {
		var file = H.Web.findFile(htmlFiles, path, idSat, byName);	
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
//					H.ScriptsManager.addPreLoadedScripts(idSat, scripts);
					scripts = scriptsTmp;
				}
				fileTmp.content = file.content.slice(0,idxS)+scripts+file.content.slice(idxS+my.scriptsTag.length);
				return fileTmp; 	
			}
		}
		return null;
	}
	
	my.add = function(path, content, registered, type, utf8) {
		var f = {};

/*		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
*/		f.name = path;
		f.path = path;
		f.content = content;
		f.registered = ((registered == null) ? true : registered);
		f.utf8 = ((utf8 == null) ? true : utf8);
		if (type != null) f.type = type;
		else f.type = "text/html; charset="+(f.utf8 ? "utf-8" : "charset=iso-8859-1");
		htmlFiles.push(f);
		return f;
	}
 	
	return my;	
}();

H.CSSFiles = function() {
	var my = {};
	
	my.baseDir = "/";
	my.extension = ".css";

	var cssFiles = [];

	my.start = function() {
		H.Comm.addHandlerWeb(cssFiles);
	}
	
	my.add = function(path, content, registered, type, utf8) {
		var f = {};

		f.name = path;
		f.path = path;
		f.content = content;
		f.registered = ((registered == null) ? true : registered);
		f.utf8 = ((utf8 == null) ? true : utf8);
		if (type != null) f.type = type;
		else f.type = "text/css; charset="+(f.utf8 ? "utf-8" : "charset=iso-8859-1");
		cssFiles.push(f);
		return f;
	}
	
/*	my.localLoad = function(path) {
		path = path;
		var c = H.Web.findFile(cssFiles, path, "sat");
		if (c) {
			$("<style>").attr("type", "text/css").attr("href", "cliente/css/").text(c.content).appendTo("head");
		}
	}
*/	
	return my;
}();

(function() {
	if (H.CSSData) {
		H.CSSData.forEach(function(f) {
			f.path = "/css"+f.path;
			H.CSSFiles.add(f.path, f.content);
		});
	}
})();

//H.CSSFiles.localLoad("/css/ui-lightness/jquery-ui-1.8.13.custom.css");
//H.CSSFiles.localLoad("/css/gtpv/gtpv.css");

H.ImageFiles = function() {
	var my = {};
	
	my.baseDir = "/";
	my.extension = ".css";

	var imageFiles = [];

	my.start = function() {
		H.Comm.addHandlerWeb(handlerWeb);
	}
	
	function handlerWeb(path, idSat, byName) {
		var f = H.Web.findFile(imageFiles, path, idSat);
		if (f != null) return f;
		var idx = path.lastIndexOf('.');
		if (idx === -1) return null;
		var ext = path.slice(idx+1);
		if (ext.indexOf('/') !== -1) return null;
		var ext = ext.toLowerCase();
		var type;
		switch(ext) {
			case "gif":
			case "png":
			case "jpg":
			case "jpeg":
				break;
			default:
				return null;
		}
		if (type == null) type = "image/"+ext;
		return function(sendResponseFile) {
			var img = $("<img>").attr("src", path.slice(1));
			img.load(function() {
				var c = $("<canvas>");
				var c0 = c[0], img0 = img[0];
				c0.width = img0.naturalWidth || img0.width;
				c0.height = img0.naturalHeight || img0.height;
				c.appendTo("body");
				c0.getContext("2d").drawImage(img0, 0, 0);
				var dataUrl = c0.toDataURL(type);
				img.remove();
				c.remove();
				var idx = dataUrl.indexOf(',');
				if (idx === -1) {
					sendResponseFile(null);
					return;
				}
				var base64 = dataUrl.slice(idx+1);
				var str = atob(base64);
				str = str.replace(/\0/g,'\u0100');
				sendResponseFile(my.add(path, str, (idSat != null), type));
			});
			img.error(function() {
				img.remove();
				sendResponseFile(null);
			});
			img.appendTo("body");
		}
	}
	
	my.add = function(path, content, registered, type) {
		var f = {};

		f.name = path;
		f.path = path;
		f.content = content;
		f.registered = ((registered == null) ? true : registered);
		f.binary = true;
		f.utf8 = false;
		f.type = type;
		imageFiles.push(f);
		return f;
	}
	
	return my;
}();

