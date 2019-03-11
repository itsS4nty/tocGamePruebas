H.Server = function() {
	var my = {};
	
	var urlAjaxServidor = "../server/Ajax_XML_1.php"; // <base href="cliente/">
	var defaultDelayMinutesComServer = 60;
	var delayMinutesRetries = 5;
	var defaultRetriesComServer = 3;
	var retriesComServer = defaultRetriesComServer; 
	var timeoutComServerID = null;

	/**********************
	** tratamiento datos **
	**********************/
	
	function escapeXMLCC(str) {
		function callbackReplace(str,p1) {
			var val = p1.charCodeAt(0);
			var hex = "0123456789ABCDEF";
			return "\\x"+hex.charAt((Math.floor(val/16))%16)+hex.charAt(val%16);
		}
		if (str == null) return null;
		return (new String(str)).replace(/([\x00-\x1F\\])/g, callbackReplace);
	}

	function unescapeXMLCC(str) {
		function callbackReplace(str,p1) {
			return String.fromCharCode(parseInt(p1,16));
		}
		if (str == null) return null;
		return (new String(str)).replace(/\\x([0-9A-Fa-f]{2})/g, callbackReplace);
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
		if (node.g_UserData == null) node.g_UserData = {};
		return node.g_UserData;
	}

	function getText(node) {
		var text = "";
		for (var child=node.firstChild; child != null; child=child.nextSibling) {
			if (child instanceof Text) text = text + getTextContent(child);
		}
		return text;
	}

	function copyAttribute(attrName, nodeIn, nodeOut) {
		var attrValue = getAttribute(nodeIn, attrName);
		if (attrValue != null) setAttribute(nodeOut, attrName, attrValue);	
	}

	/*********	
	** send **
	*********/
	
	function createSendDoc() {
		return document.implementation.createDocument("", "gtpv", null);
	}

	my.programCommunication = function(delay, initData) {
		window.clearTimeout(timeoutComServerID);
		timeoutComServerID = window.setTimeout(startCom, delay, initData);
	}

	function getIpLan(initCom) {
		var ip;
		ip = H.Comm.getSiteLocalAddresses();
		if (ip == null) {
			window.setTimeout(getIpLan, 1000, true);
			return null;			
		}
		ip = ip.join(" ");
		if (initCom) {
			if (fInCommunication) fPendingCommunication=true;
			else my.programCommunication(0);
		} 
		return ip;
	}
	
	var fInCommunication = false;
	var fPendingCommunication = false;
	function setInCommunication(fComm) {
		fInCommunication = fComm;
		H.DB.communicationServer(fComm);
		if (!fComm && fPendingCommunication) {
			fPendingCommunication = false;
			my.programCommunication(10000); // no iniciar inmediatamente, para acabar DB ?
		}
	}
	
	var savedInitData; // resend ajax error
	function startCom(initData) {
		// if (timeoutComServerID != null) window.clearTimeout(timeoutComServerID); 
		// if (H.DB.getComServer() == true) ??
		setInCommunication(true);
		var doc = createSendDoc();
		if (initData == null) initData = getInitIdCom();
		var ipLan = getIpLan();
		if (ipLan != null) initData.ipLan = ipLan; 
		savedInitData = initData;
		insertInitNode(doc.documentElement, initData);
		send(doc);
	}

	function insertIdCom(nodeParent) {
		insertInitNode(nodeParent, getInitIdCom());
	}

	function getInitIdCom() { // normal Init Comunication data
		return ({ idCom: H.GlobalGTPV.get("idCom") }); 
	}

	function insertInitNode(nodeParent, map) {
		var init = nodeParent.ownerDocument.createElement("init");
		for (name in map) {
			setAttribute(init, name, map[name]);	
		}
		nodeParent.insertBefore(init, nodeParent.firstChild);
	}

	function handleAjaxSuccess(data, textStatus, jqXHR) {
		// jQuery no detecta parserError como error, Chrome : html,body,parsererror, Firefox : parserError ??
	//	var x = new XMLSerializer();
	//	$("#preDebug").text(x.serializeToString(data));
		
		if (!processResponse(data)) {
	//		$("#debug").append(document.importNode(data.documentElement,true));
			var x = new XMLSerializer();
			handleAjaxError(jqXHR, x.serializeToString(data), "gtpv_error");   
			return;
		} 
		retriesComServer = defaultRetriesComServer;
	}

	function handleAjaxError(XHR, textStatus, errorThrown) {
		setInCommunication(false);
		var delayMinutes;
		if (retriesComServer > 0) {
			retriesComServer--;
			delayMinutes = delayMinutesRetries;
		} else {
			retriesComServer = defaultRetriesComServer;
			delayMinutes = defaultDelayMinutesComServer;
		}
		my.programCommunication(delayMinutes*60*1000, savedInitData);
	}

	function send(doc) {
		$.ajax({ 
			url: urlAjaxServidor,
			type: "POST",
			processData: false,
			contentType: "text/xml",
			data : doc,
			dataType: "xml",
			timeout: 60000,
			success: handleAjaxSuccess,
			error : handleAjaxError
		});
	}
	
	/************
	** receive **
	************/
	
	function processResponse(docIn) {

		function pendingChild(node, inc) {
			if (getUserData(node).pendingChilds == null) getUserData(node).pendingChilds = 0;
			getUserData(node).pendingChilds += inc;
			if (getUserData(node).pendingChilds == 0) {
				if (docOut.documentElement == node) processOrdersRespServer();
				else {
					if (node.tagName == 'db') {
						if (getUserData(node).nErrors > 0) setAttribute(node, "errors", getUserData(node).nErrors); 	
					}
					pendingChild(node.parentNode, -1);
				}
			}
		}
		
		function getTransactionHandler(node) {
			pendingChild(node, +1);
			return function(tx) {
				var noTransaction = getUserData(node).noTransaction;
				var execSql = getUserData(node).execSql, el;
				while ((el = execSql.shift()) != null) {
					var errorHandler = (noTransaction || el.noTransaction) ? getErrorExecuteHandler(el.node) : null;
					// errorHandler == null -> si error ejecuta errorTransactionHandler
					tx.executeSql(el.stat, el.args, getSuccessHandler(el.node), errorHandler);
	//				pendingChild(node, +1);
				}
	//			pendingChild(node, 0); //test pending y rellenar nodo
			}
		}
		
		function getErrorTransactionHandler(node) {
			return function(e) {
				addError(node, e);
				if (getUserData(node).nErrors === 0) getUserData(node).nErrors = 1;
	/*			var execSql = getUserData(node).execSql, el;
				while ((el = execSql.shift()) != null) { 
					if (!el.node.hasChildNodes()) node.removeChild(el.node); 
				} 
				getUserData(node).execSql = null;
	*/			pendingChild(node, -1); 
			}
		}

		function getSuccessTransactionHandler(node) {
			return function() {
				pendingChild(node, -1); 
			}
		}
		
		function getSuccessHandler(node) {
			return function(tx, r) {
				setAttribute(node, "ra", r.rowsAffected);
				if (r.rows.length > 0) {
					var columns = [];
					var columnNode = docOut.createElement("columns");
					var row = r.rows.item(0);
					for (var col in row) {
						var cNode = docOut.createElement("c");
						setTextContent(cNode, col);
						columnNode.appendChild(cNode);
						columns.push(col);	
					}
					node.appendChild(columnNode);

					for (var i=0; i<r.rows.length; i++) {
						var rowNode = docOut.createElement("row");
						var row = r.rows.item(i);
						columns.forEach(function(col) {
							var vNode = docOut.createElement("v");
							if (row[col] == null) setAttribute(vNode, "NULL", "");
							else setTextContent(vNode, row[col]);
							rowNode.appendChild(vNode);	
						});
						node.appendChild(rowNode);
					}
				}
	//			pendingChild(node.parentNode, -1);	
			}
		}
		
		function getErrorExecuteHandler(node) {
			return function(tx,e) {
				addError(node, e);
				getUserData(node.parentNode).nErrors++;
	//			pendingChild(node.parentNode, -1);	
				return false; // false: ejecuta siguiente statement y suucessTransactionHandler
			}
		}
		
		function addError(node, e) {
			var errorNode = docOut.createElement("error");
			setAttribute(errorNode, "code", e.code);
			setTextContent(errorNode, e.message);
			node.appendChild(errorNode);
		}
		
		
		var allowedTagsByTag = {
			'gtpv' : ['sesion', 'db', 'init', 'comunicacion'],
			'db' : ['statement', 'exec'],
			'exec' : ['a'],
		};
		
		function processChilds(nodeIn, nodeOut, allowedTags) {
			if (allowedTags == null) allowedTags = allowedTagsByTag[nodeIn.tagName];
			for (var child = nodeIn.firstElementChild; child != null; child = child.nextElementSibling) {
				if (allowedTags.indexOf(child.tagName) != -1) {
					switch (child.tagName) {
						case 'db' : processElemDb(child, nodeOut); break;
						case 'sesion' : processElemSesion(child, nodeOut); break;
						case 'statement' : processElemStatement(child, nodeOut); break;
						case 'exec' : processElemExec(child, nodeOut); break;
						case 'a' : processElemA(child, nodeOut); break;
						case 'init' : processElemInit(child, nodeOut); break;
						case 'comunicacion' : processElemComunicacion(child, nodeOut); break;
					}
				}
			}
		}
		
		function processElemDb(nodeIn, nodeOutParent) {
			var nodeOut = docOut.createElement("db");
			nodeOutParent.appendChild(nodeOut);
			getUserData(docOut.documentElement).sendRespServer = true;
	//		getUserData(docOut.documentElement).reloadDB = (getAttribute(nodeIn, "reload") != null);
			if (getAttribute(nodeIn, "reload") != null) H.DB.reloadDB();
			copyAttribute("id", nodeIn, nodeOut);
	/*		switch(getAttribute(nodeIn, "tipo")) {
				case "principal" : name = H.DB.getPrincipalName(); break;
				case "upload" : name = H.DB.getUploadName(); break;*********???????
				default :
					name = getAttribute(nodeIn, "name"); 
					if (name == null) name = H.DB.getPrincipalName();
			}
			copyAttribute("tipo", nodeIn, nodeOut);
	*/
			var name = getAttribute(nodeIn, "name");
			if (name == null) { name = H.DB.getPrincipalName(); }
			setAttribute(nodeOut, "name", name);
			var db = H.DB.open(name);     // TODO : error db, changeVersion
			var ud = getUserData(nodeOut);
			ud.db = db;
			ud.statements = {};
			ud.execSql = [];
			ud.nErrors = 0;
			ud.noTransaction = (getAttribute(nodeIn, "noTransaction") != null); 
			ud.db.transaction(getTransactionHandler(nodeOut), 
				getErrorTransactionHandler(nodeOut), getSuccessTransactionHandler(nodeOut));
			pendingChild(nodeOutParent, +1);
			processChilds(nodeIn, nodeOut);
		}
		
		function processElemSesion(nodeIn, nodeOutParent) {
	//		alert(docIn);
			nodeOutParent.appendChild(docOut.importNode(nodeIn, true));
		}
		
		function processElemStatement(nodeIn, nodeOutParent) {
			var id = getAttribute(nodeIn, "id");
			var stat = getUserData(nodeOutParent).statements;
			stat[id] = getText(nodeIn);
		}
		
		function processElemExec(nodeIn, nodeOutParent) {
			var nodeOut = docOut.createElement("exec");
			nodeOutParent.appendChild(nodeOut);
			copyAttribute("id", nodeIn, nodeOut);
			getUserData(nodeOut).idStat = getAttribute(nodeIn, "idStat");
			getUserData(nodeOut).args = [];
			getUserData(nodeOut).noTransaction = (getAttribute(nodeIn, "noTransaction") != null);
			processChilds(nodeIn, nodeOut);
			appendExecSql(nodeOut);
		}
		
		function appendExecSql(node) {
			var stat = getUserData(node.parentNode).statements[getUserData(node).idStat];
			if (typeof stat != "string") stat="";
			getUserData(node.parentNode).execSql.push(
				{stat:stat, args: getUserData(node).args, node: node, noTransaction: getUserData(node).noTransaction});
		}
		
		function processElemA(nodeIn, nodeOutParent) {
			var val;
			if (getAttribute(nodeIn, "NULL") != null) val = null;
			else val = getText(nodeIn); 
			getUserData(nodeOutParent).args.push(val);
		}

		function processElemInit(nodeIn, nodeOutParent) {
			var prefijo = getAttribute(nodeIn, "prefijoCliente");
			if (prefijo != null) {
				var prevPref = H.GlobalGTPV.get("prefijoCliente", false); 
				if (prevPref != prefijo) {			
					H.GlobalGTPV.set("prefijoCliente", prefijo, false);
					H.GlobalGTPV.setPrefijo(prefijo);
					var prefijos = H.GlobalGTPV.get("prefijos", false);
					(prefijos = prefijos || []).push(prefijo);
					H.GlobalGTPV.set("prefijos", prefijos, false);
					LS.init(prefijo);	
					H.DB.init(prefijo);
					if (prevPref == null) {
						H.main.startApplication();
					} else {
						// getUserData(docOut.documentElement).reloadDB = true;	
						Caja.init(function() { H.DB.reloadDB(); }); // ???? Canvio prefijo, mejor reinicializar
					}
				}
			}
			var idCom = getAttribute(nodeIn, "idCom");
			if (idCom != null) {
				if (idCom == "") idCom = null;
				H.GlobalGTPV.set("idCom", idCom);
			}
			var llicencia = getAttribute(nodeIn, "Llicencia");
			if (llicencia != null) {
				if (llicencia == "") llicencia = null;
				H.GlobalGTPV.set("Llicencia", llicencia);
			}
		}

		function processElemComunicacion(nodeIn, nodeOutParent) {
			var delay = getAttribute(nodeIn, "delay");
			if (delay != null) {
				delay = parseInt(delay);
				if (!isNaN(delay)) getUserData(docOut.documentElement).delayMinutes = delay;
			}
		}
		
		function processOrdersRespServer() {
	/*		if (getUserData(docOut.documentElement).reloadDB === true) {
				H.DB.reloadDB();
	//			callbackReloadDBCom.run();
			}
	*/		if (H.GlobalGTPV.get("idCom") != null) {
				if (getUserData(docOut.documentElement).sendRespServer === true) {
					insertIdCom(docOut.documentElement);
					send(docOut);
				} else {
					setInCommunication(false);
					var delayMinutes = getUserData(docOut.documentElement).delayMinutes 
					if (delayMinutes != null) {
						if (delayMinutes < 0) delayMinutes = 0; 	
					} else delayMinutes = defaultDelayMinutesComServer;
					my.programCommunication(delayMinutes*60*1000);
	//				timeoutComunicacionID = setTimeout(comunicacionConServidor, delayMinutes*60*1000);
				}
			} else {
				if (H.GlobalGTPV.get("prefijoCliente", false) == null) {
					H.AppInicializarConServidor.start();
				}
			}
		}		
				
		if ((docIn.documentElement == null) || (docIn.documentElement.tagName != 'gtpv')) return false;

		var docOut = createSendDoc();
		processChilds(docIn.documentElement, docOut.documentElement);
		pendingChild(docOut.documentElement, 0); // test pending y realizar orden
		return true;
	}
	
	return my;
}();

/*var callbackReloadDBCom = function() {
	var my = {};
	var callbackFunctions = [];
	my.add = function(f) {
		if (callbackFunctions.indexOf(f) == -1) 
			callbackFunctions.push(f);	
	}
	my.run = function() {
		for (var i=0; i<callbackFunctions.length; i++) {
			callbackFunctions[i]();
		}
	}
	return my;
}();
*/
