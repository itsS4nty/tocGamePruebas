var procesoCajaFuerte = function() {
	var my = {};

	var div0 = div100x100();
	var div01 = positionDiv(null, 0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = positionDiv(null, 0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);
	var subMenuScroll = new myScroll("_lr", 6);
	div100x100(subMenuScroll.getDiv()).appendTo(div01);
	//subMenuScroll.removeAll();
	var D = {};
	
	var opSubMenu = {
		borrarTickets : {
			text: "Esborrar Tickets",
			run: function() { procesoBorrarTickets.start(); },
			init: function() { procesoBorrarTickets.init(div02); },
		},
		salidaDinero : {
			text: "Sortida de diners",
			run: function() { procesoESDinero.start("O"); },
			init: function() { procesoESDinero.init(div02); },
		},
		entradaDinero : {
			text: "Entrada de diners",
			run: function() { procesoESDinero.start("A"); },
			init: function() { procesoESDinero.init(div02); },
		},
		cerrarCaja : {
			text: "Tancar Caixa",
			run: function() { procesoCerrarCaja.start(); },
			init: function() { procesoCerrarCaja.init(div02); },
		},
	};

	var subMenus = [
		[
			opSubMenu.borrarTickets,
			opSubMenu.salidaDinero,
			opSubMenu.entradaDinero,
			opSubMenu.cerrarCaja,
		]
	];
	
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		for (var i in opSubMenu) {
			if (opSubMenu.hasOwnProperty(i)) opSubMenu[i].init();
		}
	};

	var elSubMenuSel = null;
	
	function subMenuHandler(e) {
		if (elSubMenuSel != null) elSubMenuSel.removeClass("ui-state-active");
		elSubMenuSel = $(this).addClass("ui-state-active");
		D.optSubMenuSelected = $(this).data("data");
		D.optSubMenuSelected.run();
	}
	var subMenuModel = $("<button>").css({width:"100%", height:"100%"})
	                                .addClass("ui-state-default").click(subMenuHandler);
	
	my.start = function(dep) {
		divShow(div0);
		dep = dep || DepActives.getActual();
		D = DepActives.getDatosProceso("cajaFuerte", dep);
		D.subMenu = (D.subMenu || subMenus[0]);
		D.optSubMenuSelected = (D.optSubMenuSelected || D.subMenu[0]);	
		subMenuScroll.removeAll();
		elSubMenuSel = null;
		for (var i=0, pos = null; i<D.subMenu.length; i++) {
			var op = D.subMenu[i];
			var el = subMenuModel.clone(true).text(op.text).data("data", op).appendTo(subMenuScroll.newElement());
			if (op == D.optSubMenuSelected) {
				el.addClass("ui-state-active");
				pos = i;
				elSubMenuSel = el;
			}
		}
		if (pos != null) subMenuScroll.scrollTo(pos, true);
		subMenuScroll.redraw();
		if (D.optSubMenuSelected != null) D.optSubMenuSelected.run(); 
	};	
	
	return my;
}();


