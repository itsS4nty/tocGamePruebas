H.Scripts.add("VendaS", "L2", function() {
	
window.AppVenda = function() {
	var my = {}

	var div0 = $("<div>")._100x100();
	
	var D = {};
	var S = {};
	
	var dialog = newAlertDialog().appendTo(div0);

	function showAlertDialog(text) {
		S.alertDialog = text;
		dialog.header(M("Error")).text(M(text))
		      .setButtons([M("Ok")], function() { S.alertDialog=null; }).show();
	}
	
	var divVenda = $("<div>")._100x100().addClass("g-widget-content").appendTo(div0); 
	
	var divT = $("<div>").css({ position: "relative" }).appendTo(divVenda);
	var teclatsTpv = newSubAppTeclatsTpv();

	// TT = teclatsTpv;

	teclatsTpv.appendTo(divT);
	teclatsTpv.displayEmptyArticles = false;

	teclatsTpv.clickAmbientHandler = function(data) {
		abrirComandaIfNeeded(); 
	}

	teclatsTpv.selectedArticleHandler = function(data) {
		abrirComandaIfNeeded();
		if (data.codi == null) return;
		var art = Articles.getByCodi(data.codi);
		
		var el = null, t;

		if (art.esSumable && S.fPeso) {	showAlertDialog("Aquest article no es ven a pes"); return; }
		if (!art.esSumable && !S.fPeso) { showAlertDialog("Aquest article es ven a pes"); return; }

		var item = { 
			n: (art.esSumable ? S.cantidad : S.cantidad/1000),
			codi: art.codi,
			preu: art.preu,
			esS:  art.esSumable
			// ,dep: codi.dep
		}
		var idItem = S.AC.append(item);
		

		S.T.recentIns = idItem;
		S.T.itemSelected = null;
		S.cantidad = 1;
		S.fPeso = false;
		S.fPrimeraPulsacionCantidad = false;
		changeComanda();
	}

	function controlHandler(e) {
		if (e.button !== 0) return;
		abrirComandaIfNeeded(); 
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
					changeComanda();
				}
				break;
			case "-" :
				var item = S.AC.getItem(S.T.itemSelected);
				if (item && (item.n > 1)) {
					S.AC.increment(item, -1);
					changeComanda();
				}
				break;
			case "borrar" :
				var item = S.AC.getItem(S.T.itemSelected);
				if (item != null) {
					S.AC.increment(item, -item.n);
					changeComanda();
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
	}
	var buttonControl = gButton().css({verticalAlign: "middle"}).mousedown(controlHandler);
	var buttonCantidad = gButton().css({verticalAlign: "middle"});


	function elemTicketSelectHandler(e) {
		if (e.button !== 0) return;
		setTicketSelected($(this).data("item"), $(this));
	}
	
	
	// borrar y cancel cantidad
	function getButCantidadHandler(num) {
		return function(e) {
			if (e.button !== 0) return;
			abrirComandaIfNeeded(); 
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
		}
	}
	
	function pesoHandler(e) {
		if (e.button !== 0) return;
		abrirComandaIfNeeded(); 
		S.fPeso = !S.fPeso;
		actualizarVisor();
	}
	
	function cobrarHandler(e) {
		if (e.button !== 0) return;
		switch (S.estado) {
			case "entrar":
//				abrirCajon();
				if (S.AC.getItems().length === 0) return;
				calcularTotalTicket();
				S.totalFinal = S.total;
				S.C.cobrar(); // ????
				S.tsCobrar = S.C.getTs();
				S.estado = "total";
				redraw();
				break;
			case "total":
				S.estado = "cobrar";	
				S.entregatStr = "";
				redraw();
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
	
	var butScrollUp = buttonControl.clone(true).data("tipo","up").appendTo(divOtrosButtons);
	var butScrollDown = buttonControl.clone(true).data("tipo","down").appendTo(divOtrosButtons);
	var butTaules= buttonControl.clone(true).data("tipo","taules").appendTo(divOtrosButtons);
	var butBorrar = buttonControl.clone(true).data("tipo","borrar").appendTo(divOtrosButtons);
	var butPlus = buttonControl.clone(true).data("tipo","+").appendTo(divOtrosButtons);
	var butMinus = buttonControl.clone(true).data("tipo","-").appendTo(divOtrosButtons);
	//var butTaula = buttonControl.clone(true).text("taula").data("tipo","taula").appendTo(divOtrosButtons);
	
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
	var terminalTicketElement = $("<div>").css({backgroundColor: "black"}).height(1).appendTo(divTicketScroll);
	
	// divTecladoCantidad
	var butCantidad = [];
	for (var i=0;i<=9;i++) {
		butCantidad.push(buttonCantidad.clone(true).text(""+i).appendTo(divTecladoCantidad).mousedown(getButCantidadHandler(i)));
	}
	var butPeso = buttonCantidad.clone(true).appendTo(divTecladoCantidad).mousedown(pesoHandler);
	var butCobrar = buttonCantidad.clone(true).appendTo(divTecladoCantidad).mousedown(cobrarHandler);
	
//	$("div", divVenda).css({boxSizing: "border-box"/*, visibility: "hidden"*/});
	
	var hTicketEl = 0;
	var numCarsElemTicket = 0;
	var elemTicketModel =  $("<div>").css({boxSizing: "border-box", borderTop: "1px dashed black",
	                                       width: "100%", overflow: "hidden"}).mousedown(elemTicketSelectHandler);
	var hContTicket = 0;
	
	var cantidad;
	var total;
	
	var S;
	var resized = {};
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Caja.addChangeHandler(function() {
			Caja.checkOpen(div0);
		});

		Resize.add(function() {
			resized = {};
			resizeDivVenda(); 
			if (dialog.getDiv().isVisible()) dialog.show(); 
		});
		teclatsTpv.init();
		AppAbrirCaja.init(div00);
	};

	var mp;
	my.start = function(_mp) {
		mp = _mp;
		if (!Caja.isOpen()) {
			D = {};
			AppAbrirCaja.start(mp);
		} else {
			div0.showAlone();
			restoreState();
		}
	};

	function resizeDivVenda() {
		if (resized.divVenda) return;
		if (!divVenda.isVisible()) return; 
		
		butScrollUp.text("u");
		butScrollDown.text("d");
		butTaules.text(M("taules"));
		butBorrar.text(M("borrar"));
		butPlus.text("+");
		butMinus.text("-");
		//butTaula.text(M("taula"));
		butPeso.text(M("Peso"));
		butCobrar.text(M("Cobrar"));

		
		var wDC = divVenda.width(), hDC = divVenda.height();
		
		var hAT = teclatsTpv.preferedHeight(Math.round(Config.hAmbientsTeclats*hDC));
		divT.height(hAT);
		teclatsTpv.resize();
//		hAT = divT.height();
		
		divAccions.height(hDC-hAT);

		divControl.oHeight(divAccions.iHeight());
		divVisorTicket.oHeight(divAccions.iHeight());
		divTecladoCantidad.oHeight(divAccions.iHeight());

		var testEl = elemTicketModel.clone(true).appendTo(divTicketScroll);
		var wTestSpan = $("<span>X</span>").appendTo(testEl).oWidth();
		var wTicketEl = (testEl.oWidth()-testEl.iWidth())+(Config.nCarWTicket*wTestSpan);
		if (wTicketEl > Config.maxWTicket*wDC) { wTicketEl = Config.maxWTicket*wDC; }
		divTicketScroll.iWidth(wTicketEl);
		numCarsElemTicket = Math.floor(testEl.iWidth()/wTestSpan);
		hTicketEl = testEl.oHeight();
		testEl.remove();
		var children = divTicketScroll.children().toArray();
		for (var i=0; i<children.length-1; i++) { 
			$(children[i]).oHeight(hTicketEl);
			actualizarElemTicket($(children[i]));
		}

		var wVisor = divContTicket.oWidth();
		divVisor.oWidth(wVisor);
		var wVisor = Math.round(Config.wTotal*divVisor.iWidth());
		divTotal.oWidth(wVisor);
		divCantidad.oWidth(divVisor.iWidth()-wVisor);

		var tempT = divTotal.text();
		divTotal.text("X");
		var hVisorT = divTotal.oHeight();
		divTotal.text(tempT);
		divTotal.oHeight(hVisorT);
		divCantidad.oHeight(hVisorT);
		divContTicket.oHeight(divVisorTicket.iHeight()-divVisor.oHeight());
		hContTicket = divContTicket.iHeight();
		ticketScroll();

		var wA = divAccions.iWidth();
		
		var wControl = Math.round((wA-divVisorTicket.oWidth())*(Config.relWC_C[0]/(Config.relWC_C[0]+Config.relWC_C[1])));

		divControl.oWidth(wControl);
		divTecladoCantidad.oWidth(wA-wControl-divVisorTicket.oWidth());
		
		divBuscarArticle.oHeight(divVisor.oHeight());
		divOtrosButtons.oHeight(divControl.iHeight()-divBuscarArticle.oHeight());

		var wOB = divOtrosButtons.iWidth(), hOB = divOtrosButtons.iHeight();	
		butPlus.absolutePosPx(0, 0, wOB/2, hOB/3);                       // (0,0)
		butTaules.absolutePosPx(0, hOB/3, wOB/2, 2*hOB/3);                // (0,1)
		butMinus.absolutePosPx(0, 2*hOB/3, wOB/2, hOB);                   // (0,2)
		butScrollUp.absolutePosPx(wOB/2, 0, wOB, hOB/3);            // (1,0)
		butBorrar.absolutePosPx(wOB/2, hOB/3, wOB, 2*hOB/3);         // (1,1)
		butScrollDown.absolutePosPx(wOB/2, 2*hOB/3, wOB, hOB);       // (1,2)

		var wTC = divTecladoCantidad.iWidth(), hTC = divTecladoCantidad.iHeight() 
		var butCantLayout = [[7,8,9],[4,5,6],[1,2,3],[0]];
		for (var y=0; y<butCantLayout.length; y++) {
			for (var x=0; x<butCantLayout[y].length; x++) {
				butCantidad[butCantLayout[y][x]].absolutePosPx(x*wTC/4, y*hTC/4, (x+1)*wTC/4, (y+1)*hTC/4);
			}
		}
		butPeso.absolutePosPx(3*wTC/4, hTC/4, wTC, 2*hTC/4);   // (3,1)
		butCobrar.absolutePosPx(wTC/4, 3*hTC/4, wTC, hTC);     // (1-3,3)
		resized.divVenda = true;
	}
	var redrawTeclatsTpv = true;
	var idComanda;

	function restoreState() {
		idComanda = mp.getIdComandaActual();
		S = (D[idComanda] = (D[idComanda] || {}));
		
		if (S.estado == null) {
			S.id = idComanda;
			S.C = Comandes.get(idComanda, changeComanda, function(C, codError, o, c, resumeError) {
				console.log("error C: "+codError+" : "+o.cmd);
				c.orders.splice(c.orders.indexOf(o), 1);
				resumeError();
			}); // ???? controlHandler
			S.AC = agruparComanda(optAgruparComanda_Venda, S.C);
			S.alertDialog = null;
			S.teclats = {};
			abrirComandaIfNeeded(); 
		}
		redrawTeclatsTpv = true;
		redraw();
	}

	function redraw() {
		switch (S.estado) {
			case "entrar":
			case "total":
				divVenda.showAlone();
				if (redrawTeclatsTpv) {
					teclatsTpv.start(S.teclats);
					redrawTeclatsTpv = false; // teclatsTpv tiene redraw
				}	
				teclatsTpv.redrawButtonBuscarArticle();
				resizeDivVenda();
				changeComanda();
				if (S.alertDialog != null) showAlertDialog(S.alertDialog);
				break;
			case "cobrar":
				divCobrar.showAlone();
				redrawCobrar();
				actualizarCobrar();
				break;
		}
	}
	
	function abrirComandaIfNeeded() {
		if (!S.C.isOpen() || (S.estado != "entrar")) {
			S.estado = "entrar";
			S.cantidad = 1;
			S.fPeso = false;
			S.fPrimeraPulsacionCantidad = false;
			S.T = {}; // elSelected, itemSelected, recentIns
			S.TScroll = {}; // offsetItem, itemRef, relPosCont(relPosContainer)
			S.numTick = null;
			S.date = null;
			var infoAbrir = { codiDep: mp.getCodiDepActual() };
			if (supervCom.disconnected() > 10*60*1000) S.C.temporal_o_abrir(infoAbrir);
			else if (!S.C.isOpen()) S.C.abrir(infoAbrir);
			changeComanda();
		}
	}

	function formatElemTicket(div, item, imp) {
		var el = item.el;
		var prec = (el.esS) ? 0 : 3;  // esSumable
		var strC = ""+el.n.toFixed(prec);
		var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
		for (; iComa < strC.length; iComa+=3+1) {
			strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
		}
		if (strC.length > 6) strC="******";
		else strC = strC.fillSpaceL(6);

		var lenC = strC.length;

		var strI = formatImport(imp, true);

		var lenN = numCarsElemTicket-(6+1+0+1+strI.length+1);
		if (lenN<1) lenN=1;
		var art = Articles.getByCodi(el.codi);
		var nom = (art && art.nom) ? art.nom : "";
		var strN = nom.substring(0,lenN);
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
			divCantidad.text(S.cantidad+(S.fPeso ? M(" Gr.") : ""));
		} else divCantidad.text("");
		divTotal.text(M("Total: ")+formatImport((S.estado == "entrar" ? S.total : S.totalFinal), true)); // format	
	}
	function calcularTotalTicket() {
		S.total = 0;
		var items = S.AC.getItems();
		items.forEach(function(item) {
			S.total+=calcImport(item);
		});
		S.total = normImport(S.total); // ????
	}

	function ticketScroll() {
		var hScroll = divTicketScroll.oHeight();
		var hTerminal = terminalTicketElement.oHeight();
		var idx = -1;
		var nItems = S.AC.getItems().length;
		var top;
		if (nItems === 0) {
			S.TScroll.itemRef = null;
			top = 0;
		} else {
			idx = S.AC.getPosItem(S.TScroll.itemRef);
			if (idx === -1) {
				idx = nItems-1;
				S.TScroll.offsetItem=1;
				S.TScroll.relPosCont=1;
			} 	
			top = Math.floor(  (idx+S.TScroll.offsetItem)*hTicketEl 
			                 - hContTicket*S.TScroll.relPosCont);
			if (top+hContTicket >= hScroll-hTerminal) {   // no hay mas elementos por abajo
				top = hScroll-hContTicket; 
				idx = nItems-1; 
				S.TScroll.offsetItem=1;
				S.TScroll.relPosCont=1;
			}
			if (top <= 0) {  // no hay mas elementos por arriba
				top = 0;
				idx = 0;
				S.TScroll.offsetItem=0;
				S.TScroll.relPosCont=0;
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
			S.TScroll.relPosCont=1;
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
				S.TScroll.relPosCont=(up-top)/hContTicket;
			}
		}
	}

	function setTicketSelected(item, el) {
		if (S.T.elSelected != null) S.T.elSelected.removeClass("g-state-active");
		S.T.elSelected = null;
		S.T.itemSelected = item;
		if (item != null) {
			S.T.elSelected = el;
			el.addClass("g-state-active");
			scrollTToVisible(item);
			butPlus.show();
			butMinus[(item.n > 1) ? "show" : "hide"]();
		} else {
			butPlus.hide();
			butMinus.hide();
		}
	}

	var optAgruparComanda_Venda = {
		group: function(grItemsDest, item) {
			if (grItemsDest[0].codi === item.codi) return 1;
			else return -1;
		},
		append: function(grItemsDest, item) {
			if (grItemsDest[0].codi === item.codi) return true;
			else return false;
		},
		increment: function(grItemsDest, inc) {
			return [inc];
		},
		remove_n0: true	
	}

	
	var delayRecentMod = 500;
	
	function changeComanda(C, autoChange) {
		if (autoChange) return;
		if (C == null) C = S.C;
		if (C === S.C) {
			var items = S.AC.getItems();
			if (S.nCTS != C.getNChangeTs()) {
				// init ticket, ticket Scroll, nueva comanda
				S.T = {};
				S.TScroll = {};
				S.nCTS = C.getNChangeTs();
			}
			if (!(divVenda.isVisible())) return;
			if ((S.estado !== "entrar") && (S.estado !== "total")) return;
			
			divTicketScroll.empty();
			
			if (S.C.isOpen() && (S.estado === "entrar")) {
				var itemSelected = S.AC.getItem(S.T.itemSelected);
				var elSelected = null;
				var itemRecentIns = S.AC.getItem(S.T.recentIns);
				S.T.recentIns = null;

				items.forEach(function(item) {
					// draw el
					var el = elemTicketModel.clone(true).height(hTicketEl).appendTo(divTicketScroll);
					el.data("item", item);
					el.data("import", calcImport(item));
					actualizarElemTicket(el);

					if (itemSelected === item) {
						elSelected = el;
					}
					if (itemRecentIns === item) {
						el.addClass("ticket_recent_mod");
						window.setTimeout(function (el) { el.removeClass("ticket_recent_mod"); }, delayRecentMod, el);
					}				
				});
				setTicketSelected(itemSelected, elSelected);
				if (itemRecentIns) scrollTToVisible(itemRecentIns);
			}
			// mantener terminalTicketElement visible para evitar repaint de todo el body
			terminalTicketElement.appendTo(divTicketScroll);
			if (S.estado === "entrar") ticketScroll();
			else divTicketScroll.css({ top : "0px" }); // ????
			actualizarVisor();
		}
	}
	
	// App Cobrar

	var divCobrar = $("<div>")._100x100().addClass("g-widget-content").appendTo(div0).hide();
	var cobrarTotal, cobrarEntregat, cobrarCanvi;
	var butImprimir,butSalir;
	
	(function() { // clousure para evitar interferencia de identificadores de la app de cobrar

		function imprimirTicket(e) {
			if (e.button !== 0) return;
			S.C.printTicket(S.tsCobrar);
		}
	
		var div1 = $("<div>").css({position: "absolute", top: "2em", left: "2em", fontFamily: "monospace"}).appendTo(divCobrar);
		
		var butModel = gButton().css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
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
				butModel.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
			}
		}
	
		var div1 = $("<div>").css({position: "absolute", top: "2em", right: "2em", whiteSpace: "pre", fontFamily: "monospace"})
							   .addClass("g-widget-content").appendTo(divCobrar);
		var div = $("<div>Total: </div>").appendTo(div1);
		cobrarTotal = $("<span>").css({float: "right", border: "1px solid black"}).appendTo(div);
		$("<div>&nbsp;</div>").appendTo(div1);
		var div = $("<div>Entregat: </div>").appendTo(div1);
		cobrarEntregat = $("<span>").css({float: "right", border: "1px solid black"}).appendTo(div);
		$("<div>&nbsp;</div>").appendTo(div1);
		var div = $("<div>Canvi: </div>").appendTo(div1);
		cobrarCanvi = $("<span>").css({float: "right", border: "1px solid black"}).appendTo(div);
		
		var divIS = $("<div>").css({position: "absolute", bottom: "2em", right: "2em"}).appendTo(divCobrar);
		butImprimir = gButton().appendTo(divIS).click(imprimirTicket);
		butSalir = gButton().appendTo(divIS).click(function(e){ 		
																if (e.button !== 0) return;
																S.estado="total"; 
																redraw();
														   });	
	})();
	
	function redrawCobrar() {
		butImprimir.text(M("imprimir"));
		butSalir.text(M("salir"));
	}
	
	function actualizarCobrar() {
		var entregat = parseImport(S.entregatStr);
		var canvi = entregat-S.totalFinal;
		
		cobrarTotal.text(formatImport(S.totalFinal, true).fillSpaceL(20));
		cobrarEntregat.text(String(entregat).fillSpaceL(20));
		cobrarCanvi.text(formatImport(canvi, true).fillSpaceL(20));
		cobrarCanvi.css({borderColor: (canvi >= 0) ? "black" : "red"});
	}
	
	return my;
}();

