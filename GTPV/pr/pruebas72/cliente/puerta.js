procesoPuerta = function() {
	var my = {};

	var div0 = div100x100();
	var div01 = positionDiv(null, 0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = positionDiv(null, 0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);
	var subMenuScroll = new gScroll("_lr", 6);
	div100x100(subMenuScroll.getDiv()).appendTo(div01);
	//subMenuScroll.removeAll();
	var S = {};
	var dep;
	
	var opSubMenu = {
		entradaSalidaDependenta : {
			text: "Entrada/Salida Dependenta",
			run: function() { procesoEntradaSalidaDependenta.start(dep); },
			init: function() { procesoEntradaSalidaDependenta.init(div02); },
		},
		configuracion : {
			text: "Configuración",
			run: function() { div02.children().hide(); },
			init: function() { /*configuracion.init(div02);*/ }
		},
		impresora : {
			text: "Impresora",
			run: function() { procesoImpresora.start(); },
			init: function() { procesoImpresora.init(div02); }
		},
		salir : {
			text: "Salir",
			run: function() { 			
				S.opSubMenuSel = subMenus[S.idxSubMenu][0];
				DepActives.save(dep);	
				window.close(); 
				my.start(dep);
			},
			init: function() {}
		}
	};

	var subMenus = [
		[
			"entradaSalidaDependenta",
			"configuracion",
			"impresora",
			"salir"
		]
	];
	
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		for (var i in opSubMenu) {
			if (opSubMenu.hasOwnProperty(i)) opSubMenu[i].init();
		}
	};

	var elSubMenuSel = null;
	
	function subMenuHandler(e) {
		if (elSubMenuSel != null) elSubMenuSel.removeClass("ui-state-active");
		elSubMenuSel = $(this).addClass("ui-state-active");
		S.opSubMenuSel = $(this).data("data");
		DepActives.save(dep);
		opSubMenu[S.opSubMenuSel].run();
	}
	var subMenuModel = $("<button>").css({width:"100%", height:"100%"})
	                                .addClass("ui-state-default").click(subMenuHandler);
	
	my.start = function(_dep) {
		divShow(div0);
		dep = _dep;
		S = DepActives.getDatosProceso("puerta", dep);
		if (S.idxSubMenu == null) {
			S.idxSubMenu = 0;
			S.opSubMenuSel = subMenus[S.idxSubMenu][0];
			DepActives.save(dep);	
		}
		subMenuScroll.removeAll();
		elSubMenuSel = null;
		for (var i=0, pos = null; i<subMenus[S.idxSubMenu].length; i++) {
			var op = subMenus[S.idxSubMenu][i];
			var el = subMenuModel.clone(true).text(opSubMenu[op].text).data("data", op).appendTo(subMenuScroll.newElement());
			if (op == S.opSubMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				elSubMenuSel = el;
			}
		}
		if (pos != null) subMenuScroll.scrollTo(pos, true);
		subMenuScroll.redraw();
		if (S.opSubMenuSel != null) opSubMenu[S.opSubMenuSel].run();
	};	
	
	return my;
}();

