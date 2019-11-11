function imprimirTotalCesta(total)
{
    totalCesta.innerHTML = total.toFixed(2) + ' ';
}

function imprimirListaCaja(lista)
{
    var str = '';
    var i   = 1;
    var aux = "";
    var aux2 = null;
    for(var key in lista)
    {
        aux2 = lista.length-i+1;
        if(lista[key].tarjeta)
        {
            aux = '<span style="color:red;font-weight: bold;">CON TARJETA</span>';
        }
        else
        {
            aux = 'EN EFECTIVO';
        }
        str += `<tr style="height:60px;font-size:20px;" onclick="verDetalleTicket(${lista[key].idTicket});"><th scope="row">${aux2}</th><td>${lista[key].idTicket}</td><td>${lista[key].timestamp}</td><td>${aux}</td><td>${lista[key].total} €</td></tr>`;

        i++;
    }
    tablaCaja.innerHTML = str;
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
                        if(typeof aux.nombre !== "undefined")
                        {
                            strFun = `addItemCesta(${infoTeclado[id].arrayTeclado[i].id}, '${aux.nombre}', ${aux.precio});`;
                        }
                        else
                        {
                            strFun = '';
                        }
                        
                        if(typeof aux.nombre !== "undefined")
                        {
                            document.getElementById(strPos).innerHTML = aux.nombre;
                        }
                        else
                        {
                            document.getElementById(strPos).innerHTML = "ART. ELIMINADO";
                        }
                        
                        document.getElementById(strPos).setAttribute('onclick', strFun);
                        document.getElementById(strPos).setAttribute('style', 'background-color:#'+infoTeclado[id].arrayTeclado[i].color+'; visibility: visible;font-family: \'Anton\', sans-serif; font-size: 20px; letter-spacing:2px; line-height:18px;white-space:normal;color: black;');
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
    db.caja.orderBy("idTicket").desc().toArray(lista =>{
        if(lista)
        {
            imprimirListaCaja(lista);
            document.getElementById('colDetalle').setAttribute("class", "col-md-4 hide");
            $("#cajaFull").modal();
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