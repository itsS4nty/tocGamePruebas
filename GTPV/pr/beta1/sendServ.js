var urlAjaxServidor = "queHago3.php";

function insertNodeCliente(nodeParent) {
	var node = nodeParent.ownerDocument.createElement("cliente");
	node.setAttribute("id", localStorage.getItem("ClienteId"));
	node.setAttribute("password", localStorage.getItem("ClientePassword"));
	node.setAttribute("producto", localStorage.getItem("ClienteProducto"));
	node.setAttribute("version", localStorage.getItem("ClienteVersion"));
	nodeParent.insertBefore(node, nodeParent.firstChild); 	
}

function handleAjaxSuccess(data, textStatus, jqXHR) {
	// jQuery no detecta parserError como error, Chrome : html,body,parsererror, Firefox : parserError ??
//	var x = new XMLSerializer();
//	$("#preDebug").text(x.serializeToString(data));
	
	if (!processRecServer(data)) {
		$("#debug").append(document.importNode(data.documentElement,true));
		var x = new XMLSerializer();
		handleAjaxError.call(this, jqXHR, x.serializeToString(data));   
		return;
	}
}

function handleAjaxError(XHR, textStatus, errorThrown) {
	window.alert(textStatus);	
}

function sendServer(doc) {
//    if (doc == undefined) doc = document.implementation.createDocument("", "xml", null);
//	insertNodeCliente(doc.documentElement);
	$.ajax({ 
		url: urlAjaxServidor,
		type: "POST",
		processData: false,
		contentType: "text/xml",
		data : doc,
		dataType: "xml",
		success: handleAjaxSuccess,
		error : handleAjaxError
	});
}
