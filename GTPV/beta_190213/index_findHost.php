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
</script></head>

<body>
</body>
</html>