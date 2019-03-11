// Comunicacion satelites

// H.Comm: parte host
//      - registra satelites (iniciado por satelite)
//      - crea objetos en satelite,
//        ejecuta funciones en objetos de satelite,
//        envia scripts para ejecutar en satelite (iniciado por host)

// idSat : identificador de satelite, 
//         (string: si es un satelite externo),
//         (function: si es un satelite local, processQuestion de cs)

H.Comm = function () {
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
			if (satellites[i].id === idSat) // id strings son satelites externos
				return satellites[i];
		return null;	
	}

	var idsSatAllowed = [];
	for (var i=1; i<=3; i++) idsSatAllowed.push("Camarero-"+i); 
	for (var i=1; i<=3; i++) idsSatAllowed.push("Cocina-"+i); 
		
	my.getIdsSatAllowed = function() {
		return idsSatAllowed;
	}
	
	my.getSats = function() { 
		return satellites.map(function (sat) { 
			return sat.interfaceApp; 
		}); 
	}
	
	my.getSiteLocalAddresses = function() {
		var localAddresses;
		try {
			localAddresses = H.Applet.getHttpServer().http_getSiteLocalAddresses();
		} catch(e) {
			return null;
		}
		
		localAddresses = Array.prototype.slice.call(localAddresses);
		
		for (var i=0; i<localAddresses.length; ) {
			var m = localAddresses[i].match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(.*)/);	
			if (m == null) localAddresses.splice(i,1);
			else {
				var m5 = parseInt(m[5]);
				if ((m5 < 0) || (m5 > 32)) {
					localAddresses[i] = m.slice(1,5).join(".")+"/24";
				}	
				i++;	
			}
		}
		return localAddresses;
	}
	
	my.getHostInfo = function(localAddress, satAddress) {
		var info = {};
		info.user = H.ConfigGTPV.get("user", false);
		if (info.user == null) info.user="";

		var localAddresses = my.getSiteLocalAddresses();
		if (localAddresses == null) localAddresses=[];
		for (var i=0; i<localAddresses.length; i++) {
			var ip = localAddresses[i].match(/[^\/]*/)[0];
			if (ip === localAddress) {
				localAddress = localAddresses[i]; 
				break;
			}		
		}
		if (i === localAddresses.length) {
			localAddress = localAddress+"/24"; 
		}
		info.localAddress = localAddress;
		info.ipLanHost = localAddress;
		info.satAddress = satAddress;
		var idsSat = [];
		for (var i=0; i<satellites.length; i++) {
			if (!satellites[i].isLocal) idsSat.push(satellites[i].id);
		}
		var idsSatAllowed = my.getIdsSatAllowed().slice(0);
		for (var i=0; i<idsSat.length; i++) {
			var idx = idsSatAllowed.indexOf(idsSat[i]);
			if (idx !== -1) idsSatAllowed.splice(idx, 1); 
		}
		info.idsSatAllowed = idsSatAllowed;
		info.idsSat = idsSat;
		
		return info;
	}
		
	function createSat(idSat, isLocal, tsSat, prevTsInit) {
		var sat = {};
		
		var objs = [];
		function findObj(idObj) {
			for (var i=0; i<objs.length; i++) 
				if (objs[i].id === idObj) return objs[i];
			return null;		
		}
		
		sat.id = idSat; // findSat
		sat.getId = function() { return idSat; }
		
		sat.isLocal = isLocal;
		sat.tsInit = getCurrentTime();
		if (sat.tsInit === prevTsInit) sat.tsInit++; // ????

		var lastSecSH;
		var lastDataSH;
		var lastSecHS = 0;
		var pendingHS = [];
		var pendingResponseHS;
		var exchangeHS;
		var toutIdAliveHostCom = null;
		var lastSatTime = tsSat;
		var hostTimeInLastSatTime = getCurrentTime();
		var lastComHS = getCurrentTime();
		
		function getTime() {
			var delta = getCurrentTime() - hostTimeInLastSatTime;
			if (delta < 0) delta = 0; // ????
			return lastSatTime+delta;
		}

		function diffTime(timeSat0) {
			var diff = getTime()-timeSat0;
			return (diff >= 0) ? diff : 0;
		}
		
		function getAgeLastCom() {
			var age = getCurrentTime() - lastComHS;
			return (age >= 0) ? age : 0;
		}
		
		var valid = true;
		sat.destroy = function() { 
			closeExchangeHS();
			var idx = satellites.indexOf(sat);
			if (idx !== -1) satellites.splice(idx, 1);
			valid = false; 
		} 
		
		sat.processMessage = function(isSH, m, exchange) {
			lastSatTime = tsSat;
			hostTimeInLastSatTime = getCurrentTime();
			if (isSH) {
				if ((lastDataSH == null) || (lastSecSH !== m.sec)) {
					if ((m.sec == null) || (!(m.q instanceof Array))) {
						return 406;
					}
					lastSecSH = m.sec;
					var answers = [];
					m.q.forEach(function(question) {
						var answer = processQuestion(question);
						answers.push($.extend(true, {}, answer));
					});
					lastDataSH = { a: answers };
				}
				responseToS(exchange, lastSecSH, lastDataSH);
			} else {
				closeExchangeHS();
				lastComHS = getCurrentTime();
				exchangeHS = exchange;
				if (pendingResponseHS != null) { 
					if (lastSecHS !== m.sec) { 
						var dataHS = constructDataHS(pendingResponseHS);
						responseToS(exchangeHS, lastSecHS, dataHS);
						exchangeHS = null;
						clearTimeout(toutIdAliveHostCom);
						toutIdAliveHostCom = window.setTimeout(aliveHostCom, delayAliveHostCom);
						return 0; // No error
					}
					if ((!(m.a instanceof Array)) || (m.a.length !== pendingResponseHS.length)) {
						return 406;
					}
					
					var resp = pendingResponseHS;
					pendingResponseHS = null; // para readyCommToHost_HS
					
					for (var i=0; i<m.a.length; i++) {
						processAnswer(m.a[i], resp[i]);
					}
					asyncRetAnswerIdsNotArrivedYet = {};
				}

				// no sendPendingHS() evitar que el mismo thread y la misma cola de llamada vayan de host a sat a host a ...
				programSendPendingHS();
			}
			return 0; // No error
		} 
		
		var asyncRetId = 1;
		function asyncRet() {
			var answer = { type: "y" };
			var ready = false;
			function sendAsyncRet() {
				if (answer.id && ready) {
					return send(answer);
				} else return null;	
			}
			this.activate = function(age) {
				answer.id = asyncRetId++;
				answer.age = age;
				sendAsyncRet();
				return answer.id;
			}
			this.callback = function(ret, er) {
				answer.ret = ret; 
				answer.er = er;
				ready = true;
				sendAsyncRet();
			}
		}
		
		function processQuestion(question) {
			var answer = {};
	//								var idObj = getIdObj(q.idObj);
			if ((typeof question !== "object") || (question == null)) return answer;
			switch (question.type) {
				case "f" :
					var obj = findObj(question.id);
					if (obj == null) answer.er = "Error-G: Object undefined";
					else {
						obj.interfaceApp.ageQuestion = question.age;
						var async = new asyncRet();
						obj.asyncRet = async.callback;
						var func = question.func;
						var args = question.args;				 
						try {
							var ret = obj.objHost[func].apply(obj.interfaceApp, args);
							if (ret === async.callback) answer.asyncId = async.activate(question.age);
							else answer.ret = ret;
						} catch(e) {
							console.log(e.message);
							console.log(e.stack);
							answer.er = e.toString();
						}
						obj.interfaceApp.ageQuestion = null;
						obj.asyncRet = null;
					}
					break;
				case "y" : // async
					var tempPendResp = asyncRetPendResponses[question.id];
					if (tempPendResp != null) {
						delete asyncRetPendResponses[question.id];
						processAnswer(question, tempPendResp);
					} else asyncRetAnswerIdsNotArrivedYet[question.id] = question;
					break;
			}
			answer.age = question.age;
			return answer;
		}

		var asyncRetPendResps = {};
		var asyncRetAnswerIdsNotArrivedYet = {};

		function processAnswer(answer, pendResp) {
			if ((typeof answer !== "object") || (answer == null)) answer = {};
			if (answer.asyncId != null) {
				var tempAnsw = asyncRetAnswerIdsNotArrivedYet[answer.asyncId]; 
				if (tempAnsw == null) {
					asyncRetPendResps[answer.asyncId] = pendResp;
					return;
				} else {
					delete asyncRetAnswerIdsNotArrivedYet[answer.asyncId];
					answer = tempAnsw;
				}
			}
			if (pendResp.params) pendResp.params.pendingResp--;
			if (typeof pendResp.callback === "function") {
				try {
					// callback siempre se llama, si hay retorno o error
					var obj = null;
					if (pendResp.q.id != null) obj = findObj(pendResp.q.id).interfaceApp;
					pendResp.callback.call(obj, answer.ret, answer.er, diffCurTime(pendResp.ts), answer.age );
				} catch(e) {
					console.log(e.message);
					console.log(e.stack);
				}
			}
		}

		var fSendPendingHS = false;
		var dataAvailableHS = false;
		
		function programSendPendingHS(_dataAvailableHS) {
			if (_dataAvailableHS === true) dataAvailableHS = true;
			if (!fSendPendingHS) {
				window.setTimeout(sendPendingHS, 0);
				fSendPendingHS = true;
			}
		}
		
		function send(q, callback, params) {
			var o = { q: $.extend(true, {}, q), callback: callback, ts: getCurrentTime(), params: params }; 
			if (params) params.pendingResp++;
			pendingHS.push(o);
			programSendPendingHS(true);
			return o;
		}
		
		function constructDataHS(pendingHS) {
			var dataHS = {};
			dataHS.q = pendingHS.map(function(pr) { 
				var q = pr.q;
				
				pr.tsSend = diffCurTime(pr.ts);
				var parm = pr.params;
				if (parm && (parm.maxAge != null) && (pr.tsSend > parm.maxAge)) {
					q = parm.qMaxAge;
				}	
				q.age = pr.tsSend;
				return q; 
			});
			return dataHS;
		}
		
		function readyCommToSat_HS() {
			return (exchangeHS && (pendingResponseHS == null));
		}
		function sendPendingHS() {
			fSendPendingHS = false;
			if (readyCommToSat_HS() && dataAvailableHS) {
				objs.forEach(function(obj) {
					if (typeof obj.availableCommHandler === "function") 
						obj.availableCommHandler.call(obj.interfaceApp, obj.interfaceApp); // ???? 
				});
				
				clearTimeout(toutIdAliveHostCom);
				toutIdAliveHostCom = window.setTimeout(aliveHostCom, delayAliveHostCom);
				
				lastSecHS++;
				
				var dataHS = constructDataHS(pendingHS);
				pendingResponseHS = pendingHS;
				pendingHS = [];
				dataAvailableHS = false;

				var exchange = exchangeHS; // respuesta en el mismo thread en satelite local
				exchangeHS = null;
				responseToS(exchange, lastSecHS, dataHS);

				return true; 
			}
			return false;
		}

		var delayAliveHostCom = 10000; 
		function aliveHostCom() {
//			console.log("3- aliveHostCom ("+Date.now()/1000+") : "+toutIdAliveHostCom); 
			programSendPendingHS(true);
		}

		function createMessage(sec, data) {		
			var m = {ts: getCurrentTime()};
			if (sec != null) m.sec = sec; // sec siempre es != null en Host ?
			$.extend(m, data);
			return m;
		}
		
		function responseToS(exchange, sec, data) {
			var m = createMessage(sec, data);
			sendMessageToExchange(m, exchange, sat.isLocal);
		}

		function closeExchangeHS() {
			if (exchangeHS != null) {
				if (!isLocal) applet.httpEx_close(exchangeHS);
				exchangeHS = null;	
			}
		}
		
		sat.interfaceApp = {
			getId : function() { return idSat; },
			isLocal : function() { return isLocal; },
			isValid : function() { return valid; },
			checkReadyComm : readyCommToSat_HS,
			readyComm : function() { programSendPendingHS(true); },
			getTime : getTime,
			diffTime : diffTime,
			getAgeLastCom : getAgeLastCom,
			destroy : sat.destroy,
			createObj : function(idObj, createObjSat, createObjHost, callback, availableCommHandler) {
				if (findObj(idObj) != null) {
					if (typeof callback === "function") callback(undefined, "G-Error: Object already defined", 0);
					return null;
				}
				var argsSat = [];
				if (createObjSat instanceof Array) {
					argsSat = createObjSat.slice(1);
					createObjSat = createObjSat[0];	
				}
				
				var vaild = true;
				var obj = {
					id: idObj, // findObj
					availableCommHandler: availableCommHandler,
					asyncRet : null,
					maxAge : null,
					qMaxAge : { id: idObj, type: "e", er: "G-Error: MaxAge" },
					pendingResp : 0,
					interfaceApp : {
						getId : function() { return idObj; },
						isValid : function() { return valid; },
						setMaxAge : function(_maxAge) { maxAge = _maxAge; },
						call : function(func, args, callback) {
							if (!(args instanceof Array)) args = [args];
							return send({id: idObj, type: "f", func: func, args: args}, callback, obj);
						},
						destroy : function(callback) {
							valid = false;
							var idx = objs.indexOf(obj);
							if (idx !== -1) objs.splice(idx, 1);
							return send({id: idObj, type: "d"}, callback, obj);
						},
						data : {},
						getSat : function() { return sat.interfaceApp; },
						getAsyncRet : function () { return obj.asyncRet; },
						getPendingResp : function() { return obj.pendingResp; },
						checkReadyComm : sat.interfaceApp.checkReadyComm,
						readyComm : sat.interfaceApp.readyComm,
					},
				};
				objs.push(obj);
				var argsHost = [];
				if (createObjHost instanceof Array) {
					argsHost = createObjHost.slice(1);
					createObjHost = createObjHost[0];	
				}
				argsHost.unshift(obj.interfaceApp);
				obj.objHost = createObjHost.apply(obj.interfaceApp, argsHost);
				
				send({id: idObj, type: "c", obj: createObjSat, args: argsSat}, callback, obj);
				
				return obj.interfaceApp;
			},
			sendScript : function(s, callback) {
				return send({type: "s", script: s.toString()}, callback);
			},
			sendFunctionExecute : function(s, callback) {
				return send({type: "s", script : "("+s.toString()+")();"}, callback);
			},
			sendObjectAssign : function(name, obj, callback) {
				return send({type: "s", script: name+" = "+objectToUnEval(obj)+";"}, callback);
			},
			data : {}
		};
		// message initialize
		send({type: "i", tsInit: sat.tsInit});
		return sat;
	}
	
	// todos usan el mismo tiempo para evitar diferencias en objectos relacionados
	var currentTime; 

	function clearCurrentTime() {
		currentTime = null;
	}
	
	function getCurrentTime() {
		if (currentTime == null) {
			currentTime = getHostTime();
			window.setTimeout(clearCurrentTime, 0);
		}
		return currentTime;
	}
	
	function diffCurTime(time0) {
		var t = getCurrentTime()-time0;
		return (t>=0) ? t : 0;
	}
	
	
	function json(obj) {
		return JSON.stringify(obj);
	}
	
	function objectToUnEval(obj, aObjs) {
		if (aObjs == null) aObjs=[];
		if (obj && (typeof obj === "object")) {
			if (aObjs.indexOf(obj) !== -1) throw new TypeError("circular structure in objectToUnEval");
			aObjs.push(obj);
			var ret;
			if (obj instanceof Array) {
				ret = '['+obj.map(function(el) { return objectToUnEval(el, aObjs); }).join(',')+']';
			} else {
				var str='{', sep='';
				for (var p in obj) {
					str += sep+p+':'+objectToUnEval(obj[p], aObjs);
					sep = ',';
				}
				str += '}';
				ret = str;
			}
			aObjs.pop();
			return ret;
		} else if (typeof obj === "string") {
			return '"'+obj.replace(/["\\]/g,function(c) { return "\\"+c; })+'"';
		} else return String(obj);
	}
	
	function getHostTime() { return Date.now(); } // ????
	
	function sendMessageToExchange(m, exchange, isLocal) {
		if (isLocal) { 
			exchange(objectToUnEval(m));
		} else {
			var httpEx = exchange;
			applet.httpEx_responseHeader(httpEx, "Content-Type", "text/plain");
			applet.httpEx_response_String(httpEx, 200, objectToUnEval(m), true, null);
		}
	}	
	
	my.localCommunication = function(url, reqBody, exchange) {
		var rCode = processReqBodySat(true, (url === "/sh/"), reqBody, exchange);
		if (rCode != 0) {
			console.log("Error localCommunication : "+rCode);	
		}
		return { abort: function() {}, toString: function() { return "local jqXHR"; } };
	}

	function processReqBodySat(isLocal, isSH, reqBody, exchange) {
		var m;
		try {
			var m = JSON.parse(reqBody);
			if ((typeof m !== "object") || (m == null)) m = {};
		} catch(e) {
			return 400;
		}
		
			// idSat externo es string, numerico es local
			// seguridad para que un satelite externo interfiera con el local
		var idSat = isLocal ? m.idSat : String(m.idSat); 
		var sat = findSat(idSat);	
		if (!isSH && (m.i == null)) {
			var newSat = createSat(idSat, isLocal, m.ts, (sat ? sat.tsInit : null));

			if (registrationHandler(newSat.interfaceApp, sat ? sat.interfaceApp : null)) {
				if (sat) {
					sat.destroy();
				}

				sat = newSat;
				satellites.push(sat);
			} else {					
				newSat.destroy();
				return 401;
			}
		} else {
			if (!sat || (m.i !== sat.tsInit)) {
				var m = { r: true, ts: getCurrentTime(), er: (sat ? "conflict" : "reinit") };
				sendMessageToExchange(m, exchange, isLocal);
				return 0;
			}
		}
		if (sat.isLocal != isLocal) return 401;
		if (sat == null) return 401;
		return sat.processMessage(isSH, m, exchange);
	}
	
	function httpHandler(httpEx, method, path, query, address, localAddress) {
		// para poder debugar
		window.setTimeout(httpHandler2, 0, httpEx, method, path, query, address, localAddress);
	}
	function httpHandler2(httpEx, method, path, query, address, localAddress) {
		var reqBody = "";
		var idSat = null;
		var isSH;
		
		function getReqBody(str, reader) {
			if (typeof str === "undefined") { reader = null; }
			else { 
				if (str === null) { applet.httpEx_close(httpEx); return; }
				if (str.length == 0) {
					// para poder debugar
					window.setTimeout(function() { 
						var rCode = processReqBodySat(false, isSH, reqBody, httpEx);
						if (rCode != 0) applet.httpEx_response_String(httpEx, rCode, null, true, null); // sendHttpStatusCode(rCode);
					}, 0);
					return;
				}
				reqBody += str;
			}
			applet.httpEx_requestBody_UTF8(httpEx, reader, 1024, getReqBody);
		}
		function sendHttpStatusCode(rCode) {
			applet.httpEx_response_String(httpEx, rCode, null, true, null);	
		}

		applet.httpEx_responseHeader(httpEx, "Cache-Control", "no-cache");
		applet.httpEx_responseHeader(httpEx, "Conection", "close");
		applet.httpEx_responseHeader(httpEx, "Server", "GTPV Server");

		switch (method) {
			case "GET":
			case "POST":
			case "HEAD":
				break;
			default:
				sendHttpStatusCode(405);
				return;
		}

		if ((method === "POST") && ((path === "/sh/") || (path === "/hs/"))) {
			isSH = (path === "/sh/");
			getReqBody();
		} else if ((method == "GET") && (path ==="/r/") && (query != null)) {
			idSat = /^(\w*)/.exec(query)[0];
			applet.httpEx_responseHeader(httpEx, "Set-Cookie", "id="+idSat+" ; Path=/; Max-age="+(36500*24*60*60)+")");
			applet.httpEx_responseHeader(httpEx, "Location", "/");
			sendHttpStatusCode(303);
		} else if (path === "/_gtpv/ident.php") {
			applet.httpEx_responseHeader(httpEx, "Content-Type", "text/javascript");
			var body = getHostIdent(localAddress, address, query);
			applet.httpEx_response_String(httpEx, 200, body, true);			
		} else {
			var info = { /*idSat: idSat,*/ method: method, path: path, query: query, address: address, localAddress: localAddress};
			
			var file;
			file = H.Web.findFile(handlersWeb, path, false, info);
			function sendResponseFile(file) {
				if (file != null) {
					var	body = file.content; // (file.utf8 || file.binary) ? file.content : StringToANSI(file.content);
					applet.httpEx_responseHeader(httpEx, "Content-Type", file.type);
					if (method === "HEAD") {
						applet.httpEx_responseHeader(httpEx, "Content-Length", ""+body.length);	
						body = null;
					}
					if (file.binary) {
						applet.httpEx_response_String_u0100(httpEx, 200, body);
					} else{
						applet.httpEx_response_String(httpEx, 200, body, file.utf8);
					} 	
				} else applet.httpEx_response_String(httpEx, 404, null, true); // sendHttpStatusCode(404);
			}
			if (typeof file === "function") {
				file(sendResponseFile);
			} else sendResponseFile(file);
		}
	}
	

	var registrationHandler = function(newSat, oldSat) { return true; };
	
	my.init = function(callbackInit, _registrationHandler) {
		if (_registrationHandler != null) registrationHandler = _registrationHandler;
		try {
			applet = H.Applet.getHttpServer();
			if (applet != null) {
				var http = applet.http_create(my.port, my.addr, my.backlog);
				if (http != null) {
					httpServer = http;
					var httpContext = applet.http_createContext(httpServer, "/", httpHandler);
					if (typeof callbackInit === "function") callbackInit();
					applet.http_start(httpServer);
					return true;
				}
			}
		} catch(e) {}
		window.setTimeout(my.init, 1000, callbackInit);
		return false;	
	}
	my.stop = function() {
		applet.http_stop(httpServer);
		httpServer = null;
	}

	var handlersWeb = [];
	my.handlersWeb = handlersWeb;
	my.addHandlerWeb = function(handler) {
		handlersWeb.push(handler);
	}
	
	return my;	
}();

H.Scripts.add("ComSatS", "L2C", function() {

window.CommS = function () {
	var my = {};

	var localHost;
	var idSat;
	var tsInit;
	var lastDataHS = null;
	var lastSecHS = null;

	var pendingSH = [];
	var lastSecSH = 0;
	var	pendingResponseSH = null;

	var objs = [];
	var currentJqXHR_HS = null, currentJqXHR_SH = null;
	
	var isLocal;
	
	var lastHostTime = 0, satTimeInLastHostTime = 0;
	var lastComHS = 0;
	
	my.timeout = 15000;

	function findObj(id) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].id === id) return objs[i];
		}
		return null;
	}
	
	function createObj(idObj) {
		var obj = {
			id : idObj, // findObj
			isValid : true,
			asyncRet : null,
			pendingResp : 0,
			interfaceApp : {
				getId : function() { return idObj; },
				getIdSat : function() { return idSat; },
				isLocal : function() { return isLocal; },
				isValid : function() { return isValid; },
				checkReadyComm : readyCommToHost_SH,
				readyComm : function() { programSendPendingSH(true); },
				call : function(func, args, callback) {
					if (!(args instanceof Array)) args = [args];
					return send({ id: idObj, type: "f", func: func, args: args}, callback, obj);
				},
				ageQuestion : null,
				getHostTime : getHostTime,
				getTs : getHostTime,
				getAgeLastCom : getAgeLastCom,
				getSatTime : getSatTime,
				data : {},
				getAsyncRet : function() { return obj.asyncRet; },
				getPendingResp : function() { return obj.pendingResp; }
			}
		}	
		return obj;
	}

	var asyncRetId = 1;
	function asyncRet() {
		var answer = { type: "y" };
		var ready = false;
		function sendAsyncRet() {
			if (answer.id && ready) send(answer);
		}
		this.activate = function(age) {
			answer.id = asyncRetId++;
			answer.age = age;
			sendAsyncRet();
			return answer.id;
		}
		this.callback = function(ret, er) {
			if (ready) throw new Error("asyncRet");
			answer.ret = ret; 
			answer.er = er;
			ready = true;
			sendAsyncRet();
		}
	}
	
	function processQuestion(question) {
		var answer = {};
		if ((typeof question !== "object") || (question == null)) return answer;
		switch (question.type) {
			case "c" :
				if (findObj(question.id) != null) answer.er = "G-Error: Object already defined";
				else {
					var obj = createObj(question.id);
					obj.interfaceApp.ageQuestion = question.age;
					objs.push(obj);
					var args = question.args || [];
					args.unshift(obj.interfaceApp);
					try { 
						obj.objSat = question.obj.apply(obj.interfaceApp, args);
						answer.ret = true;
					} catch(e) {
						console.log(e.message);
						console.log(e.stack);
						answer.er = e.toString();
					}
					obj.interfaceApp.ageQuestion = null;
				}
				break;
			case "f" :
				var obj = findObj(question.id);
				if (obj == null) answer.er = "G-Error: Object undefined";
				else {
					obj.interfaceApp.ageQuestion = question.age;
					var async = new asyncRet();
					obj.asyncRet = async.callback;
					var func = question.func;
					var args = question.args;				 
					try {
						var ret = obj.objSat[func].apply(obj.interfaceApp, args);
						if (ret === async.callback) answer.asyncId = async.activate(question.age);
						else answer.ret = ret;
					} catch(e) {
						console.log(e.message);
						console.log(e.stack);
						answer.er = e.toString();
					}
					obj.interfaceApp.ageQuestion = null;
					obj.asyncRet = null;
				}
				break;
			case "d" :
				var obj = findObj(question.id);
				if (obj == null) answer.er = "G-Error: Object undefined";
				else {
					obj.isValid = false;
					objs.splice(objs.indexOf(obj), 1);
					answer.ret = true;
				}
				break;
			case "s" :
				try {
					$.globalEval(question.script);
					//eval.call(window, question.script);
					answer.ret = true;
				} catch(e) {
					console.log(e.message);
					console.log(e.stack);
					answer.er = e.toString();
				}
				break;
			case "e" :
				answer.er = question.er;
				break;
			case "i" :
				tsInit = question.tsInit;
				answer.ret = true;
				break;
			case "y" : // async
				var tempPendResp = asyncRetPendResponses[question.id];
				if (tempPendResp != null) {
					delete asyncRetPendResponses[question.id];
					processAnswer(question, tempPendResp);
				} else asyncRetAnswerIdsNotArrivedYet[question.id] = question;
				break;
			case null:
			default:	
				// message canceled
		}
		answer.age = question.age;
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
			window.setTimeout(clearCurrentTime, 0);
		}
		return currentTime;
	}
	
	function diffCurTime(time0) {
		var t = getCurrentTime()-time0;
		return (t>=0) ? t : 0;
	}
	
	var asyncRetPendResps = {};
	var asyncRetAnswerIdsNotArrivedYet = {};
	
	function processAnswer(answer, pendResp) {
		if ((typeof answer !== "object") || (answer == null)) answer = {};
		if (answer.asyncId != null) {
			var tempAnsw = asyncRetAnswerIdsNotArrivedYet[answer.asyncId]; 
			if (tempAnsw == null) {
				asyncRetPendResps[answer.asyncId] = pendResp;
				return;
			} else {
				delete asyncRetAnswerIdsNotArrivedYet[answer.asyncId];
				answer = tempAnsw;
			}
		}
		if (pendResp.params) pendResp.params.pendingResp--;
		if (typeof pendResp.callback === "function") {
			try {
				// callback siempre se llama, si hay retorno o error
				var obj = null;
				if (pendResp.q.id != null) obj = findObj(pendResp.q.id).interfaceApp;
				pendResp.callback.call(obj, answer.ret, answer.er, diffCurTime(pendResp.ts), answer.age );
			} catch(e) {
				console.log(e.message);
				console.log(e.stack);
			}
		}
	}

	function json(obj) {
		return JSON.stringify(obj);
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

	function getHostTime() { // ????
		var delta = getCurrentTime() - satTimeInLastHostTime;
		if (delta < 0) delta = 0; // ????
		return lastHostTime+delta;
	}
	
	function getAgeLastCom() {
		var age = getCurrentTime() - lastComHS;
		return (age >= 0) ? age : 0;
	}
	
	function reInit(er) {
		$("body").empty().html("&nbsp;&nbsp;reiniciando... razon: "+er);
		window.setTimeout(function() { window.location.reload(true); }, 5000);
	}
	
	function successHS(data, textStatus, jqXHR) {
		var m;

		console.log("successHS ("+Date.now()/1000+") : "+(jqXHR === currentJqXHR_HS)+" : "+
		            textStatus+" : "+data.substr(0,10)+" : "+jqXHR);
		try {
			m = eval.call(window, "("+data+")");
			if (m.r) {
				reInit(m.er);
				return;
			}
			if ((m.sec == null) || (!(m.q instanceof Array))) throw 1;
		} catch(e) {
			console.log("2 successHS: retransmit");
			HostToSat(null); 
			return;
		}
		if (/*(lastDataHS != null) &&*/ (lastSecHS === m.sec)) { 
			console.log("3 successHS: retransmit");
			HostToSat(lastDataHS); 
			return;	
		} 

		lastHostTime = (typeof(m.ts) === "number") ? m.ts : getCurrentTime();
		satTimeInLastHostTime = getCurrentTime();
		lastComHS = getCurrentTime();
		
		var answers = [];
		for (var i=0; i<m.q.length; i++) {
			var question = m.q[i];
			var answer = processQuestion(question);
			answers.push($.extend(true, {}, answer));
		}
		lastSecHS = m.sec;
		lastDataHS = { a: answers };
		HostToSat(lastDataHS);
	}

	function errorHS(jqXHR, textStatus, errorThrown) {
		console.log("errorHS ("+Date.now()/1000+") : "+(jqXHR === currentJqXHR_HS)+" : "+
		             textStatus+" : "+errorThrown+" : "+currentJqXHR_HS);
		if (jqXHR === currentJqXHR_HS) {
			window.setTimeout(HostToSat, 5000, lastDataHS);
		}
	}
	
	function getSatTime() { return Date.now(); } // ????
	
	function createMessage(sec, data) {
		var m = {idSat: idSat, ts: getCurrentTime()};
		if (tsInit != null) m.i = tsInit;
		if (sec != null) m.sec = sec; // init HS no tiene sec
		$.extend(m, data);
		return m;
	}
	
	function HostToSat(data) {
		var m = createMessage(lastSecHS, data);
		currentJqXHR_HS = communication("/hs/", json(m), successHS, errorHS);
		console.log("HtoS ("+Date.now()/1000+") : "+m.sec+" : "+currentJqXHR_HS.toString());
	}
	
	function retransmitSH() {
		var dataSH = constructDataSH(pendingResponseSH);
		SatToHost(dataSH);
	}
	
	function successSH(data) {
		var m;
		try {
			m = eval.call(window, "("+data+")");
			if (m.r) {
				reInit(m.er);
				return;
			}
			if ((lastSecSH !== m.sec) || (!(m.a instanceof Array)) || (m.a.length != pendingResponseSH.length)) throw 1;
		} catch(e) {
			retransmitSH();
			return;
		}

		lastHostTime = m.ts;
		satTimeInLastHostTime = getSatTime();

		var resp = pendingResponseSH;
		pendingResponseSH = null; // para readyCommToHost_SH
		
		for (var i=0; i<m.a.length; i++) {
			processAnswer(m.a[i], resp[i]);
		}
		asyncRetAnswerIdsNotArrivedYet = {};
		currentJqXHR_SH = null;
		// no sendPendingSH() evitar que el mismo thread y la misma cola de llamada vayan de sat a host a sat a ... 
		programSendPendingSH();

	}
	
	function errorSH(jqXHR, textStatus, errorThrown) {
		if (jqXHR === currentJqXHR_SH) {
			currentJqXHR_SH = null;
			console.log("Error SH : "+textStatus+" : "+errorThrown);
//			SHInProgress = false;
			window.setTimeout(retransmitSH, 5000); // ????
		}
	}
	
	function SatToHost(data) {
		var m = createMessage(lastSecSH, data)
		currentJqXHR_SH = communication("/sh/", json(m), successSH, errorSH);
	}

	function constructDataSH(pendingSH) {
		var dataSH = {};
		dataSH.q = pendingSH.map(function(pr) { 
			var q = pr.q;
			
			pr.tsSend = diffCurTime(pr.ts);
			var parm = pr.params;
			if (parm && (parm.maxAge != null) && (pr.tsSend > parm.maxAge)) {
				q = parm.qMaxAge;
			}	
			q.age = pr.tsSend;
			return q; 
		});
		return dataSH;
	}

	function readyCommToHost_SH() {
		return ((pendingResponseSH == null) && (tsInit != null));
	}
	function sendPendingSH() {
		fSendPendingSH = false;
		if (readyCommToHost_SH() && dataAvailableSH) {
			lastSecSH++;
			var dataSH = constructDataSH(pendingSH);
			pendingResponseSH = pendingSH;
			pendingSH = [];
			dataAvailableSH = false;
			SatToHost(dataSH); 
		}
	}
	
	var fSendPendingSH = false;
	var dataAvailableSH = true;
	
	function programSendPendingSH(_dataAvailableSH) {
		if (_dataAvailableSH === true) dataAvailableSH = true;	
		if (!fSendPendingSH) {
			window.setTimeout(sendPendingSH, 0);
			fSendPendingSH = true;
		}
	}
	
	function send(q, callback, params) {
		// deep-copy(q) evitar datos satelite local y host al copiar arrays se clonan funcionamiento similar a satelite no local
		var o = { q: $.extend(true, {}, q) /* deep-copy */, ts: getCurrentTime(), callback: callback, params: params };     
		if (params) params.pendingResp++;
		pendingSH.push(o);
		programSendPendingSH(true);
		return o;
	}

	my.init = function(_idSat, localHostCommunication) {
		isLocal = (localHostCommunication != null);
		idSat = isLocal ? _idSat : String(_idSat);
		communication = isLocal ? localHostCommunication : ajaxCommunication;
		  
		HostToSat();
	}
	
	var nWaits = 0;
	var thresholdDisconnected = 40000;
	var nMaxWaits = 0;
	
	window.supervCom = {
		wait : function() { 
			nMaxWaits = Math.max(nWaits++, nMaxWaits); 
			return nWaits++; 
		},
		unwait : function() { return --nWaits; },
		pending : function() { 
			if (nWaits > 0) return nWaits/nMaxWaits;
			else return false;
		},	
		disconnected : function() { return getAgeLastCom()-thresholdDisconnected; }
	}	
	
	return my;
}();

}); // add Scripts ComSatS

