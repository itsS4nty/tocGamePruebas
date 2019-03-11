<?php
	/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		Utils.php
	Descripción: 	Conjunto de utilidades para php.
	Autor: 			Daniel Durán.
	*/
	
	// Retornar el valor de una variable GET o un valor por defecto si no existe:
	function CargarGet($vNombre, $vDefecto = NULL)
	{ 
    	return isset($_GET[$vNombre])? $_GET[$vNombre] : $vDefecto; 
	}
	
	// Retornar el valor de una variable POST o un valor por defecto si no existe:
	function CargarPost($vNombre, $vDefecto = NULL)
	{ 
    	return isset($_POST[$vNombre])? $_POST[$vNombre] : $vDefecto; 
	}
	
	/*
	// Retornar un string que representa la fecha actual en formato ANSI:
	function FechaANSI()
	{
		$vFecha = new DateTime();
		$_Array = explode(' ', microtime());
		$_Milisegundos = (int)round($_Array[0] * 1000, 3);
		return $vFecha->format("Y-m-d H:i:s") . "." . str_pad($_Milisegundos, 3, "0", STR_PAD_LEFT);
	}
	*/
?>