<pre>
<?php

$a = 0.9;
echo("f1: $a\n");
echo("f2: ".strval($a)."\n");

include("db.php");

openDB();

$statement = "DROP TABLE test30";
$sql = odbc_prepare($ConnDB, $statement);
odbc_execute($sql, array());

$statement = "CREATE TABLE test30 (f decimal(18,3))";
$sql = odbc_prepare($ConnDB, $statement);
odbc_execute($sql, array());

$statement = "INSERT INTO TEST30 VALUES (?)";
$sql = odbc_prepare($ConnDB, $statement);
odbc_execute($sql, array(0.9));

$statement = "SELECT f FROM test30";
$sql = odbc_prepare($ConnDB, $statement);
odbc_execute($sql, array());

odbc_fetch_row($sql);
$f = odbc_result($sql,1);
echo("f3: $f\n");
echo("f4: ".(float)$f."\n");



?>
</pre>