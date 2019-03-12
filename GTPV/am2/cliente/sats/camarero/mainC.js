H.Scripts.add("sats/camarero/mainC", "C", function() {

window.createAppCMain = function() {
	var my = {};
	
	var state;
	var div0 = createDiv()._100x100();
	var appComedor, appComanda, appAddProd;
	var curApp; // ??
	var prevCajaOpen = false;
	
	var divCajaCerrada = createDivAbs()._100x100().appendTo(div0)
	                    .css({backgroundColor: "white", textAlign: "center"})
						.hide();
	createVerticalAligner(
		createDiv().css({whiteSpace: "pre", fontSize: "200%"}).text("Caja cerrada"), true
	).appendTo(divCajaCerrada);

	my.init = function(div00) {
		div0.appendTo(div00).hide();
		appComedor = createAppComedor(my, handlerComedor);
		appComanda = createAppComanda(my, handlerComanda);
		appAddProd = createAppAddProd(my, handlerAddProd);
		Caja.addChangeHandler(function() {
			if (!div0.isVisible()) return;
			if (prevCajaOpen != Caja.isOpen()) {
				showStateCaja();
			}				
		});
	}
	
	function showStateCaja() {
		prevCajaOpen = Caja.isOpen();
		if (prevCajaOpen) {
			divCajaCerrada.hide();
			appComedor.getDiv().css({left:0, top:0});
			appComedor.showComedor();
		} else {
			appComedor.stop();
			appComanda.stop();
			appAddProd.stop();
			divCajaCerrada.show();
		}
	}
	
	var handlerComedor = {
		selectMesa: function(nameMesa) {
			var control = {
				end: function(fEnd) {
					(fEnd?appComedor:appComanda).getDiv().hide();
				}
			}
			var params = {
				     dir: 'y',
					 start1: 0, end1: -1, 
					 start2: 1, fOverPage: false, 
					 size: div0.iHeight(), 
					 cancel2ToStart: false
			}
			appComanda.setMesa(nameMesa);
			var ptp = pageToPage(appComedor.getDiv(), null, 
					             appComanda.getDiv(), appComanda.getTouch(),
				                 control, params);
			ptp.start(null, -1);					 
		},
		previousPage: function() {
			// a configuración
		},
	};
	
	var handlerComanda = {
		toComedor: function(difT, force) {
			if ((difT == null) && (force == null)) force=1;
			var control = {
				end: function(fEnd) {
					(fEnd?appComanda:appComedor).getDiv().hide();
				}
			}
			var params = {
				     dir: 'y',
					 start1: 0, end1: 1, 
					 start2: 0, fOverPage: true, 
					 size: div0.iHeight(), 
					 cancel2ToStart: false
			}
			appComedor.showComedor();
			var ptp = pageToPage(appComanda.getDiv(), appComanda.getTouch(), 
					             appComedor.getDiv(), appComedor.getTouch(),
				                 control, params);
			ptp.start(difT, force);					 
		},
		toAddProd: function(S, C, ord) {
			var control = {
				end: function(fEnd) {
					(fEnd?appComanda:appAddProd).getDiv().hide();
				}
			}
			var params = {
				     dir: 'x',
					 start1: 0, end1: -1, 
					 start2: 1, fOverPage: false, 
					 size: div0.iWidth(), 
					 cancel2ToStart: false
			}
			appAddProd.start(S, C, ord);
			var ptp = pageToPage(appComanda.getDiv(), null, 
					             appAddProd.getDiv(), appAddProd.getTouch(),
				                 control, params);
			ptp.start(null, -1);					 
		}
	};
	
	var handlerAddProd = {
		toComanda: function(difT, force, fChangeItems) {
			var control = {
				end: function(fEnd) {
					(fEnd?appAddProd:appComanda).getDiv().hide();
				}
			}
			var params = {
				     dir: 'x',
					 start1: 0, end1: 1, 
					 start2: 0, fOverPage: true, 
					 size: div0.iWidth(), 
					 cancel2ToStart: false
			}
			appComanda.endAddProd(fChangeItems);
			var ptp = pageToPage(appAddProd.getDiv(), appAddProd.getTouch(), 
					             appComanda.getDiv(), appComanda.getTouch(),
				                 control, params);
			ptp.start(difT, force);					 
		}
	};
	
	my.start = function() {
		div0.showAlone();
		showStateCaja();
	}
	
	my.getDiv = function() {
		return div0;
	}
	
	return my;
}

});