var procesoBorrarTickets = function() {
	var my = {};

	var S = {};
	var init = false;
	
	var conceptosEntrega = { O: [], A: [] };

	var div0 = div100x100();
	var divBT = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divBT2 = $("<div>").css({ position: "relative", height: "100%" }).appendTo(divBT);
	var modelInfoTScroll = $("<div>").css({ boxSizing: "border-box", height: "100%", whiteSpace: "pre" })
	                                 .addClass("ui-state-default");
	var defaultElementInfoTScroll = modelInfoTScroll.clone(false).html("X"); 
	var infoTScroll = new myScroll("_ud", defaultElementInfoTScroll);
	infoTScroll.getDiv().css({ width: "50%" }).appendTo(divBT2);
	var butBorrar = $("<button>").text("Borrar ticket")
	                             .css({ position: "absolute", top: "0px", right: "0px" }).appendTo(divBT2);
	
	var fResize = {};

	var elInfoTSel = null;
	function infoTHandler(e) {
		if (elInfoTSel != null) elInfoTSel.removeClass("ui-state-active");
		elInfoTSel = $(this).addClass("ui-state-active");
		S.ticketSelected = $(this).data("data");
		butBorrar.removeAttribute("disabled");
	}
	modelInfoTScroll.click(infoTHandler);
	
	function borrarHandler(e) {
		if (S.ticketSelected != null) {
			var c = Caja.get();
			c.tickets.splice(c.tickets.indexOf(S.ticketSelected),1);
			Caja.set(c);
			var date = S.ticketSelected.date;
			var numTick = S.ticketSelected.numTick;
			S.ticketSelected = null;
			redraw();
			var hv = DB.preOpenMensual(date, "V_Venuts_");
			var ha = DB.preOpenMensual(date, "V_Anulats_");
			var db = DB.open(hv.dbName);  // hv.dbName == ha.dbName
			db.transaction(function (tx) {
				var stat = "SELECT * FROM "+hv.tableName+" WHERE ([Data] = ?) AND ([Num_tick] = ?)";
				tx.executeSql(stat, [date, numTick], function(tx, r) {
					DB.sincroCreate(tx, ha.tableName,
							   "[Botiga] float, [Data] datetime , "
							  +"[Dependenta] float, [Num_tick] float, "
							  +"[Estat] nvarchar(25), [Plu] float, "
							  +"[Quantitat] float, [Import] float, "
							  +"[Tipus_venta] nvarchar(25), [FormaMarcar] nvarchar(255), "
							  +"[Otros] nvarchar(255), ");
					for (var i=0; i<r.rows.length; i++) {
						var t = r.rows.item(i);
						var fieldNames = "", values = [];
						for (var p in t) {
							if ((t.hasOwnProperty(p)) && (!DB.isSincroField(p))) {
								fieldNames+="["+p+"], ";
								values.push(t[p]);	
							}
						}
						DB.sincroInsert(tx, ha.tableName, fieldNames, values, ha.mark);
					}
				});
				DB.sincroDelete(tx, hv.tableName, "([Data] = ?) AND ([Num_tick] = ?)", 
				                [date, numTick], hv.mark );
			});
		}
	}
	butBorrar.click(borrarHandler);
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Resize.add(function() {
			fResize = {};
			resizeDivBT();
		});
	};
	
	var dep; 
	my.start = function(_dep) {
		divShow(div0);
		if (!Caja.get().oberta) {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		} else {
			dep = _dep || DepActives.getActual();
			if (dep.fEsResponsable) {
				S = {};
				S.ticketSelected = null;
				redrawBT();
				resizeDivBT();
			} else {
				DivMensajesCaja.appendTo(div0, "No pots realitzar\naquesta operacio");
			}
		}
	};
	function resizeDivBT() {
		if (fResize.divBT === false) return;
		if (!isDivVisible(divBT)) return;
		var w0 = getIW(divBT2), h0 = getIH(divBT2);
		var w2 = getOW(infoTScroll.getDiv());
		setOW(butBorrar, w0-w2-SEPpx);
		infoTScroll.redraw();
		fResize.divBT = false;
	}
	function redrawBT() {
		divShow(divBT);
		infoTScroll.removeAll();
		elInfoTSel = null;
		var tickets = Caja.get().tickets;
		for (var i=0, pos=null; i<tickets.length; i++) {
			var texto = "Num. Tick : "+ticktes[i].numTick+"  Data : "+tickets[i].date;
			var el = modelInfoTScroll.clone(true).text(texto).data("data", tickets[i])
			                                     .appendTo(infoTScroll.newElement());
			if (texto == S.ticketSelected) {
				el.addClass("ui-state-active");
				pos = i;
				elInfoTSel = el;
			}
		}
		if (pos != null) infoTScroll.scrollTo(pos, true);
		infoTScroll.redraw();
	}
	
	return my;
}();


