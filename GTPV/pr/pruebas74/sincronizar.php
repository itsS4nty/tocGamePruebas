<?php

function getTablasSincronia() {
	global $cliente;
	global $ConnDB;

	$tablasSincronia = array();
	$sql = odbc_prepare($ConnDB, "SELECT [tabla] as t, [clavePrimaria] as cp, [modoSincro] as modo FROM [G_TABLAS_SINCRONIA] " 
	                            ."WHERE [producto]=? AND [version]=? "); 
	$exec = odbc_execute($sql, array($cliente['producto'], $cliente['version']));
	if (!$exec) { enviarODBCError("240# SELECT G_TABLAS_SINCRONIA"); } // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	while (odbc_fetch_row($sql)) {
		$tabla = odbc_result($sql, 't');
		$clavePrimaria = odbc_result($sql, 'cp');
		$modoSincro = odbc_result($sql, 'modo');
		if ($clavePrimaria !== NULL) {
			$arrayClavePrimaria = array();
			$start = 0;
			while (($start = strpos($clavePrimaria, '[', $start)) !== FALSE) {
				$end = strpos($clavePrimaria, ']', $start);
				if ($end === FALSE) break;
				$arrayClavePrimaria[] = substr($clavePrimaria, $start+1, $end-($start+1));
				$start = $end+1;
			}
		} else $arrayClavePrimaria = NULL;	
		$tablasSincronia[] = array('tabla' => $tabla, 'clavePrimaria' => $arrayClavePrimaria, 'modoSincro' => $modoSincro ); 
	}
//	debug_str("tablasSincronia".print_r($tablasSincronia,TRUE));
//	debug_str("infoUpload".print_r($infoUpload,TRUE));
	return $tablasSincronia;
}

function getUTC() {
	global $ConnDB;
	$sql = odbc_prepare($ConnDB, "SELECT GETUTCDATE() as [utc]");
	if (!odbc_execute($sql, array())) { enviarODBCError("250# GETUTCDATE()"); }
	odbc_fetch_row($sql);
	return odbc_result($sql, 1);
}

function getNodeColumns($nodeExec, &$nodeRow) {
	$nodeColumns = getFirstChildElement($nodeExec, 'columns');
	if ($nodeColumns === NULL) return NULL;
	$columns =  array();
	for ($nodeC = getFirstChildElement($nodeColumns, 'c'); $nodeC !== NULL; $nodeC = getNextSiblingElement($nodeC, 'c')) {
		$columns[] = getTextContent($nodeC);
	}
	$nodeRow = $nodeColumns;
	return $columns;		
}

function getNodeRow(&$nodeRow, &$columns) {
	$nodeRow = getNextSiblingElement($nodeRow, 'row');
	if ($nodeRow === NULL) return NULL;
	$row = array();
	$iCol = 0;
	for ($nodeV = getFirstChildElement($nodeRow, 'v');  $nodeV !== NULL; $nodeV = getNextSiblingElement($nodeV, 'v')) {
		$name = $columns[$iCol];
		$value = (getAttribute($nodeV, 'NULL') === NULL) ? getTextContent($nodeV) : NULL;
		$row[$name] = $value;
		$iCol++;
	}
//	debug_str("iCol".print_r($iCol,TRUE));
//	debug_str("columns".print_r($columns,TRUE));
	if ($iCol != count($columns)) enviarError("280# Columns");
	return $row; 
}

function convertSqlite($type) {
	if ($type == 'datetime') return 'text';
	return $type;
}

function getTableServerName($table) {
	global $cliente;

	return $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$table.']';
}

function getTableServerSincroName($table) {
	global $cliente;

	return $cliente['DBServidor'].'['.$cliente['prefijoServidor'].$table.'_SINCRO]';
}

function createTableServerAndSincro($table, $clavePrimaria, $UD, $createInUpload) {
	global $ConnDB;
	global $cliente;

	$tableServer = getTableServerName($table);
	$tableServerSincro = getTableServerSincroName($table);
	
	// verificar tabla server
	$stat = "SELECT TOP 0 * FROM $tableServer";
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, array())) { 
		$top0 = (($cliente['DBServidor'] !== '') || ($createInUpload === TRUE)) ? "TOP 0" : "";
		$stat = "SELECT ".$top0." * INTO $tableServer FROM [DEFAULT_$table]";
		debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("202# Select [DEFAULT_$table]"); }
		if (isTeclatsTpv($table)) postCreateTableTeclatsTpv();  // TeclatsTpv
	}
