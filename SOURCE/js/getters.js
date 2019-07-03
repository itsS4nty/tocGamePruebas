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
        }
        else
        {
            alert("Error al cargar los articulos");
        }
    });
}