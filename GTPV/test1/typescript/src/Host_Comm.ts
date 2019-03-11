/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="httpServer.ts" />
/// <reference path="Common_CommHS.ts" />




// Comunicacion satelites

// H.Comm: parte host
//      - registra satelites (iniciado por satelite)
//      - crea objetos en satelite,
//        ejecuta funciones en objetos de satelite,
//        envia scripts para ejecutar en satelite (iniciado por host)

// idSat : identificador de satelite, 
//         (string: si es un satelite externo),
//         (function: si es un satelite local, processQuestion de cs)
/*
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
 */ //			var ip = localAddresses[i].match(/[^\/]*/)[0];
/*			if (ip === localAddress) {
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
	*/
		
module Host_Comm {	
	import C = Common_CommHS;
		
	interface Sat {
		id: string;
		isLocal: boolean;
		tsInit: number;
		destroy(): void;
		iApp: IAppSat;
		processMessage(isSH: boolean, reqMsg:C.REQ_MSG, sendRespMsg: C.SendRespMsg): void;
	}	
	export interface IAppSat {
		id: string;
		isLocal: boolean;
		getTime() : number;
		diffTime(time0: number) : number;
		ageLastCom : number;
		destroy(): void;
		isDestroyed: boolean;
		createRObj(idRObj: string, 
			     createStubSat: string, 
			     createStubHost: { (idRObj:string) : StubHost }, 
			     callback?: CallbackSendQ) : IAppRObj;
		sendScript(script: string, callback: CallbackSendQ) : void;
		isCommToSatAvailable : boolean;
		forceCommToSat() : void;
		appData : any
	}
	interface RObj {
		id: string;
		iApp: IAppRObj;
		stubHost:StubHost;
		asyncAnswerHCallback: AsyncAnswerHCallback;
		ageQuestion: number;
	}
	interface StubHost {
		[funcName:string] : (...rest:any[]) => any;
	}
	export interface IAppRObj {
		id: string;
		call(funcName: string, args: any, callback: CallbackSendQ ): ISendQ;
		destroy(callback: CallbackSendQ): void
		isDestroyed: boolean;
		sat: IAppSat;
		asyncAnswer: AsyncAnswerHCallback; 
		pendingAnswers: number;
		ageQuestion: number;
		commToSatAvailable(iApp: IAppRObj) : void;
		appData: any;
	}
	export interface AsyncAnswerHCallback{ (ret:any, er?:string):void };
	
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
	
	var SatsLocal: { [id:string]:Sat } = Object.create(null);
	var SatsExtern : { [id:string]:Sat } = Object.create(null);
	
	function getSats(isLocal: boolean) { return (isLocal ? SatsLocal : SatsExtern); }
	function findSat(isLocal: boolean, id: string) { return getSats(isLocal)[id];	}
	function addSat(sat: Sat) { getSats(sat.isLocal)[sat.id]=sat; }
	function delSat(sat: Sat) {
		var Sats = getSats(sat.isLocal); 
		if (Sats[sat.id] === sat) delete Sats[sat.id];
	}

