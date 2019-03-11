<%

if request.QueryString("w") <> "" then session("w") = request.QueryString("w")

viaje = join(split(request.QueryString("viaje"),"{AMP}"),"&")
inici = -1
tabla=tablaServits(session("fecha"))

rec "update " & tabla & " set viatge='[SENSE NOM]' where viatge is null or viatge = ''"

cli  = ""
cnom = ""
art  = ""
anom = ""
qd   = ""
qs   = ""
com  = ""

function viajesHoy()
	Filtre  = ""
	if len(session ( "Usuari_Recurso_id" ))  > 0 then 
		set rs = rec("select isnull(Valor,'') Valor from recursosextes where id = '" & session ( "Usuari_Recurso_id" ) & "' and variable = 'VIAJES' ")
		if  not rs.eof then
			Filtre = trim(rs("Valor"))
			if len(Filtre)> 0 then
				Filtre = " Where Viatge in ('" & join(split(Filtre,", "),"','") & "')  "
			end if
		end if
	end if

	sql = "select distinct viatge,isnull(minutinici,0)as inici,"
	sql = sql & "sum(quantitatdemanada) qd,sum(quantitatservida) qs "
	sql = sql & "from " & tabla & "left join viatges on viatge=nom "
	sql = sql & Filtre
	sql = sql & "group by minutinici,viatge order by inici"
	set viajesHoy=rec(sql)
end function

function clientesHoy()
	sql = "select distinct s.client as cod,c.nom from " & tabla & " s left join clients c on s.client=c.codi group by s.client,c.nom "
	sql = sql & "having sum(s.quantitatdemanada)>0 order by c.nom"
	set clientesHoy=rec(sql)
end function

inici = 0

if viaje = "" or isnull(viaje) then

	'obtiene el siguiente viaje, si no hay ninguno, coje el primero
	sql = "select viatge,isnull(minutinici,0)as inici from " & tabla & " left join viatges "
	sql = sql & "on viatge=nom where isnull(minutinici,0)in(select min(isnull(minutinici,0))as inici "
	sql = sql & "from viatges where isnull(minutinici,0)>" & hour(now)+(minute(now)*60) & ") "
	sql = sql & "group by viatge,isnull(minutinici,0) union(select top 1 viatge,"
	sql = sql & "min(isnull(minutinici,0))as inici from " & tabla & " left join viatges "
	sql = sql & "on viatge=nom group by viatge)order by inici desc"
	set rs = rec(sql)

	if not rs.eof then
		viaje = rs("viatge")
		inici = cInt(rs("inici"))
	end if

else

	sql = "select minutinici from viatges where nom = '" & viaje & "'"
	set rs=rec(sql)
	if not rs.eof then inici = cInt(rs("minutinici"))

end if



