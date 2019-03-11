<%@ Language=VBScript %>
<!-- #include virtual="/Facturacion/include/global.asp" -->
<!-- #include virtual="/Facturacion/Utils.asp" --><%
	Tipus= request.item("Tipus")
	CodiLast = request.item("Codi")
	if CodiLast = "" then CodiLast = 0
	
	set rs = rec("select isnull(Lo,'NoDef') Lo,isnull(La,'NoDef') La,codi,isnull(C.Nom,'') Nom,c.[Nom Llarg] NomLlarg,c.adresa adresa,c.cp Cp ,c.ciutat ciutat,Lo,La from clients c left join hit.dbo.geocodes g on c.adresa = g.adresa collate Modern_Spanish_CI_AS and c.Cp = g.Cp collate Modern_Spanish_CI_AS and c.Ciutat = G.Ciutat collate Modern_Spanish_CI_AS where not isnull(nom,'') = '' And Codi > " & CodiLast & " order by codi ")

	CodiNext = ""
	Descripcio  = ""
	Nom  = ""
	Lo  = ""
	La  = ""
	AdresaTxt  = ""
	Adresa  = ""
	Cp  = ""
	Ciutat  = ""
	Pais 	 = ""
	while not rs.eof and CodiNext=""
		texte = trim(Rs("Adresa"))
		Lo=Rs("Lo")
		La=Rs("La")
		if len(texte)>0 and not (lo=0 and La = 0 )then
			CodiNext = Rs("Codi")
			Descripcio = trim(Rs("Nom")) & "<Br>" & trim(Rs("NomLlarg"))
			Adresa=ucase(trim(Rs("Adresa")))
			Cp=ucase(trim(Rs("Cp")))
			Ciutat=ucase(trim(Rs("Ciutat")))
			Pais=ucase(trim("Spain"))
			
			Descripcio = join(split(Descripcio,"'")," ")
			Descripcio = join(split(Descripcio,"´")," ")

			if len(trim(Rs("Cp"))) > 0 then texte = texte & " | "  & Rs("Cp")
			if len(trim(Rs("Ciutat"))) > 0 then texte = texte & " | "  & Rs("Ciutat")
			texte = texte & " | Spain"
			
			Texte = ucase(Texte)
			Texte = join(split(Texte,"¦")," ")
			Texte = join(split(Texte,"+")," ")
			Texte = join(split(Texte,"N.")," ")
			Texte = join(split(Texte,"C/")," ")
			Texte = join(split(Texte,"-")," ")
			Texte = join(split(Texte,"BARNA"),"BARCELONA")
			Texte = join(split(Texte,"AVDA"),"AVINGUDA")
			Texte = join(split(Texte,"MDO."),"MERCAT MUNICIPAL ")
			Texte = join(split(Texte,"PDA"),"PARADA ")
			Texte = join(split(Texte,".")," ")
			Texte = join(split(Texte,"Ç"),"S")
			Texte = join(split(Texte,"Ñ"),"N")
			Texte = join(split(Texte,"'")," ")
			Texte = join(split(Texte,"´")," ")
			Texte = join(split(Texte,",")," ")
			Texte = join(split(Texte,"|"),",")
			
			Texte = trim(SolsAscii(Texte))
			Descripcio = Descripcio  & " <Br> " & Texte 
			Nom = trim(join(split(Rs("Nom"),"'")," "))
		end if	
	wend
	rs.close

	response.clear
	response.write 	 CodiNext & "|" & Descripcio & "|" & Nom & "|" & Lo & "|" & La & "|" & AdresaTxt & "|" & Adresa & "|" & Cp & "|" & Ciutat & "|" & Pais 

	
%>