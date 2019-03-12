scripts.menuPrincipal = function() {
	
window.menuPrincipal = function() {
	var my = {};
	
	var D = {}; 
	var S = {};
	var DepActual;
	var TaulaActual;
	
	var divM = div100x100();
	var menuScroll = new gScroll("_ud", 2);
	positionDiv(menuScroll.getDiv(), 0,0, 100, 20).appendTo(divM);

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
	
	var elDependentaSel = null;
	function dependentesActivesHandler(e) {
		if (e.button !== 0) return;
//		if (DB.inTransaction()) return;
		if (elDependentaSel != null) elDependentaSel.removeClass("ui-state-active");
		elDependentaSel = $(this).addClass("ui-state-active");
		DepActual = $(this).data("dep");
		TaulaActual = $(this).data("taula");
		getDatosProceso();
		redraw();
/*		S = DepActives.getDatosProceso("menuPrincipal", DepActives.getActual());
		redraw();
*/	}

	var dependentesActivesModel = $("<button>").css({width:"100%", height:"100%"})
	                                           .addClass("ui-state-default").mousedown(dependentesActivesHandler);
	var defaultElementDependenta = dependentesActivesModel.clone(false).html("X<br>X");  
	var dependentesActivesScroll = new gScroll("_ud", defaultElementDependenta);
	positionDiv(dependentesActivesScroll.getDiv(), 0, 20, 100, 100).appendTo(divM);

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

		//redraw Dependentes Actives y taules Actives
		dependentesActivesScroll.removeAll();
		elDependentaSel = null;
		var pos = 0, posSel = null;
		for (var i=0, dep; (dep = Dependentes.getActivaByIdx(i)) != null; i++) {
			var el = dependentesActivesModel.clone(true).text(dep.nom).data("dep", dep)
			                                            .appendTo(dependentesActivesScroll.newElement());
			if (dep == DepActual) {
				el.addClass("ui-state-active");
				posSel = pos;
				elDependentaSel = el;
			} 
			pos++;
		}
		for (var i=0, taula; (taula = Taules.getByIdx(i)) != null; i++) {
			if (taula.activa) {
				var el = dependentesActivesModel.clone(true).text("T: "+taula.nom).data("taula", taula)
															.appendTo(dependentesActivesScroll.newElement());
				if (taula == TaulaActual) {
					el.addClass("ui-state-active");
					posSel = pos;
					elDependentaSel = el;
				}
				pos++;		
			}	
		}

//		if (posDepAct == -1) { posDepAct=0; codiDependentaActual = null; }
		if (posSel != null) dependentesActivesScroll.scrollTo(posSel, true);
		dependentesActivesScroll.redraw();
		
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
				for (var i=0, dep; (dep = Dependentes.getActivaByIdx(i)) != null; i++) {
					if (DepActual.codi === dep.codi) { DepActual = dep; break; }
				}
				if (dep == null) DepActual = null;
			}
			if (isDivVisible(divM)) {
				getDatosProceso();
				redraw();
			}
		}
		function taulaChangeHandler() {
			if (TaulaActual != null) {
				for (var i=0, taula; (taula = taules.getActivaByIdx(i)) != null; i++) {
					if (taulaActual.nom === dep.nom) { taulaActual = taula; break; }
				}
				if (taula == null) taulaActual = null;
			}
			if (isDivVisible(divM)) {
				getDatosProceso();
				redraw();
			}
			
		}
		
		Dependentes.addChangeHandler(dependentaChangeHandler);
		Taules.addChangeHandler(taulaChangeHandler);

		for (var i in my.menus.op) {
			if (my.menus.op.hasOwnProperty(i)) my.menus.op[i].init(layoutPrincipal.content);
		}
		
		Resize.add(function() {
			if (isDivVisible(divM)) {
				menuScroll.redraw();
				dependentesActivesScroll.redraw();
			}			
		});
	};
	
	function getDatosProceso() {
		var p = null;
		if (DepActual != null) p = "D_"+DepActual.codi; 
		else if (TaulaActual != null) p = "D_"+TaulaActual.nom; 
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
	my.getTaulaActual = function() {
		return TaulaActual;	
	}
	
	my.finProceso = function() {
		S.opMenuSel = my.menus.inicial[S.menu];
		redraw();
	}
	return my;
}();

}

