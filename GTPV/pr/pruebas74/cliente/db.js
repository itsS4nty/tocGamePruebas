var DB = function() {
	var my = {};
	
	var prefijo = null;
	var principalSufix = "Principal";

	my.open = function(dbName) { return openDatabase(dbName, "", "", 5000); }

	my.exec = function(tx, sqlStatement, args, callback, errorCallback) {
		tx.executeSql(sqlStatement, args, callback, function (t,e) {
			console.log(e.message+" code:"+e.code+"\n"+sqlStatement+"\n"+args.toString());
			if (errorCallback != null) return errorCallback(t,e);
			else return true;
		});
	}

	my.getPrincipalName = function() { return prefijo+principalSufix; };
/*	my.getMensualName = function() { return prefijo+mensualSufix; };
	my.getMensualSufix = function() { return mensualSufix; };
*/	my.openPrincipal = function() {
		return my.open(my.getPrincipalName());	
	};

	function calcMensualSuffix(d) {
		var m =  /(\d+)-(\d+)-(\d+) /.exec(d);
		return m[1]+"_"+m[2];
	}

/*	my.openMensual = function(d) {
		if (d === true) d = new Date();
		if (d != null) my.initMensual(d);
		return openDatabase(my.getMensualName(),"","",5000);	
	};
*/	
	function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
	function tres0(x) { for (x = x.toString(); x.length < 3; x = "0"+x); return x; }
/*	my.getSqlDate = function(_d) {
		var d = _d || new date();
		return d.getFullYear()+"-"+dos0(d.getMonth()+1)+"-"+dos0(d.getDate())+" "
			  +dos0(d.getHours())+":"+dos0(d.getMinutes())+":"+dos0(d.getSeconds());
	};
*/	my.DateToSql = function(_d, utc) {
		var d = _d || new Date();
		function get(func) { return "get"+((utc === true) ? "UTC" : "")+func; }
		return d[get("FullYear")]()+"-"+dos0(d[get("Month")]()+1)+"-"+dos0(d[get("Date")]())+" "
			  +dos0(d[get("Hours")]())+":"+dos0(d[get("Minutes")]())+":"+dos0(d[get("Seconds")]())+"."+tres0(d[get("Milliseconds")]());
	}
	my.SqlToDate = function(sql, utc) {
		var m = /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)(?:\.(\d+))?/.exec(sql);
		if (m == null) return null;
		function set(func) { return "set"+((utc === true) ? "UTC" : "")+func; }
		var d = new Date();
		d[set("FullYear")](m[1],m[2]-1,m[3]);
		d[set("Hours")](m[4]);
		d[set("Minutes")](m[5]);
		d[set("Seconds")](m[6]);
		d[set("Milliseconds")](m[7] || 0);
		if (isNaN(d.valueOf())) return null; 
		return d;
	}
	my.DateToUTCSql = function(d) { return my.DateToSql(d, true); }
	my.UTCSqlToDate = function(d) { return my.SqlToDate(d, true); }
	
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
		pendingSincro_UD = LS.get("pendingSincro_UD");
		if (!(pendingSincro_UD instanceof Array)) pendingSincro_UD = [];
		executeBlockedSql();
		
		getLastMarkSincro(function() {
			if (lastMarkSincro > Date.now()) {
				// remarcar tablas ????
			}
			
		});
		
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
		if (lastMarkSincro >= now) lastMarkSincro++;
		else lastMarkSincro	= now;
		return my.DateToUTCSql(new Date(lastMarkSincro));
	}
	function getLastMarkSincro(callback) {
		var db = my.openPrincipal();
		lastMarkSincro = 0;
		db.transaction(function(tx) {
			DB.exec(tx, "SELECT MAX(lastWrite) as m FROM [Sincro_Upload]", [], function(tx,r) {
				if (r.rows.length > 0) { 
					var m = my.UTCSqlToDate(r.rows.item(0).m)
					if (m != null) {
						m=m.getTime();
						if ((typeof m == 'number') && (isFinite(m))) lastMarkSincro = m;
					}
				}	
				callback();
			}, function (tx,e) {
				callback();
			});
		});
	}	
	function updateSincroUpload(dbName, tableName) {
		var mark = my.getMarkSincro();
		var db = my.openPrincipal();
		db.transaction(function(tx) {
			DB.exec(tx, "CREATE TABLE IF NOT EXISTS [Sincro_Upload] "
					   +"([table] text primary key, [dbName] text, [lastWrite] text, [lastSincro] text)", []);
			DB.exec(tx, "SELECT * FROM [Sincro_Upload] WHERE ([table] = ?)", [tableName], function(tx,r) {
				if (r.rows.length == 0) {
					DB.exec(tx, "INSERT INTO [Sincro_Upload] ([table], [dbName], [lastWrite], [lastSincro]) VALUES (?,?,?,?)",
								[tableName, dbName, mark, null]);
				} else {
					DB.exec(tx, "UPDATE [Sincro_Upload] SET lastWrite = ? WHERE ([table] = ?)", [mark, tableName]);
				}
			});
		});
		return { tableName: tableName, dbName: dbName, mark: mark };
	}
	my.preOpenMensual = function(date, tableName) {
		var sufix = calcMensualSuffix(date);
		var dbName = prefijo+sufix;
		tableName = tableName+sufix;
		return updateSincroUpload(dbName, tableName);
	}
	my.preOpenPrincipal = function(tableName) {
		var dbName = my.getPrincipalName();
		return updateSincroUpload(dbName, tableName);
	}
	
	my.sincroCreate = function(tx, tableName, fieldsDef, callback, errorCallback) {
		var stat = "CREATE TABLE IF NOT EXISTS ["+tableName+ "] ( "
		           +fieldsDef+" [_tipo_sincro] text, [_fecha_sincro] text )";
		DB.exec(tx, stat, [], callback, errorCallback);
	}

	my.sincroInsert = function(tx, tableName, fieldNames, values, mark, callback, errorCallback) {
		var stat = "INSERT INTO ["+tableName+"] ( "+fieldNames+" [_tipo_sincro], [_fecha_sincro] ) VALUES (";
		for (var i=0; i<values.length; i++) {
			stat+="?,";
		}
		stat+="?,?)";
		values = values.concat(["I", mark]);
		DB.exec(tx, stat, values, callback, errorCallback);
	}

	my.sincroDelete = function(tx, tableName, whereFields, values, mark, callback, errorCallback) {
		var stat = "UPDATE ["+tableName+ "] SET [_tipo_sincro] = ?, [_fecha_sincro] = ? WHERE "+whereFields;
		values = ["D", mark].concat(values);
		DB.exec(tx, stat, values, callback, errorCallback);
	}

	var reloadDBHandlers = [];
	
	my.addReloadDBHandler = function(f) {
		if (reloadDBHandlers.indexOf(f) == -1) 
			reloadDBHandlers.push(f);	
	}

	function runReloadDBHandlers() {
		if (_reloadDB) {
			reloadDBHandlers.forEach(function(handler) { handler(); });
			_realodDB = false;
		}	
	}

	var lockTables = false;
	my.setComServer = function(com) {
		if (com) lockTables = true;
		else {
			lockTables = false;
			executeBlockedSql();
			runReloadDBHandlers();	
		}
	}
	var _reloadDB = false;
	my.reloadDB = function(){
		_reloadDB = true; 
	}
	var pendingSincro_UD = [];
	function executeBlockedSql() {
		function getTransaction(dbName) {
			return function(tx) {
				for (var i=0; i<pendingSincro_UD.length; ) {
					var p = pendingSincro_UD[i];
					if ((p.dbName == dbName) && (!lockTables)) {
						sincroUpdateDelete_UD(dbName, tx, p.table, p.keys, p.others, p.tipo, p.mark, null, null);
						pendingSincro_UD.splice(i,1);
						LS.set("pendingSincro_UD", pendingSincro_UD);
					} else i++;
				}
			}
		}
		var dbNames = [];
		pendingSincro_UD.forEach(function(pendSql) {
			var dbName = pendSql.dbName;
			if (dbNames.indexOf(dbName) == -1) {
				dbNames.push(dbName);
				var d = my.open(dbName);
				d.transaction(getTransaction(dbName)); 
			}
		});
	}
	function sincroUpdateDelete_UD(dbName, tx, tableName, keys, others, tipo, mark, callback, errorCallback) {
		if (lockTables) {
			pendingSincro_UD.push({dbName: dbName, table: tableName, keys: keys, others: others, tipo: tipo, mark: mark});
			LS.set("pendingSincro_UD", pendingSincro_UD);
			if (typeof callback === "function") callback(tx, null);
			return;
		}
		var set = [], where = [], values = [];
		for (var o in others) {
			if (!others.hasOwnProperty(o)) continue; 
			set.push("["+o+"] = ?");
			values.push(others[o]);
		}
		set.push("[_tipo_sincro] = ?");
		values.push(tipo);
		set.push("[_fecha_sincro] = ?");
		values.push(mark);
		for (var k in keys) { 
			if (!keys.hasOwnProperty(k)) continue;
			where.push("(["+k+"] = ?)");
			values.push(keys[k]);
		}
		var stat = "UPDATE ["+tableName+"] SET "+set.join(", ")+" WHERE "+where.join(" AND ");
		DB.exec(tx, stat, values, function(tx, r) {
			if (r.rowsAffected != 0) { if (typeof callback === "function") callback(tx,r); }
			else {
				var insert = [];
				var values = [];
				for (var o in others) {
					if (!others.hasOwnProperty(o)) continue; 
					insert.push("["+o+"]");
					values.push(others[o]);
				}
				insert.push("[_tipo_sincro]");
				values.push(tipo);
				insert.push("[_fecha_sincro]");
				values.push(mark);
				for (var k in keys) {
					if (!keys.hasOwnProperty(k)) continue; 
					insert.push("["+k+"]");
					values.push(keys[k]);
				}
				var questMark = []; for (var i=0; i<insert.length; i++) questMark.push("?");
				
				var stat = "INSERT INTO ["+tableName+"] ("+insert.join(", ")+") VALUES ("+questMark.join(", ")+")";
				DB.exec(tx, stat, values, callback, errorCallback);
			}
		} , errorCallback);
	}

	my.sincroUpdate_UD = function(dbName, tx, tableName, keys, others, mark, callback, errorCallback) {
		return sincroUpdateDelete_UD(dbName, tx, tableName, keys, others, "I", mark, callback, errorCallback);
	}

	my.sincroDelete_UD = function(dbName, tx, tableName, keys, mark, callback, errorCallback) {
		return sincroUpdateDelete_UD(dbName, tx, tableName, keys, {}, "D", mark, callback, errorCallback);
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
		db.transaction(function(tx) {
			DB.exec(tx, "CREATE TABLE IF NOT EXISTS [gtpv] ([name] text primary key, [value] text)", []);
			DB.exec(tx, "SELECT * FROM [gtpv]", [], function(tx,r) {
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
	}
	my.get = function(name, usePref) { 
		if (usePref !== false) name = prefijo+name;
		return data[name]; 
	}
	my.set = function(name, value, usePref) {
		if (usePref !== false) name = prefijo+name;
		if (data[name] == value) return; 
		data[name] = value;
		fSaving++;
		var db = openDatabase(nameDB,"","",5000);
		db.transaction(function(tx) {
			value = JSON.stringify(value);
			DB.exec(tx, "INSERT OR REPLACE INTO [gtpv] (name, value) VALUES (?, ?)", [name, value], function (tx,r) {
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
				try {
					data[name] = JSON.parse(value);	
				} catch (e) {
					my.error = true;
					my.errorValue = value;
					my.errorMessage = 2;
				}
			}
		}
		return data[name];
	}
	my.set = function(name, value) {
		if (value === undefined) {
			my.remove(name);
		} else {
			localStorage.setItem(prefijo+name, JSON.stringify(value));
		}
	}
	my.remove = function(name) {
		delete data[name];
		localStorage.removeItem(prefijo+name);	
	}
	return my;	
}();

