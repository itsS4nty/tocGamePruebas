(function () {

window.createCajaS = function(host, isAdmin) {
	window.createCajaS = null; // no double initialize
	
	var my = {};
	window.Caja = my;
	
	my.clasesMonedas = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200, 500];

	var ts = null;
	var infoCaja = { oberta: false };
	infoCaja.canvi = my.clasesMonedas.map(function(m) { return 0; });
	var movimientos = {};
	
	var changeHandlers = [];
	
	function runChangeHandlers(autochange) {
		setTimeout(function() {
			changeHandlers.forEach(function(h) { h(autochange); });
		},0);
	}

	my.addChangeHandler = function(changeHandler) {
		changeHandlers.push(changeHandler);
	}

	my.isOpen = function() {
		return infoCaja.oberta;
	}
	
	my.checkOpen = function(div) {
		if (my.isOpen()) return true;
		if (div.isVisible()) DivMensajesCaja.appendTo(div, "Caixa\nTancada");
		return false;
	}
	
	if (isAdmin) {
		my.getCanvi = function() {
			return infoCaja.canvi.slice(0);
		}
		my.totalCanvi = function(canvi) {
			var total = 0;
			for (var i=0; i<my.clasesMonedas.length; i++) {
				total += my.clasesMonedas[i]*canvi[i];
			}
			return total;
		}
		my.getTickets = function() {
			return movimientos.tickets || [];
		}
		my.getApuntes = function(tipoAp) {
			var apuntes=[];
			if (movimientos.apuntes != null)
				movimientos.apuntes.forEach(function(ap) {
					if (ap.tipo === tipoAp) apuntes.push(ap);
				});
			return apuntes;
		}
		function deleteMovimiento(tipoMov, mov, callback) {
			if (movimientos[tipoMov] == null) return false;
			var idx = movimientos[tipoMov].indexOf(mov);
			if (idx === -1) return false;
			for (var p in mov) if (typeof mov[p] !== "object") delete mov[p];
			host.call("deleteMovimiento", [ts, tipoMov, mov], callback);
			movimientos[tipoMov].splice(idx,1);
			return true;
		}
		my.deleteTicket = function(t, callback) { 
			return deleteMovimiento("tickets", t, callback); 
		}

		function insertMovimiento(tipoMov, mov, callback) {
			movimientos[tipoMov] = movimientos[tipoMov] || [];
			host.call("insertMovimiento", [ts, tipoMov, mov], callback);
			movimientos[tipoMov].push(mov);
		}
		
		my.generateApunte = function(tipo, imp, motiu, codiDep, callback) {
			var mov = { imp: imp, motiu: motiu, tipo: tipo, codiDep: codiDep };
			insertMovimiento("apuntes", mov, callback);
		}
		
		my.abrir = function(canvi, codiDep, callback) {
			host.call("abrir", [ts, canvi, codiDep], callback);
		}
		
		my.cerrar = function(canvi, codiDep, callback) {
			infoCaja.oberta = false;
			runChangeHandlers(true);
			host.call("cerrar", [ts, canvi, codiDep], callback);
		}
	}
	
	my.isAdmin = function() {
		return isAdmin;
	}	
	
	var comFromHost = {
/*			setType: function(_type) {
			type = _type;
		}
*/		actualize: function(_ts, _infoCaja, _movimientos) {
			ts = _ts;
			infoCaja = _infoCaja;
			movimientos = _movimientos;
			runChangeHandlers(false);
			return true;
		},
		infoCaja : function(_infoCaja) {
			infoCaja = _infoCaja;
			runChangeHandlers(false);
			return true;
		},
		movimientos : function(_movimientos) {	
			if (_movimientos == null) return false;
			for (var p in _movimientos) {
				movimientos[p] = movimientos[p] || [];
				_movimientos[p].forEach(function(item) {
					function gIndexOf(a, obj) {
						function eq(obj1, obj2) {
							for (p1 in obj1) { 
								if (obj1[p1] != obj2[p1]) return false;
							}		
							return true;
						}
						for (var i=0; i<a.length; i++) {
							if (eq(a[i], obj)) return i;
						}
						return -1;
					}
					var idx = gIndexOf(movimientos[p], item[1]);
					
					switch(item[0]) {
						case "a" :
							if (idx === -1) movimientos[p].push(item[1]);
							break;
						case "d" :
							if (idx !== -1) movimientos[p].splice(idx,1);
							break;
					}
				});	
			}
			runChangeHandlers(false);
			return true;
		}
	}
	return comFromHost;
}

window.newSubAppCanviCaja = function() {
	var my = {};

	var S = null;
	
	var div0 = $("<div>")._100x100().addClass("g-widget-content");

	var divContCanvi = $("<div>").css({ fontFamily: "monospace" })
	                             .appendTo(div0);
	var divButtons = $("<div>").css({ position: "absolute" }).appendTo(div0);
	var divTeclado = $("<div>").css({position: "absolute", fontFamily: "monospace"})
	                           .appendTo(div0);

	var butModel = gButton().css({width: "3em", height: "3em", whiteSpace: "pre"}).click(function (e) {
		if (e.button !== 0) return;
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
			butModel.clone(true).text(butT[y][x]).data("data", butT[y][x]).appendTo(div2);				
		}
	}
	
	function canviHandler(e) {
		if (e.button !== 0) return;
		S.selected = $(this).data("idx");
		S.primeraTecla = true;
		redraw();
	}
	var canviModel = $("<div>").css({ whiteSpace: "pre", overflow: "hidden", textAlign: "center" })
	                           .addClass("g-state-default");
								
	var headerCanvi = canviModel.clone(false).appendTo(divContCanvi);							
	
	var canviDivs = [];
	function insertCanviDivs() {
		if (canviDivs.length === Caja.clasesMonedas.length) return;
		canviDivs.forEach(function(c) { c.remove(); })
		canviDivs = [];
		var after = headerCanvi;
		for (var i=0; i<Caja.clasesMonedas.length; i++) {
			canviDivs[i] = canviModel.clone(true).data("idx", i).click(canviHandler).insertAfter(after);
			after = canviDivs[i];
		}
	}
	var lineaCanvi = canviModel.clone(false).appendTo(divContCanvi);
	var totalCanvi = canviModel.clone(false).appendTo(divContCanvi);
	
	my.getDiv = function() { return div0; }
	my.getDivButtons = function() { return divButtons; }
	
	var headerStr = "Peça     Import    Unit"
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
		insertCanviDivs();
		redraw();
	}	
	function redraw() {
		div0.showAlone();
		
		// recalculate

		for (var i=0; i<Caja.clasesMonedas.length; i++) {
			formatCanvi(canviDivs[i], Caja.clasesMonedas[i], S.canvi[i]);
			canviDivs[i][(S.selected == i) ? "addClass" : "removeClass"]("g-state-active"); 	
		}
		var total = Caja.totalCanvi(S.canvi);
		var s = totalStr.split("");
		printInStr(posI+2, formatImport(total, true), s);
		totalCanvi.text(s.join(""));
	}
	my.resize = function() {
		divButtons.css({ top: SEPpx+"px", right: SEPpx+"px" });
		divTeclado.css({ right: SEPpx+"px", bottom: SEPpx+"px" });
		var w0 = div0.iWidth(), h0 = div0.iHeight();
		var lT = divTeclado.get(0).offsetLeft, tT = divTeclado.get(0).offsetTop;
		divButtons.css({ left: lT+"px", height: (tT-SEPpx)+"px" });
		divContCanvi.absolutePosPx(SEPpx, SEPpx, lT-SEPpx, h0-SEPpx);
		var hContC = divContCanvi.iHeight();
		var hC = Math.floor(hContC/(divContCanvi.children().length));
		var testCanvi = canviModel.clone(false).text("X").appendTo(divContCanvi);
		var fs = 4;
		do {
			testCanvi.css({ fontSize : (++fs)+"px" });
		} while (testCanvi.oHeight() <= hC);
		fs--;
		
		testCanvi.remove();
		divContCanvi.css({ fontSize: fs+"px" });		
	}

	return my;
};

window.DivMensajesCaja = function() {
	var my = {};
	
	var init = false;
	var div0 = $("<div>")._100x100().addClass("g-widget-content");
	var div1 = $("<div>").css({ position: "absolute", width: "100%", fontSize: "400%", textAlign: "center", whiteSpace: "pre" })
	                     .appendTo(div0);
	my.appendTo = function(divP, mensaje) {
		if (!init) {
			Resize.add(function() { resize(); });
			init = true;	
		}
		div1.text(mensaje);
		div0.appendTo(divP);
		div0.showAlone();
		resize();
	}
	function resize() {
		if (!div0.isVisible()) return;
		div1.css({ top: ((div0.height()-div1.height())/2)+"px" });
	}
	
	return my;	
}();

})(window);
