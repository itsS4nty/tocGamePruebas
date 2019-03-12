<?

function callbackEscapeControlChars($matches) {
	echo("\ncbecc---$matches[0] ---- $matches[1]");
	$val = ord($matches[1]);
	$hex = "0123456789ABCDEF";
	return '\\x'.$hex[(int)($val/16)].$hex[($val%16)];	
}

function process($str) {
	return preg_replace_callback('#([\\x00-\\x1F\\\\])#'/*'#([abc])#'*/, 'callbackEscapeControlChars', $str);
}

$str = "aaabbcc\x02\x09\x40\\";
echo("\norig --- ".$str);
$e = process($str);
if ($e == NULL) echo("\nNULL");
else echo("\nproc --- ".$e);
?>