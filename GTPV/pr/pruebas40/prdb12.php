<pre>
<?php

include("db.php");

openDB();

$statement = "SELECT * FROM [test22]";
$sql = odbc_prepare($ConnDB, $statement);
odbc_execute($sql, array());

while (odbc_fetch_row($sql)) {
	echo("\nfloat1 : ".odbc_result($sql,"[f]"));
	echo("\nfloat2 : ".((float)odbc_result($sql,"[f]")));
	echo("\nfloat3 : ".odbc_result($sql,"f"));
	echo("\nfloat4 : ".((float)odbc_result($sql,"f")));
}


?>
</pre>