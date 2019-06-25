'use strict'

function startDB()
{
    /*
    conexion = indexedDB.open('toc', 5);
    conexion.onupgradeneeded = e =>{
        let active = conexion.result;
        let options = {
            keyPath: 'id',
            autoIncrement: 'false'
        }
        active.createObjectStore('cesta', options);
    }

    conexion.onsuccess = e =>{
        alert("DB loaded OK");
    }

    conexion.onerror = e =>{
        alert("Error al abrir la BD");
    }
    */
   db = new Dexie('toc');
   db.version(10).stores({
       cesta: 'idArticulo, nombreArticulo, unidades, subtotal' //Luego faltan más tablas
   });
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

window.onload = startDB;
var conexion = null;
var db = null;
var aux = null;
var puto = null;