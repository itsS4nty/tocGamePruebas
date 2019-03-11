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

winMenuPrincipal = function() {
	var my = {};
	var div = positionDiv(null,0,0,100,100).appendTo(layoutPrincipal.menu).hide();
	positionDiv("<Button>Entrar Dependenta</Button>",0,10,100,20).click( function() {
		winEntrarDependenta.start(
			function(codiDependenta) {
				if (codiDependenta !== null) {
					my.setDependentaActual(codiDependenta);
				}
				// winEntrarDependenta.stop();
				winTeclatsTpv.start();
			}
		);
	}).appendTo(div);
	var dependentesActives = new myScroll({arrows: "_ud", nElementsScroll: 10});
	positionDiv(dependentesActives.getDiv(), 0, 40, 100, 100).appendTo(div);
	dependentesActives.redraw();

	var dependentesActivesDraw = [];
	var codiDependentaActualDraw = null;

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
				   +"WHERE t.operacio = 'E' ";
		var statP = "SELECT codi as codi, nom as nom FROM dependentes ";

		var tempDepAct = null;
		var tempDep = null;
		
		dbM.transaction(function (tx) {
			tx.executeSql(statM, [], function (tx,res) {
				tempDepAct = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					tempDepAct.push({codi: row.Dependenta});
				}
				processarDependentesActives();
			}, DB.error);
		});
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				tempDep = {};
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					tempDep[row.codi] = { nom: row.nom};
				}
				processarDependentesActives();
			}, DB.error);
		});
			
		function processarDependentesActives() {
			if ((tempDepAct === null) || (tempDep === null)) return;
			for (var i=0; i<tempDepAct.length; i++) {
				tempDepAct[i].nom = (tempDep[tempDepAct[i].codi].nom || "");
			}
			if (dependentesActivesDraw.length == tempDepAct.length) {
				for (var i=0; i<dependentesActivesDraw.length; i++) {
					if (dependentesActivesDraw[i].codi != tempDepAct[i].codi) break;
					if (dependentesActivesDraw[i].nom != tempDepAct[i].nom) break;
				}
				if (i == dependentesActivesDraw.length) {
					if (codiDependentaActual == codiDependentaActualDraw) return;
				}
			}
			dependentesActives.removeAll();
			for (var i=0; i<tempDepAct.length; i++) {
				var el = dependentesActives.newElement();
				el.text(tempDepAct[i].nom).data("codi", tempDepAct[i].codi)
			  	  .click(my.clickDependentesActivesHandler);
				if (codiDependentaActual == tempDepAct[i].codi) {
					el.removeClass("ui-state-default").addClass("ui-state-active");
				}
			}
			dependentesActives.redraw();
			dependentesActivesDraw = tempDepAct;
			codiDependentaActualDraw = codiDependentaActual;
			setTimeout(my.actualizarDependentesActives, 5000);
		}
	}
	my.clickDependentesActivesHandler = function() {
		my.setDependentaActual($(this).data("codi"));
	}
	my.start = function(callback) {
		div.siblings().hide();
		div.show();
		dependentesActives.redraw();
		my.actualizarDependentesActives();
		my.callback = callback;
	}
	my.stop = function() {
		div.hide();	
	}
	return my;
}();

