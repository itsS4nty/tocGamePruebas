function setCurrentCaja(id) {
    var devolver = new Promise((dev, rej) => {
        db.currentCaja.clear().then(function () {
            let id2 = id;
            db.currentCaja.put({ idCaja: id2 }).then(function () {
                console.log('ID CAJA ACTUAL: ' + id2);
                dev(true);
            }).catch(err => {
                console.log(err);
                dev(false);
            });
        }).catch(err => {
            console.log(err);
            dev(false);
        });
    })
    return devolver;
}

function setTodosInactivos()
{
    var devolver = new Promise((dev, rej)=>{
        db.fichajes.toCollection().modify(items=>{
            items.activo = 0;
        }).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            dev(false);
        });
    });
    return devolver;
}