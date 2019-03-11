H.Scripts.add("cam_appSelDepS", "C", function() {

window.cam_createAppSelDep = function(main, controlMain) {
	var my = {};

	var cssCl = "cam_selDep_";
	if ($("#css_"+cssCl).length == 0) {
		var s = $("<style>").attr("type", "text/css").attr("id", "css_"+cssCl);
		s.text(
			"."+cssCl+"but { \
				padding: 5px; \
				text-align: center; \
				white-space: nowrap; \
			 } \
			 ."+cssCl+"butDep { \
				background: "+linearGradient("to bottom, hsl(240, 100%, 50%), hsl(240, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"butDepSel { \
				background: "+linearGradient("to bottom, hsl(0, 100%, 50%), hsl(0, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"butIdSat { \
				background: "+linearGradient("to bottom, hsl(120, 100%, 50%), hsl(240, 100%, 75%)")+"; \
			 } \
			" 
		);
		s.appendTo("head");
	}

	var butModel = createDivRel(false).addClass(cssCl+"but");
	function createBut(text) {
		var but = butModel.clone();
		but.text(text);
		return but;			  
	}

	// div0
	//    divDeps       relative Dependentes
	//       divDepsScr relative
	//          butDep
	//	  divIdSat IdSat
	
	var div0 = createDivAbs()._100x100().css({backgroundColor: "white"});
	div0.appendTo(main.getDiv()); 

	var divDeps = createDivRel().css("border", "2px solid black").appendTo(div0);
	var divDepsScr = createDivRel().appendTo(divDeps);
	var butIdSat = createBut("").addClass(cssCl+"butIdSat").appendTo(div0);
	
	div0.hide();

	Dependentes.addChangeHandler(function() {
		if (div0.isVisible()) redraw();
	});

	Resize.add(function() {
		if (div0.isVisible()) redraw();
	});

	var fScrollValid;
	
	function redraw() {
		butIdSat.text("Desregistrar "+getCookie("id"));
		divDeps.oHeight(div0.iHeight()-butIdSat.oHeight());
		
		divDepsScr.empty();
		var codiActives = Dependentes.getCodiActives();
		if (codiActives.length == 0) {
			fScrollValid = false;
			divDepsScr.text("No hay Camareros");
		} else {
			fScrollValid = true;
			var curDep = main.getCodiDep();
			codiActives.forEach(function(codi) {
				var dep = Dependentes.getByCodi(codi);
				createBut(dep.nom)
					.addClass((codi == curDep) ? cssCl+"butDepSel" : cssCl+"butDep")
					.data("dep", codi)
					.appendTo(divDepsScr);
			});
			scroll.scrollToVisible(true);
		}
	}

	var clickActive;
	var startTarget;
	var typeTarget;
	var moreInfoTarget;
	
	var opacityDiv = createDivAbs()
	                    .css({top:"0px", left:"0px",width:"100%",height:"100%"})
						.css({opacity:"0.3", background:"gray"});

	function activateClick() {
		var clickableTypeTargets = ["dep", "idSat"];
		if (clickableTypeTargets.indexOf(typeTarget) == -1) return null; 
		opacityDiv.appendTo(startTarget);
		clickActive = true;
		return startTarget;
	}
	
	function deactivateClick() {
		if (!clickActive) return false;
		clickActive = false;
		opacityDiv.detach();
		return true;
	}

	function findStartTarget(target) {
		var info = function() {
			if (fScrollValid) {
				var par = getDOMParents(target, divDeps);
				// divDeps, divScroll, but
				if (par != null) {
					var butD = $(par[2]);
					if (butD.data("dep")) return [butD, "dep"];
					return [divDeps, "depScroll"];
				}	
			}
			var par = getDOMParents(target, butIdSat);
			if (par != null) return [butIdSat, "idSat"]
			return [target, "other"];
		}();
		startTarget = info[0];
		typeTarget = info[1];
		moreInfoTarget = info[2];
	}

	function controlMoveSwipe(dir, difT, force) {
		deactivateClick();
		switch(typeTarget) {
			case "dep":
			case "depScroll":
				if (dir == 'y') {
					scroll.start(difT, force);
					return false;
				}
				break;
		}			
		return false;
	}
	
	var controlTouch = {
		start: function(target, curT) {
			deactivateClick();
			findStartTarget(target);
			return activateClick();
		},
		move: function(dir, difT) {
			return controlMoveSwipe(dir, difT, null);
		},
		swipe: function(dir, force) {
			return controlMoveSwipe(dir, null, force);
		},
		end: function() {
			deactivateClick();
		},
		click: function(target, curT) {
			if (deactivateClick()) {
				if (typeTarget == "dep") {
					controlMain.selectDep(startTarget.data("dep"));
					return;
				} 
				if (typeTarget == "idSat") {
					deleteCookie("id");
					window.parent.postMessage({type:"reload"}, "*");
				}
			}
		},
		leaveClick: function(outOfClick) {
			deactivateClick();
			return false;
		}
	};
	var touchH = touchHandler(div0, controlTouch);
	touchH.start();
	
	var scroll = scrollT(divDepsScr, touchH, null, { dir: 'y' });
	
	my.getDiv = function() { return div0; }
	my.getTouch = function() { return touchH; }
	my.showSelDep = function() {
		div0.show();
		redraw();
	}
	
	my.stop = function() {
		touchH.reset();
		div0.hide();
	}
	
	return my;
}

});

