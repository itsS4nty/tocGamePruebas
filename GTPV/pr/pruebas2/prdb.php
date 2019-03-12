<pre>
<?php
$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_GTpv;";
			
$Conn = odbc_connect($Dsn, "G_GTpv", "G_GTpv7643");

echo ("Conn " . $Conn. "\n");

$query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS";
$res = odbc_exec ( $Conn , $query);
$num = obdc_num_fields($res);

echo ("Num " . $num . "\n");
?>
</pre>
