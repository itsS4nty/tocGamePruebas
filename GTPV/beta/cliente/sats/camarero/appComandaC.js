H.Scripts.add("sats/camarero/appComandaC", "C", function() {

window.createAppComanda = function(main, controlMain) {
	var my = {};

	var cssCl = "comandaC_";
	if ($("#"+cssCl).length == 0) {
		var s = $("<style>").attr("type", "text/css").attr("id", cssCl);
		s.text(
			"."+cssCl+"ticketItem { \
			    border-top: 1px dashed black; \
				padding: 2px; \
			 } \
			 ."+cssCl+"ticketItemSel { \
				background: "+linearGradient("to bottom, hsl(0, 100%, 50%), hsl(0, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"ticketItemRecentMod { \
				background: "+linearGradient("to bottom, hsl(16, 100%, 50%), hsl(16, 100%, 75%)")+"; /*orangered*/\
			 } \
			 ."+cssCl+"butStatus { \
				border: 2px outset red; \
				background: "+linearGradient("to bottom, hsl(0, 100%, 50%), hsl(0, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"butStatusPressed { \
				border-style: inset; \
				background: "+linearGradient("to bottom, hsl(0, 100%, 40%), hsl(0, 100%, 65%)")+"; \
			 } \
			"
		);
		s.appendTo("head");
	}
	
	// div0
	//    divPage : para calcular heights
	//       divTitle
	//       divCont[ord]
	//          divScroll[ord]
	//             divItem
	//             terminalItem
	//          divAddProd[ord] : absolute
	//       divStatus
	
	var Ords = [1,2,3];
	
	var div0 = createDivAbs()._100x100().css({backgroundColor: "white"});
	div0.css({width: "100%", height: "100%"});
	div0.appendTo(main.getDiv()); 
	var touchH = touchHandler(div0, null /* control assigned below */);
	
	// no height 100% para calcular height que falta al final para scrolls
	var divPage = createDiv().appendTo(div0); 
	
	var divTitle = createDiv().appendTo(divPage);
	
	var divCont = {}, divScroll = {}, scroll = {}, terminalItem = {}, divAddProd = {};
	Ords.forEach(function(ord) {
		divCont[ord] = createDivRel().appendTo(divPage);

		divScroll[ord] = createDivRel()
		    .appendTo(divCont[ord])
			.data("scroll", ord);

		var params = { dir: 'y' };
		scroll[ord] = scrollT(divScroll[ord], touchH, null, params);	

		terminalItem[ord] = createDiv().css({borderBottom: "1px solid black"});

		divAddProd[ord] = createDivAbs()
			.css({width: "30%", height: "100%", top: "0px", right: "0px"})
			.css({border: "1px solid gray", backgroundColor: "hsla(120,100%,50%,0.3)"})
			.css({textAlign: "center"})
            .appendTo(divCont[ord])
			.data("addProd", ord);
		//aligner	
		$("<img>").attr("src", "css/gtpv/img/dummy.png")
		    .css({verticalAlign: "middle", width: "0px", height: "100%"})
            .appendTo(divAddProd[ord]);			
		var textDiv = createDiv()
		    .css({display: "inline-block"})
			.css({verticalAlign: "middle", whiteSpace: "pre"})
			.text(ord+" >")
			.appendTo(divAddProd[ord]);
	});
	
	var divStatus = createDiv().appendTo(divPage);
	
	var statusButs = [
		{ name: "+", text: "+", parts:1 },
		{ name: "-", text: "-", parts:1 },
		{ name: "borrar", text: "borrar", parts:3 },
		{ name: "cobrar", text: "cobrar", parts:3 },
	];
	
	statusButs.forEach(function(b) {
		b.div = createDiv().css({display: "inline-block", vericalAlign: "top"})
		                   .css({textAlign: "center", whiteSpace: "pre"}) 
		                   .addClass(cssCl+"butStatus")
						   .appendTo(divStatus);
	});
	
	function resizeStatusButs() {
		var totalW = divStatus.iWidth();
		var totalPs = 0;
		statusButs.forEach(function(b) { totalPs+=b.parts; });
		var wp = totalW/totalPs;
		statusButs.forEach(function(b, i) {
			var w = (i < statusButs.length-1) ? Math.round(b.parts*wp) : totalW;
			totalW-=w;
			b.div.oWidth(w);
			b.div.text(M(b.text));
		});
	}
	
	function drawStatusButs() {
		statusButs.forEach(function(b) { 
			switch(b.name) {
				case "+":
				case "borrar":
					b.enabled = (S.T.divSelected != null);
					break;
				case "-":
					if (S.T.divSelected) {
						b.enabled = true;
						var item = S.T.divSelected.data("ticketItem");
						if (item.n<=1) {
							for (var i=0; i<statusButs.length; i++) {
								var b = statusButs[i];
								if (b.name == "-") {
									b.enabled = false;
									break;
								}	
							}
						}
					} else b.enabled = false;
					break;
				case "cobrar":
					b.enabled = (S.C.isOpen() && (S.C.getItems().length>0));
					break;
			}		
		});
		statusButs.forEach(function(b) {
			b.div.css("opacity", b.enabled?"1":"0.3");
		});
	}
	
	divCont[1].css({borderBottom: "1px solid black"});
	divCont[2].css({borderBottom: "1px solid black"});
	
	divTitle.css({whiteSpace: "pre", textAlign: "center"}).text("Mesa:");
	
	div0.hide();
	
	var clickActive = false;
	var startTarget;
	var typeTarget;
	var moreInfoTarget;
	
	var partC1 = { 1: 3, 2: 3, 3: 2 };
	function resizeScrollContainer(partC) { // parts : height relative parts (no %)
		var partCs = 0;
		Ords.forEach(function(ord) { partCs+=partC[ord]; });
		var hCs = div0.iHeight()-divPage.oHeight();
		Ords.forEach(function(ord) {
			hCs+=divCont[ord].oHeight();
		});
		var heightPart = hCs/partCs;
		Ords.forEach(function(ord, i)  {
			var h = (i < Ords.length-1) ? Math.round(partC[ord]*heightPart) : hCs;
			hCs-=h;
			divCont[ord].oHeight(h);
		});
	}

	var opacityDiv = createDivAbs().css({top:"0px", left:"0px",width:"100%",height:"100%"});
	
	var toIdTapHold;
	var oldControlTouchTapHold;
	var divTapHold;
	var difTopTapHold;
	
	function tapHoldEventHandler() {
		deactivateClick();
		if (typeTarget == "ticketItem") {
			oldControlTouchTapHold = touchH.setControl(touchControlTapHold);
			selectItem(startTarget);
			divTapHold = startTarget.clone(false).oWidth(divPage.iWidth())
			            .css({position: "absolute", fontSize: "150%", left: "0px", zIndex: "9999" });
			startTarget.css("visibility", "hidden");
			divTapHold.appendTo(divPage);
			var curY = touchH.getCurPoint().y;
			difTopTapHold = divPage.offset().top+Math.round(divTapHold.oHeight()/2);
			divTapHold.css("top", curY-difTopTapHold+"px");
		}
	}
	
	var touchControlTapHold = {
		move: function(dir, difT, curP) {
			divTapHold.css("top", curP.y-difTopTapHold+"px");
			return false;
		},
		end: function() {
			var curY = touchH.getCurPoint().y;
			touchH.setControl(oldControlTouchTapHold);
			startTarget.css("visibility", "visible");
			divTapHold.remove();
			var ordSrc = startTarget.data("ord"); 
			
			for (var i=0; i<Ords.length; i++) {
				var ordDst = Ords[i];
				if (ordDst == ordSrc) continue;
				var yMin = divCont[ordDst].offset().top;
				var yMax = yMin+divCont[ordDst].oHeight();
				if ((yMin <= curY) && (curY < yMax)) {
					var gr = startTarget.data("ticketItem");
					var idItem;
					S.AC[ordSrc].getItemsFromGr(gr).forEach(function(itemSrc) {
						var itemDst = $.extend({}, itemSrc);
						S.C.increment(itemSrc, -itemSrc.n); // borrar;
						itemDst.ord = ordDst;
						idItem = S.AC[ordDst].append(itemDst);
					});
					S.T.recentIns = idItem;
					S.T.idItemSelected = idItem;
					drawComanda();
					return;
				}
			}
		}
	}
	
	function activateClick() {
		var clickableTypeTargets = ["addProd", "ticketItem", "title", "status"];
		if (clickableTypeTargets.indexOf(typeTarget) == -1) return null; 
		var tapHoldTypeTargets = ["ticketItem"];
		if (tapHoldTypeTargets.indexOf(typeTarget) >= 0) {
			toIdTapHold = setTimeout(tapHoldEventHandler, 1000);	
		}
		if (typeTarget == "status") startTarget.addClass(cssCl+"butStatusPressed"); 
		else opacityDiv.appendTo(startTarget);
		clickActive = true;
		return startTarget;
	}
	
	function deactivateClick() {
		if (!clickActive) return false;
		clearTimeout(toIdTapHold); 
		toIdTapHold = null;
		clickActive = false;
		if (typeTarget == "status") startTarget.removeClass(cssCl+"butStatusPressed"); 
		else opacityDiv.remove();
		return true;
	}

	function findStartTarget(target) {
		var info = function() {
			// divAddProd
			for (var i=0; i<Ords.length; i++) {
				var ord = Ords[i];
				var par = getDOMParents(target, divAddProd[ord]);
				if (par == null) continue;
				return [divAddProd[ord], "addProd"];
			}
			// divTitle
			var par = getDOMParents(target, divTitle);
			if (par != null) return [divTitle, "title"];
			// divCont
			for (var i=0; i<Ords.length; i++) {
				var ord = Ords[i];
				var par = getDOMParents(target, divCont[ord]);
				if (par == null) continue;
				// divCont, divScroll, divItem
				var divItem = $(par[2]);
				if (divItem) {
					var item = divItem.data("ticketItem");
					if (item != null) return [divItem, "ticketItem", ord];
				}
				return [divCont[ord].children().eq(0), "scroll"];
			}
			// divStatus
			for (var i=0; i<statusButs.length; i++) {
				if (!statusButs[i].enabled) continue;
				var par = getDOMParents(target, statusButs[i].div);
				if (par != null) return [statusButs[i].div, "status", statusButs[i]];
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
			case "addProd":
				break;
			case "title":
				if ((dir == 'y') && 
					(((difT != null) && (difT > 0)) || ((force != null) && (force > 0)))) { 
						saveScrolls();
						controlMain.toComedor(difT, force);
					}
				break;	
			case "ticketItem":
				var ord = startTarget.parent().data("scroll");
				if (dir == 'y') {
					scroll[ord].start(difT, force);
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
		click: function(target) {
			if (deactivateClick()) {
				switch (typeTarget) {
					case "addProd":
						var ord = startTarget.data("addProd");
						saveScrolls(); //??
						controlMain.toAddProd(ord);
						break;
					case "title":
						controlMain.toComedor(null, 1);
						break;
					case "ticketItem":
						selectItem(startTarget);
						break;
					case "status":
						var but = moreInfoTarget;
						if (S.T.divSelected) {
							var ord = S.T.divSelected.data("ord"); 
							var item = S.T.divSelected.data("ticketItem")
							switch(but.name) {
								case "-":
									if (item.n>1) S.AC[ord].increment(item, -1);
									break;
								case "+":
									S.AC[ord].increment(item, 1);
									break;
								case "borrar":
									S.AC[ord].increment(item, -item.n);
									break;
								case "cobrar":
									S.C.cobrar(); // ????
									controlMain.toComedor();
									break;
							}
							drawComanda();
						}	
						break;		
				}
			}
		},
		leaveClick: function(outOfClick) {
			deactivateClick();
			return false;
		}
	};
	touchH.setControl(controlTouch);
	touchH.start();

	function drawElemTicket(item, ord, divCont) {
		var div = createDiv().addClass(cssCl+"ticketItem").appendTo(divCont);
		div.css({textAlign: "left", whiteSpace: "pre"});
		var el = item.el;
		var art = Articles.getByCodi(el.codi);
		var nom = (art && art.nom) ? art.nom : "";
		div.text(el.n+" "+nom);
		div.data("ticketItem", item);
		div.data("ord", ord);
		return div;
	}
	
	function drawSelectItem(div, fSelect) {
		div[fSelect?"addClass":"removeClass"](cssCl+"ticketItemSel");
	}
	
	function selectItem(divItem) {
		if (S.T.divSelected) {
			drawSelectItem(S.T.divSelected, false);
		}
		S.T.idItemSelected = divItem.data("ticketItem");
		S.T.divSelected = divItem;
		drawSelectItem(S.T.divSelected, true);
		drawStatusButs();
	}

	function changeComanda(C, autoChange) {
		if (autoChange) return;
		if (C === S.C) drawComanda();
	}
	
	function drawComanda() {
		if (S.nCTS != S.C.getNChangeTs()) {
			// init ticket, ticket Scroll, nueva comanda
			S.T = {};
			S.posScroll = {};
			Ords.forEach(function(ord) {
				S.posScroll[ord] = 0;
			});
			S.nCTS = S.C.getNChangeTs();
		}
		if (!div0.isVisible()) return;
		
		Ords.forEach(function(ord) {
			divScroll[ord].empty();
		});
		
		S.T.divSelected = null;
		if (S.C.isOpen()) {
			Ords.forEach(function(ord) {
				var items = S.AC[ord].getItems();
				var itemSelected = S.AC[ord].getItem(S.T.idItemSelected);
				var elSelected = null;
				var itemRecentIns = S.AC[ord].getItem(S.T.recentIns);
				var divRecentIns = null;
				items.forEach(function(item) {
					// draw el
					var divEl = drawElemTicket(item, ord, divScroll[ord]); 
					if (itemSelected == item) S.T.divSelected = divEl;
					if (itemRecentIns === item) {
						divRecentIns = divEl;
						divRecentIns.addClass(cssCl+"ticketItemRecentMod");
						window.setTimeout(function (div) { 
							div.removeClass(cssCl+"ticketItemRecentMod"); }, 500, divRecentIns);
					}				
				});
				// mantener terminalTicketElement visible para evitar repaint de todo el body
				terminalItem[ord].appendTo(divScroll[ord]);
				if (divRecentIns) {
					var p1 = divRecentIns.position().top;
					var p2 = p1+divRecentIns.oHeight(); 
					scroll[ord].scrollToVisible(p1,p2);
				} else scroll[ord].resize();
			});
		} else {
			Ords.forEach(function(ord) {
				// mantener terminalTicketElement visible para evitar repaint de todo el body
				terminalItem[ord].appendTo(divScroll[ord]);
				S.posScroll[ord] = 0;
				divScroll[ord].css("top", "0px");
			});
		}
		if (S.T.divSelected != null) 
			drawSelectItem(S.T.divSelected, true);
		else S.T.idItemSelected = null;
		drawStatusButs();
		S.T.recentIns = null; 
	}	

	function drawScreen() {
		div0.show();
		resizeStatusButs();
		resizeScrollContainer(partC1);
		Ords.forEach(function(ord) {
			divScroll[ord].css("top", S.posScroll[ord]+"px");
		});
	}
	
	var optAgruparComanda = {};
	[1,2,3].forEach(function(ord) {
		optAgruparComanda[ord] = {
			filter: function(item) {
				return item.ord == ord;
			},
			group: function(gr_items, item) {
				if (gr_items[0].n == 0) return -1;
				if (gr_items[0].codi === item.codi) return 1;
				else return -1;
			},
/*			// No incrementamos crear nuevo 
			canIncrement: function(gr_items, item) {
				if (gr_items[0].codi === item.codi) return true;
				else return false;
			},
*/		};	
	});

	var mesa;
	var idC;
	var stateComandes = {};
	var S;
	
	my.setMesa = function(_mesa) {
		mesa = _mesa;

		idC = Comandes.getId('M', mesa);
		if (!stateComandes.hasOwnProperty(idC)) {
			S = stateComandes[idC] = {};
			S.C = Comandes.get(idC, changeComanda, function(C, codError, o, c, resumeError) {
				console.log("error C: "+codError+" : "+o.cmd);
				c.orders.splice(c.orders.indexOf(o), 1);
				resumeError();
			}); // ???? ErrorHandler
			S.AC = {};
			S.T = {}; // ticket state
			S.posScroll = {};
			Ords.forEach(function(ord) {
				S.AC[ord] = agruparComanda(optAgruparComanda[ord], S.C);
				S.posScroll[ord] = 0;
			});
		} else S = stateComandes[idC];	
		divTitle.text("Mesa: "+mesa);

		var infoAbrir = { codiDep: 100/*mp.getCodiDepActual()*/ };
		if (supervCom.disconnected() > 10*60*1000) S.C.temporal_o_abrir(infoAbrir);
		else if (!S.C.isOpen()) S.C.temporal_o_abrir(infoAbrir);

		drawScreen();
		drawComanda();
	}
	
	my.addProd = function(art, ord) {
		var item = { 
			n: 1,
			codi: art.codi,
			preu: art.preu,
			esS:  art.esSumable,
			// dep: codi.dep,
			ord: ord
		}
		var idItem = S.AC[ord].append(item);
		S.T.recentIns = idItem;
		S.T.idItemSelected = idItem;
		drawScreen();
		drawComanda();
	}
	
	function saveScrolls() {
		Ords.forEach(function(ord) {
			S.posScroll[ord] = divScroll[ord].position().top;
		});
	}
	
	my.getDiv = function() { return div0; }
	my.getTouch = function() { return touchH; }
	my.start = function() {
		drawScreen();
		drawComanda();
	}

	my.stop = function() {
		touchH.reset();
		div0.hide();
	}
	
	return my;
}

});