	function createSat(idSat:string, isLocal:boolean, tsSat:number, prevTsInit?:number): Sat {

		var rObjs:RObj[] = [];
		
		function findRObj(idObj:string):RObj {
			for (var i=0; i<rObjs.length; i++) 
				if (rObjs[i].id === idObj) return rObjs[i];
			return null;		
		}
		
		var tsInit = getCurrentTime();
		if (tsInit === prevTsInit) tsInit++; // ????

		var lastSatTime = tsSat;
		var hostTimeInLastSatTime = getCurrentTime();
		var HS_lastTsCom = getCurrentTime();
		
		function getTime() {
			var delta = getCurrentTime() - hostTimeInLastSatTime;
			if (delta < 0) delta = 0; // ????
			return lastSatTime+delta;
		}

		function diffTime(timeSat0: number) {
			var diff = getTime()-timeSat0;
			return (diff >= 0) ? diff : 0;
		}
		
		function getAgeLastCom() {
			var age = getCurrentTime() - HS_lastTsCom;
			return (age >= 0) ? age : 0;
		}
		
		var isDestroyed = false;
		
		function destroy() { 
			HS.closeLast();
			delSat(thisSat);
			isDestroyed = true; 
		} 
		
		function processMessage (isSH:boolean, msg:C.REQ_MSG, sendRespMsg: C.SendRespMsg) {
			lastSatTime = msg.ts;
			hostTimeInLastSatTime = getCurrentTime();
			isSH ? 
				SH.processMessage(<C.SH_REQ_MSG>msg, sendRespMsg) : 
				HS.processMessage(<C.HS_REQ_MSG>msg, sendRespMsg);
		} 
		
		var SH = (function() {
			var lastAnswers: C.ANSW[];
			var lastSeq: number;
			
			var asyncId = 1;
			function createAsyncAnswerH() {
				var asyncAnswer:C.QUEST = { type: C.TYPE_QUEST.async };
				var ready = false;
				var ts = getCurrentTime();
				function sendAsyncAnswer() {
					if ((asyncAnswer.asyncId != null) && ready) {
						HS.sendQ(asyncAnswer);
					} 	
				}
				function activate() {
					asyncAnswer.asyncId = asyncId++;
					sendAsyncAnswer();
					return asyncAnswer.asyncId;
				}
				var callback: AsyncAnswerHCallback = function(ret:any, er?:string) {
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
				if ((typeof question !== "object") || (question == null)) throw "err 3";
				switch (question.type) {
					case C.TYPE_QUEST.func :
						var idRObj = question.idRObj;
						//if (typeof idRObj !== "string") throw "err 4";
						var rObj = findRObj(idRObj);
						if (!rObj) answer.er = "rObj not found: "+idRObj;
						else {
							rObj.ageQuestion = question.age;
							var asyncAnswerH = createAsyncAnswerH();
							rObj.asyncAnswerHCallback = asyncAnswerH.callback;
							var funcName = question.funcName;
							var args = question.args;				 
							try {
								var ret = rObj.stubHost[funcName].apply(rObj.iApp, args);
								if (ret === asyncAnswerH.callback) answer.asyncId = asyncAnswerH.activate();
								else answer.ret = ret;
							} catch(e) {
								console.log(e.message);
								console.log(e.stack);
								answer.er = e.toString();
							}
							rObj.iApp.ageQuestion = null;
							rObj.asyncAnswerHCallback = null;
						}
						break;
					case C.TYPE_QUEST.async : // Async Answers son questions
						HS.asyncAnswerS(question);
						break;
					default:
						throw "err 8";	
				}
//				answer.age = question.age;
				return answer;
			}
			
			function processMessage(reqMsg:C.SH_REQ_MSG, sendRespMsg: C.SendRespMsg) {
				if ((lastAnswers == null) || (lastSeq !== reqMsg.seq)) {
					if ((reqMsg.seq == null) || (!(reqMsg.s_quest instanceof Array))) throw "err 1";
					lastSeq = reqMsg.seq;
					var answers:C.ANSW[] = [];
					reqMsg.s_quest.forEach(function(question) {
						var answer = processQuestion(question);
						answers.push($.extend(true, {}, answer)); 
					});
					lastAnswers = answers;
				}
				var respMsg: C.SH_RESP_MSG = {
					ts: getCurrentTime(),
					h_answ : lastAnswers
				}
				sendRespMsg(respMsg);
			}
			
			return { // SH
				processMessage
			}
		})();

		var HS = (function(){
			var lastSeq: number;

			var asyncAnswersData: { [asyncId:number]:ISendQ } = {};
			var asyncAnswers_IdNotArrivedYet: { [asyncId:number]:C.ANSW } = {};
	
			function processAnswer(answer:C.ANSW, sendQData: ISendQ) {
				if (answer == null) answer = {}; // en init no hay a.
				if (typeof answer !== "object") throw "err 5";
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
						var _iApp:any = iApp;
						var idRObj = sendQData.quest.idRObj;
						//var rObj:RObj;
						if (idRObj != null) { 
							var rObj = findRObj(idRObj);
							_iApp = rObj.iApp;
						}	
						var ages: CallbackSendQ_Ages = {
							send: sendQData.ageSend,
							async: answer.asyncAge,
//							receive: answer.age,
							total: diffCurTime(sendQData.ts)
						}
						sendQData.callback.call(_iApp, answer.ret, answer.er, ages );
					} catch(e) {
						console.log(e.message);
						console.log(e.stack);
					}
				}
			}

			function asyncAnswerS(question:C.QUEST) {
				var tempPendResp = asyncAnswersData[question.asyncId];
				if (tempPendResp != null) {
					delete asyncAnswersData[question.asyncId];
					processAnswer(<C.ANSW>question, tempPendResp);
				} else asyncAnswers_IdNotArrivedYet[question.asyncId] = <C.ANSW>question;
			}
			
			var allQs : ISendQ[] = [];
			var lastAllQs : ISendQ[];
			
			function sendQ(q:C.QUEST, callback?:CallbackSendQ, params?:ParamsSendQ) {
				var o:ISendQ = { quest: $.extend(true, {}, q), callback: callback, ts: getCurrentTime(), params: params }; 
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

			function isCommToSatAvailable() {
				return (sendRespMsg && (lastAllQs == null));
			}
			
			function sendAllQs() {
				fSendAllQsProgrammed = false;
				if (isCommToSatAvailable() && (forceSend || (allQs.length > 0))) {
					rObjs.forEach(function(rObj) {
						if (typeof rObj.iApp.commToSatAvailable === "function") 
							rObj.iApp.commToSatAvailable.call(rObj.iApp, rObj.iApp);  
					});
					
					clearTimeout(toutIdAliveHostCom);
					toutIdAliveHostCom = window.setTimeout(aliveHostCom, delayAliveHostCom);
					
//??					lastSeq++;
					
					var resp = createResponse(allQs);
					lastAllQs = allQs;
					allQs = []
					forceSend = false;
	
					var s_temp = sendRespMsg; // respuesta en el mismo thread en satelite local
					sendRespMsg = null;
					s_temp(resp);
	
					return true; 
				}
				return false;
			}

			function closeLast() {
				if (sendRespMsg != null) { 
					sendRespMsg();
					sendRespMsg = null;
				}
			}

			function createResponse(sendQDatas: ISendQ[]) : C.HS_RESP_MSG {
				var quest: C.QUEST[];
				quest = sendQDatas.map(function(sendQData :ISendQ) {
					var q = sendQData.quest;
					sendQData.ageSend = diffCurTime(sendQData.ts);
					q.age = sendQData.ageSend;
					return q;
				});
				return {
					ts: getCurrentTime(),
					h_quest: quest
				}
			}
		
			var toutIdAliveHostCom: number = null;

			var delayAliveHostCom = 10000; 
			function aliveHostCom() {
				programSendAllQs(true);
			}
	
			var sendRespMsg: C.SendRespMsg;
			
			function processMessage(reqMsg:C.HS_REQ_MSG, _sendRespMsg: C.SendRespMsg) {
				closeLast();
				sendRespMsg = _sendRespMsg;
				HS_lastTsCom = getCurrentTime();
				if (lastAllQs != null) { 
					if (lastSeq === reqMsg.seq) { 
						
						var resp = createResponse(lastAllQs);
		
						sendRespMsg = null; // respuesta en el mismo thread en satelite local
						clearTimeout(toutIdAliveHostCom);
						toutIdAliveHostCom = window.setTimeout(aliveHostCom, delayAliveHostCom);
						_sendRespMsg(resp);

						return 0; // No error
					}
					if ((!(reqMsg.s_answ instanceof Array)) || (reqMsg.s_answ.length !== lastAllQs.length)) 
						throw "err 2";
					
					var temp_lastAllQ = lastAllQs;
					lastAllQs = null; // para isCommToSatAvailable
					
					$.each(reqMsg.s_answ, function(idx, value) {
						processAnswer(value, temp_lastAllQ[idx]);
					});
					asyncAnswers_IdNotArrivedYet = {};
				}

				// no sendAllQs() evitar que el mismo thread y la misma cola de llamada vayan de host a sat a host a ...
				programSendAllQs();
			}

			return { // HS
				sendQ,
				processMessage,
				asyncAnswerS,
				isCommToSatAvailable,
				programSendAllQs,
				closeLast
			} 
		})();

		var iApp: IAppSat = {
			get id() { return idSat; },
			get isLocal() { return isLocal; },
			getTime : getTime,
			diffTime : diffTime,
			get ageLastCom() { return getAgeLastCom(); },
			destroy,
			get isDestroyed() { return isDestroyed; },
			createRObj : function(idRObj: string,
						    createStubSat: { toString():string }, 
						    createStubHost: { (idRObj:string) : StubHost }, 
						    callback?: CallbackSendQ) {
				if (findRObj(idRObj) != null) {
					if (typeof callback === "function") callback(undefined, "G-Error: Object already defined", <CallbackSendQ_Ages>{});
					return null;
				}

				var isDestroyed = false;
				var paramsSendQ: ParamsSendQ = { pendingAnswers : 0 };

				var rObj:RObj = {
					id: idRObj,
					stubHost : createStubHost(idRObj),
					asyncAnswerHCallback : null,
					iApp : {
						get id() { return idRObj; },
						call : function(funcName: string, args: any, callback: CallbackSendQ ) {
							if (!(args instanceof Array)) args = [args];
							return HS.sendQ({	type: C.TYPE_QUEST.func, idRObj, funcName, args }, callback, paramsSendQ);
						},
						destroy : function(callback: CallbackSendQ) {
							isDestroyed = true;
							var idx = rObjs.indexOf(rObj);
							if (idx !== -1) rObjs.splice(idx, 1);
							return HS.sendQ({ type: C.TYPE_QUEST.destroy, idRObj}, callback, paramsSendQ);
						},
						get isDestroyed() { return isDestroyed; },
						get sat() { return sat.iApp; },
						get asyncAnswer() { return rObj.asyncAnswerHCallback; },
						get pendingAnswers() { return paramsSendQ.pendingAnswers; },
						get ageQuestion() { return rObj.ageQuestion },
						commToSatAvailable : null,
						appData: {}
					},
					ageQuestion : null
				};
				rObjs.push(rObj);
				
				HS.sendQ({ type: C.TYPE_QUEST.create, idRObj, script: createStubSat.toString() }, callback, paramsSendQ);
				
				return rObj.iApp;
			},
			sendScript : function(script: string, callback: CallbackSendQ) {
				return HS.sendQ({type: C.TYPE_QUEST.script, script}, callback);
			},
/*			sendFunctionExecute : function(s, callback) {
				return send({type: "s", script : "("+s.toString()+")();"}, callback);
			},
			sendObjectAssign : function(name, obj, callback) {
				return send({type: "s", script: name+" = "+objectToUnEval(obj)+";"}, callback);
			},
*/			
			get isCommToSatAvailable() { return HS.isCommToSatAvailable(); },
			forceCommToSat() { HS.programSendAllQs(true); },
			appData : {}  
		};
		// message initialize
		HS.sendQ({type: C.TYPE_QUEST.init, tsInit: sat.tsInit});
		
		var sat: Sat = {
			get id() { return idSat; },
			get isLocal() { return isLocal; },
			get tsInit() { return tsInit; },
			destroy,
			iApp,
			processMessage
		};
		
		var thisSat = sat;
		return sat;
	}
	
