<%

function tablaDiccionari ( )
	tablaDiccionari = "hit.dbo.Diccionari"
	if not existsHit ( tablaDiccionari ) then
		dim sqlFM
		sqlFM = "Create Table " & tablaDiccionari & " ("
		sqlFM = sqlFM & "Id      	nvarchar (255) null constraint [DF_" & tablaDiccionari & "_id] default (newid()), "
		sqlFM = sqlFM & "IdStr 		nvarchar (255), "
		sqlFM = sqlFM & "App 		nvarchar (255), "
		sqlFM = sqlFM & "Pagina 	nvarchar (255), "
		sqlFM = sqlFM & "Idioma 	nvarchar (255), "
		sqlFM = sqlFM & "TexteOriginal nvarchar (255), "
		sqlFM = sqlFM & "Texte 		nvarchar (255)) "
		recHit sqlFM
	end if

end function

sub DicW(Texte)
	response.write Dic(Texte)
end sub

function Dic(Texte)
	dim Rs,Sql
	Dic= Texte

	Idioma = session("Usuari_IDIOMA")
	if Idioma = "" then 
		set rsIdioma = rec("SELECT * FROM " & tablaConstantsEmpresa() & " WHERE camp LIKE '%CampIdioma'")
		if not rsIdioma.eof then Idioma = rsIdioma("valor")
	end if
	if Idioma = "" then Idioma = "ES"
	
	App = "Facturacio"
	Pagina = ""
	if len(session("Estat_Titol") ) > 0 Or len(session("Estat_Pagina") ) > 0 then  Pagina 	= session("Estat_Titol")  & "_" & session("Estat_Pagina") 
	'Idt = Pagina & Texte
	Idt = Texte

	if Idioma = "CA" or Idioma = ""	then 
		Dic= Texte
	else
		if ObjDiccionari.Count = 0 then  
			Sql = "Select Distinct isnull(IdStr,'') IdStr ,isnull(Texte,'') Texte  from " & tablaDiccionari & " Where "
			Sql = Sql & "App   = '" & App  & "'    And "
			Sql = Sql & "Idioma= '" & Idioma  & "'  "
			set Rs = recHit (Sql)
			while not Rs.eof 
				ObjDiccionari.Item(Rs("IdStr"))= Rs("Texte")
				Rs.movenext
			wend
		end if
		
		if not ObjDiccionari.Exists(Idt) then 
			Sql = "Select Distinct isnull(IdStr,'') IdStr ,isnull(Texte,'') Texte  from " & tablaDiccionari & " Where "
			Sql = Sql & "App   = '" & App  & "'    And "
			Sql = Sql & "Idioma= '" & Idioma  & "'  And "
			Sql = Sql & "IdStr= '" & Idt  & "'  "
			set Rs = recHit (Sql)
			if Rs.eof then
				Sql = "Insert Into " & tablaDiccionari & "  (IdStr,App,Pagina,Idioma,TexteOriginal,Texte) Values "
				Sql = Sql & "('" & Idt & "',"
				Sql = Sql & "'" & App  & "',"
				Sql = Sql & "'" & Pagina   &"',"
				Sql = Sql & "'" & Idioma  & "',"
				Sql = Sql & "'" & Texte  & "',"
				Sql = Sql & "'" & Texte  & "') "
				recHit (Sql)
			else 
				Texte = Rs("Texte")
			end if
			Dic = Texte  
			ObjDiccionari.Item(Idt) = Texte
		else
			Dic = ObjDiccionari.Item(Idt)
		end if
	end if
	
	
end function 				


%>
