<pre>
<?php
$ConnDB = FALSE;

function openDB() { 
	global $ConnDB;
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
	if ($ConnDB === FALSE) enviarError("401# open DB"); 
}

function closeDB() {
	global $ConnDB;
	if ($ConnDB != FALSE) odbc_close($ConnDB);	
}

openDB();
/*
$sql = odbc_prepare($ConnDB, "CREATE TABLE test20150811_1 (id INT, d datetime)");
$ret = odbc_execute($sql, array());
var_dump($ret);
*/
$sql = odbc_prepare($ConnDB, "INSERT INTO test20150811_1 (id, d) VALUES (?,?)");
$ret = odbc_execute($sql, array(2,"2015-08-11T19:30:32.440"));
var_dump($ret);

$sql = odbc_prepare($ConnDB, "SELECT * FROM test20150811_1");
$ret = odbc_execute($sql, array());
var_dump($ret);

while (odbc_fetch_row($sql)) {
	var_dump(odbc_result($sql, 1));
	var_dump(odbc_field_name($sql,1));
	var_dump(odbc_field_type($sql,1));
	var_dump(odbc_result($sql, 2));
	var_dump(odbc_field_name($sql,2));
	var_dump(odbc_field_type($sql,2));
}

closeDB();

?>