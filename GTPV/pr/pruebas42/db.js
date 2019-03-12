var DB = function() {
	my = {};
	my.principalSufix = "_Principal";
	function calcMensualSuffix(d) {
		function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
		return "_"+dos0(d.getFullYear()%100)+"_"+dos0(d.getMonth());
	}
	my.mensualSufix = "";
	my.getPrincipalName = function() {
		return "DB_"+localStorage.getItem("ClienteId")+my.principalSufix;
	};
	my.getMensualName = function() {
		return "DB_"+localStorage.getItem("ClienteId")+my.mensualSufix;
	};
	my.openPrincipal = function() {
		return openDatabase(my.getPrincipalName(),"","",5000);	
	};
	my.openMensual = function() {
		return openDatabase(my.getMensualName(),"","",5000);	
	};
	my.getSqlDate = function() {
		var d = new Date();
		function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
		return dos0(d.getDate())+"/"+dos0(d.getMonth())+"/"+dos0(d.getFullYear()%100)+" "
			  +dos0(d.getHours())+":"+dos0(d.getMinutes())+":"+dos0(d.getSeconds());
	};
	my.getNumTicket = function() {
		var numTick = localStorage.getItem("LS_"+localStorage.getItem("ClienteId")+"_NumTicket");
		if (numTick == null) numTick =1;
		else numTick = parseInt(numTick, 10)+1;
		localStorage.setItem("LS_"+localStorage.getItem("ClienteId")+"_NumTicket", ""+numTick);
		return numTick;
	}
	my.init = function(_d) {
		d = _d || new Date();
		my.mensualSufix = calcMensualSuffix(d);
		var db = my.openMensual();
		db.transaction(function (tx) {
			var stat = "CREATE TABLE IF NOT EXISTS [V_Horaris"+my.mensualSufix+"] "
			          +"([Botiga] [float] NULL,	[Data] [datetime] NULL,	"
					  +"[Dependenta] [float] NULL, [Operacio] [nvarchar](25) NULL) "
			tx.executeSql(stat, [], my.success, my.error);
			var stat = "CREATE TABLE IF NOT EXISTS [V_Venuts"+my.mensualSufix+"] "
			          +"([Botiga] [float] NULL,	[Data] [datetime] NULL,	"
					  +"[Dependenta] [float] NULL, [Num_tick] [float] NULL, "
					  +"[Estat] [nvarchar](25) NULL, [Plu] [float] NULL, "
					  +"[Quantitat] [float] NULL, [Import] [float] NULL, "
					  +"[Tipus_venta] [nvarchar](25) NULL, [FormaMarcar] [nvarchar](255) NULL, "
					  +"[Otros] [nvarchar](255) NULL) "
			tx.executeSql(stat, [], my.success, my.error);
			
		});
	}
	my.success = function (tx,r) {
		//alert("successDB: "+r.rowsAffected+" "+r.rows.length);
	}
	my.error = function (tx,e) {
		alert("errorDB: "+e.message);
	}
	return my;
}();

