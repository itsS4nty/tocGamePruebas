const { ipcRenderer } = require('electron');

function enviar() {
    ipcRenderer.send('canal1', 'ping pong');
}
/* RESPUESTAS ACCIONES IPC-MAIN */
ipcRenderer.on('venta', (ev, args) => {

});
ipcRenderer.on('devolucion', (ev, args) => {

});
ipcRenderer.on('anulacion', (ev, args) => {

});
ipcRenderer.on('consulta', (ev, args) => {

});
ipcRenderer.on('imprimir', (ev, args) => {

});
/* FIN RESPUESTAS ACCIONES IPC-MAIN */

function imprimirEscpos(data) {
    ipcRenderer.send('imprimir', data);
}
function abrirTecladoVirtual() {
    ipcRenderer.send('tecladoVirtual', true);
}
function cerrarPrograma() {
    ipcRenderer.send('cerrarToc', true);
}