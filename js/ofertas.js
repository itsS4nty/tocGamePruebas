async function deshacerPromos() {
    var cesta = await db.cesta.toArray();
    var aux = false;
    var aux2 = -1;
    var idsPromocionesToAdd = [];

    for (let i = 0; i < cesta.length; i++) {
        if (cesta[i].promocion != -1) //ELIMINAR POSICIÓN i DE LA CESTA
        {
            idsPromocionesToAdd.push(cesta[i].promocion);
            await db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete();
        }
    }

    /* A estas alturas tengo todas las promociones deshechas y solo falta añadir los artículos */
    var listaArticulos = await db.articulos.toArray();
    var listaPromociones = await db.promociones.toArray();
    var listaCesta = await db.cesta.toArray();

    for (let i = 0; i < idsPromocionesToAdd.length; i++) {
        for (let j = 0; j < listaPromociones.length; j++) {
            if (listaPromociones[j].id == idsPromocionesToAdd[i]) {
                articulosParaAgregar = JSON.parse(listaPromociones[j].articulosNecesarios);

                for (let h = 0; h < articulosParaAgregar.length; h++) {
                    yaExiste = false;

                    for (let k = 0; k < listaCesta.length; k++) {
                        if (listaCesta[k].idArticulo == articulosParaAgregar[h].idArticulo) {
                            yaExiste = true;
                            arrayPrecio = await db.articulos.where("id").equals(listaCesta[k].idArticulo).toArray();
                            await db.cesta.put({ idArticulo: listaCesta[k].idArticulo, nombreArticulo: listaCesta[k].nombreArticulo, unidades: listaCesta[k].unidades + articulosParaAgregar[h].unidadesNecesarias, subtotal: (listaCesta[k].unidades + articulosParaAgregar[h].unidadesNecesarias) * arrayPrecio[0], promocion: -1 });
                            break;
                        }
                    }
                    if (!yaExiste) {
                        arrayPrecio = await db.articulos.where("id").equals(articulosParaAgregar[h].idArticulo).toArray();
                        await db.cesta.put({ idArticulo: articulosParaAgregar[h].idArticulo, nombreArticulo: arrayPrecio[0].nombre, unidades: articulosParaAgregar[h].unidadesNecesarias, subtotal: articulosParaAgregar[h].unidadesNecesarias * arrayPrecio[0].precio, promocion: -1 });
                    }
                }
            }
        }
    }
    actualizarCesta();
}

// function hayPromo(articulosNecesariosEncoded, cesta)
// {
//     //HAY QUE DECODIFICAR EL JSON, Y COMPROBAR SI COINCIDEN TODOS.
//     var articulosNecesarios = JSON.parse(articulosNecesariosEncoded);
//     console.log(articulosNecesarios);
//     var encuentra = false;
//     for(let i = 0; i < articulosNecesarios.length; i++)
//     {
//         encuentra = false;
//         for(let j = 0; j < cesta.length; j++)
//         {
//             if(cesta[j].idArticulo == articulosNecesarios[i].idArticulo)
//             {
//                 if(cesta[j].unidades >= articulosNecesarios[i].unidadesNecesarias)
//                 {
//                     encuentra = true;
//                 }
//             }
//         }
//         if(!encuentra)
//         {
//             return false;
//         }
//     }
//     return true;
// }

