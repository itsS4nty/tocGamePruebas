<pre>
<?php
/*	var_dump(NULL == FALSE);
	var_dump(NULL === FALSE);
	$f=FALSE;
	var_dump(isset($f));
*/
/*	$e = array('e','f');	
	$a = array('p'=>$e);
	var_dump($e);
	var_dump($a);
	unset($a['p']);
	var_dump($e);
	var_dump($a);
*/
	$path = "./";
	var_dump($path);
	$path = substr($path, 2);
	if ($path === "") $path = "./";
	var_dump($path);
	exit();
	
	
	function &q2(&$a) {
		return $a['e'];
	}
	function &q1(&$a) {
		return q2($a); 
	}

	
	$a = array('e' => array());
	$b = &q1($a);
	$b[]=2;
	var_dump($a);
	var_dump($b);
	exit();

	function &q() {
		return array(2);
	}
	$a = $c = &q();
	$b = &$c;
	$a[] = 3;
	$b[] = 4;
	var_dump($a);
	var_dump($b);
	var_dump($c);	
	exit();
	
	$c = array();
	$a = array('e' => &$c);
	$b = &$a['e'];
/*	$b = $a;
	$b['o'] = 1;
	$b['e'] = 2;
*/
	$a['e'][] = 1;
	var_dump($a);
	var_dump($c);	
	var_dump($b);	
/*	function &q(&$a) {
		return $a['e'];
	}
	var_dump($a);
	$b = &q($a);
	$b[] = 'u';
*/	/*var_dump($b);
	var_dump($a);
*/
?>
</pre>
