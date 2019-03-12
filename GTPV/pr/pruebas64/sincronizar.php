<?php

function createDefaultDownloadTable($Tabla, $camposIndice) {
	global $ConnDB;
	global $cliente;

	$TablaServer = $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$Tabla.']';
	$TablaServerSincro = $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$Tabla.'_SINCRO]';
	
	// verificar tabla server
	$stat = "SELECT TOP 0 * FROM $TablaServer";
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, array())) { 
		if ($cliente['DBServidor'] !== '') { enviarODBCError("201# Select $TablaServer"); }
		$stat = "SELECT * INTO $TablaServer FROM [DEFAULT_$Tabla]";
		debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("202# Select [DEFAULT_$Tabla]"); }
	}
	
	// verificar tabla sincro
	$stat = "SELECT TOP 0 * FROM $TablaServerSincro";
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, array())) { 
		$stat = "SELECT ";
		$coma = "";
		foreach($camposIndice as $campo) {
			$stat .= $coma . "[$campo]";
			$coma = ", ";
		}
		$stat .= "INTO $TablaServerSincro FROM $TablaServer";
	debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("203# Select into $TablaServerSincro"); }

		$stat = "ALTER TABLE $TablaServerSincro "
			   ."ADD [_TIPO_SINCRO] char(1) DEFAULT 'I' WITH VALUES, [_FECHA_SINCRO] datetime DEFAULT GETDATE() WITH VALUES";
		debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("204# Alter table $TablaServerSincro"); }
	}
}

// downloadTable internal functions 

function createNodeArgument($sql, $i) {
	$val = db_get_result($sql, $i);
	$node = createElementOut('a', $val);
	if ($val === NULL) setAttribute($node, 'NULL', '');
	return $node;	
}

function createNodeDeleteRegister($sql, $start, $end) {
	$nodeExec = createElementOut('exec');
	setAttribute($nodeExec, 'idStat', 'delete');
	for ($i=$start; $i<=$end; $i++) {
		$nodeA = createNodeArgument($sql, $i);
		$nodeExec->appendChild($nodeA);
	}
	return $nodeExec;
}

function createNodeInsertRegister($sql, $start, $end) {
	$nodeExec = createElementOut('exec');
	setAttribute($nodeExec, 'idStat', 'insert');
	for ($i=$start; $i<=$end; $i++) {
		$nodeA = createNodeArgument($sql, $i);
		$nodeExec->appendChild($nodeA);
	}
	return $nodeExec;	
}