//	debug_str("clavePrimaria".print_r($clavePrimaria,TRUE));
	
	// verificar tabla sincro
	$stat = "SELECT TOP 0 * FROM $tableServerSincro";
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, array())) { 
		$select = array();
		foreach($clavePrimaria as $field) {
			$select[] = "[$field]";
		}
		$stat = "SELECT ".join(", ", $select)." INTO $tableServerSincro FROM $tableServer";
		debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("203# Select into $tableServerSincro"); }

		$stat = "ALTER TABLE $tableServerSincro "
			   ."ADD [_tipo_sincro] char(1) DEFAULT 'I' WITH VALUES, [_fecha_sincro] datetime DEFAULT GETUTCDATE() WITH VALUES";
		if ($UD) $stat .= ", [_fecha_modificacion] datetime ";
		
		debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("204# Alter table $tableServerSincro"); }
	}
}

// downloadTable internal functions 

function createNodeArgument($sql, $i, $notNULL) {
	$val = db_get_result($sql, $i);
	if (($val === NULL) && ($notNULL === TRUE)) return NULL;
	$node = createElementOut('a', $val);
	if ($val === NULL) setAttribute($node, 'NULL', '');
	return $node;	
}

function createNodeDeleteRegister($sql, $start, $end) {
	$nodeExec = createElementOut('exec');
	setAttribute($nodeExec, 'idStat', 'delete');
	for ($i=$start; $i<=$end; $i++) {
		$nodeA = createNodeArgument($sql, $i, TRUE);
		if ($nodeA !== NULL) $nodeExec->appendChild($nodeA);
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

function downloadTable($table, $clavePrimaria, $sincro, $UD) {
	global $ConnDB;

debug_str("sincro ".$sincro);	
	$tableServer = getTableServerName($table);
	$tableServerSincro = getTableServerSincroName($table);
	
	$select = array("S.[_fecha_sincro]", "S.[_tipo_sincro]");
	foreach($clavePrimaria as $field) { $select[] = "S.[$field]"; }
	$select[] = "T.*";
	$on = array();
	foreach($clavePrimaria as $field) { $on[] = "((S.[$field] = T.[$field]) OR ((S.[$field] IS NULL) AND (T.[$field] IS NULL)))"; }
	$stat = "SELECT ".join(", ",$select)." FROM $tableServerSincro AS S INNER JOIN $tableServer AS T"
		   ." ON ".join(" AND ", $on)
		   .(($sincro !== NULL) ? " WHERE S.[_fecha_sincro] > ?" : "")
		   ." ORDER BY S.[_fecha_sincro] ASC ";
	$args = (($sincro !== NULL) ? array($sincro) : array());

	debug_str($stat);
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) {
	debug_str('sql error 10');
		createTableServerAndSincro($table, $clavePrimaria, $UD, FALSE);	
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $args)) { enviarODBCError("205# $tableServerSincro JOIN $tableServer"); }
	}
	debug_str('num : '.odbc_num_rows($sql));
	if (odbc_num_rows($sql) === 0) return;  // no hay filas nuevas que sincronizar
	
	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'download');
	setAttribute($nodeDB, 'reload', '');

	$numFields = odbc_num_fields($sql); 
	$iStartTabla = 1+2+sizeof($clavePrimaria);
	
	// create table
	$create = array();
	for ($i=$iStartTabla; $i<=$numFields; $i++) {
		$create[] = "[".odbc_field_name($sql, $i)."] ".convertSqlite(odbc_field_type($sql, $i));   // tratar tipo : TODO			
	}
	if ($UD) {
		$create[] = "[_fecha_sincro] text";
		$create[] = "[_tipo_sincro] text";
	}
	$stat = "CREATE TABLE IF NOT EXISTS [$table] ( ".join(", ",$create)." )"; 
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));
	
	// insert or replace statement

	$insert = array();
	for ($i=$iStartTabla; $i<=$numFields; $i++) { $insert[] = "[".odbc_field_name($sql, $i)."]"; }
	$stat = "INSERT INTO [$table] ( ".join(", ",$insert)." ) VALUES ( ".join(", ",array_fill(0,count($insert),'?'))." )";
	
	$nodeStatement = createElementOut('statement', $stat); 
	setAttribute($nodeStatement, 'id', 'insert');
	$nodeDB->appendChild($nodeStatement);	

	// delete statement
