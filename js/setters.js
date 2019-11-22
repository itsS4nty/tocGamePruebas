function setCurrentCaja(id) { //NO LE GUSTA EL NULL, SOLUCIONAR
    var devolver = new Promise((dev, rej) => {
        db.currentCaja.clear().then(function () {
            let id2 = id;
            currentCaja = id;
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

function setTodosInactivos() {
    var devolver = new Promise((dev, rej) => {
        db.fichajes.toCollection().modify(items => {
            items.activo = 0;
        }).then(function () {
            dev(true);
        }).catch(err => {
            console.log(err);
            dev(false);
        });
    });
    return devolver;
}

function setActivo(idTrabajador) {
    var devolver = new Promise((dev, rej) => {
        setTodosInactivos().then(res => {
            if (res) {
                db.activo.clear().then(function () {
                    let auxId = idTrabajador;
                    db.activo.put({ idTrabajador: idTrabajador }).then(function () {
                        db.fichajes.update(auxId, { activo: 1, fichado: 1 }).then(res => {
                            if (res) {
                                console.log('Activo actualizado: fichajes y activo');
                                dev(true);
                            }
                            else {
                                console.log('Error: 48912654 ' + auxId);
                                dev(false);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }).catch(err => {
                        console.log(err);
                        dev(false);
                    });
                }).catch(err => {
                    console.log(err);
                    dev(false);
                });
            }
            else {
                dev(false);
            }
        });
    });
    return devolver;
}