var procesoESDinero = function() {
	var my = {};

	var D = {};
	var S = null;
	var init = false;
	
	var conceptosEntrega = { O: [], A: [] };

	var div0 = div100x100();
	var divES = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divES2 = $("<div>").css({ position: "relative", height: "100%" }).appendTo(divES);
	var modelConceptosScroll = $("<div>").css({ boxSizing: "border-box", height: "100%" }).addClass("ui-state-default");
	var defaultElementConceptosScroll = modelConceptosScroll.clone(false).html("X<br>X"); 
	var conceptosScroll = new myScroll("_ud", defaultElementConceptosScroll);
	conceptosScroll.getDiv().css({ width: "50%", height: "100%" }).appendTo(divES2);
	var divIOK = $("<div>").css({ position: "absolute" }).appendTo(divES2);
	var divImport = $("<div>").css({ border: "1px solid black", fontFamily: "monospace", fontSize: "200%",
	                                 boxSizing: "border-box", width: "100%", marginBottom: SEP }).appendTo(divIOK);
	var butOK = $("<button>").text("OK").css({ width: "100%" }).appendTo(divIOK);
	var divTecNum = $("<div>").css({ position: "absolute", fontFamily: "monospace" })
	                          .appendTo(divES2);

	var divK = $("<div>").css({ position: "relative", height: "100%" }).appendTo(div0);
	
	var input = $("<input type='text'>").css({ margin: SEP }).appendTo(divK);
	var keyboard = new Keyboard();
	keyboard.getDiv().css({position: "absolute"}).appendTo(divK);
	keyboard.setInput(input);
	keyboard.setCallback(function(m) {
		switch(m) {
			case "enter" :
				Caja.apunte(S.tipo, parseFloat(divImport.text()), input.val(), dep.dep.codi);
				menuPrincipal.finProceso();
				break;				
			case "cancel" :
				redrawES();
				break;
		}
	});

	function showKeyboard() {
		divShow(divK);
		keyboard.reset();
	}

	var modelButN = $("<button>").css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		var val = $(this).data("data");
		switch(val) {
			case "B": 
				S.importe = "";
				break;
			case ".":
				if (S.importe.indexOf(".") == -1) {
					if (S.importe.length == 0) S.importe = "0";
					S.importe += ".";
				}
				break;
			default:
				var coma = S.importe.indexOf(".");
				if (coma != -1) {
					if (S.importe.length-coma < 1+2) S.importe += val; 	
				} else {
					if (!((val == 0) && (S.importe.length == 0)) &&
						 (S.importe.length < 10))
						S.importe += val;
				}
		}
		divImport.text(S.importe);
	});

	var butT=[[7,8,9],[4,5,6],[1,2,3],[".",0,'B']];
	for (var y=0; y<butT.length; y++) {
		var div2 = $("<div>").appendTo(divTecNum);
		for (var x=0; x<butT[y].length; x++) {
			modelButN.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
		}
	}
	
	var fResize = {};

	var elConceptosSel = null;
	function conceptosHandler(e) {
		if (elConceptosSel != null) elConceptosSel.removeClass("ui-state-active");
		elConceptosSel = $(this).addClass("ui-state-active");
		S.textoSelected = $(this).data("texto");
	}
	modelConceptosScroll.click(conceptosHandler);
	
	function okHandler(e) {
		var i = parseFloat(divImport.text());
		if (i>0) {
			if (S.textoSelected == null) {
				showKeyboard();
			} else {
				apunte(S.textoSelected, inp);
//				menuPrincipal.finProceso();	
			}
		}
	}
	butOK.click(okHandler);
	
	my.init = function(div00) {
		if (init) return;
		div0.appendTo(div00).hide();
		obtenerDB();
		callbackComunicacion.add(function() { obtenerDB(); });

		Resize.add(function() {
			fResize = {};
			resizeDivES();
			resizeDivK();
		});
		init = true;
	};
	
	function obtenerDB() {
		var db = DB.openPrincipal();
		db.transaction(function (tx) {
			var stat = "SELECT tipo as tipo, texto as texto FROM ConceptosEntrega";
			tx.executeSql(stat, [], function (tx,res) {
				conceptosEntrega = { O: [], A: [] };
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					(conceptosEntrega[row.tipo] = (conceptosEntrega[row.tipo] || [])).push(row.texto);	
				}
				if (isDivVisible(divES)) redraw();
			});
		});
	}
	var dep; 
	my.start = function(tipo, _dep) {
		divShow(div0);
		if (!Caja.get().oberta) {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		} else {
			dep = _dep || DepActives.getActual();
			if (dep.fEsResponsable) {
				S = (D[tipo] = (D[tipo] || {}));
				S.tipo = tipo;
				S.textoSelected = null;
				S.primeraTecla = true;
				S.importe = "0";
				redrawES();
				resizeDivES();
			} else {
				DivMensajesCaja.appendTo(div0, "No pots realitzar\naquesta operacio");
			}
		}
	};
	function resizeDivES() {
		if (fResize.divES === false) return;
		if (!isDivVisible(divES)) return;
		divTecNum.css({ right: SEPpx+"px", bottom: SEPpx+"px" });
		var w0 = getIW(divES2), h0 = getIH(divES2);
		var lT = divTecNum.get(0).offsetLeft, tT = divTecNum.get(0).offsetTop;
		divIOK.css({ top: "0px", left: lT+"px", width: (w0-SEPpx-lT)+"px" });
		conceptosScroll.redraw();
		fResize.divES = false;
	}
	function resizeDivK() {
		if (fResize.divK === false) return;
		if (!isDivVisible(divK)) return;
		var w0 = divK.width(), h0 = divK.height();
		input.css({left: "0px", width: w0+"px"});
		positionKeyboard(keyboard, 0, h0-h0*Config.hKeyboardEntrar, w0*Config.wKeyboardEntrar, h0);
		fResize.divK = false;
	}
	function redrawES() {
		divShow(divES);
		conceptosScroll.removeAll();
		elConceptosSel = null;
		for (var i=0, pos=null; i<conceptosEntrega[S.tipo].length+1; i++) {
			var texto = ((i>=1) ? conceptosEntrega[S.tipo][i-1] : null);
			var el = modelConceptosScroll.clone(true).text(texto||"Altres").data("texto", texto)
			                                         .appendTo(conceptosScroll.newElement());
			if (texto == S.textoSelected) {
				el.addClass("ui-state-active");
				pos = i;
				elConceptosSel = el;
			}
		}
		if (pos != null) conceptosScroll.scrollTo(pos, true);
		conceptosScroll.redraw();
		divImport.text(S.importe);
	}
	
	return my;
}();


