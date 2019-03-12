(function () {

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
	var lastTsComHS = 0;
	
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
	
	var asyncRetPendResponses = {};
	var asyncRetAnswerIdsNotArrivedYet = {};
	
	function processAnswer(answer, pendResp) {
		if ((typeof answer !== "object") || (answer == null)) answer = {};
		if (answer.asyncId != null) {
			var tempAnsw = asyncRetAnswerIdsNotArrivedYet[answer.asyncId]; 
			if (tempAnsw == null) {
				asyncRetPendResponses[answer.asyncId] = pendResp;
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
		var age = getCurrentTime() - lastTsComHS;
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
		lastTsComHS = getCurrentTime();
		
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

})(window);
