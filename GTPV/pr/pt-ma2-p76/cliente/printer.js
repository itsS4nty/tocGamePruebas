// de momento solo desde el host

window.curPrinter = null;

window.AppImpresora = function() {
	var my = {};

	var div0 = $("<div>")._100x100();
	
	var applet;

	var alertAppletNotLoaded = newAlertDialog().header("Error").text("Applet no actiu")
								               .setButtons(["Ok"], function(text, i) { my.start(); });
	alertAppletNotLoaded.getDiv().appendTo(div0);
	
	var selectedP;
	var timeoutIdCloseTestP=null, testPrinter=null;
		
	function testSerialHandler(e) {
		if (e.button !== 0) return;
		if (selectedP == null) return;
		if (!((testPrinter !== null) && (testPrinter.getName() === selectedP))) {
			if ((testPrinter != null) && (testPrinter !== curPrinter)) testPrinter.close();
			if (curPrinter.getName() === selectedP) testPrinter = curPrinter;
			else testPrinter = new Printer(selectedP);	
		}
		testPrinter.reset();
		testPrinter.print("\n");
				         /*123456789012345678901234567890123456789012*/			
		testPrinter.print("===================test===================\n");
		testPrinter.print("             Port Serie : "+selectedP+"\n")
		testPrinter.print("===================test===================\n");
		testPrinter.print("\n\n\n\n\n\n\n");
		
		rememberCloseTestPrinter();
	}
	
	function rememberCloseTestPrinter() {
		if (!div0.isVisible()) closeTestPrinter();
		else {
			if (timeoutIdCloseTestP == null) 
				timeoutIdCloseTestP = setTimeout(rememberCloseTestPrinter, 1000);
		}
	}
	
	function closeTestPrinter() {
		if (timeoutIdCloseTestP != null) {
			window.clearTimeout(timeoutIdCloseTestP);
			timeoutIdCloseTestP = null;
		}	
		if ((testPrinter != curPrinter) && (testPrinter != null)) testPrinter.close();
		testPrinter = null;
	}

	function makeCurrentPortHandler(e) {
		if (e.button !== 0) return;
		if (selectedP == null) return;
		if (curPrinter.getName() != selectedP) {
			if ((testPrinter != null) && (testPrinter.getName() == selectedP)) {
				curPrinter.close();
				curPrinter = testPrinter;
			} else {
				curPrinter = new Printer(selectedP);
			}
			closeTestPrinter();
			H.GlobalGTPV.set("serialPort", selectedP, false);
		}
		mp.finApp();
	}
	
	var divP = $("<div>")._100x100().addClass("ui-widget-content").appendTo(div0);

	var paramsSerialSelectScroll = {
		arrows : "_ud",
		getNItems : function() { return serialPorts.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementSerialSelect;
			var port = serialPorts[idx];
			var el = serialSelectModel.clone(true).text(port).data("data", port);
			if (port === selectedP) {
				el.addClass("ui-state-active");
			}
			return el;
		},
	};
	
	var serialSelectModel = $("<button>").addClass("ui-state-default");

	var defaultElementSerialSelect = serialSelectModel.clone(false).html("X<br>X"); 
	var serialSelectScroll = newGScroll(paramsSerialSelectScroll);
	serialSelectScroll.getDiv().css({ padding: SEP });
	serialSelectScroll.getDiv().absolutePos(0, 0, 50, 100).appendTo(divP);

	serialSelectModel.click(function (e) {
		if (e.button !== 0) return;
		selectedP = $(this).data("data");
		serialSelectScroll.redraw(serialPorts.indexOf(selectedP));
	});

	var divButtons = $("<div>").css({ position: "absolute", right : "0px", bottom : "0px", padding: SEP, width: "40%"})
	                           .appendTo(divP);
	$("<button>").text("test").css({width: "100%"}).appendTo(divButtons).click(testSerialHandler);
	$("<button>").text("Seleccionar").css({width: "100%"}).appendTo(divButtons).click(makeCurrentPortHandler);
	
	function appletIsActive() {
		try { 
			return applet.isActive(); 
		} catch(e) { 
			return false;
		}
	}
	
	function initSerialPort() {
		var port = H.GlobalGTPV.get("serialPort", false);	
		curPrinter = new Printer(port);
	}
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		applet = serialPrinterApplet;
//		$(applet).hide();
		initSerialPort();

	}

	var mp;
	var serialPorts = [];
	
	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
		if (!appletIsActive()) {
			alertAppletNotLoaded.show();
			return;
		}
		closeTestPrinter(true);
		divP.showAlone();
		selectedP = curPrinter.getName();
		try {
			serialPorts = applet.listPorts();
		} catch(e) { 
			alertAppletNotLoaded.show();
			return;
		}
		serialSelectScroll.redraw(serialPorts.indexOf(selectedP));
	}
	
	return my;
};

