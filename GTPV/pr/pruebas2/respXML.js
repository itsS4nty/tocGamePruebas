function processNode(nodeIn, C) {
	function processAttribute(attr, C0) {
		var value = C0.nodeIn.getAttribute(attr);
		if (value != null) C0[attr] = value;
	}
	while(true) {
		if (nodeIn != null) {
			C.unshift($.extend(false,{},C[0]);
			C[0].nodeIn = nodeIn;
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
				processAttribute("results", C[0]);
				processAttribute("stopOnErrors", C[0]);
				context.state = "execute";
				nodeIn = context.nodeIn.firstChild;
		        if (nodeIn != null) continue;        // procesar primer hijo
			}
		}
		if (context.state == "execute") {
			if (C[0].nodeIn instanceof Element) {
				switch (C[0].nodeIn.tagName) {
					case 'xml' :
					case 'db' :
					case 'statement' :
					case 'exec' :
					case 'a' :
				}
			}
			if (C[0].nodeIn instanceof Text) {
				if (C[1].text != null) C[1].text = C[1].text + C[0].nodeIn.nodeValue;
			}
			context.state = "final";
		}
		if (context.state == "final") {
			nodeIn = context.nodeIn.nextSibiling;  // si nodeIn==null se procesa el padre
			context.shift();
		}
	}
}

function verifyRespXML(dom) {

}

