procesoVenda = function() {
	var my = {}

	var div0 = positionDiv(null,0,0,100,100);
	
	var alertDialog = createAlertDialog().header("Error")
	                                     .setButtons(["Ok"], function(text, i) { S.alertDialog=null; alertDialog.hide(); });
	alertDialog.getDiv().appendTo(div0);
	function showAlertDialog(text) {
		S.alertDialog = text;
		alertDialog.text(text);
		alertDialog.show();
	}
	
	var divVenda = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(div0).hide(); 
	
	var teclatsTpv = newDivTeclatsTpv();
	teclatsTpv.getDiv().appendTo(divVenda);
	
	teclatsTpv.clickAmbientHandler = function(data) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			clearTicket();
			actualizarTotalVisor();
		}
	}

	teclatsTpv.selectedProducteHandler = function(data) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			clearTicket();
			actualizarTotalVisor();
		}
		// var pos = $(this).data("pos");
		var article = data.article;
		if (article == null) return;
		
		var el = null, t;

		if (article.esSumable && S.fPeso) {	showAlertDialog("Aquest article no es ven a pes"); return; }
		if (!article.esSumable && !S.fPeso) { showAlertDialog("Aquest article es ven a pes"); return; }

		if (article.esSumable) {
			for (var idx=0; idx<S.ticket.length; idx++) {
				t = S.ticket[idx];
				if ((article.codi == t.article.codi) &&
				    (article.preu == t.article.preu) && 
					(article.esSumable == t.article.esSumable)) {
					el = $(divTicketScroll.get(0).childNodes[idx]);
					t.article.nom = article.nom;
					break;
				}
			}
		}
		if (el == null) {
			// crear nueva entrada en ticket
			el = modelElemTicket.clone(true).height(hElemTicket).appendTo(divTicketScroll);
			t = { article: article, cantidad: 0, import: 0 };
			S.ticket.push(t);
			S.idxElemScrollT = S.ticket.length;
			idx = S.ticket.length-1;
			S.relPosIdxElemScrollT = 1;
		} else {
			scrollTToVisible(idx);
		}
		setTicketSelected(-1);
		t.cantidad += (article.esSumable ? S.cantidad : S.cantidad/1000);
		actualizarElemTicket(idx);
		S.cantidad = 1;
		S.fPeso = false;
		S.fPrimeraPulsacionCantidad = false;
		actualizarTotalVisor();
		ticketScroll();
	}

	var buttonControlCantidad = $("<button>").css({boxSizing: "border-box", margin: "0px", verticalAlign: "middle"});

	function controlHandler(tipo) {
		return function(e) {
			if (S.estado != "entrar") {
				S.estado = "entrar";
				clearTicket();
				actualizarTotalVisor();
			}
			switch (tipo) {
				case "up" : 
					S.idxElemScrollT--;
					ticketScroll();
					break;
				case "down" :
					S.idxElemScrollT++;
					ticketScroll();
					break;	
				case "+" :
					if (S.idxTicketSelected >= 0) { 
						var t = S.ticket[S.idxTicketSelected];
						t.cantidad++;
						actualizarElemTicket(S.idxTicketSelected);
						actualizarTotalVisor();
					}
					break;
				case "-" :
					if (S.idxTicketSelected >= 0) { 
						var t = S.ticket[S.idxTicketSelected];
						if (t.cantidad > 1) {
							t.cantidad--;
							actualizarElemTicket(S.idxTicketSelected);
							actualizarTotalVisor();
						}
					}
					break;
				case "borrar" :
					if (S.idxTicketSelected >= 0) {
						var tmpIdxSel = S.idxTicketSelected;
						setTicketSelected(-1);
						S.ticket.splice(tmpIdxSel,1);
						$(divTicketScroll.get(0).childNodes[tmpIdxSel]).remove();
					} else {
						S.cantidad = 1;
						S.fPeso = false;
						S.fPrimeraPulsacionCantidad = false;
					}
					actualizarTotalVisor();
					ticketScroll();
					break;	
			}
		}
	}
	function elemTicketHandler(e) {
		for (var idx=0, el=divTicketScroll.get(0).firstChild; this != el; idx++, el=el.nextSibling);
		setTicketSelected(idx);
	}
	
	
	// borrar y cancel cantidad
	function butCantidadHandler(num) {
		return function(e) {
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
			actualizarTotalVisor();
		}
	}
	
	function pesoHandler(e) {
		if (S.estado == "total") {
			S.estado = "entrar";	
			clearTicket();
		}
		S.fPeso = !S.fPeso;
		actualizarTotalVisor();
	}
	
	function cobrarHandler(e) {
		switch (S.estado) {
			case "entrar":
//				abrirCajon();
				if (S.ticket.length == 0) return;
	
				S.estado = "total";
				var ticketDB = S.ticket;
				divTicketScroll.empty();
				actualizarTotalVisor();
				ticketScroll();
				var stat = "INSERT INTO [V_Venuts"+DB.mensualSufix+"] ([Botiga], [Data], [Dependenta], [Num_tick], "
																	 +"[Estat], [Plu], [Quantitat], [Import], "
																	 +"[Tipus_venta], [FormaMarcar], [Otros]) "
						  +" VALUES (?,?,?,?,?,?,?,?,?,?,?)";										 
				var db = DB.openMensual();
				db.transaction( function (tx) {
					var numTick = DB.getNumTicket();
					var date = new Date();
					var sqlDate = DB.getSqlDate(date);
					for (var i=0; i<ticketDB.length; i++) {
						var t = ticketDB[i];
						tx.executeSql(stat, [localStorage.getItem("ClienteId"), sqlDate, S.codi, numTick,
											 null, t.article.Codi, t.cantidad, t.import,
											 null, null, null],DB.success,DB.error);
					}
				});
				break;
			case "total":
				S.estado = "cobrar";	
				S.entregatStr = ""
				redraw();
//				actualizar();
				break;
		}
	}
	
	var Config = {
//		hAmbients : 0.15,
//		hTeclado : 0.6,
		nCarWTicket : 20,
		maxWTicket : 0.6,
		relWC_C : [2,4]      // relative width control_cantidad
	}

	var divAccions = $("<div>").appendTo(divVenda);
	var divControl = $("<div>").appendTo(divAccions);
	var divVisorTicketTotal = $("<div>").css({fontFamily: "monospace", whiteSpace: "pre"}).appendTo(divAccions);
	var divTecladoCantidad = $("<div>").appendTo(divAccions);

	// divControl
	var butScrollUp = buttonControlCantidad.clone(true).text("u").appendTo(divControl).hide().mousedown(controlHandler("up"));
	var butScrollDown = buttonControlCantidad.clone(true).text("d").appendTo(divControl).hide().mousedown(controlHandler("down"));
	var butBorrar = buttonControlCantidad.clone(true).text("borrar").appendTo(divControl).mousedown(controlHandler("borrar"));
	var butPlus = buttonControlCantidad.clone(true).text("+").appendTo(divControl).hide().mousedown(controlHandler("+"));
	var butMinus = buttonControlCantidad.clone(true).text("-").appendTo(divControl).hide().mousedown(controlHandler("-"));

	// divVisorTicketTotal
	var divVisor = $("<div>").css({border: "1px solid black", fontSize: "200%", fontWeight: "bold", 
	                               textAlign: "right", backgroundColor: "yellow"})
	                         .appendTo(divVisorTicketTotal);

	var divContTicket = $("<div>").css({overflow: "hidden"}).appendTo(divVisorTicketTotal);
	var divTicketScroll = $("<div>").css({position: "relative"}).appendTo(divContTicket);

	var divTotal = $("<div>").css({border: "1px solid black", fontSize: "120%", overflow: "hidden"}).appendTo(divVisorTicketTotal);

	// divTecladoCantidad
	var butCantidad = [];
	for (var i=0;i<=9;i++) {
		butCantidad.push(buttonControlCantidad.clone(true).text(""+i).appendTo(divTecladoCantidad).mousedown(butCantidadHandler(i)));
	}
	var butPeso = buttonControlCantidad.clone(true).text("Peso").appendTo(divTecladoCantidad).mousedown(pesoHandler);
	var butCobrar = buttonControlCantidad.clone(true).text("Cobrar").appendTo(divTecladoCantidad).mousedown(cobrarHandler);
	
	$("div", divVenda).css({boxSizing: "border-box"/*, visibility: "hidden"*/});
	
	var hElemTicket = 0;
	var numCarsElemTicket;
	var modelElemTicket =  $("<div>").css({boxSizing: "border-box", borderBottom: "1px dashed black",
	                                       width: "100%", overflow: "hidden"}).mousedown(elemTicketHandler);
	var hContTicket;
	
	var cantidad;
	var total;
	
	var callback; // no usado
	var S;
	
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		$(window).resize(function() {
			fResize = {};
			if (isDivVisible(divVenda)) resizeDivVenda(); 
			if (isDivVisible(alertDialog.getDiv())) alertDialog.show(); 
		});
		teclatsTpv.init();
	};
	my.start = function(dependenta, _callback) {
		div0.siblings().hide();
		div0.show();
		callback = _callback;
		restoreState(dependenta);
	};

	var fResize = {};
	
	function resizeDivVenda() {
		if (fResize.divVenda === false) return;

		var wDC = divVenda.width(), hDC = divVenda.height();
		
		teclatsTpv.resize();

		var y2 = teclatsTpv.getDiv().position().top+teclatsTpv.getDiv().height();
		posAbsolute(divAccions, 0, y2, wDC, hDC);
		//var w2=divBelowTeclat.width(), h2=divBelowTeclat.height();
		var w2 = wDC, h2 = hDC-y2;
		var tempText = divTotal.text();
		divTotal.text("X");
		var wTicket=divTotal.outerWidth(true), iw=divTotal.width(), hTotal=divTotal.outerHeight(true);
		divTotal.text(tempText);
		wTicket=(wTicket-iw)+iw*Config.nCarWTicket;
		wTicket = Math.round(Math.min(wTicket, Config.maxWTicket*w2));
		var wControl = Math.round((w2-wTicket)*(Config.relWC_C[0]/(Config.relWC_C[0]+Config.relWC_C[1])));
	
		posAbsolutePX(divControl, 0, 0, wControl, h2);
		posAbsolutePX(divVisorTicketTotal, wControl, 0, wControl+wTicket, h2);
 		posAbsolutePX(divTecladoCantidad, wControl+wTicket, 0, w2, h2);
		var wTecladoCantidad = w2-(wControl+wTicket);

		posAbsolutePX(butPlus, 0, 0, wControl/2, h2/3);                       // (0,0)
		posAbsolutePX(teclatsTpv.getButtonFindProducte(), 0, h2/3, wControl/2, 2*h2/3); // (0,1)
		posAbsolutePX(butMinus, 0, 2*h2/3, wControl/2, h2);                   // (0,2)
		posAbsolutePX(butScrollUp, wControl/2, 0, wControl, h2/3);            // (1,0)
		posAbsolutePX(butBorrar, wControl/2, h2/3, wControl, 2*h2/3);         ///(1,1)
		posAbsolutePX(butScrollDown, wControl/2, 2*h2/3, wControl, h2);       // (1,2)
		
		var tempText = divVisor.text();
		divVisor.text("X");
		var hVisor=divVisor.outerHeight(true);
		divVisor.text(tempText);
		
		posAbsolutePX(divVisor, 0, 0, wTicket, hVisor);
		posAbsolutePX(divContTicket, 0, hVisor, wTicket, h2-hTotal);
		posAbsolutePX(divTotal, 0, h2-hTotal, wTicket, h2);
		
		var testEl = modelElemTicket.clone(true).appendTo(divTicketScroll);
		var testSpan = $("<span>X</span>").appendTo(testEl);
		hElemTicket = testEl.outerHeight(true);
		numCarsElemTicket = Math.floor(testEl.width()/testSpan.width());
		testEl.remove();
		hContTicket = divContTicket.height();
		divTicketScroll.children().css({height: hElemTicket+"px"});

		for (var i=0, div=$(divTicketScroll.get(0).firstChild); div.length > 0; i++, div=div.next()) {
			actualizarElemTicket(i);
//			formatElemTicket(div, S.ticket[i]);	
		}
//		actualizarTicket();
		ticketScroll();

		var butCantLayout = [[7,8,9],[4,5,6],[1,2,3],[0]];
		for (var y=0; y<butCantLayout.length; y++) {
			for (var x=0; x<butCantLayout[y].length; x++) {
				posAbsolutePX(butCantidad[butCantLayout[y][x]], x*wTecladoCantidad/4, y*h2/4,
				                                              (x+1)*wTecladoCantidad/4, (y+1)*h2/4);
			}
		}
		posAbsolutePX(butPeso, 3*wTecladoCantidad/4, h2/4, wTecladoCantidad, 2*h2/4);
		posAbsolutePX(butCobrar, wTecladoCantidad/4, 3*h2/4, wTecladoCantidad, h2);
		fResize.divVenda = false;
	}
	function restoreState(dependenta) {
		S = dependenta.datosProceso.venda;
		if (S == null) {
			S = { 
				codi: dependenta.codi,
				estado: "entrar",
//				ambientActual: null,
				alertDialog: null,
				teclats: {},
			};
			clearTicket();
			dependenta.datosProceso.venda = S;
		}
		redraw();
	}
	function redraw() {
		switch (S.estado) {
			case "entrar":
			case "total":
				divVenda.siblings().hide();
				divVenda.show();
				teclatsTpv.redraw(S.teclats);
				divTicketScroll.empty();
				resizeDivVenda();
				if (S.estado == "entrar") {
					for (var i=0; i<S.ticket.length; i++) {
						var el = modelElemTicket.clone(true).height(hElemTicket).appendTo(divTicketScroll);
						actualizarElemTicket(i);
			//			formatElemTicket(el, S.ticket[i]);
					}
					setTicketSelected(S.idxTicketSelected);
				}
				actualizarTotalVisor();
				ticketScroll();
				if (S.alertDialog != null) showAlertDialog(S.alertDialog);
				break;
			case "cobrar":
				divCobrar.siblings().hide();
				divCobrar.show();
				actualizarCobrar();
				break;
		}
	}
	
	function clearTicket() {
		S.cantidad = 1;
		S.fPeso = false;
		S.fPrimeraPulsacionCantidad = false;
		S.idxElemScrollT = 0;
		S.relPosIdxElemScrollT = 0;
		divTicketScroll.empty();
		S.ticket = [];
//		redrawC();
		setTicketSelected(-1);
		ticketScroll();
	}
	function formatImport(imp) {
		var strI = imp.toFixed(2);
/*		if (imp < 1) {
			strI = strI.slice(2)+" Cn";	
		} else {
*/			for (var iComa=3+1+2; iComa < strI.length; iComa+=1+3) {
				strI = strI.slice(0,-iComa)+","+strI.slice(-iComa);
			}
			strI = strI+" €";	
/*		}
*/		return strI;
	}
	function formatElemTicket(div, data) {
		var prec = (data.article.EsSumable) ? 0 : 3;
		var strC = ""+data.cantidad.toFixed(prec);
		var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
		for (; iComa < strC.length; iComa+=3+1) {
			strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
		}
		if (strC.length > 6) strC="******";
		else while(strC.length < 6) strC = " "+strC;

		var lenC = strC.length;

		var strI = formatImport(data.import);

		var lenN = numCarsElemTicket-6-1-1-strI.length;
		if (lenN<1) lenI=1;
		var strN = data.article.NOM.substring(0,lenN);
		while (strN.length < lenN) strN=strN+" ";
		var str = strC+" "+strN+" "+strI;
		div.text(str);
	}
	function actualizarElemTicket(i) {
		var t = S.ticket[i];
		t.import = Math.round(t.cantidad*t.article.PREU*100)/100;
		formatElemTicket($(divTicketScroll.get(0).childNodes[i]), t);	
	}
	function actualizarTotalVisor() {
		S.total = 0;
		for (var i=0; i<S.ticket.length; i++) { S.total += S.ticket[i].import; } 
		S.total = Math.round(S.total*100)/100; //??
		if (S.estado == "entrar") {
			divVisor.text(S.cantidad+(S.fPeso ? " Gr." : ""));
			divTotal.text("Total: "+formatImport(S.total)); // format	
		}
		if (S.estado == "total") {
			divVisor.text("Total: "+formatImport(S.total));
			divTotal.text("");
		}
//		ticketScroll();
	}
	function ticketScroll(idxElem, relPosIdxElem) {
		if (idxElem != null) S.idxElemScrollT = idxElem;
		if (relPosIdxElem != null) S.relPosIdxElemScrollT = relPosIdxElem;
		var top = Math.floor(S.idxElemScrollT*hElemTicket - hContTicket*S.relPosIdxElemScrollT);
		if (top+hContTicket >= divTicketScroll.children().length*hElemTicket) {
			top = divTicketScroll.children().length*hElemTicket-hContTicket; 
			S.idxElemScrollT = divTicketScroll.children().length;
			S.relPosIdxElemScrollT = 1;
		}
		if (top <= 0) {
			top = 0;
			S.idxElemScrollT = 0;
			S.relPosIdxElemScrollT = 0;
		}
		divTicketScroll.css({top : -top+"px"});
		butScrollUp[(top <= 0) ? "hide" : "show"](); 
		butScrollDown[(top+hContTicket >= divTicketScroll.children().length*hElemTicket) ? "hide" : "show"]();			
	}
	function scrollTToVisible(idx) {
		var el = $(divTicketScroll.get(0).childNodes[idx]);
		var topEl = -el.position().top;
		var topScroll = -divTicketScroll.position().top;
		var relPos = (topEl-topScroll)/hContTicket;
		var relPos1 = (topEl+hElemTicket-topScroll)/hContTicket;
		
		if (relPos1 >= 1) {
			S.idxElemScrollT = idx+1;
			S.relPosIdxElemScrollT = 1; 
		} else {
			if (relPos < 0) relPos = 0;
			S.idxElemScrollT = idx;
			S.relPosIdxElemScrollT = relPos; 	
		}
	}
	function setTicketSelected(idx) {
		if (S.idxTicketSelected >= 0) {
			var el = divTicketScroll.get(0).childNodes[S.idxTicketSelected];
			if (el != null) $(el).removeClass("ui-state-active");
		}
		S.idxTicketSelected = idx;
		if (S.idxTicketSelected >= 0) {
			$(divTicketScroll.get(0).childNodes[idx]).addClass("ui-state-active");
			scrollTToVisible(idx);
			butPlus.show();
			butMinus.show();
		} else {
			butPlus.hide();
			butMinus.hide();
		}
	}
	
	// proceso Cobrar

	var divCobrar = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(div0).hide();
	var cobrarTotal, cobrarEntregat, cobrarCanvi;
		
	(function() {
	
		var div1 = $("<div>").css({position: "absolute", top: "2em", left: "2em", fontFamily: "monospace"}).appendTo(divCobrar);
		
		var modelBut = $("<button>").css({width: "3em", height: "3em"}).click(function (e) {
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
		$("<button>imprimir</button>").appendTo(divIS).click(function(){});
		$("<button>salir</button>").appendTo(divIS).click(function(){ S.estado="total"; redraw();});	
	})();
	
	function actualizarCobrar() {
		function format(val) { 
			var str = formatImport(val);
			while(str.length < 20) { str = " "+str; } 
			return str;
		};

		var entregat = Number(S.entregatStr);
		var canvi = entregat-S.total;
		
		cobrarTotal.text(format(S.total));
		cobrarEntregat.text(format(entregat));
		cobrarCanvi.text(format(canvi));
		cobrarCanvi.css({borderColor: (canvi >= 0) ? "black" : "red"});
	}
	
	return my;
}();

