Scripts.addLE("menuPrincipal", function(window) {
	
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

		for (var opName in my.menus.op) {
			my.menus.op[opName].init(layoutPrincipal.content);
		}
		
		Resize.add(function() {
			if (isDivVisible(divM)) {
				menuScroll.redraw();
				dependentesActivesScroll.redraw();
			}			
		});
	};
	
	function getDatosProceso() {
		var id = my.getIdActual();
		S = (D[id] = (D[id] || {}));
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
	my.getIdActual = function() {
		if (TaulaActual != null) return "T_"+TaulaActual.nom;
		if (DepActual != null) return "D_"+DepActual.codi;
		return null;
	}
	my.finProceso = function() {
		S.opMenuSel = my.menus.inicial[S.menu];
		redraw();
	}
	return my;
}();

});


	
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

var menusSateliteLocal = {
	noDependenta : [ "puerta" ],
	dependenta : [
		"puerta",
		"venda", true,            // opcion inicial
		"editorTeclats",
		"cajaFuerte"
	],
	taula : [ "venda", true ]     // opción inicial
};

function initAplication() {
	loadDataH(function() {
		CH.init(null/*initCHHandler ???? initApplet*/, sateliteRegistrationHandler);
		CS.init(0, CH); // 0 -> localSat, llamara a sateliteRegistrationHandler
	});	
}

function loadDataH(callbackInit) {
	var numFuncInit = 0; 
	function localCallbackInit() {
		if ((--numFuncInit) == 0) callbackInit(); 	
	}
	function newCallbackInit() {
		numFuncInit++;
		return localCallbackInit;
	}
	var CallbackInitActivate = newCallbackInit();
		
	DatosArticlesH.init(newCallbackInit());
	DependentesH.init(newCallbackInit());
//	DepActivesH.init(newCallbackInit());
	ConceptosEntregaH.init(newCallbackInit());
	CajaH.init(newCallbackInit());


/*	DatosArticles.init
	DatosArticlesH.init(changeDatosHandler, callbackInit);
	DependentesH.init(changeDataHandler, callbackInit);
	DepActivesH.init(depActChange, newCallbackInit());
	ConceptosEntregaH.init
	CajaH.init
	menuPrincipal.init(function() { Caja.init(function() { menuPrincipal.start(); }); });
*/
	CallbackInitActivate();
}

function createOptionsMenuPrincipal(menus, op) {
	var genMenus = { m:{}, op: {}, inicial: {} };
	for (var tipoMenu in menus) {
		genMenus.m[tipoMenu] = [];
		genMenus.inicial[tipoMenu] = null;
		var prevOpName;
		menus[tipoMenu].forEach(function(opName, i) {
			if (opName === true) genMenus.inicial[tipoMenu] = prevOpName;
			else {
				genMenus.m[tipoMenu].push(opName);
				genMenus.op[opName] = op[opName];
				prevOpName = opName;
			}
		});
	}
	return genMenus;
}

function sateliteRegistrationHandler(idSat, oldSat) {
	loadDataS(idSat, function() {
		// ???? guardar info de satelite
		// init MenuPrincipal
		var menuData;
		if (CH.isLocal(idSat)) {
			menuData = menusSateliteLocal;
		} else menuData = menusSateliteLocal; // ????	
		var menus = createOptionsMenuPrincipal(menuData, opcionesMenu);
		
		CH.sendObjectAssign(idSat, "menuPrincipal.menus", menus);
		CH.sendScript(idSat, "menuPrincipal.init(); menuPrincipal.start();");	
	});
}


function loadDataS(idSat, callbackInit) {
	var numFuncInit = 0; 
	function localCallbackInit() {
		if ((--numFuncInit) == 0) callbackInit(); 	
	}
	function newCallbackInit() {
		numFuncInit++;
		return localCallbackInit;
	}
	var CallbackInitActivate = newCallbackInit();
		
	DatosArticlesH.createSat(idSat, newCallbackInit());
	DependentesH.createSat(idSat, newCallbackInit());
//	DepActivesH.init(newCallbackInit());
	ConceptosEntregaH.createSat(idSat, newCallbackInit());
	CajaH.createSat(idSat, newCallbackInit());
	
	CallbackInitActivate();
}

$(function() {

	// main
	GlobalGTPV.init(function() {
//		window.CH = new ch();
/*		ScriptsManagerH.createSat(0);
		ScriptsManagerH.sendScript(0, "ComSatS", function() {
			CS.init(CH);	
		});
*/
//		div100x100($("body")).css({margin : "0px"}).addClass("ui-widget");

//		var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
//		SEPpx = testSep.outerHeight()/2;
//		testSep.remove();

//		initScroll();
		
//		CodisBarres.init();
		
//		layoutPrincipal.show();
		procesoInicializarConServidor.init();
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
	});

});

