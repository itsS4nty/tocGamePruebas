
var lastMarkSincro = 0;
function getMarkSincro() {
	var now = Date.now();
	if (lastMarkSincro < now) lastMarkSincro = now;
	else lastMarkSincro++;
	return lastMarkSincro;
}

function calcMensualSuffix(d) {
	function dos0(x) { for (x = x.toString(); x.length < 2; x = "0"+x); return x; }
	return dos0(d.getFullYear()%100)+"_"+dos0(d.getMonth()+1);
}


function preOpenMensual(date, tableName) {
	var sufix = calcmensualSuffix(date);
	var dbName = prefijo+sufix;
	nombreTable = prefijo+nombreTable;
	var mark = getMarkSincro();
	var db = openDatabase(prefijo+"local", "", "", 5000);
	db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS [Tables_Upload] "+
		             +"(name text primary key, dbName text, lastWrite integer, lastSincro integer)", []);
		tx.executeSql("SELECT * FROM [Tables_Upload] WHERE (name = ?)", [tableName], function(tx,r) {
			if (r.rows.length == 0) {
				tx.executeSql("INSERT INTO [Tables_Upload] (name, dbName, lastWrite, lastSincro) VALUES (?,?,?,?)",
				              [tableName, dbName, mark, 0]);
			} else {
				tx.executeSql("UPDATE [Tables_Upload] SET lastWrite = ? WHERE (name = ?)", [mark, tableName]);
			}
		});
	});
	return { tableName: tableName, dbName: dbName, mark: mark };
}

function sincroCreate(tx, tableName, fieldsDef) {
	var stat = "CREATE TABLE IF NOT EXISTS "+tableName+ "( "+fieldsDef+" [_tipo_sincro] text, [_fecha_sincro] integer )";
	tx.executeSql(stat, values);
}

function sincroInsert(tx, tableName, fieldNames, values, mark) {
	var stat = "INSERT INTO "+tableName+ "( "+fieldNames+" [_tipo_sincro], [_fecha_sincro] ) VALUES (";
	for (var i=0; i<values.length; i++) {
		stat+="?,";
	}
	stat+="?,?)";
	values = values.concat(["I", mark]);
	tx.executeSql(stat, values);
}

function sincroDelete(tx, tableName, whereFields, values, mark ) {
	var stat = "UPDATE "+tableName+ "SET [_tipo_sincro] = ?, [_fecha_sincro] = ? WHERE "+whereFields;
	values = ["D", mark].concat(values);
	tx.executeSql(stat, values);
}

