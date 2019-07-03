function imprimirTotalCesta(total)
{
    totalCesta.innerHTML = total.toFixed(2) + ' ';
}

function imprimirListaCaja(lista)
{
    var str = '';

    for(var key in lista)
    {
        str += '<div class="list-group-item">';
        str += '<div class="row-action-primary">';
        str += '<i class="zmdi zmdi-shopping-cart circle mw-salmon"></i></div><div class="row-content">';
        str += '<div class="least-content"><i class="zmdi zmdi-info"></i></div>';
        str += `<h4 class="list-group-item-heading">Factura número ${lista[key].idTicket}</h4>`;
        if(lista[key].tarjeta)
        {
            str += `<p class="list-group-item-text">TOTAL: ${lista[key].total} € - Pagado con TARJETA - ${lista[key].timestamp}</p>`;
        }
        else
        {
            str += `<p class="list-group-item-text">TOTAL: ${lista[key].total} € - Pagado en efectivo - ${lista[key].timestamp}</p>`;
        }
        str += '</div></div><div class="list-group-separator"></div>';
    }
    listaCaja.innerHTML = str;
}

function imprimirTeclado(id)
{
    db.articulos.toArray(listaArticulos =>{
        if(listaArticulos)
        {
            db.teclado.toArray(infoTeclado =>{
                if(infoTeclado)
                {
                    console.log('info necesaria:');
                    console.log(infoTeclado);
                    let strPos = '';
                    let strFun = '';
                    let aux = null;
                    for(let i = 0; i < infoTeclado[id].arrayTeclado.length; i++)
                    {
                        console.log("WTF");
                        aux = getInfoArticulo(listaArticulos, infoTeclado[id].arrayTeclado[i].id);
                        strPos = 'tecla' + infoTeclado[id].arrayTeclado[i].posicion;
                        strFun = `addItemCesta(${infoTeclado[id].arrayTeclado[i].id}, '${aux.nombre}', ${aux.precio});`;
                        document.getElementById(strPos).innerHTML = aux.nombre;
                        document.getElementById(strPos).setAttribute('onclick', strFun);
                        document.getElementById(strPos).setAttribute('style', 'visibility: visible;');
                    }
                    console.log("Teclado actualizado");
                }
                else
                {
                    console.log("Error al obtener la info de teclado");
                }
            });
        }
        else
        {
            console.log("Error al obtener la lista de artículos en imprimirTeclado()");
        }
    });
}

function verCaja()
{
    db.caja.toArray(lista =>{
        if(lista)
        {
            imprimirListaCaja(lista);
            $("#modalCaja").modal();
        }
        else
        {
            alert("Error al cargar la caja desde verCaja()");
        }
    });
}