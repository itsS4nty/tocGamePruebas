<pre>
<?php
	$ret = preg_match_all("|(?:\[([^]]*)\])*|","[hh] [kkkk] [ooo]",$matches);
//	$ret = preg_match_all("|P([^Q]*)Q|","PhhQPkkkkQPoooQ",$matches);
	
	var_dump($ret);
	var_dump($matches);
?>

