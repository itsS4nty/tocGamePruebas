function getUserData(node) {
	if (node.myUserData == null) node.myUserData = {};
	return node.myUserData;
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

function processRecServer(docIn) {

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
		return function(tx) {
			var execSql = getUserData(node).execSql, el;
			while ((el = execSql.shift()) != null) {
				tx.executeSql(el.stat, el.args, getSuccessHandler(el.node), getErrorExecuteHandler(el.node));
				pendingChild(node, +1);
			}
			pendingChild(node, 0); //test pending y rellenar nodo
		}
	}
	
	function getErrorTransactionHandler(node) {
		return function(e) {
			addError(node, e);
			getUserData(node).nErrors++;
			var execSql = getUserData(node).execSql, el;
			while ((el = execSql.shift()) != null) { node.removeChild(el.node); } 
			pendingChild(node, 0); // no pending, rellenar nodo
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
					if (row.hasOwnProperty(col)) {
						var cNode = docOut.createElement("c");
						setTextContent(cNode, col);
						columnNode.appendChild(cNode);
						columns.push(col);	
					}
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
			pendingChild(node.parentNode, -1);	
		}
	}
	
	function getErrorExecuteHandler(node) {
		return function(tx,e) {
			addError(node, e);
			getUserData(node.parentNode).nErrors++;
			pendingChild(node.parentNode, -1);	
		}
	}
	
	function addError(node, e) {
		var errorNode = docOut.createElement("error");
		setAttribute(errorNode, "code", e.code);
		setTextContent(errorNode, e.message);
		node.appendChild(errorNode);
	}
	
	
	allowedTagsByTag = {
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
		getUserData(docOut.documentElement).reloadDB = (getAttribute(nodeIn, "reload") != null);
		copyAttribute("id", nodeIn, nodeOut);
/*		switch(getAttribute(nodeIn, "tipo")) {
			case "principal" : name = DB.getPrincipalName(); break;
			case "upload" : name = DB.getUploadName(); break;*********???????
			default :
				name = getAttribute(nodeIn, "name"); 
				if (name == null) name = DB.getPrincipalName();
		}
		copyAttribute("tipo", nodeIn, nodeOut);
*/
		var name = getAttribute(nodeIn, "name");
		if (name == null) { name = DB.getPrincipalName(); }
		setAttribute(nodeOut, "name", name);
		var db = openDatabase(name,"","",5000);     // TODO : error db, changeVersion
		var ud = getUserData(nodeOut);
		ud.db = db;
		ud.statements = {};
		ud.execSql = [];
		ud.nErrors = 0;
		ud.db.transaction(getTransactionHandler(nodeOut), getErrorTransactionHandler(nodeOut));
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
		processChilds(nodeIn, nodeOut);
		appendExecSql(nodeOut);
	}
	
	function appendExecSql(node) {
		var stat = getUserData(node.parentNode).statements[getUserData(node).idStat];
		if (typeof stat != "string") stat="";
		getUserData(node.parentNode).execSql.push({stat:stat, args: getUserData(node).args, node: node});
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
			var prevPref = GlobalGTPV.get("prefijoCliente", false); 
			if (prevPref != prefijo) {			
				GlobalGTPV.set("prefijoCliente", prefijo, false);
				GlobalGTPV.setPrefijo(prefijo);
				var prefijos = GlobalGTPV.get("prefijos", false);
				(prefijos = prefijos || []).push(prefijo);
				GlobalGTPV.set("prefijos", prefijos, false);
				LS.init(prefijo);	
				DB.init(prefijo);
				if (prevPref == null) {
					initAplication();
				} else {
					getUserData(docOut.documentElement).reloadDB = true;	
				}
			}
		}
		var idCom = getAttribute(nodeIn, "idCom");
		if (idCom != null) {
			if (idCom == "") idCom = null;
			GlobalGTPV.set("idCom", idCom);
		}
		var llicencia = getAttribute(nodeIn, "Llicencia");
		if (llicencia != null) {
			if (llicencia == "") llicencia = null;
			GlobalGTPV.set("Llicencia", llicencia);
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
		if (getUserData(docOut.documentElement).reloadDB === true) {
			DB.reloadDB();
//			callbackReloadDBCom.run();
		}
		if (GlobalGTPV.get("idCom") != null) {
			if (getUserData(docOut.documentElement).sendRespServer === true) {
				insertIdCom(docOut.documentElement);
				sendServer(docOut);
			} else {
				DB.setComServer(false);
				var delayMinutes = getUserData(docOut.documentElement).delayMinutes 
				if (delayMinutes != null) {
					if (delayMinutes < 0) delayMinutes = 0; 	
				} else delayMinutes = defaultDelayMinutesComServer;
				progComServer(delayMinutes);
//				timeoutComunicacionID = setTimeout(comunicacionConServidor, delayMinutes*60*1000);
			}
		} else {
			if (GlobalGTPV.get("prefijoCliente", false) == null) {
				procesoInicializarConServidor.start();
			}
		}
	}	

	if ((docIn.documentElement == null) || (docIn.documentElement.tagName != 'gtpv')) return false;

	var docOut = createSendDoc();
	processChilds(docIn.documentElement, docOut.documentElement);
	pendingChild(docOut.documentElement, 0); // test pending y realizar orden
	return true;
}

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
