<pre>
<?php

class s {
	public $q;
}

$o = new s();
var_dump($o);
$o->q = 1;
var_dump($o);
var_dump($o->a);
var_dump($o->{'q'});
print_r($o);
$o->b=2;
var_dump($o->b);
var_dump($o);
var_dump($eee);
$r = $hhh;
var_dump($r);
var_dump(is_object($o));
var_dump(is_object($o->k1));

try {
	throw "333";
} catch (Exception $e) {
	var_dump($e);
}
?>