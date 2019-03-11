var Printer = function() {
	var my = {};

	var ESC = "\x1B";
	var GS =  "\x1D";
	
	var div0 = div100x100();
	
	var alertAppletNotLoaded = createAlertDialog().header("Error").text("Applet no actiu")
									              .setButtons(["Ok"], function(text, i) { my.start(); });
	alertAppletNotLoaded.getDiv().appendTo(div0);
	
	var currentSP, selectedSP;
	var applet;
	var elSerialSel;
	var timeoutId, timeoutInitId;
	var valid = false;
	var reintentosInit = 10;
	
	function openPrinter(port) {
		return applet.open(port, 9600, 8, 1, 0);
	}
	
	function serialSelectHandler(e) {
		if (elSerialSel != null) elSerialSel.removeClass("ui-state-active");	
		selectedSP = $(this).data("data");
		elSerialSel = $(this).addClass("ui-state-active");
	}
	
	function testSerialHandler(e) {
		if (selectedSP != null) {
			openPrinter(selectedSP);
			my.reset();
            my.print("\n");
			        /*123456789012345678901234567890123456789012*/			
			my.print("===================test===================\n");
			my.print("             Port Serie : "+selectedSP+"\n")
			my.print("===================test===================\n");
			my.print("\n\n\n\n\n\n\n");
			if ((currentSP != null) && (currentSP != selectedSP)) {
				if (timeoutId != null) window.clearTimeout(timeoutID);
				timeoutID = setTimeout(function() { tomeoutID = null; openPrinter(currentSP); }, 1000);	
			}
		}
	}
	
	function selectSerialPortHandler(e) {
		if (selectedSP != null) {
			if (timeoutId != null) window.clearTimeout(timeoutID);
			valid = openPrinter(selectedSP);
			GlobalGTPV.set("serialPort", selectedSP, false);
			menuPrincipal.finProceso();
		}
	}
	
	var divP = div100x100().addClass("ui-widget-content").appendTo(div0);
	var serialSelectModel = $("<button>").css({ width: "100%", height: "100%" }).addClass("ui-state-default").click(serialSelectHandler);
	var defaultElementSerialSelect = serialSelectModel.clone(false).html("X<br>X"); 
	var serialSelectScroll = new myScroll("_ud", defaultElementSerialSelect);
	serialSelectScroll.getDiv().css({ padding: SEP });
	positionDiv(serialSelectScroll.getDiv(), 0, 0, 50, 100).appendTo(divP);
	var divButtons = $("<div>").css({ position: "absolute", right : "0px", bottom : "0px", padding: SEP, width: "40%"}).appendTo(divP);
	$("<button>").text("test").css({width: "100%"}).appendTo(divButtons).click(testSerialHandler);
	$("<button>").text("Seleccionar").css({width: "100%"}).appendTo(divButtons).click(selectSerialPortHandler);
	
	function appletIsActive() {
		try {
			return applet.isActive();
		} catch(e) {
			return false;
		}
	}
	
	function initSerialPort() {
		timeoutInitId = null;
		if (valid) return;
		var port = GlobalGTPV.get("serialPort", false);	
		if (port == null) return;
		if (appletIsActive()) {
			valid = openPrinter(port);
			if (valid) return; 
			reintentosInit--;  // a veces openPrinter da false al arrancar, no se por que
			if (reintentosInit <= 0) return; 
		}
		timeoutInitId = window.setTimeout(initSerialPort, 1000);
	}
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		applet = $("<applet code='SerialPrinter.class' archive='applet/SerialPrinter.jar'/>")
		          .css({ width : "0px", height: "0px"}).appendTo("body").get(0);
		initSerialPort();
	}

	my.start = function() {
		divShow(div0);
		if (!appletIsActive()) {
			alertAppletNotLoaded.show();
			return;
		}
		if (timeoutInitId != null) {
			window.clearTimeout(timeoutInitId);
			reinitentosInit = 0;
			initSerialPort();
		}
		divShow(divP);
		currentSP = GlobalGTPV.get("serialPort", false);	
		selectedSP = currentSP;
		serialSelectScroll.removeAll();
		var ports = applet.listPorts();
		elSerialSel = null;
		for (var i=0, pos = null; i<ports.length; i++) {
			var el = serialSelectModel.clone(true).text(ports[i]).data("data", ports[i]).appendTo(serialSelectScroll.newElement());
			if (ports[i] == selectedSP) {
				el.addClass("ui-state-active");
				pos = i;
				elSerialSel = el;
			}
		}
		if (pos != null) serialSelectScroll.scrollTo(pos, true);
		serialSelectScroll.redraw();
	}

	buffer = null;
	my.startBuffer = function() {
		buffer = "";
	}
	my.printBuffer = function() {
		var str = buffer;
		buffer = null;
		my.rawPrint(str);
	}
	
	my.rawPrint = function(str) {
		if (buffer != null) { buffer += str; return; }
		if (valid) {
			var a = new Array(str.length);
			for (var i=0; i<str.length; i++) a[i] = str.charCodeAt(i);
			applet.send(a);
		}
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
						case "[": my.printRaw("["); break;
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
	
	return my;
}();

