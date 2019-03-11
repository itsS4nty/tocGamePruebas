<?php
header("Content-Type: text/html; charset='utf-8'");
?>
<pre>
<?php 
	$a = "a90àáñóòB7";
	$b = preg_replace("#[^0-9A-Za-z]#", "_", $a);
	var_dump($a);
	var_dump($b);
?>
	