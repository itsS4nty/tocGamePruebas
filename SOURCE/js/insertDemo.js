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
    var articulosNecesarios = [];

    articulosNecesarios.push('[{"idArticulo": 122,"unidadesNecesarias":3}]');
    articulosNecesarios.push('[{"idArticulo":21,"unidadesNecesarias":1}, {"idArticulo":122,"unidadesNecesarias":3}]');
    articulosNecesarios.push('[{"idArticulo":113,"unidadesNecesarias":1}, {"idArticulo":117,"unidadesNecesarias":1}]');
  
    db.promociones.put({id: "promo0", nombre: "Oferta 3 fartons", precioFinal: 0.2666, articulosNecesarios: articulosNecesarios[0]}).then(function(){
        console.log("Promoción agregada correctamente");
    });
    db.promociones.put({id: "promo1", nombre: "Horchata + Fartó", precioFinal: 2.7, articulosNecesarios: articulosNecesarios[1]}).then(function(){
        console.log("Promoción agregada correctamente");
    });

    db.promociones.put({id: "promo2", nombre: "Oferta Madalena + Mini berlina", precioFinal: 2, articulosNecesarios: articulosNecesarios[2]}).then(function(){
        console.log("Promoción agregada correctamente");
    });
}

function insertarTeclado0()
{
    var teclas = [];
    teclas.push({id: 4881, posicion: 1});
    teclas.push({id: 5435, posicion: 2});
    teclas.push({id: 4753, posicion: 3});
    teclas.push({id: 9675, posicion: 4});
    teclas.push({id: 14880, posicion: 5});
    teclas.push({id: 5096, posicion: 6});
    teclas.push({id: 4880, posicion: 7});
    teclas.push({id: 15729, posicion: 8});
    teclas.push({id: 5906, posicion: 9});
    teclas.push({id: 5871, posicion: 10});
    teclas.push({id: 7975, posicion: 11});
    teclas.push({id: 4879, posicion: 13});
    teclas.push({id: 5427, posicion: 14});
    teclas.push({id: 7951, posicion: 15});
    teclas.push({id: 5730, posicion: 16});
    teclas.push({id: 5835, posicion: 18});
    teclas.push({id: 4896, posicion: 19});
    teclas.push({id: 5175, posicion: 20});
    teclas.push({id: 5728, posicion: 22});
    teclas.push({id: 4890, posicion: 23});
    teclas.push({id: 5210, posicion: 24});
    teclas.push({id: 4883, posicion: 25});
    teclas.push({id: 15697, posicion: 26});
    teclas.push({id: 5336, posicion: 27});
    teclas.push({id: 5727, posicion: 28});
    teclas.push({id: 7979, posicion: 29});
    teclas.push({id: 7977, posicion: 30});
    teclas.push({id: 7046, posicion: 31});
    teclas.push({id: 6023, posicion: 32});
    teclas.push({id: 15505, posicion: 33});
    teclas.push({id: 4950, posicion: 34});
    teclas.push({id: 5583, posicion: 35});
    teclas.push({id: 7969, posicion: 36});

    db.teclado.put({id: 0, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}
function insertarTeclado0()
{
    var teclas = [];
    teclas.push({id: 4881, posicion: 1});
    teclas.push({id: 5435, posicion: 2});
    teclas.push({id: 4753, posicion: 3});
    teclas.push({id: 9675, posicion: 4});
    teclas.push({id: 14880, posicion: 5});
    teclas.push({id: 5096, posicion: 6});
    teclas.push({id: 4880, posicion: 7});
    teclas.push({id: 15729, posicion: 8});
    teclas.push({id: 5906, posicion: 9});
    teclas.push({id: 5871, posicion: 10});
    teclas.push({id: 7975, posicion: 11});
    teclas.push({id: 4879, posicion: 13});
    teclas.push({id: 5427, posicion: 14});
    teclas.push({id: 7951, posicion: 15});
    teclas.push({id: 5730, posicion: 16});
    teclas.push({id: 5835, posicion: 18});
    teclas.push({id: 4896, posicion: 19});
    teclas.push({id: 5175, posicion: 20});
    teclas.push({id: 5728, posicion: 22});
    teclas.push({id: 4890, posicion: 23});
    teclas.push({id: 5210, posicion: 24});
    teclas.push({id: 4883, posicion: 25});
    teclas.push({id: 15697, posicion: 26});
    teclas.push({id: 5336, posicion: 27});
    teclas.push({id: 5727, posicion: 28});
    teclas.push({id: 7979, posicion: 29});
    teclas.push({id: 7977, posicion: 30});
    teclas.push({id: 7046, posicion: 31});
    teclas.push({id: 6023, posicion: 32});
    teclas.push({id: 15505, posicion: 33});
    teclas.push({id: 4950, posicion: 34});
    teclas.push({id: 5583, posicion: 35});
    teclas.push({id: 7969, posicion: 36});

    db.teclado.put({id: 0, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado1()
{
    var teclas = [];
    teclas.push({id: 7975, posicion: 1});
    teclas.push({id: 14880, posicion: 2});
    teclas.push({id: 5427, posicion: 3});
    teclas.push({id: 5583, posicion: 4});
    teclas.push({id: 7979, posicion: 5});
    teclas.push({id: 15728, posicion: 6});
    teclas.push({id: 5272, posicion: 7});
    teclas.push({id: 4890, posicion: 8});
    teclas.push({id: 5435, posicion: 9});
    teclas.push({id: 4804, posicion: 10});
    teclas.push({id: 7978, posicion: 11});
    teclas.push({id: 7808, posicion: 13});
    teclas.push({id: 7977, posicion: 14});
    teclas.push({id: 15729, posicion: 15});
    teclas.push({id: 5906, posicion: 16});
    teclas.push({id: 15696, posicion: 18});
    teclas.push({id: 15686, posicion: 25});
    teclas.push({id: 15687, posicion: 26});
    teclas.push({id: 15689, posicion: 27});
    teclas.push({id: 15691, posicion: 28});
    teclas.push({id: 15692, posicion: 29});
    teclas.push({id: 15694, posicion: 30});
    teclas.push({id: 15685, posicion: 31});
    teclas.push({id: 15688, posicion: 32});
    teclas.push({id: 15690, posicion: 33});
    teclas.push({id: 15732, posicion: 34});
    teclas.push({id: 15693, posicion: 36});

    db.teclado.put({id: 1, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado2()
{
    var teclas = [];
    teclas.push({id: 15700, posicion: 1});
    teclas.push({id: 15701, posicion: 2});
    teclas.push({id: 15705, posicion: 3});
    teclas.push({id: 15704, posicion: 4});
    teclas.push({id: 15708, posicion: 5});
    teclas.push({id: 15707, posicion: 6});
    teclas.push({id: 15706, posicion: 7});
    teclas.push({id: 15702, posicion: 8});
    teclas.push({id: 15703, posicion: 9});
    teclas.push({id: 15730, posicion: 10});
    teclas.push({id: 15709, posicion: 11});
    teclas.push({id: 15721, posicion: 12});
    teclas.push({id: 15713, posicion: 19});
    teclas.push({id: 15714, posicion: 20});
    teclas.push({id: 15718, posicion: 21});
    teclas.push({id: 15717, posicion: 22});
    teclas.push({id: 15710, posicion: 23});
    teclas.push({id: 15711, posicion: 24});
    teclas.push({id: 15719, posicion: 25});
    teclas.push({id: 15715, posicion: 26});
    teclas.push({id: 15716, posicion: 27});
    teclas.push({id: 15731, posicion: 28});
    teclas.push({id: 15712, posicion: 29});
    teclas.push({id: 15720, posicion: 30});

    db.teclado.put({id: 2, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado3()
{
    var teclas = [];
    teclas.push({id: 1012, posicion: 1});
    teclas.push({id: 1090, posicion: 2});
    teclas.push({id: 1042, posicion: 3});
    teclas.push({id: 7438, posicion: 4});
    teclas.push({id: 3912, posicion: 5});
    teclas.push({id: 3913, posicion: 6});
    teclas.push({id: 1013, posicion: 7});
    teclas.push({id: 1124, posicion: 8});
    teclas.push({id: 8961, posicion: 9});
    teclas.push({id: 9329, posicion: 10});
    teclas.push({id: 5807, posicion: 11});
    teclas.push({id: 3907, posicion: 12});
    teclas.push({id: 1049, posicion: 13});
    teclas.push({id: 1049, posicion: 14});
    teclas.push({id: 1003, posicion: 15});
    teclas.push({id: 7442, posicion: 16});
    teclas.push({id: 3925, posicion: 17});
    teclas.push({id: 12982, posicion: 18});
    teclas.push({id: 7585, posicion: 19});
    teclas.push({id: 5134, posicion: 20});
    teclas.push({id: 1023, posicion: 21});
    teclas.push({id: 3922, posicion: 22});
    teclas.push({id: 3926, posicion: 23});
    teclas.push({id: 1018, posicion: 24});
    teclas.push({id: 4988, posicion: 26});
    teclas.push({id: 7435, posicion: 27});
    teclas.push({id: 3910, posicion: 28});
    teclas.push({id: 3924, posicion: 29});
    teclas.push({id: 3914, posicion: 30});
    teclas.push({id: 1023, posicion: 31});
    teclas.push({id: 3928, posicion: 32});
    teclas.push({id: 4893, posicion: 34});
    teclas.push({id: 3927, posicion: 35});
    teclas.push({id: 9328, posicion: 36});

    db.teclado.put({id: 3, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado4()
{
    var teclas = [];
    teclas.push({id: 2114, posicion: 1});
    teclas.push({id: 2134, posicion: 2});
    teclas.push({id: 6226, posicion: 3});
    teclas.push({id: 3114, posicion: 4});
    teclas.push({id: 2120, posicion: 5});
    teclas.push({id: 2152, posicion: 6});
    teclas.push({id: 2116, posicion: 7});
    teclas.push({id: 2117, posicion: 8});
    teclas.push({id: 2119, posicion: 9});
    teclas.push({id: 9557, posicion: 10});
    teclas.push({id: 12133, posicion: 11});
    teclas.push({id: 6057, posicion: 12});
    teclas.push({id: 2113, posicion: 13});
    teclas.push({id: 2110, posicion: 14});
    teclas.push({id: 2114, posicion: 15});
    teclas.push({id: 2118, posicion: 16});
    teclas.push({id: 7010, posicion: 18});
    teclas.push({id: 5673, posicion: 20});
    teclas.push({id: 5089, posicion: 21});
    teclas.push({id: 8159, posicion: 22});
    teclas.push({id: 2171, posicion: 25});
    teclas.push({id: 5017, posicion: 26});
    teclas.push({id: 2111, posicion: 27});
    teclas.push({id: 2131, posicion: 32});
    teclas.push({id: 8751, posicion: 33});
    teclas.push({id: 5905, posicion: 34});
    teclas.push({id: 2170, posicion: 36});

    db.teclado.put({id: 4, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado5()
{
    var teclas = [];
    teclas.push({id: 5695, posicion: 1});
    teclas.push({id: 10032, posicion: 4});
    teclas.push({id: 15562, posicion: 5});
    teclas.push({id: 1412, posicion: 6});
    teclas.push({id: 5694, posicion: 7});
    teclas.push({id: 1205, posicion: 8});
    teclas.push({id: 1716, posicion: 9});
    teclas.push({id: 12417, posicion: 10});
    teclas.push({id: 14152, posicion: 13});
    teclas.push({id: 1203, posicion: 14});
    teclas.push({id: 12418, posicion: 16});
    teclas.push({id: 1430, posicion: 18});
    teclas.push({id: 5696, posicion: 19});
    teclas.push({id: 5552, posicion: 20});
    teclas.push({id: 5443, posicion: 23});
    teclas.push({id: 5697, posicion: 25});
    teclas.push({id: 5634, posicion: 26});
    teclas.push({id: 8752, posicion: 29});
    teclas.push({id: 8753, posicion: 35});
    teclas.push({id: 1420, posicion: 36});

    db.teclado.put({id: 5, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado6()
{
    var teclas = [];
    teclas.push({id: 1350, posicion: 1});
    teclas.push({id: 1330, posicion: 3});
    teclas.push({id: 1411, posicion: 4});
    teclas.push({id: 1100, posicion: 5});
    teclas.push({id: 1110, posicion: 6});
    teclas.push({id: 1352, posicion: 7});
    teclas.push({id: 1335, posicion: 9});
    teclas.push({id: 1410, posicion: 10});
    teclas.push({id: 1101, posicion: 11});
    teclas.push({id: 6480, posicion: 12});
    teclas.push({id: 1353, posicion: 13});
    teclas.push({id: 1401, posicion: 14});
    teclas.push({id: 1333, posicion: 15});
    teclas.push({id: 5312, posicion: 16});
    teclas.push({id: 1103, posicion: 17});
    teclas.push({id: 7338, posicion: 18});
    teclas.push({id: 1351, posicion: 19});
    teclas.push({id: 12990, posicion: 20});
    teclas.push({id: 1339, posicion: 21});
    teclas.push({id: 1419, posicion: 22});
    teclas.push({id: 1232, posicion: 23});
    teclas.push({id: 7641, posicion: 24});
    teclas.push({id: 15560, posicion: 26});
    teclas.push({id: 1331, posicion: 27});
    teclas.push({id: 10624, posicion: 28});
    teclas.push({id: 10214, posicion: 29});
    teclas.push({id: 6512, posicion: 30});
    teclas.push({id: 1390, posicion: 32});
    teclas.push({id: 10668, posicion: 34});
    teclas.push({id: 6511, posicion: 35});
    teclas.push({id: 8605, posicion: 36});

    db.teclado.put({id: 6, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado7()
{
    var teclas = [];
    teclas.push({id: 13458, posicion: 1});
    teclas.push({id: 1210, posicion: 3});
    teclas.push({id: 1713, posicion: 4});
    teclas.push({id: 1254, posicion: 7});
    teclas.push({id: 1212, posicion: 9});
    teclas.push({id: 1214, posicion: 10});
    teclas.push({id: 1258, posicion: 12});
    teclas.push({id: 12002, posicion: 13});
    teclas.push({id: 7042, posicion: 15});
    teclas.push({id: 1216, posicion: 16});
    teclas.push({id: 6502, posicion: 18});
    teclas.push({id: 5608, posicion: 20});
    teclas.push({id: 5864, posicion: 21});
    teclas.push({id: 1220, posicion: 22});
    teclas.push({id: 1281, posicion: 23});
    teclas.push({id: 1249, posicion: 25});
    teclas.push({id: 5690, posicion: 26});
    teclas.push({id: 5679, posicion: 27});
    teclas.push({id: 1240, posicion: 28});
    teclas.push({id: 1272, posicion: 29});
    teclas.push({id: 10037, posicion: 31});
    teclas.push({id: 10034, posicion: 32});
    teclas.push({id: 10033, posicion: 33});
    teclas.push({id: 10032, posicion: 34});
    teclas.push({id: 5344, posicion: 35});
    teclas.push({id: 4103, posicion: 36});

    db.teclado.put({id: 7, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado8()
{
    var teclas = [];
    teclas.push({id: 4999, posicion: 1});
    teclas.push({id: 2142, posicion: 2});
    teclas.push({id: 2140, posicion: 3});
    teclas.push({id: 2100, posicion: 4});
    teclas.push({id: 10567, posicion: 5});
    teclas.push({id: 8569, posicion: 6});
    teclas.push({id: 5000, posicion: 7});
    teclas.push({id: 7046, posicion: 8});
    teclas.push({id: 8569, posicion: 10});
    teclas.push({id: 10296, posicion: 11});
    teclas.push({id: 7109, posicion: 12});
    teclas.push({id: 11106, posicion: 13});
    teclas.push({id: 7545, posicion: 14});
    teclas.push({id: 10311, posicion: 15});
    teclas.push({id: 14870, posicion: 16});
    teclas.push({id: 4854, posicion: 17});
    teclas.push({id: 5582, posicion: 18});
    teclas.push({id: 7204, posicion: 19});
    teclas.push({id: 14680, posicion: 20});
    teclas.push({id: 14053, posicion: 21});
    teclas.push({id: 12170, posicion: 22});
    teclas.push({id: 9550, posicion: 23});
    teclas.push({id: 5556, posicion: 24});
    teclas.push({id: 11283, posicion: 26});
    teclas.push({id: 2100, posicion: 27});
    teclas.push({id: 14324, posicion: 28});
    teclas.push({id: 1357, posicion: 29});
    teclas.push({id: 8599, posicion: 30});
    teclas.push({id: 11284, posicion: 31});
    teclas.push({id: 8621, posicion: 32});
    teclas.push({id: 10656, posicion: 33});
    teclas.push({id: 5944, posicion: 34});
    teclas.push({id: 1358, posicion: 35});
    teclas.push({id: 1361, posicion: 36});

    db.teclado.put({id: 8, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado9()
{
    var teclas = [];
    teclas.push({id: 1005, posicion: 1});
    teclas.push({id: 3910, posicion: 2});
    teclas.push({id: 7441, posicion: 3});
    teclas.push({id: 3928, posicion: 4});
    teclas.push({id: 1060, posicion: 7});
    teclas.push({id: 4893, posicion: 8});
    teclas.push({id: 9329, posicion: 9});
    teclas.push({id: 3925, posicion: 10});
    teclas.push({id: 7974, posicion: 11});
    teclas.push({id: 12982, posicion: 12});
    teclas.push({id: 1003, posicion: 13});
    teclas.push({id: 3912, posicion: 14});
    teclas.push({id: 9310, posicion: 15});
    teclas.push({id: 3924, posicion: 16});
    teclas.push({id: 3907, posicion: 17});
    teclas.push({id: 3913, posicion: 18});
    teclas.push({id: 11764, posicion: 19});
    teclas.push({id: 11764, posicion: 20});
    teclas.push({id: 9328, posicion: 21});
    teclas.push({id: 11766, posicion: 22});
    teclas.push({id: 3927, posicion: 23});
    teclas.push({id: 3914, posicion: 24});
    teclas.push({id: 1018, posicion: 26});
    teclas.push({id: 11765, posicion: 28});
    teclas.push({id: 7431, posicion: 29});
    teclas.push({id: 9346, posicion: 30});
    teclas.push({id: 10325, posicion: 31});
    teclas.push({id: 3926, posicion: 34});

    db.teclado.put({id: 9, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado10()
{
    var teclas = [];
    teclas.push({id: 40, posicion: 1});
    teclas.push({id: 5012, posicion: 2});
    teclas.push({id: 13180, posicion: 3});
    teclas.push({id: 506, posicion: 4});
    teclas.push({id: 3500, posicion: 5});
    teclas.push({id: 10116, posicion: 6});
    teclas.push({id: 41, posicion: 7});
    teclas.push({id: 4581, posicion: 8});
    teclas.push({id: 6195, posicion: 9});
    teclas.push({id: 3501, posicion: 11});
    teclas.push({id: 4583, posicion: 12});
    teclas.push({id: 47, posicion: 13});
    teclas.push({id: 4, posicion: 15});
    teclas.push({id: 2, posicion: 16});
    teclas.push({id: 4769, posicion: 17});
    teclas.push({id: 4582, posicion: 18});
    teclas.push({id: 3500, posicion: 20});
    teclas.push({id: 3501, posicion: 21});
    teclas.push({id: 10981, posicion: 28});
    teclas.push({id: 10, posicion: 31});
    teclas.push({id: 8, posicion: 32});
    teclas.push({id: 6, posicion: 33});
    teclas.push({id: 18, posicion: 34});
    teclas.push({id: 16, posicion: 35});
    teclas.push({id: 14, posicion: 36});

    db.teclado.put({id: 10, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado11()
{
    var teclas = [];

    teclas.push({id: 94, posicion: 1});
    teclas.push({id: 38, posicion: 2});
    teclas.push({id: 42, posicion: 3});
    teclas.push({id: 13180, posicion: 4});
    teclas.push({id: 82, posicion: 5});
    teclas.push({id: 5003, posicion: 6});
    teclas.push({id: 93, posicion: 7});
    teclas.push({id: 39, posicion: 8});
    teclas.push({id: 43, posicion: 9});
    teclas.push({id: 12176, posicion: 11});
    teclas.push({id: 5787, posicion: 12});
    teclas.push({id: 14009, posicion: 16});
    teclas.push({id: 8290, posicion: 17});
    teclas.push({id: 46, posicion: 18});
    teclas.push({id: 6559, posicion: 19});
    teclas.push({id: 6653, posicion: 20});
    teclas.push({id: 6652, posicion: 21});
    teclas.push({id: 6558, posicion: 22});
    teclas.push({id: 5961, posicion: 23});
    teclas.push({id: 11121, posicion: 24});
    teclas.push({id: 10611, posicion: 26});
    teclas.push({id: 10618, posicion: 27});
    teclas.push({id: 13184, posicion: 28});
    teclas.push({id: 9524, posicion: 29});
    teclas.push({id: 9709, posicion: 30});
    teclas.push({id: 23, posicion: 31});
    teclas.push({id: 21, posicion: 32});
    teclas.push({id: 20, posicion: 33});
    teclas.push({id: 35, posicion: 34});
    teclas.push({id: 14681, posicion: 35});
    teclas.push({id: 9564, posicion: 36});
    db.teclado.put({id: 11, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}

function insertarTeclado12()
{
    var teclas = [];

    teclas.push({id: 201, posicion: 1});
    teclas.push({id: 210, posicion: 2});
    teclas.push({id: 9012, posicion: 3});
    teclas.push({id: 512, posicion: 4});
    teclas.push({id: 9261, posicion: 5});
    teclas.push({id: 301, posicion: 6});
    teclas.push({id: 4762, posicion: 7});
    teclas.push({id: 212, posicion: 8});
    teclas.push({id: 10696, posicion: 9});
    teclas.push({id: 504, posicion: 10});
    teclas.push({id: 14217, posicion: 11});
    teclas.push({id: 303, posicion: 12});
    teclas.push({id: 10618, posicion: 13});
    teclas.push({id: 9011, posicion: 15});
    teclas.push({id: 312, posicion: 18});
    teclas.push({id: 13180, posicion: 19});
    teclas.push({id: 69, posicion: 20});
    teclas.push({id: 310, posicion: 24});
    teclas.push({id: 427, posicion: 26});
    teclas.push({id: 64, posicion: 27});
    teclas.push({id: 9524, posicion: 28});
    teclas.push({id: 7769, posicion: 29});
    teclas.push({id: 6653, posicion: 31});
    teclas.push({id: 7722, posicion: 33});
    teclas.push({id: 11672, posicion: 35});
    teclas.push({id: 11321, posicion: 36});

    db.teclado.put({id: 12, arrayTeclado: teclas}).then(function(){
        console.log("Teclado agregado correctamente");
    });
}
function crearDemoCompleta()
{
    insertarPromociones();
    insertarArticulosPaNatural();
    /*
    crearTecladoAMano0();
    crearTecladoAMano1();
    crearTecladoAMano2();
    crearTecladoAMano3();
    crearTecladoAMano4();
    crearTecladoAMano5();
    crearTecladoAMano6();
    crearTecladoAMano7();
    crearTecladoAMano8();
*/
    insertarTeclado0();
    insertarTeclado1();
    insertarTeclado2();
    insertarTeclado3();
    insertarTeclado4();
    insertarTeclado5();
    insertarTeclado6();
    insertarTeclado7();
    insertarTeclado8();
    insertarTeclado9();
    insertarTeclado10();
    insertarTeclado11();
   /* insertarTeclado1();
    insertarTeclado2();
    insertarTeclado3();
    insertarTeclado4();
    insertarTeclado5();
    insertarTeclado6();
    insertarTeclado7();
    insertarTeclado8();
    */
}

function crearDemoTeclado()
{
    db.menus.put({id: 0, nombre: "Menu Primero", color: "FFFFF"});
    db.submenus.put({id: 0, idPadre: 0, nombre: "Submenú Primero", idTeclado: 0, color: "FFFFF"});
    db.submenus.put({id: 1, idPadre: 0, nombre: "Submenú Segundo", idTeclado: 1, color: "FFFFF"});
    db.submenus.put({id: 2, idPadre: 0, nombre: "Submenú Tercero", idTeclado: 2, color: "FFFFF"});
    db.submenus.put({id: 3, idPadre: 0, nombre: "Submenú Cuarto", idTeclado: 2, color: "FFFFF"});
    db.submenus.put({id: 4, idPadre: 0, nombre: "Submenú Quinto", idTeclado: 2, color: "FFFFF"});
    db.submenus.put({id: 5, idPadre: 0, nombre: "Submenú Sexto", idTeclado: 2, color: "FFFFF"});
}