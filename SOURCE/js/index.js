'use strict'

function startDB()
{
    conexion = indexedDB.open('toc', 5);
    conexion.onupgradeneeded = e =>{
        let active = conexion.result;
        let options = {
            keyPath: 'id',
            autoIncrement: 'true'
        }
        active.createObjectStore('cesta', options);
    }

    conexion.onsuccess = e =>{
        alert("DB loaded OK");
    }

    conexion.onerror = e =>{
        alert("Error al abrir la BD");
    }
}

function addCesta(idArticulo)
{
    /* TEMPORALES HASTA QUE SE LEA DESDE LA BD */
    let nomArticulo = 'art1';
    let uds = 1;
    let subto = 2.5;
    /* FIN DE TEMPORALES */
    let active  = conexion.result;
    let data    = active.transaction(["cesta"], "readwrite");
    let objeto  = data.objectStore("cesta");

    var request = objeto.put({
        nombreArticulo: nomArticulo,
        unidades: uds,
        subtotal:  subto
    });

    request.onerror = e =>{
        alert(request.error.name + '\n\n' + request.error.message);
    };

    data.oncomplete = e =>{
        actualizarCesta();
        alert("Objeto correctamente agregado!");
    };
}

function vaciarCesta()
{
    let active      = conexion.result;
    active.deleteObjectStore('cesta');
}

function actualizarCesta()
{
    let active      = conexion.result;
    let data        = active.transaction(['cesta'], 'readonly');
    let objeto      = data.objectStore("cesta");
    let elements    = [];
    objeto.openCursor().onsuccess = e =>{
        let result = e.target.result;
        if(result === null){
            return;
        }
        elements.push(result.value);
        result.continue();
    };

    data.oncomplete = e =>{
        let outHTML = '';
        for(var key in elements)
        {
            outHTML += '<tr> <th scope="row">1</th> <td>'+ elements[key].nombreArticulo +'</td> <td>'+ elements[key].unidades +'</td> <td>'+ elements[key].subtotal +'</td> </tr>';
        }

        elements = [];
        listaCesta.innerHTML = outHTML;
    }
}

window.onload = startDB;
var conexion = null;