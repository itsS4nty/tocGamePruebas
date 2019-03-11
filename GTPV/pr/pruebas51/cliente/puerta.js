procesoPuerta = function() {
	var my = {};

	var div0 = positionDiv(null, 0, 0, 100, 100);
	var div01 = positionDiv(null, 0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = positionDiv(null, 0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);
	var subMenuScroll = new myScroll("_lr", 6);
	positionDiv(subMenuScroll.getDiv(), 0, 0, 100, 100).appendTo(div01);
	//subMenuScroll.removeAll();
	var D = {};
	
	var opcionesSubMenu = {
		entradaSalidaDependenta : {
			text: "Entrada/Salida Dependenta",
			run: function() { procesoEntradaSalidaDependenta.start(); },
			init: function() { procesoEntradaSalidaDependenta.init(div02); },
		},
		configuracion : {
			text: "Configuración",
			run: function() { },
			init: function() { /*configuracion.init(div02);*/ }
		}
	};

	var subMenus = [
		[
			opcionesSubMenu.entradaSalidaDependenta,
			opcionesSubMenu.configuracion
		]
	];
	
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		for (var i in opcionesSubMenu) {
			if (opcionesSubMenu.hasOwnProperty(i)) opcionesSubMenu[i].init();
		}
	};

	var optSelectedScroll = null;
	
	function subMenuHandler(e) {
		if (optSelectedScroll != null) optSelectedScroll.removeClass("ui-state-active");
		optSelectedScroll = $(this).addClass("ui-state-active");
		D.optSubMenuSelected = $(this).data("data");
		D.optSubMenuSelected.run();
	}
	var subMenuModel = $("<button>").css({width:"100%", height:"100%"})
	                                .addClass("ui-state-default").click(subMenuHandler);
	
	my.start = function(dep) {
		div0.siblings().hide();
		div0.show();
		dep = dep || DepActives.getActual();
		D = DepActives.getDatosProceso("puerta", dep);
		D.subMenu = (D.subMenu || subMenus[0]);
		D.optSubMenuSelected = (D.optSubMenuSelected || D.subMenu[0]);	
		subMenuScroll.removeAll();
		for (var i=0, pos = null; i<D.subMenu.length; i++) {
			var op = D.subMenu[i];
			var el = subMenuModel.clone(true).text(op.text).data("data", op).appendTo(subMenuScroll.newElement());
			if (op == D.optSubMenuSelected) {
				el.addClass("ui-state-active");
				pos = i;
				optSelectedScroll = el;
			}
		}
		if (pos != null) subMenuScroll.scrollTo(pos, true);
		subMenuScroll.redraw();
		if (D.optSubMenuSelected != null) D.optSubMenuSelected.run(); 
	};	
	
	return my;
}();

procesoEntradaSalidaDependenta = function() {	
	var my = {};

	function entrarHandler(e) {
		entrarDependenta();
	}
	function plegarHandler(e) {
		alertPlegar.text("Plega "+dependenta.dep.nom+" ?").show();
	}
	var div0 = positionDiv(null,0,0,100,100);

	var alertPassIncor = createAlertDialog().header("Error").text("Password incorrecto")
	                                        .setButtons(["Ok"], function(text, i) { alertPassIncor.hide(); password.val(""); });
	alertPassIncor.getDiv().appendTo(div0);

	var alertPlegar = createAlertDialog().header("Plegar?")
	                                     .setButtons(["Sí","No"], function(text, i) { 
	                                         alertPlegar.hide(); 
	                                         if (i==0) { plegar(DepActives.getActual()); } 
	                                         else { my.start(); }
	                                     });
	alertPlegar.getDiv().appendTo(div0);

	var divEP = positionDiv(null,0,0,100,100).css({ padding: "1em" }).addClass("ui-widget-content").appendTo(div0);
	$("<button>").text("Entrar").css({width:"25%",height:"25%"}).click(entrarHandler).appendTo(divEP);
	var butPlegar = $("<button>").text("Plegar").css({width:"25%",height:"25%"}).click(plegarHandler).appendTo(divEP);

	var divEntrar = positionDiv(null,0,0,100,100).css({ padding: "1em" }).addClass("ui-widget-content").appendTo(div0);
	var divEntrar2 = $("<div>").css({position: "relative", height: "100%"}).appendTo(divEntrar);
	var divIP = $("<div>").css({ position: "absolute", textAlign: "center", width: "70%" }).appendTo(divEntrar2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divEntrar2);
	
	var autoCompleteModel = $("<button>").css({ width: "100%", height: "100%" }).click(clickAutoCompleteHandler);
	var defaultElementAutoComplete = autoCompleteModel.clone(false).html("X<br>X"); 
	var autoComplete = new myScroll("_ud", defaultElementAutoComplete);
	autoComplete.getDiv().css({ paddingLeft: "1em" });
	positionDiv(autoComplete.getDiv(), 70, 0, 100, 100).appendTo(divEntrar2);

	var dependentesNoActives = [];
	var dependentaSeleccionada = null;
	var dependentesTotals = [];

	var dependenta;
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		obtenerDB();
		callbackComunicacion.add(function() {
			obtenerDB();
		});
		$(window).resize(function() { fResize = true; if (isDivVisible(divEntrar)) { resizeDivEntrar(); } }); 
	};
	my.start = function(dep) {
		dependenta = dep || DepActives.getActual();
		butPlegar[(dependenta.dep.codi != null) ? "show" : "hide"]();
		div0.siblings().hide();
		div0.show();
		divEP.siblings().hide();
		divEP.show();
	};
	function entrarDependenta() {
		divEntrar.siblings().hide();
		divEntrar.show();
		input.val("");
		input.removeAttr("disabled");
		password.val("");
		password.attr("disabled", "disabled");
		keyboard.setInput(input);
		keyboard.reset();
		keyboard.getButtons("enter").attr("disabled", "disabled");
		keyboard.setCallback(callbackKeyboard0); 
//		keyboard.changeHandler = autoCompleteHandler;

//		dependentesNoActives = [];
		obtenerDependentesNoActives();
		autoCompleteHandler();
		resizeDivEntrar();
//		actualizarDependentesNoActives();
	}

	var fResize = true;	

	function resizeDivEntrar() {
		if (fResize === false) return; 
		var w0 = divEntrar2.width(), h0 = divEntrar2.height();
		var h2 = getOH(divIP), w2 = getOW(autoComplete.getDiv()); 
		positionKeyboard(keyboard, 0, h2, w0-w2, h0);
		autoComplete.redraw();
		fResize = false;
	}
