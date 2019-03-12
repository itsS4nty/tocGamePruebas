<?php

$clientDb = array();

function getClientInfo($jsonIn) {
	global $clientDb;
	
	$info = $jsonIn->info;
	if (!(is_object($info))) throwError(); //????

	$info->ipWan = $_SERVER['REMOTE_ADDR'];
	$info->ipLan = sqlArg($info->ipLan);

	if ($info->user !== null) {
		$info->user = sqlArg(utf8_decode((string)$info->user));
		$info->producto = sqlArg(utf8_decode((string)$info->producto));
		$info->version = sqlArg(utf8_decode((string)$info->version));
		$info->password = sqlArg(utf8_decode((string)$info->password));

		$sql = db_prepare("SELECT * FROM G_CLIENTES WHERE [user]=? AND [producto]=? AND [version]=?"); 
		$exec = odbc_execute($sql, array($info->user, $info->producto, $info->version));
		$fCreate = $fInsert = FALSE;
		if (!$exec) $fCreate = $fInsert = TRUE;
		else if (odbc_num_rows($sql) === 0) $fInsert = TRUE; 
		
		if ($fInsert) {
			
			if ($fCreate) { // crear tabla G_CLIENTES, solo una vez al inicializar el server 
				$sql = db_prepare(
					  "CREATE TABLE G_CLIENTES ("
						   ."[idCom] varchar(255), "
						   ."[user] varchar(255), [password] varchar(255), [producto] varchar(255), [version] varchar(255), "
						   ."[prefijoCliente] varchar(255), [prefijoServidor] varchar(255), [DBServidor] varchar(255), "
						   ."[Llicencia] float, [ipWan] varchar(255), [ipLan] varchar(255))");
				$exec = odbc_execute($sql, array()); 
				if (!$exec) throwOdbcError("401# Create Table G_CLIENTES");	  
			}
			
			$info->idCom = uniqid(rand(), true);
			
//			$pass_hash = password_hash($info->password, PASSWORD_BCRYPT);
			
			$sql = db_prepare("INSERT INTO G_CLIENTES "
								."([idCom], [user], [password], [producto], [version], "
								."[prefijoCliente], [prefijoServidor], [DBServidor], "
								."[Llicencia], [ipWan], [ipLan]) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
			$exec = odbc_execute($sql, 
				array($info->idCom, $info->user, $info->password, $info->producto, $info->version, 
					  $info->user.'__', $info->user.'__', null, 1, $info->ipWan, $info->ipLan));
			if (!$exec) throwOdbcError("402# Insert Into G_CLIENTES");	
		} else {
			odbc_fetch_row($sql);
//			if (!password_verify($info->password, odbc_result($sql, 'password'))) { 
			if ($info->password !== odbc_result($sql, 'password')) { 
				$info->idCom = null;
			} else {
				$info->idCom = uniqid(rand(), true);
				$sql = db_prepare(
					"UPDATE G_CLIENTES SET [idCom]=? WHERE [user]=? AND [producto]=? AND [version]=?");
				$exec = odbc_execute($sql, array($info->idCom, $info->user, $info->producto, $info->version));
				if (!$exec) throwOdbcError("403# Update G_CLIENTES");
			}
		}
	}
	
	if ($info->idCom !== null) {
		$sql = db_prepare("SELECT * FROM G_CLIENTES WHERE [idCom]=?"); 
		$exec = odbc_execute($sql, array($info->idCom));
		if (!$exec) enviarODBCError("404# Select G_CLIENTES");
		if (odbc_num_rows($sql) !== 1) {
			// nunca pasara por aqui
			$sql = db_prepare("UPDATE G_CLIENTES SET [idCom]=NULL WHERE [idCom]=?");
			$exec = odbc_execute($sql, array($info->idCom));
			$info->idCom = null;
		} else {

			$clientDb = array();
			odbc_fetch_row($sql);
			for ($i=1; $i<=odbc_num_fields($sql); $i++) {
				$clientDb[odbc_field_name($sql, $i)] = odbc_result($sql, $i);
			}
			
			if ($clientDb['prefijoServidor'] === NULL) $clientDb['prefijoServidor'] = '';
			$clientDb['prefijoServidor'] = escapeSqlIdent($clientDb['prefijoServidor']);
			
			if ($clientDb['DBServidor'] === NULL) {
				$clientDb['DBServidor'] = '';
			} else {
				// default schema
				$clientDb['DBServidor'] = '['.escapeSqlIdent($clientDb['DBServidor']).'].dbo.'; 
			}	
			
			if ($info->ipLan === null) $info->ipLan = $clientDb['ipLan'];
			if (($info->ipLan !== $clientDb['ipLan']) || ($info->ipWan !== $clientDb['ipWan'])) {
				$sql = db_prepare("UPDATE G_CLIENTES SET [ipWan]=?, [ipLan]=? WHERE [idCom]=?");
				$exec = odbc_execute($sql, array($info->ipWan, $info->ipLan, $info->idCom));
				if (!$exec) throwOdbcError("405# Update G_CLIENTES");
			}
			$Llicencia = $clientDb['Llicencia'];
			if (is_string($Llicencia)) $Llicencia = utf8_encode($Llicencia);
			setOutData('clientInfo', array(
				'idCom' => $info->idCom,
				'prefijoCliente' => utf8_encode($clientDb['prefijoCliente']),
				'Llicencia' => $Llicencia
			));
			return true;
		}
	}

	setOutData('info', array(
		'idCom' => null
	));
	return false;
}

function getSession($jsonIn) {
	$session = $jsonIn->session;
	if (($session === null) || (is_string($session))) return $session;
	throwError("err session");
}

?>
