<?php

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

function processNodeCliente() {
	global $docElIn;
	global $Cliente;
	global $ConnDB;
	
	$Cliente = array();
	$ClienteNode = getFirstChildElement($docElIn);
	if ($ClienteNode == NULL) enviarError(2700);
	switch ($ClienteNode->tagName) {
		case "cliente" : $confirmInit = false; break;
		case "init"; $confirmInit = true; break;
		default :
			enviarError(89);
	}
	$Cliente["id"] = getAttribute($ClienteNode, "id");
	$Cliente["producto"] = getAttribute($ClienteNode, "producto");
	$Cliente["version"] = getAttribute($ClienteNode, "version");
	$Cliente["password"] = getAttribute($ClienteNode, "password");
	$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
	$exec = odbc_execute($sql, array($Cliente["id"], $Cliente["producto"], $Cliente["version"]));

	$fCreate = $fInsert = FALSE;
	if (!$exec) $fCreate = $fInsert = TRUE;
	else if (odbc_num_rows($sql) == 0) $fInsert = TRUE; 
	
	if ($fCreate) {
		$sql = odbc_prepare($ConnDB,
			  "CREATE TABLE G_CLIENTES ("
		    	   ."IDC varchar(255), PRODUCTO varchar(255), "
				   ."VERSION varchar(255), PASSWORD varchar(255), PREFIJO varchar(255), DB varchar(255))");
		$exec = odbc_execute($sql, array()); 
		if (!$exec) enviarError(5);	  
	}
	if ($fInsert) {
		$sql = odbc_prepare($ConnDB,
			"INSERT INTO G_CLIENTES (IDC, PRODUCTO, VERSION, PASSWORD, PREFIJO, DB) VALUES (?,?,?,?,?,?)");
		$exec = odbc_execute($sql, 
			array($Cliente["id"], $Cliente["producto"], $Cliente["version"], $Cliente["password"], "E_".$Cliente["id"]."_", NULL));
		if (!$exec) enviarError(6);
		$sql = odbc_prepare($ConnDB,
			"SELECT * FROM G_CLIENTES WHERE IDC=? AND PRODUCTO=? AND VERSION=?"); 
		$exec = odbc_execute($sql, array($Cliente["id"], $Cliente["producto"], $Cliente["version"]));
		if (!$exec) enviarError(7);
	}
	odbc_fetch_row($sql);
	$Cliente["prefijo"] = odbc_result($sql, "PREFIJO");
	if ($Cliente["prefijo"] == NULL) $Cliente["prefijo"] = "";
	$Cliente['db'] = odbc_result($sql, "DB");
	if ($Cliente['db'] == NULL) $Cliente['db'] = "";
	else $Cliente['db'] = '['.$Cliente['db'].'].dbo.';
	
	// verificar Password
	debug_str(odbc_result($sql, "PASSWORD"));
	debug_str($Cliente["password"]);
	debug_str(($Cliente["password"] != odbc_result($sql, "PASSWORD"))? "TRUE" : "FALSE");
	if ($Cliente["password"] != odbc_result($sql, "PASSWORD")) {
		$init = createElementOut("init");
		appendDocOut($init);
		return false;
	} else {
		if ($confirmInit) {
			$init = createElementOut("init");
			setAttribute($init, "id", $Cliente["id"]);
			setAttribute($init, "producto", $Cliente["producto"]);
			setAttribute($init, "version", $Cliente["version"]);
			setAttribute($init, "password", $Cliente["password"]);
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
	
	return getTextContent($estado);
}

?>
