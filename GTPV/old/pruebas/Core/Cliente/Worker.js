/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		Worker.js
	Descripción: 	Conjunto de algoritmos que permiten manejar un subproceso ejecutado en segundo
					plano dedicado a la sincronización de la base de datos local con el servidor
					de base de datos.
	Autor: 			Daniel Durán.
*/

/* ===================================================================== */
/*                                 WORKER                                */
/* ===================================================================== */

// Esta parte se ejecuta del lado del worker.

//var _ServidorBBDD = "http://inc.hiterp.com/gtpv/Core/Servidor/XmlHttpResponse.php";
var _ServidorBBDD = "http://inc.hiterp.com/gtpv/Core/Servidor/XmlHttpResponse.php";
var _Sincronizando = false;

// Método que se ejecuta al recibir un mensaje desde la página:
onmessage = function (vEvento)
{
	try
	{
		var _Comando = vEvento.data.Comando;
		var _Datos = vEvento.data.Datos;
		
		switch(_Comando)
		{
			// Comando SINC desde la página:
			case MsgWorker.SINC: Sinc(_Datos); break;
			
			// Respuesta XML desde la página:
			case MsgWorker.RXML: RecibirResultadoXmlPagina(_Datos); break;
			
			// Petición SQL desde la página:
			case MsgWorker.SQL: RecibirScriptSql(_Datos); break;
			
			// Excepción desde la página:
			case MsgWorker.EXC: EnviarMensaje(MsgWorker.EXC, "Excepcion desde la página: " + _Datos); break;
			
			// Cerrar el worker:
			case MsgWorker.CLS:
				EnviarMensaje(MsgWorker.MSG, "Cerrando worker...");
				self.close();
				break;
			
			// Error en el comando recibido:
			default: EnviarMensaje(MsgWorker.EXC, "Error desde el worker: Comando " + _Comando + " erróneo.");
		}
	}
	catch(_Exception)
	{
		EnviarMensaje(MsgWorker.EXC, _Exception.message);
		_Sincronizando = false;
	}
}

// Enviar datos a la página:
function EnviarMensaje(vComando, vDatos)
{
	postMessage(new MsgWorker(vComando, vDatos));
}

