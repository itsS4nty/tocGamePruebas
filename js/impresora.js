var escpos = require('escpos');

var imprimirPrueba = function(numFactura, arrayCompra, total, visa)
{
	var detalles = '';
	var pagoTarjeta = '';
	for(let i = 0; i < arrayCompra.length; i++)
	{
		detalles += `${arrayCompra[i].cantidad}     ${arrayCompra[i].articuloNombre}   ${arrayCompra[i].importe}  e\n`;
	}
	var fecha = new Date();
	if(visa)
	{
		pagoTarjeta = '----------- PAGADO CON TARJETA ---------\n';
	}

	device.open(function(){
	  printer
	  .encode('EUC-KR')
	  .size(2, 2)
	  .text('PA NATURAL')
	  .size(1, 1)
	  .text('C Antoni Forrellat 116, 6')
	  .text('Sabadell - 08207')

	  .text('Tel. 937175121')
	  .text('Data: ' + fecha.getDate() + '-' + fecha.getMonth() + '-' + fecha.getFullYear() + ' ' + fecha.getHours() + ':' + fecha.getMinutes())
	  .text('Factura simplificada N: ' + numFactura)
	  .control('LF')
	  .control('LF')
	  .control('LF')
	  .control('LF')
	  .text('Quantitat      Article             Import')
	  .text('-----------------------------------------')
	  .text(detalles)
	  .text(pagoTarjeta)
	  .size(2, 2)
	  .text('TOTAL: '  + total + ' euros')
	  .size(1, 1)
	  .text('IVA 10% : '+ (total/1.1).toFixed(2) + ' euros')
	  .text('          GRACIES PER LA SEVA VISITA')
	  .control('LF')
	  .control('LF')
	  .control('LF')
	  .cut('PAPER_FULL_CUT')
	  .close()
	});
}
 
// Select the adapter based on your printer type

	/*
	var device = new escpos.USB('0x4B8', '0x202'); //ESTE ES EL BUENO
	var options = { encoding: "GB18030" }
	var printer = new escpos.Printer(device, options); 
	*/

module.exports = imprimirPrueba;