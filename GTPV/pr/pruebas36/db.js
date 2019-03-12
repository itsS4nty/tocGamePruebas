var DB = function() {
	my = {};
	my.principalSufix = "_Principal";
	function calcMensualSuffix(d) {
		for (var y = (d.getFullYear()%100).toString(); y.length < 2; y = "0"+y);
		for (var m = d.getMonth().toString(); m.length < 2; m = "0"+m);
		return "_"+y+"_"+m;
	}
	var d = new Date();
	my.mensualSufix = calcMensualSuffix(d);
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
	my.init = function(d) {
		d = d || new Date();
		my.mensualSufix = calcMensualSuffix(d);
		var db = my.openMensual();
		db.transaction(function (tx) {
			var stat = "CREATE TABLE IF NOT EXISTS [V_Horaris"+my.mensualSufix+"] "
			          +"([Botiga] [float] NULL,	[Data] [datetime] NULL,	"
					  +"[Dependenta] [float] NULL, [Operacio] [nvarchar](25) NULL) "
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

