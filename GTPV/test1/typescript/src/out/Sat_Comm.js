/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="Common_CommHS.ts" />
var Comm_Sat;
(function (Comm_Sat) {
    var C = Common_CommHS;
    ;
    var rObjs = [];
    function findRObj(idObj) {
        for (var i = 0; i < rObjs.length; i++)
            if (rObjs[i].id === idObj)
                return rObjs[i];
        return null;
    }
    var idSat;
    var tsInit;
    var isLocal;
    var lastHostTime = 0, satTimeInLastHostTime = 0;
    var lastComHS = 0;
    var HS = (function () {
        var lastAnswers;
        var lastSeq = 1;
        function createRObj(idRObj) {
            var paramsSendQ = { pendingAnswers: 0 };
            var rObj = {
                id: idRObj,
                stubSat: null,
                asyncAnswerSCallback: null,
                iApp: {
                    get id() { return idRObj; },
                    get idSat() { return idSat; },
                    get isLocal() { return isLocal; },
                    call: function (funcName, args, callback) {
                        if (!(args instanceof Array))
                            args = [args];
                        return SH.sendQ({ type: C.TYPE_QUEST.func, idRObj: idRObj, funcName: funcName, args: args }, callback, paramsSendQ);
                    },
                    get isDestroyed() { return rObj.isDestroyed; },
                    get asyncAnswer() { return rObj.asyncAnswerSCallback; },
                    get pendingAnswers() { return paramsSendQ.pendingAnswers; },
                    get ageQuestion() { return rObj.ageQuestion; },
                    isCommToHostAvailable: false,
                    commToHostAvailable: null,
                    userData: {}
                },
                ageQuestion: null,
                isDestroyed: false
            };
            return rObj;
        }
        var asyncId = 1;
        function createAsyncAnswerS() {
            var asyncAnswer = { type: C.TYPE_QUEST.async };
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
            var callback = function (ret, er) {
                asyncAnswer.ret = ret;
                asyncAnswer.er = er;
                asyncAnswer.asyncAge = diffCurTime(ts);
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
                throw "err 1";
            var rObj;
            switch (question.type) {
                case C.TYPE_QUEST.create:
                    if (findRObj(question.idRObj))
                        answer.er = "Object already defined " + question.idRObj;
                    else {
                        rObj = createRObj(question.idRObj);
                        rObj.iApp.ageQuestion = question.age;
                        rObjs.push(rObj);
                        try {
                            var indirect_eval = eval;
                            var anonymFunc = indirect_eval(question.script);
                            rObj.stubSat = anonymFunc(rObj.iApp);
                            answer.ret = true;
                        }
                        catch (e) {
                            console.log(e.message);
                            console.log(e.stack);
                            answer.er = e.toString();
                        }
                        rObj.iApp.ageQuestion = null;
                    }
                    break;
                case C.TYPE_QUEST.func:
                    rObj = findRObj(question.idRObj);
                    if (!rObj)
                        answer.er = "rObj not found: " + question.idRObj;
                    else {
                        rObj.iApp.ageQuestion = question.age;
                        var asyncAnswerS = createAsyncAnswerS();
                        rObj.asyncAnswerSCallback = asyncAnswerS.callback;
                        var funcName = question.funcName;
                        var args = question.args;
                        try {
                            var ret = rObj.stubSat[funcName].apply(rObj.iApp, args);
                            if (ret === asyncAnswerS.callback)
                                answer.asyncId = asyncAnswerS.activate();
                            else
                                answer.ret = ret;
                        }
                        catch (e) {
                            console.log(e.message);
                            console.log(e.stack);
                            answer.er = e.toString();
                        }
                        rObj.iApp.ageQuestion = null;
                        rObj.asyncAnswerSCallback = null;
                    }
                    break;
                case C.TYPE_QUEST.destroy:
                    rObj = findRObj(question.idRObj);
                    if (rObj == null)
                        answer.er = "Object undefined " + question.idRObj;
                    else {
                        rObj.isDestroyed = true;
                        rObjs.splice(rObjs.indexOf(rObj), 1);
                        answer.ret = true;
                    }
                    break;
                case C.TYPE_QUEST.script:
                    try {
                        $.globalEval(question.script);
                        answer.ret = true;
                    }
                    catch (e) {
                        console.log(e.message);
                        console.log(e.stack);
                        answer.er = e.toString();
                    }
                    break;
                case C.TYPE_QUEST.init:
                    tsInit = question.tsInit;
                    answer.ret = true;
                    break;
                case C.TYPE_QUEST.async:
                    SH.asyncAnswerH(question);
                    break;
                default:
                    throw "err 2";
            }
            return answer;
        }
        function request() {
            var req = createRequest(lastAnswers);
            Comm_Sat.communicationHandler("/hs", req, function (_respMsg) {
                var respMsg = _respMsg;
                try {
                    if ((typeof respMsg !== "object") || (respMsg == null))
                        throw "err 8";
                    if (respMsg.error != null) {
                        reInit(String(respMsg.error));
                        return;
                    }
                    if (!(respMsg.h_quest instanceof Array))
                        throw "err 7";
                }
                catch (e) {
                    console.log(e);
                    return;
                }
                lastHostTime = respMsg.ts;
                satTimeInLastHostTime = getSatTime();
                lastComHS = getCurrentTime();
                var answers = [];
                respMsg.h_quest.forEach(function (question) {
                    var answer = processQuestion(question);
                    answers.push($.extend(true, {}, answer));
                });
                lastAnswers = answers;
                lastSeq++;
                request();
            }, function (jqXHR, textStatus, errorThrown) {
                window.setTimeout(request, 5000);
            });
        }
        function createRequest(answers) {
            return {
                tsInit: tsInit,
                idSat: idSat,
                seq: lastSeq,
                ts: getCurrentTime(),
                s_answ: answers
            };
        }
        var longPolling = request;
        return {
            longPolling: longPolling
        };
    }());
    var SH = (function () {
        var lastSeq = 1;
        var asyncAnswersData = {};
        var asyncAnswers_IdNotArrivedYet = {};
        function processAnswer(answer, sendQData) {
            if (answer == null)
                answer = {};
            if (typeof answer !== "object")
                throw "err 3";
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
                    var ages = {
                        send: sendQData.ageSend,
                        async: answer.asyncAge,
                        total: diffCurTime(sendQData.ts)
                    };
                    sendQData.callback.call(iApp, answer.ret, answer.er, ages);
                }
                catch (e) {
                    console.log(e.message);
                    console.log(e.stack);
                }
            }
        }
        function asyncAnswerH(question) {
            var tempPendResp = asyncAnswersData[question.asyncId];
            if (tempPendResp != null) {
                delete asyncAnswersData[question.asyncId];
                processAnswer(question, tempPendResp);
            }
            else
                asyncAnswers_IdNotArrivedYet[question.asyncId] = question;
        }
        var allQs = [];
        var lastAllQs;
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
        function isCommToHostAvailable() {
            return ((tsInit != null) && (lastAllQs == null));
        }
        function sendAllQs() {
            fSendAllQsProgrammed = false;
            if (isCommToHostAvailable() && (forceSend || (allQs.length > 0))) {
                lastSeq++;
                lastAllQs = allQs;
                allQs = [];
                request();
            }
        }
        function request() {
            var req = createRequest(lastAllQs);
            forceSend = false;
            Comm_Sat.communicationHandler("/sh", req, function (_respMsg) {
                var respMsg = _respMsg;
                try {
                    if ((typeof respMsg !== "object") || (respMsg == null))
                        throw "err 8";
                    if (respMsg.error != null) {
                        reInit(String(respMsg.error));
                        return;
                    }
                    if ((!(respMsg.h_answ instanceof Array)) || (respMsg.h_answ.length !== lastAllQs.length))
                        throw "err 7";
                }
                catch (e) {
                    console.log(e);
                    return;
                }
                lastHostTime = respMsg.ts;
                satTimeInLastHostTime = getSatTime();
                var temp_AllQs = lastAllQs;
                lastAllQs = null;
                $.each(respMsg.h_answ, function (idx, value) {
                    processAnswer(value, temp_AllQs[idx]);
                });
                asyncAnswers_IdNotArrivedYet = {};
                programSendAllQs();
            }, function (jqXHR, textStatus, errorThrown) {
                window.setTimeout(request, 5000);
            });
        }
        function createRequest(sendQDatas) {
            var quest;
            quest = sendQDatas.map(function (sendQData) {
                var q = sendQData.quest;
                sendQData.ageSend = diffCurTime(sendQData.ts);
                q.age = sendQData.ageSend;
                return q;
            });
            return {
                tsInit: tsInit,
                idSat: idSat,
                seq: lastSeq,
                ts: getCurrentTime(),
                s_quest: quest
            };
        }
        return {
            sendQ: sendQ,
            asyncAnswerH: asyncAnswerH
        };
    }());
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
        var t = getCurrentTime() - time0;
        return (t >= 0) ? t : 0;
    }
    Comm_Sat.communicationHandler;
    var timeoutAjaxCommunication = 15000;
    function ajaxCommunication(uri, reqMsg, sendRespMsg, error) {
        return $.ajax({
            url: uri,
            contentType: "application/json",
            timeout: timeoutAjaxCommunication,
            data: JSON.stringify(reqMsg),
            dataType: "json",
            type: "POST",
            success: function (data, textStatus, jqXHR) {
                sendRespMsg(data);
            },
            error: error
        });
    }
    function getHostTime() {
        var delta = getCurrentTime() - satTimeInLastHostTime;
        if (delta < 0)
            delta = 0;
        return lastHostTime + delta;
    }
    function getAgeLastCom() {
        var age = getCurrentTime() - lastComHS;
        return (age >= 0) ? age : 0;
    }
    function reInit(er) {
        $("body").empty().html("&nbsp;&nbsp;reiniciando... razon: " + er);
        window.setTimeout(function () { window.location.reload(true); }, 5000);
    }
    function getSatTime() { return Date.now(); }
    function init(_idSat, localCommunication) {
        isLocal = (localCommunication != null);
        idSat = _idSat;
        Comm_Sat.communicationHandler = isLocal ? localCommunication : ajaxCommunication;
        HS.longPolling();
    }
    Comm_Sat.init = init;
})(Comm_Sat || (Comm_Sat = {}));
//# sourceMappingURL=Sat_Comm.js.map