H.Caja = function() {
	var my = {};

	my.clasesMonedas = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200, 500];

/*	var cajaInicial = {
		oberta : false,
		cont : 0,
		numTick : 0,
		canvi : [],
	};
	for (var i=0; i<my.clasesMonedas.length; i++) { cajaInicial.canvi[i] = 0; }
	
	var CajaActual = cajaInicial;
*/
	var lastDBNameCaja = null;
	var ts = -1;
	var infoCaja = {
		version: 0,
		oberta: false,
		numTick: 0
	};
	infoCaja.canvi = my.clasesMonedas.map(function(m) { return 0; });
	var movimientos = {};
	
	function testCaja(dbName, callback) {
		if (dbName == null) {
			callback(false);
			return;
		}
		var db = H.DB.open(dbName);
		db.transaction(function(tx) {
			H.DB.exec(tx, "SELECT caja FROM _g_Caja", [], function(tx,r) {
				if (r.rows.length === 0) callback(false); // ??
				try {
					var cajaDB = JSON.parse(r.rows.item(0).caja);
					if (cajaDB[0].version < infoCaja.version) throw 1;
				} catch(e) {
					callback(false);
					return;
				}
				infoCaja = cajaDB[0];
				movimientos = cajaDB[1];
				
				var tt=movimientos.tickets;
				if (!tt) {
					callback(true);
					return;
				}	

				function fillInfoT(tx, t) {
					var tableName = H.DB.getMensualTableName(t.date, "V_Venut_");
					var stat = "SELECT [Dependenta] as codiDep, [Plu] as codiArt, [Quantitat] as n, [Import] as Imp FROM "
							   +tableName+" WHERE ([Data] = ?) AND ([Num_tick] = ?)";
					H.DB.exec(tx, stat, [t.date, t.numTick], function(tx, r) {
						t.info = { total: 0, rowsT: [] };
						for (var ir=0; ir<r.rows.length; ir++) {
							var row = r.rows.item(ir);
							if (ir === 0) {
								var dep = H.Dependentes.getByCodi(row.codiDep)
								var depNom = ((dep != null) && (dep.nom)) ? dep.nom : "";
								t.info.depNom = depNom;
							}
							var imp = Number(row.imp); // ??
							t.info.rowsT.push({ n: row.n, codi: row.codiArt, imp: imp });
							t.info.total += imp;
						}
					}, function(t, e) { return false; }); // error en select tableName
				}		
				function fillInfoTickets(iT) {
					if (iT === tt.length) {
						movimientos.tickets = [];
						tt.forEach(function(t) { 
							if (t.info != null) movimientos.tickets.push(t); 
						});
						callback(true);
						return;
					}
					var dbName = H.DB.getMensualName(tt[iT].date);
					var db = H.DB.open(dbName);
					db.transaction(function(tx) {
						for (; iT<tt.length; iT++) {
							if (H.DB.getMensualName(tt[iT].date) !== dbName) break;
							fillInfoT(tx, tt[iT]);								
						}
					}, null // transactionErrorCallback
					 , function() { // successTransaction
						fillInfoTickets(iT); // tickets en otra db
					});
				}
				fillInfoTickets(0);
			}, function() { callback(false); });
		}, function(e) { callback(false); })
	}
	function restoreCaja(callback) {
		lastDBNameCaja = null;
		var dbNames = H.ConfigGTPV.get("lastDBNameCaja");
		if (dbNames != null) {
			testCaja(dbNames[0], function(testOk0) {
				testCaja(dbNames[1], function(testOk1) {
					if (testOk0) lastDBNameCaja = dbNames[0];
					else if (testOk1) lastDBNameCaja = dbNames[1];
					else {
						callback();
						return;	
					}
					H.ConfigGTPV.set("lastDBNameCaja", [lastDBNameCaja, null], true, callback);			
				});
			});
		} else callback();
	}
	my.init = function(callback) {
		restoreCaja(callback);
	}
	my.isOpen = function() {
		return getStateWhenModifyDB().oberta;
	}
	my.getComandasCobradas = function() { // solo en inicializacion
		return infoCaja.comandasCobradas;
	}
	// previene escribir simultaneamente la caja en dos db diferentes en el cambio de mes
	// y entrar en la transaccion del mes siguiente antes que el actual por que esta 
	// realizando otra transacción
	var waitFuncs = [];
	function waitSaveCaja(f) {
		if (waitFuncs.push(f) === 1) f();
	}
	my.unWaitSaveCaja = function() {
		waitFuncs.shift();
		if (waitFuncs.length === 0) return;
		window.setTimeout(waitFuncs[0], 0);
	}
	
	my.preSave = function(sqlDate, callback) {
		waitSaveCaja(function() {
			var nextDBNameCaja = H.DB.getMensualName(sqlDate);
			if (lastDBNameCaja != nextDBNameCaja) {
				H.ConfigGTPV.set("lastDBNameCaja", [nextDBNameCaja, lastDBNameCaja], true, function() {
					lastDBNameCaja = nextDBNameCaja;
					callback();
				}); 
			} else callback();
		})
	}
	my.save = function(tx, access, noUnWait) {
		if (typeof access === "function") access(infoCaja, movimientos);
		var movsInCaja = {};
		for (var p in movimientos) {
			if (movimientos[p].length > 100) // limite para no guardar demasiada informacion en DB
				movimientos[p].splice(0, movimientos[p].length-100);
			movsInCaja[p] = movimientos[p].map(function(mov) {
				var movC = {};
				for (var p2 in mov) if (typeof mov[p2] !== "object") movC[p2] = mov[p2];
				return movC;
			});			
		}
		infoCaja.version++;
		H.DB.exec(tx,"CREATE TABLE IF NOT EXISTS [_g_Caja] (caja text)",[]);
		H.DB.exec(tx,"DELETE FROM [_g_Caja] ", []);
		H.DB.exec(tx,"INSERT INTO [_g_Caja] (caja) VALUES (?)",
			[JSON.stringify([infoCaja, movsInCaja])]);
		if (!noUnWait) my.unWaitSaveCaja(); 
	}

	var nextStates = [];
	function getStateWhenModifyDB() {
		if (nextStates.length === 0) return { ts: ts, oberta: infoCaja.oberta };
		else nextStates[0];
	}
	
	function openMovimientosDB(date, movimientoHandler, successHandler) {
		H.Caja.preSave(date, function(infoCaja) {
			H.DB.preOpenMensual(date, "V_Moviments_", function(h) {;
				var db = H.DB.open(h.dbName);
				H.DB.transactionWithErr(db, function (tx) {
					H.DB.sincroCreate(tx, h.tableName,
									"[Botiga] float, [Data] text, [Dependenta] float, "
								   +"[Tipus_moviment] text, [Import] float, [Motiu] text, ");
					movimientoHandler(tx, h);
				}, successHandler
				);
			});
		});
	}	
	function insertMovimientoEnDB(tx, tableName, date, dependenta, tipus, imp, motiu, mark) {
		H.DB.sincroInsert(tx, tableName, "[Botiga], [Data], [Dependenta], [Tipus_moviment], [Import], [Motiu], ",
		                               [H.ConfigGTPV.get("Llicencia"), date, dependenta, tipus, imp, motiu], mark);
	}
	
	my.totalCanvi = function(canvi) {
		var total = 0;
		for (var i=0; i<my.clasesMonedas.length; i++) {
			total += my.clasesMonedas[i]*canvi[i];
		}
		return total;
	}
	
	function getComHandler(obj) {
		return function(ret) {
			if (obj.data.callbackCreateAct) {
				var f = obj.data.callbackCreateAct;
				obj.data.callbackCreateAct = null;
				f();
			}
		}
	}
	
	var sats = [];
	var objs = [];
	
	my.createSat = function(sat, isAdmin, callback) {
		var obj = sat.createObj("Caja", [createObjSat, isAdmin], [createObjHost, isAdmin], null, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true };
		obj.data.comHandler = getComHandler(obj);
		obj.data.isAdmin = isAdmin;
		obj.data.callbackCreateAct = callback;
	};
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	
	function availableCommHandler(objSat) { // doActualizationSat
		var data = objSat.data;
		var infoCajaSat = { oberta: infoCaja.oberta };
		if (data.isAdmin) {
			infoCajaSat.canvi = infoCaja.canvi
		}
		if (data.actualize.All) {
			objSat.call("actualize", [ts, infoCajaSat, movimientos], data.comHandler);
			data.actualize = {};
		}	
		if (data.actualize.infoCaja) {
			objSat.call("infoCaja", [infoCajaSat], data.comHandler);
			data.actualize.infoCaja = false;
		}
		if (data.actualize.movimientos) {
			var movimientosSat = {};
			for (var tipoMov in data.actualize.movimientos) {
				movimientosSat[tipoMov] = []; 
				data.actualize.movimientos[tipoMov].forEach(function(m) {
					movimientosSat[tipoMov].push([(movimientos[tipoMov].indexOf(m) !== -1)?"a":"d", m]);
				});
			}
			objSat.call("movimientos", [movimientosSat], data.comHandler);
			data.actualize.movimientos = null;
		}
	}
	
	function actualizeSat(type) {
		objs.forEach(function(obj) { 
			obj.data.actualize[type] = true; 
			obj.readyComm();
		});
	}
	
	function movimientoToSat(add, tipoMov, mov, noActObj) {
		objs.forEach(function(obj) {
			if (noActObj === obj) return;
			if (!obj.isAdmin) return;
			var allMovs = obj.data.actualize.movimientos = obj.data.actualize.movimientos || {}; 
			var movs = allMovs[tipoMov] = allMovs[tipoMov] || [];
			if (!add) {
				var idx = gIndex(movs, mov);
				if (idx !== -1) {
					movs.splice(idx, 1);
					return;
				} else {
					for (var p in mov) if (typeof mov[p] === "object") delete mov[p]; 
				}
			}
			movs.push(mov);
			obj.readyComm();
		});
	}
	
	function gIndexOf(a, obj) {
		function eq(obj1, obj2) {
			for (p1 in obj1) { 
				if ((typeof obj1[p1] !== "object") && (obj1[pa] != obj2[pa])) 
					return false;
			}		
			return true;
		}
		for (var i=0; i<a.length; i++) {
			if (eq(a[i], obj)) return i;
		}
		return -1;
	}
	
	function insertMovimientoEnCaja(objSat, tipoMov, mov, movimientos) {
		movimientos[tipoMov] = movimientos[tipoMov] || [];
		movimientos[tipoMov].push(mov);
		movimientoToSat(true, tipoMov, mov, objSat);
	}

	function deleteMovimientoEnCaja(objSat, tipoMov, mov, movimientos) {
		movimientos[tipoMov] = movimientos[tipoMov] || [];
		var idx = gIndexOf(movimientos[tipoMov], mov);
		if (idx === -1) return;
		var remMov = movimientos[tipoMov].splice(idx,1);
		movimientoToSat(false, tipoMov, remMov, objSat);
	}	

	my.insertTicket = function(ticketMov, movimientos) {
		insertMovimientoEnCaja(null, "tickets", ticketMov, movimientos);
	}
	
	function createObjHost(objSat, isAdmin) {
		var objHost = Object.create(null);
		if (isAdmin) {
			$.extend(objHost, {
				insertMovimiento : function(_ts, tipoMov, mov) {
					if (ts !== _ts) return false;
					switch (tipoMov) {
						case "apuntes":
							var state = getStateWhenModifyDB();
							if ((!state.oberta) || (state.ts != _ts)) return false;

							var sqlDate = H.DB.DateToSql(new Date());
							openMovimientosDB(sqlDate, function(tx, h) {
								my.save(tx, function(infoCaja, movimientos) {
									infoCaja.descuadre += mov.imp;
									infoCaja.date = sqlDate;
									insertMovimientoEnDB(tx, h.tableName, sqlDate, mov.codiDep, mov.tipo, mov.imp, mov.motiu, h.mark);
									insertMovimientoEnCaja(objSat, tipoMov, mov, movimientos);
								});
							});
							return true;
						default:
							return false;
					}
				},
				deleteMovimiento : function(_ts, tipoMov, mov) {
					if (ts !== _ts) return false;
					switch (tipoMov) {
						case "tickets":
							var state = getStateWhenModifyDB();
							if ((!state.oberta) || (state.ts != _ts)) return false;

							var date = mov.date;
							var numTick = mov.numTick;
					//		var sqlDate = H.DB.DateToSql(new Date());
							my.preSave(date, function() {
					//			var c = Caja.get();
					//			c.tickets.splice(c.tickets.indexOf(S.ticketSelected),1);
								H.DB.preOpenMensual(date, "V_Venut_", function(hv) {
									H.DB.preOpenMensual(date, "V_Anulats_", function(ha) {
										var db = H.DB.open(hv.dbName);  // hv.dbName == ha.dbName
										H.DB.transactionWithErr(db, function (tx) {
											var stat = "SELECT * FROM "+hv.tableName+" WHERE ([Data] = ?) AND ([Num_tick] = ?)";
											H.DB.exec(tx, stat, [date, numTick], function(tx, r) {
												H.Comandes.createTableVenut(tx, ha.tableName);
												for (var i=0; i<r.rows.length; i++) {
													var t = r.rows.item(i);
													var fieldNames = "", values = [];
													for (var p in t) {
														if (!H.DB.isSincroField(p)) {
															fieldNames+="["+p+"], ";
															values.push(t[p]);	
														}
													}
													H.DB.sincroInsert(tx, ha.tableName, fieldNames, values, ha.mark);
												}
											});
											var stat = "SELECT TOTAL([Import]) as total FROM "+hv.tableName
											          +" WHERE ([Data] = ?) AND ([Num_tick] = ?)";
											H.DB.exec(tx, stat, [date, numTick], function(tx, r) { 
												var total = r.rows.item(0).total;
												my.save(tx, function(infoCaja, movimientos) {
													infoCaja.clients--;
													infoCaja.sumTick = normImport(infoCaja.sumTick-total);
													deleteMovimientoEnCaja(objSat, tipoMov, mov, movimientos)
												});
											});
											H.DB.sincroDelete(tx, hv.tableName, "([Data] = ?) AND ([Num_tick] = ?)", 
															[date, numTick], hv.mark);
										});
									});
								});
							});
							return true;
						default:
							return false;
					}
				},	
				abrir : function(_ts, canvi, codiDep) {
					var state = getStateWhenModifyDB();
					if ((state.oberta) || (state.ts != _ts)) return false;
					nextStates.unshift({ts: Date.now(), oberta: true });

					var sqlDate = H.DB.DateToSql(new Date());
					openMovimientosDB(sqlDate, function(tx, h) {
						my.save(tx, function(infoCaja, movimientos) {
							infoCaja.oberta = true;
							infoCaja.codiDep = codiDep;
							infoCaja.sumTick = 0;
							infoCaja.canvi = canvi;
							infoCaja.descuadre = -my.totalCanvi(canvi);
							infoCaja.clients = 0;
							for (var p in movimientos) {
								delete movimientos[p];
							}
							infoCaja.date = sqlDate;
							for (var i=0; i<my.clasesMonedas.length; i++) {
								var cImp = normImport(canvi[i]*my.clasesMonedas[i]);
								insertMovimientoEnDB(tx, h.tableName, sqlDate, codiDep, "Wi", cImp, 
								                     "En:"+my.clasesMonedas[i], h.mark); 
							}
							ts = nextStates.pop()[ts];
							actualizeSat("All");
						});
					});
					return true;
				},
				cerrar : function(_ts, canvi, codiDep) {
					var state = getStateWhenModifyDB();
					if ((!state.oberta) || (state.ts != _ts)) return false;
					nextStates.unshift({ts: Date.now(), oberta: true });
					
					var sqlDate = H.DB.DateToSql(new Date());
					openMovimientosDB(sqlDate, function(tx, h) {
						my.save(tx, function(infoCaja, movimientos) {
							infoCaja.oberta = false;
							infoCaja.codiDep = codiDep;
							infoCaja.canvi = canvi;
							infoCaja.descuadre += infoCaja.sumTick+my.totalCanvi(canvi);
							infoCaja.date = sqlDate;
							var Z = normImport(infoCaja.sumTick);
							var J = normImport(infoCaja.descuadre);
							var G = infoCaja.clients;
							for (var i=0; i<my.clasesMonedas.length; i++) {
								var cImp = normImport(canvi[i]*my.clasesMonedas[i]);
								insertMovimientoEnDB(tx, h.tableName, sqlDate, codiDep, "W", cImp, 
								                     "En:"+my.clasesMonedas[i], h.mark); 
							}
							insertMovimientoEnDB(tx, h.tableName, sqlDate, codiDep, "Z", Z, null, h.mark);
							insertMovimientoEnDB(tx, h.tableName, sqlDate, codiDep, "J", J, null, h.mark);
							insertMovimientoEnDB(tx, h.tableName, sqlDate, codiDep, "G", G, null, h.mark);
							nextStates.pop();
							actualizeSat("All");
						});
					});	
					return true;
				}
			});
		}
		return objHost;	
	}
	
	// ejecutado en satelite
	var createObjSat = function(host, isAdmin) {
		return createCajaS(host, isAdmin);	
	}
	
	return my;	
}();

