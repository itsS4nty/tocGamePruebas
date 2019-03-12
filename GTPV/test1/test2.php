<?php
$a = "{\"j1\":null1,\"j2\":1,\"j3\":\"rrr1\",\"j4\":{\"prop1\":1,\"prop2\":2},\"j5\":[1,2,\"abc\\u00f1\\u00e0\\u00f3\",\"def\\\"jjj\\\\a\\r\\n\\\/r\\\/0\\u0000&:\"],\"j6\":\"\\\/\\\/\",\"j7\":[]}";
$b = json_decode($a );

header("Content-Type: text/html; charset=utf-8");
echo "<pre>";
var_dump($b);
var_dump($b->j3);
foreach($b as $k => $v) {
	var_dump($k);
	var_dump($v);
}
var_dump(array("g"=>"l"));
var_dump(ARRAY());
var_dump(array());
var_dump(json_last_error());
var_dump(JSON_ERROR_SYNTAX);
?>