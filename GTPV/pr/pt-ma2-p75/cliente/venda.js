Scripts.addLE("VendaS", function(window) {
	
window.procesoVenda = function() {
	var my = {}

	var div0 = div100x100();
	
	var D = {};
	var S = {};
	
	var alertDialog = createAlertDialog().header("Error")
	                                     .setButtons(["Ok"], function(text, i) { S.alertDialog=null; })
										 .appendTo(div0);
	function showAlertDialog(text) {
		S.alertDialog = text;
		alertDialog.text(text);
		alertDialog.show();
	}
	
	var divVenda = div100x100().addClass("ui-widget-content").appendTo(div0); 
	
	var divT = $("<div>").css({ position: "relative" }).appendTo(divVenda);
	var teclatsTpv = newDivTeclatsTpv();

	// TT = teclatsTpv;

	teclatsTpv.appendTo(divT);
	teclatsTpv.displayEmptyArticles = false;

	teclatsTpv.clickAmbientHandler = function(data) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			abrirComanda(); // ???? 
			//clearTicket(); // ????
			actualizarVisor();
//			DepActives.save(dep);
		}
	}

	teclatsTpv.selectedArticleHandler = function(data) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			abrirComanda(); // ???? 
			//clearTicket();
			actualizarVisor();
//			DepActives.save(dep);
		}
		// var pos = $(this).data("pos");
		if (data.codi == null) return;
		var art = Articles.get(data.codi);
		
		var el = null, t;

		if (art.esSumable && S.fPeso) {	showAlertDialog("Aquest article no es ven a pes"); return; }
		if (!art.esSumable && !S.fPeso) { showAlertDialog("Aquest article es ven a pes"); return; }

		var item = { 
			n: (art.esSumable ? S.cantidad : S.cantidad/1000),
			codi: art.codi,
			preu: art.preu,
			esS:  art.esSumable,
			// dep: codi.dep
		}
		var idItem = S.AC.append(item);
		
/*		if (art.esSumable) {
			for (var idx=0; idx<S.ticket.length; idx++) {
				t = S.ticket[idx];
				if ((article.codi == t.article.codi) &&
				    (article.preu == t.article.preu) && 
					(article.esSumable == t.article.esSumable)) {
					el = divTicketScroll.children().eq(idx);
					t.article.nom = article.nom;
					break;
				}
			}
		}
		if (el == null) {
			// crear nueva entrada en ticket
			el = modelElemTicket.clone(true).insertBefore(terminalTicketScroll);
			setOH(el, hTicketEl);
			t = { article: article, cantidad: 0, import: 0 };
			S.ticket.push(t);
			S.idxElemScrollT = S.ticket.length;
			idx = S.ticket.length-1;
			S.relPosIdxElemScrollT = 1;
		} else {
			scrollTToVisible(idx);
		}
*/
		S.T.recentMod = idItem;
		S.T.itemSelected = null;
		// setTicketSelected(null);
//		t.cantidad += (article.esSumable ? S.cantidad : S.cantidad/1000);
		// actualizarElemTicket(idx);
		S.cantidad = 1;
		S.fPeso = false;
		S.fPrimeraPulsacionCantidad = false;
		changeComanda(S.C);
		// actualizarVisor();
		// ticketScroll();
