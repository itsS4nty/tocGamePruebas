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