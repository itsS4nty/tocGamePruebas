var DepActives = function() {
	var my = {}
	var arrayDep = [];
	var depActual = {};
	var funcChange;
//	var noDependenta = {};
	
	function changeDataHandler() {
		var dep;
		for (var i=0; i<arrayDep.length; ) {
			for (var j=0; (dep=Dependentes.getByIdx(j)) != null; j++) {
				if (arrayDep[i].codi == dep.codi) break;				
			}
			if (dep != null) {
				copyDep(dep, arrayDep[i]);
				my.save(arrayDep[i]);
				i++;
			} else {
				if (depActual == arrayDep[i]) depActual = null;
				my.save(arrayDep[i], false);
				arrayDep.slice(i,1);
			}
		}
		if (depActual == null) {
			my.setActual((arrayDep.length > 0) ? arrayDep[0] : {}/*no Dependenta*/);
		} else saveArrayActual();
		
		funcChange();	
	}
	
	my.init = function(_funcChange/*, _noDependenta*/) {
		arrayDep = [];
		funcChange = _funcChange;
//		noDependenta = _noDependenta;
		restore();
		Dependentes.init(changeDataHandler);				
	}
	my.getDatosProceso = function(proceso, dep) {
		dep = dep || depActual;
		dep.proceso = dep.proceso || {};
		return (dep.proceso[proceso] = (dep.proceso[proceso] || {}));
	}
	function restore() {
		var d = LS.get("DepActives");
		if (d == null) {
			arrayDep = [];
//			noDependenta = {};
			depActual = {}; //noDependenta;	
		} else {
			arrayDep = [];
			depActual = null;
			for (var i=0; i<d.array.length; i++) {
				var dep = LS.get("DepActives_"+d.array[i]);
				if (dep != null) {
					arrayDep.push(dep);
					if (d.actual == dep.codi) depActual = dep; 
				}
			}
//			noDependenta = d.noDependenta;
			if (depActual == null) {
				depActual = (arrayDep.length > 0) ? arrayDep[0] : {}; // noDependenta
			}
		}
	}
	my.save = function(dep, add) {
		dep = dep || depActual;
		if (dep.codi == null) return;
		if (add || (add == null)) LS.set("DepActives_"+dep.codi, dep);
		else LS.remove("DepActives_"+dep.codi); 
	}
	function copyDep(depS, depD) {
		for (var p in depS) { if (depS.hasOwnProperty(p)) { depD[p] = depS[p]; } } 
		delete depD.password;
		delete depD.compareNom;
	}
	my.add = function(_dep) { 
		var dep = {};
		copyDep(_dep, dep);
		arrayDep.push(dep);
		my.setActual(dep);
		funcChange("add", dep);
		my.save(dep);
	}
	my.del = function(dep) { 
		dep = dep || depActual;
		for (var i=0; i<arrayDep.length; i++) {
			if (arrayDep[i].codi == dep.codi) {
				arrayDep.splice(i,1);
				break;
			}
		}
		my.save(dep, false);
		if (dep == depActual) {
			my.setActual((arrayDep.length > 0) ? arrayDep[0] : {}/*no Dependenta*/);
		} else saveArrayActual();
		funcChange("del", dep);
	}
	my.setActual = function(dep) {
		depActual = dep;
		saveArrayActual();
		funcChange("setActual", dep);
	}
	my.getActual = function() { return depActual; }
	my.getByIdx = function(idx) { return arrayDep[idx]; } 
	function saveArrayActual() {
		var d = { actual : depActual.codi, array : [] };
		for (var i=0; i<arrayDep.length; i++) {
			d.array.push(arrayDep[i].codi);
		}
		LS.set("DepActives", d);
	}
	return my;
}();

var Dependentes = function() {
	var my = {};
	
	var arrayDep = [];
	var changeHandlers = [];

	function callbackChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var fInit = false;
	my.init = function(changeHandler) {
		if (typeof changeHandler == "function") { changeHandlers.push(changeHandler); }
		if (!fInit) {
			obtenerDB();
			callbackReloadDBCom.add(function() { obtenerDB(); });
			fInit = true;
		}
	}

	my.getByIdx = function(idx) { return arrayDep[idx]; } 
		
	function obtenerDB() {
		var dbP = DB.openPrincipal()
		var statP = "SELECT d.codi as codi, d.nom as nom, p.valor as password, tt.valor as tipusTreballador " 
                   +"FROM dependentes as d "
				   +"INNER JOIN ("
				   +"    SELECT id, valor FROM dependentesextes "
				   +"    WHERE nom = 'PASSWORD'"
				   +") as p "
				   +"ON (d.codi = p.id) "
				   +"INNER JOIN ("
				   +"    SELECT id, valor FROM dependentesextes "
				   +"    WHERE nom = 'TIPUSTREBALLADOR'"
				   +") as tt "
				   +"ON (d.codi = tt.id) ";
		
		dbP.transaction(function (tx) {
			DB.exec(tx, statP, [], function (tx,res) {
				arrayDep = [];
				var fHayResponsable = false;
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i), obj = {}; // props de rows readonly
					for (var prop in row) { if (row.hasOwnProperty(prop)) { obj[prop] = row[prop]; } }
					if (obj.codi == null) continue;
					if (obj.nom == null) obj.nom = "";
					obj.compareNom = preProcessCompareNom(obj.nom);
					if (obj.tipusTreballador == "RESPONSABLE") {
						obj.esResponsable = true;
						fHayResponsable = true;
					} else { obj.esResponsable = false; }			
					arrayDep.push(obj);
				}
				if (!fHayResponsable) { arrayDep.forEach(function(dep) { dep.esResponsable = true; }); }
				callbackChangeHandlers();

/*				if (isDivVisible(divEntrar)) {
					obtenerDependentesNoActives();
					autoCompleteHandler();
				}
*/			});
		});
	}
	
	return my;
}();
