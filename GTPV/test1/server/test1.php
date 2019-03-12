<?php 

// exit();

include("main.php");
include("dump_r.php");

define("indent_spaces", "    "); 

$gtpv =  array('client',1);
$clientInfo = (object)array('idCom' => '1855655e36867a17361.53131374');
$session = 'synchronize';

$jsonIn_init1 = (object)array(
	'gtpv' => $gtpv,
	'clientInfo' => (object)array('user' => 'test345', 'password' => 'o345jJMN k:', 'producto' => 'tpv', 'version' => '0.1')
);

$jsonIn_init2 = (object)array(
	'gtpv' => $gtpv,
	'clientInfo' => $clientInfo
);

$db1 = array('dbName' => 'test345_gtpv');

$db_1_1 = $db1;
$db_1_1['transaction'] = array(
	(object)array(
		'id' => 'downloadSync',
        'objName' => '_downloadSync',
        'type' => 'get',
        'columns' => array('table', 'serverSync'),
		'values' => array()
	),
	(object)array(
        'id' => 'uploadSync',
        'objName' => '_uploadSync',
        'type' => 'get',
        'columns' => array('table', 'lastWrite')
	)
);

$jsonIn_1_1 = (object)array(
	'gtpv' => $gtpv,
	'clientInfo' => $clientInfo,
	'session' => $session,
	'dbs' => array((object)$db_1_1)
);


$db_1_2 = $db1;
$db_1_2['transaction'] = array(
	(object)array(
		'id' => 'downloadSync',
        'objName' => '_downloadSync',
        'type' => 'get',
        'columns' => array('table', 'serverSync'),
		'values' => array( 
			array("articles", "2015-08-17 16:17:58.943", "2015-08-17 18:17:58.943"), 
			array("dependentes", "2015-08-17 16:17:59.597", "2015-08-17 18:17:59.597"), 
			array("dependentesextes", "2015-08-17 16:17:59.800", "2015-08-17 18:17:59.800"), 
			array("families", "2015-08-17 16:18:00.240", "2015-08-17 18:18:00.240"), 
			array("ConceptosEntrega", "2015-08-17 16:18:00.670", "2015-08-17 18:18:00.670"), 
			array("CodisBarres", "2015-08-17 16:18:00.850", "2015-08-17 18:18:00.850")
		)	
	),
	(object)array(
        'id' => 'uploadSync',
        'objName' => '_uploadSync',
        'type' => 'get',
        'columns' => array('table', 'lastWrite')
	)
);

$jsonIn_1_2 = (object)array(
	'gtpv' => $gtpv,
	'clientInfo' => $clientInfo,
	'session' => $session,
	'dbs' => array((object)$db_1_2)
);

//$jsonIn_init = json_decode(json_encode($jsonIn_init));

$showHelp = "1- select INFORMATION_SCHEMA\n".
            "2- init message\n".
			"\n";

