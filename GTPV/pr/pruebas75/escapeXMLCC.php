<?php

function callbackEscapeXMLControlChars($matches) {
	$val = ord($matches[1]);
	$hex = "0123456789ABCDEF";
	return '\\x'.$hex[(int)($val/16)].$hex[($val%16)];	
}

function escapeXMLCC($str) {
	if ($str === NULL) return NULL;
	return preg_replace_callback('#([\\x00-\\x1F\\\\])#', 'callbackEscapeXMLControlChars', $str);
}

function callbackUnescapeXMLControlChars($matches) {
	return chr(hexdec($matches[1]));
}

function unescapeXMLCC($str) {
	if ($str === NULL) return NULL;
	return preg_replace_callback('#\\\\x([0-9A-Fa-f]{2})#', 'callbackUnescapeXMLControlChars', $str);
}

function setAttribute($node, $name, $value) {
	$node->setAttribute($name, escapeXMLCC(utf8_encode($value)));	
}

function getAttribute($node, $name) {
	if (!($node->hasAttribute($name))) return NULL;
	return utf8_decode(unescapeXMLCC($node->getAttribute($name)));
}

function createTextNode($doc, $value) {
	if ($value === NULL) $value = '';
	return $doc->createTextNode(escapeXMLCC(utf8_encode($value)));	
}

function getTextContent($node) {
	return utf8_decode(unescapeXMLCC($node->textContent));	
}

?>
