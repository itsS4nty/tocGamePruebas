<?php

// index findHost para no-Hosts (sat y no registrado)

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

$hosts = getHosts();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html nomanifest="gtpvSat.appcache" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>GTPV Sat</title>
<script src="cliente/jquery/jquery-1.7.1.mod.js"></script>
<script src="cliente/findHost.js"></script>
<script type="text/javascript">
	var hosts = [
<?php
		$coma = '';
		foreach($hosts as $user => $ipLan) {
			echo($coma);
			$coma = ',';
			echo("{user: \"$user\", ipLan: \"$ipLan\" }");
		}
?>
	];
</script>
</head>

<body>
</body>
</html>