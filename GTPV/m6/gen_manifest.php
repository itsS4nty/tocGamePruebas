<?php

$removeSufixPath = ($outputRelative ? 2 : 1); // eliminar primer punto(.) o (./)

function outputPath($path) {
	global $f, $removeSufixPath;	
	
	$path = substr($path, $removeSufixPath);
	if (($path === "") || ($path === FALSE)) $path = "./";
	fwrite($f, "$path\n"); 
}

function processPath($path, $info) {
	if ($info['fInclRoot']) outputPath("$path/");
	if ($res = opendir($path)) {
		while (FALSE !== ($fileName = readdir($res))) {
			$fullPath = "$path/$fileName";
//			var_dump($fullPath);
			if (is_dir($fullPath)) { 
				if ($fileName[0] != ".") {
					$infoSubDir = ($info['subDirs'] !== NULL) ? $info['subDirs'][$fileName] : NULL;
					if ($infoSubDir === NULL) $infoSubDir = array( 'fIncl' => $info['fIncl']);
					processPath($fullPath, $infoSubDir);
				}	
			} else {
				$found = ($info['files'] != NULL) ? in_array($fileName, $info['files']) : FALSE;
//				var_dump($found);
				if (($info['fIncl'] && !$found) || (!$info['fIncl'] && $found))
					outputPath($fullPath);
			}
		}
		closedir($res);
	}	
}

function getInitInfo() {
	return array(
		'filesI' => array(),
		'filesE' => array(),
		'subDirs' => array()
	);
}

function &findSubInfo($e, $i, $n, &$info) {
	if ($i === $n) return $info;
	else {
/*		var_dump($e);
		var_dump($i);
		var_dump($n);
		var_dump($info);
*/		$subInfo = &$info['subDirs'][$e[$i]];
//		var_dump($subInfo);
		if ($subInfo === NULL) {
			$subInfo = getInitInfo();
			$info['subDirs'][$e[$i]] = &$subInfo;
//			var_dump($info['subDirs'][$e[$i]]);
//			var_dump($info);
		}
		return findSubInfo($e, $i+1, $n, $subInfo);
	}
}

function postProcessInfo(&$info, $fIncl) {
	if (!isset($info['fIncl'])) $info['fIncl'] = $fIncl;
	$fIncl = $info['fIncl'];
	$info['files'] = $info[($fIncl ? 'filesE' : 'filesI')];
	unset($info['filesI'], $info['filesE']);
	if (count($info['files']) === 0) unset($info['files']);
	if (count($info['subDirs']) === 0) unset($info['subDirs']);
	else {
		foreach($info['subDirs'] as &$subInfo) 
			postProcessInfo($subInfo, $fIncl);	
	}
}

function makeInfo($arrayData) {
	$info = getInitInfo(); 
	foreach($arrayData as $data) {
		$e = explode('/', $data);
		$fIncl = ($e[0] === '+');
		$n = count($e)-1;
		$fileName = $e[$n];
/*			var_dump($e);
		var_dump($fIncl);
		var_dump($n);
		var_dump($fileName);
*/			$subInfo = &findSubInfo($e, 1, $n, $info);
		if ($fileName === "*") {           // path
			$subInfo['fIncl'] = $fIncl;            
		} elseif ($fileName === "") {      // rootElement
			$subInfo['fInclRoot'] = TRUE;       
		} else {                           // file
			$subInfo[($fIncl ? 'filesI' : 'filesE')][] = $fileName;  
		}
	}
	postProcessInfo($info, TRUE);
	return $info;
}


$info = makeInfo($data);
//var_dump($info);
$f = fopen($fileName, 'w');
if ($f === FALSE) exit();

fwrite($f, "CACHE MANIFEST\n");
fwrite($f, "\n");
fwrite($f, "# $fileName\n");
fwrite($f, "# ".date("d/m/y H:i:s")."\n");
fwrite($f, "\n");
fwrite($f, "CACHE:\n");
fwrite($f, "\n");

processPath('.', $info);

fwrite($f, "\n");
fclose($f);

?>
<pre>
ok
</pre>
