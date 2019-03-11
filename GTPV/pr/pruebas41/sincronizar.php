<?php

function createDefaultTable($Tabla, $arrayCamposIndice) {
	global $ConnDB;
	global $Cliente;

	$TablaServer = $Cliente["prefijo"].$Tabla;
	$TablaServerSincro = $TablaServer."_SINCRO";
	
	// verificar tabla server
	$statement = "SELECT TOP 0 * FROM [$TablaServer]";
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) { 
		$statement = "SELECT * INTO [$TablaServer] FROM [DEFAULT_$Tabla]";
		debug_str($statement);
		$sql = odbc_prepare($ConnDB, $statement); 
		if (!odbc_execute($sql, array())) { enviarError(230); }
	}
	
	// verificar tabla sincro
	$statement = "SELECT TOP 0 * FROM [$TablaServerSincro]";
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) { 
		$statement = "SELECT ";
		$coma = "";
		foreach($arrayCamposIndice as $campo) {
			$statement .= $coma . "[$campo] ";
			$coma = ", ";
		}
		$statement .= "INTO [$TablaServerSincro] FROM [$TablaServer]";
	debug_str($statement);
		$sql = odbc_prepare($ConnDB, $statement); 
		if (!odbc_execute($sql, array())) { enviarError(231); }

		$statement = "ALTER TABLE [$TablaServerSincro] "
					."ADD [_TIPO_SINCRO] char(1) DEFAULT 'I' WITH VALUES, [_FECHA_SINCRO] datetime DEFAULT GETDATE() WITH VALUES";
		debug_str($statement);
		$sql = odbc_prepare($ConnDB, $statement); 
		if (!odbc_execute($sql, array())) { enviarError(232); }
	}
}

function createNodeDeleteRegister($sql, $start, $end) {
	$nodeExec = createElementOut("exec");
	$nodeExec->setAttribute("idStat", "delete");
	for ($i=$start; $i<=$end; $i++) {
		$nodeA = createElementOut("a", db_get_result($sql, $i));
		$nodeExec->appendChild($nodeA);
	}
	return $nodeExec;
}

function createNodeInsertRegister($sql, $start, $end) {
	$nodeExec = createElementOut("exec");
	$nodeExec->setAttribute("idStat", "insert");
	for ($i=$start; $i<=$end; $i++) {
		$nodeA = createElementOut("a", db_get_result($sql, $i));  // tratar tipo : TODO
		$nodeExec->appendChild($nodeA);
	}
	return $nodeExec;	
}

function enviarTabla($Tabla, $arrayCamposIndice, $FechaSincro, $nodeOut) {
	global $Cliente;
	global $ConnDB;
	
	$columns = array();
	$orderColumn = array();

	$TablaServer = $Cliente["prefijo"].$Tabla;  // substituir espacios ????
	
	$statement = "SELECT S.[_FECHA_SINCRO], S.[_TIPO_SINCRO], ";
	foreach($arrayCamposIndice as $campo) {
		$statement .= "S.[$campo], ";
	}
	$statement .= "T.* "
	             ."FROM [${TablaServer}_Sincro] AS S LEFT JOIN [$TablaServer] AS T "
	             ."ON ";
	$and = "";
	foreach($arrayCamposIndice as $campo) {
		$statement .= $and . "(S.[$campo] = T.[$campo]) ";
		$and = "AND ";
	}
	if ($FechaSincro != NULL) {
		$statement .= "WHERE S.[_FECHA_SINCRO] > ? ";
		$paramsSql = array($FechaSincro);	
	} else $paramsSql = array();
	$statement .= "ORDER BY S.[_FECHA_SINCRO] ASC ";
	debug_str($statement);

	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, $paramsSql)) {
	debug_str("sql error 10");
		createDefaultTable($Tabla, $arrayCamposIndice);	
		$sql = odbc_prepare($ConnDB, $statement); 
		odbc_execute($sql, $paramsSql);
	debug_str("sql error 11");
	}
	debug_str("num : ".odbc_num_rows($sql));
	if (odbc_num_rows($sql) == 0) return;  // no hay filas nuevas que sincronizar
	
	// create table
	$nodeDB = createElementOut("db");

	$numFields = odbc_num_fields($sql); 
	$iStartTabla = 1+2+sizeof($arrayCamposIndice);

	$statement = "CREATE TABLE IF NOT EXISTS [$Tabla] ("; 
	
	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		if ($i>$iStartTabla) $statement .= ","; 
		$statement .= "[".odbc_field_name($sql, $i)."] ";
		$statement .= odbc_field_type($sql, $i)." ";   // tratar tipo : TODO			
	}

	$statement .= ")";
	$nodeDB->appendChild(createElementOut("statement", $statement));
	$nodeDB->appendChild(createElementOut("exec"));
	
	// insert or replace statement
	$statement = "INSERT INTO [$Tabla] (";

	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		if ($i>$iStartTabla) $statement .= ",";
		$statement .= "[".odbc_field_name($sql, $i)."] ";	
	}
	$statement = $statement.") VALUES (";
	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		if ($i>$iStartTabla) $statement .= ",";
		$statement .= "? ";
	}
	$statement .= ")";

	$nodeStatement = createElementOut("statement", $statement); 
	$nodeStatement->setAttribute("id", "insert");
	$nodeDB->appendChild($nodeStatement);	

	// delete statement
	$statement = "DELETE FROM [$Tabla] WHERE ";
	$and = "";
	foreach($arrayCamposIndice as $campo) {
		$statement .= $and . "([$campo] = ?) ";
		$and = "AND ";
	}

	$nodeStatement = createElementOut("statement", $statement); 
	$nodeStatement->setAttribute("id", "delete");
	$nodeDB->appendChild($nodeStatement);	

	// execs
	
	while (odbc_fetch_row($sql)) {
		switch (odbc_result($sql, 2)) {    // S._TIPO_SINCRO
			case 'D' :
				$nodeDB->appendChild(createNodeDeleteRegister($sql, 3, 3+sizeof($arrayCamposIndice)-1)); 
				break;
			default :
				$nodeDB->appendChild(createNodeDeleteRegister($sql, 3, 3+sizeof($arrayCamposIndice)-1)); 
				$nodeDB->appendChild(createNodeInsertRegister($sql, $iStartTabla, $numFields));
		}	
		$FechaSincro = odbc_result($sql, 1); // S._FECHA_SINCRO
	}
	
	// Tabla Sincro
	
	$statement = "CREATE TABLE IF NOT EXISTS [SINCRO] ([tabla] primary key, [fecha])";
	$nodeDB->appendChild(createElementOut("statement", $statement));
	$nodeDB->appendChild(createElementOut("exec"));

	$statement = "INSERT OR REPLACE INTO [SINCRO] ([tabla], [fecha]) VALUES (?,?)";
	$nodeDB->appendChild(createElementOut("statement", $statement));
	$nodeExec = createElementOut("exec");
	$nodeExec->appendChild(createElementOut("a", $Tabla));
	$nodeExec->appendChild(createElementOut("a", $FechaSincro));
	$nodeDB->appendChild($nodeExec);
	
	$nodeOut->appendChild($nodeDB);
}

