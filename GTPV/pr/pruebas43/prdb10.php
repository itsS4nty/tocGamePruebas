<html>
<head></head>
<body>
<?
global $ConnDB;
$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");

$statement = "SELECT S.[_FECHA_SINCRO], S.[_TIPO_SINCRO], S.[codi], T.* "
            ."FROM [fac_scoge].dbo.[dependentes_SINCRO] AS S "
            ."LEFT JOIN [fac_scoge].dbo.[dependentes] AS T ON (ISNULL(S.[codi],'') = ISNULL(T.[codi],'')) "
            ."ORDER BY S.[_FECHA_SINCRO] ASC ";
			
$sql = odbc_prepare($ConnDB, $statement); 
odbc_execute($sql, array());

odbc_result_all($sql);



$statement = "SELECT S.[_FECHA_SINCRO], S.[_TIPO_SINCRO], S.[codi], T.* "
            ."FROM [fac_scoge].dbo.[articles_SINCRO] AS S "
            ."LEFT JOIN [fac_scoge].dbo.[articles] AS T ON (ISNULL(S.[codi],'') = ISNULL(T.[codi],'')) "
            ."ORDER BY S.[_FECHA_SINCRO] ASC ";
			
$sql = odbc_prepare($ConnDB, $statement); 
odbc_execute($sql, array());

odbc_result_all($sql);


$statement = "SELECT * "
            ."FROM [fac_scoge].dbo.[dependentes]";
			
$sql = odbc_prepare($ConnDB, $statement); 
odbc_execute($sql, array());

odbc_result_all($sql);

odbc_close($ConnDB);	

?>
</body>
</html>
