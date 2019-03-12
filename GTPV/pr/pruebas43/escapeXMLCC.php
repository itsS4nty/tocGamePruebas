<?php

function callbackEscapeXMLControlChars($matches) {
	$val = ord($matches[1]);
	$hex = "0123456789ABCDEF";
	return '\\x'.$hex[(int)($val/16)].$hex[($val%16)];	
}

function escapeXMLCC($str) {
	return preg_replace_callback('#([\\x00-\\x1F\\\\])#', 'callbackEscapeXMLControlChars', (string)$str);
}

function callbackUnescapeXMLControlChars($matches) {
	return chr(hexdec($matches[1]));
}

function unescapeXMLCC($str) {
	return preg_replace_callback('#\\\\x([0-9A-Fa-f]{2})#', 'callbackUnescapeXMLControlChars', (string)$str);
}

function setAttribute($node, $name, $value) {
	$node->setAttribute($name, escapeXMLCC($value));	
}

function getAttribute($node, $name) {
	return unescapeXMLCC($node->getAttribute($name));
}

function createTextNode($doc, $value) {
	return $doc->createTextNode(escapeXMLCC($value));	
}

function getTextContent($node) {
	return unescapeXMLCC($node->textContent);	
}

?>
