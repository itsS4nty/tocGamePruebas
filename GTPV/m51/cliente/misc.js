H.Scripts.addLocalExec("miscS", "L2", function() {

var WW=window;

	// firefox no soporta box-sizing
(function() {
 	function styleSupport( prop ) {
		var vendorProp, supportedProp,
			capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
			prefixes = [ "Moz", "Webkit", "O", "ms" ],
			div = document.createElement( "div" );

		if ( prop in div.style ) {
			supportedProp = prop;
		} else {
			for ( var i = 0; i < prefixes.length; i++ ) {
				vendorProp = prefixes[i] + capProp;
				if ( vendorProp in div.style ) {
					supportedProp = vendorProp;
					break;
				}
			}
		}

		div = null;
		return supportedProp;
	}

	var boxSizing = styleSupport( "boxSizing" );

	// Set cssHooks only for browsers that
	// support a vendor-prefixed border radius
	if ( boxSizing && boxSizing !== "boxSizing" ) {
		$.cssHooks.boxSizing = {
			get: function( elem, computed, extra ) {
				return $.css( elem, boxSizing );
			},
			set: function( elem, value) {
				elem.style[ boxSizing ] = value;
			}
		};
	}
})();

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
	isBorderBox : function() {
		return (this.css("boxSizing") === "border-box"); 
	},
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
	return $("<img>").attr("src", "dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
};
*/

WW.conversionForCompare = function(str) {
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

String.prototype.fillSpaceL = function(len) {
	var str = this; 
	while(str.length < len) { str = " "+str; } 
	return str;
};

String.prototype.fillSpaceR = function(len) {
	var str = this; 
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

WW.gButton = function() {
	var b = $("<div>").css("boxSizing", "border-box"); // gBoxSizing
	// para el alineamiento vertical middle => box-align: center
	$("<div>").css({display: "inline-block", verticalAlign: "middle", height: "100%", width: "0px", boxSizing: "border-box"}).appendTo(b); 
	$("<div>").css({display: "inline-block", verticalAlign: "middle", height: "auto", width: "100%", boxSizing: "border-box"}).appendTo(b);
	b.addClass("g-button"); // para que no llame a append de gButton en las dos lines de arriba
	return b;
};

(function() {
	var jQueryText = $.fn.text,
	    jQueryAppend = $.fn.append;
		
	$.fn.text = function() {
		var args = arguments;
		if (args.length === 0) return jQueryText.apply(this);
		return this.each(function () {
			var $this = $(this);
			jQueryText.apply(getGButContent($this), args);
		});
	};
	$.fn.append = function() {
		var args = arguments;
		return this.each(function () {
			var $this = $(this);
			jQueryAppend.apply(getGButContent($this), args);
		});
	}
})();

WW.getGButContent = function(but) {
	if (but.hasClass("g-button")) return but.children().eq(1);
	return but;
}


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

if (!window.localStorage) {
  window.localStorage = {
    getItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    key: function (nKeyId) { return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]); },
    setItem: function (sKey, sValue) {
      if(!sKey) { return; }
      document.cookie = escape(sKey) + "=" + escape(sValue) + "; path=/; max-age="+(36500*24*60*60);
      this.length = document.cookie.match(/\=/g).length;
    },
    length: 0,
    removeItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return; }
      var sExpDate = new Date();
      sExpDate.setDate(sExpDate.getDate() - 1);
      document.cookie = escape(sKey) + "=; expires=" + sExpDate.toGMTString() + "; path=/";
      this.length--;
    },
    hasOwnProperty: function (sKey) { return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie); }
  };
  window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
}

}); // add Scripts misc

