var TaulesActives = function() {
	var my = {}
	var arrayTaules= [];
	var taulaActual = {};
	var funcChange;
//	var noDependenta = {};
	
	function changeDataHandler() {
		var taula;
		var fChange = false;
		for (var i=0; i<arrayTaules.length; ) {
			for (var j=0; (taula=Taules.getByIdx(j)) != null; j++) {
				if (arrayTaules[i].codi == taula.codi) break;				
			}
			if (dep != null) {
				copyTaula(taula, arrayTaules[i]);
				my.save(arrayTaules[i]);
				i++;
			} else {
				if (taulaActual == arrayTaules[i]) taulaActual = null;
				my.save(arrayTaules[i], false);
				arrayTaules.splice(i,1);
				fChange = true;
			}
		}
		if (taulaActual == null) {
			my.setActual((arrayTaules.length > 0) ? arrayTaules[0] : {}/*no taula*/);
		} else saveArrayActual();
		if (fChange) funcChange();	
	}
	
	my.init = function(_funcChange, callbackInit) {
		arrayTaules = [];
		funcChange = _funcChange;
		restore();
		Taules.init(changeDataHandler, callbackInit);				
	}
	my.getDatosProceso = function(proceso, taula) {
		taula = taula || taulaActual;
		taula.proceso = taula.proceso || {};
		return (taula.proceso[proceso] = (taula.proceso[proceso] || {}));
	}
	function restore() {
		var d = LS.get("TaulesActives");
		if (d == null) {
			arrayTaules = [];
//			noDependenta = {};
			taulaActual = {}; //noDependenta;	
		} else {
			arrayTaules = [];
			taulaActual = null;
			for (var i=0; i<d.array.length; i++) {
				var dep = LS.get("TaulesActives_"+d.array[i]);
				if (dep != null) {
					arrayTaules.push(taula);
					if (d.actual == taula.codi) taulaActual = taula; 
				}
			}
//			noDependenta = d.noDependenta;
			if (taulaActual == null) {
				taulaActual = (arrayTaules.length > 0) ? arrayTaules[0] : {}; // noDependenta
			}
		}
	}
	my.save = function(taula, add) {
		taula = taula || taulaActual;
		if (taula.codi == null) return;
		LS.save("TaulesActives_"+taula.codi, (add || (add == null)) ? dep : undefined);
	}
	function copyTaula(taulaS, taulaD) {
		for (var p in taulaS) { if (taulaS.hasOwnProperty(p)) { taulaD[p] = taulaS[p]; } } 
		//delete depD.password;
		delete taulaD.compareNom;
	}
	my.add = function(_taula) { 
		var taula = {};
		copyTaula(_taula, taula);
		arrayTaules.push(taula);
		my.setActual(taula);
		funcChange("add", taula);
		my.save(taula);
	}
	my.del = function(taula) { 
		taula = taula || taulaActual;
		for (var i=0; i<arrayTaules.length; i++) {
			if (arrayTaules[i].codi == taula.codi) {
				arrayTaules.splice(i,1);
				break;
			}
		}
		my.save(taula, false);
		if (taula== taulaActual) {
			my.setActual((arrayTaules.length > 0) ? arrayTaules[0] : {}/*no Dependenta*/);
		} else saveArrayActual();
		funcChange("del", taula);
	}
	my.setActual = function(taula) {
		taulaActual = taula;
		saveArrayActual();
		funcChange("setActual", taula);
	}
	my.getActual = function() { return taulaActual; }
	my.getByIdx = function(idx) { return arrayTaules[idx]; } 
	function saveArrayActual() {
		var d = { actual : taulaActual.codi, array : [] };
		for (var i=0; i<arrayTaules.length; i++) {
			d.array.push(arrayTaules[i].codi);
		}
		LS.save("TaulesActives", d);
	}
	return my;
}();

var Taules = function() {
	var my = {};
	
	var arrayTaules = [];
	var changeHandlers = [];

	function getSortFunction(propName) {
		return function(a,b) { a=a[propName]; b=b[propName]; return ((a < b) ? -1 : ((a > b)?1:0)); }	
	}

	function callbackChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var fInitializing = false;
	var fInitialized = false;
	var callbacksInitArray = [];
	function runCallbacksInit() {
		if (!fInitialized) {
			fInitialized = true;
			callbacksInitArray.forEach(function(f) { f(); });
			callbacksInitArray = null;
		}
	}
	my.init = function(changeHandler, callbackInit) {
		if (typeof changeHandler == "function") { changeHandlers.push(changeHandler); }
		if (fInitialized) { callbackInit(); return; }
		callbacksInitArray.push(callbackInit);
		if (!fInitializing) {
			fInitializing = true;
			obtenerDB();
			DB.addReloadDBHandler(function() { obtenerDB(); });
		}
	}

	my.getByIdx = function(idx) { return arrayTaules[idx]; } 
		
	function obtenerDB() {
		var db = DB.openPrincipal()
		var stat = "SELECT t.codi as codi, t.nom as nom  " 
                  +"FROM taules as t ";
	
		db.transaction(function (tx) {
			DB.exec(tx, stat, [], function (tx,res) { procesarDatos(res); });
		}, function(e) { procesarDatos({ rows:[] }); } );

		function procesarDatos(res) {
			arrayTaules = [];
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
				arrayTaules.push(obj);
			}
			if (!fHayResponsable) { arrayTaules.forEach(function(dep) { dep.esResponsable = true; }); }
			arrayTaules = arrayTaules.sort(getSortFunction("compareNom"));
			callbackChangeHandlers();
			runCallbacksInit();
		}
	}
	
	return my;
}();
