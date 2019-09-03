function buscarOfertas() //CESTA: idArticulo, nombreArticulo, unidades, subtotal
{
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
                            if(hayPromo(listaPromociones[i].articulosNecesarios))
                            {
                                promocionesValidas.push(listaPromociones[i]);
                            }
                        }
                        if(promocionesValidas.length > 0)
                        {
                            aplicarPromo(promocionesValidas);
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
}

function hayPromo(articulosNecesariosEncoded)
{
    //HAY QUE DECODIFICAR EL JSON, Y COMPROBAR SI COINCIDEN TODOS.
}
function aplicarPromo()
{
    //HAY QUE MODIFICAR EL PRECIO FINAL Y LA CESTA VISIBLE (CREAR DOS CESTAS, LA ORIGINAL Y LA VISIBLE)
}