window.Printer = function(name) {
	var my = this;
//	var applet = serialPrinterApplet;
	
	var ESC = "\x1B";
	var GS =  "\x1D";
	
	my.EURO = "\x80";
	
	my.getName = function() { return name; }
	var com = null;
	var bufWrite = null;
	
	function openCom() {
		if (name == null) return false;
		if (com != null) return true;
		try {
			com = applet.open(name, 9600, 8, 1, 0);
			return (com != null);
		} catch (e) { 
			console.log("error openCom");
			return false; 
		}
	}
	
	openCom();

	function write(str) {
		var a = new Array(str.length);
		for (var i=0; i<str.length; i++) a[i] = str.charCodeAt(i);
		if (bufWrite == null) {
			applet.write(com, a, callbackWrite);
			bufWrite = [];
		} else bufWrite = bufWrite.concat(a);
	}

	function callbackWrite(status) {
		if (bufWrite.length > 0) {
			applet.write(com, bufWrite, callbackWrite);
			bufWrite = [];
		} else bufWrite = null;	
	}
	
	my.rawPrint = function(str) {
		if (str == null) return;
		if (!openCom()) return;
		write(str);
	}
	
	my.alignment = function(com) {
		my.rawPrint(ESC+"a"+com);	
	}
	
	my.font = function(f,e,w,h,u) {
		var com = 0;
		com |= (f == "A") ? 0 : 1;
		com |= e ? (1<<3) : 0;
		com |= (w==1) ? 0 : (1<<5);
		com |= (h==1) ? 0 : (1<<4);
		com |= u ? (1<<7) : 0;
		my.rawPrint(ESC+"!"+(String.fromCharCode(com)));
	}
	
	my.underline = function(com) {
		my.rawPrint(ESC+"-"+com);
	}

	my.inverted = function(com) {
		my.rawPrint(GS+"B"+com);	
	}
	
	my.cutPaper = function() {
		my.rawPrint(GS+"V"+"\x42"+"\x40");	
	}

	my.abrirCajon = function() {
		my.rawPrint(ESC+"p0\x80\x80");
	}

	my.reset = function() {
		my.font("A", false, 1, 1, false);
		my.alignment(0);
		my.underline(0);	
		my.inverted(0);
	}
	my.reset2 = function() {
		my.print("1\n");
//		my.font("A", false, 1, 1, false);
		my.print("2\n");
		my.alignment(0);
		my.print("3\n");
		my.underline(0);	
		my.print("4\n");
		my.inverted(0);
		my.print("5\n");
	}
	my.codePage = function(cp) {
		if (cp == null) cp = 16; // code page windows-1252
		my.rawPrint(ESC+"t"+String.fromCharCode(cp));
	}
		
	
	my.print = function(str) {
		while (str.length > 0) {
			var i = str.indexOf("[");
			if (i == -1) {
				my.rawPrint(str);
				str = "";
			} else {
				my.rawprint(str.substring(0,i));
				str = str.substr(i);
				i = str.indexOf("]");
				if (i == -1) { str = ""; }
				else {
					var com = str.substr(0,i);
					str = str.substr(i+1);
					switch(com) {
						case "SALTOLINEA": m.rawPrint("\n"); break;
						case "CORTARPAPEL": my.cutPaper(); break;
						case "NORMAL": my.reset(); break;
						case "IZQUIERDA": my.alignment(0); break;
						case "CENTRO": my.alignment(1); break;
						case "DERECHA":	my.alignment(2); break;
						case "NOSUBRAYADO": my.underline(0); break;
						case "SUBRAYADO1": my.underline(1); break;
						case "SUBRAYADO2": my.underline(2); break;
						case "INVERTIR0" : my.inverted(0); break;
						case "INVERTIR1" : my.inverted(1); break;
						case "FUENTEA" : my.font("A",false,1,1,false); break;
						case "FUENTEB" : my.font("B",false,1,1,false); break;
						case "FUENTEC" : my.font("B",false,2,1,false); break;
						case "FUENTED" : my.font("B",true ,2,2,false); break;
						case "[": my.rawPrint("["); break;
					}
				}
			}
		}
	}
	
	my.printLine = function(car, len) {
		var str = "";
		for (var i=0; i<len; i++) str+=car;
		str+="\n";
		my.rawPrint(str);	
	}

	my.close = function() {
		if (com != null) {
			try { applet.close(com); } catch(e) {}
			com = null;
		}
	}
};

