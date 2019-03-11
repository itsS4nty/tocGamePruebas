<?php

include("sincronizar.php");

function getFirstChildElement($elem, $tag) {
	return getNextSiblingElement_2($elem->firstChild, $tag);
}

function getNextSiblingElement($elem, $tag) {
	return getNextSiblingElement_2($elem->nextSibling, $tag);
}

function getNextSiblingElement_2($elem, $tag) {
	for (; true; $elem = $elem->nextSibling) {
		if (($elem == NULL) || 
		    (($elem instanceof DOMElement) && (($tag == NULL) || ($tag == $elem->tagName)))) 
			return $elem;
	}
}

function getAttr($elem, $name) {
	if (!($elem->hasAttribute($name))) return NULL;
	return $elem->getAttribute($name);
}

function processNodeCliente() {
	global $docElIn;
	global $Cliente;
	global $ConnDB;
	
	$Cliente = array();
	$ClienteNode = getFirstChildElement($docElIn);
	if ($ClienteNode == NULL) enviarError(27);
	$Cliente["id"] = $ClienteNode->getAttribute("id");
	$Cliente["producto"] = $ClienteNode->getAttribute("producto");
	$Cliente["version"] = $ClienteNode->getAttribute("version");
	$Cliente["password"] = $ClienteNode->getAttribute("password");
	switch ($ClienteNode->tagName) {
		case "cliente" : $confirmInit = false; break;
		case "init"; $confirmInit = true; break;
		default :
			enviarError(89);
	}
	$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
	$exec = odbc_execute($sql, array($Cliente["id"], $Cliente["producto"], $Cliente["version"]));

	$fCreate = $fInsert = FALSE;
	if (!$exec) $fCreate = $fInsert = TRUE;
	else if (odbc_num_rows($sql) == 0) $fInsert = TRUE; 
	
	if ($fCreate) {
		$sql = odbc_prepare($ConnDB,
			  "CREATE TABLE G_CLIENTES ("
		    	   ."IDC varchar(255), PRODUCTO varchar(255), "
				   ."VERSION varchar(255), PASSWORD varchar(255), PREFIJO varchar(255))");
		$exec = odbc_execute($sql, array()); 
		if (!$exec) enviarError(5);	  
	}
	if ($fInsert) {
		$sql = odbc_prepare($ConnDB,
			"INSERT INTO G_CLIENTES (IDC, PRODUCTO, VERSION, PASSWORD, PREFIJO) VALUES (?,?,?,?,?)");
		$exec = odbc_execute($sql, 
			array($Cliente["id"], $Cliente["producto"], $Cliente["version"], $Cliente["password"], "E_".$Cliente["id"]."_"));
		if (!$exec) enviarError(6);
		$sql = odbc_prepare($ConnDB,
			"SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
		$exec = odbc_execute($sql, array($Cliente["id"], $Cliente["producto"], $Cliente["version"]));
		if (!$exec) enviarError(7);
	}
	odbc_fetch_row($sql);
	$Cliente["prefijo"] = odbc_result($sql, "PREFIJO");
	
	// verificar Password
	debug_str(odbc_result($sql, "PASSWORD"));
	debug_str($Cliente["password"]);
	debug_str(($Cliente["password"] != odbc_result($sql, "PASSWORD"))? "TRUE" : "FALSE");
	if ($Cliente["password"] != odbc_result($sql, "PASSWORD")) {
		return false;
	} else {
		if ($confirmInit) {
			$init = createElementOut("init");
			$init->setAttribute("id", $Cliente["id"]);
			$init->setAttribute("producto", $Cliente["producto"]);
			$init->setAttribute("version", $Cliente["version"]);
			$init->setAttribute("password", $Cliente["password"]);
			appendDocOut($init);
		}
	}
	return true;
}

function processNodeSesion() {
	global $docElIn;
	global $Sesion;

	$Sesion = getFirstChildElement($docElIn, "sesion");
	if ($Sesion == NULL) return NULL; 
	$estado = getFirstChildElement($Sesion, "estado");
	if ($estado == NULL) return NULL;
	
	return $estado->textContent;
}

function ProcessarPeticion() {
	sincronizarTablas();	
}

?>
