<?php

include("db.php");
include("request.php");
include("synchronize.php");

function throwOdbcError($str) {
	throwError($str."\nODBC: ".odbc_errormsg(getConnDB()),1);
}

function throwError($str, $idx=0) {
	$dd = debug_backtrace();
	$d0 = $dd[$idx];
	$d1 = $dd[$idx+1];
	$str = "Error:\n".$str."\nFile: ".$d0['file']."\nLine: ".$d0['line'].
	       "\nFunction: ".$d1['function']."\nArgs: ".print_r($d1['args'], true);
	throw new Exception($str);
}

$outData = array();

function getOutData($name) {
	global $outData;
	
	return $outData[$name];
} 

function setOutData($name, $data) {
	global $outData;
	
	$outData[$name] = $data;
} 

function main($jsonIn) {	
	$dbsOut = null;
	try {
		if ($jsonIn === null) throwError("101# error json_decode");
		if (!is_object($jsonIn)) throwError("jsonIn no object");
		$gtpv = $jsonIn->gtpv;
		if ($gtpv === null) throwError("No gtpv");
		
		openDB();
		if (getClientInfo($jsonIn)) {
			switch(getSession($jsonIn)) {
				case null :
					$dbsOut = firstSyncRequest();	
					break;
				case 'synchronize' :
					// sincro, updateSincro, download, upload
					$dbsOut = synchronize($jsonIn);
					break;
			}
			setOutData('session', 'synchronize');	
		}
		$jsonOut = array(
			'gtpv' => array('server', 1),
			'info' => getOutData('info'),
			'session' => getOutData('session'),
			'communication' => 60
		);
		if ($dbsOut !== null) {
			$jsonOut['dbs'] = $dbsOut;
		}
	} catch (Exception $e) {
		$jsonOut = $e->getMessage();
	}
	closeDB();
	return $jsonOut;
}

?>
