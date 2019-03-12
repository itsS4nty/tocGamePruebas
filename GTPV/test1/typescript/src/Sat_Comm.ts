/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="Common_CommHS.ts" />

module Sat_Comm {
	import C = Common_CommHS;

	interface RObj {
		id: string;
		iApp: IAppRObj;
		stubSat:StubSat;
		asyncAnswerSCallback: AsyncAnswerSCallback;
		ageQuestion: number;
		isDestroyed: boolean;
	}
	interface StubSat {
		[funcName:string] : (...rest:any[]) => any;
	}
	export interface IAppRObj {
		id: string;
		idSat: string;
		isLocal: boolean;
		call(funcName: string, args: any, callback: CallbackSendQ ): ISendQ;
		isDestroyed: boolean;
		asyncAnswer: AsyncAnswerSCallback; 
		pendingAnswers: number;
		ageQuestion: number;
		isCommToHostAvailable : boolean;
		commToHostAvailable(iApp: IAppRObj) : void;
		appData: any;
	}
	interface AsyncAnswerSCallback{ (ret:any, er?:string):void };

	export interface ISendQ {
		quest: C.QUEST;
		callback: CallbackSendQ;
		ts: number;
		params: ParamsSendQ;
		ageSend?: number;
	}
	export interface CallbackSendQ_Ages {
		send: number;
//		receive: number;
		async: number;
		total: number;
	}
	export interface CallbackSendQ { 
		(ret:any, er:string, ages: CallbackSendQ_Ages):void
	}
	interface ParamsSendQ {
		pendingAnswers:number;
	} 

	var rObjs:RObj[] = [];
	
	function findRObj(idObj:string):RObj {
		for (var i=0; i<rObjs.length; i++) 
			if (rObjs[i].id === idObj) return rObjs[i];
		return null;		
	}
	
//	var my = {};

//	var localHost;
	var idSat: string;
	var tsInit: number;
//	var lastDataHS = null;
//	var lastSecHS = null;

//	var pendingSH = [];
//	var lastSecSH = 0;
//	var pendingResponseSH = null;

	//var objs = [];
//	var currentJqXHR_HS = null, currentJqXHR_SH = null;
	
	var isLocal: boolean;
	