//		DepActives.save(dep);
	}

	function controlHandler(e) {
		if (e.button !== 0) return;
		if (S.estado != "entrar") {
			S.estado = "entrar";
			clearTicket();
			// actualizarVisor();
		}
		switch ($(this).data("tipo")) {
			case "up" : 
				S.TScroll.offsetItem--;
				ticketScroll();
				break;
			case "down" :
				S.TScroll.offsetItem++;
				ticketScroll();
				break;	
			case "+" :
				var item = S.AC.getItem(S.T.itemSelected);
				if (item != null) {
					S.AC.increment(item, 1);
					changeComanda(S.C);
					//var t = S.ticket[S.idxTicketSelected];
					//t.cantidad++;
					//actualizarElemTicket(S.idxTicketSelected);
					//actualizarVisor();
				}
				break;
			case "-" :
				var item = S.AC.getItem(S.T.itemSelected);
				if (item && (item.n > 1)) {
					S.AC.increment(item, -1);
					changeComanda(S.C);
					//var t = S.ticket[S.idxTicketSelected];
					//t.cantidad++;
					//actualizarElemTicket(S.idxTicketSelected);
					//actualizarVisor();
				}
				break;
			case "borrar" :
				var item = S.AC.getItem(S.T.itemSelected);
				if (item != null) {
					S.AC.increment(item, -item.n);
					changeComanda(S.C);
				} else {
					S.cantidad = 1;
					S.fPeso = false;
					S.fPrimeraPulsacionCantidad = false;
					actualizarVisor();
				}
				break;	
			case "taula" :
				break;	
		}
//		DepActives.save(dep);
	}
	var buttonControl = $("<button>").css({verticalAlign: "middle"}).mousedown(controlHandler);
	var buttonCantidad = $("<button>").css({verticalAlign: "middle"});


	function elemTicketHandler(e) {
		if (e.button !== 0) return;
//		for (var idx=0, el=divTicketScroll.get(0).firstChild; this != el; idx++, el=el.nextSibling);
		setTicketSelected($(this).data("item"), $(this));
//		DepActives.save(dep);
	}
	
	
	// borrar y cancel cantidad
	function getButCantidadHandler(num) {
		return function(e) {
			if (e.button !== 0) return;
			if (S.estado == "total") {
				S.estado = "entrar";	
				clearTicket();
			}
			if (!S.fPrimeraPulsacionCantidad) {
				if (num > 0) {
					S.fPrimeraPulsacionCantidad = true;
					S.cantidad = num;
				}
			} else {
				if (S.cantidad*10 > 99999) return;
				S.cantidad = S.cantidad*10+num;
			}
			actualizarVisor();
//			DepActives.save(dep);
		}
	}
	
	function pesoHandler(e) {
		if (e.button !== 0) return;
		if (S.estado == "total") {
			S.estado = "entrar";	
			clearTicket();
		}
		S.fPeso = !S.fPeso;
		actualizarVisor();
//		DepActives.save(dep);
	}
	
	function cobrarHandler(e) {
		if (e.button !== 0) return;
		switch (S.estado) {
			case "entrar":
//				abrirCajon();
				if (S.ticket.length == 0) return;
				if (!DB.inTransaction(true)) return;
	
				var c;
				var sqlDate = DB.DateToSql(new Date());
				c = Caja.get();
				c.numTick++;
				S.numTick = c.numTick;
				S.date = sqlDate;
//				var codiDep = S.codi; 
				calcularTotalTicket();
				c.sumTick += S.total;
				c.clients++;
				c.tickets.push({ date: sqlDate, numTick: c.numTick });
				setTicketSelected(-1);
				S.estado = "total";
				redraw();
/*				DB.setErrorHandler(function() {
					S.estado = "entrar";
					redraw();	
				});
*/				Caja.preSave(sqlDate, function() {
					DB.preOpenMensual(sqlDate, "V_Venut_", function(h) {
//					Caja.set(c);
//					var depTemp = dep;
						var db = DB.open(h.dbName);
						DB.transactionWithErr(db, function (tx) {
							DB.sincroCreate(tx, h.tableName,
									   "[Botiga] float, [Data] datetime, "
									  +"[Dependenta] float, [Num_tick] float, "
									  +"[Estat] nvarchar(25), [Plu] float, "
									  +"[Quantitat] float, [Import] float, "
									  +"[Tipus_venta] nvarchar(25), [FormaMarcar] nvarchar(255), "
									  +"[Otros] nvarchar(255), ");
							for (var i=0; i<S.ticket.length; i++) {
								var t = S.ticket[i];
								DB.sincroInsert(tx, h.tableName, 
												"[Botiga], [Data], [Dependenta], [Num_tick], [Estat], [Plu], [Quantitat], [Import], "
											   +"[Tipus_venta], [FormaMarcar], [Otros], ",
												[GlobalGTPV.get("Llicencia"), sqlDate, S.codi, c.numTick,
												 null, t.article.codi, t.cantidad, t.import,
												 null, null, null], h.mark);
							}
							Caja.save(tx,c);
						}, function() {
							DB.inTransaction(false);
//							DB.clearErrorHandler();
							Caja.set(c);
//							DepActives.save(dep);
						});
					});
				})
				break;
			case "total":
				S.estado = "cobrar";	
				S.entregatStr = "";
				redraw();
//				DepActives.save(dep);
//				actualizar();
				break;
		}
	}
	
	var Config = {
//		hAmbients : 0.15,
//		hTeclado : 0.6,
		hAmbientsTeclats : 0.75,
		wTotal : .6,
		nCarWTicket : 60,
		maxWTicket : 0.6,
		relWC_C : [2,4]      // relative width control_cantidad
	}

	var divAccions = $("<div>").css({ position: "relative", overflow: "hidden" }).appendTo(divVenda); // overflow : hidden -> visor tamaño fijo
	var divControl = $("<div>").appendTo(divAccions);
	var divVisorTicket = $("<div>").css({fontFamily: "monospace", whiteSpace: "pre"}).appendTo(divAccions);
	var divTecladoCantidad = $("<div>").css({ position: "relative" }).appendTo(divAccions);
	divAccions.children().css({display: "inline-block", verticalAlign: "middle"});
	
	// divControl
	var divBuscarArticle = $("<div>").appendTo(divControl);
	teclatsTpv.getButtonBuscarArticle().css({ height: "100%" , cssFloat: "right"}).appendTo(divBuscarArticle);
	var divOtrosButtons = $("<div>").css({ position: "relative" }).appendTo(divControl);
	
	var butScrollUp = buttonControl.clone(true).text("u").data("tipo","up").appendTo(divOtrosButtons);
	var butScrollDown = buttonControl.clone(true).text("d").data("tipo","down").appendTo(divOtrosButtons);
	var butTaules= buttonControl.clone(true).text("taules").data("tipo","taules").appendTo(divOtrosButtons);
	var butBorrar = buttonControl.clone(true).text("borrar").data("tipo","borrar").appendTo(divOtrosButtons);
	var butPlus = buttonControl.clone(true).text("+").data("tipo","+").appendTo(divOtrosButtons);
	var butMinus = buttonControl.clone(true).text("-").data("tipo","-").appendTo(divOtrosButtons);
	var butTaula = buttonControl.clone(true).text("taula").data("tipo","taula").appendTo(divOtrosButtons);
	
	// divVisorTicketTotal
	var divVisor = $("<div>").css({border: "1px solid black", fontSize: "200%", fontWeight: "bold" }) 
	                         .appendTo(divVisorTicket);
	var divTotal = $("<div>").css({border: "1px solid black", textAlign: "left", display: "inline-block", 
	                               padding: "0 0.5em", verticalAlign: "middle", overflow: "hidden"})
	                         .appendTo(divVisor); 
	var divCantidad = $("<div>").css({border: "1px solid black", textAlign: "right", display: "inline-block", 
	                                  padding: "0 0.5em", verticalAlign: "middle", overflow: "hidden", backgroundColor: "yellow"})
	                            .appendTo(divVisor);  
	var divContTicket = $("<div>").css({overflow: "hidden", backgroundColor: "white"}).appendTo(divVisorTicket);
	var divTicketScroll = $("<div>").css({position: "relative", fontWeight: "bold" }).appendTo(divContTicket);
	var terminalTicketScroll = $("<div>").css({backgroundColor: "black"}).height(1).appendTo(divTicketScroll);
	
