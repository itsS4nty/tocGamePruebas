const OFERTA_INDIVIDUAL = 1;
const OFERTA_COMBO = 2;
const ACCION_NADA = 0;
const ACCION_RESTAR = 1;
const ACCION_ELIMINAR = 2;

// async function deshacerPromos() {
//     var cesta = await db.cesta.toArray();
//     var aux = false;
//     var aux2 = -1;
//     var idsPromocionesToAdd = [];

//     for (let i = 0; i < cesta.length; i++) {
//         if (cesta[i].promocion != -1) //ELIMINAR POSICIÓN i DE LA CESTA
//         {
//             idsPromocionesToAdd.push(cesta[i].promocion);
//             await db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete();
//         }
//     }

//     /* A estas alturas tengo todas las promociones deshechas y solo falta añadir los artículos */
//     var listaArticulos = await db.articulos.toArray();
//     var listaPromociones = await db.promociones.toArray();
//     var listaCesta = await db.cesta.toArray();

//     for (let i = 0; i < idsPromocionesToAdd.length; i++) {
//         for (let j = 0; j < listaPromociones.length; j++) {
//             if (listaPromociones[j].id == idsPromocionesToAdd[i]) {
//                 articulosParaAgregar = JSON.parse(listaPromociones[j].articulosNecesarios);

//                 for (let h = 0; h < articulosParaAgregar.length; h++) {
//                     yaExiste = false;

//                     for (let k = 0; k < listaCesta.length; k++) {
//                         if (listaCesta[k].idArticulo == articulosParaAgregar[h].idArticulo) {
//                             yaExiste = true;
//                             arrayPrecio = await db.articulos.where("id").equals(listaCesta[k].idArticulo).toArray();
//                             await db.cesta.put({ idArticulo: listaCesta[k].idArticulo, nombreArticulo: listaCesta[k].nombreArticulo, unidades: listaCesta[k].unidades + articulosParaAgregar[h].unidadesNecesarias, subtotal: (listaCesta[k].unidades + articulosParaAgregar[h].unidadesNecesarias) * arrayPrecio[0], promocion: -1 });
//                             break;
//                         }
//                     }
//                     if (!yaExiste) {
//                         arrayPrecio = await db.articulos.where("id").equals(articulosParaAgregar[h].idArticulo).toArray();
//                         await db.cesta.put({ idArticulo: articulosParaAgregar[h].idArticulo, nombreArticulo: arrayPrecio[0].nombre, unidades: articulosParaAgregar[h].unidadesNecesarias, subtotal: articulosParaAgregar[h].unidadesNecesarias * arrayPrecio[0].precio, promocion: -1 });
//                     }
//                 }
//             }
//         }
//     }
//     actualizarCesta();
// }

async function buscarOfertas() {
    var promociones = await db.promociones.toArray();
    var listaArticulos = await db.articulos.toArray();
    var promocionesValidas = [];
    var salida = 0;
    var cestaOriginal = null;
    var principales = []; //array de articulos principales donde hay que buscar promos.
    var secundarios = []; //array de articulos secundarios donde hay que buscar promos.

    //await deshacerPromos(); //MODIFICAR DESHACERPROMOS PARA QUE DEVUELVA UNA PROMESA. AHORA NO LO HACE.

    for (let i = 0; i < promociones.length; i++) {
        cestaOriginal = await db.cesta.toArray();
        principales = [];
        secundarios = [];
        if (promociones[i].secundario === "-1") {
            tipoOferta = OFERTA_INDIVIDUAL
        }
        else {
            tipoOferta = OFERTA_COMBO;
        }

        if (promociones[i].principal.substring(0, 2) === "F_") {
            /* BUSCO Y CREO ARRAY CON TODOS ESTOS PRODUCTOS DE LA FAMILIA */
            principales = await getArticulosFamilia(promociones[i].principal.substring(2));

        }
        else {
            principales = await db.articulos.where('id').equals(Number(promociones[i].principal)).toArray();
        }

        if (promociones[i].secundario.substring(0, 2) === "F_") {
            secundarios = await getArticulosFamilia(promociones[i].secundario.substring(2));
        }
        else {
            secundarios = await db.articulos.where('id').equals(Number(promociones[i].secundario)).toArray();
        }
        if (cestaOriginal.length > 1 || tipoOferta === OFERTA_INDIVIDUAL) {
            intentoAplicarPromo(promociones[i], principales, secundarios, cestaOriginal, promociones[i].cantidadPrincipal, promociones[i].cantidadSecundario, tipoOferta);
        }
    }
}

