<?php

$Conn = FALSE;

function openDB() { 
	global $Conn;
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$Conn = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
	if ($Conn === FALSE) enviarError(4); 
}

function closeDB() {
	global $Conn;
	if ($Conn != FALSE) odbc_close($Conn);	
}

?>
