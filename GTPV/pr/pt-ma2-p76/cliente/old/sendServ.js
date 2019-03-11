H.SendServer = function() {
	var my = {};
	
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

	my.createSendDoc = function() {
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
		my.run();
	}

	my.programCommunication = function(delayMinutes) {
		timeoutComServerID = setTimeout(timeoutComServerHandler, delayMinutes*60*1000);
	}

	my.run = function comServer(initData) {
		if (timeoutComServerID != null) window.clearTimeout(timeoutComServerID); 
		// if (H.DB.getComServer() == true) ??
		H.DB.setComServer(true);
		var doc = my.createSendDoc();
		if (initData == null) initData = getInitIdCom();
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
		
		if (!H.RecServer.process(data)) {
	//		$("#debug").append(document.importNode(data.documentElement,true));
			var x = new XMLSerializer();
			handleAjaxError.call(this, jqXHR, x.serializeToString(data), "gtpv_error");   
			return;
		} 
		retriesComServer = defaultRetriesComServer;
	}

	function handleAjaxError(XHR, textStatus, errorThrown) {
		H.DB.setComServer(false);
		var delayMinutes;
		if (retriesComServer > 0) {
			retriesComServer--;
			delayMinutes = delayMinutesRetries;
		} else {
			retriesComServer = defaultRetriesComServer;
			delayMinutes = defaultDelayMinutesComServer;
		}
		SendServer.programCommunication(delayMinutes);
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
	
	return my;

}();

H.ConstantGTPV = { producto: "TPV", version: "0.1" };

H.AppInicializarConServidor = function() {
	var my = {};
	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100);
	var divE = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divE2 = div100x100().css({ position: "relative", height: "100%" }).appendTo(divE);
	var divIP = $("<div>").css({ textAlign: "center" }).appendTo(divE2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP);
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divE2);
	var divC = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	divC.text("Conectando..."); 
	
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		Resize.add(function() { resized = {}; resizeDiv0(); }); 
	}
	my.start = function() {
		divShow(div0);
		divShow(divE);
		input.val("").focus(function() { keyboard.setInput(input); });
		password.val("").focus(function() { keyboard.setInput(password); });
		keyboard.reset();
		keyboard.setInput(input);
		keyboard.setCallback(callbackKeyboard); 
		resizeDiv0();
	};

	var resized = {};
	
	function resizeDiv0() {
		if (resized.div0) return; 
		if (!isDivVisible(div0)) return;
		var w0 = divE2.width(), h0 = divE2.height();
		var h2 = divIP.height(), w2 = divIP.width(); 
		positionKeyboard(keyboard, 0, h2, w2, h0);
		resized.div0 = true;
	}
	function callbackKeyboard(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			if (keyboard.getInput() === input) {
				password.val("");
				keyboard.reset();
				keyboard.setInput(password);
			} else {
				divShow(divC);
				var initData = {user: input.val(), password: password.val(), 
								producto: H.ConstantGTPV.producto, version: H.ConstantGTPV.version};
				Server.programCommunication(0, initData);
			}
		}
	}
	return my;
}();
