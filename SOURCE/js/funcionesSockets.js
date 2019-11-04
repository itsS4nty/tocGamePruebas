function cargarTecladoSockets(teclas)
{
    //1 - Limpiar teclado.
    db.teclado.clear().then(function(){

    });
    db.submenus.put({id: 0, idPadre: 0, nombre: "0 Cafeteria", idTeclado: 0, color: "FFFFF"});
}