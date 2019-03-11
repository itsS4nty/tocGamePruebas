function marginW(div) { return div.outerWidth(true)-div.outerWidth(false); }
function marginH(div) { return div.outerHeight(true)-div.outerHeight(false); }

function mbpW(div) { return div.outerWidth(true)-div.width(); }
function mbpH(div) { return div.outerHeight(true)-div.height(); }

function isBorderBox(div) { return (div.css("boxSizing") == "border-box"); }
function setOW(div, w) { 
	div.width(w-(div.outerWidth(true)-(isBorderBox(div) ? div.outerWidth() : div.width()))); 
}
function setOH(div, h) { 
	div.height(h-(div.outerHeight(true)-(isBorderBox(div) ? div.outerHeight() : div.height()))); 
}
function setIW(div, w) { 
	if (isBorderBox(div)) w+=(div.outerWidth()-div.width());
	div.width(w); 
}
function setIH(div, h) { 
	if (isBorderBox(div)) w+=(div.outerHeight()-div.width());
	div.height(w); 
}
function getOW(div) { return div.outerWidth(true); }
function getOH(div) { return div.outerHeight(true); }
function getIW(div) { return div.width(); }
function getIH(div) { return div.height(); }

function divShow(div) {
	div.siblings().hide();
	div.show();
}

function positionDiv(div,x0,y0,x1,y1) {
	div = $(div || "<div>");
	div.css({position: "absolute", boxSizing: "border-box", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

function div100x100(div) {
	return (div||$("<div>")).css({ position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", boxSizing: "border-box" });
} 

function createAligner() {
	return $("<img>").attr("src", "cliente/dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
}

function posAbsolutePX(div, x0, y0, x1, y1) {
	x0 = Math.round(x0); y0 = Math.round(y0);
	x1 = Math.round(x1); y1 = Math.round(y1);
	div.css({position: "absolute", left: x0+"px", top: y0+"px"});
	setOW(div, x1-x0); setOH(div, y1-y0);
}

function positionKeyboard(keyboard, x0, y0, x1, y1) {
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
}

function isDivVisible(div) {
	return (div.get(0).offsetWidth > 0); // return div.is(":visible");
}

function preProcessCompareNom(str) {
	function translateChar(c) {
		var testChars    = "àáäèéëìíïòóöùúüñç";
		var replaceChars = "aaaeeeiiiooouuunc";
		var idx = testChars.indexOf(c);
		return (idx==-1) ? c : replaceChars.charAt(idx);
	}
	return str.toLowerCase().split("").map(translateChar).join("");
}

function formatImport(imp, currencySymbol) {
	if (currencySymbol == null) currencySymbol = false;
	if (currencySymbol === true) currencySymbol = "€";

	var strI = imp.toFixed(2);
	for (var iComa=3+1+2; iComa < strI.length; iComa+=1+3) {
		strI = strI.slice(0,-iComa)+","+strI.slice(-iComa);
	}
	if (currencySymbol != false) strI = strI+" "+currencySymbol;	

	return strI;
}

function normImport(imp) {
	return (Math.round(imp*100)/100);
}

function parseImport(str) {
	var val = parseFloat(str);
	if (isNaN(val)) val = 0;
	return val;
}

function fillSpaceL(str, len) {
	str = ""+str; 
	while(str.length < len) { str = " "+str; } 
	return str;
};

function fillSpaceR(str, len) { 
	str = ""+str; 
	while(str.length < len) { str = str+" "; } 
	return str;
};

