	// main
H.main = function() {
	var my = {};
	
	var opcionesMenu = {
		puerta : {
			text: "puerta",
			cssClass: "buttonPuerta",
			run: function(mp) { AppPuerta.start(mp); },
			init: function(div) { AppPuerta.init(div);	}
		},
		venda : {
			text: "Venda",
			cssClass: "buttonVenda",
			run: function(mp) { AppVenda.start(mp);	},
			init: function(div) { AppVenda.init(div); }
		},
		editorTeclats : {
			text: "Editor Teclats",
			cssClass: "buttonEditorTeclats",
			run: function(mp) { AppEditorTeclats.start(mp);	},
			init: function(div) { AppEditorTeclats.init(div); }
		},
		cajaFuerte : {
			text: "Caja Fuerte",
			cssClass: "buttonCajaFuerte",
			run: function(mp) { AppCajaFuerte.start(mp); },
			init: function(div) { AppCajaFuerte.init(div); }	
		},
	};

	var menusSatelliteLocal = {
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda", true,            // opcion inicial
			"editorTeclats",
			"cajaFuerte"
		],
		taula : [ "venda", true ]     // opción inicial
	};

	var menusSatelliteExtern = {
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda", true,            // opcion inicial
			"editorTeclats",
			"cajaFuerte"
		],
		taula : [ "venda", true ]     // opción inicial
	};

	my.startApplication = function() {
		H.Applet.init();
		loadDataH(function() {
			// H.Comm.addHandlerWeb(H.Scripts.handlerWeb);
			H.Comm.addHandlerWeb(H.HtmlFiles.handlerWeb);
			H.ScriptsManager.addHandlerWeb(H.Scripts.handlerWeb);
			H.ScriptsManager.init();

			H.Comm.init(null, satelliteRegistrationHandler);
			CommS.init(0, H.Comm.localCommunication); // 0 -> localSat, llamara a satelliteRegistrationHandler
		});	
	}

	function loadDataH(callbackInit) {
		var numFuncInit = 0; 
		function newCallbackInit(a) {
			numFuncInit++;
//			console.log("-> "+a+" : "+numFuncInit);
			return function() {
//				console.log("<- "+a+" : "+numFuncInit);
				if ((--numFuncInit) == 0) callbackInit(); 	
			};
		}

		var CallbackInitActivate = newCallbackInit(0);
			
		H.Articles.init(newCallbackInit(1));
		H.Teclats.init(newCallbackInit(2));
		H.Dependentes.init(newCallbackInit(3));
		H.ConceptosEntrega.init(newCallbackInit(4));
		H.Comandes.init(newCallbackInit(5));
		H.Caja.init(newCallbackInit(6));

		CallbackInitActivate();
	}

	function createOptionsMenuPrincipal(menus, ops) {
		var genMenus = { m:{}, ops: {}, initial: {} };
		for (var t in menus) {
			genMenus.m[t] = [];
			genMenus.initial[t] = null;
			var prevOpName;
			menus[t].forEach(function(opName, i) {
				if (opName === true) genMenus.initial[t] = prevOpName;
				else {
					genMenus.m[t].push(opName);
					genMenus.ops[opName] = ops[opName];
					prevOpName = opName;
				}
			});
		}
		return genMenus;
	}

	function satelliteRegistrationHandler(sat, oldSat) {
		loadDataS(sat, function() {
			// ???? guardar info de satelite
			// init MenuPrincipal
			var menuData;
			if (sat.isLocal()) {
				menuData = menusSatelliteLocal;
			} else menuData = menusSatelliteExtern; // ????	
			var menus = createOptionsMenuPrincipal(menuData, opcionesMenu);
			
			sat.sendObjectAssign("menuPrincipal.menus", menus);
			sat.sendScript("menuPrincipal.init(); menuPrincipal.start();");	
		});
		return true;
	}


	function loadDataS(sat, callbackInit) {
		var numFuncInit = 0; 
		function newCallbackInit(a) {
			numFuncInit++;
//			console.log("-> "+a+" : "+numFuncInit);
			return function() {
//				console.log("<- "+a+" : "+numFuncInit);
				if ((--numFuncInit) == 0) callbackInit(); 	
			};
		}

		var CallbackInitActivate = newCallbackInit(0);
			
		H.Articles.createSat(sat, newCallbackInit(1));
		H.Teclats.createSat(sat, newCallbackInit(2));
		H.Dependentes.createSat(sat, newCallbackInit(3));
		H.ConceptosEntrega.createSat(sat, true, newCallbackInit(4));
		H.Comandes.createSat(sat, newCallbackInit(5));
		H.Caja.createSat(sat, true, newCallbackInit(6));

		CallbackInitActivate();
	}

	// main start
	my.main = function() {	
		initLayout();	
		H.GlobalGTPV.init(function() {
//			div100x100($("body")).css({margin : "0px"}).addClass("ui-widget");
			
//			layoutPrincipal.show();
			H.AppInicializarConServidor.init();
			var prefijoCliente = H.GlobalGTPV.get("prefijoCliente", false); 
			if (prefijoCliente == null) {
				H.AppInicializarConServidor.start();
			} else {
				H.GlobalGTPV.setPrefijo(prefijoCliente);
				LS.init(prefijoCliente);	
				H.DB.init(prefijoCliente);
				my.startApplication();
				H.Server.programCommunication(2/60); // 2 seg.
			}
		});
	}
	
	return my;
}();

$(function() {
	H.main.main();
});