	// todos usan el mismo tiempo para evitar diferencias en objectos relacionados
	var currentTime:number; 

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
	
	function diffCurTime(time0: number) {
		var t = getCurrentTime()-time0;
		return (t>=0) ? t : 0;
	}
	
/*	
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
*/
	
	function getHostTime() { return Date.now(); } // ????

	function msgHandler(uri: string, isLocal: boolean, reqMsg: C.REQ_MSG, sendRespMsg: C.SendRespMsg) {
		var isSH = (uri === "/sh");
		if ((typeof reqMsg !== "object") || (reqMsg == null)) throw "err 5";
		var idSat = reqMsg.idSat;
		if (typeof idSat !== "string") throw "err 6";
		var sat = findSat(isLocal, idSat);
		if (!isSH && (reqMsg.tsInit == null)) { // HS && no tsInit => registrarse
			var newSat = createSat(idSat, isLocal, reqMsg.ts, (sat ? sat.tsInit : null));

			if (registrationHandler(newSat.iApp, sat ? sat.iApp : null)) {
				if (sat) {
					sat.iApp.destroy();
				}
				sat = newSat;
				addSat(sat);
			} else {					
				newSat.destroy();
				sendRespMsg();  //??
				return;
			}
		} else {
			if (!sat || (reqMsg.tsInit !== sat.tsInit)) {
				var respMsg: C.RESP_MSG = { 
					ts: getCurrentTime(),
					error: (sat ? "conflict" : "not registered") };
				sendRespMsg(respMsg);	
				return;
			}
		}
		sat.processMessage(isSH, reqMsg, sendRespMsg);
	}
	
	export function localHandler(uri: string, reqMsg: C.REQ_MSG, sendRespMsg: C.SendRespMsg) {
		try {
			msgHandler(uri, true, reqMsg, sendRespMsg);
		} catch(e) {
			console.log("Error "+e.toString());
		}	
	}
	export function httpHandler(reqInfo: HttpServer.ReqInfo, respManager: HttpServer.ResponseManager) {
		var uri = reqInfo.uri;
		if (!((reqInfo.method == HttpServer.Methods.POST) && 
			((uri === "/hs") || (uri === "/sh")))) return false;
		
		try {
			// check Content-Type ??
			var reqMsg = <C.REQ_MSG>JSON.parse(reqInfo.bodyUtf8);
			msgHandler(uri, false, reqMsg, function(respMsg?: C.RESP_MSG) {
				if (respMsg) {
					respManager.bodyUtf8 = JSON.stringify(respMsg, null, 3);
					respManager.contentType = "application/json";
					respManager.sendAndClose();
				} else respManager.close();	
			});
		} catch(e) {
			respManager.close();
			console.log("Error "+e.toString());
		}  
		return true;
	}
	
	export var registrationHandler: (newSat: IAppSat, oldSat: IAppSat)=>boolean;
	
}