curPrinter = new Printer(null);

H.Scripts.addLocalExec("printerS", function() {

window.PrintTicket = function() {
	var my = {};
	// S (params) :
	//		date, numTick, depNom, rowsT(ticket), currencySymbol
	my.getLine = function(sec, idxSec, S, numCars) {
		function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
		var str = null;
		switch (sec) {
			case "header" :
				switch (idxSec) {
					case 0 :
						var m =  /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/.exec(S.date);
						var dateNtStr = M(" N.Ticket:")+S.numTick+" ";
						dateNtStr += m[3]+"/"+m[2]+"/"+m[1]+" "+m[4]+":"+m[5]+":"+m[6];
						str = M("Atès Per : ");
						var lenD = numCars-(str.length+0+dateNtStr.length);
						var strD = S.depNom.substring(0,lenD);
						strD = fillSpaceR(strD, lenD);
						str = str+strD+dateNtStr;
						break;
					case 1 :
						str = M("  UTS  DESCRIPCIO");
						str = fillSpaceR(str, numCars-8-8)+M("  PREU   IMPORT ");
						break;
				}
				break;
			case "ticket" :
				if (idxSec == 0) {
					str = ""; while(str.length<numCars) str+="-";
				} else if (idxSec-1<S.rowsT.length) {
					var t = S.rowsT[idxSec-1];
					var art = Articles.getByCodi(t.codi);
					if (art == null) art = { nom: "" };
					var prec = (art.esSumable) ? 0 : 3;
					var strC = ""+t.n.toFixed(prec);
					var iComa = 3 + ((prec == 0) ? 0 : 1+prec);
					for (; iComa < strC.length; iComa+=3+1) {
						strC = strC.slice(0,-iComa)+","+strC.slice(-iComa);
					}
					if (strC.length > 6) strC="******";
					else strC = fillSpaceL(strC, 6);
	
					var lenC = strC.length;
	
					var strP = fillSpaceL(formatImport(t.imp/t.n, false));
					strP = fillSpaceL(strP,8);
					var strI = fillSpaceL(formatImport(t.imp, false));
					strI = fillSpaceL(strI,8);
					
					var lenN = numCars-(6+1+0+1+strP.length+1+strI.length);
					var strN = art.nom.substring(0,lenN);
					strN = fillSpaceR(strN, lenN);
					str = strC+" "+strN+" "+strP+" "+strI;
							
				} else if (idxSec-1==S.rowsT.length) {
					str = ""; while(str.length<numCars) str+="=";
				}
				break;
			case "total" :
				if (idxSec == 0) {
					var strT = formatImport(S.total, (S.currencySymbol != null) ? S.currencySymbol : true);
					var str = M("Total : ");
					str = fillSpaceR(str, numCars-strT.length)+strT;
				}
				break;	
		}
		return str;
	};
	
	return my;
}();
	
}); // add Script printerS
