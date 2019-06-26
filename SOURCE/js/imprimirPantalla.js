'use strict'

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