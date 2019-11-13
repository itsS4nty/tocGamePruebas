'use strict'

function startDB()
{
   db = new Dexie('tocGame');
   db.version(1).stores({
       cesta: 'idArticulo, nombreArticulo, unidades, subtotal, promocion',
       tickets: 'idTicket, timestamp, total, cesta, tarjeta, idCaja, idTrabajador',
       articulos: 'id, nombre, precio, iva',
       teclado: 'id, arrayTeclado',
       trabajadores: 'idTrabajador, nombre, nombreCorto',
       fichajes: 'idTrabajador, nombre, inicio, final, activo, fichado',
       currentCaja: '++idCaja, cajonApertura, cajonClausura', //SE TIENE QUE BORRAR Y USAR LA TABLA 'CAJAS'
       promociones: 'id, nombre, precioFinal, articulosNecesarios',
       menus: 'id, nombre, color',
       submenus: 'id, idPadre, nombre, idTeclado, color',
       parametros: 'licencia, nombreEmpresa, database',
       cajas: '++id, inicioTime, finalTime, inicioDependenta, finalDependenta, totalApertura, totalCierre, descuadre, recaudado, abierta'
   });

   comprobarConfiguracion().then((res)=>{
       if(res)
       {
           iniciarToc();
       }
        else
        {
            installWizard();
        }
   });
}
$(function () {
    "use strict";
    var $balloon = $("#balloon"),
      $infoTxt = $("#info-txt");
    setTimeout(function () {
      $balloon.addClass("shrink");
    }, 500);
    $infoTxt.delay(1000).fadeIn();
    $(this).click(function () {
      $("#button-hint").fadeOut();
      $balloon.fadeOut();
      $infoTxt.fadeOut();
    });
    jqKeyboard.init();
  });

function abrirModalTeclado()
{
    botonFichar.setAttribute('class', 'btn btn-default');
    campoNombreTeclado.focus();
}
function loadingToc()
{
    actualizarCesta();
    imprimirTeclado(0); //Faltan comprobaciones de existencia de teclados y cargar automáticamente el primero.
    clickMenu(0);
}
function iniciarToc()
{
    /* ORDEN ANTIGUO
    actualizarCesta();
    imprimirTeclado(0);
    refreshFichajes();
    setCaja();
    clickMenu(0);
    */
   comprobarCaja().then(res=>{
        if(res === 'ABIERTA')
        { 
            loadingToc();
        }
        else
        {
            if(res === 'CERRADA')
            {
                $('#modalAperturaCaja').modal('show');
            }
            else
            {
                if(res === 'ERROR')
                {
                    /* CONTACTAR CON UN TÉCNICO */
                }
            }
        }
   });
}
function comprobarCaja()
{
    var devolver = new Promise((dev, rej)=>{
        db.cajas.where('abierta').equals(1).toArray(data=>{
            if(data.length === 1)
            {
                dev('ABIERTA');
            }
            else
            {
                if(data.length === 0)
                {
                    dev('CERRADA');
                }
                else
                {
                    console.log("Error, hay más de una caja abierta");
                    notificacion('Error. Hay más de una caja abierta, contacte con un técnico', 'error');
                    dev('ERROR');
                }
            }
        }).catch(err=>{
            console.log(err);
            notificacion('Error en comprobarCaja()', 'error');
            dev('ERROR');
        });
    });
    return devolver;
}
/*
function sumarUnidad(x)
{
    switch(x)
    {
        case 0: document.getElementById('unidadesUnCentimo').innerHTML = parseInt(document.getElementById('unidadesUnCentimo').innerHTML)+1; break;
        case 1: document.getElementById('unidadesDosCentimos').innerHTML = parseInt(document.getElementById('unidadesDosCentimos').innerHTML)+1; break;
        case 2: document.getElementById('unidadesCincoCentimos').innerHTML = parseInt(document.getElementById('unidadesCincoCentimos').innerHTML)+1; break;
        case 3: document.getElementById('unidadesDiezCentimos').innerHTML = parseInt(document.getElementById('unidadesDiezCentimos').innerHTML)+1; break;
        case 4: document.getElementById('unidadesVeinteCentimos').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimos').innerHTML)+1; break;
        case 5: document.getElementById('unidadesCincuentaCentimos').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimos').innerHTML)+1; break;
        case 6: document.getElementById('unidadesUnEuro').innerHTML = parseInt(document.getElementById('unidadesUnEuro').innerHTML)+1; break;
        case 7: document.getElementById('unidadesDosEuros').innerHTML = parseInt(document.getElementById('unidadesDosEuros').innerHTML)+1; break;
        case 8: document.getElementById('unidadesCincoEuros').innerHTML = parseInt(document.getElementById('unidadesCincoEuros').innerHTML)+1; break;
        case 9: document.getElementById('unidadesDiezEuros').innerHTML = parseInt(document.getElementById('unidadesDiezEuros').innerHTML)+1; break;
        case 10: document.getElementById('unidadesVeinteEuros').innerHTML = parseInt(document.getElementById('unidadesVeinteEuros').innerHTML)+1; break;
        case 11: document.getElementById('unidadesCincuentaEuros').innerHTML = parseInt(document.getElementById('unidadesCincuentaEuros').innerHTML)+1; break;
        case 12: document.getElementById('unidadesCienEuros').innerHTML = parseInt(document.getElementById('unidadesCienEuros').innerHTML)+1; break;
    }
}
*/
function fichados() /* DEVUELVE null si no hay nadie, DEVUELVE array de fichados si hay alguien  'idTrabajador, nombre, inicio, final, activo, fichado'*/
{
    var devolver = new Promise(function(dev, rej){
        db.fichajes.toArray().then(data=>{
            if(data.length > 0)
            {
                dev(data);
            }
            else
            {
                dev(null);
            }
        }).catch(err=>{
            console.log(err);
            notificacion('Error en fichados()');
        });
    });
    return devolver;
}

