function getUserData(node) {
	if (node.myUserData == null) node.myUserData = {};
	return node.myUserData;
}

function getText(node) {
	var text = "";
	for (var child=node.firstChild; child != null; child=child.nextSibling) {
		if (child instanceof Text) text = text + child.textContent;
	}
	return text;
}

function copyAttribute(attrName, nodeIn, nodeOut) {
	var attrValue = nodeIn.getAttribute(attrName);
	if (attrValue != null) nodeOut.setAttribute(attrName, attrValue);	
}

function processRecServer(docIn) {

	function pendingChild(node, inc) {
		if (getUserData(node).pendingChilds == null) getUserData(node).pendingChilds = 0;
		getUserData(node).pendingChilds += inc;
		if (getUserData(node).pendingChilds == 0) {
			if (node.ownerDocument.documentElement == node) processOrdersRespServers(node.ownerDocument);
			else {
				if (node.tagName == 'db') {
					if (getUserData(node).nErrors > 0) node.setAttribute("errors", getUserData(node).nErrors); 	
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
			node.setAttribute("rowsAffected", r.rowsAffected);
			for (var i=0; i<r.rows.length; i++) {
				var rowNode = node.ownerDocument.createElement("row");
				var row = r.rows.item(i);
				for (var field in row) {
					var fieldNode = node.ownerDocument.createElement("f");
					fieldNode.setAttribute("name", field);
					fieldNode.textContent = row[field];
					rowNode.appendChild(fieldNode);	
				}
				node.appendChild(rowNode);
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
		var errorXML = node.ownerDocument.createElement("error");
		errorXML.setAttribute("code", e.code);
		errorXML.textContent = e.message;
		node.appendChild(errorXML);
	}
	
	
	allowedTagsByTag = {
		'xml' : ['sesion','db'],
		'db' : ['statement', 'exec'],
		'exec' : ['a']
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
				}
			}
		}
	}
	
	function processElemDb(nodeIn, nodeOutParent) {
		var nodeOut = nodeOutParent.ownerDocument.createElement("db");
		nodeOutParent.appendChild(nodeOut);
		copyAttribute("id", nodeIn, nodeOut);
		var dbName = nodeIn.getAttribute("dbName");
		if (dbName == null) dbName = defaultDbName;
		var db = openDatabase(dbName,"","",5000);     // TODO : error db, changeVersion
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
		nodeOutParent.appendChild(nodeOutParent.ownerDocument.importNode(nodeIn));
	}
	
	function processElemStatement(nodeIn, nodeOutParent) {
		var id = nodeIn.getAttribute("id");
		var stat = getUserData(nodeOutParent).statements;
		stat[id] = getText(nodeIn);
	}
	
	function processElemExec(nodeIn, nodeOutParent) {
		var nodeOut = nodeOutParent.ownerDocument.createElement("exec");
		nodeOutParent.appendChild(nodeOut);
		copyAttribute("id", nodeIn, nodeOut);
		getUserData(nodeOut).idStat = nodeIn.getAttribute("idStat");
		getUserData(nodeOut).args = [];
		processChilds(nodeIn, nodeOut);
		appendExecSql(nodeOut);
	}
	
	function appendExecSql(node) {
		var stat = getUserData(node.parentNode).statements[getUserData(node).idStat];
		getUserData(node.parentNode).execSql.push({stat:stat, args: getUserData(node).args, node: node});
	}
	
	function processElemA(nodeIn, nodeOutParent) {
		getUserData(nodeOutParent).args.push(getText(nodeIn));
	}

	var docOut;
	var defaultDbName = "localDB";
	
	if ((docIn.documentElement == null) || (docIn.documentElement.tagName != 'xml')) return false;
	docOut = document.implementation.createDocument(null, 'xml');
	processChilds(docIn.documentElement, docOut.documentElement);
	pendingChild(docIn.documentElement, 0); // test pending y realizar orden
	return true;
}

function processOrdersRespServers(dom) {
	// debug ??
	var pre = $("<pre>");
	var x = new XMLSerializer();
	pre[0].textContent = x.serializeToString(dom);
	$("body").append(pre);
}	
	