procesoInicializarConServidor = function() {
	var my = {};
	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100);
	var divE = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divE2 = div100x100().css({ position: "relative", height: "100%" }).appendTo(divE);
	var divIP = $("<div>").css({ textAlign: "center" }).appendTo(divE2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP);
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divE2);
	var divC = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	divC.text("Conectando..."); 
	
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		Resize.add(function() { fResize = {}; resizeDiv0(); }); 
	}
	my.start = function() {
		divShow(div0);
		divShow(divE);
		input.val("");
		password.val("");
		keyboard.reset();
		keyboard.setInput(input);
		keyboard.setCallback(callbackKeyboard0); 
		resizeDiv0();
	};

	var fResize = {};
	
	function resizeDiv0() {
		if (fResize.div0 === false) return; 
		if (!isDivVisible(div0)) return;
		var w0 = divE2.width(), h0 = divE2.height();
		var h2 = divIP.height(), w2 = divIP.width(); 
		positionKeyboard(keyboard, 0, h2, w2, h0);
		fResize.div0 = false;
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			password.val("");
			keyboard.reset();
			keyboard.setInput(password);
			keyboard.setCallback(callbackKeyboard1);	
		}
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			divShow(divC);
			var init = {user: input.val(), password: password.val(), 
			            producto: ConstantGTPV.producto, version: ConstantGTPV.version};
			comServer(init);
//			keyboard.callback = function() {};
		}
	}
	return my;
};
	
var opcionesMenu = {
	puerta : {
		text: "puerta",
		cssClass: "buttonPuerta",
		run: function(mp) { procesoPuerta.start(mp); },
		init: function(div) { procesoPuerta.init(div);	}
	},
	venda : {
		text: "Venda",
		cssClass: "buttonVenda",
		run: function(mp) { procesoVenda.start(mp);	},
		init: function(div) { procesoVenda.init(div); }
	},
	editorTeclats : {
		text: "Editor Teclats",
		cssClass: "buttonEditorTeclats",
		run: function(mp) { procesoEditorTeclats.start(mp);	},
		init: function(div) { procesoEditorTeclats.init(div); }
	},
	cajaFuerte : {
		text: "Caja Fuerte",
		cssClass: "buttonCajaFuerte",
		run: function(mp) { procesoCajaFuerte.start(mp); },
		init: function(div) { procesoCajaFuerte.init(div); }	
	},
};

var menusLocalSat = {
	noDependenta : [ "puerta" ],
	dependenta : [
		"puerta",
		"venda", true,
		"editorTeclats",
		"cajaFuerte"
	],
	taula : [ "venda", true ]
};


function initAplication(callbackInit) {
	var regFuncInit = 0;
	var callbackInitActive = false;
	function localCallbackInit() {
		regFuncInit--;
		if ((regFuncInit == 0) && (callbackInitActive)) callbackInit(); 	
	}
	function newCallbackInit() {
		regFuncInit++;
		return localCallbackInit;
	}
		
	DatosArticlesH.init(newCallbackInit());
	DependentesH.init(newCallbackInit());
//	DepActivesH.init(newCallbackInit());
//	ConceptosEntregaH.init(newCallbackInit());
//	CajaH.init(newCallbackInit());

	callbackInitActive = true;
	if (regFuncInit == 0) callbackInit();

/*	DatosArticles.init
	DatosArticlesH.init(changeDatosHandler, callbackInit);
	DependentesH.init(changeDataHandler, callbackInit);
	DepActivesH.init(depActChange, newCallbackInit());
	ConceptosEntregaH.init
	CajaH.init
	menuPrincipal.init(function() { Caja.init(function() { menuPrincipal.start(); }); });
*/}

function startLocalSat() {
	startSatType1(idLocalSat, menusLocalSat);
}

