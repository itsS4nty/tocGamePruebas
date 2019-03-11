(function () {

window.cam_createAppMain = function() {
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
		appSelDep = cam_createAppSelDep(my, handlerSelDep);
		appComedor = cam_createAppComedor(my, handlerComedor);
		appComanda = cam_createAppComanda(my, handlerComanda);
		appAddProd = cam_createAppAddProd(my, handlerAddProd);
		Caja.addChangeHandler(function() {
			if (!div0.isVisible()) return;
			if (prevCajaOpen != Caja.isOpen()) {
				showStateCaja();
			}				
		});
		Dependentes.addChangeHandler(function() {
			if (!Caja.isOpen()) return;
			if (codiDep == null) return;
			if (Dependentes.getCodiActives().indexOf(codiDep) != -1) return;
			appComedor.stop();
			appComanda.stop();
			appAddProd.stop();
			appSelDep.getDiv().css({left:0, top:0});
			appSelDep.showSelDep();
		});
	}
	
	function showStateCaja() {
		prevCajaOpen = Caja.isOpen();
		if (prevCajaOpen) {
			divCajaCerrada.hide();
			appSelDep.getDiv().css({left:0, top:0});
			appSelDep.showSelDep();
		} else {
			appSelDep.stop()
			appComedor.stop();
			appComanda.stop();
			appAddProd.stop();
			divCajaCerrada.show();
		}
	}

	var codiDep;
	my.getCodiDep = function() {
		return codiDep;
	}
	
	var handlerSelDep = {
		selectDep: function(codi) {
			codiDep = codi;
			var control = {
				end: function(fEnd) {
					(fEnd?appSelDep:appComedor).getDiv().hide();
				}
			}
			var params = {
				     dir: 'y',
					 start1: 0, end1: -1, 
					 start2: 1, fOverPage: false, 
					 size: div0.iHeight(), 
					 cancel2ToStart: false
			}
			appComedor.showComedor();
			var ptp = pageToPage(appSelDep.getDiv(), null, 
					             appComedor.getDiv(), appComedor.getTouch(),
				                 control, params);
			ptp.start(null, -1);					 
		},
	};
	
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
		toSelDep: function(difT, force) {
			var control = {
				end: function(fEnd) {
					(fEnd?appComedor:appSelDep).getDiv().hide();
				}
			}
			var params = {
				     dir: 'y',
					 start1: 0, end1: 1, 
					 start2: 0, fOverPage: true, 
					 size: div0.iHeight(), 
					 cancel2ToStart: false
			}
			appSelDep.showSelDep();
			var ptp = pageToPage(appComedor.getDiv(), appComedor.getTouch(), 
					             appSelDep.getDiv(), appSelDep.getTouch(),
				                 control, params);
			ptp.start(difT, force);					 
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

})(window);
