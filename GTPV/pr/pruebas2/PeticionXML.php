<?php

include("sincronizar.php");

function getFirstChildElement($elem) {
	for ($child = $elem->firstChild; true; $child = $child->nextSibling) {
		if (($child == NULL) || ($child instanceof DOMElement)) return $child;
	}
}

function getNextSiblingElement($elem) {
	for ($sib = $elem->nextSibling; true; $sib = $sib->nextSibling) {
		if (($sib == NULL) || ($sib instanceof DOMElement)) return $sib;
	}
}

function getAttr($elem, $name) {
	if (!($elem->hasAttribute($name))) return NULL;
	return $elem->getAttribute($name);
}


$Cliente = array();

function ClienteXML() {
	global $xml;
	global $Cliente;
	
	$ClienteEl = getFirstChildElement($xml);
	if ($ClienteEl->tagName != "cliente") enviarError(2);

	$Cliente["id"] = getAttr($Cliente, "id");
	if ($Cliente["id"] == NULL) enviarError(3);
	$Cliente["producto"] = getAttr($Cliente, "producto");
	$Cliente["version"] = getAttr($Cliente, "version");
	$Cliente["password"] = getAttr($Cliente, "password");
	
	$sql = odbc_prepare($Conn, "SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
	$exec = odbc_execute($sql, array($idCliente, $productoCl, $versionCl));

	$fCreate = $fInsert = FALSE;
	if (!$exec) $fCreate = $fInsert = TRUE;
	else if (odbc_num_rows($res) == 0) $fInsert = TRUE; 
	
	if ($fCreate) {
		if (!odbc_exec($Conn,
			  "CREATE TABLE G_CLIENTES (".
		    	   "IDC varchar(255), PRODUCTO varchar(255), VERSION varchar(255), PASSWORD varchar(255), PREFIJO varchar(255))")) {
			enviarError(5);	  
		}
	}
	if ($fInsert) {
		$sql = odbc_prepare($Conn,
			"INSERT INTO G_CLIENTES (IDC, PRODUCTO, VERSION, PASSWORD, PREFIJO) VALUES (?,?,?,?,?)");
		$exec = odbc_execute($sql, 
			array($idCliente, $productoCl, $versionCl, $passwordCl, "C_".$idc."_"));
		if (!$exec) enviarError(6);
		$sql = odbc_prepare($Conn,
			"SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
		$exec = odbc_execute($sql, array($idCliente, $productoCl, $versionCl));
		if (!$exec) enviarError(7);
	}
}

function VerificarPassword() {
	return true;	
}

function ProcessarPeticion() {
	sincronizarTablas();	
}

?>

