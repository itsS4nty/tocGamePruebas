function insertarTeclado0()
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

    db.teclado.put({id: 0, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano0()
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

function insertarTeclado1()
{
    var teclas = [];
    teclas.push({id: 29, posicion: 1});
    teclas.push({id: 30, posicion: 2});
    teclas.push({id: 31, posicion: 3});
    teclas.push({id: 32, posicion: 4});
    teclas.push({id: 33, posicion: 5});
    teclas.push({id: 34, posicion: 6});

    teclas.push({id: 35, posicion: 7});
    teclas.push({id: 36, posicion: 8});
    teclas.push({id: 37, posicion: 9});
    teclas.push({id: 38, posicion: 10});
    teclas.push({id: 39, posicion: 11});
    teclas.push({id: 40, posicion: 12});

    teclas.push({id: 41, posicion: 13});
    teclas.push({id: 42, posicion: 14});
    teclas.push({id: 43, posicion: 15});
    teclas.push({id: 44, posicion: 16});
    teclas.push({id: 45, posicion: 17});
    teclas.push({id: 46, posicion: 18});

    teclas.push({id: 47, posicion: 19});
    teclas.push({id: 48, posicion: 20});
    teclas.push({id: 49, posicion: 21});
    teclas.push({id: 50, posicion: 22});
    teclas.push({id: 51, posicion: 23});
    teclas.push({id: 52, posicion: 24});

    teclas.push({id: 53, posicion: 25});
    teclas.push({id: 54, posicion: 26});
    teclas.push({id: 55, posicion: 27});
    teclas.push({id: 56, posicion: 28});
    teclas.push({id: 57, posicion: 29});
    teclas.push({id: 58, posicion: 30});

    teclas.push({id: 59, posicion: 31});
    teclas.push({id: 60, posicion: 32});
    teclas.push({id: 61, posicion: 33});
    teclas.push({id: 62, posicion: 34});
    teclas.push({id: 63, posicion: 35});
    teclas.push({id: 64, posicion: 36});

    db.teclado.put({id: 1, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}
function crearTecladoAMano1()
{
    var datos = [];
    datos.push({id: 29, nombre: 'Frances Plus', precio: 1.2, iva: 10});
    datos.push({id: 30, nombre: 'Pan de Vidrio @', precio: 1.35, iva: 10});
    datos.push({id: 31, nombre: 'Salvado de 1/4 @', precio: 1.25, iva: 10});
    datos.push({id: 32, nombre: 'Chapata Larga @', precio: 1.1, iva: 10});
    datos.push({id: 33, nombre: 'Rustico 1/4 @', precio: 2.75, iva: 10});
    datos.push({id: 34, nombre: 'Pan Gallego @', precio: 1.35, iva: 10});

    datos.push({id: 35, nombre: 'Pages de 1 kilo @', precio: 2.5, iva: 10});
    datos.push({id: 36, nombre: 'Pages de 1/2 kilo @', precio: 1.2, iva: 10});
    datos.push({id: 37, nombre: 'Pages Cereales', precio: 1.4, iva: 10});
    datos.push({id: 38, nombre: 'Pages de 1/4 kilo @', precio: 1.3, iva: 10});
    datos.push({id: 39, nombre: 'Pages 2/1 kilo @', precio: 1.1, iva: 10});
    datos.push({id: 40, nombre: 'Pa de Vidre petit', precio: 1.3, iva: 10});

    datos.push({id: 41, nombre: 'Bollito Cereales @', precio: 2, iva: 10});
    datos.push({id: 42, nombre: 'bollito salvado @', precio: 1.45, iva: 10});
    datos.push({id: 43, nombre: 'Bollito pan frances @', precio: 1.35, iva: 10});
    datos.push({id: 44, nombre: 'bollito calabaza @', precio: 1.3, iva: 10});
    datos.push({id: 45, nombre: 'Nordico @', precio: 1.4, iva: 10});
    datos.push({id: 46, nombre: '060 Calabaza 70 gr.', precio: 1.3, iva: 10});

    datos.push({id: 47, nombre: 'bollito mini aceite largo @', precio: 1.1, iva: 10});
    datos.push({id: 48, nombre: 'bollito mini cereales @', precio: 1.4, iva: 10});
    datos.push({id: 49, nombre: 'bollito mini nordico @', precio: 0, iva: 10});
    datos.push({id: 50, nombre: 'PA 365', precio: 1.3, iva: 10});
    datos.push({id: 51, nombre: 'Aceite largo @', precio: 1.3, iva: 10});
    datos.push({id: 52, nombre: 'Aceite Redondo @', precio: 1.3, iva: 10});

    datos.push({id: 53, nombre: 'Molde', precio: 1.5, iva: 10});
    datos.push({id: 54, nombre: 'Molde integral', precio: 2.85, iva: 10});
    datos.push({id: 55, nombre: 'PA 365', precio: 2.1, iva: 10});
    datos.push({id: 56, nombre: 'Flauti formatge', precio: 2.85, iva: 10});
    datos.push({id: 57, nombre: 'Bollito Paxoco', precio: 1.3, iva: 10});
    datos.push({id: 58, nombre: 'Pan Invitación', precio: 0, iva: 10});

    datos.push({id: 59, nombre: 'Pan Espelta @', precio: 1.5, iva: 10});
    datos.push({id: 60, nombre: 'Barra Calabaza @', precio: 1.7, iva: 10});
    datos.push({id: 61, nombre: 'Chapata Cereales @', precio: 3.5, iva: 10});
    datos.push({id: 62, nombre: 'Barra aceite @', precio: 2.1, iva: 10});
    datos.push({id: 63, nombre: '1500 Paquete Harina 1KG', precio: 2.1, iva: 10});
    datos.push({id: 64, nombre: 'Bolsa de plastico', precio: 2.85, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        console.log("Todo ok!");
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function crearDemoCompleta()
{
    crearTecladoAMano0();
    crearTecladoAMano1();

    insertarTeclado0();
    insertarTeclado1();
}