/*	$where = array();
	foreach($clavePrimaria as $field) { $where[] = "([$field] = ?)"; }
	$stat = "DELETE FROM [$table] WHERE ".join(" AND ", $where);

	$nodeStatement = createElementOut('statement', $stat); 
	setAttribute($nodeStatement, 'id', 'delete');
	$nodeDB->appendChild($nodeStatement);	
*/
	$prevDeleteIsNULL = array();
	
	// execs

	while (odbc_fetch_row($sql)) {
		$tipo_sincro = odbc_result($sql, 2);   // S._tipo_sincro
		// delete statement
		$newDelete = FALSE;
		$where = array();
		for ($i=0; $i<count($clavePrimaria); $i++) {
			$isNULL = ((odbc_result($sql, 1+2+$i)===NULL) ? TRUE : FALSE);
			if ($prevDeleteIsNULL[$i] !== $isNULL) {
				$prevDeleteIsNULL[$i] = $isNULL;
				$newDelete = TRUE;
			}
			$field = $clavePrimaria[$i];
			$where[] = ($isNULL ? "([$field] IS NULL)" : "([$field] = ?)");
		}
		if ($newDelete) {
			$stat = "DELETE FROM [$table] WHERE ".join(" AND ", $where);

			$nodeStatement = createElementOut('statement', $stat); 
			setAttribute($nodeStatement, 'id', 'delete');
			$nodeDB->appendChild($nodeStatement);	
		}
		// delete
		$nodeDB->appendChild(createNodeDeleteRegister($sql, 3, 3+sizeof($clavePrimaria)-1)); 

		if ($tipo_sincro == 'I') { // insert
			$nodeDB->appendChild(createNodeInsertRegister($sql, $iStartTabla, $numFields));
		}
		$sincro = odbc_result($sql, 1); // S._fecha_sincro
	}
	
	// Tabla Sincro
	
	$stat = "CREATE TABLE IF NOT EXISTS [Sincro_Download] ([table] text primary key, [sincro] text)";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));

	$stat = "INSERT OR REPLACE INTO [Sincro_Download] ([table], [sincro]) VALUES (?,?)";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeExec = createElementOut('exec');
	$nodeExec->appendChild(createElementOut('a', $table));
	$nodeExec->appendChild(createElementOut('a', $sincro));
	$nodeDB->appendChild($nodeExec);
	
	appendDocOut($nodeDB);
	//$nodeOut->appendChild($nodeDB);
}

function getInfoSincroDownload($nodeExec) {
	$infoSincro = array();
	$columns = getNodeColumns($nodeExec, $nodeRow);
	if ($columns !== NULL) {
		while (($row = getNodeRow($nodeRow, $columns)) !== NULL) {

/*	$nodeColumns = getFirstChildElement($nodeExec, 'columns');
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
*/			$infoSincro[$row['table']] = $row['sincro'];
		}
	}
	return $infoSincro;
}

function sincroDownload($nodeDB, $UD) {
//	global $ConnDB;
//	global $cliente;
	$nodeExec = getFirstChildElement($nodeDB, 'exec');
	if ($nodeExec === NULL) return;

	$infoSincro = getInfoSincroDownload($nodeExec);
	debug_str("infoSincro ".print_r($infoSincro,TRUE));
/*	$nodeColumns = getFirstChildElement($nodeExec, 'columns');
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
*/	$tablasSincronia = getTablasSincronia();
	debug_str("tablasSincronia ".print_r($tablasSincronia,TRUE));
	debug_str("UD ".print_r($UD,TRUE));
	foreach($tablasSincronia as $tablaS) {
		try {
			$table = $tablaS['tabla'];
			$clavePrimaria = $tablaS['clavePrimaria'];
			$modoSincro = $tablaS['modoSincro']; 
			$sincro = $infoSincro[$table];	
			if (((($modoSincro == 'download') && (!$UD)) || (($modoSincro == 'upload_download') && ($UD))) 
				&& (count($clavePrimaria) > 0)) {
//	debug_str('$table '.$table);
//	debug_str('isTeclatsTpv($table) '.isTeclatsTpv($table));
				if (isTeclatsTpv($table)) downloadTableTeclatsTpv($clavePrimaria, $sincro, $UD);
				else downloadTable($table, $clavePrimaria, $sincro, $UD);
			}
		} catch (Exception $e) {
			appendDocOut(createElementOut("error", $e->getMessage()));
		}
	}

/*	$sql = odbc_prepare($ConnDB, "SELECT [tabla], [clavePrimaria] FROM [G_TABLAS_SINCRONIA] " 
	                            ."WHERE [producto]=? AND [version]=? AND [modoSincro]=?"); 
	$exec = odbc_execute($sql, array($cliente['producto'], $cliente['version'], 'download'));
	if (!$exec) { enviarODBCError("206# SELECT G_TABLAS_SINCRONIA download"); } // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	while (odbc_fetch_row($sql)) {
		$table = odbc_result($sql, 'tabla');
		$clavePrimaria = odbc_result($sql, 'clavePrimaria');
		if ($clavePrimaria !== NULL) {
			$arrayClavePrimaria = array();
			$start = 0;
			while (($start = strpos($clavePrimaria, '[', $start)) !== FALSE) {
				$end = strpos($clavePrimaria, ']', $start);
				if ($end === FALSE) break;
				$arrayClavePrimaria[] = substr($clavePrimaria, $start+1, $end-($start+1));
				$start = $end+1;
			}
			downloadTable($table, $arrayClavePrimaria, $infoSincro[$table]);
		}
	}
*/
}

