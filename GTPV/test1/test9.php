<pre>
<?php
$abbr=DateTimeZone::listAbbreviations();
/*
var_dump(array_keys($abbr));
var_dump($abbr);
var_dump(DateTimeZone::listIdentifiers());
var_dump(DateTimeZone::listIdentifiers(DateTimeZone::UTC));
var_dump(DateTimeZone::listIdentifiers(DateTimeZone::PACIFIC));
*/
$dt_utc = new DateTimeZone("UTC");
$date_utc = new DateTime("now", $dt_utc);

$date0 = new DateTime('@0');

$date00 = new DateTime();
$date00->setTimestamp(0);
var_dump($date00->format(DateTime::ISO8601));
$dt_00 = $date00->getTimeZone();
var_dump($dt_00->getLocation());
var_dump($dt_00->getName());
var_dump($dt_00->getOffset($date0));
var_dump($dt_00->getOffset($date_utc));
echo "\n";

var_dump($date0->format(DateTime::ISO8601));
$dt_0 = $date0->getTimeZone();
var_dump($dt_0->getLocation());
var_dump($dt_0->getName());
var_dump($dt_0->getOffset($date0));
var_dump($dt_0->getOffset($date_utc));
echo "\n";


var_dump($date_utc->format(DateTime::ISO8601));
var_dump($dt_utc->getLocation());
var_dump($dt_utc->getName());
var_dump($dt_utc->getOffset($date0));
var_dump($dt_utc->getOffset($date_utc));
echo "\n";


$date_00_00 = new DateTime("1970/01/01T00:00:00+0000");
$dt_00_00 = $date_00_00->getTimeZone();
var_dump($date_00_00->format(DateTime::ISO8601));
var_dump($dt_00_00->getLocation());
var_dump($dt_00_00->getName());
var_dump($dt_00_00->getOffset($date0));
var_dump($dt_00_00->getOffset($date_utc));
echo "\n";

$date_local = new DateTime();
var_dump($date_local->format(DateTime::ISO8601));
$dt_local = $date_local->getTimeZone();
var_dump($dt_local->getLocation());
var_dump($dt_local->getName());
var_dump($dt_local->getOffset($date0));
var_dump($dt_local->getOffset($date_utc));
echo "\n";

$date1 = new DateTime("2015/02/02T01:00:00Z");
var_dump($date1->format(DateTime::ISO8601));
$dt1 = $date1->getTimeZone();
var_dump($dt1->getLocation());
var_dump($dt1->getName());
var_dump($dt1->getOffset($date0));
var_dump($dt1->getOffset($date_utc));
echo "\n";

$dt_zulu = new DateTimeZone("ZULU");
var_dump($dt_zulu->getLocation());
var_dump($dt_zulu->getName());
var_dump($dt_zulu->getOffset($date0));
var_dump($dt_zulu->getOffset($date_utc));
echo "\n";

$dt_z = new DateTimeZone("Z");
var_dump($dt_z->getLocation());
var_dump($dt_z->getName());
echo "\n";

?>