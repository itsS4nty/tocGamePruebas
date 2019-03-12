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
	
	my.setIdSat = function(_id) { idSat = _id; }
	my.timeout = 10000;

	function getObj(id) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].id === id) return objs[i];
		}
		return null;
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
		return function(func, args, callback, errorHandler) {
			return sendMessage(idObj, func, args, callback, errorHandler);
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
				case "m" :
					var obj = getObj(question.idObj);
					if (obj == null) answer.er = "G-Error: Object undefined";
					else {
						try {
							if ((!obj.objLocal instanceof Object) || (!obj.objLocal.hasOwnProperty(question.func)) || 
							    (typeof obj.objLocal[question.func] != "function")) 
								throw new GError(question.func+" is not a function");
							answer.ret = obj.objLocal[question.func].apply(obj.com, question.args);
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
				case null:
				default:	
					// message canceled
			}
			answers.push(answer);
		}
		lastDataHS = { m : { idSat: idSat, idxSec: m.idxSec, a: answers } };
		HostToSat(lastDataHS);
	}

	function errorHS(jqXHR, textStatus, errorThrown) {
		if (jqXHR === currentJqXHR_HS) {
		// inform error 
			HostToSat(null);
		}
	}
	
	function HostToSat(data) {
		if (data == null) data = { m : { idSat: idSat } };
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
			try {
				var answer = m.a[i];
				if ((typeof answer !== "object") || (answer == null)) answer = {};
				if ((answer.er != null) && (typeof pendingResponseSH[i].errorHandler === "function")) { 
					pendingResponseSH[i].errorHandler(answer.er);
				}  else {
					if (typeof pendingResponseSH[i].callback === "function") 
						pendingResponseSH[i].callback(answer.ret);
				}
			} catch(e) {
				console.log(e);
			}
		}
		lastDataSH = null;
		pendingResponseSH = null;
		SHInProgress = false;
		currentJqXHR_SH = null;
		sendPendingSH();
	}
	
	function errorSH(jqXHR, textStatus, errorThrown) {
		if (jqXHR === currentJqXHR_SH) {
			retransmitSH();
		}
	}
	
	function SatToHost(data) {
		SHInProgress = true;	
		currentJqXHR_SH = communication("/sh/", json(data), successSH, errorSH);
	}

	function sendPendingSH() {
		if (pendingSH.length > 0) {
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
	
	function sendMessage(idObj, func, args, callback, errorHandler) {
		return send({ idObj: idObj, type: "m", func: func, args: args}, callback, errorHandler);
	}
	
	function send(q, callback, errorHandler) {
		var o = { q: q, callback: callback, errorHandler: errorHandler };
		pendingSH.push(o);
		if (!SHInProgress) sendPendingSH();
		return o;
	}

	my.init = function() {
		HostToSat(null);	
	}
}