//	var divTotal = $("<div>").css({border: "1px solid black", fontSize: "120%", overflow: "hidden"}).appendTo(divVisorTicketTotal);

	// divTecladoCantidad
	var butCantidad = [];
	for (var i=0;i<=9;i++) {
		butCantidad.push(buttonCantidad.clone(true).text(""+i).appendTo(divTecladoCantidad).mousedown(getButCantidadHandler(i)));
	}
	var butPeso = buttonCantidad.clone(true).text("Peso").appendTo(divTecladoCantidad).mousedown(pesoHandler);
	var butCobrar = buttonCantidad.clone(true).text("Cobrar").appendTo(divTecladoCantidad).mousedown(cobrarHandler);
	
//	$("div", divVenda).css({boxSizing: "border-box"/*, visibility: "hidden"*/});
	
	var hTicketEl = 0;
	var numCarsElemTicket = 0;
	var modelElemTicket =  $("<div>").css({boxSizing: "border-box", borderTop: "1px dashed black",
	                                       width: "100%", overflow: "hidden"}).mousedown(elemTicketHandler);
	var hContTicket = 0;
	
	var cantidad;
	var total;
	
	var S;
	var fResize = {};
//	var dep;
	
	var AC;
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		Resize.add(function() {
			fResize = {};
			resizeDivVenda(); 
			if (isDivVisible(alertDialog.getDiv())) alertDialog.show(); 
		});
		AC = agruparComanda(prefAgruparComanda_Venda);
		teclatsTpv.init();
		procesoAbrirCaja.init(div00);
	};
	var mp;
