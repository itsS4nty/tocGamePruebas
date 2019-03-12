function processNode(nodeIn, C) {
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
		processNode(null, C);
	}
	function sqlResultHandle(tx, r) {
		if (C[0].sendResults != 0) {
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
			C[1].nodeOut.appendChild(C[0].nodeOut);
		}
		C[1].results++;
		C[0].state = "final";
		processNode(null, C);
	}
	function sqlErrorHandle(tx, e) {
		generateError(e);
		C[0].state = "final";
		processNode(null, C);
	}
	function generateError(e) {
		var errorXML = C[0].dom.createElement("error");
		errorXML.setAttribute("code", e.code);
		errorXML.textContent = e.message;
		C[0].nodeOut.appendChild(errorXML);
		C[0].nodeOut.setAttribute("errors", 1);
		C[1].nodeOut.appendChild(C[0].nodeOut);
		C[1].errors++;
	}
	
	while(true) {
		if (nodeIn != null) {
			C.unshift($.extend(false,{},C[0]));
			C[0].nodeIn = nodeIn;
			C[0].nodeOut = null;
			if (C[0].nodeIn instanceof Element) {
				var tagName = C[0].nodeIn.tagName;
				switch (tagName) {
					case 'xml' :
						C[0].dom = document.implementation.createDocument(null, 'xml');
						C[0].nodeOut = C[0].dom.documentElement;
						break;
					case 'db' :
					case 'exec' :
						C[0].nodeOut = C[0].dom.createElement(tagName);
						break;
				}
				if (C[0].nodeOut != null) {
					var id = C[0].nodeIn.getAttribute("id");
					if (id != null) C[0].nodeOut.setAttribute("id", id);	
				}
//				if (C[0].statements == undefined) C[0].statements = {};
				C[0].results = C[0].errors = 0;
				if (tagName == "db") {
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
				if (tagName == 'exec') C[0].args = [];
				if (tagName == 'a') C[0].text = "";
				C[0].state = "execute";
				nodeIn = C[0].nodeIn.firstChild;
		        if (nodeIn != null) continue;        // procesar primer hijo
			}
		}
		if (C[0].state == "execute") {
			if (C[0].nodeIn instanceof Element) {
				switch (C[0].nodeIn.tagName) {
					case 'xml' :
						// generarRespuestaXML
						sendResponseServer(C[0].dom);
						return;
					case 'db' :
						C[0].nodeOut.setAttribute("results", C[0].results);
						if (C[0].errors > 0) C[0].nodeOut.setAttribute("errors", C[0].errors);
						C[1].nodeOut.appendChild(C[0].nodeOut);
						C[1].results+=C[0].results;
						C[1].errors+=C[0].errors;
						break;
					case 'statement' :
						C[0].statements[C[0].nodeIn.getAttribute("id")] = C[0].text;
						break;
					case 'exec' :
						if (!((C[0].stopOnErrors != 0) && (C[1].errors > 0))) {
							if (C[0].db != null) { // error openDataBase y no stopOnErrors
								C[0].db.transaction(transactionHandle, errorTransactionHandle);
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

function verifyRespXML(dom) {

}

function processRequestServer(dom) {
	verifyRespXML(dom); // si error: generar Error, gestionar reintentos, enviar respuesta
	var C = {
		results : 0,
		errors : 0,
		statements : {},
		dbName : "localDB",	// añadir prefijo idCliente ?? 
		stopOnErrors : "0",
		sendResults : "1"	
	}
	processNode(dom.documentElement, [C]);
}

function sendResponseServer(dom) {
	// debug ??
	var pre = $("<pre>");
	var x = new XMLSerializer();
	pre[0].textContent = x.serializeToString(dom);
	$("body").append(pre);
}
