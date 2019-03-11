<?php

function createDefaultTable($Tabla) {
	global $ConnDB;
	global $Cliente;

	$TablaServer = $Cliente["prefijo"].$Tabla;  // substituir espacios ????
	
	$statement = "SELECT * INTO [" . $TablaServer . "] FROM " . "[DEFAULT_".$Tabla . "]";
	debug_str($statement);
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) { enviarError(230); }
}

function createDefaultTableSincro($Tabla) {
	global $ConnDB;
	global $Cliente;

	$TablaServer = $Cliente["prefijo"].$Tabla;  // substituir espacios ????

	$statement = "SELECT C.COLUMN_NAME AS NAME, K.COLUMN_NAME AS PK "
	            ."FROM INFORMATION_SCHEMA.COLUMNS AS C LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS K "
				."ON C.COLUMN_NAME = K.COLUMN_NAME "
				."WHERE C.TABLE_CATALOG=? AND C.TABLE_NAME=?";
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array("G_Gtpv", $TablaServer))) { enviarError(22); }
	$primaryKeyName = NULL;
	for ($i=odbc_num_rows($sql)-1; $i>=0; $i--) {
		odbc_fetch_row($sql, $i);
		$pk = odbc_result($sql, "PK"); 
		if ($pk != NULL) {
			$primaryKeyName = $pk;
			break;
		}
		$name = odbc_result($sql, "NAME");
		switch (strtolower($name)) {
			case 'codi':
			case 'id':	
				$primaryKeyName = $name;
		}
	}
	if ($primaryKeyName == NULL) { enviarError(33); }

	$TablaServerSincro = $TablaServer."_SINCRO";
	
	$statement = "DROP TABLE [".$TablaServerSincro."]";
	$sql = odbc_prepare($ConnDB, $statement); 
	odbc_execute($sql, array());
	
	$statement = "SELECT [".$primaryKeyName."] INTO ".$TablaServerSincro." FROM ".$TablaServer;
	debug_str($statement);
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) { enviarError(24); }

	$statement = "ALTER TABLE ".$TablaServerSincro
	            ." ADD TIPO char(1) DEFAULT 'I' WITH VALUES, FECHA datetime DEFAULT GETDATE() WITH VALUES";
	debug_str($statement);
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) { enviarError(25); }
}

