<?php
	/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		ErrorHandler.php
	Descripción: 	Permite manejar de forma controlada los errores de php.
	Autor: 			Daniel Durán.
	*/

	// Pasar a manejar todos los errores de php como una excepción:
	set_error_handler(ErrorToException);
	
	// Función que convierte un error de php en una excepción:
	function ErrorToException($vCodigo, $vMensaje, $vArchivo, $vLinea)
	{
		$_Mensaje = "$vMensaje en archivo $vArchivo linea $vLinea";
		throw new Exception($_Mensaje, $vCodigo);
	}
	
	// Función que muestra un error de php en un mensaje entendible por pantalla:
	function ErrorHandler($errno, $errstr, $errfile, $errline)
	{
		// Comprobar si este código de error está incluido en error_reporting.
		if (error_reporting() & $errno) {
			switch ($errno) {
			case E_USER_ERROR:
				echo "<b>My ERROR</b> [$errno] $errstr<br />\n";
				echo "  Fatal error on line $errline in file $errfile";
				echo ", PHP " . PHP_VERSION . " (" . PHP_OS . ")<br />\n";
				echo "Aborting...<br />\n";
				exit(1);
				break;
		
			case E_USER_WARNING:
				echo "<b>My WARNING</b> [$errno] $errstr<br />\n";
				break;
		
			case E_USER_NOTICE:
				echo "<b>My NOTICE</b> [$errno] $errstr<br />\n";
				break;
		
			default:
				echo "Unknown error type: [$errno] $errstr<br />\n";
				break;
			}
		}
		
		// No ejecutar el error handler interno de PHP:
		return true;
	}
?>