function sincronizarTablas() {
	global $Cliente;
	global $ConnDB;
	global $docElOut;

	$nodeSesion = createNodeSesion("sincronizar");
	appendDocOut($nodeSesion);
	
	$TablaFechasSincroCliente = processRespFechasSincro();
	
	$sql = odbc_prepare($ConnDB, "SELECT [tabla], [campos_indice] FROM [G_TABLAS_SINCRONIA] WHERE [producto]=? AND [version]=?"); 
	$exec = odbc_execute($sql, array($Cliente["producto"], $Cliente["version"]));
	if (!$exec) enviarError(8); // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	while (odbc_fetch_row($sql)) {
		$Tabla = odbc_result($sql, "tabla");
		$camposIndice = odbc_result($sql, "campos_indice");
		if ($camposIndice != NULL) {
			$arrayCamposIndice = array();
			$start = 0;
			while (($start = strpos($camposIndice, '[', $start)) !== FALSE) {
				$end = strpos($camposIndice, ']', $start);
				if ($end === FALSE) break;
				$arrayCamposIndice[] = substr($camposIndice, $start+1, $end-($start+1));
				$start = $end+1;	
			}
			if (sizeof($arrayCamposIndice) == 0) $arrayCamposIndice[] = $camposIndice;
			enviarTabla($Tabla, $arrayCamposIndice, $TablaFechasSincroCliente[$Tabla], $docElOut);
		}
	}
}

function processRespFechasSincro() {
	global $docElIn;
	
	$TablaFechasSincroCliente = array();
	
	$nodeDB = getFirstChildElement($docElIn, "db");
	if ($nodeDB == NULL) enviarError(100);
	$nodeExec = getFirstChildElement($nodeDB, "exec");
	if ($nodeExec == NULL) enviarError(101);
	for ($nodeRow = getFirstChildElement($nodeExec, "row"); $nodeRow != NULL; $nodeRow = getNextSiblingElement($nodeRow, "row")) {
		$Tabla = NULL; $Fecha = NULL;
		for ($node = getFirstChildElement($nodeRow, "f");  $node != NULL; $node = getNextSiblingElement($node, "f")) {
			switch ($node->getAttribute("name")) {
				case "tabla" : $Tabla = $node->textContent; break;
				case "fecha" : $Fecha = $node->textContent; break;
			}
		}
		$TablaFechasSincroCliente[$Tabla] = $Fecha;
	}
	return $TablaFechasSincroCliente;
}

function obtenerFechaSincroCliente() {
	global $docElOut;
	
	$nodeSesion = createNodeSesion("fechas sincro");
	appendDocOut($nodeSesion);
	$nodeDB = createElementOut("db");
	$nodeDB->appendChild(createElementOut("statement", "SELECT * FROM SINCRO"));
	$nodeExec = createElementOut("exec");
	$nodeExec->setAttribute("id", "sincro");
	$nodeDB->appendChild($nodeExec);
	appendDocOut($nodeDB);
/*	$nodeSesion = createNodeSesion("fechas sincro");
	appendDocOut($nodeSesion);
	$s = createElementOut("sesion");
	$e = createElementOut("estado", "hhhhhhhh hhhhhhh");
	appendDocOut(createElementOut("prueba"));
	appendDocOut(createElementOut("sesion")->appendChild(createElementOut("estado", "hhhhhhhh hhhhhhh")));
	appendDocOut(createElementOut("prueba1"));
	appendDocOut($s);
	appendDocOut(createElementOut("prueba1"));
	appendDocOut($e);
	$s = createElementOut("sesion");
	$e = createElementOut("estado", "hhhhhhhh hhhhhhh");
	appendDocOut($s->appendChild($e));
*/
}

function createNodeSesion($estado) {
	$s = createElementOut("sesion");
	$s->appendChild(createElementOut("estado", $estado));
	return $s;
}


?>
