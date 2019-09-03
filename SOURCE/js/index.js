'use strict'

function startDB()
{
   db = new Dexie('tocGame');
   db.version(1).stores({
       cesta: 'idArticulo, nombreArticulo, unidades, subtotal',
       caja: 'idTicket, timestamp, total, cesta, tarjeta',
       articulos: 'id, nombre, precio, iva',
       teclado: 'id, arrayTeclado',
       menus: 'id, nombre, submenus, teclados',
       trabajadores: 'idTrabajador, nombre',
       fichajes: 'idTrabajador, nombre, inicio, final',
       currentCaja: '++idCaja, cajonApertura, cajonClausura',
       ofertasUnidades: 'id, precioTotal, precioUnidad, unidadesNecesarias, idArticulo, nombreOferta', //ESTA SE BORRARÁ Y SE DEJARÁ UNA ÚNICA
       promociones: 'id, precioFinal, articulosNecesarios'
   });

   crearDemoCompleta();
   actualizarCesta();
   imprimirTeclado(0);
   refreshFichajes();
   setCaja();
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

function modalAbrirCaja()
{
    var monedas = [];
    monedas.push({unidades: parseInt(document.getElementById('unidadesUnCentimo').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDosCentimos').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincoCentimos').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDiezCentimos').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesVeinteCentimos').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincuentaCentimos').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesUnEuro').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDosEuros').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincoEuros').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesDiezEuros').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesVeinteEuros').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCincuentaEuros').innerHTML)});
    monedas.push({unidades: parseInt(document.getElementById('unidadesCienEuros').innerHTML)});
    console.log(monedas);
    db.currentCaja.put({cajonApertura: monedas, cajonCierre: null});
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

function crearCajaNueva()
{
    modalAbrirCaja();
    notificacion('¡Caja abierta!', 'success');
    $('#modalAperturaCaja').modal('hide');
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

function setCaja()
{
    db.currentCaja.toArray(res=>{
        if(res.length !== 0)
        {
            console.log("Caja abierta OK");
        }
        else
        {
            var htmlMonedas = `
            <tr><td>TIPO</td><td></td><td>UNIDADES</td></tr>
            <tr><td>0,01</td><td><button onclick="sumarUnidad(0);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(0);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesUnCentimo">0</td></tr>
            <tr><td>0,02</td><td><button onclick="sumarUnidad(1);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(1);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesDosCentimos">0</td></tr>
            <tr><td>0,05</td><td><button onclick="sumarUnidad(2);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(2);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesCincoCentimos">0</td></tr>
            <tr><td>0,10</td><td><button onclick="sumarUnidad(3);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(3);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesDiezCentimos">0</td></tr>
            <tr><td>0,20</td><td><button onclick="sumarUnidad(4);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(4);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesVeinteCentimos">0</td></tr>
            <tr><td>0,50</td><td><button onclick="sumarUnidad(5);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(5);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesCincuentaCentimos">0</td></tr>
            <tr><td>1,00</td><td><button onclick="sumarUnidad(6);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(6);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesUnEuro">0</td></tr>
            <tr><td>2,00</td><td><button onclick="sumarUnidad(7);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(7);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesDosEuros">0</td></tr>
            <tr><td>5,00</td><td><button onclick="sumarUnidad(8);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(8);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesCincoEuros">0</td></tr>
            <tr><td>10,00</td><td><button onclick="sumarUnidad(9);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(9);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesDiezEuros">0</td></tr>
            <tr><td>20,00</td><td><button onclick="sumarUnidad(10);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(10);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesVeinteEuros">0</td></tr>
            <tr><td>50,00</td><td><button onclick="sumarUnidad(11);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(11);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesCincuentaEuros">0</td></tr>
            <tr><td>100,00</td><td><button onclick="sumarUnidad(12);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-plus"></i><div class="ripple-container"></div></button> <button onclick="restarUnidad(12);" class="btn btn-danger btn-fab"><i class="zmdi zmdi-minus"></i><div class="ripple-container"></div></button></td><td id="unidadesCienEuros">0</td></tr>`;
            listaMonedasHtml.innerHTML = htmlMonedas;
            $('#modalAperturaCaja').modal('show');
        }
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
                    actualizarCesta();
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
            db.cesta.put({idArticulo: idArticulo, nombreArticulo: nombreArticulo, unidades: 1, subtotal: precio}).then(function(){
                actualizarCesta();
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

function actualizarCesta()
{
    buscarOfertas();
    db.cesta.toArray(lista =>{
        if(lista)
        {
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
        else
        {
            alert("Error al imprimir la lista");
        }
    });
}

function pagarConVisa(idTicket)
{
    db.caja.update(idTicket, {tarjeta: true}).then(updated=>{
        if(updated)
        {
            $('#modalPago').modal('hide')
            notificacion('El ticket se ha pagado con tarjeta ¡OK!', 'info');
        }
        else
        {
            alert("Error al intentar pagar con tarjeta");
        }
    });
}

function imprimirTicketReal(idTicket)
{
	//idTicket, timestamp, total, cesta, tarjeta
	var enviarArray = [];
	db.caja.where('idTicket').equals(idTicket).toArray(lista=>{
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

function pagar()
{
    //Hay que crear el nuevo ticket con toda la info de compra (copia de una cesta), la hora y además generar un id de ticket
    var idTicket    = generarIdTicket();
    var time        = new Date();
    var stringTime  = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    db.cesta.toArray(lista =>{
        if(lista)
        {
            if(lista.length > 0)
            {
                db.caja.put({idTicket: idTicket, timestamp: stringTime, total: Number(totalCesta.innerHTML), cesta: lista, tarjeta: false}).then(function(){
                    notificacion('¡Ticket creado!', 'success');
                    imagenIdTicket.setAttribute('onclick', 'pagarConVisa('+idTicket+')');
                    imagenImprimir.setAttribute('onclick', 'imprimirTicketReal('+idTicket+')');
                    $('#modalPago').modal('show');
                    vaciarCesta();
                });
            }
            else
            {
                notificacion('Cesta vacía', 'error');
            }
        }
        else
        {
            alert("Error al cargar la cesta desde pagar()");
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

window.onload = startDB;
var conexion = null;
var db = null;
var aux = null;
var puto = null;