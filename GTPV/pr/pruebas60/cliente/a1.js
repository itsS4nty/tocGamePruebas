menuPrincipal = function() {
	var my = {};
	
	var D = {};
	
	var divM = positionDiv(null,0,0,100,100);
	var menuScroll = new myScroll("_ud", 2);
	positionDiv(menuScroll.getDiv(), 0,0, 100, 20).appendTo(divM);

	var optMenuSelectedScroll = null;
	function menuHandler(e) {
		if (optMenuSelectedScroll != null) optMenuSelectedScroll.removeClass("ui-state-active");
		optMenuSelectedScroll = $(this).addClass("ui-state-active");
		D.optMenuSel = $(this).data("opt");
		D.optMenuSel.run();
	}
	var menuModel = $("<button>").css({width:"100%", height:"100%"})
	                             .addClass("ui-state-default").mousedown(menuHandler);
	
	var opcionesMenu = {
		puerta : {
			text: "puerta",
			run: function() { procesoPuerta.start(); },
			init: function() { procesoPuerta.init(layoutPrincipal.content);	}
		},
		venda : {
			text: "Venda",
			run: function() { procesoVenda.start();	},
			init: function() { procesoVenda.init(layoutPrincipal.content); }
		},
		editorTeclats : {
			text: "Editor Teclats",
			run: function() { procesoEditorTeclats.start();	},
			init: function() { procesoEditorTeclats.init(layoutPrincipal.content); }
		},
		cajaFuerte : {
			text: "Caja Fuerte",
			run: function() { procesoCajaFuerte.start(); },
			init: function() { procesoCajaFuerte.init(layoutPrincipal.content); }	
		}
	};

	var menus = {
		noDependenta : [ opcionesMenu.puerta ],
		dependenta : [
			opcionesMenu.puerta,
			opcionesMenu.venda,
			opcionesMenu.editorTeclats,
			opcionesMenu.cajaFuerte
		],
	};
	
	var opcionMenuInicial = {
		noDependenta : null,
		dependenta : opcionesMenu.venda,
	}
	
	var optDependentaSelectedScroll = null;
	function dependentesActivesHandler() {
		if (optDependentaSelectedScroll != null) optDependentaSelectedScroll.removeClass("ui-state-active");
		optDependentaSelectedScroll = $(this).addClass("ui-state-active");
		DepActives.setActual($(this).data("dep"));
		D = DepActives.getDatosProceso("menuPrincipal");
		redraw();
	}

	var dependentesActivesModel = $("<button>").css({width:"100%", height:"100%"})
	                                           .addClass("ui-state-default").mousedown(dependentesActivesHandler);
	var defaultElementDependenta = dependentesActivesModel.clone(false).html("X<br>X");  
	var dependentesActivesScroll = new myScroll("_ud", defaultElementDependenta);
	positionDiv(dependentesActivesScroll.getDiv(), 0, 20, 100, 100).appendTo(divM);

	var noDependenta = {
		dep : { 
			codi: null,
		},
	}

	function redraw() {
		divM.siblings().hide();
		divM.show();
		
		menuScroll.removeAll();
		for (var i=0, pos=null; i < D.menu.length; i++) {
			var opt = D.menu[i];
			var el = menuModel.clone(true).data("opt", opt).text(opt.text).appendTo(menuScroll.newElement());	
			if (opt == D.optMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				optMenuSelectedScroll = el;
			} else {
				el.addClass("ui-state-default");
			}
		}
		if (pos != null) menuScroll.scrollTo(pos, true);
		menuScroll.redraw();

		//redrawDependentesActives
		var idxSelected = 0;
		dependentesActivesScroll.removeAll();
		var dep;
		for (var i=0, pos = null; (dep = DepActives.getByIdx(i)) != null; i++) {
			var el = dependentesActivesModel.clone(true).text(dep.dep.nom).data("dep", dep)
			                                            .appendTo(dependentesActivesScroll.newElement());
			if (dep == DepActives.getActual()) {
				el.addClass("ui-state-active");
				pos = i;
				optDependentaSelectedScroll = el;
			} 
		}
//		if (posDepAct == -1) { posDepAct=0; codiDependentaActual = null; }
		if (pos != null) dependentesActivesScroll.scrollTo(pos, true);
		dependentesActivesScroll.redraw();
		
		if (D.optMenuSel != null) D.optMenuSel.run();
		else { layoutPrincipal.content.children().hide(); }
	}
	my.init = function() {
		divM.appendTo(layoutPrincipal.menu).hide();
		
		var depActAdd = DepActives.add, depActDel = DepActives.del;
		DepActives.add = function(dep) {
			depActAdd(dep);
			DepActives.setActual(dep);
			D = DepActives.getDatosProceso("menuPrincipal");
			D.menu = menus.dependenta;
			D.optMenuSel = opcionMenuInicial.dependenta;
			redraw();
		}
		DepActives.del = function(dep) {
			depActDel(dep);
			if (DepActives.getActual() == dep) {
				dep = DepActives.getByIdx(0);
				if (dep == null) dep = noDependenta;
				DepActives.setActual(dep);
			}
			D = DepActives.getDatosProceso("menuPrincipal");
			redraw();
		}

		DepActives.setActual(noDependenta);
		D = DepActives.getDatosProceso("menuPrincipal");
		D.menu = menus.noDependenta;
		D.optMenuSel = opcionMenuInicial.noDependenta;

		for (var i in opcionesMenu) {
			if (opcionesMenu.hasOwnProperty(i)) opcionesMenu[i].init();
		}
		$(window).resize(function() {
			if (isDivVisible(divM)) {
				menuScroll.redraw();
				dependentesActivesScroll.redraw();
			}			
		});
	};
	my.start = function() {
		redraw();
	};
/*	my.stop = function() {
		divM.hide();	
	};
*/
	return my;
}();