async function aplicarPromo(promocionesValidas) {
    var cesta = await db.cesta.toArray();
    var min, pos;
    if (promocionesValidas.length > 0) {
        min = promocionesValidas[0].precioFinal;
    }

    for (let i = 0; i < promocionesValidas.length; i++) {

        /*BUSCAR MÍNIMO*/
        if (min >= promocionesValidas[i].precioFinal) {
            min = promocionesValidas[i].precioFinal;
            pos = i;
        }
        /*FIN BUSCAR MÍNIMO*/
    }

    /*OBTENER UNIDADES EN LA CESTA Y  UNIDADES EN LA PROMOCIÓN*/
    var listaArticulos = JSON.parse(promocionesValidas[pos].articulosNecesarios);
    for (let i = 0; i < listaArticulos.length; i++) {
        for (let j = 0; j < cesta.length; j++) {
            if (listaArticulos[i].idArticulo == cesta[j].idArticulo) {
                if (cesta[j].unidades > listaArticulos[i].unidadesNecesarias) {
                    //PUT CON UNIDADES = UdsCesta-UdsPromocion;
                    articuloAux = await db.articulos.where("id").equals(cesta[j].idArticulo).toArray();
                    await db.cesta.put({
                        idArticulo: cesta[j].idArticulo,
                        nombreArticulo: cesta[j].nombreArticulo,
                        unidades: cesta[j].unidades - listaArticulos[i].unidadesNecesarias,
                        subtotal: (cesta[j].unidades - listaArticulos[i].unidadesNecesarias) * articuloAux[0].precio,
                        promocion: -1
                    });
                }
                else {
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
        subtotal: 1 * promocionesValidas[pos].precioFinal,
        promocion: promocionesValidas[pos].id
    });


}

// async function buscarOfertas()
// {
//         var listaPromociones    = await db.promociones.toArray();
//         var listaArticulos      = await db.articulos.toArray();
//         var promocionesValidas  = [];
//         var salida = 0;

//         deshacerPromos().then(function(){
//             do
//             {
//                 db.cesta.toArray().then(cestaOriginal=>{
//                     promocionesValidas  = [];

//                     for(let i = 0; i < listaPromociones.length; i++)
//                     {
//                         if(hayPromo(listaPromociones[i].articulosNecesarios, cestaOriginal))
//                         {
//                             promocionesValidas.push(listaPromociones[i]);
//                             salida++;
//                         }
//                     }
//                     if(promocionesValidas.length > 0)
//                     {
//                         aplicarPromo(promocionesValidas).then(function(){
//                             notificacion('¡Promoción OK!', 'info');
//                             actualizarCesta().then(function(){
//                                 salida--;
//                             });
//                         });
//                     }
//                 });
//             } while(salida > 0);
//         });
// }
async function buscarOfertas() {
    var promociones = await db.promociones.toArray();
    var listaArticulos = await db.articulos.toArray();
    var promocionesValidas = [];
    var salida = 0;
    var cestaOriginal = null;
    var principales = []; //array de articulos principales donde hay que buscar promos.
    var secundarios = []; //array de articulos secundarios donde hay que buscar promos.

    await deshacerPromos(); //MODIFICAR DESHACERPROMOS PARA QUE DEVUELVA UNA PROMESA. AHORA NO LO HACE.

    do {
        cestaOriginal = await db.cesta.toArray();

        for (let i = 0; i < promociones.length; i++) {
            principales = [];
            secundarios = [];

            if (promociones[i].principal.substring(0, 2) === "F_") {
                /* BUSCO Y CREO ARRAY CON TODOS ESTOS PRODUCTOS DE LA FAMILIA */
                principales = await getArticulosFamilia(promociones[i].principal.substring(2));

            }
            else {
                principales.push({ idArticulo: Number(promociones[i].principal), unidadesNecesarias: promociones[i].cantidadPrincipal });
            }

            if (promociones[i].secundario.substring(0, 2) === "F_") {
                secundarios = await getArticulosFamilia(promociones[i].secundario.substring(2));
            }
            else {
                secundarios.push({ idArticulo: Number(promociones[i].secundario), unidadesNecesarias: promociones[i].cantidadSecundario });
            }
            intentoAplicarPromo(principales, secundarios, cestaOriginal);

        }
        // if(promocionesValidas.length > 0)
        // {
        //     aplicarPromo(promocionesValidas).then(function(){
        //         notificacion('¡Promoción OK!', 'info');
        //         actualizarCesta().then(function(){
        //             salida--;
        //         });
        //     });
        // }
    } while (salida > 0);
}

function intentoAplicarPromo(articulosPrincipales, articulosSecundarios, cesta) {
    for (let i = 0; i < cesta.length; i++) {
        for (let j = 0; j < articulosPrincipales.length; j++) {
            if (articulosPrincipales[j].idArticulo === cesta[i].idArticulo) { //El articulo existe dentro de la cesta
                if (cesta[i].unidades >= articulosPrincipales[j].unidadesNecesarias) { //Parte de la promoción correcta.

                }
            }
        }
    }
}

async function getArticulosFamilia(familia) /* ESTA FUNCIÓN DEBE DEVOLVER UN ARRAY DE ARTICULOS QUE TIENEN ESTA FAMILIA O SON HIJAS, PERO COMO PROMESA!!! OK */ {
    var info = await db.familias.where("nombre").equals(familia).or("padre").equals(familia).toArray();
    let articulos = [];
    let aux = [];
    for (let i = 0; i < info.length; i++) {
        aux = [];
        aux = await db.articulos.where("familia").equals(info[i].nombre).toArray();
        articulos = _.union(articulos, aux);
    }
    return articulos;
}