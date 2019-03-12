<?php

$docOut = NULL;
$docElOut = NULL;

function createResp() {
	global $docOut, $docElOut;
	
	$docOut = new DOMDocument('1.0', 'iso-8859-1');
	$docElOut = $docOut->appendChild(createElementOut("gtpv")); 
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
	if ($value !== NULL) {
		$value = utf8_encode($value);
		$el->appendChild(createTextNode($docOut, $value));	
	}
	return $el;
}

function createNodeSesion($estado) {
	$s = createElementOut('sesion');
	$s->appendChild(createElementOut('estado', $estado));
	return $s;
}

function createNodeComunicacion($delayMinutes) {
	$c = createElementOut('comunicacion');
	setAttribute($c, 'delay', (string)$delayMinutes);
	return $c;
}

?>
