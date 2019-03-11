<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Documento sin título</title>
<script src="../pruebas2/jquery-1.5.1.js"></script>
</head>

<body>
<pre>
<?php

function oo() {
	echo("oo");	
}

Oo();

$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
			
$Conn = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");

echo ("Conn " . $Conn. "\n");

$sql = odbc_prepare($Conn, "SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
$exec = odbc_execute($sql, array($idCliente, $productoCl, $versionCl));

if ($exec) echo("true"); else echo("false");
?>
</pre>
</body>
</html>