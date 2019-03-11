(function () {
	
window.menuPrincipal = function() {
	var my = {};
	
	var D = { Mesas: {}, Dep: {}, No: {} };  // Mesas, Dependentes, NoDep
	var S = {};
	var codiDepActual = null;
	var codiMesaActual = null;
	
	var divM = $("<div>")._100x100();
	
	var paramsMenuScroll = {
		arrows : "_ud",
		getNItems : function() { return my.menus.m[S.menuType].length; },
		getItem : function(idx) {
			var opName = my.menus.m[S.menuType][idx];
			var dataOp = my.menus.ops[opName];
			var el = dataOp.elScroll;
			if (opName === S.opMenuSel) el.addClass("g-state-active");
			else el.removeClass("g-state-active");
			return el;
		},
		nElScroll : 2,
		removeEl : function() { $(this).detach(); }
	};

	var menuModel = gButton().width("100%").css("position", "relative").addClass("g-state-default");

	var menuScroll = newGScroll(paramsMenuScroll);
	menuScroll.getDiv().absolutePos(0, 0, 100, 20).appendTo(divM);

	menuModel.mousedown(function (e) {
		if (e.button !== 0) return;
		S.opMenuSel = $(this).data("data");
		menuScroll.redraw(my.menus.m[S.menuType].indexOf(S.opMenuSel));
		my.menus.ops[S.opMenuSel].run(my);
	});
	
	var paramsDependentesActivesScroll = {
		arrows : "_ud",
		getNItems : function() { 
			return Dependentes.getCodiActives().length
			      +StateMesas.getOpens().length
				  +((codiDepActual!=null)?1:0); 
		},
		getItem : function(idx) {
			var el;
			if (idx === -1) return defaultElementDependenta;
			if (idx < Dependentes.getCodiActives().length) {
				var codi = Dependentes.getCodiActives()[idx];
				var dep = Dependentes.getByCodi(codi);
				el = dependentesActivesModel.clone(true).text(dep.nom)
				    .data("codiDep", codi);
				if (codi === codiDepActual) {
					el.addClass("g-state-active");
				} 
			} else {
				idx -= Dependentes.getCodiActives().length;
				if (idx < StateMesas.getOpens().length) {
					var mesaName = StateMesas.getOpens()[idx];
					el = mesasModel.clone(true).text(mesaName)
						.data("codiMesa", mesaName);
					if (mesaName === codiMesaActual) {
						el.addClass("g-state-active");
					} 
				} else {
					el = mesasModel.clone(false).text(M("abrir mesa"))
						 .mousedown(function (e) {
							 if (e.button !== 0) return;
							 var names = StateMesas.getNames();
							 for (var i=0; i<names.length; i++) {
							     if (!StateMesas.isOpen(names[i])) {
							         codiDepActual = null;
							         codiMesaActual = names[i];
							         getDatosApp();
							         redraw();
									 break;
							     }
						     }
						 })	 
						 .data("abrirMesa", true); // ??
				}
			}
			return el;
		}
	};

	var dependentesActivesModel = gButton().addClass("g-state-default");
	var defaultElementDependenta = dependentesActivesModel.clone(false).html("X<br>X");  
	var mesasModel = dependentesActivesModel.clone();

	var dependentesActivesScroll = newGScroll(paramsDependentesActivesScroll);
	dependentesActivesScroll.getDiv().absolutePos(0, 20, 100, 100).appendTo(divM);
	
	dependentesActivesModel.mousedown(function (e) {
		if (e.button !== 0) return;
		codiDepActual = $(this).data("codiDep");
		codiMesaActual = null;
		getDatosApp();
		redraw();
	});
	
	mesasModel.mousedown(function (e) {
		if (e.button !== 0) return;
		codiDepActual = null;
		codiMesaActual = $(this).data("codiMesa");
		getDatosApp();
		redraw();
	})

	function redraw(checkVis) {
		if (checkVis && (!divM.isVisible())) return;
		divM.showAlone();

		//redraw Menu
		menuScroll.redraw(my.menus.m[S.menuType].indexOf(S.opMenuSel));

		//redraw Dependentes Actives y taules Actives
		dependentesActivesScroll.redraw(Dependentes.getCodiActives().indexOf(codiDepActual));
		
		if (S.opMenuSel != null) my.menus.ops[S.opMenuSel].run(my);
		else { layout.content.children().hide(); }
	}
	
	my.init = function() {
		codiDepActual = null;
		codiMesaActual = null;
		
		divM.appendTo(layout.menu).hide();

		Dependentes.addChangeHandler(function() {
			for (var codi in D.D) {
				if (Dependentes.getCodiActives().indexOf(codi) === -1)
					delete D.D[codi];
			}
			if ((codiDepActual == null) || (Dependentes.getCodiActives().indexOf(codiDepActual) !== -1)) {
				dependentesActivesScroll.redraw();
			} else {	
				codiDepActual = null;
				getDatosApp();
				redraw(true);
			}	
		});
		StateMesas.init();
		StateMesas.addChangeHandler(function(m) {
			dependentesActivesScroll.redraw();
		});

		for (var opName in my.menus.ops) {
			var dataOp = my.menus.ops[opName];
			dataOp.init(layout.content);
			var el = menuModel.clone(true).data("data", opName);	
			if (dataOp.cssClass != null) el.addClass(dataOp.cssClass);
			if (dataOp.image != null) {
				$("<img>").attr("src", dataOp.image)
				          .css({ paddingLeft: "8px", height: "100%", position: "absolute", top: "0px", left:"0px"})
						  .appendTo(el);
			}			
			$("<span>").text(M(dataOp.text)).appendTo(el);
			dataOp.elScroll = el;
		}
		
/*		Resize.add(function() {
			if (divM.isVisible()) {
				menuScroll.redraw();
				dependentesActivesScroll.redraw();
			}			
		});
*/	};
	
	function getDatosApp() {
		if (codiMesaActual != null) {
			S = (D.Mesas[codiMesaActual] = (D.Mesas[codiMesaActual] || {}));
			S.menuType = "mesa";  
		} else if (codiDepActual != null) {
			S = (D.Dep[codiDepActual] = (D.Dep[codiDepActual] || {}));
			S.menuType = "dependenta";  
		} else {
			S = (D.No = D.No || {});
			S.menuType = "noDependenta";  
		}	
		if (my.menus.m[S.menuType].indexOf(S.opMenuSel) === -1) {
			S.opMenuSel = my.menus.initial[S.menuType];	
		}	
	}
	
	my.start = function() {
		getDatosApp();
		redraw();
	};
/*	my.stop = function() {
		divM.hide();	
	};
*/	
	my.getCodiDepActual = function() {
		return codiDepActual;	
	}
	my.getMesaActual = function() {
		return codiMesaActual;	
	}
	my.getIdComandaActual = function() {
		if (codiMesaActual != null) return Comandes.getId("M", codiMesaActual);
		if (codiDepActual != null) return Comandes.getId("D", codiDepActual);
		return null;
	}
	my.finApp = function() {
		S.opMenuSel = my.menus.initial[S.menuType];
		redraw();
	}
	my.runMenu = function(op, codiDep, codiMesa) {
		if (codiDep != null) codiDepActual = codiDep;
		if (codiMesa != null) codiMesaActual = codiMesa; 
		getDatosApp();
		S.opMenuSel = op;
		getDatosApp(); // verificar S.opMenuSel
		redraw();
	}

	my.opcionesMenu = {
		puerta : {
			text: "puerta",
//			cssClass: "buttonPuerta",
			image: "css/gtpv/img/iconoPuerta.png",
			run: function(mp) { AppPuerta.start(mp); },
			init: function(div) { AppPuerta.init(div);	},
		},
		venda : {
			text: "Venda",
//			cssClass: "buttonVenda",
			image: "css/gtpv/img/iconoVenda.png",
			run: function(mp) { AppVenda.start(mp);	},
			init: function(div) { AppVenda.init(div); },
		},
		editorTeclats : {
			text: "Editor Teclats",
//			cssClass: "buttonEditorTeclats",
			image: "css/gtpv/img/iconoEditorTeclats.png",
			run: function(mp) { AppEditorTeclats.start(mp);	},
			init: function(div) { AppEditorTeclats.init(div); },
		},
		cajaFuerte : {
			text: "Caja Fuerte",
//			cssClass: "buttonCajaFuerte",
			image: "css/gtpv/img/iconoCajaFuerte.png",
			run: function(mp) { AppCajaFuerte.start(mp); },
			init: function(div) { AppCajaFuerte.init(div); },	
		}
	};

	my.menusSatelliteLocal = {
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda", true,            // opcion inicial
			"editorTeclats",
			"cajaFuerte"
		],
		mesa : [ "venda", true ]     // opción inicial
	};

	my.menusSatelliteExtern = {
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda", true,            // opcion inicial
			"editorTeclats",
			"cajaFuerte"
		],
		mesa : [ "venda", true ]     // opción inicial
	};

	my.createOptions = function (menus, ops) {
		var genMenus = { m:{}, ops: {}, initial: {} };
		for (var t in menus) {
			genMenus.m[t] = [];
			genMenus.initial[t] = null;
			var prevOpName;
			menus[t].forEach(function(opName, i) {
				if (opName === true) genMenus.initial[t] = prevOpName;
				else {
					genMenus.m[t].push(opName);
					genMenus.ops[opName] = ops[opName];
					prevOpName = opName;
				}
			});
		}
		return genMenus;
	}

	return my;
}();

})(window);
