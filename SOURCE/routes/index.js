var imprimir = require('../js/impresora');
exports.imprimirTicket = function(req, res) {
  imprimir(req.body.numFactura, req.body.arrayCompra, req.body.total, req.body.visa);
  //console.log(req.body.arrayCompra[0].articuloNombre);
  res.json({status: 'ok' }).end();
}