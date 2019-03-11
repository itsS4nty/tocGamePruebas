H.Scripts.add("cajaFuerteS", "L2", function() {

window.AppCajaFuerte = function() {
	var my = {};

	var div0 = $("<div>")._100x100();
	var div01 = $("<div>").absolutePos(0, 0, 100, layout.getHSubMenuPerc()).appendTo(div0);
	var div02 = $("<div>").absolutePos(0, layout.getHSubMenuPerc(), 100, 100).appendTo(div0);

	var paramsSubMenuScroll = {
		arrows : "_lr",
		getNItems : function() { return subMenus[S.subMenu].length; },
		getItem : function(idx) {
			var op = subMenus[S.subMenu][idx];
			var el = subMenuModel.clone(true).text(M(opSubMenu[op].text)).data("data", op);
			if (op === S.opSubMenuSel) el.addClass("g-state-active");
			return el;
		},
		nElScroll : 6
	};
	var subMenuModel = gButton().width("100%").addClass("g-state-default");

	var subMenuScroll = newGScroll(paramsSubMenuScroll);
	subMenuScroll.getDiv()._100x100().appendTo(div01);

	subMenuModel.click(function (e) {
		if (e.button !== 0) return;
		S.opSubMenuSel = $(this).data("data");
		subMenuScroll.redraw(subMenus[S.subMenu].indexOf(S.opSubMenuSel));
		opSubMenu[S.opSubMenuSel].run(mp);
	});
	
//	var D = {};
	var S = {};
	
	var opSubMenu = {
		borrarTickets : {
			text: "Esborrar Tickets",
			run: function(mp) { AppBorrarTickets.start(mp); },
			init: function(div) { AppBorrarTickets.init(div); }
		},
		salidaDinero : {
			text: "Sortida de diners",
			run: function(mp) { AppESDinero_O.start(mp); },
			init: function(div) { AppESDinero_O.init(div); }
		},
		entradaDinero : {
			text: "Entrada de diners",
			run: function(mp) { AppESDinero_A.start(mp); },
			init: function(div) { AppESDinero_A.init(div); }
		},
		cerrarCaja : {
			text: "Tancar Caixa",
			run: function(mp) { AppCerrarCaja.start(mp); },
			init: function(div) { AppCerrarCaja.init(div); }
		}
	};

	var subMenus = [
		[
			"borrarTickets",
			"salidaDinero",
			"entradaDinero",
			"cerrarCaja"
		]
	];
	
	my.init = function(div00, callbackInit) {
		div0.appendTo(div00).hide();
		
		for (var i in opSubMenu) {
			opSubMenu[i].init(div02);
		}
	};

//	var codiDep;
	var mp;
	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
//		var codiDep = mp.getCodiDepActual();
//		S = (D[codiDep] = (D[codiDep] || {}));
		S.subMenu = (S.subMenu || 0);
		S.opSubMenuSel = (S.opSubMenuSel || subMenus[S.subMenu][0]);	
		subMenuScroll.redraw(subMenus[S.subMenu].indexOf(S.opSubMenuSel));
		if (S.opSubMenuSel != null) opSubMenu[S.opSubMenuSel].run(mp); 
	};	
	
	return my;
}();


window.AppBorrarTickets = function() {
	var my = {};

//	var S = {};

	var div0 = $("<div>")._100x100();

	var ticketSelected;
	
	var dialog = newAlertDialog().appendTo(div0);
	function showDialogBorrarTicket() {
		dialog.header(M("Borrar?"))
	          .setButtons([M("Sí"), M("No")], 
			      function(text, i) { 
				      if (i==0) { borrarHandler(); }
	          }).show();
	}	
	
	var divBT = $("<div>")._100x100().css({ padding: SEP }).addClass("g-widget-content").appendTo(div0);
	var divBT2 = $("<div>").css({ position: "relative", height: "100%" }).appendTo(divBT);
	
	var paramsInfoTickScroll = {
		arrows : "_ud",
		getNItems : function() { return tickets.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementInfoTickScroll;
			var ticket = tickets[idx];
			var text = M("Num. Tick : ")+ticket.numTick+M("  Data : ")+ticket.date;
			var el = infoTickModel.clone(true).text(text).data("data", ticket);
			if (ticket === ticketSelected) el.addClass("g-state-active");
			return el;
		}
	};
	
	var infoTickModel = $("<div>").css({ boxSizing: "border-box", whiteSpace: "pre" })
	                              .addClass("g-state-default");
	var defaultElementInfoTickScroll = infoTickModel.clone(false).html("X"); 
	var infoTickScroll = newGScroll(paramsInfoTickScroll);
	infoTickScroll.getDiv().css({ width: "50%", height: "100%" }).appendTo(divBT2);

	infoTickModel.click(function (e) {
		if (e.button !== 0) return;
		ticketSelected = $(this).data("data");
		redraw();
	});	

	// ???????????

	var paramsPreviewTickScroll = {
		arrows : "_ud",
		getNItems : function() { return prevLines.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementPreviewTickScroll;
			return previewTickModel.clone(false).text(prevLines[idx]);
		}
	};

	var previewTickModel = $("<div>").css({ boxSizing: "border-box", whiteSpace: "pre" });
	var defaultElementPreviewTickScroll = previewTickModel.clone(false).html("X"); 
	var previewTickScroll = newGScroll(paramsPreviewTickScroll);
	previewTickScroll.getDiv().css({ position: "absolute", top: "0px", right: "0px", fontFamily: "monospace" })
	                          .appendTo(divBT2);
	
	var butBorrar = gButton().css({ position: "absolute", bottom: "0px", right: "0px" }).appendTo(divBT2);
	
	var resized = {};
	var numCarsTicket = 56;

	function borrarHandler(e) {
		if (ticketSelected != null)
			Caja.deleteTicket(ticketSelected);
	}
	
	butBorrar.click(function(e) {
		if (e.button !== 0) return;
		if (ticketSelected != null) {
			dialogBorrarTicket.text(M("Borrar Ticket n:")+ticketSelected.numTick);
			dialogBorrarTicket.show();
		}
	});
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Caja.addChangeHandler(function() {
			tickets = Caja.getTickets();
			if (ticketSelected) {
				for (var i=0; i<tickets.length; i++) {
					if ((tickets[i].numTick === ticketSelected.numTick) &&
					    (tickets[i].date === ticketSelected.date)) {
						ticketSelected = tickets[i];
						break;
					}
				}
				if (i === tickets.length) ticketSelected = null;
			}
			if (!Caja.checkOpen(div0)) return;
			redraw(true);
		});

		Resize.add(function() {
			resized = {};
			resizeDivBT();
		});
	};

	
	var mp;
	var codiDep; 
	var tickets;
	var prevLines = [];
	
	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
		if (!Caja.checkOpen(div0)) return;
		codiDep = mp.getCodiDepActual();
		var dep = Dependentes.getByCodi(codiDep);
		if (dep.esResponsable) {
			ticketSelected = null;
			tickets = Caja.getTickets();
			redraw();
		} else {
			DivMensajesCaja.appendTo(div0, M("No pots realitzar\naquesta operacio"));
		}
	};
	function redraw(checkVis) {
		if (checkVis && (!divBT.isVisible())) return;
		divBT.showAlone();
		butBorrar.text(M("Borrar ticket"));
		if (tickets.indexOf(ticketSelected) === -1) ticketSelected = null;
		infoTickScroll.redraw(tickets.indexOf(ticketSelected));

		// preview Ticket

		prevLines = [];
		if (ticketSelected) {
			var D = {};
			D.date = ticketSelected.date;
			D.numTick = ticketSelected.numTick;
			$.extend(D, ticketSelected.info);
			D.currencySymbol = "€"; 
			
			var str;
			["header", "ticket", "total"].forEach(function(sec) {
				for (var i=0; (str=PrintTicket.getLine(sec, i, D, numCarsTicket)) != null; i++) {
					prevLines.push(str);
				}
			});
			butBorrar.removeAttr("disabled");
		} else {
			butBorrar.attr("disabled", "disabled");
		}
		if (prevLines.length === 0) {
			prevLines.push(" ");        // para calcular fuente en resize  
		}
		previewTickScroll.redraw(0);
	
		resizeDivBT();
	}
	
	function resizeDivBT() {
		if (resized.divBT) return;
		if (!divBT.isVisible()) return;
		var w0 = divBT2.iWidth(), h0 = divBT2.iHeight();
		var w2 = infoTickScroll.getDiv().oWidth();
		butBorrar.oWidth(w0-w2-SEPpx);
		infoTickScroll.redraw();
		previewTickScroll.getDiv().oWidth(w0-w2-SEPpx);
		previewTickScroll.getDiv().oHeight(h0-butBorrar.oHeight()-SEPpx);
		previewTickScroll.forceRedraw();
		var el = previewTickScroll.getEl(0);
		var saveText = el.text();
		var str = ""; while(str.length<numCarsTicket) str += " ";
		var divScroll = previewTickScroll.getDiv();
		el.text(str).css({ display: "inline-block", width: "auto" });
		var w0 = divScroll.iWidth();
		var fs = 4;
		do {
			divScroll.css({ fontSize : (++fs)+"px" });
		} while (el.oWidth() <= w0);
		fs--;
		divScroll.css({ fontSize : fs+"px" });
		el.text(saveText).css({ display: "block" });
		previewTickScroll.forceRedraw();
		resized.divBT = true;
	}
	
	return my;
}();

