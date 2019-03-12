<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Documento sin título</title>
<script src="jquery-1.5.1.js"></script>
</head>

<body>
<pre>
<?php
$dom = new DOMDocument();

$el = $dom->createElement("aa", "bb");
$dom->appendChild($el);
$el = $dom->createElement("aa2", "bb2");
$dom->appendChild($el);
echo ($dom->saveXML());

?>
</pre>
<pre>
<?php
$dom = DOMImplementation::createDocument (null,"xml");
echo ($dom->saveXML());

$el = $dom->createElement("aa", "bb");
$dom->appendChild($el);
$el = $dom->createElement("aa2", "bb2");
$dom->appendChild($el);
echo ($dom->saveXML());

?>
</pre>
</body>
</html>
