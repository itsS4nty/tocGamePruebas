var ComandesH = function() {
	var my = {};
	
	var comandes = {}; // dictionary without key __proto__
	
	var changeHandlers = [];

	function runChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
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
	my.addChangeHandler = function(changeH) {
		changeHandlers.push(changeHandler);
	}
	
	var satellites = [];
	function findSat(idSat) {
		for (var i=0; i<satellites.length; i++) 
			if (satellites[i].id === idSat) return satellites[i];
		return null;	
	}

	function getComHandler(sat) {
		return function(ret) {
			//sat.waitResponse = false;
			if (sat.callbackInit != null) {
				var callback = sat.callbackInit;
				sat.callbackInit = null; 
				if (typeof(callback) === "function") callback();
				return;	
			}
//			doActualizationSat(sat);
		}
	}
	
	my.createSat = function(idSat, callbackInit) {
		var sat = findSat(idSat);
		if (sat != null) satellites.splice(satellites.indexOf(sat), 1);
		var newSat = {id: idSat, /*waitResponse: false,*/ callbackInit: callbackInit};
		newSat.actualize = { All : true, idsComanda: [] };
		newSat.comHandler = getComHandler(newSat);
		satellites.push(newSat);
		CH.createObject("Comandes", idSat, objSat, objHost, null, availableCommHandler);
		availableCommHandler(idSat);		
	};
	
	// actualize : { All: true, idsComanda:[] }
	function availableCommHandler(idSat) { // doActualizationSat
		var sat = findSat(idSat);
		if (sat.actualize.All) {
			sat.actualize.idsComanda = [];
			for (var id in comandes) {
				sat.actualize.idsComanda.push(id);	
			}
		}
		// construct qs
		var qs = [];
		sat.actualize.idsComanda.forEach(function(id) {
			var c = comandes[id];
			if (c != null) {
				var q = c; // ???? copy version modificada
				qs.push(q); 	
			}
		});
		
		if (qs.length > 0) { 	
			//sat.waitResponse = true;	
			CH.callFunction("Comandes", sat.idSat, "actualize",
							qs, sat.comHandler);
		}
		sat.actualize.All = false;
		sat.actualize.idsComanda = [];
	}
	
	function actualizeSat(idComanda, infoSat) { // ????
		satellites.forEach(function(sat) {
			if ((infoSat != null) && (infoSat.idSat === sat.idSat)) return;
			if (sat.actualize.idsComanda.indexOf(idComanda) === -1) 
				sat.actualize.idsComanda.push(idComanda);				
		});
	}

	function cobrar(c, infoSat) {
	
	}
	
	function isOpen(c) {
		return c.state === "open"; 	
	}
	function checkOpen(c, tsSat, answC) {
		if ((isOpen(c)) && (tsSat == c.ts)) return true;
		answC.er = "";
		return false;
	}
	function checkClosed(c, tsSat, answC) {
		if (!isOpen(c)) return true;
		answC.er = "";
		return false;
	}
	
	function getItemIdHost(transIds, idItem) {
		if (idItem > 0) return idItem;
		var idx = transIds.s.indexOf(idItem);
		if (idx !== -1) return transIds.h[idx];  
		return null;  
	}
	function findIdxItem(transIds, idItem) {
		idtem = getItemIdHost(transIds, idItem); 
		if (idItem == null) return -1;
		for (var i=0; i<c.items.length; i++) {
			if (c.items[i].id === id) return i;	
		}
		return -1;
	}
	function initComanda(c) {
		c.ts = Date.now();
		c.ver = 1;
		c.nextItemId = 1;
		c.state = "closed";
		c.items = [];
	}
	
	var objHost = {
		orders : function(infoSat, orders) {
			var answ = [];
			for (var j=0; j<orders.length; j++) {
				var cSat = orders[j];
				if (!(comandes.hasOwnProperty(cSat.id)) || (comandes[cSat.id] == null)) {
					comandes[cSat.id] = { id: cSat.id };
					initComanda(comandes[cSat.id]);
				}
				var c = comandes[cSat.id];
				var answC = {};
				var tsSat = cSat.ts;
				var sameVer = ((c.ts === cSat.ts) && (c.ver === cSat.ver));
				var transIds = { h:[], s:[] };
				for (var i=0; i<cSat.ord.length; i++) {
					var o = cSat.ord[i];	
					switch (o.cmd) {
						case "app": 
							if (!checkOpen(c, tsSat, answC)) break;
							var item = o.data;
							transIds.s.push(item.id);
							transIds.h.push(c.nextItemId++);
							break;
						case "rem":	
							if (!checkOpen(c, tsSat, answC)) break;
							var idx = findIdxItem(transIds, o.data.id);
							if (idx === -1) { answC.er = ""; break; }
							c.items.splice(idx, 1);
							break;
						case "mod":
							if (!checkOpen(c, tsSat, answC)) break;
							var idx = findIdxItem(transIds, o.data.id);
							if (idx === -1) { answC.er = ""; break; }
							o.data.id = getItemIdHost(transIds, o.data.id);
							$.extend(c.items[idx], o.data);
							break;
						case "inc":
							if (!checkOpen(c, tsSat, answC)) break;
							var idx = findIdxItem(transIds, o.data.id);
							if (idx === -1) { answC.er = ""; break;	}
							c.items[idx].n+=o.data.incN;
							// if (c.items[idx].n < 0) c.items[idx].n = 0; //????
							break;
						case "abrir":
							if (!checkClosed(c, tsSat, answC)) break;
							initComanda(c); // info Apertura en o.data.info
							c.state = "open";
							tsSat = c.ts;
							transIds = { h:[], s:[] };
							break;
						case "cobrar":
							if (!checkOpen(c, tsSat, answC)) break;
							if (o.data.ts != c.ts) { answC.er = ""; break; }
							c.state = "closed";
							transIds = { h:[], s:[] };
							cobrar(c, infoSat);
							break;
						case "borrar":
						case "cerrar":
							if (!checkOpen(c, tsSat, answC)) break;
							c.state = "closed";
							c.items = [];
							transIds = { h:[], s:[] };
							break;
						case "temporal":
							if (!checkClosed(c, tsSat, answC)) break;
							tsSat = c.ts;
							transIds = { h:[], s:[] };
							break;	
						case "temporal_o_abrir":
							if (!isOpen(c)) {
								initComanda(c); // info Apertura en o.data.info
								c.state = "open";
							}
							tsSat = c.ts;
							transIds = { h:[], s:[] };
							break;
					} // switch o.cmd
					if (answC[er] != null) {
						answC[idxError] = i;
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
				actualizeSat(cSat.id, infoSat);
				answ.push(answC);
			} // for orders
			// save in LS
			return answ;
		}
	}
	
	var objSat = function(host) {
		return createComandesS(host);	
	}
	
	return my;
}();

Scripts.add("ComandesS", function(window) {
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
				curTsValid : false, // false -> transIds no son validos
				nChangeTs : 0, // num change Ts (ts1->null), (ts1->ts2), (null->null)
				itemsInHostTsNotSend : false,
				timeoutIdCallChangeHandler : null,
				C_OrderGenerator : null,
				waitResponse : 0,
				waitActualizationData : null,
				errorState : false,
				pendingProcResp : null
			};
		}
		
		function getComanda(id) {
			if (!comandes.hasOwnProperty(id)) {
				createComanda(id);
			}
			// copy id,ts,verHost, tempSatus, extend tempItems
			var c = comandes[id];
			var comanda = { id: c.id, ts: c.ts, ver: c.ver, 
			                nChangeTs: c.nChangeTs, state:c.curState};
			comanda.items = extend(true, [], c.curItems);
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
		var delaySendOrdersToHost = 5000;
		var ordersToSend = null;
		var nextOrdersSendPending = false; // ???? 
		
		function sendOrdersToHost() {
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
						oSat.data = $.extend({}, ord.data);
						if (oSat.data.id != null) oSat.data.id = getItemIdHost(c, oSat.data.id);
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
				host.call("orders", ordersToSend, callbackSendOrdersToHost);
			}
			
			timeoutIdCom = null;
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
					stateHost : c.stateHost,
					itemsHost : c.itemsHost,
					transIds : c.transIds,
//					curTsValid : c.curTsValid,
					orders : c.orders
				}
				error = true;
			} 
			if (c.curTsValid && (c.ts != actData.ts)) c.nChangeTs++;
			c.ts = actData.ts;
			c.ver = actData.ver;
			c.stateHost = actData.state;
			c.itemsHost = actData.items;	 
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
			var controlHandler = o.C.getControlHandler();
			if (typeof controlHandler === "function") 
				setTimeout(controlHandler, 0, o.C, codError, o, c);	
		}
		function resumeError(C) {
			var c = comandes[C.getId()];
			c.errorState = false;
			if (c.pendingProcResp != null) {
				c.pendingProcResp();
				c.pendingProcResp = null;
				if (c.errorState) return false;
			}
			if (processWaitActualization(c)) return true; // no error y change programmed
			if (c.errorState) return false;
			if (!applyOrders(c)) return false;
			
			programCallChangeHandler(c, null);
			return true;
		}
		
		function callbackSendOrdersToHost(resps, er) {
			for (var i=0; i<resps.length; i++) {
				var idC = ordersToSend[i].id;
				var c = comandes[idC];
				c.waitResponse--;
				
				var procResp = (function (idComanda, a) {
					return function() {
						var c = comandes[idComanda];
						
						var ordsCorrect = (a.er != null) ? a.idxError : c.ordersSend.length;
						var c_tmp = {
							ts : c.ts,
							stateHost : c.stateHost,
							itemsHost : c.itemsHost,
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
							c.stateHost = c_tmp.curState;
							c.itemsHost = c_tmp.curItems;
						} else {
							c.stateHost = a.state;
							c.itemsHost = a.items;
						}	
						if (a.er != null) {
							c.ordersSend.splice(0, q.idxError);
							c.orders = c.ordersSend.concat(c.orders);
							genError(c, a.er, 0); 
							return false;
						} else {
							return (q.items != null);
						}
					}
				})(idC, resp[i]);

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
		function isOpen(id) {
			return comandes[id].curState === "open"; 	
		}
		function checkOpen(c, o) {
			if (isOpen(c.id)) return true;
			genError(c, "", o);
			return false;	
		}
		function checkClosed(c, o) {
			if (!isOpen(c.id)) return true;
			genError(c, "", o);
			return false;	
		}
		
		function applyOrder(c, o, fChangeTs) {
			function findIdxItemByIdSat(id) {
				//id = getItemIdSat(c, id); // ???? ya es idSat
				for (var i=0; i<c.curItems.length; i++) {
					if (c.curItems[i].id === id) return i;	
				}
				return -1;
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
				c.curItems[i] = $.extend({}, c.hostItems[i]); // copy itemsHost[i] to tempItems[i]
				c.curItems[i].id = getItemIdSat(c, c.curItems[i].id); 
				if (c.curItems[i].n == null) c.curItems[i].n = 1;
			}
			for (var i=0; i<c.orders.length; i++) {
				var o = orders[i];
				if (!applyOrder(c, o)) return false;
			}
			return true;
		}
		
		function getItemIdHost(c, idItem) {
			if (!c.curTsValid) return idItem;
			if (idItem > 0) return idItem;
			var idx = c.transIds.s.indexOf(idItem);
			if (idx !== -1) return c.transIds.h[idx];  
			return idItem;  // en Host sera id < 0
		}
		function getItemIdSat(c, idItem) {
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
		function abrir(C) {
			return addOrder(C, "abrir");
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
		function temporal_o_abrir(C) {
			return addOrder(C, "temporal_o_abrir");
		}

		// ???? Comanda oberta
		// id = Dcodi, TnumTaula (string)
		my.get = function(idComanda, changeHandler, controlHandler) {
			var C = {};
	
			var valid = true;
			var savedIds = [];
			function saveIdsSequence() {
				newIds = comanda.items.map(function(item) { return item.id; });
				for (var i=0; i<savedIds.length; i++) {
					if (newIds.indexOf(savedIdsOrder) === -1) {
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
			
			C.getId = function() { return idComanda; }
			C.getControlHandler = function() { return controlHandler; }
			C.getNChangeTs = function() { return comanda.nChangeTs; }
			
			C.getItemId = function(item) {
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
			
			C.abrir = function() {
				var ret = abrir(C);
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
				var ret = temporal_o_abrir(C);
				if (ret) actualizeComanda();
				return ret;
			}

			C.getItems = function() {
				return comanda.items;	
			}
			
			C.getState = function() {
				return comanda.state;	
			}
			
			C.isOpen = function() {
				return isOpen(idComanda);
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
			actualize : function(commsH) { // ????
				commsH.forEach(function (commH) {
					if (!comandes.hasOwnProperty(commH.id)) {
						createComanda(commH.id);
					}
					var c = comandes[commH.id];
					c.waitActualizationData = commH;
					processWaitActualization(c);
				});
				return true;
			}
		}

		return comHostToSat;
	}
	
	window.prefAgruparComanda_Venda = {
		group: function(grItems, item) {
			return -1;
		},
		append: function(grItems, item) {
			return -1;
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
		var itemsGr_All;
		var itemsGr; // [] -> { n, el, item }
		var items_n0; // [] -> { n:0 }
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
			items_n0 = [];
			if (pref.remove_n0) {
				itemsGr_All.forEach(function(gr) {
					((gr.n <= 0) ? items_n0 : itemsGr).push(gr)
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
			
		my.getItem = function(gr) {
			if (gr == null) return null;
			var idsItems = gr;
			if (typeof gr === "number") idsItems = [gr];
			if (!(gr instanceof Array)) 
				idsItems = gr.items.map(function(item) { return C.getIdItem(item); });   
			var pos = _getPosItemInAll(idsItems);
			if (pos === -1) return null;
			
			if (pref.remove_n0 && (itemsGr_All[pos].n <= 0)) return null;
			return itemsGr_All[pos];
		}
		
		my.getPosItem = function(gr) {
			if (gr == null) return -1;
			var idsItems = gr;
			if (typeof gr === "number") idsItems = [gr];
			if (!(gr instanceof Array)) 
				idsItems = gr.items.map(function(item) { return C.getIdItem(item); });   
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
});

