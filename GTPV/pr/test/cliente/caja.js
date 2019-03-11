var Caja = function() {
	var my = {};

	my.clasesMonedas = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200, 500];

	var cajaInicial = {
		oberta : false,
		cont : 0,
		numTick : 0,
	};
	cajaInicial.canvi = [];
	for (var i=0; i<my.clasesMonedas.length; i++) { cajaInicial.canvi[i] = 0; }
	
	my.get = function() {
		var ec = LS.get("Caja");
		if (ec == null) {
			ec = cajaInicial; 
			LS.set("Caja", ec);
		}
		return ec;
	};
	my.set = function(ec) {
		ec.cont++;
		LS.set("Caja", ec);	
	}
	my.abrir = function(canvi, dep) {
		var c = my.get();
		c.oberta = true;
		c.depCodi = dep.codi;
		c.sumTick = 0;
		c.canvi = canvi;
		c.descuadre = -my.totalCanvi(canvi);
		c.clients = 0;
		c.tickets = [];
		c.apuntes = { O: [], A: [] };  
		c.date = DB.getSqlDate(new Date());
		my.set(c);
		var depCodi = c.depCodi;
		var date = c.date;
		openMoviments(date, function(tx, h) {
			for (var i=0; i<my.clasesMonedas.length; i++) {
				var cImp = normImport(canvi[i]*my.clasesMonedas[i]);
				insertMoviment(tx, h.tableName, date, depCodi, "Wi", cImp, "En:"+my.clasesMonedas[i], h.mark); 
			}
		});
	}

	my.cerrar = function(canvi, dep) {
		var c = my.get();
		c.oberta = false;
		c.depCodi = dep.codi;
		c.canvi = canvi;
		c.descuadre = c.sumTick+my.totalCanvi(canvi)-c.descuadre;
		c.date = DB.getSqlDate(new Date());
		my.set(c);
		var depCodi = c.depCodi;
		var date = c.date;
		var Z = normImport(c.sumTick);
		var J = normImport(c.descuadre);
		var G = c.clients;
		openMoviments(date, function(tx, h) {
			for (var i=0; i<my.clasesMonedas.length; i++) {
				var cImp = normImport(canvi[i]*my.clasesMonedas[i]);
				insertMoviment(tx, h.tableName, date, depCodi, "W", cImp, "En:"+my.clasesMonedas[i], h.mark); 
			}
			insertMoviment(tx, h.tableName, date, depCodi, "Z", Z, null, h.mark);
			insertMoviment(tx, h.tableName, date, depCodi, "J", J, null, h.mark);
			insertMoviment(tx, h.tableName, date, depCodi, "G", G, null, h.mark);
		});
	}

	my.apunte = function(tipo, imp, motiu, dep) {
		var c = my.get();
		c.descuadre += imp;
		c.date = DB.getSqlDate(new Date());
		c.apuntes[tipo] = c.apuntes[tipo] || [];
		c.apuntes[tipo].push({ imp: imp, motiu: motiu });
		my.set(c);
		var date = c.date;
		var depCodi = dep.codi;
		openMoviments(date, function(tx, h) {
			insertMoviment(tx, h.tableName, date, depCodi, tipo, imp, motiu, h.mark);
		});
		
	}
	
	function openMoviments(date, callBack) {
		var h = DB.preOpenMensual(date, "V_Moviments_");
		var db = DB.open(h.dbName);
		db.transaction(function (tx) {
			DB.sincroCreate(tx, h.tableName,
						    "[Botiga] float, [Data] text, [Dependenta] float, "
						   +"[Tipus_moviment] text, [Import] float, [Motiu] text, ");
			callBack(tx, h);
		});	
	}	
	function insertMoviment(tx, tableName, date, dependenta, tipus, imp, motiu, mark) {
		DB.sincroInsert(tx, tableName, "[Botiga], [Data], [Dependenta], [Tipus_moviment], [Import], [Motiu], ",
		                               [GlobalGTPV.get("Llicencia"), date, dependenta, tipus, imp, motiu], mark);
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

	var S = null;
	
	var div0 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");

	var divContCanvi = $("<div>").css({ fontFamily: "monospace" })
	                             .appendTo(div0);
	var divButtons = $("<div>").css({ position: "absolute" }).appendTo(div0);
	var divTeclado = $("<div>").css({position: "absolute", fontFamily: "monospace"})
	                           .appendTo(div0);

	var modelBut = $("<button>").css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		var t = $(this).data("data");
		var canvi = S.canvi[S.selected];
		
		if (typeof t == "number") {
			if (S.primeraTecla !== false) canvi = 0;
			if (canvi*10+t < 1000) canvi = canvi*10+t;
			S.primeraTecla = false;
		}
		if (t == "B") {	canvi = 0; }
		S.canvi[S.selected] = canvi;
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
		S.selected = $(this).data("idx");
		S.primeraTecla = true;
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
	my.start = function(_S) {
		S = _S;
		redraw();
	}	
	function redraw() {
		divShow(div0);
		recalculate();
	}
	function recalculate() {
		for (var i=0; i<Caja.clasesMonedas.length; i++) {
			formatCanvi(canviDivs[i], Caja.clasesMonedas[i], S.canvi[i]);
			canviDivs[i][(S.selected == i) ? "addClass" : "removeClass"]("ui-state-active"); 	
		}
		var total = Caja.totalCanvi(S.canvi);
		var s = totalStr.split("");
		printInStr(posI+2, formatImport(total, true), s);
		totalCanvi.text(s.join(""));
	}
	my.resize = function() {
		divButtons.css({ top: SEPpx+"px", right: SEPpx+"px" });
		divTeclado.css({ right: SEPpx+"px", bottom: SEPpx+"px" });
		var w0 = getIW(div0), h0 = getIH(div0);
		var lT = divTeclado.get(0).offsetLeft, tT = divTeclado.get(0).offsetTop;
		divButtons.css({ left: lT+"px", height: (tT-SEPpx)+"px" });
		posAbsolutePX(divContCanvi, SEPpx, SEPpx, lT-SEPpx, h0-SEPpx);
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

var DivMensajesCaja = function() {
	var my = {};
	
	var init = false;
	var div0 = positionDiv(null,0,0,100,100).addClass("ui-widget-content");
	var div1 = $("<div>").css({ position: "absolute", width: "100%", fontSize: "400%", textAlign: "center", whiteSpace: "pre" })
	                     .appendTo(div0);
	my.appendTo = function(divP, mensaje) {
		if (!init) {
			Resize.add(function() { resize(); });
			init = true;	
		}
		div1.text(mensaje);
		div0.appendTo(divP);
		divShow(div0);
		resize();
	}
	function resize() {
		if (!isDivVisible(div0)) return;
		div1.css({ top: ((div0.height()-div1.height())/2)+"px" });
	}
	
	return my;	
}();



	