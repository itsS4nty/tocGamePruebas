<?php

function getHosts() {
	$hosts = array();
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
	if ($ConnDB === FALSE) return $hosts; 

	$ipWan = $_SERVER['REMOTE_ADDR'];
	$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES WHERE [ipWan]=?"); 
	$exec = odbc_execute($sql, array($ipWan));
	if ($exec) {
		while(odbc_fetch_row($sql)) {
			$hosts[odbc_result($sql,"user")] = odbc_result($sql,"ipLan");		
		}
	}
	odbc_close($ConnDB);
	return $hosts;
}

$type = $_COOKIE['type'];

//$user = $_COOKIE['user'];

if ($type == 'host') {
	include("index_host.html");
	exit();	
}

/*
$hosts = array();
if ($type == 'sat') {
	$hosts2 = getHosts();
	if (isset($hosts2[$user])) $hosts[$user] = $hosts2[$user];
	else $hosts = $hosts2;
	include("index_findHost.php");
	exit();	
}
*/

$hosts = getHosts();
include("index_findHost.php");

?>
