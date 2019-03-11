window.messages = (function() {
	var my = {};
	var mess = [];
	var lang = 0;
	
	my.setLang = function(_lang) { lang = _lang; }
	my.add = function(_mess) { mess = mess.concat(_mess); }
	my.M = function(m) {
		for (var i=0; i<mess.length; i++) {
			if (mess[i][0] == m) {
				if (mess[i][lang] != null) return mess[i][lang];
				else return mess[i][0];
			}
		}
		return m;
	}
	return my;
})()

messages.setLang(1);
window.M = messages.M;

messages.add([
["Peça    Import    Unit", "Piece   Import    Unit"],
["Total:                 "],
["Esborrar Tickets", "Delete Tickets"],
["Sortida de diners", "Money out"],
["Entrada de diners", "Money in"],
["Tancar Caixa", "Close cash"],
["Borrar?", "Delete?"],
["Sí", "Yes"],
["No", "No"],
["Borrar Ticket n:", "Delete Ticket n:"],
["Caixa\nTancada", "Closed\nCash"],
["No pots realitzar\naquesta operacio", "You can not perform\nthis operation"],
["  Data : ", "  Date : "],
["Canvi Correcte", "Correct Change"],
["No pots tancar\nla Caixa", "You can not close\nthe cash"],
["Aquest article no es ven a pes", "This article is not sold by weight"],
["Aquest article es ven a pes", "This article is sold by weight"],
["Salir de GTPV?", "Exit GTPV"],
["puerta", "door"],
["Venda", "Sale"],
["Editor Teclats", "Keyboards editor"],
["Caja Fuerte", "Safe Box"],
["borrar", "delete"],
["Peso", "Weight"],
["Cobrar", "Charge"],
["Buscar Article", "Search Article"],
["Entrar Producto", "Product Input"],
["Atès Per : ", "Attended by :"],
["  UTS  DESCRIPCIO", "  UTS DESCRIPTION"],
["  PREU   IMPORT ",  "  PRICE  AMOUNT "],

]);
