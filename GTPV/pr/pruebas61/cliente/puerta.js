procesoPuerta = function() {
	var my = {};

	var div0 = div100x100();
	var div01 = positionDiv(null, 0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = positionDiv(null, 0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);
	var subMenuScroll = new myScroll("_lr", 6);
	div100x100(subMenuScroll.getDiv()).appendTo(div01);
	//subMenuScroll.removeAll();
	var S = {};
	
	var opSubMenu = {
		entradaSalidaDependenta : {
			text: "Entrada/Salida Dependenta",
			run: function() { procesoEntradaSalidaDependenta.start(); },
			init: function() { procesoEntradaSalidaDependenta.init(div02); },
		},
		configuracion : {
			text: "Configuración",
			run: function() { div02.siblings().hide(); },
			init: function() { /*configuracion.init(div02);*/ }
		}
	};

	var subMenus = [
		[
			"entradaSalidaDependenta",
			"configuracion"
		]
	];
	
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		for (var i in opSubMenu) {
			if (opSubMenu.hasOwnProperty(i)) opSubMenu[i].init();
		}
	};

	var optSelectedScroll = null;
	
	function subMenuHandler(e) {
		if (optSelectedScroll != null) optSelectedScroll.removeClass("ui-state-active");
		optSelectedScroll = $(this).addClass("ui-state-active");
		S.optSubMenuSel = $(this).data("data");
		opSubMenu[S.optSubMenuSel].run();
	}
	var subMenuModel = $("<button>").css({width:"100%", height:"100%"})
	                                .addClass("ui-state-default").click(subMenuHandler);
	
	my.start = function(dep) {
		divShow(div0);
		dep = dep || DepActives.getActual();
		S = DepActives.getDatosProceso("puerta", dep);
		S.idxSubMenu = (S.idxSubMenu || 0);
		S.optSubMenuSel = (S.optSubMenuSel || subMenus[S.idxSubMenu][0]);	
		subMenuScroll.removeAll();
		optSelectedScroll = null;
		for (var i=0, pos = null; i<subMenus[S.idxSubMenu].length; i++) {
			var op = subMenus[S.idxSubMenu][i];
			var el = subMenuModel.clone(true).text(opSubMenu[op].text).data("data", op).appendTo(subMenuScroll.newElement());
			if (op == S.optSubMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				optSelectedScroll = el;
			}
		}
		if (pos != null) subMenuScroll.scrollTo(pos, true);
		subMenuScroll.redraw();
		if (S.optSubMenuSel != null) opSubMenu[S.optSubMenuSel].run();
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
	var div0 = div100x100();

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

	var divEP = div100x100().css({ padding: "1em" }).addClass("ui-widget-content").appendTo(div0);
	$("<button>").text("Entrar").css({width:"25%",height:"25%"}).click(entrarHandler).appendTo(divEP);
	var butPlegar = $("<button>").text("Plegar").css({width:"25%",height:"25%"}).click(plegarHandler).appendTo(divEP);

	var divEntrar = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
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
	autoComplete.getDiv().css({ paddingLeft: SEP });
	positionDiv(autoComplete.getDiv(), 70, 0, 100, 100).appendTo(divEntrar2);

	var dependentesNoActives = [];
	var dependentaSeleccionada = null;
	var dependentesTotals = [];
	var fHayResponsable = false;

	var dependenta;
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		obtenerDB();
		callbackComunicacion.add(function() {
			obtenerDB();
		});
		Resize.add(function() { fResize = {}; resizeDivEntrar(); }); 
	};
	my.start = function(dep) {
		dependenta = dep || DepActives.getActual();
		butPlegar[(dependenta.dep.codi != null) ? "show" : "hide"]();
		divShow(div0);
		divShow(divEP);
	};
	function entrarDependenta() {
		divShow(divEntrar);
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

	var fResize = {};	

	function resizeDivEntrar() {
		if (fResize.divEntrar === false) return; 
		if (!isDivVisible(divEntrar)) return;
		var w0 = divEntrar2.width(), h0 = divEntrar2.height();
		var h2 = getOH(divIP), w2 = getOW(autoComplete.getDiv()); 
		positionKeyboard(keyboard, 0, h2, w0-w2, h0);
		autoComplete.redraw();
		fResize.divEntrar = false;
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
				fHayResponsable = false;
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i), obj = {}; // props de rows readonly
					for (var prop in row) { if (row.hasOwnProperty(prop)) { obj[prop] = row[prop]; } }
					dependentesTotals.push(obj);
					if (obj.tipusTreballador == "RESPONSABLE") fHayResponsable = true;	
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
			var sqlDate = DB.getSqlDate(new Date());
			var h = DB.preOpenMensual(sqlDate, "V_Horaris_");
			var db = DB.open(h.dbName);
			db.transaction(function (tx) {
				DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
				                                +"[Dependenta] float, [Operacio] nvarchar(25), ");
				DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
                                                 [GlobalGTPV.get("Llicencia"), sqlDate, dependentaSeleccionada.dep.codi, "E"],
												 h.mark);
			});
			delete dependentaSeleccionada.dep.password;
			if (((fHayResponsable) && (dependentaSeleccionada.dep.tipusTreballador == "RESPONSABLE")) ||
			    (!fHayResponsable)) {				
				dependentaSeleccionada.fEsResponsable = true;
			} else dependentaSeleccionada.fEsResponsable = false;
			DepActives.add(dependentaSeleccionada);	
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
		var sqlDate = DB.getSqlDate(new Date());
		var h = DB.preOpenMensual(sqlDate, "V_Horaris_");
		var db = DB.open(h.dbName);
		db.transaction(function (tx) {
			DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
			                                +"[Dependenta] float, [Operacio] nvarchar(25), ");
			DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
                                              [GlobalGTPV.get("Llicencia"), sqlDate, dep.dep.codi, "P"],
											  h.mark);
		});
	}

	return my;
}();

