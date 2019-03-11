<?php

include("db.php");
include("RespXML.php");
include("debug.php");
//include("sincronizar.php");
include("PeticionXML.php");

function enviarError($str) {
//	appendRespXML(new DOMElement("error", $str));
//	sendRespXML();
//	exit();	
	throw new Exception($str);
}

$xmlDoc = null;
$xml = null;

try {
	$xmlDoc = DOMDocument::load('php://input');
	if ($xmlDoc === FALSE) enviarError(1);

	$xml = $xmlDoc->documentElement;

	openDB();
	ClienteXML();
	VerificarPassword();
	SesionXML();
//debug_odbc($res);
	ProcessarPeticion();
	debug_str("fin");
} catch (Exception $e) {
	debug_str("exception");
	appendRespXML(new DOMElement("error", $e->getMessage()));
}
debug_str("mas fin");
closeDB();
sendRespXML();
?>