//	var dep;
	my.start = function(_mp) {
		mp = _mp;
//		dep = mp.getDepActual();
		if (procesoAbrirCaja.start(mp)) return;
		divShow(div0);
		restoreState();
	};

	function resizeDivVenda() {
		if (fResize.divVenda === false) return;
		if (!isDivVisible(divVenda)) return; 
//		divVenda.children().hide(); // * evitar que salgan scrollbars
		var wDC = divVenda.width(), hDC = divVenda.height();
//		divVenda.children().show(); // *
		
		var hAT = teclatsTpv.preferedHeight(Math.round(Config.hAmbientsTeclats*hDC));
		divT.height(hAT);
		teclatsTpv.resize();
//		hAT = divT.height();
		
		divAccions.height(hDC-hAT);

		setOH(divControl, getIH(divAccions));
		setOH(divVisorTicket, getIH(divAccions));
		setOH(divTecladoCantidad, getIH(divAccions));

		var testEl = modelElemTicket.clone(true).appendTo(divTicketScroll);
		var wTestSpan = getOW($("<span>X</span>").appendTo(testEl));
		var wTicketEl = (getOW(testEl)-getIW(testEl))+(Config.nCarWTicket*wTestSpan);
		if (wTicketEl > Config.maxWTicket*wDC) { wTicketEl = Config.maxWTicket*wDC; }
		setIW(divTicketScroll, wTicketEl);
		numCarsElemTicket = Math.floor(getIW(testEl)/wTestSpan);
		hTicketEl = getOH(testEl);
		testEl.remove();
//		divTicketScroll.children().each(function(i,el) { setOH($(el), hTicketEl); });
		var nEl = divTicketScroll.children().length-1;
		for (var i=0; i < nEl; i++) {
			setOH(divTicketScroll.children().eq(i), hTicketEl);
			actualizarElemTicket(i);
//			formatElemTicket(div, S.ticket[i]);	
		}
//		actualizarTicket();


		var wVisor = getOW(divContTicket);
		setOW(divVisor, wVisor);
		var wVisor = Math.round(Config.wTotal*getIW(divVisor));
		setOW(divTotal, wVisor);
		setOW(divCantidad, getIW(divVisor)-wVisor);

		var tempT = divTotal.text();
		divTotal.text("X");
		var hVisorT = getOH(divTotal);
		divTotal.text(tempT);
		setOH(divTotal, hVisorT);
		setOH(divCantidad, hVisorT);
		setOH(divContTicket, getIH(divVisorTicket)-getOH(divVisor));
		hContTicket = getIH(divContTicket);
		ticketScroll();

		var wA = getIW(divAccions);
		
		var wControl = Math.round((wA-getOW(divVisorTicket))*(Config.relWC_C[0]/(Config.relWC_C[0]+Config.relWC_C[1])));

		setOW(divControl, wControl);
		setOW(divTecladoCantidad, wA-wControl-getOW(divVisorTicket));
		
		setOH(divBuscarArticle, getOH(divVisor));
		setOH(divOtrosButtons, getIH(divControl)-getOH(divBuscarArticle));

		var wOB = getIW(divOtrosButtons), hOB = getIH(divOtrosButtons);	
		posAbsolutePX(butPlus, 0, 0, wOB/2, hOB/3);                       // (0,0)
		posAbsolutePX(butTaules, 0, hOB/3, wOB/2, 2*hOB/3);                // (0,1)
		posAbsolutePX(butMinus, 0, 2*hOB/3, wOB/2, hOB);                   // (0,2)
		posAbsolutePX(butScrollUp, wOB/2, 0, wOB, hOB/3);            // (1,0)
		posAbsolutePX(butBorrar, wOB/2, hOB/3, wOB, 2*hOB/3);         // (1,1)
		posAbsolutePX(butScrollDown, wOB/2, 2*hOB/3, wOB, hOB);       // (1,2)

		var wTC = getIW(divTecladoCantidad), hTC = getIH(divTecladoCantidad) 
		var butCantLayout = [[7,8,9],[4,5,6],[1,2,3],[0]];
		for (var y=0; y<butCantLayout.length; y++) {
			for (var x=0; x<butCantLayout[y].length; x++) {
				posAbsolutePX(butCantidad[butCantLayout[y][x]], x*wTC/4, y*hTC/4, (x+1)*wTC/4, (y+1)*hTC/4);
			}
		}
		posAbsolutePX(butPeso, 3*wTC/4, hTC/4, wTC, 2*hTC/4);   // (3,1)
		posAbsolutePX(butCobrar, wTC/4, 3*hTC/4, wTC, hTC);     // (1-3,3)
		fResize.divVenda = false;
	}
	var redrawTeclatsTpv = true;
	var idComanda;
	var C;
	function restoreState() {
		if (C) C.release();
//		var DepActual = mp.getDepActual();
//		var TaulaActual = mp.getTaulaActual();
		idComanda = my.getIdActual();
		S = (D[idComanda] = (D[idComanda] || {}));
		
/*		var p = null;
		if (DepActual != null) p = "D_"+DepActual.codi; 
		else if (TaulaActual != null) p = "D_"+TaulaActual.nom; 
		S = (D[p] = (D[p] || {}));
*/		if (S.estado == null) {
			S.id = idComanda;
			S.C = Comandes.get(idComanda);
			S.AC.setC(C);
			S.estado = "entrar";
			// ???? S.codi = (DepActual != null) ? DepActual.codi : taulaActual.codiDep;
			S.alertDialog = null;
			S.teclats = {};
			clearTicket();
//			DepActives.save(dep);
		}
		redrawTeclatsTpv = true;
		redraw();
	}
	my.initCajaAbierta = function() {
		D = {};
	}
	function divTicketScroll_empty() {
//		divTicketScroll.empty(); 
//		terminalTicketScroll = $("<div>").css({backgroundColor: "black"}).height(1).appendTo(divTicketScroll);
		ticketScroll(0,0);   // mantener terminalScrollTicket visible para evitar repaint de todo el body
		var c = divTicketScroll.children();
		for (var i=0; i<c.length-1; i++) { c.eq(i).remove(); }
	}
	function redraw() {
		switch (S.estado) {
			case "entrar":
			case "total":
				divShow(divVenda);
				if (redrawTeclatsTpv) {
					teclatsTpv.redraw(S.teclats);
					redrawTeclatsTpv = false;
				}	
				divTicketScroll_empty();
				resizeDivVenda();
				if (S.estado == "entrar") {
					for (var i=0; i<S.ticket.length; i++) {
						var el = modelElemTicket.clone(true).height(hTicketEl).insertBefore(terminalTicketScroll)/*appendTo(divTicketScroll)*/;
						actualizarElemTicket(i);
			//			formatElemTicket(el, S.ticket[i]);
					}
					setTicketSelected(S.idxTicketSelected);
				} else setTicketSelected(-1);
				actualizarVisor();
				ticketScroll();
				if (S.alertDialog != null) showAlertDialog(S.alertDialog);
				break;
			case "cobrar":
				divShow(divCobrar);
				actualizarCobrar();
				break;
		}
	}
	
	function clearTicket() {
		S.cantidad = 1;
		S.fPeso = false;
		S.fPrimeraPulsacionCantidad = false;
		S.T = {};
		S.TScroll = {};
		S.numTick = null;
		S.date = null;
//		redrawC();
		S.C.temporal_o_abrir(); // ???? infoAbrir
		changeComanda(S.C);
//		divTicketScroll_empty();
//		setTicketSelected(-1);
//		ticketScroll();
	}
	function formatElemTicket(div, item, import) {
		var prec = (item.el.esS) ? 0 : 3;  // esSumable
		var strC = ""+item.el.n.toFixed(prec);
		var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
		for (; iComa < strC.length; iComa+=3+1) {
			strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
		}
		if (strC.length > 6) strC="******";
		else strC = fillSpaceL(strC, 6);

		var lenC = strC.length;

		var strI = formatImport(import, true);

		var lenN = numCarsElemTicket-(6+1+0+1+strI.length+1);
		if (lenN<1) lenI=1;
		var strN = item.el.nom.substring(0,lenN);
		while (strN.length < lenN) strN=strN+" ";
		var str = strC+" "+strN+" "+strI+" ";
		div.text(str);
	}
	function calcImport(item) {
		return normImport(item.el.n*item.el.preu);
	}
	function actualizarElemTicket(el) {
		formatElemTicket(el, el.data("item"), el.data("import"));
	}
	function actualizarVisor() {
		calcularTotalTicket();
		if (S.estado == "entrar") {
			divCantidad.text(S.cantidad+(S.fPeso ? " Gr." : ""));
		} else divCantidad.text("");
		divTotal.text("Total: "+formatImport(S.total, true)); // format	
//		ticketScroll();
	}
	function calcularTotalTicket() {
		S.T.total = 0;
		var child = divTicketScroll.children().toArray();
		for (var i=0; i<child.length-1; i++) { S.T.total += $(child).data("import"); } 
		S.total = normImport(S.total);
	}

	function ticketScroll() {
//		var nEl = divTicketScroll.children().length-1;
		var hScroll = getOH(divTicketScroll);
		var hTerminal = getOH(terminalTicketScroll);
		var idx = -1;
		var nItems = S.AC.getItems().length;
		var top;
		if (nItems === 0) {
			S.Tscroll.refItem = null;
			top = 0;
		} else {
			idx = S.AC.getPosItem(S.TScroll.itemRef);
			if (idx === -1) {
				idx = nItems-1;
				S.TScroll.offsetItem=1;
				S.Tscroll.relPosCont=1;
			} 	
			top = Math.floor(  (idx+S.TScroll.offsetItem)*hTicketEl 
			                 - hContTicket*S.TScroll.relPosCont);
			if (top+hContTicket >= hScroll-hTerminal) {   // no hay mas elementos por abajo
				top = hScroll-hContTicket; 
				idx = nItems-1; 
				S.TScroll.offsetItem=1;
				S.Tscroll.relPosCont=1;
			}
			if (top <= 0) {  // no hay mas elementos por arriba
				top = 0;
				idx = 0;
				S.TScroll.offsetItem=0;
				S.Tscroll.relPosCont=0;
			}
		}
		if (idx !== -1)	S.TScroll.itemRef = S.AC.getItems()[idx];
		divTicketScroll.css({top : -top+"px"});
		butScrollUp[(top <= 0) ? "hide" : "show"](); 
		butScrollDown[(top+hContTicket >= hScroll-hTerminal) ? "hide" : "show"]();			
	}

	function scrollTToVisible(item) {
		var	idx1 = S.AC.getPosItem(S.TScroll.itemRef);
		var idx2 = S.AC.getPosItem(item);
		S.TScroll.itemRef = item;
		if ((idx1 === -1) || (idx2 === -1)) {
			S.TScroll.offsetItem=1;
			S.Tscroll.relPosCont=1;
		} else {
			var top;
			top = Math.floor(  (idx1+S.TScroll.offsetItem)*hTicketEl 
			                 - hContTicket*S.TScroll.relPosCont);
			var up = idx2*hTicketEl;
			var dn = (idx2+1)*hTicketEl;
			if (dn >= top+hContTicket) {
				S.TScroll.offsetItem=1;
				S.TScroll.relPosCont=1;
			} else if (up <= top) {
				S.TScroll.offsetItem=0;
				S.TScroll.relPosCont=0;
			} else {
				S.TScroll.offsetItem=0;
				S.TScroll.relPosCont=up/hContTicket;
			}
		}
	}

	function setTicketSelected(item, el) {
		if (S.T.elSelected != null) S.T.elSelected.removeClass("ui-state-active");
		S.T.elSelected = null;
		S.T.itemSelected = item;
		if (item != null) {
			S.T.elSelected = el;
			el.addClass("ui-state-active");
			scrollTToVisible(item);
			butPlus.show();
			butMinus[(item.n > 1) ? "show" : "hide"]();
		} else {
			butPlus.hide();
			butMinus.hide();
		}
	}
	
	var delayRecentMod = 5000;
	
	function changeComanda(C, autoChange) {
		if (autoChange) return;
		if (C === S.C) {
			S.itemsC = S.AC.getItems();
			if (S.nCTS != C.getNChangeTs()) {
				// init S.Ticket
				S.T = {};
				S.TScroll = {};
				S.nCTS = C.getNChangeTs();
			}
			divTicketScroll.empty();
			var itemSelected = S.AC.getItem(S.T.itemSelected);
			var elSelected = null;
			var itemRecMod = S.AC.getItem(S.T.recentMod);
			S.T.recentMod = null;
			
			if (C.isOpen()) {
				S.AC.getItems().forEach(function(item) {
					// draw el
					var el = modelElemTicket.clone(true).height(hTicketEl).appendTo(divTicketScroll);
					el.data("item", item);
					el.data("import", calcImport(item));
					actualizarElemTicket(el);

					if (itemSelected === item) {
						elSelected = el;
					}
					if (itemRecMod === item) {
						el.addClass("ticket_recent_mod");
						function removeRecentModClass(el) {	el.removeClass("ticket_recent_mod"); }
						setTimeout(removeRecentModClass, delayRecentMod, el);
					}				
				});
				setTicketSelected(itemSelected, elSelected);
			}
			// mantener terminalScrollTicket visible para evitar repaint de todo el body
			terminalTicketScroll.appentTo(divTicketScroll);
			ticketScroll();
			actualizarVisor();
		}
	}
	
	// proceso Cobrar

	var divCobrar = div100x100().addClass("ui-widget-content").appendTo(div0).hide();
	var cobrarTotal, cobrarEntregat, cobrarCanvi;
	
	my.getLineTicket = function(sec, idxSec, S, numCars) {
		function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
		var str = null;
		switch (sec) {
			case "header" :
				switch (idxSec) {
					case 0 :
						var m =  /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/.exec(S.date);
						var dateNtStr = " N.Ticket:"+S.numTick+" ";
						dateNtStr += m[3]+"/"+m[2]+"/"+m[1]+" "+m[4]+":"+m[5]+":"+m[6];
						str = "Atès Per : ";
						var lenD = numCars-(str.length+0+dateNtStr.length);
						var strD = S.depNom.substring(0,lenD);
						strD = fillSpaceR(strD, lenD);
						str = str+strD+dateNtStr;
						break;
					case 1 :
						str = "  UTS  DESCRIPCIO";
						str = fillSpaceR(str, numCars-8-8)+"  PREU   IMPORT ";
						break;
				}
				break;
			case "ticket" :
				if (idxSec == 0) {
					str = ""; while(str.length<numCars) str+="-";
				} else if (idxSec-1<S.ticket.length) {
					var t = S.ticket[idxSec-1];
					var prec = (t.article.esSumable) ? 0 : 3;
					var strC = ""+t.cantidad.toFixed(prec);
					var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
					for (; iComa < strC.length; iComa+=3+1) {
						strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
					}
					if (strC.length > 6) strC="******";
					else strC = fillSpaceL(strC, 6);
	
					var lenC = strC.length;
	
					var strP = fillSpaceL(formatImport(t.article.preu, false));
					strP = fillSpaceL(strP,8);
					var strI = fillSpaceL(formatImport(t.import, false));
					strI = fillSpaceL(strI,8);
					
					var lenN = numCars-(6+1+0+1+strP.length+1+strI.length);
					var strN = t.article.nom.substring(0,lenN);
					strN = fillSpaceR(strN, lenN);
					str = strC+" "+strN+" "+strP+" "+strI;
							
				} else if (idxSec-1==S.ticket.length) {
					str = ""; while(str.length<numCars) str+="=";
				}
				break;
			case "total" :
				if (idxSec == 0) {
					var strT = formatImport(S.total, (S.currencySymbol != null) ? S.currencySymbol : true);
					var str = "Total : ";
					str = fillSpaceR(str, numCars-strT.length)+strT;
				}
				break;	
		}
		return str;
	};
	
	(function() {

		function imprimirTicket(e) {
			if (e.button !== 0) return;
//			function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }

			S.depNom = dep.nom;
			S.currencySymbol = curPrinter.EURO;
			curPrinter.abrirCajon();
			curPrinter.reset();
			curPrinter.codePage();
			curPrinter.print("SCHNAPS DEL CENTRE SL\n");
			curPrinter.print("CAFETERIA & CERVESERIA IGLÚ\n");
			curPrinter.print("CL FRANCESC LAYRET 8 LOCAL\n");
			curPrinter.print("08911 BADALONA\n");
			curPrinter.print("BARCELONA\n");
			curPrinter.print("NIF: B64460280\n");
			curPrinter.print("\n");
			curPrinter.font("B",false,1,1,false);
			var str;
			for (var i=0; (str=my.getLineTicket("header", i, S, 56)) != null; i++) curPrinter.print(str+"\n");
			for (var i=0; (str=my.getLineTicket("ticket", i, S, 56)) != null; i++) curPrinter.print(str+"\n");
			curPrinter.font("B",true,2,2,false);
			for (var i=0; (str=my.getLineTicket("total" , i, S, 28)) != null; i++) curPrinter.print(str+"\n");
			curPrinter.cutPaper();
		}
	
		var div1 = $("<div>").css({position: "absolute", top: "2em", left: "2em", fontFamily: "monospace"}).appendTo(divCobrar);
		
		var modelBut = $("<button>").css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
			if (e.button !== 0) return;
			var val = $(this).data("data");
			switch(val) {
				case "B": 
					S.entregatStr = "";
					break;
				case ".":
					if (S.entregatStr.indexOf(".") == -1) {
						if (S.entregatStr.length == 0) S.entregatStr = "0";
						S.entregatStr += ".";
					}
					break;
				default:
					var coma = S.entregatStr.indexOf(".");
					if (coma != -1) {
						if (S.entregatStr.length-coma < 1+2) S.entregatStr += val; 	
					} else {
						if (!((val == 0) && (S.entregatStr.length == 0)) &&
						     (S.entregatStr.length < 10))
							S.entregatStr += val;
					}
			}
			actualizarCobrar();
		});

		var butT=[[7,8,9],[4,5,6],[1,2,3],['.',0,'B']];
		for (var y=0; y<butT.length; y++) {
			var div2 = $("<div>").appendTo(div1);
			for (var x=0; x<butT[y].length; x++) {
				modelBut.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
			}
		}
	
		var div1 = $("<div>").css({position: "absolute", top: "2em", right: "2em", whiteSpace: "pre", fontFamily: "monospace"})
							   .addClass("ui-widget-content").appendTo(divCobrar);
		var div = $("<div>Total: </div>").appendTo(div1);
		cobrarTotal = $("<span>").css({float: "right", border: "1px solid black"}).appendTo(div);
		$("<div>&nbsp;</div>").appendTo(div1);
		var div = $("<div>Entregat: </div>").appendTo(div1);
		cobrarEntregat = $("<span>").css({float: "right", border: "1px solid black"}).appendTo(div);
		$("<div>&nbsp;</div>").appendTo(div1);
		var div = $("<div>Canvi: </div>").appendTo(div1);
		cobrarCanvi = $("<span>").css({float: "right", border: "1px solid black"}).appendTo(div);
		
		var divIS = $("<div>").css({position: "absolute", bottom: "2em", right: "2em"}).appendTo(divCobrar);
		$("<button>imprimir</button>").appendTo(divIS).click(imprimirTicket);
		$("<button>salir</button>").appendTo(divIS).click(function(e){ 		
		                                                     if (e.button !== 0) return;
                                                             S.estado="total"; 
														     redraw();
														 });	
	})();
	
	function actualizarCobrar() {
		var entregat = parseImport(S.entregatStr);
		var canvi = entregat-S.total;
		
		cobrarTotal.text(fillSpaceL(formatImport(S.total, true), 20));
		cobrarEntregat.text(fillSpaceL(entregat, 20));
		cobrarCanvi.text(fillSpaceL(formatImport(canvi, true), 20));
		cobrarCanvi.css({borderColor: (canvi >= 0) ? "black" : "red"});
	}
	
	return my;
};

}); // Scripts.add VendaS

