function ch() {
	var my = this;
	my.port = 80;
	my.addr = null;
	my.backlog = 100;
	my.webSite = [];
	
	var applet;
	var httpServer;
	var satellites = [];

	function findSat(idSat) {
		for (var i=0; i<satellites.length; i++) 
			if (satellites[i].id === idSat) return satellites[i];
		return null;	
	}

	function getObj(idObj, sat) {
		for (var i=0; i<sat.objs.length; i++) 
			if (sat.objs[i].id === idObj) return sat.objs[i];
		return null;		
	}

	function initializeSat(idSat) {
		var oldSat = findSat(idSat);
		if (oldSat != null) satellites.splice(satellites.indexOf(oldSat), 1);
		var newSat = { id: idSat, isLocal: my.isLocal(idSat), idxSecHS: 1, objs: [], pendingHS: [] };
		satellites.push(newSat);
		if (!registrationHandler(idSat, oldSat)) {
			satellites.splice(satellites.indexOf(newSat), 1);
			newSat = null;
		}
		return newSat;
	}
	
	function processAnswer(answer, pr) {
		try {
			if ((typeof answer !== "object") || (answer == null)) answer = {};
			if ((answer.er != null) && (typeof pr.errorHandler === "function")) { 
				pr.errorHandler(answer.er);
			}  else {
				if (typeof pr.callback === "function") 
					pr.callback(answer.ret);
			}
		} catch(e) {
			console.log(e);
		}
	}

	function processQuestion(sat, question) {
		var answer = {};
//								var idObj = getIdObj(q.idObj);
		switch (question.type) {
			case "f" :
				var obj = getObj(question.idObj, sat);
				if (obj == null) answer.er = "Error-G: Object undefined";
				else {
					try {
						var args = (question.args == null) ? [] : question.args;
						args.unshift({idObj: obj.idObj, idSat: sat.id, isLocal: sat.isLocal});
						if ((!obj.objLocal instanceof Object) || 
							(!obj.objLocal.hasOwnProperty(question.func)) || 
							(typeof obj.objLocal[question.func] != "function")) 
								throw new GError(question.func+" is not a function");
						answer.ret = obj.objLocal[question.func].apply(obj.objLocal, args);
					} catch(e) {
						answer.er = e.toString();
					}
				}
				break;
		}
		return answer;
	}
	
	function json(obj) {
		try {
			return JSON.stringify(obj, function(k,v) { return (typeof v === "function") ? v.toString() : v; });
		} catch(e) {
			return "null";
		}
	}

	function responseToS(httpEx, data) {
		applet.httpEx_responseHeader(httpEx, "Content-Type", "text/plain");
		applet.httpEx_response_UTF8(httpEx, 200, json(data), null);
	}

	function sendPendingHS(sat) {
		if ((sat.pendingHS.length > 0) && (sat.httpExHS != null)) {
			sat.lastDataHS = { m : { idxSec: sat.idxSecHS, q: [] } };
			sat.idxSecHS++;
			for (var i=0; i<sat.pendingHS.length; i++) {
				sat.lastDataHS.m.q.push(sat.pendingHS[i].q);
			}
			sat.pendingResponseHS = sat.pendingHS;
			sat.pendingHS = [];
			responseToS(sat.httpExHS, sat.lastDataHS);
//			applet.httpEx_response_UTF8(sat.httpExHS, 200, json(sat.lastDataHS), null);
			sat.httpExHS = null;
		}
	}
/*	function StringToUTF8(str) {
		var buf = [];
		for (var i=0; i<str.length; i++) {
			var c = str.charCodeAt(i);
			if (c < 0x80) buf.push(c);
			else if (c < 0x800) { buf.push((c>>6)|0xC0); buf.push((c&0x3F)|0x80); }
			else { buf.push((c>>12)|0xE0); buf.push(((c>>6)&0x3F)|0x80); buf.push((c&0x3F)|0x80); }
		}
		return buf;
	}
	function UTF8ToString(buf) {
		var str = "";
		for (var i=0; i<buf.length; i++) {
			var c = buf[i];
			if (c < 0x80) ;
			else if (c < 0xC0) c = (((c&0x3F)<<6)|(buf[i++]&0x3F));
			else c = (((c&1F)<<12)|((buf[i++]&0x3F)<<6)|(buf[i++]&0x3F));
			str+=String.fromCharCode(c);
		}
		return str;
	}
*/
	function StringToANSI(str) {
		var buf = [];
		for (var i=0; i<str.length; i++) {
			buf[i] = str.charCodeAt(i);
		}
		return buf;
	}
	
	function GError(message) {
		this.prototype = Error.prototype;
		this.message = message;
		this.name = "G-Error";
	}
	
	function httpHandler(httpEx, method, path, query, address) {
		var reqBody = "";
		var idSat = null;
		var isSH;
		
		function getReqBody(str, reader) {
			if (str === undefined) { reader = null; }
			else { 
				if (str === null) { applet.httpEx_close(httpEx, null); return; }
				if (str.length == 0) {
					processReqBody();
					return;
				}
				reqBody += str;
			}
			applet.httpEx_requestBody_UTF8(httpEx, reader, 1024, getReqBody);
		}
		function processReqBody() {
			var m;
			try {
				var body = JSON.parse(reqBody);
//				if (body.s == null) { 
					m = body.m; 
					if ((typeof m !== "object") || (m == null)) m = {};
/*				} else {
					sendHttpStatusCode(406);
					return;
				}
*/			} catch(e) {
				sendHttpStatusCode(400);
				return;
			}
			if (idSat == null) idSat = String(m.idSat);
			var sat;
			if (!isSH && (m.i != null)) { sat = initializeSat(idSat); }
			else sat = findSat(idSat);
			if (sat != null) {
				if (isSH) {
					if ((sat.lastdataSH == null) || (sat.lastDataSH.m.idxSec !== m.idxSec)) {
						var data = { idxSec : m.idxSec };
				
						var answers = [];
						if ((m.idxSec == null) || (!(m.q instanceof Array))) {
							sendHttpStatusCode(406);
							return;
						}
						for (j=0; j<m.q.length; j++) {
							var question = m.q[j];
							var answer = processQuestion(sat, question);
							answers.push(answer);
						}
						data.a = answers;
						sat.lastDataSH = { m: data };
					}
					responseToS(httpEx, sat.lastDataSH);
//					applet.httpEx_response_UTF8(httpEx, 200, json(sat.lastDataSH), null);
				} else {
					if (sat.httpExHS != null) { applet.httpEx_close(sat.httpExHS, null); }
					sat.httpExHS = null;
					if (sat.lastDataHS == null) {
						sat.httpExHS = httpEx;
						sendPendingHS(sat);
						return;
					}
					if (sat.lastDataHS.m.idxSec !== m.idxSec) {
						responseToS(httpEx, sat.lastDataHS);
//						applet.httpEx_response_UTF8(httpEx, 200, json(sat.lastDataHS), null);
						return;
					}
					if ((!(m.a instanceof Array)) || (m.a.length !== sat.pendingResponseHS.length)) {
						sendHttpStatusCode(406);
						return;
					}
					for (var i=0; i<m.a.length; i++) {
						processAnswer(m.a[i], sat.pendingResponseHS[i]);
					}
					sat.lastDataHS = null;
					sat.pendingResponseHS = null; //??
					sat.httpExHS = httpEx;
					sendPendingHS(sat);
				}
			} else sendHttpStatusCode(401);
		}
		function sendHttpStatusCode(rCode) {
			applet.httpEx_Response(httpEx, rCode, null, null);	
		}

		applet.httpEx_responseHeader(httpEx, "Cache-Control", "no-cache");
		applet.httpEx_responseHeader(httpEx, "Conection", "close");

		switch (method) {
			case "GET":
			case "POST":
			case "HEAD":
				break;
			default:
				sendHttpStatusCode(405);
				return;
		}
/*		var h = applet.httpEx_requestHeader(httpEx).keySet().iterator();
		while (h.hasNext()) {
			console.log(h.next());
		}
*/		var searchStr = "id=";
		idSat = null;
		var headerC = applet.httpEx_requestHeader(httpEx).get("Cookie");
		if (headerC != null) {
			var i = headerC.iterator();
			while (i.hasNext()) {
				var cookie = i.next();
				var re = /\s*([^=]*)=([^\s;]*)\s*;?/g;
				var exec;
				while ((exec = re.exec(cookie)) != null) {
					if (exec[1] == "id") {
						idSat = exec[2];
						break;
					}
				}
			}
		}
		if ((method === "POST") && ((path === "/sh/") || (path === "/hs/"))) {
			isSH = (path === "/sh/");
			getReqBody();
		// getBody(httpEx)
		} else if ((method == "GET") && (path ==="/r/") && (query != null)) {
			idSat = /^(\w*)/.exec(query)[0];
			applet.httpEx_responseHeader(httpEx, "Set-Cookie", "id="+idSat+" ; Path=/; Max-age="+(3650*24*60*60));
			applet.httpEx_responseHeader(httpEx, "Location", "/");
//			satellites.push({ idSat: idSat, idxSecHS: 1, objs: [], pendingHS: [] });
			sendHttpStatusCode(303);
		} else {
			for (var i=0; i<my.webSite.length; i++) {
				var file = my.webSite[i];
				if ((file.path === path) && 
				    ((file.registered == null) ||
					 ((file.registered === true) && (idSat != null)) ||
					 ((file.registered === false) && (idSat == null)))) {
					var body = (file.isUTF8) ? file.content : StringToANSI(file.content);
					applet.httpEx_responseHeader(httpEx, "Content-Type", file.mediaType);
					if (method === "HEAD") {
						applet.httpEx_responseHeader(httpEx, "Content-Length", ""+body.length);	
						body = null;
					}
					applet[file.isUTF8 ? "httpEx_response_UTF8" : "httpEx_response"](httpEx, 200, body, null);
					break;
				}
			}
			if (i == my.webSite.length) sendHttpStatusCode(404);
		}
	}
	
	
	function send(idSat, q, callback, errorHandler) {
		var sat = findSat(idSat);
		if (sat != null) {
			var o = { q: q, callback: callback, errorHandler: errorHandler }; 
			if (sat.isLocal) {
				processAnswer(idSat(q), o);
			} else {
				sat.pendingHS.push(o);
				setTimeout(sendPendingHS, 0, sat);
			}
			return o;
		}
		if (typeof errorHandler === "function") errorHandler("G-Error: Satellite don't exists");
		else if (typeof callback === "function") callback(undefined);
	}

	var registrationHandler = function(newSat, oldSat) { return true; };
	
	my.init = function(callbackInit, _registrationHandler) {
		if (_registrationHandler != null) registrationHandler = _registrationHandler;
		try {
			applet = window.g_applet;
			if (applet.isActive()) {
				var http = applet.HttpServer_create(my.port, my.addr, my.backlog);
				if (http != null) {
					httpServer = http;
					applet.http_createHttpContext(httpServer, "/", httpHandler);
					if (typeof callbackInit === "function") callbackInit();
					applet.http_start(httpServer);
					return true;
				}
			}
		} catch (e) {}
		setTimeout(my.init, 1000, callbackInit);
		return false;	
	}
	my.stop = function() {
		applet.http_stop(httpServer);
		httpServer = null;
	}
	my.createObject = function(idObj, idSat, objSat, objLocal, callback) {
		var sat = findSat(idSat);
		if (sat != null) {
			var obj = getObj(idObj, sat);
			if (obj != null) {
				if (typeof callback === "function") callback("G-Error: Object already defined")
				return null;
			}
			sat.objs.push({ id: idObj, objLocal: objLocal });
		}
		return send(idSat, {idObj: idObj, type: "c", obj: objSat}, callback, callback);
	}
	my.callFunction = function(idObj, idSat, func, args, callback, errorHandler) {
		return send(idSat, {idObj: idObj, type: "f", func: func, args: args}, callback, errorHandler);
	}
	my.destroyObject = function(idObj, idSat, callback) {
		var sat = findSat(idSat);
		if (sat != null) {
			var obj = getObj(idObj, sat);
			if (obj != null) {
				sat.objs.splice(sat.objs.indexOf(obj), 1);
			}
		}
		return send(idSat, {idObj: idObj, type: "d"}, callback, callback);
	}
	my.sendScript = function(idSat, s, callback) {
		if (typeof s === 'function') s = s.toString();
		return send(idSat, {type: "s", script: s}, callback, callback);
	}
	my.sendFunctionExecute = function(idSat, s, callback) {
		return my.sendScript(idSat, "("+s.toString()+")()", callback);
	}
	my.sendObjectAssign = function(idSat, name, obj, callback) {
		return my.sendScript(idSat, name+" = "+json(obj)+";", callback);
		
	}

	my.localSatInit = function(cs) {
		initializeSat(cs);
	}
	
	my.localSendSH = function(cs, question) {
		var sat = findSat(cs);
		if (sat != null) return processQuestion(sat, question);
		else throw new GError("Satellite don't exists");
	}

	my.isLocal = function(idSat) { return (typeof idSat !== "string"); }
	
	return my;	
}
