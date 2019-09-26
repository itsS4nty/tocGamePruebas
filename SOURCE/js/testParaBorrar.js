function deshacerPromos()
{
    var devolver = new Promise(function(dev, rej){
        db.cesta.toArray().then(cesta=>{
            var aux                 = false;
            var aux2                = -1;
            var promosBorradas      = [];
            var nBorradas           = 0;
            var todasFinalizadas;
            var idsPromocionesToAdd    = [];
            for(let i = 0; i < cesta.length; i++)
            {
                if(cesta[i].promocion != -1) //ELIMINAR POSICIÓN i DE LA CESTA
                {
                    nBorradas++;
                    idPromo = cesta[i].promocion; //TENGO EL id DE LA PROMO
                    promosBorradas.push(false);
                    idsPromocionesToAdd.push(cesta[i].promocion);
                    db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete().then(function(){
                        console.log("Promoción deshecha");
                        promosBorradas[nBorradas] = true;
                    });
                }
            }
            do
            {
                todasFinalizadas = true;
                for(let i = 0; i < promosBorradas.length; i++)
                {
                    if(!promosBorradas[i])
                    {
                        todasFinalizadas = false;
                        break;
                    }
                }
            } while(!todasFinalizadas);
            /* A estas alturas tengo todas las promociones deshechas y solo falta añadir los artículos */
            var articulosAgregados  = [];
            var nArticulosAgregados = 0;
            db.articulos.toArray().then(listaArticulos=>{
                if(listaArticulos)
                {
                    db.promociones.toArray().then(listaPromociones=>{
                        if(listaPromociones)
                        {
                            db.cesta.toArray().then(listaCesta=>{
                                if(listaCesta)
                                {
                                    for(let i = 0; i < idsPromocionesToAdd.length; i++)
                                    {
                                        for(let j = 0; j < listaPromociones; j++)
                                        {
                                            if(listaPromociones[j].id == idsPromocionesToAdd[i])
                                            {
                                                let articulosParaAgregar = JSON.parse(listaPromociones[j].articulosNecesarios);
                                                
                                                for(let h = 0; h < articulosParaAgregar.length; h++)
                                                {
                                                    yaExiste = false;
                                                    articulosAgregados.push(false);

                                                    for(let k = 0; k < listaCesta.length; k++)
                                                    {
                                                        if(listaCesta[k].idArticulo == articulosParaAgregar[h].id)
                                                        {
                                                            yaExiste = true;
                                                            db.articulos.where("idArticulo").equals(listaCesta[k].idArticulo).toArray().then(arrayPrecio=>{
                                                                db.cesta.put({idArticulo: listaCesta[k].idArticulo, nombreArticulo: listaCesta[k].nombreArticulo, unidades: listaCesta[k].unidades+articulosParaAgregar[h].unidadesNecesarias, subtotal: (listaCesta[k].unidades+articulosParaAgregar[h].unidadesNecesarias)*arrayPrecio[0], promocion: -1}).then(function(){
                                                                    articulosAgregados[nArticulosAgregados] = true;
                                                                });
                                                            });
                                                            break;                              
                                                        }        
                                                    }
                                                    if(!yaExiste)
                                                    {
                                                        db.articulos.where("idArticulo").equals(articulosParaAgregar[h].id).toArray().then(arrayPrecio=>{
                                                            db.cesta.put({idArticulo: articulosParaAgregar[h].id, nombreArticulo: arrayPrecio[0].nombre, unidades: articulosParaAgregar[h].unidadesNecesarias, subtotal: articulosParaAgregar[h].unidadesNecesarias*arrayPrecio[0].precio, promocion: -1}).then(function(){
                                                                articulosAgregados[nArticulosAgregados] = true;
                                                            });
                                                        });
                                                    }
                                                    nArticulosAgregados++;
                                                }
                                                do
                                                {
                                                    todasFinalizadas = true;
                                                    for(let i = 0; i < articulosAgregados.length; i++)
                                                    {
                                                        if(!articulosAgregados[i])
                                                        {
                                                            todasFinalizadas = false;
                                                            break;
                                                        }
                                                    }
                                                } while(!todasFinalizadas);
                                                dev(10);
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    notificacion('Error al cargar listaCesta en deshacerPromos()', 'error');
                                }
                            });
                        }
                        else
                        {
                            notificacion('Error al cargar las promociones deshacerPromos()', 'error');
                        }
                    });
                }
                else
                {
                    notificacion('Error al cargar los artículos deshacerPromo()', 'error');
                }
            });
        });
    });
    return devolver;
}


/*
function buscarOfertas() //DEBE DEVOLVER LA PROMESA DE LA CESTA NUEVA
{
    var devolver = new Promise(function(dev, rej){
        db.promociones.toArray().then(listaPromociones=>{
            if(listaPromociones)
            {
                db.cesta.toArray().then(listaCesta=>{
                    if(listaCesta)
                    {
                        db.articulos.toArray().then(listaArticulos=>{
                            if(listaArticulos)
                            {
                                /*DISPONIBLE: listaArticulos, listaCesta, listaPromociones*/
                                var promocionesValidas  = [];
                                var sigoBuscando        = false;

                                var promesaDeshacerPromos = deshacerPromos();
                                promesaDeshacerPromos.then(function(res){
                                    if(res == 10)
                                    {
                                        /* A estas alturas, ya están deshechas las promociones y a la espera de buscar las nuevas */
                                    }
                                    else
                                    {
                                        notificacion('Error al cargar la promesa de deshacerPromos', 'error');
                                    }
                                });

                            }
                            else
                            {
                                notificacion('Error al cargar los artículos', 'error');
                            }
                        });
                    }
                    else
                    {
                        notificacion('Error al cargar la cesta', 'error');
                    }
                });
            }
            else
            {
                notificacion('Error al cargar las promociones', 'error');
            }
        });







        /*var listaPromociones    = await db.promociones.toArray();
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
                    promocionesValidas.push(listaPromociones[i]);
                }
            }
            if(promocionesValidas.length > 0)
            {
                aplicarPromo(promocionesValidas, cestaOriginal);
                notificacion('¡Promoción OK!', 'info');
                sigoBuscando = true;
            }
            else
            {
                sigoBuscando = false;
            }
        } while(sigoBuscando);
    });*/
    return devolver;
    }
}
/*async function buscarOfertas2()
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
                promocionesValidas.push(listaPromociones[i]);
            }
        }
        if(promocionesValidas.length > 0)
        {
            aplicarPromo(promocionesValidas, cestaOriginal);
            notificacion('¡Promoción OK!', 'info');
            sigoBuscando = true;
        }
        else
        {
            sigoBuscando = false;
        }
    } while(sigoBuscando);
}*/

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
    var aux2    = -1;
    for(let i = 0; i < cesta.length; i++)
    {
        if(cesta[i].promocion != -1) //ELIMINAR POSICION i de la cesta.
        {
            auxIdPromo = cesta[i].promocion; //TENGO EL id DE LA PROMO
            await db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete(); //RECUERDA QUE LAS PROMOS TIENEN UN ID ESPECIAL PARA PODER MEZCLARSE

            for(let z = 0; z < listaPromociones.length; z++)
            {
                if(listaPromociones[z].id == auxIdPromo)
                {
                    aux2 = z;
                    break;
                }
            }
            var articulosParaAgregar = JSON.parse(listaPromociones[aux2].articulosNecesarios);
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
                        db.cesta.put({id: cesta[k].idArticulo, nombreArticulo: cesta[k].nombreArticulo, unidades: cesta[k].unidades+articulosParaAgregar[j].unidades, subtotal: preuSubTotal, promocion: -1});
                        break;
                    }
                }
                if(!aux)
                {
                    let preu = await db.articulos.where("id").equals(articulosParaAgregar[j].idArticulo).toArray();
                    let preuSubTotal = preu[0].precio * articulosParaAgregar[j].unidades;

                    db.cesta.put({id: articulosParaAgregar[j].idArticulo, nombreArticulo: preu[0].nombre, unidades: articulosParaAgregar[j].unidades, subtotal: preuSubTotal, promocion: -1});
                }                
            }
        }
    }
}