function startSatType1(idSat, menus) {
	DatosArticlesH.createSat(idSat);
	DependentesH.createSat(idSat);
	CH.sendFunctionExecute(idSat, scripts.teclatsTpv);
	procesoVenda = procesoVenda(); // ?? hacer sat
	CH.sendFunctionExecute(idSat, scripts.editorTeclats);
//	CH.sendFunctionExecute(idSat, scripts.menuPrincipal);
	scripts.menuPrincipal();
	var genMenus = createOptionsMenuPrincipal(menusLocalSat, opcionesMenu);
	CH.sendObjectAssign(idSat, "window.menuPrincipal.menus", genMenus);
//	CH.sendScript(idSat, "menuPrincipal.init(); menuPrincipal.start();");
 	menuPrincipal.init(); 
	menuPrincipal.start();
}

function createOptionsMenuPrincipal(menus, op) {
	var genMenus = { m:{}, op: {}, inicial: {} };
	for (var cl in menus) {
		if (menus.hasOwnProperty(cl)) {
			genMenus.m[cl] = [];
			genMenus.inicial[cl] = null;
			for (var i=0; i<menus[cl].length; i++) {
				if (menus[cl][i] === true) genMenus.inicial[cl] = menus[cl][i-1];
				else {
					genMenus.m[cl].push(menus[cl][i]);
					genMenus.op[menus[cl][i]] = op[menus[cl][i]];
				}
			}
		}
	}
	return genMenus;
}


ConstantGTPV = { producto: "TPV", version: "0.1" };

var idLocalSat;

function satRegistrationHandler(idNewSat, oldSat) {
	if (CH.isLocal(idNewSat)) {
		idLocalSat = idNewSat;
		initLocalSat();
		return true;
	} else {
		// select tipo sat
		// initSat()
	}
}

function initSatCommon(idSat) {
	CH.sendFunctionExecute(idSat, scripts.keyboard);
	CH.sendFunctionExecute(idSat, scripts.scroll);
	CH.sendFunctionExecute(idSat, scripts.alertDialog);
	scripts.misc.forEach(function(s) { CH.sendScript(idSat, s); });
	CH.sendFunctionExecute(idSat, scripts.ls);
	CH.sendFunctionExecute(idSat, scripts.layout);
}

function initLocalSat() {
	initSatCommon(idLocalSat);
	procesoImpresora = procesoImpresora();
	DivMensajesCaja = DivMensajesCaja();

	procesoAbrirCaja = procesoAbrirCaja();
	procesoCajaFuerte = procesoCajaFuerte();
	procesoBorrarTickets = procesoBorrarTickets();
	procesoESDinero = procesoESDinero();
	procesoCerrarCaja = procesoCerrarCaja();
	procesoPuerta = procesoPuerta();
	procesoEntradaSalidaDependenta = procesoEntradaSalidaDependenta();
	procesoInicializarConServidor = procesoInicializarConServidor(); 
	procesoInicializarConServidor.init();
	var prefijoCliente = GlobalGTPV.get("prefijoCliente", false); 
	if (prefijoCliente == null) {
		procesoInicializarConServidor.start();
	} else {
		GlobalGTPV.setPrefijo(prefijoCliente);
		LS.init(prefijoCliente);	
		DB.init(prefijoCliente);
		initAplication(startLocalSat);
		progComServer(2/60);
	}
}

$(function() {

	// main
	GlobalGTPV.init(function() {
		window.CH = new ch();
		CH.init(null/*initCHHandler*/, satRegistrationHandler);
		window.CS = new cs();
		CS.init(CH);
//		div100x100($("body")).css({margin : "0px"}).addClass("ui-widget");

//		var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
//		SEPpx = testSep.outerHeight()/2;
//		testSep.remove();

//		initScroll();
		
//		CodisBarres.init();
		
//		layoutPrincipal.show();
/*		procesoInicializarConServidor.init();
		var prefijoCliente = GlobalGTPV.get("prefijoCliente", false); 
		if (prefijoCliente == null) {
			procesoInicializarConServidor.start();
		} else {
			GlobalGTPV.setPrefijo(prefijoCliente);
			LS.init(prefijoCliente);	
			DB.init(prefijoCliente);
			initAplication();
			progComServer(2/60);
		}
*/	});

});

