function gScroll(arrows, nElementsScroll, options) {
	var my = this;
	var opt = $.extend({},this.defaultOptions, options || {});
	var defElementModel = null;
	if (typeof nElementsScroll != "number") defElementModel = nElementsScroll;
//	if (nElementsScroll != null) opt.nElementsScroll = nElementsScroll;
//	if (elementModel != null) opt.elementModel = elementModel;
	
	function clickArrow() {
		my.scrollTo(visibleElementScroll+($(this).data("inc"))*nElementsScroll);
	}
	function label(t) {
		return opt.labels[t];
	}

	var div = $("<div>");
	this.getDiv = function() { return div; }
	
	var horiz = (arrows.search(/[lr]/) != -1); 
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
	switch(arrows.indexOf("_")) {
		case 0: bAD = [1,1]; nsizeButton =  "50%"; ptb = [1,2]; vAD = [false, true]; break;
		case 1: bAD = [0,1]; nsizeButton = "100%"; ptb = [0,2]; vAD = [true, true];  break;
		case 2: bAD = [0,0]; nsizeButton =  "50%"; ptb = [0,1]; vAD = [true, false]; break;
	}
	
	function createArrow(type) {
		var types = "urdl";
		return $("<svg viewBox='0 0 100 100'>"
		        +"   <polygon points='50 17.5, 12.5 82.5, 87.5 82.5' fill='"+opt.colorArrow+"' "
				+"            transform='translate(50 50) rotate("+(types.indexOf(type)*90)+") translate(-50 -50)' />"
		        +"</svg>");
	}
	
	for (var i=0; i<=1; i++) {
		var t = arrows.charAt(ptb[i]);
		var inc = (t.search(/[lu]/) != -1) ? -1 : 1;
		but[i] = $("<button>").css(size, "100%").css(nsize, nsizeButton)
                              .css({ padding: "0px" }).append(createArrow(t))
							  .data("inc", inc).mousedown(clickArrow)
                              .appendTo(arrowDiv[bAD[i]]);
	}
	var resizeFunction = function() { if (isDivVisible(div)) my.redraw(); };
	Resize.add(resizeFunction, 200);


	var nElements = 0;
//	var currentNumElementsScroll = 0;
	this.getNElements = function() { return nElements; }
	var visibleElementScroll = 0;
	var currentTopElementScroll = 0;
	var scrollInBlocks = true;
//	this.getCurrentScroll = function() { return currentScroll; }
	var modelNewDivElement = $("<div>").css(opt.elementCSS).css({boxSizing : "border-box"}).addClass(opt.elementClass)
	                                   .css(nsize, "100%").css({display : blockType});
	function newDivElement() { return modelNewDivElement.clone(false); 
	/*$("<div>").css(opt.elementCSS).css({boxSizing : "border-box"}).addClass(opt.elementClass); */
	}
	if (defElementModel != null) {	defElementModel = newDivElement().append(defElementModel); }

	this.newElement = function() {
		var el = newDivElement();
		el/*.css(nsize, "100%").css({display : blockType})*/.appendTo(scrollContentDiv);
//		el.data("idx", this.nElements);
		nElements++;
		return el;
	}
	
	var contentNewElement = null;
	this.setContentNewElement = function(el) {
		contentNewElement = newDivElement().append(el.clone(false)).get(0);
	}
	this.newElementWithContent = function() {
		var el = contentNewElement.cloneNode(true);
		scrollContentDiv.get(0).appendChild(el);
		nElements++;
		return el.firstChild;
	}	
	
	this.redraw = function() {
		if (opt.initPostBody) {  // chapuza arrow(size, color) inizializados despues de body
		                         // scroll creado antes
			opt.sizeArrow = this.defaultOptions.sizeArrow;
			opt.colorArrow = this.defaultOptions.colorArrow;
			for (var i=0; i<=1; i++) { arrowDiv[i].css(size, opt.sizeArrow); }
			for (var i=0; i<=1; i++) { $("polygon", but[i]).attr("fill", opt.colorArrow); }
			opt.initPostBody = false;
		}
		var divSize = div[size]();
		var sa=[],sc,sic,dispA,dsc,sizeEl;
		var outerSize = "outer"+size.charAt(0).toUpperCase()+size.slice(1)
		dsc = contentDiv[outerSize](true) - contentDiv[size]();
		if (defElementModel != null) {
			defElementModel.appendTo(scrollContentDiv);
			sizeEl = defElementModel[outerSize](true);
			defElementModel.remove();
			sic = divSize-dsc;
			nElementsScroll = Math.floor(sic/sizeEl);
		} 
		dispA = (nElements > nElementsScroll) ? blockType : "none";
		for (var i=0; i<=1; i++) {
			sa[i]=0;
			if (vAD[i]) {
				arrowDiv[i].css({display: dispA});
				if (dispA != "none") sa[i] = arrowDiv[i][outerSize](true);
			} else arrowDiv[i].css({display: "none"});
		}
		sic = divSize-sa[0]-sa[1]-dsc;
		if (defElementModel != null) {	nElementsScroll = Math.floor(sic/sizeEl); }
		sic -= (sic % nElementsScroll); 
		sc = sic+dsc;	
/*		this.contentDiv.css(size, (sc+0.5)/s*100+"%"); */
		contentDiv[size](sc); 

		var sizeEl = sic/nElementsScroll;
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
		return scrollContentDiv.children().eq(idx);
	}
	this.scrollTo = function(el, _scrollBlocks) {
		if (el == null) el = visibleElementScroll;
		if (_scrollBlocks != null) scrollInBlocs = _scrollBlocks;
		if (el >= nElements) el = nElements-1;
		if (el < 0) el = 0;
		visibleElementScroll = el;
		if (scrollInBlocks) el = el - (el%nElementsScroll);
		currentTopElementScroll = el;
		/* scrollContentDiv.css(lot, -((el/opt.nElementsScroll)*100+0.0001)+"%"); */
		scrollContentDiv.css(lot, (-el*(contentDiv[size]()/nElementsScroll))+"px");
		for (var i=0; i<=1; i++) {
			var disabled = ((but[i].data("inc") == -1) ? (el == 0) : (el+nElementsScroll >= nElements));
			if (disabled) but[i].attr("disabled", "disabled");
			else but[i].removeAttr("disabled");
		}
	}
}

$.extend(gScroll.prototype, {
	defaultOptions: {
		contentCSS : {},
		contentClass : "ui-widget-content",
//		arrows : "l_r",
//		labels : { l:"l", r:"r", u:"u", d:"d" },
//		sizeArrow : "10%",
//		nElementsScroll : 6,
		initPostBody : true,
		sizeArrow : "16px",
		colorArrow : "black",
		elementCSS : {position: "relative", verticalAlign: "middle"},
		elementClass : "" //"ui-state-default"
	},
});


function initScroll() {
	var butT = $("<button>").appendTo("body");
	var divT = $("<div>").css({ display: "inline-block" }).html("XX<br>XX").addClass("ui-state-default").appendTo(butT);
	gScroll.prototype.defaultOptions.sizeArrow = divT.height()+"px";
	gScroll.prototype.defaultOptions.colorArrow = divT.css("color");
	butT.remove();
}