// Controladores de comandos:
// Inicia el proceso de sincronización pasado un tiempo especificado
function Sinc(vFechaUltimaSinc)
{
	// Si no está sincronizando:
	if (!_Sincronizando)
	{
		EnviarMensaje(MsgWorker.MSG, "INICIO DEL PROCESO DE SINCRONIZACIÓN.");
		
		var _AccesoDatos = new AccesoDatosSinc(Db.Nombre, Db.Version, Db.Descripcion, Db.Tamano);
		_AccesoDatos.AbrirConexion();
		
		EnviarMensaje(MsgWorker.MSG, "Sincronizando a partir de: " + vFechaUltimaSinc);
		
		// Datos locales a sincronizar:
		var _DatosSinc = new DatosSinc();
		
		if (vFechaUltimaSinc != null)
		{
			// Cargar los nombres de las tablas del usuario:
			var _Sql = "SELECT tbl_name "
					 + "FROM sqlite_master "
					 + "WHERE type='table' AND "
					 + "tbl_name NOT LIKE 'sqlite%' AND "
					 + "tbl_name NOT LIKE '%WebKit%';";
					 
			var _DatosTablas = _AccesoDatos.EjecutarSql(_Sql);
			
			// Recorrer las tablas:
			for (var i = 0; i < _DatosTablas.rows.length; i++)
			{
				var _RegistroTablas = _DatosTablas.rows.item(i);
				var _NombreTabla = _RegistroTablas["tbl_name"];
				
				// Cargar los inserts:
				var _Sql = "SELECT * "
						 + "FROM " + _NombreTabla + " "
						 + "WHERE (FechaAlta > '" + vFechaUltimaSinc + "');"
				
				var _DatosSql = _AccesoDatos.EjecutarSql(_Sql);
				
				EnviarMensaje(MsgWorker.MSG, "INSERTS DE " + _NombreTabla + ": " + _DatosSql.rows.length);
				
				if (_DatosSql.rows.length > 0)
				{
					_Tabla = new Tabla(_NombreTabla);
					
					for (j = 0; j < _DatosSql.rows.length; j++)
					{
						var _RegistroInsert = _DatosSql.rows.item(j);
						
						var _Registro = new Registro();
						
						for (var _Clave in _RegistroInsert)
						{
							//EnviarMensaje(MsgWorker.MSG, "CAMPO: " + _Clave + " VALOR: " + _RegistroInsert[_Clave]);
							var _Campo = new Campo(_Clave, _RegistroInsert[_Clave]);
							_Registro.Campos.push(_Campo);
						}
						
						_Tabla.Registros.push(_Registro);
					}
					
					_DatosSinc.Inserts.push(_Tabla);
				}
				
				// Cargar los updates:
				var _Sql = "SELECT * "
						 + "FROM " + _NombreTabla + " "
						 + "WHERE (FechaAct > '" + vFechaUltimaSinc + "') AND "
						 + "(FechaAlta <= '" + vFechaUltimaSinc + "');";
				
				var _DatosSql = _AccesoDatos.EjecutarSql(_Sql);
				
				EnviarMensaje(MsgWorker.MSG, "UPDATES DE " + _NombreTabla + ": " + _DatosSql.rows.length);
				
				if (_DatosSql.rows.length > 0)
				{
					_Tabla = new Tabla(_NombreTabla);
					
					EnviarMensaje(MsgWorker.MSG, "Tabla " + _NombreTabla + " creada.");
					
					for (j = 0; j < _DatosSql.rows.length; j++)
					{
						var _RegistroUpdate = _DatosSql.rows.item(j);
						
						var _Registro = new Registro();
						
						for (var _Clave in _RegistroUpdate)
						{
							// EnviarMensaje(MsgWorker.MSG, "CAMPO: " + _Clave + " VALOR: " + _RegistroUpdate[_Clave]);
							var _Campo = new Campo(_Clave, _RegistroUpdate[_Clave]);
							_Registro.Campos.push(_Campo);
						}
						
						_Tabla.Registros.push(_Registro);
					}
					
					_DatosSinc.Updates.push(_Tabla);
				}
			}
		}
		
		// Enviar la petición xml a la página:
		EnviarMensaje(MsgWorker.MSG, "Enviando petición XML a la página...");
		EnviarMensaje(MsgWorker.PXML, _DatosSinc);
		
		_AccesoDatos.CerrarConexion();
		
		_Sincronizando = true;
	}
	else
		EnviarMensaje(MsgWorker.MSG, "***** YA ESTA SINCRONIZANDO ****");
}

// Procesar el resultado XML recibido desde la página:
function RecibirResultadoXmlPagina(vXmlCliente)
{
	EnviarMensaje(MsgWorker.MSG, "XML local recibido.");
	EnviarMensaje(MsgWorker.MSG, vXmlCliente);
	
	// Enviar la petición Xml al servidor:
	EnviarMensaje(MsgWorker.MSG, "Enviando al servidor...");
	
	try
	{
		var _XmlServidor = AccesoDatosServidor.SolicitarXML(_ServidorBBDD, "xml=" + vXmlCliente);
		
		if (_XmlServidor != null)
		{
			EnviarMensaje(MsgWorker.CON, true);
		
			EnviarMensaje(MsgWorker.MSG, "Respuesta del servidor recibida...");
			EnviarMensaje(MsgWorker.MSG, "Enviando respuesta a la pagina...");
			
			EnviarMensaje(MsgWorker.RXML, _XmlServidor);
		}
		else
			EnviarMensaje(MsgWorker.CON, false);
	}
	catch (_Exception)
	{
		EnviarMensaje(MsgWorker.CON, false);
	}
}

// Recibir el script SQL desde la página y ejecutarlo:
function RecibirScriptSql(vScript)
{
	var _AccesoDatos = new AccesoDatosSinc(Db.Nombre, Db.Version, Db.Descripcion, Db.Tamano);
	
	_AccesoDatos.AbrirConexion();
	
	EnviarMensaje(MsgWorker.MSG, vScript.length + " sentencias SQL a ejecutar.");
	
	var _Ok = true;
	
	for (var i = 0; i < vScript.length; i++)
	{
		_Sql = vScript[i];
		EnviarMensaje(MsgWorker.MSG, _Sql);
		try
		{
			_AccesoDatos.EjecutarSql(_Sql);
		}
		catch(_Exception)
		{
			_Ok = false;
			EnviarMensaje(MsgWorker.MSG, "Error en la sentencia sql: " + _Exception.message);
		}
	}
	
	EnviarMensaje(MsgWorker.MSG, "Enviado confirmación a la página...");
	EnviarMensaje(MsgWorker.OK, _Ok);
	_Sincronizando = false;
	
	_AccesoDatos.CerrarConexion();
}

