<?php

define("C_DEFAULT", "DEFAULT");
define("DEFAULT_PREFIX_TABLE", C_DEFAULT."A"."_");
define("G_DATE_ODBC", "Y-m-d H:i:s.u");

function CL($prop) {
	global $clientDb;
	return $clientDb[$prop];
}

function unpackFields($str) {
	$arrayFields = array();
	$len = strlen($str);
	$i=0;
	while ($i<$len) {
		if ($str[$i++] !== '[') return array($str);
		$field = "";
		$valid = false;
		while ($i<$len) {
			$c = $str[$i++];
			if ($c === ']') {
				if (($i < $len) && ($str[$i] === ']')) $i++; // claves que tengan ]
				else { $valid = true; break; }
			} 
			$field .= $c; 
		}
		if ($valid) $arrayFields[] = $field;
		else return array($str);
	}
	return $arrayFields;	
}

$savedTablasSincronia = null;

function getTablasSincronia() {
	global $savedTablasSincronia;
	
	if ($savedTablasSincronia !== null) return $savedTablasSincronia;
	
	$savedTablasSincronia = array();
	$sql = db_prepare("SELECT [tabla], [clavePrimaria], [modoSincro], [otrosCampos] FROM [G_TABLAS_SINCRONIA] " 
						."WHERE [producto]=? AND [version]=? "); 
	$exec = odbc_execute($sql, array(CL('producto'), CL('version')));
	if (!$exec) { throwOdbcError("240# SELECT G_TABLAS_SINCRONIA"); } // si no hay G_TABLAS_SINCRONIA todo sincronizado ??
	while (odbc_fetch_row($sql)) {
		$table = odbc_result($sql, 'tabla');
		$primaryKeys = odbc_result($sql, 'clavePrimaria');
		$modeSync = odbc_result($sql, 'modoSincro');
		$otherFields = odbc_result($sql, 'otrosCampos');
		
		if (($primaryKeys === null) || ($primaryKeys === '')) $primaryKeys = null;
		if ($primaryKeys === null) {
			if ($modeSync === "download") throwError("primaryKeys"); 
			$arrayPrimaryKeys = null;	
		} else $arrayPrimaryKeys = unpackFields($primaryKeys);

		if (($otherFields === null) || ($otherFields === '')) $arrayOtherFields = array();
		else $arrayOtherFields = unpackFields($otherFields);
		
		$savedTablasSincronia[] = array(
			'table' => $table, 
			'primaryKeys' => $arrayPrimaryKeys, 
			'modeSync' => $modeSync,
			'otherFields' => $arrayOtherFields
		); 
	}
	return $savedTablasSincronia;
}

$savedUTC = null;

function getUTC() {
	global $savedUTC;
	
	if ($savedUTC !== null) return $savedUTC;
	
	$sql = db_prepare("SELECT GETUTCDATE() as [utc]");
	if (!odbc_execute($sql, array())) { throwOdbcError("250# GETUTCDATE()"); }
	odbc_fetch_row($sql);
	$savedUTC = odbc_result($sql, 1);
	return $savedUTC;
}

$savedLocalTimeZone = null;

function getLocalTimeZone() {
	global $savedLocalTimeZone;
	
	if ($savedLocalTimeZone === null) {
		$dateTmp = new DateTime();
		$savedLocalTimeZone = $dateTmp->getTimezone();
	}	
	return $savedLocalTimeZone; 
}

$outSchema = array();

function getSchema() {
	global $outSchema;

	return $outSchema;	
}

function setSchema($objName, $infoObj) {
	global $outSchema;
	
	if ($outSchema[$objName] === null) {
		$outSchema[$objName] = $infoObj;
		return;
	}
	if ($outSchema[$objName]['indexs'] === null) {
		if ($infoObj['indexs'] !== null) $outSchema[$objName]['indexs'] = $infoObj['indexs'];
		return;
	}	
	if ($infoObj['indexs'] !== null) {
		foreach($infoObj['indexs'] as $nameIdx => $infoIdx) 
			$outSchema[$objName]['indexs'][$nameIdx] = $infoIdx;
	}
}	

// First Request /////////////////////

