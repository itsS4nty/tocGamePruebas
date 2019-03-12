// Comunicacion satelites

// ch: parte host
//      - registra satelites (iniciado por satelite)
//      - crea objetos en satelite,
//        ejecuta funciones en objetos de satelite,
//        envia scripts para ejecutar en satelite (iniciado por host)

// idSat : identificador de satelite, 
//         (string: si es un satelite externo),
//         (function: si es un satelite local, processQuestion de cs)

window.CH = function () {
	var my = {};
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

	my.getSatTime = function(idSat) {
		var sat = findSat(idSat);
		if (sat == null) return null;
		return getSatTime(sat);
	}
	
	function getSatTime(sat) {
		var delta = getCurrentTime() - sat.hostTimeInLastSatTime;
		if (delta < 0) delta = 0; // ????
		return sat.lastSatTime+delta;
	}

	my.diffSatTime = function(idSat, timeSat0) {
		var sat = findSat(idSat);
		if (sat == null) return null;
		return diffSatTime(sat, timeSat0);	
	}
	
	function diffSatTime(sat, timeSat0) {
		var diff = getSatTime()-timeSat0;
		return (diff >= 0) ? diff : 0;
	}
	
	function initializeSat(idSat, isLocal, tsSat) {
		var oldSat = findSat(idSat);
		if (oldSat != null) satellites.splice(satellites.indexOf(oldSat), 1);
		var newSat = { id: idSat, isLocal: isLocal, lastSecHS: 0, objs: [], pendingHS: [] };
		newSat.tsInit = getCurrentTime();
		if (oldSat && (oldSat.tsInit === newSat.tsInit)) newSat.tsInit++;
		newSat.lastSatTime = tsSat;
		newSat.hostTimeInLastSatTime = getCurrentTime();
		newSat.getTime = function() { return getSatTime(newSat); }
		newSat.diffTime = function(time0) { return diffSatTime(newSat, time0); }
		satellites.push(newSat);
		if (!registrationHandler(idSat, oldSat)) {
			satellites.splice(satellites.indexOf(newSat), 1);
			newSat = null;
		}
		return newSat;
	}
	
	// todos usan el mismo tiempo para evitar diferencias en objectos relacionados
	var currentTime; 

	function clearCurrentTime() {
		currentTime = null;
	}
	
	function getCurrentTime() {
		if (currentTime == null) {
			currentTime = getHostTime();
			setTimeout(clearCurrentTime, 0);
		}
		return currentTime;
	}
	
	function diffCurTime(time0) {
		var t = getCurrentTime()-time0;
		return (t>=0) ? t : 0;
	}
	
	function processAnswer(answer, pendResp) {
		try {
			if ((typeof answer !== "object") || (answer == null)) answer = {};
			// callback siempre se llama, si hay retorno o error
			if (typeof pendResp.callback === "function") {
				pendResp.callback(answer.ret, answer.er, diffCurTime(pendResp.ts), answer.age );
			}
		} catch(e) {
			console.log(e);
		}
	}

	var ageCurrentQuestion;
	function getAgeCurrentCall() {
		return ageCurrentQuestion;
	}
	
	function processQuestion(sat, question) {
		var answer = {};
//								var idObj = getIdObj(q.idObj);
		if ((typeof question !== "object") || (question == null)) return answer;
		ageCurrentQuestion = question.age;
		switch (question.type) {
			case "f" :
				var obj = getObj(question.idObj, sat);
				if (obj == null) answer.er = "Error-G: Object undefined";
				else {
					try {
						var infoSat = { idObj: obj.idObj, idSat: sat.id, isLocal: sat.isLocal, 
						                age: question.age, getTime: sat.getTime, diffTime: sat.diffTime };
						var args = [infoSat].concat(question.args);				 
						if ((!obj.objHost instanceof Object) || 
							(!obj.objHost.hasOwnProperty(question.func)) || 
							(typeof obj.objHost[question.func] != "function")) 
								throw new GError(question.func+" is not a function");
						answer.ret = obj.objHost[question.func].apply(obj.objHost, args);
					} catch(e) {
						answer.er = e.toString();
					}
				}
				break;
			case "i" :
				answer.ret = sat.tsInit;
				break;
		}
		answer.age = question.age;
		ageCurrentQuestion = -1;
		return answer;
	}
	
	function json(obj) {
		try {
			return JSON.stringify(obj, function(k,v) { return (typeof v === "function") ? v.toString() : v; });
		} catch(e) {
			return "null";
		}
	}
	
	function getHostTime() { return Date.now(); } // ????
	
	function createJsonMessage(sec, data) {
		var jsonMessage = '{"ts":'+getCurrentTime();
		if (sec != null) jsonMessage+=',"sec":'+sec;
		if (data != null) {
			for (var p in data) {
				if (data.hasOwnProperty(p)) {
					jsonMessage+=','+JSON.stringify(p)+':'+data[p];
				}
			}
		}
		jsonMessage+='}';
		jsonMessage = '{"m":'+jsonMessage+'}';
		return jsonMessage;
	}
	
	function responseToS(exchange, sec, data, sat) {
		var jsonMessage = createJsonMessage(sec, data);
		if (sat.isLocal) { // ???? typeof exchange === "function"
			exchange(jsonMessage);
		} else {
			var httpEx = exchange;
			applet.httpEx_responseHeader(httpEx, "Content-Type", "text/plain");
			applet.httpEx_response_UTF8(httpEx, 200, jsonMessage, null);
		}
	}

	function constructDataHS(pendingHS) {
		var dataHS = {};
		dataHS["q"] = '[';
		dataHS["q"]+= pendingHS.map(function(pr) { 
			var q = pr.q;
			
			pr.tsSend = diffCurTime(pr.ts);
			if ((pr.maxAge != null) && (pr.tsSend > pr.maxAge)) {
				q = pr.qMaxAge;
			}	
			var q2 = [];
			for (var p in pr) {
				if (pr.hasOwnProperty(p)) {
					q2.push('"'+p+'":'+pr[p]);
				}
			}
			q2.push('"age":'+pr.tsSend);
			return '{'+q2.join(",")+'}'; 
		}).join(",");
		dataHS["q"]+= ']';
		return dataHS;
	}
	
	function sendPendingHS(sat, fAlive) {
		if (((sat.pendingHS.length > 0) || (fAlive === true)) && (sat.exchangeHS != null)) {
			sat.objs.forEach(function(obj) {
				if (typeof obj.availableCommHandler === "function") obj.availableCommHandler(idSat); 
			});

			sat.lastSecHS++;
			
			var dataHS = constructDataHS(sat.pendingHS);
			sat.pendingResponseHS = sat.pendingHS;
			sat.pendingHS = [];
			clearTimeout(sat.toutIdAliveHostCom);
			sat.toutIdAliveHostCom = null;
			responseToS(sat.exchangeHS, sat.lastSecHS, dataHS, sat);
			sat.exchangeHS = null;
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
	
	function closeExchangeHS(sat) {
		if (sat.exchangeHS != null) {
			if (!sat.isLocal) applet.httpEx_close(sat.exchangeHS, null);
			sat.exchangeHS = null;	
		}
	}
	
	my.localCommunication = function(url, m, exchange) {
		var rCode = processMessage(true, (path === "/sh/"), m, exchange);
		if (rCode != 0) {
			console.log("Error localCommunication");	
		}
		return null;
	}
/*	my.localCommunicationHS = function(idSat, m, exchange) { 
		localCommunication(idSat, false, m, exchange);
	}
	my.localCommunicationSH = function(idSat, m, exchange) {
		localCommunication(idSat, true, m, exchange)
	}
	
	function localCommunication(idSat, isSH, m, exchange) {
		var rCode = processMessage(idSat, isSH, m, exchange);
		if (rCode != 0) {
			console.log("Error localCommunication");	
		}
	}
*/	
	var delayAliveHostCom = 10000; 
	function aliveHostCom(sat) {
		sendPendingHS(sat, true);
	}
	function processMessage(isLocal, isSH, m, exchange) {
		var sat;
		var idSat = isLocal ? m.idSat : String(m.idSat);

		var tsSat = (typeof(m.ts) === "number") ? m.ts : getCurrentTime();  // ????

		if (isSH && (m.i == null)) { sat = initializeSat(idSat, isLocal, tsSat); }
		else {
			sat = findSat(idSat);
			if (m.i !== sat.tsInit) sat = null;
		}
		
		if (sat != null) {
			sat.lastSatTime = tsSat;
			sat.hostTimeInLastSatTime = getCurrentTime();
			if (isSH) {
				if ((sat.lastDataSH == null) || (sat.lastSecSH !== m.sec)) {
					if ((m.sec == null) || (!(m.q instanceof Array))) {
						return 406;
					}
			
					for (var j=0,answers = []; j<m.q.length; j++) {
						var question = m.q[j];
						var answer = processQuestion(sat, question);
						answers.push(json(answer));
					}
					sat.lastSecSH = m.sec;
					sat.lastDataSH = { "a":'['+answers.join(",")+']' };
				}
				responseToS(exchange, sat.lastSecSH, sat.lastDataSH, sat);
			} else {
				closeExchangeHS(sat);
				if (sat.pendingResponseHS != null) {
					if (sat.lastSecHS !== m.sec) {
						var dataHS = constructDataHS(sat.pendingResponseHS);
						responseToS(sat.exchangeHS, sat.lastSecHS, dataHS, sat);
						return;
					}
					if ((!(m.a instanceof Array)) || (m.a.length !== sat.pendingResponseHS.length)) {
						return 406;
					}
					for (var i=0; i<m.a.length; i++) {
						processAnswer(m.a[i], sat.pendingResponseHS[i]);
					}
					sat.pendingResponseHS = null;
				}
				sat.exchangeHS = exchange;
				clearTimeout(sat.toutIdAliveHostCom);
				sat.toutIdAliveHostCom = setTimeout(aliveHostCom, delayAliveHostCom, sat);
				sat.objs.forEach(function(obj) {
					if (typeof obj.availableCommHandler === "function") obj.availableCommHandler(idSat); 
				});
				sendPendingHS(sat);
			}
		} else return 401;
		return 0;
	}
	
	function httpHandler(httpEx, method, path, query, address) {
		var reqBody = "";
		var idSat = null;
		var isSH;
		
		function getReqBody(str, reader) {
			if (typeof str === "undefined") { reader = null; }

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
//			if (idSat == null) idSat = String(m.idSat);
			var rCode = processMessage(false, isSH, m, httpEx);
			if (rCode != 0) sendHttpStatusCode(rCode);
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
//			satellites.push({ idSat: idSat, secHS: 1, objs: [], pendingHS: [] });
			sendHttpStatusCode(303);
		} else {
			var file;
			file = findWebPage(handlers, path, idSat, false)
			if (file != null) {
				var body = (file.utf8) ? file.content : StringToANSI(file.content);
				applet.httpEx_responseHeader(httpEx, "Content-Type", file.mediaType);
				if (method === "HEAD") {
					applet.httpEx_responseHeader(httpEx, "Content-Length", ""+body.length);	
					body = null;
				}
				applet[file.utf8 ? "httpEx_response_UTF8" : "httpEx_response"](httpEx, 200, body, null);
			} else sendHttpStatusCode(404);
		}
	}
	
	function json_q(q) {
		var q2 = {};
		for (var p in q) {
			if (q.hasOwnProperty(p)) q2[p] = json(q[p]);
		}
		return q2;
	}
	
	function send(sat, q, callback, maxAge, qMaxAge) {
//		var sat = findSat(idSat);
		if (sat != null) {
			var o = { q: json_q(q), callback: callback, ts: getCurrentTime(), maxAge: maxAge, qMaxAge: json_q(qMaxAge) }; 
//			if (sat.isLocal) {
//				processAnswer(idSat(q), o);
//			} else {
				sat.pendingHS.push(o);
				setTimeout(sendPendingHS, 0, sat);
//			}
			return o;
		}
		if (typeof callback === "function") callback(undefined, "G-Error: Satellite don't exists", 0);
		return null;
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
	my.createObject = function(idObj, idSat, objSat, objHost, callback, availableCommHandler) {
		var sat = findSat(idSat);
		if (sat != null) {
			var obj = getObj(idObj, sat);
			if (obj != null) {
				if (typeof callback === "function") callback(undefined, "G-Error: Object already defined", 0)
				return null;
			}
			sat.objs.push({ id: idObj, objHost: objHost, availableCommHandler: availableCommHandler });
		}
		return send(sat, {idObj: idObj, type: "c", obj: objSat}, callback);
	}
	my.callFunction = function(idObj, idSat, func, args, callback, maxAge) {
		if (!(args instanceof Array)) args = [args];
		var sat = findSat(idSat);
		if (sat != null) {
			var obj = getObj(idObj, sat);
			if (obj == null) {
				if (typeof callback === "function") callback(undefined, "G-Error: Object not created", 0)
				return null;
			}
		} 
		if (maxAge == null) maxAge = obj.maxAge;
		if (maxAge < 0) maxAge = null;
		var qMaxAge = { idObj: idObj, type: "e", er: "G-Error: MaxAge" };
		return send(sat, {idObj: idObj, type: "f", func: func, args: args}, callback, maxAge, qMaxAge);
	}
	my.destroyObject = function(idObj, idSat, callback) {
		var sat = findSat(idSat);
		if (sat != null) {
			var obj = getObj(idObj, sat);
			if (obj == null) {
				callback(undefined, "G-Error: Object not created", 0);
				return null;
			}	
			sat.objs.splice(sat.objs.indexOf(obj), 1);
		}
		return send(sat, {idObj: idObj, type: "d"}, callback);
	}
	my.sendScript = function(idSat, s, callback) {
		if (typeof s === 'function') s = s.toString();
		return send(findSat(idSat), {type: "s", script: s}, callback);
	}
/*	my.sendScriptFile = function(idSat, name, callback) {
		return send(idSat, {type: "f", name: name}, callback, callback);
	}
	
	my.sendFunctionExecute = function(idSat, s, callback) {
		return my.sendScript(idSat, "("+s.toString()+")()", callback);
	}
*/	my.sendObjectAssign = function(idSat, name, obj, callback) {
		return my.sendScript(idSat, name+" = "+json(obj)+";", callback);
		
	}

	my.isLocal = function(idSat) { 
		var sat = findSat(idSat);
		if (sat == null) return null;
		return sat.isLocal; 
	}

	var handlersWeb = [];
	
	my.addHandlersWeb = function(handler) {
		handlersWeb.push(handler);
	}
	
	return my;	
}

Scripts.add("ComSatS", function(window) {
	
window.CS = function () {
	var my = {};

	var localHost;
	var idSat;
	var jsonIdSat;
	var tsInit;
	var lastDataHS = null;
	var lastSecHS = null;

	var SHInProgress = false;
	var pendingSH = [];
	// var lastDataSH = null;
	var lastSecSH = 0;
	var	pendingResponseSH = null;

	var objs = [];
	var currentJqXHR_HS = null, currentJqXHR_SH = null;
	
	var isLocal;
	
	var lastHostTime = 0, satTimeInLastHostTime = 0;
	var lastComHS = 0;
	
//	my.setIdSat = function(_id) { idSat = _id; }
	my.timeout = 15000;

	function getObj(id) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].id === id) return objs[i];
		}
		return null;
	}
	
	var ageCurrentQuestion;
	
	function processQuestion(question) {
		var answer = {};
		if ((typeof question !== "object") || (question == null)) return answer;
		ageCurrentQuestion = question.age;
		switch (question.type) {
			case "c" :
				if (getObj(question.idObj) != null) answer.er = "G-Error: Object already defined";
				else {
					try { 
						var obj = {};
						obj.id = question.idObj;
						obj.objSat = (eval("("+question.obj+")"))(newOutputCom(question.idObj));	
						objs.push(obj);
						answer.ret = true;
					} catch(e) {
						answer.er = e.toString();
					}
				}
				break;
			case "f" :
				var obj = getObj(question.idObj);
				if (obj == null) answer.er = "G-Error: Object undefined";
				else {
					try {
						if ((!obj.objSat instanceof Object) || (!obj.objSat.hasOwnProperty(question.func)) || 
							(typeof obj.objSat[question.func] != "function")) 
							throw new GError(question.func+" is not a function");
						answer.ret = obj.objSat[question.func].apply(obj.objSat, question.args);
					} catch(e) {
						answer.er = e.toString();
					}
				}
				break;
			case "d" :
				var obj = getObj(question.idObj);
				if (obj == null) answer.er = "G-Error: Object undefined";
				else {
					objs.splice(objs.indexOf(obj), 1);
					answer.ret = true;
				}
				break;
			case "s" :
				try {
					$.globalEval(question.script);
					answer.ret = true;
				} catch(e) {
					answer.er = e.toString();
				}
				break;
			case "e" :
				answer.er = question.er;
			case null:
			default:	
				// message canceled
		}
		answer.age = question.age;
		ageCurrentQuestion = -1;
		return answer;
	}

	// todos usan el mismo tiempo para evitar diferencias en objectos relacionados
	var currentTime; 

	function clearCurrentTime() {
		currentTime = null;
	}
	
	function getCurrentTime() {
		if (currentTime == null) {
			currentTime = getSatTime();
			setTimeout(clearCurrentTime, 0);
		}
		return currentTime;
	}
	
	function diffCurTime(time0) {
		var t = getCurrentTime()-time0;
		return (t>=0) ? t : 0;
	}
	
	function processAnswer(answer, pendResp) {
		try {
			if ((typeof answer !== "object") || (answer == null)) answer = {};
			// callback siempre se llama, si hay retorno o error
			if (typeof pendResp.callback === "function") {
				pendResp.callback(answer.ret, answer.er, diffCurTime(pendResp.ts), answer.age );
			}
		} catch(e) {
			console.log(e);
		}
	}

	function json(obj) {
		try {
			return JSON.stringify(obj, function(k,v) { return (typeof v === "function") ? v.toString() : v; });
		} catch(e) {
			return "null";
		}
	}
	
	var communication; // ajaxCommunication o localHostCommunication
	function ajaxCommunication(url, data, success, error) {
		return $.ajax({ 
			url: url, 
			contentType: "plain/text",
			timeout : my.timeout,
			data : data,
			type : "POST",
			success : success,
			error : error
		});
	}

	function GError(message) {
		this.prototype = Error.prototype;
		this.message = message;
		this.name = "G-Error";
	}
	
	function getHostTime() { // ????
		var delta = getCurrentTime() - satTimeInLastHostTime;
		if (delta < 0) delta = 0; // ????
		return lastHostTime+delta;
	}
	
	function getAgeLastCom() {
		var age = getCurrentTime() - lastComHS;
		return (age >= 0) ? age : 0;
	}
	
	function newOutputCom(idObj) {
		return {
			call : function(func, args, callback, errorHandler) {
				return callFunction(idObj, func, args, callback, errorHandler);
			},
			isLocal : isLocal,
			idSat : idSat,
			getTime : getHostTime,
			getAgeCurrentCall : function() {
				return ageCurrentQuestion;
			},
			getAgeLastCom : getAgeLastCom,
		}
	}
	
	function successHS(data) {
		var m;
		try {
			data = JSON.parse(data);
			m = data.m;
			if ((m.sec == null) || (!(m.q instanceof Array))) throw 1;
		} catch (e) {
			HostToSat(null); 
			return;
		}
		if (/*(lastDataHS != null) &&*/ (lastSecHS === m.sec)) { 
			HostToSat(lastDataHS); 
			return;	
		} 

		lastHostTime = (typeof(m.ts) === "number") ? m.ts : getCurrentTime();
		satTimeInLastHostTime = getCurrentTime();
		lastComHS = getCurrentTime();
		
		var answers = [];
		for (i=0; i<m.q.length; i++) {
			var question = m.q[i];
			var answer = processQuestion(question);
			answers.push(json(answer));
		}
		lastSecHS = m.sec;
		lastDataHS = { "a":'['+answers.join(",")+']' };
		HostToSat(lastDataHS);
	}

	function errorHS(jqXHR, textStatus, errorThrown) {
		if (jqXHR === currentJqXHR_HS) {
		// inform error 
		//	setTimeout(HostToSat,100,lastDataHS);
			HostToSat(lastDataHS);
		}
	}
	
	function getSatTime() { return Date.now(); } // ????
	
	function createJsonMessage(sec, data) {
		var jsonMessage = '{"idSat":'+jsonIdSat+',"ts":'+getCurrentTime();
		if (tsInit != null) jsonMessage+=',"i":'+tsInit;
		if (sec != null) jsonMessage+=',"sec":'+sec;
		if (data != null) {
			for (var p in data) {
				if (data.hasOwnProperty(p)) {
					jsonMessage+=','+JSON.stringify(p)+':'+data[p]; // data[p] ya esta JSONed
				}
			}
		}
		jsonMessage+='}';
		jsonMessage = '{"m":'+jsonMessage+'}';
		return jsonMessage;
	}
	
	function HostToSat(data) {
		var jsonMessage = createJsonMessage(lastSecHS, data);
		/*if (isLocal) localHost.localComunicationHS(idSat, data, successHS); 
		else*/ 
		currentJqXHR_HS = communication("/hs/", jsonMessage, successHS, errorHS);
	}
	
	function retransmitSH() {
		var dataSH = constructDataSH(pendingResponseSH);
		SatToHost(dataSH);
	}
	
	function successSH(data) {
		var m;
		try {
			data = JSON.parse(data);
			m = data.m;
			if ((lastSecSH !== m.sec) || (!(m.a instanceof Array)) || (m.a.length != pendingResponseSH.length)) throw 1;
		} catch (e) {
			retransmitSH();
			return;
		}

		lastHostTime = m.ts;
		satTimeInLastHostTime = getSatTime();

		for (i=0; i<m.a.length; i++) {
			processAnswer(m.a[i], pendingResponseSH[i]);
		}
		// lastDataSH = null;
		pendingResponseSH = null;
		SHInProgress = false;
		currentJqXHR_SH = null;
		sendPendingSH();
	}
	
	function errorSH(jqXHR, textStatus, errorThrown) {
		if (jqXHR === currentJqXHR_SH) {
			SHInProgress = false;
			retransmitSH();
		}
	}
	
	function SatToHost(data) {
		SHInProgress = true;	
		createJsonMessage(lastSecSH, data)
		/*if (isLocal) localHost.localCommunicationSH(idSat, data, successSH);
		else*/ currentJqXHR_SH = communication("/sh/", json(data), successSH, errorSH);
	}

	function constructDataSH(pendingSH) {
		var dataSH = {};
		dataSH["q"] = '[';
		dataSH["q"]+= pendingSH.map(function(pr) { 
			var q = pr.q;
			
			pr.tsSend = diffCurTime(pr.ts);
			if ((pr.maxAge != null) && (pr.tsSend > pr.maxAge)) {
				q = pr.qMaxAge;
			}	
			var q2 = [];
			for (var p in pr) {
				if (pr.hasOwnProperty(p)) {
					q2.push('"'+p+'":'+pr[p]);
				}
			}
			q2.push('"age":'+pr.tsSend);
			return '{'+q2.join(",")+'}'; 
		}).join(",");
		dataSH["q"]+= ']';
		return dataSH;
	}

	function sendPendingSH() {
		if ((pendingSH.length > 0) && (!SHInProgress)) {
			lastSecSH++;
			var dataSH = constructDataSH(pendingSH);
//			lastDataSH = { "q": '['+pendingSH.map(function(el) { return el.q; }).join(',')+']' };
			pendingResponseSH = pendingSH;
			pendingSH = [];
			SatToHost(dataSH); 
		}
	}
	
	function callFunction(idObj, func, args, callback, errorHandler) {
		if (!(args instanceof Array)) args = [args];
		return send({ idObj: idObj, type: "f", func: func, args: args}, callback, errorHandler);
	}

	function json_q(q) {
		var q2 = {};
		for (var p in q) {
			if (q.hasOwnProperty(p)) q2[p] = json(q[p]);
		}
		return q2;
	}
	
	function send(q, callback) {
		// json(q) evitar datos satelite local y host al copiar arrays se clonan funcionamiento similar a satelite no local
		var o = { q: json_q(q), ts: getCurrentTime(), callback: callback };     
//		if (isLocal) {
//			processAnswer(localHost.localSendSH(localRecHS, q), o);
//		} else {
			pendingSH.push(o);
			setTimeout(sendPendingSH, 0);
//		}
		return o;
	}

/*	function localRecHS(question) {
		return processQuestion(question);
	}
*/	
	my.init = function(_idSat, localHostCommunication) {
//		localHostCommunication = _localHostCommunication;	
		isLocal = (localHostComunication != null);
		idSat = isLocal ? _idSat : String(_idSat);
		communication = isLocal ? localHostCommunication : ajaxCommunication;
		  
		jsonIdSat = JSON.stringify(idSat);

		//lastSecHS = null;
		//lastDataHS = { };
		// lastDataHS = '{"m":{"idSat":'+idSatJSON+',"i":true}}';
		//HostToSat(lastDataHS);	
		send({type:"i"},function(_tsInit) {
			tsInit = _tsInit;
		});
	}
	
	return my;
}

}); // ComSatS

