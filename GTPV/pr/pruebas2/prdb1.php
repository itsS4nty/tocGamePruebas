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

$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS";
$res = odbc_exec ( $Conn , $query);
$numRows = odbc_num_rows($res);
$numFields = odbc_num_fields($res);

echo ("Num " . $num . "\n");
while(odbc_fetch_row ( $res )) {
	for ($i=0; $i<$numFields; $i++) {
	   echo ("Field: " . odbc_field_name($res, $i) . " = " . odbc_result($res, $i) ."\r");	
	}
	echo("------------\n");
}

?>
</pre>
</body>
