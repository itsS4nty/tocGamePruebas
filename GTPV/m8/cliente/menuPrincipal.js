H.Scripts.add("menuPrincipalS", "L2", function() {
	
window.menuPrincipal = function() {
	var my = {};
	
	var D = { T: {}, D: {}, N: {} };  // Taules, Dependentes, Null
	var S = {};
	var codiDepActual = null;
//	var DepActual;
	var codiTaulaActual = null;
//	var TaulaActual;
	
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
		getNItems : function() { return Dependentes.getCodiActives().length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementDependenta;
			var codi = Dependentes.getCodiActives()[idx];
			var dep = Dependentes.getByCodi(codi);
			var el = dependentesActivesModel.clone(true).text(dep.nom).data("codiDep", codi);
			if (codi === codiDepActual) {
				el.addClass("g-state-active");
			} 
	/*		for (var i=0, taula; (taula = Taules.getByIdx(i)) != null; i++) {
				if (taula.activa) {
					var el = dependentesActivesModel.clone(true).text("T: "+taula.nom).data("codiTaula", taula)
																.appendTo(dependentesActivesScroll.newElement());
					if (taula == TaulaActual) {
						el.addClass("g-state-active");
						posSel = pos;
						elDependentaSel = el;
					}
					pos++;		
				}	
			}
	*/
			return el;
		}
	};

	var dependentesActivesModel = gButton().addClass("g-state-default");
	var defaultElementDependenta = dependentesActivesModel.clone(false).html("X<br>X");  

	var dependentesActivesScroll = newGScroll(paramsDependentesActivesScroll);
	dependentesActivesScroll.getDiv().absolutePos(0, 20, 100, 100).appendTo(divM);
	
	dependentesActivesModel.mousedown(function (e) {
		if (e.button !== 0) return;
		codiDepActual = $(this).data("codiDep");
		codiTaulaActual = $(this).data("codiTaula");
		getDatosApp();
		redraw();
	});

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
		codiTaulaActual = null;
		
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
/*		Taules.addChangeHandler(function () {
			if (TaulaActual != null) {
				for (var i=0, taula; (taula = taules.getActivaByIdx(i)) != null; i++) {
					if (taulaActual.nom === dep.nom) { taulaActual = taula; break; }
				}
				if (taula == null) taulaActual = null;
			}
			if (divM.isVisible()) {
				getDatosApp();
				redraw();
			}
			
		});
*/
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
		if (codiTaulaActual != null) {
			S = (D.T[codiTaulaActual] = (D.T[codiTaulaActual] || {}));
			S.menuType = "taula";  
		} else if (codiDepActual != null) {
			S = (D.D[codiDepActual] = (D.D[codiDepActual] || {}));
			S.menuType = "dependenta";  
		} else {
			S = (D.N = D.N || {});
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
/*	my.getTaulaActual = function() {
		return TaulaActual;	
	}
*/	my.getIdComandaActual = function() {
		if (codiTaulaActual != null) return Comandes.getId("T", codiTaulaActual);
		if (codiDepActual != null) return Comandes.getId("D", codiDepActual);
		return null;
	}
	my.finApp = function() {
		S.opMenuSel = my.menus.initial[S.menuType];
		redraw();
	}
	my.runMenu = function(op, codiDep, taula) {
		if (codiDep) codiDepActual = codiDep;
		if (typeof taula !== "undefined") codiTaulaActual = taula; 
		getDatosApp();
		S.opMenuSel = op;
		getDatosApp(); // verificar S.opMenuSel
		redraw();
	}
	return my;
}();

}); // add Scripts menuPrincipal

H.menuPrincipal = function() {
	var my = {};
	
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
		taula : [ "venda", true ]     // opción inicial
	};

	my.menusSatelliteExtern = {
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda", true,            // opcion inicial
			"editorTeclats",
			"cajaFuerte"
		],
		taula : [ "venda", true ]     // opción inicial
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
	