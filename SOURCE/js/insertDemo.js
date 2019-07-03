function insertarTeclado()
{
    var teclas = [];
    teclas.push({id: 1, posicion: 1});
    teclas.push({id: 2, posicion: 2});
    teclas.push({id: 3, posicion: 3});
    teclas.push({id: 4, posicion: 4});
    teclas.push({id: 5, posicion: 5});
    teclas.push({id: 6, posicion: 6});

    teclas.push({id: 7, posicion: 7});
    teclas.push({id: 8, posicion: 9});
    teclas.push({id: 9, posicion: 11});
    teclas.push({id: 10, posicion: 12});

    teclas.push({id: 11, posicion: 13});
    teclas.push({id: 12, posicion: 14});
    teclas.push({id: 13, posicion: 15});
    teclas.push({id: 14, posicion: 17});
    teclas.push({id: 15, posicion: 18});

    teclas.push({id: 16, posicion: 19});
    teclas.push({id: 17, posicion: 21});
    teclas.push({id: 18, posicion: 23});

    teclas.push({id: 19, posicion: 25});
    teclas.push({id: 20, posicion: 28});
    teclas.push({id: 21, posicion: 29});
    teclas.push({id: 22, posicion: 30});

    teclas.push({id: 23, posicion: 31});
    teclas.push({id: 24, posicion: 32});
    teclas.push({id: 25, posicion: 33});
    teclas.push({id: 26, posicion: 34});
    teclas.push({id: 27, posicion: 35});
    teclas.push({id: 28, posicion: 36});

    db.teclado.put({id: 1, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}
function crearTecladoAMano()
{
    var datos = [];
    datos.push({id: 1, nombre: 'Café', precio: 1.2, iva: 10});
    datos.push({id: 2, nombre: 'Café con leche', precio: 1.35, iva: 10});
    datos.push({id: 3, nombre: 'Cortado', precio: 1.25, iva: 10});
    datos.push({id: 4, nombre: 'Café descaf.', precio: 1.1, iva: 10});
    datos.push({id: 5, nombre: 'Cappuccino', precio: 2.75, iva: 10});
    datos.push({id: 6, nombre: 'Café con hielo', precio: 1.35, iva: 10});

    datos.push({id: 7, nombre: 'Suc de taronja Gran', precio: 2.5, iva: 10});
    datos.push({id: 8, nombre: 'Cortado de leche sin lactosa', precio: 1.2, iva: 10});
    datos.push({id: 9, nombre: 'Café con leche de soja', precio: 1.4, iva: 10});
    datos.push({id: 10, nombre: 'Café americano', precio: 1.3, iva: 10});

    datos.push({id: 11, nombre: 'Chocolate a la taza', precio: 2, iva: 10});
    datos.push({id: 12, nombre: 'Leche con colacao', precio: 1.45, iva: 10});
    datos.push({id: 13, nombre: 'Café con leche sin lactosa', precio: 1.35, iva: 10});
    datos.push({id: 14, nombre: 'Cortado de leche de soja', precio: 1.3, iva: 10});
    datos.push({id: 15, nombre: 'Vaso de leche de soja', precio: 1.4, iva: 10});

    datos.push({id: 16, nombre: 'Vaso de leche', precio: 1.1, iva: 10});
    datos.push({id: 17, nombre: 'Vaso de leche sin lactosa', precio: 1.4, iva: 10});
    datos.push({id: 18, nombre: 'Invitación café', precio: 0, iva: 10});

    datos.push({id: 19, nombre: 'Infusión aromática', precio: 1.5, iva: 10});
    datos.push({id: 20, nombre: 'Vaso fruta pequeño variada', precio: 2.85, iva: 10});
    datos.push({id: 21, nombre: 'Zumo fresa - Coco', precio: 2.1, iva: 10});
    datos.push({id: 22, nombre: 'Vaso fruta pequeño Piña', precio: 2.85, iva: 10});

    datos.push({id: 23, nombre: 'Carajillo coñac', precio: 1.5, iva: 10});
    datos.push({id: 24, nombre: 'Carajillo whisky', precio: 1.7, iva: 10});
    datos.push({id: 25, nombre: 'Zumo naranja', precio: 3.5, iva: 10});
    datos.push({id: 26, nombre: 'Zumo maracuya - mango', precio: 2.1, iva: 10});
    datos.push({id: 27, nombre: 'Zumo coco - mango', precio: 2.1, iva: 10});
    datos.push({id: 28, nombre: 'Vaso fruta pequeña sandia', precio: 2.85, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        console.log("Todo ok!");
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}