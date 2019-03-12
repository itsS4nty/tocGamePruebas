<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Documento sin título</title>
</head>

<body>
<pre>
<?php

$a = array();

$a[4] = 7;
$a[2] = 9;
$a[0] = 1;

foreach ($a as $key => $value) {
	print_r($key);
	print_r($value);	
}
echo("\n");
ksort($a);
foreach(array_values($a) as $key => $value) {
	print_r($key);
	print_r($value);	
}

?>
</pre>
</body>
</html>