function downloadTable($Tabla, $camposIndice, $sincro) {
	global $ConnDB;
	global $cliente;

debug_str("sincro ".$sincro);	
	$TablaServer = $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$Tabla.']';
	$TablaServerSincro = $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$Tabla.'_SINCRO]';
	
	$stat = "SELECT S.[_FECHA_SINCRO], S.[_TIPO_SINCRO], ";
	foreach($camposIndice as $campo) {
		$stat .= "S.[$campo], ";
	}
	$stat .= "T.* "
	        ."FROM $TablaServerSincro AS S INNER JOIN $TablaServer AS T "
	        ."ON ";
	$and = "";
	foreach($camposIndice as $campo) {
		$stat .= $and . "((S.[$campo] = T.[$campo]) OR ((S.[$campo] IS NULL) AND (T.[$campo] IS NULL))) ";
		$and = "AND ";
	}
	if ($sincro !== NULL) {
		$stat .= "WHERE S.[_FECHA_SINCRO] > ? ";
		$paramsSql = array($sincro);	
	} else $paramsSql = array();
	$stat .= "ORDER BY S.[_FECHA_SINCRO] ASC ";
	debug_str($stat);

	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $paramsSql)) {
	debug_str('sql error 10');
		createDefaultDownloadTable($Tabla, $camposIndice);	
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $paramsSql)) { enviarODBCError("205# $TablaServerSincro JOIN $TablaServer"); }
	}
	debug_str('num : '.odbc_num_rows($sql));
	if (odbc_num_rows($sql) === 0) return;  // no hay filas nuevas que sincronizar
	
	// create table
	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'download');
	setAttribute($nodeDB, 'reload', '');

	$numFields = odbc_num_fields($sql); 
	$iStartTabla = 1+2+sizeof($camposIndice);

	$stat = "CREATE TABLE IF NOT EXISTS [$Tabla] ( "; 
	
	$coma = "";
	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		$stat .= $coma."[".odbc_field_name($sql, $i)."] ".odbc_field_type($sql, $i);   // tratar tipo : TODO			
		$coma = ", ";
	}

	$stat .= ")";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));
	
	// insert or replace statement
	$stat = "INSERT INTO [$Tabla] ( ";

	$coma = "";
	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		$stat .= $coma."[".odbc_field_name($sql, $i)."]";
		$coma = ", ";
	}
	$stat .= ") VALUES ( ";
	$coma = "";
	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		$stat .= $coma."?";
		$coma = ", ";
	}
	$stat .= ")";

	$nodeStatement = createElementOut('statement', $stat); 
	setAttribute($nodeStatement, 'id', 'insert');
	$nodeDB->appendChild($nodeStatement);	

	// delete statement
	$stat = "DELETE FROM [$Tabla] WHERE ";
	$and = "";
	foreach($camposIndice as $campo) {
		$stat .= $and . "([$campo] = ?)";
		$and = " AND ";
	}

	$nodeStatement = createElementOut('statement', $stat); 
	setAttribute($nodeStatement, 'id', 'delete');
	$nodeDB->appendChild($nodeStatement);	

	// execs

	while (odbc_fetch_row($sql)) {
		switch (odbc_result($sql, 2)) {    // S._TIPO_SINCRO
			case 'D' :
				$nodeDB->appendChild(createNodeDeleteRegister($sql, 3, 3+sizeof($camposIndice)-1)); 
				break;
			default :
				$nodeDB->appendChild(createNodeDeleteRegister($sql, 3, 3+sizeof($camposIndice)-1)); 
				$nodeDB->appendChild(createNodeInsertRegister($sql, $iStartTabla, $numFields));
		}	
		$sincro = odbc_result($sql, 1); // S._FECHA_SINCRO
	}
	
	// Tabla Sincro
	
	$stat = "CREATE TABLE IF NOT EXISTS [Sincro_Download] ([table] text primary key, [sincro] text)";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));

	$stat = "INSERT OR REPLACE INTO [Sincro_Download] ([table], [sincro]) VALUES (?,?)";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeExec = createElementOut('exec');
	$nodeExec->appendChild(createElementOut('a', $Tabla));
	$nodeExec->appendChild(createElementOut('a', $sincro));
	$nodeDB->appendChild($nodeExec);
	
	appendDocOut($nodeDB);
	//$nodeOut->appendChild($nodeDB);
}

function sincroDownload($nodeExec) {
	global $ConnDB;
	global $cliente;

	$infoSincro = array();
	$nodeColumns = getFirstChildElement($nodeExec, 'columns');
	if ($nodeColumns !== NULL) {
		$columns = array();
		for ($nodeC = getFirstChildElement($nodeColumns, 'c'); $nodeC !== NULL; $nodeC = getNextSiblingElement($nodeC, 'c')) {
			$columns[] = getTextContent($nodeC);
		}
		for ($nodeRow = getNextSiblingElement($nodeColumns, 'row'); $nodeRow !== NULL; $nodeRow = getNextSiblingElement($nodeRow, 'row')) {
			$table = NULL; $sincro = NULL;
			$iCol = 0;
			for ($nodeV = getFirstChildElement($nodeRow, 'v');  $nodeV !== NULL; $nodeV = getNextSiblingElement($nodeV, 'v')) {
				debug_str($iCol." ".getTextContent($nodeV));
				switch ($columns[$iCol]) {
					case 'table' : $table = getTextContent($nodeV); break;
					case 'sincro' : $sincro =  (getAttribute($nodeV, 'NULL') === NULL) ? getTextContent($nodeV) : NULL; break;
				}
				$iCol++;
			}
			$infoSincro[$table] = $sincro;
		}
	}
	$sql = odbc_prepare($ConnDB, "SELECT [tabla], [campos_indice] FROM [G_TABLAS_SINCRONIA_2] " 
	                            ."WHERE [producto]=? AND [version]=? AND [modoSincro]=?"); 
	$exec = odbc_execute($sql, array($cliente['producto'], $cliente['version'], 'download'));
	if (!$exec) { enviarODBCError("206# SELECT G_TABLAS_SINCRONIA_2 download"); } // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	while (odbc_fetch_row($sql)) {
		$table = odbc_result($sql, 'tabla');
		$camposIndice = odbc_result($sql, 'campos_indice');
		if ($camposIndice !== NULL) {
			$arrayCamposIndice = array();
			$start = 0;
			while (($start = strpos($camposIndice, '[', $start)) !== FALSE) {
				$end = strpos($camposIndice, ']', $start);
				if ($end === FALSE) break;
				$arrayCamposIndice[] = substr($camposIndice, $start+1, $end-($start+1));
				$start = $end+1;
			}
			downloadTable($table, $arrayCamposIndice, $infoSincro[$table]);
		}
	}
}

