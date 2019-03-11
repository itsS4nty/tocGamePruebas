<?php
	/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		AccesoDatos.php
	Descripción: 	Permite conectarse a bases de datos MySQL y SQL Server.
	Autor: 			Daniel Durán.
	*/
	
	// Constantes:
	define("MYSQL", "MySql");
	define("SQLSERVER", "SqlServer");
	
	// Función que permite crear instancias de IAccesoDatos:
	function CrearAccesoDatos($vTipo)
	{
		$accesoDatos = NULL;
		
		switch($vTipo)
		{
			case MYSQL:
				$accesoDatos = new AccesoDatosMySql("localhost", "tpv", "tpv", "testdatabase");
				break;
			case SQLSERVER:
				// 192.168.1.102
				//$accesoDatos = new AccesoDatosSqlServer("localhost,1501", "tpv", "tpv", "testdatabase");
				$accesoDatos = new AccesoDatosSqlServer("localhost,1433", "sa", "LOperas93786", "Fac_Demo");
				break;
		}
		
		return $accesoDatos;
	}
	
	// Define la interfaz de la clase de Acceso a Datos:
	interface IAccesoDatos
	{
		public function TipoBD();                              // Retorna el tipo de la base de datos.
		public function NombreBD();							   // Retorna el nombre de la base de datos.
		
		public function Conectado(); 						   // Indica si se está conectado a la base de datos.
		public function AbrirConexion(); 					   // Abre la conexión con la base de datos.
		public function CargarDatos($vSql);                    // Carga datos a partir de una sentencia SQL.
		public function EjecutarSql($vSql);                    // Ejecuta una sentencia sql.
		public function CerrarConexion();                      // Cierra la conexión con la base de datos.
	}
	
	// Permite conectarse con una base de datos MySql:
	class AccesoDatosMySql implements IAccesoDatos
	{
		// Campos:
		private $_Tipo;		  // Tipo de base de datos.
		private $_Conexion;   // Link de conexión con la BBDD.
		private $_Conectado;  // Informa si se está conectado a la BBDD.
		
		public $Host;         // Nombre del host.
		public $Username;     // Nombre de usuario.
		public $Password;     // Password del usuario.
		public $Databasename; // Nombre de la base de datos.
		
		// Constructor:
		public function AccesoDatosMySql($vHost, $vUsername, $vPassword, $vDatabasename)
		{
			$this->_Tipo = MYSQL;
			$this->_Conectado = false;	
			
			$this->Host = $vHost;
			$this->Username = $vUsername;
			$this->Password = $vPassword;
			$this->Databasename = $vDatabasename;
		}
		
		// Métodos:
		// Retornar el tipo de la base de datos:
		public function TipoBD()
		{
			return $this->_Tipo;
		}
		
		// Retornar el nombre de la base de datos:
		public function NombreBD()
		{
			return $this->Databasename;
		}
		
		// Comprobar si se esta conectado a la BBDD:
		public function Conectado()
		{
			return $this->_Conectado;
		}
		
		// Abrir la conexión con la base de datos:
		public function AbrirConexion()
		{
			$this->_Conexion = mysql_connect($this->Host, $this->Username, $this->Password);
			
			if ($this->_Conexion)
				$this->_Conectado = mysql_select_db($this->Databasename, $this->_Conexion);
				
			if (!$this->Conectado())
				throw new Exception(mysql_error($this->_Conexion), mysql_errno($this->_Conexion));
		}
		
		// Cargar datos a partir de una sentencia SQL:
		public function CargarDatos($vSql)
		{
			$_Datos = array();
			
			if ($this->Conectado())
			{
				$_Result = mysql_query($vSql);

				if ($_Result)
				{
					for ($i = 0; $i < mysql_num_rows($_Result); $i++)
					{
						$_Registro = mysql_fetch_assoc($_Result);
						
						$_Datos[$i] = array();
						
						for ($j = 0; $j < mysql_num_fields($_Result); $j++)
						{
							$_Campo = mysql_fetch_field($_Result, $j);
							$_Datos[$i][$_Campo->name] = $_Registro[$_Campo->name];
						}
					}
				}
				else
					throw new Exception(mysql_error($this->_Conexion), mysql_errno($this->_Conexion));
			}
			
			return $_Datos;
		}
		
		// Ejecutar una sentencia sql:
		public function EjecutarSql($vSql)
		{
			if ($this->Conectado())
			{
				if (!mysql_query($vSql, $this->_Conexion))
					throw new Exception(mysql_error($this->_Conexion), mysql_errno($this->_Conexion));
			}
		}
		
		// Cerrar la conexión con la base de datos:
		public function CerrarConexion()
		{
			if ($this->Conectado())
			{
				mysql_close($this->_Conexion);
				$this->_Conectado = false;
			}
		}
	}
	
	// Permite conectarse con una base de datos SqlServer:
	class AccesoDatosSqlServer implements IAccesoDatos
	{
		// Campos:
		private $_Tipo;		  // Tipo de la base de datos.
		private $_Conexion;   // Link de conexión con la BBDD.
		private $_Conectado;  // Informa si se está conectado a la BBDD.
		
		public $Servername;   // Nombre del server.
		public $Username;     // Nombre de usuario.
		public $Password;     // Password del usuario.
		public $Databasename; // Nombre de la base de datos.
		
		// Constructor:
		public function AccesoDatosSqlServer($vServername, $vUsername, $vPassword, $vDatabasename)
		{
			$this->_Tipo = SQLSERVER;
			$this->_Conectado = false;
			
			$this->Servername = $vServername;
			$this->Username = $vUsername;
			$this->Password = $vPassword;
			$this->Databasename = $vDatabasename;	
		}
		
		// Métodos:
		// Retornar el tipo de la base de datos:
		public function TipoBD()
		{
			return $this->_Tipo;
		}
		
		// Retornar el nombre de la base de datos:
		public function NombreBD()
		{
			return $this->Databasename;
		}
		
		// Comprobar si se esta conectado a la BBDD:
		public function Conectado()
		{
			return $this->_Conectado;
		}
		
		// Abrir la conexión con la base de datos:
		public function AbrirConexion()
		{
			// CÓDIGO MSSQL:
			/*
			$this->_Conexion = mssql_connect($this->Servername, $this->Username, $this->Password);
			
			if ($this->_Conexion)
				$this->_Conectado = mssql_select_db($this->Databasename, $this->_Conexion);
				
			*/
			
			// CÓDIGO ODBC:
			$_Dsn = "Driver={SQL Server};Server=$this->Servername;Database=$this->Databasename;";
			
			$this->_Conexion = odbc_connect($_Dsn, $this->Username, $this->Password);
			
			if ($this->_Conexion != null)
				$this->_Conectado = true;
		}
		
		// Cargar datos a partir de una sentencia SQL:
		public function CargarDatos($vSql)
		{
			$_Datos = array();
			
			if ($this->Conectado())
			{
				// CÓDIGO MSSQL:
				/*
				$_Result = mssql_query($vSql, $this->_Conexion);

				if ($_Result)
				{
					for ($i = 0; $i < mssql_num_rows($_Result); $i++)
					{
						$_Registro = mssql_fetch_assoc($_Result);
						
						$_Datos[$i] = array();
						
						for ($j = 0; $j < mssql_num_fields($_Result); $j++)
						{
							$_Campo = mssql_fetch_field($_Result, $j);
							$_Datos[$i][$_Campo->name] = $_Registro[$_Campo->name];
						}
					}
				}*/
				
				// CÓDIGO ODBC:
				$_Result = odbc_exec($this->_Conexion, $vSql);

				if ($_Result)
				{
					for ($i = 0; $i < odbc_num_rows($_Result); $i++)
					{
						$_Datos[$i] = array();
						
						odbc_fetch_row($_Result);
						
						for ($j = 1; $j <= odbc_num_fields($_Result); $j++)
						{
							$_Campo = utf8_encode(odbc_field_name($_Result, $j));
							$_Dato = utf8_encode(odbc_result($_Result, $j));
							
							$_Datos[$i][$_Campo] = $_Dato;
						}
					}
				}
			}
			
			return $_Datos;
		}
		
		// Ejecutar una sentencia sql:
		public function EjecutarSql($vSql)
		{
			if ($this->Conectado())
			{
				// CÓDIGO MSSQL:
				// mssql_query($vSql, $this->_Conexion);
				
				// CÓDIGO ODBC:
				odbc_exec($this->_Conexion, $vSql);
			}
		}
		
		// Cerrar la conexión con la base de datos:
		public function CerrarConexion()
		{
			if ($this->Conectado())
			{
				// CÓDIGO MSSQL:
				// mssql_close($this->_Conexion);
				
				// CÓDIGO ODBC:
				odbc_close($this->_Conexion);
				
				$this->_Conectado = false;
			}
		}
	}
?>