function requestSincroDownload_UD() {
	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'sincro_download_UD');
	
	$nodeDB->appendChild(createElementOut('statement', "SELECT * FROM [Sincro_Download]"));
	$nodeExec = createElementOut('exec');
	$nodeDB->appendChild($nodeExec);
	appendDocOut($nodeDB);
}

function sincroUpload($nodeDB) {
	$nodeExec = getFirstChildElement($nodeDB, 'exec');
	if ($nodeExec === NULL) return;

	$tablasSincronia = getTablasSincronia();

	$columns = getNodeColumns($nodeExec, $nodeRow);
	if ($columns !== NULL) {
		while (($row = getNodeRow($nodeRow, $columns)) !== NULL) {
/*	$nodeColumns = getFirstChildElement($nodeExec, 'columns');
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
*/
			$table = $row['table']; $dbName = $row['dbName']; $lastSincro = $row['lastSincro'];
			foreach ($tablasSincronia as $tablaS) {
				if ((($tablaS['modoSincro'] == 'upload_download') && ($tablaS['tabla'] == $table)) ||
				    (($tablaS['modoSincro'] == 'upload') && (strncasecmp($table, $tablaS['tabla'], strlen($tablaS['tabla'])) === 0))) {
					$nodeDB = createElementOut('db');
					setAttribute($nodeDB, 'id', 'upload');
					setAttribute($nodeDB, 'name', $dbName);
					$stat = "SELECT * FROM [$table]"
					        ." WHERE ".(($lastSincro !== NULL) ? "([_fecha_sincro] > ?)" : "([_fecha_sincro] IS NOT NULL)")
					        ." ORDER BY [_fecha_sincro] ASC ";
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
					break; // foreach $tablasSincronia
				}
			}		
		}
	}
	requestSincroDownload_UD();
}

function createUploadTable($tableServer, $tableModel) {
	global $ConnDB;
	
	// verificar tabla server
	$stat = "SELECT TOP 0 * FROM $tableServer";
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, array())) { 
		$stat = "SELECT TOP 0 * INTO $tableServer FROM [DEFAULT_$tableModel]";
debug_str($stat);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, array())) { enviarODBCError("207# SELECT INTO $tableServer FROM [DEFAULT_$tableModel]"); }
	}
}

function deleteUploadRow($tableServer, &$row) {
	global $ConnDB;

	$args = array();
	$where = array();
	foreach($row as $field => $value) {
		$where[] = (($value !== NULL) ? "([$field] = ?)" : "([$field] IS NULL)");
		if ($value !== NULL) $args[] = $value;
	}
	$stat = "DELETE FROM $tableServer WHERE ".join(" AND ", $where);

	debug_str("delete");
//	debug_str($stat);
//	debug_str(print_r($args, TRUE));
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) { enviarODBCError("208# DELETE FROM $tableServer"); }
}

function insertUploadRow($tableServer, &$row, &$clavePrimaria, &$prevInsertRows) {
	global $ConnDB;

//	debug_str("dir".print_r($deletedInsertRows,TRUE));
	$stat = "DELETE FROM $tableServer WHERE ";
	if ($clavePrimaria === NULL) {
		deleteUploadRow($tableServer, $row);
	} else {
		$delRow = array();
		foreach($clavePrimaria as $field) {
			$delRow[$field] = $row[$field];
		}
		$found = FALSE;
//		debug_str("args".print_r($args,TRUE));
		foreach($prevInsertRows as $prevDelRow) {
//			debug_str("row".print_r($row,TRUE));
			$found = TRUE;
			foreach($delRow as $field => $delValue) {
				if ($prevDelRow[$field] != $delValue) {
					$found = FALSE;
					break;
				}
			}
			if ($found) break;
		}
		if (!$found) {
			deleteUploadRow($tableServer, $delRow);
			$prevInsertRows[] = $delRow;
		}
	}

	$values = array();
	$insert = array();
	foreach($row as $field => $value) {
		$insert[] = "[$field]";
		$values[] = $value;
	}
	$stat = "INSERT INTO $tableServer ( ".join(", ",$insert)." ) VALUES ( ".join(", ",array_fill(0,count($insert),"?"))." )";

	debug_str("insert");
//	debug_str($stat);
//	debug_str(print_r($args, TRUE));
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $values)) { enviarODBCError("209# INSERT INTO $tableServer"); }
}

