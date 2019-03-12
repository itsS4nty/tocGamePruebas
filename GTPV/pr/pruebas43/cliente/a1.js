
function positionDiv(div,x0,y0,x1,y1) {
	div = $(div || "<div>");
	div.css({position: "absolute", boxsizing: "border-box", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

function createAligner() {
	return $("<img>").attr("src", "cliente/dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
}


layoutPrincipal = function() {
	var my = {};
	var div = positionDiv(null,0,0,100,100).hide();;
	my.menu = positionDiv(null, 0, 0, 20, 100).appendTo(div);
	my.content = positionDiv(null, 20, 0, 100, 100).appendTo(div);

/*  descomentar versión final, de momento para pruebas

	div.css({overflow: "hidden"});
	my.menu.css({overflow: "hidden"});
	my.subMenu.css({overflow: "hidden"});
	my.content.css({overflow: "hidden"});
*/
	my.show = function() {
		div.appendTo("body");
		div.siblings().hide();
		div.show();
	};
	my.hide = function() {
		div.hide();
	};
	return my;
}();

menuPrincipal = function() {
	var my = {};
	var divM = positionDiv(null,0,0,100,100);
	var menuScroll = new myScroll("_ud", 2);
	positionDiv(menuScroll.getDiv(), 0,0, 100, 20).appendTo(divM);

	function menuHandler(e) {
		activateMenu($(this).data("menu"));
	}
	function activateMenu(menu) {
		for (var i=0, depActual=noDependenta; i<dependentesActives.length; i++) {
			if (dependentesActives[i].codi == codiDependentaActual) { depActual=dependentesActives[i]; break; }	
		}

		var idxP = depActual.prevMenuSelected.indexOf(depActual.menuSelected);
		if (idxP != -1) depActual.prevMenuSelected.splice(idxP, 1);
		depActual.prevMenuSelected.unshift(depActual.menuSelected);
		depActual.menuSelected = menu;

		actualizar();
	}
	var menuModel = $("<button>").css({width:"100%", height:"100%"}).mousedown(menuHandler);
	
	var opcionesMenu = {
		entradaSalidaDependenta : {
			text: "Entrada/Salida Dependenta",
			run: function() {
				function callback(dependenta) {
					for (var i=0, dep=noDependenta; i<dependentesActives.length; i++) { 
						if (dependentesActives[i].codi == codiDependentaActual) { dep = dependentesActives[i]; break; }
					}
					var prevMenu = dep.prevMenuSelected.shift();
					if (prevMenu != null) dep.menuSelected = prevMenu;
					
					if (dependenta != null) {
						if (dependenta.entrar) {
							codiDependentaActual = dependenta.codi;
							var dep = {
								codi: codiDependentaActual,
								nom: "",
								menu: defaultMenuDependenta,
								menuSelected: opcionesMenu.comanda,
								prevMenuSelected: [],
								datosProceso: {}
							}
							for (var i=0; i<dependentesActives.length; i++) { 
								if (dependentesActives[i].codi == codiDependentaActual) break;
							}
							dependentesActives[i] = dep;

							var dbP = DB.openPrincipal()
							var statP = "SELECT nom as nom " 
									   +"FROM dependentes "
									   +"WHERE codi = ? ";
		
							dbP.transaction(function (tx) {
								tx.executeSql(statP, [codiDependentaActual], function (tx,res) {
									if (res.rows.length > 0) dep.nom = res.rows.item(0).nom || "";
									activateMenu(opcionesMenu.comanda); 
								}, function() { activateMenu(opcionesMenu.comanda); });
							});
						} else {
							// borrar dependenta
							for (var i=0; i<dependentesActives.length; i++) { 
								if (dependentesActives[i].codi == codiDependentaActual) break;
							}
							dependentesActives.splice(i,1);	
							codiDependentaActual = (dependentesActives.length>0) ? dependentesActives[0] : null;	
							actualizar();
						}
					} else {
						actualizar();
					}
				} // end callback

				for (var i=0, dep=noDependenta; i<dependentesActives.length; i++) { 
					if (dependentesActives[i].codi == codiDependentaActual) { dep = dependentesActives[i]; break; }
				}
				procesoEntradaSalidaDependenta.start(dep, dependentesActives, callback);
			},
			init: function() { procesoEntradaSalidaDependenta.init(); },
		},
		comanda : {
			text: "Comanda",
			run: function() {
				for (var i=0, dep=noDependenta; i<dependentesActives.length; i++) { 
					if (dependentesActives[i].codi == codiDependentaActual) { dep = dependentesActives[i]; break; } 
				}
				dep.prevMenuSelected = [];
				procesoComanda.start(dep);
			},
			init: function() { procesoComanda.init(); }
		}
	};

	var defaultMenuDependenta = [
		opcionesMenu.entradaSalidaDependenta,
		opcionesMenu.comanda
	];
	
	var noDependentaMenu = [
		opcionesMenu.entradaSalidaDependenta,
	];
//	dependentesActivesScroll.redraw();

	function dependentesActivesHandler() {
		codiDependentaActual = $(this).data("codi");
		actualizar();
	}

	var dependentesActivesModel = $("<button>").css({width:"100%", height:"100%"}).mousedown(dependentesActivesHandler);
	var defaultElementDependenta = dependentesActivesModel.clone(false).html("X<br>X");  
	var dependentesActivesScroll = new myScroll("_ud", null, defaultElementDependenta);
	positionDiv(dependentesActivesScroll.getDiv(), 0, 20, 100, 100).appendTo(divM);

	var codiDependentaActual = null;
	var dependentesActives = [];
	var noDependenta = {
		codi: null,
		menu: noDependentaMenu,
		menuSelected: opcionesMenu.entradaSalidaDependenta,
		prevMenuSelected: [opcionesMenu.entradaSalidaDependenta],
		datosProceso: {}
	}

	function actualizar() {
		divM.siblings().hide();
		divM.show();
		
		var depActual = null;

		for (var i=0; i<dependentesActives.length; i++) {
			if (dependentesActives[i].codi == codiDependentaActual) { depActual=dependentesActives[i]; break; }	
		}
		if (depActual == null) {
			depActual = (dependentesActives.length > 0) ? dependentesActives[0] : noDependenta;
			codiDependentaActual = depActual.codi;
		}

		// redrawMenu
		menuScroll.removeAll();
		for (var i=0, idxSelect=0; i<depActual.menu.length; i++) {
			var menu = depActual.menu[i];
			var el = menuModel.clone(true).data("menu", menu).text(menu.text).appendTo(menuScroll.newElement());	
			if (menu == depActual.menuSelected) {
				el.addClass("ui-state-active");
				idxSelected = i;
			} else {
				el.addClass("ui-state-default");
			}
		}
		menuScroll.scrollTo(idxSelected, true);
		menuScroll.redraw();

		//redrawDependentesActives
		var idxSelected = 0;
		dependentesActivesScroll.removeAll();
		for (var i=0; i<dependentesActives.length; i++) {
			var dep = dependentesActives[i];
			var el = dependentesActivesModel.clone(true).appendTo(dependentesActivesScroll.newElement());
			el.data("codi", dep.codi)
			  .text(dep.nom);
//			createAligner().appendTo(el);
//			$("<div>").css({display: "inline-block", verticalAlign: "middle"})
//					  .text(dep.dependenta.nom).appendTo(el);  
			if (dep.codi == codiDependentaActual) {
				el.addClass("ui-state-active");
				idxSelected = i;
			} else {
				el.addClass("ui-state-default");
			}
		}
//		if (posDepAct == -1) { posDepAct=0; codiDependentaActual = null; }
		dependentesActivesScroll.scrollTo(idxSelected, true);
		dependentesActivesScroll.redraw();
		
		depActual.menuSelected.run();
	}
	function resizeDivM() {
//		dependentesActivesScroll.redraw();
	}
	my.init = function() {
		divM.appendTo(layoutPrincipal.menu).hide();
		for (var i in opcionesMenu) {
			if (opcionesMenu.hasOwnProperty(i)) opcionesMenu[i].init();
		}
		$(window).resize(function() { if (divM.get(0).offsetWidth > 0) resizeDivM(); })
	};
	my.start = function() {
		actualizar();
	};
	my.stop = function() {
		divM.hide();	
	};

	return my;
}();

procesoEntradaSalidaDependenta = function() {	
	var my = {};

	function entrarHandler(e) {
		entrarDependenta();
	}
	function plegarHandler(e) {
		dialogPlegarSeguro.text("Plega "+dependenta.nom+" ?").dialog("open");
	}
	var divCont0 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");
	$("<button>").text("Entrar").click(entrarHandler).appendTo(divCont0);
	var butPlegar = $("<button>").text("Plegar").click(plegarHandler).appendTo(divCont0);
//	var divSM = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.subMenu).hide(); 
	var divContEntrar = positionDiv(null,0,0,100,100).addClass("ui-widget-content");
	var divIP = positionDiv(null, 3, 5, 70, 25).css({ textAlign: "center" }).appendTo(divContEntrar);
	$("<br>").appendTo(divIP);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); $("<br>").appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP); $("<br>").appendTo(divIP);
	$("<br>").appendTo(divIP);
	var divKeyboardCont = positionDiv(null, 3, 25, 70, 95).css({textAlign: "center"}).appendTo(divContEntrar);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divKeyboardCont);
	
	var autoCompleteModel = $("<button>").css({ width: "100%", height: "100%" }).click(clickAutoCompleteHandler);
	var defaultElementAutoComplete = autoCompleteModel.clone(false).html("X<br>X"); 
	var autoComplete = new myScroll("_ud", null, defaultElementAutoComplete);
	positionDiv(autoComplete.getDiv(), 71, 5, 95, 95).appendTo(divContEntrar);
//	autoComplete.redraw();
	
	var callback;
	
	var dependentesNoActives = [];
	var dependentaSeleccionada = null;
	var dependentesTotals = [];

	var dialogPasswordIncorrecto;
	var dialogPlegarSeguro;
	
	var dependenta, dependentesActives, callback;
	my.init = function() {
		divCont0.appendTo(layoutPrincipal.content).hide();
		divContEntrar.appendTo(layoutPrincipal.content).hide();
		obtenerDB();
		callbackComunicacion.add(function() {
			obtenerDB();
/*			if (divContEntrar.css("display") != "none") {
				actualizarDependentesNoActives();	
			}
*/		});

		dialogPasswordIncorrecto = $("<p>Password incorrecto</p>").dialog({
			autoOpen: false,
			modal: true,
			buttons: { "Ok": function() { $(this).dialog("close"); }},
			close: function(event,ui) { password.val(""); }
		});
	
		dialogPlegarSeguro = $("<p>").dialog({
			autoOpen: false,
			modal: true,
			buttons: { "Sí": function() { $(this).dialog("close"); callback({entrar: false}); }, 
					   "No": function() { $(this).dialog("close"); callback(null); } },
		});

		$(window).resize(function() { if (divContEntrar.get(0).offsetWidth > 0) { resizeDivEntrar(); } }); 
	};
	my.start = function(_dependenta, _dependentesActives, _callback) {
		dependenta = _dependenta;
		dependentesActives = _dependentesActives;
		callback = _callback;
		butPlegar[(dependenta.codi != null) ? "show" : "hide"]();
		divCont0.siblings().hide();
		divCont0.show();
	};
	function entrarDependenta() {
		divContEntrar.siblings().hide();
		divContEntrar.show();
		input.val("");
		input.removeAttr("disabled");
		password.val("");
		password.attr("disabled", "disabled");
		keyboard.input = input;
		keyboard.reset();
		keyboard.actionButtons["enter"].attr("disabled", "disabled");
		keyboard.callback = callbackKeyboard0; 
		keyboard.changeHandler = autoCompleteHandler;

//		dependentesNoActives = [];
		obtenerDependentesNoActives();
		autoCompleteHandler();
		resizeDivEntrar();
//		actualizarDependentesNoActives();
	}
	function resizeDivEntrar() {
		var w = divKeyboardCont.width();
		var h = Math.floor(w*keyboard.numButtons[1]/keyboard.numButtons[0]);
		if (h > divKeyboardCont.height()) {
			h = divKeyboardCont.height();
			w = Math.floor(h*keyboard.numButtons[0]/keyboard.numButtons[1]);
		}
		keyboard.getDiv().width(w);
		keyboard.getDiv().height(h);
		autoComplete.redraw();
	}
//	function actualizarDependentesNoActives() {	
	function obtenerDB() {
		var dbP = DB.openPrincipal()
		var statP = "SELECT d.codi as codi, d.nom as nom, e.valor as password " 
                   +"FROM dependentes as d "
				   +"INNER JOIN ("
				   +"    SELECT id, valor FROM dependentesextes "
				   +"    WHERE nom = 'PASSWORD'"
				   +") as e "
				   +"ON (d.codi = e.id)";
		
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				dependentesTotals = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					dependentesTotals.push({codi: row.codi, nom: row.nom, password: row.password});
				}
				if (divContEntrar.get(0).offsetWidth > 0) {
					obtenerDependentesNoActives();
					autoCompleteHandler();
				}
			});
		});
	}
	function obtenerDependentesNoActives() {
		dependentesNoActives = [];
		for (var i=0; i<dependentesTotals.length; i++) {
			for (var j=0; j<dependentesActives.length; j++) {
				if (dependentesTotals[i].codi == dependentesActives[j].codi) break;	
			}
			if (j == dependentesActives.length) {
				dependentesNoActives.push({
					codi : dependentesTotals[i].codi,
					nom : dependentesTotals[i].nom,
					password: dependentesTotals[i].password,
					compareNom : translateCompare(dependentesTotals[i].nom)
				});
			}
		}
		// if (dependentesNoActives.length == 0) dialogNoHayDependentesNoActives(); ??
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") callback(null);
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") callback(null);
		if (m == "enter") {
			// verify password
			if (dependentaSeleccionada.password != null) {
				if (password.val() != dependentaSeleccionada.password) {
					dialogPasswordIncorrecto.dialog("open");
					return;
				}
			}
			var db = DB.openMensual();
			db.transaction( function(tx) {
				var statement = "INSERT INTO [V_Horaris"+DB.mensualSufix+"] ([Botiga], [data], [dependenta], [operacio]) "
				               +"VALUES (?,?,?,?)";
				tx.executeSql(statement, 
					[localStorage.getItem("ClienteId"), DB.getSqlDate(), dependentaSeleccionada.codi, "E"],
					DB.success, DB.error);
				callback({entrar: true, codi: dependentaSeleccionada.codi, nom: dependentaSeleccionada.nom});
			});
		}
	}
	function autoCompleteHandler() {
		autoComplete.removeAll();
		var inputCompare = translateCompare(input.val());
		for (var i=0; i<dependentesNoActives.length; i++) {
			if (dependentesNoActives[i].compareNom.indexOf(inputCompare) != -1) {
				var el = autoCompleteModel.clone(true).appendTo(autoComplete.newElement());
				el.text(dependentesNoActives[i].nom)
				  .data("data", dependentesNoActives[i]);
			}
		}
		autoComplete.redraw();
	}
	function clickAutoCompleteHandler() {
		input.val($(this).text());
		input.attr("disabled", "disabled");
		password.val("");
		password.removeAttr("disabled");
		keyboard.reset();
		keyboard.input = password;
		keyboard.actionButtons["enter"].removeAttr("disabled");
		keyboard.callback = callbackKeyboard1; 
		keyboard.changeHandler = keyboard.defaultChangeHandler;
//		codiDependentaSeleccionada = $(this).data("codi");
		dependentaSeleccionada = $(this).data("data");
		autoComplete.removeAll();
		if (dependentaSeleccionada.password == null) callbackKeyboard1("enter");  // no hace falta pulsar enter
	}
	function translateCompare(str) {
		function translateCompareChar(c) {
			var testChars    = "àáäèéëìíïòóöùúüñç";
			var replaceChars = "aaaeeeiiiooouuunc";
			var idx = testChars.indexOf(c);
			return (idx==-1) ? c : replaceChars.charAt(idx);
		}
		return str.toLowerCase().split("").map(translateCompareChar).join("");
	}
	my.stop = function() {
		div.hide();	
	}
	return my;
}();


