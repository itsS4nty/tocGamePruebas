async function comprobarConfiguracion()
{
    var arrayParametros = await db.parametros.toArray();
    console.log(arrayParametros);
    console.log("accede a comprobarConfiguracion()");
    if(arrayParametros.length == 0)
    {
        return false;
    }
    else
    {
        console.log(69999);
        //comprobaciones faltan, todo okey devuelve true;
        return true;
    }
}

function installWizard()
{
    document.onmousedown=function(){return true};
}