<pre>
<?php

include("db.php");

openDB();

$statement = "SELECT S.*, T.* FROM [G_TABLAS_SINCRONIA] AS S LEFT JOIN [G_TABLAS_SINCRONIA] AS T ON S.producto = T.producto";
$sql = odbc_prepare($ConnDB, $statement);
odbc_execute($sql, array());

echo("\nnum_rows: ".odbc_num_rows($sql)); 

for ($i=1; $i<=odbc_num_fields($sql); $i++) {
	echo("\nname ".odbc_field_name ($sql, $i)); 
	echo("\nlen ".odbc_field_len ($sql, $i)); 
	echo("\nscale ".odbc_field_scale ($sql, $i));
	echo("\ntype ".odbc_field_type ($sql, $i)); 
}

while (odbc_fetch_row($sql)) {
echo("\nnum_rows: ".odbc_num_rows($sql));
for ($i=1; $i<=odbc_num_fields($sql); $i++) {
	echo("\nname ".odbc_field_name ($sql, $i)); 
	echo("\nlen ".odbc_field_len ($sql, $i)); 
	echo("\nscale ".odbc_field_scale ($sql, $i));
	echo("\ntype ".odbc_field_type ($sql, $i)); 
	echo("\nvalue ".odbc_result($sql, $i));
	echo("\nisNULL ".(odbc_result($sql, $i) === NULL));
}
}

$a = 111;
echo("444$a7777\n");
echo("444[$a]7777\n");
echo("444{$a}7777\n");
echo("444${a}7777\n");
echo("444_$a_7777\n");
echo("444_${a}_7777\n");
?>
</pre>