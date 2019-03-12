<?php
header("Content-Type: text/html; charset='utf-8'");
?>
<pre>
<?php
function f($val) {
	return utf8_encode($val);
}
$a = array("ут","бас");

$b = array_map("utf8_encode", $a);
$ff = function($val) { return utf8_encode('['.$val.']'); };
$c = array_map(function($val) { return utf8_encode('['.$val.']'); }, $a);
echo phpversion()."\n";

var_dump($b);
var_dump($a);
var_dump($c);
?>

