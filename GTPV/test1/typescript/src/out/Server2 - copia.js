/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="db2.ts" />
"use strict";
var Server;
(function (Server) {
    var my = {};
    var urlAjaxServidor = "../server/Ajax_XML_1.php";
    var defaultDelayMinutesComServer = 60;
    var delayMinutesRetries = 5;
    var defaultRetriesComServer = 3;
    var retriesComServer = defaultRetriesComServer;
    var timeoutComServerID = null;
    var initDataSendCom = null;
    function setInitDataCom(_initData) { initDataSendCom = _initData; }
    Server.setInitDataCom = setInitDataCom;
    var timeNextCom = -1;
    function programCommunication(delay) {
        window.clearTimeout(timeoutComServerID);
        timeoutComServerID = window.setTimeout(startCom, delay);
        timeNextCom = Date.now() + delay;
    }
    Server.programCommunication = programCommunication;
    function getIpLan(fInitCom) {
        var ip;
        ip = H.Comm.getSiteLocalAddresses();
        if (ip == null) {
            window.setTimeout(getIpLan, 1000, true);
            return null;
        }
        ip = ip.join(" ");
        if (fInitCom) {
            if (fInCommunication)
                fPendingCommunication = true;
            else
                programCommunication(0);
        }
        return ip;
    }
    var fInCommunication = false;
    var fPendingCommunication = false;
    function endCom() {
        H.DB.endComServer(function () {
            fInCommunication = false;
            if (fPendingCommunication) {
                fPendingCommunication = false;
                startCom();
            }
        });
    }
    function startCom() {
        timeNextCom = -1;
        if (fInCommunication) {
            fPendingCommunication = true;
            return false;
        }
        fInCommunication = true;
        H.DB.startComServer();
        var doc = createSendDoc();
        var init = (initDataSendCom || getInitIdCom());
        var ipLan = getIpLan();
        if (ipLan != null)
            init.ipLan = ipLan;
        insertInitNode(doc.documentElement, init);
        send(doc);
    }
    function handleAjaxSuccess(data, textStatus, jqXHR) {
        if (typeof data === "string") {
            console.log("Error communiction server:");
            console.log(data);
            return;
        }
        var errMsg = null;
        if ((data == null) || (typeof data !== "object")) {
            errMsg =
            ;
            return;
        }
        else
            errMsg = processResponse(data);
        retriesComServer = defaultRetriesComServer;
    }
    function handleAjaxError(jqXHR, textStatus, errorThrown) {
        endCom();
        var delayMinutes;
        if (retriesComServer > 0) {
            retriesComServer--;
            delayMinutes = delayMinutesRetries;
        }
        else {
            retriesComServer = defaultRetriesComServer;
            delayMinutes = defaultDelayMinutesComServer;
        }
        programCommunication(delayMinutes * 60 * 1000);
    }
    function send(out) {
        $.ajax({
            url: urlAjaxServidor,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(out),
            dataType: "json",
            timeout: 60000,
            success: handleAjaxSuccess,
            error: handleAjaxError
        });
    }
    function processTransaction(msgTr, db, callback) {
        if ((msgTr == null) || (typeof msgTr !== "object")) {
            callback("error: null || !object");
            return;
        }
        var outTr = { id: msgTr.id };
        var msgTrObjStores = msgTr.objectStores;
        try {
            if (!Array.isArray(msgTrObjStores))
                throw "error: not array";
            var tr = db.transaction(db.objectStoreNames, "readwrite");
        }
        catch (e) {
            outTr.error = e.toString();
            outTr.objectStores = null;
            callback(outTr);
            return;
        }
        tr.oncomplete = function (ev) {
            callback();
        };
        tr.onabort = function (ev) {
        };
        if (msgTr.abortOnError !== false)
            msgTr.abortOnError = true;
        outTr.objectStores = [];
        for (var i = 0; i < msgTrObjStores.length; i) {
            try {
                var outObj = {};
                outTr.objectStores.push(outObj);
                processTrObjStore(tr, msgTrObjStores[i], msgTr.abortOnError, outObj);
            }
            catch (e) {
                outObj.err = (typeof e === "string") ? "error: " + e : e.toString();
                tr.abort();
                return;
            }
        }
    }
    function createModify(script) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (script == null) {
            return function () {
                var innerArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    innerArgs[_i - 0] = arguments[_i];
                }
                var last = innerArgs.pop();
                last.apply(null, innerArgs);
            };
        }
        else {
            var dataToSend = [];
            return function () {
                var innerArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    innerArgs[_i - 0] = arguments[_i];
                }
            };
        }
    }
    function createFilter(script) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (script == null) {
            return function () {
                var innerArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    innerArgs[_i - 0] = arguments[_i];
                }
                var last = innerArgs.pop();
                last.call(null, true);
            };
        }
        else {
            var dataToSend = [];
            return function () {
                var innerArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    innerArgs[_i - 0] = arguments[_i];
                }
            };
        }
    }
    function processServSubTr(tr, servTr, abortOnError, outTr) {
        if ($.type(servTr) !== "object")
            throw "no object";
        outTr.id = servTr.id;
        outTr.type = servTr.type;
        outTr.objName = servTr.objName;
        var os = tr.objectStore(servTr.objName);
        var index;
        if (servTr.index != null)
            index = os.index(servTr.index);
        var type = servTr.type;
        var values = servTr.values;
        var keys = servTr.keys;
        var modify = servTr.modify;
        var filter = servTr.filter;
        if ((values != null) && (!Array.isArray(values)))
            throw message;
        if ((keys != null) && (!Array.isArray(keys)))
            throw message;
        if ((modify != null) && (typeof modify !== "string"))
            throw message;
        if ((filter != null) && (typeof filter !== "string"))
            throw message;
        var columns = servTr.columns;
        if ((columns != null) && (!Array.isArray(columns)))
            throw message;
        if (!columns.every(function (col) { return ((col == null) || (typeof col === "string")); }))
            throw message;
        var upper = servTr.upper;
        var lower = servTr.lower;
        var keyRange;
        if (lower != null) {
            if (upper != null)
                keyRange = IDBKeyRange.bound(lower, upper, servTr.lowerOpen, servTr.upperOpen);
            else
                keyRange = IDBKeyRange.lowerBound(lower, servTr.lowerOpen);
        }
        else if (upper != null) {
            keyRange = IDBKeyRange.upperBound(upper, servTr.upperOpen);
        }
        else if (servTr.only != null)
            keyRange = IDBKeyRange.only(servTr.only);
        var direction = servTr.direction;
        if ((direction != null) && (typeof direction !== "string"))
            throw message;
        var noValues = servTr.noValues;
        var withKeys = servTr.withKeys;
        var withPrimaryKeys = servTr.withPrimaryKeys;
        if (typeof servTr.abortOnError === "boolean")
            abortOnError = servTr.abortOnError;
        outTr.errors = {};
        function constructValue(val) {
            if (!columns)
                return val;
            if (!Array.isArray(val))
                return val;
            var objVal = Object.create(null);
            columns.forEach(function (col, idx) {
                if (col != null)
                    objVal[col] = val[idx];
            });
            return objVal;
        }
        function deconstructValue(val) {
            if (!columns)
                return val;
            if ((val == null) || (typeof val !== "object"))
                return null;
            return columns.map(function (col) {
                if (col == null)
                    return null;
                return val[col];
            });
        }
        switch (type) {
            case "put":
            case "add":
                if (values == null)
                    throw message;
                if ((keys != null) && (values.length != keys.length))
                    throw message;
                if (keys == null)
                    keys = [];
                var funModify = createModify(modify, "val", "key");
                var funFilter = createFilter(filter, "val", "key");
                for (var i = 0; i < values.length; i++) {
                    var val = constructValue(values[i]);
                    funModify(val, keys[i], i, function (val, key, i) {
                        funFilter(val, key, function (accepted) {
                            if (accepted) {
                                var req = (type === "put") ? os.put(val, key) : os.add(val, key);
                                req.onerror = function (ev) {
                                    outTr.errors[i] = {
                                        name: req.error.name,
                                        message: req.error.message,
                                        val: val,
                                        key: key
                                    };
                                    if (!abortOnError)
                                        ev.preventDefault();
                                };
                            }
                        });
                    });
                }
                break;
            case "get":
            case "delete":
            case "update":
                var funModify = createModify(modify, "val", "key");
                var funFilter = createFilter(filter, "val", "key");
                if (keys == null) {
                    if (keyRange)
                        keys = [keyRange];
                    else
                        keys = [undefined];
                }
                var outValues = [];
                var outKeys = [];
                var outPrimaryKeys = [];
                var nPending = 0;
                function checkPendings() {
                    if (nPending > 0)
                        return;
                    switch (type) {
                        case "get":
                            if (!noValues)
                                merge;
                            break;
                        case "delete":
                            break;
                        case "update":
                            break;
                    }
                }
                var fOpenKeyCursor = (noValues && index && (type === "get"));
                for (var i = 0; i < keys.length; i++) {
                    nPending++;
                    outValues.push([]);
                    outKeys.push([]);
                    outPrimaryKeys.push([]);
                    var req;
                    try {
                        if (fOpenKeyCursor)
                            req = index.openKeyCursor(keys[i], direction);
                        else
                            req = ((index) ? index : os).openCursor(keys[i], direction);
                    }
                    catch (e) {
                        nPending--;
                        return;
                        continue;
                    }
                    req.onsuccess = (function (i) {
                        return function (ev) {
                            var req = ev.target;
                            var cursor = req.result;
                            if (cursor) {
                                funModify(cursor.value, cursor.key, cursor.primaryKey, false, function (val, key, primaryKey, fDelete) {
                                    funFilter(val, key, primaryKey, function (accept) {
                                        if (accept) {
                                            switch (type) {
                                                case "get":
                                                    outValues[i].push(val);
                                                    outKeys[i].push(key);
                                                    outPrimaryKeys[i].push(primaryKey);
                                                    break;
                                                case "delete":
                                                    cursor.delete();
                                                    break;
                                                case "update":
                                                    var req = cursor.update(val);
                                                    req.onerror = function (ev) {
                                                    };
                                                    break;
                                            }
                                        }
                                        nPending--;
                                        checkPendings();
                                    });
                                });
                                cursor.continue();
                            }
                            else {
                                nPending--;
                                if (nPending == 0)
                                    ;
                            }
                        };
                    })(i);
                }
                if (nPending == 0) {
                }
                if (keys.length == 0)
                    return;
                var i = 0;
                try {
                    var req = ((index) ? index : os).openCursor(keys[i], direction);
                    req.onsuccess = function (ev) {
                        var req = ev.target;
                        var cursor = req.result;
                        if (cursor) {
                            cursor.continue();
                        }
                        else {
                        }
                    };
                }
                catch (e) {
                }
                for (var i = 0; i < keys.length; i++) {
                }
                {
                    outObj.values = [];
                }
                if (index && msgTrObj.withPrimaryKeys) {
                    for (var i = 0; i < keys.length; i++) {
                        try {
                            var req = index.getKey(keys[i]);
                            req.onsuccess = function (ev) {
                                var req = ev.target;
                                var val = req.result;
                            };
                        }
                        catch (e) {
                        }
                    }
                    for (var i = 0; i < keys.length; i++) {
                        try {
                            var req = (index) ? index.get(keys[i]) : os.get(keys[i]);
                            req.onsuccess = function (ev) {
                                var req = ev.target;
                                var val = req.result;
                            };
                        }
                        catch (e) {
                        }
                    }
                }
                break;
            default:
        }
    }
    function processDB(msgDB, callback) {
        var nameDB = msgDB.name;
        if (typeof nameDB !== "string")
            throw "yy";
        processSchema(msgDB, function (db, err) {
            if (err != null)
                callback(err);
            var msgTransactions = msgDB.transactions;
            if (msgTransactions == null)
                msgTransactions = [];
            if (!Array.isArray(msgTransactions))
                callback();
            var tr = db.transaction(db.objectStoreNames, "readwrite");
            for (var iTr = 0; iTr < msgTransactions.length; iTr++) {
                var msgTr = msgTransactions[iTr];
                if ((msgTr == null) || (typeof msgTr !== "object") || (typeof msgTr.type !== "string"))
                    throw "h";
                try {
                    var os = tr.objectStore(msgTr.objectStore);
                    var idx;
                    if (msgTr.index != null)
                        idx = os.index(msgTr.index);
                    var values = msgTr.values;
                    switch (msgTr.type) {
                        case "put":
                            if (!Array.isArray(values))
                                callback();
                            var keys = msgTr.keys;
                            if ((keys != null) && !Array.isArray(keys))
                                callback();
                            for (var i = 0; i < values.length; i++) {
                                var req = (keys) ? os.put(values[i], keys[i]) : os.put(values[i]);
                                req.onerror = (function (i) {
                                    return function (ev) {
                                        req = ev.target;
                                        errors[i] = [req.error.name, ,];
                                    };
                                })(i);
                            }
                            values.forEach(function (v) {
                                os.put();
                            });
                            break;
                        default:
                            break;
                    }
                }
                catch (e) {
                }
                if (db.msgTr.objectStore)
                    switch (msgTr.type) {
                    }
                "";
            }
        });
    }
    ;
})(Server || (Server = {}));
function createIndex(os, nameIdx, params) {
    if (!os.indexNames.contains(nameIdx))
        os.createIndex(nameIdx, params.keyPath, { unique: params.unique, muliEntry: params.multiEntry });
}
function createAppIndexs(nameObj, db) {
}
function checkSchema(msgSchema) {
    if (typeof msgSchema !== "object")
        return false;
    for (var nameObj in msgSchema) {
        if (msgSchema[nameObj] == null)
            msgSchema[nameObj] = {};
        var msgObj = msgSchema[nameObj];
        if (typeof msgObj !== "object")
            return false;
        if (msgObj.indexs == null)
            msgObj.indexs = {};
        if (typeof msgObj.indexs !== "object")
            return false;
    }
}
function processSchema(msgDB, callback) {
    var nameDB = msgDB.name;
    if (typeof nameDB !== "string") {
        callback(null, "");
        return;
    }
    var msgSchema = msgDB.schema;
    if (msgSchema == null)
        msgSchema = {};
    if (!checkSchema(msgSchema)) {
        callback(null, "");
        return;
    }
    function onUpgradeSchema(ev) {
        var db = openReq.result;
        var tr = openReq.transaction;
        var os;
        try {
            for (var nameObj in msgSchema) {
                var msgObj = msgSchema[nameObj];
                var create = !db.objectStoreNames.contains(nameObj);
                if (create) {
                    os = db.createObjectStore(nameObj, { keyPath: msgObj.keyPath, autoIncrement: msgObj.autoIncrement });
                }
                else {
                    os = tr.objectStore(nameObj);
                }
                var msgIndexs = msgObj.indexs;
                for (var nameIdx in msgIndexs) {
                    createIndex(os, nameIdx, msgIndexs[nameIdx]);
                }
                if (create) {
                    createAppIndexs(nameObj, db);
                }
            }
        }
        catch (e) {
            tr.abort();
            callback(null, e.toString());
        }
    }
    var openReq = indexedDB.open(nameDB);
    openReq.onupgradeneeded = onUpgradeSchema;
    openReq.onsuccess = function (ev) {
        var db = openReq.result;
        var tr = db.transaction(db.objectStoreNames);
        try {
            for (var nameObj in msgSchema) {
                var os = tr.objectStore(nameObj);
                var msgIndexs = msgSchema[nameObj].indexs;
                for (var nameIdx in msgIndexs) {
                    var idx = os.index(nameIdx);
                }
            }
        }
        catch (e) {
            openReq = indexedDB.open(nameDB, +db.version + 1);
            openReq.onupgradeneeded = onUpgradeSchema;
            openReq.onsuccess = function (ev) {
                var db = openReq.result;
                callback(db);
            };
        }
    };
}
checkHeader;
processClientInfo;
checkLockUD;
processDbs;
process;
if ((docIn.documentElement == null) || (docIn.documentElement.tagName != T.gtpvServer))
    return false;
var docOut = createSendDoc();
processChilds(docIn.documentElement, docOut.documentElement);
pendingChild(docOut.documentElement, 0);
return true;
//# sourceMappingURL=Server2 - copia.js.map