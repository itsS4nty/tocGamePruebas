/// <reference path="../libs/chrome/chrome-app.d.ts" />
/// <reference path="../libs/text-encoding/text-encoding.d.ts" />

module HttpServer {
	import cserver = chrome.sockets.tcpServer;
	import csocket = chrome.sockets.tcp;
	
	var encoder = new TextEncoder("utf-8");
	var decoder = new TextDecoder("utf-8");
	
	var serverIds : {
		[id:number] : Handler[]
	} = Object.create(null);
	
	interface RequestManager {
		onReceive: (data: ArrayBuffer) => void,
		onReceiveError: (resultCode: number) => void
	}
	
	var socketIds : {
		[id:number] : RequestManager
	} = Object.create(null);
	
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
		var queue:Uint8Array[] = [];
		var start0:number;
		
		function normalize() {
			while (queue.length > 0) {
				if (start0 < queue[0].length) return;
				queue.shift();
				start0 = 0;
			}
		}
		
		function getLength() {
			if (queue.length == 0) return 0;
			var len = queue.reduce((accum,curr) => (accum+curr.length), 0);
			len -= start0;
			return len;				
		} 
		
		return {
			add: function (b: ArrayBuffer) {
				queue.push(new Uint8Array(b));
				if (queue.length == 1) start0=0;
			},
			next : function() {
				normalize();
				if (queue.length == 0) return -1;
				return queue[0][start0++];
			},
			getAll : function() {
				normalize();
				var all = new Uint8Array(getLength());
				if (queue.length == 0) return all;
				queue[0] = queue[0].subarray(start0);
				var offset = 0;
				queue.forEach(function(elem) {
					all.set(elem, offset);
					offset+=elem.length
				})
				return all;
			},
			get length() { return getLength() }
		}	
	}
	
	function onAccept(info: cserver.AcceptEventArgs) {
		if (info.socketId in serverIds) {
			socketIds[info.clientSocketId] = createRequestManager(info.clientSocketId, info.socketId);
			csocket.setPaused(info.clientSocketId, false, function() {});
		}	
	}
	
	function onAcceptError(info: cserver.AcceptErrorEventArgs) {
		if (info.socketId in serverIds) {
			console.warn("onAcceptError: "+info.resultCode);	
		}
	}
	
	enum ST {ReqLine, Headers, Body, End};
	var LF = "/n".charCodeAt(0);
	export enum Methods {GET, HEAD, POST};
	export interface Headers { [name:string]:string }
	
	export enum StatusCodes {
		OK=200,
		Bad_Request=400,
		Not_Found=404,
		Internal_Server_Error=500
	}
	var MAX_REQ_LENGTH = 10*1024*1024;
	var MAX_TIME_RECEIVE = 100; 
	
	function createRequestManager(clientSocketId: number, serverSocketId: number) : RequestManager {
		var buffer = createBuffer();
		var state:ST = ST.ReqLine;
		var currentLine:string="";
		var reqHeaderLines:string[] = [];

		var method:Methods;
		var uri:string;
		var reqVersion:string;
		var reqHeaders:Headers = Object.create(null);
		var reqContentType:string;
		var reqContentLength:number;
		var reqBody: ArrayBuffer;
		var reqBodyUtf8: string;
		
		var respHeaders:Headers = Object.create(null);
		
		var timerID:number=null;
		
		function getLine() : string {
			var c:number;
			while ((c=buffer.next()) != -1) {
				if (c==LF) {
					if ((currentLine.length > 0) && (currentLine[currentLine.length-1] == "/r")) 
						currentLine.slice(0,-1); // remove last CR
					var temp = currentLine; 
					currentLine="";
					return temp;
				} 
				currentLine += String.fromCharCode(c);
			}
			return null;
		}
		
		function getReqHeader(name:string) {
			return reqHeaders[name.toLowerCase()];
		}
		
		function processReqHeaders() {
			reqHeaderLines.forEach(function(line){
				var match = /^([^:]+):(?: |\t)(.*)/.exec(line);
				if (match == null) ;// error
				var name = match[1].toLowerCase();
				var value = match[2];
				if (name in reqHeaders) reqHeaders[name] += ", " + value;
				else reqHeaders[name] = value;
			});
			reqContentType = getReqHeader("Content-Type")
			reqContentType = reqContentType ? reqContentType.toLowerCase() : "";
			var len = getReqHeader("Content-Length");
			reqContentLength = (/^([0-9]+)$/.test(len)) ? parseInt(len) : -1;
		}
		
		function processBuffer() {
			var line:string;
			
			try {
				switch (state) {
					case ST.ReqLine:
						line = getLine();
						if (line === null) return false;
						var reqLine = line.split(" ");
						if (reqLine.length != 3) throw StatusCodes.Bad_Request
						else {
							method = -1;
							for (var i=0; Methods[i]; i++) 
								if (reqLine[0] === Methods[i]) { method = i; break; }
							if (method == -1) throw StatusCodes.Bad_Request
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
							if (line === null) return false;
							if (line === "") fLastHeader = true;
							else {
								var match = /^(?: |\t)+(.*)/.exec(line);
								if (match == null) reqHeaderLines.push(line);
								else if (reqHeaderLines.length > 0) reqHeaderLines[reqHeaderLines.length-1] += line;
								else throw StatusCodes.Bad_Request;
							}
						} while (!fLastHeader);
						processReqHeaders();
						if (method === Methods.POST) {
							if (reqContentLength == -1) throw StatusCodes.Bad_Request;
							state = ST.Body;
						} else break;
					case ST.Body:
						if (buffer.length < reqContentLength) return false;
						reqBody = buffer.getAll();
						reqContentLength = reqBody.byteLength;
						break;
				}
				stateEnd();
				return true; 
			} catch(statusCode) {
				sendError(statusCode);
				return false;
			}
		}
		
		function sendError(statusCode: number) {
			stateEnd();
			var r = responseManager;
			r.statusCode = statusCode;
			r.reasonPhrase = getResponsePhrase(r.statusCode);
			r.contentType = "text/html";
			r.bodyUtf8 = 
				"<html><head><title>"+statusCode+" "+r.reasonPhrase+"</title></head>"+
				"<body><h1>"+statusCode+" "+r.reasonPhrase+"</h1>"+
				"<p>"+(method == null)?"":(Methods[method]+"<br>"+(uri == null)?"":"uri: "+uri)+"</p>"+
				"</body></html>";
			r.sendAndClose();	
		}
		
		function stateEnd() {
			state = ST.End;
			if (timerID != null) { clearTimeout(timerID); timerID=null; }
		}
		
		function watchdogReceive() {
			timerID=null;
			sendError(StatusCodes.Bad_Request);
		}

		function getResponsePhrase(statusCode: number) {
			var reasonPhrase = StatusCodes[statusCode];
			if (reasonPhrase == null) reasonPhrase = "";
			else reasonPhrase.replace("_"," ");
			return reasonPhrase;
		}

		var socketInfo : csocket.SocketInfo;

		var reqInfo: ReqInfo = {
				get method() { return method; },
				get uri() { return uri; },
				get version() { return reqVersion; },
				get contentType() { return reqContentType; },
				get contentLength() { return reqContentLength; },
				get body() { return reqBody; },
				get bodyUtf8() { 
					if (reqBodyUtf8 == null) reqBodyUtf8 = decoder.decode(new DataView(reqBody)); 
					return reqBodyUtf8;
				},
				get localAddr() { return socketInfo.localAddress; },
				get localPort() { return socketInfo.localPort; },
				get peerAddr() { return socketInfo.peerAddress; },
				get peerPort() { return socketInfo.peerPort; }
		};
		
		var responseManager: ResponseManager = {
			headers: Object.create(null),
			statusCode: StatusCodes.OK,
			reasonPhrase: null,
			contentType: null,
			body: null,
			set bodyUtf8(s:string) { responseManager.body = encoder.encode(s).buffer; },
			sendAndClose(callback?:()=>void) {
				var r = responseManager;
				if (r.reasonPhrase == null) r.reasonPhrase = getResponsePhrase(r.statusCode);
				var resp = "HTTP/1.0 "+r.statusCode+" "+r.reasonPhrase+"\r\n";	
				for (var name in r.headers) {
					resp += name+": "+r.headers[name]+"\r\n";
				}
				if (r.contentType != null) resp += "Content-Type: "+r.contentType+"\r\n";
				var respBody = r.body;
				if (respBody instanceof ArrayBuffer) resp += "Content-Length: "+respBody.byteLength+"\r\n";
				resp += "Server: GTPV Host\r\n";
				resp += "\r\n";
				csocket.send(clientSocketId, encoder.encode(resp),function(info: csocket.SendInfo) {
					function close() { csocket.close(clientSocketId, callback); }
					if ((respBody instanceof ArrayBuffer) && (respBody.byteLength > 0))
						csocket.send(clientSocketId, respBody, close);		
					else close();		
				});
			},
			notHandled: findHandler,
			close(callback?:()=>void) {
				csocket.close(clientSocketId, callback); 
			}
		};

		var handlers:Handler[];
		var idxHandler:number;
		
		function findHandler() {
			while(idxHandler < handlers.length) {
				if (handlers[idxHandler++](reqInfo, responseManager)) return;
			}
			sendError(StatusCodes.Not_Found);
		}
		
		var totalReqLength=0;
		
		var requestManager = {
			onReceive(data: ArrayBuffer) {
				csocket.getInfo(clientSocketId, function(info: csocket.SocketInfo) {
					socketInfo = info;	
					if (state == ST.End) return;
					totalReqLength += data.byteLength;
					if (totalReqLength >= MAX_REQ_LENGTH) sendError(StatusCodes.Internal_Server_Error);
					if (timerID != null) clearTimeout(timerID);
					timerID = setTimeout(watchdogReceive,MAX_TIME_RECEIVE);
					buffer.add(data);
					if (processBuffer()) {
						handlers = serverIds[serverSocketId] || [];
						idxHandler = 0;
						findHandler();
					}
				});
			},
			onReceiveError(resultCode: number) {
				// ?? disconect
			}
		}
		
		return requestManager;
	}
	
	function onReceive(info: csocket.ReceiveEventArgs) {
		var socketManager=socketIds[info.socketId];
		if (socketManager) {
			socketManager.onReceive(info.data);
		}
	}

	function onReceiveError(info: csocket.ReceiveErrorEventArgs) {
		var socketManager=socketIds[info.socketId];
		if (socketManager) {
			socketManager.onReceiveError(info.resultCode);
		}
	}
	
	export interface ReqInfo {
		method : Methods,
		uri: string,
		version: string,
		contentType: string
		contentLength: number,
		body : ArrayBuffer,
		bodyUtf8 : string,
		localAddr: string,
		localPort: number,
		peerAddr: string,
		peerPort: number
	}
	export interface ResponseManager {
		headers: Headers,
		statusCode: number,
		reasonPhrase: string,
		contentType: string,
		body: ArrayBuffer,
		bodyUtf8: string,
		sendAndClose(callback?:()=>void): void,
		close(callback?:()=>void): void,
		notHandled: ()=>void
	}
	
	export interface Handler {
		(reqInfo: ReqInfo, respManager: ResponseManager) : boolean
	}
	export function create(addr:string, port: number, reqHandlers:Handler[], callback : (error:number)=>void) {
		bindListeners();
		cserver.create(function (createInfo: cserver.CreateInfo) {
			cserver.listen(createInfo.socketId, addr, port, function (result) {
				if (result>=0) {
					serverIds[createInfo.socketId] = reqHandlers;
				}
				callback(result);
			})
		});
	}
}

