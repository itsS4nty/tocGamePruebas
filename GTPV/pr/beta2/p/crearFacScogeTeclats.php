<html>
<body>
<?php

$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
$maxGrups = 32;

$stat = "
select * 
from 
    (select a.plu, b.plu as maxplu,b.c as cmaxplu, count(*) as c, row_number() over (partition by b.plu order by count(*)) as rn 
     from [fac_scoge].dbo.[v_venut_2011-05] as a 
             inner join
                  (select r1.Num_tick,r1.plu,r2.c  
                   from [fac_scoge].dbo.[v_venut_2011-05] as r1 
                        inner join (select top $maxGrups plu, count(*) as c 
						            from [fac_scoge].dbo.[v_venut_2011-05] 
									group by plu order by c desc) as r2 
                        on r1.plu = r2.plu 
                  ) as b 
             on (b.Num_tick = a.Num_tick) and (a.plu <> b.plu) 
     group by a.plu,b.plu,b.c) as z
where rn <= 8 
order by cmaxplu desc
";

$sql = odbc_prepare($ConnDB, $stat); 
odbc_execute($sql, array());

// odbc_result_all($sql);

$TeclatsTpv = array();


function p($x, $y) {
	return $y*6+$x;	
}

function c($i) {
	$g = (int)($i*255/7+0.5);
	$b = (int)((7-$i)*255/7+0.5);
	return $g*256+$b;	
}

function generarPluPrincipal($grup) {
	global $TeclatsTpv, $nGrup;
	 
	if (($nGrup%4) == 0) {
		$TeclatsTpv[(int)($nGrup/4)] = array();	
	}
	$a = &$TeclatsTpv[(int)($nGrup/4)];
	$y = ((int)(($nGrup%4)/2))*3;
	$x = ((int)(($nGrup%4)%2))*3;
	$a[] = array($grup[0], p($x+1, $y+1), 0xFF0000); 
	for ($i=1; $i<count($grup) && $i<9; $i++) {
		$i2 = ($i-1 < 4) ? $i-1 : $i;
		$x2 = $x + ($i2%3);
		$y2 = $y + (int)($i2/3);
		$a[] = array($grup[$i], p($x2, $y2), 0x00FF00/*c($i-1)*/);
	}
	$nGrup++;
}

$nGrup = 0;
$grup = array(NULL);

while (odbc_fetch_row($sql)) {
	if (odbc_result($sql, "maxplu") != $grup[0]) {
		if (count($grup) >= 2) generarPluPrincipal($grup);
		$grup = array((float)odbc_result($sql, "maxplu"));	
	} 
	$grup[] = (float)odbc_result($sql, "plu");
}
if (count($grup) >= 2) {
	generarPluPrincipal($grup);
}

$stat = "delete from [fac_scoge].dbo.[TeclatsTpv]";
$sql = odbc_prepare($ConnDB, $stat);	
odbc_execute($sql, array()); 
$stat = "drop table [fac_scoge].dbo.[TeclatsTpv_sincro]";
$sql = odbc_prepare($ConnDB, $stat);	
$err = odbc_execute($sql, array()); 
if (!$err) echo("error drop\n");

$stat = "insert into [fac_scoge].dbo.[TeclatsTpv] ( Data, Llicencia, Maquina, Dependenta, Ambient, Article, Pos, Color) 
         values (?, ?, ?, ?, ?, ?, ?, ?)";
									
for ($ambient=0; $ambient<count($TeclatsTpv); $ambient++) {										
	for ($but=0; $but<count($TeclatsTpv[$ambient]); $but++) {
		$sql = odbc_prepare($ConnDB, $stat);	
//		print_r($sql);									
		$err =odbc_execute($sql, array("2011-05-01 22:06:00",NULL,0,-1, 
		                         "Ambient-".($ambient+1), 
								 $TeclatsTpv[$ambient][$but][0],
								 $TeclatsTpv[$ambient][$but][1],
								 $TeclatsTpv[$ambient][$but][2]));
		if (!$err) echo("error\n");						   
	}
}

odbc_close($ConnDB);

//print_r($TeclatsTpv);

$stat = "select * from [fac_scoge].dbo.[TeclatsTpv]";
$sql = odbc_prepare($ConnDB, $stat);	
odbc_execute($sql, array()); 
odbc_result_all($sql);

?>
</body>
</html>
