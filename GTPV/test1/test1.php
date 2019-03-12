<pre>
<?php

$obj1 = Array("prop1" => 1, "prop2" => 2, "i" => null);
$obj2 = (object)$obj1;
$arr = Array(1,2,"abcñàó","def\"jjj\a\r\n/r/0\0&:",null);

$a = Array("j1" => null, "j2" => 1, "j3" => "rrr1", "j4" => $obj2, "j5" => $arr, "j6" => "//", "j7" => $obj1);

$b = json_encode($a);

var_dump($a);
var_dump($b);
var_dump($obj1);
var_dump($obj2);
function q1() {
	$qqq[]="q1";
	$qqq[]="q2";
	var_dump($qqq);
}

for ($i=0; $i<10; $i++) q1();	
/*
print_r($b); 
//print_r(json_encode($b));
var_dump(json_last_error());
var_dump($a["j5"][4]);*/

//header("Content-Type: application/json");
echo $b;
?>