function getInfoUpload() {
	global $cliente;
	global $ConnDB;

	$infoUpload = array();
	$sql = odbc_prepare($ConnDB, "SELECT [tabla], [campos_indice] FROM [G_TABLAS_SINCRONIA_2] " 
	                            ."WHERE [producto]=? AND [version]=? AND [modoSincro]=?"); 
	$exec = odbc_execute($sql, array($cliente['producto'], $cliente['version'], 'upload'));
	if (!$exec) { enviarODBCError("SELECT G_TABLAS_SINCRONIA_2 upload"); } // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	while (odbc_fetch_row($sql)) {
		$tabla = odbc_result($sql, 'tabla');
		$camposIndice = odbc_result($sql, 'campos_indice');
		if ($camposIndice !== NULL) {
			$arrayCamposIndice = array();
			$start = 0;
			while (($start = strpos($camposIndice, '[', $start)) !== FALSE) {
				$end = strpos($camposIndice, ']', $start);
				if ($end === FALSE) break;
				$arrayCamposIndice[] = substr($camposIndice, $start+1, $end-($start+1));
				$start = $end+1;
			}
		} else $arrayCamposIndice = NULL;	
		$infoUpload[] = array("tabla" => $tabla, "camposIndice" => $arrayCamposIndice); 
	}
//	debug_str("infoUpload".print_r($infoUpload,TRUE));
	return $infoUpload;
}

function sincroUpload($nodeExec) {
	$infoUpload = getInfoUpload();

	$nodeColumns = getFirstChildElement($nodeExec, 'columns');
	if ($nodeColumns !== NULL) {
		$columns = array();
		for ($nodeC = getFirstChildElement($nodeColumns, 'c'); $nodeC !== NULL; $nodeC = getNextSiblingElement($nodeC, 'c')) {
			$columns[] = getTextContent($nodeC);
		}
		for ($nodeRow = getNextSiblingElement($nodeColumns, 'row'); $nodeRow !== NULL; $nodeRow = getNextSiblingElement($nodeRow, 'row')) {
			$table = NULL; $dbName = NULL; $lastSincro = NULL;
			$iCol = 0;
			for ($nodeV = getFirstChildElement($nodeRow, 'v');  $nodeV !== NULL; $nodeV = getNextSiblingElement($nodeV, 'v')) {
				switch ($columns[$iCol]) {
					case 'table' : $table = getTextContent($nodeV); break;
					case 'dbName' : $dbName = getTextContent($nodeV); break;
					case 'lastSincro' : if (getAttribute($nodeV, 'NULL') === NULL) { $lastSincro = getTextContent($nodeV); } break;
				}
				$iCol++;
			}
			foreach ($infoUpload as $infoItem) {
				if (strncasecmp($table, $infoItem['tabla'], strlen($infoItem['tabla'])) === 0) {
					$nodeDB = createElementOut('db');
					setAttribute($nodeDB, 'id', 'upload');
					setAttribute($nodeDB, 'name', $dbName);
					$stat = "SELECT * FROM [$table] ";
					if ($lastSincro !== NULL) {
						$stat .= "WHERE ([_fecha_sincro] > ?) ";
					}
					$stat .= "ORDER BY [_fecha_sincro] ASC ";
					$nodeStatement = createElementOut('statement', $stat); 
					$nodeDB->appendChild($nodeStatement);	
					$nodeExec = createElementOut('exec');
					setAttribute($nodeExec, 'id', $table);
					if ($lastSincro !== NULL) {
						$nodeA = createElementOut('a', $lastSincro);
						$nodeExec->appendChild($nodeA);
					}
					$nodeDB->appendChild($nodeExec);
					appendDocOut($nodeDB);
				}
			}		
		}
	}
}

