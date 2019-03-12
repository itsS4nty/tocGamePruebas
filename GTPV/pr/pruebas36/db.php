<?php

$ConnDB = FALSE;

function openDB() { 
	global $ConnDB;
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
	if ($ConnDB === FALSE) enviarError(4); 
}

function closeDB() {
	global $ConnDB;
	if ($ConnDB != FALSE) odbc_close($ConnDB);	
}

?>
