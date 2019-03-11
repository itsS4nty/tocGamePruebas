(function () {

window.cam_createAppComedor = function(main, controlMain) {
	var my = {};
	
	// div0
	//    divCs relative Comedores
	//	     dC page     Comedor
	//          title
	//          divMs    Mesas
	//              dM   Mesa 
	
	var div0 = createDivAbs()._100x100().css({backgroundColor: "white"});
	div0.appendTo(main.getDiv()); 
	
	var divCs = createDivRel().css({height: "100%"}).appendTo(div0);

	div0.hide();
	
	StateMesas.init();
	StateMesas.addChangeHandler(function(mesaName) {
		if (!div0.isVisible()) return;
		if (mesaName==null) {
			// ?? get prev State 
			redraw();
		} else {
			drawMesaState(mesaName);
		}
	});
	
	Resize.add(function() {
		if (div0.isVisible()) redraw();
	});

	// minimo un comedor;
	
	var comedores = Mesas.get();
	var aDivMesas = {}; // assoc-array by idC
	var marginMesas = 5;
	
	function redraw() {
		comedores = Mesas.get();

		var W = div0.iWidth();
		var H = div0.iHeight();
		divCs.empty();
		
		// temp Comedor
		var dC = createDiv().css({height: "100%"});
		dC.oWidth(W);
		dC.appendTo(divCs);
		var title = createDiv().css({whiteSpace: "pre", background: "red"}).text("XXXX").appendTo(dC);
		var divMs = createDiv().css({border: "2px solid red"}).appendTo(dC);
		divMs.oHeight(H-title.oHeight());
		var dM = createDivAbs();
		dM.css({border: "2px solid green", font: "200% monospace"});
		dM.text("XX");
		dM.appendTo(divMs);
		var wm = dM.oWidth();
		var hm = dM.oHeight();
		var wMs = divMs.iWidth();
		var hMs = divMs.iHeight();
		var nX = Math.floor(wMs/(wm+2*marginMesas)); // 2px margin
		var nY = Math.floor(hMs/(hm+2*marginMesas));
		var nM = nX*nY;
		if (nM < 1) nM=1;
		dC.remove();
		
		for (var i=0; i<comedores.length; ) {
			comedores[i].origName = comedores[i].name; 
			var nSubC = Math.ceil(comedores[i].mesas.length/nM);
			if (nSubC > 1) {
				var subC = [];
				for (var j=0; j<nSubC; j++) {
					subC.push({
						name: comedores[i].name+" - "+(j+1),
						mesas: comedores[i].mesas.slice(j*nM, (j+1)*nM),
						subCName: j
					});	
				}			
				subC.unshift(1);
				subC.unshift(i); // slice(i,1,subC0,...);
				Array.prototype.splice.apply(comedores, subC);
				i+=nSubC;
			} else i++;
		}
		divCs.iWidth(W*comedores.length);
		aDivMesas = [];
		comedores.forEach(function(c) {
			var dC = createDiv();
			dC.css({display: "inline-block", verticalAlign: "top", height: "100%"});
			dC.oWidth(W);
//			dC.oHeight(H);
			dC.appendTo(divCs);
			var title = createDiv().css({whiteSpace: "pre", textAlign: "center", background: "red"})
			                       .text(c.name).data("title", true).appendTo(dC);
			var divMs = createDiv().css({position: "relative"})
			                      .css({border: "2px solid red"}).appendTo(dC);
			divMs.oHeight(H-title.oHeight());
			var ms = c.mesas;
			for (var y=0,i=0; y<nY; y++) { 
				for (var x=0; x<nX; x++,i++) {
					if (i >= ms.length) continue;
					var mesaName = ms[i].name;
					var dM = createDivAbs();
					dM.css({border: "2px solid white", font: "200% monospace"});
					// border green, red, blue
					dM.text(mesaName);
					dM.css({left: Math.round((x+0.5)*(wMs/nX)-(wm/2))});
					dM.css({top: Math.round((y+0.5)*(hMs/nY)-(hm/2))});
					dM.oWidth(wm);
					dM.oHeight(hm);
					dM.appendTo(divMs);
					dM.data("mesa", mesaName);
					aDivMesas[mesaName] = dM;
					drawMesaState(mesaName);
				}
			}	
		});
		scroll.scrollToVisible(true);
	}

	var clickActive;
	var startTarget;
	var typeTarget;
	var moreInfoTarget;
	
	var opacityDiv = createDivAbs()
	                    .css({top:"0px", left:"0px",width:"100%",height:"100%"})
						.css({opacity:"0.3", background:"gray"});

	function activateClick() {
		var clickableTypeTargets = ["mesa"];
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
			var par = getDOMParents(target, div0);
			if (par != null) {
				// div0, divCs, dC, divMs, dM
				var dM = $(par[4]);
				if (dM.data("mesa")) return [dM, "mesa"];
				// div0, divCs, dC, divT
				var dT = $(par[3]); 
				if (dT.data("title")) return [dT, "title"];
			}	
			return [target, "other"];
		}();
		startTarget = info[0];
		typeTarget = info[1];
		moreInfoTarget = info[2];
	}

	function controlMoveSwipe(dir, difT, force) {
		deactivateClick();
		if (dir == 'x') {
			scroll.start(difT, force);
			return false;
		} 
		if (typeTarget == "title") {
			if ((dir == 'y') && ((difT > 0) || (force > 0))) {
				controlMain.toSelDep(difT, force);
				return false;
			}		
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
				var mesaName = startTarget.data("mesa");
				controlMain.selectMesa(mesaName);
			}
		},
		leaveClick: function(outOfClick) {
			deactivateClick();
			return false;
		}
	};
	var touchH = touchHandler(div0, controlTouch);
	touchH.start();
	
	var paramsScroll = { dir: 'x' , fPages: true, fSwipeOnePage: true};
	var scroll = scrollT(divCs, touchH, controlTouchScroll, paramsScroll);
	
	var controlTouchScroll = {
		move: function(dir, difT, curT) {
			scroll.complete(true);
			controlTouch.move(dir, difT, curT);
			return true;
		},
		swipe: function(dir, force, curT) {
			scroll.complete(true);
			controlTouch.swipe(dir, force, curT);
			return true;
		},
		end: function(page) {
		},
	}
	
	function drawMesaState(mesaName) {
		var state = StateMesas.getState(mesaName);
		var dM = aDivMesas[mesaName];
		if (dM) {
			dM.css((state.fOpen)? 
				{borderColor: "green", color: "green"} :
				{borderColor: "red", color: "red"});
		}
	}
	
	my.getDiv = function() { return div0; }
	my.getTouch = function() { return touchH; }
	my.showComedor = function() {
		div0.show();
		redraw();
	}
	
	my.stop = function() {
		touchH.reset();
		div0.hide();
	}
	
	return my;
}

})(window);
