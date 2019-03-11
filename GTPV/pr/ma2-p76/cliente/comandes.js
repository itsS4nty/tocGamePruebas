var ComandesH = function() {
	var my = {};
	
	var arrayComandes = [];
	codidep, nomtaula
	ticket=[]
	
	var CodiDepActives = [];
	var DepActives = [] 
	
	var changeHandlers = [];

	function runChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var restored= false;
	function restoreComandes() {
		if (restored) return;
		arraryComandes = [];
		var d = LS.get("Comandes");
		if (d instanceof Array) {
			arrayComandes = d;
		}
		restored = true;
	}
	function save() {
		LS.save("Comandes", arrayComandes);
	}
	
	my.init = function(callbackInit) {
		restoreComandes();
		callbackInit();	
	}

	my.start = function() {
		// verificar integridad
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
		var newSat = {id: idSat, actualize : { All: true }, waitResponse: false};
		newSat.comHandler= getComHandler(newSat);
		satellites.push(newSat);
		CH.createObject("Dependentes", idSat, objSat, objLocal);
		doActualizationSat(newSat);		
	};
	
	function doActualizationSat(sat) {
		if (!sat.waitResponse) {
			if (sat.actualize.All || sat.actualize.Actives) { 
				sat.waitResponse = true;	
				CH.callFunction("Dependentes", idSat, "actualize", 
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
		appendTicket : function(infoSat, nameCom, items, version) {
			items = [ { codiDep, idxT, a/d/m, cant, plu, preu }, ]
					d -> idxT
					m -> idxT, datos
					a -> datos
		},
		newTicket : function(infoSat, name, codiDep, version) {
		}
		
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
		window.Comandes = my;
		
		var comandes = {}; // keys: "D_id", "T_id"
		var comandaActiva = null; // { Dep: }, { Taula: }
		
		var TicketActiu = [];
		var idxConfActiu, idxConfActiu;
		
		var validActiu, confActiu, pendActiu;
		
		var pendConfirmar = [];
		
		var changeHandlers = [];
		
		function runChangeHandlers() {
			var args = arguments;
			changeHandlers.foreach(function(f) { f.apply(null, args); });
		}
	
		my.addChangeHandler = function(changeHandler) {
			changeHandlers.push(changeHandler);
		}
	
		my.setComandaActiva = function(tipo, id) {
			comandaActiva = null;
			var idCom = tipo+"_"+id;		
			var com = comandes[idCom];
			if (com == null) return false;
			comandaActiva = idCom;
			generateTemporal();
			return true;	
		}
		
		function generateTemporal() {
			var validActiu = (comanda[IdComandaActiva] || []);
			var confActiu = (pendConf[IdComandaActiva] || { a: [], m: [] });
			var pendActiu = (pending[IdComandActiva] = (pending[IdComandActiva] || { a: [], m: []}));
			ticketTemporal = [];
			validActiu.forEach
			 	
			
		}
		
		my.toTemporal = function(el, cant, codiArt) {
			if (idx == null) //add
			else {
				if (cant === 0)	// del
				else { // mod
				}
			}
		}
		
		my.delToPending
		my.modTopending
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
		
		my.getTaules = function() {
			
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

