<?php

header("Content-type: text/xml; charset=iso-8859-1");
include("db.php");
openDB();
$sql = odbc_prepare($ConnDB, "select nom from E_Punset_Dependentes");
odbc_execute($sql, array());

$docOut = new DOMDocument('1.0', 'utf-8');

$docEl = $docOut->appendChild($docOut->createElement("xml")); 
$docEl->appendChild($docOut->createElement("q", "hh àlonso"));
odbc_fetch_row($sql);
$dep = odbc_result($sql, 1);
$docEl->appendChild($docOut->createElement("w", $dep));

echo ($docOut->saveXML());

echo("hh àlonso");
echo('hh àlonso');
echo($dep);

?>