procesoEntradaSalidaDependenta = function() {	
	var my = {};

	function entrarHandler(e) {
		entrarDependenta();
	}
	function plegarHandler(e) {
		alertPlegar.text("Plega "+dep.nom+" ?").show();
	}
	var div0 = div100x100();

	var alertPassIncor = createAlertDialog().header("Error").text("Password incorrecto")
	                                        .setButtons(["Ok"], function(text, i) { password.val(""); });
	alertPassIncor.getDiv().appendTo(div0);

	var alertPlegar = createAlertDialog().header("Plegar?")
	                                     .setButtons(["Sí","No"], function(text, i) { 
	                                         if (i==0) { plegar(dep); } 
	                                         else { restart(); }
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
	var autoComplete = new gScroll("_ud", defaultElementAutoComplete);
	autoComplete.getDiv().css({ paddingLeft: SEP });
	positionDiv(autoComplete.getDiv(), 70, 0, 100, 100).appendTo(divEntrar2);

	var depNoActives = [];
	var depSel = null;
//	Dependentes = [];

	function changeDataHandler() {
		if (isDivVisible(divEntrar)) {
			obtenerDependentesNoActives();
			autoCompleteHandler();
		}
	}

	var dep;
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		Dependentes.init(changeDataHandler);
//		obtenerDB();
//		DB.addReloadDBHandler(function() { obtenerDB(); });
		Resize.add(function() { fResize = {}; resizeDivEntrar(); }); 
	};
	my.start = function(_dep) {
		dep = _dep;
		butPlegar[(dep.codi !== undefined) ? "show" : "hide"]();
		divShow(div0);
		divShow(divEP);
	};
	function restart() { 
		my.start(dep); 
	}
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
/*	function obtenerDB() {
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
			DB.exec(tx, statP, [], function (tx,res) {
				Dependentes = [];
				var fHayResponsable = false;
				for (var i=0; i<res.rows.length; i++) {
					var row = res.rows.item(i), obj = {}; // props de rows readonly
					for (var prop in row) { if (row.hasOwnProperty(prop)) { obj[prop] = row[prop]; } }
					if (obj.nom == null) obj.nom = "";
					obj.compareNom = preProcessCompareNom(obj.nom);
					if (obj.tipusTreballador == "RESPONSABLE") {
						obj.esResponsable = true;
						fHayResponsable = true;
					} else { obj.esResponsable = false; }			
					Dependentes.push(obj);
				}
				if (!fHayResponsable) { Dependentes.forEach(function(dep) { dep.esResponsable = true; }); }
				if (isDivVisible(divEntrar)) {
					obtenerDependentesNoActives();
					autoCompleteHandler();
				}
			});
		});
	}
*/	
	function obtenerDependentesNoActives() {
		depNoActives = [];
		var depT;
		for (var i=0; (depT = Dependentes.getByIdx(i)) != null; i++) {
			var depA;
			for (var j=0; (depA = DepActives.getByIdx(j)) != null; j++) {
				if (depT.codi == depA.codi) break;	
			}
			if (depA == null) {
				depNoActives.push(depT);
			}
		}
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") restart();
		if (m == "change") autoCompleteHandler();
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") restart();
		if (m == "enter") {
			// verify password
			if (depSel.password != null) {
				if (password.val() != depSel.password) {
					alertPassIncor.show();
					return;
				}
			}
			var sqlDate = DB.DateToSql(new Date());
			var h = DB.preOpenMensual(sqlDate, "V_Horaris_");
			var db = DB.open(h.dbName);
			db.transaction(function (tx) {
				DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
				                                +"[Dependenta] float, [Operacio] nvarchar(25), ");
				DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
                                                 [GlobalGTPV.get("Llicencia"), sqlDate, depSel.codi, "E"],
												 h.mark);
			});
			DepActives.add(depSel);	
		}
	}
	function autoCompleteHandler() {
		autoComplete.removeAll();
		var inputCompare = preProcessCompareNom(input.val());
		for (var i=0; i<depNoActives.length; i++) {
			if (depNoActives[i].compareNom.indexOf(inputCompare) != -1) {
				var el = autoCompleteModel.clone(true).appendTo(autoComplete.newElement());
				el.text(depNoActives[i].nom)
				  .data("data", depNoActives[i]);
			}
		}
		autoComplete.redraw();
	}
	function clickAutoCompleteHandler() {
		input.val($(this).data("data").nom);
		input.attr("disabled", "disabled");
		password.val("");
		password.removeAttr("disabled");
		keyboard.reset();
		keyboard.setInput(password);
		keyboard.getButtons("enter").removeAttr("disabled");
		keyboard.setCallback(callbackKeyboard1); 
		depSel = $(this).data("data");
		autoComplete.removeAll();
		autoComplete.redraw();
		if ((depSel.password == null) || (depSel.password == "")) {
			callbackKeyboard1("enter");  // no hace falta pulsar enter
		}
	}
/*	my.stop = function() {
		div.hide();	
	}
*/	function plegar(dep) {
		DepActives.del(dep);
		var sqlDate = DB.DateToSql(new Date());
		var h = DB.preOpenMensual(sqlDate, "V_Horaris_");
		var db = DB.open(h.dbName);
		db.transaction(function (tx) {
			DB.sincroCreate(tx, h.tableName, "[Botiga] float, [Data] datetime, "
			                                +"[Dependenta] float, [Operacio] nvarchar(25), ");
			DB.sincroInsert(tx, h.tableName, "[Botiga], [Data], [Dependenta], [Operacio], ",
                                              [GlobalGTPV.get("Llicencia"), sqlDate, dep.codi, "P"],
											  h.mark);
		});
	}

	return my;
}();

