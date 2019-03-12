<?php

$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
if ($ConnDB === FALSE) exit();
$sql = odbc_prepare($ConnDB,
	  "ALTER TABLE G_CLIENTES ADD [ipWan] varchar(255), [ipLan] varchar(255)");
$exec = odbc_execute($sql, array()); 
if (!$exec) echo(odbc_errormsg($ConnDB));
odbc_close($ConnDB);	

?>
