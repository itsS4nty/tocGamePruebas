<?php
$numTel = $_REQUEST['numTel'];

$ch = curl_init("http://www.gestiondelatienda.com2/gettelf.asp?dn=$numTel&q=C&f=S&");
curl_setopt($ch, CURLOPT_TIMEOUT, 3);
$ret = curl_exec($ch);
curl_close($ch);

if (!$ret) echo "!No Name Serv.!"; 
