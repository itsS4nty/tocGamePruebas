'use strict'

function agregarArticulo(id)
{
     var conexion = indexedDB.open("toc");
     conexion.onsuccess = e => {
        bd = e.target.result;
     }

     conexion.onupgradeneeded = e =>{
         bd.createObjectStore("cesta", {keyPath: 'idArticulo'});
     }
}