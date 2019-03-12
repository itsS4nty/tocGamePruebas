<?php
	$docOut = new DOMDocument('1.0', 'iso-8859-1');
	$docElOut = $docOut->appendChild($docOut->createElement("gtpv")); 
	$c = $docOut->createTextNode(NULL);
	var_dump($c);
function callbackUnescapeXMLControlChars($matches) {
	return chr(hexdec($matches[1]));
}

function unescapeXMLCC($str) {
	if ($str === NULL) return NULL;
	return preg_replace_callback('#\\\\x([0-9A-Fa-f]{2})#', 'callbackUnescapeXMLControlChars', $str);
}	

var_dump(unescapeXMLCC(NULL));
var_dump(unescapeXMLCC(1));

?>
