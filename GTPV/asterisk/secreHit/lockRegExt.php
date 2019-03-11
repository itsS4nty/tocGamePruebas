<?php

	require_once('phpagi-asmanager.php');
	
	$fpL = fopen('../regLock.txt','c+');
	
	if (!flock($fpL, LOCK_EX)) {
		die('X');
	}
	
	$line = fgets($fpL);
	$t = ($line !== false) ? (int)$line : 0;
	
	if ((time()-$t)>15) {

		ftruncate($fpL, 0);
		fwrite($fpL, time());
		$fReg = true;

		$asm = new AGI_AsteriskManager();
		if($asm->connect())
		{
			$call = $asm->send_request('DBDel',
						array('Family'=>'HitReg',
							  'Key'=>'Ext'));
			$asm->disconnect();
		} 
	} else $fReg = false;
	
	flock($fpL, LOCK_UN);
	fclose($fpL);
	
	echo fReg ? 'T777' : 'X', "\n"; 
