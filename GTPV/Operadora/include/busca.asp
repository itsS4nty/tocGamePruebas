<%@ Language=VBScript %>
<!-- #include virtual="/Facturacion/include/global.asp" -->
<%
	FrameName = request.item("FrameName")
	searchOriginal = request.item("search")
	Control = request.item("Control")
	Tipus = request.item("Tipus")
	Maxim = cdbl(request.item("Maxim"))
		
	InfoPlus = false 
	if instr(searchOriginal,"?") then InfoPlus = true
	
	if len(searchOriginal) = 0 then response.end 
	search = searchOriginal
	search = join(split(search,"  "),"%")
	search = join(split(search,"?"),"")
	
	redim preserve Str(Maxim)
	StrI = 0
	redim preserve StrClavat(Maxim)
	StrClavatI = 0
	
	if InfoPlus = true then
		data = now
		if len(session("fechaComandes")) > 0 then Data = session("fechaComandes")
		set Rs = rec("Select Param3,Param2 From Agenda_" & year(data) & "  where left(Concepto,14) = 'ComandaClient_' and Fecha = convert(datetime,'" & data & "',103) ") 
		while not rs.eof
			imatge = "tickCli.gif"
			Texte  = "Nota : " & Rs("Param3")
			
			session("dadaCalculada_" & Rs("Param2")) = "<img height=12 src='"& ICOSFORN & imatge & "' ALT='" & Texte & "'>"
			rs.movenext
		wend	
	
		set Rs = rec("Select max(data) Data,botiga Botiga from ( select max(data) Data ,botiga from [v_venut_" & Year(now) & "-" & right("00" & month(now) ,2) & "] group by botiga union select distinct null Data , valor1 botiga  from paramshw)  a group by botiga  ")
		while not rs.eof
			if isnull(Rs("Data")) then 
				imatge = "TrucadaNo.ico"
				Texte  = "No Truca !!"
			elseif day(Rs("Data")) = day(now) then 
				imatge = "TrucadaSi.ico"
				Texte  = hour(Rs("Data")) & ":" & right("00" & minute(Rs("Data")) ,2 )
			else
				imatge = "TrucadaCasi.gif"
				Texte  = Rs("Data")	
			end if			
			
			if instr(session("dadaCalculada_" & Rs("Botiga")) , "Nota : ")  >0 then
				session("dadaCalculada_" & Rs("Botiga")) = session("dadaCalculada_" & Rs("Botiga")) & "<img height=12 src='"& ICOSFORN & imatge & "' ALT='Ultima Dada " & Texte & "'>"
			else
				session("dadaCalculada_" & Rs("Botiga")) = "<img height=12 src='"& ICOSFORN & imatge & "' ALT='Ultima Dada " & Texte & "'>"
			end if 
			
			rs.movenext
		wend
	end if
	
	CodisInclossos = "0," 
	select case Tipus 
		case "Clients"
			set rs = rec("Select * from Clients Where Nom like '%" & search & "%' and not codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom")
			while not rs.eof and StrI<Maxim
				AddStr Rs("Nom"),Rs("Codi"),Rs("Nom"),""
				rs.movenext
			wend
			set rs = rec("Select * from Clients Where [Nom Llarg] like '%" & search & "%' and not codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom")
			while not rs.eof and StrI<Maxim
				AddStr Rs("Nom"),Rs("Codi"),Rs("Nom Llarg"),"Nom2:"
				rs.movenext
			wend
			set rs = rec("select c.nom,c.codi,cc.valor from clients c join constantsclient cc on cc.valor like '%" & search & "%' And ( variable = 'Grup_client') And cc.codi = c.codi Where  not c.codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom" )
			while not rs.eof and StrI<Maxim
				AddStr Rs("Nom"),Rs("Codi"),Rs("Valor"),"Grup:"
				rs.movenext
			wend
			set rs = rec("select c.nom,c.codi,cc.valor from clients c join constantsclient cc on cc.valor like '%" & search & "%' And variable = 'CodiContable' and cc.codi = c.codi Where  not c.codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom" )
			while not rs.eof and StrI<Maxim
				AddStr Rs("Nom"),Rs("Codi"),Rs("Valor"),"Codi:"
				rs.movenext
			wend
			if StrI < 20 then 	
				set rs = rec("select c.nom,c.codi,cc.valor from clients c join constantsclient cc on cc.valor like '%" & search & "%' And ( variable = 'Tel' Or variable = 'Fax' Or variable = 'Email' Or variable = 'P_Contacte') And cc.codi = c.codi Where  not c.codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom" )
				while not rs.eof and StrI<Maxim
					AddStr Rs("Nom"),Rs("Codi"),Rs("Valor"),"Contact:"
					rs.movenext
				wend
			end if
		case "Articles"	
			if isnumeric(search) then 
				set rs = rec("select a.codi codi,a.nom nom,valor from articles a join articlespropietats p on variable='CODI_PROD' and codiarticle=a.codi and valor like '%" & search & "%' and not codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom")
				while not rs.eof and StrI<Maxim
					AddStr Rs("Nom"),Rs("Codi"),Rs("Valor"),"Codi : "
					rs.movenext
				wend
			end if 
			set rs = rec("Select * from Articles Where Nom like '%" & search & "%' and not codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom")
			while not rs.eof and StrI<Maxim
				AddStr Rs("Nom"),Rs("Codi"),Rs("Nom"),""
				rs.movenext
			wend
			if not isnumeric(search) then 
				set rs = rec("select a.codi codi,a.nom nom,valor from articles a join articlespropietats p on variable='CODI_PROD' and codiarticle=a.codi and valor like '%" & search & "%' and not codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom")
				while not rs.eof and StrI<Maxim
					AddStr Rs("Nom"),Rs("Codi"),Rs("Valor"),"Codi : "
					rs.movenext
				wend
			end if	
			if isnumeric(search) then 
				set rs = rec("Select * from Articles Where Preu = '" & search & "' and not codi in (" & left(CodisInclossos,len(CodisInclossos)-1) & ") Order By nom")
				while not rs.eof and StrI<Maxim
					AddStr Rs("Nom"),Rs("Codi"),Rs("Preu"),"Preu : "
					rs.movenext
				wend
			end if 
	end select
	
	if StrI = Maxim then 
		Strin = "<div onclick='clicatTot(""" & FrameName & """,""" & Control & """,""" & Tipus & """);' class='sr' style='text-align:center;background:silver;' id='element_9999' value='" & -1 & "'><Input Type=Hidden id='element_Mostrar_9999' value=''>"
		Strin = Strin & "<p >VVVV Mes VVVV</p>"
		Strin = Strin & "</div>"
		Str(StrI) = Strin
		StrI = StrI + 1
	end if

	response.clear
	redim preserve Resultat(StrI+StrClavatI+3)
	k=0
	for i=0 to StrClavatI-1
		Resultat(k) = join(Split(StrClavat(i),"_9999"),"_" & k & "")
		k=k+1
	next
	
	for i=0 to StrI-1
		Resultat(k) = join(Split(Str(i),"9999"),k) 
		k=k+1
	next
	response.write escape(join(Resultat,""))
	
	function AddStr(Mostrar,Codi,Clau,Tipus)
		CodisInclossos = CodisInclossos & Codi & "," 
		Strin = "<div onmouseover='clicatRanglo(9999,""" & FrameName & """,""" & Control & """,""" & Tipus & """);'  onclick='clicatRanglo2(9999,""" & FrameName & """,""" & Control & """,""" & Tipus & """);' class='sr' id='element_9999' value='" & Codi & "'><Input Type=Hidden id='element_Mostrar_9999' value='" & Mostrar & "'>"
		Strin = Strin & "<span class='srt'>" & Mostrar & "</font></span>"
		if len(session("dadaCalculada_" & Codi)) > 0 OR not Mostrar = Clau then 
			Strin = Strin & "<span class='src'>"
			if len(session("dadaCalculada_" & Codi)) > 0  then Strin = Strin & session("dadaCalculada_" & Codi) 
			if not Mostrar = Clau then 	Strin = Strin & Tipus & Clau 
			Strin = Strin & "</span>"
		End If
		
		Strin = Strin & "</div>"
		
		if ucase(trim(searchOriginal)) = ucase(trim(Clau)) then
			StrClavat(StrClavatI) = Strin
			StrClavatI = StrClavatI + 1
		else
			Str(StrI) = Strin
			StrI = StrI + 1
		end if 		
		
	end function
	
	
%>