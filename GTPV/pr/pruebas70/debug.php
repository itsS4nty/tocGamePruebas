<?php
/*function debug_odbc($res) {
	$debug = appendRespXML(createElementOut("debug")); 
	if ($res) {
		$n_fields = odbc_num_fields($res);
	  	while (odbc_fetch_row($res)) {
		  	$row = $debug->appendChild(createElementOut("row"));
		  	for ($i=1;$i<=$n_fields;$i++) {
				$field = $row->appendChild(createElementOut("field"));
				$field->setAttribute("name", odbc_field_name($res, $i));
				$field->appendChild(new DOMText(odbc_result($res, $i)));
		  	}
	  	}
	}
}
*/
function debug_str($str) {
	appendDocOut(createElementOut("debug", $str)); 
}
?>