	var lastHostTime = 0, satTimeInLastHostTime = 0;
	var lastComHS = 0;
	
//	my.timeout = 15000;

/*	function findObj(id) {
		for (var i=0; i<objs.length; i++) {
			if (objs[i].id === id) return objs[i];
		}
		return null;
	}
*/	
	var HS = (function() {
		var lastAnswers: C.ANSW[];
		var lastSeq = 1;
		
		function createRObj(idRObj: string):RObj {
			var paramsSendQ: ParamsSendQ = { pendingAnswers : 0 };
	
			var rObj:RObj = {
				id : idRObj,
				stubSat : null,
				asyncAnswerSCallback : null,
				iApp : {
					get id() { return idRObj; },
					get idSat() { return idSat; },
					get isLocal() { return isLocal; },
					call: function (funcName: string, args: any, callback: CallbackSendQ ){
						if (!(args instanceof Array)) args = [args];
						return SH.sendQ({ type: C.TYPE_QUEST.func, idRObj, funcName, args: args}, callback, paramsSendQ);
					},
					get isDestroyed() { return rObj.isDestroyed; },
					get asyncAnswer() { return rObj.asyncAnswerSCallback; },
					get pendingAnswers() { return paramsSendQ.pendingAnswers },
					get ageQuestion() { return rObj.ageQuestion },
					isCommToHostAvailable : false,
					commToHostAvailable : null,
					appData: {}
				},
				ageQuestion : null,
				isDestroyed : false
			}	
			return rObj;
		}

		var asyncId = 1;
		function createAsyncAnswerS() {
			var asyncAnswer:C.QUEST = { type: C.TYPE_QUEST.async };
			var ready = false;
			var ts = getCurrentTime();
			function sendAsyncAnswer() {
				if ((asyncAnswer.asyncId != null) && ready) {
					SH.sendQ(asyncAnswer);
				}	
			}
			function activate() {
				asyncAnswer.asyncId = asyncId++;
				sendAsyncAnswer();
				return asyncAnswer.asyncId;
			}
			var callback: AsyncAnswerSCallback = function(ret:any, er?:string) {
				asyncAnswer.ret = ret; 
				asyncAnswer.er = er;
				asyncAnswer.asyncAge = diffCurTime(ts);
				ready = true;
				sendAsyncAnswer();
			}
			
			return  {
				activate,
				callback
			}	
		}
		
		function processQuestion(question:C.QUEST) {
			var answer:C.ANSW = {};
			if ((typeof question !== "object") || (question == null)) throw "err 1";
			var rObj:RObj;
			switch (question.type) {
				case C.TYPE_QUEST.create :
					if (findRObj(question.idRObj)) answer.er = "Object already defined "+question.idRObj;
					else {
						rObj = createRObj(question.idRObj);
						rObj.iApp.ageQuestion = question.age;
						rObjs.push(rObj);
						try { 
/*							var indirect_eval = eval; // evalua globalmente
											  // $.globalEval no devuelve nada
*/							var anonymFunc = new Function("host", question.script);
							rObj.stubSat = anonymFunc(rObj.iApp);	
							answer.ret = true;
						} catch(e) {
							console.log(e.message);
							console.log(e.stack);
							answer.er = e.toString();
						}
						rObj.iApp.ageQuestion = null;
					}
					break;
				case C.TYPE_QUEST.func :
					rObj = findRObj(question.idRObj);
					if (!rObj) answer.er = "rObj not found: "+question.idRObj;
					else {
						rObj.iApp.ageQuestion = question.age;
						var asyncAnswerS = createAsyncAnswerS();
						rObj.asyncAnswerSCallback = asyncAnswerS.callback;
						var funcName = question.funcName;
						var args = question.args;				 
						try {
							var ret = rObj.stubSat[funcName].apply(rObj.iApp, args);
							if (ret === asyncAnswerS.callback) answer.asyncId = asyncAnswerS.activate();
							else answer.ret = ret;
						} catch(e) {
							console.log(e.message);
							console.log(e.stack);
							answer.er = e.toString();
						}
						rObj.iApp.ageQuestion = null;
						rObj.asyncAnswerSCallback = null;
					}
					break;
				case C.TYPE_QUEST.destroy :
					rObj = findRObj(question.idRObj);
					if (rObj == null) answer.er = "Object undefined "+question.idRObj;
					else {
						rObj.isDestroyed = true;
						rObjs.splice(rObjs.indexOf(rObj), 1);
						answer.ret = true;
					}
					break;
				case C.TYPE_QUEST.script :
					try {
						$.globalEval(question.script);
						answer.ret = true;
					} catch(e) {
						console.log(e.message);
						console.log(e.stack);
						answer.er = e.toString();
					}
					break;
				case C.TYPE_QUEST.init :
					tsInit = question.tsInit;
					answer.ret = true;
					break;
				case C.TYPE_QUEST.async : // Async Answers son questions
					SH.asyncAnswerH(question);
					break;
				default:	
					throw "err 2";
					// message canceled
			}
//			answer.age = question.age;
			return answer;
		}



/////////////////////////

		function request() {
			var req = createRequest(lastAnswers);
			communicationHandler("/hs", req, function(_respMsg: C.RESP_MSG) {
				var respMsg = <C.HS_RESP_MSG>_respMsg;
				try {
					if ((typeof respMsg !== "object") || (respMsg == null)) throw "err 8";
					if (respMsg.error != null) {
						reInit(String(respMsg.error));
						return;
					}
					if (!(respMsg.h_quest instanceof Array)) throw "err 7";
				} catch (e) {
					console.log(e);
					return;
				}

				lastHostTime = respMsg.ts;
				satTimeInLastHostTime = getSatTime();
				lastComHS = getCurrentTime();  //??

				var answers:C.ANSW[] = [];
				respMsg.h_quest.forEach(function(question) {
					var answer = processQuestion(question);
					answers.push($.extend(true, {}, answer)); 
				});
				lastAnswers = answers;

				lastSeq++;

				request();
			}, function(jqXHR, textStatus, errorThrown) {
				window.setTimeout(request, 5000);
			});
		}
		function createRequest(answers: C.ANSW[]) : C.HS_REQ_MSG {
			return {
				tsInit,
				idSat,
				seq: lastSeq,
				ts : getCurrentTime(),
				s_answ: answers
			}
		}

		var longPolling = request;
		
		return { // HS
			longPolling	
		}
	}());
		