function contarYCrearCaja() /* CREA LA NUEVA CAJA: TIPO CUENTA -> POR UNIDADES */
{
    db.cajas.put({
            inicioTime: new Date(), 
            finalTime: null, 
            inicioDependenta: null,
            finalDependenta: null,
            totalApertura: vueAbrirCaja.contarTodo(),
            totalCierre: null,
            descuadre: null,
            recaudado: null,
            abierta: 1 //1 ABIERTA, 0 CERRADA
        }).then(function(){
            db.cajas.orderBy('id').last().then(data=>{
                currentCaja = data.id;
                loadingToc();
                notificacion('¡INICIO CAJA OK!');
            }).catch(err=>{
                console.log(err);
                notificacion('Error. No se puede establecer el ID de la caja actual');
            });
    });
}

function modalCerrarCaja2()
{
    var monedas = [];
    monedas.push({unidades: parseInt(document.getElementById('unidadesUnCentimoCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDosCentimosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincoCentimosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDiezCentimosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesVeinteCentimosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincuentaCentimosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesUnEuroCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDosEurosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincoEurosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDiezEurosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesVeinteEurosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincuentaEurosCierre').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCienEurosCierre').innerHTML)});
    return monedas;
}

function crearCajaNueva() //EL nombre es raro. SOLO SE ACCEDE DESDE EL  MODAL
{
    contarYCrearCaja();
    notificacion('¡Caja abierta!', 'success');
    $('#modalAperturaCaja').modal('hide');

    fichados().then(data=>{
        if(data !== null)
        {
            for(let i = 0; i < data.length; i++)
            {
                if(data[i].activo)
                {
                    currentIdTrabajador = data[i].idTrabajador;
                    break;
                }
            }
            currentTrabajadores = data;
        }
        else
        {
            notificacion('No se encuentran trabajador@s fichad@s', 'warning');
            $('#modalFichar').modal();
        }
    });
}

function restarUnidad(x)
{
    switch(x)
    {
        case 0: document.getElementById('unidadesUnCentimo').innerHTML = parseInt(document.getElementById('unidadesUnCentimo').innerHTML)-1; break;
        case 1: document.getElementById('unidadesDosCentimos').innerHTML = parseInt(document.getElementById('unidadesDosCentimos').innerHTML)-1; break;
        case 2: document.getElementById('unidadesCincoCentimos').innerHTML = parseInt(document.getElementById('unidadesCincoCentimos').innerHTML)-1; break;
        case 3: document.getElementById('unidadesDiezCentimos').innerHTML = parseInt(document.getElementById('unidadesDiezCentimos').innerHTML)-1; break;
        case 4: document.getElementById('unidadesVeinteCentimos').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimos').innerHTML)-1; break;
        case 5: document.getElementById('unidadesCincuentaCentimos').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimos').innerHTML)-1; break;
        case 6: document.getElementById('unidadesUnEuro').innerHTML = parseInt(document.getElementById('unidadesUnEuro').innerHTML)-1; break;
        case 7: document.getElementById('unidadesDosEuros').innerHTML = parseInt(document.getElementById('unidadesDosEuros').innerHTML)-1; break;
        case 8: document.getElementById('unidadesCincoEuros').innerHTML = parseInt(document.getElementById('unidadesCincoEuros').innerHTML)-1; break;
        case 9: document.getElementById('unidadesDiezEuros').innerHTML = parseInt(document.getElementById('unidadesDiezEuros').innerHTML)-1; break;
        case 10: document.getElementById('unidadesVeinteEuros').innerHTML = parseInt(document.getElementById('unidadesVeinteEuros').innerHTML)-1; break;
        case 11: document.getElementById('unidadesCincuentaEuros').innerHTML = parseInt(document.getElementById('unidadesCincuentaEuros').innerHTML)-1; break;
        case 12: document.getElementById('unidadesCienEuros').innerHTML = parseInt(document.getElementById('unidadesCienEuros').innerHTML)-1; break;
    }
}
function restarUnidadCierre(x)
{
    switch(x)
    {
        case 0: document.getElementById('unidadesUnCentimoCierre').innerHTML = parseInt(document.getElementById('unidadesUnCentimoCierre').innerHTML)-1; break;
        case 1: document.getElementById('unidadesDosCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDosCentimosCierre').innerHTML)-1; break;
        case 2: document.getElementById('unidadesCincoCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoCentimosCierre').innerHTML)-1; break;
        case 3: document.getElementById('unidadesDiezCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezCentimosCierre').innerHTML)-1; break;
        case 4: document.getElementById('unidadesVeinteCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimosCierre').innerHTML)-1; break;
        case 5: document.getElementById('unidadesCincuentaCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimosCierre').innerHTML)-1; break;
        case 6: document.getElementById('unidadesUnEuroCierre').innerHTML = parseInt(document.getElementById('unidadesUnEuroCierre').innerHTML)-1; break;
        case 7: document.getElementById('unidadesDosEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDosEurosCierre').innerHTML)-1; break;
        case 8: document.getElementById('unidadesCincoEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoEurosCierre').innerHTML)-1; break;
        case 9: document.getElementById('unidadesDiezEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezEurosCierre').innerHTML)-1; break;
        case 10: document.getElementById('unidadesVeinteEurosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteEurosCierre').innerHTML)-1; break;
        case 11: document.getElementById('unidadesCincuentaEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaEurosCierre').innerHTML)-1; break;
        case 12: document.getElementById('unidadesCienEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCienEurosCierre').innerHTML)-1; break;
    }
}
function sumarUnidadCierre(x)
{
    switch(x)
    {
        case 0: document.getElementById('unidadesUnCentimoCierre').innerHTML = parseInt(document.getElementById('unidadesUnCentimoCierre').innerHTML)+1; break;
        case 1: document.getElementById('unidadesDosCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDosCentimosCierre').innerHTML)+1; break;
        case 2: document.getElementById('unidadesCincoCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoCentimosCierre').innerHTML)+1; break;
        case 3: document.getElementById('unidadesDiezCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezCentimosCierre').innerHTML)+1; break;
        case 4: document.getElementById('unidadesVeinteCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimosCierre').innerHTML)+1; break;
        case 5: document.getElementById('unidadesCincuentaCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimosCierre').innerHTML)+1; break;
        case 6: document.getElementById('unidadesUnEuroCierre').innerHTML = parseInt(document.getElementById('unidadesUnEuroCierre').innerHTML)+1; break;
        case 7: document.getElementById('unidadesDosEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDosEurosCierre').innerHTML)+1; break;
        case 8: document.getElementById('unidadesCincoEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoEurosCierre').innerHTML)+1; break;
        case 9: document.getElementById('unidadesDiezEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezEurosCierre').innerHTML)+1; break;
        case 10: document.getElementById('unidadesVeinteEurosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteEurosCierre').innerHTML)+1; break;
        case 11: document.getElementById('unidadesCincuentaEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaEurosCierre').innerHTML)+1; break;
        case 12: document.getElementById('unidadesCienEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCienEurosCierre').innerHTML)+1; break;
    }
}