winEntrarDependenta = function() {	
	var my = {};
	var div = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.content).hide();
	var input = positionDiv("<input type='text'/>", 10, 10, 60, 15).appendTo(div);
	var password = positionDiv("<input type='password'/>", 10, 30, 60, 35).appendTo(div);
	var keyboard = new Keyboard();
	positionDiv(keyboard.getDiv(),10,40,60,90).appendTo(div);
	var autoComplete = new myScroll({arrows:"_ud", nElementsScroll: 10});
	positionDiv(autoComplete.getDiv(), 70, 10, 90, 80).appendTo(div);
	autoComplete.redraw();
	
	var dependentesNoActives = [];
	var dependentaSeleccionada = null;

	var dialog = $("<p>Password incorrecto</p>").dialog({
		autoOpen: false,
		modal: true,
		buttons: { "Ok": function() { $(this).dialog("close"); }},
		close: function(event,ui) { my.start(my.callback); }
	});

	
	my.start = function(callback) {
		div.siblings().hide();
		div.show();
		input.val("");
		input.removeAttr("disabled");
		password.val("");
		password.attr("disabled","disabled");
		keyboard.input = input;
		keyboard.reset();
		keyboard.actionButtons["enter"].attr("disabled","disabled");
		keyboard.callback = my.callbackKeyboard0; 
		keyboard.changeHandler = my.autoCompleteHandler;
		my.callback = callback;
		
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


		var tempDepAct = null;
		var tempDep = null;
		
		dbM.transaction(function (tx) {
			tx.executeSql(statM, [], function (tx,res) {
				tempDepAct = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					tempDepAct.push(row.Dependenta);
				}
				processarDependentesNoActives();
			}, DB.error);
		});
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				tempDep = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					tempDep.push({codi: row.codi, nom: row.nom, password: row.password});
				}
				processarDependentesNoActives();
			}, DB.error);
		});
			
		function processarDependentesNoActives() {
			if ((tempDepAct === null) || (tempDep === null)) return;
			dependentesNoActives = [];
			for (var i=0; i<tempDep.length; i++) {
				if (tempDepAct.indexOf(tempDep[i].codi) == -1) {
					dependentesNoActives.push({
						codi : tempDep[i].codi,
						nom : tempDep[i].nom,
						password: tempDep[i].password,
						compareNom : my.translateCompare(tempDep[i].nom)
					});
				}
			}
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
				dialog.dialog("open");
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
		input.attr("disabled","disabled");
		password.val("");
		password.removeAttr("disabled");
		keyboard.reset();
		keyboard.input = password;
		keyboard.actionButtons["enter"].removeAttr("disabled");
		keyboard.callback = my.callbackKeyboard1; 
		keyboard.changeHandler = keyboard.defaultChangeHandler;
		codiDependentaSeleccionada = $(this).data("codi");
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

winTeclatsTpv = function() {
	var my = {}
	var div = positionDiv(null,0,0,100,100).addClass("ui-widget-content").appendTo(layoutPrincipal.content).hide();
	var divTeclat = positionDiv(null,10,10,90,60).addClass("ui-widget-content").appendTo(div);

	function clickButtonTeclatTpv(e) {
		var pos = $(this).data("pos");
	}

	var nX=6, nY=6;
	
	var buttonModel = $("<button>")
	                      .css({display: "inline-block", margin: "0px",  
						        boxSizing: "border-box", width: (100/nY)+"%", height: "100%", 
								color: "black"})
						  .addClass("ui-corner-all")
						  .click(clickButtonTeclatTpv);
	var arrayButtons = [];
	for (var x=0; x<nX; x++) {
		var row = $("<div>").css({width:"100%", height:(100/nX)+"%"}).appendTo(divTeclat); 
		for (var y=0; y<nY; y++) {
			arrayButtons[x*nY+y] = buttonModel.clone(true).data("pos", x*nY+y).appendTo(row);
		}
	}

	my.start = function(callback) {
		div.siblings().hide();
		div.show();
		my.callback = callback;
		my.setButtons("Cafeteria");
	}
	my.setButtons = function(Ambient) {
		var statement = "SELECT t.pos as Pos, t.Color as Color, a.* from (SELECT * FROM TeclatsTpv WHERE (Ambient = ?)"+/* AND (Llicencia = ?)*/") as t " 
		               +"LEFT JOIN articles as a ON (t.Article = a.codi)" 
		db = DB.openPrincipal();
		db.transaction(function (tx) {
			tx.executeSql(statement, [Ambient/*, localStorage.getItem("ClienteId")*/], function (tx,res) {
				for (var i=0; i<arrayButtons.length; i++) {
					arrayButtons[i].css({ background: ""});
				}
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					var pos = row.Pos;
					arrayButtons[pos].data("article", row)
					                 .css({ background: "rgb("+
									        [(row.Color>>16)%256, (row.Color>>8)%256, row.Color%256].join(",")+")"})
					                 .text(row.NOM);						 
				}
			}, DB.error);
		});
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
	winMenuPrincipal.start(function() {});
//	winEntrarDependenta.start(function() {});
}

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
