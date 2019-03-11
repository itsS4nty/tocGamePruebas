debug = 0;
/*
function main() {
	if (localStorage.Cliente == null) {
		EntrarCliente();
	} else {
		// inicializar
		crearMenu();
		setTimeout(comunicacion, 10);		
	}
}

function EntrarCliente() {
	var d = $("<div><input type='text'><input type='password'><input type='button' value='Ok'></div>");
	d.appendTo("body");
	var b = d.children('input[type="button"]');
	b.click(function() {
		localStorage.Cliente.id = d.children('input[type="text"]').val();
		localStorage.Cliente.password = d.children('input[type="password"]').val();
		d.remove();
		main();
	});
	delete b;
}
*/

function positionDiv(div,x0,y0,x1,y1) {
	div = $(div || "<div>");
	div.css({position: "absolute", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

function getSqlDate() {
	var d = new Date();
	function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
 	return dos0(d.getDate())+"/"+dos0(d.getMonth())+"/"+dos0(d.getFullYear()%100)+" "
	      +dos0(d.getHours())+":"+dos0(d.getMinutes())+":"+dos0(d.getSeconds());
}

$(function() {

layoutPrincipal = function() {
	var my = {};
	var div = positionDiv(null,0,0,100,100).appendTo("body").hide();;
	my.menu = positionDiv(null, 0, 0, 20, 100).appendTo(div);
	my.subMenu = positionDiv(null, 20, 0, 100, 20).appendTo(div);
	my.content = positionDiv(null, 20, 20, 100, 100).appendTo(div);

/*  descomentar

	div.css({overflow: "hidden"});
	my.menu.css({overflow: "hidden"});
	my.subMenu.css({overflow: "hidden"});
	my.content.css({overflow: "hidden"});
*/
	my.start = function() {
		div.siblings().hide();
		div.show();
	}
	my.stop = function() {
		div.hide();
	}
	return my;
}();

menuPrincipal = function() {
	var my = {};
	var div = positionDiv(null,0,0,100,100).appendTo(layoutPrincipal.menu).hide();
	var opcionesMenu = new myScroll("_ud", 2);
	positionDiv(opcionesMenu.getDiv(), 0,0, 100, 40).appendTo(div);
	positionDiv("<Button>Entrar Dependenta</Button>",0,0,100,100).click( function() {
		subMenuEntrarDependenta.start(
			function(codiDependenta) {
				if (codiDependenta !== null) {
					my.setDependentaActual(codiDependenta);
				}
				// subMenuEntrarDependenta.stop();
				subMenuTeclatsTpv.start();
			}
		);
	}).appendTo(opcionesMenu.newElement());
	positionDiv("<Button>Teclat Tpv</Button>",0,0,100,100).click( function() {
		subMenuTeclatsTpv.start(
			function() {
			}
		);
	}).appendTo(opcionesMenu.newElement());
	
	var dependentesActives = new myScroll("_ud", 10);
	positionDiv(dependentesActives.getDiv(), 0, 40, 100, 100).appendTo(div);
	dependentesActives.redraw();

	var savedDepAct = [];
	var savedCodiDependentaActual = null;

	var codiDependentaActual = null;
	
	my.setDependentaActual = function(codi) { 
		codiDependentaActual = codi; 
		my.actualizarDependentesActives();
	}
	my.getDependentaActual = function() { return codiDependetaActual; }

	my.actualizarDependentesActives = function() {
		var dbM = DB.openMensual();
		var dbP = DB.openPrincipal()
		var statM = "SELECT t.Dependenta as Dependenta from ( "
		           +"	SELECT Dependenta, max(Data) as maxData from [V_Horaris"+DB.mensualSufix+"] GROUP BY Dependenta "
				   +") AS m INNER JOIN [V_Horaris"+DB.mensualSufix+"] AS t "
				   +"ON (t.Dependenta = m.Dependenta) AND (t.Data = m.maxData) "
				   +"WHERE t.operacio = 'E' "
				   +"ORDER BY t.Data ";
		var statP = "SELECT codi as codi, nom as nom FROM dependentes ";

		var arrayDepAct = null;
		var arrayDep = null;
		
		dbM.transaction(function (tx) {
			tx.executeSql(statM, [], function (tx,res) {
				arrayDepAct = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					arrayDepAct.push({codi: row.Dependenta});
				}
				processarDependentesActives();
			}, function() { arrayDepAct = []; processarDependentesActives(); });
		});
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				arrayDep = {};
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					arrayDep[row.codi] = {nom: row.nom};
				}
				processarDependentesActives();
			}, function() { arrayDep = {}; processarDependentesActives(); });
		});
			
		function processarDependentesActives() {
			if ((arrayDepAct === null) || (arrayDep === null)) return;
			for (var i=0; i<arrayDepAct.length; i++) {
				arrayDepAct[i].nom = ((arrayDep.hasOwnProperty(arrayDepAct[i].codi) && arrayDep[arrayDepAct[i].codi].nom) || "");
			}
/*			if (arrayDepAct.length == savedDepAct.length) {
				for (var i=0; i<arrayDepAct.length; i++) {
					if (arrayDepAct[i].codi != savedDepAct[i].codi) break;
					if (arrayDepAct[i].codi != savedDepAct[i].nom) break;
				}
				if (i == arrayDepAct.length) {
					if (codiDependentaActual == savedCodiDependentaActual) return;
				}
			}
*/			var posDepAct = 0;
			dependentesActives.removeAll();
			for (var i=0; i<arrayDepAct.length; i++) {
				var el = dependentesActives.newElement();
				el.text(arrayDepAct[i].nom).data("codi", arrayDepAct[i].codi)
			  	  .click(my.clickDependentesActivesHandler);
				if (codiDependentaActual == arrayDepAct[i].codi) {
					el.removeClass("ui-state-default").addClass("ui-state-active");
					posDepAct = i;
				}
			}
			dependentesActives.scrollTo(posDepAct, true);
			dependentesActives.redraw();
/*			savedDepAct = arrayDepAct;
			savedCodiDependentaActual = codiDependentaActual; */
//			setTimeout(my.actualizarDependentesActives, 5000);
		}
	}
	my.clickDependentesActivesHandler = function() {
		my.setDependentaActual($(this).data("codi"));
	}
	my.start = function(callback) {
		div.siblings().hide();
		div.show();
		opcionesMenu.redraw();
		dependentesActives.redraw();
		my.actualizarDependentesActives();
		my.callback = callback;
	}
	my.stop = function() {
		div.hide();	
	}
	return my;
}();

