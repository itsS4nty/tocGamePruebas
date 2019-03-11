debug = 1;
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
	if (div == null) div = "<div>";
	div = $(div);
	div.css({position: "absolute", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

function getDBName() {
	return "DB_"+localStorage.Cliente.id;	
}

function openDB() {
	return openDatabase(getDBName(), "", "", 5000);	
}

function getLocalStorage(prop) {
	var lsName = "LS_"+localStorage.Cliente.id;
	if (localStorage.lsName == null) localStorage.lsName = {};
	if (prop == null) return localStorage.lsName;
	if (localStorage.lsName[prop] == null) localStorage.lsName[prop] = {};
	return localStorage.lsName[prop]; 
}



$(function() {
try {
layoutPrincipal = function() {
	var my = {};
	my.div = positionDiv(null,0,0,100,100).appendTo("body").hide();;
	my.menu = positionDiv(null, 0, 0, 20, 100).appendTo(my.div);
	my.subMenu = positionDiv(null, 20, 0, 100, 20).appendTo(my.div);
	my.content = positionDiv(null, 20, 20, 100, 100).appendTo(my.div);
	my.start = function() {
		my.div.siblings().hide();
		my.div.show();
	}
	return my;
}();

winMenuPrincipal = function() {
	var my = {};
	my.div = positionDiv(null,0,0,100,100).appendTo(layoutPrincipal.menu).hide();;
	var db = openDB();
	db.transaction( function(tx) {
		var sql = "CREATE TABLE DEPENDENTES_ACTIVES (nom primary key) IF NOT EXIST";
		tx.executeSql(sql, []);
	});
	my.dependentesActivesDiv = positionDiv(null,0,40,100,100).appendTo(my.div);
	my.actualizarDependentesActives = function() {
		var db = openDatabase(getDBName(), "", "", 5000);
		var stat = "SELECT DEPENDENTES.nom AS nom FROM DEPENDENTES, DEPENDENTES_ACTIVES WHERE DEPENDENTES.nom=DEPENDENTES_ACTIVES.nom";
		db.transaction(function (tx) {
			tx.executeSql(stat, [], function (tx,res) {
				my.dependentesActivesDiv.empty();
				for (var i=0; i<res.rows.length; i++) {
					$("<div>").addClass("ui-widget-header")
							  .text(res.rows.item(i).nom)
							  .click(my.clickDependentesActivesHandler)
							  .appendTo(my.dependentesActivesDiv);
				}
			});
		});
	}
	my.clickDependentesActivesHandler = function() {
	}
	my.start = function(callback) {
		my.div.siblings().hide();
		my.div.show();
		my.callback = callback;
	}
	return my;
}();

winEntrarDependenta = function() {	
	var my = {};
	my.div = $("<div>").addClass("ui-widget-content").appendTo(layoutPrincipal.content).hide();
	positionDiv(my.div,0,0,100,100);
	my.input = positionDiv("<input type='text'/>", 10, 10, 40, 20).appendTo(my.div);
	my.password = positionDiv("<input type='password'/>", 10, 30, 40, 40).appendTo(my.div);
	my.keyboard = new Keyboard();
	positionDiv(my.keyboard.div,10,50,40,80).appendTo(my.div);
	my.autocompleteDiv = positionDiv(null, 60, 10, 90, 50).addClass("ui-widget-content").appendTo(my.div);
	
	my.start = function(callback) {
		my.div.siblings().hide();
		my.div.show();
		my.input.val("");
		my.input.removeAttr("disabled");
		my.password.val("");
		my.password.attr("disabled",true);
		my.keyboard.reset();
		my.keyboard.input = my.input;
		my.keyboard.actionButtons["enter"].attr("disabled",true);
		my.keyboard.callback = my.callbackKeyboard0; 
		my.keyboard.changeHandler = my.autoCompleteHandler;
		my.callback = callback;
		my.dependentesNoActives = [];
		var db = openDB();
		db.transaction( function(tx) {
			var sql = "SELECT DEPENDENTES.nom, DEPENDENTES.password FROM DEPENDENTES"
			         +"INNER JOIN DEPENDENTES_ACTIVES ON DEPENDENTES.nom != DEPENDENTES_ACTIVES.nom";
			tx.executeSql(sql, [], function(t,res) {
				for (var i=0; i<res.rows.length; i++) {
					my.dependentesNoActives.push({
						nom : res.item(i).nom,
						compareNom : my.translateCompare(res.item(i).nom)
					});
				}
			});
		});
	};
	my.callbackKeyboard0 = function(m) {
		if (m == "cancel") my.callback("cancel");
	};
	my.callbackKeyboard1 = function(m) {
		if (m == "cancel") my.callback("cancel");
		if (m == "enter") {
			// verify password
			var db = openDB();
			db.transaction( function(tx) {
				var sql = "INSERT INTO DEPENDETES_ACTIVES VALUES(?)";
				tx.executeSql(sql, [my.input.val()]);
				my.callback("enter");
			});
		}
	};
	my.autoCompleteHandler = function() {
		my.autoCompleteDiv.empty();
		var inputCompare = my.translateCompare(my.input);
		for (var i=0; i<my.dependentesNoActives.length; i++) {
			if (my.dependentesNoActives[i].compareNom.indexOf(inputCompare) != -1) {
				$("<div>").addClass("ui-widget-header")
				          .text(my.dependentesNoActives[i].nom)
						  .appendTo(my.autoCompleteDiv)
						  .click(my.clickAutoCompleteHandler);
			}
		}
	};
	my.clickAutoCompleteHandler = function() {
		my.input.val($(this).text());
		my.input.attr("disabled",true);
		my.password.val("");
		my.keyboard.reset();
		my.keyboard.input = my.password;
		my.keyboard.actionButtons["enter"].removeAttr("disabled");
		my.keyboard.callback = my.callbackKeyboard1; 
		my.keyboard.changeHandler = my.keyboard.defaultChangeHandler;
		
	};
	my.transalteCompare = function(str) {
		function transalteCompareChar(c) {
			var testChars    = "‡·‰ËÈÎÏÌÔÚÛˆ˘˙¸ÒÁ";
			var replaceChars = "aaaeeeiiiooouuunc";
			var idx = testChars.indexOf(c);
			return (idx==-1) ? c : replaceChars.charAt(idx);
		}
		return my.toLowerCase().split("").map(translateCompareChar).join("");
	}
	return my;
}();

layoutPrincipal.start();
winMenuPrincipal.start(function() {});
winEntrarDependenta.start(function() {});

} catch (e) {
	ex = e;
	throw e;	
}

});

if (debug) {
	localStorage.Cliente = {};
	localStorage.Cliente.id = "Punset";
	localStorage.Cliente.password = "p";

	var db = openDB();
	db.transaction( function(tx) {
		tx.executeSql("create table DEPENDENTES (nom primary key, password)",[]);
		tx.executeSql("insert into DEPENDENTES values (?,?)",["pepe","p1"]);
		tx.executeSql("insert into DEPENDENTES values (?,?)",["juan","j1"]);
		tx.executeSql("insert into DEPENDENTES values (?,?)",["alex","a1"]);
		tx.executeSql("insert into DEPENDENTES values (?,?)",["m‡ry","m1"]);
		tx.executeSql("insert into DEPENDENTES values (?,?)",["maria","m1"]);
		tx.executeSql("insert into DEPENDENTES values (?,?)",["mary","m1"]);
	});
	
}
