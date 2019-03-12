window.scripts = (function() {
	var my = {};
	var scripts = [];

	my.baseDir = "/";
	my.extension = ".js";
	
	my.handlerWeb = function(path, idSat, byName) {
		var findBy = byName ? "name" : "path";
		for (var i=0; i<scripts.length; i++) {
			var file = scripts[i];
			if (file[findBy] === path) {
				if (CH.isLocalSat(idSat)) {
					file.func(window);
				} 
				return file; 
			}
		}
	};

	my.add = function addScript(name, func, path, type, ansi) {
		var s = {};
		if (path == null) {	
			path = my.baseDir+name+my.extension;
		} else if (path.charAt(0) !== "/") path = my.baseDir+path+my.extension;
		s.name = name;
		s.path = path;
		s.func = func;
		s.content = "("+func.toString()+")(window)";
		s.type = type || "text/javascript";
		s.ansi = ansi || false;
		s.registered = true;
		scripts.path(s);
	}
		
	return my;
})();

function addScript(name, func, path, type, ansi) {
	//alert(name)
	var script = document.createElement("script")
	script.type = "text/javascript";
	if (script.readyState){  //IE
		script.onreadystatechange = function(){
			if (script.readyState == "loaded" ||
					script.readyState == "complete"){
				script.onreadystatechange = null;
				//alert("CARGADO");
			}
		};
	} else {  //Otros
		script.onload = function(){
			alert("YA");
		};
	}
	if (name.search(".js")>0){
		var url="http://www.gtpv.es/cliente/"+name
	}else{
		var url="http://www.gtpv.es/cliente/"+name+".js"
	}
	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

function findWebPage(handlers, path, idSat, byName/*=true -> name = path */) {
	for (var i=0; i<handlers.length; i++) {
		var h = handlers[i], file;
		if (typeof h === "function") {
			file = h(path, idSat, byName); 
		} else {
			var findBy = byName ? "name" : "path";
			for (var j=0; j<h.length; j++) {
				if ((h[j][findBy] === path) && 
					(((idSat != null) && (h[j].registered !== false)) ||
					 ((idSat == null) && (h[j].registered !== true)))) {
					file = h[j]; break;
				}	
			}	
		}
		if (file != null) return file;
	}
	return null;
}

window.scriptsManagerH = (function(){
	var my = {};

	var handlers = [];
	function handlerWeb(path, idSat, byName) {
		return findWebPage(handlers, path, idSat, byName)
	}
	my.addHandlerWeb = function(h) { handlers.push(h); }
	
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
		var newSat = {id: idSat, isLocal: CH.isLocal(idSat), pendingscripts: [], loadedscripts: [], callbacks: []};
		satellites.push(newSat);
		if (CH.isLocal(idSat)) return;
		CH.createObject("scriptsManager", idSat, objSat, objLocal, callback);
	}

	my.sendScript = function(idSat, names, callback) {
		var sat = findSat(idSat);
		if (sat != null) {
			if (sat.isLocal) {
				names.forEach(function(name) {
					if (sat.loadedscripts.indexOf(name) === -1) {
						handlerWeb(name, idSat, true);
						sat.loadedscripts.push(name);
					}
				});
				callback();
			} else {
//				var files:[];
				var files=[];
				names.forEach(function(name) {
					files.push(handlerWeb(name, idSat, true));
				});	
				var pendFlag = false;
				for (var i=0; i<files.length; i++) {
					if (sat.loadedscripts.indexOf(files[i].path) !== -1) files[i] = null;
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
					if (sat.pendingscripts.indexOf(file.path) === -1) reqPaths.push(file.path);
				});
				sat.pendingscripts = sat.pendingscripts.concat(reqPaths);
				sat.callbacks.push(c);
				CH.callFunction("scriptsManager", idSat, "load", [reqPaths]);
			}
		}
	}

	var objLocal = {
		loadRet : function(infoSat, path) {
			var sat = findSat(infoSat.idSat);
			if (sat != null) {
				var idx = sat.pendingscripts.indexOf(path);
				if (idx != -1) {
					sat.pendingscripts.splice(idx, 1);
					sat.loadedscripts.push(path);
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
		
		function getLoadHandler(path) {
			return function(e) {
				host.call("loadRet", path);
			}	
		}
		var comSat = {
			loadScript: function(paths) {
				paths.forEach(function(path) {
					$("<script>").attr("src", path).attr("type", "text/javascript").load(getLoadHandler(path)).appendTo("head");
				});
				return true;
			}
		}
		return comSat;
	}
	
	return my;
})();

scriptsManagerH.addHandlerWeb(scripts.handlerWeb);
