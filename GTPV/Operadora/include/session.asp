<%

function noCache ( )
	noCache = "<meta http-equiv=""Pragma"" content=""no-cache"">"
end function

' --- Rellena las variables de sesion de la empresa -------------------------------------------------------------------------------------
sub getEmprSession ( )

	if session ( "Usuari_Donde" ) = "GR" then

		connectRES

		sqlGES = "select nombre nom,nombre descripcio,db,nombre logo,'res.css' estil,'\Empreses\'+nombre path,'Si' activa,0 llicencia,"
		sqlGES = sqlGES & "web_server servidor,'[GR][CDP]' ppv,0 publicitat,passwd password,cnx_servidor db_server,cnx_user db_user,"
		sqlGES = sqlGES & "cnx_passwd db_pass,ips,id from empresas where id ='" & session ( "Usuari_Empresa_Id" ) & "' or nombre='" & session ( "Usuari_Empresa_Id" ) & "' "

		set rsGES = recRes ( sqlGES )

		if not rsGES.eof then
			for each Camp in rsGES.Fields
				campName = Camp.Name
				campName = change ( campName, " ", "_" )
				campName = change ( campName, "ç", "c" )
				campName = change ( campName, "Ç", "C" )
				val = iif ( isnull(Camp.Value), "", Camp.Value )
				Session("Usuari_Empresa_" & campName ) = trim ( val )
			next
			getCssByPortal ( )
		end if
	else

		set rsGES = recHit("select * from web_empreses where nom like '" & Session("Usuari_Empresa") & "'")
		if not rsGES.eof then
			for each Camp in rsGES.Fields
				campName = Camp.Name
				campName = change ( campName, " ", "_" )
				campName = change ( campName, "ç", "c" )
				campName = change ( campName, "Ç", "C" )
				val = iif ( isnull(Camp.Value), "", Camp.Value )
				Session("Usuari_Empresa_" & campName ) = trim ( val )
			next
			getCssByPortal ( )
		end if

	end if

end sub

sub getEmprSessionByID ( byval id )
	set rsGES = recHit("select * from web_empreses where id='" & id & "'")
'	if rsGES.eof then set rsGES = recHit("select * from web_empreses where nom='" & id & "'")

	if not rsGES.eof then
		for each Camp in rsGES.Fields
			campName = Camp.Name
			campName = change ( campName, " ", "_" )
			campName = change ( campName, "ç", "c" )
			campName = change ( campName, "Ç", "C" )
			val = iif ( isnull(Camp.Value), "", Camp.Value )
			Session("Usuari_Empresa_" & campName ) = trim ( val )
		next
		getCssByPortal ( )
	end if
end sub

' --- Según el portal coje un estilo CSS u otro -----------------------------------------------------------------------------------------
sub getCssByPortal ( )
	if session("portal") = "CDC" or left(Request.ServerVariables("URL") ,29) = "/Facturacion/ControlDeCompras" then

		glTIT   = "Control de Compras"
		gESTIL  = "CDC"

		session("Usuari_Estil") = gESTIL
		session("Usuari_Empresa_Estil") = gESTIL & ".css"

		fColor1 = "0063A5"
		fColor3 = "BDC6DA"


	elseif session("portal") = "CDP" then

		glTIT   = "CDP"
		gESTIL  = "Cdp"

		session("Usuari_Estil") = gESTIL
		session("Usuari_Empresa_Estil") = gESTIL & ".css"

	elseif session("portal") = "CRM" then

		glTIT   = "CRM"
		gESTIL  = "CRM"

		session("Usuari_Estil") = gESTIL
		session("Usuari_Empresa_Estil") = gESTIL & ".css"

	elseif session("portal") = "RECORDA" then

		glTIT   = "RECORDA"
		gESTIL  = "Recorda"

		session("Usuari_Estil") = gESTIL
		session("Usuari_Empresa_Estil") = gESTIL & ".css"

	elseif session("portal") = "ENTRADA" then

		'NADA

	else

		if session("Usuari_Donde") = "" then
			if session("Usuari_Id") <> "" then
				getUserSession session("Usuari_Id")
				getEmprSession
				if session("Usuari_Empresa_Estil") <> "" then
					if instr(session("Usuari_Empresa_Estil"),".") then
						session("Usuari_Estil") = ucase(split(session("Usuari_Empresa_Estil"),".")(0))
					end if
				end if
				gESTIL = session("Usuari_Estil")
			else
				gESTIL = "FORN"
			end if
		else
			set rsCSS = recHit ( "select estil from web_empreses where id='" & session("Usuari_Empresa_Id") & "'")
			session("Usuari_Empresa_Estil") = rsCSS("estil")
			session("Usuari_Estil") = split(ucase(session("Usuari_Empresa_Estil")),".")(0)
			gESTIL = session("Usuari_Estil")
			session("Usuari_Empresa_Estil") = gESTIL & ".css"
		end if

		gESTIL = "FORN"

		select case gESTIL
			case "FORN":
				fColor1 = "0063A5"
				fColor2 = "EEEEFF"
				fColor3 = "BDC6DA"
				fColor4 = "95A1C3"
				fColor5 = "386ac7"
				glTIT   = "Gestió de la Fleca"
			case "DROG":
				fColor1 = "008000"
				fColor2 = "EEFFEE"
				fColor3 = "BDDAC0"
				fColor4 = "B2C891"
				fColor5 = "39C65D"
				glTIT   = "Gestió de la Drogueria"
			case "FRUIT":
				fColor1 = "008000"
				fColor2 = "EEFFEE"
				fColor3 = "BDDAC0"
				fColor4 = "B2C891"
				fColor5 = "39C65D"
				glTIT   = "Gestió de la Fruiteria"
			case "CDP"
				fColor1 = "000000"
				fColor2 = "CCCCCC"
				glTIT   = "Control de Personal"
		end select

	end if

