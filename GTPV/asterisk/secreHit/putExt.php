<?php

require_once('phpagi.php');

$agi = new AGI();

$fpE = fopen('regExt.txt','c+');

if (!flock($fpE, LOCK_EX)) {
	die('X');
}

ftruncate($fpE,0);
fwrite($fpE, "$ext");

flock($fpE, LOCK_UN);
fclose($fpE);

