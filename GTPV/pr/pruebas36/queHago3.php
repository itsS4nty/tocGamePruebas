<?php

set_error_handler(errorHandler, E_RECOVERABLE_ERROR);

function errorHandler ( $errno , $errstr , $errfile , $errline , $errcontext ) {
	echo $errno."\n".$errstr."\n".$errfile."\n".$errline."\n";
	print_r($errcontext);
	die();	
}


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

$docIn = NULL;
$docElIn = NULL;
$Cliente = NULL;
$Sesion = NULL;


try {
	createResp();

	$docIn = new DOMDocument();
	$docIn->load('php://input');
	if ($docIn === FALSE) enviarError(1);
	$docElIn = $docIn->documentElement;

	openDB();
	if (!processNodeCliente()) {
		// error Password

	} else {
		$estado = processNodeSesion();
		switch ($estado) {
			case 'fechas sincro' :
				sincronizarTablas();
				break;
			case 'sincronizar' :
				$nodeSesion = createNodeSesion("fin");
				appendDocOut($nodeSesion);
				break;
			case NULL :
			default:	
				obtenerFechaSincroCliente();	
		}
	}
} catch (Exception $e) {
	appendDocOut(createElementOut("error", $e->getMessage()));
}
closeDB();
sendResp();
?>
