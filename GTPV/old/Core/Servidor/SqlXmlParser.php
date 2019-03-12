<?php
	/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		SqlXmlParser.php
	Descripción: 	Permite enviar peticiones XML a partir de datos SQL.
					Permite enviar peticiones SQL a partir de datos XML.
	Autor: 			Daniel Durán.
	
	NOTA: LA RESPUESTA XML DE LA BASE DE DATOS MYSQL AUN NO ESTÁ IMPLEMENTADA.
		  SOLO FUNCIONA CON SQL SERVER.
	*/
	
	include("AccesoDatos.php");
	
	// Permite crear objetos xml con datos de la base de datos SQL y viceversa:
	class SqlXmlParser
	{
		// Campos:
		private $_AccesoDatos;
		
		private $_IdUsuario;
		private $_IdVersionUsuario;
		private $_FechaUltimaSinc;
		
		private $_TipoBBDD;
		private $_NombreBBDD;
		private $_IdVersionActual;
		private $_TablasUsuario;
		
		private $_EsNuevo;
		
		// Constructor:
		public function SqlXmlParser($vIdUsuario, $vIdVersionUsuario, $vFechaUltimaSinc)
		{	
			$this->_AccesoDatos = CrearAccesoDatos(SQLSERVER);
			
			$this->_IdUsuario = $vIdUsuario;
			$this->_IdVersionUsuario = $vIdVersionUsuario;
			$this->_FechaUltimaSinc = $vFechaUltimaSinc;
			
			$this->_TipoBBDD = $this->_AccesoDatos->TipoBD();
			$this->_NombreBBDD = $this->_AccesoDatos->NombreBD();
			$this->_IdVersionActual = $this->CargarIdVersionActual();
			$this->_TablasUsuario = $this->CargarTablasUsuario();
			
			$this->_EsNuevo =  ($this->_IdVersionUsuario != $this->_IdVersionActual ||
								$this->_FechaUltimaSinc == NULL);
								
			//echo "DATOS -> $this->_IdVersionUsuario - $this->_IdVersionActual - $this->_FechaUltimaSinc";
			
			if (count($this->_TablasUsuario) == 0)
				throw new Exception("El usuario $this->_IdUsuario no posee tablas.", 2);
		}
		
		// Métodos:
		// Cargar el último número de versión:
		private function CargarIdVersionActual()
		{
			$_Version = NULL;
			
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
				
			$_Sql = "SELECT IdVersion FROM Versiones ORDER BY IdVersion DESC";
			
			$_Datos = $this->_AccesoDatos->CargarDatos($_Sql);
			
			if (count($_Datos) > 0)
			{
				$_Registro = $_Datos[0];
				$_Version = $_Registro["IdVersion"];
			}
			
			$this->_AccesoDatos->CerrarConexion();
			
			return $_Version;
		}
		
		// Cargar los nombres de las tablas a las que tiene acceso un usuario:
		private function CargarTablasUsuario()
		{
			$_Tablas = array();
			
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			/*
				Comprobar que las tablas contienen los siguientes campos:
					- FechaAlta
					- FechaAct
			*/
			
			$_NombreBBDD = $this->_AccesoDatos->NombreBD();
			
			if ($this->_TipoBBDD == MYSQL)
			{
				// POR IMPLEMENTAR.
				throw new Exception("Conexión con MySql no implementada", 1);
			}
			else
			{
				$_Sql = "SELECT *
						FROM ClientesTablas
						WHERE IdUsuario = $this->_IdUsuario
						AND NombreTabla IN
						(
							SELECT DISTINCT TABLE_NAME
							FROM INFORMATION_SCHEMA.COLUMNS
							WHERE TABLE_CATALOG = '$this->_NombreBBDD'
							AND (UPPER(COLUMN_NAME) IN ('FECHAALT', 'FECHAACT'))
						);";
			}
			
			$_Datos = $this->_AccesoDatos->CargarDatos($_Sql);
			
			foreach($_Datos as $_Registro)
			{	
				$_Tablas[] = $_Registro["NombreTabla"];
			}
			
			$this->_AccesoDatos->CerrarConexion();
			
			return $_Tablas;
		}
		
		// Cargar la información de los campos de una tabla:
		private function CargarCamposTabla($vNombreTabla)
		{
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			// Cargar la información de los campos de la tabla:
			$_Sql = NULL;
			
			if ($this->_TipoBBDD == MYSQL)
			{
				// POR IMPLEMENTAR.
				throw new Exception("Conexión con MySql no implementada", 1);
			}
			else
			{
				$_Sql = "SELECT COLUMN_NAME, DATA_TYPE,
						CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION
						FROM INFORMATION_SCHEMA.COLUMNS
						WHERE TABLE_CATALOG = '$this->_NombreBBDD' AND
						TABLE_NAME = '$vNombreTabla';";
			}
			
			$_InfoCampos =  $this->_AccesoDatos->CargarDatos($_Sql);
			
			$this->_AccesoDatos->CerrarConexion();
			
			return $_InfoCampos;
		}
		
		// Cargar la información de las claves de una tabla:
		private function EsPrimaria($vNombreTabla, $vNombreCampo)
		{
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			// Cargar la información de las claves de la tabla:
			$_Sql = NULL;
			
			if ($this->_TipoBBDD == MYSQL)
			{
				// POR IMPLEMENTAR.
				throw new Exception("Conexión con MySql no implementada", 1);
			}
			else
			{
				$_Sql = "SELECT COLUMN_NAME
						FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
						WHERE TABLE_CATALOG = '$this->_NombreBBDD' AND
						TABLE_NAME = '$vNombreTabla' AND
						COLUMN_NAME = '$vNombreCampo'";
			}
			
			$_InfoCampos =  $this->_AccesoDatos->CargarDatos($_Sql);
			
			$this->_AccesoDatos->CerrarConexion();
			
			return (count($_InfoCampos) > 0);
		}
		
		private function CargarTipoCampo($vTabla, $vCampo)
		{
			$_TipoCampo = NULL;
			
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			// Cargar la información de las claves de la tabla:
			$_Sql = NULL;
			
			if ($this->_TipoBBDD == MYSQL)
			{
				// POR IMPLEMENTAR.
				throw new Exception("Conexión con MySql no implementada", 1);
			}
			else
			{
				$_Sql = "SELECT DATA_TYPE AS Tipo,
						CHARACTER_MAXIMUM_LENGTH AS Caracter, NUMERIC_PRECISION AS Numerico
						FROM INFORMATION_SCHEMA.COLUMNS
						WHERE TABLE_CATALOG = '$this->_NombreBBDD' AND
						TABLE_NAME = '$vTabla' AND
						COLUMN_NAME = '$vCampo';";
			}
			
			$_InfoCampos =  $this->_AccesoDatos->CargarDatos($_Sql);
			
			if (count($_InfoCampos) > 0)
			{
				$_RegistroCampos = $_InfoCampos[0];
				
				$_TipoCampo = $_RegistroCampos["Tipo"];
				
				if ($_RegistroCampos["Caracter"])
					$_TipoCampo = $_TipoCampo . "(" . $_RegistroCampos["Caracter"] . ")";
					
				if ($_RegistroCampos["Numerico"])
					$_TipoCampo = $_TipoCampo . "(" . $_RegistroCampos["Numerico"] . ")";
				
				$_TipoCampo = $this->ConvertirTipoANSI($this->_AccesoDatos->TipoBD(), $_TipoCampo);
			}
			
			$this->_AccesoDatos->CerrarConexion();
			
			return $_TipoCampo;
		}
		
		private function CargarInsertsTabla($vNombreTabla)
		{
			$_FechaANSI = str_replace("-", "", $this->_FechaUltimaSinc);
			
			$_InfoRegistros = array();
			
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			$_SqlRegistros = NULL;
			$_SqlFechas = NULL;
			
			if ($this->_TipoBBDD == MYSQL)
			{
				// POR IMPLEMENTAR.
			}
			else
			{
				if ($this->_EsNuevo)
				{
					$_SqlRegistros = "SELECT *
									  FROM $vNombreTabla;";
									  
					$_SqlFechas = "SELECT CONVERT(VARCHAR, FechaAlta, 121) AS FechaAltaANSI,
								   CONVERT(VARCHAR, FechaAct, 121) AS FechaActANSI
								   FROM $vNombreTabla";
				}
				else
				{
					$_SqlRegistros = "SELECT *
									  FROM $vNombreTabla
									  WHERE (FechaAlta > CAST('$_FechaANSI' AS datetime));";
								   
					$_SqlFechas = "SELECT CONVERT(VARCHAR, FechaAlta, 121) AS FechaAltaANSI,
								   CONVERT(VARCHAR, FechaAct, 121) AS FechaActANSI
								   FROM $vNombreTabla
								   WHERE FechaAlta > CAST('$_FechaANSI' AS datetime);";
				}
			}
			$_InfoRegistros = $this->_AccesoDatos->CargarDatos($_SqlRegistros);
			$_InfoFechas = $this->_AccesoDatos->CargarDatos($_SqlFechas);
			
			for ($i = 0; $i < count($_InfoRegistros); $i++)
			{
				$_InfoRegistros[$i]["FechaAlta"] = $_InfoFechas[$i]["FechaAltaANSI"];
				$_InfoRegistros[$i]["FechaAct"] = $_InfoFechas[$i]["FechaActANSI"];
			}
			
			$this->_AccesoDatos->CerrarConexion();
			
			return $_InfoRegistros;
		}
		
		private function CargarUpdatesTabla($vNombreTabla)
		{
			$_FechaANSI = str_replace("-", "", $this->_FechaUltimaSinc);
			
			$_InfoRegistros = array();
			
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			$_SqlRegistros = NULL;
			$_SqlFechas = NULL;
			
			if ($this->_TipoBBDD == MYSQL)
			{
				// POR IMPLEMENTAR.
			}
			else
			{
				$_SqlRegistros = "SELECT *
								  FROM $vNombreTabla
								  WHERE (FechaAct > CAST('$_FechaANSI' AS datetime)) AND
								  (FechaAlta <= CAST('$_FechaANSI' AS datetime));";
								   
				$_SqlFechas = "SELECT CONVERT(VARCHAR, FechaAlta, 121) AS FechaAltaANSI,
							   CONVERT(VARCHAR, FechaAct, 121) AS FechaActANSI
							   FROM $vNombreTabla
							   WHERE (FechaAct > CAST('$_FechaANSI' AS datetime)) AND
							   (FechaAlta <= CAST('$_FechaANSI' AS datetime));";
			}
			
			$_InfoRegistros = $this->_AccesoDatos->CargarDatos($_SqlRegistros);
			$_InfoFechas = $this->_AccesoDatos->CargarDatos($_SqlFechas);
			
			for ($i = 0; $i < count($_InfoRegistros); $i++)
			{
				$_InfoRegistros[$i]["FechaAlta"] = $_InfoFechas[$i]["FechaAltaANSI"];
				$_InfoRegistros[$i]["FechaAct"] = $_InfoFechas[$i]["FechaActANSI"];
			}
			
			$this->_AccesoDatos->CerrarConexion();
			
			return $_InfoRegistros;
		}
		
		// Carga los datos del servidor en formato XML:
		public function CargarDatosXml()
		{
			// Crear el objeto XML:
			$_Xml = new SimpleXMLElement("<servidor></servidor>");
			$_NodoCreate = $_Xml->addChild("create");
			$_NodoInsert = $_Xml->addChild("insert");
			$_NodoUpdate = $_Xml->addChild("update");
			
			// Si la última fecha de sincronizacion es NULL o el id de versión del cliente no coincide
			// con el id de la versión actual, cargar el esquema de la base de datos:
			
			if ($this->_EsNuevo)
			{
				foreach($this->_TablasUsuario as $_NombreTabla)
				{
					$_NodoTabla = $_NodoCreate->addChild("tabla");
					$_NodoTabla->addAttribute("nombre", $_NombreTabla);
					
					// Cargar la información de los campos de la tabla:
					$_InfoCampos = $this->CargarCamposTabla($_NombreTabla);
					
					// Crear los nodos:
					foreach ($_InfoCampos as $_RegistroCampos)
					{
						$_NombreCampo = $_RegistroCampos["COLUMN_NAME"];
						$_NodoCampo = $_NodoTabla->addChild("campo");
						$_NodoCampo->addAttribute("nombre", $_NombreCampo);
						
						$_TipoCampo = $this->CargarTipoCampo($_NombreTabla, $_NombreCampo);
						$_NodoCampo->addAttribute("tipo", $_TipoCampo);
					
						if ($this->EsPrimaria($_NombreTabla, $_NombreCampo))
							$_NodoCampo->addAttribute("es_primaria", "true");
						else
							$_NodoCampo->addAttribute("es_primaria", "false");
					}
				}
			}
			
			// En cualquier caso, cargar los registros a partir de la fecha dada:
			// Cargar inserts:
			foreach($this->_TablasUsuario as $_NombreTabla)
			{
				$_NodoTabla = NULL;
				
				// Cargar los campos de la tabla:
				$_InfoCampos = $this->CargarCamposTabla($_NombreTabla);
				
				// Cargar los registros de la tabla:
				$_InfoRegistros = $this->CargarInsertsTabla($_NombreTabla);
				
				if (count($_InfoRegistros) > 0)
				{
					$_NodoTabla = $_NodoInsert->addChild("tabla");
					$_NodoTabla->addAttribute('nombre', $_NombreTabla);
					
					foreach ( $_InfoRegistros as $_Registro )
					{
						$_NodoRegistro = $_NodoTabla->addChild("registro");
						
						foreach ($_InfoCampos as $_RegistroCampo)
						{
							$_NombreCampo = $_RegistroCampo["COLUMN_NAME"];
							$_ValorCampo = $_Registro[$_NombreCampo];
							
							$_NodoCampo = $_NodoRegistro->addChild("campo");
							$_NodoCampo->addAttribute("nombre", $_NombreCampo);
							$_NodoCampo->addAttribute("valor", $_ValorCampo);
							
							if ($this->EsPrimaria($_NombreTabla, $_NombreCampo))
								$_NodoCampo->addAttribute("es_primaria", "true");
							else
								$_NodoCampo->addAttribute("es_primaria", "false");
						}
					}
				}
			}
			
			// Cargar updates:
			if (!$this->_EsNuevo)
			{
				foreach($this->_TablasUsuario as $_NombreTabla)
				{
					$_NodoTabla = NULL;
					
					// Cargar los campos de la tabla:
					$_InfoCampos = $this->CargarCamposTabla($_NombreTabla);
					
					// Cargar los registros de la tabla:
					$_InfoRegistros = $this->CargarUpdatesTabla($_NombreTabla);
					
					if (count($_InfoRegistros) > 0)
					{
						$_NodoTabla = $_NodoUpdate->addChild("tabla");
						$_NodoTabla->addAttribute('nombre', $_NombreTabla);
						
						foreach ( $_InfoRegistros as $_Registro )
						{
							$_NodoRegistro = $_NodoTabla->addChild("registro");
							
							foreach ($_InfoCampos as $_RegistroCampo)
							{
								$_NombreCampo = $_RegistroCampo["COLUMN_NAME"];
								$_ValorCampo = $_Registro[$_NombreCampo];
								
								$_NodoCampo = $_NodoRegistro->addChild("campo");
								$_NodoCampo->addAttribute("nombre", $_NombreCampo);
								$_NodoCampo->addAttribute("valor", $_ValorCampo);
								
								if ($this->EsPrimaria($_NombreTabla, $_NombreCampo))
									$_NodoCampo->addAttribute("es_primaria", "true");
								else
									$_NodoCampo->addAttribute("es_primaria", "false");
							}
						}
					}
				}
			}
			
			// Escribir atributos de nombre de base de datos, versión y fecha de sincronización:
			$_Xml->addAttribute("bbdd", $this->_NombreBBDD);
			$_Xml->addAttribute("idversion", $this->_IdVersionActual);
			
			return $_Xml->asXML();
		}
		
		// Convierte un tipo de dato a su equivalente en ANSI SQL:
		public function ConvertirTipoANSI($vTipoBBDD, $vTipoDato)
		{
			/*
			TIPOS DE DATOS ANSI SQL:
			TEXT(texto)
			BIT (Binario)
			INTEGER (numerico)
			FLOAT(decimal)
			TIMESTAMP (Fecha y hora juntas).
			*/
			
			$_Tipo = "";
			$_Valor = "";
			$_TipoANSI = "";
			
			$array = preg_split("/[\(\)]/", $vTipoDato);
			
			$_Tipo = trim(strtoupper($array[0]));
			
			if (count($array) > 1)
				$_Valor = trim($array[1]);
			
			if ($vTipoBBDD == MYSQL)
			{
				switch($_Tipo)
				{
					// Numéricos
					case "BIT":
					case "BOOL":
					case "BOOLEAN":
					case "TINYINT":
					case "SMALLINT":
					case "MEDIUMINT":
					case "INT":
					case "INTEGER":
					case "BIGINT":
					case "SERIAL":
						$_TipoANSI = "INTEGER";
						break;
					
					// Decimales:
					case "FLOAT":
					case "DOUBLE":
					case "DOUBLE PRECISION":
					case "REAL":
					case "DECIMAL":
					case "DEC":
					case "NUMERIC":
					case "FIXED":
						$_TipoANSI = "FLOAT";
						break;
					
					// Fecha y hora:
					case "DATE":
					case "DATETIME":
					case "TIMESTAMP":
					case "TIME":
					case "YEAR":
						$_TipoANSI = "TIMESTAMP";
						break;
					
					// Binarios:
					case "BINARY":
					case "VARBINARY":
						$_TipoANSI = "BIT";
						break;
					
					// Otros:
					default:
						$_TipoANSI = "VARCHAR2";
						break;
				}
			}
			else if ($vTipoBBDD == SQLSERVER)
			{
				switch($_Tipo)
				{
					// Numéricos:
					case "BIGINT":
					case "BIT":
					case "DECIMAL":
					case "INT":
					case "MONEY":
					case "NUMERIC":
					case "SMALLINT":
					case "SMALLMONEY":
					case "TINYINT":
						$_TipoANSI = "INTEGER";
						break;
					
					// Decimales:
					
					case "FLOAT":
					case "REAL":
						$_TipoANSI = "FLOAT";
						break;
					
					// Fecha y hora:
					case "DATE":
					case "DATETIME2":
					case "DATETIME":
					case "DATETIMEOFFSET":
					case "SMALLDATETIME":
					case "TIME":
					case "TIMESTAMP":
						$_TipoANSI = "TIMESTAMP";
						break;
					
					// Binarios:
					case "BINARY":
					case "IMAGE":
					case "VARBINARY":
						$_TipoANSI = "BIT";
						break;
					
					// Otros:
					default:
						$_TipoANSI = "VARCHAR2";
						break;
				}
			}
			
			if ($_Valor)
				$_TipoANSI = $_TipoANSI . "(" . $_Valor . ")";
			
			return $_TipoANSI;
		}
		
		public function GuardarDatosXml($vXmlStr)
		{
			$_Xml = new SimpleXMLElement($vXmlStr);
			$_Script = array();
			$_SubNodos = $_Xml->children();
			$_NodosInsert = $_SubNodos[0];
			$_NodosUpdate = $_SubNodos[1];
			
			/*
			// Cargar la información de los campos de la tabla:
					$_InfoCampos = $this->CargarCamposTabla($_NombreTabla);
					$_InfoClaves = $this->CargarClavesTabla($_NombreTabla);
					
					// Crear los nodos:
					foreach ($_InfoCampos as $_RegistroCampos)
					{
						$_NombreCampo = $_RegistroCampos["COLUMN_NAME"];
						$_NodoCampo = $_NodoTabla->addChild("campo");
						$_NodoCampo->addAttribute("nombre", $_NombreCampo);
						
						$_TipoCampo = $_RegistroCampos["DATA_TYPE"];
						
						if ($_RegistroCampos["CHARACTER_MAXIMUM_LENGTH"])
							$_TipoCampo = $_TipoCampo . "(" . $_RegistroCampos["CHARACTER_MAXIMUM_LENGTH"] . ")";
							
						if ($_RegistroCampos["NUMERIC_PRECISION"])
							$_TipoCampo = $_TipoCampo . "(" . $_RegistroCampos["NUMERIC_PRECISION"] . ")";
							
						$_TipoCampo = $this->ConvertirTipoANSI($this->_AccesoDatos->TipoBD(), $_TipoCampo);
						$_NodoCampo->addAttribute("tipo", $_TipoCampo);*/
			
			// Recorrer las tablas de los insert:
			foreach ($_NodosInsert->children() as $_NodoTabla)
			{
				$_NombreTabla = $_NodoTabla["nombre"];
				
				// Recorrer los registros de las tablas:
				foreach ($_NodoTabla->children() as $_NodoRegistro)
				{
					$_Sql = "INSERT INTO $_NombreTabla VALUES ( ";
					
					$_Primero = true;
					
					// Recorrer los campos de los registros:
					foreach ($_NodoRegistro->children() as $_NodoCampo)
					{
						$_NombreCampo = $_NodoCampo["nombre"];
						$_ValorCampo = $_NodoCampo["valor"];
						$_TipoCampo = $this->CargarTipoCampo($_NombreTabla, $_NombreCampo);
						$_Array = preg_split("/[\(\)]/", $_TipoCampo);
						$_TipoCampo = trim(strtoupper($_Array[0]));
						
						if ($_Primero)
							$_Primero = false;
						else
							$_Sql = $_Sql . ", ";
						
						if ($_TipoCampo == "INTEGER")
							$_Sql = $_Sql . "$_ValorCampo";
						else if ($_TipoCampo == "TIMESTAMP")
						{
							$_ValorCampo = str_replace("-", "", $_ValorCampo);
							$_Sql = $_Sql . "CAST('$_ValorCampo' AS DATETIME)";
						}
						else
							$_Sql = $_Sql . "'$_ValorCampo'";
					}
					
					$_Sql = $_Sql . " );";
					
					$_Script[] = $_Sql;
				}
			}
			
			// Recorrer las tablas de los updates:
			foreach ($_NodosUpdate->children() as $_NodoTabla)
			{
				$_NombreTabla = $_NodoTabla["nombre"];
				
				// Recorrer los registros de las tablas:
				foreach ($_NodoTabla->children() as $_NodoRegistro)
				{
					$_Sql = "UPDATE $_NombreTabla SET ";
					$_Where = "WHERE ";
					$_PrimerSet = true;
					$_PrimerWhere = true;
					
					// Recorrer los campos de los registros:
					foreach ($_NodoRegistro->children() as $_NodoCampo)
					{
						$_NombreCampo = $_NodoCampo["nombre"];
						$_ValorCampo = $_NodoCampo["valor"];
						$_TipoCampo = $this->CargarTipoCampo($_NombreTabla, $_NombreCampo);
						$_Array = preg_split("/[\(\)]/", $_TipoCampo);
						$_TipoCampo = trim(strtoupper($_Array[0]));
						
						if (!$this->EsPrimaria($_NombreTabla, $_NombreCampo))
						{
							if ($_PrimerSet)
								$_PrimerSet = false;
							else
								$_Sql = $_Sql . ", ";
							
							if ($_TipoCampo == "INTEGER")
								$_Sql = $_Sql . "$_NombreCampo = $_ValorCampo";
							else if ($_TipoCampo == "TIMESTAMP")
							{
								$_ValorCampo = str_replace("-", "", $_ValorCampo);
								$_Sql = $_Sql . "$_NombreCampo = CAST('$_ValorCampo' AS DATETIME)";
							}
							else
								$_Sql = $_Sql . "$_NombreCampo = '$_ValorCampo'";
						}
						else
						{
							if ($_PrimerWhere)
								$_PrimerWhere = false;
							else
								$_Where = $_Where . " AND ";
								
							if ($_TipoCampo == "INTEGER")
								$_Where = $_Where . "$_NombreCampo = $_ValorCampo";
							else if ($_TipoCampo == "TIMESTAMP")
								$_Where = $_Where . "$_NombreCampo = CAST('$_ValorCampo' AS datetime)";
							else
								$_Where = $_Where . "$_NombreCampo = '$_ValorCampo'";
						}
					}
					
					$_Sql = $_Sql . " " . $_Where . ";";
					
					$_Script[] = $_Sql;
				}
			}
			
			// Guardar el script SQL:
			$this->GuardarScriptSql($_Script);
		}
		
		private function GuardarScriptSql($vScript)
		{
			$this->_AccesoDatos->AbrirConexion();
			
			if (!$this->_AccesoDatos->Conectado())
				throw new Exception("Imposible conectar con la base de datos.", 1);
			
			// Recorrer y ejecutar las sentencias SQL:
			foreach($vScript as $_Sql)
			{
				$this->_AccesoDatos->EjecutarSql($_Sql);
			}
			
			$this->_AccesoDatos->CerrarConexion();
		}
	}
?>