var procesoCerrarCaja = function() {
	var my = {};

	var S = null;

	var canvi = newProcesoCanviCaja();

	var div0 = div100x100();
	var divCerrar = canvi.getDiv().appendTo(div0);
	var butCanviCorrecte = $("<button>").css({position: "absolute", width: "100%"})
	                                    .text("Canvi Correcte").appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		Caja.cerrar(S.canvi, dep.dep.codi);
		S = null;
		my.start(dep);
	});
	
	var fResize = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Resize.add(function() {
			fResize = {};
			resizeDivCerrar(); 
		});
	};
	var dep; 
	my.start = function(_dep) {
		divShow(div0);
		if (!Caja.get().oberta) {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		} else {
			dep = _dep || DepActives.getActual();
			if (dep.fEsResponsable) {
				divShow(divCerrar);
				if (S == null) { 
					S = {
						canvi : Caja.get().canvi.slice(0),
						selected : 0,
					};
				}
				S.primeraTecla = true;
				canvi.start(S);
				resizeDivCerrar();
			} else {
				DivMensajesCaja.appendTo(div0, "No pots tancar\nla Caixa");
			}
		}
	};
	function resizeDivCerrar() {
		if (fResize.divCerrar === false) return;
		if (!isDivVisible(divCerrar)) return;
		canvi.resize();
		butCanviCorrecte.css({ top: (6*SEPpx)+"px" });
		fResize.divCerrar = false;
	}
	
	return my;
}();

