scripts.add("visorTicket", function(window) {

window.procesoVisorTicket = function() {
	var my = {}

	var div0 = div100x100();
	var divTaula = div100x100().appendTo(div0);
	var divTicket = div100x100().appendTo(div0);

	var elTaulaSel = null;
	function taulesActivesHandler(e) {
		if (e.button !== 0) return;
		TaulaActual = $(this).data("data");
		getDatosProceso();
		redraw();
/*		S = DepActives.getDatosProceso("menuPrincipal", DepActives.getActual());
		redraw();
*/	}

	var taulesActivesModel = $("<button>").css({width:"100%", height:"100%"})
	                                       .addClass("ui-state-default").mousedown(taulesActivesHandler);
	var defaultElementTaula = taulesActivesModel.clone(false).html("X<br>X");  
	var taulesActivesScroll = new gScroll("_ud", defaultElementTaules);
	positionDiv(taulesActivesScroll.getDiv(), 0, 0, 100, 100).appendTo(divTaula);
	

	var divContTicket = $("<div>").css({overflow: "hidden", backgroundColor: "white"}).appendTo(divTicket);
	var divTicketScroll = $("<div>").css({position: "relative", fontWeight: "bold" }).appendTo(divContTicket);
	var terminalTicketScroll = $("<div>").css({backgroundColor: "black"}).height(1).appendTo(divTicketScroll);
	var divButScroll = $("<div>").appendTo(divTicket);
	function createButScroll(type, text) {
		var b = $("<button>").text("u").css({width: "50%", height: "100%"}).appendTo(divButScroll);
		b.mousedown(function() {
				S.idxElemScrollT--;
				ticketScroll();
			
		});
		return b;
	}
	var butU = createButtonScroll("u", "u");
	var butD = createButtonScroll("d", "d");

	
	var D = {};
	var S = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();
		Resize.add(function() {
			fResize = {};
			resizeDivVisor(); 
		});
		Dependentes.addChangeHandler(changeDependentesHandler);
		Comandes.addChangeHandler(changeComandesHandler);
		Taules.addChangeHandler(changeTaulesHandler);
	};
	var mp;
	var dep;
	my.start = function(_mp) {
		mp = _mp;
		divShow(div0);

		var p = null;
		dep = mp.getDepActual();
		p = "D_"+dep.codi; 
		S = (D[p] = (D[p] || {}));
		if (S.estado == null) {
			S.estado = "taula";
			S.nomTaula = null;
			S.idxElemScrollT = 0;
			S.relPosIdxElemScrollT = 0;
		}
		
		switch(S.estado) {
			case "taula" :
				divShow(divTaula);
				break;
			case "ticket" :
				divShow(divTicket);
				break;
		}
	};
	
	function changeDependenteshandler() {
	}
	
	function changeComandesHandler() {
	}
	
	function changeTaulesHandler() {
	}
	
	function resize() {
		if (fResize.divVisor === false) return;
		if (!isDivVisible(divTicket)) return; 
//		divVenda.children().hide(); // * evitar que salgan scrollbars
		var wDC = divTicket.width(), hDC = divTicket.height();
//		divVenda.children().show(); // *
		
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


		fResize.divVenda = false;
	}

	function redraw() {
		switch (S.estado) {
			case "taula":
				divShow(divTaula);
				var taules = Comandes.getTaules();
				taulesActivesScroll.removeAll();
				for (var i=0; i < taules.length; i++) {
					var el = taulesActivesModel.clone(true).data("data", taules[i]).text(taules[i].nomTaula).appendTo(taulesActivesScroll.newElement());	
					el.addClass("ui-state-default");
				}
				taulesActivesScroll.redraw();

				break;
			case "ticket":
				divShow(divTicket);
				divTicketScroll_empty();
				resizeDivTicket();
				for (var i=0; i<S.ticket.length; i++) {
					var el = modelElemTicket.clone(true).height(hTicketEl).insertBefore(terminalTicketScroll)/*appendTo(divTicketScroll)*/;
					actualizarElemTicket(i);
		//			formatElemTicket(el, S.ticket[i]);
				}
				setTicketSelected(S.idxTicketSelected);
				ticketScroll();
				break;
		}
	}

	function formatElemTicket(div, elT) {
		var prec = (elT.article.esSumable) ? 0 : 3;
		var strC = ""+elT.cantidad.toFixed(prec);
		var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
		for (; iComa < strC.length; iComa+=3+1) {
			strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
		}
		if (strC.length > 6) strC="******";
		else strC = fillSpaceL(strC, 6);

		var lenC = strC.length;

		var strI = formatImport(data.import, true);

		var lenN = numCarsElemTicket-(6+1+0+1+strI.length+1);
		if (lenN<1) lenI=1;
		var strN = elT.article.nom.substring(0,lenN);
		while (strN.length < lenN) strN=strN+" ";
		var str = strC+" "+strN+" "+strI+" ";
		div.text(str);
	}
	function actualizarElemTicket(i) {
		var t = S.ticket[i];
		t.import = normImport(t.cantidad*t.article.preu);
		formatElemTicket(divTicketScroll.children().eq(i), t);	
	}

	function ticketScroll(idxElem, relPosIdxElem) {
//		var nEl = divTicketScroll.children().length-1;
		var hDivTicketScroll = getOH(divTicketScroll);
		if (idxElem != null) S.idxElemScrollT = idxElem;
		if (relPosIdxElem != null) S.relPosIdxElemScrollT = relPosIdxElem;
		var top = Math.floor(S.idxElemScrollT*hTicketEl - hContTicket*S.relPosIdxElemScrollT);
		if (top+hContTicket >= /*nEl*hTicketEl*/hDivTicketScroll-getOH(terminalTicketScroll)) {   // no hay mas elementos por abajo
			top = /*nEl*hTicketEl*/hDivTicketScroll-hContTicket; 
			S.idxElemScrollT = S.ticket.length;
			S.relPosIdxElemScrollT = 1;
		}
		if (top <= 0) {  // no hay mas elementos por arriba
			top = 0;
			S.idxElemScrollT = 0;
			S.relPosIdxElemScrollT = 0;
		}
		divTicketScroll.css({top : -top+"px"});
		butScrollUp[(top <= 0) ? "hide" : "show"](); 
		butScrollDown[(top+hContTicket >= /*nEl*hTicketEl*/hDivTicketScroll) ? "hide" : "show"]();			
	}

	return my;	
}
});

