/// <reference path="../libs/jquery/jquery.d.ts" />
/*
interface IDBDatabase extends EventTarget {
    name: string;
    objectStoreNames: DOMStringList;
    onabort: (ev: Event) => any;
    onerror: (ev: Event) => any;
    onversionchange: (ev: Event) => any;
    version: string;
    close(): void;
    createObjectStore(name: string, optionalParameters?: any): IDBObjectStore;
    deleteObjectStore(name: string): void;
    transaction(storeNames: any, mode?: string): IDBTransaction;
    addEventListener(type: "abort", listener: (ev: UIEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "error", listener: (ev: ErrorEvent) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}
*/
interface IDBDatabase {
    onversionchange: (ev: Event) => any;
}

module DB {
	var appDB:IDBDatabase;
	var firstTimeOpenAppDB = false;
	var pendingGetDB:((db: IDBDatabase)=>void)[] = [];

	var fBlockedAppDB=false;
	var pendingUnblocked:(() => void)[] = [];
	
	function waitUnblocked(callback:()=>void) {
		if (fBlockedAppDB) {
			pendingUnblocked.push(callback);
		} else callback();
	}
	function block() { 
		fBlockedAppDB = true; 
	}
	function unblock() { 
		fBlockedAppDB = false; 
		var tmp = pendingUnblocked;
		pendingUnblocked = [];
		tmp.forEach((callback) => { waitUnblocked(callback); });
	}
	function getAppDB(callback:(db: IDBDatabase)=>void) {
		function openAppDB(callback:()=> void) { 
			
			var req = indexedDB.open(getAppDBName());
			req.onsuccess = function(ev) {
				appDB = <IDBDatabase>req.result;
				appDB.onversionchange = function(ev) {
					appDB.close();
					appDB = null;
					openAppDB(executePending);
				}
				callback();
			}
		} 
		function executePending() {
			var tmp = pendingGetDB;
			pendingGetDB = [];
			tmp.forEach((callback) => { getAppDB(callback) });
		}
		if (!firstTimeOpenAppDB) { 
			firstTimeOpenAppDB = true;
			pendingGetDB.push(callback);
			openAppDB(executePending); 
			return; 
		}
		if (!appDB) {
			pendingGetDB.push(callback); 
			return;
		}
		if (fBlockedAppDB) waitUnblocked(() => { getAppDB(callback); });
		else if (callback) callback(appDB);
	}
	
	function getAppDBName() {
		return "db"; //??
	}

	export function createTransaction(objectStoreNames:string[], fWrite: boolean, callback:(tr:IDBTransaction)=>void) {
		getAppDB((db) => {
			var tr:IDBTransaction;
			try {
				tr = db.transaction(objectStoreNames||db.objectStoreNames, fWrite ? "readwrite" : "read");
			} catch (e) {
			}
			callback(tr);	
		})
	}  
	export var appObjectNames = {
		articles : "articles",
		families : "families",
		codisBarres: "codisBarres",
		dependentes: "dependentes",
		dependentesExtes: "dependentesExtes",
		horaris: "v_horaris"
	}
	
	// BD modificado por el servidor, aplicacion recarga todos los datos
	// Servidor manda señal para recargar
	var reloadDBHandlers:((callback:()=>void)=>void)[] = [];

	export function addReloadDBHandler(f:(callback:()=>void)=>void) {
		reloadDBHandlers.push(f);	
	}

	function runReloadDBHandlers(callback:()=>void) {
		var n=0;
		function getCB() {
			n++;
			return () => {n--; if (n==0) callback();}
		}
		reloadDBHandlers.forEach(function(handler) { handler(getCB()); });
	}
	
	export function mensualInsert(osName: string, keyPath:any, val: any, callback:()=>void) {
		osName = mensualName(osName);
		if (!appDB.objectStoreNames.contains(osName)) {
			waitUnblocked(() => {
				var req = open(getAppDBName(),)
			}	
		}
	}

}


	var my = {};
	
	var prefijo = "";
	var principalSufix = "Principal";

	my.open = function(dbName) { return openDatabase(dbName, "", "", 5000000); }

	my.exec = function(tx, sqlStatement, args, callback, errorCallback) {
		tx.executeSql(sqlStatement, args, callback, function (t,e) {
			console.log(e.message+" code:"+e.code+"\n"+sqlStatement+"\n"+args.toString());
			if (typeof errorCallback === "function") return errorCallback(t,e);
			else return true; // anular transaccion, simular no errorCallback en executeSql, return null no funciona
		});
	}
	
