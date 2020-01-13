const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
var net = require('net');
//var impresora = require('./componentes/impresoras');
var escpos = require('escpos');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
app.on('ready', () => {
    var ventanaPrincipal = new BrowserWindow({
        kiosk: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    ventanaPrincipal.loadFile('./web/index.html');
    ventanaPrincipal.webContents.openDevTools();
});
/* ACCIONES IPC-MAIN */
ipcMain.on('venta', (event, args) => {

    event.sender.send('canal1', 'PUTO');
});

ipcMain.on('devolucion', (event, args) => {

});
ipcMain.on('anulacion', (event, args) => {

});
ipcMain.on('consulta', (event, args) => {

});
ipcMain.on('imprimir', (event, args) => {

});
    /* FINAL ACCIONES IPC-MAIN */
/*
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');


app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());

app.use('/assets', express.static('assets'));
app.use('/imagenes', express.static('imagenes'));
app.use('/js', express.static('js'));
app.use('/node_modules', express.static('node_modules'));

app.get("/", function (req, res) {
    //imprimirPrueba();
    res.sendFile(__dirname + '/index.html');
});

app.post("/imprimirTicket", routes.imprimirTicket);

const server = app.listen(app.get('port'));
const io = socketIO(server);
*/