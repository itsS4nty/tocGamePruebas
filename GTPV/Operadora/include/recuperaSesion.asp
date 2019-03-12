<%
if session ( "Iniciat" ) <> "Si" then

	' Cogemos el id de la cookie
	idCookie = getCookie ( "RecordaCookieID" )

	' Tamaño por defecto
	session("W") = 800
	session("H") = 600

	' Conexión con la DB Hit
	connectHIT

	' Buscamos la empresa
	sql = "select e.id,e.nom,e.password from cookie c left join web_empreses e on e.id=c.empresa "
	sql = sql & "where c.id='" & idCookie & "' and c.tipo like 'RECORDA' and c.fecha="
	sql = sql & "(select max(fecha) from cookie where id='" & idCookie & "' and tipo like 'RECORDA')"
	set rs = recHit ( sql )

	if not rs.eof then

		user = ucase ( rs("nom") )
		pass = ucase ( rs("password") )

		session("portal") = "RECORDA"
		getEmprSessionByID rs("id")
		connectUSER

		if user = "PABALLSA" then
			session ( "soloFichar" ) = "SI"
		end if

		set rsTam = recHit ( "select valor from web_empreses_nombrevalor where empresa='" & rs("id") & "' and nombre like 'WIDTH'" )
		if not rsTam.eof then session("W") = rsTam ( "valor" )

		set rsTam = recHit ( "select valor from web_empreses_nombrevalor where empresa='" & rs("id") & "' and nombre like 'HEIGHT'" )
		if not rsTam.eof then session("H") = rsTam ( "valor" )

	end if

	if Session ( "UsuariLogat" ) = "Si" then 
		resetActiveX
		testActiveX
	end if

end if
%>