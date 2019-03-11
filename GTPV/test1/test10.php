<pre>
<?php

$d1 = new DateTime("now");
$d2 = new DateTime("now",new DateTimeZone("UTC"));
var_dump($d1->getTimestamp());
var_dump($d2->getTimestamp());

$d3 = new DateTime("2015-08-13T18:22:43.034Z");
var_dump($d3->format(DateTime::ISO8601));

$d4 = new DateTime();

$d3->setTimeZone($d4->getTimeZone());
var_dump($d3->format(DateTime::ISO8601));
var_dump($d3->format("I"));

echo "\n";

$d3 = new DateTime("2015-08-13T18:22:43.034Z");
var_dump($d3->format(DateTime::ISO8601));
$d4 = new DateTime();
$d4->setTimestamp($d3->getTimestamp());
var_dump($d4->format(DateTime::ISO8601));

var_dump((int)4.7);

?>
