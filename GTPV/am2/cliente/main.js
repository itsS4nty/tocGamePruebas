	// main
H.main = function() {
	var my = {};
	
	my.startApplication = function() {
		loadDataH(function() {		
			H.HtmlFiles.start();
			H.Scripts.start();
			H.CSSFiles.start();
			H.ImageFiles.start();
			H.ManifestFiles.start();
			H.PhpFiles.start();
			H.Comm.init(null, satelliteRegistrationHandler);
			H.Scripts.localExec(H.Scripts.getNames("L")); // scripts locales
			CommS.init(0, H.Comm.localCommunication); // 0 -> localSat, llamara a satelliteRegistrationHandler
		});	
	}

	function loadDataH(callback) {
		(function (callback) {
			var cbm = new callbackManager(callback);

			H.Articles.init(cbm.get());
			H.Teclats.init(cbm.get());
			H.DosNivells.init(cbm.get());
			H.Dependentes.init(cbm.get());
			H.ConceptosEntrega.init(cbm.get());
			H.Caja.init(cbm.get());
			H.Mesas.init(cbm.get());
			
			cbm.activate();
		})(function() {
			var cbm = new callbackManager(callback);
			H.Comandes.init(cbm.get()); // Comandes necesita que caja este inicializado
			cbm.activate();  
		});	
	}

	function satelliteRegistrationHandler(sat, oldSat) {
		if (oldSat) unloadDataS(oldSat);
		loadDataS(sat, function() {
			// ???? guardar info de satelite
			// init MenuPrincipal
			var configSat = H.SatConfig.getConfig(sat);
			if (configSat.typeApp == "camarero") {
				sat.sendScript("var main=createAppCMain(); main.init(layoutC.div); main.start();");
			} else {
				var menuData;
				if (sat.isLocal()) {
					menuData = H.menuPrincipal.menusSatelliteLocal;
				} else menuData = H.menuPrincipal.menusSatelliteExtern; // ????	
				var menus = H.menuPrincipal.createOptions(menuData, H.menuPrincipal.opcionesMenu);
				
				sat.sendObjectAssign("menuPrincipal.menus", menus);
				sat.sendScript("menuPrincipal.init(); menuPrincipal.start();"/*, function(ret,er) { alert("ret:"+ret+" er:"+er); }*/);	
			}
		});
		return true;
	}


	function loadDataS(sat, callback) {
			
		(function (callback) {
			var cbm = new callbackManager(callback);
		
			H.Articles.createSat(sat, cbm.get());
			H.Teclats.createSat(sat, cbm.get());
			H.DosNivells.createSat(sat, cbm.get());
			H.Dependentes.createSat(sat, cbm.get());
			H.ConceptosEntrega.createSat(sat, true, cbm.get());
			H.Caja.createSat(sat, true, cbm.get());
			H.Mesas.createSat(sat, cbm.get());

			H.SatConfig.createSat(sat, cbm.get());
			
			cbm.activate();  
		})(function() {
			var cbm = new callbackManager(callback);
			H.Comandes.createSat(sat, cbm.get()); // Comandes necesita que caja este inicializado
			cbm.activate();  
		});
	}

	function unloadDataS(sat) {
		H.Articles.destroySat(sat);
		H.Teclats.destroySat(sat);
		H.DosNivells.destroySat(sat);
		H.Dependentes.destroySat(sat);
		H.ConceptosEntrega.destroySat(sat);
		H.Comandes.destroySat(sat);
		H.Caja.destroySat(sat);
		H.SatConfig.destroySat(sat);
	}
	
	// main start
	my.main = function() {	
		$("#javascript_no_activo").remove();
		layout.init();	
		H.ConfigGTPV.init(function() {
//			div100x100($("body")).css({margin : "0px"}).addClass("ui-widget");
			
//			layoutPrincipal.show();
			H.AppInicializarConServidor.init();
			var prefijoCliente = H.ConfigGTPV.get("prefijoCliente", false); 
			if (prefijoCliente == null) {
				H.AppInicializarConServidor.start();
			} else {
				H.ConfigGTPV.setPrefijo(prefijoCliente);
				LS.init(prefijoCliente);	
				messages.setLang(LS.get("lang"));
				H.DB.init(prefijoCliente);
				my.startApplication();
				H.Server.programCommunication(5000); // 5 seg.
			}
		});
	}
	
	return my;
}();

$(function() {
	H.main.main();
});