function testInsertRowUD($tableServerSincro, &$row, &$clavePrimaria) {
	global $ConnDB;
	
	$where = array();
	$args = array();
	foreach($clavePrimaria as $field) {
		$where[] = (($row[$field] !== NULL) ? "([$field] = ?)" : "([$field] IS NULL)");
		if ($row[$field] !== NULL) $args[] = $row[$field];
	}
	$stat = "SELECT [_fecha_sincro], [_fecha_modificacion] FROM $tableServerSincro WHERE ".join(" AND ", $where);
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) enviarODBCError("292# SELECT $tableServerSincro");
	if (odbc_num_rows($sql) === 0) return 0;
	odbc_fetch_row($sql);
	$fechaSincroServer = odbc_result($sql, 1);
	$fechaModificacion = odbc_result($sql, 2);
	debug_str("fechaSincroServer $fechaSincroServer");
	debug_str("fechaModificacion $fechaModificacion");
	debug_str("row['_fecha_sincro'] ${row['_fecha_sincro']}");
	if ($fechaModificacion === NULL) $fechaModificacion = $fechaSincroServer;
	debug_str("-fechaModificacion $fechaModificacion");
	debug_str(($row['_fecha_sincro'] > $fechaModificacion) ? "1" : "-1");
	return ($row['_fecha_sincro'] > $fechaModificacion) ? 1 : -1; 
}

function insertRowUD($tableServer, $tableServerSincro, &$row, &$clavePrimaria, $utc) {
	$test = testInsertRowUD($tableServerSincro, $row, $clavePrimaria);
	if ($test == -1) return; // $test : 1(update), 0(insert), -1(nothing)
	insertRowUD_Impl($tableServer, $tableServerSincro, $row, $clavePrimaria, $utc, $test);
}

function insertRowUD_Impl($tableServer, $tableServerSincro, &$row, &$clavePrimaria, $utc, $test) {
	global $ConnDB;

	$fechaModificacion = (($row['_fecha_sincro'] <= $utc) ? $row['_fecha_sincro'] : $utc); 
	if ($test != 0) {
		$set = array();
		$args = array();
		foreach($row as $field => $value) {
			if ((array_search($field, $clavePrimaria) === FALSE)   
			    && ($field != '_fecha_sincro') && ($field != '_tipo_sincro')) {
				$set[] = "[$field] = ?";
				$args[] = $value;
			}
		}
		$where = array();
		$argsW = array();
		foreach($row as $field => $value) {
			if (array_search($field, $clavePrimaria) !== FALSE) {
				$where[] = (($value !== NULL) ? "([$field] = ?)" : "([$field] IS NULL)");
				if ($value !== NULL) $argsW[] = $value;
			}
		}
		$where = " WHERE ".join(" AND ", $where);
		$stat = "UPDATE $tableServer SET ".join(", ", $set).$where;
		$args = array_merge($args, $argsW);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $args)) { enviarODBCError("340# UPDATE $tableServer"); }

		$stat = "UPDATE $tableServerSincro SET [_fecha_sincro] = ?, [_fecha_modificacion] = ?, [_tipo_sincro] = ? ".$where;
		$args = array_merge(array($utc, $fechaModificacion, $row['_tipo_sincro']), $argsW);
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $args)) { enviarODBCError("341# UPDATE $tableServerSincro"); }
	} else {
		$insF = array();
		$args = array();
		foreach($row as $field => $value) {
			if  (($field != '_fecha_sincro') && ($field != '_tipo_sincro')) {
				$insF[] = "[$field]";
				$args[] = $value;
			}
		}
		$stat = "INSERT INTO $tableServer (".join(", ", $insF).") VALUES ("
		        .join(", ",array_fill(0, count($insF), "?")).")";
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $args)) { enviarODBCError("342# INSERT $tableServer"); }

		$insF = array();
		$args = array();
		foreach($row as $field => $value) {
			if (array_search($field, $clavePrimaria) !== FALSE) {
				$insF[] = "[$field]";
				$args[] = $value;
			}
		}
		$insF[] = "[_fecha_sincro]"; $args[] = $utc;
		$insF[] = "[_fecha_modificacion]"; $args[] = $fechaModificacion;
		$insF[] = "[_tipo_sincro]"; $args[] = $row['_tipo_sincro'];
		$stat = "INSERT INTO $tableServerSincro (".join(", ", $insF).") VALUES ("
		        .join(", ",array_fill(0, count($insF), "?")).")";
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $args)) { enviarODBCError("343# INSERT $tableServerSincro"); }
	}
}