subMenuEntrarDependenta = function() {	
	var my = {};

	var divSM = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.subMenu).hide(); 
	var divC = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.content).hide();
	var input = positionDiv("<input type='text'/>", 10, 10, 60, 15).appendTo(divC);
	var password = positionDiv("<input type='password'/>", 10, 30, 60, 35).appendTo(divC);
	var keyboard = new Keyboard();
	positionDiv(keyboard.getDiv(),10,40,60,90).appendTo(divC);
	var autoComplete = new myScroll("_ud", 10);
	positionDiv(autoComplete.getDiv(), 70, 10, 90, 80).appendTo(divC);
	autoComplete.redraw();
	
	var dependentesNoActives = [];
	var dependentaSeleccionada = null;

	var dialogPasswordIncorrecto = $("<p>Password incorrecto</p>").dialog({
		autoOpen: false,
		modal: true,
		buttons: { "Ok": function() { $(this).dialog("close"); }},
		close: function(event,ui) { my.start(my.callback); }
	});

	
	my.start = function(callback) {
		divSM.siblings().hide();
		divC.siblings().hide();
		divSM.show();
		divC.show();
		input.val("");
		input.removeAttr("disabled");
		password.val("");
		password.attr("disabled", "disabled");
		keyboard.input = input;
		keyboard.reset();
		keyboard.actionButtons["enter"].attr("disabled", "disabled");
		keyboard.callback = my.callbackKeyboard0; 
		keyboard.changeHandler = my.autoCompleteHandler;

		dependentesNoActives = [];
		my.autoCompleteHandler();
		my.callback = callback;
//		if (dependentesNoActives.length == 0) my.callback(null);

		var dbM = DB.openMensual();
		var dbP = DB.openPrincipal()
		var statM = "SELECT t.Dependenta as Dependenta from ( "
		           +"	SELECT Dependenta, max(Data) as maxData from [V_Horaris"+DB.mensualSufix+"] GROUP BY Dependenta "
				   +") AS m INNER JOIN [V_Horaris"+DB.mensualSufix+"] AS t "
				   +"ON (t.Dependenta = m.Dependenta) AND (t.Data = m.maxData) "
				   +"WHERE t.Operacio = 'E' ";
		var statP = "SELECT d.codi as codi, d.nom as nom, e.valor as password " 
                   +"FROM dependentes as d "
				   +"INNER JOIN ("
				   +"    SELECT id, valor FROM dependentesextes "
				   +"    WHERE nom = 'PASSWORD'"
				   +") as e "
				   +"ON (d.codi = e.id)";

		var arrayDepAct = null;
		var arrayDep = null;
		
		dbM.transaction(function (tx) {
			tx.executeSql(statM, [], function (tx,res) {
				arrayDepAct = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					arrayDepAct.push(row.Dependenta);
				}
				processarDependentesNoActives();
			}, function() { arrayDepAct = []; processarDependentesNoActives(); });
		});
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				arrayDep = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					arrayDep.push({codi: row.codi, nom: row.nom, password: row.password});
				}
				processarDependentesNoActives();
			}, function() { arrayDep = []; processarDependentesNoActives(); });
		});
			
		function processarDependentesNoActives() {
			if ((arrayDepAct === null) || (arrayDep === null)) return;
			dependentesNoActives = [];
			for (var i=0; i<arrayDep.length; i++) {
				if (arrayDepAct.indexOf(arrayDep[i].codi) == -1) {
					dependentesNoActives.push({
						codi : arrayDep[i].codi,
						nom : arrayDep[i].nom,
						password: arrayDep[i].password,
						compareNom : my.translateCompare(arrayDep[i].nom)
					});
				}
			}
			// if (dependentesNoActives.length == 0) dialogNoHayDependentesNoActives(); ??
			my.autoCompleteHandler();
		}
	};
	my.callbackKeyboard0 = function(m) {
		if (m == "cancel") my.callback(null);
	};
	my.callbackKeyboard1 = function(m) {
		if (m == "cancel") my.callback(null);
		if (m == "enter") {
			// verify password
			if (password.val() != dependentaSeleccionada.password) {
				dialogPasswordIncorrecto.dialog("open");
				return;
			}
			var db = DB.openMensual();
			db.transaction( function(tx) {
				var statement = "INSERT INTO [V_Horaris"+DB.mensualSufix+"] (Botiga, data, dependenta, operacio) "
				               +"VALUES (?,?,?,?)";
				tx.executeSql(statement, 
					[localStorage.getItem("ClienteId"), getSqlDate(), dependentaSeleccionada.codi, "E"],
					DB.success, DB.error);
				my.callback(dependentaSeleccionada.codi);
			});
		}
	};
	my.autoCompleteHandler = function() {
		autoComplete.removeAll();
		var inputCompare = my.translateCompare(input.val());
		for (var i=0; i<dependentesNoActives.length; i++) {
			if (dependentesNoActives[i].compareNom.indexOf(inputCompare) != -1) {
				var el = autoComplete.newElement();
				el.text(dependentesNoActives[i].nom)
				  .data("data", dependentesNoActives[i])
				  .click(my.clickAutoCompleteHandler);
			}
		}
		autoComplete.redraw();
	};
	my.clickAutoCompleteHandler = function() {
		input.val($(this).text());
		input.attr("disabled", "disabled");
		password.val("");
		password.removeAttr("disabled");
		keyboard.reset();
		keyboard.input = password;
		keyboard.actionButtons["enter"].removeAttr("disabled");
		keyboard.callback = my.callbackKeyboard1; 
		keyboard.changeHandler = keyboard.defaultChangeHandler;
//		codiDependentaSeleccionada = $(this).data("codi");
		dependentaSeleccionada = $(this).data("data");
		autoComplete.removeAll();
	};
	my.translateCompare = function(str) {
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

subMenuTeclatsTpv = function() {
	var my = {}

	var nX=6, nY=6;
	var ambientActual = undefined;
	var datosTeclats = {};
	var arrayAmbients = [];
//	var posAmbientActual = -1;
//	var arrayAmbientsPos = [];
//	var AmbientsNameToPos = {};
	
	var divSM = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.subMenu).hide(); 
	var Ambients = new myScroll("_lr", nX);
	positionDiv(Ambients.getDiv(),0,0,100,100).appendTo(divSM);

	function clickButtonAmbient(e) {
		var el;
		if (ambientActual != null) {
			for (var i=0; (el = Ambients.get(i)) != null; i++) {
				if (ambientActual == el.text()) {
					el.children().removeClass("ui-state-active");
				}
				if (this == el.children().get(0)) {
					$(this).addClass("ui-state-active");
					Ambients.scrollTo(i, true);
				}
			}
		}
		ambientActual = $(this).text();
		my.setButtons(ambientActual);
	}
	
	var AmbientModel = $("<button>").css({boxSizing: "border-box", width: "100%", height: "100%", margin: "0px"})
						            /*.addClass("ui-corner-all")*/
						            .mousedown(clickButtonAmbient);
	var arrayAmbients = [];
	
	var divC = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.content).hide();
	var divTeclat = positionDiv(null,10,10,90,60).addClass("ui-widget-content").appendTo(divC);

	function clickButtonTeclatTpv(e) {
		var pos = $(this).data("pos");
	}

	var buttonModel = $("<button>").css({boxSizing: "border-box", width: (100/nY)+"%", height: "100%", margin: "0px", 
								         color: "black", verticalAlign: "middle"})
						           /*.addClass("ui-corner-all")*/
						           .click(clickButtonTeclatTpv);
	var arrayButtons = [];
	for (var x=0; x<nX; x++) {
		var row = $("<div>").css({width:"100%", height:(100/nX)+"%"}).appendTo(divTeclat); 
		for (var y=0; y<nY; y++) {
			arrayButtons[x*nY+y] = buttonModel.clone(true).data("pos", x*nY+y).appendTo(row);
		}
	}

	var savedAmbients = [];
	

	my.start = function(callback) {
		divSM.siblings().hide();
		divC.siblings().hide();
		divSM.show();
		divC.show();
		Ambients.redraw();
		my.callback = callback;
		//my.actualitzarAmbients();
		my.obtenerDB();
//		my.setButtons("Cafeteria");
	}
	my.obtenerDB = function() {
		var db = DB.openPrincipal();
		db.transaction(function (tx) {
			var statement = "SELECT t.pos as Pos, t.Color as Color, t.Ambient as Ambient, a.* "
			               +"FROM (SELECT * FROM TeclatsTpv"+/* WHERE (Llicencia = ?)*/") as t " 
			               +"LEFT JOIN articles as a ON (t.Article = a.Codi)" 
			tx.executeSql(statement, [/*localStorage.getItem("ClienteId")*/], function (tx,res) {
				datosTeclats = {};
				arrayAmbients = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					if (arrayAmbients.indexOf(row.Ambient) == -1) {
						arrayAmbients.push(row.Ambient);
						datosTeclats[row.Ambient] = [];
					}
					var tecladoAmbient = datosTeclats[row.Ambient];
					tecladoAmbient[row.Pos] = row;
				}
				arrayAmbients.sort();
				my.actualitzarAmbients();
			}, function() { datosTeclats = {}; arrayAmbients = []; my.actualitzarAmbients(); });
		});
	}
	my.actualitzarAmbients = function() {
		Ambients.removeAll();
		var posAct = arrayAmbients.indexOf(ambientActual); 
		if (posAct == -1) {
			if (arrayAmbients.length > 0) { posAct = 0; ambientActual = arrayAmbients[0]; }
			else ambientActual = undefined;
		}
		for (var i=0; i<arrayAmbients.length; i++) {
			AmbientModel.clone(true).text(arrayAmbients[i])
                                    .addClass("ui-state-default")
  	                                .addClass((i == posAct) ? "ui-state-active" : "")
									.appendTo(Ambients.newElement());
			
		}
		if (posAct >= 0) Ambients.scrollTo(posAct, true);
		Ambients.redraw();
		my.setButtons(ambientActual);
	}
	function clearButton(but) {
/*		but.data("article", null)
		   .css({ background: ""})
		   .text("")
		   .attr("disabled", "disabled");
*/		but.css({ visibility: "hidden" });
	}
	function getBackgroundColor(color) {
		if ((typeof color == "number") && (color >= 0) && (color < 256*256*256)) 
			return "rgb("+[(color>>16)%256, (color>>8)%256, color%256].join(",")+")";
		return "";
	}
	my.setButtons = function(ambient) {
		var t = (datosTeclats.hasOwnProperty(ambient)) ? datosTeclats[ambient] : [];	
		
		for (var i=0; i<arrayButtons.length; i++) {
			var data = t[i], but = arrayButtons[i];
			if ((data == null) || (data.Codi == null)) clearButton(but);
			else { 
				but.data("article", data)
				   .css({ background: getBackgroundColor(data.Color), visibility: "visible" })
				   .text(data.NOM || "")
				   /*.removeAttr("disabled")*/;						 
			}
		}
	}
	return my;
}();

