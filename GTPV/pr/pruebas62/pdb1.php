<?php

$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");

//$stat = "DELETE FROM [p34_V_Horaris_2011_06] WHERE ([Botiga] IS NULL) "/*AND ([Data] = ?) */."AND ([Dependenta] = ?) AND ([Operacio] = ?)";
//$args = array(/*'2011/06/29 12:56:38',*/ '2061', 'E');
$stat = "INSERT INTO [p34_V_Horaris_2011_06] (  [Botiga], [Data], [Dependenta], [Operacio] ) VALUES (  ?, ?, ?, ?)";
$args = array(NULL,'2011-06-29 17:07:03','2061','E');
$sql = odbc_prepare($ConnDB, $stat); 
if (!odbc_execute($sql, $args)) {
	echo(odbc_errormsg($ConnDB));	
}
echo ("\nfin\n");

$a = array(NULL);

print_r($a);
var_dump($a);


$a = array();
$a[] = 1;
$a[] = NULL;
$a[] = 2;
var_dump($a);


?>