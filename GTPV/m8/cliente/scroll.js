H.Scripts.addLocalExec("ScrollS", "L2", function() {

window.newGScroll = function (params) {
	var my = {};
	var defaultParams = {
		contentCSS : {},
		contentClass : "g-widget-content",
		arrows : "l_r",
		getNItems : null,
		getItem : null,
		nElScroll : null,
		sizeGroupArrow : null, // calculado en redraw
		percDeltaIncArrow : 1,
		scrollInBlocks : true,
		pos : {},
		resizePriority : 200,
		removeEl : function() { $(this).remove(); }
	};
	var pm = $.extend({}, defaultParams, params);
	
	function clickArrow(e) {
		if (e.button !== 0) return;
		var delta = Math.floor(pm.percDeltaIncArrow*nElScroll);
		if (delta < 1) delta=1;
		my.redraw(pm.pos.vis+$(this).data("inc")*delta);
	}

	var div = $("<div>").css("overflow", "hidden");
	my.getDiv = function() { return div; }
	my.getEl = function(idx) { return contentDiv.children().eq(idx); }

	var horizontal = (pm.arrows.search(/[lr]/) !== -1); 
	var woh = horizontal ? "width" : "height";
	var how = horizontal ? "height" : "width";
	var blockType = horizontal ? "inline-block" : "block";
	
	var WOH = woh.charAt(0).toUpperCase()+woh.slice(1);
	var HOW = how.charAt(0).toUpperCase()+how.slice(1);

	var oWOH = "o"+WOH, iWOH = "i"+WOH;
	var oHOW = "o"+HOW, iHOW = "i"+HOW;
		
	var contentDiv = $("<div>").css(pm.contentCSS).addClass(pm.contentClass);
	contentDiv.css({display: blockType, boxSizing: "border-box", overflow: "hidden", verticalAlign: "text-top"});
	
	function createArrow(type) {
		var types = "urdl";
/*		return $("<svg viewBox='0 0 100 100'>"
		        +"   <polygon points='50 17.5, 12.5 82.5, 87.5 82.5' fill='"+pm.colorArrow+"' "
				+"            transform='translate(50 50) rotate("+(types.indexOf(type)*90)+") translate(-50 -50)' />"
		        +"</svg>");
*/		var dim = ((type == "u") || (type == "d")) ? "height" : "width"
		var d0 = $("<div>").css({display: "inline-block", verticalAlign: "middle", height: "100%"})
		var i = $("<image src='css/gtpv/img/arrow"+type.toUpperCase()+".GIF'/>")
		        		.css({ "maxWidth": "100%", "maxHeight": "100%", "verticalAlign": "middle"});
		return $("<div>")._100x100().css("textAlign", "center").append(d0).append(i);
	}
	
	function createGroupArr() {
		return $("<div>").css({display: "none", verticalAlign: "text-top"})
		                 .css((pm.sizeGroupArrow!=null) ? { woh: pm.sizeGroupArrow} : {}).css(how, "100%").appendTo(div);
	}
	
	var groupsArr = [], butArrow = [];
	var grArr = null, iBut = 0;
	pm.arrows.split("").forEach(function(typeArr) {
		if (typeArr === "_") {
			contentDiv.appendTo(div);
			grArr = null; 
		} else {	
			if (!grArr) {
				groupsArr.push(grArr = createGroupArr());
			}	
			var inc = (typeArr.search(/[lu]/) !== -1) ? -1 : 1;
			butArrow[iBut++] = gButton().css(woh, "100%").css(how, (pm.arrows.indexOf("_") === 1) ? "100%" : "50%")
										.css("padding", "0px").append(createArrow(typeArr))
										.css("position", "relative")
										.data("inc", inc).mousedown(clickArrow)
										.appendTo(grArr);
		}							   
	});
	Resize.add(function() { 
		resized = false;
		if (pm.resizePriority >= 0)
			my.redraw(); 
	}, pm.resizePriority);
	
	my.getPos = function() { return pm.pos; }
	my.setPos = function(pos) { pm.pos = pos; }
	
	var el_woh, el_how, n, nElScroll, n_gt_nElScroll;
	var el_cur_woh, el_cur_how; // element current sizes
	var recalc_el_w = true;
	var el_w, el_h;
	
	var W = window;
	
	my.getNElScroll = function() { return nElScroll; }
	
	var resized = false;
	my.redraw = function(vis, top) {
		if (vis != null) { pm.pos.vis = vis; }
		if (top != null) { pm.pos.top = top; }

		if (!div.isVisible()) return;

		n = pm.getNItems();	

		contentDiv.children().each(pm.removeEl); // contentDiv.empty();
		
		if (n_gt_nElScroll != (n>nElScroll)) resized = false;
		resize();

		if ((recalc_el_w) && (n>0)) {
/*			var el_cur_woh, el_cur_how; 
			var el = pm.getItem(0, 100, 100) // 100 dummy value, para calcularlo
			           .css(pm.itemCSS).addClass(pm.itemClass).appendTo(contentDiv);
			//el[woh]("100%"); // set margins ??
			el[oWOH](el_woh);
			//el[how]("100%"); // set margins ??
			el[oHOW](el_how);
			if (el.isBorderBox()) { // precalculado solo width o height
				el_cur_woh = el["outer"+WOH]();
				el_cur_how = el["outer"+HOW]();
			} else {
				el_cur_woh = el[woh]();
				el_cur_how = el[how]();
			}
*/			el_w = horizontal ? el_woh : el_how;
			el_h = horizontal ? el_how : el_woh;
//			el.remove();
			recalc_el_w = false;
		}

		if (pm.pos.vis == null) pm.pos.vis = 0;		
		if (pm.pos.vis >= n) pm.pos.vis = n-1;
		if (pm.pos.vis < 0) pm.pos.vis = 0;
		if (pm.scrollInBlocks) {
			pm.pos.top = pm.pos.vis - pm.pos.vis%nElScroll;
		} else {
			if ((pm.pos.top == null) || (pm.pos.top > pm.pos.vis))
				pm.pos.top = pm.pos.vis;
			else if (pm.pos.top+nElScroll <= pm.pos.vis)
				pm.pos.top = pm.pos.vis - (nElScroll-1);
		}

		for (var i=0, idxItem=pm.pos.top; (i<nElScroll) && (idxItem<n); i++, idxItem++) {
			var el = pm.getItem(idxItem, el_w, el_h).css("verticalAlign", "text-top").appendTo(contentDiv);
//			el[woh](el_cur_woh);
//			el[how](el_cur_how);
			el.width(el_w);
			el.height(el_h);
		}
		butArrow.forEach(function(but) {
			var disabled = ((but.data("inc") === -1) ? (pm.pos.top === 0) : (!(idxItem<n)));
			if (disabled) but.attr("disabled", "disabled");
			else but.removeAttr("disabled");
		});
	}

	my.setResize = function() { resized = false; }

	my.forceRedraw = function() {
		my.setResize();
		my.redraw.apply(this, arguments);
	}
	
	function resize() { // llamado de redraw
		if (resized) return;

		groupsArr.forEach(function(grArr) { grArr.hide(); });

		var div_woh = div[iWOH]();
		contentDiv[oWOH](div_woh);
		contentDiv[oHOW](div[iHOW]());
		var cont_woh = contentDiv[iWOH](); 
		var cont_how = contentDiv[iHOW]();
		
		var model = null;
		nElScroll = pm.nElScroll;
		if (nElScroll == null) { 
			model = pm.getItem(-1);
			model.appendTo(contentDiv);
			el_woh = model[oWOH]();
			model.remove();
			nElScroll = Math.floor(cont_woh/el_woh);
		} 

		var sizeGroupArrow;
		if (pm.sizeGroupArrow != null) { 
			sizeGroupArrow = pm.sizeGroupArrow;
		} else {	
			var butT = $("<button>").appendTo("body");
			$("<div>").css({ display: "inline-block" }).html("XX<br>XX").addClass("g-state-default").appendTo(butT);
			sizeGroupArrow = butT[oWOH]();
			butT.remove();
		}
		n_gt_nElScroll = (n>nElScroll); 
		if (n_gt_nElScroll) {
			var arrow_woh = 0;
			groupsArr.forEach(function(grArr) {
				grArr.css("display", blockType);
				grArr[oWOH](sizeGroupArrow);
				arrow_woh+=grArr[oWOH]();
			}); 
			if (div_woh/3 < arrow_woh) {
				sizeGroupArrow = Math.floor((div_woh/3)/groupsArr.length);
				arrow_woh = 0;
				groupsArr.forEach(function(grArr) {
					grArr[oWOH](sizeGroupArrow);
					arrow_woh+=grArr[oWOH]();
				}); 
			}
			cont_woh-=arrow_woh;
		}	
		if (model) {
			nElScroll = Math.floor(cont_woh/el_woh);
			if (nElScroll === 0) nElScroll=1; // evitar division por zero más abajo
		} 
		el_woh = Math.floor(cont_woh/nElScroll);
		cont_woh = nElScroll*el_woh;
		contentDiv[iWOH](cont_woh);
		el_how = cont_how;

		recalc_el_w = true;
		
		resized = true;
	}	
		
	return my;
}


}); // add Scripts scroll
