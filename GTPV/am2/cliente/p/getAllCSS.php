<pre>
<?php


echo getcwd() . "\n";
function processPath($path) {
	if ($gestor = opendir($path)) {
		echo "\n-----------------\nGestor de directorio: $gestor\n";
		echo "path: $path\n";
		echo "Entradas:\n";
	 
		/* Esta es la forma correcta de iterar sobre el directorio. */
		while (false !== ($entrada = readdir($gestor))) {
			echo "entrada: $entrada\n";
			$fullEntrada = "$path/$entrada";
			echo "entrada: $fullEntrada\n";
			echo "ext: " . pathinfo($fullEntrada, PATHINFO_EXTENSION) . "\n";
			$dir = is_dir($fullEntrada);
			echo "dir: " . ($dir ? "true" : "false") . "\n";
			if ($dir && ($entrada[0] != '.')) {
				processPath("$fullEntrada");
			}
		}
	 
		closedir($gestor);
	}	
}

processPath(".");
?>
</pre>

