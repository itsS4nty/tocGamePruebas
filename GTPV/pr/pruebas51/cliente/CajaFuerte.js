var procesoCajaFuerte = function() {
	var my = {};

	var div0 = positionDiv(null, 0, 0, 100, 100);
	var div01 = positionDiv(null, 0, 0, 100, heightSubMenu.getPerc()).appendTo(div0);
	var div02 = positionDiv(null, 0, heightSubMenu.getPerc(), 100, 100).appendTo(div0);
	var subMenuScroll = new myScroll("_lr", 6);
	positionDiv(subMenuScroll.getDiv(), 0, 0, 100, 100).appendTo(div01);
	//subMenuScroll.removeAll();
	var D = {};
	
	var opcionesSubMenu = {
		cerrarCaja : {
			text: "Tancar Caixa",
			run: function() { procesoCerrarCaja.start(); },
			init: function() { procesoCerrarCaja.init(div02); },
		},
	};

	var subMenus = [
		[
			opcionesSubMenu.cerrarCaja,
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
		D = DepActives.getDatosProceso("cajaFuerte", dep);
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

var procesoCerrarCaja = function() {
	var my = {};

	var D = null;

	var canvi = newProcesoCanviCaja();

	var div0 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");
	var divCerrar = canvi.getDiv().appendTo(div0);
	var divNoPuedeCerrarCaja = positionDiv(null,0,0,100,100).text("No Pots Tancar Caixa")
	                                                        .addClass("ui-widget-content").appendTo(div0);
	var divCajaCerrada = positionDiv(null,0,0,100,100).text("Caixa Tancada")
	                                                  .addClass("ui-widget-content").appendTo(div0);
	var butCanviCorrecte = $("<button>").css({position: "absolute", width: "100%"})
	                                    .text("Canvi Correcte").appendTo(canvi.getDivButtons());
	butCanviCorrecte.click(function (e) {
		var c = Caja.get();
		c.canvi = D.canvi;
		c.primera = dep;
		c.descuadre = c.zeta+Caja.totalCanvi(c.canvi)-c.descuadre;
		Caja.cerrar(c);
		D = null;
		my.start(dep);
	});
	
	var fResize = {};

	my.init = function(div00) {
		div0.appendTo(div00).hide();

		$(window).resize(function() {
			fResize = {};
			if (isDivVisible(divCerrar)) resize(); 
		});
	};
	var dep; 
	my.start = function(_dep) {
		div0.siblings().hide();
		div0.show();
		if (!Caja.get().oberta) {
			divCajaCerrada.siblings().hide();
			divCajaCerrada.show();
		} else {
			dep = _dep || DepActives.getActual();
			if (dep.dep.tipusTreballador == "GERENT") {
				divCerrar.siblings().hide();
				divCerrar.show();
				if (D == null) { 
					D = {
						canvi : Caja.get().canvi.slice(0),
						selected : 0,
					};
				}
				D.primeraTecla = true;
				canvi.start(D);
				resize();
			} else {
				divNoPuedeCerrarCaja.siblings().hide();
				divNoPuedeCerrarCaja.show();
			}
		}
	};
	function resize() {
		if (fResize.divCerrar === false) return;
		canvi.resize();
		butCanviCorrecte.css({ top: (6*PAD)+"px" });
		fResize.divCerrar = false;
	}
	
	return my;
}();

