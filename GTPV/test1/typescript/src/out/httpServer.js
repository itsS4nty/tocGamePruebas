/// <reference path="../libs/chrome/chrome-app.d.ts" />
/// <reference path="../libs/text-encoding/text-encoding.d.ts" />
var HttpServer;
(function (HttpServer) {
    var cserver = chrome.sockets.tcpServer;
    var csocket = chrome.sockets.tcp;
    var encoder = new TextEncoder("utf-8");
    var decoder = new TextDecoder("utf-8");
    var serverIds = Object.create(null);
    var socketIds = Object.create(null);
    var fListenersBinded = false;
    function bindListeners() {
        if (!fListenersBinded) {
            cserver.onAccept.addListener(onAccept);
            cserver.onAcceptError.addListener(onAcceptError);
            csocket.onReceive.addListener(onReceive);
            csocket.onReceiveError.addListener(onReceiveError);
            fListenersBinded = true;
        }
    }
    function createBuffer() {
        var queue = [];
        var start0;
        function normalize() {
            while (queue.length > 0) {
                if (start0 < queue[0].length)
                    return;
                queue.shift();
                start0 = 0;
            }
        }
        function getLength() {
            if (queue.length == 0)
                return 0;
            var len = queue.reduce(function (accum, curr) { return (accum + curr.length); }, 0);
            len -= start0;
            return len;
        }
        return {
            add: function (b) {
                queue.push(new Uint8Array(b));
                if (queue.length == 1)
                    start0 = 0;
            },
            next: function () {
                normalize();
                if (queue.length == 0)
                    return -1;
                return queue[0][start0++];
            },
            getAll: function () {
                normalize();
                var all = new Uint8Array(getLength());
                if (queue.length == 0)
                    return all;
                queue[0] = queue[0].subarray(start0);
                var offset = 0;
                queue.forEach(function (elem) {
                    all.set(elem, offset);
                    offset += elem.length;
                });
                return all;
            },
            get length() { return getLength(); }
        };
    }
    function onAccept(info) {
        if (info.socketId in serverIds) {
            socketIds[info.clientSocketId] = createRequestManager(info.clientSocketId, info.socketId);
            csocket.setPaused(info.clientSocketId, false, function () { });
        }
    }
    function onAcceptError(info) {
        if (info.socketId in serverIds) {
            console.warn("onAcceptError: " + info.resultCode);
        }
    }
    var ST;
    (function (ST) {
        ST[ST["ReqLine"] = 0] = "ReqLine";
        ST[ST["Headers"] = 1] = "Headers";
        ST[ST["Body"] = 2] = "Body";
        ST[ST["End"] = 3] = "End";
    })(ST || (ST = {}));
    ;
    var LF = "/n".charCodeAt(0);
    (function (Methods) {
        Methods[Methods["GET"] = 0] = "GET";
        Methods[Methods["HEAD"] = 1] = "HEAD";
        Methods[Methods["POST"] = 2] = "POST";
    })(HttpServer.Methods || (HttpServer.Methods = {}));
    var Methods = HttpServer.Methods;
    ;
    (function (StatusCodes) {
        StatusCodes[StatusCodes["OK"] = 200] = "OK";
        StatusCodes[StatusCodes["Bad_Request"] = 400] = "Bad_Request";
        StatusCodes[StatusCodes["Not_Found"] = 404] = "Not_Found";
        StatusCodes[StatusCodes["Internal_Server_Error"] = 500] = "Internal_Server_Error";
    })(HttpServer.StatusCodes || (HttpServer.StatusCodes = {}));
    var StatusCodes = HttpServer.StatusCodes;
    var MAX_REQ_LENGTH = 10 * 1024 * 1024;
    var MAX_TIME_RECEIVE = 100;
    function createRequestManager(clientSocketId, serverSocketId) {
        var buffer = createBuffer();
        var state = ST.ReqLine;
        var currentLine = "";
        var reqHeaderLines = [];
        var method;
        var uri;
        var reqVersion;
        var reqHeaders = Object.create(null);
        var reqContentType;
        var reqContentLength;
        var reqBody;
        var reqBodyUtf8;
        var respHeaders = Object.create(null);
        var timerID = null;
        function getLine() {
            var c;
            while ((c = buffer.next()) != -1) {
                if (c == LF) {
                    if ((currentLine.length > 0) && (currentLine[currentLine.length - 1] == "/r"))
                        currentLine.slice(0, -1);
                    var temp = currentLine;
                    currentLine = "";
                    return temp;
                }
                currentLine += String.fromCharCode(c);
            }
            return null;
        }
        function getReqHeader(name) {
            return reqHeaders[name.toLowerCase()];
        }
        function processReqHeaders() {
            reqHeaderLines.forEach(function (line) {
                var match = /^([^:]+):(?: |\t)(.*)/.exec(line);
                if (match == null)
                    ;
                var name = match[1].toLowerCase();
                var value = match[2];
                if (name in reqHeaders)
                    reqHeaders[name] += ", " + value;
                else
                    reqHeaders[name] = value;
            });
            reqContentType = getReqHeader("Content-Type");
            reqContentType = reqContentType ? reqContentType.toLowerCase() : "";
            var len = getReqHeader("Content-Length");
            reqContentLength = (/^([0-9]+)$/.test(len)) ? parseInt(len) : -1;
        }
        function processBuffer() {
            var line;
            try {
                switch (state) {
                    case ST.ReqLine:
                        line = getLine();
                        if (line === null)
                            return false;
                        var reqLine = line.split(" ");
                        if (reqLine.length != 3)
                            throw StatusCodes.Bad_Request;
                        else {
                            method = -1;
                            for (var i = 0; Methods[i]; i++)
                                if (reqLine[0] === Methods[i]) {
                                    method = i;
                                    break;
                                }
                            if (method == -1)
                                throw StatusCodes.Bad_Request;
                            else {
                                uri = decodeURI(reqLine[1]);
                                reqVersion = reqLine[2];
                                state = ST.Headers;
                            }
                        }
                    case ST.Headers:
                        var fLastHeader = false;
                        do {
                            line = getLine();
                            if (line === null)
                                return false;
                            if (line === "")
                                fLastHeader = true;
                            else {
                                var match = /^(?: |\t)+(.*)/.exec(line);
                                if (match == null)
                                    reqHeaderLines.push(line);
                                else if (reqHeaderLines.length > 0)
                                    reqHeaderLines[reqHeaderLines.length - 1] += line;
                                else
                                    throw StatusCodes.Bad_Request;
                            }
                        } while (!fLastHeader);
                        processReqHeaders();
                        if (method === Methods.POST) {
                            if (reqContentLength == -1)
                                throw StatusCodes.Bad_Request;
                            state = ST.Body;
                        }
                        else
                            break;
                    case ST.Body:
                        if (buffer.length < reqContentLength)
                            return false;
                        reqBody = buffer.getAll();
                        reqContentLength = reqBody.byteLength;
                        break;
                }
                stateEnd();
                return true;
            }
            catch (statusCode) {
                sendError(statusCode);
                return false;
            }
        }
        function sendError(statusCode) {
            stateEnd();
            var r = responseManager;
            r.statusCode = statusCode;
            r.reasonPhrase = getResponsePhrase(r.statusCode);
            r.contentType = "text/html";
            r.bodyUtf8 =
                "<html><head><title>" + statusCode + " " + r.reasonPhrase + "</title></head>" +
                    "<body><h1>" + statusCode + " " + r.reasonPhrase + "</h1>" +
                    "<p>" + (method == null) ? "" : (Methods[method] + "<br>" + (uri == null) ? "" : "uri: " + uri) + "</p>" +
                    "</body></html>";
            r.sendAndClose();
        }
        function stateEnd() {
            state = ST.End;
            if (timerID != null) {
                clearTimeout(timerID);
                timerID = null;
            }
        }
        function watchdogReceive() {
            timerID = null;
            sendError(StatusCodes.Bad_Request);
        }
        function getResponsePhrase(statusCode) {
            var reasonPhrase = StatusCodes[statusCode];
            if (reasonPhrase == null)
                reasonPhrase = "";
            else
                reasonPhrase.replace("_", " ");
            return reasonPhrase;
        }
        var socketInfo;
        var reqInfo = {
            get method() { return method; },
            get uri() { return uri; },
            get version() { return reqVersion; },
            get contentType() { return reqContentType; },
            get contentLength() { return reqContentLength; },
            get body() { return reqBody; },
            get bodyUtf8() {
                if (reqBodyUtf8 == null)
                    reqBodyUtf8 = decoder.decode(new DataView(reqBody));
                return reqBodyUtf8;
            },
            get localAddr() { return socketInfo.localAddress; },
            get localPort() { return socketInfo.localPort; },
            get peerAddr() { return socketInfo.peerAddress; },
            get peerPort() { return socketInfo.peerPort; }
        };
        var responseManager = {
            headers: Object.create(null),
            statusCode: StatusCodes.OK,
            reasonPhrase: null,
            contentType: null,
            body: null,
            set bodyUtf8(s) { responseManager.body = encoder.encode(s).buffer; },
            sendAndClose: function (callback) {
                var r = responseManager;
                if (r.reasonPhrase == null)
                    r.reasonPhrase = getResponsePhrase(r.statusCode);
                var resp = "HTTP/1.0 " + r.statusCode + " " + r.reasonPhrase + "\r\n";
                for (var name in r.headers) {
                    resp += name + ": " + r.headers[name] + "\r\n";
                }
                if (r.contentType != null)
                    resp += "Content-Type: " + r.contentType + "\r\n";
                var respBody = r.body;
                if (respBody instanceof ArrayBuffer)
                    resp += "Content-Length: " + respBody.byteLength + "\r\n";
                resp += "Server: GTPV Host\r\n";
                resp += "\r\n";
                csocket.send(clientSocketId, encoder.encode(resp), function (info) {
                    function close() { csocket.close(clientSocketId, callback); }
                    if ((respBody instanceof ArrayBuffer) && (respBody.byteLength > 0))
                        csocket.send(clientSocketId, respBody, close);
                    else
                        close();
                });
            },
            notHandled: findHandler,
            close: function (callback) {
                csocket.close(clientSocketId, callback);
            }
        };
        var handlers;
        var idxHandler;
        function findHandler() {
            while (idxHandler < handlers.length) {
                if (handlers[idxHandler++](reqInfo, responseManager))
                    return;
            }
            sendError(StatusCodes.Not_Found);
        }
        var totalReqLength = 0;
        var requestManager = {
            onReceive: function (data) {
                csocket.getInfo(clientSocketId, function (info) {
                    socketInfo = info;
                    if (state == ST.End)
                        return;
                    totalReqLength += data.byteLength;
                    if (totalReqLength >= MAX_REQ_LENGTH)
                        sendError(StatusCodes.Internal_Server_Error);
                    if (timerID != null)
                        clearTimeout(timerID);
                    timerID = setTimeout(watchdogReceive, MAX_TIME_RECEIVE);
                    buffer.add(data);
                    if (processBuffer()) {
                        handlers = serverIds[serverSocketId] || [];
                        idxHandler = 0;
                        findHandler();
                    }
                });
            },
            onReceiveError: function (resultCode) {
            }
        };
        return requestManager;
    }
    function onReceive(info) {
        var socketManager = socketIds[info.socketId];
        if (socketManager) {
            socketManager.onReceive(info.data);
        }
    }
    function onReceiveError(info) {
        var socketManager = socketIds[info.socketId];
        if (socketManager) {
            socketManager.onReceiveError(info.resultCode);
        }
    }
    function create(addr, port, reqHandlers, callback) {
        bindListeners();
        cserver.create(function (createInfo) {
            cserver.listen(createInfo.socketId, addr, port, function (result) {
                if (result >= 0) {
                    serverIds[createInfo.socketId] = reqHandlers;
                }
                callback(result);
            });
        });
    }
    HttpServer.create = create;
})(HttpServer || (HttpServer = {}));
//# sourceMappingURL=httpServer.js.map