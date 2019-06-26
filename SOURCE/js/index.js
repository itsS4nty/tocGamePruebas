'use strict'

function startDB()
{
   db = new Dexie('toc');
   db.version(10).stores({
       cesta: 'idArticulo, nombreArticulo, unidades, subtotal',
       caja: 'idTicket, timestamp, total, cesta, tarjeta' //Luego faltan más tablas
   });
   actualizarCesta();
}

function getItemCesta(indice)
{
    db.cesta.get(indice, item =>{
        //return item;
        aux = item;
    });
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
    db.cesta.toArray(lista =>{
        console.log(lista);
        puto = lista;
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
        }
        else
        {
            alert("Error al intentar pagar con tarjeta");
        }
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
            db.caja.put({idTicket: idTicket, timestamp: stringTime, total: Number(totalCesta.innerHTML), cesta: lista, tarjeta: false}).then(function(){
                console.log(`Ticket numero ${idTicket} creado`);
                imagenIdTicket.setAttribute('onclick', 'pagarConVisa('+idTicket+')')
                $('#modalPago').modal('show');
                vaciarCesta();
            });
        }
        else
        {
            alert("Error al cargar la cesta desde pagar()");
        }
    });
}

function generarIdTicket()
{
    return Math.round(Math.random()*100000);
}

function verCaja()
{
    db.caja.toArray(lista =>{
        if(lista)
        {
            imprimirListaCaja(lista);
            $("#modalCaja").modal();
        }
        else
        {
            alert("Error al cargar la caja desde verCaja()");
        }
    });
}

window.onload = startDB;
var conexion = null;
var db = null;
var aux = null;
var puto = null;