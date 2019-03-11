<pre>
<?php

define("Extension", "css");

function processPath($path) {
	if ($res = opendir($path)) {
		while (false !== ($fileName = readdir($res))) {
			$fullPath = "$path/$fileName";
			if (is_dir($fullPath) && ($fileName[0] != ".")) {
				processPath("$fullPath");
			} else {
				if (strtolower(pathinfo($fullPath, PATHINFO_EXTENSION)) === Extension) {
					processFile($fullPath);
				}
			}
		}
		closedir($gestor);
	}	
}

function processFile($fileName) {
	$content = file_get_contents($fileName);
	$content = '"'.preg_replace('#(\\\\|\\"|\\r?\\n)#', '\\\\$1', $content).'"';
	
	echo "H.CSS.push({\npath:\n\"".preg_replace('#(\\\\|\\")#', '\\\\$1', substr($fileName, 1))."\",\n";
	echo "content:\n$content}\n);\n";
}

echo "H = (window.H || {});\n";
echo "H.CSS = (H.CSS || []);\n";

processPath(".");
?>
</pre>