function firstSyncRequest() {
	setSchema('_downloadSync', array('keyPath' => 'table'));
	setSchema('_uploadSync', array('keyPath' => 'table'));
	return array(
		array(
			'dbName' => CL('prefijoCliente').'gtpv',
			'schema' => getSchema(),
			'transaction' => array(
				array(
					'id' => 'downloadSync', 
					'objName' => '_downloadSync',
					'type' => 'get',
					'columns' => array('table', 'serverSync')
				),
				array(
					'id' => 'uploadSync',
					'objName' => '_uploadSync',
					'type' => 'get',
					'columns' => array('table', 'lastWrite'),
					'filter' => '((val.lastSync == null) || (val.lastWrite > val.lastSync))'
				)
			)
		)
	);	
}

// Siguientes Requests ///////////////

function synchronize($jsonIn) {
	$dbsOut = array();
	
	$dbs = $jsonIn->dbs;
	if ($dbs === null) $dbs = array();
	if (!is_array($dbs)) throwError("dbs");
	foreach ($dbs as $db) { // solo hay una db
		if (!is_object($db)) throwError("db");
		if ($db->dbName !== CL('prefijoCliente').'gtpv') continue;		

		$transactionOut = array();	
		$putsUploadSyncOut = array('keys' => array(), 'values' => array());
		$transaction = $db->transaction;
		if ($transaction === null) $transaction = array();
		if (!is_array($transaction)) throwError('transaction');
		foreach ($transaction as $subtr) {
			if (!is_object($subtr)) throwError('subtr');
			switch ($subtr->id) {
				case 'downloadSync' :
					syncDownloadTables($subtr, FALSE, $transactionOut);
					break;
				case 'uploadSync' :
					syncUploadTables($subtr, $transactionOut);
					requestDownloadSync_UD($transactionOut);
					break;
				case 'downloadSync_UD' :
					syncDownloadTables($subtr, TRUE, $transactionOut);
					break;
				case 'upload' :
					$puts = uploadTable($subtr, $transactionOut, $putsUploadSyncOut); 
					if ($puts !== null) $putsUploadSyncOut[] = $puts;
					break;
			}
		}
		if (count($putsUploadSyncOut['keys']) > 0) { // agrupados en la misma subtrans
			setSchema('_uploadSync', array('keyPath' => 'table'));
			$transactionOut[] = array(
				'objName' => '_uploadSync',
				'type' => 'update',
				'columns' => array('lastSync'),
				'keys' => $putsUploadSyncOut['keys'],
				'values' => $putsUploadSyncOut['values']
			);
		}	
		if (count($transactionOut) > 0) {
			$dbsOut[] = array(
				'dbName' => CL('prefijoCliente').'gtpv',
				'schema' => getSchema(),
				'transaction' => $transactionOut
			);
		}
	}
	if (count($dbsOut) == 0) return null;
	return $dbsOut;
}

// Download //////////////////////////

function syncDownloadTables($subtr, $fUD, &$transactionOut) {
	$values =  $subtr->values;
	if ($values === null) $values = array();
	if (!is_array($values)) throwError("values syncDownload");
	$tablesLastSync = array();
	if (count($values) > 0) {
		$colNames = $subtr->columns;
		if ($colNames === null) $colNames = array();
		if (!is_array($colNames)) throwError("columns");
		$colIdxs = array_flip($colNames);
		
		foreach ($values as $val) {
			$tablesLastSync[utf8_decode($val[$colIdxs['table']])] = $val[$colIdxs['serverSync']];
		}
	}
	$subtrsOut = array();
	$putsSync = array();
	$tablasSincronia = getTablasSincronia();
	foreach($tablasSincronia as $tableS) {
//		$table = $tableS['table'];
//		$primaryKeys = $tableS['primaryKeys'];
		$mode = $tableS['modeSync']; 
		$lastSync = $tablesLastSync[$table];	
		if ($fUD) {
			if ($mode === 'upload_download') 
				downloadTable_UD($tableS, $lastSync, $transactionOut, $putsSync);
		} else {
			if ($mode === 'download') 
				downloadTable($tableS, $lastSync, $transactionOut, $putsSync);
		}
	}
	if (count($putsSync) > 0) {
		setSchema('_downloadSync', array('keyPath' => 'table'));
		$transactionOut[] = array(
			'objName' => '_downloadSync',
			'type' => 'put',
			'columns' => array('table', 'serverSync', 'debugServerDatetime'),
			'values' => $putsSync
		);
	}
}

