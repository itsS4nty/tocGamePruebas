<%
	dim CreatDib 

	function SeleccionArticulo(name,FuncioOk) 
		str = ""
		if CreatDib ="" then
			%><!-- #include virtual="/Facturacion/include/ajax_search.js" --><%
			'str = str & "<link rel='StyleSheet' type='text/css' href='\Facturacion\include\googlesuggestclone.css' />"
			'str = str & "<div  id='search_suggest' style='position:absolute;visibility:hidden;z-index:1000;' ></div>"
			CreatDib = "Si"
		end if
		str = str & "<Input onblur='ValidaContingut(""" & name & """);' onfocus=""searchSuggest('" & name & "','Articles');"" onKeyDown=""searchSuggestPress('" & name & "','Articles');"" onkeyup=""searchSuggest('" & name & "','Articles');"" autocomplete='off' "
		str = str & "Type='Text'  "
		str = str & "style='width:400;' name='Suggest_" & name & "' class='txtResaltat'>  "
		str = str & " <Input Type=Hidden name='" & name & "' value=''>"
		str = str & " <Input Type=Hidden name='" & name & "_Ok' value='" & FuncioOk & "'>"
		SeleccionArticulo	=  str
	end function
	
	function SeleccionCliente(name,FuncioOk) 
		str = ""
		if CreatDib ="" then
			%><!-- #include virtual="/Facturacion/include/ajax_search.js" --><%
			'str = str & "<link rel='StyleSheet' type='text/css' href='\Facturacion\include\googlesuggestclone.css' />"
			'str = str & "<div id='search_suggest' style='position:absolute;visibility:hidden;z-index:1000;' ></div>"
			CreatDib = "Si"
		end if
		str = str & "<Input onblur='ValidaContingut(""" & name & """);' onfocus=""searchSuggest('" & name & "','Clients');"" onKeyDown=""searchSuggestPress('" & name & "','Clients');"" onkeyup=""searchSuggest('" & name & "','Clients');"" autocomplete='off' "
		str = str & "Type='Text'  "
		str = str & "style='width:400;' name='Suggest_" & name & "' class='txtResaltat' > "
		str = str & " <Input Type=Hidden name='" & name & "' value=''>"
		str = str & " <Input Type=Hidden name='" & name & "_Ok' value='" & FuncioOk & "'>"
		SeleccionCliente	=  str
	end function
	
	
%>