scripts.add("menuPrincipalSatType2", function(window) {
	
window.menuPrincipal = function() {
	var my = {};
	
	var D = {}; 
	var S = {};
	var DepActual;
	var TaulaActual;
	
	var divM = div100x100();
	var menuScroll = new gScroll("_lr", 2);
	positionDiv(menuScroll.getDiv(), 0,0, 100, 100).appendTo(divM);

	var elMenuSel = null;
	function menuHandler(e) {
		if (e.button !== 0) return;
//		if (DB.inTransaction()) return;
		if (elMenuSel != null) elMenuSel.removeClass("ui-state-active");
		elMenuSel = $(this).addClass("ui-state-active");
		S.opMenuSel = $(this).data("data");
//		DepActives.save();
		my.menus.op[S.opMenuSel].run();
	}
	var menuModel = $("<button>").css({width:"100%", height:"100%"})
	                             .addClass("ui-state-default").mousedown(menuHandler);
	
	function redraw() {
		//redraw Menu
		menuScroll.removeAll();
		elMenuSel = null;
		for (var i=0, pos=null; i < menus[S.menu].length; i++) {
			var op = my.menus.m[S.menu][i];
			var el = menuModel.clone(true).data("data", op).text(my.menus.op[op].text).appendTo(menuScroll.newElement());	
			//Class img background
			if (my.menus.op[op].cssClass != null) el.addClass(my.menus.op[op].cssClass);
			if (op == S.opMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				elMenuSel = el;
			} else {
				el.addClass("ui-state-default");
			}
		}
		if (pos != null) menuScroll.scrollTo(pos, true);
		menuScroll.redraw();

		if (S.opMenuSel != null) my.menus.op[S.opMenuSel].run(my);
		else { layoutPrincipal.content.children().hide(); }
	}
	my.init = function() {
		DepActual = null;
		TaulaActual = null;
		
		divM.appendTo(layoutPrincipal.menu).hide();

		function dependentaChangeHandler(type, dep) {
			if (type === "addActiva") DepActual = dep;
			if (type === "delActiva") delete D.dep[dep.codi]; 
			if (DepActual != null) {
				for (var i=0, dep; (dep = Dependentes.getActualByIdx(i)) != null; i++) {
					if (DepActual.codi === dep.codi) { DepActual = dep; break; }
				}
				if (dep == null) DepActual = null;
			}
			if (isDivVisible(divM)) {
				getDatosProceso();
				redraw();
			}
		}
		
		Dependentes.addChangeHandler(dependentaChangeHandler);

		for (var i in my.menus.op) {
			if (my.menus.op.hasOwnProperty(i)) my.menus.op[i].init(layoutPrincipal.content);
		}
		
		Resize.add(function() {
			if (isDivVisible(divM)) {
				menuScroll.redraw();
			}			
		});
	};
	
	function getDatosProceso() {
		var p = null;
		if (DepActual != null) p = "D_"+DepActual.codi; 
		S = (D[p] = (D[p] || {}));
	}
	
	my.start = function() {
		divShow(divM);
		getDatosProceso();
/*		if (S.menu == null) {
			S.menu = (DepActives.getActual().codi == null) ? "noDependenta" : "dependenta";
			S.opMenuSel = opMenuInicial[S.menu];  
		}
*/		redraw();
	};
/*	my.stop = function() {
		divM.hide();	
	};
*/	
	my.getDepActual = function() {
		return DepActual;	
	}
/*	my.getTaulaActual = function() {
		return TaulaActual;	
	}
*/	
	my.finProceso = function() {
		S.opMenuSel = my.menus.inicial[S.menu];
		redraw();
	}
	return my;
}();

});

var opcionesMenuSatType2 = {
	selectDep : {
		text: "selectDep",
		cssClass: "",
		run: function(mp) { procesoSelectDepSat.start(mp); },
		init: function(div) { procesoSelectDepSat.init(div);	}
	},
	visorTicketSat : {
		text: "visorTicket",
		cssClass: "",
		run: function(mp) { procesoVisorTicket.start(mp);	},
		init: function(div) { procesoVisorTicket.init(div); }
	},
};

var menusSatType2 = {
	noDependenta : [ "selectDep", true ],
	dependenta : [
		"selectDep",
		"visorTicket", true
	],
};

function initSatType2(idSat) {
	initSatCommon(idSat);
	DatosArticlesH.createSat(idSat);
	DependentesH.createSat(idSat);
	CH.sendScriptExecute(idSat, scripts.menuPrincipalSatType2);
	var genMenus = createOptionsMenuPrincipal(menusSatType2, opcionesMenuSatType2);
	CH.sendAssignObject(idSat, "window.menuPrincipal.menus", genMenus);
	CH.sendScript(idSat, "menuPrincipal.init(); menuPrincipal.start();");
}
