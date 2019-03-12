<?php

include("db.php");

openDB();

$sql = odbc_prepare($ConnDB, "DROP TABLE [DEFAULT_DEPENDENTES]"); 
$exec = odbc_execute($sql, array());
//if (!$exec) exit("drop");

$sql = odbc_prepare($ConnDB, "CREATE TABLE [DEFAULT_DEPENDENTES] (codi int, nom nvarchar(255), password nvarchar(255))"); 
$exec = odbc_execute($sql, array());
if (!$exec) exit("create");

$dep = array(
'Adrienne Wilkerson',
'Alonso Chavez Yanac',
'Anahi Giovanna',
'Andres Samaniego',
'Andres Vera',
'Antonio Hernandez',
'Aramis Gonzales',
'Bart Angel',
'Byron Yeraldo Gomez Calix',
'Carmina Guerra Viejo',
'Casey Stoner*',
'Chantelle Rocheleau',
'Charlie O\'neal',
'Clare Newby',
'Claudio Testa',
'Cristhian Ruiz Asanza',
'Cristina Plaza',
'David Losada López',
'Dominika Pohl',
'Edilberto Correa Gaviria',
'Elena Lebedeva',
'Elizabeth Santiago',
'Enriqueta Chavez',
'Escena Miriñaque',
'Esther Sànchez Sànchez',
'Flor Mejia Hernandez',
'Gil Vdd',
'Guzmán Tena',
'Jamie Ferro',
'Job Recososa',
'Johnny Castro',
'Jordi Caballé',
'Jordi Serrano Biarnés',
'Juan Jose Ortega Madrgal',
'Julian Muñoz Fernand',
'Justin Mcconathy',
'Leticia Diaz',
'Lorena Manzano',
'Luis Gonzalez',
'Marco Koehler',
'Marina del Mar',
'Marines Rojas de Diaz',
'Marisa Rostro',
'Marlon Waniwan',
'Matthy Peralta',
'Melanny Espinoza',
'Michelle Onlyme Tanner',
'Miguel Ángel Gómez Linares',
'Miriam Saenz',
'Mizan Amran',
'Mohamed Faisal',
'Mohmad Al Bezrah',
'Monik Irimia',
'Natalie Gründel',
'Nenita Bernardi',
'Nicky Lewis-whisper',
'Nikki Wiater',
'Nita Rm',
'Noe Mi',
'Odiana Thompson',
'Olof Lundh',
'Palmy Gomez',
'Panagoulias Dimitris',
'Papa Papaeva',
'Parami Jewels',
'Paul Elliott',
'Paulina Genea',
'Peña Dani Sordo',
'Pedro Pascual',
'Piedad Rosas',
'Ranma Saotome',
'Raqel Cazorla',
'Raul Vazquez',
'Robles Ana',
'Roseline Sarr',
'Rui Manuel Da Silva',
'Sébastien Loeb',
'Sebastian Vargas',
'Sebastian Vettel',
'Sergio Temporal Herreros',
'Shay Maria',
'Stephanie Hardin',
'Sunny Jain',
'Susan Saundersleo',
'Susie Kreutzer',
'Tomas M. Leskó',
'Vero Nika',
'William Levy',
'Yuliana Vargas Peralta');


$sql = odbc_prepare($ConnDB, "DELETE FROM [DEFAULT_DEPENDENTES] WHERE codi = ?"); 
for ($i=0; $i<sizeOf($dep); $i++) {
	$exec = odbc_execute($sql, array($i*10+1000));
	if (!$exec) exit("delete");
}

$sql = odbc_prepare($ConnDB, "INSERT INTO [DEFAULT_DEPENDENTES] VALUES (?,?,?)"); 
for ($i=0; $i<sizeOf($dep); $i++) {
	$d = $dep[$i];
echo("$i\n");
echo("$d\n");
echo(strpos($d,' ',1)."\n");
	for ($passw = $d[0], $pos=0; ($pos = strpos($d,' ',$pos+1)) !== FALSE;) { 
		$pos++; if ($pos < strlen($d)) $passw .= $d[$pos]; 
	}
echo("$passw\n");
	$exec = odbc_execute($sql, array($i*10+1000, $d, strtolower($passw)));
	if (!$exec) exit("insert");
}

closeDB();

?>
