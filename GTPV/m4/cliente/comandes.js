H.Comandes = function() {
	var my = {};
	
	var comandes = {}; // dictionary without key __proto__
	
	var restored= false;
	function restoreComandes() {
		if (restored) return;
		comandes = {};
		var d = LS.get("Comandes");
		if ((typeof d === "object") && (d != null)) {
			comandes = d;
		}
		restored = true;
	}
	function save() {
		LS.save("Comandes", comandes);
	}
	
	my.init = function(callbackInit) {
		restoreComandes();
		callbackInit();	
	}

	my.start = function() {
		// verificar integridad
	}

	function getComHandler(obj) {
		return function(ret) {
		}
	}
	
	var sats = [];
	var objs = [];
	
	function actualizeSats(idComanda, noActObj) { 
		objs.forEach(function(obj) {
			if (noActObj === obj) return;
			if (obj.data.actualize.idsComanda.indexOf(idComanda) === -1) {
				obj.data.actualize.idsComanda.push(idComanda);				
				obj.readyComm();
			}	
		});
	}

	my.createSat = function(sat, callback) {
		var obj = sat.createObj("Comandes", createObjSat, createObjHost, callback, availableCommHandler);
		sats.push(sat);
		objs.push(obj);
		obj.data.actualize = { All : true, idsComanda: [] };
		obj.data.comHandler = getComHandler(obj);
		//availableCommHandler(obj);		
	};
	
	my.destroySat = function(sat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			objs.splice(idx, 1)[0].data = null; // referencia ciclica
		}
	}
	// actualize : { All: true, idsComanda:[] }
	function availableCommHandler(objSat) { // doActualizationSat
		var act = objSat.data.actualize;
		if (act.All) {
			act.idsComanda = [];
			for (var id in comandes) {
				act.idsComanda.push(id);	
			}
		}
		// construct qs
		var qs = [];
		act.idsComanda.forEach(function(id) {
			var c = comandes[id];
			if (c != null) {
				var q = c; // ???? copy version modificada
				qs.push(q); 	
			}
		});
		
		if (qs.length > 0) { 	
			objSat.call("actualize", [qs], objSat.data.comHandler);
		}
		act.All = false;
		act.idsComanda = [];
	}
	
	function calcTotalComanda(c) {
		var total=0;
		c.items.forEach(function(item) {
			total+=normImport(item.n*item.preu);
		});
		return total;
	}
	
	my.createTableVenut = function(tx, tableName) {
		H.DB.sincroCreate(tx, tableName,
			 "[Botiga] float, [Data] datetime, "
			+"[Dependenta] float, [Num_tick] float, "
			+"[Estat] nvarchar(25), [Plu] float, "
			+"[Quantitat] float, [Import] float, "
			+"[Tipus_venta] nvarchar(25), [FormaMarcar] nvarchar(255), "
			+"[Otros] nvarchar(255), ");
	}	
	
	function cobrar(c) { 
		var sqlDate = H.DB.DateToSql(new Date());
		var total = calcTotalComanda(c);
		var items = c.items; // no se modifican si esta cerrada pero c puede que sí
		var codiDep = c.codiDep;
		var tPrint = { ts : c.ts, ready : false };
		c.ticketsToPrint.push(tPrint);
		while (c.ticketsToPrint.length > 2) c.ticketsToPrint.shift();
		H.Caja.preSave(sqlDate, function() {
			H.DB.preOpenMensual(sqlDate, "V_Venut_", function(h) {
//				Caja.set(c);
//				var depTemp = dep;
				var db = H.DB.open(h.dbName);
				H.DB.transactionWithErr(db, function (tx) {
					my.createTableVenut(tx, h.tableName);
					H.Caja.save(tx, function (infoCaja, movimientos) {
						infoCaja.numTick++;
						var dep = H.Dependentes.getByCodi(codiDep)
						var depNom = ((dep != null) && (dep.nom)) ? dep.nom : "";
						$.extend(tPrint, { date: sqlDate, numTick: infoCaja.numTick, depNom: depNom, rowsT : [], total: total}); 
						items.forEach(function(t) {
							if (t.n > 0) {
								var imp = normImport(t.n*t.preu);
								H.DB.sincroInsert(tx, h.tableName, 
									 "[Botiga], [Data], [Dependenta], [Num_tick], [Estat], [Plu], [Quantitat], [Import], "
									+"[Tipus_venta], [FormaMarcar], [Otros], ",
									[H.GlobalGTPV.get("Llicencia"), sqlDate, codiDep, infoCaja.numTick,
									null, t.codi, t.n, imp,
									null, null, null], h.mark);
								// preu se guarda por si cambia y dar el precio que se pago	
								tPrint.rowsT.push({ n: t.n, codi: t.codi, imp: imp }); 
							}	
						});
						infoCaja.sumTick += total;
						infoCaja.clients++;
						// en objeto a parte para que no se guarde en caja, sólo temporal
						var infoMov = { depNom: depNom, rowsT : tPrint.rowsT, total: total };
						H.Caja.insertTicket({ date: sqlDate, numTick: infoCaja.numTick, info: infoMov }, movimientos);
						
						tPrint.ready = true;	
						if (tPrint.fPendingPrint) {
							printTicket(tPrint);
							tPrint.fPendingPrint = false;
						}
					});
				});
			});
		})
	
	}
	
	
	function printTicket(t) {
		t.currencySymbol = H.curPrinter.EURO;
		H.curPrinter.abrirCajon();
		H.curPrinter.reset();
		H.curPrinter.codePage();
		H.curPrinter.print("SCHNAPS DEL CENTRE SL\n");
		H.curPrinter.print("CAFETERIA & CERVESERIA IGLÚ\n");
		H.curPrinter.print("CL FRANCESC LAYRET 8 LOCAL\n");
		H.curPrinter.print("08911 BADALONA\n");
		H.curPrinter.print("BARCELONA\n");
		H.curPrinter.print("NIF: B64460280\n");
		H.curPrinter.print("\n");
		H.curPrinter.font("B",false,1,1,false);
		var str;
		for (var i=0; (str=PrintTicket.getLine("header", i, t, 56)) != null; i++) H.curPrinter.print(str+"\n");
		for (var i=0; (str=PrintTicket.getLine("ticket", i, t, 56)) != null; i++) H.curPrinter.print(str+"\n");
		H.curPrinter.font("B",true,2,2,false);
		for (var i=0; (str=PrintTicket.getLine("total" , i, t, 28)) != null; i++) H.curPrinter.print(str+"\n");
		H.curPrinter.cutPaper();
	}
	
	function initComanda(c) {
		c.ts = Date.now();
		c.ver = 1;
		c.nextIdItem = 1;
		c.state = "closed";
		c.items = [];
		c.ticketsToPrint = [];
	}
	

	function createObjHost(objSat) {
		return $.extend(Object.create(null), {
			orders : function(comdSat) {
				var answ = [];
				for (var j=0; j<comdSat.length; j++) {
					var cSat = comdSat[j];
					if (comandes[cSat.id] == null) {
						comandes[cSat.id] = { id: cSat.id };
						initComanda(comandes[cSat.id]);
					}
					var c = comandes[cSat.id];
					var answC = {};
					var tsSat = cSat.ts;

					function isOpenComanda() { return c.state === "open"; } // is open comanda

					function checkOpenComanda(answC) { // check open comanda
						if ((isOpenComanda(c)) && (tsSat == c.ts)) return true;
						answC.er = "";
						return false;
					}
					function checkClosedComanda(answC) { // check closed comanda
						if (!isOpenComanda(c)) return true;
						answC.er = "";
						return false;
					}

					var sameVer = ((c.ts === cSat.ts) && (c.ver === cSat.ver));
					var transIds = { h:[], s:[] };
					
					function getIdItemHost(idItem) {
						if (idItem > 0) return idItem;
						var idx = transIds.s.indexOf(idItem);
						if (idx !== -1) return transIds.h[idx];  
						return null;  
					}
					function findIdxItem(idItem) {
						idtem = getIdItemHost(transIds, idItem); 
						if (idItem == null) return -1;
						for (var i=0; i<c.items.length; i++) {
							if (c.items[i].id === idItem) return i;	
						}
						return -1;
					}

					for (var i=0; i<cSat.ord.length; i++) {
						var o = cSat.ord[i];	
						if (!(H.Caja.isOpen())) {
							answC.er = "";
							break;
						}
						switch (o.cmd) {
							case "app": 
								if (!checkOpenComanda(answC)) break;
								var item = o.data;
								transIds.s.push(item.id);
								transIds.h.push(c.nextIdItem);
								item.id = c.nextIdItem;
								c.nextIdItem++;
								c.items.push(item);
								break;
							case "rem":	
								if (!checkOpenComanda(answC)) break;
								var idx = findIdxItem(o.data.id);
								if (idx === -1) { answC.er = ""; break; }
								c.items.splice(idx, 1);
								break;
							case "mod":
								if (!checkOpenComanda(answC)) break;
								var idx = findIdxItem(o.data.id);
								if (idx === -1) { answC.er = ""; break; }
								o.data.id = c.items[idx].id;
								$.extend(c.items[idx], o.data);
								break;
							case "inc":
								if (!checkOpenComanda(answC)) break;
								var idx = findIdxItem(o.data.id);
								if (idx === -1) { answC.er = ""; break;	}
								if (c.items[idx].n+o.data.incN < 0) { answC.er = ""; break;	}
								c.items[idx].n+=o.data.incN;
								// if (c.items[idx].n < 0) c.items[idx].n = 0; //????
								break;
							case "abrir":
								if (!checkClosedComanda(answC)) break;
								initComanda(c); // info Apertura en o.data.info
								c.state = "open";
								c.codiDep = o.data.codiDep;
								tsSat = c.ts;
								transIds = { h:[], s:[] };
								break;
							case "cobrar":
								if (!checkOpenComanda(answC)) break;
								// ya se verifica que tsSat sea correcto en checkOpen
								//if (o.data.ts != c.ts) { answC.er = ""; break; }
								c.state = "closed";
								transIds = { h:[], s:[] };
								cobrar(c);
								break;
							case "borrar":
							case "cerrar":
								if (!checkOpenComanda(answC)) break;
								c.state = "closed";
								c.items = [];
								transIds = { h:[], s:[] };
								break;
							case "temporal":
								if (!checkClosedComanda(answC)) break;
								tsSat = c.ts;
								transIds = { h:[], s:[] };
								break;	
							case "temporal_o_abrir":
								if (!isOpenComanda()) {
									initComanda(c); // info Apertura en o.data.info
									c.state = "open";
									c.codiDep = o.data.codiDep;
								}
								tsSat = c.ts;
								transIds = { h:[], s:[] };
								break;
							case "printTicket":
								var tsPrint = o.data;
								if (tsPrint == null) {
									if (tsSat == null) { answC.er = ""; break; }
									else tsPrint = tsSat;
								}
								var t;
								for (var i=0; i<c.ticketsToPrint.length; i++) {
									t = c.ticketsToPrint[i];
									if (t.ts === tsPrint) break;
									t = null;
								}
								if (t == null) { answC.er = ""; break; }
								if (t.ready) printTicket(t);
								else t.fPendingPrint = true;
								break;
						} // switch o.cmd
						if (answC.er != null) {
							answC.idxError = i;
							break;
						}
		
					} // for cSat.ord
					// generar answC
					c.ver++;
					if (cSat.ts !== c.ts) answC.ts = c.ts;
					answC.ver = c.ver;
					if (!sameVer) {
						answC.state = c.state;
						answC.items = c.items; // ???? extend
					}	
					if (transIds.h.length > 0) {
						answC.transIds = transIds;
					}				
					actualizeSats(cSat.id, objSat);
					answ.push(answC);
				} // for orders
				// save in LS
				return answ;
			}
		});
	}
	
	// ejecutado en satelite
	var createObjSat = function(host) {
		return createComandesS(host);	
	}
	
	return my;
}();

