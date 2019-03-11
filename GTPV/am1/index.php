<?php

$type = $_COOKIE['type'];

if ($type == 'host') {
	include("index_host.html");
	exit();	
}

include("index_findHost.php");

?>
