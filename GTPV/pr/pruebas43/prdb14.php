<?php

echo(phpversion());
include("db.php");

openDB();
$result = odbc_gettypeinfo($ConnDB);
odbc_result_all($result);
?>
