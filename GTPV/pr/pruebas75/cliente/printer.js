var curPrinter = null;

var procesoImpresora = function() {
	var my = {};

	var div0 = div100x100();
	
	var applet;

	var alertAppletNotLoaded = createAlertDialog().header("Error").text("Applet no actiu")
									              .setButtons(["Ok"], function(text, i) { my.start(); });
	alertAppletNotLoaded.getDiv().appendTo(div0);
	
	var selectedP;
	var elSerialSel;
	var timeoutIdCloseTestP=null, testPrinter=null;
	
	function serialSelectHandler(e) {
		if (e.button !== 0) return;
		if (elSerialSel != null) elSerialSel.removeClass("ui-state-active");	
		selectedP = $(this).data("data");
		elSerialSel = $(this).addClass("ui-state-active");
	}
	
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
		if (!isDivVisible(div0)) closeTestPrinter();
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
			GlobalGTPV.set("serialPort", selectedP, false);
		}
		menuPrincipal.finProceso();
	}
	
	var divP = div100x100().addClass("ui-widget-content").appendTo(div0);
	var serialSelectModel = $("<button>").css({ width: "100%", height: "100%" }).addClass("ui-state-default").click(serialSelectHandler);
	var defaultElementSerialSelect = serialSelectModel.clone(false).html("X<br>X"); 
	var serialSelectScroll = new gScroll("_ud", defaultElementSerialSelect);
	serialSelectScroll.getDiv().css({ padding: SEP });
	positionDiv(serialSelectScroll.getDiv(), 0, 0, 50, 100).appendTo(divP);
	var divButtons = $("<div>").css({ position: "absolute", right : "0px", bottom : "0px", padding: SEP, width: "40%"}).appendTo(divP);
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
		var port = GlobalGTPV.get("serialPort", false);	
		curPrinter = new Printer(port);
	}
	
	my.init = function(div00, callbackInit) {
		div0.appendTo(div00).hide();
		applet = serialPrinterApplet;
//		$(applet).hide();
		initSerialPort();
		callbackInit();
	}

	my.start = function() {
		divShow(div0);
		if (!appletIsActive()) {
			alertAppletNotLoaded.show();
			return;
		}
		closeTestPrinter(true);
		divShow(divP);
		selectedP = curPrinter.getName();
		serialSelectScroll.removeAll();
		try {
			var ports = applet.listPorts();
		} catch(e) { 
			alertAppletNotLoaded.show();
			return;
		}
		elSerialSel = null;
		for (var i=0, pos = null; i<ports.length; i++) {
			var el = serialSelectModel.clone(true).text(ports[i]).data("data", ports[i]).appendTo(serialSelectScroll.newElement());
			if (ports[i] == selectedP) {
				el.addClass("ui-state-active");
				pos = i;
				elSerialSel = el;
			}
		}
		if (pos != null) serialSelectScroll.scrollTo(pos, true);
		serialSelectScroll.redraw();
	}
	
	return my;
}();

var Printer = function(name) {
	var my = this;
	var applet = serialPrinterApplet;
	
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

