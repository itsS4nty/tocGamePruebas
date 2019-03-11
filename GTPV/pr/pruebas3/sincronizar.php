<?php

function enviarTabla($Tabla, $respXML) {
	global $Cliente;
	global $Conn;
	
	$columns = array();
	$orderColumn = array();

	$TablaServer = $Cliente["prefijo"].$Tabla;  // substituir espacios ????
	
	$sqlColumns = odbc_prepare($Conn, "SELECT COLUMN_NAME, DATA_TYPE, ORDINAL_POSITION FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG=? AND TABLE_NAME=?"); 
	if (!odbc_execute($sqlColumns, array("G_Gtpv", $TablaServer))) enviarError(9);

	while(odbc_fetch_row($sqlColumns)) {
		$colName = odbc_result($sqlColumns, "COLUMN_NAME");	
//	debug_str(print_r(odbc_result($sqlColumns, "COLUMN_NAME"),true));
//	debug_str(print_r(odbc_result($sqlColumns, "ORDINAL_POSITION"),true));
		$orderColumn[odbc_result($sqlColumns, "ORDINAL_POSITION")] = $colName;  // convert to integer
		$columns[$colName] = $colName;
	}

//	debug_str(print_r($orderColumn,true));

	ksort($orderColumn);
	
	$sqlKeys = odbc_prepare($Conn, "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_CATALOG=? AND TABLE_NAME=?"); 
	if (!odbc_execute($sqlKeys, array("G_Gtpv", $TablaServer))) enviarError(10);
	
	while(odbc_fetch_row($sqlColumns)) {
		$colName = odbc_result($sqlColumns, "COLUMN_NAME");	
		$columns[$colName] = $columns[$colName]." PRIMARY KEY";
	}

	// create table
	$dbXML = createElementRespXML("db");
	$statement = "CREATE TABLE ".$Tabla." ("; // substituir espacios en $Tabla ????
	$coma = false;
//	debug_str(print_r($orderColumn,true));
//	debug_str(print_r(array_values($orderColumn),true));
	
	foreach (array_values($orderColumn) as $colName) {
		if ($coma) $statement = $statement." ,";
		$coma = true;
		$statement = $statement.$columns[$colName];	
	}
	$statement = $statement.")";
	$statementXML = createElementRespXML("statement", $statement); 
	$dbXML->appendChild($statementXML);
	$execXML = createElementRespXML("exec");
	$dbXML->appendChild($execXML);
	
	// insert table
//	debug_str($TablaServer);
	$sql = odbc_prepare($Conn, "SELECT * FROM ".$TablaServer);  
	if (!odbc_execute($sql, array())) enviarError(11); 

	$first = true;
	$num_fields = odbc_num_fields($sql); 
	while (odbc_fetch_row($sql)) {
		if ($first) {
			$statement = "INSERT INTO " . $Tabla . " (";
			$coma = false;
			for ($i=1; $i<=$num_fields; $i++) {
				if ($coma) $statement = $statement." ,";
				$coma = true;
				$statement = $statement . odbc_field_name($sql, $i);	
			}
			$statement = $statement . ") VALUES (";
			$coma = false;
			for ($i=1; $i<=$num_fields; $i++) {
				if ($coma) $statement = $statement . " ,";
				$coma = true;
				$statement = $statement . "?";
			}
			$statement = $statement . ")";

			$statementXML = createElementRespXML("statement", $statement); 
	        $dbXML->appendChild($statementXML);	
			$first = false;		
		}
		$execXML = createElementRespXML("exec");
		for ($i=1; $i<=$num_fields; $i++) {
			debug_str(odbc_result($sql, $i));
			$argXML = createElementRespXML("a", odbc_result($sql, $i));
			$execXML->appendChild($argXML);
		}
		$dbXML->appendChild($execXML);
	}
	$respXML->appendChild($dbXML);
}

function sincronizarTablas() {
	global $Cliente;
	global $Conn;
	global $respXML;
	
	$sql = odbc_prepare($Conn, "SELECT TABLA FROM G_TABLAS_SINCRONIA WHERE PRODUCTO=? AND VERSION=?"); 
	$exec = odbc_execute($sql, array($Cliente["producto"], $Cliente["version"]));
	if (!$exec) enviarError(8); // si no hay G_TABLAS_SINCRONIA todo sincronizado ??

	debug_str("Josep Cuní");
	debug_str("María José");
	
	while (odbc_fetch_row($sql)) {
		$Tabla = odbc_result($sql, "TABLA");
		enviarTabla($Tabla, $respXML);
	}
}

?>
