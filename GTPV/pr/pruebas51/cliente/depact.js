var DepActives = function() {
	var my = {}
	var codiAct = null;
	var datos = [];
	var depActual = {};
	
	my.getDatosProceso = function(proceso, dep) {
		dep = dep || depActual;
		dep.proceso = dep.proceso || {};
		return (dep.proceso[proceso] = (dep.proceso[proceso] || {}));
	}
	my.restore = function() {
	}
	my.save = function() {
	}
	my.add = function(dep) {
		datos.push(dep);
	}
	my.del = function(dep) {
		for (var i=0; i<datos.length; i++) {
			if (datos[i].dep == dep) {
				datos.splice(i,1);
				break;
			}
		}
	}
	my.setActual = function(dep) {
		depActual = dep;
	}
	my.getActual = function() { return depActual; }
	my.getByIdx = function(idx) { return datos[idx]; } 
	
	return my;
}();

