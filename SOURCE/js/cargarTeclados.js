function clickSubmenu(id)
{
    db.submenus.where("id").equals(id).toArray().then(mySubmenu=>{
        console.log(`IMPRIMIR EL TECLADO CON ID: ${mySubmenu[0].id}`);
    });
}

function clickMenu(id)
{
    db.submenus.where("idPadre").equals(id).toArray().then(listaSubmenus=>{
        inicio = 0;
        if(listaSubmenus.length > 0)
        {
            //imprimirSubmenus(listaSubmenus); ACTIVAR!
            console.log(`IMPRIMO LISTA SUBMENUS`);
            clickSubmenu(listaSubmenus[0].id); //Carga el submenu de la primera posición de la lista.
        }
        else
        {
            notificacion('No existe ningún submenú', 'error');
        }
    });
}

function imprimirSubmenus(listaSubmenus)
{
    var numeroSubmenus = listaSubmenus.length;
    if(numeroSubmenus > 4)
    {
        /* SE MUESTRAN LAS FLECHAS Y SE IMPRIME DESDE EL var = INICIO */
        
    }
    else
    {
        /* SE MUESTRAN TODAS SIN FLECHAS. HAY QUE HACER SWITCH PARA CALCULAR EL TAMAÑO DE LOS BOTONES */
    }
}