	var SH = (function(){
		var lastSeq = 1;
		
		var asyncAnswersData: { [asyncId:number]:ISendQ } = {};
		var asyncAnswers_IdNotArrivedYet: { [asyncId:number]:C.ANSW } = {};
	
		function processAnswer(answer:C.ANSW, sendQData: ISendQ) {
			if (answer == null) answer = {};
			if (typeof answer !== "object") throw "err 3";
			if (answer.asyncId != null) {
				var tempAnsw = asyncAnswers_IdNotArrivedYet[answer.asyncId]; 
				if (tempAnsw) {
					delete asyncAnswers_IdNotArrivedYet[answer.asyncId];
					answer = tempAnsw;
				} else {
					asyncAnswersData[answer.asyncId] = sendQData;
					return;
				}
			}
			if (sendQData.params) sendQData.params.pendingAnswers--;
			if (typeof sendQData.callback === "function") {
				try {
					// callback siempre se llama, si hay retorno o error
					var iApp:IAppRObj = null;
					var idRObj = sendQData.quest.idRObj;
					if (idRObj != null) {
						var rObj = findRObj(idRObj);
						if (rObj) iApp = rObj.iApp;
					}	
					var ages: CallbackSendQ_Ages = {
						send: sendQData.ageSend,
						async: answer.asyncAge,
//						receive: answer.age,
						total: diffCurTime(sendQData.ts)
					}
					sendQData.callback.call(iApp, answer.ret, answer.er, ages);
				} catch(e) {
					console.log(e.message);
					console.log(e.stack);
				}
			}
		}

		function asyncAnswerH(question:C.QUEST) {
			var tempPendResp = asyncAnswersData[question.asyncId];
			if (tempPendResp != null) {
				delete asyncAnswersData[question.asyncId];
				processAnswer(<C.ANSW>question, tempPendResp);
			} else asyncAnswers_IdNotArrivedYet[question.asyncId] = <C.ANSW>question;
		}

		var allQs : ISendQ[] = [];
		var lastAllQs : ISendQ[];

		function sendQ(q:C.QUEST, callback?:CallbackSendQ, params?:ParamsSendQ) {
			// deep-copy(q) evitar datos satelite local y host al copiar arrays se clonan funcionamiento similar a satelite no local
			var o:ISendQ = { quest: $.extend(true, {}, q) /* deep-copy */, callback, ts: getCurrentTime(), params };     
			if (params) params.pendingAnswers++;
			allQs.push(o);
			programSendAllQs(true);
			return o;
		}

		var fSendAllQsProgrammed = false;
		var forceSend = false;
		
		function programSendAllQs(_forceSend?: boolean) {
			if (_forceSend === true)  forceSend = true;
			if (!fSendAllQsProgrammed) {
				window.setTimeout(sendAllQs, 0);
				fSendAllQsProgrammed = true;
			}
		}
		//??
		function isCommToHostAvailable() {
			return ((tsInit != null) && (lastAllQs == null));
		}
		//
		function sendAllQs() {
			fSendAllQsProgrammed = false;
			if (isCommToHostAvailable() && (forceSend || (allQs.length > 0))) {
				lastSeq++;
				
				lastAllQs = allQs;
				allQs = []
				
				request();
			}
		}

		function request() {
			var req = createRequest(lastAllQs);
			forceSend = false;
			communicationHandler("/sh", req, function(_respMsg: C.RESP_MSG) {
				var respMsg = <C.SH_RESP_MSG>_respMsg;
				try {
					if ((typeof respMsg !== "object") || (respMsg == null)) throw "err 8";
					if (respMsg.error != null) {
						reInit(String(respMsg.error));
						return;
					}
					if ((!(respMsg.h_answ instanceof Array)) || (respMsg.h_answ.length !== lastAllQs.length)) throw "err 7";
				} catch (e) {
					console.log(e);
					return;
				}

				lastHostTime = respMsg.ts;
				satTimeInLastHostTime = getSatTime();
		
				var temp_AllQs = lastAllQs;
				lastAllQs = null; // para isCommToHostAvailable
				
				$.each(respMsg.h_answ, function(idx, value) {
					processAnswer(value, temp_AllQs[idx]);
				});
				asyncAnswers_IdNotArrivedYet = {};
				// no sendAllQs() evitar que el mismo thread y la misma cola de llamada vayan de sat a host a sat a ... 
				programSendAllQs();
			}, function(jqXHR, textStatus, errorThrown) {
				window.setTimeout(request, 5000);
			});
		}
		function createRequest(sendQDatas: ISendQ[]) : C.SH_REQ_MSG {
			var quest: C.QUEST[];
			quest = sendQDatas.map(function(sendQData :ISendQ) {
				var q = sendQData.quest;
				sendQData.ageSend = diffCurTime(sendQData.ts);
				q.age = sendQData.ageSend;
				return q;
			});
			return {
				tsInit,
				idSat,
				seq: lastSeq,
				ts: getCurrentTime(),
				s_quest: quest
			}
		}
	
		return { // SH
			sendQ,
			asyncAnswerH
		}

	}());

