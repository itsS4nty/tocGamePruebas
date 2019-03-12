<%@ Language=VBScript %>
<!-- #include virtual="/Facturacion/include/global.asp" -->
<!-- #include virtual="/Facturacion/Utils.asp" --><%
	CClient= request.item("codi")
	Ordre = request.item("Ordre")
	Data = request.item("Data")

	response.clear
	if Ordre="Comentari" then
		set Rs = Rec("Select distinct substring(comentari,charindex ('[',comentari)+10 , charindex (']',comentari,charindex ('_',comentari)+1) - charindex ('_',comentari)-11) ,Viatge from " & nomTaulaServits(Data) & " Where Client = " & CClient & " and comentari like '%IdAlbara:%' order by substring(comentari,charindex ('[',comentari)+10 , charindex (']',comentari,charindex ('_',comentari)+1) - charindex ('_',comentari)-11)  ")
        %>Albara <select size="1" name="NumAlbara"><%
        %><option value="Tots"><%=Dic("Tots")%></option><%
        %><option value="Nou"><%=Dic("Nou")%></option><%
		while not rs.eof 
	        %><option value="<%=Rs(0)%>" ><%=Rs(0) & " - " & Rs("Viatge")%></option><%
			rs.movenext
		wend
        %></select></td><%
	else
		Texte = ""
		Set Rs = rec("Select isnull(Variable,'') Variable,isnull(Valor,'') Valor from constantsclient where Codi = " & CClient & " ")
		while not rs.eof  
			if rs("Variable") ="Tel" then Texte = Texte & "<Td align='Left'>"  & rs("Valor") & "</Td>"
			if rs("Variable") ="P_Contacte" then Texte = Texte & "<Td align='Left'> "  & rs("Valor") & "</Td>"
			rs.movenext
		wend
		
		Comentari = ""
		set Rs = rec("Select Param3 From Agenda_" & year(now) & "  where Concepto = 'ComandaClient_" & CClient & "' and Fecha = convert(datetime,'" & Data & "',103) ") 
		if not rs.eof then if not isnull(rs("Param3")) then Comentari = rs("Param3")
		
		response.write "<Table><Tr>" & Texte & "</Tr></Table>"
		if Comentari<>"" then response.write ",#," & Comentari
		
	end if
%>