function uploadTables($nodeDB) {
//	global $ConnDB;
//	global $cliente;
	
	$tablasSincronia = getTablasSincronia();
	$utc = getUTC();
//	$infoUpload = getInfoUpload();
	$dbName = getAttribute($nodeDB, 'name');
	for ($nodeExec = getFirstChildElement($nodeDB, 'exec'); $nodeExec !== NULL; $nodeExec = getNextSiblingElement($nodeExec, 'exec')) {
		try {
			$table = getAttribute($nodeExec, 'id');
			foreach ($tablasSincronia as $tablaS) {
				if ((($tablaS['modoSincro'] == 'upload_download') && ($tablaS['tabla'] == $table)) ||
					(($tablaS['modoSincro'] == 'upload') && (strncasecmp($table, $tablaS['tabla'], strlen($tablaS['tabla'])) === 0))) {

					$UD = ($tablaS['modoSincro'] == 'upload_download');
					$clavePrimaria = $tablaS['clavePrimaria'];
					$tableServer = getTableServerName($table);
					$tableServerSincro = getTableServerSincroName($table);

					if ($UD) createTableServerAndSincro($table, $clavePrimaria, TRUE, TRUE);
					else createUploadTable($tableServer, $tablaS['tabla']); 	

					$maxFechaSincro = "";
					$prevInsertRows = array();

					if (isTeclatsTpv($table)) $DataTeclatsTpv = getDataTeclatsTpv($tableServer);
					
					$columns = getNodeColumns($nodeExec, $nodeRow);
					if ($columns !== NULL) {
						while (($row = getNodeRow($nodeRow, $columns)) !== NULL) {
	/*				$nodeColumns = getFirstChildElement($nodeExec, 'columns');
					if ($nodeColumns !== NULL) {
						$columns = array();
						for ($nodeC = getFirstChildElement($nodeColumns, 'c'); $nodeC !== NULL; $nodeC = getNextSiblingElement($nodeC, 'c')) {
							$columns[] = getTextContent($nodeC);
						}
						$fechaSincro = NULL; $tipoSincro = NULL;
						for ($nodeRow = getNextSiblingElement($nodeColumns, 'row'); $nodeRow !== NULL; $nodeRow = getNextSiblingElement($nodeRow, 'row')) {
							$fieldNames = array(); $values = array();
							$iCol = 0;
							for ($nodeV = getFirstChildElement($nodeRow, 'v');  $nodeV !== NULL; $nodeV = getNextSiblingElement($nodeV, 'v')) {
								$name = $columns[$iCol];
								$value = (getAttribute($nodeV, 'NULL') === NULL) ? getTextContent($nodeV) : NULL;
								switch ($name) {
									case '_fecha_sincro' :
										$value = (float)$value;
										$fecha_sincro = $value;
										if ($maxFechaSincro < $fecha_sincro) $maxFechaSincro = $fecha_sincro;
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
							if ($iCol != count($columns)) enviarError("280# Columns "+$table); 
	*/						$fechaSincro = $row['_fecha_sincro']; $tipoSincro = $row['_tipo_sincro'];
							if ($fechaSincro !== NULL) {   // ??? -> no puede ser NULL	
								if ($maxFechaSincro < $fechaSincro) $maxFechaSincro = $fechaSincro;
							}
							if ($UD) {
								if (isTeclatsTpv($table)) 
									insertRowTeclatsTpv($tableServer, $tableServerSincro, $row, $clavePrimaria, $utc, $DataTeclatsTpv); 
								else insertRowUD($tableServer, $tableServerSincro, $row, $clavePrimaria, $utc); 
							} else {
								unset($row['_fecha_sincro']);
								unset($row['_tipo_sincro']);	
								switch ($tipoSincro) {
									case 'D' :
										deleteUploadRow($tableServer, $row);
										break;
									case 'I' :
										insertUploadRow($tableServer, $row, $clavePrimaria, $prevInsertRows);
										break;	
								}
							}
						}
						
						// sincro cliente
						if (maxFechaSincro !== "") {
							$nodeDB = createElementOut('db');
							setAttribute($nodeDB, 'id', 'update_sincro_upload');
				
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
					break; // foreach $tablaSincronia
				}
			}	
		} catch (Exception $e) {
			appendDocOut(createElementOut("error", $e->getMessage()));
		}
	}
}

function sincronizar() {
	$nodeSincro = appendDocOut(createNodeSesion('sincro'));
	$infoSincroDownload = array();
	
	while (($nodeDB = getNextPrincipalNode('db')) !== NULL) {
		try {
			switch (getAttribute($nodeDB, 'id')) {
				case 'sincro_download' :
					sincroDownload($nodeDB, FALSE);
					break;
				case 'sincro_upload' :
					sincroUpload($nodeDB);
					break;
				case 'sincro_download_UD' :
					sincroDownload($nodeDB, TRUE);
					break;
	/*				
					for ($nodeExec = getFirstChildElement($nodeDB, 'exec'); $nodeExec !== NULL; $nodeExec = getNextSiblingElement($nodeExec, 'exec')) {
						switch (getAttribute($nodeExec, 'id')) {
							case 'download' :
								sincroDownload($nodeExec);
								break;
							case 'upload' :
								sincroUpload($nodeExec);
								break;
							case 'download_UD' :
								$infoSincroDownload = getInfoSincroDownload($nodeExec);
								break;	
						}
					}
					break;
	*/			case 'update_sincro_upload' :
					break;
				case 'download' :
					break;
				case 'upload' :
					uploadTables($nodeDB);
					break;
			}
		} catch (Exception $e) {
			appendDocOut(createElementOut("error", $e->getMessage()));
		}
	}

}

function requestSincro() {
	
	appendDocOut(createNodeSesion('sincro'));

	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'sincro_download');
	$nodeDB->appendChild(createElementOut('statement', "SELECT * FROM [Sincro_Download]"));
	$nodeExec = createElementOut('exec');
	$nodeDB->appendChild($nodeExec);
	appendDocOut($nodeDB);

	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'sincro_upload');
	$nodeDB->appendChild(createElementOut('statement', 
		"SELECT * FROM [Sincro_Upload] WHERE ((lastSincro < lastWrite) OR (lastSincro IS NULL))"));
	$nodeExec = createElementOut('exec');
	$nodeDB->appendChild($nodeExec);
	appendDocOut($nodeDB);

}

