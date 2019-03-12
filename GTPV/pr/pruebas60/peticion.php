<?php

$init = array();

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

function processNodeInit() {
	global $docElIn;
	global $cliente;
	global $ConnDB;
	
	$init = array();
	$initNode = getFirstChildElement($docElIn);
	if ($initNode == NULL) enviarError(2700);
	if ($initNode->tagName != 'init') enviarError(89);

	$attrNames = array('user', 'password', 'producto', 'version', 'prefijo', 'idCom');
	for ($i=0; $i<count($attrNames); $i++) {
		$init[$attrNames[$i]] = getAttribute($initNode, $attrNames[$i]); 	
	}
	if ($init['user'] != NULL) {
		$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES_2 WHERE [user]=? AND [producto]=? AND [version]=?"); 
		$exec = odbc_execute($sql, array($init['user'], $init['producto'], $init['version']));
		$fCreate = $fInsert = FALSE;
		if (!$exec) $fCreate = $fInsert = TRUE;
		else if (odbc_num_rows($sql) == 0) $fInsert = TRUE; 

		if ($fInsert) {
							debug_str("eee");

			if ($fCreate) {
				$sql = odbc_prepare($ConnDB,
					  "CREATE TABLE G_CLIENTES_2 ("
						   ."[idCom] varchar(255), "
						   ."[user] varchar(255), [password] varchar(255), [producto] varchar(255), [version] varchar(255), "
						   ."[prefijoCliente] varchar(255), [prefijoServidor] varchar(255), [DBServidor] varchar(255))");
				$exec = odbc_execute($sql, array()); 
				if (!$exec) enviarError(5);	  
			}
			$init['idCom'] = uniqid(rand(), true);
			$sql = odbc_prepare($ConnDB,
				"INSERT INTO G_CLIENTES_2 ([idCom], [user], [password], [producto], [version], "
				                         ."[prefijoCliente], [prefijoServidor], [DBServidor]) VALUES (?,?,?,?,?,?,?,?)");
			$exec = odbc_execute($sql, 
				array($init['idCom'], $init['user'], $init['password'], $init['producto'], $init['version'], 
				      $init['user']+'_', $init['user']+'_', NULL));
			if (!$exec) enviarError(530);	  
		} else {
			odbc_fetch_row($sql);
			if ($init['password'] != odbc_result($sql, 'password')) {
				debug_str("qqq");
				$init['idCom'] = NULL;
			} else {
				$init['idCom'] = uniqid(rand(), true);
				$sql = odbc_prepare($ConnDB,
				    "UPDATE G_CLIENTES_2 SET [idCom]=? WHERE [user]=? AND [producto]=? AND [version]=?");
				$exec = odbc_execute($sql, array($init['idCom'], $init['user'], $init['producto'], $init['version']));
				if (!$exec) enviarError(540);
			}
		}
	} 
	if ($init['idCom'] != NULL) {
		$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES_2 WHERE [idCom]=?"); 
		$exec = odbc_execute($sql, array($init['idCom']));
		if (!$exec) enviarError(510);
		if (odbc_num_rows($sql) != 1) {
				debug_str(odbc_num_rows($sql));
				debug_str("www");
			// nunca pasara por aqui
			$sql = odbc_prepare($ConnDB,
			    "UPDATE SET [idCom]=NULL FROM G_CLIENTES_2 WHERE [idCom]=? ");
			$exec = odbc_execute($sql, array($init['idCom']));
			$init['idCom'] = NULL;

		} else {
			$cliente = array();
			odbc_fetch_row($sql);
			for ($i=1; $i<odbc_num_fields($sql); $i++) {
				$cliente[odbc_field_name($sql, $i)] = odbc_result($sql, $i);
			}
			debug_str(print_r($cliente, TRUE));
			if ($cliente['prefijoServidor'] == NULL) $cliente['prefijoServidor'] = '';
			if ($cliente['DBServidor'] == NULL) $cliente['DBServidor'] = '';
			else $cliente['DBServidor'] = '['.$cliente['DBServidor'].'].dbo.';
			$nodeInit = createElementOut('init');
			$attrNames = array('idCom', 'prefijoCliente');
			for ($i=0; $i<count($attrNames); $i++) {
				debug_str(print_r($attrNames[$i], TRUE));
				debug_str(print_r($cliente[$attrNames[$i]], TRUE));
				setAttribute($nodeInit, $attrNames[$i], $cliente[$attrNames[$i]]);
			}
			appendDocOut($nodeInit);
			return true;
		}
	}
					debug_str("rrr");

	$nodeInit = createElementOut('init');
	setAttribute($nodeInit, 'idCom', '');
	appendDocOut($nodeInit);
	return false;
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