window.procesoAbrirCaja = function() {
	var my = {};

	var S = null;

	var canvi = newProcesoCanviCaja();

	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100).addClass("ui-widget-content");
	var divAbrir = canvi.getDiv().appendTo(div0);
	var butCanviCorrecte = $("<button>").css({position: "absolute", width: "100%"})
	                                    .text("Canvi Correcte").appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		if (e.button !== 0) return;
		Caja.abrir(S.canvi, dep, function() {
			S = null;
			procesoVenda.initCajaAbierta();
			procesoVenda.start(dep);
		});
	});
	
	var fResize = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Resize.add(function() { 
			fResize = {}; 
			resizeDivAbrir(); 
		});

	};
	var mp;
	var dep; 
	my.start = function(_mp) {
		if (Caja.get().oberta) return false; // false procesoAbrirCaja no coje el control
		divShow(div0);
		mp = _mp;
		dep = mp.getDepActual(); 
		if ((dep != null) && (dep.esResponsable)) {
			divShow(divAbrir);
			if (S == null) { 
				S = {
					canvi : Caja.get().canvi.slice(0), // copy array
					selected : 0,
				};
			}
			S.primeraTecla = true;
			canvi.start(S);
			resizeDivAbrir();
		} else {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		}
		return true;
	};
	function resizeDivAbrir() {
		if (fResize.divAbrir === false) return;
		if (!isDivVisible(divAbrir)) return; 
		canvi.resize();
		butCanviCorrecte.css({ top: "40%" /*(6*SEPpx)+"px"*/ });
		fResize.divAbrir = false;
	}
	
	return my;
};

Scripts.add("VendaS", function() {
	
window.procesoAbrirCaja = function() {
	var my = {};

	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100).addClass("ui-widget-content");

	my.init = function(div00) {
		div0.appendTo(div00).hide();
	};

	var mp;
	var dep; 
	my.start = function(_mp) {
		if (Caja.get().oberta) return false; // false procesoAbrirCaja no coje el control
		divShow(div0);
		mp = _mp;
		dep = mp.getDepActual(); 
		DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		return true;
	};
	
	return my;
};

}); // Scripts.add VendaS procesoAbrirCaja