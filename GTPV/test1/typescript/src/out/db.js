/// <reference path="../libs/websql/websql.d.ts" />
/// <reference path="../libs/jquery/jquery.d.ts" />
var DB;
(function (DB) {
    var prefijo = "";
    var principalSufix = "Principal";
    function open(dbName) { return window.openDatabase(dbName, "", "", 5000000); }
    DB.open = open;
    function exec(tx, sqlStatement, args, callback, errorCallback) {
        tx.executeSql(sqlStatement, args, callback, function (tx, er) {
            console.log(er.message + " code:" + er.code + "\n" + sqlStatement + "\n" + args.toString());
            if (typeof errorCallback === "function")
                return errorCallback(tx, er);
            else
                return true;
        });
    }
    DB.exec = exec;
    function getPrincipalName() { return prefijo + principalSufix; }
    DB.getPrincipalName = getPrincipalName;
    ;
    function getMensualName(sqlDate) { return prefijo + getMensualSuffix(sqlDate); }
    DB.getMensualName = getMensualName;
    function openPrincipal() {
        return open(getPrincipalName());
    }
    DB.openPrincipal = openPrincipal;
    ;
    function getMensualSuffix(sqlDate) {
        var match = /(\d+)-(\d+)/.exec(sqlDate);
        return match[1] + "_" + match[2];
    }
    function dos0(x) { return ("0" + x).slice(-2); }
    function tres0(x) { return ("00" + x).slice(-3); }
    function DateToSql(_d, utc) {
        var d = _d || new Date();
        var year = (utc ? d.getUTCFullYear : d.getFullYear)();
        var month = (utc ? d.getUTCMonth : d.getMonth)();
        var date = (utc ? d.getUTCDate : d.getDate)();
        var hour = (utc ? d.getUTCHours : d.getHours)();
        var min = (utc ? d.getUTCMinutes : d.getMinutes)();
        var sec = (utc ? d.getUTCSeconds : d.getSeconds)();
        var mill = (utc ? d.getUTCMilliseconds : d.getMilliseconds)();
        return year + "-" + dos0(month + 1) + "-" + dos0(date) + " " + dos0(hour) + ":" + dos0(min) + ":" + dos0(sec) + "." + tres0(mill);
    }
    DB.DateToSql = DateToSql;
    function SqlToDate(sqlDate, utc) {
        var match = /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)(?:\.(\d+))?/.exec(sqlDate);
        if (match == null)
            return null;
        var d = new Date();
        (utc ? d.setUTCFullYear : d.setFullYear)(+match[1], +match[2] - 1, +match[3]);
        (utc ? d.setUTCHours : d.setHours)(+match[4]);
        (utc ? d.setUTCMinutes : d.setMinutes)(+match[5]);
        (utc ? d.setUTCSeconds : d.setSeconds)(+match[6]);
        (utc ? d.setUTCMilliseconds : d.setMilliseconds)(+(match[7] || 0));
        if (isNaN(d.valueOf()))
            return null;
        return d;
    }
    DB.SqlToDate = SqlToDate;
    function DateToUTCSql(d) { return DateToSql(d, true); }
    DB.DateToUTCSql = DateToUTCSql;
    function UTCSqlToDate(sqlDate) { return SqlToDate(sqlDate, true); }
    DB.UTCSqlToDate = UTCSqlToDate;
    function init(_prefijo, fInitServer) {
        prefijo = _prefijo;
        lastMarkSincro = LS.get("lastMarkSincro");
        if (typeof lastMarkSincro != "number")
            lastMarkSincro = 0;
        if (fInitServer)
            return;
        pendingSincro_UD = [];
        var startCom = LS.get("startComServer");
        if (startCom != null) {
            var db = openPrincipal();
            transactionWithErr(db, function (tx) {
                H.DB.exec(tx, "SELECT idx, value FROM [_g_PendingSincro_UD]", [], function (tx, r) {
                    for (var i = 0; i < r.rows.length; i++) {
                        var row = r.rows.item(i);
                        try {
                            var info = JSON.parse(row.value);
                            info.idx = row.idx;
                            pendingSincro_UD.push(info);
                        }
                        catch (e) { }
                    }
                    executeBlockedSql();
                });
            });
        }
    }
    DB.init = init;
    var lastMarkSincro = 0;
    my.getMarkSincro = function () {
        var now = Date.now();
        if (lastMarkSincro >= now)
            lastMarkSincro++;
        else
            lastMarkSincro = now;
        LS.set("lastMarkSincro", lastMarkSincro);
        return my.DateToUTCSql(new Date(lastMarkSincro));
    };
    function updateSincroUpload(dbName, tableName, callback) {
        var mark = my.getMarkSincro();
        var db = my.openPrincipal();
        H.DB.transactionWithErr(db, function (tx) {
            H.DB.exec(tx, "CREATE TABLE IF NOT EXISTS [Sincro_Upload] "
                + "([table] text primary key, [dbName] text, [lastWrite] text, [lastSincro] text)", []);
            H.DB.exec(tx, "SELECT * FROM [Sincro_Upload] WHERE ([table] = ?)", [tableName], function (tx, r) {
                if (r.rows.length == 0) {
                    H.DB.exec(tx, "INSERT INTO [Sincro_Upload] ([table], [dbName], [lastWrite], [lastSincro]) VALUES (?,?,?,?)", [tableName, dbName, mark, null]);
                }
                else {
                    H.DB.exec(tx, "UPDATE [Sincro_Upload] SET lastWrite = ? WHERE ([table] = ?)", [mark, tableName]);
                }
            });
        }, function () { callback({ tableName: tableName, dbName: dbName, mark: mark }); });
    }
    my.preOpenMensual = function (date, tableName, callback) {
        var dbName = my.getMensualName(date);
        tableName = my.getMensualTableName(date, tableName);
        updateSincroUpload(dbName, tableName, callback);
    };
    my.getMensualTableName = function (date, tableName) {
        return tableName + getMensualSuffix(date);
    };
    my.preOpenPrincipal = function (tableName, callback) {
        var dbName = my.getPrincipalName();
        updateSincroUpload(dbName, tableName, callback);
    };
    my.sincroCreate = function (tx, tableName, fieldsDef, callback, errorCallback) {
        var stat = "CREATE TABLE IF NOT EXISTS [" + tableName + "] ( "
            + fieldsDef + " [_tipo_sincro] text, [_fecha_sincro] text )";
        H.DB.exec(tx, stat, [], callback, errorCallback);
    };
    my.sincroInsert = function (tx, tableName, fieldNames, values, mark, callback, errorCallback) {
        var stat = "INSERT INTO [" + tableName + "] ( " + fieldNames + " [_tipo_sincro], [_fecha_sincro] ) VALUES (";
        for (var i = 0; i < values.length; i++) {
            stat += "?,";
        }
        stat += "?,?)";
        values = values.concat(["I", mark]);
        H.DB.exec(tx, stat, values, callback, errorCallback);
    };
    my.sincroDelete = function (tx, tableName, whereFields, values, mark, callback, errorCallback) {
        var stat = "UPDATE [" + tableName + "] SET [_tipo_sincro] = ?, [_fecha_sincro] = ? WHERE " + whereFields;
        values = ["D", mark].concat(values);
        H.DB.exec(tx, stat, values, callback, errorCallback);
    };
    var reloadDBHandlers = [];
    my.addReloadDBHandler = function (f) {
        if (reloadDBHandlers.indexOf(f) == -1)
            reloadDBHandlers.push(f);
    };
    function runReloadDBHandlers() {
        if (_reloadDB) {
            reloadDBHandlers.forEach(function (handler) { handler(); });
            _reloadDB = false;
        }
    }
    var lockTables = false;
    my.startComServer = function () {
        LS.set("startComServer", Date.now());
        lockTables = true;
    };
    my.endComServer = function (callback) {
        if (!executeBlockedSql(function () {
            my.endComServer(callback);
        })) {
            lockTables = false;
            LS.set("startComServer", null);
            callback();
            runReloadDBHandlers();
        }
        ;
    };
    var _reloadDB = false;
    my.reloadDB = function () {
        _reloadDB = true;
    };
    var pendingSincro_UD = [];
    function executeBlockedSql(callback) {
        function errorHandler(tx, e) {
            if (e.code !== e.QUOTA_ERR)
                return false;
            return true;
        }
        function getTransaction(dbName) {
            return function (tx) {
                for (var i = 0; i < pendingSincro_UD.length;) {
                    var p = pendingSincro_UD[i];
                    if (p.dbName == dbName) {
                        sincroUpdateDelete_UD(dbName, tx, p.table, p.keys, p.others, p.tipo, p.mark, null, errorHandler, true);
                        H.DB.exec(tx, "DELETE FROM [_g_PendingSincro_UD] WHERE (version = ?))", [p.idx], null, errorHandler);
                        pendingSincro_UD.splice(i, 1);
                    }
                    else
                        i++;
                }
            };
        }
        if (pendingSincro_UD.length === 0)
            return false;
        var cbm = new callbackManager(callback);
        var dbNames = [];
        pendingSincro_UD.forEach(function (pendInfo) {
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
        H.DB.exec(tx, "CREATE TABLE IF NOT EXISTS [_g_PendingSincro_UD] (idx int, value text)", []);
        H.DB.exec(tx, "INSERT INTO [_g_PendingSincro_UD] (idx, value) VALUES (?, ?)", [idx, JSON.stringify(info)], function (tx, r) { if (typeof callback === "function")
            callback(tx, r); });
    }
    function sincroUpdateDelete_UD(dbName, tx, tableName, keys, others, tipo, mark, callback, errorCallback, fNoLock) {
        if (lockTables && !fNoLock) {
            var info = { dbName: dbName, table: tableName, keys: keys, others: others, tipo: tipo, mark: mark };
            savePendingSincro_UD(tx, infoTx, callback);
            return;
        }
        var set = [], where = [], values = [];
        for (var o in others) {
            set.push("[" + o + "] = ?");
            values.push(others[o]);
        }
        set.push("[_tipo_sincro] = ?");
        values.push(tipo);
        set.push("[_fecha_sincro] = ?");
        values.push(mark);
        for (var k in keys) {
            where.push("([" + k + "] = ?)");
            values.push(keys[k]);
        }
        var stat = "UPDATE [" + tableName + "] SET " + set.join(", ") + " WHERE " + where.join(" AND ");
        H.DB.exec(tx, stat, values, function (tx, r) {
            if (r.rowsAffected != 0) {
                if (typeof callback === "function")
                    callback(tx, r);
            }
            else {
                var insert = [];
                var values = [];
                for (var o in others) {
                    insert.push("[" + o + "]");
                    values.push(others[o]);
                }
                insert.push("[_tipo_sincro]");
                values.push(tipo);
                insert.push("[_fecha_sincro]");
                values.push(mark);
                for (var k in keys) {
                    insert.push("[" + k + "]");
                    values.push(keys[k]);
                }
                var questMark = [];
                for (var i = 0; i < insert.length; i++)
                    questMark.push("?");
                var stat = "INSERT INTO [" + tableName + "] (" + insert.join(", ") + ") VALUES (" + questMark.join(", ") + ")";
                H.DB.exec(tx, stat, values, callback, errorCallback);
            }
        }, errorCallback);
    }
    my.sincroUpdate_UD = function (dbName, tx, tableName, keys, others, mark, callback, errorCallback) {
        return sincroUpdateDelete_UD(dbName, tx, tableName, keys, others, "I", mark, callback, errorCallback);
    };
    my.sincroDelete_UD = function (dbName, tx, tableName, keys, mark, callback, errorCallback) {
        return sincroUpdateDelete_UD(dbName, tx, tableName, keys, {}, "D", mark, callback, errorCallback);
    };
    my.isSincroField = function (field) {
        return ((field == "_tipo_sincro") || (field == "_fecha_sincro"));
    };
    function dummyFunc() { }
    ;
    function transactionWithErr(db, transactionCallback, successCallback, errorCallback) {
        function errorQuota(e) {
            if (e.code !== e.QUOTA_ERR) {
                if (typeof errorCallback === "function")
                    errorCallback(e);
                return;
            }
            var alertErrorDB = newAlertDialog().header(M("Error")).text(M("Error en base de datos") + ": " + M("Quota DB"));
            alertErrorDB.appendTo("body").show();
        }
        if (successCallback == null)
            successCallback = dummyFunc;
        db.transaction(transactionCallback, errorQuota, successCallback);
    }
    DB.transactionWithErr = transactionWithErr;
    return my;
})(DB || (DB = {}));
();
H.ConfigGTPV = function () {
    var my = {};
    var nameDB = "GTPV";
    var dataDB = {};
    my.error = false;
    var prefijo = "";
    my.setPrefijo = function (_prefijo) {
        prefijo = _prefijo;
    };
    my.init = function (callback) {
        var db = H.DB.open(nameDB);
        db.transaction(function (tx) {
            H.DB.exec(tx, "CREATE TABLE IF NOT EXISTS [gtpv] ([name] text primary key, [value] text)", []);
            H.DB.exec(tx, "SELECT * FROM [gtpv]", [], function (tx, r) {
                dataDB = {};
                for (var i = 0; i < r.rows.length; i++) {
                    try {
                        dataDB[r.rows.item(i).name] = JSON.parse(r.rows.item(i).value);
                    }
                    catch (e) {
                        my.error = true;
                    }
                }
            });
        }, function (e) { alert(e.message); }, callback);
    };
    my.get = function (name, usePref) {
        if (usePref !== false)
            name = prefijo + name;
        return dataDB[name];
    };
    my.set = function (name, value, usePref, callback) {
        var argsA;
        if (name instanceof Array) {
            argsA = name;
            callback = value;
        }
        else
            argsA = [[name, value, usePref]];
        var argsObj = argsA.map(function (argA) {
            var argObj = {};
            ["name", "value", "usePref"].forEach(function (p, i) { argObj[p] = argA[i]; });
            if (argObj.usePref !== false)
                argObj.name = prefijo + argObj.name;
            dataDB[argObj.name] = argObj.value;
            argObj.value = JSON.stringify(argObj.value);
            return argObj;
        });
        var db = H.DB.open(nameDB);
        H.DB.transactionWithErr(db, function (tx) {
            argsObj.forEach(function (argObj) {
                H.DB.exec(tx, "INSERT OR REPLACE INTO [gtpv] (name, value) VALUES (?, ?)", [argObj.name, argObj.value]);
            });
        }, callback);
    };
    return my;
}();
H.Scripts.addLocalExec("LSS", "L2C", function () {
    window.LS = function () {
        var my = {};
        var prefijo = "";
        my.error = false;
        my.init = function (_prefijo) {
            prefijo = _prefijo;
        };
        my.get = function (name) {
            var value = localStorage.getItem(prefijo + name);
            if (typeof value == "string") {
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    my.error = true;
                    my.errorValue = value;
                }
            }
            return null;
        };
        my.set = function (name, value) {
            if (value === undefined) {
                localStorage.removeItem(prefijo + name);
            }
            else {
                localStorage.setItem(prefijo + name, JSON.stringify(value));
            }
        };
        my.remove = function (name) {
            localStorage.removeItem(prefijo + name);
        };
        function errorQuota(e) {
            var alertErrorDB = newAlertDialog().header(M("Error")).text(M("Error en base de datos") + ": " + M("Quota LS"));
            alertErrorDB.appendTo("body").show();
        }
        my.save = function (name, value) {
            try {
                my.set(name, value);
            }
            catch (e) {
                errorQuota(e);
            }
        };
        return my;
    }();
});
//# sourceMappingURL=db.js.map