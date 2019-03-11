/// <reference path="../libs/jquery/jquery.d.ts" />
var DB;
(function (DB) {
    ;
    function getSchema(dbName, callback) {
        var openReq = indexedDB.open(dbName);
        openReq.onupgradeneeded = function (ev) {
            openReq.transaction.abort();
            callback({ name: dbName, version: 0, objectStores: {} });
        };
        function keyPath(v) {
            if (v instanceof DOMStringList)
                return Array.prototype.slice.call(v);
            else
                return v;
        }
        openReq.onsuccess = function (ev) {
            var db = openReq.result;
            var objectStores = Object.create(null);
            if (db.objectStoreNames.length > 0) {
                var tr = db.transaction(db.objectStoreNames);
                for (var idxO = 0; idxO < db.objectStoreNames.length; idxO++) {
                    var indexs = Object.create(null);
                    var os = tr.objectStore(db.objectStoreNames[idxO]);
                    for (var idxI = 0; idxI < os.indexNames.length; idxI++) {
                        var index = os.index(os.indexNames[idxI]);
                        indexs[index.name] = { keyPath: keyPath(index.keyPath),
                            unique: index.unique, multiEntry: index.multiEntry };
                    }
                    objectStores[os.name] = { keyPath: keyPath(os.keyPath), indexs: indexs };
                }
            }
            var name = db.name;
            var version = +db.version;
            db.close();
            callback({ name: name, version: version, objectStores: objectStores });
        };
    }
    DB.getSchema = getSchema;
})(DB || (DB = {}));
//# sourceMappingURL=db2 - copia.js.map