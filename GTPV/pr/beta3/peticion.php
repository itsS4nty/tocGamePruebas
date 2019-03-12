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
		if (($elem === NULL) || 
		    (($elem instanceof DOMElement) && (($tag === NULL) || ($tag === $elem->tagName)))) 
			return $elem;
	}
}

$principalNode = NULL;
function getNextPrincipalNode($tag) {
	global $docElIn;
	global $principalNode;
	
	if ($principalNode === NULL) $principalNode = getFirstChildElement($docElIn, $tag);
	else $principalNode = getNextSiblingElement($principalNode, $tag);

	return $principalNode;
}

function processNodeInit() {
	global $docElIn;
	global $cliente;
	global $ConnDB;
//	global $PREFIX_DEFAULT_PREFIX_TABLE;
	
	$init = array();
	$initNode = getNextPrincipalNode('init');
	if ($initNode === NULL) enviarError("no Init node");
//	if ($initNode->tagName != 'init') enviarError(89);

	$attrNames = array('user', 'password', 'producto', 'version', 'prefijo', 'idCom');
	for ($i=0; $i<count($attrNames); $i++) {
		$init[$attrNames[$i]] = getAttribute($initNode, $attrNames[$i]); 	
	}

	if ($init['user'] !== NULL) {
		if (strncasecmp($init['user'], PREFIX_DEFAULT_PREFIX_TABLE, strlen(PREFIX_DEFAULT_PREFIX_TABLE)) == 0) {
			$init['idCom'] = NULL;
		} else {
			$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES WHERE [user]=? AND [producto]=? AND [version]=?"); 
			$exec = odbc_execute($sql, array($init['user'], $init['producto'], $init['version']));
			$fCreate = $fInsert = FALSE;
			if (!$exec) $fCreate = $fInsert = TRUE;
			else if (odbc_num_rows($sql) === 0) $fInsert = TRUE; 
	
			if ($fInsert) {
				if ($fCreate) {
					$sql = odbc_prepare($ConnDB,
						  "CREATE TABLE G_CLIENTES ("
							   ."[idCom] varchar(255), "
							   ."[user] varchar(255), [password] varchar(255), [producto] varchar(255), [version] varchar(255), "
							   ."[prefijoCliente] varchar(255), [prefijoServidor] varchar(255), [DBServidor] varchar(255), "
							   ."[Llicencia] float)");
					$exec = odbc_execute($sql, array()); 
					if (!$exec) enviarODBCError("401# Create Table G_CLIENTES");	  
				}
				$init['idCom'] = uniqid(rand(), true);
	
				$sql = odbc_prepare($ConnDB,
					"INSERT INTO G_CLIENTES ([idCom], [user], [password], [producto], [version], "
											 ."[prefijoCliente], [prefijoServidor], [DBServidor], "
											 ."[Llicencia]) VALUES (?,?,?,?,?,?,?,?,?)");
				$exec = odbc_execute($sql, 
					array($init['idCom'], $init['user'], $init['password'], $init['producto'], $init['version'], 
						  $init['user'].'_', $init['user'].'_', NULL, 1));
				if (!$exec) enviarODBCError("402# Insert Into G_CLIENTES");	  
			} else {
				odbc_fetch_row($sql);
				if ($init['password'] != odbc_result($sql, 'password')) {
					$init['idCom'] = NULL;
				} else {
					$init['idCom'] = uniqid(rand(), true);
					$sql = odbc_prepare($ConnDB,
						"UPDATE G_CLIENTES SET [idCom]=? WHERE [user]=? AND [producto]=? AND [version]=?");
					$exec = odbc_execute($sql, array($init['idCom'], $init['user'], $init['producto'], $init['version']));
					if (!$exec) enviarODBCError("403# Update G_CLIENTES");
				}
			}
		}
	} 
	if ($init['idCom'] !== NULL) {
		$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES WHERE [idCom]=?"); 
		$exec = odbc_execute($sql, array($init['idCom']));
		if (!$exec) enviarODBCError("404# Select G_CLIENTES");
		if (odbc_num_rows($sql) !== 1) {
				debug_str(odbc_num_rows($sql));
			// nunca pasara por aqui
			$sql = odbc_prepare($ConnDB,
			    "UPDATE SET [idCom]=NULL FROM G_CLIENTES WHERE [idCom]=? ");
			$exec = odbc_execute($sql, array($init['idCom']));
			$init['idCom'] = NULL;
		} else {
			$cliente = array();
			odbc_fetch_row($sql);
			for ($i=1; $i<=odbc_num_fields($sql); $i++) {
				$cliente[odbc_field_name($sql, $i)] = odbc_result($sql, $i);
			}
			if ($cliente['prefijoServidor'] === NULL) $cliente['prefijoServidor'] = '';
			if ($cliente['DBServidor'] === NULL) $cliente['DBServidor'] = '';
			else $cliente['DBServidor'] = '['.$cliente['DBServidor'].'].dbo.';           // ???????????
			$nodeInit = createElementOut('init');
			$attrNames = array('idCom', 'prefijoCliente', 'Llicencia');
			for ($i=0; $i<count($attrNames); $i++) {
				setAttribute($nodeInit, $attrNames[$i], $cliente[$attrNames[$i]]);
			}
			appendDocOut($nodeInit);
			return true;
		}
	}

	$nodeInit = createElementOut('init');
	setAttribute($nodeInit, 'idCom', '');
	appendDocOut($nodeInit);
	return false;
}

function processNodeSesion() {
	global $docElIn;
	global $Sesion;

	$Sesion = getNextPrincipalNode("sesion");
	if ($Sesion === NULL) return NULL; 
	$estado = getFirstChildElement($Sesion, "estado");
	if ($estado === NULL) return NULL;
	
	return getTextContent($estado);
}

?>
