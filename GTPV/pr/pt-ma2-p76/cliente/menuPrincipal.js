H.Scripts.addLocalExec("menuPrincipalS", function(window) {
	
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
			if (idx === -1) return null;
			var op = my.menus.m[S.menuType][idx];
			var el = menuModel.clone(true).data("data", op).text(M(my.menus.ops[op].text));	
			//Class img background
			if (my.menus.ops[op].cssClass != null) el.addClass(my.menus.ops[op].cssClass)
			if (op === S.opMenuSel) el.addClass("ui-state-active");
			return el;
		},
		nElScroll : 2,
	};

	var menuModel = $("<button>").width("100%").addClass("ui-state-default");

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
				el.addClass("ui-state-active");
			} 
	/*		for (var i=0, taula; (taula = Taules.getByIdx(i)) != null; i++) {
				if (taula.activa) {
					var el = dependentesActivesModel.clone(true).text("T: "+taula.nom).data("codiTaula", taula)
																.appendTo(dependentesActivesScroll.newElement());
					if (taula == TaulaActual) {
						el.addClass("ui-state-active");
						posSel = pos;
						elDependentaSel = el;
					}
					pos++;		
				}	
			}
	*/
			return el;
		},
	};

	var dependentesActivesModel = $("<button>").addClass("ui-state-default");
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
		else { layoutPrincipal.content.children().hide(); }
	}
	
	my.init = function() {
		codiDepActual = null;
		codiTaulaActual = null;
		
		divM.appendTo(layoutPrincipal.menu).hide();

		
		
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
			my.menus.ops[opName].init(layoutPrincipal.content);
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
/*		if (S.menu == null) {
			S.menu = (DepActives.getActual().codi == null) ? "noDependenta" : "dependenta";
			S.opMenuSel = opMenuInicial[S.menu];  
		}
*/		redraw();
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

