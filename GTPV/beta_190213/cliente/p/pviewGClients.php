<?php
$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
if ($ConnDB === FALSE) exit();
$sql = odbc_prepare($ConnDB,
	  "SELECT * FROM G_CLIENTES");
$exec = odbc_execute($sql, array()); 
if (!$exec) {
	echo(odbc_errormsg($ConnDB));
} else {
	odbc_result_all($sql);
}
odbc_close($ConnDB);	
?>
