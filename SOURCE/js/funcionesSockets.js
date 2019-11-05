function cargarTecladoSockets(arraySubmenus, arrayTeclas, arrayArticulos)
{
    //1 - Limpiar teclado.
    clearKeyboard().then(function(res){
        var submenus        = [];
        var arrayTeclado    = [];
        var tablaTeclado    = [];
        var articulos       = [];
        for(let i = 0; i < arraySubmenus.length; i++)
        {
            submenus.push({id: i, idPadre: 0, nombre: arraySubmenus[i].nomMenu, idTeclado: i, color: arraySubmenus[i].color});
        }
        db.submenus.bulkPut(submenus).then(function(lastKey) {
            console.log("Submenus insertados!");
            for(let i = 0; i < submenus.length; i++)
            {
                arrayTeclado = [];
                for(let j = 0; j < arrayTeclas.length; j++)
                {
                    if(submenus[i].nombre == arrayTeclas[j].nomMenu)
                    {
                        arrayTeclado.push({id: arrayTeclas[j].idArticle, posicion: (arrayTeclas[j].pos+1)});
                    }
                }
                tablaTeclado.push({id: i, arrayTeclado: arrayTeclado});
            }
            db.teclado.bulkPut(tablaTeclado).then(jeje=>{
                for(let i = 0; i < arrayArticulos.length; i++)
                {
                    articulos.push({id: arrayArticulos[i].id, nombre: arrayArticulos[i].nombre, precio: arrayArticulos[i].precioConIva, iva: conversorIva(arrayArticulos[i].tipoIva)});
                }
                db.articulos.bulkPut(articulos).then(function(lastKey) {
                    console.log("Teclado finalizado!");
                    iniciarToc();
                }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Error al insertar articulos");
                });
            }).catch(Dexie.BulkError, function (e){
                console.log("Error: Fallo al crear el teaclado 789");
                notificacion('Error: Fallo al crear el teaclado 789', 'error');
            });
        }).catch(Dexie.BulkError, function (e) {
            console.error("Error: Fallo al insertar los submenús");
            notificacion('Error: Fallo al insertar los submenús', 'error');
        });
    });
    //db.submenus.put({id: 0, idPadre: 0, nombre: "0 Cafeteria", idTeclado: 0, color: "FFFFF"});
}

function clearKeyboard()
{
    var devolver = new Promise((dev, rej)=>{
        db.teclado.clear().then(function(){
            db.submenus.clear().then(function(){
                db.articulos.clear().then(function(){
                    dev(1);
                }).catch(err=>{
                    dev(0);
                });
            }).catch(error=>{
                console.log(err);
                dev(0);
            });        
        }).catch(error=>{
            console.log(err);
            dev(0);
        });
    });
    return devolver;
}