function newAppESDinero(tipo) {
	var my = {};

//	var S = {};
	
	var div0 = $("<div>")._100x100();
	var divES = $("<div>")._100x100().css({ padding: SEP }).addClass("g-widget-content").appendTo(div0);
	var divES2 = $("<div>").css({ position: "relative", height: "100%", overflow: "hidden" }).appendTo(divES);

	var conceptoSelected;
	var importe;
	var impNumeric;
	
	var paramsConceptosScroll = {
		arrows : "_ud",
		getNItems : function() { return conceptos.length+1; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementConceptosScroll;
			var concepto = ((idx>=1) ? conceptos[idx-1] : null);
			var el = conceptosModel.clone(true).text(concepto||M("Altres")).data("concepto", concepto);
			if (concepto == conceptoSelected) el.addClass("g-state-active");
			return el;
		}
	};

	var conceptosModel = $("<div>").css({ boxSizing: "border-box" }).addClass("g-state-default");
	var defaultElementConceptosScroll = conceptosModel.clone(false).html("X<br>X"); 
	var conceptosScroll = newGScroll(paramsConceptosScroll);
	conceptosScroll.getDiv().css({ width: "50%", height: "100%" }).appendTo(divES2);

	conceptosModel.click(function (e) {
		if (e.button !== 0) return;
		conceptoSelected = $(this).data("concepto");
		redrawES();
	});

	var divIOK = $("<div>").css({ position: "absolute", right: "0px" }).appendTo(divES2);
	var divImport = $("<div>").css({ border: "1px solid black", textAlign: "right", fontFamily: "monospace", fontSize: "200%",
	                                 boxSizing: "border-box", width: "100%", marginBottom: SEP }).appendTo(divIOK);
	var butOK = gButton().css({ width: "100%" }).appendTo(divIOK);
	var divTecNum = $("<div>").css({ position: "absolute", fontFamily: "monospace", bottom: "0px", right: "0px" })
	                          .appendTo(divES2);

	var paramsAntApuntesScroll = {
		arrows : "_ud",
		getNItems : function() { return apuntes.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementAntApuntesScroll;
			var ap = apuntes[idx];
			var text = formatImport(ap.imp, true).fillSpaceL(9)+" "+ap.motiu; 
			return antApuntesModel.clone(false).text(text);
		}
	};
			
	var antApuntesModel = $("<div>").css({ boxSizing: "border-box", 
	                                       fontFamily: "monospace", whiteSpace: "pre", overflow: "hidden" });
	var defaultElementAntApuntesScroll = antApuntesModel.clone(false).html("X");						  
	var antApuntesScroll = newGScroll(paramsAntApuntesScroll);
	antApuntesScroll.getDiv().css({ position: "absolute", top: "0px", right: "0px" }).appendTo(divES2);

	
	var divK = $("<div>").css({ position: "relative", height: "100%" }).appendTo(div0);
	var divI = $("<div>").css({ textAlign: "center", padding: SEP }).appendTo(divK);
	var input = $("<input type='text' size='30'>").appendTo(divI);
	var keyboard = new Keyboard();
	keyboard.getDiv().css({position: "absolute", margin: "0px "+SEP+" "+SEP+" "+SEP}).appendTo(divK);
	keyboard.setInput(input);
	keyboard.setCallback(function(m) {
		switch(m) {
			case "enter" :
				impNumeric = parseImport(importe);
				Caja.generateApunte(tipo, (tipo === "O") ? -impNumeric : impNumeric, input.val(), codiDep);
				mp.finApp();
				break;				
			case "cancel" :
				redrawES();
				break;
		}
	});

	var butNModel = gButton().css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		if (e.button !== 0) return;
		var val = $(this).data("data");
		switch(val) {
			case "B": 
				importe = "0";
				break;
			case ".":
				if (importe.indexOf(".") == -1) {
					importe += ".";
				}
				break;
			default:
				var coma = importe.indexOf(".");
				if (coma != -1) {
					if (importe.length-coma < 1+2) importe += val; 	
				} else {
					if (importe == "0") importe = "";
					if (importe.length < 10) importe += val;
				}
		}
		divImport.text(importe);
	});

	var butT=[[7,8,9],[4,5,6],[1,2,3],[".",0,'B']];
	for (var y=0; y<butT.length; y++) {
		var div2 = $("<div>").appendTo(divTecNum);
		for (var x=0; x<butT[y].length; x++) {
			butNModel.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
		}
	}
	
	var resized = {};

	function showKeyboard() {
		divK.showAlone();
		input.val("");
		keyboard.reset();
		resizeDivK();
	}

	butOK.click(function (e) {
		if (e.button !== 0) return;
		impNumeric = parseImport(importe);
		if (impNumeric > 0) {
			if (conceptoSelected == null) {
				showKeyboard();
			} else {
				Caja.generateApunte(tipo, (tipo == "O") ? -impNumeric : impNumeric, conceptoSelected, codiDep);
				mp.finApp();	
			}
		}
	});
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Caja.addChangeHandler(function() {
			apuntes = Caja.getApuntes(tipo);
			if (!Caja.checkOpen(div0)) return;
			redrawES(true);
		});

		ConceptosEntrega.addChangeHandler(function() {
			conceptos = ConceptosEntrega.get(tipo);
			redrawES(true);
		});
		
		Resize.add(function() {
			resized = {};
			resizeDivES();
			resizeDivK();
		});
	};
	
	var mp;
	var codiDep; 
	var conceptos;
	var apuntes; 
	
	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
		if (!Caja.checkOpen(div0)) return;
		codiDep = mp.getCodiDepActual();
		var dep = Dependentes.getByCodi(codiDep);
		if (dep.esResponsable) {
			conceptoSelected = null;
			importe = "0";
			conceptos = ConceptosEntrega.get(tipo);
			apuntes = Caja.getApuntes(tipo);
			redrawES();
		} else {
			DivMensajesCaja.appendTo(div0, M("No pots realitzar\naquesta operacio"));
		}
	};
	function redrawES(checkVis) {
		if (checkVis && (!divES.isVisible())) return;
		divES.showAlone();
		butOK.text(M("OK"));
		conceptosScroll.redraw(conceptos.indexOf(conceptoSelected));
		antApuntesScroll.redraw(0);
		divImport.text(importe);
		resizeDivES();
	}
	function resizeDivES() {
		if (resized.divES) return;
		if (!divES.isVisible()) return;
		var w0 = divES2.iWidth(), h0 = divES2.iHeight();
		var tT = divTecNum.get(0).offsetTop;
		conceptosScroll.redraw();
		var wc = conceptosScroll.getDiv().oWidth();
		antApuntesScroll.getDiv().oWidth((w0-wc)-SEPpx);
		divIOK.oWidth((w0-wc)-SEPpx);
		divIOK.css({ bottom: ((h0-tT)+SEPpx)+"px" });
		antApuntesScroll.getDiv().css({ bottom: ((h0-divIOK.get(0).offsetTop)+SEPpx)+"px" });
		antApuntesScroll.forceRedraw();
		resized.divES = true;
	}
	function resizeDivK() {
		if (resized.divK) return;
		if (!divK.isVisible()) return;
		var w0 = divK.width(), h0 = divK.height();
//		input.css({left: "0px", width: w0+"px"});
		keyboard.absolutePosPx(0, divI.oHeight(), w0, h0);
		resized.divK = true;
	}
	
	return my;
};

