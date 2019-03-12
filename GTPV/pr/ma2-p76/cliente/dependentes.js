/*var DepActivesH = function() {
	var my = {}
	var arrayDep = [];
	var depActual = {};
	var funcChange;
//	var noDependenta = {};
	
	function changeDependentesHandler() {
		var arrayDepT = [];
		arrayDep.forEach(function(dep) {
			dep = DependentesH.
		});
		
		var dep;
		var fChange = false;
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
				arrayDep.splice(i,1);
				fChange = true;
			}
		}
		if (depActual == null) {
			my.setActual((arrayDep.length > 0) ? arrayDep[0] : {});
		} else saveArrayActual();
		if (fChange) funcChange();	
	}
	
	my.init = function(callbackInit) {
//		arrayDep = [];
//		funcChange = _funcChange;
		restore();
		callbackInit();
		DependentesH.addChangeHandler(changeDependentesHandler);				
	}
	
	function restore() {
		arrayDep = [];
		var d = LS.get("DepActives");
		if (d != null) {
			for (var i=0; i<d.length; i++) {
				var dep = DependentesH.getByCodi(d[i]);
				if (dep != null) arrayDep.push(dep);
			}
			arrayDep.sort(getSortFunction("compareNom"));
		}
	}
	function save() {
		var deps = [];
		arrayDep.forEach(function(dep) { deps.push(dep.codi); });
		LS.save("DepActives", deps);
	}
	my.add = function(dep) { 
//		var dep = {};
//		copyDep(_dep, dep);
		for (var i=0; i<arrarDep.length; i++) { 
			if (arrayDep[i].compareNom > dep.compareNom) break;
		}	
		arrayDep.splice(i,0,dep);
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
			my.setActual((arrayDep.length > 0) ? arrayDep[0] : {});
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
		LS.save("DepActives", d);
	}
	var satellites = [];
	function findSat(idSat) {
		for (var i=0; i<satellites.length; i++) 
			if (satellites[i].id === idSat) return satellites[i];
		return null;	
	}

	function getComHandler(idSat) {
		return function(ret) {
			var sat = findSat(idSat);
			sat.waitResponse = false;
			doActualization(sat);
		}
	}
	
	my.createSat = function(idSat) {
		var sat = findSat(idSat);
		if (sat != null) satellites.splice(satellites.indexOf(sat), 1);
		var newSat = {id: idSat, actualizeAll: true, waitResponse: false, comHandler: getComHandler(idSat) };
		satellites.push(newSat);
		CH.createObject("DepActives", idSat, objSat, objLocal);
		doActualization(newSat);		
	};
	
	function doActualization(sat) {
		if (!sat.waitResponse) {
			if (sat.actualizeAll) { 
				sat.actualizeAll = false;
				sat.waitResponse = true;	
				CH.callFunction("DepActives", idSat, "actualize", [arrayDep], comHandler);
			} 
		}		
	}
	
	function actualizeAll() {
		satellites.forEach(function(sat) {
			sat.actualizeAll = true;
			doActualization(sat);
		});
	}
	
	
	var objLocal = {
		add : function(infoSat, dep) { 
			if (!infoSat.isLocal) {
				for (var i=0; i<arrarDep.length; i++) { 
					if (arrayDep[i].compareNom > dep.compareNom) break;
				}	
				arrayDep.splice(i,0,dep);
			}
			save();
			actualizeAll();
		},
		del : function(infoSat, dep) { 
			if (!infoSat.isLocal) {
				for (var i=0; i<arrayDep.length; i++) {
					if (arrayDep[i].codi == dep.codi) {
						arrayDep.splice(i,1);
						break;
					}
				}
			}	
			save();
			actualizeAll();
		}
	}

	var objSat = function(host) {
		var my = {};
		window.DepActives = my;
		
		var arrayDep;

		var changeHandlers = [];
		
		function runChangeHandlers() {
			changeHandlers.foreach(function(f) { f(); });
		}
	
		my.addChangeHandler = function(changeHandler) {
			changeHandlers.push(changeHandler);
		}
	

		my.add = function(dep) { 
	//		var dep = {};
	//		copyDep(_dep, dep);
			for (var i=0; i<arrarDep.length; i++) { 
				if (arrayDep[i].compareNom > dep.compareNom) break;
			}	
			arrayDep.splice(i,0,dep);
			host.call("add", [dep.codi]);
			funcChange("add", dep);
		}
		my.del = function(dep) { 
			for (var i=0; i<arrayDep.length; i++) {
				if (arrayDep[i].codi == dep.codi) {
					arrayDep.splice(i,1);
					break;
				}
			}
			host.call("del", [dep.codi]);
			funcChange("del", dep);
		}
//		my.getActual = function() { return depActual; }
		my.getByIdx = function(idx) { return arrayDep[idx]; } 
		
		var comSat = {
			actualize: function(_arrayDep) {
				arrayDep = _arrayDep;
				runChangeHandlers();
				return true;
			},
		}
		return comSat;
	}
	
	return my;
}();
*/
var DependentesH = function() {
	var my = {};
	
	var arrayDependentes = [];
	var CodiDepActives = [];
	var DepActives = [] 
	
	var changeHandlers = [];

	function runChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var callbackInit;
	function runCallbackInit() {
		if (callbackInit != null) {
			callbackInit();
			callbackInit = null;
		}
	}
	
	var restored= false;
	function restoreActives() {
		if (restored) return;
		DepActives = [];
		CodiDepActives = [];
		var d = LS.get("CodiDepActives");
		if (d instanceof Array)  {
			for (var i=0; i<d.length; i++) {
				var dep = getByCodi(d[i]);
				if (dep != null) CodiDepActives.push(d[i]);
			}
		}
		restored = true;
	}
	function save() {
		LS.save("CodiDepActives", CodiDepActives);
	}
	
	function createDepActivesFromCodis() {
		DepActives = [];
		CodiDepActives.forEach(function(codi) {
			var dep = getByCodi(codi);
			if (dep != null) DepActives.push(dep);
		});
		DepActives.sort(getSortFunction("compareNom"));
		CodiDepActives = [];
		DepActives.forEach(function(dep) { CodiDepActives.push(dep.codi); });
	}
	

	
	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;	
		DB.addReloadDBHandler(function() { obtenerDB(); });
		obtenerDB();
	}

	my.addChangeHandler = function(changeH) {
		changeHandlers.push(changeHandler);
	}
	
