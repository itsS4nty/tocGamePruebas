var urlAjaxServidor = "Ajax_XML_1.php";
var defaultDelayMinutesComServer = 60;
var delayMinutesRetries = 5;
var defaultRetriesComServer = 3;
var retriesComServer = defaultRetriesComServer; 
var timeoutComServerID = null;

function escapeXMLCC(str) {
	function callbackReplace(str,p1) {
		var val = p1.charCodeAt(0);
		var hex = "0123456789ABCDEF";
		return "\\x"+hex.charAt((Math.floor(val/16))%16)+hex.charAt(val%16);
	}
	if (str == null) return null;
	return (new String(str)).replace(new RegExp("([\\x00-\\x1F\\\\])", "g"), callbackReplace);
}

function unescapeXMLCC(str) {
	function callbackReplace(str,p1) {
		return String.fromCharCode(parseInt(p1,16));
	}
	if (str == null) return null;
	return (new String(str)).replace(new RegExp("\\\\x([0-9A-Fa-f]{2})", "g"), callbackReplace);
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

function createSendDoc() {
	return document.implementation.createDocument("", "gtpv", null);
}

/*function inicializarConServidor(map) {
	var doc = createSendDoc();
	insertInitNode(doc.documentElement, map);
	sendServer(doc);
}
*/

function timeoutComServerHandler() {
	timeoutComServerID = null;
	comServer();
}

function progComServer(delayMinutes) {
	timeoutComServerID = setTimeout(timeoutComServerHandler, delayMinutes*60*1000);
}

function comServer(initMap) {
	if (timeoutComServerID != null) window.clearTimeout(timeoutComServerID); 
	// if (DB.getComServer() == true) ??
	DB.setComServer(true);
	var doc = createSendDoc();
	if (initMap == null) initMap = getInitIdCom();
	insertInitNode(doc.documentElement, initMap);
	sendServer(doc);
}

function insertIdCom(nodeParent) {
	insertInitNode(nodeParent, getInitIdCom());
}

function getInitIdCom() {
	return ({ idCom: GlobalGTPV.get("idCom") }); 
}

function insertInitNode(nodeParent, map) {
	var init = nodeParent.ownerDocument.createElement("init");
	for (name in map) {
		if (map.hasOwnProperty(name)) setAttribute(init, name, map[name]);	
	}
	nodeParent.insertBefore(init, nodeParent.firstChild);
}
/*
function insertNodeCliente(nodeParent) {
	var node = nodeParent.ownerDocument.createElement("cliente");
	setAttribute(node, "id", localStorage.getItem("ClienteId"));
	setAttribute(node, "password", localStorage.getItem("ClientePassword"));
	setAttribute(node, "producto", localStorage.getItem("ClienteProducto"));
	setAttribute(node, "version", localStorage.getItem("ClienteVersion"));
	nodeParent.insertBefore(node, nodeParent.firstChild); 	
}
*/

function handleAjaxSuccess(data, textStatus, jqXHR) {
	// jQuery no detecta parserError como error, Chrome : html,body,parsererror, Firefox : parserError ??
//	var x = new XMLSerializer();
//	$("#preDebug").text(x.serializeToString(data));
	
	if (!processRecServer(data)) {
//		$("#debug").append(document.importNode(data.documentElement,true));
		var x = new XMLSerializer();
		handleAjaxError.call(this, jqXHR, x.serializeToString(data), "gtpv_error");   
		return;
	} 
	retriesComServer = defaultRetriesComServer;
}

function handleAjaxError(XHR, textStatus, errorThrown) {
	DB.setComServer(false);
	var delayMinutes;
	if (retriesComServer > 0) {
		retriesComServer--;
		delayMinutes = delayMinutesRetries;
	} else {
		retriesComServer = defaultRetriesComServer;
		delayMinutes = defaultDelayMinutesComServer;
	}
	progComServer(delayMinutes);
}

function sendServer(doc) {
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