function modalCerrarCaja()
{
    $('#modalCierreCaja').modal('show');
}

function cerrarCaja()
{
    db.currentCaja.toArray(listaCajas=>{
        var max = 0;
        for(let i = 0; i < listaCajas.length; i++)
        {
            if(listaCajas.idCaja > max)
            {
                max = listaCajas.idCaja;
            }
        }
        var datosCierre = modalCerrarCaja2();
        console.log(max);
        db.currentCaja.put({idCaja: max, cajonClausura: datosCierre}).then(function(){
            notificacion('Caja cerrada correctamente', 'success');
            $('#modalCierreCaja').modal('hide');
        });
    });
}

function ivaCorrecto(iva)
{
    let ivaOk = Number(iva);
    switch(ivaOk)
    {
        case 4: return true; break;
        case 10: return true; break;
        case 21: return true; break;
        default: return false; break;
    }
}
function conversorIva(iva)
{
    let ivaOk = Number(iva);
    switch(ivaOk)
    {
        case 1: return 4; break;
        case 2: return 10; break;
        case 3: return 21; break;
        default: return 0; break;
    }
}

function ficharTrabajadorDirecto(idTrabajador)
{
    db.trabajadores.where('idTrabajador').equals(idTrabajador).toArray(lista=>{
		db.fichajes.put({idTrabajador: lista[0].idTrabajador, nombre: lista[0].nombre, inicio: getHoraUnix(), final: false}).then(function(){
            notificacion('¡Fichar OK!', 'success');
            refreshFichajes();
            botonFichar.setAttribute('class', 'hide btn btn-default');
        });
    });
}
function ficharTrabajador(buscoNombre)
{
    var filtro = [];
    db.trabajadores.toArray(lista=>{
        if(lista)
        {
            for(let i = 0; i < lista.length; i++)
            {
                if(lista[i].nombre.toUpperCase().indexOf(buscoNombre.toUpperCase()) !== -1)
                {
                    filtro.push({idTrabajador: lista[i].idTrabajador, nombre: lista[i].nombre});
                }
            }
            if(filtro.length === 1)
            {
                db.fichajes.put({idTrabajador: filtro[0].idTrabajador, nombre: filtro[0].nombre, inicio: getHoraUnix(), final: false}).then(function(){
                    notificacion('¡Fichar OK!', 'success');
                    refreshFichajes();
                    botonFichar.setAttribute('class', 'hide btn btn-default');
                });
            }
            else
            {
                if(filtro.length > 1)
                {
                    var textoHTML = '';
                    for(let i = 0; i < filtro.length; i++)
                    {
                        textoHTML += `<tr><td>${filtro[i].nombre}</td><td><button type="button" class="btn btn-primary" onclick="ficharTrabajadorDirecto(${filtro[i].idTrabajador})">Fichar</button></td></tr>`;
                    }
                    listaResultadosFichajes.innerHTML = textoHTML;
                    $("#modalFichajes").modal();
                }
                else
                {
                    notificacion('Ningún resultado con este nombre', 'error');
                }
            }
        }
        else
        {
            console.log("ERROR en ficharTrabajador");
            notificacion('ERROR en ficharTrabajador', 'error');
        }
    });
}