if inici <> -1 then

	'obtiene el codigo y el nombre del cliente, el codigo y el nombre del articulo y
	'las cantidades pedidas y servidas con respecto al viaje anterior
	rec "Delete constantsclient where variable = 'CodiContable' and valor = '' "

	sql = "Select s.client as client ,c.nom as cli ,cc.valor "
	sql = sql & "From " & tabla & " s left join "
	sql = sql & "clients c on c.codi=s.client left join "
	sql = sql & "constantsclient cc on variable = 'CodiContable' and cc.codi = s.client  "
	sql = sql & "where viatge ='" & viaje & "' "
	sql = sql & "group by s.client,c.nom,cc.valor "
	sql = sql & "order by c.nom, cast(isnull(cc.valor,'9999999') AS float) "

	set rs=rec(sql)

	while not rs.eof
		if not isnull(rs("cli")) then 
			if inStr("," & cli,"," & rs("client") & ",")=0 then
				cli = cli & rs("client") & ","
				cnom = cnom & change(rs("cli"), ",","") & ","
			end if
		end if	
		rs.movenext
	wend
	
	sql = "Select s.codiarticle as codiarticle, isnull(a.nom,'[ELIMINAT]') as art, cc.valor "
	sql = sql & "from " & tabla & " s "
	sql = sql & " left join Articles a on a.codi = s.codiarticle "
	sql = sql & " left join articlespropietats cc on variable = 'CODI_PROD' and cc.codiarticle = s.codiarticle "
	sql = sql & "where viatge ='" & viaje & "' "
	sql = sql & "group by s.codiarticle,a.nom, cc.valor "
	sql = sql & "order by isnull(cc.valor,'9999999'), a.nom "	
	'sql = sql & "order by cast(isnull(cc.valor,'9999999') AS float), a.nom "
	set rs=rec(sql)

	while not rs.eof
		if inStr("," & art,"," & rs("codiarticle") & ",")=0 or art="" then
			art = art & rs("codiarticle") & ","
			anom = anom & change(change(rs("art"),"""","\"""),",",".") & ","
		end if
		rs.movenext
	wend


'	sql = "select client,cli,art,codiarticle,sum(qd) qd,max(comentari) comentari,sum(qs) qs "
'	sql = sql & "from "
'	sql = sql & "(select client,c.nom cli,isnull(a.nom,'') art,isnull(codiarticle,0) codiarticle,isnull(sum(quantitatdemanada),0) qd,"
'	sql = sql & "        isnull(comentari,'') comentari,sum(isnull(quantitatservida,0)) qs, isnull(a.familia,'') fam "
'	sql = sql & " from " & tabla & " s "
'	sql = sql & "   left join clients c on c.codi=s.client "
'	sql = sql & "   left join articles a on s.codiarticle=a.codi "
'	sql = sql & " where viatge " & iif(isnull(viaje),"is null","='" & viaje & "'") & " and "
'	sql = sql & "       c.codi=client and codiarticle=a.codi "
'	sql = sql & " group by client,c.nom,a.nom,a.familia,codiarticle,comentari)kk "
'	sql = sql & "group by client,cli,art,fam,codiarticle "
'	sql = sql & "order by cli, fam , art "
	sql = "select isnull(client,'') as client,isnull(codiarticle,0) as codiarticle,sum(quantitatdemanada) qd,max(isnull(comentari,'')) comentari,sum(QuantitatServida) qs  "
	sql = sql & "from " & tabla & " s where viatge ='" & viaje & "' "
	sql = sql & "group by client,codiarticle "
	set rs=rec(sql)
	while not rs.eof
		qd = qd & "qd[" & busca(split(art,","),cstr(rs("codiarticle"))) & "][" & busca(split(cli,","),cstr(rs("client"))) & "]=" & join(split(rs("qd"),","),".") & "; " 
		qs = qs & "qs[" & busca(split(art,","),cstr(rs("codiarticle"))) & "][" & busca(split(cli,","),cstr(rs("client"))) & "]=" & join(split(rs("qs"),","),".") & "; " 
		com = com & "com[" & busca(split(art,","),cstr(rs("codiarticle"))) & "][" & busca(split(cli,","),cstr(rs("client"))) & "]='" & 	join(split(quitaIds(rs("comentari")),vbcrlf),"<br>") & "'; " 
		rs.movenext
	wend
end if


'viaje +
sql = "select s.viatge,v.minutinici from " & tabla & " s join viatges v on s.Viatge=v.nom "
sql = sql & "where (v.minutinici>" & inici & ")or(v.minutinici=" & inici & " "
sql = sql & "and s.viatge>'" & viaje & "') order by v.minutinici,s.viatge"
set rs=rec(sql)
if not rs.eof then
	viajeMas = viajes & rs("viatge")
else
	sql = "select top 1 s.viatge,v.minutinici from " & tabla & " s join viatges v on "
	sql = sql & "s.Viatge=v.nom order by v.minutinici,s.viatge"
	set rs=rec(sql)
	if not rs.eof then viajeMas = viajes & rs("viatge")
end if
viajeMas = join(split(join(split(viajeMas," "),"+"),"&"),"{AMP}")

'viaje -
sql = "select s.viatge,v.minutinici from " & tabla & " s join viatges v on s.Viatge=v.nom "
sql = sql & "where (v.minutinici<" & inici & ")or(v.minutinici=" & inici & " "
sql = sql & "and s.viatge<'" & viaje & "')order by v.minutinici desc,s.viatge desc"
set rs=rec(sql)

if not rs.eof then
	viajeMenos = viajes & rs("viatge")
else
	sql = "select top 1 s.viatge,v.minutinici from " & tabla & " s join viatges v on "
	sql = sql & "s.Viatge=v.nom order by v.minutinici desc,s.viatge desc"
	set rs=rec(sql)
	if not rs.eof then viajeMenos = viajes & rs("viatge")
end if
viajeMenos = join(split(join(split(viajeMenos," "),"+"),"&"),"{AMP}")

function nombreProveedor ( byval id )
	nombreProveedor = ""
	if len(id) > 0 then 
		set rsNP = rec("select isnull(nombre,isnull(nombreCorto,'')) nom from " & tablaProveedores ( ) & " where id='" & id & "'")
		if not rs.eof then nombreProveedor = rsNP("nom")
	end if
end function
%>