procesoInitPeticionCliente = function() {
	var my = {};
	var div0 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");
	var input = positionDiv("<input type='text'/>", 10, 10, 60, 15).appendTo(div0);
	var password = positionDiv("<input type='password'/>", 10, 30, 60, 35).appendTo(div0);
	var keyboard = new Keyboard();
	positionDiv(keyboard.getDiv(),10,40,60,90).appendTo(div0);
	var div1 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");
	div1.text("Conectando..."); 
	
	my.init = function() {
		div0.appendTo("body").hide();
		div1.appendTo("body").hide();
		$(window).resize(function() { if (div0.get(0).offsetWidth > 0) resizeDiv0(); });
	}
	my.start = function() {
		div0.siblings().hide();
		div0.show();
		resizeDiv0();
		input.val("");
		password.val("");
		keyboard.reset();
		keyboard.input = input;
		keyboard.callback = callbackKeyboard0; 
	};
	function resizeDiv0() {
		
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			password.val("");
			keyboard.input = password;
			keyboard.callback = callbackKeyboard1;	
		}
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			div1.siblings().hide();
			div1.show();
			inicializarConServidor(input.val(), password.val(), "TPV", "0.1");
//			keyboard.callback = function() {};
		}
	}
	return my;
}();
	
function initAplication() {
	DB.init();
	layoutPrincipal.show();
	menuPrincipal.init();
	menuPrincipal.start();
}

$(function() {
	// main

	positionDiv($("body"),0,0,100,100).css({margin : "0px"});
	if (localStorage.getItem("ClienteId") == null) {
		procesoInitPeticionCliente.init();
		procesoInitPeticionCliente.start();
	} else {
		initAplication();
		comunicacionConServidor();	
	}
});

