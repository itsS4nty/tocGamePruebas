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
        str += `<i class="zmdi zmdi-print circle mw-salmon" onclick="verDetalleFactura(${lista[key].idTicket})"></i></div><div class="row-content">`;
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

function verDetalleFactura(idTicket)
{
    if(confirm('¿Imprimir ticket?'))
    {
        imprimirTicketReal(idTicket);
    }
}
function limpiarTeclado()
{
    for(let i = 1; i <= 36; i++)
    {
        document.getElementById('tecla'+i).setAttribute('style', 'visibility: hidden;');
    }
}

function imprimirTeclado(id)
{
    db.articulos.toArray(listaArticulos =>{
        if(listaArticulos)
        {
            db.teclado.toArray(infoTeclado =>{
                if(infoTeclado)
                {
                    let strPos = '';
                    let strFun = '';
                    let aux = null;
                    limpiarTeclado();
                    for(let i = 0; i < infoTeclado[id].arrayTeclado.length; i++)
                    {
                        if(infoTeclado[id] == null){
                            console.log('Indefinido id: ' + id);
                        }
                        aux = getInfoArticulo(listaArticulos, infoTeclado[id].arrayTeclado[i].id);
                        strPos = 'tecla' + infoTeclado[id].arrayTeclado[i].posicion;
                        strFun = `addItemCesta(${infoTeclado[id].arrayTeclado[i].id}, '${aux.nombre}', ${aux.precio});`;
                        document.getElementById(strPos).innerHTML = aux.nombre;
                        document.getElementById(strPos).setAttribute('onclick', strFun);
                        document.getElementById(strPos).setAttribute('style', 'visibility: visible;font-family: \'Anton\', sans-serif; font-size: 20px; letter-spacing:2px; line-height:18px;white-space:normal;');
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

function notificacion(texto, tipo)
{
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      }

    switch(tipo)
    {
        case 'info': toastr["info"](texto); break;
        case 'error': toastr["error"](texto); break;
        case 'success': toastr["success"](texto); break;
        case 'warning': toastr["warning"](texto); break;
    }
}

function refreshFichajes()
{
    db.fichajes.toArray(lista=>{
        htmlFichajes.innerHTML = '';
        var htmlTexto = '';
        for(let i = 0; i < lista.length; i++)
        {
            htmlTexto += `<li class="list-group-item">
            <span class="pull-left"><img src="imagenes/default-avatar.png" alt="" class="img-circle max-w-40 m-r-10 "></span>
            <i class="badge mini success status"></i>
            <div class="list-group-item-body">
                <div class="list-group-item-heading">${lista[i].nombre}</div>
            </div>
             </li>`;
        }
        htmlFichajes.innerHTML = htmlTexto;
    });
}