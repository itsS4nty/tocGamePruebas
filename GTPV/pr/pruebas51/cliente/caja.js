var Caja = function() {
	var my = {};

	my.clasesMonedas = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200, 500];

	var cajaInicial = {
		oberta : false,
		id : 0,
	};
	cajaInicial.canvi = [];
	for (var i=0; i<my.clasesMonedas.length; i++) { cajaInicial.canvi[i] = 0; }
	
	my.get = function() {
		var ec = GlobalGTPV.get("EstadoCaja");
		if (ec == null) {
			ec = cajaInicial; 
			GlobalGTPV.set("EstadoCaja", ec);
		}
		return ec;
	};
	my.set = function(ec) {
		GlobalGTPV.set("EstadoCaja", ec);	
	}
	my.abrir = function(c) {
		c.oberta = true;
		c.zeta = 0;
		c.descuadre = -my.totalCanvi(c.canvi);
		c.clients = 0;
		saveDB(c);
	}

	my.cerrar = function(c) {
		c.oberta = false;
		saveDB(c);
	}
	
	function saveDB(c) {
		c.date = new Date();
		c.id++;
		var tempC = {};
		for (var p in c) { if (c.hasOwnProperty(p)) tempC[p] = c[p]; }
		tempC.canvi = {};
		for (var i=0; i<my.clasesMonedas.length; i++) {
			tempC.canvi[""+my.clasesMonedas[i]] = c.canvi[i];
		}
		tempC.canvi = JSON.stringify(tempC.canvi);
		my.set(c);
		db = DB.openMensual();
		var suf = DB.getMensualSufix();
		db.transaction(function(tx) {
			var stat = "CREATE TABLE IF NOT EXISTS [CAIXA"+suf+"] "
			          +"([Data] datetime NULL, [id] int, [primera] float, [oberta] int, [tancada] int, "
					  +" [CanviInicial] text, [Zeta] float, [Descuadre] float, [Clients] int) "; 
			tx.executeSql(stat, []);
			var stat = "INSERT INTO [CAIXA"+suf+"] "
			          +"([Data], [id], [primera], [oberta], [tancada], [CanviInicial], [Zeta], [Descuadre], [Clients]) "
					  +" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ";
			var sqlDate = DB.getSqlDate(tempC.date);
			tx.executeSql(stat, [sqlDate, tempC.id, tempC.primera, (tempC.oberta)?1:0, (tempC.oberta)?0:1,
			                     tempC.canvi, tempC.zeta, tempC.descuadre, tempC.clients]);		  
		});
	}
	
	my.totalCanvi = function(canvi) {
		var total = 0;
		for (var i=0; i<my.clasesMonedas.length; i++) {
			total += my.clasesMonedas[i]*canvi[i];
		}
		return total;
	}
	
	return my;	
}();

var newProcesoCanviCaja = function() {
	var my = {};

	var D = null;
	
	var div0 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");

	var divContCanvi = $("<div>").css({ fontFamily: "monospace" })
	                             .appendTo(div0);
	var divButtons = $("<div>").css({ position: "absolute" }).appendTo(div0);
	var divTeclado = $("<div>").css({position: "absolute", fontFamily: "monospace"})
	                           .appendTo(div0);

	var modelBut = $("<button>").css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		var t = $(this).data("data");
		var canvi = D.canvi[D.selected];
		
		if (typeof t == "number") {
			if (D.primeraTecla == true) canvi = 0;
			if (canvi*10+t < 1000) canvi = canvi*10+t;
			D.primeraTecla = false;
		}
		if (t == "B") {	canvi = 0; }
		D.canvi[D.selected] = canvi;
		redraw();
	});

	var butT=[[7,8,9],[4,5,6],[1,2,3],[" ",0,'B']];
	for (var y=0; y<butT.length; y++) {
		var div2 = $("<div>").appendTo(divTeclado);
		for (var x=0; x<butT[y].length; x++) {
			modelBut.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
		}
	}
	
	function canviHandler(e) {
		D.selected = $(this).data("idx");
		D.primeraTecla = true;
		redraw();
	}
	var modelCanvi = $("<div>").css({ whiteSpace: "pre", overflow: "hidden", textAlign: "center" })
	                           .addClass("ui-state-default");
								
	var headerCanvi = modelCanvi.clone(false).appendTo(divContCanvi);							
	var canviDivs = [];
	for (var i=0; i<Caja.clasesMonedas.length; i++) {
		canviDivs[i] = modelCanvi.clone(true).data("idx", i).appendTo(divContCanvi).mousedown(canviHandler);
	}
	var lineaCanvi = modelCanvi.clone(false).appendTo(divContCanvi);
	var totalCanvi = modelCanvi.clone(false).appendTo(divContCanvi);
	
	var dep; 

	my.getDiv = function() { return div0; }
	my.getDivButtons = function() { return divButtons; }
	
	var headerStr = "Peça    Import    Unit"
	var formatStr = "PPPP -> IIIIIIII -- UUU"
	var lineaStr  = "-----------------------"
	var totalStr  = "Total:                 "
	headerCanvi.text(headerStr);
	lineaCanvi.text(lineaStr);
	var posP = formatStr.lastIndexOf("P");
	var posI = formatStr.lastIndexOf("I");
	var posU = formatStr.lastIndexOf("U");
	formatStr = formatStr.replace(/[PIU]/g," ");
	function printInStr(pos, src, dst) {
		for (var i=src.length-1; i>=0; i--, pos--) {
			dst[pos] = src[i];
		}
	}
	function formatCanvi(div, clase, num) {
		var s = formatStr.split("");
		var imp = clase*num;
		imp = formatImport(imp, false); 
		clase = ""+clase;
		num = ""+num;	
		printInStr(posP, clase, s);
		printInStr(posI, imp, s);
		printInStr(posU, num, s);
		div.text(s.join(""));
	}
	my.start = function(_D) {
		D = _D;
		redraw();
	}	
	function redraw() {
		div0.siblings().hide();
		div0.show();
		recalculate();
	}
	function recalculate() {
		for (var i=0; i<Caja.clasesMonedas.length; i++) {
			formatCanvi(canviDivs[i], Caja.clasesMonedas[i], D.canvi[i]);
			canviDivs[i][(D.selected == i) ? "addClass" : "removeClass"]("ui-state-active"); 	
		}
		var total = Caja.totalCanvi(D.canvi);
		var s = totalStr.split("");
		printInStr(posI+2, formatImport(total, true), s);
		totalCanvi.text(s.join(""));
	}
	my.resize = function() {
		divButtons.css({ top: PADpx, right: PADpx });
		divTeclado.css({ right: PADpx, bottom: PADpx });
		var w0 = getIW(div0), h0 = getIH(div0);
		var lT = divTeclado.get(0).offsetLeft, tT = divTeclado.get(0).offsetTop;
		divButtons.css({ left: lT+"px", height: (tT-PAD)+"px" });
		posAbsolutePXM(divContCanvi, PAD, PAD, lT-PAD, h0-PAD);
		var hContC = getIH(divContCanvi);
		var hC = Math.floor(hContC/(divContCanvi.children().length));
		var testCanvi = modelCanvi.clone(false).html("<span>X</span>").appendTo(divContCanvi);
		var fs = hC;
		while (fs > 1) {
			testCanvi.css({ fontSize: fs+"px" });
			if (getOH(testCanvi) <= hC) break;
			fs--;
		} 
		testCanvi.remove();
		divContCanvi.css({ fontSize: fs+"px" });
		
	}

	return my;
};

	