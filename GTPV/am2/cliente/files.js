// Guarda scripts como strings para enviarlos y evaluarlos a los satelites

H.Web = function() {
	var my={};
	
	my.findFile = function(handler, path, byName/*=true -> name = path */, info) {
		if (handler instanceof Array) {
			for (var i=0; i<handler.length; i++) { 
				var file = my.findFile(handler[i], path, byName, info);
				if (file != null) return file;
			}
			return null;
		} else {
			if (typeof handler === "function") {
				return handler(path, byName, info); 
			} else {
				var findBy = byName ? "name" : "path";
				if (handler[findBy] === path) {
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
	
	my.handlerWeb = scripts;
	
	my.start = function() {
		H.Comm.addHandlerWeb(my.handlerWeb);
	}

	var dummyFunc = function() {};
	
	var le = [];
	my.getLocalExec = function() { return le; }
	var scriptNames = {};
	my.getNames = function(param) { return scriptNames[param]; }
	
	my.localExec = function(names) {
		names.forEach(function(n) {
			var f = H.Web.findFile(scripts, n, true, { idSat:"sat"});
			if (f) {
				f.localExec();
				f.localExec = dummyFunc;
			}
		});
	}
	
	my.addLocalExec = function(name, params, func, path, type, utf8) {
		var f = my.add(name, params, func, path, type, utf8);
		f.localExec();
		f.localExec = dummyFunc;
		if (le.indexOf(f.name) === -1) 
			le.push(f.name);
		return f;	
	}
	
	my.add = function(name, params, func, path, type, utf8) {
		var f = {};

		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = "/"+path;
		f.name = name;
		f.path = path;
		f.func = func;
		f.localExec = function() { func(window); }
		f.content = (typeof func === "string") ? func : "("+func.toString()+")(window);\n";
		f.utf8 = ((utf8 == null) ? true : utf8);
		if (type != null) f.type = type;
		else f.type = "text/javascript; charset="+(f.utf8 ? "utf-8" : "charset=iso-8859-1");
		
		var s; 
		for (var i=0; i<scripts.length; i++) {
			s= scripts[i];
			if ((s.name === f.name) && (s.path === f.path))
				break;	
		}
		if (i < scripts.length) {
			s.content+=f.content;
			s.localExec = function(sLocalExec, fLocalExec) {
				return function() {	
					sLocalExec();
					fLocalExec();
				};
			}(s.localExec, f.localExec); 
		} else {
			scripts.push(f);
			if (params == null) params = " ";
			params.split("").forEach(function(p) {
				(scriptNames[p] = scriptNames[p] || []).push(f.name);
			});
		}
		return f;
	}
 		
	return my;
}();


H.HtmlFiles = function() {
	var my = {};

//	my.baseDir = "/";
//	my.extension = ".html";
	my.scriptsBaseDir = "/";
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
	my.handlerWeb = function(path, byName/*=true -> name = path */, info) {
		var file = H.Web.findFile(htmlFiles, path, byName, info);	
		if (file == null) return null;
		var idxS = file.content.indexOf(my.scriptsTag);
		if (idxS == -1) return file;
		for (var i=0; i<handlersScripts.length; i++) {
			var scripts = handlersScripts[i](file, info);
			if (scripts != null) {
				var fileTmp = {};
				for (var prop in file) fileTmp[prop] = file[prop];
				if (scripts instanceof Array) {
					var scriptsTmp="";
					for (var i=0; i<scripts.length; i++) {
						var path= (scripts[i].charAt(0) !== "/") ? my.scriptsBaseDir+scripts[i]+my.scriptsExt : scripts[i];
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
	
	my.add = function(path, content, type, utf8) {
		var f = {};

/*		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
*/		
		if (path.charAt(0) !== "/") path="/"+path;
		f.name = path;
		f.path = path;
		f.content = content;
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
	
	var cssFiles = [];

	my.start = function() {
		H.Comm.addHandlerWeb(cssFiles);
	}
	
	my.add = function(path, content, type, utf8) {
		var f = {};

		if (path.charAt(0) !== "/") path="/"+path;
		f.name = path;
		f.path = path;
		f.content = content;
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


H.ImageFiles = function() {
	var my = {};
	
	var imageFiles = [];

	my.start = function() {
		H.Comm.addHandlerWeb(handlerWeb);
	}
	
	function handlerWeb(path, byName, info) {
		var f = H.Web.findFile(imageFiles, path, false, info);
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
				sendResponseFile(my.add(path, str, type));
			});
			img.error(function() {
				img.remove();
				sendResponseFile(null);
			});
			img.appendTo("body");
		}
	}
	
	my.add = function(path, content, type) {
		var f = {};

		if (path.charAt(0) !== "/") path="/"+path;
		f.name = path;
		f.path = path;
		f.content = content;
		f.binary = true;
		f.utf8 = false;
		f.type = type;
		imageFiles.push(f);
		return f;
	}
	
	return my;
}();

H.ManifestFiles = function() {
	var my = {};
	
//	my.baseDir = "/";

	var manifestFiles = [];

	my.start = function() {
		H.Comm.addHandlerWeb(manifestFiles);
	}
	
	my.add = function(path, content, type, utf8) {
		var f = {};

		if (path.charAt(0) !== "/") path="/"+path;
		f.name = path;
		f.path = path;
		f.content = content;
		f.utf8 = ((utf8 == null) ? true : utf8);
		if (type != null) f.type = type;
		else f.type = "text/cache-manifest; charset="+(f.utf8 ? "utf-8" : "charset=iso-8859-1");
		manifestFiles.push(f);
		return f;
	}
	
	return my;
}();

H.PhpFiles = function() {
	var my = {};
	
//	my.baseDir = "/";

	var phpFiles = [];

	function handlerWeb(path, byName, info) {
		for (var i=0; i<phpFiles.length; i++) {
			if (phpFiles[i].path === path) {
				var f = $.extend({}, phpFiles[i]);
				delete f.handler;
				return phpFiles[i].handler(f, info);
			}
		}
		return null;
	}
	
	my.start = function() {
		H.Comm.addHandlerWeb(handlerWeb);
	}
	
	my.add = function(path, handler, type, utf8) {
		var f = {};

		if (path.charAt(0) !== "/") path="/"+path;
		f.name = path;
		f.path = path;
		f.handler = handler;
		f.utf8 = ((utf8 == null) ? true : utf8);
		if (type != null) f.type = type;
		else f.type = "text/javascript; charset="+(f.utf8 ? "utf-8" : "charset=iso-8859-1");
				
		phpFiles.push(f);
		return f;
	}
	
	return my;
}();

/*
// manager para ficheros de scripts usados para satelites locales o externos
// tratamiento diferente para satelite local o externo
// carga scripts con <script src="filename">, no con eval para poder debugar
H.ScriptsManager = function() {
	var my = {};

	var handler = [];
	my.addHandlerWeb = function(h) { handler.push(h); }
	
//	my.init = function() {
//		H.Comm.addHandlerWeb(handlerWeb);
//	}

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
	
//	my.addPreLoadedScripts = function(sat, names) {
//		var obj = findObj(sat);
//		if (!obj) return;
//		names.forEach(function(name) {
//			if (obj.data.loadedScripts.indexOf(name) === -1) 
//				obj.data.loadedScripts.push(name);
//		});
//	}
	
	my.sendScript = function(sat, names, callback) {
		var obj = findObj(sat);
		if (!obj) return;
		var reqPath = [];
		names.forEach(function(name) {
//			if (obj.data.loadedScripts.indexOf(name) === -1) {
				var file = H.Web.findFile(handler, name, true, {idSat: sat.getId()});
				if (file) {
					if (sat.isLocal()) { 
						file.localExec(); 
					} else reqPaths.push(file.path);
//					obj.data.loadedScripts.push(name);
				}
//			}
		});
		if (reqPath.length === 0) window.setTimeout(callback, 0);
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

H.Scripts.add("ScriptsManagerS", "L2", function() {
	
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
*/