function nuevoArticulo(idArticulo, nombreArticulo, precioArticulo, ivaArticulo)
{
    if(ivaCorrecto(ivaArticulo))
    {
        db.articulos.put({id: idArticulo, nombre: nombreArticulo, precio: Number(precioArticulo), iva: ivaArticulo}).then(function(){
            console.log("Articulo agregado correctamente");
        });
    }
    else
    {
        alert("Error");
        console.log(`IVA incorrecto en id(${idArticulo}) nombre(${nombreArticulo})`);
    }
}

function addItemCesta(idArticulo, nombreArticulo, precio)
{
    //primero comprobamos si el item ya existe en la lista con un get
    db.cesta.get(idArticulo, res =>{
        if(res)
        {
            let uds     = res.unidades + 1;
            let subt    = res.subtotal + precio; 
            db.cesta.update(idArticulo, {unidades: uds, subtotal: subt}).then(updated=>{
                if(updated)
                {
                    buscarOfertas().then(function(){
                        actualizarCesta();
                    });
                }
                else
                {
                    alert("Error al actualizar cesta");
                }
            });
            //Hay que sumar uno
        }
        else
        {
            db.cesta.put({idArticulo: idArticulo, nombreArticulo: nombreArticulo, unidades: 1, subtotal: precio, promocion: -1}).then(function(){
                buscarOfertas().then(function(){
                    actualizarCesta();
                });
            });
        }
    });
}

