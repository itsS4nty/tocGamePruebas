<?php
header("Content-type: text/xml");

function processXML($xml) {
	
	if ($xml === FALSE) {  // SimpleXML evals to FALSE if empty tags
		$respXML =	simplexml_load_string(
		   "<?xml version='1.0' encoding='UTF-8'?><comando>select * from articulos</comando>");
	} else {
		$respXML =	simplexml_load_string(
		   "<?xml version='1.0' encoding='UTF-8'?><comando></comando>");
	}
	return $respXML;
}

$xml = simplexml_load_file('php://input');

$respXML = processXML($xml);
//print_r($xml);
echo $respXML->asXML();
echo("<!-- ");
var_dump($xml);
var_dump($xml == FALSE);
if ($xml !== FALSE) {
	var_dump($a= $xml->getName());
}
echo(" -->");
?>
