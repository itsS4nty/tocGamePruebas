<?php
echo("<pre>");
var_dump(simplexml_load_string("<comando-Respuesta/>"));
var_dump(simplexml_load_string("<comando-Respuesta></comando-Respuesta>"));
var_dump(simplexml_load_string("<comando-Respuesta>1</comando-Respuesta>"));
echo("</pre>");
?>