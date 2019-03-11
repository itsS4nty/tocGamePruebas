<?php
$nombres = array(
	"juan hernandez perez",
	"Jordi Bosch Maso",
	"Mati Garcia Escudero",
	"Jordi Hernandez palomo",
	"Alicia Daza",
	"Alberto fernandez",
	"Monica lopez"
);
	
$comercios = array(
	"Bar el portillo" => array(
		"Bull blanc 1",
		"bratwurt 2",
		"Bull blanc 1",
		"bratwurt 2",
		"Frankfurt Viena 4",
		"Frankfurt Viena 4",
		"Caretas Cort 3"),
	"Bar el Juanito" => array(
		"Bull blanc 1",
		"bratwurt 2",
		"Bull blanc 1",
		"bratwurt 2",
		"Frankfurt Viena 4",
		"Frankfurt Viena 4",
		"Alas C Cortadas 2")		
);	

function activateRule($str, $root) {
	$child = $root->appendChild(new DOMElement("Rule"));
	$child->setAttribute("name", $str);
	$child->setAttribute("activate", "");
	cookie("rule", $str, $root);
}

function speak($str, $root) {
	$child = $root->appendChild(new DOMElement("Speak", $str));
}

function getProp($propName, $event, $xpath) {
	$prop = $xpath->query("./Property[@name=\"".$propName."\"]", $event);
	$prop = $prop->item(0)->getAttribute("val");
	return $prop;
}

function cookie($cookieName, $cookieValue, $root) {
	$child = $root->appendChild(new DOMElement("Cookie"));
	$child->setAttribute("name", $cookieName);
	$child->appendChild(new DOMText($cookieValue));
}

function getCookie($cookieName, $event, $xpath) {
	$cookie = $xpath->query("./Cookie[@name=\"".$cookieName."\"]", $event);
	$cookie = $cookie->item(0)->textContent;
	return $cookie;	
}

function getGetText($event, $xpath) {
	$getText = $xpath->query("./GetText", $event);
	$getText = $getText->item(0)->textContent;
	return $getText;
}

function StartEvent($event, $xpath, $domo, $root) {
	global $nombres;

	$child = $domo->importNode($event->firstChild, TRUE);
	$child->setAttribute("activate", "");
	$root->appendChild($child);

	$speechGram = new DOMDocument();
	$speechGram->load("carn1.xml");
	
	$xpathSG = new DOMXPath($speechGram);
	$L_nombre = $xpathSG->query("/GRAMMAR/RULE[@NAME=\"pedir nombres\"]/L");
	$L_nombre = $L_nombre->item(0);

	foreach ($nombres as $nombre) {
		$P = $L_nombre->appendChild(new DOMElement("P"));
		$P->setAttribute("VALSTR", $nombre);
		$n = explode(" ", $nombre);
		$P->appendChild(new DOMElement("O", $n[0]));
		$P->appendChild(new DOMElement("P", $n[1]));
		if (isset($n[2])) {
			$P->appendChild(new DOMElement("O", $n[2]));
		}	
	}

	$gram = $root->appendChild(new DOMElement("Grammar"));
	$gram->setAttribute("name", "gram1");
	$gram->setAttribute("allEngines", "");
	$gram->setAttribute("activate", "");		
	
	$gram->appendChild($domo->importNode($speechGram->documentElement, TRUE));

	activateRule("hola", $root);
}