window.AppESDinero_O = newAppESDinero("O");
window.AppESDinero_A = newAppESDinero("A");

window.AppCerrarCaja = function() {
	var my = {};

	var S = null;

	var canvi = newSubAppCanviCaja();

	var div0 = $("<div>")._100x100();
	var divCerrar = canvi.getDiv().appendTo(div0);
	var butCanviCorrecte = gButton().css({position: "absolute", width: "100%"})
	                                .appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		if (e.button !== 0) return;
		Caja.cerrar(S.canvi, codiDep);
		restart();
	});
	
	var resized = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Caja.addChangeHandler(function() {
			Caja.checkOpen(div0);
		});

		Resize.add(function() {
			resized = {};
			resizeDivCerrar(); 
		});
	};

	var mp;
	var codiDep; 

	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
		if (!Caja.checkOpen(div0)) return;
		codiDep = mp.getCodiDepActual();
		var dep = Dependentes.getByCodi(codiDep);
		if (dep && dep.esResponsable) {
			divCerrar.showAlone();
			if (S == null) { 
				S = {
					canvi : Caja.getCanvi(), // copy array
					selected : 0
				};
			}
			S.primeraTecla = true;
			canvi.start(S);
			resizeDivCerrar();
		} else {
			DivMensajesCaja.appendTo(div0, M("No pots tancar\nla Caixa"));
		}
	};
	function restart() {
		my.start(mp);
	}
	function resizeDivCerrar() {
		if (resized.divCerrar) return;
		if (!divCerrar.isVisible()) return;
		butCanviCorrecte.text(M("Canvi Correcte"));
		canvi.resize();
		butCanviCorrecte.css({ top: (6*SEPpx)+"px" });
		resized.divCerrar = true;
	}
	
	return my;
}();

}); // add Scripts cajaFuerte


	