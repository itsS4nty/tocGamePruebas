'use strict'

function startDB()
{
   db = new Dexie('toc');
   db.version(10).stores({
       cesta: 'idArticulo, nombreArticulo, unidades, subtotal',
       caja: 'idTicket, timestamp, total, cesta, tarjeta',
       articulos: 'id, nombre, precio, iva',
       teclado: 'id, arrayTeclado' //Aquí más adelante se le añade el id padre menú/submenú
   });
   actualizarCesta();
}

function insertarTeclado()
{
    var teclas = [];
    teclas.push({id: 1, posicion: 1});
    teclas.push({id: 2, posicion: 2});
    teclas.push({id: 3, posicion: 3});
    teclas.push({id: 4, posicion: 4});
    teclas.push({id: 5, posicion: 5});
    teclas.push({id: 6, posicion: 6});

    teclas.push({id: 7, posicion: 7});
    teclas.push({id: 8, posicion: 9});
    teclas.push({id: 9, posicion: 11});
    teclas.push({id: 10, posicion: 12});

    teclas.push({id: 11, posicion: 13});
    teclas.push({id: 12, posicion: 14});
    teclas.push({id: 13, posicion: 15});
    teclas.push({id: 14, posicion: 17});
    teclas.push({id: 15, posicion: 18});

    teclas.push({id: 16, posicion: 19});
    teclas.push({id: 17, posicion: 21});
    teclas.push({id: 18, posicion: 23});

    teclas.push({id: 19, posicion: 25});
    teclas.push({id: 20, posicion: 28});
    teclas.push({id: 21, posicion: 29});
    teclas.push({id: 22, posicion: 30});

    teclas.push({id: 23, posicion: 31});
    teclas.push({id: 24, posicion: 32});
    teclas.push({id: 25, posicion: 33});
    teclas.push({id: 26, posicion: 34});
    teclas.push({id: 27, posicion: 35});
    teclas.push({id: 28, posicion: 36});

    db.teclado.put({id: 1, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function getItemCesta(indice)
{
    db.cesta.get(indice, item =>{
        //return item;
        aux = item;
    });
}
function getInfoArticulo(arrayArticulos, idToSearch)
{
    for(let i = 0; i < arrayArticulos.length; i++)
    {
        if(arrayArticulos[i].id == idToSearch)
        {
            return {nombre: arrayArticulos[i].nombre, precio: arrayArticulos[i].precio};
        }
    }
    return false;
}
function imprimirTeclado(id)
{
    db.articulos.toArray(listaArticulos =>{
        if(listaArticulos)
        {
            db.teclado.toArray(infoTeclado =>{
                if(infoTeclado)
                {
                    console.log('info necesaria:');
                    console.log(infoTeclado);
                    let strPos = '';
                    let strFun = '';
                    let aux = null;
                    for(let i = 0; i < infoTeclado[0].arrayTeclado.length; i++)
                    {
                        console.log("WTF");
                        aux = getInfoArticulo(listaArticulos, infoTeclado[0].arrayTeclado[i].id);
                        strPos = 'tecla' + infoTeclado[0].arrayTeclado[i].posicion;
                        strFun = `addItemCesta(${infoTeclado[0].arrayTeclado[i].id}, '${aux.nombre}', ${aux.precio});`;
                        document.getElementById(strPos).innerHTML = aux.nombre;
                        document.getElementById(strPos).setAttribute('onclick', strFun);
                    }
                    console.log("Teclado actualizado");
                }
                else
                {
                    console.log("Error al obtener la info de teclado");
                }
            });
        }
        else
        {
            console.log("Error al obtener la lista de artículos en imprimirTeclado()");
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

function crearTecladoAMano()
{
    var datos = [];
    datos.push({id: 1, nombre: 'Café', precio: 1.2, iva: 10});
    datos.push({id: 2, nombre: 'Café con leche', precio: 1.35, iva: 10});
    datos.push({id: 3, nombre: 'Cortado', precio: 1.25, iva: 10});
    datos.push({id: 4, nombre: 'Café descaf.', precio: 1.1, iva: 10});
    datos.push({id: 5, nombre: 'Cappuccino', precio: 2.75, iva: 10});
    datos.push({id: 6, nombre: 'Café con hielo', precio: 1.35, iva: 10});

    datos.push({id: 7, nombre: 'Suc de taronja Gran', precio: 2.5, iva: 10});
    datos.push({id: 8, nombre: 'Cortado de leche sin lactosa', precio: 1.2, iva: 10});
    datos.push({id: 9, nombre: 'Café con leche de soja', precio: 1.4, iva: 10});
    datos.push({id: 10, nombre: 'Café americano', precio: 1.3, iva: 10});

    datos.push({id: 11, nombre: 'Chocolate a la taza', precio: 2, iva: 10});
    datos.push({id: 12, nombre: 'Leche con colacao', precio: 1.45, iva: 10});
    datos.push({id: 13, nombre: 'Café con leche sin lactosa', precio: 1.35, iva: 10});
    datos.push({id: 14, nombre: 'Cortado de leche de soja', precio: 1.3, iva: 10});
    datos.push({id: 15, nombre: 'Vaso de leche de soja', precio: 1.4, iva: 10});

    datos.push({id: 16, nombre: 'Vaso de leche', precio: 1.1, iva: 10});
    datos.push({id: 17, nombre: 'Vaso de leche sin lactosa', precio: 1.4, iva: 10});
    datos.push({id: 18, nombre: 'Invitación café', precio: 0, iva: 10});

    datos.push({id: 19, nombre: 'Infusión aromática', precio: 1.5, iva: 10});
    datos.push({id: 20, nombre: 'Vaso fruta pequeño variada', precio: 2.85, iva: 10});
    datos.push({id: 21, nombre: 'Zumo fresa - Coco', precio: 2.1, iva: 10});
    datos.push({id: 22, nombre: 'Vaso fruta pequeño Piña', precio: 2.85, iva: 10});

    datos.push({id: 23, nombre: 'Carajillo coñac', precio: 1.5, iva: 10});
    datos.push({id: 24, nombre: 'Carajillo whisky', precio: 1.7, iva: 10});
    datos.push({id: 25, nombre: 'Zumo naranja', precio: 3.5, iva: 10});
    datos.push({id: 26, nombre: 'Zumo maracuya - mango', precio: 2.1, iva: 10});
    datos.push({id: 27, nombre: 'Zumo coco - mango', precio: 2.1, iva: 10});
    datos.push({id: 28, nombre: 'Vaso fruta pequeña sandia', precio: 2.85, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        console.log("Todo ok!");
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function getArticulos()
{
    db.articulos.toArray(lista =>{
        if(lista)
        {
            console.log(lista);
        }
        else
        {
            alert("Error al cargar los articulos");
        }
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