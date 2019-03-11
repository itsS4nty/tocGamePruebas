var DB = function() {
	var my = {};
	
	var prefijo = null;
	var principalSufix = "Principal";

	my.open = function(dbName) { return openDatabase(dbName, "", "", 5000); }
	my.getPrincipalName = function() { return prefijo+principalSufix; };
/*	my.getMensualName = function() { return prefijo+mensualSufix; };
	my.getMensualSufix = function() { return mensualSufix; };
*/	my.openPrincipal = function() {
		return my.open(my.getPrincipalName());	
	};

	function calcMensualSuffix(d) {
		var m =  /(\d+)\/(\d+)\/(\d+) /.exec(d);
		return m[3]+"_"+m[2];
	}

/*	my.openMensual = function(d) {
		if (d === true) d = new Date();
		if (d != null) my.initMensual(d);
		return openDatabase(my.getMensualName(),"","",5000);	
	};
*/	my.getSqlDate = function(_d) {
		var d = _d || new date();
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
*/	my.init = function(_prefijo) {
		prefijo = _prefijo;
//		my.initMensual();
	}
	
/*	my.initMensual = function(d) {
		lastDate = d || new Date();
		mensualSufix = calcMensualSuffix(lastDate);
	}
*//*	my.success = function (tx,r) {
		//alert("successDB: "+r.rowsAffected+" "+r.rows.length);
	}
	my.error = function (tx,e) {
		//alert("errorDB: "+e.message);
	}
*/	
	var lastMarkSincro = 0;
	my.getMarkSincro  = function() {
		var now = Date.now();
		if (lastMarkSincro < now) lastMarkSincro = now;
		else lastMarkSincro++;
		return lastMarkSincro;
	}
	function getLastMarkSincro() {
		var db = openDatabase(prefijo+"Upload", "", "", 5000);
		db.transaction(function(tx) {
			tx.executeSql("SELECT MAX(lastWrite) as m FROM [Tables_Upload]", [], function(tx,r) {
				lastMarkSincro = r.rows.item(0).m;
			}, function (tx,e) {
				lastMarkSincro = 0;
			});
		});
	}	
	
	my.preOpenMensual = function(date, tableName) {
		var sufix = calcMensualSuffix(date);
		var dbName = prefijo+sufix;
		tableName = prefijo+tableName+sufix;
		var mark = my.getMarkSincro();
		var db = openDatabase(prefijo+"Upload", "", "", 5000);
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS [Tables_Upload] "
						 +"(name text primary key, dbName text, lastWrite integer, lastSincro integer)", [],
						 function(t,r) {}, function(t,e) { 
						 alert("1-"+e.code+"##"+e.message); 
						 });
			tx.executeSql("SELECT * FROM [Tables_Upload] WHERE (name = ?)", [tableName], function(tx,r) {
				if (r.rows.length == 0) {
					tx.executeSql("INSERT INTO [Tables_Upload] (name, dbName, lastWrite, lastSincro) VALUES (?,?,?,?)",
								  [tableName, dbName, mark, 0],
						 function(t,r) {}, function(t,e) { alert("2-"+e.code+"##"+e.message); });
				} else {
					tx.executeSql("UPDATE [Tables_Upload] SET lastWrite = ? WHERE (name = ?)", [mark, tableName],
						 function(t,r) {}, function(t,e) { alert("3-"+e.code+"##"+e.message); });
				}
			}, function(t,e) { alert("4-"+e.code+"##"+e.message); });
		});
		return { tableName: tableName, dbName: dbName, mark: mark };
	}
	
	
	my.sincroCreate = function(tx, tableName, fieldsDef) {
		var stat = "CREATE TABLE IF NOT EXISTS ["+tableName+ "] ( "+fieldsDef+" [_tipo_sincro] text, [_fecha_sincro] integer )";
		tx.executeSql(stat, [], function(t,r) {}, function(t,e) { alert("10-"+e.code+"##"+e.message); });
	}

	my.sincroInsert = function(tx, tableName, fieldNames, values, mark) {
		var stat = "INSERT INTO ["+tableName+ "] ( "+fieldNames+" [_tipo_sincro], [_fecha_sincro] ) VALUES (";
		for (var i=0; i<values.length; i++) {
			stat+="?,";
		}
		stat+="?,?)";
		values = values.concat(["I", mark]);
		tx.executeSql(stat, values, function(t,r) {}, function(t,e) { alert("11-"+e.code+"##"+e.message); });
	}

	my.sincroDelete = function(tx, tableName, whereFields, values, mark ) {
		var stat = "UPDATE ["+tableName+ "] SET [_tipo_sincro] = ?, [_fecha_sincro] = ? WHERE "+whereFields;
		values = ["D", mark].concat(values);
		tx.executeSql(stat, values, function(t,r) {}, function(t,e) { alert("12-"+e.code+"##"+e.message); });
	}

	my.isSincroField = function(field) {
		return ((field == "_tipo_sincro") || (field == "_fecha_sincro"));	
	}

	return my;
}();

var GlobalGTPV = function() {
	var my = {};
	var nameDB = "GTPV";
	var data = {};
	var fSaving = 0;
	my.error = false;
	var prefijo = "";
	my.setPrefijo = function(_prefijo) { 
		prefijo = _prefijo; 
	}
	my.init = function(callback) {
		var db = openDatabase(nameDB,"","",5000);
		db.transaction(function(t) {
			t.executeSql("CREATE TABLE IF NOT EXISTS [gtpv] ([name] text primary key, [value] text)", [], function(t,r) {
				t.executeSql("SELECT * FROM [gtpv]", [], function(t,r) {
					data = {};
					for (var i=0; i<r.rows.length; i++) { 
						try {
							data[r.rows.item(i).name] = JSON.parse(r.rows.item(i).value); 
						} catch (e) {
							my.error = true;
						}
					}
					callback();
				});
			});
		});
	}
	my.get = function(name, usePref) { 
		if (usePref !== false) name = prefijo+name;
		return data[name]; 
	}
	my.set = function(name, value, usePref) {
		if (usePref !== false) name = prefijo+name;
		data[name] = value;
		fSaving++;
		var db = openDatabase(nameDB,"","",5000);
		db.transaction(function(t) {
			value = JSON.stringify(value);
			t.executeSql("INSERT OR REPLACE INTO [gtpv] (name, value) VALUES (?, ?)", [name, value], function (t,r) {
				fSaving--;
			});
		});
	}
	return my;	
}();

var LS = function() {
	var my = {};
	var prefijo = null;
	var data = {};

	my.error = false;
	
	my.init = function(_prefijo) {
		prefijo = _prefijo; 
	}
	my.get = function(name) {
		if (data[name] === undefined) {
			var value = localStorage.getItem(prefijo+name);
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
			localStorage.setItem(prefijo+name, "GTPV"+r+JSON.stringify(value)+r+"GTPV");
		}
	}
	my.remove = function(name) {
		delete data[name];
		localStorage.removeItem(prefijo+name);	
	}
	return my;	
}();

