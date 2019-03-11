menuPrincipal = function() {
	var my = {};
	
	var S = {};
	
	var divM = div100x100();
	var menuScroll = new myScroll("_ud", 2);
	positionDiv(menuScroll.getDiv(), 0,0, 100, 20).appendTo(divM);

	var elMenuSel = null;
	function menuHandler(e) {
		if (elMenuSel != null) elMenuSel.removeClass("ui-state-active");
		elMenuSel = $(this).addClass("ui-state-active");
		S.optMenuSel = $(this).data("opt");
		opMenu[S.optMenuSel].run();
	}
	var menuModel = $("<button>").css({width:"100%", height:"100%"})
	                             .addClass("ui-state-default").mousedown(menuHandler);
	
	var opMenu = {
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
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda",
			"editorTeclats",
			"cajaFuerte"
		],
	};
	
	var opMenuInicial = {
		noDependenta : null,
		dependenta : "venda",
	}
	
	var elDependentaSel = null;
	function dependentesActivesHandler() {
		if (elDependentaSel != null) elDependentaSel.removeClass("ui-state-active");
		elDependentaSel = $(this).addClass("ui-state-active");
		DepActives.setActual($(this).data("dep"));
		S = DepActives.getDatosProceso("menuPrincipal");
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
		divShow(divM);
		
		//redraw Menu
		menuScroll.removeAll();
		elMenuSel = null;
		for (var i=0, pos=null; i < menus[S.menu].length; i++) {
			var opt = menus[S.menu][i];
			var el = menuModel.clone(true).data("opt", opt).text(opMenu[opt].text).appendTo(menuScroll.newElement());	
			if (opt == S.optMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				elMenuSel = el;
			} else {
				el.addClass("ui-state-default");
			}
		}
		if (pos != null) menuScroll.scrollTo(pos, true);
		menuScroll.redraw();

		//redraw Dependentes Actives
		dependentesActivesScroll.removeAll();
		elDependentaSel = null;
		for (var i=0, pos = null, dep; (dep = DepActives.getByIdx(i)) != null; i++) {
			var el = dependentesActivesModel.clone(true).text(dep.dep.nom).data("dep", dep)
			                                            .appendTo(dependentesActivesScroll.newElement());
			if (dep == DepActives.getActual()) {
				el.addClass("ui-state-active");
				pos = i;
				elDependentaSel = el;
			} 
		}
//		if (posDepAct == -1) { posDepAct=0; codiDependentaActual = null; }
		if (pos != null) dependentesActivesScroll.scrollTo(pos, true);
		dependentesActivesScroll.redraw();
		
		if (S.optMenuSel != null) opMenu[S.optMenuSel].run();
		else { layoutPrincipal.content.children().hide(); }
	}
	my.init = function() {
		divM.appendTo(layoutPrincipal.menu).hide();
		
		var depActAdd = DepActives.add, depActDel = DepActives.del;
		DepActives.add = function(dep) {
			depActAdd(dep);
			DepActives.setActual(dep);
			S = DepActives.getDatosProceso("menuPrincipal");
			S.menu = "dependenta";
			S.optMenuSel = opMenuInicial["dependenta"];
			redraw();
		}
		DepActives.del = function(dep) {
			depActDel(dep);
			if (DepActives.getActual() == dep) {
				dep = DepActives.getByIdx(0);
				if (dep == null) dep = noDependenta;
				DepActives.setActual(dep);
			}
			S = DepActives.getDatosProceso("menuPrincipal");
			redraw();
		}

		DepActives.setActual(noDependenta);
		S = DepActives.getDatosProceso("menuPrincipal");
		S.menu = "noDependenta";
		S.optMenuSel = opMenuInicial["noDependenta"];

		for (var i in opMenu) {
			if (opMenu.hasOwnProperty(i)) opMenu[i].init();
		}
		Resize.add(function() {
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

$(function() {

	// main
	GlobalGTPV.init(function() {
		div100x100($("body")).css({margin : "0px"});

		var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
		SEPpx = testSep.outerHeight()/2;
		testSep.remove();

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