switch($_SERVER['QUERY_STRING']) {
	case 'ist0':
		header("Content-Type: text/html; charset='utf-8'");
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM INFORMATION_SCHEMA.TABLES"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>'.odbc_error(); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'ist1':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE [TABLE_NAME] LIKE ?"); 
		$exec = odbc_execute($sql, array('test345%'));
		if (!$exec) { echo '<pre>'.odbc_error(); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'default':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE [TABLE_NAME] LIKE ? ORDER BY [TABLE_NAME]"); 
		$exec = odbc_execute($sql, array('DEFAULT%'));
		if (!$exec) { echo '<pre>'.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'default_col':
		header("Content-Type: text/html; charset='utf-8'");
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE [TABLE_NAME] LIKE ? ORDER BY [TABLE_NAME]"); 
		$exec = odbc_execute($sql, array('DEFAULT%'));
		if (!$exec) { echo '<pre>'.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'ts_col':
		header("Content-Type: text/html; charset='utf-8'");
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE [TABLE_NAME] = ?"); 
		$exec = odbc_execute($sql, array('G_TABLAS_SINCRONIA'));
		if (!$exec) { echo '<pre>'.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'ti1':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		print_r($jsonIn_init1);
		$jsonOut = main($jsonIn_init1);
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 'ti2':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		print_r($jsonIn_init2);
		$jsonOut = main($jsonIn_init2);
		var_dump(json_encode($jsonOut));
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 't11':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		echo pretty_json_encode($jsonIn_1_1)."\n";
		$jsonOut = main($jsonIn_1_1);
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 't12':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		echo pretty_json_encode($jsonIn_1_2)."\n";
		$jsonOut = main($jsonIn_1_2);
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 'pr1':
		echo '<pre>';
		echo phpversion()."\n";
		$rrrr = "?";
		
		$ee = array("w" => 1, 4 => 1, 1, 1, 3 => 1, 0 => 2, 6 => 2.2);
		foreach ($ee as $k => $v) {
			echo "k: $k, v: $v\n";
		}
		var_dump($ee);
		var_dump((string)null);
		var_dump((string)array("11","22"));
		var_dump(is_string(null));
		var_dump(array_merge(array(1,2),array()));
		var_dump(array_merge(array(1,2),null));
		var_dump(json_encode(new Datetime()));
		echo "-----------\n";
		echo pretty_json_encode(array("rr" => 45, "tt" => 67));
		echo "-----------\n";
		echo pretty_json_encode(array("rr", "tt"));
		echo "-----------\n";
		echo pretty_json_encode(array("0" => 7, "1" => 9));
		exit();
		for ($i=0; $i<10; $i++) {
			$hash = password_hash("???a???????N", PASSWORD_BCRYPT);
			var_dump($hash);
			var_dump(password_verify("???a???????N", $hash ));
		}
		exit();
		openDB();
		$rr = odbc_data_source ( $ConnDB, SQL_FETCH_FIRST );
		var_dump($rr);
		while ($rr !== false) {
			$rr = odbc_data_source ( $ConnDB, SQL_FETCH_NEXT );
			var_dump($rr);
		}
		exit();
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?"); 
		$exec = odbc_execute($sql, array('ppoo_articles'));
		if (!$exec) { echo '<pre>'.odbc_error(); closeDB(); exit(); }
		odbc_result_all($sql);
		echo '<p>----------</p>';
		$exec = odbc_execute($sql, array('hsjs_dependentes'));
		if (!$exec) { echo '<pre>'.odbc_error(); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'pr2':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM test345_ArtICles_SINCRO"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'pr3':
		header("Content-Type: text/html; charset='utf-8'");
/*		echo "<pre>";
		var_dump(utf8_decode("?"));
		exit();
*/		openDB();
		$sql = odbc_prepare($ConnDB, "CREATE TABLE [?]]] ([??]]] varchar(255))"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'pr4':
		header("Content-Type: text/html; charset='utf-8'");
/*		echo "<pre>";
		var_dump(utf8_decode("?"));
		exit();
*/		openDB();
		$sql = odbc_prepare($ConnDB, "INSERT INTO [?]]] ([??]]]) VALUES (?)"); 
		echo "<p>0</p>";
		$exec = odbc_execute($sql, array("hola"));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>1</p>";
		$exec = odbc_execute($sql, array(utf8_decode("?]")));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>2</p>";
		$sql = odbc_prepare($ConnDB, "SELECT * FROM [?]]]"); 
		$exec = odbc_execute($sql, array());
		
		odbc_result_all($sql);
		closeDB();
		break;
	case 'pr5':
		//header("Content-Type: text/html; charset='utf-8'");
		openDB();
		$table = "?????????????00000000";
		$stat = "CREATE TABLE [${table}111111111] (aaaa varchar(255))";
		echo "<pre>";
		var_dump($stat);
		echo "</pre>";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		$table2 = utf8_decode($table);
		$stat2 = "CREATE TABLE [${table2}222222222] (aaaa varchar(255))";
		echo "<pre>";
		var_dump($stat2);
		echo "</pre>";
		$sql = odbc_prepare($ConnDB, $stat2); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
//		odbc_result_all($sql);
		closeDB();
		break;
	case 'pr6':
		header("Content-Type: text/html; charset='utf-8'");
		openDB();
		$stat = "CREATE TABLE [tt11] (a varchar(255))";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		$stat = "INSERT INTO [tt11] (a) VALUES (?)";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array("'a.txt'"));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		
		$stat = "INSERT INTO [tt11] (a) VALUES (?)";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array("'a.txt' "));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		$stat = "SELECT * FROM [tt11]";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		odbc_result_all($sql);

		closeDB();
		break;
	case 'pr7':
		header("Content-Type: text/html; charset='utf-8'");
		openDB();

		$stat = "DROP TABLE [tt2]";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		 
		$stat = "CREATE TABLE [tt2] (? int, a varchar(255))";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		$stat = "INSERT INTO [tt2] (?, a) VALUES (?, ?)";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array(1, "bb"));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		$stat = "DROP TABLE [tt3]";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		$stat = "CREATE TABLE [tt3] (? int, a varchar(255), [] int)";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		$stat = "INSERT INTO [tt3] (?, a) VALUES (?, ?)";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array(1, "cc"));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";

		closeDB();
		break;
	case 'pr8':
		header("Content-Type: text/html; charset='utf-8'");
		openDB();

		$stat = "SELECT T2.?, T2.A, T3.?, T3.a FROM [tt2] as T2 INNER JOIN [tT3] as T3 on T2.?=T3.?";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		//odbc_result_all($sql);
		echo "<pre>";
		var_dump(odbc_fetch_row($sql));
		var_dump(odbc_result($sql, "a"));
		var_dump(odbc_result($sql, "A"));
		var_dump(odbc_result($sql, "T3.a"));
		var_dump(odbc_result($sql, 2));
		var_dump(odbc_result($sql, 4));
		var_dump(odbc_result($sql, "?"));
		var_dump(odbc_result($sql, "?"));

		$stat = "SELECT T2.A FROM [tt2] as T2 INNER JOIN [tt3] as T3 on T2.c=T3.c";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		odbc_result_all($sql);

		$stat = "SELECT T2.c, T2.A, T3.c, T3.a FROM [tt2] as T2 INNER JOIN [tt3] as T3 on T2.c=T3.c";
		$sql = odbc_prepare($ConnDB, $stat); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB).'</pre>'; }
		echo "<p>$exec</p>";
		odbc_result_all($sql);
		
		
		closeDB();
		break;
	case 'cl0':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES"); 
		$exec = odbc_execute($sql);
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'cl1':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM G_CLIENTES WHERE [user] = ?"); 
		$exec = odbc_execute($sql, array('test345'));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'del1':
		openDB();
		$sql = odbc_prepare($ConnDB, "DELETE FROM G_CLIENTES WHERE [user] = ?"); 
		$exec = odbc_execute($sql, array('test345'));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		closeDB();
		break;
	case 'delt1':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE [TABLE_NAME] LIKE ?"); 
		$exec = odbc_execute($sql, array('test345%'));
		if (!$exec) { echo '<pre>'.odbc_errormsg($ConnDB); closeDB(); exit(); }
		echo '<pre>';
		var_dump(utf8_encode(null));
		var_dump(utf8_encode(false));
		var_dump(utf8_encode(true));
		
		while (odbc_fetch_row($sql)) {
			var_dump(odbc_result($sql,'TABLE_NAME'));
			var_dump(odbc_result($sql,'table_name'));
			var_dump(odbc_result($sql,1));
			var_dump(odbc_result($sql,'ii'));
			var_dump(odbc_result($sql,0));
			var_dump(odbc_result($sql,10));
			
//			$sql2 = odbc_prepare($ConnDB, 'DROP TABLE ['.odbc_result($sql,'TABLE_NAME').']');
//			$exec = odbc_execute($sql2);
//			if (!$exec) { echo odbc_errormsg($ConnDB); closeDB(); exit(); }
		}
		closeDB();
		break;
		
	case 'ts':
		openDB();
