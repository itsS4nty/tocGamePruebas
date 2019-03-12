procesoComanda = function() {
	var my = {}

	var nX=6, nY=6;
	var datosTeclats = [];
	
	var div0 = positionDiv(null,0,0,100,100);
	
	var divComanda = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(div0).hide(); 

	var AmbientsScroll = new myScroll("_lr", nX);
	positionDiv(AmbientsScroll.getDiv(),0,0,100,20).appendTo(divComanda);

	function clickButtonAmbient(e) {
		if (S.estado != "entrar") {
			clearTicket();
			S.estado = "entrar";
			actualizarTicket();
		}
		var el;
		if (S.ambientActual != null) {
			for (var i=0; (el = AmbientsScroll.get(i)) != null; i++) {
				if (S.ambientActual == el.text()) {
					el.children().removeClass("ui-state-active");
				}
				if (this == el.children().get(0)) {
					$(this).addClass("ui-state-active");
					AmbientsScroll.scrollTo(i, true);
				}
			}
		}
		S.ambientActual = $(this).text();
		setButtonsTeclatsTpv(S.ambientActual);
	}
	
	var AmbientModel = $("<button>").css({boxSizing: "border-box", width: "100%", height: "100%", margin: "0px"})
						            /*.addClass("ui-corner-all")*/
						            .mousedown(clickButtonAmbient);
	
	var divTeclatProductes = $("<div>").addClass("ui-widget-content").appendTo(divComanda);

	function clickButtonTeclatTpv(e) {
		if (S.estado != "entrar") {
			clearTicket();
			S.estado = "entrar";
			actualizarTicket();	
		}
		// var pos = $(this).data("pos");
		var article = $(this).data("article");
		if (article == null) return;
		
		var el = null, t;
		if (article.EsSumable && S.fPeso) {
		}
		if (!article.EsSumable && !S.fPeso) {
		}
		if (article.EsSumable) {
			for (var idx=0; idx<S.ticket.length; idx++) {
				t = S.ticket[idx];
				if ((article.Codi == t.article.Codi) &&
				    (article.PREU == t.article.PREU) && 
					(article.EsSumable == t.article.EsSumable)) {
					el = $(divTicketScroll.get(0).childNodes[idx]);
					t.article.NOM = article.NOM;
					break;
				}
			}
		}
		if (el == null) {
			// create El
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
		t.cantidad += (article.EsSumable ? S.cantidad : S.cantidad/1000);
		actualizarElemTicket(idx);
		S.cantidad = 1;
		S.fPeso = false;
		S.fPrimeraPulsacionCantidad = false;
		actualizarTicket();
	}

	var buttonModel = $("<button>").css({boxSizing: "border-box", margin: "0px", 
								         color: "black", verticalAlign: "middle"})
						           /*.addClass("ui-corner-all")*/
						           .click(clickButtonTeclatTpv);
	var arrayButtons = [];
	for (var x=0; x<nX; x++) {
		for (var y=0; y<nY; y++) {
			arrayButtons[x*nY+y] = buttonModel.clone(true).data("pos", x*nY+y).appendTo(divTeclatProductes);
		}
	}
	
	var buttonControlCantidad = $("<button>").css({boxSizing: "border-box", margin: "0px", verticalAlign: "middle"});

	function controlHandler(tipo) {
		return function(e) {
			if (S.estado != "entrar") {
				S.estado = "entrar";
				clearTicket();
				actualizarTicket();
			}
			switch (tipo) {
				case "up" : 
					S.idxElemScrollT--;
					ticketScrollTo();
					break;
				case "down" :
					S.idxElemScrollT++;
					ticketScrollTo();
					break;	
				case "+" :
					if (S.idxTicketSelected >= 0) { 
						var t = S.ticket[S.idxTicketSelected];
						t.cantidad++;
						actualizarElemTicket(S.idxTicketSelected);
						actualizarTicket();
					}
					break;
				case "-" :
					if (S.idxTicketSelected >= 0) { 
						var t = S.ticket[S.idxTicketSelected];
						if (t.cantidad > 1) {
							t.cantidad--;
							actualizarElemTicket(S.idxTicketSelected);
							actualizarTicket();
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
					actualizarTicket();	
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
			actualizarTicket();
		}
	}
	
	function pesoHandler(e) {
		if (S.estado == "total") {
			S.estado = "entrar";	
			clearTicket();
		}
		S.fPeso = !S.fPeso;
		actualizarTicket();
	}
	
	function cobrarHandler(e) {
		switch (S.estado) {
			case "entrar":
//				abrirCajon();
				if (S.ticket.length == 0) return;
	
				S.estado = "total";
				var ticketDB = S.ticket;
				divTicketScroll.empty();
				actualizarTicket();			
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
		hAmbients : 0.2,
		hTeclado : 0.6,
		nCarWTicket : 20,
		maxWTicket : 0.6,
		relWC_C : [2,4]
	}

	var divBelowTeclat = $("<div>").appendTo(divComanda);
	var divControl = $("<div>").appendTo(divBelowTeclat);
	var divVisorTicketTotal = $("<div>").css({fontFamily: "monospace", whiteSpace: "pre"}).appendTo(divBelowTeclat);

	var divVisor = $("<div>").css({border: "1px solid black", fontSize: "200%", fontWeight: "bold", 
	                               textAlign: "right", backgroundColor: "yellow"})
	                         .appendTo(divVisorTicketTotal);

	var divContTicket = $("<div>").css({overflow: "hidden"}).appendTo(divVisorTicketTotal);
	var divTicketScroll = $("<div>").css({position: "relative"}).appendTo(divContTicket);

	var divTotal = $("<div>").css({border: "1px solid black", fontSize: "120%", overflow: "hidden"}).appendTo(divVisorTicketTotal);

	var divTecladoCantidad = $("<div>").appendTo(divBelowTeclat);

	var butScrollUp = buttonControlCantidad.clone(true).text("u").appendTo(divControl).hide().mousedown(controlHandler("up"));
	var butScrollDown = buttonControlCantidad.clone(true).text("d").appendTo(divControl).hide().mousedown(controlHandler("down"));
	var butBorrar = buttonControlCantidad.clone(true).text("borrar").appendTo(divControl).mousedown(controlHandler("borrar"));
	var butPlus = buttonControlCantidad.clone(true).text("+").appendTo(divControl).hide().mousedown(controlHandler("+"));
	var butMinus = buttonControlCantidad.clone(true).text("-").appendTo(divControl).hide().mousedown(controlHandler("-"));

	// divTecladoCantidad
	var butCantidad = [];
	for (var i=0;i<=9;i++) {
		butCantidad.push(buttonControlCantidad.clone(true).text(""+i).appendTo(divTecladoCantidad).mousedown(butCantidadHandler(i)));
	}
	var butPeso = buttonControlCantidad.clone(true).text("Peso").appendTo(divTecladoCantidad).mousedown(pesoHandler);
	var butCobrar = buttonControlCantidad.clone(true).text("Cobrar").appendTo(divTecladoCantidad).mousedown(cobrarHandler);
	
	$("div", divComanda).css({boxSizing: "border-box"/*, visibility: "hidden"*/});
	
	var hElemTicket = 0;
	var numCarsElemTicket;
	var modelElemTicket =  $("<div>").css({boxSizing: "border-box", borderBottom: "1px dashed black",
	                                       width: "100%", overflow: "hidden"}).mousedown(elemTicketHandler);
	var hContTicket;
	
	var cantidad;
	var total;
	
	var callback;
	var S;
	
	function posAbsolute(div, x0, y0, x1, y1) {
		x0 = Math.round(x0); y0 = Math.round(y0);
		x1 = Math.round(x1); y1 = Math.round(y1);
		div.css({position: "absolute", left: x0+"px", top: y0+"px", width: (x1-x0)+"px", height: (y1-y0)+"px"}); 	
	}
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		$(window).resize(function() { 
			if (divComanda.get(0).offsetWidth > 0) resizeDivComanda(); 
		});
		obtenerDB();
		callbackComunicacion.add(function() {
			obtenerDB();	
		});
	};
	my.start = function(dependenta, _callback) {
		div0.siblings().hide();
		div0.show();
//		callback = _callback;
		restoreState(dependenta);
	};

	var prevWDComanda = -1, prevHDComanda = -1;
	
	function resizeDivComanda() {
		var wDC = divComanda.width(), hDC = divComanda.height();
		if ((prevWDComanda == wDC) && (prevHDComanda == hDC)) return;
		prevWDComanda = wDC; prevHDComanda = hDC;	
		
		var y1 = Math.round(Config.hAmbients*hDC);
		posAbsolute(AmbientsScroll.getDiv(), 0, 0, wDC, y1);
		AmbientsScroll.redraw();
		var y2 = y1+Math.round(Config.hTeclado*hDC);
		posAbsolute(divTeclatProductes, 0, y1, wDC, y2);
		var w1=divTeclatProductes.width(), h1=divTeclatProductes.height();
		for (var x=0; x<nX; x++) {
			for (var y=0; y<nY; y++) {
				posAbsolute(arrayButtons[x*nY+y], (x/nX)*w1, (y/nY)*h1, ((x+1)/nX)*w1, ((y+1)/nY)*h1);
			}
		}
		
		posAbsolute(divBelowTeclat, 0, y2, wDC, hDC);
		var w2=divBelowTeclat.width(), h2=divBelowTeclat.height();
		var tempText = divTotal.text();
		divTotal.text("X");
		var wTicket=divTotal.outerWidth(true), iw=divTotal.width(), hTotal=divTotal.outerHeight(true);
		divTotal.text(tempText);
		wTicket=(wTicket-iw)+iw*Config.nCarWTicket;
		wTicket = Math.round(Math.min(wTicket, Config.maxWTicket*w2));
		var wControl = Math.round((w2-wTicket)*(Config.relWC_C[0]/(Config.relWC_C[0]+Config.relWC_C[1])));
	
		posAbsolute(divControl, 0, 0, wControl, h2);
		posAbsolute(divVisorTicketTotal, wControl, 0, wControl+wTicket, h2);
 		posAbsolute(divTecladoCantidad, wControl+wTicket, 0, w2, h2);
		var wTecladoCantidad = w2-(wControl+wTicket);

		posAbsolute(butPlus, 0, 0, wControl/2, h2/3);                       // (0,0)
		posAbsolute(butMinus, 0, 2*h2/3, wControl/2, h2);                   // (0,2)
		posAbsolute(butScrollUp, wControl/2, 0, wControl, h2/3);            // (1,0)
		posAbsolute(butBorrar, wControl/2, h2/3, wControl, 2*h2/3);         ///(1,1)
		posAbsolute(butScrollDown, wControl/2, 2*h2/3, wControl, h2);       // (1,2)
		
		var tempText = divVisor.text();
		divVisor.text("X");
		var hVisor=divVisor.outerHeight(true);
		divVisor.text(tempText);
		
		posAbsolute(divVisor, 0, 0, wTicket, hVisor);
		posAbsolute(divContTicket, 0, hVisor, wTicket, h2-hTotal);
		posAbsolute(divTotal, 0, h2-hTotal, wTicket, h2);
		
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
		actualizarTicket();
//		ticketScrollTo(/*S.idxElScrollT, S.relPosIdxElScrollT*/); 

		var butCantLayout = [[7,8,9],[4,5,6],[1,2,3],[0]];
		for (var y=0; y<butCantLayout.length; y++) {
			for (var x=0; x<butCantLayout[y].length; x++) {
				posAbsolute(butCantidad[butCantLayout[y][x]], x*wTecladoCantidad/4, y*h2/4,
				                                              (x+1)*wTecladoCantidad/4, (y+1)*h2/4);
			}
		}
		posAbsolute(butPeso, 3*wTecladoCantidad/4, h2/4, wTecladoCantidad, 2*h2/4);
		posAbsolute(butCobrar, wTecladoCantidad/4, 3*h2/4, wTecladoCantidad, h2);
	}
	function restoreState(dependenta) {
		S = dependenta.datosProceso.Comanda;
		if (S == null) {
			S = { 
				codi: dependenta.codi,
				estado: "entrar",
				ambientActual: null,
			};
			clearTicket();
			dependenta.datosProceso.Comanda = S;
		}
		redraw();
	}
	function redraw() {
		switch (S.estado) {
			case "entrar":
			case "total":
				divComanda.siblings().hide();
				divComanda.show();
				actualizarAmbients();
				divTicketScroll.empty();
				resizeDivComanda();
				for (var i=0; i<S.ticket.length; i++) {
					var el = modelElemTicket.clone(true).height(hElemTicket).appendTo(divTicketScroll);
					actualizarElemTicket(i);
		//			formatElemTicket(el, S.ticket[i]);
				}
				setTicketSelected(S.idxTicketSelected);
				actualizarTicket();
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
	function actualizarTicket() {
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
		ticketScrollTo();
	}
	function ticketScrollTo(idxElem, relPosIdxElem) {
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
	
	function obtenerDB() {
		var db = DB.openPrincipal();
		db.transaction(function (tx) {
			var statement = "SELECT t.pos as Pos, t.Color as Color, t.Ambient as Ambient, a.* "
			               +"FROM (SELECT * FROM TeclatsTpv "+/*WHERE (Llicencia = ?) OR (Llicencia = NULL)*/") as t " 
			               +"LEFT JOIN articles as a ON (t.Article = a.Codi)" 
			tx.executeSql(statement, [/*localStorage.getItem("ClienteId")*/], function (tx,res) {
				datosTeclats = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					for (var j=0, teclat={ambient:row.Ambient, buttons:[]}; j<datosTeclats.length; j++) {
						if (datosTeclats[j].ambient == row.Ambient) { teclat = datosTeclats[j]; break; }
					}
					teclat.buttons[row.Pos] = row;
					datosTeclats[j] = teclat;
				}
				datosTeclats.sort(function(a,b) { return ((a.ambient<b.ambient) ? -1 : ((a.ambient>b.ambient)?1:0) )});
				if (divComanda.get(0).offsetWidth > 0) actualizarAmbients();
			});
		});
	}
	
	function actualizarAmbients() {
		AmbientsScroll.removeAll();
		for (var j=0, posAct=-1; j<datosTeclats.length; j++) {
			if (datosTeclats[j].ambient == S.ambientActual) { posAct = j; break; }
		}
		if (posAct == -1) {
			if (datosTeclats.length > 0) { posAct = 0; S.ambientActual = datosTeclats[0].ambient; }
			else S.ambientActual = null;
		}
		for (var i=0; i<datosTeclats.length; i++) {
			AmbientModel.clone(true).text(datosTeclats[i].ambient)
                                    .addClass("ui-state-default")
  	                                .addClass((i == posAct) ? "ui-state-active" : "")
									.appendTo(AmbientsScroll.newElement().css({ verticalAlign: "middle" }));
			
		}
		if (posAct >= 0) AmbientsScroll.scrollTo(posAct, true);
		AmbientsScroll.redraw();
		setButtonsTeclatsTpv(S.ambientActual);
	}
	function clearButton(but) {
		but.css({ visibility: "hidden" }).data("article",null);
	}
	function getBackgroundColor(color) {
		if ((typeof color == "number") && (color >= 0) && (color < 256*256*256)) 
			return "rgb("+[(color>>16)%256, (color>>8)%256, color%256].join(",")+")";
		return "";
	}
	function setButtonsTeclatsTpv(ambient) {
		for (var j=0, t=[]; j<datosTeclats.length; j++) {
			if (datosTeclats[j].ambient == ambient) {t=datosTeclats[j].buttons; break;}
		}
		
		for (var i=0; i<arrayButtons.length; i++) {
			var data = t[i], but = arrayButtons[i];
			if ((data == null) || (data.Codi == null)) clearButton(but);
			else { 
				but.data("article", data)
				   .css({ background: getBackgroundColor(data.Color), visibility: "visible" })
				   .text(data.NOM || "");
			}
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