async function aplicarPromo(promocionesValidas, cesta) //HAY QUE REESCRIBIR EL CÓDIGO COMPLETAMENTE PERO EL MISMO FUNCIONAMIENTO Y CON AWAIT.
{
    //HAY QUE MODIFICAR EL PRECIO FINAL Y LA CESTA VISIBLE (CREAR DOS CESTAS, LA ORIGINAL Y LA VISIBLE)--> if(unidadesCesta > unidadesPromocion) then put -> mismo id, unidades = unidadesCesta-unidadesPromo
    //else -> delete id de la cesta.
    var min;
    var pos;
    if(promocionesValidas.length > 0)
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
                    articuloAux = await db.articulos.where("idArticulo").equals(cesta[j].idArticulo).toArray();
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
    ofertasEnCesta = await db.cesta.where("idArticulo").equals(promocionesValidas[pos].id).toArray();
    if(ofertasEnCesta.length > 0)
    {
        await db.cesta.put({
            idArticulo: promocionesValidas[pos].id,
            nombreArticulo: promocionesValidas[pos].nombre,
            unidades: ofertasEnCesta[0].unidades + 1,
            subtotal: (ofertasEnCesta[0].unidades+1)*promocionesValidas[pos].precioFinal,
            promocion: promocionesValidas[pos].id
        });
    }
    else
    {
        await db.cesta.put({
            idArticulo: promocionesValidas[pos].id,
            nombreArticulo: promocionesValidas[pos].nombre,
            unidades: 1,
            subtotal: 1*promocionesValidas[pos].precioFinal,
            promocion: promocionesValidas[pos].id
        });
    }
  
}