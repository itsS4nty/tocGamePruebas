
function procNodeServ(nodeIn, nodeOut, context) {
	// Verificar Allowed Tag Names
	
	
	switch (nodeIn.tagName) {
		case "db" :
		case "statement" :
		case "exec" :
			var args = [];
			
		case "a" :
		
	}
}

function procRespServ (dom) {
	var docElem = dom.documentElement;
	
	switch (docElem.tagName) {
		case "xml":
			var respDom = document.implementation.createDocument(null,"xml");
			var context = { current : {respDom: respDom } }; // context default
			procNodeServ(docElem, respDom.documentElement, context);
	}
}