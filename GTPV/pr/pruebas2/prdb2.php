<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Documento sin título</title>
<script src="jquery-1.5.1.js"></script>
</head>

<body>
<pre>
<?php
$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
			
$Conn = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");

echo ("Conn " . $Conn. "\n");

$query = "CREATE TABLE G_TABLAS_SINCRONIA (producto varchar(255), version varchar(255), tabla varchar(255), modoSincro varchar(255))";
$res = odbc_exec ( $Conn , $query);

$query = "INSERT INTO G_TABLAS_SINCRONIA VALUES('TPV', '0.1', 'C_Punset_ARTICULOS', 'upload')";
$res = odbc_exec ( $Conn , $query);

$query = "CREATE TABLE C_Punset_ARTICULOS (nombre varchar(255), precio float)";
$res = odbc_exec ( $Conn , $query);

$query = "INSERT INTO C_Punset_ARTICULOS VALUES('Agua', 1.0)";
$res = odbc_exec ( $Conn , $query);
$query = "INSERT INTO C_Punset_ARTICULOS VALUES('Cafe', 1.50)";
$res = odbc_exec ( $Conn , $query);

?>
</pre>
</body>
</html>