	// todos usan el mismo tiempo para evitar diferencias en objectos relacionados
	var currentTime: number; 

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
	
	function diffCurTime(time0: number) {
		var t = getCurrentTime()-time0;
		return (t>=0) ? t : 0;
	}
	
	
/*	function json(obj) {
		return JSON.stringify(obj);
	}
*/	
	interface CommunicationHandler_Error {
		(jqXHR: JQueryXHR, textStatus: string, errorThrown: string):any
	}
	interface CommunicationHandler { 
		(uri: string, reqMsg: C.REQ_MSG, sendRespMsg: C.SendRespMsg, error: CommunicationHandler_Error) : void 
	} 

	export var communicationHandler: CommunicationHandler

	var timeoutAjaxCommunication = 15000;
	function ajaxCommunication(uri: string, reqMsg: C.REQ_MSG, sendRespMsg: C.SendRespMsg, error: CommunicationHandler_Error) {
		return $.ajax({ 
			url: uri, 
			contentType: "application/json",
			timeout : timeoutAjaxCommunication,
			data : JSON.stringify(reqMsg),
			dataType : "json",
			type : "POST",
			success : function(data: any, textStatus: string, jqXHR: JQueryXHR) {
				sendRespMsg(data);
			},
			error
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
	
	function reInit(er: string) {
		$("body").empty().html("&nbsp;&nbsp;reiniciando... razon: "+er);
		window.setTimeout(function() { window.location.reload(true); }, 5000);
	}
	
/*	function successHS(data, textStatus, jqXHR) {
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
		if (/*(lastDataHS != null) && (lastSecHS === m.sec)) { 
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
*/	
	function getSatTime() { return Date.now(); } // ????
/*	
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
*/	
/*	function retransmitSH() {
		var dataSH = constructDataSH(pendingResponseSH);
		SatToHost(dataSH);
	}
	
*/	
/*	
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
*/	
/*
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
*/	
/*
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
*/
/*	
	var fSendPendingSH = false;
	var dataAvailableSH = true;
	
	function programSendPendingSH(_dataAvailableSH) {
		if (_dataAvailableSH === true) dataAvailableSH = true;	
		if (!fSendPendingSH) {
			window.setTimeout(sendPendingSH, 0);
			fSendPendingSH = true;
		}
	}
*/	
/*	
	function send(q, callback, params) {
		// deep-copy(q) evitar datos satelite local y host al copiar arrays se clonan funcionamiento similar a satelite no local
		var o = { q: $.extend(true, {}, q) /* deep-copy , ts: getCurrentTime(), callback: callback, params: params };     
		if (params) params.pendingResp++;
		pendingSH.push(o);
		programSendPendingSH(true);
		return o;
	}
*/
	export function init(_idSat: string, localCommunication: CommunicationHandler) {
		isLocal = (localCommunication != null);
		idSat = _idSat;
		communicationHandler = isLocal ? localCommunication : ajaxCommunication;
		  
		HS.longPolling();
	}

/*	
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
*/	
}


