/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="../libs/websql/websql.d.ts" />
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
    function escapeXMLCC(str) {
        function callbackReplace(str) {
            return "#" + String.fromCharCode(str.charCodeAt(0) + 0x40);
        }
        if (str == null)
            return null;
        return str.replace(/[\x00-\x1F#]/g, callbackReplace);
    }
    function unescapeXMLCC(str) {
        function callbackReplace(str, p1) {
            return String.fromCharCode(p1.charCodeAt(0) - 0x40);
        }
        if (str == null)
            return null;
        return str.replace(/@(.)/g, callbackReplace);
    }
    function setAttribute(node, name, value) {
        node.setAttribute(name, escapeXMLCC(value));
    }
    function getAttribute(node, name) {
        return unescapeXMLCC(node.getAttribute(name));
    }
    function setTextContent(node, value) {
        node.textContent = escapeXMLCC(value);
    }
    function getTextContent(node) {
        return unescapeXMLCC(node.textContent);
    }
    function getUserData(node) {
        if (node["g_UserData"] == null)
            node["g_UserData"] = {};
        return node["g_UserData"];
    }
    function getText(node) {
        var text = "";
        for (var child = node.firstChild; child != null; child = child.nextSibling) {
            if (child instanceof Text)
                text = text + getTextContent(child);
        }
        return text;
    }
    function copyAttribute(attrName, eIn, eOut) {
        var attrValue = getAttribute(eIn, attrName);
        if (attrValue != null)
            setAttribute(eOut, attrName, attrValue);
    }
    var T = {
        gtpvServer: "gtpv-server",
        gtpvClient: "gtpv-client",
        init: "init",
        session: "session",
        communication: "communication",
        db: "db",
        statement: "statement",
        exec: "exec",
        arg: "a",
        columns: "columns",
        col: "c",
        row: "row",
        value: "v",
        error: "error"
    };
    var A = {
        id: "id",
        name: "name",
        reload: "reload",
        noTransaction: "noTransaction",
        idStatement: "idStatement",
        NULL: "NULL",
        prefijoCliente: "prefijoCliente",
        idComm: "idComm",
        Llicencia: "Llicencia",
        delay: "delay",
        nErrors: "nErrors",
        rowsAffected: "ra",
        code: "code"
    };
    function createSendDoc() {
        return document.implementation.createDocument("", T.gtpvClient, null);
    }
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
    function insertIdCom(parent) {
        insertInitNode(parent, getInitIdCom());
    }
    function getInitIdCom() {
        return ({ idCom: H.ConfigGTPV.get("idCom") });
    }
    function insertInitNode(parent, map) {
        var init = parent.ownerDocument.createElement("init");
        for (var name in map) {
            setAttribute(init, name, map[name]);
        }
        parent.insertBefore(init, parent.firstChild);
    }
    function handleAjaxSuccess(data, textStatus, jqXHR) {
        // jQuery no detecta parserError como error, Chrome : html,body,parsererror, Firefox : parserError ??
        //	var x = new XMLSerializer();
        //	$("#preDebug").text(x.serializeToString(data));
        if (!processResponse(data)) {
            var x = new XMLSerializer();
            handleAjaxError(jqXHR, x.serializeToString(data), "gtpv_error");
            return;
        }
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
    function send(doc) {
        $.ajax({
            url: urlAjaxServidor,
            type: "POST",
            processData: false,
            contentType: "text/xml",
            data: doc,
            dataType: "xml",
            timeout: 60000,
            success: handleAjaxSuccess,
            error: handleAjaxError
        });
    }
    function processResponse(docIn) {
        function pendingChild(elem, inc) {
            if (getUserData(elem).pendingChilds == null)
                getUserData(elem).pendingChilds = 0;
            getUserData(elem).pendingChilds += inc;
            if (getUserData(elem).pendingChilds == 0) {
                if (docOut.documentElement == elem)
                    processOrdersRespServer();
                else {
                    if (elem.tagName == T.db) {
                        if (getUserData(elem).nErrors > 0)
                            setAttribute(elem, A.nErrors, "" + getUserData(elem).nErrors);
                    }
                    pendingChild(elem.parentNode, -1);
                }
            }
        }
        function getTransactionHandler(elem) {
            pendingChild(elem, +1);
            return function (tx) {
                var noTransaction = getUserData(elem).noTransaction;
                var execSqls = getUserData(elem).execSqls;
                var exec;
                while ((exec = execSqls.shift()) != null) {
                    var errorHandler = (noTransaction || exec.noTransaction) ? getErrorExecuteHandler(exec.element) : null;
                    tx.executeSql(exec.statement, exec.args, getSuccessHandler(exec.element), errorHandler);
                }
            };
        }
        function getErrorTransactionHandler(elem) {
            return function (err) {
                addError(elem, err);
                if (getUserData(elem).nErrors === 0)
                    getUserData(elem).nErrors = 1;
                pendingChild(elem, -1);
            };
        }
        function getSuccessTransactionHandler(elem) {
            return function () {
                pendingChild(elem, -1);
            };
        }
        function getSuccessHandler(elem) {
            return function (tx, r) {
                setAttribute(elem, A.rowsAffected, "" + r.rowsAffected);
                if (r.rows.length > 0) {
                    var columns = [];
                    var columnNode = docOut.createElement(T.columns);
                    var row;
                    var col;
                    row = r.rows.item(0);
                    for (col in row) {
                        var cNode = docOut.createElement(T.col);
                        setTextContent(cNode, col);
                        columnNode.appendChild(cNode);
                        columns.push(col);
                    }
                    elem.appendChild(columnNode);
                    for (var i = 0; i < r.rows.length; i++) {
                        var rowNode = docOut.createElement(T.row);
                        row = r.rows.item(i);
                        columns.forEach(function (col) {
                            var vNode = docOut.createElement(T.value);
                            if (row[col] == null)
                                setAttribute(vNode, A.NULL, "");
                            else
                                setTextContent(vNode, row[col]);
                            rowNode.appendChild(vNode);
                        });
                        elem.appendChild(rowNode);
                    }
                }
            };
        }
        function getErrorExecuteHandler(elem) {
            return function (tx, err) {
                addError(elem, err);
                getUserData(elem.parentNode).nErrors++;
                return false;
            };
        }
        function addError(elem, err) {
            var errorElem = docOut.createElement(T.error);
            setAttribute(errorElem, A.code, "" + err.code);
            setTextContent(errorElem, "" + err.message);
            elem.appendChild(errorElem);
        }
        var allowedTagsByTag = {};
        allowedTagsByTag[T.gtpvServer] = [T.session, T.db, T.init, T.communication];
        allowedTagsByTag[T.db] = [T.statement, T.exec];
        allowedTagsByTag[T.exec] = [T.arg];
        function processChilds(eIn, eOut, allowedTags) {
            if (allowedTags == null)
                allowedTags = allowedTagsByTag[eIn.tagName];
            for (var child = eIn.firstElementChild; child != null; child = child.nextElementSibling) {
                if (allowedTags.indexOf(child.tagName) != -1) {
                    switch (child.tagName) {
                        case T.db:
                            processElemDb(child, eOut);
                            break;
                        case T.session:
                            processElemSession(child, eOut);
                            break;
                        case T.statement:
                            processElemStatement(child, eOut);
                            break;
                        case T.exec:
                            processElemExec(child, eOut);
                            break;
                        case T.arg:
                            processElemA(child, eOut);
                            break;
                        case T.init:
                            processElemInit(child, eOut);
                            break;
                        case T.communication:
                            processElemComunication(child, eOut);
                            break;
                    }
                }
            }
        }
        function processElemDb(eIn, eOutParent) {
            var eOut = docOut.createElement(T.db);
            eOutParent.appendChild(eOut);
            getUserData(docOut.documentElement).sendRespServer = true;
            if (getAttribute(eIn, A.reload) != null)
                H.DB.reloadDB();
            copyAttribute(A.id, eIn, eOut);
            var name = getAttribute(eIn, A.name);
            if (name == null) {
                name = H.DB.getPrincipalName();
            }
            setAttribute(eOut, A.name, name);
            var db = H.DB.open(name);
            var ud = getUserData(eOut);
            ud.db = db;
            ud.statements = Object.create(null);
            ud.execSqls = [];
            ud.nErrors = 0;
            ud.noTransaction = (getAttribute(eIn, A.noTransaction) != null);
            ud.db.transaction(getTransactionHandler(eOut), getErrorTransactionHandler(eOut), getSuccessTransactionHandler(eOut));
            pendingChild(eOutParent, +1);
            processChilds(eIn, eOut);
        }
        function processElemSession(eIn, eOutParent) {
            eOutParent.appendChild(docOut.importNode(eIn, true));
        }
        function processElemStatement(eIn, eOutParent) {
            var id = getAttribute(eIn, A.id);
            var stat = getUserData(eOutParent).statements;
            stat[id] = getText(eIn);
        }
        function processElemExec(eIn, eOutParent) {
            var eOut = docOut.createElement(T.exec);
            eOutParent.appendChild(eOut);
            copyAttribute(A.id, eIn, eOut);
            getUserData(eOut).idStatement = +getAttribute(eIn, A.idStatement);
            getUserData(eOut).args = [];
            getUserData(eOut).noTransaction = (getAttribute(eIn, A.noTransaction) != null);
            processChilds(eIn, eOut);
            appendExecSql(eOut);
        }
        function appendExecSql(element) {
            var statement = getUserData(element.parentNode).statements[getUserData(element).idStatement];
            if (statement == null)
                statement = "";
            getUserData(element.parentNode).execSqls.push({ statement: statement, args: getUserData(element).args, element: element, noTransaction: getUserData(element).noTransaction });
        }
        function processElemA(eIn, eOutParent) {
            var val = (getAttribute(eIn, A.NULL) != null) ? null : getText(eIn);
            getUserData(eOutParent).args.push(val);
        }
        function processElemInit(eIn, eOutParent) {
            initDataSendCom = null;
            var fReinit = false;
            var prefijo = getAttribute(eIn, A.prefijoCliente);
            if (prefijo != null) {
                var prevPref = H.ConfigGTPV.get("prefijoCliente", false);
                if (prevPref != prefijo) {
                    H.ConfigGTPV.setPrefijo(prefijo);
                    LS.init(prefijo);
                    H.DB.init(prefijo, true);
                    if (prevPref != null)
                        fReinit = true;
                }
                else
                    prefijo = null;
            }
            var idComm = getAttribute(eIn, A.idComm);
            if (idComm != null) {
                if (idComm == "")
                    idComm = null;
                if (H.ConfigGTPV.get("idCom") !== idComm)
                    H.ConfigGTPV.set("idCom", idComm);
            }
            var llicencia = getAttribute(eIn, A.Llicencia);
            if (llicencia != null) {
                if (llicencia == "")
                    llicencia = null;
                if (H.ConfigGTPV.get("Llicencia") !== llicencia)
                    H.ConfigGTPV.set("Llicencia", llicencia);
            }
            if (prefijo != null) {
                var prefijos = (H.ConfigGTPV.get("prefijos", false) || []);
                prefijos.push(prefijo);
                H.ConfigGTPV.set([["prefijos", prefijos, false],
                    ["prefijoCliente", prefijo, false]], function () {
                    if (fReinit)
                        window.location.reload();
                    else
                        H.main.startApplication();
                });
            }
        }
        function processElemComunication(nodeIn, nodeOutParent) {
            var delay = getAttribute(nodeIn, A.delay);
            if (delay != null) {
                var delayMinutes = parseInt(delay);
                if (!isNaN(delayMinutes))
                    getUserData(docOut.documentElement).delayMinutes = delayMinutes;
            }
        }
        function processOrdersRespServer() {
            if (H.ConfigGTPV.get("idCom") != null) {
                if (getUserData(docOut.documentElement).sendRespServer === true) {
                    insertIdCom(docOut.documentElement);
                    send(docOut);
                }
                else {
                    var delayMinutes = getUserData(docOut.documentElement).delayMinutes;
                    if (delayMinutes != null) {
                        if (delayMinutes < 0)
                            delayMinutes = 0;
                    }
                    else
                        delayMinutes = defaultDelayMinutesComServer;
                    programCommunication(delayMinutes * 60 * 1000);
                    endCom();
                }
            }
            else {
                if (H.ConfigGTPV.get("prefijoCliente", false) == null) {
                    H.AppInicializarConServidor.start();
                }
            }
        }
        if ((docIn.documentElement == null) || (docIn.documentElement.tagName != T.gtpvServer))
            return false;
        var docOut = createSendDoc();
        processChilds(docIn.documentElement, docOut.documentElement);
        pendingChild(docOut.documentElement, 0);
        return true;
    }
})(Server || (Server = {}));
//# sourceMappingURL=Server.1.js.map