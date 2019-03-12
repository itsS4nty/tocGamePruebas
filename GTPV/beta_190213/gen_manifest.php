<?php

$removeSufixPath = ($outputRelative ? 2 : 1); // eliminar primer punto(.) o (./)

function outputPath($path) {
	global $f, $removeSufixPath;	
	
	$path = substr($path, $removeSufixPath);
	if (($path === "") || ($path === FALSE)) $path = "./";
	fwrite($f, "$path\n"); 
}

// rootNode(node)
//     fInclRoot : include /
//     fIncl : inculde dir flag 
//     filesI : files include
//     filesE : files exculde
//     files : filesI(!fIncl) o filesE(fIncl)
//     subDirs : [ node,... ]

function processPath($path, $node) {
	if ($node['fInclRoot']) outputPath("$path/");
	$fIncl = $node['fIncl'];
	if ($res = opendir($path)) {
		while (FALSE !== ($fileName = readdir($res))) {
			$fullPath = "$path/$fileName";
			if (is_dir($fullPath)) { 
				if ($fileName[0] != ".") {
					$nodeSubDir = $node['subDirs'][$fileName];
					if ($nodeSubDir === NULL) 
						$nodeSubDir = array( 'fIncl' => $fIncl, 'files' => array(), 'subDirs' => array());
					processPath($fullPath, $nodeSubDir);
				}	
			} else {
				$found = in_array($fileName, $node['files']);
				if (($fIncl && !$found) || (!$fIncl && $found))
					outputPath($fullPath);
			}
		}
		closedir($res);
	}	
}

function getInitailizedNode() {
	return array(
		'filesI' => array(),
		'filesE' => array(),
		'subDirs' => array()
	);
}

// $e: config path [ +-,el,... ]
// $i: idx in $e
// $n: max idx
function &findSubNode($e, $i, $n, &$node) {
	if ($i === $n) return $node;
	else {
		$subNode = &$node['subDirs'][$e[$i]];
		if ($subNode === NULL) {
			$subNode = getInitailizedNode();
			$node['subDirs'][$e[$i]] = &$subNode;
		}
		return findSubNode($e, $i+1, $n, $subNode);
	}
}

function postProcessNode(&$node, $fIncl) {
	if (!isset($node['fIncl'])) $node['fIncl'] = $fIncl;
	$fIncl = $node['fIncl'];
	$node['files'] = $node[($fIncl ? 'filesE' : 'filesI')];
	unset($node['filesI'], $node['filesE']);
	foreach($node['subDirs'] as &$subNode) 
		postProcessNode($subNode, $fIncl);	
}

function makeRootNode($config) {
	$rootNode = getInitailizedNode(); 
	foreach($config as $confItem) {
		$e = explode('/', $confItem);
		$fIncl = ($e[0] === '+');
		$n = count($e)-1;
		$fileName = $e[$n];
		$subNode = &findSubNode($e, 1, $n, $rootNode);
		if ($fileName === "*") {           // path
			$subNode['fIncl'] = $fIncl;            
		} elseif ($fileName === "") {      // rootElement
			$subNode['fInclRoot'] = TRUE;       
		} else {                           // file
			$subNode[($fIncl ? 'filesI' : 'filesE')][] = $fileName;  
		}
	}
	postProcessNode($rootNode, TRUE);
	return $rootNode;
}


$rootNode = makeRootNode($config);
$f = fopen($fileName, 'w');
if ($f === FALSE) exit();

fwrite($f, "CACHE MANIFEST\n");
fwrite($f, "\n");
fwrite($f, "# $fileName\n");
fwrite($f, "# ".date("d/m/y H:i:s")."\n");
fwrite($f, "\n");
fwrite($f, "CACHE:\n");
fwrite($f, "\n");

processPath('.', $rootNode);

fwrite($f, "\n");
fclose($f);

?>
<pre>
ok
</pre>
