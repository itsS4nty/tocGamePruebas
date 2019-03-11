<?php

$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");

$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES_2"); 
$exec = odbc_execute($sql, array());

echo(odbc_num_fields($sql));

for ($i=1; $i<=odbc_num_fields($sql); $i++) {
	echo(odbc_field_name($sql, $i));
}

for ($i=1; $i<20; $i++) {
	echo(odbc_field_name($sql, $i)."--".odbc_result($sql,$i)."---");
}

echo((odbc_field_name($sql, 15) == NULL)?"NULL":"NONULL");
odbc_result_all($sql);
?>
