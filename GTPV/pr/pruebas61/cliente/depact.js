var DepActives = function() {
	var my = {}
	var codiAct = null;
	var arrayDep = [];
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
		arrayDep.push(dep);
	}
	my.del = function(dep) {
		for (var i=0; i<arrayDep.length; i++) {
			if (arrayDep[i].dep == dep) {
				arrayDep.splice(i,1);
				break;
			}
		}
	}
	my.setActual = function(dep) {
		depActual = dep;
	}
	my.getActual = function() { return depActual; }
	my.getByIdx = function(idx) { return arrayDep[idx]; } 
	
	return my;
}();