end sub

' --- Rellena las variables de sesion del usuario ---------------------------------------------------------------------------------------
sub getUserSession ( byval id )
	set rsGUS = recHit("select * from web_users where id=" & id)
	if not rsGUS.eof then
		for each Camp in rsGUS.Fields
			campName = Camp.Name
			campName = change ( campName, " ", "_" )
			campName = change ( campName, "ç", "c" )
			campName = change ( campName, "Ç", "C" )
			val = iif ( isnull(Camp.Value), "", Camp.Value )
			Session ( "Usuari_" & campName ) = Camp.Value
		next
	end if
end sub

sub getUserSessionNew ( byval id )

	dim campName
	dim val

	if session ( "Usuari_Donde" ) = "GR" then

		sql = "select u.nombre nom,'" & session ( "Usuari_Empresa_Nom" ) & "' empresa,u.password,e.nivel nivellseguretat,"
		sql = sql & "'/' paginainici,'' route_ip,'' route_cookie,'' route_url,u.tipo tipus "
		sql = sql & "from usuarios u left join res.dbo.tipoEmpleado e on e.tipo=u.tipo where id='" & id & "'"
		set rsGUS = rec ( sql )
		for each Camp in rsGUS.Fields
			campName = Camp.Name
			val = iif ( isnull(Camp.Value), "", Camp.Value )
			val = change ( val, " ", "_" )
			Session ( "Usuari_" & campName ) = val
		next

		sql = "select id codi,nombre nom, nick memo,telefono,ltrim(direccion + ' ' + cast(cp as nvarchar) + ' ' + poblacion) adreca,"
		sql = sql & "tipo icona,0 [hi editem horaris],null tid from usuarios where id='" & id & "'"
		set rsGUS = rec ( sql )
		for each Camp in rsGUS.Fields
			campName = Camp.Name
			val = iif ( isnull(Camp.Value), "", Camp.Value )
			val = change ( val, " ", "_" )
			Session ( "Usuari_" & campName ) = val
		next

	else

		set rsGUS = rec ( "select * from " & tablaDependentesExtes ( ) & " where id='" & id & "'" )
		if not rsGUS.eof then
			while not rsGUS.eof
				campName = rsGUS("nom")
				campName = change ( campName, " ", "_" )
				campName = change ( campName, "ç", "c" )
				campName = change ( campName, "Ç", "C" )
				val = iif ( isnull(rsGUS("valor")), "", rsGUS("valor") )
				Session ( "Usuari_" & campName ) = val
				rsGUS.movenext
			wend
		end if

		set rsGUS = rec ( "select * from dependentes where codi=" & id )
		if not rsGUS.eof then
			for each Camp in rsGUS.Fields
				campName = Camp.Name
				campName = change ( campName, " ", "_" )
				campName = change ( campName, "ç", "c" )
				campName = change ( campName, "Ç", "C" )
				val = iif ( isnull(Camp.Value), "", Camp.Value )
				val = change ( val, " ", "_" )
				Session ( "Usuari_" & campName ) = trim ( val )
			next
		end if

	end if


end sub

' --- Obtiene un vector con las aplicaciones a las que tiene acceso la empresa del usuario -------------------------------------------------
sub GetUserApplications ( )

	dim ppv
	dim aux
	dim uApp
	dim c
	dim j

	ppv = Session("Usuari_Empresa_PPV")
	aux = ""
	redim uApp(0)
	c   = ""
	j   = 0

	for i = 1 to len(ppv)
		c = mid ( ppv, i, 1 )
		if c = "[" then
			aux = ""
		elseif c = "]" then
			if not ( ( aux = "CDP" or aux = "CDC" ) and Session ( "Usuari_NivellSeguretat") = "4" ) then
				redim preserve uApp(j)
				uApp(j) = aux
				j = j + 1
			end if
		else
			aux = aux & c
		end if
	next

	session("Usuari_Empresa_App") = uApp

end sub

%>