function downloadTable($tableS, $lastSync, &$transactionOut, &$putsSync) {
	$table = $tableS['table'];
	
	$tableServer = getTableServerName($table);
	$syncTableServer = getSyncTableServerName($table);
	
	$primaryKeys = $tableS['primaryKeys'];	
	$otherFields = $tableS['otherFields'];
	
	$select = array("S.[_fecha_sincro]", "S.[_tipo_sincro]");
//	foreach($primaryKeys as $key) { $select[] = 'S.['.escapeSqlIdent($key).']'; }
	foreach($primaryKeys as $key) { $select[] = 'T.['.escapeSqlIdent($key).']'; }
	foreach($otherFields as $field) { $select[] = 'T.['.escapeSqlIdent($field).']'; }
	$on = array();
	foreach($primaryKeys as $key) { 
		$key = escapeSqlIdent($key); 
		$on[] = "(S.[$key] = T.[$key])"; //  OR ((S.[$key] IS NULL) AND (T.[$key] IS NULL)) 
	} 
	$stat = "SELECT ".join(", ",$select)." FROM $syncTableServer AS S INNER JOIN $tableServer AS T"
		   ." ON ".join(" AND ", $on)
		   .(($lastSync !== null) ? " WHERE S.[_fecha_sincro] > ?" : "")
		   ." ORDER BY S.[_fecha_sincro] ASC ";
	$args = (($lastSync !== null) ? array(sqlArg($lastSync)) : array());

	$sql = db_prepare($stat); 
	if (!odbc_execute($sql, $args)) {
		createDownloadTableServer($table, true);
		createSyncTableServer($table, $primaryKeys);	
		//$sql = odbc_prepare(getConnDB(), $stat); 
		if (!odbc_execute($sql, $args)) { throwOdbcError("205# $syncTableServer JOIN $tableServer"); }
	}
	if (odbc_num_rows($sql) === 0) return;  // no hay filas nuevas que sincronizar
	
	$singlePrimaryKey = (count($primaryKeys) == 1);

	$numFields = odbc_num_fields($sql); 
	$idxStartTable = 2; // _fecha_sincro], [_tipo_sincro]
	
	$columns = array();
	$valueTypes = array();
	for ($idx=$idxStartTable; $idx<$numFields; $idx++) {
		$name = utf8_encode(odbc_field_name($sql, 1+$idx));
		$columns[] = $name;
		$type = convertColumnType(odbc_field_type($sql, 1+$idx));
		if ($type !== null) {
			if ($valueTypes[$type] === null) $valueTypes[$type] = array(); 
			$valueTypes[$type][] = $name;
		}	
	}
	if (!$valueTypes) $valueTypes = null;
	
	$deletes = array();
	$puts = array();
	while (odbc_fetch_row($sql)) {
		switch(odbc_result($sql, 1+1)) {   // S._tipo_sincro
			case 'I':
				$put = array();
				for ($idx=$idxStartTable; $idx<$numFields; $idx++) {
					$val = odbc_result($sql, 1+$idx);
					if ($val === null) $put[] = $val;
					else $put[] = utf8_encode($val);
				}
				$puts[] = $put;
				break;
			case 'D':
				if ($singlePrimaryKey) $delete = utf8_encode(odbc_result($sql, 1+2));
				else {
					$delete = array();
					for ($idx=2; $idx<2+count($primaryKeys); $idx++) 
						$delete[] = utf8_encode(odbc_result($sql, 1+$idx)); 
				}
				$deletes[] = $delete;
				break;
		}		
		$nextServerSync = odbc_result($sql, 1+0); // S._fecha_sincro
	}
	
	$utf8PrimaryKeys = array_map("utf8_encode", $primaryKeys);
	
	$objName = utf8_encode($table);
	setSchema($objName, array('keyPath' => $singlePrimaryKey ? $utf8PrimaryKeys[0] : $utf8PrimaryKeys));

	if (count($deletes) > 0) { 
		$transactionOut[] = array(
			'id' => 'download_deletes',
			'objName' => $objName,
			'type' => 'delete',
			'keys' => $deletes
		);
	}
	if (count($puts) > 0) { 
		$subtrOut = array(
			'id' => 'download_inserts',
			'objName' => $objName,
			'type' => 'put',
			'columns' => $columns,
			'values' => $puts
		);
		if ($valueTypes !== null) $subtrOut['valueTypes'] = $valueTypes;
		$transactionOut[] = $subtrOut;
	}	

	$dateTime = new DateTime($nextServerSync, new DateTimeZone("UTC"));
	$dateTime->setTimezone(getLocalTimeZone());
	$debugServerDatetime = formatDateOdbc($dateTime);
	$putsSync[] = array($objName, $nextServerSync, $debugServerDatetime);
}

