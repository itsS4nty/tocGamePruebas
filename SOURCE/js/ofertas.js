async function buscarOfertas() //CESTA: idArticulo, nombreArticulo, unidades, subtotal
{
    var listaPromociones    = await db.promociones.toArray();
    deshacerPromos(listaPromociones);
    var cestaOriginal       = await db.cesta.toArray();
    var listaArticulos      = await db.articulos.toArray();
    var promocionesValidas  = [];
    var sigoBuscando        = false;
    do {
        promocionesValidas  = [];
        if(sigoBuscando)
        {
            cestaOriginal = await db.cesta.toArray();
        }

        for(let i = 0; i < listaPromociones.length; i++)
        {
            if(hayPromo(listaPromociones[i].articulosNecesarios, cestaOriginal))
            {
                //notificacion('¡Promoción OK!', 'info');
                promocionesValidas.push(listaPromociones[i]);
            }
        }
        if(promocionesValidas.length > 0)
        {
            aplicarPromo(promocionesValidas);
            sigoBuscando = true;
        }
        else
        {
            sigoBuscando = false;
        }
    } while(sigoBuscando);
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

async function deshacerPromos(listaPromociones) /* FUNCIÓN QUE DESHACE LAS PROMOCIONES APLICADAS EN LA CESTA */
{
    var cesta   = await db.cesta.toArray();
    var aux     = false;
    for(let i = 0; i < cesta.length; i++)
    {
        if(cesta[i].promocion != -1) //ELIMINAR POSICION i de la cesta.
        {
            let auxIdPromo = cesta[i].promocion;
            //BORRAR cesta.splice(i, 1);
            await db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete(); //RECUERDA QUE LAS PROMOS TIENEN UN ID ESPECIAL PARA PODER MEZCLAR

            var articulosParaAgregar = JSON.parse(listaPromociones[auxIdPromo].articulosNecesarios);
            for(let j = 0; j < articulosParaAgregar.length; j++)
            {
                aux = false;
                for(let k = 0; k < cesta.length; k++)
                {
                    if(articulosParaAgregar[j].idArticulo == cesta[k].idArticulo)
                    {
                        aux = true;
                        let preu = await db.articulos.where("id").equals(cesta[k].idArticulo).toArray();
                        let preuSubTotal = preu[0].precio * cesta[k].unidades+articulosParaAgregar[j].unidades;
                        await db.cesta.put({id: cesta[k].idArticulo, nombreArticulo: cesta[k].nombreArticulo, unidades: cesta[k].unidades+articulosParaAgregar[j].unidades, subtotal: preuSubTotal, promocion: -1})
                        break;
                    }
                }
                if(!aux)
                {
                    let preu = await db.articulos.where("id").equals(articulosParaAgregar[j].idArticulo).toArray();
                    let preuSubTotal = preu[0].precio * articulosParaAgregar[j].unidades;

                    await db.cesta.put({id: articulosParaAgregar[j].idArticulo, nombreArticulo: cesta[k].nombreArticulo, unidades: articulosParaAgregar[j].unidades, subtotal: preuSubTotal, promocion: -1})
                }                
            }
        }
    }
}

function aplicarPromo(promocionesValidas, cesta) //HAY QUE REESCRIBIR EL CÓDIGO COMPLETAMENTE PERO EL MISMO FUNCIONAMIENTO Y CON AWAIT.
{
    //HAY QUE MODIFICAR EL PRECIO FINAL Y LA CESTA VISIBLE (CREAR DOS CESTAS, LA ORIGINAL Y LA VISIBLE)--> if(unidadesCesta > unidadesPromocion) then put -> mismo id, unidades = unidadesCesta-unidadesPromo
    //else -> delete id de la cesta.
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