function createUploadTable($tableServer, $tableModel) {
	global $ConnDB;
	
	// verificar tabla server
	$stat = "SELECT TOP 0 * FROM $tableServer";
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, array())) { 
		$stat = "SELECT * INTO $tableServer FROM [DEFAULT_$tableModel]";
debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("207# SELECT INTO $tableServer FROM [DEFAULT_$tableModel]"); }
	}
}

function deleteUploadRow($tableServer, &$fieldNames, &$values) {
	global $ConnDB;

	$stat = "DELETE FROM $tableServer WHERE";
	$args = array();
	$and = "";
	for ($i=0; $i<count($fieldNames); $i++) {
		$f = $fieldNames[$i];
		if ($values[$i] != NULL) {
			$stat .= "$and ([$f] = ?)";
			$args[] = $values[$i];
		} else $stat .= "$and ([$f] IS NULL)";
		$and = " AND";
	}

	debug_str("delete");
//	debug_str($stat);
//	debug_str(print_r($args, TRUE));
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) { enviarODBCError("208# DELETE FROM $tableServer"); }
}

function insertUploadRow($tableServer, &$fieldNames, &$values, &$camposIndice, &$deletedInsertRows) {
	global $ConnDB;

//	debug_str("dir".print_r($deletedInsertRows,TRUE));
	$stat = "DELETE FROM $tableServer WHERE ";
	if ($camposIndice === NULL) {
		deleteUploadRow($tableServer, $fieldNames, $values);
	} else {
		$args = array();
		foreach($camposIndice as $campoI) {
			$i = array_search($campoI, $fieldNames);
			if ($i === FALSE) enviarError("301# $campoI no encontrado");
			$args[] = $values[$i];
		}
		$found = FALSE;
//		debug_str("args".print_r($args,TRUE));
		foreach($deletedInsertRows as $row) {
//			debug_str("row".print_r($row,TRUE));
			for ($i=0; $i<count($row); $i++) {
//				debug_str("args[i]".print_r($args[$i],TRUE));
//				debug_str("row[i]".print_r($row[$i],TRUE));
				if ($args[i] != $row[i]) break;
			}
			if ($i === count($row)) {
				$found = TRUE;
				break;	
			}
		}
		if (!$found) {
			deleteUploadRow($tableServer, $camposIndice, $args);
			$deletedInsertRows[] = $args;
		}
	}

	$stat = "INSERT INTO $tableServer (";
	$coma = "";
	foreach($fieldNames as $f) {
		$stat .= "$coma [$f]";
		$coma = ",";
	}
	$stat .= ") VALUES (";
	$coma = "";
	foreach($fieldNames as $f) {
		$stat .= "$coma ?";
		$coma = ",";
	}
	$stat .= ")";

	debug_str("insert");
//	debug_str($stat);
//	debug_str(print_r($args, TRUE));
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $values)) { enviarODBCError("209# INSERT INTO $tableServer"); }
}