function convertColumnType($type) {
	if ($type == 'datetime') return 'Date';
	return null;
}

function getTableServerName($table) {
	return CL('DBServidor').'['.CL('prefijoServidor').escapeSqlIdent($table).']';
}

function getSyncTableServerName($table) {
	return CL('DBServidor').'['.CL('prefijoServidor').escapeSqlIdent($table).'_SINCRO]';
}

function createDownloadTableServer($table, $copyDefaultData) {

	$tableServer = getTableServerName($table);
	
	// verificar tabla server
	$sql = db_prepare("SELECT TOP 0 * FROM $tableServer"); 
	if (!odbc_execute($sql, array())) { 
		if (CL('DBServidor') !== '') $copyDefaultData = false;

		$defaultTableServer = '['.escapeSqlIdent(DEFAULT_PREFIX_TABLE.$table).']';

		$stat = "SELECT ".($copyDefaultData ? "" : "TOP 0")." * INTO $tableServer FROM $defaultTableServer";
		$sql = db_prepare($stat); 
		if (!odbc_execute($sql, array())) { throwOdbcError("202# Select $defaultTableServer"); }

		if ($copyDefaultData) {
			if (isTeclatsTpv($table)) postCreateTableTeclatsTpv($tableServer);  // TeclatsTpv
		}
	}
}

function createSyncTableServer($table, $primaryKeys) {

	$tableServer = getTableServerName($table);
	$syncTableServer = getSyncTableServerName($table);
	
	// verificar tabla sincro
	$sql = db_prepare("SELECT TOP 0 * FROM $syncTableServer"); 
	if (!odbc_execute($sql, array())) { 
		$select = array_map(function($key) { return '['.escapeSqlIdent($key).']'; }, $primaryKeys);
		$sql = db_prepare("SELECT ".join(", ", $select)." INTO $syncTableServer FROM $tableServer"); 
		if (!odbc_execute($sql, array())) { throwOdbcError("203# Select into $syncTableServer"); }

		$stat = "ALTER TABLE $syncTableServer "
			   ."ADD [_tipo_sincro] char(1) DEFAULT 'I' WITH VALUES, [_fecha_sincro] datetime DEFAULT GETUTCDATE() WITH VALUES";
		$sql = db_prepare($stat); 
		if (!odbc_execute($sql, array())) { throwOdbcError("204# Alter table $syncTableServer"); }
	}
}

// Upload /////////////////////////////


