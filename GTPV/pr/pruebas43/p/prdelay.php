<?php
	$time0 = time();
	$delay = $_GET["delay"];
	while ((time()-$time0) < $delay);
	echo("$delay seconds");
?>
