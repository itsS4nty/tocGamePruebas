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

function addCesta(nomArticulo, subto)
{
    /* TEMPORALES HASTA QUE SE LEA DESDE LA BD */
    //let nomArticulo = 'art1';
    let uds = 1;
    //let subto = 2.5;
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
    let db 					= conexion.result;
	let transaction			= db.transaction(["cesta"], "readwrite");	
	let objectStore			= transaction.objectStore("cesta");
	let objectStoreRequest	= objectStore.clear();
	objectStoreRequest.onsuccess = function(event) 
	{
		actualizarCesta();
	};
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
        puto = elements;
        result.continue();
    };

    data.oncomplete = e =>{
        let outHTML     = '';
        let sumaTotal   = 0.0; 
        for(var key in elements)
        {
            outHTML     += '<tr><td>'+ elements[key].nombreArticulo +'</td> <td>'+ elements[key].unidades +'</td> <td>'+ elements[key].subtotal +'</td> </tr>';
            sumaTotal   += elements[key].unidades*elements[key].subtotal;
        }

        elements = [];
        imprimirTotalCesta(sumaTotal);
        listaCesta.innerHTML = outHTML;
    }
}

window.onload = startDB;
var conexion = null;
var puto = null;