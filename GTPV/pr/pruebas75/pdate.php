<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Documento sin título</title>
</head>

<body>
<pre>
<?
$t = time();
echo($t."\n");
$m = microtime(TRUE);
echo($m."\n");
echo(gmdate("Y-m-d H:i:s.u e O", $t)."\n");
echo(date("Y-m-d H:i:s e.u O", $t)."\n");
?>
</pre>
<?
$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
$sql = odbc_prepare($ConnDB, "SELECT 'GETUTCDATE()       ', GETUTCDATE();");
odbc_execute($sql, array());
odbc_result_all($sql);
$sql = odbc_prepare($ConnDB, "SELECT 'GETDATE()       ', GETDATE();");
odbc_execute($sql, array());
odbc_result_all($sql);

$sql = odbc_prepare($ConnDB, "SELECT TOP 1 * FROM DEFAULT_TeclatsTpv");
odbc_execute($sql, array());
for ($i=1; $i<=odbc_num_fields($sql); $i++) 
	echo(odbc_field_type($sql, $i)."\n");
odbc_close($ConnDB);	
?>
<pre>
<?
$a = array("a" => 1, "b" => NULL);
foreach($a as $k=>$v) echo ("k $k => v $v\n");
var_dump(isset($a["b"]));
var_dump(isset($a["c"]));
var_dump(array_key_exists("b", $a));
var_dump(array_key_exists("c", $a));
var_dump($a);
unset($a["b"]);
var_dump($a);
function f1(&$c) {
	$c = array(1,2);	
}
f1($r);
var_dump($r);

var_dump("2000-10-10" === "2000-10-09");
var_dump("2000-10-10" === "2000-10-10");
var_dump("" < "2000-10-09");
var_dump("2000-10-10 00:00:01" > "2000-10-10 00:00:00.999");
var_dump("2000-10-10 00:00:01" == 2000);

?>
</pre>
</body>
</html>