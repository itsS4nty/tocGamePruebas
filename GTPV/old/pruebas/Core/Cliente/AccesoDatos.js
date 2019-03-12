/*
	HIT SYSTEMS
	PROYECTO TPV HTML5
	==================
	
	Nombre: 		AccesoDatos.js
	Descripción: 	Conjunto de algoritmos que permiten acceder a los datos, tanto de la base de datos
					local, como de las variables del Local Storage, además de controlar la sincronización
					con la base de datos remota.
					
	Autor: 			Daniel Durán.
*/

/* ===================================================================== */
/*                             WORKER HANDLER                            */
/* ===================================================================== */

// Esta parte se ejecuta del lado de la página.

// Permite manejar un worker:
var WorkerHandler = function(vArchivo, vEventoMensaje, vEventoError, vEventoSincronizacion, vEventoNuevosDatos, vEventoConexion)
{
	var _Worker;
	var _Archivo = vArchivo;
	var _EventoMensaje = vEventoMensaje;
	var _EventoError = vEventoError;
	var _EventoSincronizacion = vEventoSincronizacion;
	var _EventoNuevosDatos = vEventoNuevosDatos;
	var _EventoConexion = vEventoConexion;
	var _SinDatos = true;
	var _NuevosDatos = false;
	
	var _IdInterval = null;
	var _EsBucle = false;
	var _Milisegundos;
	var _Sincronizando = false;
	
	// Iniciar el worker:
	this.IniciarWorker = function() {
		// Crea el Web Worker:
		_Worker = new Worker(_Archivo);
		
		// Recibir los mensajes y errores del Worker:
		_Worker.onmessage = RecibirMensaje;
		
		//_Worker.onerror = RecibirError;
	};
	
	// Detener el worker:
	this.DetenerWorker = function() {
		_Worker.terminate();
	};
	
	// Iniciar el proceso de sincronización:
	this.IniciarSincronizacion = function()
	{
		if (!_Sincronizando)
		{
			if(_Worker != null)
			{
				this.DetenerWorker();
				_Worker = null;
				delete _Worker;
			}
			
			// Crea el Web Worker:
			_Worker = new Worker(_Archivo);
			
			// Recibir los mensajes y errores del Worker:
			_Worker.onmessage = RecibirMensaje;
			
			// Guardar la fecha actual.
			LocalStorage.SetAuxFechaUltimaSinc(FechaANSI());
			
			// Inicializar las variables:
			_SinDatos = true;
			_NuevosDatos = false;
			
			// Iniciar la sincronización:
			EnviarMensaje(MsgWorker.SINC, LocalStorage.GetFechaUltimaSinc());
			
			_Sincronizando = true;
		}
		else
		{
			EjecutarEventoMensaje("Ya existe un proceso de sincronización iniciado.");
			//_Sincronizando = false;
		}
	};
	
	// Iniciar el bucle de sincronización:
	this.IniciarBucleSincronizacion = function(vMilisegundos)
	{
		if (_IdInterval == null)
		{
			if (vMilisegundos == null)
				vMilisegundos = 2000;
			
			_Milisegundos = vMilisegundos;
			
			_IdInterval = setInterval("IniciarSincronizacion()", _Milisegundos);
			_EsBucle = true;
			
			EjecutarEventoMensaje("Bucle de sincronización iniciado.");
		}
		else
			EjecutarEventoMensaje("El bucle de sincronización ya está iniciado.");
	}
	
	// Detener el bucle de sincronización:
	this.DetenerBucleSincronizacion = function()
	{
		// Detener la sincronización:
		if (_IdInterval != null)
		{
			clearInterval(_IdInterval);
			_IdInterval = null;
			_EsBucle = false;
			
			EjecutarEventoMensaje("Bucle de sincronización detenido.");
		}
		else
			EjecutarEventoMensaje("El bucle de sincronización no está iniciado.");
	}
	
	// Ejecutar el evento de mensajes:
	function EjecutarEventoMensaje(vMensaje)
	{
		if (_EventoMensaje != null)
			_EventoMensaje(vMensaje);
	}
	
	// Ejecutar el evento de errores:
	function EjecutarEventoError(vError)
	{
		if (_EventoError != null)
			_EventoError(vError);
	}
	
	// Ejecutar el evento de sincronización:
	function EjecutarEventoSincronizacion(vCorrecto)
	{
		if (_EventoSincronizacion != null)
			_EventoSincronizacion(vCorrecto);
	}
	
	// Ejecutar el evento de nuevos datos:
	function EjecutarEventoNuevosDatos()
	{
		if (_EventoNuevosDatos != null)
			_EventoNuevosDatos();
	}
	
	function EjecutarEventoConexion(vOnline)
	{
		if (_EventoConexion != null)
			_EventoConexion(vOnline);
	}
	
	// Enviar un mensaje al worker:
	function EnviarMensaje(vComando, vDatos)
	{
		_Worker.postMessage(new MsgWorker(vComando, vDatos));
	}
	
	// Recibir un mensaje desde el worker:
	function RecibirMensaje(vEvento)
	{
		try
		{
			var _Comando = vEvento.data.Comando;
			var _Datos = vEvento.data.Datos;
			
			switch(_Comando)
			{
				// Mensajes de texto desde el worker:
				case MsgWorker.MSG: EjecutarEventoMensaje("WORKER: " + _Datos); break;
				
				// Petición XML desde el worker:
				case MsgWorker.PXML: RecibirPeticionXmlWorker(_Datos); break;
				
				// Resultado XML esde el worker:
				case MsgWorker.RXML: RecibirResultadoXmlWorker(_Datos); break;
				
				// Confirmación de la sincronización:
				case MsgWorker.OK: Confirmar(_Datos); break;
				
				// Información de la conexión:
				case MsgWorker.CON: InfoConexion(_Datos); break;
				
				// Excepción desde el worker:
				case MsgWorker.EXC: EjecutarEventoError("Excepción: " + _Datos); break;
				
				// Comando erróneo desde el worker:
				default: EjecutarEventoMensaje("Error: comando " + _Comando + " erróneo.");
			}
		}
		catch(_Exception)
		{
			EnviarMensaje(MsgWorker.EXC, _Exception.message);
		}
	}
	
	// Procesar la petición XML del worker:
	function RecibirPeticionXmlWorker(vDatosSinc)
	{
		// Enviar el resultado XML al worker:
		EjecutarEventoMensaje("PAGINA: Creando XML de respuesta...");
		
		/*
		•x.nodeName - the name of x
		•x.nodeValue - the value of x
		•x.parentNode - the parent node of x
		•x.childNodes - the child nodes of x
		•x.attributes - the attributes nodes of x
		•x.getElementsByTagName(name) - get all elements with a specified tag name
		•x.createElement("string") - create a new element
		•x[0].setAttribute("edition","first"); - set a new attribute
		•x.appendChild(node) - insert a child node to x
		•x.removeChild(node) - remove a child node from x
		*/
		
		var _IdUsuario = LocalStorage.GetIdUsuario();
		var _IdVersionUsuario = LocalStorage.GetIdVersionUsuario();
		var _FechaUltimaSinc = LocalStorage.GetFechaUltimaSinc();
		
		// Crear el documento XML:
		var _DOMParser=new DOMParser();
		
		var _Xml = _DOMParser.parseFromString("<cliente></cliente>","text/xml");
		
		var _NodoCliente = _Xml.childNodes[0];
		var _NodoInsert = _Xml.createElement("insert");
		var _NodoUpdate = _Xml.createElement("update");
		
		if (vDatosSinc != null)
		{
			if (vDatosSinc.Inserts.length > 0 || vDatosSinc.Updates.length > 0)
				_SinDatos = false;
			
			// Crear los inserts:
			for (var i = 0; i < vDatosSinc.Inserts.length; i++)
			{
				var _Tabla = vDatosSinc.Inserts[i];
				
				var _NodoTabla = _Xml.createElement("tabla");
				_NodoTabla.setAttribute("nombre", _Tabla.Nombre);
				_NodoInsert.appendChild(_NodoTabla);
				
				// Recorrer las tablas:
				for (var j = 0; j < _Tabla.Registros.length; j++)
				{
					var _Registro = _Tabla.Registros[j];
					
					var _NodoRegistro = _Xml.createElement("registro");
					_NodoTabla.appendChild(_NodoRegistro);
					
					// Recorrer los campos:
					for (var k = 0; k < _Registro.Campos.length; k++)
					{
						var _Campo = _Registro.Campos[k];
						
						var _NodoCampo = _Xml.createElement("campo");
						_NodoCampo.setAttribute("nombre", _Campo.Nombre);
						_NodoCampo.setAttribute("valor", _Campo.Valor);
						_NodoRegistro.appendChild(_NodoCampo);
					}
				}
			}
			
			// Crear los updates:
			for (var i = 0; i < vDatosSinc.Updates.length; i++)
			{
				var _Tabla = vDatosSinc.Updates[i];
				
				var _NodoTabla = _Xml.createElement("tabla");
				_NodoTabla.setAttribute("nombre", _Tabla.Nombre);
				_NodoUpdate.appendChild(_NodoTabla);
				
				// Recorrer las tablas:
				for (var j = 0; j < _Tabla.Registros.length; j++)
				{
					var _Registro = _Tabla.Registros[j];
					
					var _NodoRegistro = _Xml.createElement("registro");
					_NodoTabla.appendChild(_NodoRegistro);
					
					// Recorrer los campos:
					for (var k = 0; k < _Registro.Campos.length; k++)
					{
						var _Campo = _Registro.Campos[k];
						
						var _NodoCampo = _Xml.createElement("campo");
						_NodoCampo.setAttribute("nombre", _Campo.Nombre);
						_NodoCampo.setAttribute("valor", _Campo.Valor);
						_NodoRegistro.appendChild(_NodoCampo);
					}
				}
			}
		}
		else
			EnviarMensaje(MsgWorker.EXC, "Datos de sincronización nulos.")
		
		_NodoCliente.appendChild(_NodoInsert);
		_NodoCliente.appendChild(_NodoUpdate);
		
		_NodoCliente.setAttribute("idusuario", _IdUsuario);
		_NodoCliente.setAttribute("idversion", _IdVersionUsuario);
		_NodoCliente.setAttribute("fechaultimasinc", _FechaUltimaSinc);
		
		var _XmlStrCliente = '<?xml version="1.0"?>' + (new XMLSerializer()).serializeToString(_Xml);
		
		EjecutarEventoMensaje("PAGINA: XML de respuesta creado. Enviando al worker...");
		EnviarMensaje(MsgWorker.RXML, _XmlStrCliente);
	}
	
	// Procesar el resultado XML del worker:
	function RecibirResultadoXmlWorker(vXmlStrServidor)
	{
		EjecutarEventoMensaje("PAGINA: XML del servidor recibido.");
		EjecutarEventoMensaje("PAGINA: " + vXmlStrServidor);
		
		var _DOMParser=new DOMParser();
		var _XmlServidor = _DOMParser.parseFromString(vXmlStrServidor, "text/xml");
		
		var _NodoServidor = _XmlServidor.getElementsByTagName("servidor")[0];
		
		var _NodoError = _XmlServidor.getElementsByTagName("error")[0];
		
		if (_NodoError)
		{
			var _Codigo = _NodoError.attributes["codigo"].nodeValue;
			var _Mensaje = _NodoError.attributes["mensaje"].nodeValue;
			
			EnviarMensaje(MsgWorker.EXC,
				"Error en el xml del servidor - Código: " + _Codigo + " - Mensaje: " + _Mensaje);
		}
		else
		{
			LocalStorage.SetAuxIdVersionUsuario(_NodoServidor.attributes["idversion"].nodeValue);
			
			var _Script = XMLaSql(vXmlStrServidor);
			
			if (_Script.length > 0)
			{
				_SinDatos = false
				_NuevosDatos = true;
			}
			
			EjecutarEventoMensaje("PAGINA: Enviando script SQL al worker...");
			EnviarMensaje(MsgWorker.SQL, _Script);
		}
	}
	
	// Confirmar el proceso de sincronización:
	function Confirmar(vResultado)
	{			
		if (vResultado == true)
		{
			var _AuxIdVersionUsuario = LocalStorage.GetAuxIdVersionUsuario();
			var _AuxFechaUltimaSinc = LocalStorage.GetAuxFechaUltimaSinc();
			
			if (_AuxIdVersionUsuario != null && _AuxFechaUltimaSinc != null)
			{
				if (_SinDatos)
				{
					EjecutarEventoMensaje("PAGINA: Ningun dato que sincronizar.");
				}
				else
				{
					LocalStorage.SetIdVersionUsuario(_AuxIdVersionUsuario);
					LocalStorage.SetFechaUltimaSinc(_AuxFechaUltimaSinc);
		
					EjecutarEventoMensaje("PAGINA: Sincronización completada.");
					
					if (_NuevosDatos)
					{
						// alert("Correcto, nuevos datos...");
						EjecutarEventoNuevosDatos();
					}
				}
			}
			else
			{
				EjecutarEventoMensaje("PAGINA: Error en las variables...");
			}
		}
		else
		{
			EjecutarEventoMensaje("PAGINA: Error en la sincronización");
		}
		
		EjecutarEventoSincronizacion(vResultado);
		_Sincronizando = false;
	}
	
	// Comprobar cambios en el estado de la conexión:
	var _EsOnline = false;
	
	function InfoConexion(vOnline)
	{
		// Comprobar si hay algun cambio en la conexión:
		if (vOnline != _EsOnline)
		{
			_EsOnline = vOnline;
			EjecutarEventoConexion(vOnline);
			
			if (!_EsOnline)
			{
				EjecutarEventoMensaje("Cambio a modo de conexion OFFLINE");
			}
			else
			{
					
				EjecutarEventoMensaje("Cambio a modo de conexion ONLINE");
			}
		}
		
		if (!vOnline)
			_Sincronizando = false;
	}
	
	// Guardar los datos XML en la base de datos.
	function XMLaSql (vXmlStrServidor)
	{
		/*
		•x.nodeName - the name of x
		•x.nodeValue - the value of x
		•x.parentNode - the parent node of x
		•x.childNodes - the child nodes of x
		•x.attributes - the attributes nodes of x
		•x.getElementsByTagName(name) - get all elements with a specified tag name
		•x.createElement("string") - create a new element
		•x[0].setAttribute("edition","first"); - set a new attribute
		•x.appendChild(node) - insert a child node to x
		•x.removeChild(node) - remove a child node from x
		*/
		
		var _Script = new Array();
		var cont = 0;
		
		var _DOMParser=new DOMParser();
		var _XmlServidor = _DOMParser.parseFromString(vXmlStrServidor,"text/xml");
		
		var _NodosCreate = _XmlServidor.getElementsByTagName("create")[0].childNodes;
		var _NodosInsert = _XmlServidor.getElementsByTagName("insert")[0].childNodes;
		var _NodosUpdate = _XmlServidor.getElementsByTagName("update")[0].childNodes;
		
		// Recorrer los create:
		for (var i = 0; i < _NodosCreate.length; i++)
		{
			var _NodoTabla = _NodosCreate[i];
			var _NodosCampos = _NodoTabla.childNodes;
			
			var _NombreTabla = _NodoTabla.attributes["nombre"].nodeValue;
			
			var _Sql = "CREATE TABLE " + _NombreTabla + " ( ";
			
			// Recorrer los campos
			for (var j = 0; j < _NodosCampos.length; j++)
			{
				if (j == 0)
					_Sql += " ";
				else
					_Sql += ", ";
				var _NodoCampo = _NodosCampos[j];
				_Sql +=  _NodoCampo.attributes["nombre"].nodeValue + " " + _NodoCampo.attributes["tipo"].nodeValue;
				if (_NodoCampo.attributes["es_primaria"].nodeValue == "true")
				{
					_Sql += " PRIMARY KEY";
				}
			}
			
			_Sql += " );";
			_Script[cont++] = "DROP TABLE IF EXISTS " + _NombreTabla + ";";
			_Script[cont++] = _Sql;
		}
		
		// Recorrer los insert:
		for (var i = 0; i < _NodosInsert.length; i++)
		{
			var _NodoTabla = _NodosInsert[i];
			var _NodosRegistros = _NodoTabla.childNodes;
			
			var _NombreTabla = _NodoTabla.attributes["nombre"].nodeValue;
			
			// Recorrer los registros:
			for (var j = 0; j < _NodosRegistros.length; j++)
			{
				var _NodoRegistro = _NodosRegistros[j];
				
				var _NodosCampos = _NodoRegistro.childNodes;
				
				var _Sql = "INSERT INTO " + _NombreTabla + " VALUES (";
				
				// Recorrer los campos
				for (var k = 0; k < _NodosCampos.length; k++)
				{
					var _NodoCampo = _NodosCampos[k];
					
					if (k == 0)
						_Sql += " ";
					else
						_Sql += ", ";
					
					_Sql +=  "'" + _NodoCampo.attributes["valor"].nodeValue + "'";
				}
				
				_Sql += " );";
			
				_Script[cont++] = _Sql;
			}
		}
		
		// Recorrer los update:
		for (var i = 0; i < _NodosUpdate.length; i++)
		{
			var _NodoTabla = _NodosUpdate[i];
			var _NodosRegistros = _NodoTabla.childNodes;
			
			var _NombreTabla = _NodoTabla.attributes["nombre"].nodeValue;
			
			// Recorrer los registros:
			for (var j = 0; j < _NodosRegistros.length; j++)
			{
				var _NodoRegistro = _NodosRegistros[j];
				
				var _NodosCampos = _NodoRegistro.childNodes;
				
				var _Sql = "UPDATE " + _NombreTabla + " SET ";
				var _Where = "WHERE ";
				var _PrimerSet = true;
				var _PrimerWhere = true;
				
				for (var k = 0; k < _NodosCampos.length; k++)
				{
					var _NodoCampo = _NodosCampos[k];
					
					if (_NodoCampo.attributes["es_primaria"].nodeValue == "true")
					{
						if (_PrimerWhere)
							_PrimerWhere = false;
						else
							_Where += "AND ";
						
						var _NombreId = _NodoCampo.attributes["nombre"].nodeValue;
						var _ValorId = "'" + _NodoCampo.attributes["valor"].nodeValue + "'";
						
						_Where += _NombreId + " = " + _ValorId;
					}
					else
					{
						if (_PrimerSet)
							_PrimerSet = false;
						else
							_Sql += ", ";
						
						var _NombreCampo = _NodoCampo.attributes["nombre"].nodeValue;
						var _ValorCampo = "'" + _NodoCampo.attributes["valor"].nodeValue + "'";
						
						_Sql +=  _NombreCampo + " = " + _ValorCampo;
					}
				}
				
				_Sql += _Where;
				
				_Sql += ";";
				
				_Script[cont++] = _Sql;
			}
		}
		
		return _Script;
	}
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

var DatosSinc = function(vInserts, vUpdates)
{
	this.Inserts = vInserts;
	this.Updates = vUpdates;
}

// Objeto que representa una tabla y sus registros a tratar:
var Tabla = function(vNombre, vCampos, vDatos)
{
	this.Nombre = vNombre;
	this.Campos = vCampos;
	this.Datos = vDatos;
}

// Objeto que contiene los datos de conexión con la base de datos local:
var Db = function() {};

Db.Nombre = "testdatabase";
Db.Version = "1.0";
Db.Descripcion = "Base de datos de prueba";
Db.Tamano = 5*1024*1024;

/* ===================================================================== */
/*                        UTILIDADES DE LA PÁGINA                        */
/* ===================================================================== */

// Permite conectarse de forma asincrónica con Web Sql Database.
var AccesoDatosAsinc = function(vNombre, vVersion, vDescripcion, vTamano) {
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
		  	- length: Número de filas.
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
		conexion = window.openDatabase(this.Nombre, this.Version, this.Descripcion, this.Tamano);
		
		if (conexion) {
			conectado = true;
		}
		else{
			conectado = false;
		}
	};
	
	// Ejecutar una sentencia sql:
	this.EjecutarSql = function(vSql, vMetodoOk, vMetodoError){
		if (conexion)
		{
			conexion.transaction(
				function(tx){
					tx.executeSql(vSql, [], vMetodoOk, vMetodoError);
				})
		}
	};
	
	this.CerrarConexion = function()
	{
		conectado = false;
	};
};

