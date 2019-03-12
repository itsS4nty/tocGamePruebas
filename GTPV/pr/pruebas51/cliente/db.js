function escapePrefijo(prefijo) {
	return prefijo;
}
var DB = function() {
	var my = {};
	
	var prefijo = null;
	var date = null;
	var principalSufix = "_Principal";
	var mensualSufix = "";
	
	function calcMensualSuffix(d) {
		function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
		return "_"+dos0(d.getFullYear()%100)+"_"+dos0(d.getMonth()+1);
	}
	my.getPrincipalName = function() { return prefijo+principalSufix; };
	my.getMensualName = function() { return prefijo+mensualSufix; };
	my.getMensualSufix = function() { return mensualSufix; };
	my.openPrincipal = function() {
		return openDatabase(my.getPrincipalName(),"","",5000);	
	};
	my.openMensual = function() {
		return openDatabase(my.getMensualName(),"","",5000);	
	};
	my.getSqlDate = function(_d) {
		var d = _d || new Date();
		function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
		return dos0(d.getDate())+"/"+dos0(d.getMonth()+1)+"/"+dos0(d.getFullYear()%100)+" "
			  +dos0(d.getHours())+":"+dos0(d.getMinutes())+":"+dos0(d.getSeconds());
	};
//	my.getNumTicket = function() { return 0; }
/*	my.getNumTicket = function() {
		var numTick = localStorage.getItem("LS_"+localStorage.getItem("ClienteId")+"_NumTicket");
		if (numTick == null) numTick =1;
		else numTick = parseInt(numTick, 10)+1;
		localStorage.setItem("LS_"+localStorage.getItem("ClienteId")+"_NumTicket", ""+numTick);
		return numTick;
	}
*/	my.init = function(_prefijo, _d) {
		prefijo = escapePrefijo(_prefijo);
		if ((date != null) && (_d == null)) return;
		date = _d || new Date();
		mensualSufix = calcMensualSuffix(date);
	}
	my.success = function (tx,r) {
		//alert("successDB: "+r.rowsAffected+" "+r.rows.length);
	}
	my.error = function (tx,e) {
		//alert("errorDB: "+e.message);
	}
	return my;
}();

var GlobalGTPV = function() {
	var my = {};
	var nameDB = "GTPV";
	var data = {};
	var fSaving = 0;
	var prefijo = "";
	my.setPrefijo = function(_prefijo) { 
		prefijo = escapePrefijo(_prefijo); 
	}
	my.init = function(callback) {
		var db = openDatabase(nameDB,"","",50);
		db.transaction(function(t) {
			t.executeSql("CREATE TABLE IF NOT EXISTS [gtpv] ([name] text primary key, [value] text)", [], function(t,r) {
				t.executeSql("SELECT * FROM [gtpv]", [], function(t,r) {
					data = {};
					for (var i=0; i<r.rows.length; i++) { data[r.rows.item(i).name] = JSON.parse(r.rows.item(i).value); }
					callback();
				});
			});
		});
	}
	my.get = function(name, usePref) { 
		if (usePref !== false) name = prefijo+"_"+name;
		return data[name]; 
	}
	my.set = function(name, value, usePref) {
		if (usePref !== false) name = prefijo+"_"+name;
		if (data[name] === value) return;
		data[name] = value;
		fSaving++;
		var db = openDatabase(nameDB,"","",50);
		db.transaction(function(t) {
			value = JSON.stringify(value);
			t.executeSql("INSERT OR REPLACE INTO [gtpv] (name, value) VALUES (?, ?)", [name, value], function (t,r) {
				fSaving--;
			});
		});
	}
//	my.getWP = function(name) { return my.get(prefijo+"_"+name); }
//	my.setWP = function(name, value) { my.set(prefijo+"_"+name, value); }
	return my;	
}();

var LS = function() {
	var my = {};
	var prefijo = null;
	var data = {};

	my.error = false;
	
	my.init = function(_prefijo) {
		prefijo = escapePrefijo(_prefijo); 
	}
	my.get = function(name) {
		if (data[name] === undefined) {
			var value = localStorage.getItem(prefijo+"_"+name);
			if (typeof value == "string") {
				if ((value.length < 16) ||
				    (value.slice(0, 4) != "GTPV") ||
					(value.slice(value.length-4) != "GTPV") ||
					(value.slice(4, 8) != value.slice(value.length-8, value.length-4))) {
				 	my.error = true;
				} else {
					value = value.slice(8, value.length-8);
					try {
						data[name] = JSON.parse(value);	
					} catch (e) {
						my.error = true;
					}
				}
			}
		}
		return data[name];
	}
	my.set = function(name, value) {
		if (value === undefined) {
			my.remove(name);
		} else {
			var r = "000"+(Math.random()*10000);
			r = r.slice(r.length-4);
			localStorage.setItem(prefijo+"_"+name, "GTPV"+r+JSON.stringify(value)+r+"GTPV");
		}
	}
	my.remove = function(name) {
		delete data[name];
		localStorage.removeItem(prefijo+"_"+name);	
	}
	return my;	
}();

