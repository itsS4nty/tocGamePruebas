<?php

$docOut = NULL;
$docElOut = NULL;

function createResp() {
	global $docOut, $docElOut;
	
	$docOut = new DOMDocument('1.0', 'iso-8859-1');
	$docElOut = $docOut->appendChild(createElementOut("xml")); 
}

function sendResp() {
	header("Content-type: text/xml; charset=iso-8859-1");

	global $docOut;
	echo($docOut->saveXML());
}

function appendDocOut($node) {
	global $docElOut;
	return $docElOut->appendChild($node);	
}

function createElementOut($name, $value) {
	global $docOut;
	$el = $docOut->createElement($name);
	$el->appendChild($docOut->createTextNode(utf8_encode($value)));	
    return $el;
}

?>
