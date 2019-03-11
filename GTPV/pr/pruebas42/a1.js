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
	div.css({position: "absolute", boxsizing: "border-box", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

function createAligner() {
	return $("<img>").attr("src", "dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
}
/*
function getSqlDate() {
	var d = new Date();
	function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
 	return dos0(d.getDate())+"/"+dos0(d.getMonth())+"/"+dos0(d.getFullYear()%100)+" "
	      +dos0(d.getHours())+":"+dos0(d.getMinutes())+":"+dos0(d.getSeconds());
}
*/
$(function() {

layoutPrincipal = function() {
	var my = {};
	var div = positionDiv(null,0,0,100,100).appendTo("body").hide();;
	my.menu = positionDiv(null, 0, 0, 20, 100).appendTo(div);
	my.subMenu = positionDiv(null, 20, 0, 100, 20).appendTo(div);
	my.content = positionDiv(null, 20, 20, 100, 100).appendTo(div);

/*  descomentar versión final, de momento para pruebas

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
					codiDependentaActual = codiDependenta;
				}
				// subMenuEntrarDependenta.stop();
				actualizarDependentesActives(function() {
					if (codiDependentaActual != null) {
						subMenuComanda.start(codiDependentaActual, function() {});
					}
				});
			}
		);
	}).appendTo(opcionesMenu.newElement());
	positionDiv("<Button>Teclat Tpv</Button>",0,0,100,100).click( function() {
		if (codiDependentaActual != null) {
			subMenuComanda.start(codiDependentaActual, function() {});
		}
	}).appendTo(opcionesMenu.newElement());
	
	var dependentesActives = new myScroll("_ud", 10);
	positionDiv(dependentesActives.getDiv(), 0, 40, 100, 100).appendTo(div);
	dependentesActives.redraw();

	var callback;
	var codiDependentaActual = null;
	
	my.setDependentaActual = function(codi) { 
		codiDependentaActual = codi; 
		actualizarDependentesActives(function() {});
	}
	my.getDependentaActual = function() { return codiDependentaActual; }

	function actualizarDependentesActives(funCallback) {
		var dbM = DB.openMensual();
		var dbP = DB.openPrincipal()
		var statM = "SELECT t.Dependenta as codi from ( "
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
					arrayDepAct.push(res.rows.item(i));
				}
				processarDependentesActives();
			}, function() { arrayDepAct = []; processarDependentesActives(); });
		});
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				arrayDep = [];
				for (var i=0; i<res.rows.length; i++) {
					arrayDep.push(res.rows.item(i));
				}
				processarDependentesActives();
			}, function() { arrayDep = []; processarDependentesActives(); });
		});
			
		function processarDependentesActives() {
			if ((arrayDepAct === null) || (arrayDep === null)) return;
			for (var i=0; i<arrayDepAct.length; i++) {
				arrayDepAct[i].nom = "";
				for (var j=0; j<arrayDep.length; j++) 
					if (arrayDepAct[i].codi == arrayDep[j].codi) { arrayDepAct[i].nom = arrayDep[i].nom; break; }
			}
			var posDepAct = -1;
			dependentesActives.removeAll();
			for (var i=0; i<arrayDepAct.length; i++) {
				var el = dependentesActives.newElement();
				el.data("codi", arrayDepAct[i].codi)
			  	  .mousedown(clickDependentesActivesHandler);
				createAligner().appendTo(el);
				$("<div>").css({display: "inline-block", verticalAlign: "middle"}).text(arrayDepAct[i].nom).appendTo(el);  
				if (codiDependentaActual == arrayDepAct[i].codi) {
					el.removeClass("ui-state-default").addClass("ui-state-active");
					posDepAct = i;
				}
			}
			if (posDepAct == -1) { posDepAct=0; codiDependentaActual = null; }
			dependentesActives.scrollTo(posDepAct, true);
			dependentesActives.redraw();
			funCallback();
		}
	}
	function clickDependentesActivesHandler() {
		var newCodi = $(this).data("codi");
		if (newCodi != codiDependentaActual) {
			for (var el = dependentesActives.get(0); el.length > 0; el = el.next()) {
				if (el.data("codi") == codiDependentaActual) el.removeClass("ui-state-active");
				if (el.data("codi") == newCodi) el.addClass("ui-state-active");
			}
			codiDependentaActual = newCodi;
		}
		if (codiDependentaActual != null) {
			subMenuComanda.start(codiDependentaActual, function() {});
		}
	}
	my.start = function(_callback) {
		div.siblings().hide();
		div.show();
		opcionesMenu.redraw();
		dependentesActives.redraw();
		actualizarDependentesActives(function() {});
		callback = _callback;
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
//	autoComplete.redraw();
	
	var callback;
	
	var dependentesNoActives = [];
	var dependentaSeleccionada = null;

	var dialogPasswordIncorrecto = $("<p>Password incorrecto</p>").dialog({
		autoOpen: false,
		modal: true,
		buttons: { "Ok": function() { $(this).dialog("close"); }},
		close: function(event,ui) { my.start(callback); }
	});

	
	my.start = function(_callback) {
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
		keyboard.callback = callbackKeyboard0; 
		keyboard.changeHandler = autoCompleteHandler;

		dependentesNoActives = [];
		autoCompleteHandler();
		callback = _callback;
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
						compareNom : translateCompare(arrayDep[i].nom)
					});
				}
			}
			// if (dependentesNoActives.length == 0) dialogNoHayDependentesNoActives(); ??
			autoCompleteHandler();
		}
	};
	function callbackKeyboard0(m) {
		if (m == "cancel") callback(null);
	};
	function callbackKeyboard1(m) {
		if (m == "cancel") callback(null);
		if (m == "enter") {
			// verify password
			if (password.val() != dependentaSeleccionada.password) {
				dialogPasswordIncorrecto.dialog("open");
				return;
			}
			var db = DB.openMensual();
			db.transaction( function(tx) {
				var statement = "INSERT INTO [V_Horaris"+DB.mensualSufix+"] ([Botiga], [data], [dependenta], [operacio]) "
				               +"VALUES (?,?,?,?)";
				tx.executeSql(statement, 
					[localStorage.getItem("ClienteId"), DB.getSqlDate(), dependentaSeleccionada.codi, "E"],
					DB.success, DB.error);
				callback(dependentaSeleccionada.codi);
			});
		}
	};
	function autoCompleteHandler() {
		autoComplete.removeAll();
		var inputCompare = translateCompare(input.val());
		for (var i=0; i<dependentesNoActives.length; i++) {
			if (dependentesNoActives[i].compareNom.indexOf(inputCompare) != -1) {
				var el = autoComplete.newElement();
				el.text(dependentesNoActives[i].nom)
				  .data("data", dependentesNoActives[i])
				  .click(clickAutoCompleteHandler);
			}
		}
		autoComplete.redraw();
	};
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
	};
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
		keyboard.callback = callbackKeyboard0; 
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			password.val("");
			keyboard.input = password;
			keyboard.callback = callbackKeyboard1;	
		}
	};
	function callbackKeyboard1(m) {
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