	// nombres base de datos
	my.getPrincipalName = function() { return prefijo+principalSufix; };
	my.getMensualName = function(sqlDate) { return prefijo+getMensualSuffix(sqlDate); }
/*	my.getMensualName = function() { return prefijo+mensualSufix; };
	my.getMensualSufix = function() { return mensualSufix; };
*/	my.openPrincipal = function() {
		return my.open(my.getPrincipalName());	
	};

	function getMensualSuffix(d) {
		var m =  /(\d+)-(\d+)/.exec(d);
		return m[1]+"_"+m[2];
	}

/*	my.openMensual = function(d) {
		if (d === true) d = new Date();
		if (d != null) my.initMensual(d);
		return openDatabase(my.getMensualName(),"","",5000);	
	};
*/	
	function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }   // 0x, xx
	function tres0(x) { for (x = x.toString(); x.length < 3; x = "0"+x); return x; }  // 00x, 0xx, xxx
/*	my.getSqlDate = function(_d) {
		var d = _d || new date();
		return d.getFullYear()+"-"+dos0(d.getMonth()+1)+"-"+dos0(d.getDate())+" "
			  +dos0(d.getHours())+":"+dos0(d.getMinutes())+":"+dos0(d.getSeconds());
	};
*/	
	// sqlDate -> YYYY-MM-DD hh:mm:ss.xxx
	// fecha utc en fechas sincronizar, server y cliente no estan en la misma zona horaria
	my.DateToSql = function(_d, utc) {
		var d = _d || new Date();
		function get(func) { return "get"+((utc === true) ? "UTC" : "")+func; } // getUTCHours o getHours
		return d[get("FullYear")]()+"-"+dos0(d[get("Month")]()+1)+"-"+dos0(d[get("Date")]())+" "
			  +dos0(d[get("Hours")]())+":"+dos0(d[get("Minutes")]())+":"+dos0(d[get("Seconds")]())+"."
			  +tres0(d[get("Milliseconds")]());
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
	
	my.init = function(_prefijo, fInitServer) {
		prefijo = _prefijo;
		lastMarkSincro = LS.get("lastMarkSincro");
		if (typeof lastMarkSincro != "number") lastMarkSincro = 0;  
		if (fInitServer) return;
//		my.initMensual();
		pendingSincro_UD = [];
		var startCom = LS.get("startComServer");
		if (startCom != null) {
			db = H.DB.openPrincipal();  // pendingSincro_UD de momento solo Principal 
			H.DB.transactionWithErr(db, function(tx) {
				H.DB.exec(tx, "SELECT idx, value FROM [_g_PendingSincro_UD]", [], function(tx, r) {
					for (var i=0; i<r.rows.length; i++) {
						var row = r.rows.item(i);
						try {
							var info = JSON.parse(row.value);
							info.idx = row.idx;
							pendingSincro_UD.push(info);
						} catch(e) {}	
					}
					executeBlockedSql();
				});
			});
		}
		
/*		getLastMarkSincro(function() {
			if (lastMarkSincro > Date.now()) {
				// remarcar tablas ????
			}
			
		});
*/		
	}

	// marca sincronizar es la fecha Sql actual, pero no puede anterior a la ultima marca  
	var lastMarkSincro = 0;
	my.getMarkSincro  = function() {
		var now = Date.now();
		if (lastMarkSincro >= now) lastMarkSincro++;
		else lastMarkSincro	= now;
		LS.set("lastMarkSincro", lastMarkSincro);
		return my.DateToUTCSql(new Date(lastMarkSincro));
	}
/*	function getLastMarkSincro(callback) {
		var db = my.openPrincipal();
		lastMarkSincro = 0;
		db.transaction(function(tx) {
			H.DB.exec(tx, "SELECT MAX(lastWrite) as m FROM [Sincro_Upload]", [], function(tx,r) {
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
*/	
	// gestion tablas con sincronizacion
	
	// tabla [Sincro_Upload] en BD principal
	// [Sincro_Upload] : (table, dbName, lastWrite, lastSincro)
	// (table, dbName) -> tabla sincronizar
	// lastWrite -> marca escritura cliente local
	// lastSincro -> marca lectura por servidor 
	function updateSincroUpload(dbName, tableName, callback) {
		var mark = my.getMarkSincro();
		var db = my.openPrincipal();
		H.DB.transactionWithErr(db, function(tx) {
			H.DB.exec(tx, "CREATE TABLE IF NOT EXISTS [Sincro_Upload] "
					   +"([table] text primary key, [dbName] text, [lastWrite] text, [lastSincro] text)", []);
			H.DB.exec(tx, "SELECT * FROM [Sincro_Upload] WHERE ([table] = ?)", [tableName], function(tx,r) {
				if (r.rows.length == 0) {
					H.DB.exec(tx, "INSERT INTO [Sincro_Upload] ([table], [dbName], [lastWrite], [lastSincro]) VALUES (?,?,?,?)",
								[tableName, dbName, mark, null]);
				} else {
					H.DB.exec(tx, "UPDATE [Sincro_Upload] SET lastWrite = ? WHERE ([table] = ?)", [mark, tableName]);
				}
			});
		}, function() { callback({ tableName: tableName, dbName: dbName, mark: mark }) }
		);
	}
	// preOpen : marcar tabla upload para sincronizar, solo en escritura, no abre la BD
	my.preOpenMensual = function(date, tableName, callback) {
//		var sufix = calcMensualSuffix(date);
		var dbName = my.getMensualName(date);
		tableName = my.getMensualTableName(date, tableName);
		updateSincroUpload(dbName, tableName, callback);
	}
	my.getMensualTableName = function(date, tableName) {
		return tableName+getMensualSuffix(date);
	}
	my.preOpenPrincipal = function(tableName, callback) {
		var dbName = my.getPrincipalName();
		updateSincroUpload(dbName, tableName, callback);
	}
	
	// tablas con sincronizacion
	// formato: (campos tabla), [_tipo_sincro], [_fecha_sincro]
	// [_tipo_sincro] -> I: insertar registro, D: borrar registro
	my.sincroCreate = function(tx, tableName, fieldsDef, callback, errorCallback) {
		var stat = "CREATE TABLE IF NOT EXISTS ["+tableName+ "] ( "
		           +fieldsDef+" [_tipo_sincro] text, [_fecha_sincro] text )";
		H.DB.exec(tx, stat, [], callback, errorCallback);
	}

	my.sincroInsert = function(tx, tableName, fieldNames, values, mark, callback, errorCallback) {
		var stat = "INSERT INTO ["+tableName+"] ( "+fieldNames+" [_tipo_sincro], [_fecha_sincro] ) VALUES (";
		for (var i=0; i<values.length; i++) {
			stat+="?,";
		}
		stat+="?,?)";
		values = values.concat(["I", mark]);
		H.DB.exec(tx, stat, values, callback, errorCallback);
	}

	my.sincroDelete = function(tx, tableName, whereFields, values, mark, callback, errorCallback) {
		var stat = "UPDATE ["+tableName+ "] SET [_tipo_sincro] = ?, [_fecha_sincro] = ? WHERE "+whereFields;
		values = ["D", mark].concat(values);
		H.DB.exec(tx, stat, values, callback, errorCallback);
	}

	// BD modificado por el servidor, aplicacion recarga todos los datos
	// Servidor manda señal para recargar
	var reloadDBHandlers = [];
	
	my.addReloadDBHandler = function(f) {
		if (reloadDBHandlers.indexOf(f) == -1) 
			reloadDBHandlers.push(f);	
	}

	function runReloadDBHandlers() {
		if (_reloadDB) {
			reloadDBHandlers.forEach(function(handler) { handler(); });
			_reloadDB = false;
		}	
	}

	var lockTables = false;
	my.startComServer = function() { 
		LS.set("startComServer", Date.now());
		lockTables = true; 
	}
	my.endComServer = function(callback) { 
		if (!executeBlockedSql(function() {   // sql bloqueadas durante actualizacion con servidor
			// sql añadida entre executeBlockedSql,forEach,getTransaction y
			// ejecución de esa transaccion en db diferente a alguna bloqueada en comunicación
			// imposible que se de esta situación
			my.endComServer(callback); 
		})) { // no more pendingSincro_UD
			lockTables = false;
			LS.set("startComServer", null);
			callback();
			runReloadDBHandlers();	
		};
	}
	var _reloadDB = false;
	my.reloadDB = function(){
		_reloadDB = true; 
	}
	
	var pendingSincro_UD = [];
	function executeBlockedSql(callback) {
		function errorHandler(tx, e) {
			if (e.code !== e.QUOTA_ERR) return false; // no anular transacción
			return true;
		}
		function getTransaction(dbName) {
			return function(tx) {
				for (var i=0; i<pendingSincro_UD.length; ) {
					var p = pendingSincro_UD[i];
					if (p.dbName == dbName) {
						sincroUpdateDelete_UD(dbName, tx, p.table, p.keys, p.others, p.tipo, p.mark, null, errorHandler, true);
						H.DB.exec(tx,"DELETE FROM [_g_PendingSincro_UD] WHERE (version = ?))", [p.idx], null, errorHandler); 
						pendingSincro_UD.splice(i,1);
						//LS.set("pendingSincro_UD", pendingSincro_UD);
					} else i++;
				}
			}
		}
		if (pendingSincro_UD.length === 0) return false;
		var cbm = new callbackManager(callback);
		var dbNames = [];
		pendingSincro_UD.forEach(function(pendInfo) {
			var dbName = pendInfo.dbName;
			if (dbNames.indexOf(dbName) == -1) {
				dbNames.push(dbName);
				var db = my.open(dbName);
				db.transactionWithErr(getTransaction(dbName), cbm.get()); 
			}
		});
		cbm.activate();
		return true;
	}
	var idx_PendingSincro_UD = 1;
	function savePendingSincro_UD(tx, info, callback) {
		var idx = idx_PendingSincro_UD++;
		info.idx = idx;
		pendingSincro_UD.push(info);
		H.DB.exec(tx,"CREATE TABLE IF NOT EXISTS [_g_PendingSincro_UD] (idx int, value text)",[]);
		H.DB.exec(tx,"INSERT INTO [_g_PendingSincro_UD] (idx, value) VALUES (?, ?)", 
		          [ idx, JSON.stringify(info) ],
				  function(tx, r) { if (typeof callback === "function") callback(tx,r); });
	}
	function sincroUpdateDelete_UD(dbName, tx, tableName, keys, others, tipo, mark, callback, errorCallback, fNoLock) {
		if (lockTables && !fNoLock) {
			var info = {dbName: dbName, table: tableName, keys: keys, others: others, tipo: tipo, mark: mark};
			savePendingSincro_UD(tx, infoTx, callback);
			return;
//			LS.set("pendingSincro_UD", pendingSincro_UD);
		}
		var set = [], where = [], values = [];
		for (var o in others) {
			set.push("["+o+"] = ?");
			values.push(others[o]);
		}
		set.push("[_tipo_sincro] = ?");
		values.push(tipo);
		set.push("[_fecha_sincro] = ?");
		values.push(mark);
		for (var k in keys) { 
			where.push("(["+k+"] = ?)");
			values.push(keys[k]);
		}
		var stat = "UPDATE ["+tableName+"] SET "+set.join(", ")+" WHERE "+where.join(" AND ");
		H.DB.exec(tx, stat, values, function(tx, r) {
			if (r.rowsAffected != 0) { if (typeof callback === "function") callback(tx,r); }
			else {
				var insert = [];
				var values = [];
				for (var o in others) {
					insert.push("["+o+"]");
					values.push(others[o]);
				}
				insert.push("[_tipo_sincro]");
				values.push(tipo);
				insert.push("[_fecha_sincro]");
				values.push(mark);
				for (var k in keys) {
					insert.push("["+k+"]");
					values.push(keys[k]);
				}
				var questMark = []; for (var i=0; i<insert.length; i++) questMark.push("?");
				
				var stat = "INSERT INTO ["+tableName+"] ("+insert.join(", ")+") VALUES ("+questMark.join(", ")+")";
				H.DB.exec(tx, stat, values, callback, errorCallback);
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

/*	var fInTransaction = false;
	var divInTransaction = $("<div>").css({ zIndex: "800" });
	my.inTransaction = function(set, block) {
		if (set === undefined) return fInTransaction;
		if (set && fInTransaction) return false;
		if (set) {
			fInTransaction = true;
			if (block === true) divInTransaction.appendTo("body");	
		} else {
			divInTransaction.remove();	
			fInTransaction = false;
		}
		return true; 	
	}
*/
	
/*	var errorHandler = null; 
	my.setErrorHandler = function(handler) { errorHandler = handler; };
	my.clearErrorHandler = function() { errorHandler = null; };
*/	
	
	function dummyFunc() {};

	my.transactionWithErr = function(db, transactionCallback, successCallback, errorCallback) {
		 function errorQuota(e) {
			if (e.code !== e.QUOTA_ERR) {
				if (typeof errorCallback === "function") errorCallback(e);
				return;
			}

			var alertErrorDB = newAlertDialog().header(M("Error")).text(M("Error en base de datos")+": "+M("Quota DB"));
			alertErrorDB.appendTo("body").show();		
		}
		
		if (successCallback == null) successCallback = dummyFunc; // error android

		db.transaction(transactionCallback, errorQuota, successCallback);
	}

	return my;
}();


}
