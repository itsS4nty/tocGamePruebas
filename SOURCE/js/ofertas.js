function buscarOfertas() //CESTA: idArticulo, nombreArticulo, unidades, subtotal
{
    db.cesta.toArray(lista =>{
        var listaCestaOriginal = lista;
        if(lista)
        {
            if(lista.length > 0)
            {
                db.ofertasUnidades.toArray(listaOfertasUnidades=>{ //HAY QUE CARGAR TODAS LAS OFERTAS ANTES DEL BUCLE FOR
                    if(listaOfertasUnidades)
                    {
                        for(let i = 0; i < lista.length; i++) //RECORRO CESTA ORIGINAL
                        {
                            for(let j = 0; j < listaOfertasUnidades.length; j++)
                            {
                                if(lista[i].idArticulo == listaOfertasUnidades[j].idArticulo) //HAY OFERTA DE ESTE PRODUCTO
                                {
                                    if(lista[i].unidades == listaOfertasUnidades[j].unidadesNecesarias) //HAY UNIDADES PARA APLICAR LA OFERTA
                                    {

                                    }
                                    else
                                    {
                                        if(lista[i].unidades > listaOfertasUnidades[j].unidadesNecesarias)
                                        {
                                            let sobran = lista[i].unidades - listaOfertasUnidades[j].unidadesNecesarias;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        console.log("Error al cargar ofertasUnidades");
                    }
                });
            }
        }
        else
        {
            alert("Error al imprimir la lista");
        }
    });
}

function aplicarOfertaUnidades(listaCesta, ofertaUnidades, posI, sobran)
{
    var idArticulo  = listaCesta[posI].idArticulo;
    var nombre      = listaCesta[posI].nombreArticulo;

    listaCesta[posI] = {idArticulo: -1, nombreArticulo: ofertaUnidades.nombreOferta, unidades: ofertaUnidades.unidadesNecesarias, subtotal: ofertaUnidades.precioTotal};
    if(sobran > 0)
    {
        listaCesta.push({idArticulo: idArticulo, nombreArticulo: nombre, unidades: sobran, subtotal});
    }
}