// Método estático que ejecuta sentencias sql de forma asíncrona desde la base de datos SQLite:
/*AccesoDatosAsinc.GuardarDatos = function (vSql, vMetodoOk, vMetodoError)
{
	var _AccesoDatos = new AccesoDatosAsinc(Db.Nombre, Db.Version, Db.Descripcion, Db.Tamano);
	
	_AccesoDatos.AbrirConexion();
	
	_Datos = _AccesoDatos.EjecutarSql(vSql, vMetodoOk, vMetodoError);
	
	_AccesoDatos.CerrarConexion();
};*/

// Fecha actual en SQLite:
function FechaSQLite()
{
	return "strftime('%Y-%m-%d %H:%M:%f', 'now', 'localtime')";
}

// Permite acceder a los datos del Local Storage:
var LocalStorage = function(vIdUsuario) {};

LocalStorage.GetIdUsuario = function()
{
	return window.localStorage.getItem("IdUsuario");
};

LocalStorage.GetIdVersionUsuario = function()
{
	return window.localStorage.getItem("IdVersionUsuario");
};

LocalStorage.GetAuxIdVersionUsuario = function()
{
	return window.localStorage.getItem("AuxIdVersionUsuario");
};

LocalStorage.GetFechaUltimaSinc = function()
{
	return window.localStorage.getItem("FechaUltimaSinc");
};

LocalStorage.GetAuxFechaUltimaSinc = function()
{
	return window.localStorage.getItem("AuxFechaUltimaSinc");
};

LocalStorage.SetIdUsuario = function(vIdUsuario)
{
	window.localStorage.setItem('IdUsuario', vIdUsuario);
};

LocalStorage.SetIdVersionUsuario = function(vIdVersionUsuario)
{
	window.localStorage.setItem('IdVersionUsuario', vIdVersionUsuario);
};

LocalStorage.SetAuxIdVersionUsuario = function(vIdVersionUsuario)
{
	window.localStorage.setItem('AuxIdVersionUsuario', vIdVersionUsuario);
};

LocalStorage.SetFechaUltimaSinc = function(vFechaUltimaSinc)
{
	window.localStorage.setItem('FechaUltimaSinc', vFechaUltimaSinc);
};

LocalStorage.SetAuxFechaUltimaSinc = function(vFechaUltimaSinc)
{
	window.localStorage.setItem('AuxFechaUltimaSinc', vFechaUltimaSinc);
};