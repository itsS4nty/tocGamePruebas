function buscarOfertas() //CESTA: idArticulo, nombreArticulo, unidades, subtotal
{
    var cestaOriginal       = await db.cesta.toArray();
    var listaPromociones    = await db.promociones.toArray();
    var listaArticulos      = await db.articulos.toArray();
    var promocionesValidas  = [];

    for(let i = 0; i < listaPromociones.length; i++)
    {
        if(hayPromo(listaPromociones[i].articulosNecesarios, cestaOriginal))
        {
            notificacion('¡Promoción OK!', 'info');
            promocionesValidas.push(listaPromociones[i]);
        }
    }
    if(promocionesValidas.length > 0)
    {
        aplicarPromo(promocionesValidas, listaVisible);
    }
    /*
    db.cesta.toArray(lista =>{

        var listaCestaOriginal = lista;
        if(lista)
        {
            if(lista.length > 0)
            {
                db.promociones.toArray(listaPromociones=>{ //HAY QUE CARGAR TODAS LAS OFERTAS ANTES DEL BUCLE FOR
                    if(listaPromociones)
                    {
                        var promocionesValidas = [];
                        for(let i = 0; i < listaPromociones.length; i++)
                        {
                            if(hayPromo(listaPromociones[i].articulosNecesarios, lista))
                            {
                                notificacion('¡Promoción OK!', 'info');
                                promocionesValidas.push(listaPromociones[i]);
                            }
                        }
                        if(promocionesValidas.length > 0)
                        {
                            //listaVisible = aplicarPromo(promocionesValidas, listaVisible);
                        }
                    }
                    else
                    {
                        console.log("Error al cargar las promociones");
                    }
                });
            }
        }
        else
        {
            alert("Error al cargar la cesta");
        }
    });
    */
}

function hayPromo(articulosNecesariosEncoded, cesta)
{
    //HAY QUE DECODIFICAR EL JSON, Y COMPROBAR SI COINCIDEN TODOS.
    var articulosNecesarios = JSON.parse(articulosNecesariosEncoded);
    var encuentra = false;
    for(let i = 0; i < articulosNecesarios.length; i++)
    {
        encuentra = false;
        for(let j = 0; j < cesta.length; j++)
        {
            if(cesta[j].idArticulo == articulosNecesarios[i].idArticulo)
            {
                if(cesta[j].unidades >= articulosNecesarios[i].unidadesNecesarias)
                {
                    encuentra = true;
                }
            }
        }
        if(!encuentra)
        {
            return false;
        }
    }
    return true;
}

function deshacerPromos(cesta, listaPromociones) /* FUNCIÓN QUE DESHACE LAS PROMOCIONES APLICADAS EN LA CESTA */
{
    for(let i = 0; i < cesta.length; i++)
    {
        if(cesta[i].promocion != -1) //ELIMINAR POSICION i de la cesta.
        {
            let auxIdPromo = cesta[i].promocion;
            cesta.splice(i, 1);
            var articulosParaAgregar = JSON.parse(listaPromociones[auxIdPromo].articulosNecesarios);
            for(let j = 0; j < articulosParaAgregar.length; j++)
            {
                cesta.push({id: articulosParaAgregar, arrayTeclado: teclas})
            }
            
        }
    }
}

function aplicarPromo(promocionesValidas, listaVisible) //HAY QUE REESCRIBIR EL CÓDIGO COMPLETAMENTE PERO EL MISMO FUNCIONAMIENTO Y CON AWAIT.
{
    //HAY QUE MODIFICAR EL PRECIO FINAL Y LA CESTA VISIBLE (CREAR DOS CESTAS, LA ORIGINAL Y LA VISIBLE)
    var articulosNecesarios = promocionesValidas[0].articulosNecesarios;
    for(let i = 0; i < articulosNecesarios.length; i++)
    {
       for(let j = 0; j < listaVisible.length; j++)
       {
            if(articulosNecesarios[i].idArticulo == listaVisible[j].idArticulo)
            {
                if(listaVisible[j].unidades-articulosNecesarios[i].unidadesNecesarias == 0)
                {
                    db.cestaVisible.where("idArticulo")
                        .equals(listaVisible[j].idArticulo)
                        .delete();
                }
                else
                {
                    db.cestaVisible.put({idArticulo: listaVisible[j].idArticulo, nombreArticulo: listaVisible[j].nombreArticulo, unidades: listaVisible[j].unidades - articulosNecesarios[i].unidadesNecesarias, subtotal: listaVisible[j].subtotal}).then(function(){
                        db.cestaVisible.put({idArticulo: promocionesValidas[0].id, nombreArticulo: promocionesValidas[0].nombre, unidades: 1, subtotal: promocionesValidas[0].precioFinal}).then(function(){
                        
                        });
                    });
                }
            }
       }
    }
}