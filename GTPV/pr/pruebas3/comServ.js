function processNodeRecServer(nodeIn, C) {
	function getAttributeIfExist(attr) {
		var value = C[0].nodeIn.getAttribute(attr);
		if (value != null) C[0][attr] = value;
	}
	function transactionHandle(tx) {
		tx.executeSql(C[0].statements[C[0].nodeIn.getAttribute("idStat")], C[0].args, sqlResultHandle, sqlErrorHandle);	
//		tx.executeSql("select * from t1 where id =?",["4"],function(tx,r) { alert("w: "+r.rowsAffected); });
	}
	function errorTransactionHandle(e) {
		generateError(e);
		C[0].state = "final";
		processNodeRecServer(null, C);
	}
	function sqlResultHandle(tx, r) {
		if (C[0].sendResults != "0") {
			C[0].nodeOut.setAttribute("rowsAffected", r.rowsAffected);
			for (var i=0; i<r.rows.length; i++) {
				var rowXML = C[0].dom.createElement("row");
				var row = r.rows.item(i);
				for (var field in row) {
					var fieldXML = C[0].dom.createElement("f");
					fieldXML.setAttribute("name", field);
					fieldXML.textContent = row[field];
					rowXML.appendChild(fieldXML);	
				}
				C[0].nodeOut.appendChild(rowXML);
			}
//			C[1].nodeOut.appendChild(C[0].nodeOut);
		} else {
			C[1].nodeOut.removeChild(C[0].nodeOut);	
		}
		C[1].results++;
		C[0].state = "final";
		processNodeRecServer(null, C);
	}
	function sqlErrorHandle(tx, e) {
		generateError(e);
		C[0].state = "final";
		processNodeRecServer(null, C);
	}
	function generateError(e) {
		var errorXML = C[0].dom.createElement("error");
		errorXML.setAttribute("code", e.code);
		errorXML.textContent = e.message;
		C[0].nodeOut.appendChild(errorXML);
		C[0].nodeOut.setAttribute("errors", 1);
//		C[1].nodeOut.appendChild(C[0].nodeOut);
		C[1].errors++;
	}
	
	while(true) {
		if (nodeIn != null) {
			C.unshift($.extend(false,{},C[0]));
			C[0].nodeIn = nodeIn; nodeIn = null;
			C[0].nodeOut = null;
			if (C[0].nodeIn instanceof Element) {
				var tagName = C[0].nodeIn.tagName;
				if (C[1].allowedTags.indexOf(tagName) == -1) C[0].state = "final";
				else {
					switch (tagName) {
						case 'xml' :
							C[0].dom = document.implementation.createDocument(null, 'xml');
							C[0].nodeOut = C[0].dom.documentElement;
							break;
						case 'sesion' :
							C[0].nodeOut = C[0].dom.importNode(C[0].nodeIn, true);
							break;	
						case 'db' :
						case 'exec' :
							C[0].nodeOut = C[0].dom.createElement(tagName);
							C[1].nodeOut.appendChild(C[0].nodeOut);
							break;
					}
					if (tagName != 'sesion') { // preprocess y childs
 						if (['db', 'exec'].indexOf(tagName) != -1) {
							var id = C[0].nodeIn.getAttribute("id");
							if (id != null) C[0].nodeOut.setAttribute("id", id);	
							C[0].results = C[0].errors = 0;
						}
						if (tagName == 'db') {
							var dbName = C[0].nodeIn.getAttribute("dbName");
							if (dbName != null) {
								C[0].db = null;
								C[0].dbName = dbName;
							}
							if (C[0].db == null) {
								C[0].db = openDatabase(C[0].dbName, "", "", 5000);	
//C[0].db.transaction(function (tx) {tx.executeSql("select * from t1 where id =?",["4"],function(tx,r) { alert("x :"+r.rowsAffected); });});
								if (C[0].db == null) {
									generateNodeError({code : 0, message :"error openDatabase"});	
								}
							}
						}
						getAttributeIfExist("sendResults");
						getAttributeIfExist("stopOnErrors");
						var transaction = C[0].nodeIn.getAttribute(attr);
						if (transaction != null) {
							if (transaction != "0") C[0].transaction = "1";
						}
						if (tagName == 'exec') C[0].args = [];
						if (tagName == 'a') C[0].text = "";
						nodeIn = C[0].nodeIn.firstChild;
						switch (tagName) {
							case 'xml' : C[0].allowedTags = ['sesion', 'db']; break;
							case 'db' : C[0].allowedTags = ['db', 'exec', 'statement']; break;
							case 'exec' : C[0].allowedTags = ['statement' ,'a']; break;
							default : C[0].allowedTags = []; break;	
						}
					} 
					C[0].state = "execute";
					if (nodeIn != null) continue;        // procesar primer hijo
				}
			} else {
				if (C[0].nodeIn instanceof Text) C[0].state = "execute";
				else C[0].state = "final";
			}
		}
		if (C[0].state == "execute") {
			if (C[0].nodeIn instanceof Element) {
				switch (C[0].nodeIn.tagName) {
					case 'xml' :
						// generarRespuestaXML
						sendRespServer(C[0].dom);
						return;
					case 'sesion' :
						C[1].nodeOut.appendChild(C[0].nodeOut);
						break;	
					case 'db' :
						C[0].nodeOut.setAttribute("results", C[0].results);
						if (C[0].errors > 0) C[0].nodeOut.setAttribute("errors", C[0].errors);
						C[1].results+=C[0].results;
						C[1].errors+=C[0].errors;
						break;
					case 'statement' :
						C[0].statements[C[0].nodeIn.getAttribute("id")] = C[0].text;
						break;
					case 'exec' :
						if (!((C[0].stopOnErrors != "0") && (C[1].errors > 0))) {
							if (C[0].db != null) { // error openDataBase y no stopOnErrors
								C[0].db.transaction(transactionHandle, errorTransactionHandle);
								// if (C[1].transaction )
								return;
							}
						}
						break;
					case 'a' : 
						C[0].args.push(C[0].text);
						break;
						
				}
			}
			if (C[0].nodeIn instanceof Text) {
				if (C[1].text == null) C[1].text="";
				C[1].text = C[1].text + C[0].nodeIn.textContent;
			}
			C[0].state = "final";
		}
		if (C[0].state == "final") {
			nodeIn = C[0].nodeIn.nextSibling;  // si nodeIn==null se procesa el padre
			C.shift();
		}
	}
}


function processRecServer(dom) {
	if (dom.documentElement == null) return false;
	if (dom.documentElement.tagName != 'xml') return false;
	var C = {
		results : 0,
		errors : 0,
		statements : {},
		dbName : "localDB",	// añadir prefijo idCliente ?? 
		stopOnErrors : "0",
		sendResults : "1",
		transaction : "0",
		allowedTags : ['xml']	
	}
	processNodeRecServer(dom.documentElement, [C]);
	return true;
}

function sendRespServer(dom) {
	// debug ??
	var pre = $("<pre>");
	var x = new XMLSerializer();
	pre[0].textContent = x.serializeToString(dom);
	$("body").append(pre);
}