H.Scripts.add("ComandesS", "L2", function(window) {

window.createComandesS = function(host) {
	window.createComandesS = null; // no double initialize
	
	var my = {};
	window.Comandes = my;
	
	var comandes = {}; // dictionary without key __proto__
	function createComanda(id) {
		comandes[id] = {
			id : id,
			ts : null,
			ver : null,

			hostState : null, // ???? comanda vacia (null, "open", "closed")
			hostItems : [],
			
			nextSatId : -1, // ids Item creados por sat son id < 0
			orders : [],
			ordersSend : null,
			changeHandlers : [],
			curState : null,
			curItems : null,
			transIds : null,
			curTsValid : false, // false -> transIds y ts no son validos
			nChangeTs : 0, // num change Ts (ts1->null), (ts1->ts2), (null->null)
			itemsInHostTsNotSend : false,
			timeoutIdCallChangeHandler : null,
			C_OrderGenerator : null,
			waitResponse : 0,
			waitActualizationData : null,
			errorState : false,
			pendingProcResp : null,
			errorOrder : null,
			errorLenOrders : 0,
		};
	}
	
	my.getId = function(type, codi) {
		return ""+type+"_"+codi;
	}
	
	function getComanda(id) {
		if (!comandes.hasOwnProperty(id)) {
			createComanda(id);
		}
		// copy id,ts,verHost, tempSatus, extend tempItems
		var c = comandes[id];
		var comanda = { id: c.id, ts: (c.curTsValid ? c.ts : null), ver: c.ver, 
						nChangeTs: c.nChangeTs, state:c.curState, isOpen:isOpen(c)};
		comanda.items = $.extend(true, [], c.curItems);
		return comanda;
	}
	function setChangeHandler(C, handler) {
		var c = comandes[C.getId()];
		c.changeHandlers.push({C:C, handler:handler});
	}
	function release(C) {
		var c = comandes[C.getId()];
		for (var i=0; i<c.changeHandlers.length; i++) {
			if (c.changeHandlers[i].C === C) {
				c.changeHandlers.splice(i,1);
				break;
			}
		}
	}
	var timeoutIdCom = null;
	var delaySendOrdersToHost = 0; /*5000*/
	var ordersToSend = null;
	var nextOrdersSendPending = false; // ???? 
	
	function sendOrdersToHost() {
		timeoutIdCom = null;
	
		if (ordersToSend != null) {
			nextOrdersSendPending = true;
			return;
		}
		ordersToSend = [];
		for (var id in comandes) {
			var c = comandes[id];
			if (c.errorState) continue;
			if (c.orders.length > 0) {
				var cSat = { id: c.id, ts: c.ts, ver: c.ver };
				cSat.ord = c.orders.map(function(ord) {
					var oSat = {};
					oSat.cmd = ord.cmd;
					if (ord.data && (typeof ord.data === "object")) { 
						oSat.data = $.extend({}, ord.data);
						if (oSat.data.id != null) oSat.data.id = getIdItemHost(c, oSat.data.id);
					} else oSat.data = ord.data;
					oSat.ts = ord.ts;
					return oSat;
				});
				ordersToSend.push(cSat);
				c.itemsInHostTsNotSend = false;
				// save info sending
				//c.saveSendState = c.curState;
				//c.saveSendItems = extend(true, [], c.curItems);
				c.ordersSend = c.orders;
				c.orders = [];
				c.waitResponse++;
			}
		}
		if (ordersToSend.length > 0) { // ????
			host.call("orders", [ordersToSend], callbackSendOrdersToHost);
		} else ordersToSend = null;
	}
	function processWaitActualization(c) {
		if (c.errorState) return false;
		if (c.waitResponse > 0) return false;
		if (c.waitActualizationData == null) return false;
		var actData = c.waitActualizationData;
		c.waitActualizationData = null;
		if ((c.ts != null) && 
			((c.ts > actData.ts) || 
			 ((c.ts === actData.ts) && (c.ver >= actData.ver)))) 
			return false;	
		var error = false;
		if (c.itemsInHostTsNotSend && (actData.ts != c.ts)) {
			c.prev_c = {
				ts : c.ts,
				ver : c.ver,
				hostState : c.hostState,
				hostItems : c.hostItems,
				transIds : c.transIds,
//					curTsValid : c.curTsValid,
				orders : c.orders
			}
			error = true;
		} 
		if (c.curTsValid && (c.ts != actData.ts)) c.nChangeTs++;
		if (c.ts !== actData.ts) c.transIds = { h:[], s:[] };
		c.ts = actData.ts;
		c.ver = actData.ver;
		c.hostState = actData.state;
		c.hostItems = actData.items;	 
		if (error) {
			genError(c, "", 0);
			return false;
		} 
		if (!applyOrders(c)) return false; // hay error
		programCallChangeHandler(c, null);
		return true;
	}
	
	function genError(c, codError, idxOrderErr) {
		c.errorState = true;
		var o = c.orders[idxOrderErr];
		c.errorOrder = o;
		c.errorLenOrders = c.ordersLen;
		var controlHandler = o.C.getControlHandler();
		if (typeof controlHandler === "function") 
			setTimeout(controlHandler, 0, o.C, codError, o, c);	
	}
	function resumeError(C) {
		var c = comandes[C.getId()];
		c.errorState = false;
		var savedOrder = c.errorOrder;
		var savedLenOrders = c.errorLenOrders;
		c.errorOrder = null;
		c.errorLenOrders = 0;
		if (c.pendingProcResp != null) {
			c.pendingProcResp();
			c.pendingProcResp = null;
			if (c.errorState) return false;
		}
		if (processWaitActualization(c)) return true; // no error y change programmed
		if (c.errorState) return false;
		// wait Actualization -> applyOrders ya estan aplicadas
		// no wait Actualization -> applyOrders
		while (true) {
			if (applyOrders(c)) break;
			if ((c.errorOrder === savedOrder) || 
				(c.errorLenOrders >= savedLenOrders)) {
					// dos veces la misma orden o aumenta ordenes -> eliminar orden (es un seguro)
					c.orders.splice(c.orders.indexOf(c.errorOrder),1);
					c.errorState = false; // aplicar resto de ordenes
			} else return false;
		}
		programCallChangeHandler(c, null);
		return true;
	}
	
	function callbackSendOrdersToHost(resps, er) {
		for (var i=0; i<resps.length; i++) {
			var idC = ordersToSend[i].id;
			var c = comandes[idC];
			c.waitResponse--;
			
			var procResp = function (idComanda, a) {
				return function() {
					var c = comandes[idComanda];
					
					var ordsCorrect = (a.er != null) ? a.idxError : c.ordersSend.length;
					var c_tmp = {
						ts : c.ts,
						hostState : c.hostState,
						hostItems : c.hostItems,
						transIds : c.transIds,
						orders : c.ordersSend.slice(0, ordsCorrect)
					}
					applyOrders(c_tmp);

					if (a.ts != null) {
						c.ts = a.ts;
						c.transIds = { h: [], s:[] };
					}
					c.ver = a.ver;
					if (a.transIds != null) {
						c.transIds.h = c.transIds.h.concat(a.transIds.h || []);
						c.transIds.s = c.transIds.s.concat(a.transIds.s || []);
					}
					if (a.items == null) {
						c.hostState = c_tmp.curState;
						c.hostItems = c_tmp.curItems;
					} else {
						c.hostState = a.state;
						c.hostItems = a.items;
					}	
					if (a.er != null) {
						c.ordersSend.splice(0, a.idxError);
						c.orders = c.ordersSend.concat(c.orders);
						genError(c, a.er, 0); 
						return false;
					} else {
						return (a.items != null);
					}
				}
			}(idC, resps[i]);

			if (c.errorState) {
				c.pendingProcResp = procResp;
				continue;
			} 
			var change = procResp();
			if (processWaitActualization(c)) continue; // no error y change programmed
			if (c.errorState) continue;
			if (change) {
				if (applyOrders(c)) { // no error
					programCallChangeHandler(c, null);
				}	
			}
		}
		ordersToSend = null;
		if (nextOrdersSendPending) {
			nextOrdersSendPending = false;
			timeoutIdCom = setTimeout(sendOrdersToHost, 0);
		}
	}
	
	function programCallChangeHandler(c, C) {
		if (c.timeoutIdCallChangeHandler == null) {
			c.timeoutIdCallChangeHandler = setTimeout(callChangeHandler, 0, c);
			c.C_OrderGenerator = C;
		} else { if (c.C_OrderGenerator !== C) c.C_OrderGenerator = null; } 
	}
	
	function callChangeHandler(c) {
		c.changeHandlers.forEach(function (el) {
			if (el.C === c.C_OrderGenerator) 
				if (typeof el.handler === "function") el.handler(true);
		});
		c.changeHandlers.forEach(function (el) {
			if (el.C !== c.C_OrderGenerator) 
				if (typeof el.handler === "function") el.handler(false);
		});
		c.timeoutIdCallChangeHandler = null;
		c.C_OrderGenerator = null;
	}
	
	function addOrder(C, cmd, data) {
		if (timeoutIdCom == null) {
			timeoutIdCom = setTimeout(sendOrdersToHost, delaySendOrdersToHost);
		}		
		var c = comandes[C.getId()];
		var o = {cmd: cmd, data: data, ts: Date.now(), C: C};
		c.orders.push(o);
		if (!applyOrder(c, o, true)) return false; 
				// si error tratamiento en controlHandler, mismo tratamiento
				// si el error se genera al añadir o al actualizar					
		programCallChangeHandler(c, C);
		return true;
	}
	function isOpen(c) {
		return c.curState === "open"; 	
	}
	function checkOpen(c, o) {
		if (isOpen(c)) return true;
		genError(c, "", o);
		return false;	
	}
	function checkClosed(c, o) {
		if (!isOpen(c)) return true;
		genError(c, "", o);
		return false;	
	}
	
	function applyOrder(c, o, fChangeTs) {
		function findIdxItemByIdSat(id) {
			//id = getIdItemSat(c, id); // ???? ya es idSat
			for (var i=0; i<c.curItems.length; i++) {
				if (c.curItems[i].id === id) return i;	
			}
			return -1;
		}
		if (!(Caja.isOpen())) {
			genError(c, "", o);
			return false;
		}
		switch (o.cmd) {
			case "app":
				if (!checkOpen(c, o)) return false;
				var item = $.extend({}, o.data);
				if (item.n == null) item.n = 1;
				c.curItems.push(item);
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "rem":
				if (!checkOpen(c, o)) return false;
				var idx = findIdxItemByIdSat(o.data.id);
				if (idx === -1) {
					genError(c, "", o);
					return false;	
				} 
				c.curItems.splice(idx,1);
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "mod":
				if (!checkOpen(c, o)) return false;
				var idx = findIdxItemByIdSat(o.data.id);
				if (idx === -1) {
					genError(c, "", o);
					return false;	
				} 
				$.extend(c.curItems[idx], o.data);
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "inc":
				if (!checkOpen(c, o)) return false;
				var idx = findIdxItemByIdSat(o.data.id);
				if (idx === -1) {
					genError(c, "", o);
					return false;	
				} 
				if (c.curItems[idx].n+o.data.incN < 0) {
					genError(c, "", o);
					return false;	
				} 
				c.curItems[idx].n+=o.data.incN;
				//if (c.curItems[idx].n < 0) c.curItems[idx].n = 0; //????
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "abrir":
				if (!checkClosed(c, o)) return false;
				c.curState = "open";
//					c.curStatus = o.cmd;
				c.curTsValid = false;
				if (fChangeTs) c.nChangeTs++;
				c.curItems = [];
				break;
			case "cobrar":
				if (!checkOpen(c, o)) return false;
				c.curState = "closed";
//					c.curStatus = o.cmd;
				break;
			case "borrar":
			case "cerrar":
				if (!checkOpen(c, o)) return false;
				c.curState = "closed";
//					c.curStatus = o.cmd;
				c.curTsValid = false;
				if (fChangeTs) c.nChangeTs++;
				c.curItems = [];
				break;
			case "temporal":
			case "temporal_o_abrir":
				c.curState = "open";
//					c.curStatus = o.cmd;
				c.curTsValid = false;
				if (fChangeTs) c.nChangeTs++;
				c.curItems = [];
				break;
		}
		return true;
	}
	
	function applyOrders(c) {
		c.curTsValid = (c.ts != null);
//			c.validTransIds = true;
		c.curState = c.hostState;
		c.curItems = [];
		for (var i=0; i<c.hostItems.length; i++) {
			c.curItems[i] = $.extend({}, c.hostItems[i]); // copy hostItems[i] to tempItems[i]
			c.curItems[i].id = getIdItemSat(c, c.curItems[i].id); 
			if (c.curItems[i].n == null) c.curItems[i].n = 1;
		}
		for (var i=0; i<c.orders.length; i++) {
			var o = c.orders[i];
			if (!applyOrder(c, o)) return false;
		}
		return true;
	}
	
	function getIdItemHost(c, idItem) {
		if (!c.curTsValid) return idItem;
		if (idItem > 0) return idItem;
		var idx = c.transIds.s.indexOf(idItem);
		if (idx !== -1) return c.transIds.h[idx];  
		return idItem;  // en Host sera id < 0
	}
	function getIdItemSat(c, idItem) {
		if (!c.curTsValid) return idItem;
		if (idItem < 0) return idItem;
		var idx = c.transIds.h.indexOf(idItem);
		if (idx !== -1) return c.transIds.s[idx];  
		return idItem;  // no era un item creado por este sat => id > 0 
	}
	
	function append(C, item) {
		// item = normalizeItem(item); // ???? copy?
		//var c = comandes[C.getId()];	
		item.id = comandes[C.getId()].nextSatId--;
		if (item.n == null) item.n = 1;
		if (!addOrder(C, "app", $.extend({}, item))) return false;
		return item.id;
	}
	function remove(C, idItem) {
		//var c = comandes[C.getId()];	
		return addOrder(C, "rem", {id: idItem});
	}
	function modify(C, idItem, modFields) {
		//var c = comandes[C.getId()];	
		return addOrder(C, "mod", $.extend({}, modFields, {id: idItem}));
	}
	function increment(C, idItem, inc) {
		//var c = comandes[C.getId()];	
		return addOrder(C, "inc", $.extend({}, {id: idItem, incN: inc}));
	}

	function abrir(C, info) {
		return addOrder(C, "abrir", info);
	}
	function cerrar(C) {
		return addOrder(C, "cerrar");
	}
	function cobrar(C) {
		return addOrder(C, "cobrar");
	}
	function temporal(C) {
		return addOrder(C, "temporal");
	}
	function temporal_o_abrir(C, info) {
		return addOrder(C, "temporal_o_abrir", info);
	}
	function printTicket(C, ts) {
		return addOrder(C, "printTicket", ts);
	}
	// ???? Comanda oberta
	// id = Dcodi, TnumTaula (string)
	my.get = function(idComanda, changeHandler, controlHandler) {
		var C = {};

		C.getId = function() { return idComanda; }

		var valid = true;
		var savedIds = [];
		function saveIdsSequence() {
			var newIds = comanda.items.map(function(item) { return item.id; });
			for (var i=0; i<savedIds.length; i++) {
				if (newIds.indexOf(savedIds) === -1) {
					newIds.splice((i === 0) ? 0 : newIds.indexOf(savedIds[i-1])+1, 0, savedIds[i]); 
				}
			}
			savedIds = newIds;
		}

		var comanda = getComanda(idComanda);
		setChangeHandler(C, function(autoChange) {
			if (!autoChange) {
				saveIdsSequence();
				comanda = getComanda(idComanda);
			}
			if (typeof changeHandler === "function") changeHandler(C, autoChange);
		}); 
		
		C.getControlHandler = function() { return controlHandler; }
		C.getNChangeTs = function() { return comanda.nChangeTs; }
		C.getTs = function() { return comanda.ts; }
		
		C.getIdItem = function(item) {
			return item.id;
		}
		
		function actualizeComanda() { comanda = getComanda(idComanda); saveIdsSequence(); }
		
		C.append = function(item) {
			var idItem = append(C, item); 
			if (idItem !== false) actualizeComanda();
			return idItem;
		}
		C.remove = function(idItem) {
			if (typeof idItem !== "number") idItem = idItem.id; 
			var ret = remove(C, idItem);
			if (ret) actualizeComanda();
			return ret;
		}
		
		C.modify = function(idItem, modFields) {
			if (typeof idItem !== "number") idItem = idItem.id; 
			var ret = modify(C, idItem, modFields);
			if (ret) actualizeComanda();
			return ret;
		}
		
		C.increment = function(idItem, inc) {
			if (typeof idItem !== "number") idItem = idItem.id; 
			var ret = increment(C, idItem, inc);
			if (ret) actualizeComanda();
			return ret;
		}
		
		C.abrir = function(info) {
			var ret = abrir(C, info);
			if (ret) actualizeComanda();
			return ret;
		}
		C.cerrar = function() {
			var ret = cerrar(C);
			if (ret) actualizeComanda();
			return ret;
		}
		C.cobrar = function() {
			var ret = cobrar(C);
			if (ret) actualizeComanda();
			return ret;
		}
		C.temporal = function() {
			var ret = temporal(C);
			if (ret) actualizeComanda();
			return ret;
		}
		C.temporal_o_abrir = function() {
			var ret = temporal_o_abrir(C, info);
			if (ret) actualizeComanda();
			return ret;
		}
		C.printTicket = function(ts) {
			var ret = printTicket(C, ts);
			return ret;
		}
		
		C.getItems = function() {
			return comanda.items;	
		}
		C.getState = function() {
			return comanda.state;	
		}
		C.isOpen = function() {
			return comanda.isOpen;
		}
		
		function _getPosItem(idItem) {
			for (var i=0; i<comanda.items.length; i++) {
				if (comanda.items[i].id === idItem) return i;
			}
			return -1;
		}
		C.getItem = function(idItem) {
			var pos = _getPosItem(idItem);
			if (pos !== -1) return comanda.items[pos];
			return null;
		}
		C.getPosItem = function(idItem) {
			var pos = _getPosItem(idItem);
			if (pos !== -1) return pos;
			pos = savedIds.indexOf(idItem);
			if (pos == -1) return -1;
			for (var i=pos+1; i<savedIds.length; i++) {
				var pos2 = _getPosItem(savedIds[i]);
				if (pos2 !== -1) return pos2;
			}
			for (var i=pos-1; i>=0; i--) {
				var pos2 = _getPosItem(savedIds[i]);
				if (pos2 !== -1) return pos2+1;
			}
			return -1;
		}

		C.release = function() {
			release(C);
			valid = false;
			// C.setChangeHandler(null);
		}
		return C;
	}
	
	var comHostToSat = {
		actualize : function(comdsH) { // ????
			comdsH.forEach(function (comdH) {
				if (!comandes.hasOwnProperty(comdH.id)) {
					createComanda(comdH.id);
				}
				var c = comandes[comdH.id];
				c.waitActualizationData = comdH;
				processWaitActualization(c);
			});
			return true;
		}
	}

	return comHostToSat;
}

window.prefAgruparComanda_Default = {
	group: function(grItems, item) {
		return -1;
	},
	append: function(grItems, item) {
		return false;
	},
	increment: function(grItems, inc) {
		return [inc];
	},
	remove_n0: true	
}
/* pref : group
		  append
		  increment
		  remove_n0
*/
window.agruparComanda = function(pref) {
	var my = {};
	
	var C;
	var itemsGr_All; // itemsGr y itemsGr_n0
	var itemsGr; // [] -> { n, el, items }
	var itemsGr_n0; // [] -> { n:0 }
	var C_items = null;
	
	my.setC = function(_C) {
		C = _C;
	}
	
	my.getItems = function() {
		if (C_items === C.getItems()) return itemsGr;
		C_items = C.getItems();
		
		itemsGr_All = [];
		var items = C_items.slice(0); // copy array
		while(true) {
			for (var i=0; i<items.length; i++) {
				if (items[i] != null) break;
			}
			if (i == items.length) break; // while
			var gr = { n: items[i].n, items: [items[i]] }
			items[i] = null;
			for (i++; i<items.length; i++) {
				var pos = pref.group(gr.items, items[i]);
				if (pos >= 0) {
					gr.n += items[i].n;
					gr.items.splice(pos, 0, items[i]);
					items[i] = null;
				}
			}
			gr.el = $.extend({}, gr.items[0], { n: gr.n });
			itemsGr_All.push(gr);
		}
		itemsGr = [];
		itemsGr_n0 = [];
		if (pref.remove_n0) {
			itemsGr_All.forEach(function(gr) {
				((gr.n <= 0) ? itemsGr_n0 : itemsGr).push(gr)
			});
		}
		return itemsGr;
	}
	
	my.append = function(item) {
		my.getItems();
		for (var i=0; i<itemsGr_All.length; i++) {
			if (pref.append(itemsGr_All[i].items, item)) {
				var gr = itemsGr_All[i];
				if (my.increment(gr, item.n)) return gr;
				return false;
			}	
		}
		return C.append(item);
	}
	
	my.remove = function(gr) {
		my.getItems();
		var ret = true;
		for (var i=0; i<gr.items.length; i++) {
			ret = C.remove(gr.items[i]) && ret;
		}
		return ret;
	}
	
	my.modify = function(gr, modFields) {
		my.getItems();
		var ret = true;
		for (var i=0; i<gr.items.length; i++) {
			ret = C.modify(gr.items[i], modFields) && ret;
		}
		return ret;
	}
	
	my.increment = function(gr, inc) {
		my.getItems();
		var ret = true;
		var incArray = pref.increment(gr.items, inc);
		for (var i=0; i<gr.items.length; i++) {
			var incP = incArray[i];
			if ((incP != null) && (incP !== 0)) ret = C.increment(gr.items[i], incP) && ret;
		}
		return ret;
	}
	
	function _getPosItemInAll(idsItems) {
		my.getItems();
		for (var i=0; i<idsItems.length; i++) {
			var item = C.getItem(idsItems[i]);
			if (item == null) continue;
			
			for (var j=0; j<itemsGr_All.length; j++) {
				if (itemsGr_All[j].items.indexOf(item) !== -1) return j;
			}
		}
		return -1;
	}
	// gr : null -> null
	//    : num  -> id en C
	//    : itemGroup : {n, el, items} -> group in agruparComanda
	//    : [id1, id2, .. ] -> array de ids en C == ids de itemGroup.item
	my.getItem = function(gr) {
		if (gr == null) return null;
		var idsItems;
		if (typeof gr === "number") idsItems = [gr];
		else if (!(gr instanceof Array)) 
			idsItems = gr.items.map(function(item) { return C.getIdItem(item); });   
		else idsItems = gr;
		var pos = _getPosItemInAll(idsItems);
		if (pos === -1) return null;
		
		if (pref.remove_n0 && (itemsGr_All[pos].n <= 0)) return null;
		return itemsGr_All[pos];
	}
	
	my.getPosItem = function(gr) {
		if (gr == null) return -1;
		var idsItems;
		if (typeof gr === "number") idsItems = [gr];
		else if (!(gr instanceof Array)) 
			idsItems = gr.items.map(function(item) { return C.getIdItem(item); });   
		else idsItems = gr;
		var pos = _getPosItemInAll(idsItems);
		if (pos === -1) {
			pos = C.getPosItem(gr.items[0]);
			if (pos === -1) return -1;
		}
		if (!pref.remove_n0) return pos;
		for (var i=pos; i<itemsGr_All.length; i++) {
			if (itemsGr_All[i].n > 0) return itemsGr.indexOf(itemsGr_All[i]);	
		}
		for (var i=pos-1; i>=0; i--) {
			if (itemsGr_All[i].n > 0) return itemsGr.indexOf(itemsGr_All[i])+1;	
		}
		return -1;
	}

	return my;
}

}); // add Scripts ComandesS

