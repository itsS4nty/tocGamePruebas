<?php

header("Content-type: text/javascript; charset=utf-8");
	
define("Extension", "css");

function processPath($path) {
	if ($res = opendir($path)) {
		while (false !== ($fileName = readdir($res))) {
			$fullPath = "$path/$fileName";
			if (is_dir($fullPath)) {
				if ($fileName[0] != ".") processPath($fullPath);
			} else {
				if (strtolower(pathinfo($fullPath, PATHINFO_EXTENSION)) === Extension) {
					processFile($fullPath);
				}
			}
		}
		closedir($res);
	}	
}

function processFile($fileName) {
	global $f;
	$content = file_get_contents($fileName);
	$content = preg_replace('#(\\\\|\\")#', '\\\\$1', $content);
	$content = preg_replace('#(\\r?\\n)#', '\\n\\\\$1', $content);
	
	// eliminar primer punto(.) en $fileName
	fwrite($f, "H.CSSData.push({\npath:\n\"".preg_replace('#(\\\\|\\")#', '\\\\$1', substr($fileName, 1))."\",\n"); 
	fwrite($f, "content:\n\"$content\"}\n);\n");
}

$no_generate = ($_SERVER['QUERY_STRING'] == 'no_generate');
$f = fopen($no_generate ? 'php://output' : 'allCSS.js', "w");
if ($f === FALSE) exit();

fwrite($f, "H = (window.H || {});\n");
fwrite($f, "H.CSSData = (H.CSSData || []);\n");

processPath(".");

if (!$no_generate) echo('OK');

fclose($f);

?>


