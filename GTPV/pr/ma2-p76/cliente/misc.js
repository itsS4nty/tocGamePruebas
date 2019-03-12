addScript("misc.js", function(ns) {
ns.marginW = function(div) { return div.outerWidth(true)-div.outerWidth(false); };
ns.marginH = function(div) { return div.outerHeight(true)-div.outerHeight(false); };

ns.mbpW = function(div) { return div.outerWidth(true)-div.width(); };
ns.mbpH = function(div) { return div.outerHeight(true)-div.height(); };

ns.isBorderBox = function(div) { return (div.css("boxSizing") == "border-box"); },
ns.setOW = function(div, w) { 
	div.width(w-(div.outerWidth(true)-(isBorderBox(div) ? div.outerWidth() : div.width()))); 
};
ns.setOH = function(div, h) { 
	div.height(h-(div.outerHeight(true)-(isBorderBox(div) ? div.outerHeight() : div.height()))); 
};
ns.setIW = function(div, w) { 
	if (isBorderBox(div)) w+=(div.outerWidth()-div.width());
	div.width(w); 
};
ns.setIH = function(div, h) { 
	if (isBorderBox(div)) w+=(div.outerHeight()-div.width());
	div.height(w); 
};
ns.getOW = function(div) { return div.outerWidth(true); };
ns.getOH = function(div) { return div.outerHeight(true); };
ns.getIW = function(div) { return div.width(); };
ns.getIH = function(div) { return div.height(); };

ns.divShow = function(div) {
	div.siblings().hide();
	div.show();
};

ns.positionDiv = function(div,x0,y0,x1,y1) {
	div = $(div || "<div>");
	div.css({position: "absolute", boxSizing: "border-box", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
};

ns.div100x100 = function(div) {
	return (div||$("<div>")).css({ position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", boxSizing: "border-box" });
}; 

ns.createAligner = function() {
	return $("<img>").attr("src", "cliente/dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
};

ns.posAbsolutePX = function(div, x0, y0, x1, y1) {
	x0 = Math.round(x0); y0 = Math.round(y0);
	x1 = Math.round(x1); y1 = Math.round(y1);
	div.css({position: "absolute", left: x0+"px", top: y0+"px"});
	setOW(div, x1-x0); setOH(div, y1-y0);
};

ns.positionKeyboard = function(keyboard, x0, y0, x1, y1) {
	var mw = mbpW(keyboard.getDiv());
	var mh = mbpH(keyboard.getDiv());
	var w0 = x1-x0;
	var h0 = (w0-mw)*keyboard.getNumButtonsY()/keyboard.getNumButtonsX()+mh;
	if (h0 > y1-y0) {
		h0 = y1-y0;
		w0 = (h0-mh)*keyboard.getNumButtonsX()/keyboard.getNumButtonsY()+mw;
		x0 += ((x1-x0)-w0)/2;
	} else y0 += ((y1-y0)-h0)/2;
	posAbsolutePX(keyboard.getDiv(), x0, y0, x0+w0, y0+h0);
};

ns.isDivVisible = function(div) {
	return (div.get(0).offsetWidth > 0); // return div.is(":visible");
};

ns.preProcessCompareNom = function(str) {
	function translateChar(c) {
		var testChars    = "àáäèéëìíïòóöùúüñç";
		var replaceChars = "aaaeeeiiiooouuunc";
		var idx = testChars.indexOf(c);
		return (idx==-1) ? c : replaceChars.charAt(idx);
	}
	return str.toLowerCase().split("").map(translateChar).join("");
};

ns.formatImport = function(imp, currencySymbol) {
	if (currencySymbol == null) currencySymbol = false;
	if (currencySymbol === true) currencySymbol = "€";

	var strI = imp.toFixed(2);
	for (var iComa=3+1+2; iComa < strI.length; iComa+=1+3) {
		strI = strI.slice(0,-iComa)+","+strI.slice(-iComa);
	}
	if (currencySymbol != false) strI = strI+" "+currencySymbol;	

	return strI;
};

ns.normImport = function(imp) {
	return (Math.round(imp*100)/100);
};

ns.parseImport = function(str) {
	var val = parseFloat(str);
	if (isNaN(val)) val = 0;
	return val;
};

ns.fillSpaceL = function(str, len) {
	str = ""+str; 
	while(str.length < len) { str = " "+str; } 
	return str;
};

ns.fillSpaceR = function(str, len) { 
	str = ""+str; 
	while(str.length < len) { str = str+" "; } 
	return str;
};

ns.getSortFunction = function(propName) {
	return function(a,b) { a=a[propName]; b=b[propName]; return ((a < b) ? -1 : ((a > b)?1:0)); }	
};

ns.getToLowerSortFunction = function(propName) {
	return function(a,b) { 
		a=a[propName].toLowerCase(); b=b[propName].toLowerCase(); 
		return ((a < b) ? -1 : ((a > b)?1:0)); 
	}	
};

});