H.Scripts.add("CajaS", "L2C", function() {

window.createCajaS = function(host, isAdmin) {
	window.createCajaS = null; // no double initialize
	
	var my = {};
	window.Caja = my;
	
	my.clasesMonedas = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200, 500];

	var ts = null;
	var infoCaja = { oberta: false };
	infoCaja.canvi = my.clasesMonedas.map(function(m) { return 0; });
	var movimientos = {};
	
	var changeHandlers = [];
	
	function runChangeHandlers() {
		window.setTimeout(function() {
			changeHandlers.forEach(function(h) { h(); });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}

	my.isOpen = function() {
		return infoCaja.oberta;
	}
	
	my.checkOpen = function(div) {
		if (my.isOpen()) return true;
		if (div.isVisible()) DivMensajesCaja.appendTo(div, "Caixa\nTancada");
		return false;
	}
	
	if (isAdmin) {
		my.getCanvi = function() {
			return infoCaja.canvi.slice(0);
		}
		my.totalCanvi = function(canvi) {
			var total = 0;
			for (var i=0; i<my.clasesMonedas.length; i++) {
				total += my.clasesMonedas[i]*canvi[i];
			}
			return total;
		}
		my.getTickets = function() {
			return movimientos.tickets || [];
		}
		my.getApuntes = function(tipoAp) {
			var apuntes=[];
			if (movimientos.apuntes != null)
				movimientos.apuntes.forEach(function(ap) {
					if (ap.tipo === tipoAp) apuntes.push(ap);
				});
			return apuntes;
		}
		function deleteMovimiento(tipoMov, mov, callback) {
			if (movimientos[tipoMov] == null) return false;
			var idx = movimientos[tipoMov].indexOf(mov);
			if (idx === -1) return false;
			for (var p in mov) if (typeof mov[p] !== "object") delete mov[p];
			host.call("deleteMovimiento", [ts, tipoMov, mov], callback);
			movimientos[tipoMov].splice(idx,1);
			return true;
		}
		my.deleteTicket = function(t, callback) { 
			return deleteMovimiento("tickets", t, callback); 
		}

		function insertMovimiento(tipoMov, mov, callback) {
			movimientos[tipoMov] = movimientos[tipoMov] || [];
			host.call("insertMovimiento", [ts, tipoMov, mov], callback);
			movimientos[tipoMov].push(mov);
		}
		
		my.generateApunte = function(tipo, imp, motiu, codiDep, callback) {
			var mov = { imp: imp, motiu: motiu, tipo: tipo, codiDep: codiDep };
			insertMovimiento("apuntes", mov, callback);
		}
		
		my.abrir = function(canvi, codiDep, callback) {
			host.call("abrir", [ts, canvi, codiDep], callback);
		}
		
		my.cerrar = function(canvi, codiDep, callback) {
			infoCaja.oberta = false;
			runChangeHandlers();
			host.call("cerrar", [ts, canvi, codiDep], callback);
		}
	}
	
	my.isAdmin = function() {
		return isAdmin;
	}	
	
	var comFromHost = {
/*			setType: function(_type) {
			type = _type;
		}
*/		actualize: function(_ts, _infoCaja, _movimientos) {
			ts = _ts;
			infoCaja = _infoCaja;
			movimientos = _movimientos;
			runChangeHandlers();
			return true;
		},
		infoCaja : function(_infoCaja) {
			infoCaja = _infoCaja;
			runChangeHandlers();
			return true;
		},
		movimientos : function(_movimientos) {	
			if (_movimientos == null) return false;
			for (var p in _movimientos) {
				movimientos[p] = movimientos[p] || [];
				_movimientos[p].forEach(function(item) {
					function gIndexOf(a, obj) {
						function eq(obj1, obj2) {
							for (p1 in obj1) { 
								if ((typeof obj1[p1] !== "object") && (obj1[pa] != obj2[pa])) 
									return false;
							}		
							return true;
						}
						for (var i=0; i<a.length; i++) {
							if (eq(a[i], obj)) return i;
						}
						return -1;
					}
					var idx = gIndexOf(movimientos[p], item[1]);
					
					switch(item[0]) {
						case "a" :
							if (idx === -1) movimientos[p].push(item[1]);
							break;
						case "d" :
							if (idx !== -1) movimientos[p].splice(idx,1);
							break;
					}
				});	
			}
			runChangeHandlers();
			return true;
		}
	}
	return comFromHost;
}

window.newSubAppCanviCaja = function() {
	var my = {};

	var S = null;
	
	var div0 = $("<div>")._100x100().addClass("g-widget-content");

	var divContCanvi = $("<div>").css({ fontFamily: "monospace" })
	                             .appendTo(div0);
	var divButtons = $("<div>").css({ position: "absolute" }).appendTo(div0);
	var divTeclado = $("<div>").css({position: "absolute", fontFamily: "monospace"})
	                           .appendTo(div0);

	var butModel = gButton().css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		if (e.button !== 0) return;
		var t = $(this).data("data");
		var canvi = S.canvi[S.selected];
		
		if (typeof t == "number") {
			if (S.primeraTecla !== false) canvi = 0;
			if (canvi*10+t < 1000) canvi = canvi*10+t;
			S.primeraTecla = false;
		}
		if (t == "B") {	canvi = 0; }
		S.canvi[S.selected] = canvi;
		redraw();
	});

	var butT=[[7,8,9],[4,5,6],[1,2,3],[" ",0,'B']];
	for (var y=0; y<butT.length; y++) {
		var div2 = $("<div>").appendTo(divTeclado);
		for (var x=0; x<butT[y].length; x++) {
			butModel.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
		}
	}
	
	function canviHandler(e) {
		if (e.button !== 0) return;
		S.selected = $(this).data("idx");
		S.primeraTecla = true;
		redraw();
	}
	var canviModel = $("<div>").css({ whiteSpace: "pre", overflow: "hidden", textAlign: "center" })
	                           .addClass("g-state-default");
								
	var headerCanvi = canviModel.clone(false).appendTo(divContCanvi);							
	
	var canviDivs = [];
	function insertCanviDivs() {
		if (canviDivs.length === Caja.clasesMonedas.length) return;
		canviDivs.forEach(function(c) { c.remove(); })
		canviDivs = [];
		var after = headerCanvi;
		for (var i=0; i<Caja.clasesMonedas.length; i++) {
			canviDivs[i] = canviModel.clone(true).data("idx", i).click(canviHandler).insertAfter(after);
			after = canviDivs[i];
		}
	}
	var lineaCanvi = canviModel.clone(false).appendTo(divContCanvi);
	var totalCanvi = canviModel.clone(false).appendTo(divContCanvi);
	
	my.getDiv = function() { return div0; }
	my.getDivButtons = function() { return divButtons; }
	
	var headerStr = "Peça     Import    Unit"
	var formatStr = "PPPP -> IIIIIIII -- UUU"
	var lineaStr  = "-----------------------"
	var totalStr  = "Total:                 "
	headerCanvi.text(headerStr);
	lineaCanvi.text(lineaStr);
	var posP = formatStr.lastIndexOf("P");
	var posI = formatStr.lastIndexOf("I");
	var posU = formatStr.lastIndexOf("U");
	formatStr = formatStr.replace(/[PIU]/g," ");
	function printInStr(pos, src, dst) {
		for (var i=src.length-1; i>=0; i--, pos--) {
			dst[pos] = src[i];
		}
	}
	function formatCanvi(div, clase, num) {
		var s = formatStr.split("");
		var imp = clase*num;
		imp = formatImport(imp, false); 
		clase = ""+clase;
		num = ""+num;	
		printInStr(posP, clase, s);
		printInStr(posI, imp, s);
		printInStr(posU, num, s);
		div.text(s.join(""));
	}
	my.start = function(_S) {
		S = _S;
		insertCanviDivs();
		redraw();
	}	
	function redraw() {
		div0.showAlone();
		
		// recalculate

		for (var i=0; i<Caja.clasesMonedas.length; i++) {
			formatCanvi(canviDivs[i], Caja.clasesMonedas[i], S.canvi[i]);
			canviDivs[i][(S.selected == i) ? "addClass" : "removeClass"]("g-state-active"); 	
		}
		var total = Caja.totalCanvi(S.canvi);
		var s = totalStr.split("");
		printInStr(posI+2, formatImport(total, true), s);
		totalCanvi.text(s.join(""));
	}
	my.resize = function() {
		divButtons.css({ top: SEPpx+"px", right: SEPpx+"px" });
		divTeclado.css({ right: SEPpx+"px", bottom: SEPpx+"px" });
		var w0 = div0.iWidth(), h0 = div0.iHeight();
		var lT = divTeclado.get(0).offsetLeft, tT = divTeclado.get(0).offsetTop;
		divButtons.css({ left: lT+"px", height: (tT-SEPpx)+"px" });
		divContCanvi.absolutePosPx(SEPpx, SEPpx, lT-SEPpx, h0-SEPpx);
		var hContC = divContCanvi.iHeight();
		var hC = Math.floor(hContC/(divContCanvi.children().length));
		var testCanvi = canviModel.clone(false).text("X").appendTo(divContCanvi);
		var fs = 4;
		do {
			testCanvi.css({ fontSize : (++fs)+"px" });
		} while (testCanvi.oHeight() <= hC);
		fs--;
		
		testCanvi.remove();
		divContCanvi.css({ fontSize: fs+"px" });		
	}

	return my;
};

window.DivMensajesCaja = function() {
	var my = {};
	
	var init = false;
	var div0 = $("<div>")._100x100().addClass("g-widget-content");
	var div1 = $("<div>").css({ position: "absolute", width: "100%", fontSize: "400%", textAlign: "center", whiteSpace: "pre" })
	                     .appendTo(div0);
	my.appendTo = function(divP, mensaje) {
		if (!init) {
			Resize.add(function() { resize(); });
			init = true;	
		}
		div1.text(mensaje);
		div0.appendTo(divP);
		div0.showAlone();
		resize();
	}
	function resize() {
		if (!div0.isVisible()) return;
		div1.css({ top: ((div0.height()-div1.height())/2)+"px" });
	}
	
	return my;	
}();

}); // add Scripts CajaS

