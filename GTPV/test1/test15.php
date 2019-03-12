<?php 

echo "<pre>\n";
$q = utf8_decode(array("bb"));
var_dump($q);
var_dump(array() == null);
exit();

function getP($primaryKeys) {	
	if ($primaryKeys === null) {
		if ($modeSync === "download") throwError("primaryKeys"); 
		$arrayPrimaryKeys = null;	
	} else {
		$len = strlen($primaryKeys);
		$i=0;
		while ($i<$len) {
			if ($primaryKeys[$i++] !== '[') { $arrayPrimaryKeys = array($primaryKeys); break; }
			$key = "";
			$valid = false;
			while ($i<$len) {
				$c = $primaryKeys[$i++];
				if ($c === ']') {
					if (($i === $len) || ($primaryKeys[$i] !== ']')) { $valid = true; break; }
					else $i++;
				} 
				$key .= $c; 
			}
			if ($valid) $arrayPrimaryKeys[] = $key;
			else {
				$arrayPrimaryKeys = array($primaryKeys);
				break;
			}
		}
	}	
	return $arrayPrimaryKeys;
}		
echo "<pre>";

$p = "[kkk][ooo][pppy]";
var_dump($p);
var_dump(getP($p));

$p = "[kkk][ooo]][pppy]";
var_dump($p);
var_dump(getP($p));

$p = "[kkk][ooo][pppy]]";
var_dump($p);
var_dump(getP($p));

$p = "[kkk][ooo][pppy";
var_dump($p);
var_dump(getP($p));

$p = "kkk][ooo][pppy]";
var_dump($p);
var_dump(getP($p));

$p = "[kkk][oo]]o][pppy]";
var_dump($p);
var_dump(getP($p));

$p = "[kkk][][ooo][pppy]";
var_dump($p);
var_dump(getP($p));

$p = "[kkk][o[oo][pppy]";
var_dump($p);
var_dump(getP($p));

$p = "";
var_dump($p);
var_dump(getP($p));

$p = "kjgjk";
var_dump($p);
var_dump(getP($p));

$p = null;
var_dump($p);
var_dump(getP($p));

$p = 111;
var_dump($p);
var_dump(getP($p));

$oo = (object)array('uu' => 8);
$oo->jj = 5;
var_dump($oo);

var_dump((string)null);
var_dump((string)array(1,2));
var_dump((string)0);
var_dump((string)1);
var_dump(utf8_encode(null));
var_dump(utf8_encode(1));
?>
