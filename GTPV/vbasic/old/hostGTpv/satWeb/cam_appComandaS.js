(function () {

window.cam_createAppComanda = function(main, controlMain) {
	var my = {};

	var cssCl = "cam_comanda_";
	if ($("#"+cssCl).length == 0) {
		var s = $("<style>").attr("type", "text/css").attr("id", cssCl);
		s.text(
			"."+cssCl+"ticketGr { \
			    border-top: 1px dashed black; \
				padding: 2px; \
			 } \
			 ."+cssCl+"ticketSepNoSel { \
				background: "+linearGradient("to bottom, hsl(300, 100%, 65%), hsl(0, 100%, 85%)")+"; \
			 } \
			 ."+cssCl+"ticketSel { \
				background: "+linearGradient("to bottom, hsl(0, 100%, 50%), hsl(0, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"ticketRecentMod { \
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
	//             terminalEl
	//          divAddProd[ord] : absolute
	//       divStatus
	
//	var Ords = [1,2,3];
	
	var div0 = createDivAbs()._100x100().css({backgroundColor: "white"});
	div0.css({width: "100%", height: "100%"});
	div0.appendTo(main.getDiv()); 
	var touchH = touchHandler(div0, null /* control assigned below */);
	
	// no height 100% para calcular height que falta al final para scrolls
	var divPage = createDiv().appendTo(div0); 
	
	var divTitle = createDivRel().appendTo(divPage);
	
	var divCont = {}, divScroll = {}, scroll = {}, terminalEl = {}, divAddProd = {};
	idOrds.forEach(function(ord) {
		divCont[ord] = createDivRel().appendTo(divPage);

		divScroll[ord] = createDivRel()
		    .appendTo(divCont[ord])
			.data("scroll", ord);

		scroll[ord] = scrollT(divScroll[ord], touchH, null, { dir: 'y' });	

		terminalEl[ord] = createDiv().css({borderBottom: "1px solid black"});

		divAddProd[ord] = createDivAbs()
			.css({width: "30%", height: "100%", top: "0px", right: "0px"})
			.css({border: "1px solid gray", backgroundColor: "hsla(120,100%,50%,0.3)"})
            .appendTo(divCont[ord])
			.data("addProd", ord);
		createVerticalAligner(
			createDiv().css({whiteSpace: "pre"}).text(displayOrds[ord]+" >"), true
		).appendTo(divAddProd[ord]);
	});
	
	var divStatus = createDivRel().appendTo(divPage);
	
	var statusButs = [
		{ name: "cocina", text: "Cocina", parts:3 },
		{ name: "+", text: "+", parts:1 },
		{ name: "-", text: "-", parts:1 },
		{ name: "borrar", text: "Borrar", parts:3 },
//		{ name: "cobrar", text: "cobrar", parts:3 },
		{ name: "separar", text: "Separar", parts:3 },
	];
	
	statusButs.forEach(function(b) {
		b.div = createDivRel(true).css({textAlign: "center", whiteSpace: "pre"}) 
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
					b.enabled = (divSelected != null);
					break;
				case "-":
				case "separar":
					if (divSelected) {
						var n = divSelected.data("n");
						b.enabled = (n>1);
					} else b.enabled = false;
					break;
/*				case "cobrar":
					b.enabled = (S.C.isOpen() && (S.C.getItems().length>0));
					break;
				case "separar":
					if (divSelected) {
						var n = divSelected.data("n");
						b.enabled = (n>1);
					} else b.enabled = false;
					break;
*/				case "cocina":
					b.enabled = S.C.isOpen();
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
	idOrds.forEach(function(ord) { if (partC1[ord] == null) partC1[ord]=1; });
	function resizeScrollContainer(partC) { // parts : height relative parts (no %)
		var partCs = 0;
		idOrds.forEach(function(ord) { partCs+=partC[ord]; });
		var hCs = div0.iHeight()-divPage.oHeight();
		idOrds.forEach(function(ord) {
			hCs+=divCont[ord].oHeight();
		});
		var heightPart = hCs/partCs;
		idOrds.forEach(function(ord, i)  {
			var h = (i < idOrds.length-1) ? Math.round(partC[ord]*heightPart) : hCs;
			hCs-=h;
			divCont[ord].oHeight(h);
		});
	}

	var opacityDiv = createDivAbs()
	                    .css({top:"0px", left:"0px",width:"100%",height:"100%"})
						.css({opacity:"0.3", background:"gray"});
	
	var toIdTapHold;
	var oldControlTouchTapHold;
	var divTapHold;
	var difTopTapHold;
	
	function tapHoldEventHandler() {
		toIdTapHold = null;
		deactivateClick();
		if (typeTarget == "ticketGr") {
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
	
	function endTapHold() {
		if (toIdTapHold == null) {
			clearTimeout(toIdTapHold);
			toIdTapHold = null;
		}
		if (divTapHold) {
			touchH.setControl(oldControlTouchTapHold);
			startTarget.css("visibility", "visible");
			divTapHold.remove();
			divTapHold = null;
		}	
	}
	
	var touchControlTapHold = {
		move: function(dir, difT, curP) {
			divTapHold.css("top", curP.y-difTopTapHold+"px");
			return false;
		},
		end: function() {
			var curY = touchH.getCurPoint().y;
			endTapHold();
			var ordSrc = startTarget.data("ord"); 
			var fNoHost = startTarget.data("fNoHost");
			var ACSrc = agruparComanda(optAgruparComanda[ordSrc], 
							           fNoHost ? S.C_NoHost : S.C_Host);

			for (var i=0; i<idOrds.length; i++) {
				var ordDst = idOrds[i];
				if (ordDst == ordSrc) continue;
				var yMin = divCont[ordDst].offset().top;
				var yMax = yMin+divCont[ordDst].oHeight();
				if ((yMin <= curY) && (curY < yMax)) {
					var gr = startTarget.data("ticketGr");
					var idItem;
					var ACDst = agruparComanda(optAgruparComanda[ordDst], 
									           fNoHost ? S.C_NoHost : S.C_Host);
					ACSrc.getItemsFromGr(gr).forEach(function(itemSrc) {
						var itemDst = $.extend({}, itemSrc, {ord: ordDst} );
						idItem = ACDst.append(itemDst);
					});
					ACSrc.increment(gr, -gr.n); // borrar
//					S.T.recentIns = idItem;
					S.itemSelected = {id: idItem, sep: 0};
					drawComanda(true, true, true);
					return;
				}
			}
		}
	}
	
	function activateClick() {
		var clickableTypeTargets = ["addProd", "ticketGr", "title", "status"];
		if (clickableTypeTargets.indexOf(typeTarget) == -1) return null; 
		var tapHoldTypeTargets = ["ticketGr"];
		if (tapHoldTypeTargets.indexOf(typeTarget) >= 0) {
			if (toIdTapHold == null)
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
		else opacityDiv.detach();
		return true;
	}

	function findStartTarget(target) {
		var info = function() {
			// divAddProd
			for (var i=0; i<idOrds.length; i++) {
				var ord = idOrds[i];
				var par = getDOMParents(target, divAddProd[ord]);
				if (par == null) continue;
				return [divAddProd[ord], "addProd", ord];
			}
			// divTitle
			var par = getDOMParents(target, divTitle);
			if (par != null) return [divTitle, "title"];
			// divCont
			for (var i=0; i<idOrds.length; i++) {
				var ord = idOrds[i];
				var par = getDOMParents(target, divCont[ord]);
				if (par == null) continue;
				// divCont, divScroll, divGr
				var divGr = $(par[2]);
				if (divGr.data("ticketGr")) return [divGr, "ticketGr", ord];
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
			case "title":
				if ((dir == 'y') && ((difT > 0) || (force > 0))) { 
					controlMain.toComedor(difT, force);
				}
				break;	
			case "addProd":
			case "ticketGr":
				var ord = moreInfoTarget;
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
						controlMain.toAddProd(S.stateAddProd, S.C_NoHost, ord);
						break;
					case "title":
						controlMain.toComedor(null, 1);
						break;
					case "ticketGr":
						selectItem(startTarget);
						if ((S.itemSelected.sep == 0) && (S.itemSeparar.id != null)) {
							S.itemSeparar = {};	
							drawComanda(true, true, false);
						}	
						break;
					case "status":
						var but = moreInfoTarget;
						if (but.name == "cocina") {
							S.C_Host.toC(S.C);
							S.C_NoHost.toC(S.C);
							drawComanda(false, false, false);
							controlMain.toComedor();
						} else {
							if (divSelected) {
//								var ord = divSelected.data("ord"); 
								var gr = divSelected.data("ticketGr");
								var fNoHost = divSelected.data("fNoHost");
								var sep = divSelected.data("sep");
								var n = divSelected.data("n");
								if (but.name == "separar") {
									if (sep == 0) S.itemSeparar = {id: gr, n2: 1};
									else if (sep == 1) S.itemSeparar.n2++;	
									else S.itemSeparar.n2--;
									drawComanda(true, true, false);
								} else {
									var inc = 0;
									switch(but.name) {
										case "-":
											if (n>1) inc = -1;
											break;
										case "+":
											inc = 1;
											break;
										case "borrar":
											inc = -n;
											break;
									}
									if (inc != 0) {
										ACSel.increment(gr, inc);
										if (sep == 2) S.itemSeparar.n2+=inc;
									}	
									drawComanda(true, false, false);
								}	
							}	
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

	function createElemComanda(gr, ord, fNoHost, sep, n2) {
		var div = createDivRel().addClass(cssCl+"ticketGr");
		div.css({textAlign: "left", whiteSpace: "pre"});
		var el = gr.el;
		var art = Articles.getByCodi(el.codi);
		var nom = (art && art.nom) ? art.nom : "";
		var n = el.n;
		if (sep == 1) n-=n2;
		else if (sep == 2) n=n2;
		div.text(n+" "+nom);
		div.data("ticketGr", gr);
		div.data("ord", ord);
		div.data("fNoHost", fNoHost);
		div.data("sep", sep);
		div.data("n", n);
		return div;
	}
	
	function drawSelectItem(div, fActive) {
		div[fActive?"addClass":"removeClass"](cssCl+"ticketSel");
	}

	function drawSepNoSelItem(div, fActive) {
		div[fActive?"addClass":"removeClass"](cssCl+"ticketSepNoSel");
	}
	
	function selectItem(divItem) {
		if (divSelected) drawSelectItem(divSelected, false);
		if (divSepNoSel) drawSepNoSelItem(divSepNoSel, false);

		S.itemSelected = {id: divItem.data("ticketGr"), sep: divItem.data("sep")};
		divSelected = divItem;
		divSepNoSel = null;
		if (S.itemSelected.sep == 1) divSepNoSel = divItem.next();
		else if (S.itemSelected.sep == 2) divSepNoSel = divItem.prev();
		drawSelectItem(divSelected, true);
		if (divSepNoSel) drawSepNoSelItem(divSepNoSel, true);
		drawStatusButs();
	}

	function changeComanda(C, autoChange) {
		if (autoChange) return;
		if (C === S.C) {
			if (div0.isVisible())
				drawComanda(true, false, false);
		}	
	}
	
	function checkComanda() {
		if ((S.nCTS != S.C.getNChangeTs()) || (!S.C.isOpen())) {
			S.itemSelected = {};
			S.itemSeparar = {};
			S.nCTS = S.C.getNChangeTs();
//			initScrolls();
			S.C_Host.clear();
			S.C_NoHost.clear();
			return false;
		}
		return true;
	}

	var ACSel;

	function drawAC(AC, ord, fNoHost, found) {
		var grSelected, grSeparar;
		if (!found.sel) grSelected = AC.getGr(S.itemSelected.id);
		if (!found.sep) grSeparar = AC.getGr(S.itemSeparar.id);
		// checkSep
		if (grSeparar) {
			if (grSeparar.n < 2) {
				S.itemSeparar = {};
				grSeparar = null;
			} else {
				if (grSeparar.n-1 < S.itemSeparar.n2) S.itemSeparar.n2 = grSeparar.n-1;
			}
		}
		if (grSelected) {
			if (grSelected != grSeparar) S.itemSelected.sep = 0;
			else if (S.itemSelected.sep == 0) S.itemSelected.sep = 1;
		}	

		AC.getGrs().forEach(function(gr) {
			var seps = [0];
			if (grSeparar == gr) {
				seps = [1,2];
				found.sep = true;
			}
			seps.forEach(function (sep) {
				var div = createElemComanda(gr, ord, fNoHost, sep, S.itemSeparar.n2); 
				div.appendTo(divScroll[ord]);
				if (grSelected == gr) { 
					if (S.itemSelected.sep == sep) { 
						found.sel = true;
						ACSel = AC;
						divSelected = div;
						drawSelectItem(divSelected, true);
					} else {
						divSepNoSel = div;
						drawSepNoSelItem(divSepNoSel, true);
					}
				}	
			
			});
			if (found.sel) grSelected = null;
			if (found.sep) grSeparar = null;
		});
	}
	
	// S.itemSelected { id, sep } 
	function drawComanda(fTrans, fScrollToSel, fScrollToTerm) {
		if (!checkComanda()) fPos = true;
		
		ACSel = null;
		divSelected = null;
		divSepNoSel = null;
		if (S.C.isOpen()) {
			idOrds.forEach(function(ord) {
				divScroll[ord].empty();
				if (!fTrans) divScroll[ord].css("top", "0px");
				var found = {};
				S.C_Host.reload();
				var AC = agruparComanda(optAgruparComanda[ord], S.C_Host);
//				var items = S.AC[ord].getItems();
				drawAC(AC, ord, false, found);
				S.C_NoHost.reload();
				var AC = agruparComanda(optAgruparComanda[ord], S.C_NoHost);
				drawAC(AC, ord, true, found);

				// mantener terminalEl visible para evitar repaint de todo el body
				terminalEl[ord].appendTo(divScroll[ord]);
				var args = [fTrans];
				if (fScrollToSel && found.sel) {
					var sep = divSelected.data("sep");
					if (sep == 0) args.push(divSelected);
					else if (sep == 1) { args = args.concat([divSelected, divSelected.next()]); }
					else { args = args.concat([divSelected.prev(), divSelected]); }
				} else if (fScrollToTerm) {
					args.push(terminalEl[ord]);
				}
				scroll[ord].scrollToVisible.apply(null, args);
			});
		} else {
			idOrds.forEach(function(ord) {
				divScroll[ord].empty();
				// mantener terminalTicketElement visible para evitar repaint de todo el body
				terminalEl[ord].appendTo(divScroll[ord]);
				divScroll[ord].css("top", "0px");
			});
		}
/*		if (divSelected != null) 
			drawSelectItem(divSelected, true);
		else S.T.idItemSelected = null;
*/		drawStatusButs();
	}	

	function drawScreen() {
		div0.show();
		resizeStatusButs();
		resizeScrollContainer(partC1);
/*		idOrds.forEach(function(ord) {
			divScroll[ord].css("top", S.topScroll[ord]);
		});
*/	}

/*	function initScrolls() {
		idOrds.forEach(function(ord) {
			divScroll[ord].css("top", "0px");
		});
	}
*/	
	var optAgruparComanda = {};
	idOrds.forEach(function(ord) {
		optAgruparComanda[ord] = {
			filter: function(item) {
				return item.ord == ord;
			},
			group: function(gr_items, item) {
				if (gr_items[0].n == 0) return -1; // para posicionar mas abajo del que se ha borrado
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

	function createC(C, prefId) {
		var myC = {};
		var nextId = 1;
		var itemsApp = [];
		var incOrds = [];
		var curItems;
		
		myC.getId = function() { return C ? C.getId() : null; } // ??

		myC.reload = function() {
			curItems = [];
			if (C) $.extend(curItems, C.getItems());
			incOrds.forEach(function(ord) {
				for (var i=0; i<curItems.length; i++) {
					if (curItems[i].id == ord.id) {
						if (curItems[i].n + ord.inc < 0) ord.inc = -curItems[i].n;
						curItems[i].n += ord.inc;
					}
				}
			});
			curItems = curItems.concat(itemsApp);
			return curItems;
		}

		myC.reload();
		
		myC.getItems = function() {
			return curItems;
		}
		
		myC.clear = function() {
			itemsApp = [];
			incOrds = [];
		}
		
		myC.append = function(item) {
			var id = prefId+(nextId++);
			itemsApp.push($.extend({}, item, {id:id}));
			myC.reload();
			return id;
		}
		
		myC.increment = function(idItem, inc) {
			if (typeof idItem == "object") idItem = idItem.id;
			if (typeof idItem == "string") {
				for (var i=0; i<itemsApp.length; i++) {
					if (itemsApp[i].id == idItem) {
						itemsApp[i].n+=inc;
						if (itemsApp[i].n<0) itemsApp.splice(i,1);
					}
				}
			} else incOrds.push({id: idItem, inc: inc});
			myC.reload();
			return true;
		}

		function _getPosItem(idItem) {
			for (var i=0; i<curItems.length; i++) {
				if (curItems[i].id == idItem) return i;
			}
			return -1;
		}
		myC.getItem = function(idItem) {
			var pos = _getPosItem(idItem);
			if (pos != -1) return curItems[pos];
			return null;
		}
		myC.getPosItem = function(idItem) {
			var pos;
			if (C) {
				pos = C.getPosItem(idItem);
				if (pos != -1) return pos;
			}
			return _getPosItem(idItem);
		}

		myC.toC = function(C) {
			incOrds.forEach(function(ord) {
				C.increment(ord.id, ord.inc);
			});
			itemsApp.forEach(function(item) {
				delete item.id;
				C.append(item);
			});
			myC.clear();
		}
		
		return myC;
	}
	
	Resize.add(function() {
		if (div0.isVisible()) {
			drawScreen();
			drawComanda(true, false, false);
		}	
	});
	
	var mesa;
	var idC;
	var stateComandes = {};
	var S;
	var divSelected, divSepNoSel;
	var idItemRecentMod;
	
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
			S.C_Host = createC(S.C, "H");
			S.C_NoHost = createC(null, "N");
			S.itemSelected = {};
			S.itemSeparar = {};
			S.stateAddProd = {};
//			S.itemsComandaNotSend = [];
/*			idOrds.forEach(function(ord) {
				// agrupadors de comanda Not Send ??		
			});
*/		} else S = stateComandes[idC];	
		
		divTitle.text("Mesa: "+mesa);

		var infoAbrir = { codiDep: 100/*mp.getCodiDepActual()*/ };
		if (supervCom.disconnected() > 10*60*1000) S.C.temporal_o_abrir(infoAbrir);
		else if (!S.C.isOpen()) S.C.temporal_o_abrir(infoAbrir);

//		initScrolls();
		drawScreen();
		drawComanda(false, true, true);
	}
	
/*	my.addProd = function(art, ord) {
		var item = { 
			n: 1,
			codi: art.codi,
			preu: art.preu,
			esS:  art.esSumable,
			// dep: codi.dep,
			ord: ord
		}
		var idItem = S.AC[ord].append(item);
		S.T.idItemSelected = idItem;
		drawScreen();
		drawComanda(idItem);
	}
*/
	
	my.endAddProd = function(fChangeItems) {
		drawScreen();
		if (!fChangeItems) {
			drawComanda(false, false, false);
			return;
		}	
		S.itemSelected = {};
		S.itemSeparar = {};
		var items = S.C_NoHost.getItems();
		if (items.length > 0) // ?? if fChangeItems
			S.itemSelected = {id: items[items.length-1].id, sep: 0};
		drawComanda(false, true, false);
	}
	
/*	function saveScrolls() {
		idOrds.forEach(function(ord) {
			S.topScroll[ord] = divScroll[ord].css("top");
		});
	}
*/	
	my.getDiv = function() { return div0; }
	my.getTouch = function() { return touchH; }
	my.start = function() {
		// initScroll();
		drawScreen();
		drawComanda(false, true, true);
	}

	my.stop = function() {
		touchH.reset();
		div0.hide();
	}
	
	return my;
}

})(window);