/* ===================================================================== */
/*               UTILIDADES COMUNES DEL WORKER Y LA PÁGINA               */
/* ===================================================================== */

// Conjunto de utilidades comunes a los workers, tanto del lado de la página
// como del worker.

// Esté código debe estar tanto en el fichero WorkerHandler.js como en
// el fichero Worker.js.


// Objeto que permite asociar un código con datos para comunicarse con un worker.
var MsgWorker = function(vComando, vDatos)
{
	this.Comando = vComando;
	this.Datos = vDatos;
};

// Lista de comandos posibles:
MsgWorker.SINC = "SINC";   // Ejecutar la sincronización de la base de datos.
MsgWorker.ISINC = "ISINC"; // Iniciar el bucle de sincronización automática de la base de datos.
MsgWorker.DSINC = "DSINC"; // Detener el bucle sincronización automática de la base de datos.
MsgWorker.ACTF = "ACTF"; // Actualiza la fecha de sincronización.
MsgWorker.MSG = "MSG";     // Enviar un mensaje de texto.
MsgWorker.PXML = "PXML";   // Petición XML.
MsgWorker.RXML = "RXML";   // Resultado XML.
MsgWorker.SQL = "SQL";     // Petición SQL.
MsgWorker.OK = "OK";       // Confirma la sincronización.
MsgWorker.CON = "CON";     // Indica un cambio en el estado de la conexión.
MsgWorker.EXC = "EXC";     // Excepción.
MsgWorker.CLS = "CLS";     // Cerrar el worker.

// Función que convierte un tipo Date en un string que representa una fecha en formato ANSI,
// necesario para su guardado en la base de datos.
FechaANSI = function(vFecha)
{
	if (vFecha == null)
		vFecha = new Date();
	
	var _FechaStr = vFecha.getFullYear()
				  + "-" + LPad((parseInt(vFecha.getMonth()) + 1), 2, "0") // Los meses aqui van de 0 a 11.
				  + "-" + LPad(vFecha.getDate(), 2, "0")
				  + " " + LPad(vFecha.getHours(), 2, "0")
				  + ":" + LPad(vFecha.getMinutes(), 2, "0")
				  + ":" + LPad(vFecha.getSeconds(), 2, "0")
				  + "." + LPad(vFecha.getMilliseconds(), 3, "0");
	
	function LPad(vString, vLargo, vCaracter)
	{
		vString = new String(vString);
		
		while(vString.length < vLargo)
		{
			vString = vCaracter + vString;
		}
		return vString;
	}
	
	return _FechaStr;
}

function Sleep(milliseconds)
{
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++)
	{
		if ((new Date().getTime() - start) > milliseconds)
		{
			break;
		}
	}
}

var DatosSinc = function()
{
	this.Inserts = new Array();
	this.Updates = new Array();
}

// Objeto que representa una tabla y sus registros a tratar:
var Tabla = function(vNombre)
{
	this.Nombre = vNombre;
	this.Registros = new Array();
}

var Registro = function()
{
	this.Campos = new Array();
}

var Campo = function (vNombre, vValor)
{
	this.Nombre = vNombre;
	this.Valor = vValor;
}


// Objeto que contiene los datos de conexión con la base de datos local:
var Db = function() {};

Db.Nombre = "testdatabase";
Db.Version = "1.0";
Db.Descripcion = "Base de datos de prueba";
Db.Tamano = 5*1024*1024;

/* ===================================================================== */
/*                          UTILIDADES DEL WORKER                        */
/* ===================================================================== */

