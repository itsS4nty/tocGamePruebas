<?php

/*set_error_handler(errorHandler, E_RECOVERABLE_ERROR);

function errorHandler ( $errno , $errstr , $errfile , $errline , $errcontext ) {
	echo $errno."\n".$errstr."\n".$errfile."\n".$errline."\n";
	print_r($errcontext);
	die();	
}
*/

include("db.php");
include("escapeXMLCC.php");
include("respuesta.php");
include("debug.php");
include("peticion.php");
include("sincronizar.php");


function enviarODBCError($str) {
	global $ConnDB;
	
	enviarError($str.": ".odbc_errormsg($ConnDB));
}

function enviarError($str) {
	throw new Exception($str);
}

$docIn = NULL;
$docElIn = NULL;
$cliente = NULL;
$Sesion = NULL;


try {
	createResp();

	libxml_use_internal_errors(TRUE);
	$docIn = new DOMDocument();
	$docIn->load('php://input');
	if ($docIn === FALSE) {
		$x = libxml_get_last_error();
		$str = "";
		if ($xmlError !== FALSE) $str .= "lev:".$x->level." c:".$x->code."line: ".$x->line." col:".$x->column." m:".$x->message;
		enviarError("101# error XML Document:: $str");
	}
	libxml_clear_errors();
	
	$docElIn = $docIn->documentElement;

	if ($docElIn->tagName !== "gtpv") enviarError("No Node GTPV");
	
	openDB();
	if (!processNodeInit()) {
		// error Password

	} else {
		$estado = processNodeSesion();
		switch ($estado) {
			case NULL :
				requestSincro();	
				break;
			case 'request sincro' :	
			case 'sincro' :
				// sincro, updateSincro, download, upload
				sincronizar();
				break;
		}
	}
} catch (Exception $e) {
	appendDocOut(createElementOut("error", $e->getMessage()));
}
appendDocOut(createNodeComunicacion(60));
closeDB();
sendResp();
?>
