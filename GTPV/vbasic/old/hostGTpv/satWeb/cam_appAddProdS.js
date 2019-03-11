(function () {

window.cam_createAppAddProd = function(main, controlMain) {
	var my = {};
	
	var cssCl = "cam_addProd_";
	if ($("#css_"+cssCl).length == 0) {
		var s = $("<style>").attr("type", "text/css").attr("id", "css_"+cssCl);
		s.text(
			"."+cssCl+"but { \
				padding: 5px; \
				background: "+linearGradient("to bottom, hsl(240, 100%, 50%), hsl(240, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"butOrd { \
				padding: 5px; \
				border: 1px solid green; \
				background: "+linearGradient("to bottom, hsl(120, 100%, 50%), hsl(240, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"butSel { \
				background: "+linearGradient("to bottom, hsl(0, 100%, 50%), hsl(0, 100%, 75%)")+"; \
			 } \
			 ."+cssCl+"ticketItem { \
			    font-size: 50%; \
			    border-top: 1px dashed black; \
				padding: 2px; \
			 } \
			 ."+cssCl+"ticketRecentIns { \
				background: "+linearGradient("to bottom, hsl(16, 100%, 50%), hsl(16, 100%, 75%)")+"; \
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
				redraw();
				//reset();
				//if (!checkStateValid()) reset();
				//redraw(); // control scrolls
			}, 0);
		}
	}
	
	Articles.addChangeHandler(changeDataHandler); 
	Teclats.addChangeHandler(changeDataHandler); 
	DosNivells.addChangeHandler(changeDataHandler);
	
	var DosNivellsDefault;
	
	// div0
	//    divComandaOrd
	//       divComandaCont
	//          divComanda (scr)
	//       divOrdsCont
	//          divOrd
	//    divAllSelectors (rel)
	//       divDosNivellsCont
	//          divDosNivells (scr)
	//       divAmbientsTeclat
	//          divAmbientsCont
	//             divAmbients (scr)
	//          divTeclatCont
	//             divTeclat 
	//                divRowTeclat (scr)
	//                   divBut
	var div0 = createDivAbs()._100x100().css({backgroundColor: "white"});
	div0.appendTo(main.getDiv()).hide(); // getDiv
	
	var divComandaOrd = createDiv();
	divComandaOrd.appendTo(div0);

	var divComandaCont = createDivRel().css({display: "inline-block", verticalAlign: "top"});
	divComandaCont.css({border: "2px solid black", height: "100%"});
	divComandaCont.appendTo(divComandaOrd);
	var divComanda = createDivRel().appendTo(divComandaCont);
	
	var divOrdsCont = createDivRel(true).css({height: "100%"}).appendTo(divComandaOrd);
	var divOrd = {};
	idOrds.forEach(function(ord) {
		divOrd[ord] = createDivRel(true)
						.css({height: "100%"}).addClass(cssCl+"butOrd")
		                .data("ord", ord).appendTo(divOrdsCont);
		createVerticalAligner(
			createDiv().text(displayOrds[ord]), true
		).appendTo(divOrd[ord]);
	});
	
	var divAllSelectors =   createDivRel()
	                            .appendTo(div0);
	var divDosNivellsCont = createDivAbs()
	                            .css({top: "0px", width: "100%"})
	                            .css({border: "3px solid black"})
								.appendTo(divAllSelectors);
	var divDosNivells =     createDivRel()
	                            .appendTo(divDosNivellsCont);
	var divAmbientsTeclat = createDivAbs()
	                            .css({top: "0px", width: "100%", height: "100%"})
								.appendTo(divAllSelectors);
	var divAmbientsCont =   createDivRel()
	                            .css({border: "3px solid black"})
								.appendTo(divAmbientsTeclat);
	var divAmbients =       createDivRel()
	                            .appendTo(divAmbientsCont);
	var divTeclatCont =     createDivRel()
	                            .appendTo(divAmbientsTeclat);
	var divTeclat =         createDivRel()
	                            .appendTo(divTeclatCont);
	
	var nButsPerLineDosNivells = 3;
	var nButsPerLineAmbients = 3;
	var nButsPerLineTeclat = 3;
	
	var butModel = createDivRel(true).css({whiteSpace: "nowrap", textAlign: "center"})
	                                 .addClass(cssCl+"but");
	function createBut(text) {
		var but = butModel.clone();
		but.text(text);
		return but;			  
	}
	
	function redraw() {
		divComanda.empty();
		for (var i=0; i<3; i++) { createElemComanda().appendTo(divComanda); }
		var H = divComanda.oHeight();
		divComandaOrd.iHeight(H);
		idOrds.forEach(function(ord) {
			divOrd[ord].oWidth(H); // cuadrado
		});
		divComandaCont.oWidth(div0.iWidth()-divOrdsCont.oWidth());
		divAllSelectors.oHeight(div0.iHeight()-divComandaOrd.oHeight());
	
		drawComanda();
		// DosNivells
		var dosN = DosNivells.getRef();
		if (dosN.length > 0) {
			if (dosN.indexOf(S.infoDosNivells.itemSel) == -1) 
				S.infoDosNivells.itemSel = DosNivellsDefault;
			if (dosN.indexOf(S.infoDosNivells.itemSel) == -1)
				S.infoDosNivells.itemSel = null;
			DosNivellsDefault = S.infoDosNivells.itemSel;	
		} else S.infoDosNivells.itemSel = null;
		if ((dosN.length > 0) && (S.infoDosNivells.itemSel == null)) {
			divAmbientsTeclat.hide();
			drawDosNivells();
		} else {
			divDosNivellsCont.hide();
			drawAmbientsTeclat();
		}
	}

	var terminalEl = createDiv().css({borderBottom: "1px solid black"});

	function drawDosNivells() {
		divDosNivellsCont.show();
		divDosNivells.empty();
		S.infoDosNivells.divSel = null;
		var dosN = DosNivells.getRef();
		var w = Math.floor(divDosNivellsCont.iWidth()/nButsPerLineDosNivells);
		dosN.forEach(function(el) {
			var div = createBut(el.texte).oWidth(w);
			div.data("info", el);
			div.appendTo(divDosNivells);
			if (el == S.infoDosNivells.itemSel) S.infoDosNivells.divSel = div;
		});
		if (S.infoDosNivells.divSel) S.infoDosNivells.divSel.addClass(cssCl+"butSel");
	}

	var opacityDivAmbientsTeclat = createDivAbs()
	                    .css({top:"0px", left:"0px",width:"100%",height:"100%"})
						.css({opacity:"0.5", background:"gray"});

	function drawAmbientsTeclat() {
		divAmbientsTeclat.show();
		opacityDivAmbientsTeclat.detach();
		
		divTeclatCont.oHeight(divAmbientsTeclat.iHeight()-divAmbientsCont.oHeight());

		divAmbients.empty();
		S.infoAmbients.divSel = null;

		// ambients
		var ambients = Teclats.getAmbients();
		var lenTag = 0;
		if (S.infoDosNivells.itemSel) {
			var tag = S.infoDosNivells.itemSel.tag;
			lenTag = tag.length;
			ambients = ambients.filter(function (el) {
				return el.substr(0, lenTag) == tag;
			});
		}
		var w = Math.floor(divAmbientsCont.iWidth()/nButsPerLineAmbients);
		var totalW = 0;
		ambients.forEach(function(el) {
			var div = createBut(el.substr(lenTag)).oWidth(w);
			totalW+=w;
			div.data("info", el);
			div.appendTo(divAmbients);
			if (el == S.infoAmbients.itemSel) S.infoAmbients.divSel = div;
		});
		divAmbients.iWidth(totalW);
		if (!S.infoAmbients.divSel) {
			S.infoAmbients.itemSel = ambients[0];
			if (S.infoAmbients.itemSel) S.infoAmbients.divSel = divAmbients.children().eq(0); 
		} // no else
		if (S.infoAmbients.divSel) S.infoAmbients.divSel.addClass(cssCl+"butSel");
		divAmbients.css("top", "0px");
		scrollAmbients.scrollToVisible(true, S.infoAmbients.divSel);
		// teclats
		drawTeclat();
	}

	function drawTeclat() {	
		divTeclat.empty();
		var divLineSel = null;

		var idx = 0;
		if (S.infoAmbients.itemSel) {
			var divLine, wCont, wBut, wRest;
			var teclats = Teclats.getAmbient(S.infoAmbients.itemSel);
			if (teclats != null) {
				teclats.buttons.forEach(function(but) {
					if (!divLine) {
						divLine = createDiv().appendTo(divTeclat);
						if (wCont == null) {
							wCont = divLine.iWidth();
							wBut = Math.floor(wCont/nButsPerLineTeclat);
						}
						wRest = wCont;
					}		
					if (but == null) return;
					var art = Articles.getByCodi(but.codi);
					if (art == null) return;
					if (art.nom == "") return;

					var div = createBut(art.nom).appendTo(divLine);
					var hsl = colorToHsl(but.color);
					if (hsl) div.css({background: linearGradient("to bottom, hsl("+hsl[0]+", 100%, 50%), hsl("+hsl[0]+", 100%, 75%)")});
					div.data("info", {but: but, art: art});
					if (!S.infoTeclat.divSel && (idx >= S.infoTeclat.itemSel)) {
						divLineSel = divLine;
					}	
					idx++;
					var fLastBut = (idx%nButsPerLineTeclat == 0); // idx++ prev
					div.css("width", (fLastBut ? wRest : wBut)+"px"); // no recalc layout
					if (fLastBut) divLine = null;
					else wRest -= wBut;
				});
			}
		} 
		if (!divLineSel) S.infoTeclat.itemSel = idx;
		divTeclat.css("pos", "0px");
		scrollTeclat.scrollToVisible(true, divLineSel);
	}

	var optAgruparComanda = {};
	idOrds.forEach(function(ord) {
		optAgruparComanda[ord] = {
			filter: function(item) {
				return item.ord == ord;
			},
			group: function(gr_items, item) {
				return -1;
			},
		};	
	});
	
	var idComandaSelected;
	var AC;
	
	function createElemComanda(item, ord) {
		var div = createDivRel().addClass(cssCl+"ticketItem");
		div.css({textAlign: "left", whiteSpace: "pre"});
		var n=1, nom="XXXX"; // para calcular sizes si item == null
		if (item) {
			var el = item.el;
			var art = Articles.getByCodi(el.codi);
			n = el.n;
			nom = (art && art.nom) ? art.nom : "";
			div.data("ticketItem", item);
//			div.data("ord", ord);
		} 	
		div.text(n+" "+nom);
		return div;
	}
	
	function drawComanda(fRecentIns) {
		var divComandaSelected = null;
		divComanda.empty();
		AC = agruparComanda(optAgruparComanda[S.ord], C);
		var grSelected = AC.getGr(idComandaSelected);
		AC.getGrs().forEach(function(gr) {
			var div = createElemComanda(gr).appendTo(divComanda);
			if (grSelected == gr) {
				divComandaSelected = div;
				if (fRecentIns) {
					div.addClass(cssCl+"ticketRecentIns");
					setTimeout(function (div) { 
						div.removeClass(cssCl+"ticketRecentIns"); }, 500, div);
				}
			}				
		});
		// mantener terminalEl visible para evitar repaint de todo el body
		terminalEl.appendTo(divComanda);
		idOrds.forEach(function(ord) {
			divOrd[ord].removeClass(cssCl+"butSel"); 
		});
		divOrd[S.ord].addClass(cssCl+"butSel");
		if (fRecentIns && divComandaSelected) 
			scrollComanda.scrollToVisible(true, divComandaSelected);
		else scrollComanda.scrollToVisible(false, terminalEl);
	}
	
	var clickActive = false;
	var startTarget;
	var typeTarget;
	var moreInfoTarget;
	
	var opacityDiv = createDivAbs()
	                    .css({top:"0px", left:"0px",width:"100%",height:"100%"})
						.css({opacity:"0.3", background:"gray"});

	function activateClick() {
		var clickableTypeTargets = ["ord", "dosNivells", "ambients", "teclat", "ambientsTeclatNoActive"];
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
				var idx, el; 
				idx = par.indexOf(divComandaCont[0]);
				if (idx != -1) return [divComandaCont, "comanda"];
				idx = par.indexOf(divOrdsCont[0]);
				if (idx != -1) {
					el = $(par[idx+1]);
					if (el.data("ord")) return [el, "ord", el.data("ord")];
					else return null;
				}			
				idx = par.indexOf(divDosNivellsCont[0]);
				if (idx != -1) {
					el = $(par[idx+2]);
					if (el.data("info")) return [el, "dosNivells", el.data("info")];
					else return [divDosNivellsCont, "dosNivellsCont"];
				}
				if (!divDosNivellsCont.isVisible()) { 
					idx = par.indexOf(divAmbientsCont[0]);
					if (idx != -1) {
						el = $(par[idx+2]);
						if (el.data("info")) return [el, "ambients", el.data("info")];
						else return [divAmbientsCont, "ambientsCont"];
					}
					idx = par.indexOf(divTeclatCont[0]);
					if (idx != -1) {
						el = $(par[idx+3]); // scroll, row, but
						if (el.data("info")) return [el, "teclat", el.data("info")];
						else return [divTeclatCont, "teclatCont"];
					}
				} else {
					idx = par.indexOf(divAllSelectors[0]);
					if (idx != -1) return [divAmbientsTeclat, "ambientsTeclatNoActive"];
				}
				return null;
			}	
		}();
		if (!info) info = [target, "other"];
		startTarget = info[0];
		typeTarget = info[1];
		moreInfoTarget = info[2];
	}
	
	function controlMoveSwipe(dir, difT, force) {
		deactivateClick();
		switch(typeTarget) {
			case "comanda":
			case "ord": 
			case "ambientsTeclat":
			case "teclat":
			case "teclatCont":
			case "ambientsTeclatNoActive":
			case "other":
				if ((dir == 'x') && ((difT > 0) || ( force > 0))) {
					controlMain.toComanda(difT, force, fChangeItems);
					return false;
				}	
		}
		switch(typeTarget) { 	
			case "comanda":
				if (dir == 'y') {
					scrollComanda.start(difT, force);
					return false;
				} 
				break;
			case "dosNivells":
			case "dosNivellsCont":
				if (dir == 'x') {
					scrollDosNivells.start(difT, force);
					return false;
				} 
				break;
			case "ambients":
			case "ambientsCont":
				if (dir == 'x') {
					scrollAmbients.start(difT, force);
					return false;
				} 
				if ((dir == 'y') && ((difT > 0) || (force > 0))) {
					var control = {
						end: function(fEnd) { 
							if (!fEnd) divDosNivellsCont.hide(); 
							else opacityDivAmbientsTeclat.appendTo(divAmbientsTeclat);
						}
					}
					drawDosNivells();
					var params = {
							 dir: 'y',
							 start1: 0, end1: 1, 
							 start2: 0, fOverPage: true, 
							 size: divDosNivellsCont.oHeight(), 
							 cancel2ToStart: false
					}
					var ptp = pageToPage(divAmbientsTeclat, touchH, 
										 divDosNivellsCont, null,
										 control, params);
					ptp.start(difT, force);					 
					return false;
				}
				break;
			case "teclat":
			case "teclatCont":
				if (dir == 'y') {
					scrollTeclat.start(difT, force);
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
		click: function(target) {
			if (deactivateClick()) {
				switch (typeTarget) {
					case "ord":
						var ord = moreInfoTarget;
						S.ord = ord;
						idComandaSelected = null;
//						AC = agruparComanda(optAgruparComanda[S.ord], itemsC);
						drawComanda();
						break;
					case "dosNivells":
					case "ambientsTeclatNoActive":	
						if (typeTarget == "dosNivells") {
							var info = startTarget.data("info");
							DosNivellsDefault = info;
							if (S.infoDosNivells.divSel) S.infoDosNivells.divSel.removeClass(cssCl+"butSel"); 
							S.infoDosNivells.itemSel = info;
							S.infoDosNivells.divSel = startTarget;
							S.infoDosNivells.divSel.addClass(cssCl+"butSel");
						}
						drawAmbientsTeclat();
						var control = {
							end: function(fEnd) { divDosNivellsCont.hide(); }
						}
						var params = {
								 dir: 'y',
								 start1: 1, end1: 0, 
								 start2: 0, fOverPage: true, 
								 size: divDosNivellsCont.oHeight(), 
								 cancel2ToStart: false
						}
						var ptp = pageToPage(divAmbientsTeclat, null, 
											 divDosNivellsCont, null,
											 control, params);
						ptp.start(null, -1);					 
						break;
					case "ambients":
						var info = startTarget.data("info");
						if (S.infoAmbients.divSel) S.infoAmbients.divSel.removeClass(cssCl+"butSel");
						S.infoAmbients.itemSel = info;
						S.infoAmbients.divSel = startTarget;
						S.infoAmbients.divSel.addClass(cssCl+"butSel");
						drawTeclat();
						break;
					case "teclat":
						var info = startTarget.data("info");
						S.infoTeclat.itemSel = info;
						var item = { 
							n: 1,
							codi: info.art.codi,
							preu: info.art.preu,
							esS:  info.art.esSumable,
							dep:  main.getCodiDep(),
							ord:  S.ord
						};
						idComandaSelected = AC.append(item);
						fChangeItems = true;
						drawComanda(true);
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

	var scrollComanda = scrollT(divComanda, touchH, null, { dir: 'y' });
	var scrollDosNivells = scrollT(divDosNivells, touchH, null, { dir:'x', fPages: true });
	var scrollAmbients = scrollT(divAmbients, touchH, null, { dir:'x', fPages: true });
	var scrollTeclat = scrollT(divTeclat, touchH, null, { dir:'y' });

	Resize.add(function() {
		if (div0.isVisible()) {
			redraw();
		}	
	});
	
	my.getDiv = function() { return div0; }
	my.getTouch = function() { return touchH; }

	var fChangeItems;
	var S, C;
	var AC;
	my.start = function(_S, _C, _ord) {
		S = _S;
		C = _C;
		fChangeItems = false;
		if (_ord != null) S.ord = _ord;
		if (!S.infoDosNivells) S.infoDosNivells = {};
		if (!S.infoAmbients) S.infoAmbients = {};
		if (!S.infoTeclat) S.infoTeclat = {};
		idComandaSelected = null;
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
