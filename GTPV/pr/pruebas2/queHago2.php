<?php

include("RespXML.php");
include("debug.php");
include("sincronizar.php");

function enviarError($str) {
	appendRespXML(new DOMElement("error", $str));
	sendRespXML();
	exit();	
}

$xml = simplexml_load_file('php://input');
if ($xml === FALSE) enviarError(1);
	
$idCliente = $xml->idCliente;	
if ($idCliente == NULL) enviarError(2); // unset o False ??

$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$Conn = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
if ($Conn === FALSE) enviarError(3);

$idc = $idCliente["id"];
if (!$idc) enviarError(4);

$res = odbc_prepare($Conn, "SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
$bool = odbc_execute($res, array($idc, $idCliente["producto"], $idCliente["version"]));

$fCreate = $fInsert = FALSE;
if (!$bool) $fCreate = $fInsert = TRUE;
else if (odbc_num_rows($res) == 0) $fInsert = TRUE; 
	
if ($fCreate) {
	if (!odbc_exec($Conn,
		  "CREATE TABLE G_CLIENTES (".
		       "IDC varchar(255), PRODUCTO varchar(255), VERSION varchar(255), PASSWORD varchar(255), PREFIJO varchar(255))")) {
		enviarError(5);	  
	}
}
if ($fInsert) {
	$res = odbc_prepare($Conn,
		"INSERT INTO G_CLIENTES (IDC, PRODUCTO, VERSION, PASSWORD, PREFIJO) VALUES (?,?,?,?,?)");
	$bool = odbc_execute($res, 
		array($idc, $idCliente["producto"], $idCliente["version"], $idCliente["password"], "C_".$idc."_"));
	if (!$bool) enviarError(6);
	$res = odbc_prepare($Conn,
		"SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
	$bool = odbc_execute($res, array($idc, $idCliente["producto"], $idCliente["version"]));
	if (!$bool) enviarError(7);
}


$Cliente = identificarCliente($xml);
if ($Cliente == NULL) die();

//debug_odbc($res);

sincronizarTablas();

sendRespXML();

?>