//	function actualizarDependentesNoActives() {	
	function obtenerDB() {
		var dbP = DB.openPrincipal()
		var statP = "SELECT d.codi as codi, d.nom as nom, p.valor as password, tt.valor as tipusTreballador " 
                   +"FROM dependentes as d "
				   +"INNER JOIN ("
				   +"    SELECT id, valor FROM dependentesextes "
				   +"    WHERE nom = 'PASSWORD'"
				   +") as p "
				   +"ON (d.codi = p.id) "
				   +"INNER JOIN ("
				   +"    SELECT id, valor FROM dependentesextes "
				   +"    WHERE nom = 'TIPUSTREBALLADOR'"
				   +") as tt "
				   +"ON (d.codi = tt.id) ";
		
		dbP.transaction(function (tx) {
			tx.executeSql(statP, [], function (tx,res) {
				dependentesTotals = [];
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i);
					dependentesTotals.push(res.rows.item(i));
				}
				if (isDivVisible(divEntrar)) {
					obtenerDependentesNoActives();
					autoCompleteHandler();
				}
			}, function(tx,e) {
				window.errorDBDep = e;
			});
		});
	}
	function obtenerDependentesNoActives() {
		dependentesNoActives = [];
		for (var i=0; i<dependentesTotals.length; i++) {
			var el;
			for (var j=0; (el = DepActives.getByIdx(j)) != null; j++) {
				if (dependentesTotals[i].codi == el.dep.codi) break;	
			}
			if (el == null) {
				dependentesNoActives.push({
					dep : dependentesTotals[i],
					compareNom : preProcessCompareNom(dependentesTotals[i].nom)
				});
			}
		}
		// if (dependentesNoActives.length == 0) dialogNoHayDependentesNoActives(); ??
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") my.start(dependenta);
		if (m == "change") autoCompleteHandler();
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") my.start(dependenta);
		if (m == "enter") {
			// verify password
			if (dependentaSeleccionada.dep.password != null) {
				if (password.val() != dependentaSeleccionada.dep.password) {
					alertPassIncor.show();
					return;
				}
			}
			var db = DB.openMensual();
			var suf = DB.getMensualSufix();
			db.transaction( function(tx) {
				var stat = "CREATE TABLE IF NOT EXISTS [V_Horaris"+suf+"] "
				          +"([Botiga] float NULL, [Data] datetime NULL,	"
				          +"[Dependenta] float NULL, [Operacio] nvarchar(25) NULL) "
				tx.executeSql(stat, []);
				var stat = "INSERT INTO [V_Horaris"+suf+"] ([Botiga], [data], [dependenta], [operacio]) "
				          +"VALUES (?,?,?,?)";
				tx.executeSql(stat, 
					[GlobalGTPV.get("Llicencia"), DB.getSqlDate(), dependentaSeleccionada.dep.codi, "E"]);
				delete dependentaSeleccionada.dep.password;
				DepActives.add(dependentaSeleccionada);	
			});
		}
	}
	function autoCompleteHandler() {
		autoComplete.removeAll();
		var inputCompare = preProcessCompareNom(input.val());
		for (var i=0; i<dependentesNoActives.length; i++) {
			if (dependentesNoActives[i].compareNom.indexOf(inputCompare) != -1) {
				var el = autoCompleteModel.clone(true).appendTo(autoComplete.newElement());
				el.text(dependentesNoActives[i].dep.nom)
				  .data("data", dependentesNoActives[i]);
			}
		}
		autoComplete.redraw();
	}
	function clickAutoCompleteHandler() {
		input.val($(this).data("data").dep.nom);
		input.attr("disabled", "disabled");
		password.val("");
		password.removeAttr("disabled");
		keyboard.reset();
		keyboard.setInput(password);
		keyboard.getButtons("enter").removeAttr("disabled");
		keyboard.setCallback(callbackKeyboard1); 
//		codiDependentaSeleccionada = $(this).data("codi");
		dependentaSeleccionada = $(this).data("data");
		autoComplete.removeAll();
		autoComplete.redraw();
		if (dependentaSeleccionada.dep.password == null) {
			callbackKeyboard1("enter");  // no hace falta pulsar enter
		}
	}
/*	my.stop = function() {
		div.hide();	
	}
*/	function plegar(dep) {
		DepActives.del(dep);
		var db = DB.openMensual();
		var suf = DB.getMensualSufix();
		db.transaction( function(tx) {
			var statement = "INSERT INTO [V_Horaris"+suf+"] ([Botiga], [data], [dependenta], [operacio]) "
			               +"VALUES (?,?,?,?)";
			tx.executeSql(statement, 
				[GlobalGTPV.get("Llicencia"), DB.getSqlDate(), dep.dep.codi, "P"]);
		});
	}

	return my;
}();