function syncUploadTables($subtr, &$transactionOut) {
	$values =  $subtr->values;
	if ($values === null) $values = array();
	if (!is_array($values)) throwError("values");
	if (count($values) == 0) return array();
	
	$colNames = $subtr->columns;
	if ($colNames === null) $colNames = array();
	if (!is_array($colNames)) throwError("columns");
	$colIdxs = array_flip($colNames);

	$tablasSincronia = getTablasSincronia();
	
	foreach ($values as $val) {
		$table = utf8_decode($val[$colIdxs['table']]);
		$lastWriteClient = $val[$colIdxs['lastWrite']];
	
		foreach($tablasSincronia as $tableS) {
			$mode = $tableS['modeSync']; 
			if ( (($mode == 'upload_download') && ($tableS['table'] == $table)) ||
			     (($mode == 'upload') && (strncasecmp($table, $tableS['table'], strlen($tableS['table'])) === 0)) ) {
					$objName = $val[$colIdxs['table']]; // ya es utf8 
					$columns = array_merge(
									$tableS['primaryKeys'],
									$tableS['otherFields'],
									array('_lastWrite','_typeSync'));
					setSchema($objName, array(indexs => array('_lastWrite' => array('_lastWrite'))));
					$transactionOut[] = array(
						'id' => 'upload',
						'objName' => $objName, 
						'type' => 'get',
						'columns' => array_map('utf8_encode', $columns),
						'index' => '_lastWrite',
						'lower' => $lastWriteClient,
						'lowerOpen' => true,	
						'direction' => 'next'
					);
					break; // foreach $tablasSincronia
			}		
		}
	}
}
/*
function getColumns($tableModel) {
	$defaultTableServer = '['.escapeSqlIdent(DEFAULT_PREFIX_TABLE.$tableModel).']';
	$sql = db_prepare("SELECT TOP 0 * FROM $defaultTableServer"); 
	if (!odbc_execute($sql, array())) { throwOdbcError("getColumns $defaultTableServer"); }
	$cols = array();
	$num = odbc_num_fields($sql);
	for ($i=0; $i<$num; $i++) {
		$cols[] = odbc_field_name($sql, 1+$i);
	}
	return $cols;
}
*/
function createUploadTable($tableServer, $tableModel) {
	
	// verificar tabla server
	$sql = db_prepare("SELECT TOP 0 * FROM $tableServer"); 
	if (!odbc_execute($sql, array())) { 
		$defaultTableServer = '['.escapeSqlIdent(DEFAULT_PREFIX_TABLE.$tableModel).']';
	
		$sql = db_prepare("SELECT TOP 0 * INTO $tableServer FROM $defaultTableServer"); 
		if (!odbc_execute($sql, array())) { throwOdbcError("207# SELECT INTO $tableServer FROM $defaultTableServer"); }
	}
}

function prepareUploadRow($tableServer, $colIdxs, $primaryKeys) {

	$colNames = array_map(function($key) { return '['.escapeSqlIdent($key).']';}, array_keys($colIdxs));
	$stat = "INSERT INTO $tableServer ( ".join(", ",$colNames)." ) VALUES ( ".join(", ", array_fill(0,count($colNames),"?"))." )";
	$insertSql = db_prepare($stat); 
	
	$deleteIdxs = array();
	$where = array();
	$sqlArgs = array();
	if ($primaryKeys === null) {
		$deleteSql = null; 
	} else {
		foreach ($primaryKeys as $key) {
			$where[] = "([$key] = ?)";
			$idx = $colIdxs[$key];
			$sqlArgs[] = utf8_decode($val[$idx]);
			$deleteIdxs[] = $idx;
		}
		$deleteSql = db_prepare("DELETE FROM $tableServer WHERE ".join(" AND ", $where));
	}

	return array(
		'insertSql' => $insertSql,
		'deleteSql' => $deleteSql,
		'insertIdxs' => array_values($colIdxs),
		'deleteIdxs' => $deleteIdxs,
		'colIdxs' => $colIdxs
	);
}

function deleteUploadRow($row, $preparedSql) {

	$sqlArgs = array();
	$deleteSql = $preparedSql['deleteSql'];
	if ($deleteSql === null) { 
		foreach ($preparedSql['colIdxs'] as $name => $idx) {
			$val = $row[$idx];
			$name = escapeSqlIdent($name);
			if ($val === null) {
				$where[] = "([$name] IS NULL)";
			} else {
				$where[] = "([$name] = ?)";
				$sqlArgs[] = sqlArg(utf8_decode($val));
				
			}
		}
		$deleteSql = db_prepare("DELETE FROM $tableServer WHERE ".join(" AND ", $where));
	} else {
		foreach($preparedSql['deleteIdxs'] as $idx) {
			$sqlArgs[] = sqlArg(utf8_decode($row[$idx]));
		} 
	}
	if (!odbc_execute($preparedSql['deleteSql'], $sqlArgs)) { throwOdbcError("DELETE"); }
}

function insertUploadRow($row, $preparedSql) {

	$sqlArgs = array();
	foreach($preparedSql['insertIdxs'] as $idx) {
		$sqlArgs[] = sqlArg(utf8_decode($row[$idx]));
	}
	if (!odbc_execute($preparedSql['insertSql'], $sqlArgs)) { 
		deleteUploadRow($row, $preparedSql);
		if (!odbc_execute($preparedSql['insertSql'], $sqlArgs)) { throwOdbcError("INSERT"); }
	}
}