function uploadTables($nodeDB) {
	global $ConnDB;
	global $cliente;
	
	$infoUpload = getInfoUpload();

	$dbName = getAttribute($nodeDB, 'name');
	for ($nodeExec = getFirstChildElement($nodeDB, 'exec'); $nodeExec !== NULL; $nodeExec = getNextSiblingElement($nodeExec, 'exec')) {
		$table = getAttribute($nodeExec, 'id');
		foreach ($infoUpload as $infoItem) {
			if (strncasecmp($table, $infoItem['tabla'], strlen($infoItem['tabla'])) == 0) {
				$nodeColumns = getFirstChildElement($nodeExec, 'columns');
				if ($nodeColumns !== NULL) {
					$tableServer = $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$table.']';
					createUploadTable($tableServer, $infoItem['tabla']); 	
					$maxFechaSincro = -1;
					$deletedInsertRows = array();

					$columns = array();
					for ($nodeC = getFirstChildElement($nodeColumns, 'c'); $nodeC !== NULL; $nodeC = getNextSiblingElement($nodeC, 'c')) {
						$columns[] = getTextContent($nodeC);
					}
					for ($nodeRow = getNextSiblingElement($nodeColumns, 'row'); $nodeRow !== NULL; $nodeRow = getNextSiblingElement($nodeRow, 'row')) {
						$fieldNames = array(); $values = array();
						$iCol = 0;
						for ($nodeV = getFirstChildElement($nodeRow, 'v');  $nodeV !== NULL; $nodeV = getNextSiblingElement($nodeV, 'v')) {
							$name = $columns[$iCol];
							$value = (getAttribute($nodeV, 'NULL') === NULL) ? getTextContent($nodeV) : NULL;
							switch ($name) {
								case '_fecha_sincro' :
									$value = (float)$value;
									if ($maxFechaSincro < $value) $maxFechaSincro = $value;
									break;
								case '_tipo_sincro' :
									$tipo_sincro = $value;
									break;
								default :	
									$fieldNames[] = $name;
									$values[] = $value;
							}
							$iCol++;
						}
						switch ($tipo_sincro) {
							case 'D' :
								deleteUploadRow($tableServer, $fieldNames, $values);
								break;
							case 'I' :
								insertUploadRow($tableServer, $fieldNames, $values, $infoItem['camposIndice'], $deletedInsertRows);
								break;	
						}
					}
					
					// sincro cliente
					if (maxFechaSincro !== -1) {
						$nodeDB = createElementOut('db');
						setAttribute($nodeDB, 'id', 'updateSincro');
			
						$stat = "UPDATE [Sincro_Upload] SET [lastSincro] = ? WHERE ([table] = ?) AND ([dbName] = ?)";
						$nodeDB->appendChild(createElementOut('statement', $stat));
						$nodeExec = createElementOut('exec');
						$nodeExec->appendChild(createElementOut('a', $maxFechaSincro));
						$nodeExec->appendChild(createElementOut('a', $table));
						$nodeExec->appendChild(createElementOut('a', $dbName));
						$nodeDB->appendChild($nodeExec);
						appendDocOut($nodeDB);
					}
				}
				break; // foreach $infoUpload
			}
		}	
	}
}

function sincronizar() {
	$nodeSincro = appendDocOut(createNodeSesion('sincro'));

	while (($nodeDB = getNextPrincipalNode('db')) != NULL) {
		switch (getAttribute($nodeDB, 'id')) {
			case 'sincro' :
				for ($nodeExec = getFirstChildElement($nodeDB, 'exec'); $nodeExec !== NULL; $nodeExec = getNextSiblingElement($nodeExec, 'exec')) {
					switch (getAttribute($nodeExec, 'id')) {
						case 'download' :
							sincroDownload($nodeExec);
							break;
						case 'upload' :
							sincroUpload($nodeExec);
							break;
					}
				}
				break;
			case 'updateSincro' :
				break;
			case 'download' :
				break;
			case 'upload' :
				uploadTables($nodeDB);
				break;
		}
	}

}

function requestSincro() {
	
	appendDocOut(createNodeSesion('request sincro'));

	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'sincro');
	
	$nodeDB->appendChild(createElementOut('statement', "SELECT * FROM [Sincro_Download]"));
	$nodeExec = createElementOut('exec');
	setAttribute($nodeExec, 'id', 'download');
	$nodeDB->appendChild($nodeExec);
	appendDocOut($nodeDB);

	$nodeDB->appendChild(createElementOut('statement', "SELECT * FROM [Sincro_Upload] WHERE (lastWrite > lastSincro)"));
	$nodeExec = createElementOut('exec');
	setAttribute($nodeExec, 'id', 'upload');
	$nodeDB->appendChild($nodeExec);
	appendDocOut($nodeDB);

}

?>
