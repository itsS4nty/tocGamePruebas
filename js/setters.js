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