function RecognitionEvent($event, $xpath, $domo, $root) {
	global $comercios;
	
	$child = $root->appendChild(new DOMElement("Rule"));
	$child->setAttribute("deactivate", "");
			
	$rule = $xpath->query("./Rule", $event);		
	$rule = $rule->item(0);	
	$rule = $rule->getAttribute("name");
	
	switch ($rule) {
		case "hola" :
			activateRule("pedir nombres", $root);
			speak("Como te llamas?", $root);
			break;
		case "pedir nombres" :
			activateRule("reparto", $root);
			$nombre = getProp("nombre", $event, $xpath);
			speak("Hola" . $nombre, $root);
			break;
		case "reparto" :
			$reparto_no = getProp("reparto no", $event, $xpath);
			if ($reparto_no == "reparto") {
				activateRule("si no", $root);
				cookie("Comercio", 0, $root);
				$ar = array_keys($comercios);
				speak("Comercio " . $ar[0], $root);
			} else {
				activateRule("pedir nombres", $root);
				speak("Como te llamas?", $root);
			}
			break; 		
		case "si no" :
			$iComercio = getCookie("Comercio", $event, $xpath);
			$si_no = getProp("si no", $event, $xpath);
			if ($si_no == "si") {
				activateRule("lote", $root);
				cookie("Producto", 0, $root);
				$ar = array_values($comercios);
				speak($ar[$iComercio][0], $root);
			} else {
				activateRule("si no", $root);
				$iComercio++;
				if ($iComercio >= count($comercios)) {
					$iComercio = 0;
				}	
				cookie("Comercio", $iComercio, $root);
				$ar = array_keys($comercios);
				speak("Comercio " . $ar[$iComercio], $root);
			}
			break;
		case "lote" :
			activateRule("peso", $root);
			speak("Peso ?", $root);
			break;
		case "peso" :
			$iComercio = getCookie("Comercio", $event, $xpath);
			$iProducto = getCookie("Producto", $event, $xpath);
			$iProducto++;
			$ar = array_values($comercios);
			if ($iProducto < count($ar[$iComercio])) {
				activateRule("lote", $root);
				cookie("Producto", $iProducto, $root);
				$ar = array_values($comercios);

//				$PesoDit = getCookie("lote", $event, $xpath);
				$PesoDit = getGetText($event, $xpath);

//				speak($PesoDit . " Kilos. " . $ar[$iComercio][$iProducto], $root);
				speak($PesoDit . " gramos. " . $ar[$iComercio][$iProducto], $root);
			} else {
				speak("Fin albaran", $root);
				activateRule("si no", $root);
				$iComercio = getCookie("Comercio", $event, $xpath);
				$iComercio++;
				if ($iComercio >= count($comercios)) {
					$iComercio = 0;
				}	
				cookie("Comercio", $iComercio, $root);			
				$ar = array_keys($comercios);
				speak($ar[$iComercio], $root);
				}
			break;
	}
}

function FalseRecognitionEvent($event, $xpath, $domo, $root) {
	global $comercios;

	$rule = getCookie("rule", $event, $xpath);
/*	$rule = $xpath->query("./Rule", $event);
	$rule = $rule->item(0);	
	$rule = $rule->getAttribute("name");
*/	
	switch ($rule) {
		case "hola" :
			speak("hola", $root);
			break;
		case "pedir nombres" :
			speak("Como te llamas?", $root);
			break;
		case "reparto" :
			speak("reparto", $root);
			break; 		
		case "si no" :
			speak("si o no?", $root);
			break;
		case "lote" :
			speak("Lote?", $root);
			break;
		case "peso" :
			speak("Peso?", $root);
			break;
	}
}

$domi = new DOMDocument();
$domi->load("php://input");

//file_put_contents("salida.txt", $domi->saveXML());

$file = fopen("salida.txt", "a");
fwrite($file, $domi->saveXML());
fclose($file);

$file = @fopen("savedState.txt", "x");
if ($file != FALSE) fclose($file);

$file = fopen("savedState.txt", "r+");
flock($file, LOCK_EX);


$domo = new DOMDocument();
$root = $domo->createElement("Response");
$domo->appendChild($root);

$xpath = new DOMXPath($domi);

//$start = $xpath->query("/Event[@type=\"Start\"]");
$event = $xpath->query("/Event");

if ($event->length > 0) {
	$event = $event->item(0);
	switch ($event->getAttribute("type")) {
		case "Start" : 
			StartEvent($event, $xpath, $domo, $root);
			break;
		case "Recognition" :
			RecognitionEvent($event, $xpath, $domo, $root);
			break;
		case "FalseRecognition" :
			FalseRecognitionEvent($event, $xpath, $domo, $root);
			break;
	}

	echo $domo->saveXML();
}

?>


