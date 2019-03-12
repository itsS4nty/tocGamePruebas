H.Scripts.addLocalExec("messagesS", "L2", function() {

window.messages = (function() {
	var my = {};
//	var mess = [];
	var mess = Object.create(null);
	var idxLang = 0;
	
	my.setLang = function(lang) { 
		if (typeof lang === "number") idxLang = lang;
		else idxLang = langNames.indexOf(lang);
		if ((idxLang < 0) || (idxLang >= langNames.length)) idxLang = 0;
	}
	my.getLang = function() {
		return langNames[idxLang];
	}
/*	my.add = function(_mess) { mess = mess.concat(_mess); }
	my.M = function(m) {
		for (var i=0; i<mess.length; i++) {
			if (mess[i][0] == m) {
				if (mess[i][lang] != null) return mess[i][lang];
				else return m;
			}
		}
		return m;
	}
*/	
	my.add = function(_mess) {
		_mess.forEach(function(m) { mess[m[0]] = m; });
	}
	my.M = function(m) {
		if (mess[m] && mess[m][idxLang]) return mess[m][idxLang];
		else return m;	
	}
	var langNames = ["español", "english"];
	
	my.getLangNames = function() { return langNames; }
	return my;
})();


messages.setLang(0);
window.M = messages.M;

messages.add([

["Peça     Import    Unit", "Piece    Import    Unit"],
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
[" N.Ticket:", " N.Ticket:"],
["Atès Per : ", "Attended by :"],
["Total : ", "Total : "],
["  UTS  DESCRIPCIO", "  UTS DESCRIPTION"],
["  PREU   IMPORT ", "  PRICE  AMOUNT "],
["ambient ", "environment "],
[" ja existeix", " already exists"],
["Borrar Grup ", "Delete Group "],
["Nou Grup", "New Group"],
["Renombrar Grup", "Rename Group"],
["Borrar Grup", "Delete Group"],
["Borrar Article", "Delete Article"],
["Num. Tick : ", "Num. Tick : "],
["  Data : ", "  Date : "],
["Borrar ticket", "Delete ticket"],
["Altres", "Others"],
["Entrada/Salida Dependenta", "input/output employee"],
["Configuración", "Configuration"],
["Impresora", "Printer"],
["Password incorrecto", "Incorrect password"],
["Plega ", "Finish "],
["Entrar", "Enter"],
["Plegar", "Finish"],
["Plegar?", "Finish?"],
["Esperi...", "Wait..."],
["Applet no actiu", "Applet no active"],
["rxtx no activo", "rxtx no active"],
["Seleccionar", "Select"],
["idioma", "language"],
["Buscar Article", "Search Article"],
["Entrar Producto", "Enter Product"],
["Error en base de datos", "Error in database"],

]);

}); // add Scripts messages