function uploadTable($subtr, &$transactionOut, &$putsSync) {
	$objName = $subtr->objName;
	if (!is_string($objName)) throwError("objName");
	$values =  $subtr->values;
	if ($values === null) $values = array();
	if (!is_array($values)) throwError("values");
	if (count($values) == 0) return null;
	$colNames = $subtr->columns;
	if ($colNames === null) $colNames = array();
	if (!is_array($colNames)) throwError("columns");

	$colIdxs = array(); // column name to idx in $val
	foreach($colNames as $idx => $colName) {
		$colIdxs[utf8_decode($colName)] = $idx;
	}
	$tablasSincronia = getTablasSincronia();

	$table = utf8_decode($objName);
	
	foreach($tablasSincronia as $tableS) {
		$primaryKeys = $tableS['primaryKeys'];
		$mode = $tableS['modeSync']; 
		if (!(($mode == 'upload_download') || ($mode == 'upload'))) continue;

		if ($mode == 'upload_download') {
			if (strncasecmp($table, $tableS['table'], strlen($tableS['table'])) === 0) {
				uploadTable_UD($table, $colIdxs, $values, $primaryKeys, &$transactionOut, &$putsSync);
				return;
			}
		} else {
			if ($tableS['table'] == $table) {
				$tableServer = getTableServerName($table);
				createUploadTable($tableServer, $tableS['table']);
				
				$colIdxLastWrite = $colIdxs['_lastWrite'];
				$colIdxTypeSync = $colIdxs['_typeSync'];
				unset($colIdxs['_lastWrite']);
				unset($colIdxs['_typeSync']);
				$preparedSql = prepareUploadRow($tableServer, $colIdxs, $primaryKeys);
				foreach ($values as $val) {
					//?? ordenado por lastWrite
					$lastWrite = $val[$colIdxLastWrite];
					switch ($val[$colIdxTypeSync]) {
						case 'D' :
							deleteUploadRow($val, $preparedSql);
							break;
						case 'I' :
							insertUploadRow($val, $preparedSql);
							break;	
					}
				}	
				$putsSync['keys'][] = $objName;	// $objName ya es utf8	
				$putsSync['values'][] = array($lastWrite);
				return;
			}
		}
	}
}

// Upload Download ////////////

function requestDownloadSync_UD(&$transactionOut) {
	setSchema('_downloadSync', array('keyPath' => 'table'));
	$transactionOut[] = array(
		'objName' => '_downloadSync',
		'id' => 'downloadSync_UD', 
		'type' => 'get',
		'columns' => array('table', 'serverSync')
	);	
}

function isTeclatsTpv($table) {
	return ($table === "TeclatsTpv");	
}

function postCreateTableTeclatsTpv($tableServer) {

	$sql = db_prepare("UPDATE $tableServer SET [Llicencia] = ?"); 
	if (!odbc_execute($sql, array(CL('Llicencia')))) { throwOdbcError("303# postCreate TeclatsTpv"); }
}

function getMaxDataTeclatsTpv($tableServer) {

	$sql = db_prepare("SELECT MAX([Data]) FROM $tableServer WHERE ([Llicencia] = ?)"); 
	if (!odbc_execute($sql, array(CL('Llicencia')))) { throwOdbcError("SELECT MAX([Data]) TeclatsTpv"); }
	if (odbc_num_rows($sql) === 0) return null;
	odbc_fetch_row($sql);
	return odbc_result($sql, 1);	
}


