function insertarTrabajadores()
{
    var trabajadores = [];
    trabajadores.push({idTrabajador: 1, nombre: 'eze'});
    trabajadores.push({idTrabajador: 2, nombre: 'andres'});
    trabajadores.push({idTrabajador: 3, nombre: 'carissimo'});
    trabajadores.push({idTrabajador: 4, nombre: 'oms'});
    trabajadores.push({idTrabajador: 5, nombre: 'oms yeah'});
    trabajadores.push({idTrabajador: 6, nombre: 'Regina'});

    db.trabajadores.bulkPut(trabajadores).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        console.error("Error de insertar trabajadores");
    });
}

function insertarPromociones()
{
    var promo1 = '[{"idArticulo":122,"unidadesNecesarias":5}]';
    //var promo2 = '[{"idArticulo":122,"unidadesNecesarias":5},{"idArticulo":2,"unidadesNecesarias":1}]';
    db.promociones.put({id: 9999, nombre: "Promoción de prueba", precioFinal: 69, articulosNecesarios: promo1}).then(function(){
        console.log("Promoción agregada correctamente");
    });
}
function insertarTeclado0()
{
    var teclas = [];
    teclas.push({id: 1, posicion: 1});
    teclas.push({id: 2, posicion: 2});
    teclas.push({id: 3, posicion: 7});
    teclas.push({id: 4, posicion: 11});
    teclas.push({id: 5, posicion: 12});
    teclas.push({id: 6, posicion: 13});
    teclas.push({id: 7, posicion: 14});
    teclas.push({id: 8, posicion: 15});
    teclas.push({id: 9, posicion: 16});
    teclas.push({id: 10, posicion: 19});
    teclas.push({id: 11, posicion: 23});
    teclas.push({id: 12, posicion: 25});
    teclas.push({id: 13, posicion: 26});
    teclas.push({id: 14, posicion: 27});
    teclas.push({id: 15, posicion: 28});
    teclas.push({id: 16, posicion: 29});
    teclas.push({id: 17, posicion: 30});
    teclas.push({id: 18, posicion: 31});
    teclas.push({id: 19, posicion: 32});
    teclas.push({id: 20, posicion: 33});

    db.teclado.put({id: 0, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano0()
{
    var datos = [];
    datos.push({id: 1, nombre: '250 Cerveza Estrella Dorada', precio: 1.750, iva: 10});
    datos.push({id: 2, nombre: '280 Cerveza DAMM sin alcohol lata', precio: 1.550, iva: 10});

    datos.push({id: 3, nombre: '315 Cacaolat pequeño', precio: 1.750, iva: 10});
    datos.push({id: 4, nombre: '260 Aquarius lata', precio: 1.700, iva: 10});

    datos.push({id: 5, nombre: '310 Granini Piña Pequeño', precio: 1.700, iva: 10});
    datos.push({id: 6, nombre: '300 Granini naranja pequeño', precio: 1.700, iva: 10});
    datos.push({id: 7, nombre: '305 Granini melocoton pequeño', precio: 1.700, iva: 10});
    datos.push({id: 8, nombre: '325 Mini Zumo Piña Uva GOURMET', precio: 0.750, iva: 10});
    datos.push({id: 9, nombre: '320 Mini Zumo Melocoton Uva GOURMET', precio: 0.750, iva: 10});

    datos.push({id: 10, nombre: '225 Agua Sant Aniol 1/2 litro', precio: 1.100, iva: 10});
    datos.push({id: 11, nombre: '275 Vichy catalan lata 33cl', precio: 1.750, iva: 10});

    datos.push({id: 12, nombre: '270 Fanta Limon lata', precio: 1.600, iva: 10});
    datos.push({id: 13, nombre: '245 Fanta Naranja lata', precio: 1.600, iva: 10});
    datos.push({id: 14, nombre: '295 Trinaranjus limon lata 33 ml', precio: 1.600, iva: 10});
    datos.push({id: 15, nombre: '285 Trinaranjus naranja lata 33 ml', precio: 1.600, iva: 10});
    datos.push({id: 16, nombre: '265 Nestea limon lata', precio: 1.600, iva: 10});
    datos.push({id: 17, nombre: '290 Tonica lata', precio: 1.600, iva: 10});

    datos.push({id: 18, nombre: '235 Coca Cola Lata', precio: 1.600, iva: 10});
    datos.push({id: 19, nombre: '255 Coca Cola Light lata', precio: 1.600, iva: 10});
    datos.push({id: 20, nombre: '240 Coca Cola Zero', precio: 1.600, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado1()
{
    var teclas = [];
    teclas.push({id: 21, posicion: 1});
    teclas.push({id: 22, posicion: 2});
    teclas.push({id: 23, posicion: 3});
    teclas.push({id: 24, posicion: 4});
    teclas.push({id: 25, posicion: 5});
    teclas.push({id: 26, posicion: 6});

    teclas.push({id: 27, posicion: 7});
    teclas.push({id: 28, posicion: 8});
    teclas.push({id: 29, posicion: 9});
    teclas.push({id: 30, posicion: 10});
    teclas.push({id: 31, posicion: 11});
    teclas.push({id: 32, posicion: 12});

    teclas.push({id: 33, posicion: 13});
    teclas.push({id: 34, posicion: 14});
    teclas.push({id: 35, posicion: 15});
    teclas.push({id: 36, posicion: 16});
    teclas.push({id: 37, posicion: 17});
    teclas.push({id: 38, posicion: 18});

    teclas.push({id: 39, posicion: 19});
    teclas.push({id: 40, posicion: 20});
    teclas.push({id: 41, posicion: 21});
    teclas.push({id: 42, posicion: 22});
    teclas.push({id: 43, posicion: 23});
    teclas.push({id: 44, posicion: 24});

    teclas.push({id: 45, posicion: 25});
    teclas.push({id: 46, posicion: 26});
    teclas.push({id: 47, posicion: 27});
    teclas.push({id: 48, posicion: 28});
    teclas.push({id: 49, posicion: 29});
    teclas.push({id: 50, posicion: 30});

    teclas.push({id: 51, posicion: 31});
    teclas.push({id: 52, posicion: 32});
    teclas.push({id: 53, posicion: 33});
    teclas.push({id: 54, posicion: 34});
    teclas.push({id: 55, posicion: 35});
    teclas.push({id: 56, posicion: 36});

    db.teclado.put({id: 1, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado2()
{
    var teclas = [];
    teclas.push({id: 56, posicion: 1});
    teclas.push({id: 57, posicion: 2});
    teclas.push({id: 58, posicion: 3});
    teclas.push({id: 59, posicion: 4});
    teclas.push({id: 60, posicion: 5});
    teclas.push({id: 61, posicion: 6});

    teclas.push({id: 62, posicion: 7});
    teclas.push({id: 63, posicion: 8});
    teclas.push({id: 64, posicion: 9});
    teclas.push({id: 65, posicion: 10});
    teclas.push({id: 66, posicion: 11});
    teclas.push({id: 67, posicion: 12});

    teclas.push({id: 68, posicion: 13});
    teclas.push({id: 69, posicion: 14});
    teclas.push({id: 70, posicion: 15});
    teclas.push({id: 71, posicion: 16});
    teclas.push({id: 72, posicion: 17});
    teclas.push({id: 73, posicion: 18});

    teclas.push({id: 74, posicion: 19});
    teclas.push({id: 75, posicion: 20});
    teclas.push({id: 76, posicion: 21});
    teclas.push({id: 77, posicion: 22});
    teclas.push({id: 78, posicion: 23});
    teclas.push({id: 79, posicion: 24});

    teclas.push({id: 80, posicion: 25});
    teclas.push({id: 81, posicion: 26});
    teclas.push({id: 82, posicion: 27});
    teclas.push({id: 83, posicion: 28});
    teclas.push({id: 84, posicion: 29});
    teclas.push({id: 85, posicion: 30});

    teclas.push({id: 86, posicion: 31});
    teclas.push({id: 87, posicion: 32});
    teclas.push({id: 88, posicion: 33});
    teclas.push({id: 89, posicion: 34});
    teclas.push({id: 90, posicion: 35});
    teclas.push({id: 91, posicion: 36});

    db.teclado.put({id: 2, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano1()
{
    var datos = [];
    datos.push({id: 21, nombre: 'Horchata normal', precio: 1.950, iva: 10});
    datos.push({id: 22, nombre: 'Horchata XL', precio: 2.900, iva: 10});
    datos.push({id: 23, nombre: 'Granizado', precio: 2.600, iva: 10});
    datos.push({id: 24, nombre: 'Granizado XL', precio: 3.150, iva: 10});
    datos.push({id: 25, nombre: 'Carajillo wisky', precio: 1.700, iva: 10});
    datos.push({id: 26, nombre: 'Carajillo coñac', precio: 1.500, iva: 10});

    datos.push({id: 27, nombre: 'Vaso Fruta pequeño variada', precio: 2.850, iva: 10});
    datos.push({id: 28, nombre: 'Vaso fruta pequeño Piña', precio: 2.850, iva: 10});
    datos.push({id: 29, nombre: 'Vaso fruta pequeño sandia', precio: 2.850, iva: 10});
    datos.push({id: 30, nombre: 'Zumo Fresa - Coco', precio: 2.400, iva: 10});
    datos.push({id: 31, nombre: 'Zumo Maracuya - Mango', precio: 2.400, iva: 10});
    datos.push({id: 32, nombre: 'Zumo Coco - Mango', precio: 2.400, iva: 10});

    datos.push({id: 33, nombre: 'Chocolate a la taza', precio: 2, iva: 10});
    datos.push({id: 34, nombre: 'Leche con Colacao', precio: 1.450, iva: 10});
    datos.push({id: 35, nombre: 'vaso de leche', precio: 1.100, iva: 10});
    datos.push({id: 36, nombre: 'Vaso de leche sin lactosa', precio: 1.400, iva: 10});
    datos.push({id: 37, nombre: 'Vaso de leche de AVENA', precio: 1.400, iva: 10});
    datos.push({id: 38, nombre: 'Vaso de leche de soja', precio: 1.400, iva: 10});

    datos.push({id: 39, nombre: 'Zumo naranja XL', precio: 3.500, iva: 10});
    datos.push({id: 40, nombre: 'Suc de Taronja Gran', precio: 2.500, iva: 10});
    datos.push({id: 41, nombre: 'Infusion Aromatica', precio: 1.500, iva: 10});
    datos.push({id: 42, nombre: 'Cafe XL para llevar', precio: 2.500, iva: 10});
    datos.push({id: 43, nombre: 'Cappuccino', precio: 2.750, iva: 10});
    datos.push({id: 44, nombre: 'Cappuccino XL', precio: 3, iva: 10});

    datos.push({id: 45, nombre: 'Café con leche de soja', precio: 1.400, iva: 10});
    datos.push({id: 46, nombre: 'Cafe con leche de AVENA', precio: 1.400, iva: 10});
    datos.push({id: 47, nombre: 'Cortado de leche de soja', precio: 1.300, iva: 10});
    datos.push({id: 48, nombre: 'Cortado con leche de AVENA', precio: 1.300, iva: 10});
    datos.push({id: 49, nombre: 'Suplemento HIELO', precio: 0.100, iva: 10});
    datos.push({id: 50, nombre: 'Cafe americano', precio: 1.300, iva: 10});

    datos.push({id: 51, nombre: 'Cafe con leche', precio: 1.350, iva: 10});
    datos.push({id: 52, nombre: 'Café con leche sin lactosa', precio: 1.400, iva: 10});
    datos.push({id: 53, nombre: 'Cortado', precio: 1.250, iva: 10});
    datos.push({id: 54, nombre: 'Cortado de leche sin lactosa', precio: 1.200, iva: 10});
    datos.push({id: 55, nombre: 'Cafe', precio: 1.200, iva: 10});
    datos.push({id: 56, nombre: 'Cafe descaf.', precio: 1.100, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function crearTecladoAMano2()
{
    var datos = [];
    datos.push({id: 56, nombre: '+ Aceite Veg. Pollo', precio: 3.8, iva: 10});
    datos.push({id: 57, nombre: '+ Aceite Veg. Atun', precio: 3.35, iva: 10});
    datos.push({id: 58, nombre: '+ Chapata Cereales Atun', precio: 2.1, iva: 10});
    datos.push({id: 59, nombre: '+ Chapata Cereales Serrano', precio: 2.1, iva: 10});
    datos.push({id: 60, nombre: '+ Nordico Iberico', precio: 4.5, iva: 10});
    datos.push({id: 61, nombre: '+ Mini Nordico Iberico', precio: 3.5, iva: 10});

    datos.push({id: 62, nombre: '+ Cereales Veg. Pollo', precio: 3.9, iva: 10});
    datos.push({id: 63, nombre: '+ Cereales Veg. Serrano', precio: 3.8, iva: 10});
    datos.push({id: 64, nombre: '+ Chapata Cereales Veg. Atun', precio: 2.4, iva: 10});
    datos.push({id: 65, nombre: '+ Chapata Cereales Veg. Jamon y Queso', precio: 2.4, iva: 10});
    datos.push({id: 66, nombre: '+ Nordico Veg. Iberico', precio: 5, iva: 10});
    datos.push({id: 67, nombre: '+ Nordico Fuet', precio: 3.2, iva: 10});

    datos.push({id: 68, nombre: '+ Mini Chapata Pollo', precio: 2.2, iva: 10});
    datos.push({id: 69, nombre: '+ Mini Chapata Atun', precio: 2.2, iva: 10});
    datos.push({id: 70, nombre: '+ Mini Chapata Queso', precio: 2.2, iva: 10});
    datos.push({id: 71, nombre: '+ Mini Salvado Queso Fresco y Tomate', precio: 2.4, iva: 10});
    datos.push({id: 72, nombre: '+ Briox Veg. Pollo', precio: 2.65, iva: 10});
    datos.push({id: 73, nombre: '+ Briox Jamon y Queso', precio: 2.4, iva: 10});

    datos.push({id: 74, nombre: '+ Chapata Pollo', precio: 3.9, iva: 10});
    datos.push({id: 75, nombre: '+ Chapata Atun', precio: 3.45, iva: 10});
    datos.push({id: 76, nombre: '+ Chapata Queso', precio: 3.45, iva: 10});
    datos.push({id: 77, nombre: '+ Molde Atun', precio: 2.6, iva: 10});
    datos.push({id: 78, nombre: '+ Mollete Veg. Pollo', precio: 4, iva: 10});
    datos.push({id: 79, nombre: '+ Vidre Serrano y Brie', precio: 3.5, iva: 10});

    datos.push({id: 80, nombre: '+ Mini Baguette Atun', precio: 1.9, iva: 10});
    datos.push({id: 81, nombre: '+ Mini Baguette Fuet', precio: 1.9, iva: 10});
    datos.push({id: 82, nombre: '+ Mini Baguette Jamon y Queso', precio: 1.9, iva: 10});
    datos.push({id: 83, nombre: '+ Mini Baguette Serrano', precio: 1.9, iva: 10});
    datos.push({id: 84, nombre: '+ Mini Baguette Tortilla', precio: 1.9, iva: 10});
    datos.push({id: 85, nombre: '+ Mini Baguette Chorizo', precio: 1.9, iva: 10});

    datos.push({id: 86, nombre: '+ Baguette Atun', precio: 2.2, iva: 10});
    datos.push({id: 87, nombre: '+ Baguette Fuet', precio: 2.2, iva: 10});
    datos.push({id: 88, nombre: '+ Baguette Jamon y Queso', precio: 2.2, iva: 10});
    datos.push({id: 89, nombre: '+ Baguette Serrano', precio: 2.2, iva: 10});
    datos.push({id: 90, nombre: '+ Baguette Tortilla', precio: 2.2, iva: 10});
    datos.push({id: 91, nombre: '+ Baguette Chorizo', precio: 2.2, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function crearTecladoAMano3()
{
    var datos = [];
    datos.push({id: 92, nombre: 'Bollito Paxoco', precio: 0.8, iva: 10});
    datos.push({id: 93, nombre: 'Pages de 1 kilo @', precio: 2.2, iva: 10});
    datos.push({id: 94, nombre: 'Pages de 1/2 kilo @', precio: 1.65, iva: 10});
    datos.push({id: 95, nombre: 'valls@', precio: 1.6, iva: 10});
    datos.push({id: 96, nombre: 'Barra aceite @', precio: 1.25, iva: 10});
    datos.push({id: 97, nombre: 'Aceite largo @', precio: 0.7, iva: 10});

    datos.push({id: 98, nombre: 'Aceite Redondo @', precio: 0.7, iva: 10});
    datos.push({id: 99, nombre: '050 Molde @', precio: 0, iva: 10});
    datos.push({id: 100, nombre: 'Chapata Cereales @', precio: 1.3, iva: 10});
    datos.push({id: 101, nombre: 'Bollito Cereales @', precio: 0.7, iva: 10});
    datos.push({id: 102, nombre: 'Pages Cereales @', precio: 1.8, iva: 10});
    datos.push({id: 103, nombre: 'Salvado de 1/4 @', precio: 0.95, iva: 10});

    datos.push({id: 104, nombre: 'Bollito salvado @', precio: 0.6, iva: 10});
    datos.push({id: 105, nombre: 'Rustico 1/4 @', precio: 1.1, iva: 10});
    datos.push({id: 106, nombre: 'Pan Gallego @', precio: 1.2, iva: 10});
    datos.push({id: 107, nombre: 'Frances Plus', precio: 0.7, iva: 10});
    datos.push({id: 108, nombre: 'Pa 365', precio: 1, iva: 10});
    datos.push({id: 109, nombre: 'Chapata Larga @', precio: 1.25, iva: 10});

    datos.push({id: 110, nombre: 'Pan de Vidrio @', precio: 1.5, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado3()
{
    var teclas = [];
    teclas.push({id: 92, posicion: 1});
    teclas.push({id: 93, posicion: 6});
    teclas.push({id: 94, posicion: 7});
    teclas.push({id: 95, posicion: 9});
    teclas.push({id: 96, posicion: 11});
    teclas.push({id: 97, posicion: 12});

    teclas.push({id: 98, posicion: 13});
    teclas.push({id: 99, posicion: 14});
    teclas.push({id: 100, posicion: 16});
    teclas.push({id: 101, posicion: 17});
    teclas.push({id: 102, posicion: 18});
    teclas.push({id: 103, posicion: 19});

    teclas.push({id: 104, posicion: 20});
    teclas.push({id: 105, posicion: 21});
    teclas.push({id: 106, posicion: 26});
    teclas.push({id: 107, posicion: 27});
    teclas.push({id: 108, posicion: 29});
    teclas.push({id: 109, posicion: 30});

    teclas.push({id: 110, posicion: 19});

    db.teclado.put({id: 3, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano4()
{
    var datos = [];
    datos.push({id: 111, nombre: 'Chocolatina', precio: 0.7, iva: 10});
    datos.push({id: 112, nombre: 'Coca surtidor entera', precio: 7, iva: 10});
    datos.push({id: 113, nombre: 'Madalena', precio: 0.75, iva: 10});
    datos.push({id: 114, nombre: 'Coca surtidor Media', precio: 3.50, iva: 10});
    datos.push({id: 115, nombre: 'Mini Tulipa Red Veltet', precio: 1.25, iva: 10});
    datos.push({id: 116, nombre: 'Mini Tulipa Chocolate', precio: 1.25, iva: 10});
    datos.push({id: 117, nombre: 'Mini Berlina', precio: 0.65, iva: 10});

    datos.push({id: 118, nombre: 'Coca surtidor cuarto', precio: 2.0, iva: 10});
    datos.push({id: 119, nombre: 'Caracola chocolate', precio: 0.7, iva: 10});
    datos.push({id: 120, nombre: '06 Napolitana 2 chocos P', precio: 1.250, iva: 10});
    datos.push({id: 121, nombre: 'Ensaimada mini', precio: 0.55, iva: 10});
    datos.push({id: 122, nombre: 'Fartó', precio: 0.30, iva: 10});
    datos.push({id: 123, nombre: 'Croissant BAR 5 uds.', precio: 3.20, iva: 10});

    datos.push({id: 124, nombre: 'Cañita Crema H.', precio: 0.70, iva: 10});
    datos.push({id: 125, nombre: 'Cañita Chocolate H.', precio: 0.70, iva: 10});
    datos.push({id: 126, nombre: 'Cañita Cabello H.', precio: 0.70, iva: 10});
    datos.push({id: 127, nombre: 'Berlina de sucre', precio: 0.75, iva: 10});
    datos.push({id: 128, nombre: 'Microcroissant', precio: 0.30, iva: 10});
    datos.push({id: 129, nombre: 'Croiss. Mini Bombon', precio: 0.35, iva: 10});
    datos.push({id: 130, nombre: 'Croiss. Mini Mantequilla', precio: 0.30, iva: 10});
    datos.push({id: 131, nombre: '095 Croissant Chocolate relleno', precio: 1.60, iva: 10});
    datos.push({id: 132, nombre: 'Croissant mantequilla artesano @', precio: 0.85, iva: 10});
    datos.push({id: 133, nombre: 'Croissant multicereales', precio: 0.95, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado4()
{
    var teclas = [];
    teclas.push({id: 111, posicion: 5});
    teclas.push({id: 112, posicion: 6});

    teclas.push({id: 113, posicion: 10});
    teclas.push({id: 114, posicion: 12});
    
    teclas.push({id: 115, posicion: 13});
    teclas.push({id: 116, posicion: 14});
    teclas.push({id: 117, posicion: 16});
    teclas.push({id: 118, posicion: 18});

    teclas.push({id: 119, posicion: 19});
    teclas.push({id: 120, posicion: 20});
    teclas.push({id: 121, posicion: 21});
    teclas.push({id: 122, posicion: 22});
    teclas.push({id: 123, posicion: 24});

    teclas.push({id: 124, posicion: 25});
    teclas.push({id: 125, posicion: 26});
    teclas.push({id: 126, posicion: 27});
    teclas.push({id: 127, posicion: 28});

    teclas.push({id: 128, posicion: 31});
    teclas.push({id: 129, posicion: 32});
    teclas.push({id: 130, posicion: 33});
    teclas.push({id: 131, posicion: 34});
    teclas.push({id: 132, posicion: 35});
    teclas.push({id: 133, posicion: 36});

    db.teclado.put({id: 4, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano5()
{
    var datos = [];
    datos.push({id: 134, nombre: 'Duo Tostada Baguette/Molde', precio: 1.50, iva: 10});
    datos.push({id: 135, nombre: 'Duo Tostada Cereales/Salvado/Aceite', precio: 2.30, iva: 10});
    datos.push({id: 136, nombre: 'Tostada Baguette/Molde', precio: 0.80, iva: 10});
    datos.push({id: 137, nombre: 'Tostada Cereales/Salvado/Aceite', precio: 1.20, iva: 10});
    datos.push({id: 138, nombre: '( Tostada y Embutido', precio: 2.0, iva: 10});
    datos.push({id: 139, nombre: 'Paninis', precio: 3.0, iva: 10});
    datos.push({id: 140, nombre: 'Cromasier', precio: 2.2, iva: 10});

    datos.push({id: 141, nombre: 'Biquini', precio: 2.2, iva: 10});
    datos.push({id: 142, nombre: 'Hot dog', precio: 2.30, iva: 10});
    datos.push({id: 143, nombre: '1/2 Focaccia verduras', precio: 2.30, iva: 10});
    datos.push({id: 144, nombre: '1/2 Focaccia Jamon', precio: 2.30, iva: 10});
    datos.push({id: 145, nombre: '1/2 Focaccia 4 quesos', precio: 2.30, iva: 10});
    datos.push({id: 146, nombre: '1/4 Pizza Barbacoa rectangular', precio: 3.80, iva: 10});

    datos.push({id: 147, nombre: '1/4 Pizza atun rectangular', precio: 3.80, iva: 10});
    datos.push({id: 148, nombre: '1/4 Pizza Pepperoni rectangular', precio: 3.80, iva: 10});
    datos.push({id: 149, nombre: '1/4 Pizza jamon y queso rectangular', precio: 3.80, iva: 10});
    datos.push({id: 150, nombre: '1/4 Pizza Suprema rectangular', precio: 3.80, iva: 10});
    datos.push({id: 151, nombre: 'Croissant Jamon', precio: 1.35, iva: 10});
    datos.push({id: 152, nombre: 'Croissant Frankfurt', precio: 1.40, iva: 10});
    datos.push({id: 153, nombre: 'Croissant Saludable', precio: 2.50, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado5()
{
    var teclas = [];
    teclas.push({id: 134, posicion: 1});
    teclas.push({id: 135, posicion: 2});

    teclas.push({id: 136, posicion: 7});
    teclas.push({id: 137, posicion: 8});
    teclas.push({id: 138, posicion: 10});

    teclas.push({id: 139, posicion: 13});
    teclas.push({id: 140, posicion: 15});
    teclas.push({id: 141, posicion: 16});
    teclas.push({id: 142, posicion: 17});

    teclas.push({id: 143, posicion: 19});
    teclas.push({id: 144, posicion: 20});
    teclas.push({id: 145, posicion: 21});

    teclas.push({id: 146, posicion: 25});
    teclas.push({id: 147, posicion: 26});
    teclas.push({id: 148, posicion: 27});
    teclas.push({id: 149, posicion: 28});
    teclas.push({id: 150, posicion: 29});

    teclas.push({id: 151, posicion: 31});
    teclas.push({id: 152, posicion: 32});
    teclas.push({id: 153, posicion: 34});

    db.teclado.put({id: 5, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano6()
{
    var datos = [];
    datos.push({id: 154, nombre: '200 Banda de Fruta', precio: 6.10, iva: 10});
    datos.push({id: 155, nombre: 'Banda de Fruta Grande', precio: 11.95, iva: 10});
    datos.push({id: 156, nombre: '200 Banda Manzana', precio: 4.75, iva: 10});
    datos.push({id: 157, nombre: 'Banda de Musico', precio: 6.10, iva: 10});
    datos.push({id: 158, nombre: 'Brazo Grande Encargo', precio: 10.50, iva: 10});
    datos.push({id: 159, nombre: 'Lionesas crema', precio: 0.95, iva: 10});
    datos.push({id: 160, nombre: 'Lionesas nata', precio: 0.95, iva: 10});

    datos.push({id: 161, nombre: 'Lionesas trufa', precio: 0.95, iva: 10});
    datos.push({id: 162, nombre: 'croissant individual nata', precio: 2.30, iva: 10});
    datos.push({id: 163, nombre: 'Lionesas Encargo', precio: 0.95, iva: 10});
    datos.push({id: 164, nombre: 'Croissant Individual Encargo', precio: 2.30, iva: 10});
    datos.push({id: 165, nombre: '14 Tortel Nata Trufa', precio: 11.0, iva: 10});
    datos.push({id: 166, nombre: '13 Tortel Nata', precio: 11.0, iva: 10});

    datos.push({id: 167, nombre: '12 Muss de Fresa pequeño', precio: 14.60, iva: 10});
    datos.push({id: 168, nombre: '11 Muss de Limon pequeño', precio: 14.60, iva: 10});
    datos.push({id: 169, nombre: '13 Muss de Trufa pequeño', precio: 14.60, iva: 10});
    datos.push({id: 170, nombre: 'Muss Pequeño Encargo', precio: 14.60, iva: 10});
    datos.push({id: 171, nombre: 'Pastel a peso con foto', precio: 24.0, iva: 10});
    datos.push({id: 172, nombre: 'Pastel a peso', precio: 16.0, iva: 10});
    datos.push({id: 173, nombre: '8 Pastel Nata pequeño', precio: 12.0, iva: 10});
    datos.push({id: 174, nombre: '9 Pastel Trufa pequeño', precio: 12.0, iva: 10});
    datos.push({id: 175, nombre: 'PASTEL PEQUEÑO ENCARGO', precio: 12.0, iva: 10});
    datos.push({id: 176, nombre: 'Tortel Encargo', precio: 11.0, iva: 10});
    datos.push({id: 177, nombre: 'Massini con foto', precio: 24.0, iva: 10});
    datos.push({id: 178, nombre: '6 Massini Grande', precio: 18.0, iva: 10});
    datos.push({id: 179, nombre: '7 Massini Pequeño', precio: 14.60, iva: 10});
    datos.push({id: 180, nombre: 'Massini Individual', precio: 2.30, iva: 10});
    datos.push({id: 181, nombre: 'Massini Grande Encargo', precio: 18.0, iva: 10});
    datos.push({id: 182, nombre: 'Massini Pequeño Encargo', precio: 14.60, iva: 10});
    datos.push({id: 183, nombre: '2 Brazo Nata Grande', precio: 10.50, iva: 10});
    datos.push({id: 184, nombre: '4 Brazo Nata Individual', precio: 2.30, iva: 10});
    datos.push({id: 185, nombre: '3 Brazo Trufa Grande', precio: 10.50, iva: 10});
    datos.push({id: 186, nombre: '5 Brazo Trufa Individual', precio: 2.30, iva: 10});
    datos.push({id: 187, nombre: '1 Brazo Limon Grande', precio: 10.50, iva: 10});
    datos.push({id: 188, nombre: '6 Brazo Crema Individual', precio: 2.30, iva: 10});

    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado6()
{
    var teclas = [];
    teclas.push({id: 154, posicion: 1});
    teclas.push({id: 155, posicion: 2});
    teclas.push({id: 156, posicion: 3});
    teclas.push({id: 157, posicion: 4});
    teclas.push({id: 158, posicion: 6});
    teclas.push({id: 159, posicion: 7});
    teclas.push({id: 160, posicion: 8});
    teclas.push({id: 161, posicion: 9});
    teclas.push({id: 162, posicion: 10});
    teclas.push({id: 163, posicion: 11});
    teclas.push({id: 164, posicion: 12});
    teclas.push({id: 165, posicion: 13});
    teclas.push({id: 166, posicion: 14});
    teclas.push({id: 167, posicion: 15});
    teclas.push({id: 168, posicion: 16});
    teclas.push({id: 169, posicion: 17});
    teclas.push({id: 170, posicion: 18});
    teclas.push({id: 171, posicion: 19});
    teclas.push({id: 172, posicion: 20});
    teclas.push({id: 173, posicion: 21});
    teclas.push({id: 174, posicion: 22});
    teclas.push({id: 175, posicion: 23});
    teclas.push({id: 176, posicion: 24});
    teclas.push({id: 177, posicion: 25});
    teclas.push({id: 178, posicion: 26});
    teclas.push({id: 179, posicion: 27});
    teclas.push({id: 180, posicion: 28});
    teclas.push({id: 181, posicion: 29});
    teclas.push({id: 182, posicion: 30});
    teclas.push({id: 183, posicion: 31});
    teclas.push({id: 184, posicion: 32});
    teclas.push({id: 185, posicion: 33});
    teclas.push({id: 186, posicion: 34});
    teclas.push({id: 187, posicion: 35});
    teclas.push({id: 188, posicion: 36});

    db.teclado.put({id: 6, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano7()
{
    var datos = [];
    datos.push({id: 189, nombre: 'Pack Gratis', precio: 0, iva: 10});
    datos.push({id: 190, nombre: 'Vaso Yogurt Danone', precio: 1.65, iva: 10});
    datos.push({id: 191, nombre: '.1 Plato+Bebida+Cafe+MiniPasta', precio: 5.45, iva: 10});
    datos.push({id: 192, nombre: 'Croquetas Abuela @', precio: 0.60, iva: 10});
    datos.push({id: 193, nombre: '150 Pollo', precio: 9.15, iva: 10});
    datos.push({id: 194, nombre: '.2 Plato+Bebida+Cafe+MiniPasta', precio: 7.45, iva: 10});
    datos.push({id: 195, nombre: '250 Menu Muslitos de Pollo con Patatas', precio: 3.75, iva: 10});
    datos.push({id: 196, nombre: '240 Menu Espaguetis Carbonara', precio: 3.75, iva: 10});
    datos.push({id: 197, nombre: '230 Menu Albondigas Jardineras', precio: 3.75, iva: 10});
    datos.push({id: 198, nombre: '225 Menu Fideua', precio: 3.75, iva: 10});
    datos.push({id: 199, nombre: '.Menu Ensalada de atún', precio: 3.75, iva: 10});
    datos.push({id: 200, nombre: '.Menu Ensalada de cesar', precio: 3.75, iva: 10});
    datos.push({id: 201, nombre: '.Menu Ensalada de pasta', precio: 3.75, iva: 10});
    datos.push({id: 202, nombre: '.Menu Ensalada de pollo', precio: 3.75, iva: 10});
   
    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado7()
{
    var teclas = [];
    teclas.push({id: 189, posicion: 1});

    teclas.push({id: 190, posicion: 7});

    teclas.push({id: 191, posicion: 18});

    teclas.push({id: 192, posicion: 20});
    teclas.push({id: 193, posicion: 21});
    teclas.push({id: 194, posicion: 24});

    teclas.push({id: 195, posicion: 26});
    teclas.push({id: 196, posicion: 27});
    teclas.push({id: 197, posicion: 28});
    teclas.push({id: 198, posicion: 30});

    teclas.push({id: 199, posicion: 31});
    teclas.push({id: 200, posicion: 32});
    teclas.push({id: 201, posicion: 33});
    teclas.push({id: 202, posicion: 34});

    db.teclado.put({id: 7, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearTecladoAMano8()
{
    var datos = [];
    datos.push({id: 203, nombre: 'Porcion Coca Sant Joan+Cafe', precio: 3.10, iva: 10});
    datos.push({id: 204, nombre: '001 Coca briox Crema Grande', precio: 16.50, iva: 10});
    datos.push({id: 205, nombre: '002 Coca briox Crema Mediana', precio: 10.50, iva: 10});
    datos.push({id: 206, nombre: '003 Coca briox Crema Pequeña', precio: 5.50, iva: 10});
    datos.push({id: 207, nombre: '014 Coca briox Crema Mini', precio: 3.00, iva: 10});
    datos.push({id: 208, nombre: 'BOTELLA DE LECHE', precio: 1.70, iva: 10});
    datos.push({id: 209, nombre: '004 Coca briox Fruta Grande', precio: 16.50, iva: 10});
    datos.push({id: 210, nombre: '005 Coca briox Fruta Mediana', precio: 10.50, iva: 10});
    datos.push({id: 211, nombre: '006 Coca briox Fruta Pequeña', precio: 5.50, iva: 10});
    datos.push({id: 212, nombre: 'velas', precio: 0.60, iva: 10});
    datos.push({id: 213, nombre: '008 coca hojaldre cabello Grande', precio: 16.50, iva: 10});
    datos.push({id: 214, nombre: '010 coca hojaldre cabello Mediana', precio: 10.50, iva: 10});
    datos.push({id: 215, nombre: 'Caja Infusion', precio: 6.00, iva: 10});
    datos.push({id: 216, nombre: '009 Coca Hojaldre Crema Grande', precio: 16.50, iva: 10});
    datos.push({id: 217, nombre: '011 Coca Hojaldre Crema Mediana', precio: 10.50, iva: 10});
    datos.push({id: 218, nombre: 'Invitación cafe', precio: 0, iva: 10});
    datos.push({id: 219, nombre: '012 Coca Llardons Diada grande', precio: 10.50, iva: 10});
    datos.push({id: 220, nombre: '013 Coca Llardons Diada Mediana', precio: 5.50, iva: 10});
    datos.push({id: 221, nombre: 'suplemento', precio: 0.40, iva: 10});
    datos.push({id: 222, nombre: '007 Coca Chocolate Mediana', precio: 12.50, iva: 10});
    datos.push({id: 223, nombre: '019 Coca Rellena Nata Mediana Fruta', precio: 17.50, iva: 10});
    datos.push({id: 224, nombre: 'Bolsa de plastico', precio: 0.03, iva: 10});
   
    db.articulos.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearTecladoAMano");
    });
}

function insertarTeclado8()
{
    var teclas = [];
    teclas.push({id: 203, posicion: 1});
    teclas.push({id: 204, posicion: 2});
    teclas.push({id: 205, posicion: 3});
    teclas.push({id: 206, posicion: 4});
    teclas.push({id: 207, posicion: 5});
    teclas.push({id: 208, posicion: 6});

    teclas.push({id: 209, posicion: 8});
    teclas.push({id: 210, posicion: 9});
    teclas.push({id: 211, posicion: 10});
    teclas.push({id: 212, posicion: 12});

    teclas.push({id: 213, posicion: 14});
    teclas.push({id: 214, posicion: 15});
    teclas.push({id: 215, posicion: 18});

    teclas.push({id: 216, posicion: 20});
    teclas.push({id: 217, posicion: 21});
    teclas.push({id: 218, posicion: 24});

    teclas.push({id: 219, posicion: 26});
    teclas.push({id: 220, posicion: 27});
    teclas.push({id: 221, posicion: 30});

    teclas.push({id: 222, posicion: 32});
    teclas.push({id: 223, posicion: 33});
    teclas.push({id: 224, posicion: 36});

    db.teclado.put({id: 8, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function crearDemoCompleta()
{
    insertarPromociones();
    crearTecladoAMano0();
    crearTecladoAMano1();
    crearTecladoAMano2();
    crearTecladoAMano3();
    crearTecladoAMano4();
    crearTecladoAMano5();
    crearTecladoAMano6();
    crearTecladoAMano7();
    crearTecladoAMano8();

    insertarTeclado0();
    insertarTeclado1();
    insertarTeclado2();
    insertarTeclado3();
    insertarTeclado4();
    insertarTeclado5();
    insertarTeclado6();
    insertarTeclado7();
    insertarTeclado8();
}

function crearOfertasUnidades()
{
    var datos = [];
    datos.push({id: 1, precioTotal: null, precioUnidad: 0.266, idArticulo: 122});


    db.ofertasUnidades.bulkPut(datos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error("Error de crearOfertasUnidades");
    });
}