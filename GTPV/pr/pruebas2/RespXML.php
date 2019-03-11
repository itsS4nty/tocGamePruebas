<?php
header("Content-type: text/xml");

$respDocXML = new DOMDocument();
$respXML = $respDocXML->appendChild(new DOMElement("xml")); 

function sendRespXML() {
	global $respDocXML;
	echo($respDocXML->saveXML());
}

function appendRespXML($node) {
	global $respXML;
	return $respXML->appendChild($node);	
}

function createElementRespXML($name, $value) {
	global $respDocXML;
	return $respDocXML->createElement($name, $value);	
}

?>
