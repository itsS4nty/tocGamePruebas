<?php

function enviarTabla($Tabla, $respXML) {
	global $Cliente;
	global $Conn;
	
	$columns = array();
	$orderColumn = array();
	
	$sqlColumns = odbc_prepare($Conn, "SELECT COLUMN_NAME, DATA_TYPE, ORDINAL_POSITION FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG=? AND TABLE_NAME=?"); 
	if (!odbc_execute($sqlColumns, array("G_Gtpv", $Tabla))) enviarError(9);

	while(odbc_fetch_row($sqlColumns)) {
		$colName = odbc_result($sqlColumns, "COLUMN_NAME");	
		$orderColumn[odbc_result($sqlColumns, "ORDINAL_POSITION")] = $colname;  // convert to integer
		$columns[$colName] = $colName;
	}

	ksort($orderColumn);
	
	$sqlKeys = odbc_prepare($Conn, "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_CATALOG=? AND TABLE_NAME=?"); 
	if (!odbc_execute($sqlKeys, array("G_Gtpv", $Tabla))) enviarError(9);
	
	while(odbc_fetch_row($sqlColumns)) {
		$colName = odbc_result($sqlColumns, "COLUMN_NAME");	
		$columns[$colName] = $columns[$colName]." PRIMARY KEY";
	}

	// create table
	$dbXML = createElementRespXML("db");
	$statement = "CREATE TABLE ".$Tabla." (";
	$coma = false;
	foreach (array_values($orderColumn) as $columnName) {
		if ($coma) $statement = $statement." ,";
		$coma = true;
		$statement = $statement.$columns[$colName];	
	}
	$statement = $statement." )";
	$statementXML = createElementRespXML("statement", $statement); 
	$dbXML.appendChild($statementXML);
	$queryXML = createElementRespXML("query");
	$dbXML.appendChild($queryXML);
	
	// insert table
	
	$sql = odbc_prepare($Conn, "SELECT * FROM ?"); 
	if (!odbc_execute($sql, array($Cliente["prefijo"].$Tabla))) enviarError(10); 

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
			$statement = $statement . " ) VALUES (";
			$coma = false;
			for ($i=1; $i<=$num_fields; $i++) {
				if ($coma) $statement = $statement . " ,";
				$coma = true;
				$statement = $statement . "?";
			}
			$statement = $statement . " )";

			$statementXML = createElementRespXML("statement", $statement); 
	        $dbXML.appendChild($statementXML);	
			$first = false;		
		}
		$queryXML = createElementRespXML("query");
		for ($i=1; $i<=$num_fields; $i++) {
			$argXML = createElementRespXML("a", odbc_result($sql, $i));
			$queryXML.appendChild($argXML);
		}
		$dbXML.appendChild($queryXML);
	}
	$respXML.appendChild($dbXML);
}

function sincronizarTablas() {
	global $Cliente;
	global $Conn;
	global $respXML;
	
	$sql = odbc_prepare($Conn, "SELECT TABLA FROM G_TABLAS_SINCRONIA WHERE PRODUCTO=? AND VERSION=?"); 
	$exec = odbc_execute($res, array($Cliente["producto"], $Cliente["version"]));
	if (!$exec) enviarError(8); // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	
	while (odbc_fetch_row($sql)) {
		$Tabla = odbc_result($sql, "TABLA");
		enviarTabla($Tabla, $respXML);
	}
}

?>