/*		$sql = odbc_prepare($ConnDB, "CREATE TABLE [DEFAULTA_taules] (codi varchar(255))"); 
		$exec = odbc_execute($sql, array());
*/		$sql = odbc_prepare($ConnDB, "SELECT * FROM [G_TABLAS_SINCRONIA]"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		closeDB();
		break;
	case 'tart':
		openDB();
/*		$sql = odbc_prepare($ConnDB, "CREATE TABLE [DEFAULTA_taules] (codi varchar(255))"); 
		$exec = odbc_execute($sql, array());
*/		$sql = odbc_prepare($ConnDB, "SELECT TOP 0 * FROM [DEFAULTA_articles]"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		echo "<pre>";
		for ($i=0; $i<odbc_num_fields($sql); $i++) 
			echo odbc_field_name($sql,1+$i)."\n";
		closeDB();
		break;
	case "mts":
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT [clavePrimaria] from [G_TABLAS_SINCRONIA] WHERE [tabla]=?");
		$exec = odbc_execute($sql, array('dependentes'));
		echo "<pre>";
		echo odbc_num_rows($sql)."\n";
		while (odbc_fetch_row($sql)) {
			echo odbc_result($sql,1)."\n";
		}	
		$sql = odbc_prepare($ConnDB, "UPDATE [G_TABLAS_SINCRONIA] SET [clavePrimaria]=? WHERE [tabla]=?");
		$exec = odbc_execute($sql, array('[CODI]', 'dependentes'));
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		echo "\n";
		$sql = odbc_prepare($ConnDB, "SELECT [clavePrimaria] from [G_TABLAS_SINCRONIA] WHERE [tabla]=?");
		$exec = odbc_execute($sql, array('dependentes'));
		echo odbc_num_rows($sql)."\n";
		while (odbc_fetch_row($sql)) {
			echo odbc_result($sql,1)."\n";
		}	
		closeDB();
		break;
	case 'ts2':
		openDB();
		$sql = odbc_prepare($ConnDB, "SELECT * FROM [G_TABLAS_SINCRONIA] where [version] = '0.1'"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		odbc_result_all($sql);
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		echo "<pre>";
		while(odbc_fetch_row($sql)) {
			$table = odbc_result($sql, "tabla");
			$sql2 = odbc_prepare($ConnDB, "SELECT TOP 0 * FROM [DEFAULTA_$table]"); 
			$exec = odbc_execute($sql2, array());
			if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
			echo "tabla: ".$table." clavePrimaria: ".odbc_result($sql, "clavePrimaria")."\n";
			$num = odbc_num_fields($sql2);
			for ($i=0; $i<$num; $i++) 
				echo '['.odbc_field_name($sql2, 1+$i).']';
			echo "\n\n";
		}	
		closeDB();
		break;
	case 'ts3':
		openDB();
		$sql = odbc_prepare($ConnDB, "ALTER TABLE [G_TABLAS_SINCRONIA] ADD [otrosCampos] varchar(255)"); 
		$exec = odbc_execute($sql, array());
		if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		closeDB();
		break;
	case 'ts4':
		$ts = array(
			array("taules", "[codi]", null),
			array("v_horaris", null, "[botiga][data][dependenta][operacio]"),  
			array("v_venut", "[botiga][data][num_tick]", "[dependenta][estat][plu][quantitat][import][tipus_venta][formaMarcar][otros]"),
			array("v_anulats", "[botiga][data][num_tick]", "[dependenta][estat][plu][quantitat][import][tipus_venta][formaMarcar][otros]"),
			array("v_moviments", null, "[botiga][data][dependenta][tipus_moviment][import][motiu]"),
			array("articles", "[codi]", "[nom][preu][preuMajor][desconte][esSumable][familia][codiGenetic][tipoIva][noDescontesEspecials]"),
			array("dependentes", "[codi]", "[nom][memo][telefon][adreça][icona][hi editem horaris][tid]"),
			array("teclatsTpv", "[data][llicencia][ambient][pos]", "[maquina][dependenta][article][pos][color]"),
			array("dependentesExtes", "[id][nom]", "[valor]"),
			array("families", "[nom][pare][nivell]", "[estatus][utilitza]"),
			array("conceptosEntrega", "[tipo][texto]", null),
			array("codisBarres", "[codi]", "[producte]")
		);
		openDB();
		foreach ($ts as $t) {
			$sql = odbc_prepare($ConnDB, "UPDATE [G_TABLAS_SINCRONIA] SET [tabla]=?, [clavePrimaria]=?, [otrosCampos]=? " 
										."WHERE ([tabla]=? AND [version]='0.1')"); 
			$exec = odbc_execute($sql, array($t[0], $t[1], $t[2], $t[0]));
			if (!$exec) { echo '<pre>err: '.odbc_errormsg($ConnDB); closeDB(); exit(); }
		}								
		closeDB();
		break;

	case 'tsc_test1_0':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		$tsc_test1_0 = '{"gtpv":["client",1],"clientInfo":{"user":"tsc_test1","password":"sd651fco","producto":"tpv","version":"0.1","ipLan":"11112"}}'; 
		$jsonOut = main(json_decode($tsc_test1_0));
		echo json_encode($jsonOut);
		echo "\n";
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 'tsc_test1_1':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		$tsc_test1_1 = '{"gtpv":["client",1],"clientInfo":{"idCom":"1154355e4b9f81330a6.05051907","ipLan":"111"},"session":"synchronize","dbs":[{"dbName":"tsc_test1_gtpv","schema":{"_downloadSync":{"keyPath":"table","autoIncrement":false,"indexs":{}},"_uploadSync":{"keyPath":"table","autoIncrement":false,"indexs":{}}},"version":1,"versionChange":false,"transaction":[{"id":"downloadSync","type":"get","objName":"_downloadSync","columns":["table","serverSync"],"values":[]},{"id":"uploadSync","type":"get","objName":"_uploadSync","columns":["table","lastWrite"],"values":[]}]}]}';
		$jsonOut = main(json_decode($tsc_test1_1));
		echo json_encode($jsonOut);
		echo "\n";
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 'tsc_test1_2':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		$tsc_test1_2 = '{"gtpv":["client",1],"clientInfo":{"idCom":"1154355e4b9f81330a6.05051907","ipLan":"111"},"session":"synchronize","dbs":[{"dbName":"tsc_test1_gtpv","schema":{"CodisBarres":{"keyPath":"Codi","autoIncrement":false},"ConceptosEntrega":{"keyPath":{"0":"tipo","1":"texto"},"autoIncrement":false},"_downloadSync":{"keyPath":"table","autoIncrement":false},"_uploadSync":{"keyPath":"table","autoIncrement":false},"articles":{"keyPath":"Codi","autoIncrement":false},"dependentes":{"keyPath":"CODI","autoIncrement":false},"dependentesextes":{"keyPath":{"0":"id","1":"nom"},"autoIncrement":false},"families":{"keyPath":{"0":"Nom","1":"Pare","2":"Nivell"},"autoIncrement":false}},"version":2,"versionChange":false,"transaction":[{"id":"download_inserts","type":"put","objName":"articles"},{"id":"download_inserts","type":"put","objName":"dependentes"},{"id":"download_inserts","type":"put","objName":"dependentesextes"},{"id":"download_inserts","type":"put","objName":"families"},{"id":"download_inserts","type":"put","objName":"ConceptosEntrega"},{"id":"download_inserts","type":"put","objName":"CodisBarres"},{"type":"put","objName":"_downloadSync"},{"id":"downloadSync_UD","type":"get","objName":"_downloadSync","columns":["table","serverSync"],"values":[["CodisBarres","2015-08-31 17:38:42.400"],["ConceptosEntrega","2015-08-31 17:38:42.273"],["articles","2015-08-31 17:38:40.863"],["dependentes","2015-08-31 17:38:41.440"],["dependentesextes","2015-08-31 17:38:41.677"],["families","2015-08-31 17:38:41.923"]]}]}]}';
		echo pretty_json_encode(json_decode($tsc_test1_2))."\n";
		$jsonOut = main(json_decode($tsc_test1_2));
		echo json_encode($jsonOut);
		echo "\n";
		echo pretty_json_encode($jsonOut)."\n";
		break;

	case 'tsc_test2_0':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		$msg = '{"gtpv":["client",1],"clientInfo":{"user":"tsc_test2","password":"sd651fco","producto":"TPV","version":"0.1","ipLan":"11112"}}'; 
		$jsonOut = main(json_decode($msg));
		echo json_encode($jsonOut);
		echo "\n";
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 'tsc_test2_1':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		$msg = '{"gtpv":["client",1],"clientInfo":{"idCom":"1002055e8b417abffd6.75747588","ipLan":"111"},"session":"synchronize","dbs":[{"dbName":"tsc_test2__gtpv","transaction":[{"id":"downloadSync","type":"get","objName":"_downloadSync","columns":["table","serverSync"],"values":[],"aborted":false},{"id":"uploadSync","type":"get","objName":"_uploadSync","columns":["table","lastWrite"],"values":[["t1",11]],"aborted":false}],"schema":{"_downloadSync":{"keyPath":"table","autoIncrement":false},"_uploadSync":{"keyPath":"table","autoIncrement":false}},"version":1,"versionChange":false}]}'; 
		$jsonOut = main(json_decode($msg));
		echo json_encode($jsonOut);
		echo "\n";
		echo pretty_json_encode($jsonOut)."\n";
		break;
	case 'tsc_test2_2':
		header("Content-Type: text/html; charset='utf-8'");
		echo '<pre>';
		$msg = '{"gtpv":["client",1],"clientInfo":{"idCom":"1002055e8b417abffd6.75747588","ipLan":"111"},"session":"synchronize","dbs":[{"dbName":"tsc_test2__gtpv","transaction":[{"id":"download_inserts","type":"put","objName":"articles","aborted":false},{"id":"download_inserts","type":"put","objName":"dependentes","aborted":false},{"id":"download_inserts","type":"put","objName":"dependentesExtes","aborted":false},{"id":"download_inserts","type":"put","objName":"families","aborted":false},{"id":"download_inserts","type":"put","objName":"conceptosEntrega","aborted":false},{"id":"download_inserts","type":"put","objName":"codisBarres","aborted":false},{"type":"put","objName":"_downloadSync","aborted":false},{"id":"downloadSync_UD","type":"get","objName":"_downloadSync","columns":["table","serverSync"],"values":[["articles","2015-09-03 21:09:24.687"],["codisBarres","2015-09-03 21:09:26.660"],["conceptosEntrega","2015-09-03 21:09:26.417"],["dependentes","2015-09-03 21:09:25.340"],["dependentesExtes","2015-09-03 21:09:25.640"],["families","2015-09-03 21:09:25.997"]],"aborted":false}],"schema":{"_downloadSync":{"keyPath":"table","autoIncrement":false},"_uploadSync":{"keyPath":"table","autoIncrement":false},"articles":{"keyPath":"codi","autoIncrement":false},"codisBarres":{"keyPath":"codi","autoIncrement":false},"conceptosEntrega":{"keyPath":{"0":"tipo","1":"texto"},"autoIncrement":false},"dependentes":{"keyPath":"codi","autoIncrement":false},"dependentesExtes":{"keyPath":{"0":"id","1":"nom"},"autoIncrement":false},"families":{"keyPath":{"0":"nom","1":"pare","2":"nivell"},"autoIncrement":false}},"version":2,"versionChange":false}]}'; 
		$jsonOut = main(json_decode($msg));
		echo json_encode($jsonOut);
		echo "\n";
		echo pretty_json_encode($jsonOut)."\n";
		break;
		
		
		
		
	
	default :
		echo '<pre>'.$showHelp;
}

function pretty_json_encode($in, $tabs=0, $insideArray=false, &$newLine=false) {
	if ($in === null)  return "null";
	if (is_string($in)) return json_encode($in);
	if (is_numeric($in)) return '"'.$in.'"';
	if (is_object($in)) {
		$newLine = true;
		return pretty_json_encode_object($in, $tabs, $insideArray);
	}	
	if (is_array($in)) { 
		$i=0;
		foreach($in as $key => $value) {
			if ($key !== $i) {
				$newLine = true; 
				return pretty_json_encode_object($in, $tabs, $insideArray);
			}	
			$i++;
		}
		$newLine = true;
		$ret = "";
		if ($insideArray) {
			$ret .= "\n";
			for ($i=0; $i<$tabs+1; $i++) $ret .= indent_spaces;
		}
		$newLineInner = false;
		$coma = '';
		$ret .= "[ ";
		foreach($in as $val) {
			$ret .= $coma; $coma = ', ';
/*			if ($arrayIndentInner) {
				$ret .= "\n";
				for ($i=0; $i<$tabs+1; $i++) $ret .= indent_spaces;
			}
*/			$ret .= pretty_json_encode($val, $tabs+1, true, $newLineInner);
		}
		if ($newLineInner) {
			$ret .= "\n";
			for ($i=0; $i<$tabs; $i++) $ret .= indent_spaces;
		}
		$ret .= ']';
		return $ret;
	}
	return '';
}

function pretty_json_encode_object($in, $tabs, $insideArray=false) {
	$coma = '';
	$ret = "";
	if ($insideArray) {
		$ret .= "\n";
		for ($i=0; $i<$tabs; $i++) $ret .= indent_spaces;
	}
	$ret .= "{";
	foreach($in as $key => $prop) {
		$ret .= $coma; $coma = ',';
		$ret .= "\n";
		for ($i=0; $i<$tabs+1; $i++) $ret .= indent_spaces;
		$ret .= $key.': ';
		$ret .= pretty_json_encode($prop, $tabs+1);
	}
	if ($coma !== '') {
		$ret .= "\n";
		for ($i=0; $i<$tabs; $i++) $ret .= indent_spaces;
	}
	$ret .= '}';
	return $ret;
}

?>
