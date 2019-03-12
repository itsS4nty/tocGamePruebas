	// main
H.main = function() {
	var my = {};
	
	my.startApplication = function() {
		loadDataH(function() {			
			H.HtmlFiles.start();
			H.Scripts.start();
			H.CSSFiles.start();
			H.ImageFiles.start();
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
			H.Scripts.localExec(H.Scripts.getNames(true, "L")); // scripts locales
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
				messages.setLang(LS.get("lang"));
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

