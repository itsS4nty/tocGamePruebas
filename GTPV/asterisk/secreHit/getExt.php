<?php

	require_once('phpagi-asmanager.php');

	$t0 = time();
	while (true) {
		if (time()-$t0 < 10) die('X');
		if (filesize('regExt.txt') != 0) break;
	}  

	$asm = new AGI_AsteriskManager();
	if($asm->connect())
	{
		$ext = $asm->send_request('DBGet',
					array('Family'=>'HitReg',
						  'Key'=>'Ext'));
		$asm->disconnect();
	} 

	if (!flock($fpL, LOCK_EX)) {
		die('X');
	}
	
	$fpL = fopen('../regLock.txt','c+');

	$line = fgets($fpL);
	$t = ($line !== false) ? (int)$line : 0;

	ftruncate($fpL, 0);
	flock($fpL, LOCK_UN);
	fclose($fpL);
	
	if ($ext === false) die('X');
	if (count($ext) == 0) die('X');

	echo("E$ext");