function intentoAplicarPromo(infoPromo, articulosPrincipales, articulosSecundarios, cesta, cantidadPrincipal, cantidadSecundario, tipoOferta) {

    principalAux = false;
    secundariaAux = false;

    for (let i = 0; i < cesta.length; i++) {
        iPrincipal = 0;
        iSecundaria = 0;

        if (tipoOferta === OFERTA_COMBO) {
            posEnCestaPrincipal = 0;
            posEnCestaSecundaria = 0;

            // while ((!principalAux || !secundariaAux) && (iPrincipal < articulosPrincipales.length || iSecundaria < articulosSecundarios.length)) {
            //     if (iPrincipal < articulosPrincipales.length) {
            //         if (articulosPrincipales[iPrincipal].id === cesta[i].idArticulo) //El artículo existe dentro de la cesta.
            //         {
            //             if (cesta[i].unidades >= cantidadPrincipal) { //El artículo contiene la cantidad necesaria para la promo
            //                 posEnCestaPrincipal = i;
            //                 principalAux = true;
            //             }
            //         }
            //     }
            //     if (iSecundaria < articulosSecundarios.length) {
            //         if (articulosSecundarios[iSecundaria].id === cesta[i].idArticulo) { //El artículo existe dentro de la cesta.
            //             if (cesta[i].unidades >= cantidadSecundario) { //El artículo contiene la cantidad necesaria para la promo
            //                 posEnCestaSecundaria = i;
            //                 console.log("posEnCestaSecundaria: " + posEnCestaSecundaria + " con i=" + i);
            //                 if (i === 1) {
            //                     console.log("articulosSecundarios[iSecundaria].id = cesta[i].idArticulo = " + articulosSecundarios[iSecundaria].id);
            //                     console.log("cesta[i].unidades = " + cesta[i].unidades);
            //                     console.log("cantidadSecundario = " + cantidadSecundario);
            //                 }
            //                 secundariaAux = true;
            //             }
            //         }
            //     }
            //     iPrincipal++;
            //     iSecundaria++;
            // }
            for (let m = 0; m < articulosPrincipales.length; m++) {
                if (articulosPrincipales[m].id === cesta[i].idArticulo) {
                    if (cesta[i].unidades >= cantidadPrincipal) //El artículo contiene la cantidad necesaria para la promo.
                    {
                        posEnCestaPrincipal = i;
                        principalAux = true;
                        break;
                    }
                }
            }
            for (let m = 0; m < articulosSecundarios.length; m++) {
                if (articulosSecundarios[m].id === cesta[i].idArticulo) {
                    if (cesta[i].unidades >= cantidadSecundario) //El artículo contiene la cantidad necesaria para la promo.
                    {
                        posEnCestaSecundaria = i;
                        secundariaAux = true;
                        break;
                    }
                }
            }
            if (principalAux && secundariaAux) // Si hay de los dos
            {
                break;
            }
        }
        else {
            if (tipoOferta === OFERTA_INDIVIDUAL) {
                cumpleOferta = false;

                for (let j = 0; j < articulosPrincipales.length; j++) {
                    if (cesta[i].idArticulo === articulosPrincipales[j].id) //El artículo existe dentro de la cesta.
                    {
                        if (cesta[i].unidades >= cantidadPrincipal) // Se puede aplicar la oferta.
                        {
                            cumpleOferta = true;
                            unidadesOferta = parseInt(cesta[i].unidades / cantidadPrincipal);
                            cesta[i].unidades -= unidadesOferta * cantidadPrincipal;
                            if (cesta[i].unidades <= 0) {
                                cesta.splice(i, 1);
                            }
                            break;
                        }
                    }
                }
                if (cumpleOferta) {
                    cesta = insertarOferta(cesta, infoPromo, unidadesOferta, tipoOferta);
                    insertarCestaCompleta(cesta);
                    break;
                }
            }
        }
    }
    if (principalAux && secundariaAux) // Si hay de los dos
    {
        if (cesta[posEnCestaPrincipal].unidades / cantidadPrincipal >= 2) {
            unidadesOfertaPrincipal = parseInt(cesta[posEnCestaPrincipal].unidades / cantidadPrincipal);
        }
        else {
            unidadesOfertaPrincipal = 1;
        }

        if (cesta[posEnCestaSecundaria].unidades / cantidadSecundario >= 2) {
            unidadesOfertaSecundario = parseInt(cesta[posEnCestaSecundaria].unidades / cantidadSecundario);
        }
        else {
            unidadesOfertaSecundario = 1;
        }

        unidadesOferta = Math.min(unidadesOfertaPrincipal, unidadesOfertaSecundario);
        if (cesta[posEnCestaPrincipal].unidades === cantidadPrincipal * unidadesOferta) {
            cesta.splice(posEnCestaPrincipal, 1);
        }
        else {
            if (cesta[posEnCestaPrincipal].unidades > cantidadPrincipal * unidadesOferta) {
                cesta[posEnCestaPrincipal].unidades -= (cantidadPrincipal * unidadesOferta);
            }
        }
        //---
        try {
            console.log("----")
            console.log("indice: ", posEnCestaSecundaria, "cesta: ", cesta, " cesta[posEnCestaSecundaria].unidades: ", cesta[posEnCestaSecundaria].unidades);
            console.log("----")
            if (cesta[posEnCestaSecundaria].unidades === cantidadSecundario * unidadesOferta) {
                cesta.splice(posEnCestaSecundaria, 1);
            }
            else {
                if (cesta[posEnCestaSecundaria].unidades > cantidadSecundario * unidadesOferta) {
                    cesta[posEnCestaSecundaria].unidades -= (cantidadSecundario * unidadesOferta);
                }
            }
        }
        catch (error) {
            console.log(error);
        }

        cesta = insertarOferta(cesta, infoPromo, unidadesOferta, tipoOferta);
        insertarCestaCompleta(cesta);
    }
}