function enviarTabla($Tabla, $campo_indice, $nodeOut) {
	global $Cliente;
	global $ConnDB;
	
	$columns = array();
	$orderColumn = array();

	$TablaServer = $Cliente["prefijo"].$Tabla;  // substituir espacios ????
	
	$statement = "SELECT C.COLUMN_NAME AS NAME, C.DATA_TYPE AS TYPE, C.ORDINAL_POSITION AS POS, K.COLUMN_NAME AS PK "
	            ."FROM INFORMATION_SCHEMA.COLUMNS AS C LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS K "
				."ON C.COLUMN_NAME = K.COLUMN_NAME "
				."WHERE C.TABLE_CATALOG=? AND C.TABLE_NAME=?";
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array("G_Gtpv", $TablaServer))) enviarError(81);
	
	if (odbc_num_rows($sql) == 0) {
		debug_str("error createDefaultTable");
		// crear tabla por defecto : TODO
		createDefaultTable($Tabla);
		$sql = odbc_prepare($ConnDB, $statement); 
		odbc_execute($sql, array("G_Gtpv", $TablaServer));
	}
	
	while(odbc_fetch_row($sql)) {
		$colName = odbc_result($sql, "NAME");	
		$orderColumn[odbc_result($sql, "POS")] = $colName;  // convert to integer
		$columns[$colName] = $colName;
		// data type : todo
		if (odbc_result($sql, "PK") != NULL) {
			$columns[$colName] = $columns[$colName]." PRIMARY KEY";
		}
	}
	
	$statement = "SELECT TOP 0 * FROM " . $TablaServer."_Sincro";
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) {
		 enviarError(91);

	if (odbc_num_rows($sql) == 0) {
		createDefaultTableSincro($Tabla);
		$sql = odbc_prepare($ConnDB, $statement); 
		odbc_execute($sql, array("G_Gtpv", $TablaServer."_Sincro"));
	}
	odbc_fetch_row($sql);
	$primaryKeyName = odbc_result($sql, "COLUMN_NAME");

	$statement = "SELECT S.FECHA AS _FECHA_SINCRO, S.TIPO AS _TIPO_SINCRO, T.* "
	            ."FROM ".$TablaServer."_Sincro AS S LEFT JOIN ".$TablaServer." AS T "
				."ON S.".$primaryKeyName." = T.".$primaryKeyName." ";
	$FechaSincro = $TablaFechasSincroCliente[$Tabla];
	if ($FechaSincro != NULL) {
		$statement = $statement."WHERE _FECHA_SINCRO > ".$FechaSincro." ";	
	}
	$statement = $statement."ORDER BY _FECHA_SINCRO ASC ";
	debug_str($statement);
	$sql = odbc_prepare($ConnDB, $statement); 
	if (!odbc_execute($sql, array())) enviarError(9);

	if (odbc_num_rows($sql) == 0) return;  // no hay filas nuevas que sincronizar
	
	// create table
	$nodeDB = createElementOut("db");
	$statement = "CREATE TABLE IF NOT EXIST ".$Tabla." ("; // substituir espacios en $Tabla ????
	$coma = false;
	
	ksort($orderColumn);

	foreach (array_values($orderColumn) as $colName) {
		if ($coma) $statement = $statement." ,";
		$coma = true;
		$statement = $statement.$columns[$colName];	
	}
	$statement = $statement.")";
	$nodeStatement = createElementOut("statement", $statement); 
	$nodeDB->appendChild($nodeStatement);
	$nodeExec = createElementOut("exec");
	$nodeDB->appendChild($nodeExec);
	
	$num_fields = odbc_num_fields($sql); 

	// insert or replace statement
	$statement = "INSERT OR REPLACE INTO ".$Tabla." (";
	$coma = false;
	for ($i=1; $i<=$num_fields; $i++) {
		if ($coma) $statement = $statement." ,";
		$coma = true;
		$statement = $statement . odbc_field_name($sql, $i);	
	}
	$statement = $statement.") VALUES (";
	$coma = false;
	for ($i=1; $i<=$num_fields; $i++) {
		if ($coma) $statement = $statement." ,";
		$coma = true;
		$statement = $statement."?";
	}
	$statement = $statement . ")";

	$nodeStatement = createElementOut("statement", $statement); 
	$nodeStatement.setAttribute("id", "insert");
	$nodeDB->appendChild($nodeStatement);	

	// delete statement
	$statement = "DELETE FROM ".$Tabla." WHERE ".$primaryKeyName." = ?";

	$nodeStatement = createElementOut("statement", $statement); 
	$nodeStatement.setAttribute("id", "delete");
	$nodeDB->appendChild($nodeStatement);	

	// execs
	
	while (odbc_fetch_row($sql)) {
		$nodeExec = createElementOut("exec");
		switch (odbc_result($sql, "_TIPO_SINCRO")) {
			case 'D' :
				$nodeExec->setAttribute("idStat", "delete");
				$nodeA = createElementOut("a", odbc_result($sql, $primaryKeyName));
				$nodeExec->appendChild($nodeA);
				break;
			default :
				$nodeExec->setAttribute("idStat", "insert");
				for ($i=1; $i<=$num_fields; $i++) {
					$nodeA = createElementOut("a", odbc_result($sql, $i));
					$nodeExec->appendChild($nodeA);
				}
		}	
		$nodeDB->appendChild($nodeExec);
		$fechaSincro = odbc_result($sql, "_FECHA_SINCRO");
	}
	
	$statement = "CREATE TABLE IF NOT EXIST SINCRO (tabla, fecha)";
	$nodeStatement = createElementOut("statement", $statement); 
	$nodeDB->appendChild($nodeStatement);
	$nodeExec = createElementOut("exec");
	$nodeDB->appendChild($nodeExec);

	$statement = "INSERT OR REPLACE (tabla, fecha) VALUES (?,?)";
	$nodeStatement = createElementOut("statement", $statement); 
	$nodeDB->appendChild($nodeStatement);
	$nodeExec = createElementOut("exec");
	$nodeA = createElementOut("a", $Tabla);
	$nodeExec->appendChild($nodeA);
	$nodeA = createElementOut("a", $fechaSincro);
	$nodeExec->appendChild($nodeA);
	$nodeDB->appendChild($nodeExec);
	
	$nodeOut->appendChild($nodeDB);
}

function sincronizarTablas() {
	global $Cliente;
	global $ConnDB;
	global $docElOut;

	$nodeSesion = createNodeSesion("sincronizar");
	appendDocOut($nodeSesion);
	
	processRespFechasSincro();
	
	$sql = odbc_prepare($ConnDB, "SELECT tabla campo_indice FROM G_TABLAS_SINCRONIA WHERE producto=? AND version=?"); 
	$exec = odbc_execute($sql, array($Cliente["producto"], $Cliente["version"]));
	if (!$exec) enviarError(8); // si no hay G_TABLAS_SINCRONIA todo sincronizado ??

	while (odbc_fetch_row($sql)) {
		$Tabla = odbc_result($sql, "tabla");
		$campo_indice = odbc_result($sql, "campo_indice");
		enviarTabla($Tabla, $campo_indice, $docElOut);
	}
}

$TablaFechasSincroCliente = NULL;

function processRespFechasSincro() {
	global $docElIn;
	global $TablaFechasSincroCliente;
	
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
