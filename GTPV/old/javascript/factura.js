var _SumaTotal = 0;
var _Total = false;
var _Final = false;

var Linea = function (vNombre, vPrecioUnidad, vCantidad)
{
	this.Nombre = vNombre;
	this.PrecioUnidad = vPrecioUnidad;
	this.Cantidad = vCantidad;
}


var Factura = function()
{
	this.Lineas = new Array();
	
	this.AnadirProducto = function(vNombre, vPrecioUnidad, vCantidad)
	{
		if (vCantidad == null || vCantidad < 1)
			vCantidad = 1;
			
		var _Existe = false;
		for (var i = 0; i < this.Lineas.length; i++)
		{
			var _Linea = this.Lineas[i];
			
			if (vNombre == _Linea.Nombre)
			{
				_Linea.Cantidad++;
				_Existe = true;
				break;
			}
		}
		
		if (!_Existe)	
			this.Lineas.push(new Linea(vNombre, vPrecioUnidad, vCantidad))
	}
}

Inicializar();

function Inicializar()
{
	var _TbInfoFactura = document.getElementById("tbInfoFactura");
	var _TbInsertar = document.getElementById("tbInsertar");
	
	_Total = false;
	_Final = false;
	
	_MiFactura = new Factura();
	
	_TbInfoFactura.value = "";
	_TbInsertar.value = "";
	
	_TbInsertar.readOnly = true;
	
	Actualizar();
}

function AnadirProducto(vEvento)
{
	if (!_Total && !_Final)
	{
		var _Origen = null;
		
		// Capturar el origen del evento:
		if(!vEvento)
		{
			_Origen = event.srcElement;
		} 
		else
		{
			_Origen = vEvento.target;
		}
		
		var _NombreProducto = _Origen.childNodes[0].textContent;
		
		var ad = new AccesoDatosAsinc(Db.Nombre, Db.Version, Db.Descripcion, Db.Tamano);
		
		ad.AbrirConexion();
		
		var _Sql = "SELECT NOM, PREU FROM ARTICLES WHERE NOM = '" + _NombreProducto + "';";
		
		ad.EjecutarSql(_Sql,
			function(vTx, vResult)
			{
				if (vResult.rows.length > 0)
				{
					var _Registro = vResult.rows.item(0);
					var _Preu = _Registro["PREU"];
					
					_MiFactura.AnadirProducto(_NombreProducto, _Preu);
					
					Actualizar();
				}
			},
			function(vTx, vError)
			{
				alert(vError.message);
			});
		
		ad.CerrarConexion();
	}
}

function Actualizar()
{
	var _TbFactura = document.getElementById("tbFactura");
	_TbFactura.textContent = "Factura: ";
	
	for (var i = 0; i < _MiFactura.Lineas.length; i++)
	{
		var _Linea = _MiFactura.Lineas[i];
		var _PrecioTotal = Redondear(_Linea.PrecioUnidad * _Linea.Cantidad);
		
		_TbFactura.textContent += "\n" + _Linea.Cantidad  + " - " + RPad(_Linea.Nombre, 50, ".") + _PrecioTotal;
	}
}

function Redondear(vNumero)
{
	var _Original = parseFloat(vNumero);
	
	var _Resultado = Math.round(vNumero * 100) / 100;
	
	return _Resultado;
}

function CalcularTotal()
{
	var _TbFactura = document.getElementById("tbFactura");
	var _TbInfoFactura = document.getElementById("tbInfoFactura");
	var _TbInsertar = document.getElementById("tbInsertar");
	
	for (var i = 0; i < _MiFactura.Lineas.length; i++)
	{
		var _Linea = _MiFactura.Lineas[i];
		var _PrecioTotal = _Linea.PrecioUnidad * _Linea.Cantidad;
		_SumaTotal += _PrecioTotal;
	}
	
	_SumaTotal = Redondear(_SumaTotal);
	
	_TbInfoFactura.value = "Total: " + _SumaTotal;
	_TbFactura.textContent += "\nTotal: " + _SumaTotal;
	
	_Total = true;
	_TbInsertar.readOnly = false;
}

function EscribirNumero(vElemento)
{
	var _TbInsertar = document.getElementById("tbInsertar");
	var _Contenido = vElemento.textContent;
	
	switch(_Contenido)
	{
		case "+": break;
		case "-": break;
		case "*": break;
		case "/": break;
		case "◄": _TextBox.value = _TextBox.value.slice(0, -1); break;
		case "C":
			if (!_Final)
			{
				if (confirm("¿Seguro que desea cancelar la operación actual?"))
					Inicializar();
			}
			else
				Inicializar();
		break;
		case "%": break;
		case "=": break;
		case "00": break;
		case ".":
			if (_TbInsertar.value.indexOf(".", 0) == -1)
				_TbInsertar.value += _Contenido;
		break;
		default:
			_TbInsertar.value += _Contenido;
	}
}

function Si()
{
	if (_Total)
	{
		if (!_Final)
		{
			var _TbFactura = document.getElementById("tbFactura");
			var _TbInfoFactura = document.getElementById("tbInfoFactura");
			var _TbInsertar = document.getElementById("tbInsertar");
			
			try
			{
				var _Cantidad = parseFloat(_TbInsertar.value);
				
				if (_Cantidad >= _SumaTotal)
				{
					var _Cambio = Redondear(_Cantidad - _SumaTotal);
					_TbInfoFactura.value = "Cambio: " + _Cambio;
					
					_TbFactura.textContent += "\nEntregado: " + _Cantidad;
					_TbFactura.textContent += "\nCambio: " + _Cambio;
					
					_Final = true;
				}
			}
			catch(_Exception)
			{
				alert(_Exception.message);
			}
		}
		else
			Inicializar();
	}
}

function No()
{
	var _TbInfoFactura = document.getElementById("tbInfoFactura");
	var _TbInsertar = document.getElementById("tbInsertar");
	
	if (_Total)
	{
		_TbInsertar.value = "";
		_Total = false;
		_TbInsertar.readOnly = true;
	}
	
	
	_TbInfoFactura.value = "";
}