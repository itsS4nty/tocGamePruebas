(function () {

window.createConceptosEntrega = function(host, isAdmin) {
	window.createConceptosEntrega = null; // no double initialize
	
	var my = {};
	window.ConceptosEntrega = my;

	var conceptosEntrega = { O: [], A: [] };

	var changeHandlers = [];
	
	function runChangeHandlers() {
		setTimeout(function() {
			changeHandlers.forEach(function(h) { h(); });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}
	
	my.get = function(tipo) {
		return conceptosEntrega[tipo];
	}

	var comFromHost = {
		actualize: function(_conceptosEntrega) {
			conceptosEntrega = _conceptosEntrega;
			runChangeHandlers();
			return true;
		}
	}	
	
	return comFromHost;
}
	
})(window);
