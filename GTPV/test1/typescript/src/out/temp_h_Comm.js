/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="httpServer.ts" />
/// <reference path="Common_CommHS.ts" />
var H_CommSat;
(function (H_CommSat) {
    ;
    var SatsLocal = Object.create(null);
    var SatsExtern = Object.create(null);
    function getSats(isLocal) { return (isLocal ? SatsLocal : SatsExtern); }
    function findSat(isLocal, id) { return getSats(isLocal)[id]; }
    function addSat(sat) { getSats(sat.isLocal)[sat.id] = sat; }
    function delSat(sat) {
        var Sats = getSats(sat.isLocal);
        if (Sats[sat.id] === sat)
            delete Sats[sat.id];
    }
    function createSat(idSat, isLocal, tsSat, prevTsInit) {
        var rObjs = [];
        function findRObj(idObj) {
            for (var i = 0; i < rObjs.length; i++)
                if (rObjs[i].id === idObj)
                    return rObjs[i];
            return null;
        }
        var tsInit = getCurrentTime();
        if (tsInit === prevTsInit)
            tsInit++;
        var lastSatTime = tsSat;
        var hostTimeInLastSatTime = getCurrentTime();
        var HS_lastTsCom = getCurrentTime();
        function getTime() {
            var delta = getCurrentTime() - hostTimeInLastSatTime;
            if (delta < 0)
                delta = 0;
            return lastSatTime + delta;
        }
        function diffTime(timeSat0) {
            var diff = getTime() - timeSat0;
            return (diff >= 0) ? diff : 0;
        }
        function getAgeLastCom() {
            var age = getCurrentTime() - HS_lastTsCom;
            return (age >= 0) ? age : 0;
        }
        var destroyed = false;
        function destroy() {
            HS.closeLast();
            delSat(thisSat);
            destroyed = true;
        }
        function processMessage(isSH, msg, sendRespMsg) {
            lastSatTime = msg.ts;
            hostTimeInLastSatTime = getCurrentTime();
            isSH ?
                SH.processMessage(msg, sendRespMsg) :
                HS.processMessage(msg, sendRespMsg);
        }
        var SH = (function () {
            var lastAnswer;
            var lastSeq;
            var asyncId = 1;
            function createAsyncAnswerH() {
                var asyncAnswer = { type: TYPE_QUEST.async, age: 0 };
                var ready = false;
                function sendAsyncAnswer() {
                    if ((asyncAnswer.asyncId != null) && ready) {
                        return HS.sendQ(asyncAnswer);
                    }
                    else
                        return null;
                }
                function activate(age) {
                    asyncAnswer.asyncId = asyncId++;
                    asyncAnswer.age = age;
                    sendAsyncAnswer();
                    return asyncAnswer.asyncId;
                }
                var callback = function (ret, er) {
                    asyncAnswer.ret = ret;
                    asyncAnswer.er = er;
                    ready = true;
                    sendAsyncAnswer();
                };
                return {
                    activate: activate,
                    callback: callback
                };
            }
            function processQuestion(question) {
                var answer = {};
                if ((typeof question !== "object") || (question == null))
                    throw "err 3";
                switch (question.type) {
                    case TYPE_QUEST.func:
                        var idRObj = question.idRObj;
                        if (typeof idRObj !== "string")
                            throw "err 4";
                        var rObj = findRObj(idRObj);
                        if (rObj == null)
                            answer.er = "rObj not found: " + idRObj;
                        else {
                            rObj.ageQuestion = question.age;
                            var asyncAnswerH = createAsyncAnswerH();
                            rObj.asyncAnswerHCallback = asyncAnswerH.callback;
                            var funcName = question.funcName;
                            var args = question.args;
                            try {
                                var ret = rObj.stubHost[funcName].apply(rObj.iApp, args);
                                if (ret === asyncAnswerH.callback)
                                    answer.asyncId = asyncAnswerH.activate(question.age);
                                else
                                    answer.ret = ret;
                            }
                            catch (e) {
                                console.log(e.message);
                                console.log(e.stack);
                                answer.er = e.toString();
                            }
                            rObj.iApp.ageQuestion = null;
                            rObj.asyncAnswerHCallback = null;
                        }
                        break;
                    case TYPE_QUEST.async:
                        HS.asyncAnswerS(question);
                        break;
                }
                answer.age = question.age;
                return answer;
            }
            function processMessage(reqMsg, sendRespMsg) {
                if ((lastAnswer == null) || (lastSeq !== reqMsg.seq)) {
                    if ((reqMsg.seq == null) || (!(reqMsg.s_quest instanceof Array)))
                        throw "err 1";
                    lastSeq = reqMsg.seq;
                    var answers = [];
                    reqMsg.s_quest.forEach(function (question) {
                        var answer = processQuestion(question);
                        answers.push($.extend(true, {}, answer));
                    });
                    lastAnswer = answers;
                }
                var respMsg = {
                    ts: getCurrentTime(),
                    h_answ: lastAnswer
                };
                sendRespMsg(respMsg);
            }
            return {
                processMessage: processMessage
            };
        })();
        var HS = (function () {
            var lastSeq;
            var asyncAnswersData = {};
            var asyncAnswers_IdNotArrivedYet = {};
            function processAnswer(answer, sendQData) {
                if (answer == null)
                    answer = {};
                if (typeof answer !== "object")
                    throw "err 5";
                if (answer.asyncId != null) {
                    var tempAnsw = asyncAnswers_IdNotArrivedYet[answer.asyncId];
                    if (tempAnsw) {
                        delete asyncAnswers_IdNotArrivedYet[answer.asyncId];
                        answer = tempAnsw;
                    }
                    else {
                        asyncAnswersData[answer.asyncId] = sendQData;
                        return;
                    }
                }
                if (sendQData.params)
                    sendQData.params.pendingAnswers--;
                if (typeof sendQData.callback === "function") {
                    try {
                        var iApp = null;
                        var idRObj = sendQData.quest.idRObj;
                        if (idRObj != null) {
                            var rObj = findRObj(idRObj);
                            if (rObj)
                                iApp = rObj.iApp;
                        }
                        sendQData.callback.call(iApp, answer.ret, answer.er, diffCurTime(sendQData.ts), answer.age);
                    }
                    catch (e) {
                        console.log(e.message);
                        console.log(e.stack);
                    }
                }
            }
            function asyncAnswerS(question) {
                var tempPendResp = asyncAnswersData[question.idRObj];
                if (tempPendResp != null) {
                    delete asyncAnswersData[question.idRObj];
                    processAnswer(question, tempPendResp);
                }
                else
                    asyncAnswers_IdNotArrivedYet[question.idRObj] = question;
            }
            var allQs = [];
            var lastAllQ;
            function sendQ(q, callback, params) {
                var o = { quest: $.extend(true, {}, q), callback: callback, ts: getCurrentTime(), params: params };
                if (params)
                    params.pendingAnswers++;
                allQs.push(o);
                programSendAllQs(true);
                return o;
            }
            var fSendAllQsProgrammed = false;
            var forceSend = false;
            function programSendAllQs(_forceSend) {
                if (_forceSend === true)
                    forceSend = true;
                if (!fSendAllQsProgrammed) {
                    window.setTimeout(sendAllQs, 0);
                    fSendAllQsProgrammed = true;
                }
            }
            function fCommToSatAvailable() {
                return (sendRespMsg && (lastAllQ == null));
            }
            function sendAllQs() {
                fSendAllQsProgrammed = false;
                if (fCommToSatAvailable() && (forceSend || (allQs.length > 0))) {
                    rObjs.forEach(function (rObj) {
                        if (typeof rObj.iApp.commToSatAvailable === "function")
                            rObj.iApp.commToSatAvailable.call(rObj.iApp, rObj.iApp);
                    });
                    clearTimeout(toutIdAliveHostCom);
                    toutIdAliveHostCom = window.setTimeout(aliveHostCom, delayAliveHostCom);
                    lastSeq++;
                    var resp = createResponse(allQs);
                    lastAllQ = allQs;
                    allQs = [];
                    forceSend = false;
                    var s_temp = sendRespMsg;
                    sendRespMsg = null;
                    s_temp(resp);
                    return true;
                }
                return false;
            }
            var sendRespMsg;
            function closeLast() {
                if (sendRespMsg != null) {
                    sendRespMsg();
                    sendRespMsg = null;
                }
            }
            function createResponse(sendQDatas) {
                var quest;
                quest = sendQDatas.map(function (sendQData) {
                    var q = sendQData.quest;
                    sendQData.ageSend = diffCurTime(sendQData.ts);
                    q.age = sendQData.ageSend;
                    return q;
                });
                return {
                    ts: getCurrentTime(),
                    h_quest: quest
                };
            }
            var toutIdAliveHostCom = null;
            var delayAliveHostCom = 10000;
            function aliveHostCom() {
                programSendAllQs(true);
            }
            function processMessage(msg, _sendRespMsg) {
                closeLast();
                sendRespMsg = _sendRespMsg;
                HS_lastTsCom = getCurrentTime();
                if (lastAllQ != null) {
                    if (lastSeq === msg.seq) {
                        var resp = createResponse(lastAllQ);
                        sendRespMsg = null;
                        clearTimeout(toutIdAliveHostCom);
                        toutIdAliveHostCom = window.setTimeout(aliveHostCom, delayAliveHostCom);
                        _sendRespMsg(resp);
                        return 0;
                    }
                    if ((!(msg.s_answ instanceof Array)) || (msg.s_answ.length !== lastAllQ.length))
                        throw "err 2";
                    var temp_lastAllQ = lastAllQ;
                    lastAllQ = null;
                    for (var i = 0; i < msg.s_answ.length; i++) {
                        processAnswer(msg.s_answ[i], temp_lastAllQ[i]);
                    }
                    asyncAnswers_IdNotArrivedYet = {};
                }
                programSendAllQs();
            }
            return {
                sendQ: sendQ,
                processMessage: processMessage,
                asyncAnswerS: asyncAnswerS,
                fCommToSatAvailable: fCommToSatAvailable,
                programSendAllQs: programSendAllQs,
                closeLast: closeLast
            };
        })();
        function responseToS(respManager, msg) {
            respManager.bodyUtf8 = JSON.stringify(msg, null, 3);
            respManager.contentType = "application/json";
            respManager.sendAndClose();
        }
        var iApp = {
            get id() { return idSat; },
            get isLocal() { return isLocal; },
            getTime: getTime,
            diffTime: diffTime,
            get ageLastCom() { return getAgeLastCom(); },
            destroy: destroy,
            get destroyed() { return destroyed; },
            createRObj: function (idRObj, createStubSat, createStubHost, callback) {
                if (findRObj(idRObj) != null) {
                    if (typeof callback === "function")
                        callback(undefined, "G-Error: Object already defined", 0, 0);
                    return null;
                }
                var destroyed = false;
                var paramsSendQ = { pendingAnswers: 0 };
                var rObj = {
                    id: idRObj,
                    stubHost: createStubHost(idRObj),
                    asyncAnswerHCallback: null,
                    iApp: {
                        get id() { return idRObj; },
                        call: function (funcName, args, callback) {
                            if (!(args instanceof Array))
                                args = [args];
                            return HS.sendQ({ type: TYPE_QUEST.func, idRObj: idRObj, funcName: funcName, args: args }, callback, paramsSendQ);
                        },
                        destroy: function (callback) {
                            destroyed = true;
                            var idx = rObjs.indexOf(rObj);
                            if (idx !== -1)
                                rObjs.splice(idx, 1);
                            return HS.sendQ({ type: TYPE_QUEST.destroy, idRObj: idRObj }, callback, paramsSendQ);
                        },
                        get destroyed() { return destroyed; },
                        get sat() { return sat.iApp; },
                        get asyncAnswer() { return rObj.asyncAnswerHCallback; },
                        get pendingAnswers() { return paramsSendQ.pendingAnswers; },
                        get ageQuestion() { return rObj.ageQuestion; },
                        commToSatAvailable: null,
                        userData: {}
                    },
                    ageQuestion: null
                };
                rObjs.push(rObj);
                HS.sendQ({ type: TYPE_QUEST.create, idRObj: idRObj, script: createStubSat }, callback, paramsSendQ);
                return rObj.iApp;
            },
            sendScript: function (script, callback) {
                return HS.sendQ({ type: TYPE_QUEST.script, script: script }, callback);
            },
            get fCommToSatAvailable() { return HS.fCommToSatAvailable(); },
            forceCommToSat: function () { HS.programSendAllQs(true); },
            userData: {}
        };
        HS.sendQ({ type: TYPE_QUEST.init, tsInit: sat.tsInit });
        var sat = {
            get id() { return idSat; },
            get isLocal() { return isLocal; },
            get tsInit() { return tsInit; },
            destroy: destroy,
            iApp: iApp,
            processMessage: processMessage
        };
        var thisSat = sat;
        return sat;
    }
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
        var t = getCurrentTime() - time0;
        return (t >= 0) ? t : 0;
    }
    function json(obj) {
        return JSON.stringify(obj);
    }
    function objectToUnEval(obj, aObjs) {
        if (aObjs == null)
            aObjs = [];
        if (obj && (typeof obj === "object")) {
            if (aObjs.indexOf(obj) !== -1)
                throw new TypeError("circular structure in objectToUnEval");
            aObjs.push(obj);
            var ret;
            if (obj instanceof Array) {
                ret = '[' + obj.map(function (el) { return objectToUnEval(el, aObjs); }).join(',') + ']';
            }
            else {
                var str = '{', sep = '';
                for (var p in obj) {
                    str += sep + p + ':' + objectToUnEval(obj[p], aObjs);
                    sep = ',';
                }
                str += '}';
                ret = str;
            }
            aObjs.pop();
            return ret;
        }
        else if (typeof obj === "string") {
            return '"' + obj.replace(/["\\]/g, function (c) { return "\\" + c; }) + '"';
        }
        else
            return String(obj);
    }
    function getHostTime() { return Date.now(); }
    function msgHandler(uri, isLocal, idSat, reqMsg, sendRespMsg) {
        var isSH = (uri === "/sh");
        var sat = findSat(isLocal, idSat);
        if (!isSH && (reqMsg.tsInit == null)) {
            var newSat = createSat(idSat, isLocal, reqMsg.ts, (sat ? sat.tsInit : null));
            if (H_CommSat.registrationHandler(newSat.iApp, sat ? sat.iApp : null)) {
                if (sat) {
                    sat.iApp.destroy();
                }
                sat = newSat;
                addSat(sat);
            }
            else {
                newSat.destroy();
                sendRespMsg();
                return;
            }
        }
        else {
            if (!sat || (reqMsg.tsInit !== sat.tsInit)) {
                var respMsg = {
                    ts: getCurrentTime(),
                    error: (sat ? "conflict" : "not registered") };
                sendRespMsg(respMsg);
                return;
            }
        }
        sat.processMessage(isSH, reqMsg, sendRespMsg);
    }
    function localHandler(uri, idSat, reqMsg, sendRespMsg) {
        msgHandler(uri, true, idSat, reqMsg, sendRespMsg);
    }
    H_CommSat.localHandler = localHandler;
    function httpHandler(reqInfo, respManager) {
        var uri = reqInfo.uri;
        if (!((reqInfo.method == HttpServer.Methods.POST) &&
            ((uri === "/hs") || (uri === "/sh"))))
            return false;
        try {
            var idSat;
            var reqMsg = JSON.parse(reqInfo.bodyUtf8);
            if (typeof reqMsg.idSat !== "string")
                throw "";
            msgHandler(uri, false, idSat, reqMsg, function (respMsg) {
                if (respMsg) {
                    respManager.bodyUtf8 = JSON.stringify(respMsg, null, 3);
                    respManager.contentType = "application/json";
                    respManager.sendAndClose();
                }
                else
                    respManager.close();
            });
        }
        catch (e) {
            console.log("Error " + e.toString());
        }
        return true;
    }
    H_CommSat.httpHandler = httpHandler;
    H_CommSat.registrationHandler;
})(H_CommSat || (H_CommSat = {}));
//# sourceMappingURL=temp_h_Comm.js.map