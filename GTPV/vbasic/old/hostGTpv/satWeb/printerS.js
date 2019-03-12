(function () {

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
						strD = strD.fillSpaceR(lenD);
						str = str+strD+dateNtStr;
						break;
					case 1 :
						str = M("  UTS  DESCRIPCIO");
						str = str.fillSpaceR(numCars-8-8)+M("  PREU   IMPORT ");
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
					else strC = strC.fillSpaceL(6);
	
					var lenC = strC.length;
	
					var strP = formatImport(t.imp/t.n, false).fillSpaceL(8);
					var strI = formatImport(t.imp, false).fillSpaceL(8);
					
					var lenN = numCars-(6+1+0+1+strP.length+1+strI.length);
					var strN = art.nom.substring(0,lenN);
					strN = strN.fillSpaceR(lenN);
					str = strC+" "+strN+" "+strP+" "+strI;
							
				} else if (idxSec-1==S.rowsT.length) {
					str = ""; while(str.length<numCars) str+="=";
				}
				break;
			case "total" :
				if (idxSec == 0) {
					var strT = formatImport(S.total, (S.currencySymbol != null) ? S.currencySymbol : true);
					var str = M("Total : ").fillSpaceR(numCars-strT.length)+strT;
				}
				break;	
		}
		return str;
	};
	
	return my;
}();
	
})(window);
