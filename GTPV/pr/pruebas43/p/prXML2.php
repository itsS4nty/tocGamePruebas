<?php
//header("Content-type: text/xml; charset=iso-8859-1");
header("Content-type: text/xml");

$respDocXML = new DOMDocument('1.0', 'iso-8859-1');
$respXML = $respDocXML->appendChild(new DOMElement("xml")); 

echo("--".$respDocXML->encoding."\n");
echo("--".$respDocXML->xmlEncoding."\n");

function sendRespXML() {
	global $respDocXML;
	echo($respDocXML->saveXML());
}

function appendRespXML($node) {
	global $respXML;
	return $respXML->appendChild($node);	
}

function createElementRespXML($name, $value) {
	global $respDocXML;
	return $respDocXML->createElement($name, $value);	
}

appendRespXML(createElementRespXML("e", "Josep Cuní"));
appendRespXML(createElementRespXML("e", "María José Campanario"));
sendRespXML();

echo("Josep Cuní\n");
echo("María José Campanario\n");

$Conn = FALSE;

function openDB() { 
	global $Conn;
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$Conn = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
}

openDB();
$sql = odbc_prepare($Conn, "SELECT * FROM C_Punset_DEPENDENTES");  
odbc_execute($sql, array()); 
while (odbc_fetch_row($sql)) {
	echo(odbc_result($sql,1)."\n");
}
echo("Josep Cuní\n");
echo("María José Campanario\n");

?>