procesoInicializarConServidor = function() {
	var my = {};
	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100);
	var divE = positionDiv(null,0,0,100,100).css({ padding: "1em" }).addClass("ui-widget-content").appendTo(div0);
	var divE2 = positionDiv(null,0,0,100,100).css({ position: "relative", height: "100%" }).appendTo(divE);
	var divIP = $("<div>").css({ textAlign: "center" }).appendTo(divE2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP);
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divE2);
	var divC = positionDiv(null,0,0,100,100).css({ padding: "1em" }).addClass("ui-widget-content").appendTo(div0);
	divC.text("Conectando..."); 
	
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		$(window).resize(function() { fResize = true; if (isDivVisible(div0)) { resizeDiv0(); } }); 
	}
	my.start = function() {
		div0.siblings().hide();
		div0.show();
		divE.siblings().hide();
		divE.show();
		input.val("");
		password.val("");
		keyboard.reset();
		keyboard.setInput(input);
		keyboard.setCallback(callbackKeyboard0); 
		resizeDiv0();
	};

	var fResize = true;
	
	function resizeDiv0() {
		if (fResize === false) return; 
		var w0 = divE2.width(), h0 = divE2.height();
		var h2 = divIP.height(), w2 = divIP.width(); 
		positionKeyboard(keyboard, 0, h2, w2, h0);
		fResize = false;
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			password.val("");
			keyboard.setInput(password);
			keyboard.setCallback(callbackKeyboard1);	
		}
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			divC.siblings().hide();
			divC.show();
			var init = {user: input.val(), password: password.val(), 
			            producto: ConstantGTPV.producto, version: ConstantGTPV.version};
			inicializarConServidor(init);
//			keyboard.callback = function() {};
		}
	}
	return my;
}();
	
function initAplication() {
//	layoutPrincipal.show();
	menuPrincipal.init();
	menuPrincipal.start();
}

ConstantGTPV = { producto: "TPV", version: "0.1" };

PAD = 16;
PADpx = "16px";

$(function() {

	// main
	GlobalGTPV.init(function() {
		positionDiv($("body"),0,0,100,100).css({margin : "0px"});

		var testPad = $("<div>").css({ padding: "1em" }).appendTo("body");
		PAD = testPad.outerHeight()/2;
		PADpx = PAD+"px";
		testPad.remove();

		layoutPrincipal.show();
		procesoInicializarConServidor.init();
		var prefijoCliente = GlobalGTPV.get("prefijoCliente", false); 
		if (prefijoCliente == null) {
			procesoInicializarConServidor.start();
		} else {
			GlobalGTPV.setPrefijo(prefijoCliente);
			DB.init(prefijoCliente);
			LS.init(prefijoCliente);	
			initAplication();
			comunicacionConServidor();
		}
	});

});