window.AppAbrirCaja = function() {
	var my = {};

	var S = null;

	var canvi = newSubAppCanviCaja();

	var div0 = $("<div>").absolutePos(0, layout.getHSubMenuPerc(), 100, 100).addClass("g-widget-content");
	var divAbrir = canvi.getDiv().appendTo(div0);
	var butCanviCorrecte = gButton().css({position: "absolute", width: "100%"})
	                                    .appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		if (e.button !== 0) return;
		Caja.abrir(S.canvi, codiDep);
		showDivEspere();
	});
	
	var divEspere = $("<div>")._100x100().css("zIndex", "1000").appendTo(div0);
	var divEspereInner = $("<div>")._100x100().text(M("Esperi...")).addClass('ui-widget-overlay');
	function showDivEspere() {
		divEspere.empty().show();
		window.setTimeout(function() { divEspereInner.appendTo(divEspere) }, 500);
	}
	
	var resized = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		Caja.addChangeHandler(function() {
			if (div0.isVisible() && Caja.isOpen()) {
				mp.finApp();
			}
		});

		Resize.add(function() { 
			resized = {}; 
			resizeDivAbrir(); 
		});

	};
	
	var mp;
	var codiDep;
	
	my.start = function(_mp) {
		if (Caja.isOpen()) {
			mp.finApp();
			return;
		}
		div0.showAlone();
		mp = _mp;
		codiDep = mp.getCodiDepActual(); 
		var dep = Dependentes.getByCodi(codiDep);
		if (dep && dep.esResponsable && Caja.isAdmin()) {
			divAbrir.showAlone();
			if (S == null) { 
				S = {
					canvi : Caja.getCanvi(),
					selected : 0
				};
			}
			S.primeraTecla = true;
			canvi.start(S);
			resizeDivAbrir();
		} else {
			DivMensajesCaja.appendTo(div0, "Caixa\nTancada");
		}
	};
	function resizeDivAbrir() {
		if (resized.divAbrir) return;
		if (!divAbrir.isVisible()) return; 
		canvi.resize();
		butCanviCorrecte.css({ top: "40%" /*(6*SEPpx)+"px"*/ }).text(M("Canvi Correcte"));
		resized.divAbrir = true;
	}
	
	return my;
}();

}); // Scripts.add VendaS 
