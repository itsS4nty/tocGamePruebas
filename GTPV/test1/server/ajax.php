<?php 

include ("main.php");

$jsonIn = json_decode(get_file_contents('php://input'));
$jsonOut = main($jsonIn);

header("Content-Type: application/json; charset=utf-8");
echo json_encode($jsonOut);

?>