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

$sql = odbc_prepare($ConnDB, "select * from INFORMATION_SCHEMA.COLUMNS");
$ret = odbc_execute($sql, array());
odbc_result_all($sql);

closeDB();
?>