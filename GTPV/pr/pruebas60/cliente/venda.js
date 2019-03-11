procesoVenda = function() {
	var my = {}

	var div0 = positionDiv(null,0,0,100,100);
	
	var alertDialog = createAlertDialog().header("Error")
	                                     .setButtons(["Ok"], function(text, i) { S.alertDialog=null; });
	alertDialog.getDiv().appendTo(div0);
	function showAlertDialog(text) {
		S.alertDialog = text;
		alertDialog.text(text);
		alertDialog.show();
	}
	
	var divVenda = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(div0); 
	
	var divT = $("<div>").css({ position: "relative" }).appendTo(divVenda);
	var teclatsTpv = newDivTeclatsTpv();
	teclatsTpv.getDiv().appendTo(divT);
	teclatsTpv.displayEmptyArticles = false;

	teclatsTpv.clickAmbientHandler = function(data) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			clearTicket();
			actualizarVisor();
		}
	}

	teclatsTpv.selectedArticleHandler = function(data) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			clearTicket();
			actualizarVisor();
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
					el = divTicketScroll.children().eq(idx);
					t.article.nom = article.nom;
					break;
				}
			}
		}
		if (el == null) {
			// crear nueva entrada en ticket
			el = modelElemTicket.clone(true).appendTo(divTicketScroll);
			setOH(el, hTicketEl);
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
		actualizarVisor();
		ticketScroll();
	}

	function controlHandler(e) {
		if (S.estado != "entrar") {
			S.estado = "entrar";
			clearTicket();
			actualizarVisor();
		}
		switch ($(this).data("tipo")) {
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
					actualizarVisor();
				}
				break;
			case "-" :
				if (S.idxTicketSelected >= 0) { 
					var t = S.ticket[S.idxTicketSelected];
					if (t.cantidad > 1) {
						t.cantidad--;
						actualizarElemTicket(S.idxTicketSelected);
						actualizarVisor();
					}
				}
				break;
			case "borrar" :
				if (S.idxTicketSelected >= 0) {
					var tmpIdxSel = S.idxTicketSelected;
					setTicketSelected(-1);
					S.ticket.splice(tmpIdxSel,1);
					divTicketScroll.children().eq(tmpIdxSel).remove();
				} else {
					S.cantidad = 1;
					S.fPeso = false;
					S.fPrimeraPulsacionCantidad = false;
				}
				actualizarVisor();
				ticketScroll();
				break;	
		}
	}
	var buttonControl = $("<button>").css({verticalAlign: "middle"}).mousedown(controlHandler);
	var buttonCantidad = $("<button>").css({verticalAlign: "middle"});


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
			actualizarVisor();
		}
	}
	
	function pesoHandler(e) {
		if (S.estado == "total") {
			S.estado = "entrar";	
			clearTicket();
		}
		S.fPeso = !S.fPeso;
		actualizarVisor();
	}
	
	function cobrarHandler(e) {
		switch (S.estado) {
			case "entrar":
//				abrirCajon();
				if (S.ticket.length == 0) return;
	
				var ticketDB = S.ticket; // pueden borrar ticket antes de guardar en DB
				S.estado = "total";
				var numTick = GlobalGTPV.get("numTicket");
				if (numTick == null) numTick = 1;
				S.numTick = numTick;
				GlobalGTPV.set("numTicket", numTick+1);
				var date = new Date();
				S.date = date;
				var codiDep = S.codi; 
				redraw();
				var caja = Caja.get();
				caja.zeta += S.total;
				caja.clients++;
				Caja.set(caja);
				/*divTicketScroll.empty();
				actualizarVisor();
				ticketScroll();*/
				var db = DB.openMensual();
				var suf = DB.getMensualSufix();
				db.transaction(function (tx) {
					var stat = "CREATE TABLE IF NOT EXISTS [V_Venuts_"+suf+"] "
							  +"([Botiga] float NULL, [Data] datetime NULL,	"
							  +" [Dependenta] float NULL, [Num_tick] float NULL, "
							  +" [Estat] nvarchar(25) NULL, [Plu] float NULL, "
							  +" [Quantitat] float NULL, [Import] float NULL, "
							  +" [Tipus_venta] nvarchar(25) NULL, [FormaMarcar] nvarchar(255) NULL, "
							  +" [Otros] nvarchar(255) NULL) ";
					tx.executeSql(stat, []);
					var stat = "INSERT INTO [V_Venuts"+suf+"] ([Botiga], [Data], [Dependenta], [Num_tick], "
															 +"[Estat], [Plu], [Quantitat], [Import], "
															 +"[Tipus_venta], [FormaMarcar], [Otros]) "
							  +" VALUES (?,?,?,?,?,?,?,?,?,?,?)";										 
					var sqlDate = DB.getSqlDate(date);
					for (var i=0; i<ticketDB.length; i++) {
						var t = ticketDB[i];
						tx.executeSql(stat, [GlobalGTPV.get("Llicencia"), sqlDate, codiDep, numTick,
											 null, t.article.codi, t.cantidad, t.import,
											 null, null, null]);
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
	var butBorrar = buttonControl.clone(true).text("borrar").data("tipo","borrar").appendTo(divOtrosButtons);
	var butPlus = buttonControl.clone(true).text("+").data("tipo","+").appendTo(divOtrosButtons);
	var butMinus = buttonControl.clone(true).text("-").data("tipo","-").appendTo(divOtrosButtons);

	// divVisorTicketTotal
	var divVisor = $("<div>").css({border: "1px solid black", fontSize: "200%", fontWeight: "bold" }) 
	                         .appendTo(divVisorTicket);
	var divTotal = $("<div>").css({border: "1px solid black", textAlign: "left", display: "inline-block", 
	                               padding: "0 0.5em", verticalAlign: "middle", overflow: "hidden"})
	                         .appendTo(divVisor); 
	var divCantidad = $("<div>").css({border: "1px solid black", textAlign: "right", display: "inline-block", 
	                                  padding: "0 0.5em", verticalAlign: "middle", overflow: "hidden", backgroundColor: "yellow"})
	                            .appendTo(divVisor);  
	var divContTicket = $("<div>").css({overflow: "hidden"}).appendTo(divVisorTicket);
	var divTicketScroll = $("<div>").css({position: "relative"}).appendTo(divContTicket);

//	var divTotal = $("<div>").css({border: "1px solid black", fontSize: "120%", overflow: "hidden"}).appendTo(divVisorTicketTotal);

	// divTecladoCantidad
	var butCantidad = [];
	for (var i=0;i<=9;i++) {
		butCantidad.push(buttonCantidad.clone(true).text(""+i).appendTo(divTecladoCantidad).mousedown(butCantidadHandler(i)));
	}
	var butPeso = buttonCantidad.clone(true).text("Peso").appendTo(divTecladoCantidad).mousedown(pesoHandler);
	var butCobrar = buttonCantidad.clone(true).text("Cobrar").appendTo(divTecladoCantidad).mousedown(cobrarHandler);
	
//	$("div", divVenda).css({boxSizing: "border-box"/*, visibility: "hidden"*/});
	
	var hTicketEl = 0;
	var numCarsElemTicket = 0;
	var modelElemTicket =  $("<div>").css({boxSizing: "border-box", borderBottom: "1px dashed black",
	                                       width: "100%", overflow: "hidden"}).mousedown(elemTicketHandler);
	var hContTicket = 0;
	
	var cantidad;
	var total;
	
	var S;
	var fResize = {};
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		teclatsTpv.init();
		procesoAbrirCaja.init(div00);

		$(window).resize(function() {
			fResize = {};
			if (isDivVisible(divVenda)) resizeDivVenda(); 
			if (isDivVisible(alertDialog.getDiv())) alertDialog.show(); 
		});
	};
	my.start = function(dep) {
		if (procesoAbrirCaja.start(dep)) return;
		div0.siblings().hide();
		div0.show();
		restoreState(dep);
	};

	function resizeDivVenda() {
		if (fResize.divVenda === false) return;

//		divVenda.children().hide(); // * evitar que salgan scrollbars
		var wDC = divVenda.width(), hDC = divVenda.height();
//		divVenda.children().show(); // *
		
		divT.height(Config.hAmbientsTeclats*hDC);
		teclatsTpv.resize();

		divAccions.height(hDC-Config.hAmbientsTeclats*hDC);

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
		divTicketScroll.children().each(function(i,el) { setOH($(el), hTicketEl); });
		var nEl = divTicketScroll.children().length
		for (var i=0; i < nEl; i++) {
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
		posAbsolutePX(butMinus, 0, 2*hOB/3, wOB/2, hOB);                   // (0,2)
		posAbsolutePX(butScrollUp, wOB/2, 0, wOB, hOB/3);            // (1,0)
		posAbsolutePX(butBorrar, wOB/2, hOB/3, wOB, 2*hOB/3);         //(1,1)
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
	function restoreState(dep) {
		dep = dep || DepActives.getActual();
		S = DepActives.getDatosProceso("venda", dep);
		if (S.estado == null) {
			S.estado = "entrar";
			S.codi = dep.dep.codi;
			S.alertDialog = null;
			S.teclats = {};
			clearTicket();
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
						var el = modelElemTicket.clone(true).height(hTicketEl).appendTo(divTicketScroll);
						actualizarElemTicket(i);
			//			formatElemTicket(el, S.ticket[i]);
					}
					setTicketSelected(S.idxTicketSelected);
				}
				actualizarVisor();
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
		S.numTick = null;
		S.date = null;
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
		var prec = (data.article.esSumable) ? 0 : 3;
		var strC = ""+data.cantidad.toFixed(prec);
		var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
		for (; iComa < strC.length; iComa+=3+1) {
			strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
		}
		if (strC.length > 6) strC="******";
		else while(strC.length < 6) strC = " "+strC;

		var lenC = strC.length;

		var strI = formatImport(data.import);

		var lenN = numCarsElemTicket-6-1-1-strI.length-1;
		if (lenN<1) lenI=1;
		var strN = data.article.nom.substring(0,lenN);
		while (strN.length < lenN) strN=strN+" ";
		var str = strC+" "+strN+" "+strI+" ";
		div.text(str);
	}
	function actualizarElemTicket(i) {
		var t = S.ticket[i];
		t.import = Math.round(t.cantidad*t.article.preu*100)/100;
		formatElemTicket(divTicketScroll.children().eq(i), t);	
	}
	function actualizarVisor() {
		S.total = 0;
		for (var i=0; i<S.ticket.length; i++) { S.total += S.ticket[i].import; } 
		S.total = Math.round(S.total*100)/100; //??
		if (S.estado == "entrar") {
			divCantidad.text(S.cantidad+(S.fPeso ? " Gr." : ""));
		} else divCantidad.text("");
		divTotal.text("Total: "+formatImport(S.total)); // format	
//		ticketScroll();
	}
	function ticketScroll(idxElem, relPosIdxElem) {
		if (idxElem != null) S.idxElemScrollT = idxElem;
		if (relPosIdxElem != null) S.relPosIdxElemScrollT = relPosIdxElem;
		var top = Math.floor(S.idxElemScrollT*hTicketEl - hContTicket*S.relPosIdxElemScrollT);
		if (top+hContTicket >= divTicketScroll.children().length*hTicketEl) {
			top = divTicketScroll.children().length*hTicketEl-hContTicket; 
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
		butScrollDown[(top+hContTicket >= divTicketScroll.children().length*hTicketEl) ? "hide" : "show"]();			
	}
	function scrollTToVisible(idx) {
		var el = divTicketScroll.children().eq(idx);
		var topEl = -el.position().top;
		var topScroll = -divTicketScroll.position().top;
		var relPos = (topEl-topScroll)/hContTicket;
		var relPos1 = (topEl+hTicketEl-topScroll)/hContTicket;
		
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
			divTicketScroll.children().eq(S.idxTicketSelected).removeClass("ui-state-active");
		}
		S.idxTicketSelected = idx;
		if (S.idxTicketSelected >= 0) {
			divTicketScroll.children().eq(idx).addClass("ui-state-active");
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
		
		var modelBut = $("<button>").css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
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

var procesoAbrirCaja = function() {
	var my = {};

	var D = null;

	var canvi = newProcesoCanviCaja();

	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100).addClass("ui-widget-content");
	var divAbrir = canvi.getDiv().appendTo(div0);
	var divCajaCerrada = positionDiv(null,0,0,100,100).text("Caixa Tancada").addClass("ui-widget-content").appendTo(div0);
	var butCanviCorrecte = $("<button>").css({position: "absolute", width: "100%"})
	                                    .text("Canvi Correcte").appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		var c = Caja.get();
		c.canvi = D.canvi;
		c.primera = dep;
		Caja.abrir(c);
		D = null;
		procesoVenda.start(dep);
	});
	
	var fResize = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		$(window).resize(function() {
			fResize = {};
			if (isDivVisible(divAbrir)) resize(); 
		});
	};
	var dep; 
	my.start = function(_dep) {
		if (Caja.get().oberta) return false;
		div0.siblings().hide();
		div0.show();
		dep = _dep || DepActives.getActual();
		if (dep.dep.tipusTreballador == "GERENT") {
			divAbrir.siblings().hide();
			divAbrir.show();
			if (D == null) { 
				D = {
					canvi : Caja.get().canvi.slice(0),
					selected : 0,
				};
			}
			D.primeraTecla = true;
			canvi.start(D);
			resize();
		} else {
			divCajaCerrada.siblings().hide();
			divCajaCerrada.show();
		}
		return true;
	};
	function resize() {
		if (fResize.divAbrir === false) return;
		canvi.resize();
		butCanviCorrecte.css({ top: (6*PAD)+"px" });
		fResize.divAbrir = false;
	}
	
	return my;
}();

