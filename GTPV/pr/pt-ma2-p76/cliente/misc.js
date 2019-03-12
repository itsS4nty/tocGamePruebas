H.Scripts.addLocalExec("miscS", function() {

var WW=window;

$.each( [ "Width", "Height" ], function( i, name ) {
	var type = name.toLowerCase();

	$.fn["margin"+name] = function() { return this["outer"+name](true)-this["outer"+name](false); };
	$.fn["mbp"+name] = function() { return this["outer"+name](true)-this[type](); };
	$.fn["o"+name] = function(d) {
		if (d == null) return this["outer"+name](true);
		else return this.each(function () {
			var $this = $(this);
			$this[type](d-($this["outer"+name](true)-($this.isBorderBox() ? $this["outer"+name]() : $this[type]())));
		});
	};
	$.fn["i"+name] = function(d) {
		if (d == null) return this[type]();
		else return this.each(function () {
			var $this = $(this);
			$this[type]($this.isBorderBox() ? d+($this["outer"+name]()-$this[type]()) : d);
		});
	};
});

$.fn.extend({
	isBorderBox : function() { return (this.css("boxSizing") == "border-box"); },
	showAlone : function() {
		return this.each(function () {
			var $this = $(this);
			$this.siblings().hide();
			$this.show();
		});
	},	
	absolutePos : function(x0,y0,x1,y1) {
		return this.css({position: "absolute", boxSizing: "border-box", left: x0+"%", top: y0+"%"})
				   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
				   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	},
	_100x100 : function() {
		return this.css({ position: "absolute", left: "0px", top: "0px", margin: "0px", border: "0px", 
						  width: "100%", height: "100%", boxSizing: "border-box" });
	},
	absolutePosPx : function(x0, y0, x1, y1) {
		x0 = Math.round(x0); y0 = Math.round(y0);
		x1 = Math.round(x1); y1 = Math.round(y1);
		this.css({position: "absolute", left: x0+"px", top: y0+"px"}).oWidth(x1-x0).oHeight(y1-y0);
	},
	isVisible : function() {
		return this.is(":visible");
	},
});	

/*WW.createAligner = function() {
	return $("<img>").attr("src", "cliente/dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
};
*/

WW.preProcessCompareNom = function(str) {
	function translateChar(c) {
		var testChars    = "àáäèéëìíïòóöùúüñç";
		var replaceChars = "aaaeeeiiiooouuunc";
		var idx = testChars.indexOf(c);
		return (idx==-1) ? c : replaceChars.charAt(idx);
	}
	return str.toLowerCase().split("").map(translateChar).join("");
};

WW.formatImport = function(imp, currencySymbol) {
	if (currencySymbol == null) currencySymbol = false;
	if (currencySymbol === true) currencySymbol = "€";

	var strI = imp.toFixed(2);
	for (var iComa=3+1+2; iComa < strI.length; iComa+=1+3) {
		strI = strI.slice(0,-iComa)+","+strI.slice(-iComa);
	}
	if (currencySymbol != false) strI = strI+" "+currencySymbol;	

	return strI;
};

WW.normImport = function(imp) {
	return (Math.round(imp*100)/100);
};

WW.parseImport = function(str) {
	var val = parseFloat(str);
	if (isNaN(val)) val = 0;
	return val;
};

WW.fillSpaceL = function(str, len) {
	str = ""+str; 
	while(str.length < len) { str = " "+str; } 
	return str;
};

WW.fillSpaceR = function(str, len) { 
	str = ""+str; 
	while(str.length < len) { str = str+" "; } 
	return str;
};

WW.getSortFunction = function(propName) {
	return function(a,b) { a=a[propName]; b=b[propName]; return ((a < b) ? -1 : ((a > b)?1:0)); }	
};

WW.getToLowerSortFunction = function(propName) {
	return function(a,b) { 
		a=a[propName].toLowerCase(); b=b[propName].toLowerCase(); 
		return ((a < b) ? -1 : ((a > b)?1:0)); 
	}	
};

if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}
if (!window.console) {
	window.console = { log : function() {} }; 
}

}); // add Scripts misc

