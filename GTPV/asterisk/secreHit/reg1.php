<?php

	$fpL = fopen('/var/www/HitExtern/regLock.txt','c+');
	
	if (!flock($fpL, LOCK_EX)) {
		die('X');
	}
	
	$line = fgets($fpL);
	$t = ($line !== false) ? (int)$line : 0;
	
	if ((time()-$t)>10) {
		ftruncate($fpL, 0);
		fwrite($fpL, time());
		$fReg = true;
	} else $fReg = false;
	
	$fpE = fopen('regExt.txt','c+');

	if (flock($fpE, LOCK_EX)) ftruncate($fpE,0);

	flock($fpE, LOCK_UN);
	fclose($fpE);
	
	flock($fpL, LOCK_UN);
	fclose($fpL);
	
	echo fReg ? 'T777' : 'X', "\n"; 
