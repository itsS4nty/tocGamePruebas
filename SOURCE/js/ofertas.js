<<<<<<< HEAD
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
=======
async function deshacerPromos()
{
    var cesta = await db.cesta.toArray();
    var aux                     = false;
    var aux2                    = -1;
    var idsPromocionesToAdd    = [];
>>>>>>> 4c3d2a0010135ffd28563b349ce37a3287be4289

    for(let i = 0; i < cesta.length; i++)
    {
        if(cesta[i].promocion != -1) //ELIMINAR POSICIÓN i DE LA CESTA
        {
            idsPromocionesToAdd.push(cesta[i].promocion);
            await db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete();
        }
    }

    /* A estas alturas tengo todas las promociones deshechas y solo falta añadir los artículos */
    var listaArticulos      = await db.articulos.toArray();
    var listaPromociones    = await db.promociones.toArray();
    var listaCesta          = await db.cesta.toArray();

    for(let i = 0; i < idsPromocionesToAdd.length; i++)
    {
        for(let j = 0; j < listaPromociones.length; j++)
        {
            if(listaPromociones[j].id == idsPromocionesToAdd[i])
            {
<<<<<<< HEAD
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
=======
                articulosParaAgregar = JSON.parse(listaPromociones[j].articulosNecesarios);

                for(let h = 0; h < articulosParaAgregar.length; h++)
                {
                    yaExiste = false;

                    for(let k = 0; k < listaCesta.length; k++)
                    {
                        if(listaCesta[k].idArticulo == articulosParaAgregar[h].idArticulo)
                        {
                            yaExiste = true;
                            arrayPrecio = await db.articulos.where("id").equals(listaCesta[k].idArticulo).toArray();
                            await db.cesta.put({idArticulo: listaCesta[k].idArticulo, nombreArticulo: listaCesta[k].nombreArticulo, unidades: listaCesta[k].unidades+articulosParaAgregar[h].unidadesNecesarias, subtotal: (listaCesta[k].unidades+articulosParaAgregar[h].unidadesNecesarias)*arrayPrecio[0], promocion: -1});
                            break;                              
                        }        
                    }
                    if(!yaExiste)
                    {
                        arrayPrecio = await db.articulos.where("id").equals(articulosParaAgregar[h].idArticulo).toArray();
                        await db.cesta.put({idArticulo: articulosParaAgregar[h].idArticulo, nombreArticulo: arrayPrecio[0].nombre, unidades: articulosParaAgregar[h].unidadesNecesarias, subtotal: articulosParaAgregar[h].unidadesNecesarias*arrayPrecio[0].precio, promocion: -1});
                    }
                }
            }
        }
    }
>>>>>>> 4c3d2a0010135ffd28563b349ce37a3287be4289
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

<<<<<<< HEAD
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
=======
async function aplicarPromo(promocionesValidas)
{
    var cesta = await db.cesta.toArray();
    var min, pos;
    if(promocionesValidas.length > 0)
>>>>>>> 4c3d2a0010135ffd28563b349ce37a3287be4289
    {
        min = promocionesValidas[0].precioFinal;
    }

    for(let i = 0; i < promocionesValidas.length; i++)
    {

        /*BUSCAR MÍNIMO*/
        if(min >= promocionesValidas[i].precioFinal)
        {
            min = promocionesValidas[i].precioFinal;
            pos = i;
        }
        /*FIN BUSCAR MÍNIMO*/
    }

    /*OBTENER UNIDADES EN LA CESTA Y  UNIDADES EN LA PROMOCIÓN*/
    var listaArticulos = JSON.parse(promocionesValidas[pos].articulosNecesarios);
    for(let i = 0; i < listaArticulos.length; i++)
    {
        for(let j = 0; j < cesta.length; j++)
        {
            if(listaArticulos[i].idArticulo == cesta[j].idArticulo)
            {
                if(cesta[j].unidades > listaArticulos[i].unidadesNecesarias)
                {
                    //PUT CON UNIDADES = UdsCesta-UdsPromocion;
                    articuloAux = await db.articulos.where("id").equals(cesta[j].idArticulo).toArray();
                    await db.cesta.put({
                        idArticulo: cesta[j].idArticulo,
                        nombreArticulo: cesta[j].nombreArticulo,
                        unidades: cesta[j].unidades-listaArticulos[i].unidadesNecesarias,
                        subtotal: (cesta[j].unidades-listaArticulos[i].unidadesNecesarias)*articuloAux[0].precio,
                        promocion: -1
                        });
                }
                else
                {
                    //DELETE ID EN LA CESTA.
                    await db.cesta.where("idArticulo").equals(cesta[j].idArticulo).delete();
                }
            }
        }
    }

    await db.cesta.put({
        idArticulo: promocionesValidas[pos].id,
        nombreArticulo: promocionesValidas[pos].nombre,
        unidades: 1,
        subtotal: 1*promocionesValidas[pos].precioFinal,
        promocion: promocionesValidas[pos].id
    });

  
}

async function buscarOfertas()
{
        deshacerPromos();
        var listaPromociones    = await db.promociones.toArray();
        var listaArticulos      = await db.articulos.toArray();
        var promocionesValidas  = [];
        var salida = 0;
        do 
        {
            promocionesValidas  = [];
            cestaOriginal = await db.cesta.toArray();

            for(let i = 0; i < listaPromociones.length; i++)
            {
                if(hayPromo(listaPromociones[i].articulosNecesarios, cestaOriginal))
                {
                    promocionesValidas.push(listaPromociones[i]);
                    salida++;
                }
            }
            if(promocionesValidas.length > 0)
            {
                aplicarPromo(promocionesValidas);
                notificacion('¡Promoción OK!', 'info');
                actualizarCesta().then(function(){
                    salida--;
                });
            }
        } while(salida > 0);
}
