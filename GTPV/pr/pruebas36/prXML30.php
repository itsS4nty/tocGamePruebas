<?php

$d = new DOMDocument('1.0', 'iso-8859-1');
$d->appendChild(new DOMElement("xml"))->appendChild(new DOMText(utf8_encode('&=<>à&=<>')/*"&rrrr"*/));
echo ($d->saveXML());

?>