// Permite conectarse de forma sincrónica con Web Sql Database.
// NOTA: Sólo se incluye en el Worker API, por lo que únicamente funciona con los Workers.
// Parámetros de conexión: "testdatabase", "1.0", "Base de datos de prueba", 5*1024*1024
var AccesoDatosSinc = function(vNombre, vVersion, vDescripcion, vTamano) {
	// Campos:
	var conexion; // Permite conectarse con la base de datos.
	var conectado = false;
	
	this.Nombre = vNombre;
	this.Version = vVersion;
	this.Descripcion = vDescripcion;
	this.Tamano = vTamano;
	
	/*
		Ejecucion correcta: function (tx, result) {};
		Error SQL: function (tx, error) {};
	
		'result' es un objeto con los siguientes atributos:

		- insertId: Es el id de la última fila insertada. Si no se ha insertado nada lanzará una excepción.
		- rowsAffected: numero de filas afectadas por la consulta SQL. Para consultas SELECT su valor es 0.
		- rows: Devuelve una lista ordenada de las filas devueltas por la consulta SQL. Esta lista tiene la
		  siguiente interfaz:
		  	- lenght: Número de filas.
			- item(n): función para obtener la fila de un índice n dado.
			
		'error' es un objeto con los siguientes atributos:
			- code: Código de error.
			- message: El mensaje de error.
	*/
	
	// Informar si se está conectado con la base de datos local:
	this.Conectado = function(){
		return conectado;
	};
	
	// Conectar con la base de datos:
	this.AbrirConexion = function() {
		conexion = openDatabaseSync(this.Nombre, this.Version, this.Descripcion, this.Tamano);
		
		if (conexion) {
			conectado = true;
		}
		else{
			conectado = false;
		}
	};
	
	// Ejecutar una sentencia sql:
	this.EjecutarSql = function(vSql){
		var _Datos = null;
		
		/*
		Atributos datos:
			insertId: id del objeto insertado.
  			rowsAffected: número de filas afectadas.
  			rows: lista de registros retornados.
				length: número de registros.
  				item(n): array que contiene los registros.
		*/
		
		if (conexion)
		{
			conexion.transaction(
				function(tx){
					try
					{
						// EnviarMensaje(MsgWorker.MSG, "...");
						// EnviarMensaje(MsgWorker.MSG, "SENTENCIA SQL");
						// EnviarMensaje(MsgWorker.MSG, vSql);
						_Datos = tx.executeSql(vSql);
						// EnviarMensaje(MsgWorker.MSG, "Ejecutado correctamente");
						// EnviarMensaje(MsgWorker.MSG, "...");
					}
					catch(_Exception)
					{
						// EnviarMensaje(MsgWorker.MSG, "Error: " + _Exception.message);
						// EnviarMensaje(MsgWorker.MSG, "...");
						throw _Exception;
					}
				}
			);
		}
		
		return _Datos;
	};
	
	this.CerrarConexion = function()
	{
		conectado = false;
	};
};

var AccesoDatos = function(){};

// Método estático que carga datos de forma sincrona desde la base de datos SQLite:
/*AccesoDatosSinc.CargarDatos = function (vSql)
{
	var _Datos = null;
	
	var _AccesoDatos = new AccesoDatosSinc(Db.Nombre, Db.Version, Db.Descripcion, Db.Tamano);
	
	_AccesoDatos.AbrirConexion();
	
	_Datos = _AccesoDatos.EjecutarSql(vSql);
	
	_AccesoDatos.CerrarConexion();
	
	if (_Datos.rows.length == 0)
		_Datos = null;
		
	return _Datos;
};*/

// Permite conectarse con el servidor, mediante XML:
var AccesoDatosServidor = function() {};

// Enviar una petición XML:
// vDirección: Dirección de la pagina PHP.
// vParametros: parámetros pasados por POST.
// Retorna el resultado XML.
AccesoDatosServidor.SolicitarXML = function(vDireccion, vParametros){
	var _XmlStr = "";
	
	var xmlhttp = new XMLHttpRequest();
	
	if (xmlhttp)
	{
		xmlhttp.open("POST", vDireccion, false);
		
		xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=ISO-8859-1');
		
		xmlhttp.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200)
			{
				//var xml = {responseXml: this.responseText};
				_XmlStr = xmlhttp.responseText;
			}
		};
		
		// Formato: "comando=sinc&datos=misdatos"
		xmlhttp.send(vParametros);
	}
	
	return _XmlStr;
}