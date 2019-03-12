<%

' Funciones para obtener nombres a partir de ID's de tablas, papeleras de reciclaje, zombis, limbos...

' --- Nombres de dependientas -----------------------------------------------------------------------------------------------------------
function NomDependenta ( byval id )

	dim rs
	set rs = rec("Select nom From Dependentes  Where Codi='" & id & "'")

	if not rs.EOF then
		NomDependenta = rs("nom")
	elseif exists("Dependentes_Zombis") then
		set rs = rec("Select nom From Dependentes_Zombis Where Codi='" & id & "'")
		if not rs.eof then
			nomDependenta = rs("nom")
		else
			NomDependenta = id
		end if
	else
		NomDependenta = id
	end if

end function

' --- Nombres de tiendas ----------------------------------------------------------------------------------------------------------------
function NomBotiga ( byval id )

	dim rs
	set rs = rec("Select nom From Clients Where Codi='" & id & "'")

	if not rs.EOF then
		NomBotiga = rs("nom")
	else
		NomBotiga = "Botiga " & Codi
		rec "insert into Clients (codi,nom) values (" & id & ",'Botiga " & NomBotiga & "') "
rec "insert into " & HistoricComunicacions(now) & " (Llicencia, Data, Tipus, Aux1, Aux2) values (0, getdate(),'Inserta client','getNames.asp,NomBotiga','Client:" & NomBotiga & "')" 
	end if

end function

' --- Nombres de tiendas ----------------------------------------------------------------------------------------------------------------
function NomClientsFinals ( byval id )

	dim rs
	set rs = rec("Select nom From ClientsFinals Where id='" & id & "'")

	if not rs.EOF then
		NomClientsFinals = rs("nom")
	else
		set rs = rec("Select nom From ClientsFinals_Zombis Where id='" & id & "'")
		if not rs.EOF then
			NomClientsFinals = rs("nom")
		else
			NomClientsFinals = "Botiga " & Codi
			'rec "insert into Clients (codi,nom) values (" & id & ",'Botiga " & NomClientsFinals & "') "
			'rec "insert into " & HistoricComunicacions(now) & " (Llicencia, Data, Tipus, Aux1, Aux2) values (0, getdate(),'Inserta client','getNames.asp,NomClientsFinals','Client:" & NomClientsFinals & "')" 	
		end if
	end if

end function

' --- Nombres de productos --------------------------------------------------------------------------------------------------------------
function NomProducte ( byval id )

	dim rs
	set rs = rec("Select nom From Articles Where Codi=" & id)

	NomProducte = ""

	if not rs.EOF then
		NomProducte = rs("nom")
	elseif exists("Articles_Zombis") then
		set rs = rec("Select nom From " & tablaArticlesZombis() & " Where Codi=" & id)
		if not rs.eof then NomProducte = rs("nom")
	end if

	if NomProducte = "" then
		if exists("articlesHistorial") then
			set rs = rec("Select nom From " & tablaArticlesHistorial() & " Where Codi=" & id & " nom<>'' and not nom is null")
			if not rs.eof then NomProducte = rs("nom")
		end if
	end if

	if NomProducte = "" then
		NomProducte = "Producte " & id
		rec "insert into articles(codi,nom) values(" & id & ",'" & NomProducte & "')"
	end if

end function

' --- Nombres de la empresa -------------------------------------------------------------------------------------------------------------
function nomEmpresa() 
	nomEmpresa = getConstant ( "CampNom" )
end function

function nomEmpresa(n) 
	nomEmpresa = getConstant ( iif(n="","",n & "_") & "CampNom" )
end function

' --- Número de la empresa --------------------------------------------------------------------------------------------------------------
function donamNumEmpresa ( byval client )
	set rsEmp = rec("select camp from constantsEmpresa where valor='" & client & "'")
	if not rsEmp.eof then
		donamNumEmpresa = rsEmp("camp")
		if instr(donamNumEmpresa,"_") > 0 then
			donamNumEmpresa = split(donamNumEmpresa,"_")(0)
		else
			donamNumEmpresa = "0"
		end if
	else
		donamNumEmpresa = "0"
	end if
end function

%>