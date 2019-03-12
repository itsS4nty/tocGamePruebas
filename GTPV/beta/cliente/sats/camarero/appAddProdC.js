H.Scripts.add("sats/camarero/appAddProdC", "C", function() {

window.createAppAddProd = function(main, controlMain) {
	var my = {};
	
	var cssCl = "addProdC_";
	if ($("#"+cssCl).length == 0) {
		var s = $("<style>").attr("type", "text/css").attr("id", cssCl);
		s.text(
			"."+cssCl+"item { \
				padding: 5px; \
				background: "+linearGradient("to bottom, hsl(240, 100%, 50%), hsl(240, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"itemSel { \
				background: "+linearGradient("to bottom, hsl(0, 100%, 50%), hsl(0, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"itemMaster { \
				background: "+linearGradient("to bottom, hsl(120, 100%, 50%), hsl(120, 100%, 75%)")+"; \
			 } \
			" 
		);
		s.appendTo("head");
	}
	
	var toIdChangeData = null;
	function changeDataHandler() { 
		if (toIdChangeData == null) {
			toIdChangeData = setTimeout(function() {
				toIdChangeData = null;
				if (!div0.isVisible) return;
				reset();
				//if (!checkStateValid()) reset();
				//redraw(); // control scrolls
			}, 0);
		}
	}
	
	var Levels = ['DosNivells', 'Ambients', 'Teclat'];
	function prevLevel(level) {
		if (level == null) level = curLevel;
		return Levels[Levels.indexOf(level)-1];	
	}
	function nextLevel(level) {
		if (level == null) level = curLevel;
		return Levels[Levels.indexOf(level)+1];	
	}
	
	Articles.addChangeHandler(changeDataHandler); 
	Teclats.addChangeHandler(changeDataHandler); 
	DosNivells.addChangeHandler(changeDataHandler);
	
	var ord;
	
	// div0
	//    divPage
	//       itemSelector
	//       divCont
	//          divScroll
	//             item
	//    divPrevLevels
	//	     divPage
	//       divPage
	var div0 = createDivAbs()._100x100().css({backgroundColor: "white"});
	div0.appendTo(main.getDiv()); // getDiv
	
	var divPrevLevels = createDivAbs();
	divPrevLevels.css({width: "100%", height: "100%", zIndex: "10", backgroundColor: "white"});
	divPrevLevels.appendTo(div0);

	div0.hide();
	
	var W,H;
	
	var infoLevels;
	var firstLevel;
	var curLevel;
	function reset() {
		firstLevel = (DosNivells.getRef().length > 0) ? 'DosNivells' : 'Ambients';
		infoLevels = {};
		curLevel = firstLevel;
		div0.empty();
		divPrevLevels.empty().css({left: "0px"}).appendTo(div0);
		infoLevels[curLevel] = { div: createPage(curLevel).prependTo(div0) };
		drawLevel(curLevel);
		repositionDivs(div0);
	}
	
	function createPage(level) {
		var divPage;
		divPage = createDivAbs().css({height: "100%", zIndex: "1", marginRight: "5px"});
		createDiv().appendTo(divPage); // itemMaster
		var divCont = createDivRel().appendTo(divPage);
		var divScroll = createDivRel().appendTo(divCont);
		return divPage;
	}
	
	function getScrollDivsFromPage(divPage) {
		var divCont = divPage.children().eq(1);
		return { cont: divCont, scroll: divCont.children().eq(0) }
	}
	
	function createItem(level, divCont) {
		var div = createDivRel().addClass(cssCl+"item");
		if (divCont) div.appendTo(divCont);
		return div;
	}
	
	function drawLevel(level, itemMaster, divPage) {
		if (!itemMaster) itemMaster = infoLevels[level].itemMaster;
		if (!divPage) divPage = infoLevels[level].div;
		
		var divTitle = divPage.children().eq(0);
		divTitle.empty();
		if (itemMaster) itemMaster.appendTo(divTitle);
		var hTitle = divTitle.oHeight();
		var divScr = getScrollDivsFromPage(divPage);
		divScr.cont.oHeight(divPage.iHeight()-hTitle);
		divPage.oWidth(div0.iWidth()*((level != firstLevel)?.75:1));
		divScr.scroll.empty();
		// draw scroll
		switch (level) {
			case 'DosNivells' :
				var dosN = DosNivells.getRef();
				dosN.forEach(function(el) {
					var divItem = createItem(level, divScr.scroll);
					divItem.text(el.texte);
					divItem.data("info", el);
				});
				break;
			case 'Ambients' :
				var ambients = Teclats.getAmbients();
				var lenTag = 0;
				if (itemMaster) {
					var dosNivItem = itemMaster.data("info");
					var tag = dosNivItem.tag;
					lenTag = tag.length;
					ambients = ambients.filter(function (el) {
						return el.substr(0, lenTag) == tag;
					});
				}
				ambients.forEach(function(el) {
					var divItem = createItem(level, divScr.scroll);
					divItem.text(el.substr(lenTag));
					divItem.data("info", el);
				});
				break;
			case 'Teclat' :
				var ambientItem = itemMaster.data("info");
				var teclats = Teclats.getAmbient(ambientItem);
				if (teclats != null) {
					teclats.buttons.forEach(function(but) {
						if (but == null) return;
						var art = Articles.getByCodi(but.codi);
						if (art == null) return;
						if (art.nom == "") return;
						var divItem = createItem(level, divScr.scroll);
						divItem.text(art.nom);
						divItem.data("info", {but: but, art: art});
					});
				}
				break;
		}
	}
	
	function repositionDivs(divCont) {
		var pos = 0;
		divCont.children().each(function() {
			var div = $(this);
			div.css("left", pos+"px");
			pos+=div.oWidth();
		})
	}
	
	var clickActive = false;
	var startTarget;
	var typeTarget;
	var moreInfoTarget;
	
	var toIdClick = null;
	
	var opacityDiv = createDivAbs().css({top:"0px", left:"0px",width:"100%",height:"100%"});

	function activateClick() {
		var clickableTypeTargets = ["item"];
		if (clickableTypeTargets.indexOf(typeTarget) == -1) return null; 
		opacityDiv.appendTo(startTarget);
		clickActive = true;
		return startTarget;
	}
	
	function deactivateClick() {
		if (!clickActive) return false;
		clickActive = false;
		opacityDiv.remove();
		return true;
	}

	function findStartTarget(target) {
		var info = function() {
			var divPage = infoLevels[curLevel].div;
			var par = getDOMParents(target, divPage);
			if (par != null) {
				var divScr = getScrollDivsFromPage(divPage);
				par = getDOMParents(target, divScr.cont);
				if (par == null) return [divPage, "page"];
				if (par[2] != null) {
					var item = $(par[2]);
					if (item.data("info") != null) // ??
						return [item, "item", divScr.scroll];
				}
				return [divScr.scroll, "scroll", divScr.scroll];
			}
			if (curLevel != firstLevel) {
				var par = getDOMParents(target, divPrevLevels);
				if (par != null) return [divPrevLevels, "prevLevels"];
			}
			return [target, "other"];
		}();
		startTarget = info[0];
		typeTarget = info[1];
		moreInfoTarget = info[2];
	}
	
	function controlMoveSwipe(dir, difT, force) {
		deactivateClick();
		switch(typeTarget) {
			case "page":
			case "scroll":
			case "item":
			case "other":
				if ((dir == 'x') && ((difT > 0) || ( force > 0))) {
					controlMain.toComanda(difT, force);
					return false;
				}	
		}
		switch(typeTarget) { 	
			case "item":
			case "scroll":
				if (dir == 'y') {
					var params = { dir: 'y' };
					scroll = scrollT(moreInfoTarget, touchH, controlScroll, params);
					scroll.start(difT, force);
					return false;
				} 
				break;
			case "prevLevels":
				if ((dir == 'x') && ((difT < 0) || ( force < 0))) {
					toPrevLevel(difT, force);
					return false;
				}	
				break;
		}
		return false;
	}
	var controlScroll = {};
	
	function toPrevLevel(difT, force) {
		var divPage = infoLevels[curLevel].div;
		var params = {
			dir: 'x',
			start1: null, end1: 0, 
			start2: null, fOverPage: true, 
			size: divPage.oWidth(), 
			cancel2ToStart: false
		}
		var control = {
			end : function(fEnd) {
				if (fEnd) {
					// activate item sel
					divPage.remove();
					infoLevels[curLevel] = null;
					curLevel = prevLevel();
					//divPrevLevels.css("left", "0px");
					divPage = divPrevLevels.children().eq(0);
					infoLevels[curLevel].divSelect.removeClass(cssCl+"itemSel");
					infoLevels[curLevel].divSelect = null;
					divPage.prependTo(div0);
					repositionDivs(divPrevLevels);
					repositionDivs(div0);
				}
			}
		}
		var ptp = pageToPage(divPrevLevels, touchH, divPage, null, control, params);
		ptp.start(difT, force);
	}
	
	var controlTouch = {
		start: function(target, curT) {
			if (transitionEndHandler()) return false;
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
		click: function(target) {
			if (deactivateClick()) {
				switch (typeTarget) {
					case "item":
						// select item
						var itemMaster = startTarget.clone(true);
						startTarget.addClass(cssCl+"itemSel");
						infoLevels[curLevel].divSelect = startTarget;
						itemMaster.addClass(cssCl+"itemMaster");
						var nextL = nextLevel();
						if (nextL == null) {
							var info = startTarget.data("info");
							controlMain.selProd(info.art, ord);
							return;
						}
						var posStart = startTarget.position();
						infoLevels[curLevel].div.prependTo(divPrevLevels);
						repositionDivs(divPrevLevels);
						curLevel = nextL;					
						var divPage = createPage(curLevel);
						infoLevels[curLevel] = { div: divPage, itemMaster: itemMaster };
						divPage.prependTo(div0);
						repositionDivs(div0);
						divPage.css({left: posStart.left+"px", top: posStart.top+"px"});
						divPrevLevels.css({left: "0px"});
						startTarget.css({opacity: "0"});
						drawLevel(curLevel);
						divPrevLevels.bind(transitionEndEventNames, transitionEndHandler);
						divPrevLevels.css("transition", "left 250ms ease-out");
						divPage.css("transition", "top 250ms ease-out");
						startTarget.css("transition", "opacity 250ms ease-in");
						transitionDivs = [divPrevLevels, divPage, startTarget];
						inTransition = true;
						divPrevLevels.css("left", divPage.oWidth()+"px");
						divPage.css("top", "0px");
						startTarget.css("opacity", "1");
						break;
					case "prevLevels":
						toPrevLevel(null, -1);
						break;
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

	var inTransition = false;
	var transitionDivs;
	function transitionEndHandler(ev) {
		if (!inTransition) return false;
		inTransition = false;
		divPrevLevels.unbind(transitionEndEventNames, transitionEndHandler);
		transitionDivs.forEach(function(div) { 
			div.css({transitionProperty: "none"}); // complete transition
		});
		return true;
	}
	
	var ord;
	my.getDiv = function() { return div0; }
	my.getTouch = function() { return touchH; }
	my.start = function(_ord) {
		ord = _ord;
		div0.show();
		reset();
	}

	my.stop = function() {
		touchH.reset();
		div0.hide();
	}
	
	return my;
}

});