winInitPeticionCliente = function() {
	var my = {};
	var div = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo("body").hide();
	var input = positionDiv("<input type='text'/>", 10, 10, 60, 15).appendTo(div);
	var password = positionDiv("<input type='password'/>", 10, 30, 60, 35).appendTo(div);
	var keyboard = new Keyboard();
	positionDiv(keyboard.getDiv(),10,40,60,90).appendTo(div);
	
	my.start = function() {
		div.siblings().hide();
		div.show();
		input.val("");
		password.val("");
		keyboard.reset();
		keyboard.input = input;
		keyboard.callback = my.callbackKeyboard0; 
	}
	my.callbackKeyboard0 = function(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			password.val("");
			keyboard.input = password;
			keyboard.callback = my.callbackKeyboard1;	
		}
	};
	my.callbackKeyboard1 = function(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			inicializarConServidor(input.val(), password.val(), "TPV", "0.1");
			keyboard.callback = function() {};
		}
	};
	return my;
}();
	
initAplication = function () {
	DB.init();
	layoutPrincipal.start();
	menuPrincipal.start(function() {});
//	winEntrarDependenta.start(function() {});
}

positionDiv($("body"),0,0,100,100).css({margin : "0px"});
if (localStorage.getItem("ClienteId") == null) {
	winInitPeticionCliente.start();
} else {
	initAplication();	
}
	
/*layoutPrincipal.start();
winMenuPrincipal.start(function() {});
winEntrarDependenta.start(function() {});
*/

});

/*
if (debug) {
	localStorage.setItem("ClienteId", "Punset");
	localStorage.setItem("ClientePassword", "p");
	localStorage.setItem("ClienteProducto", "TPV");
	localStorage.setItem("ClienteVersion", "0.1");

	db = openDB();
	db.transaction( function(tx) {
		tx.executeSql("create table dependentes (nom primary key, password)",[]);
		tx.executeSql("insert into dependentes values (?,?)",["pépè","p1"]);
		tx.executeSql("insert into dependentes values (?,?)",["juan","j1"]);
		tx.executeSql("insert into dependentes values (?,?)",["älex","a1"]);
		tx.executeSql("insert into dependentes values (?,?)",["màry","m1"]);
		tx.executeSql("insert into dependentes values (?,?)",["maria","m1"]);
		tx.executeSql("insert into dependentes values (?,?)",["mary","m1"]);
	});
	db = undefined;
}
*/
