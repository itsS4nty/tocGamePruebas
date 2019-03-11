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
	}
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
	b.css("cursor", "default");
	b.mousedown(function(e) { e.preventDefault(); }); // no select text
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

WW.callbackManager = function(callback, debug) {
	var numGets = 0; 
	
	this.get = function(log) {
		numGets++;
		if (debug) console.log("-> "+log+" : "+numGets);
		return function() {
			if (debug) console.log("<- "+log+" : "+numGets);
			if (((--numGets) === 0) && (typeof callback === "function")) callback(); 	
		};
	}

	this.activate = this.get(0);
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

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if ( !Array.prototype.forEach ) {

  Array.prototype.forEach = function( callback, thisArg ) {

    var T, k;

    if ( this == null ) {
      throw new TypeError( " this is null or not defined" );
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ( {}.toString.call(callback) != "[object Function]" ) {
      throw new TypeError( callback + " is not a function" );
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if ( thisArg ) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while( k < len ) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if ( k in O ) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call( T, kValue, k, O );
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while(k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
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

if (!Date.now) {
  Date.now = function now() {
    return +(new Date);
  };
}

if ((new Error("error")).toString().charAt(0) === '[') { // [object Error]
	Error.prototype.toString = function() { return this.name+": "+this.message; }
}

/**
 * jQuery JSON Plugin v2.4-edge (2011-09-25)
 *
 * @author Brantley Harris, 2009-2011
 * @author Timo Tijhof, 2011
 * @source This plugin is heavily influenced by MochiKit's serializeJSON, which is
 *         copyrighted 2005 by Bob Ippolito.
 * @source Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 *         website's http://www.json.org/json2.js, which proclaims:
 *         "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 *         I uphold.
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

(function( $ ) {

        var     escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
                meta = {
                        '\b': '\\b',
                        '\t': '\\t',
                        '\n': '\\n',
                        '\f': '\\f',
                        '\r': '\\r',
                        '"' : '\\"',
                        '\\': '\\\\'
                },
                hasOwn = Object.prototype.hasOwnProperty;

        /**
         * jQuery.toJSON
         * Converts the given argument into a JSON respresentation.
         *
         * @param o {Mixed} The json-serializble *thing* to be converted
         *
         * If an object has a toJSON prototype, that will be used to get the representation.
         * Non-integer/string keys are skipped in the object, as are keys that point to a
         * function.
         *
         */
        $.toJSON = typeof JSON === 'object' && JSON.stringify
                ? JSON.stringify
                : function( o ) {

                if ( o === null ) {
                        return 'null';
                }

                var type = typeof o;

                if ( type === 'undefined' ) {
                        return undefined;
                }
                if ( type === 'number' || type === 'boolean' ) {
                        return '' + o;
                }
                if ( type === 'string') {
                        return $.quoteString( o );
                }
                if ( type === 'object' ) {
                        if ( typeof o.toJSON === 'function' ) {
                                return $.toJSON( o.toJSON() );
                        }
                        if ( o.constructor === Date ) {
                                var     month = o.getUTCMonth() + 1,
                                        day = o.getUTCDate(),
                                        year = o.getUTCFullYear(),
                                        hours = o.getUTCHours(),
                                        minutes = o.getUTCMinutes(),
                                        seconds = o.getUTCSeconds(),
                                        milli = o.getUTCMilliseconds();

                                if ( month < 10 ) {
                                        month = '0' + month;
                                }
                                if ( day < 10 ) {
                                        day = '0' + day;
                                }
                                if ( hours < 10 ) {
                                        hours = '0' + hours;
                                }
                                if ( minutes < 10 ) {
                                        minutes = '0' + minutes;
                                }
                                if ( seconds < 10 ) {
                                        seconds = '0' + seconds;
                                }
                                if ( milli < 100 ) {
                                        milli = '0' + milli;
                                }
                                if ( milli < 10 ) {
                                        milli = '0' + milli;
                                }
                                return '"' + year + '-' + month + '-' + day + 'T' +
                                        hours + ':' + minutes + ':' + seconds +
                                        '.' + milli + 'Z"';
                        }
                        if ( o.constructor === Array ) {
                                var ret = [];
                                for ( var i = 0; i < o.length; i++ ) {
                                        ret.push( $.toJSON( o[i] ) || 'null' );
                                }
                                return '[' + ret.join(',') + ']';
                        }
                        var     name,
                                val,
                                pairs = [];
                        for ( var k in o ) {
                                // Only include own properties,
                                // Filter out inherited prototypes
                                if ( !hasOwn.call( o, k ) ) {
                                        continue;
                                }

                                // Keys must be numerical or string. Skip others
                                type = typeof k;
                                if ( type === 'number' ) {
                                        name = '"' + k + '"';
                                } else if (type === 'string') {
                                        name = $.quoteString(k);
                                } else {
                                        continue;
                                }
                                type = typeof o[k];

                                // Invalid values like these return undefined
                                // from toJSON, however those object members
                                // shouldn't be included in the JSON string at all.
                                if ( type === 'function' || type === 'undefined' ) {
                                        continue;
                                }
                                val = $.toJSON( o[k] );
                                pairs.push( name + ':' + val );
                        }
                        return '{' + pairs.join( ',' ) + '}';
                }
        };

        /**
         * jQuery.evalJSON
         * Evaluates a given piece of json source.
         *
         * @param src {String}
         */
        $.evalJSON = typeof JSON === 'object' && JSON.parse
                ? JSON.parse
                : function( src ) {
                return eval('(' + src + ')');
        };

        /**
         * jQuery.secureEvalJSON
         * Evals JSON in a way that is *more* secure.
         *
         * @param src {String}
         */
        $.secureEvalJSON = typeof JSON === 'object' && JSON.parse
                ? JSON.parse
                : function( src ) {

                var filtered = 
                        src
                        .replace( /\\["\\\/bfnrtu]/g, '@' )
                        .replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace( /(?:^|:|,)(?:\s*\[)+/g, '');

                if ( /^[\],:{}\s]*$/.test( filtered ) ) {
                        return eval( '(' + src + ')' );
                } else {
                        throw new SyntaxError( 'Error parsing JSON, source is not valid.' );
                }
        };

        /**
         * jQuery.quoteString
         * Returns a string-repr of a string, escaping quotes intelligently.
         * Mostly a support function for toJSON.
         * Examples:
         * >>> jQuery.quoteString('apple')
         * "apple"
         *
         * >>> jQuery.quoteString('"Where are we going?", she asked.')
         * "\"Where are we going?\", she asked."
         */
        $.quoteString = function( string ) {
                if ( string.match( escapeable ) ) {
                        return '"' + string.replace( escapeable, function( a ) {
                                var c = meta[a];
                                if ( typeof c === 'string' ) {
                                        return c;
                                }
                                c = a.charCodeAt();
                                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                        }) + '"';
                }
                return '"' + string + '"';
        };

})( jQuery );

if (!window.JSON) {
	window.JSON = { 
		stringify: $.toJSON,
		parse: $.secureEvalJSON
	};
}

(function() {
	function f(setF) {
        return function(func, delay) {
            var a = Array.prototype.slice.call(arguments, 2);
            return setF(function() { func.apply(this, a); }, delay);
        };
	}
	var savedSetTimeout = window.setTimeout,
		savedSetInterval = window.setInterval;
		
		// ie: setTimeout != window.setTimeout
		
	window.setTimeout = f(window.setTimeout);
	window.setInterval = f(window.setInterval);

	savedSetTimeout(function(param) {
		if (param === true) {
			window.setTimeout = savedSetTimeout;
			window.setInterval = savedSetInterval;	
		}
		
	}, 0, true);
	
})();


}); // add Scripts misc

