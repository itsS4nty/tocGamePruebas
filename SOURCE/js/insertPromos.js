function insertarPromociones()
{
    var promos = [];
    promos.push({id: 0, nombre: "Promo 5 fartons", precioFinal: 0.8, articulosNecesarios: '[{"idArticulo":122,"unidadesNecesarias":5}]'});
    promos.push({id: 1, nombre: "Promo cañita cabello + chocolate", precioFinal: 1.2, articulosNecesarios: '[{"idArticulo":125,"unidadesNecesarias":1}, {"idArticulo": 126, "unidadesNecesarias": 1}]'});

    db.promociones.bulkPut(promos).then(function(lastKey) {
        
    }).catch(Dexie.BulkError, function (e) {
        console.error("Error al insertar promociones");
    });
}