//	my.getByIdx = function(idx) { return arrayDependentes[idx]; }
	 
	function getByCodi(codi) {
		for (var i=0; i<arrayDependentes.length; i++) {
			var dep = arrayDependentes[i];
			if (dep.codi === codi) return dep;
		}
		return null;
	}
	
	function obtenerDB() {
		var db = DB.openPrincipal()
		var stat = "SELECT d.codi as codi, d.nom as nom, p.valor as password, tt.valor as tipusTreballador " 
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
		
		db.transaction(function (tx) {
			DB.exec(tx, stat, [], function (tx,res) { procesarDatos(res); });
		}, function(e) { procesarDatos({ rows:[] }); } );

		function procesarDatos(res) {
			arrayDependentes = [];
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
				arrayDependentes.push(obj);
			}
			if (!fHayResponsable) { arrayDependentes.forEach(function(dep) { dep.esResponsable = true; }); }
			arrayDependentes = arrayDependentes.sort(getSortFunction("compareNom"));
			restoreActives();
			createDepActivesFromCodis();
			actualizeSat();
//			runChangeHandlers();
			runCallbackInit();
		}
	}

	var satellites = [];
	function findSat(idSat) {
		for (var i=0; i<satellites.length; i++) 
			if (satellites[i].id === idSat) return satellites[i];
		return null;	
	}

	function getComHandler(sat) {
		return function(ret) {
			sat.waitResponse = false;
			if (!sat.isLocal) doActualizationSat(sat);
		}
	}
	
	my.createSat = function(idSat) {
		var sat = findSat(idSat);
		if (sat != null) satellites.splice(satellites.indexOf(sat), 1);
		var newSat = {id: idSat, isLocal: CH.isLocal(idSat), actualize : { All: true }, waitResponse: false};
		newSat.comHandler= getComHandler(newSat);
		satellites.push(newSat);
		CH.createObject("Dependentes", idSat, objSat, objLocal);
		doActualizationSat(newSat);		
	};
	
	function doActualizationSat(sat) {
		if (!sat.waitResponse) {
			if (sat.actualize.All || sat.actualize.Actives) { 
				sat.waitResponse = true;	
				CH.callFunction("Dependentes", sat.idSat, "actualize", 
					[sat.actualize.All ? arrayDependentes : null, CodiDepActives], sat.comHandler);
				sat.actualize.All = sat.actualize.Actives = false;
			} 
		}		
	}
	
	function actualizeSat(type) {
		if (type == null) type = "All";
		satellites.forEach(function(sat) {
			sat.actualize[type] = true;
			doActualizationSat(sat);
		});
	}

	var objLocal = {
		addActiva : function(infoSat, codi) { 
			if (!infoSat.isLocal) {
				var dep = getByCodi(codi);
				if (dep != null) {
					for (var i=0; i<DepActives.length; i++) { 
						if (DepActives[i].compareNom > dep.compareNom) break;
					}	
					CodiDepActives.splice(i,0,dep.codi);
					DepActives.splice(i,0,dep);
				}
			}
			save();
			actualizeSat("Actives");
			runChangeHandlers();
			return true;
		},
		delActiva : function(infoSat, codi) { 
			if (!infoSat.isLocal) {
				for (var i=0; i<DepActives.length; i++) {
					if (DepActives[i].codi === codi) {
						CodiDepActives.splice(i,1);
						DepActives.splice(i,1);
						break;
					}
				}
			}	
			save();
			actualizeSat("Actives");
			runChangeHandlers();
			return true;
		}
	}

	var objSat = function(host) {
		var my = {};
		window.Dependentes = my;
		
		var arrayDependentes;
		var DepActives;

		var changeHandlers = [];
		
		function runChangeHandlers() {
			var args = arguments;
			changeHandlers.foreach(function(f) { f.apply(null, args); });
		}
	
		my.addChangeHandler = function(changeHandler) {
			changeHandlers.push(changeHandler);
		}
	
/*		my.getDatosProceso = function(proceso, dep) {
			dep = dep || depActual;
			dep.proceso = dep.proceso || {};
			return (dep.proceso[proceso] = (dep.proceso[proceso] || {}));
		}
*/
		my.addActiva = function(dep) { 
	//		var dep = {};
	//		copyDep(_dep, dep);
			for (var i=0; i<CodiDepActives.length; i++) { 
				var depI = my.getByCodi(CodiDepActives[i]);
				if (depI.compareNom > dep.compareNom) break;
			}	
			CodiDepActives.splice(i,0,dep.codi);
			host.call("addActiva", [dep.codi]);
			runChangeHandlers("addActiva", dep.codi);
		}
		my.delActiva = function(dep) { 
			for (var i=0; i<CodiDepActives.length; i++) {
				if (CodiDepActives[i] === dep.codi) {
					CodiDepActives.splice(i,1);
					break;
				}
			}
			host.call("delActiva", [dep.codi]);
			runChangeHandlers("delActiva", dep.codi);
		}
/*		my.setActual = function(dep) {
			depActual = dep;
			saveArrayActual();
			funcChange("setActual", dep);
		}
*///		my.getActual = function() { return depActual; }
		my.getByIdx = function(idx) { return arrayDependentes[idx]; } 
		my.getActivaByIdx = function(idx) { return DepActives[idx]; } 
		
		my.getByCodi = function(codi) {
			for (var i=0; i<arrayDependentes.length; i++) {
				var dep = arrayDependentes[i];
				if (dep.codi === codi) return dep;
			}
			return null;
		}
		
		var comSat = {
			actualize: function(_arrayDependentes, _CodiDepActives) {
				if (_arrayDependentes != null) arrayDependentes = _arrayDependentes;
				CodiDepActives = _CodiDepActives;
				DepActives = [];
				CodiDepActives.forEach(function(codi) { DepActives.push(my.getByCodi(codi)); });
				runChangeHandlers();
				return true;
			},
		}
		return comSat;
	}
	
	return my;
}();