function vaciarCesta()
{
    db.cesta.clear().then(function(){
        actualizarCesta();
    });
}

async function actualizarCesta()
{
    var lista = await db.cesta.toArray();
    let outHTML     = '';
    let sumaTotal   = 0.0;
    for(var key in lista)
    {
        outHTML     += '<tr><td>'+ lista[key].nombreArticulo +'</td> <td>'+ lista[key].unidades +'</td> <td>'+ lista[key].subtotal.toFixed(2) +'</td> </tr>';
        sumaTotal   += lista[key].subtotal;
    }

    lista = [];
    imprimirTotalCesta(sumaTotal);
    listaCesta.innerHTML = outHTML;
}

function imprimirTicketReal(idTicket)
{
	//idTicket, timestamp, total, cesta, tarjeta
	var enviarArray = [];
	db.tickets.where('idTicket').equals(idTicket).toArray(lista=>{
		console.log(lista);
		for(let i = 0; i < lista[0].cesta.length; i++)
		{
			enviarArray.push({cantidad: lista[0].cesta[i].unidades, articuloNombre: lista[0].cesta[i].nombreArticulo, importe: lista[0].cesta[i].subtotal});
		}
		console.log(enviarArray);
		$.ajax({ 
		   url: '/imprimirTicket',
		   type: 'POST',
		   cache: false, 
	  	   data: JSON.stringify({ numFactura: lista[0].idTicket, arrayCompra: enviarArray, total: lista[0].total, visa: lista[0].tarjeta }),
	 	   contentType: "application/json; charset=utf-8",
	  	   dataType: "json",
		   success: function(data){
			  notificacion('Ticket OK!', 'success');
		   }
		   , error: function(jqXHR, textStatus, err){
			   alert('text status '+textStatus+', err '+err)
		   }
		});
	});
}

