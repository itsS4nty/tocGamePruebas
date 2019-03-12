// JavaScript Document
function create_db(param) {
	var db;
	db = openDatabase("mydb", "", "display name", 20000);
	db.transaction( function (tx) { 
		tx.executeSql("CREATE TABLE foo (str)");
	});
	db.transaction( function (tx) { 
		tx.executeSql("INSERT INTO foo VALUES (?)", [param]);
	});
	return db;	
}