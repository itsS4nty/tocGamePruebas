<?php

$ConnDB = FALSE;
function getConnDB() {
	global $ConnDB;
	
	return $ConnDB;
}

function openDB() { 
	global $ConnDB;
	
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
	if ($ConnDB === FALSE) throwError("401# open DB"); 
}

function closeDB() {
	global $ConnDB;
	if ($ConnDB != FALSE) odbc_close($ConnDB);	
}

function formatDateOdbc($d) {
	return substr($d->format(G_DATE_ODBC),0,-3);
}

function db_prepare($query) {
	global $ConnDB;
	return odbc_prepare($ConnDB, $query);
}

function escapeSqlIdent($ident) {
	return str_replace(']', ']]', $ident);
}

/* Cualquier parámetro de parameter_array que comience y finalice con comillas simples 
   se tomará como el nombre de un archivo para leer y enviar al servor de la base de datos 
   como la información para el parámetro de sustitución apropiado. */
function sqlArg($arg) {
	if (!is_string($arg)) return $arg;
	$len = strlen($arg);
	if (($len>2) && ($arg[0] === "'") && ($arg[$len-1] === "'")) return $arg." ";
	return $arg;
}

?>
