function clickSubmenu(id) {
    db.submenus.where("id").equals(id).toArray().then(mySubmenu => {
        imprimirTeclado(mySubmenu[0].id)
    });
}

function clickMenu(id) {
    currentMenu = id;
    db.submenus.where("idPadre").equals(id).toArray().then(listaSubmenus => {
        //inicio = 0;
        if (listaSubmenus.length > 0) {
            imprimirSubmenus(listaSubmenus).then(function () {
                clickSubmenu(listaSubmenus[0].id); //Carga el submenu de la primera posición de la lista.
            });
        }
        else {
            notificacion('No existe ningún submenú', 'error');
        }
    });
}
function clickIzquierda() {
    if (inicio > 0) {
        inicio--;
        imprimirSubmenus();
    }
}
function clickDerecha(numeroSubmenus) {
    if (inicio + 4 < numeroSubmenus) {
        inicio++;
        imprimirSubmenus();
    }
}
async function imprimirSubmenus(listaSubmenus = null) {
    var buttonSize = null;
    var strAux = '';

    if (listaSubmenus == null) {
        listaSubmenus = await db.submenus.where("idPadre").equals(currentMenu).toArray();
    }
    var numeroSubmenus = listaSubmenus.length;

    if (numeroSubmenus > 9) {
        /* SE MUESTRAN LAS FLECHAS Y SE IMPRIME DESDE EL var = INICIO */
        if ((numeroSubmenus - 1) - inicio >= 4) {
            for (let i = inicio; i < (inicio + 4); i++) {
                if (i == inicio) {
                    strAux = '<div class="col-md-2" onclick="clickIzquierda();"><span class="pull-right"><img src="imagenes/flecha_izquierda.png"></span></div>';
                }
                strAux += `<div class="col-md-2">
                                <button onclick="clickSubmenu(${listaSubmenus[i].idTeclado})" class="btn btn-danger btn-lg btn-block" style="font-family: 'Anton', sans-serif; font-size: 20px; font-style: normal; ">
                                    ${listaSubmenus[i].nombre}
                                    <div class="ripple-container"></div>
                                </button>
                            </div>`;
                if (i == inicio + 3) {
                    strAux += `<div class="col-md-2" onclick="clickDerecha(${numeroSubmenus});"><span class="pull-left"><img src="imagenes/flecha_derecha.png"></span></div>`;
                }
            }

        }
        else {
            for (let i = numeroSubmenus - 4; i < numeroSubmenus; i++) {
                if (i == numeroSubmenus - 4) {
                    strAux = '<div class="col-md-2" onclick="clickIzquierda();"><span class="pull-right"><img src="imagenes/flecha_izquierda.png"></span></div>';
                }
                strAux += `<div class="col-md-2">
                                <button onclick="clickSubmenu(${listaSubmenus[i].idTeclado})" class="btn btn-danger btn-lg btn-block" style="font-family: 'Anton', sans-serif; font-size: 20px; font-style: normal;">
                                    ${listaSubmenus[i].nombre}
                                    <div class="ripple-container"></div>
                                </button>
                            </div>`;
                if (i == numeroSubmenus - 1) {
                    strAux += `<div class="col-md-2" onclick="clickDerecha(${numeroSubmenus});"><span class="pull-left"><img src="imagenes/flecha_derecha.png"></span></div>`;
                }
            }
        }
    }
    else {
        /* SE MUESTRAN TODAS SIN FLECHAS. HAY QUE HACER SWITCH PARA CALCULAR EL TAMAÑO DE LOS BOTONES */
        switch (listaSubmenus.length) {
            case 0: notificacion('No existe ningún submenú', 'error'); break;
            case 1: buttonSize = 12; break;
            case 2: buttonSize = 6; break;
            case 3: buttonSize = 4; break;
            case 4: buttonSize = 3; break;
            default: buttonSize = 1; break;
        }
        for (let i = 0; i < listaSubmenus.length; i++) {
            strAux += `
                        <div class="col-md-${buttonSize}" style="padding: 0;">
                            <button class="btn btn-danger btn-lg btn-block" onclick="clickSubmenu(${listaSubmenus[i].idTeclado})" style="font-family: 'Anton', sans-serif; font-size: 20px; font-style: normal; border: 2px solid #000;">
                                ${listaSubmenus[i].nombre}
                                <div class="ripple-container"></div>
                            </button>
                        </div>`;
        }
    }
    document.getElementById('menus').innerHTML = strAux;
}