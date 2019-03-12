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

$xml = null;

try {
	$xml = DOMDocument::loadXML('php://input');
	if ($xml === FALSE) enviarError(1);

	OpenDB();
	ClienteXML();
	VerificarPassword();
	SesionXML();
//debug_odbc($res);
	ProcessarPeticion();
} catch (Exception $e) {
	appendRespXML(new DOMElement("error", $e->getMessage()));
}
sendRespXML();
?>
