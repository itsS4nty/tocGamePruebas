H.Scripts.addLocalExec("puertaS", function() {

window.AppPuerta = function() {
	var my = {};

	var div0 = $("<div>")._100x100();
	var div01 = $("<div>").absolutePos(0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = $("<div>").absolutePos(0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);

	var paramsSubMenuScroll = {
		arrows : "_lr",
		getNItems : function() { return subMenus[S.subMenu].length; },
		getItem : function(idx) {
			if (idx === -1) return null;
			var op = subMenus[S.subMenu][idx];
			var el = subMenuModel.clone(true).text(M(opSubMenu[op].text)).data("data", op);
			if (op === S.opSubMenuSel) el.addClass("ui-state-active");
			return el;
		},
		nElScroll : 6,
	};

	var subMenuModel = $("<button>").addClass("ui-state-default");

	var subMenuScroll = newGScroll(paramsSubMenuScroll);
	subMenuScroll.getDiv()._100x100().appendTo(div01);

	subMenuModel.click(function (e) {
		if (e.button !== 0) return;
		S.opSubMenuSel = $(this).data("data");
		subMenuScroll.redraw(subMenus[S.subMenu].indexOf(S.opSubMenuSel));
		opSubMenu[S.opSubMenuSel].run(mp);
	});

	var S = {};
	
	var opSubMenu = {
		entradaSalidaDependenta : {
			text: "Entrada/Salida Dependenta",
			run: function(mp) { AppEntradaSalidaDependenta.start(mp); },
			init: function(div) { AppEntradaSalidaDependenta.init(div); },
		},
		configuracion : {
			text: "Configuración",
			run: function(mp) { div02.children().hide(); },
			init: function(div) { /*configuracion.init(div);*/ }
		},
		impresora : {
			text: "Impresora",
			run: function(mp) { /*AppImpresora.start(mp);*/ },
			init: function(div) { /*AppImpresora.init(div);*/ }
		},
/*		salir : {
			text: "Salir",
			run: function(mp) { 			
				S.opSubMenuSel = subMenus[S.idxSubMenu][0];
//				DepActives.save(dep);	
				window.close(); 
				my.start(mp);
			},
			init: function(div) {}
		}
*/	};

	var subMenus = [
		[
			"entradaSalidaDependenta",
			"configuracion",
			"impresora",
//			"salir"
		]
	];
	
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();

		for (var i in opSubMenu) {
			opSubMenu[i].init(div02);
		}
	};
	
	var mp;
	my.start = function(_mp) {
		mp = _mp;	
		div0.showAlone();
		S.subMenu = (S.subMenu || 0);
		S.opSubMenuSel = (S.opSubMenu || subMenus[S.subMenu][0]);	
		subMenuScroll.redraw(subMenus[S.subMenu].indexOf(S.opSubMenuSel));
		if (S.opSubMenuSel != null) opSubMenu[S.opSubMenuSel].run(mp); 
	};	
	
	return my;
}();

window.AppEntradaSalidaDependenta = function() {	
	var my = {};

	function entrarHandler(e) {
		if (e.button !== 0) return;
		entrarDependenta();
	}
	function plegarHandler(e) {
		if (e.button !== 0) return;
		showAlertPlegar(M("Plega ")+dep.nom+" ?");
	}
	var div0 = $("<div>")._100x100();

	var dialog = newAlertDialog().appendTo(div0);
	
	function showAlertPassIncorrect() {
		dialog.header(M("Error")).text(M("Password incorrecto"))
	                             .setButtons([M("Ok")], function(text, i) { password.val(""); });
	}
	
	function showAlertPlegar(text) {
		dialog.header(M("Plegar?")).text(text)
	                               .setButtons([M("Sí"),M("No")], function(text, i) { 
							 	       if (i==0) { 
									      Dependentes.delActiva(codiDep); 
										  my.finApp();
									   } else { restart(); }
	                               });
	}							   

	var divEP = $("<div>")._100x100().css({ padding: "1em" }).addClass("ui-widget-content").appendTo(div0);
	$("<button>").text("Entrar").css({width:"25%",height:"25%"}).click(entrarHandler).appendTo(divEP);
	var butPlegar = $("<button>").text(M("Plegar")).css({width:"25%",height:"25%"}).click(plegarHandler).appendTo(divEP);

	var divEntrar = $("<div>")._100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divEntrar2 = $("<div>").css({position: "relative", height: "100%"}).appendTo(divEntrar);
	var divIP = $("<div>").css({ position: "absolute", textAlign: "center", width: "70%" }).appendTo(divEntrar2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divEntrar2);
	
	var divEspere = $("<div>")._100x100().css("zIndex", "1000").appendTo(div0);
	var divEspereInner = $("<div>")._100x100().text(M("Esperi...")).addClass('ui-widget-overlay');
	function showDivEspere() {
		divEspere.empty().show();
		setTimeout(function() { divEspereInner.appendTo(divEspere) }, 500);
	}
	
	var depAutoComplete;
	
	var paramsAutoCompleteScroll = {
		arrows : "_ud",
		getNItems : function() { return depAutoComplete.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementAutoComplete;
			var dep = depAutoComplete[idx];
			var el = autoCompleteModel.clone(true).text(dep.nom).data("data", dep);
			return el;
		},
	};

	var autoCompleteModel = $("<button>");
	var defaultElementAutoComplete = autoCompleteModel.clone(false).html("X<br>X"); 
	var autoCompleteScroll = newGScroll(paramsAutoCompleteScroll);
	autoCompleteScroll.getDiv().css({ paddingLeft: SEP });
	autoCompleteScroll.getDiv().absolutePos(70, 0, 100, 100).appendTo(divEntrar2);

	var depNoActives = [];
	var depSel = null;


	my.init = function(div00) {
		div0.appendTo(div00).hide();
		Resize.add(function() { resized = {}; resizeDivEntrar(); }); 
		Dependentes.addChangeHandler(function () {
			if (divEspere.isVisible()) {
				if (Dependentes.getCodiActives().indexOf(waitCodiDepActivation) !== -1) {
					divEspere.hide();
					mp.runMenu(null, waitCodiDepActivation);
					// mp.finApp();
					return;
				}	
			}
			if (divEntrar.isVisible() && autoCompleteActive) {
				obtenerDependentesNoActives();
				autoCompleteChange();
			} 
		});
	};
	
	var mp;
	var dep;
	var codiDep;
	var waitActivation;
	var waitCodiDepActivation;
	var autoCompleteActive;
	
	my.start = function(_mp) {
		mp = _mp;
		codiDep = mp.getCodiDepActual();
		dep = Dependentes.getByCodi(codiDep);
		butPlegar[(codiDep != null) ? "show" : "hide"]();
		waitActivation = null;
		waitCodiDepActivation = null;
		div0.showAlone();
		divEP.showAlone();
	};
	function restart() { 
		my.start(mp); 
	}
	function entrarDependenta() {
		divEntrar.showAlone();
		input.val("");
		input.removeAttr("disabled");
		password.val("");
		password.attr("disabled", "disabled");
		keyboard.setInput(input);
		keyboard.reset();
		keyboard.getButtons("enter").attr("disabled", "disabled");
		keyboard.setCallback(callbackKeyboardDep); 
		obtenerDependentesNoActives();
		autoCompleteActive = true;
		autoCompleteChange();
		resizeDivEntrar();
	}

	var resized = {};	

	function resizeDivEntrar() {
		if (resized.divEntrar) return; 
		if (!divEntrar.isVisible()) return;
		var w0 = divEntrar2.width(), h0 = divEntrar2.height();
		var h2 = divIP.oHeight(), w2 = autoCompleteScroll.getDiv().oWidth(); 
		keyboard.absolutePosPx(0, h2, w0-w2, h0);
		autoCompleteScroll.redraw();
		resized.divEntrar = true;
	}

	function obtenerDependentesNoActives() {
		depNoActives = [];
		Dependentes.getDependentes().forEach(function(dep) {
			if (Dependentes.getCodiActives().indexOf(dep.codi) === -1) 
				depNoActives.push(dep);
		});
	}
	function callbackKeyboardDep(m) {
		if (m == "cancel") restart();
		if (m == "change") autoCompleteChange();
	}
	function callbackKeyboardPass(m) {
		if (m == "cancel") restart();
		if (m == "enter") {
			var codiDepSel = depSel.codi;
			showDivEspere();
			Dependentes.addActiva(codiDepSel, password.val(), function() {
				var func = function(ret) {
					if (!divEspere.isVisible() || (func !== waitActivation)) return;
					if (ret === false) {
						divEspere.hide();
						showAlertPassIncorrect();
					} else waitCodiDepActivation = codiDepSel;
				}
				waitActivation = func;
				return func; // function callback addActiva
			}());
		}
	}
	function autoCompleteChange() {
		var inputCompare = preProcessCompareNom(input.val());
		depAutoComplete = [];
		depNoActives.forEach(function(dep) {
			if (dep.compareNom.indexOf(inputCompare) != -1) {
				depAutoComplete.push(dep);
			}
		});
		autoCompleteScroll.redraw(0);
	}
	autoCompleteModel.click(function (e) {
		if (e.button !== 0) return;
		depSel = $(this).data("data");
		input.val(depSel.nom);
		input.attr("disabled", "disabled");
		password.val("");
		password.removeAttr("disabled");
		keyboard.reset();
		keyboard.setInput(password);
		keyboard.getButtons("enter").removeAttr("disabled");
		keyboard.setCallback(callbackKeyboardPass); 
		depAutoComplete = [];
		autoCompleteScroll.redraw(0);
		autoCompleteActive = false;
		if (depSel.noPassword) {
			callbackKeyboardPass("enter");  // no hace falta pulsar enter
		}
	});

	return my;
}();

}); // add Scripts puertaS