// TeclatsTpv ////////////////////////////////
function isTeclatsTpv($table) {
	return ($table === "TeclatsTpv");	
}

function postCreateTableTeclatsTpv() {
	global $ConnDB;
	global $cliente;

	$table = "TeclatsTpv";
	
	$tableServer = getTableServerName($table);

	$stat = "UPDATE $tableServer SET [Llicencia] = ?";
	$args = array($cliente['Llicencia']);
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) { enviarODBCError("303# postCreate TeclatsTpv"); }
}

function getDataTeclatsTpv($tableServer) {
	global $ConnDB;
	global $cliente;
	
	$stat = "SELECT MAX([Data]) FROM $tableServer WHERE (([Llicencia] = ?))";
	$args = array($cliente['Llicencia']);
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) { enviarODBCError("302# SELECT MAX([Data]) TeclatsTpv"); }
	if (odbc_num_rows($sql) === 0) return NULL;
	odbc_fetch_row($sql);
	return odbc_result($sql, 1);	
}

function downloadTableTeclatsTpv($clavePrimaria, $sincro, $UD) {
	global $ConnDB;
	global $cliente;
	
	$table = "TeclatsTpv";
debug_str("sincro ".$sincro);	
	$tableServer = getTableServerName($table);
//	$tableServerSincro = getTableServerSincroName($table);
	
	createTableServerAndSincro($table, $clavePrimaria, $UD, FALSE);

	$DataTeclatsTpv = getDataTeclatsTpv($tableServer);
	if (($DataTeclatsTpv === NULL) || ($DataTeclatsTpv === $sincro)) return;

	$stat = "SELECT * FROM $tableServer WHERE ([Data] = ? AND ([Llicencia] = ?))";
	$args = array($DataTeclatsTpv, $cliente['Llicencia']);
debug_str($stat);	
debug_str('DataTeclatsTpv '.$DataTeclatsTpv);	
debug_str('Llicencia '.$cliente['Llicencia']);	

	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) { enviarODBCError("301# SELECT TeclatsTpv"); }
	debug_str('num : '.odbc_num_rows($sql));
	if (odbc_num_rows($sql) === 0) return;  // no hay filas nuevas que sincronizar

	$nodeDB = createElementOut('db');
	setAttribute($nodeDB, 'id', 'download');
	setAttribute($nodeDB, 'reload', '');

	$numFields = odbc_num_fields($sql); 

	$create = array();
	for ($i=1; $i<=odbc_num_fields($sql); $i++) {
		$create[] = "[".odbc_field_name($sql, $i)."] ".convertSqlite(odbc_field_type($sql, $i));   // tratar tipo : TODO			
	}
	if ($UD) {
		$create[] = "[_fecha_sincro] text";
		$create[] = "[_tipo_sincro] text";
	}
	$stat = "CREATE TABLE IF NOT EXISTS [$table] ( ".join(", ",$create)." )"; 
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));

	$stat = "DELETE FROM [$table]";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));

	// insert or replace statement

	$insert = array();
	for ($i=1; $i<=$numFields; $i++) { $insert[] = "[".odbc_field_name($sql, $i)."]"; }
	$stat = "INSERT INTO [$table] ( ".join(", ",$insert)." ) VALUES ( ".join(", ",array_fill(0,count($insert),'?'))." )";
	
	$nodeStatement = createElementOut('statement', $stat); 
	setAttribute($nodeStatement, 'id', 'insert');
	$nodeDB->appendChild($nodeStatement);	

	// execs

	while (odbc_fetch_row($sql)) {
		$nodeDB->appendChild(createNodeInsertRegister($sql, 1, $numFields));
	}
	
	$sincro = $DataTeclatsTpv;
	
	// Tabla Sincro
	
	$stat = "CREATE TABLE IF NOT EXISTS [Sincro_Download] ([table] text primary key, [sincro] text)";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeDB->appendChild(createElementOut('exec'));

	$stat = "INSERT OR REPLACE INTO [Sincro_Download] ([table], [sincro]) VALUES (?,?)";
	$nodeDB->appendChild(createElementOut('statement', $stat));
	$nodeExec = createElementOut('exec');
	$nodeExec->appendChild(createElementOut('a', $table));
	$nodeExec->appendChild(createElementOut('a', $sincro));
	$nodeDB->appendChild($nodeExec);
	
	appendDocOut($nodeDB);
	//$nodeOut->appendChild($nodeDB);
}


