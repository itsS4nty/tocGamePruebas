'use strict'

function startDB()
{
   db = new Dexie('tocGame');
   db.version(1).stores({
       cesta: 'idArticulo, nombreArticulo, unidades, subtotal',
       caja: 'idTicket, timestamp, total, cesta, tarjeta',
       articulos: 'id, nombre, precio, iva',
       teclado: 'id, arrayTeclado',
       menus: 'id, nombre, submenus, teclados'
   });

   db.on("versionchange", function(event) {
        crearDemoCompleta();
  });

   actualizarCesta();
   imprimirTeclado(0);
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
    db.cesta.toArray(lista =>{
        //console.log(lista);
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