H.ConceptosEntrega = function() {
	var my = {};

	var conceptosEntrega = { O: [], A: [] };

	var callbackInit;
	function runCallbackInit() {
		if (callbackInit != null) {
			callbackInit();
			callbackInit = null;
		}
	}
	
	my.init = function(_callbackInit) {
		callbackInit = _callbackInit;
		H.DB.addReloadDBHandler(function() { obtenerDB(); });
		obtenerDB();
	};

	function getComHandler(obj) {
		return function(ret) {
			if (obj.data.callbackCreateAct) {
				var f = obj.data.callbackCreateAct;
				obj.data.callbackCreateAct = null;
				f();
			}
		}
	}
	
	var sats = [];
	var objs = [];
	
	my.createSat = function(sat, isAdmin, callback) {
		var obj = sat.createObj("ConceptosEntrega", [createObjSat, isAdmin], [createObjHost, isAdmin], null, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true };
		obj.data.comHandler = getComHandler(obj);
		obj.data.isAdmin = isAdmin;
		obj.data.callbackCreateAct = callback;
	};
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	
	function availableCommHandler(objSat) { // doActualizationSat
		var data = objSat.data;
		if (data.isAdmin && data.actualize.All) {
			objSat.call("actualize", [conceptosEntrega], data.comHandler);
		}	
		data.actualize.All = false;
	}
	
	function actualizeSat(type) {
		objs.forEach(function(obj) { 
			obj.data.actualize[type] = true; 
			obj.readyComm();	
		});
	}
	
	function obtenerDB() {
		var db = H.DB.openPrincipal();
		db.transaction(function (tx) {
			var stat = "SELECT tipo as tipo, texto as texto FROM ConceptosEntrega";
			H.DB.exec(tx, stat, [], function (tx,res) {
				conceptosEntrega = { O: [], A: [] };
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					if (conceptosEntrega[row.tipo] != null) {
						conceptosEntrega[row.tipo].push(row.texto);	
					}
				}
//				if (divES)) redrawES();
			});
		}, function (e) { conceptosEntrega = { O: [], A: [] }; runCallbackInit(); }, 
		   function() { runCallbackInit(); actualizeSat("All"); });
	}

	function createObjHost(objSat, isAdmin) {
		return $.extend(Object.create(null), {
		});
	}

	// ejecutado en satelite
	var createObjSat = function(host, isAdmin) {
		return createConceptosEntrega(host, isAdmin);	
	}
	
	return my;
}();

H.Scripts.add("CajaS", "L2", function() {

window.createConceptosEntrega = function(host, isAdmin) {
	window.createConceptosEntrega = null; // no double initialize
	
	var my = {};
	window.ConceptosEntrega = my;

	var conceptosEntrega = { O: [], A: [] };

	var changeHandlers = [];
	
	function runChangeHandlers() {
		window.setTimeout(function() {
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
			return true;
		}
	}	
	
	return comFromHost;
}
	
}); // add Scripts cajaS
	