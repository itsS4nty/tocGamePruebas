$(function() {

subMenuComanda = function() {
	var my = {}

	var nX=6, nY=6;
	var datosTeclats = [];
	
	var divSM = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.subMenu).hide(); 
	var Ambients = new myScroll("_lr", nX);
	positionDiv(Ambients.getDiv(),0,0,100,100).appendTo(divSM);

	function clickButtonAmbient(e) {
		var el;
		if (S.ambientActual != null) {
			for (var i=0; (el = Ambients.get(i)) != null; i++) {
				if (S.ambientActual == el.text()) {
					el.children().removeClass("ui-state-active");
				}
				if (this == el.children().get(0)) {
					$(this).addClass("ui-state-active");
					Ambients.scrollTo(i, true);
				}
			}
		}
		S.ambientActual = $(this).text();
		setButtonsTeclatsTpv(S.ambientActual);
	}
	
	var AmbientModel = $("<button>").css({boxSizing: "border-box", width: "100%", height: "100%", margin: "0px"})
						            /*.addClass("ui-corner-all")*/
						            .mousedown(clickButtonAmbient);
	
	var divC = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.content).hide();
	var divTeclatProductes = $("<div>").addClass("ui-widget-content").appendTo(divC);

	function clickButtonTeclatTpv(e) {
		// var pos = $(this).data("pos");
		var article = $(this).data("article");
		if (article == null) return;
		
		var el = null, t;
		if (article.EsSumable) {
			for (var idx=0; idx<S.ticket.length; idx++) {
				t = S.ticket[idx];
				if ((article.Codi == t.article.Codi) &&
				    (article.PREU == t.article.PREU) && 
					(article.EsSumable == t.article.EsSumable)) {
					el = $(divScrollTicket.get(0).childNodes[idx]);
					t.article.NOM = article.NOM;
					break;
				}
			}
		}
		if (el == null) {
			// create El
			el = modelElemTicket.clone(true).height(hElemTicket).appendTo(divScrollTicket);
			t = { article: article, cantidad: 0, import: 0 };
			S.ticket.push(t);
			S.idxElemScrollT = S.ticket.length;
			idx = S.ticket.length-1;
			S.relPosIdxElemScrollT = 1;
		} else {
			scrollTToVisible(idx);
		}
		setSelected(-1);
		t.cantidad += S.cantidad;
		actualizarElemTicket(idx);
		S.cantidad = 1;
		S.fTecladoCantidad = false;
		S.visorCantidad = null;
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
					if (S.idxSelected >= 0) { 
						var t = S.ticket[S.idxSelected];
						t.cantidad++;
						actualizarElemTicket(S.idxSelected);
						actualizarTicket();
					}
					break;
				case "-" :
					if (S.idxSelected >= 0) { 
						var t = S.ticket[S.idxSelected];
						if (t.cantidad > 1) {
							t.cantidad--;
							actualizarElemTicket(S.idxSelected);
							actualizarTicket();
						}
					}
					break;
				case "borrar" :
					if (S.idxSelected >= 0) {
						S.ticket.splice(S.idxSelected,1);
						$(divScrollTicket.get(0).childNodes[S.idxSelected]).remove();
						S.idxSelected = -1;
					} else {
						S.visorCantidad = null;
						S.cantidad = 1;
						S.fTecladoCantidad = false;
					}
					actualizarTicket();	
					break;	
			}
		}
	}
	function elemTicketHandler(e) {
		for (var idx=0, el=divScrollTicket.get(0).firstChild; this != el; idx++, el=el.nextSibling);
		setSelected(idx);
	}
	
	
	// borrar y cancel cantidad
	function butCantidadHandler(num) {
		return function(e) {
			// check overflow
			S.visorCantidad = null;
			if (!S.fTecladoCantidad) {
				if (num > 0) {
					S.fTecladoCantidad = true;
					S.cantidad = num;
				}
			} else {
				if (S.cantidad*10 > 99999) return;
				S.cantidad = S.cantidad*10+num;
			}
			actualizarTicket();
		}
	}
	
	function cobrarHandler(e) {
		if (S.ticket.length == 0) return; //??
		var stat = "INSERT INTO [V_Venuts"+DB.mensualSufix+"] ([Botiga], [Data], [Dependenta], [Num_tick], "
					                                         +"[Estat], [Plu], [Quantitat], [Import], "
															 +"[Tipus_venta], [FormaMarcar], [Otros]) "
				  +" VALUES (?,?,?,?,?,?,?,?,?,?,?)";										 
		var db = DB.openMensual();
		db.transaction( function (tx) {
			var numTick = DB.getNumTicket();
			var date = DB.getSqlDate();
			for (var i=0; i<S.ticket.length; i++) {
				var t = S.ticket[i];
				tx.executeSql(stat, [localStorage.getItem("ClienteId"), date, S.codi, numTick,
				                     null, t.article.Codi, t.cantidad, t.import,
									 null, null, null],DB.success,DB.error);
			}
			S.cantidad = 1;
			S.idxElemScrollT = 0;
			S.relPosIdxElemScrollT = 0;
			divScrollTicket.empty();
			S.ticket = [];
			S.idxSelected = -1;
			S.visorCantidad = divTotal.text();
			actualizarTicket();
		});
	}
	
	var Config = {
		hTeclado : 0.6,
		nCarWTicket : 20,
		maxWTicket : 0.6,
		relWC_C : [2,4]
	}

	var divBelowTeclat = $("<div>").appendTo(divC);
	var divControl = $("<div>").appendTo(divBelowTeclat);
	var divTicket = $("<div>").css({fontFamily: "monospace"}).appendTo(divBelowTeclat);

	var divCantidad = $("<div>").css({border: "1px solid black"}).appendTo(divTicket);

	var divContTicket = $("<div>").css({overflow: "hidden"}).appendTo(divTicket);
	var divScrollTicket = $("<div>").css({position: "relative"}).appendTo(divContTicket);

	var divTotal = $("<div>").css({border: "1px solid black", fontSize: "120%", overflow: "hidden"}).appendTo(divTicket);

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
	var butCobrar = buttonControlCantidad.clone(true).text("Cobrar").appendTo(divTecladoCantidad).mousedown(cobrarHandler);
	
	$("div", divC).css({boxSizing: "border-box"/*, visibility: "hidden"*/});
	
	var hElemTicket = 0;
	var numCarsElemTicket;
	var modelElemTicket =  $("<div>").css({boxSizing: "border-box", borderBottom: "1px dashed black",
	                                       width: "100%", overflow: "hidden"}).mousedown(elemTicketHandler);
	var hContTicket;
	
	var cantidad;
	var total;
	
	var prevWDC = -1, prevHDC = -1;
	var callback;
	var stateDependenta=[];
	var S;
	
	$(window).resize(function() { if (divC.css("display") != "none") redrawC(); });
	
	function posAbsolute(div, x0, y0, x1, y1) {
		x0 = Math.round(x0); y0 = Math.round(y0);
		x1 = Math.round(x1); y1 = Math.round(y1);
		div.css({position: "absolute", left: x0+"px", top: y0+"px", width: (x1-x0)+"px", height: (y1-y0)+"px"}); 	
	}
	var fDB=false;
	my.start = function(codiDependenta, _callback) {
		divSM.siblings().hide();
		divC.siblings().hide();
		divSM.show();
		divC.show();
		restoreState(codiDependenta);
//		clearTicket();
//		Actualizar();
//		Ambients.redraw();
//		redrawC();
		callback = _callback;
		//my.actualizarAmbients();
		if (!fDB) obtenerDB();
		fDB = true;
//		my.setButtons("Cafeteria");
	}
	function redrawC() {
		var wDC = divC.width(), hDC = divC.height();
		if ((prevWDC == wDC) && (prevHDC == hDC)) return;
		
		posAbsolute(divTeclatProductes, 0, 0, wDC, Config.hTeclado*hDC);
		var w0=divTeclatProductes.width(), h0=divTeclatProductes.height();
		for (var x=0; x<nX; x++) {
			for (var y=0; y<nY; y++) {
				posAbsolute(arrayButtons[x*nY+y], (x/nX)*w0, (y/nY)*h0, ((x+1)/nX)*w0, ((y+1)/nY)*h0);
			}
		}
		
		posAbsolute(divBelowTeclat, 0, Config.hTeclado*hDC, wDC, hDC);
		var w0=divBelowTeclat.width(), h0=divBelowTeclat.height();
		var tempText = divTotal.text();
		divTotal.text("X");
		var wTicket=divTotal.outerWidth(true), iw=divTotal.width(), hTotal=divTotal.outerHeight(true);
		divTotal.text(tempText);
		wTicket=(wTicket-iw)+iw*Config.nCarWTicket;
		wTicket = Math.round(Math.min(wTicket, Config.maxWTicket*w0));
		var wControl = Math.round((w0-wTicket)*(Config.relWC_C[0]/(Config.relWC_C[0]+Config.relWC_C[1])));
	
		posAbsolute(divControl, 0, 0, wControl, h0);
		posAbsolute(divTicket, wControl, 0, wControl+wTicket, h0);
 		posAbsolute(divTecladoCantidad, wControl+wTicket, 0, w0, h0);
		var wTecladoCantidad = w0-(wControl+wTicket);

		posAbsolute(butPlus, 0, 0, wControl/2, h0/3);
		posAbsolute(butMinus, 0, 2*h0/3, wControl/2, h0);
		posAbsolute(butScrollUp, wControl/2, 0, wControl, h0/3);
		posAbsolute(butBorrar, wControl/2, h0/3, wControl, 2*h0/3);
		posAbsolute(butScrollDown, wControl/2, 2*h0/3, wControl, h0);
		
		var tempText = divCantidad.text();
		divCantidad.text("X");
		var hCantidad=divCantidad.outerHeight(true);
		divCantidad.text(tempText);
		
		posAbsolute(divCantidad, 0, 0, wTicket, hCantidad);
		posAbsolute(divContTicket, 0, hCantidad, wTicket, h0-hTotal);
		posAbsolute(divTotal, 0, h0-hTotal, wTicket, h0);
		
		var testEl = modelElemTicket.clone(true).appendTo(divScrollTicket);
		var testSpan = $("<span>X</span>").appendTo(testEl);
		hElemTicket = testEl.outerHeight(true);
		numCarsElemTicket = Math.floor(testSpan.width()/testEl.width());
		testEl.remove();
		hContTicket = divContTicket.height();
		divScrollTicket.children().css({height: hElemTicket+"px"});

		for (var i=0, div=$(divScrollTicket.get(0).firstChild); i<S.ticket.length; i++, div=div.next()) {
			actualizarElemTicket(i);
//			formatElemTicket(div, S.ticket[i]);	
		}
		actualizarTicket();
//		ticketScrollTo(/*S.idxElScrollT, S.relPosIdxElScrollT*/); 

		var butCantLayout = [[7,8,9],[4,5,6],[1,2,3],[0]];
		for (var y=0; y<butCantLayout.length; y++) {
			for (var x=0; x<butCantLayout[y].length; x++) {
				posAbsolute(butCantidad[butCantLayout[y][x]], x*wTecladoCantidad/4, y*h0/4,
				                                              (x+1)*wTecladoCantidad/4, (y+1)*h0/4);
			}
		}
		posAbsolute(butCobrar, wTecladoCantidad/4, 3*h0/4, wTecladoCantidad, h0);

		prevWDC = wDC; prevHDC = hDC;	
	}
	function restoreState(codi) {
		for (var j=0; j<stateDependenta.length; j++) {
			if (stateDependenta[j].codi == codi) break;	
		}
		if (j==stateDependenta.length) {
			stateDependenta[j] = {
				codi: codi,
				ambientActual: null,
				ticket: [],
				idxElemScrollT: 0,
				relPosIdxElemScrollT: 0,
				total: 0,
				cantidad: 1,
				idxSelected: -1,
				visorCantidad: null,
				fTecladoCantidad: false
			}
		}
		S = stateDependenta[j];
		// divScrollTicket
		actualizarAmbients();
		divScrollTicket.empty();
		redrawC();
		for (var i=0; i<S.ticket.length; i++) {
			var el = modelElemTicket.clone(true).height(hElemTicket).appendTo(divScrollTicket);
			actualizarElemTicket(i);
//			formatElemTicket(el, S.ticket[i]);
		}
		actualizarTicket();
	}
	