function insertRowTeclatsTpv($tableServer, $tableServerSincro, &$row, &$clavePrimaria, $utc, $DataTeclatsTpv) {
	global $ConnDB;
	global $cliente;
	
debug_str('$DataTeclatsTpv '.$DataTeclatsTpv);
debug_str('$row["Data"] '.$row['Data']);

	if (($DataTeclatsTpv != NULL) && ($row['Data'] < $DataTeclatsTpv)) return; // si delete puede ser que $row['Data'] == $DataTeclatsTpv
	$row['Data'] = ($DataTeclatsTpv === NULL) ? $utc : $DataTeclatsTpv;
	$row['Llicencia'] = $cliente['Llicencia'];
	 
	$where = array();
	$args = array();
	foreach($clavePrimaria as $field) {
		$where[] = (($row[$field] !== NULL) ? "([$field] = ?)" : "([$field] IS NULL)");
		if ($row[$field] !== NULL) $args[] = $row[$field];
	}
	$stat = "SELECT * FROM $tableServer WHERE ".join(" AND ", $where);
	$sql = odbc_prepare($ConnDB, $stat); 
	if (!odbc_execute($sql, $args)) enviarODBCError("305# SELECT $tableServer");
	$test = (odbc_num_rows($sql) === 0) ? 0 : 1;
debug_str('pre insertRowUD_Impl');

	if ($row['_tipo_sincro'] === 'I') {
		if ($test != 0) {
			$set = array();
			$args = array();
			foreach($row as $field => $value) {
				if ((array_search($field, $clavePrimaria) === FALSE)   
					&& ($field != '_fecha_sincro') && ($field != '_tipo_sincro')) {
					$set[] = "[$field] = ?";
					$args[] = $value;
				}
			}
			$where = array();
			$argsW = array();
			foreach($row as $field => $value) {
				if (array_search($field, $clavePrimaria) !== FALSE) {
					$where[] = (($value !== NULL) ? "([$field] = ?)" : "([$field] IS NULL)");
					if ($value !== NULL) $argsW[] = $value;
				}
			}
			$where = " WHERE ".join(" AND ", $where);
			$stat = "UPDATE $tableServer SET ".join(", ", $set).$where;
			$args = array_merge($args, $argsW);
			$sql = odbc_prepare($ConnDB, $stat); 
			if (!odbc_execute($sql, $args)) { enviarODBCError("352# UPDATE $tableServer"); }
	
		} else {
			$insF = array();
			$args = array();
			foreach($row as $field => $value) {
				if  (($field != '_fecha_sincro') && ($field != '_tipo_sincro')) {
					$insF[] = "[$field]";
					$args[] = $value;
				}
			}
			$stat = "INSERT INTO $tableServer (".join(", ", $insF).") VALUES ("
					.join(", ",array_fill(0, count($insF), "?")).")";
			$sql = odbc_prepare($ConnDB, $stat); 
			if (!odbc_execute($sql, $args)) { enviarODBCError("353# INSERT $tableServer"); }
	
		}
	} 
	if ($row['_tipo_sincro'] === 'D') {
		$where = array();
		$argsW = array();
		foreach($row as $field => $value) {
			if (array_search($field, $clavePrimaria) !== FALSE) {
				$where[] = (($value !== NULL) ? "([$field] = ?)" : "([$field] IS NULL)");
				if ($value !== NULL) $argsW[] = $value;
			}
		}
		$stat = "DELETE FROM $tableServer WHERE ".join(" AND ", $where);
		$args = array_merge($args, $argsW);
debug_str("stat ".$stat);
debug_str("args ".print_r($args,TRUE));		
		$sql = odbc_prepare($ConnDB, $stat); 
		if (!odbc_execute($sql, $args)) { enviarODBCError("350# DELETE $tableServer"); }
	}
}

// TeclatsTpv ////////////////////////////////





?>
