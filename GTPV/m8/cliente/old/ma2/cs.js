function cs() {
	var my = this;
//	var host;
	var idSat;
	var lastDataHS = null;

	var SHInProgress = false;
	var idxSecSH = 1;
	var pendingSH = [];
	var lastDataSH = null;
	var	pendingResponseSH = null;

	var objs = [];
	var currentJqXHR_HS = null, currentJqXHR_SH = null;
	
	var isLocal;
//	my.setIdSat = function(_id) { idSat = _id; }
	my.timeout = 10000;

	function getObj(id) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].id === id) return objs[i];
		}
		return null;
	}
	
	function processQuestion(question) {
		var answer = {};
		switch (question.type) {
			case "c" :
				if (getObj(question.idObj) != null) answer.er = "G-Error: Object already defined";
				else {
					try { 
						var obj = {};
						obj.id = question.idObj;
						obj.objLocal = (eval("("+question.obj+")"))(newOutputCom(question.idObj));	
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
						if ((!obj.objLocal instanceof Object) || (!obj.objLocal.hasOwnProperty(question.func)) || 
							(typeof obj.objLocal[question.func] != "function")) 
							throw new GError(question.func+" is not a function");
						answer.ret = obj.objLocal[question.func].apply(obj.objLocal, question.args);
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
			case null:
			default:	
				// message canceled
		}
		return answer;
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

	function json(obj) {
		try {
			return JSON.stringify(obj, function(k,v) { return (typeof v === "function") ? v.toString() : v; });
		} catch(e) {
			return "null";
		}
	}
	
	function communication(url, data, success, error) {
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
	
	function newOutputCom(idObj) {
		return {
			call : function(func, args, callback, errorHandler) {
				return callFunction(idObj, func, args, callback, errorHandler);
			},
			isLocal : isLocal
		}
	}
	
	function successHS(data) {
		var m;
		try {
			data = JSON.parse(data);
			m = data.m;
			if ((m.idxSec == null) || (!(m.q instanceof Array))) throw 1;
		} catch (e) {
			HostToSat(null); 
			return;
		}
		if ((lastDataHS != null) && (lastDataHS.m.idxSec === m.idxSec)) { 
			HostToSat(lastDataHS); 
			return;	
		} 

		var answers = [];
		for (i=0; i<m.q.length; i++) {
			var question = m.q[i];
			var answer = processQuestion(question);
			answers.push(answer);
		}
		lastDataHS = { m: { idSat: idSat, idxSec: m.idxSec, a: answers } };
		HostToSat(lastDataHS);
	}

	function errorHS(jqXHR, textStatus, errorThrown) {
		if (jqXHR === currentJqXHR_HS) {
		// inform error 
		//	setTimeout(HostToSat,100,lastDataHS);
			HostToSat(lastDataHS)
		}
	}
	
	function HostToSat(data) {
		if (data == null) data = { m: { idSat: idSat } };
		currentJqXHR_HS = communication("/hs/", json(data), successHS, errorHS);
	}
	
	function retransmitSH() {
		SatToHost(lastDataSH);
	}
	
	function successSH(data) {
		var m;
		try {
			data = JSON.parse(data);
			m = data.m;
			if ((lastDataSH.m.idxSec !== m.idxSec) || (!(m.a instanceof Array)) || (m.a.length != pendingResponseSH.length)) throw 1;
		} catch (e) {
			retransmitSH();
			return;
		}
		for (i=0; i<m.a.length; i++) {
			processAnswer(m.a[i], pendingResponseSH[i]);
		}
		lastDataSH = null;
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
		currentJqXHR_SH = communication("/sh/", json(data), successSH, errorSH);
	}

	function sendPendingSH() {
		if ((pendingSH.length > 0) && (!SHInProgress)) {
			lastDataSH = { m: { idSat: idSat, idxSec: idxSecSH, q: [] } };
			idxSecSH++;
			for (var i=0; i<pendingSH.length; i++) {
				lastDataSH.m.q.push(pendingSH[i].q);
			}
			pendingResponseSH = pendingSH;
			pendingSH = [];
			SatToHost(lastDataSH); 
		}
	}
	
	function callFunction(idObj, func, args, callback, errorHandler) {
		return send({ idObj: idObj, type: "f", func: func, args: args}, callback, errorHandler);
	}
	
	function send(q, callback, errorHandler) {
		var o = { q: q, callback: callback, errorHandler: errorHandler };
		if (isLocal) {
			processAnswer(idSat.localSendSH(my.localRecHS, q), o);
		} else {
			pendingSH.push(o);
			setTimeout(sendPendingSH, 0);
		}
		return o;
	}

	function localRecHS(question) {
		return processQuestion(question);
	}
	
	my.init = function(_idSat) {
		idSat = _idSat;
		isLocal = (typeof idSat !== "string"); 
		if (isLocal) idSat.localSatInit(localRecHS); // idSat == CH
		else HostToSat({ m: { idSat: idSat, i: {} } });	
	}
}