/*	function clearTicket() {
		S.cantidad = 1;
		S.idxElemScrollT = 0;
		S.relPosIdxElemScrollT = 0;
		divScrollTicket.empty();
		S.ticket = [];
		S.idxSelected = -1;
		actualizarTicket();
	}
*/	function actualizarElemTicket(i) {
		var t = S.ticket[i];
		t.import = Math.round(t.cantidad*t.article.PREU*100)/100;
		formatElemTicket($(divScrollTicket.get(0).childNodes[i]), t);	
	}
	function actualizarTicket() {
		S.total = 0;
		for (var i=0; i<S.ticket.length; i++) { S.total += S.ticket[i].import; } 
		S.total = Math.round(S.total*100)/100; //??
		if (S.visorCantidad == null) {
			divCantidad.text(S.cantidad);
			divTotal.text(S.total);	
		} else {
			divCantidad.text(S.visorCantidad);
			divTotal.text("");
		}
		ticketScrollTo();
	}
	function ticketScrollTo(idxElem, relPosIdxElem) {
		if (idxElem != null) S.idxElemScrollT = idxElem;
		if (relPosIdxElem != null) S.relPosIdxElemScrollT = relPosIdxElem;
		var top = Math.floor(S.idxElemScrollT*hElemTicket - hContTicket*S.relPosIdxElemScrollT);
		if (top+hContTicket >= S.ticket.length*hElemTicket) {
			top = S.ticket.length*hElemTicket-hContTicket; 
			S.idxElemScrollT = S.ticket.length;
			S.relPosIdxElemScrollT = 1;
		}
		if (top <= 0) {
			top = 0;
			S.idxElemScrollT = 0;
			S.relPosIdxElemScrollT = 0;
		}
		divScrollTicket.css({top : -top+"px"});
		butScrollUp[(top <= 0) ? "hide" : "show"](); 
		butScrollDown[(top+hContTicket >= S.ticket.length*hElemTicket) ? "hide" : "show"]();			
	}
	function formatElemTicket(div, data) {
		div.text(data.cantidad+" "+data.article.NOM+" "+(new Number(data.import)).toFixed(2)); // ??	
	}
	function scrollTToVisible(idx) {
		var el = $(divScrollTicket.get(0).childNodes[idx]);
		var topEl = -el.position().top;
		var topScroll = -divScrollTicket.position().top;
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
	function setSelected(idx) {
		if (S.idxSelected >= 0) {
			$(divScrollTicket.get(0).childNodes[S.idxSelected]).removeClass("ui-state-active");
		}
		S.idxSelected = idx;
		if (S.idxSelected >= 0) {
			$(divScrollTicket.get(0).childNodes[idx]).addClass("ui-state-active");
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
			               +"FROM (SELECT * FROM TeclatsTpv"+/* WHERE (Llicencia = ?)*/") as t " 
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
				actualizarAmbients();
			}, function() { datosTeclats = []; actualizarAmbients(); });
		});
	}
	function actualizarAmbients() {
		Ambients.removeAll();
		for (var j=0, posAct=-1; j<datosTeclats.length; j++) {
			if (datosTeclats[j].ambient == S.ambientActual) {posAct = j; break; }
		}
		if (posAct == -1) {
			if (datosTeclats.length > 0) { posAct = 0; S.ambientActual = datosTeclats[0].ambient; }
			else S.ambientActual = null;
		}
		for (var i=0; i<datosTeclats.length; i++) {
			AmbientModel.clone(true).text(datosTeclats[i].ambient)
                                    .addClass("ui-state-default")
  	                                .addClass((i == posAct) ? "ui-state-active" : "")
									.appendTo(Ambients.newElement().css({ verticalAlign: "middle" }));
			
		}
		if (posAct >= 0) Ambients.scrollTo(posAct, true);
		Ambients.redraw();
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
	return my;
}();

});