function fichadoYActivo()
{
    if(currentTrabajadores !== null && currentTrabajadores.length > 0 && currentIdTrabajador !== null)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function pagarConTarjeta()
{
    var idTicket    = generarIdTicket();
    var time        = new Date();
    var stringTime  = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    if(fichadoYActivo())
    {
        db.cesta.toArray(lista=>{
            if(lista)
            {
                if(lista.length > 0)
                {
                    if(1 == 1) //emitirPagoDatafono()) //Se envía la señal al datáfono, si todo es correcto, devuelve true. ESTO DEBERÁ SER UNA PROMESA, POR LO QUE MÁS ADELANTE HABRÁ QUE CAMBIAR LA ESTRUCTURA DE ACCESO A ESTA FUNCIÓN
                    {
                        db.tickets.put({idTicket: idTicket, timestamp: stringTime, total: Number(totalCesta.innerHTML), cesta: lista, tarjeta: true, idCaja: currentCaja}).then(function(){
                            imagenImprimir.setAttribute('onclick', 'imprimirTicketReal('+idTicket+')');
                            rowEfectivoTarjeta.setAttribute('class', 'row hide');
                            rowImprimirTicket.setAttribute('class', 'row');
                            vaciarCesta();
                            notificacion('¡Ticket creado!', 'success');
                        });
                    }
                    else
                    {
                        notificacion('Error al pagar con datáfono', 'error');
                    }
                }
                else
                {
                    notificacion('Error. ¡No hay nada en la cesta!', 'error');    
                }
            }
            else
            {
                notificacion('Error al cargar la cesta desde pagar()', 'error');
            }
        });
    }
    else
    {
        alert("Hay que fichar y activar!");
    }
}

function pagarConEfectivo()
{
    var idTicket        = generarIdTicket();
    var time            = new Date();
    var stringTime  = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    if(fichadoYActivo())
    {
        db.cesta.toArray(lista=>{
            if(lista)
            {
                if(lista.length > 0)
                {
                    db.tickets.put({idTicket: idTicket, timestamp: stringTime, total: Number(totalCesta.innerHTML), cesta: lista, tarjeta: false, idCaja: currentCaja}).then(function(){
                        imagenImprimir.setAttribute('onclick', 'imprimirTicketReal('+idTicket+')');
                        rowEfectivoTarjeta.setAttribute('class', 'row hide');
                        rowImprimirTicket.setAttribute('class', 'row');
                        vaciarCesta();
                        notificacion('¡Ticket creado!', 'success');
                    });
                }
                else
                {
                    notificacion('Error. ¡No hay nada en la cesta!', 'error');    
                }
            }
            else
            {
                notificacion('Error al cargar la cesta desde pagar()', 'error');
            }
        });   
    }
    else
    {
        alert("Lo mismo!");
    }
}

function abrirPago()
{
    db.cesta.toArray(lista=>{
        if(lista)
        {
            if(lista.length > 0)
            {
                rowImprimirTicket.setAttribute('class', 'row hide');
                rowEfectivoTarjeta.setAttribute('class', 'row');
                $('#modalPago').modal();
            }
            else
            {
                notificacion('Error. ¡No hay nada en la cesta!', 'error');
            }
        }
        else
        {
            notificacion('Error al acceder a la cesta desde abrirPago()', 'error');
        }
    });
}

function generarIdTicket()
{
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime/1000);
    return timestamp;
}

function addMenus()
{
    var menuData = [];
    
    menuData.push({id: 0, nombre: 'Cafetería', submenus: [0, 1, 2], teclados: null});
    menuData.push({id: 1, nombre: 'Panadería', submenus: [3, 4, 5], teclados: null});
    menuData.push({id: 3, nombre: 'Frutería', submenus: [6, 7, 8], teclados: null});

    db.menus.bulkPut(menuData).then(function(){
        console.log("Menús agregadosadd");
    });
}

window.onload           = startDB;
var conexion            = null;
var db                  = null;
var aux                 = null;
var puto                = null;
var inicio              = 0;
var currentMenu         = 0;
var currentCaja         = null;
var currentTrabajadores = null;
var currentIdTrabajador = null;