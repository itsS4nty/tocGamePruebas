<pre>
<?php 
				$ServerName="localhost,1433";
				$Username="sa";
				$Password="LOperas93786";
				$Databasename="Fac_Demo";

			$_Dsn = "Driver={SQL Server};Server=$Servername;Database=$Databasename;";
			
			$Conexion = odbc_connect($_Dsn, $Username, $Password);
			var_dump($Conexion);
			
								$_SqlRegistros = "SELECT *
									  FROM Articles
									  WHERE NOM='CORRIOLA GRANDE'";
									  
	$_Result = odbc_exec($Conexion, $_SqlRegistros);
var_dump($_Result);
				if ($_Result)
				{
					for ($i = 0; $i < odbc_num_rows($_Result); $i++)
					{
						$_Datos[$i] = array();
						
						odbc_fetch_row($_Result);
						for ($j = 1; $j <= odbc_num_fields($_Result); $j++)
						{
		                    
							$_Campo = odbc_field_name($_Result, $j);
							$_Dato = odbc_result($_Result, $j);
							var_dump($_Campo);
							var_dump($_Dato);
							var_dump(odbc_field_type($_Result, $j));
							if (odbc_field_type($_Result, $j) == "float") 
							   var_dump(0+odbc_result($_Result, $j));
							var_dump(odbc_fetch_array($_Result, $j));
							$_Campo = utf8_encode($_Campo);
							$_Dato = utf8_encode($_Dato);
							
							
							$_Datos[$i][$_Campo] = $_Dato;
						}
					}
				}
				
				$InfoRegistros = $_Datos;
				var_dump($_Datos);
				
							// Crear el objeto XML:
			$_Xml = new SimpleXMLElement("<servidor></servidor>");
			$_NodoInsert = $_Xml->addChild("insert");
			
				$_NodoTabla = NULL;
				
				if (count($_InfoRegistros) > 0)
				{
					$_NodoTabla = $_NodoInsert->addChild("tabla");
					$_NodoTabla->addAttribute('nombre', $_NombreTabla);
					
					foreach ( $_InfoRegistros as $_Registro )
					{
						$_NodoRegistro = $_NodoTabla->addChild("registro");
						
						    $_NombreCampo = "NOM";
							$_ValorCampo = $_Registro[$_NombreCampo];
						
							$_NodoCampo = $_NodoRegistro->addChild("campo");
							$_NodoCampo->addAttribute("nombre", $_NombreCampo);
							$_NodoCampo->addAttribute("valor", $_ValorCampo);
						
							$_NombreCampo = "PREU";
							$_ValorCampo = $_Registro[$_NombreCampo];
						
							$_NodoCampo = $_NodoRegistro->addChild("campo");
							$_NodoCampo->addAttribute("nombre", $_NombreCampo);
							$_NodoCampo->addAttribute("valor", $_ValorCampo);
						
					}
				}
			odbc_close($Conexion);
	
			
			echo($_Xml->asXML());

?>
</pre>