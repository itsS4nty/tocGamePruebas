var express = require('express');
var routes	= require('./routes');
var path = require('path');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use('/assets', express.static('assets'));
app.use('/imagenes', express.static('imagenes'));
app.use('/js', express.static('js'));
app.use('/node_modules', express.static('node_modules'));

app.get("/", function(req, res){
    //imprimirPrueba();
    res.sendFile(__dirname + '/index.html');
});

app.post("/imprimirTicket", routes.imprimirTicket);

app.listen(8080);