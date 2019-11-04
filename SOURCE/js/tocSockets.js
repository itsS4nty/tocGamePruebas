socket.on('install-licencia', (data)=>
{
    if(!data.error)
    {
        db.parametros.put({
            licencia: data.licencia, 
            nombreEmpresa: data.nombreEmpresa, 
            database: data.database}).then(function()
            {
                console.log(data.licencia, data.nombreEmpresa, data.database);
            });
        document.onmousedown=function(){return true};
        $("#installWizard").modal('hide');
        notificacion('Licencia OK!', 'success');
    }
    else
    {
        console.log("Hay error: "+ data.infoError);
    }
});

socket.on('cargar-ultimo-teclado', (data)=>{
    console.log(data);
});

function borrarTest()
{
    db.parametros.toArray().then(info=>{
        if(info)
        {
            console.log(info);
            socket.emit('cargar-ultimo-teclado', {
                licencia: info[0].licencia,
                database: info[0].database
            });
        }
        else
        {
            console.log("Error en borrar test 456");
        }
    });
}