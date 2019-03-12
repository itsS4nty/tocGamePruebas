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
/*			var str0 = "abcdefghik";
			for (var i=0, str1=""; i<100*1024/10; i++) {
				str1+=str0;
			}
			window.cont1 = "<pre style='display:block'>"+str1+"</pre>";
			str0 = "";
			for (var i=128; i<256; i++) str0+=String.fromCharCode(i);
			window.cont1 = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" /></head>'
						  +'<pre>'+str0+'</pre></html>';
			H.Comm.addHandlerWeb(function(path, idSat) {
				if (path === "/qqq") {
					return {
						content : window.cont1, 
						utf8 : false,
						type : "text/html; charset=charset=iso-8859-1",
					};
				} else if (path === "/qqq2") {
					return {
						content : str0, 
						utf8 : false,
						type : "text/plain; charset=charset=iso-8859-1",
					};
				}return null;
			});
*/			H.Comm.init(null, satelliteRegistrationHandler);
			H.Scripts.localExec(H.Scripts.getNames("L")); // scripts locales
			CommS.init(0, H.Comm.localCommunication); // 0 -> localSat, llamara a satelliteRegistrationHandler
		});	
	}

	function loadDataH(callback) {
		var cbm = new callbackManager(callback);
			
		H.Articles.init(cbm.get(1));
		H.Teclats.init(cbm.get(2));
		H.Dependentes.init(cbm.get(3));
		H.ConceptosEntrega.init(cbm.get(4));
		H.Comandes.init(cbm.get(5));
		H.Caja.init(cbm.get(6));

		cbm.activate();
	}

	function satelliteRegistrationHandler(sat, oldSat) {
		if (oldSat) unloadDataS(oldSat);
		loadDataS(sat, function() {
			// ???? guardar info de satelite
			// init MenuPrincipal
			var menuData;
			if (sat.isLocal()) {
				menuData = H.menuPrincipal.menusSatelliteLocal;
			} else menuData = H.menuPrincipal.menusSatelliteExtern; // ????	
			var menus = H.menuPrincipal.createOptions(menuData, H.menuPrincipal.opcionesMenu);
			
			sat.sendObjectAssign("menuPrincipal.menus", menus);
			sat.sendScript("menuPrincipal.init(); menuPrincipal.start();"/*, function(ret,er) { alert("ret:"+ret+" er:"+er); }*/);	
		});
		return true;
	}


	function loadDataS(sat, callback) {
		var cbm = new callbackManager(callback);
			
		(function (callback) {	
			var cbm = new callbackManager(callback);

			H.Articles.createSat(sat, cbm.get());
			H.Teclats.createSat(sat, cbm.get());
			H.Dependentes.createSat(sat, cbm.get());
			H.ConceptosEntrega.createSat(sat, true, cbm.get());
			H.Caja.createSat(sat, true, cbm.get());

			cbm.activate();

		})(cbm.get());
		
		H.Comandes.createSat(sat, cbm.get()); // Comandes necesita que caja este inicializado

		cbm.activate();
	}

	function unloadDataS(sat) {
		H.Articles.destroySat(sat);
		H.Teclats.destroySat(sat);
		H.Dependentes.destroySat(sat);
		H.ConceptosEntrega.destroySat(sat);
		H.Comandes.destroySat(sat);
		H.Caja.destroySat(sat);
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

