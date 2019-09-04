var imprimir = require('../js/impresora');
exports.imprimirTicket = function(req, res) {
  imprimir(req.body.numFactura, req.body.arrayCompra, req.body.total, req.body.visa);
  
  res.json({status: 'ok' }).end();
}