var procesoCajaFuerte = function() {
	var my = {};

	var div0 = div100x100();
	var div01 = positionDiv(null, 0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = positionDiv(null, 0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);
	var subMenuScroll = new gScroll("_lr", 6);
	div100x100(subMenuScroll.getDiv()).appendTo(div01);
	//subMenuScroll.removeAll();
	var D = {};
	var S = {};
	
	var opSubMenu = {
		borrarTickets : {
			text: "Esborrar Tickets",
			run: function() { procesoBorrarTickets.start(mp); },
			init: function() { procesoBorrarTickets.init(div02); },
		},
		salidaDinero : {
			text: "Sortida de diners",
			run: function() { procesoESDinero.start("O", mp); },
			init: function() { procesoESDinero.init(div02); },
		},
		entradaDinero : {
			text: "Entrada de diners",
			run: function() { procesoESDinero.start("A", mp); },
			init: function() { procesoESDinero.init(div02); },
		},
		cerrarCaja : {
			text: "Tancar Caixa",
			run: function() { procesoCerrarCaja.start(mp); },
			init: function() { procesoCerrarCaja.init(div02); },
		},
	};

	var subMenus = [
		[
			"borrarTickets",
			"salidaDinero",
			"entradaDinero",
			"cerrarCaja",
		]
	];
	
	my.init = function(div00, callbackInit) {
		div0.appendTo(div00).hide();
		
		for (var i in opSubMenu) {
			if (opSubMenu.hasOwnProperty(i)) opSubMenu[i].init();
		}
	};

	var elSubMenuSel = null;
	
	function subMenuHandler(e) {
		if (e.button !== 0) return;
		if (elSubMenuSel != null) elSubMenuSel.removeClass("ui-state-active");
		elSubMenuSel = $(this).addClass("ui-state-active");
		S.opSubMenuSel = $(this).data("data");
		opSubMenu[S.opSubMenuSel].run();
	}
	var subMenuModel = $("<button>").css({width:"100%", height:"100%"})
	                                .addClass("ui-state-default").click(subMenuHandler);
	
	function getDatosProceso() {
		var p = null;
		if (DepActual != null) p = "D_"+DepActual.codi; 
		else if (TaulaActual != null) p = "D_"+TaulaActual.nom; 
		S = (D[p] = (D[p] || {}));
	}

	var mp;
	my.start = function(_mp) {
		mp = _mp;
		divShow(div0);
		var dep = mp.getDepActual();
		if (dep != null) dep = dep.codi; 
		S = (D[dep] = (D[dep] || {}));
		S.subMenu = (S.subMenu || 0);
		S.opSubMenuSel = (S.opSubMenuSel || subMenus[S.subMenu][0]);	
		subMenuScroll.removeAll();
		elSubMenuSel = null;
		for (var i=0, pos = null; i<subMenus[S.subMenu].length; i++) {
			var op = subMenus[S.subMenu][i];
			var el = subMenuModel.clone(true).text(opSubMenu[op].text).data("data", op).appendTo(subMenuScroll.newElement());
			if (op == S.opSubMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				elSubMenuSel = el;
			}
		}
		if (pos != null) subMenuScroll.scrollTo(pos, true);
		subMenuScroll.redraw();
		if (S.opSubMenuSel != null) opSubMenu[S.opSubMenuSel].run(); 
	};	
	
	return my;
};


var procesoBorrarTickets = function() {
	var my = {};

	var S = {};

	var div0 = div100x100();

	var dialogBorrarTicket = createAlertDialog().header("Borrar?")
	                                            .setButtons(["Sí", "No"], function(text, i) { 
	                                                if (i==0) { borrarHandler(); }
	                                            });
	dialogBorrarTicket.getDiv().appendTo(div0);
	
	var divBT = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divBT2 = $("<div>").css({ position: "relative", height: "100%" }).appendTo(divBT);
	var modelInfoTScroll = $("<div>").css({ boxSizing: "border-box", height: "100%", whiteSpace: "pre" })
	                                 .addClass("ui-state-default");
	var defaultElementInfoTScroll = modelInfoTScroll.clone(false).html("X"); 
	var infoTScroll = new gScroll("_ud", defaultElementInfoTScroll);
	infoTScroll.getDiv().css({ width: "50%", height: "100%" }).appendTo(divBT2);
	var modelPreviewTScroll = $("<div>").css({ boxSizing: "border-box", height: "100%", whiteSpace: "pre" });
	var defaultElementPreviewTScroll = modelPreviewTScroll.clone(false).html("X"); 
	var previewTScroll = new gScroll("_ud", defaultElementPreviewTScroll);
	previewTScroll.getDiv().css({ position: "absolute", top: "0px", right: "0px", fontFamily: "monospace" })
	                       .appendTo(divBT2);
	
	var butBorrar = $("<button>").text("Borrar ticket")
	                             .css({ position: "absolute", bottom: "0px", right: "0px" }).appendTo(divBT2);
	
	var fResize = {};
	var numCarsTicket = 56;

	var elInfoTSel = null;
	function infoTHandler(e) {
		if (e.button !== 0) return;
		if (elInfoTSel != null) elInfoTSel.removeClass("ui-state-active");
		elInfoTSel = $(this).addClass("ui-state-active");
		S.ticketSelected = $(this).data("data");
		previewT();
		butBorrar.removeAttr("disabled");
	}
	modelInfoTScroll.click(infoTHandler);
	
	function borrarHandler(e) {
		if (S.ticketSelected != null) {
			if (!DB.inTransaction(true, true)) return;

			var sqlDate = DB.DateToSql(new Date());
			Caja.preSave(sqlDate, function() {
				var c = Caja.get();
				c.tickets.splice(c.tickets.indexOf(S.ticketSelected),1);
				c.clients--;
	//			Caja.set(c);
				var date = S.ticketSelected.date;
				var numTick = S.ticketSelected.numTick;
				DB.preOpenMensual(date, "V_Venut_", function(hv) {
					DB.preOpenMensual(date, "V_Anulats_", function(ha) {
						var db = DB.open(hv.dbName);  // hv.dbName == ha.dbName
						DB.transactionWithErr(db, function (tx) {
							var stat = "SELECT * FROM "+hv.tableName+" WHERE ([Data] = ?) AND ([Num_tick] = ?)";
							DB.exec(tx, stat, [date, numTick], function(tx, r) {
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
							var stat = "SELECT TOTAL([Import]) as total FROM "+hv.tableName+" WHERE ([Data] = ?) AND ([Num_tick] = ?)";
							DB.exec(tx, stat, [date, numTick], function(tx, r) { c.sumTick-=r.rows.item(0).total; });
							DB.sincroDelete(tx, hv.tableName, "([Data] = ?) AND ([Num_tick] = ?)", 
											[date, numTick], hv.mark);
							Caja.save(tx, c);
						}, function() { 
							DB.inTransaction(false);
							Caja.set(c);
							S.ticketSelected = null;
							redraw();
						});
					});
				});
			});
		}
	}
	
	butBorrar.click(function(e) {
		if (e.button !== 0) return;
		if (S.ticketSelected != null) {
			dialogBorrarTicket.text("Borrar Ticket n:"+S.ticketSelected.numTick);
			dialogBorrarTicket.show();
		}
	});
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Resize.add(function() {
			fResize = {};
			resizeDivBT();
		});
	};
	
	var mp;
	var dep; 
	my.start = function(_mp) {
		mp = _mp;
		divShow(div0);
		if (!Caja.get().oberta) {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		} else {
			dep = mp.getDepActual();
			if (dep.esResponsable) {
				S = {};
				S.ticketSelected = null;
				redraw();
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
		setOW(previewTScroll.getDiv(), w0-w2-SEPpx);
		setOH(previewTScroll.getDiv(), h0-getOH(butBorrar)-SEPpx);
		
		var el = previewTScroll.get(0);
		var removeAll = false;
		if (el == null) {
			el = previewTScroll.newElement();
			modelPreviewTScroll.clone(false).text("A").appendTo(el);
			removeAll = true;
		}
		var child = el.children();
		var saveText = child.text();
		var str = ""; while(str.length<numCarsTicket) str += " ";
		child.text(str).css({ display: "inline-block" });
		var w0 = getIW(el);
		var fs = Math.floor(w0/numCarsTicket);
		previewTScroll.getDiv().css({ fontSize : fs+"px" });
		if (getOW(child) < w0) {
			while (true) {
				fs++;
				previewTScroll.getDiv().css({ fontSize : fs+"px" });
				if (getOW(child) >= w0) break;   
			}
			fs--;
			previewTScroll.getDiv().css({ fontSize : fs+"px" });
		} else {
			fs--;
			while (fs > 1) {
				previewTScroll.getDiv().css({ fontSize : fs+"px" });
				if (getOW(child) < w0) break;
				fs--;   
			}
		}
		child.text(saveText).css({ display: "block" });
		if (removeAll) previewTScroll.removeAll();
		previewTScroll.redraw();
		fResize.divBT = false;
	}
	function redraw() {
		divShow(divBT);
		infoTScroll.removeAll();
		elInfoTSel = null;
		var tickets = Caja.get().tickets;
		for (var i=0, pos=null; i<tickets.length; i++) {
			var texto = "Num. Tick : "+tickets[i].numTick+"  Data : "+tickets[i].date;
			var el = modelInfoTScroll.clone(true).text(texto).data("data", tickets[i])
			                                     .appendTo(infoTScroll.newElement());
			if (tickets[i] == S.ticketSelected) {
				el.addClass("ui-state-active");
				pos = i;
				elInfoTSel = el;
			}
		}
		if (pos != null) {
			infoTScroll.scrollTo(pos, true);
			butBorrar.removeAttr("disabled");
			previewT();
		} else butBorrar.attr("disabled", "disabled");
		infoTScroll.redraw();
		previewTScroll.removeAll();
		previewTScroll.redraw();
	}
	function previewT() {
		var date = S.ticketSelected.date;
		var numTick = S.ticketSelected.numTick;
		var dbName = my.getMensualName(date);
		var tableName = my.getMensualTableName(date, tableName);

		var db = DB.open(dbName);  
		db.transaction(function (tx) {
			var stat = "SELECT [Dependenta] as dep, [Plu] as plu, [Quantitat] as cant, [Import] as import "
					  +"FROM ["+tableName+"] WHERE ([Data] = ?) AND ([Num_tick] = ?)";
			DB.exec(tx, stat, [date, numTick], function(tx, r) {
				if (r.rows.length > 0) {
					previewTScroll.removeAll();
					var D = {};
					D.date = date;
					var depT;
					//D.depNom = null;
					for (var i=0; (depT = Dependentes.getByIdx(i)) != null; i++) {
						if (r.rows.item(0).dep == depT.codi) break;
					}
					D.depNom = ((depT != null) && (depT.nom)) ? depT.nom : "";
					D.numTick = numTick;
					D.ticket = [];
					D.total = 0;
					for (var i=0; i<r.rows.length; i++) {
						var t = {};
						var row = r.rows.item(i);
						t.cantidad = row.cant;
						t.import = row.import;
						
						var art = null;
						for (var j=0; (art = DatosArticles.getArticleByIdx(j)) != null; j++) {
							if (art.codi == row.plu) break;
						}
						t.article = (art != null) ? art : { nom: "", preu: 0 };
						D.ticket.push(t);
						D.total += t.import;
					}
					D.total = normImport(D.total);
					D.currencySymbol = "€"; 
					var str;
					for (var i=0; (str=procesoVenda.getLineTicket("header", i, D, numCarsTicket)) != null; i++) {
						modelPreviewTScroll.clone(false).text(str).appendTo(previewTScroll.newElement());
					}
					for (var i=0; (str=procesoVenda.getLineTicket("ticket", i, D, numCarsTicket)) != null; i++) {
						modelPreviewTScroll.clone(false).text(str).appendTo(previewTScroll.newElement());
					}
					for (var i=0; (str=procesoVenda.getLineTicket("total" , i, D, numCarsTicket)) != null; i++) {
						modelPreviewTScroll.clone(false).text(str).appendTo(previewTScroll.newElement());
					}
					previewTScroll.redraw();
				}
			});
		});
	}
	return my;
};


var procesoESDinero = function() {
	var my = {};

	var D = {};
	var S = null;
	
	var div0 = div100x100();
	var divES = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divES2 = $("<div>").css({ position: "relative", height: "100%", overflow: "hidden" }).appendTo(divES);
	var modelConceptosScroll = $("<div>").css({ boxSizing: "border-box", height: "100%" }).addClass("ui-state-default");
	var defaultElementConceptosScroll = modelConceptosScroll.clone(false).html("X<br>X"); 
	var conceptosScroll = new gScroll("_ud", defaultElementConceptosScroll);
	conceptosScroll.getDiv().css({ width: "50%", height: "100%" }).appendTo(divES2);
	var divIOK = $("<div>").css({ position: "absolute", right: "0px" }).appendTo(divES2);
	var divImport = $("<div>").css({ border: "1px solid black", textAlign: "right", fontFamily: "monospace", fontSize: "200%",
	                                 boxSizing: "border-box", width: "100%", marginBottom: SEP }).appendTo(divIOK);
	var butOK = $("<button>").text("OK").css({ width: "100%" }).appendTo(divIOK);
	var divTecNum = $("<div>").css({ position: "absolute", fontFamily: "monospace", bottom: "0px", right: "0px" })
	                          .appendTo(divES2);
							  
	var modelAntApuntesScroll = $("<div>").css({ boxSizing: "border-box", height: "100%", 
	                                             fontFamily: "monospace", whiteSpace: "pre", overflow: "hidden" });
	var defaultElementAntApuntesScroll = modelAntApuntesScroll.clone(false).html("X");						  
	var antApuntesScroll = new gScroll("_ud", defaultElementAntApuntesScroll);
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
				var imp = parseImport(divImport.text());
				Caja.apunte(S.tipo, (S.tipo == "O") ? -imp : imp, input.val(), dep, function() {
					mp.finProceso();
				});
				break;				
			case "cancel" :
				redrawES();
				break;
		}
	});

	function showKeyboard() {
		divShow(divK);
		input.val("");
		keyboard.reset();
		resizeDivK();
	}

	var modelButN = $("<button>").css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		if (e.button !== 0) return;
		var val = $(this).data("data");
		switch(val) {
			case "B": 
				S.importe = "0";
				break;
			case ".":
				if (S.importe.indexOf(".") == -1) {
					S.importe += ".";
				}
				break;
			default:
				var coma = S.importe.indexOf(".");
				if (coma != -1) {
					if (S.importe.length-coma < 1+2) S.importe += val; 	
				} else {
					if (S.importe == "0") S.importe = "";
					if (S.importe.length < 10) S.importe += val;
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
		if (e.button !== 0) return;
		if (elConceptosSel != null) elConceptosSel.removeClass("ui-state-active");
		elConceptosSel = $(this).addClass("ui-state-active");
		S.textoSelected = $(this).data("texto");
	}
	modelConceptosScroll.click(conceptosHandler);
	
	function okHandler(e) {
		if (e.button !== 0) return;
		var imp = parseImport(divImport.text());
		if (imp > 0) {
			if (S.textoSelected == null) {
				showKeyboard();
			} else {
				Caja.apunte(S.tipo, (S.tipo == "O") ? -imp : imp, S.textoSelected, dep, function() {
					mp.finProceso();	
				});
			}
		}
	}
	butOK.click(okHandler);
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		Resize.add(function() {
			fResize = {};
			resizeDivES();
			resizeDivK();
		});
	};
	
	var dep; 
	var mp;
	my.start = function(tipo, _mp) {
		mp = _mp;
		divShow(div0);
		if (!Caja.get().oberta) {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		} else {
			dep = mp.getDepActual();
			if (dep.esResponsable) {
				S = (D[tipo] = (D[tipo] || {}));
				S.tipo = tipo;
				S.textoSelected = null;
//				S.primeraTecla = true;
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
		var w0 = getIW(divES2), h0 = getIH(divES2);
		var tT = divTecNum.get(0).offsetTop;
		conceptosScroll.redraw();
		var wc = getOW(conceptosScroll.getDiv());
		setOW(antApuntesScroll.getDiv(), (w0-wc)-SEPpx);
		setOW(divIOK, (w0-wc)-SEPpx);
		divIOK.css({ bottom: ((h0-tT)+SEPpx)+"px" });
		antApuntesScroll.getDiv().css({ bottom: ((h0-divIOK.get(0).offsetTop)+SEPpx)+"px" });
		antApuntesScroll.redraw();
		fResize.divES = false;
	}
	function resizeDivK() {
		if (fResize.divK === false) return;
		if (!isDivVisible(divK)) return;
		var w0 = divK.width(), h0 = divK.height();
//		input.css({left: "0px", width: w0+"px"});
		positionKeyboard(keyboard, 0, getOH(divI), w0, h0);
		fResize.divK = false;
	}
	function redrawES() {
		divShow(divES);
		conceptosScroll.removeAll();
		elConceptosSel = null;
		for (var i=0, pos=null; i<conceptosEntrega.get(S.tipo).length+1; i++) {
			var texto = ((i>=1) ? conceptosEntrega.get(S.tipo)[i-1] : null);
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
		antApuntesScroll.removeAll();
		var aps = Caja.get().apuntes[S.tipo] || [];
		for (var i=0; i<aps.length; i++) {
			var texto = fillSpaceL(formatImport(aps[i].imp, true), 9)+" "+aps[i].motiu; 
			modelAntApuntesScroll.clone(false).text(texto).appendTo(antApuntesScroll.newElement());
		}
		antApuntesScroll.redraw();
		divImport.text(S.importe);
	}
	
	return my;
};


var procesoCerrarCaja = function() {
	var my = {};

	var S = null;

	var canvi = newProcesoCanviCaja();

	var div0 = div100x100();
	var divCerrar = canvi.getDiv().appendTo(div0);
	var butCanviCorrecte = $("<button>").css({position: "absolute", width: "100%"})
	                                    .text("Canvi Correcte").appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		if (e.button !== 0) return;
		Caja.cerrar(S.canvi, dep, function() {
			S = null;
			restart();
		});
	});
	
	var fResize = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Resize.add(function() {
			fResize = {};
			resizeDivCerrar(); 
		});
	};
	var mp;
	var dep; 
	my.start = function(_mp) {
		mp = _mp;
		divShow(div0);
		if (!Caja.get().oberta) {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		} else {
			dep = mp.getDepActual();
			if (dep.esResponsable) {
				divShow(divCerrar);
				if (S == null) { 
					S = {
						canvi : Caja.get().canvi.slice(0), // copy array
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
	function restart() {
		my.start(mp);
	}
	function resizeDivCerrar() {
		if (fResize.divCerrar === false) return;
		if (!isDivVisible(divCerrar)) return;
		canvi.resize();
		butCanviCorrecte.css({ top: (6*SEPpx)+"px" });
		fResize.divCerrar = false;
	}
	
	return my;
};

var ConceptosEntregaH = function() {
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
		DB.addReloadDBHandler(function() { obtenerDB(); });
		obtenerDB();
	};

	my.get = function(tipo) {
		return conceptosEntrega[tipo];
	}
	
	function obtenerDB() {
		var db = DB.openPrincipal();
		db.transaction(function (tx) {
			var stat = "SELECT tipo as tipo, texto as texto FROM ConceptosEntrega";
			DB.exec(tx, stat, [], function (tx,res) {
				conceptosEntrega = { O: [], A: [] };
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					if (conceptosEntrega[row.tipo] != null) {
						conceptosEntrega[row.tipo].push(row.texto);	
					}
				}
//				if (isDivVisible(divES)) redrawES();
			});
		}, function (e) { conceptosEntrega = { O: [], A: [] }; runCallbackInit(); }, function() { runCallbackInit(); });
	}
	
	return my;
}
	