function downloadTable_UD($tableS, $lastSync, &$transactionOut, &$putsSync) {

	$table = $tableS['table'];
	
	$tableServer = getTableServerName($table);
	$syncTableServer = getSyncTableServerName($table);
	
	$primaryKeys = $tableS['primaryKeys'];	
	$otherFields = $tableS['otherFields'];

	if (isTeclatsTpv($table)) {

		createDownloadTableServer($table, true);

		$tableServer = getTableServerName($table);
		
		$maxData = getMaxDataTeclatsTpv($tableServer);
		if ($maxData === null) return;
		$dateTime = new DateTime($maxData);
		$dateTime->setTimezone(new DateTimeZone("UTC"));
		$serverSync = formatDateOdbc($dateTime);
		if ($ServerSync === $lastSync) return;

		$select = array();
		foreach($primaryKeys as $key) { $select[] = '['.escapeSqlIdent($key).']'; }
		foreach($otherFields as $field) { $select[] = '['.escapeSqlIdent($field).']'; }

		$sql = db_prepare("SELECT ".join(", ",$select)." FROM $tableServer " 
							."WHERE ([Data] = ? AND ([Llicencia] = ?))"); 
		if (!odbc_execute($sql, array($maxData, CL('Llicencia')))) { throwOdbcError("SELECT TeclatsTpv"); }
		if (odbc_num_rows($sql) === 0) return;  // no hay filas nuevas que sincronizar

		$numFields = odbc_num_fields($sql);

		$columns = array();
		$valueTypes = array();
		for ($idx=0; $idx<$numFields; $idx++) {
			$name = utf8_encode(odbc_field_name($sql, 1+$idx));
			$columns[] = $name;
			$type = convertColumnType(odbc_field_type($sql, 1+$idx));
			if ($type !== null) {
				if ($valueTypes[$type] === null) $valueTypes[$type] = array(); 
				$valueTypes[$type][] = $name;
			}	
		}
		if (!$valueTypes) $valueTypes = null;
		
		$puts = array();
		while (odbc_fetch_row($sql)) {
			$put = array();
			for ($idx=0; $idx<$numFields; $idx++) {
				$val = odbc_result($sql, 1+$idx);
				if ($val === null) $put[] = $val;
				else $put[] = utf8_encode($val);
			}
			$puts[] = $put;
		}

		$objName = utf8_encode($table);
		$singlePrimaryKey = (count($primaryKeys) == 1);
		$utf8PrimaryKeys = array_map("utf8_encode", $primaryKeys);

		setSchema($objName, array('keyPath' => $singlePrimaryKey ? $utf8PrimaryKeys[0] : $utf8PrimaryKeys));
		$transactionOut[] = array(
			'objName' => $objName,
			'id' => 'download',
			'type' => 'put',
			'columns' => $columns,
			'valueTypes' => $valueTypes,
			'values' => $puts
		);

		$dateTime = new DateTime($nextServerSync, new DateTimeZone("UTC"));
		$dateTime->setTimezone(getLocalTimeZone());
		$debugServerDatetime = formatDateOdbc($dateTime);

		$putsSync[] = array($objName, $serverSync, $debugServerDatetime);
		
	}
}


function uploadTable_UD($table, $colIdxs, $values, $primaryKeys, &$transactionOut, &$putsSyncUpload) {
	$objName = utf8_encode($table);

	if (isTeclatsTpv($table)) {
		createDownloadTableServer($table, true);

		$localTimeZone = getLocalTimeZone();

		$colIdxLastWrite = $colIdxs['_lastWrite'];
		$colIdxTypeSync = $colIdxs['_typeSync'];
		unset($colIdxs['_lastWrite']);
		unset($colIdxs['_typeSync']);
		$colIdxData = $colIdxs['Data'];
		$preparedSql = prepareUploadRow($tableServer, $colIdxs, $primaryKeys);
		foreach ($values as $val) {
			//?? ordenado por lastWrite
			$lastWrite = $val[$colIdxLastWrite];
			// convertir Data a dateTime local de Server para DB
			$dateTime = new DateTime($val[$colIdxData]);
			$dateTime->setTimezone($localTimeZone);
			$DataUpload = formatDateOdbc($dateTime);
			$val[$colIdxData] = $DataUpload;
			switch ($val[$colIdxTypeSync]) {
				case 'D' :
					deleteUploadRow($val, $preparedSql);
					break;
				case 'I' :
					insertUploadRow($val, $preparedSql);
					break;	
			}
		}	
		$maxData = getMaxDataTeclatsTpv();
		if ($maxData === $DataUpload) {
			$dateTime = new DateTime($maxData);
			$debugServerDatetime = formatDateOdbc($dateTime); 
			$dateTime->setTimezone(new DateTimeZone("UTC"));
			$serverSync = formatDateOdbc($dateTime);
			setSchema('_downloadSync', array('keyPath' => 'table'));
			$transactionOut[] = array(
				'objName' => '_downloadSync',
				'type' => 'put',
				'columns' => array('table', 'serverSync', '_debugServerDateTime'),
				'values' => array($objName, $serverSync, $debugServerDatetime) // objName ya es utf8
			);
		}
		$putsSyncUpload['keys'][] = $objName;	// objName ya es utf8	
		$putsSyncUpload['values'][] = array($lastWrite);
	}
}

?>
