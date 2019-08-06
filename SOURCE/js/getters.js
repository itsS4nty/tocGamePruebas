function getItemCesta(indice)
{
    db.cesta.get(indice, item =>{
        //return item;
        aux = item;
    });
}
function getInfoArticulo(arrayArticulos, idToSearch)
{
    for(let i = 0; i < arrayArticulos.length; i++)
    {
        if(arrayArticulos[i].id == idToSearch)
        {
            return {nombre: arrayArticulos[i].nombre, precio: arrayArticulos[i].precio};
        }
    }
    return false;
}

function getArticulos()
{
    db.articulos.toArray(lista =>{
        if(lista)
        {
            console.log(lista);
            return lista;
        }
        else
        {
            alert("Error al cargar los articulos");
        }
    });
}

function getHoraUnix()
{
    return Math.floor(+new Date()/1000);
}

function getTrabajadores()
{
    db.trabajadores.toArray(lista=>{
        if(lista)
        {
            console.log(lista);
        }
        else
        {
            console.log("ERROR al cargar los trabajadores");
        }
    });
}

function getCurrentCaja()
{
    db.currentCaja.toArray(lista=>{
        if(lista)
        {
            console.log(lista);
        }
        else
        {
            console.log("ERROR al cargar la caja actual");
        }
    });
}

function getFichajes()
{
    db.fichajes.toArray(lista=>{
        if(lista)
        {
            console.log(lista);
        }
        else
        {
            console.log("ERROR al cargar los fichajes");
        }
    });
}

function getTeclados()
{
    db.teclado.toArray(lista =>{
        if(lista)
        {
            console.log(lista);
        }
        else
        {
            alert("Error al cargar los teclados");
        }
    });
}