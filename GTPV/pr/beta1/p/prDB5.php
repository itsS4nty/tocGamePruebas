<?
header("Content-type: text/plain; charset=iso-8859-1");
//header("Content-type: text/plain; charset=utf-8");

echo("Josep Cuní\n");
echo("María José Campanario\n");

$Conn = FALSE;

function openDB() { 
	global $Conn;
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$Conn = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
}

openDB();
$sql = odbc_prepare($Conn, "SELECT * FROM C_Punset_DEPENDENTES");  
odbc_execute($sql, array()); 
while (odbc_fetch_row($sql)) {
	echo(odbc_result($sql,1)."\n");
}
echo("Josep Cuní\n");
echo("María José Campanario\n");

?>
