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

$sql = odbc_prepare($ConnDB, "SELECT GETUTCDATE() as [utc]");
if (!odbc_execute($sql, array())) { enviarODBCError("250# GETUTCDATE()"); }

odbc_fetch_row($sql);

var_dump(odbc_result($sql, 1));
var_dump(odbc_field_name($sql,1));
var_dump(odbc_field_type($sql,1));
var_dump(odbc_field_len($sql,1));

closeDB();

?>