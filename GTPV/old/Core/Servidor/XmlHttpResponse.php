<?php
	/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		XmlHttpResponse.php
	Descripción: 	Permite responder peticiones XmlHttp efectuadas por la aplicación cliente.
	Autor: 			Daniel Durán.
	*/
	
	header("Content-type: text/xml");
	
	include("ErrorHandler.php");
	include("Utils.php");
	include("SqlXmlParser.php");
	
	try
	{
		// Recibir los datos del cliente:
		$_XmlStr = CargarPost("xml");
		
		if ($_XmlStr)
		{
			// Eliminar todos los carácteres "\" del XML (a veces javascript lo envia asi y da error:
			
			$_XmlStr = str_replace("\\", "", $_XmlStr);
			$_Xml = new SimpleXMLElement($_XmlStr);
			
			$_IdUsuario = $_Xml["idusuario"];
			$_IdVersion = $_Xml["idversion"];
			$_FechaUltimaSinc = $_Xml["fechaultimasinc"];
			
			$_SqlXmlParser = new SqlXmlParser($_IdUsuario, $_IdVersion, $_FechaUltimaSinc);
			
			$_XmlRespuesta = $_SqlXmlParser->CargarDatosXml();
			$_SqlXmlParser->GuardarDatosXml($_XmlStr);
			echo $_XmlRespuesta;
		}
		else
		{
			throw new Exception("No se han recibido datos xml desde el cliente.", 0);
		}
	}
	catch(Exception $e)
	{
		MostrarErrorXml($e);
	}
	
	function MostrarErrorXml($vExcepcion)
	{
		// Mostrar un error en formato XML:
		$_Xml = new SimpleXMLElement("<servidor></servidor>");
		
		// Escribir atributos de nombre de base de datos, versión y fecha de sincronización:
		//$_Xml->addAttribute("bbdd", $this->_NombreBBDD);
		//$_Xml->addAttribute("idversion", $this->_IdVersionActual);
		//$_Xml->addAttribute("fechasinc", FechaANSI());
		
		$_NodoError = $_Xml->addChild("error");
		$_NodoError->addAttribute("codigo", $vExcepcion->getCode());
		$_NodoError->addAttribute("mensaje", utf8_encode($vExcepcion->getMessage()));
		
		echo $_Xml->asXML();
	}
?>