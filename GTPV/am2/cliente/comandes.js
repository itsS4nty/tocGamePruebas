H.Comandes = function() {
	var my = {};
	
	var comandes = Object.create(null); // dictionary without key __proto__
	
	function restoreComandes() {
		comandes = Object.create(null);
		var ids = LS.get("IdsComandes");
		if (!(ids instanceof Array)) {
			LS.set("IdsComandes", []);
			return;
		}
		ids.forEach(function(id) {
			var c = LS.get("Comanda_"+id);
			if (c && (typeof(c) === "object")) {
				comandes[id] = c;
			}
		});
		var ccsEnCaja = H.Caja.getComandasCobradas() || [];
		for (var idc in comandes) {
			var c = comandes[idc];
			for (var i=0; i<c.comandaCobrada.length;) {
				var cc=c.comandaCobrada[i];
				var fCobrada = false;
				for (var j=0; j<ccsEnCaja.length; j++) {
					var ccCj = ccsEnCaja[j];
					if ((ccCj.id === c.id) && (ccCj.ts === cc.ts)) {
						c.comandaCobrada.splice(i,1);
						saveComanda(c);
						borrarComandaCobradaEnCaja(ccCj);
						fCobrada = true;
						break;
					}
				}
				if (fCobrada) continue;
				for (var j=0; j<c.ticketsToPrint.length; j++) {
					if (cc.tPrint.ts === c.ticketsToPrint[j].ts) {
						cc.tPrint = c.ticketsToPrint[j]; // apuntar al mismo objeto despues de restaurar
						break; 
					}
				}
				cobrar2(cc, c);
				i++;
			}
		}
	}
	
	my.init = function(callbackInit) {
		restoreComandes();
		H.Caja.addCloseHandler(function() {
			for (var id in comandes) {
				var c = comandes[id];
				c.states = { fOpen: false, fCobrada: false };
				c.props = {};
				c.items = [];
				actualizeSats(id);
			}
		});
		callbackInit();
	}
	
	function saveIdsComandes() {
		var idsComandes = [];
		for (var idc in comandes) {
			idsComandes.push(idc);	
		}
		LS.save("IdsComandes", idsComandes);
	}

	function saveComanda(c) {
		LS.save("Comanda_"+c.id, c);
	}
	
/*	my.start = function() {
		// verificar integridad
	}
*/
	function getComHandler(obj) {
		return function(ret) {
		}
	}
	
	var sats = [];
	var objs = [];
	
	function actualizeSats(idComanda, noActObj) { 
		objs.forEach(function(obj) {
			if (noActObj == obj) return;
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

	var optAgruparComanda_Cobrar = {
		group: function(grItemsDest, item) {
			if (grItemsDest[0].codi === item.codi) return 1;
			else return -1;
		},
/*		append: function(grItems, item) {
			if (grItems[0].codi === item.codi) return true;
			else return false;
		},
		increment: function(grItems, inc) {
			return [inc];
		},
*/		remove_n0: true	
	}
		
	function borrarComandaCobradaEnCaja(ccEnCaja) {
		var sqlDate = H.DB.DateToSql(new Date());
		var db = H.DB.open(H.DB.getMensualName(sqlDate));			
		H.DB.transactionWithErr(db, function (tx) {
			H.Caja.save(tx, function (infoCaja, movimientos) {
				var idx = infoCaja.comandasCobradas.indexOf(ccEnCaja);
				if (idx !== -1) infoCaja.comandasCobradas.splice(idx,1);
			});
		});
	}
	
	function cobrar(c) { 
		var cc = {};
		cc.sqlDate = H.DB.DateToSql(new Date());
		cc.total = calcTotalComanda(c);
		cc.items = c.items; // no se modifican si esta cerrada pero c puede que sí
		cc.props = $.extend({}, c.props);
		cc.tPrint = { ts : c.ts, ready : false }; // guardar copia, puede borrar c.ticketsToPrint antes de imprimir
		cc.ts = c.ts;
		c.ticketsToPrint.push(cc.tPrint);
		while (c.ticketsToPrint.length > 1) c.ticketsToPrint.shift();
		c.comandaCobrada.push(cc);
		saveComanda(c);
		cobrar2(cc, c);
	}
	function cobrar2(cc, c /*sqlDate, total, items, props.codiDep, tPrint*/) {	
		H.Caja.preSave(cc.sqlDate, function() {
			H.DB.preOpenMensual(cc.sqlDate, "V_Venut_", function(h) {
//				Caja.set(c);
//				var depTemp = dep;
				var db = H.DB.open(h.dbName);
				H.DB.transactionWithErr(db, function (tx) {
					my.createTableVenut(tx, h.tableName);
					H.Caja.save(tx, function (infoCaja, movimientos) {
						infoCaja.numTick++;
						var dep = H.Dependentes.getByCodi(cc.props.codiDep)
						var depNom = ((dep != null) && (dep.nom)) ? dep.nom : "";
						$.extend(cc.tPrint, { date: cc.sqlDate, numTick: infoCaja.numTick, depNom: depNom, rowsT : [], total: cc.total}); 
						
						var AC = agruparComanda(optAgruparComanda_Cobrar, cc.items);
						AC.getGrs().forEach(function(t) {
							if (t.el.n > 0) {
								var imp = normImport(t.el.n*t.el.preu);
								H.DB.sincroInsert(tx, h.tableName, 
									 "[Botiga], [Data], [Dependenta], [Num_tick], [Estat], [Plu], [Quantitat], [Import], "
									+"[Tipus_venta], [FormaMarcar], [Otros], ",
									[H.ConfigGTPV.get("Llicencia"), cc.sqlDate, cc.props.codiDep, infoCaja.numTick,
									null, t.el.codi, t.el.n, imp,
									null, null, null], h.mark);
								// preu se guarda por si cambia y dar el precio que se pago	
								cc.tPrint.rowsT.push({ n: t.el.n, codi: t.el.codi, imp: imp }); 
							}	
						});
						infoCaja.sumTick += cc.total;
						infoCaja.clients++;
						// en objeto a parte para que no se guarde en caja, sólo temporal
						var infoMov = { depNom: depNom, rowsT : cc.tPrint.rowsT, total: cc.total };
						H.Caja.insertTicket({ date: cc.sqlDate, numTick: infoCaja.numTick, info: infoMov }, movimientos);
						
						cc.tPrint.ready = true;	
						if (cc.tPrint.fPendingPrint) {
							printTicket(cc.tPrint);
							cc.tPrint.fPendingPrint = false;
						}
						var ccEnCaja = {id:c.id, ts:cc.ts};
						(infoCaja.comandasCobradas = (infoCaja.comandasCobradas || [])).push(ccEnCaja);
						c.comandaCobrada.splice(c.comandaCobrada.indexOf(cc), 1);
						saveComanda(c);
						// para asegurar que saveComanda se haga antes en disco, delay de 100, no se si funciona ?
						window.setTimeout(borrarComandaCobradaEnCaja, 100, ccEnCaja);
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
		c.states = { fOpen: false, fCobrada: false}; //"closed";
		c.props = {}
		c.items = [];
		if (c.ticketsToPrint == null) c.ticketsToPrint = [];
		if (c.comandaCobrada == null) c.comandaCobrada = [];
		saveIdsComandes();
	}

	function createObjHost(objSat) {
		return $.extend(Object.create(null), {
			orders : function(comdSat) {
				var answ = [];
				for (var csIdx=0; csIdx<comdSat.length; csIdx++) {
					var cSat = comdSat[csIdx];
					if (comandes[cSat.id] == null) {
						comandes[cSat.id] = { id: cSat.id };
						initComanda(comandes[cSat.id]);
					}
					var c = comandes[cSat.id];
					var answC = {};
					var tsSat = cSat.ts;

					function isOpenComanda() { return c.states.fOpen; } // is open comanda

					function checkOpenComanda(answC) { // check open comanda
						if ((isOpenComanda(c)) && (tsSat == c.ts)) return true;
						answC.er = "H not open";
						return false;
					}
					function checkClosedComanda(answC) { // check closed comanda
						if (!isOpenComanda(c)) return true;
						answC.er = "H not closed";
						return false;
					}

					// sat tenia la última versión, falta añadir orders de sat y incremantar ver.
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

					for (var oIdx=0; oIdx<cSat.ord.length; oIdx++) {
						var o = cSat.ord[oIdx];	
						if (!(H.Caja.isOpen())) {
							answC.er = "H Caja not open";
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
								if (idx === -1) { answC.er = "H rem idx"; break; }
								c.items.splice(idx, 1);
								break;
							case "mod":
								if (!checkOpenComanda(answC)) break;
								var idx = findIdxItem(o.data.id);
								if (idx === -1) { answC.er = "H mod idx"; break; }
								o.data.id = c.items[idx].id;
								$.extend(c.items[idx], o.data);
								break;
							case "inc":
								if (!checkOpenComanda(answC)) break;
								var idx = findIdxItem(o.data.id);
								if (idx === -1) { answC.er = "H inc idx"; break;	}
								if (c.items[idx].n+o.data.incN < 0) { answC.er = "H inc < 0"; break;	}
								c.items[idx].n+=o.data.incN;
								// if (c.items[idx].n < 0) c.items[idx].n = 0; //????
								break;
							case "abrir":
								if (!checkClosedComanda(answC)) break;
								initComanda(c); // info Apertura en o.data.info
								c.states = { fOpen: true, fCobrada: false };
								c.props = $.extend({}, o.data);
								tsSat = c.ts;
								transIds = { h:[], s:[] };
								break;
							case "cobrar":
								if (!checkOpenComanda(answC)) break;
								// ya se verifica que tsSat sea correcto en checkOpen
								//if (o.data.ts != c.ts) { answC.er = ""; break; }
								c.states = { fOpen: false, fCobrada: true };
								transIds = { h:[], s:[] };
								cobrar(c);
								break;
							case "borrar":
							case "cerrar":
								if (!checkOpenComanda(answC)) break;
								c.states = { fOpen: false, fCobrada: false };
								c.props = {};
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
									c.states = { fOpen: true, fCobrada: false };
									c.props = $.extend({}, o.data);
								}
								tsSat = c.ts;
								transIds = { h:[], s:[] };
								break;
							case "printTicket":
								var tsPrint = o.data;
								if (tsPrint == null) {
									if (tsSat == null) { answC.er = "H printTicket not open"; break; }
									else tsPrint = tsSat;
								}
								var t;
								for (var i=0; i<c.ticketsToPrint.length; i++) {
									t = c.ticketsToPrint[i];
									if (t.ts === tsPrint) break;
								}
								if (i==c.ticketsToPrint.length) { answC.er = "H printTicket"; break; }
								if (t.ready) printTicket(t);
								else t.fPendingPrint = true;
								break;
							case "setProp":
								$.extend(c.props, o.data);
								break;
						} // switch o.cmd
						if (answC.er != null) {
							answC.idxError = oIdx;
							break;
						}
		
					} // for cSat.ord
					// generar answC
					c.ver++;
					if (cSat.ts !== c.ts) answC.ts = c.ts;
					answC.ver = c.ver;
					if (!sameVer) { // sat ya tiene la última versión y ya ha aplicado las ordenes
					                // se envia solo ver+1
						answC.states = c.states;
						answC.props = c.props;
						answC.items = c.items; // ???? extend
					}	
					if (transIds.h.length > 0) {
						answC.transIds = transIds;
					}				
					actualizeSats(cSat.id, objSat);
					answ.push(answC);
					saveComanda(c);
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

H.Scripts.add("ComandesS", "L2C", function() {

window.createComandesS = function(host) {
	window.createComandesS = null; // no double initialize
	
	var my = {};
	window.Comandes = my;
	
	var comandes = Object.create(null); // dictionary without key __proto__

	function createComanda(id) {
		comandes[id] = {
			id : id,
			ts : null,
			ver : null,

			hostStates : { fOpen:false, fCobrada:false }, // ???? comanda vacia (null, "open", "closed")
			hostProps : {},
			hostItems : [],
			
			nextSatId : -1, // ids Item creados por sat son id < 0
			orders : [],
			ordersSend : null,
			changeHandlers : [],
			curStates : { fOpen:false, fCobrada:false },
			curProps : {},
			curItems : null,
			transIds : null,
			curTsValid : false, // false -> transIds y ts no son validos
			                    // si false no se pone ts a null para poder actualizar nChangeTs
			nChangeTs : 0, // num change Ts (ts1->null), (ts1->ts2), (null->null)
			itemsInHostTsNotSend : false,
			timeoutIdCallChangeHandler : null,
			C_OrderGenerator : null,
			waitResponse : 0,
			waitActualizationData : null,
			errorState : false,
			pendingProcResp : null,
			errorOrder : null,
			errorLenOrders : null
		};
	}
	
	my.getId = function(type, codi) {
		return type+"_"+codi;
	}
	
	function getComanda(id) {
		if (comandes[id] == null) createComanda(id);
		// copy id,ts,verHost, tempSatus, extend tempItems
		var c = comandes[id];
		var comanda = { id: c.id, ts: (c.curTsValid ? c.ts : null), ver: c.ver, 
						nChangeTs: c.nChangeTs, isOpen:isOpen(c),
						states: $.extend({}, c.curStates), props: $.extend({}, c.curProps) };
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
			c.itemsInHostTsNotSend = false;
			for (var i=0; i<c.orders.lenght; i++) {
				var o = c.orders[i];
				if (["temporal", "temporal_o_abrir"].indexOf(o.cmd) != -1) break;
			}
			if (i > 0) {
				var ordersNotSend = c.orders.slice(0, i);
				c.orders.splice(0, i);
				// dummyOrd se eliminara en errorHandler
				c.orders.push($({}, ordersNotSend[0], {cmd:"dummy"}));

				c.prev_c = {
					ts : c.ts,
					ver : c.ver,
					hostStates : $.extend({}, c.hostStates),
					hostProps : $.extend({}, c.hostProps),
					hostItems : c.hostItems,
					transIds : c.transIds,
	//					curTsValid : c.curTsValid,
					orders : ordersNotSend
				}
				error = true;
			}
		} 
		if (c.curTsValid && (c.ts != actData.ts)) c.nChangeTs++;
		if (c.ts != actData.ts) c.transIds = { h:[], s:[] };
		c.ts = actData.ts;
		c.ver = actData.ver;
		c.hostStates = actData.states;
		c.hostProps = actData.props;
		c.hostItems = actData.items;	 
		if (error) {
			genError(c, "itemsInHostTsNotSend", 0);
			// return false;
		} 
		return true;
/*		if (!applyOrders(c)) return false; // hay error
		programCallChangeHandler(c, null);
		return true;
*/	}
	
	function defaultErrorHandler(C, codError, o, c, resumeError) {
		c.orders.splice(c.orders.indexOf(o), 1);
		resumeError();
	}			

	function genError(c, codError, o) {
		if (c.errorState) return;
		c.errorState = true;
		if (typeof o == "number") { o = c.orders[o]; }
		if ((c.errorOrder == o) || 
			((c.errorLenOrders!=null) && (c.orders.length > c.errorLenOrders))) {
			// error en el mismo sitio o mas ordenes sin resumeError sin error
			c.orders.splice(c.orders.indexOf(o),1);
			setTimeout(resumeError, 0, c);
		} else { 
			c.errorOrder = o;
			c.errorLenOrders = c.orders.length;
			var errorHandler = o.C.getErrorHandler() || defaultErrorHandler;
			setTimeout(errorHandler, 0, o.C, codError, o, c, function() { resumeError(c); });	
		}
	}
	
	function resumeError(c) {
		//var c = comandes[C.getId()];
		c.errorState = false;
		if (c.pendingProcResp != null) {
			c.pendingProcResp();
			c.pendingProcResp = null;
			if (c.errorState) return false;
		}
		processWaitActualization(c);
		if (!applyOrders(c)) return false;

		c.errorOrder = null;
		c.errorLenOrders = null;
		programCallChangeHandler(c);
		return true;
	}
	
	function callbackSendOrdersToHost(resps, er) {
		for (var i=0; i<resps.length; i++) {
			var idC = ordersToSend[i].id;
			var c = comandes[idC];
			c.waitResponse--;
			
			var procResp = function (idComanda, a) { // a: answer from Host
				return function() {
					var c = comandes[idComanda];
					
					var ordsCorrect = (a.er != null) ? a.idxError : c.ordersSend.length;
					var c_tmp = {
						ts : c.ts,
						hostStates : $.extend({}, c.hostStates),
						hostProps : $.extend({}, c.hostProps),
						hostItems : c.hostItems,
						transIds : c.transIds,
						orders : c.ordersSend.slice(0, ordsCorrect)
					}
					applyOrders(c_tmp); // estado en el momento del envio

					if (a.ts != null) {
						c.ts = a.ts;
						c.transIds = { h: [], s:[] };
						c.curTsValid = true;
					}
					c.ver = a.ver;
					if (a.transIds != null) { 
						c.transIds.h = c.transIds.h.concat(a.transIds.h || []);
						c.transIds.s = c.transIds.s.concat(a.transIds.s || []);
					}
					if (a.items == null) { // same version en host
						c.hostStates = c_tmp.curStates;
						c.hostProps = c_tmp.curProps;
						c.hostItems = c_tmp.curItems;
					} else {
						c.hostStates = a.states;
						c.hostProps = a.props;
						c.hostItems = a.items;
					}	
					if (a.er != null) {
						c.ordersSend.splice(0, a.idxError);
						c.orders = c.ordersSend.concat(c.orders);
						genError(c, a.er, 0); 
						return false;
					} else {
						return (a.items != null); // change no same ver
					}
				}
			}(idC, resps[i]);

			if (c.errorState) {
				c.pendingProcResp = procResp;
				continue;
			} 
			var change = procResp();
			if (processWaitActualization(c)) change = true;
			if (change) {
				if (applyOrders(c)) { // no error
					programCallChangeHandler(c);
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
			c.timeoutIdCallChangeHandler = window.setTimeout(callChangeHandler, 0, c);
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
		var c = comandes[C.getId()];
		var o = {cmd: cmd, data: data, ts: Date.now(), C: C};
		c.orders.push(o);
		if (c.errorState) return false;
		if (timeoutIdCom == null) {
			timeoutIdCom = window.setTimeout(sendOrdersToHost, delaySendOrdersToHost);
		}		
		if (!applyOrder(c, o, true)) return false; 
				// si error tratamiento en errorHandler, mismo tratamiento
				// si el error se genera al añadir o al actualizar					
		programCallChangeHandler(c, C);
		return true;
	}
	function isOpen(c) {
		return c.curStates.fOpen;
	}
	function checkOpen(c, o) {
		if (isOpen(c)) return true;
		genError(c, "not open", o);
		return false;	
	}
	function checkClosed(c, o) {
		if (!isOpen(c)) return true;
		genError(c, "not closed", o);
		return false;	
	}
	
	////////////////////////
	// applyOrders(c) : aplica c.orders a c
	//                  actualiza c.curState, c.curItems, c.curTsValid, c.itemsInHostTsNotSend
	// applyOrder(c,o, fChangeTs) : aplica la orden o a c,
	//                  fChangeTs : actualizar c.nChangeTs
	////////////////////////
	
	function applyOrder(c, o, fChangeTs) {
		function findIdxItemByIdSat(id) {
			//id = getIdItemSat(c, id); // ???? ya es idSat
			for (var i=0; i<c.curItems.length; i++) {
				if (c.curItems[i].id === id) return i;	
			}
			return -1;
		}
		if (!(Caja.isOpen())) {
			genError(c, "caja not open", o);
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
					genError(c, "rem idx", o);
					return false;	
				} 
				c.curItems.splice(idx,1);
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "mod":
				if (!checkOpen(c, o)) return false;
				var idx = findIdxItemByIdSat(o.data.id);
				if (idx === -1) {
					genError(c, "mod idx", o);
					return false;	
				} 
				$.extend(c.curItems[idx], o.data);
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "inc":
				if (!checkOpen(c, o)) return false;
				var idx = findIdxItemByIdSat(o.data.id);
				if (idx === -1) {
					genError(c, "inc idx", o);
					return false;	
				} 
				if (c.curItems[idx].n+o.data.incN < 0) {
					genError(c, "inc < 0", o);
					return false;	
				} 
				c.curItems[idx].n+=o.data.incN;
				//if (c.curItems[idx].n < 0) c.curItems[idx].n = 0; //????
				if (c.curTsValid) c.itemsInHostTsNotSend = true;
				break;
			case "abrir":
				if (!checkClosed(c, o)) return false;
				c.curStates = { fOpen: true, fCobrada: false };
				c.curProps = {};
				c.curTsValid = false;
				if (fChangeTs) c.nChangeTs++;
				c.curItems = [];
				break;
			case "cobrar":
				if (!checkOpen(c, o)) return false;
				c.curStates = { fOpen: false, fCobrada: true };
				break;
			case "borrar":
			case "cerrar":
				if (!checkOpen(c, o)) return false;
				c.curStates = { fOpen: false, fCobrada: true };
				c.curProps = {};
				c.curTsValid = false;
				if (fChangeTs) c.nChangeTs++;
				c.curItems = [];
				break;
			case "temporal":
			case "temporal_o_abrir":
				c.curStates = { fOpen: true, fCobrada: false };
				c.curProps = {};
				c.curTsValid = false;
				if (fChangeTs) c.nChangeTs++;
				c.curItems = [];
				break;
			case "setProp":
				$(true, c.curProps, o.data); // deep copy de prop 
				break;
		}
		return true;
	}
	
	function applyOrders(c) {
		if (c.errorState) return false;
		c.curTsValid = (c.ts != null);
//			c.validTransIds = true;
		c.curStates = $.extend({}, c.hostStates);
		c.curProps = $.extend({}, c.hostProps);
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
		if (idx != -1) return c.transIds.h[idx];  
		return idItem;  // en Host sera id < 0 ?
	}
	function getIdItemSat(c, idItem) {
		if (!c.curTsValid) return idItem;
		if (idItem < 0) return idItem;
		var idx = c.transIds.h.indexOf(idItem);
		if (idx != -1) return c.transIds.s[idx];  
		return idItem;  // no era un item creado por este sat => id > 0 
	}
	
	function append(C, item) {
		item.id = comandes[C.getId()].nextSatId--;
		if (item.n == null) item.n = 1;
		if (!addOrder(C, "app", $.extend({}, item))) return false;
		return item.id;
	}
	function remove(C, idItem) {
		return addOrder(C, "rem", {id: idItem});
	}
	function modify(C, idItem, modFields) {
		return addOrder(C, "mod", $.extend({}, modFields, {id: idItem}));
	}
	function increment(C, idItem, inc) {
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
	function setProp(C, name, value) {
		var prop = {}; prop[name] = value;
		return addOrder(C, "setProp", prop);
	}
	var AllC = [];
	
	Caja.addChangeHandler(function(autoChange) {
		if (autoChange && !Caja.isOpen()) {
			AllC.forEach(function(C) { C.changeHandler(); });
		}
	});
	
	// ???? Comanda oberta
	// id = Dcodi, TnumTaula (string)
	my.get = function(idComanda, changeHandler, errorHandler) {
		var C = {};

		C.getId = function() { return idComanda; }

		var valid = true;
		var savedIds = [];
		var savedNChangeTs = 0;
		function saveIdsSequence() {
			if (savedNChangeTs != comanda.nChangeTs) savedIds = [];
			savedNChangeTs = comanda.nChangeTs;
				
			var newIds = comanda.items.map(function(item) { return item.id; });
			for (var i=0; i<savedIds.length; i++) {
				if (newIds.indexOf(savedIds[i]) == -1) {
					newIds.splice((i == 0) ? 0 : newIds.indexOf(savedIds[i-1])+1, 0, savedIds[i]); 
				}
			}
			savedIds = newIds;
		}

		function _getComanda(idComanda) {
			var comanda = getComanda(idComanda);
			if (!Caja.isOpen() && comanda.isOpen) {
				comanda.isOpen = false;
				comanda.states.fOpen = false;
			} 
			return comanda;
		}
		
		var comanda = _getComanda(idComanda);
		C.changeHandler = function(autoChange) {
			if (!autoChange) actualizeComanda();
			if (changeHandler) 
				setTimeout(function() { changeHandler(C, autoChange); }, 0); // async
		}; 
		setChangeHandler(C, C.changeHandler);
		
		C.getErrorHandler = function() { return errorHandler; }
		C.getNChangeTs = function() { return comanda.nChangeTs; }
		C.getTs = function() { return comanda.ts; }
		
		
		function actualizeComanda() { 
			comanda = _getComanda(idComanda); 
			saveIdsSequence(); 
		}
		
		C.append = function(item) {
			var idItem = append(C, item); 
			if (idItem !== false) actualizeComanda();
			return idItem;
		}
		C.remove = function(idItem) {
			if (typeof idItem != "number") idItem = idItem.id; 
			var ret = remove(C, idItem);
			if (ret) actualizeComanda();
			return ret;
		}
		
		C.modify = function(idItem, modFields) {
			if (typeof idItem != "number") idItem = idItem.id; 
			var ret = modify(C, idItem, modFields);
			if (ret) actualizeComanda();
			return ret;
		}
		
		C.increment = function(idItem, inc) {
			if (typeof idItem != "number") idItem = idItem.id; 
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
		C.temporal_o_abrir = function(info) {
			var ret = temporal_o_abrir(C, info);
			if (ret) actualizeComanda();
			return ret;
		}
		C.printTicket = function(ts) {
			var ret = printTicket(C, ts);
			return ret;
		}
		C.setProp = function(name, value) {
			setProp(C, name, value);
			actualizeComanda();
		}
		
		C.getItems = function() {
			return comanda.items;	
		}
		C.getStates = function() {
			return comanda.states;	
		}
		C.getProps = function() {
			return comanda.props; 	
		}
		C.isOpen = function() {
			return comanda.isOpen;
		}
		
		function _getPosItem(idItem) {
			for (var i=0; i<comanda.items.length; i++) {
				if (comanda.items[i].id == idItem) return i;
			}
			return -1;
		}
		C.getItem = function(idItem) {
			var pos = _getPosItem(idItem);
			if (pos != -1) return comanda.items[pos];
			return null;
		}
		C.getPosItem = function(idItem) {
			var pos = _getPosItem(idItem);
			if (pos != -1) return pos;
			pos = savedIds.indexOf(idItem);
			if (pos == -1) return -1;
			for (var i=pos+1; i<savedIds.length; i++) {
				var pos2 = _getPosItem(savedIds[i]);
				if (pos2 != -1) return pos2;
			}
			for (var i=pos-1; i>=0; i--) {
				var pos2 = _getPosItem(savedIds[i]);
				if (pos2 != -1) return pos2+1;
			}
			return -1;
		}

		C.release = function() {
			release(C);
			AllC.splice(AllC.indexOf(C), 1);
			valid = false;
			// C.setChangeHandler(null);
		}
		
		AllC.push(C);
		
		return C;
	}
	
	var comHostToSat = {
		actualize : function(comdsH) { // ????
			comdsH.forEach(function (comdH) {
				if (comandes[comdH.id] == null) {
					createComanda(comdH.id);
				}
				var c = comandes[comdH.id];
				c.waitActualizationData = comdH;
				if (!processWaitActualization(c)) return; // hay error 
				if (!applyOrders(c)) return; // hay error
				programCallChangeHandler(c);
				return true;
			});
			return true;
		}
	}

	return comHostToSat;
}

window.optAgruparComanda_Default = {
	filter: function(item) { // true si pertenece a esta agrupación 
		return true;
	},
	group: function(gr_items, item) { // return idx donde insert item en grItemsDest, -1 sino se puede agrupar
		return -1;
	},
	canIncrement: function(gr_items, item) { // ret si item se puede añadir a algun grItemsDest sin crear ningun item nuevo solo incr.
		return false;
	},
	increment: function(gr_items, inc) { // ret array de increments correspondientes a cada item de grItemsDest
		return gr_items.map(function(el) {
			var incP = (el.n+inc >= 0) ? inc : -el.n;
			inc -= incP;
			return incP;
		});
	},
	remove_n0: true	 // eliminar grItems con n=0
}
/* opt : group
		 canIncrement
		 increment
		 remove_n0
*/
window.agruparComanda = function(opt, C_o_Items) {
	var my = {};
	
	var C;
	var itemsGr_All; // itemsGr y itemsGr_n0
	var itemsGr; // Array of { n, el, items }
	var itemsGr_n0; // Array of { n:0 }
	var itemsNotInGr; // Array of items (filter = false)
//	var C_getItems;
	var nextId = 1;
	
	// if (opt == null) opt = optAgruparComanda_Default;
	opt = $.extend({}, optAgruparComanda_Default, opt);

	if (!(C_o_Items instanceof Array)) C = C_o_Items;
	
/*	function _getItems() {
		// comanda reload array items if change
		if ((C && (C_getItems == C.getItems())) || (!C && C_getItems)) return;
		C_getItems = C ? C.getItems() : C_o_Items;
*/	my.reload = function() {	
		itemsGr_All = [];
		itemsNotInGr = [];
		var items = (C ? C.getItems() : C_o_Items).slice(0); // copy array
		for (var i=0; i<items.length; i++) {
			if (!opt.filter(items[i])) {
				itemsNotInGr.push(items[i]);
				items[i] = null;
			}
		}
		while(true) {
			for (var i=0; i<items.length; i++) {
				if (items[i] != null) break;
			}
			if (i == items.length) break; // while
			var gr = { n: items[i].n, items: [items[i]] }
			items[i] = null;
			for (i++; i<items.length; i++) {
				if (items[i] != null) {
					var pos = opt.group(gr.items, items[i]);
					if (pos >= 0) {
						gr.n += items[i].n;
						gr.items.splice(pos, 0, items[i]);
						items[i] = null;
					}
				}
			}
			gr.el = $.extend({}, gr.items[0], { n: gr.n });
			itemsGr_All.push(gr);
		}
		itemsGr = [];
		itemsGr_n0 = [];
		if (opt.remove_n0) {
			itemsGr_All.forEach(function(gr) {
				((gr.n <= 0) ? itemsGr_n0 : itemsGr).push(gr)
			});
		}
	}
	
	my.reload();
	
	my.getGrs = function(fReload) {
		if (fReload) my.reload();
		return itemsGr;
	}

	my.append = function(item) {
		// _getItems();
		if (opt.filter(item)) {
			for (var i=0; i<itemsGr_All.length; i++) {
				if (opt.canIncrement(itemsGr_All[i].items, item)) {
					var gr = itemsGr_All[i];
					if (my.increment(gr, item.n)) return gr;
					return false;
				}	
			}
		}
		// C_getItems = null;
		var ret;
		if (C) ret = C.append(item);
		else {
			item.id = nextId++;
			C_o_Items.push(item);
			ret = { items: [item] }; // return Gr
		}
		my.reload();
		return ret;
	}
	
	my.remove = function(gr) {
		var ret = true;
		// C_getItems = null;
		for (var i=0; i<gr.items.length; i++) {
			if (C) ret = C.remove(gr.items[i]) && ret;
			else {
				var idx = C_o_Items.indexOf(gr.items[i])
				if (idx >= 0) C_o_Items.splice(idx, 1);
			}
		}
		my.reload();
		return ret;
	}
	
	my.modify = function(gr, modFields) {
		var ret = true;
		// C_getItems = null;
		for (var i=0; i<gr.items.length; i++) {
			if (C) ret = C.modify(gr.items[i], modFields) && ret;
			else {
				var idx = C_o_Items.indexOf(gr.items[i])
				if (idx >= 0) $.extend(C_o_Items[idx], modFields);
			}
		}
		my.reload();
		return ret;
	}
	
	my.increment = function(gr, inc) {
		var ret = true;
		var incArray = opt.increment(gr.items, inc);
		// C_getItems = null;
		for (var i=0; i<gr.items.length; i++) {
			var incP = incArray[i];
			if ((incP != null) && (incP != 0)) {
				if (C) {
					if (C.increment(gr.items[i], incP)) {
						gr.n+=incP;
					} else ret = false;
				} else {
					var idx = C_o_Items.indexOf(gr.items[i])
					if (idx >= 0) C_o_Items[idx].n+=incP;
				}
			}
		}
		my.reload();
		return ret;
	}
	

	function _getPosItemInAll(idsItems, gr) {
		// _getItems();
		if (gr) {
			for (var i=0; i<gr.items.length; i++) {
				for (var j=0; j<itemsGr_All.length; j++) {
					if (itemsGr_All[j].items.indexOf(gr.items[i]) !== -1) return j;
				}
			}
		}
		for (var i=0; i<idsItems.length; i++) {
			var item = null;
			if (C) item = C.getItem(idsItems[i]);
			else {
				for (var j=0; j<C_o_Items.length; j++) {
					if (C_o_Items[j].id == idsItems[i]) {
						item = C_o_Items[j];
						break;
					}
				}
			}
			if (item == null) continue;
			
			for (var j=0; j<itemsGr_All.length; j++) {
				if (itemsGr_All[j].items.indexOf(item) !== -1) return j;
			}
		}
		return -1;
	} 

/*		} else {
		function _getPosItemInAll(idsItems, gr) {
			_getItems();
			if (gr) {
				for (var k=0; k<gr.items.length; k++) {
					for (var j=0; j<itemsGr_All.length; j++) {
						if (itemsGr_All[j].items.indexOf(gr.items[k]) !== -1) return j;
					}
				}
			}
			for (var k=0; k<idsItems.length; k++) {
				for (var j=0; j<itemsGr_All.length; j++) {
					for (var i=0; i<itemsGr_All[j].items.length; i++) {
						if (itemsGr_All[j].items[i].id == idsItems[k]) return j;
					}
				}
			}
			return -1;
		}
	}
*/
	// gr : null -> null
	//    : num  -> id en C
	//    : itemGroup : {n, el, items} -> group in agruparComanda
	//    : [id1, id2, .. ] -> array de ids en C == ids de itemGroup.item
	my.getGr = function(gr) {
		if (gr == null) return null;
		var idsItems, pos = -1, isGr = false;
		if ((typeof gr == "string") || (typeof gr == "number")) idsItems = [gr];
		else if (!(gr instanceof Array)) {
			isGr = true;
			idsItems = gr.items.map(function(item) { return item.id; });   
		} else idsItems = gr;
		var pos = _getPosItemInAll(idsItems, isGr ? gr : null);
		if (pos == -1) return null;
		if (opt.remove_n0 && (itemsGr_All[pos].n <= 0)) return null;
		return itemsGr_All[pos];
	}
	
	my.getPosGr = function(gr) {
		if (gr == null) return -1;
		var idsItems, pos = -1, isGr = false;
		if ((typeof gr == "string") || (typeof gr == "number")) idsItems = [gr];
		else if (!(gr instanceof Array)) {
			isGr = true;
			idsItems = gr.items.map(function(item) { return item.id; });   
		} else idsItems = gr;
		pos = _getPosItemInAll(idsItems);
		if (pos == -1) {
			if (C) pos = C.getPosItem(idsItems[0]);
			else {
				var ant, post;
				for (var i=0; i<C_o_Items.length; i++) {
					var id = C_o_Items[i].id;
					if ((id < idsItems[0]) && ((ant == null) || (ant<id))) ant = i; 
					if ((id > idsItems[0]) && ((post == null) || (post>id))) post = i; 
				}
				if (post != null) pos = post;
				else if (ant != null) pos = ant;
			}	
			if (pos == -1) return -1;
			for (var j=0; j<itemsGr_All.length; j++) {
				if (itemsGr_All[j].items.indexOf(C_o_Items[pos]) !== -1) {
					pos = j;
					break;
				}	
			}
		}
		if (!opt.remove_n0) return pos;
		for (var i=pos; i<itemsGr_All.length; i++) {
			if (itemsGr_All[i].n > 0) return itemsGr.indexOf(itemsGr_All[i]);	
		}
		for (var i=pos-1; i>=0; i--) {
			if (itemsGr_All[i].n > 0) return itemsGr.indexOf(itemsGr_All[i])+1;	
		}
		return -1;
	}

	my.equal = function(gr1, gr2) {
		if (gr1.items.length != gr2.items.length) return false;

		for (var i=0; i<gr1.items.length; i++) {
			if (gr2.items.indexOf(gr1.items[i]) == -1) break;
		}
		if (i==gr1.items.length) return true;
		
		var ids1 = gr1.items.map(function(item) { return item.id; });   
		var ids2 = gr2.items.map(function(item) { return item.id; });   

		for (var i=0; i<ids1.length; i++) {
			if (ids2.indexOf(ids1[i]) == -1) return false;
		}
		return true;
	}
	
	my.getItemsFromGr = function(gr) {
		return agruparComanda_getItemsFromGr(gr);
	}
	
	return my;
}

window.agruparComanda_getItemsFromGr = function(gr) {
	return gr.items;
}

window.idOrds = [1,2,3];
window.displayOrds = { 1: '1', 2: '2', 3: 'P' };
window.printerOrds = { 1: 'Primeros', 2: 'Segundos', 3: 'Postres'} ;


}); // add Scripts ComandesS

