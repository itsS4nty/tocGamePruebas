function myScroll(arrows, nElementsScroll, elementModel, options) {
	var my = this;
	var opt = $.extend({},this.defaultOptions, options || {});
	if (arrows != null) opt.arrows = arrows;
	if (nElementsScroll != null) opt.nElementsScroll = nElementsScroll;
	if (elementModel != null) opt.elementModel = elementModel;
	if (opt.elementModel != null) {	opt.elementModel = $("<div>").append(opt.elementModel); }
	
	function clickArrow() {
		my.scrollTo(visibleElementScroll+($(this).data("inc"))*currentNumElementsScroll);
	}
	function label(t) {
		return opt.labels[t];
	}

	var div = $("<div>");
	this.getDiv = function() { return div; }
	
	var horiz = (opt.arrows.search(/[lr]/) != -1); 
	var lot = horiz ? "left" : "top";
	var size = horiz ? "width" : "height";
	var nsize = horiz ? "height" : "width";
	var blockType = horiz ? "inline-block" : "block";
	
	var arrowDiv = [], but = [];
	for (var i=0; i<=1; i++) {
		arrowDiv[i] = $("<div>").css({display: "none", verticalAlign : "middle"})
		                        .css(size, opt.sizeArrow).css(nsize, "100%").appendTo(div);
	}
	var contentDiv = $("<div>").css(opt.contentCSS).addClass(opt.contentClass);
	contentDiv.css({display: blockType, boxSizing: "border-box", overflow: "hidden", width: "100%", height: "100%"});
	contentDiv.insertAfter(arrowDiv[0]);
	
	var scrollContentDiv = $("<div>").css(nsize, "100%").css(size, "0%").css({position: "relative"}).appendTo(contentDiv);
	
	//buttons
	var bAD, nsizeButton, ptb, vAD;
	switch(opt.arrows.indexOf("_")) {
		case 0: bAD = [1,1]; nsizeButton =  "50%"; ptb = [1,2]; vAD = [false, true]; break;
		case 1: bAD = [0,1]; nsizeButton = "100%"; ptb = [0,2]; vAD = [true, true];  break;
		case 2: bAD = [0,0]; nsizeButton =  "50%"; ptb = [0,1]; vAD = [true, false]; break;
	}
	
	for (var i=0; i<=1; i++) {
		var t = opt.arrows.charAt(ptb[i]);
		var inc = t.search(/[lu]/) ? -1 : 1;
		but[i] = $("<button>").css(size, "100%").css(nsize, nsizeButton)
                              .text(label(t)).data("inc", inc)
                              .mousedown(clickArrow)
                              .appendTo(arrowDiv[bAD[i]]);
	}
	var resizeFunction = function() { if (div.get(0).offsetWidth > 0) my.redraw(); };
	$(window).resize(resizeFunction);


	var nElements = 0;
	var currentNumElementsScroll = 0;
	this.getNElements = function() { return nElements; }
	var visibleElementScroll = 0;
	var currentTopElementScroll = 0;
	var scrollInBlocks = true;
//	this.getCurrentScroll = function() { return currentScroll; }
	this.newElement = function() {
		var el = $("<div>").css(opt.elementCSS).addClass(opt.elementClass);
		el.css(nsize, "100%").css({display : blockType, boxSizing : "border-box"}).appendTo(scrollContentDiv);
		el.data("idx", this.nElements);
		nElements++;
/*		if ((nElements > opt.nElementsScroll) || isRedrawNeeded()) {
//			this.redraw();
		} else {		
//		scrollContentDiv.css(size, ((this.nElements/opt.nElementsScroll)*100+0.0001+"%"));
//		scrollContentDiv.children().css(size, (100/this.nElements)+0.0001+"%");
// 	     	var sizeEl = this.contentDiv[size]()/opt.nElementsScroll;
//			scrollContentDiv.css(size, sizeEl*this.nElements);
//			scrollContentDiv.children().css(size, sizeEl+"px");
		}
*/		return el;
	}
	this.redraw = function() {
		var divSize = div[size]();
		var sa=[],sc,sic,dispA,dsc,sizeEl;
		dsc = contentDiv["outer"+size.charAt(0).toUpperCase()+size.slice(1)](true) - contentDiv[size]();
		if (opt.elementModel != null) {
			opt.elementModel.appendTo(scrollContentDiv);
			sizeEl = opt.elementModel[size]();
			opt.elementModel.remove();
			sic = divSize-dsc;
			currentNumElementsScroll = Math.floor(sic/sizeEl);
		} else {
			currentNumElementsScroll = opt.nElementsScroll;
		}
		dispA = (nElements > currentNumElementsScroll) ? blockType : "none";
		for (var i=0; i<=1; i++) {
			sa[i]=0;
			if (vAD[i]) {
				arrowDiv[i].css({display: dispA});
				if (dispA != "none") sa[i] = arrowDiv[i]["outer"+size.charAt(0).toUpperCase()+size.slice(1)](true);
			} else arrowDiv[i].css({display: "none"});
		}
		sic = divSize-sa[0]-sa[1]-dsc;
		if (opt.elementModel != null) {
			currentNumElementsScroll = Math.floor(sic/sizeEl);
		}
		sic -= (sic % currentNumElementsScroll); 
		sc = sic+dsc;	
/*		this.contentDiv.css(size, (sc+0.5)/s*100+"%"); */
		contentDiv[size](sc); 

		var sizeEl = sic/currentNumElementsScroll;
		scrollContentDiv[size](sizeEl*nElements);
		scrollContentDiv.children()[size](sizeEl);
		
		this.scrollTo();
	}
/*	function setStateButtons ()  {
		for (var i=0; i<=1; i++) {
			var disabled;
			if (but[i].data("inc") == -1) {
				disabled = (currentTopElementScroll == 0);
			} else {
				disabled = (currentTopElementScroll+currentNumElementsScroll >= nElements);
			}
			if (disabled) but[i].attr("disabled", "disabled");
			else but[i].removeAttr("disabled");
		}
	}
*/	this.removeAll = function() {
		nElements = 0;
		scrollContentDiv.empty();
		visibleElementScroll = 0;
		currentTopElementScroll = 0;
		scrollInBlocks = true;
//		this.redraw();
	}
	this.get = function(idx) {
		if (idx >= nElements) return null;
		return $(scrollContentDiv.get(0).childNodes[idx]);
	}
	this.scrollTo = function(el, _scrollBlocks) {
		if (el == null) el = visibleElementScroll;
		if (_scrollBlocks != null) scrollInBlocs = _scrollBlocks;
		if (el >= nElements) el = nElements-1;
		if (el < 0) el = 0;
		visibleElementScroll = el;
		if (scrollInBlocks) el = el - (el%currentNumElementsScroll);
		/* scrollContentDiv.css(lot, -((el/opt.nElementsScroll)*100+0.0001)+"%"); */
		scrollContentDiv.css(lot, (-el*(contentDiv[size]()/currentNumElementsScroll))+"px");
		for (var i=0; i<=1; i++) {
			var disabled = ((but[i].data("inc") == -1) ? (el == 0) : (el+currentNumElementsScroll >= nElements));
			if (disabled) but[i].attr("disabled", "disabled");
			else but[i].removeAttr("disabled");
		}
	}
}

$.extend(myScroll.prototype, {
	defaultOptions: {
		contentCSS : {},
		contentClass : "ui-widget-content",
		arrows : "l_r",
		labels : { l:"l", r:"r", u:"u", d:"d" },
		sizeArrow : "10%",
//		nElementsScroll : 6,
		elementCSS : {position: "relative"},
		elementClass : "ui-state-default"
	},
});