function insertarOferta(cesta, promocion, unidades, tipoOferta) {
    var nombre = '';
    var posExiste = yaExiste(cesta, promocion.id);

    if (tipoOferta === OFERTA_COMBO) {
        nombre = 'Oferta Combo';
    }
    else {
        if (tipoOferta === OFERTA_INDIVIDUAL) {
            nombre = 'Oferta individual';
        }
    }
    if (posExiste !== -1) {
        total1 = cesta[posExiste].subtotal + (unidades * promocion.precioFinal * promocion.cantidadPrincipal);
        total2 = cesta[posExiste].subtotal + (unidades * promocion.precioFinal);
        cesta[posExiste].unidades += unidades;
        if (tipoOferta === OFERTA_INDIVIDUAL) {
            cesta[posExiste].subtotal = redondearPrecio(total1);
        }
        else {
            if (tipoOferta === OFERTA_COMBO) {
                cesta[posExiste].subtotal = redondearPrecio(total2);
            }
        }
    }
    else {
        if (tipoOferta === OFERTA_COMBO) {
            datos = {
                idArticulo: promocion.id,
                nombreArticulo: nombre,
                unidades: unidades,
                subtotal: redondearPrecio(promocion.precioFinal * unidades),
                promocion: 1,
                activo: 0
            };
        }
        else {
            if (tipoOferta === OFERTA_INDIVIDUAL) {
                datos = {
                    idArticulo: promocion.id,
                    nombreArticulo: nombre,
                    unidades: unidades,
                    subtotal: redondearPrecio(promocion.precioFinal * unidades * promocion.cantidadPrincipal),
                    promocion: 1,
                    activo: 0
                };
            }
        }

        cesta.push(datos);
    }

    return cesta;
}
function yaExiste(cesta, id) {
    for (let i = 0; i < cesta.length; i++) {
        if (cesta[i].idArticulo === id) {
            return i;
        }
    }
    return -1;
}
function insertarCestaCompleta(cesta) {
    db.cesta.clear().then(function () {
        db.cesta.bulkPut(cesta).then(function (lastKey) {

        }).catch(Dexie.BulkError, function (e) {
            console.error("Error al insertarCestaCompleta");
            notificacion('Error al insertarCestaCompleta()', 'error');
        });
    }).catch(err => {
        console.log(err);
        notificacion('Error al borrar cesta', 'error');
    });
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