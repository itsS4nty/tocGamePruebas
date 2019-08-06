function insertarTrabajadores()
{
    var trabajadores = [];
    trabajadores.push({idTrabajador: 1, nombre: 'eze'});
    trabajadores.push({idTrabajador: 2, nombre: 'andres'});
    trabajadores.push({idTrabajador: 3, nombre: 'carissimo'});
    trabajadores.push({idTrabajador: 4, nombre: 'oms'});
    trabajadores.push({idTrabajador: 5, nombre: 'oms yeah'});

    db.trabajadores.bulkPut(trabajadores).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        console.error("Error de insertar trabajadores");
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

function crearDemoCompleta()
{
    crearTecladoAMano0();
    crearTecladoAMano1();
    crearTecladoAMano2();
    crearTecladoAMano3();

    insertarTeclado0();
    insertarTeclado1();
    insertarTeclado2();
    insertarTeclado3();
}
function imprimirTicketReal(idTicket)
{
	//idTicket, timestamp, total, cesta, tarjeta
	var enviarArray = [];
	db.caja.where('idTicket').equals(idTicket).toArray(lista=>{
		console.log(lista);
		for(let i = 0; i < lista[0].cesta.length; i++)
		{
			enviarArray.push({cantidad: lista[0].cesta[i].unidades, articuloNombre: lista[0].cesta[i].nombreArticulo, importe: lista[0].cesta[i].subtotal});
		}
		console.log(enviarArray);
		$.ajax({ 
		   url: '/imprimirTicket',
		   type: 'POST',
		   cache: false, 
	  	   data: JSON.stringify({ numFactura: lista[0].idTicket, arrayCompra: enviarArray, total: lista[0].total, visa: lista[0].tarjeta }),
	 	   contentType: "application/json; charset=utf-8",
	  	   dataType: "json",
		   success: function(data){
			  alert('Success!')
		   }
		   , error: function(jqXHR, textStatus, err){
			   alert('text status '+textStatus+', err '+err)
		   }
		});
	});
}
/*
function pruebaPost()
{
	 $.ajax({ 
	   url: '/imprimirTicket',
	   type: 'POST',
	   cache: false, 
  	   data: JSON.stringify({ numFactura: 12, arrayCompra: 100, total: 3, visa: true }),
 	   contentType: "application/json; charset=utf-8",
  	   dataType: "json",
	   success: function(data){
		  alert('Success!')
	   }
	   , error: function(jqXHR, textStatus, err){
		   alert('text status '+textStatus+', err '+err)
	   }
	});
}
*/