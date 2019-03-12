<%@ Language=VBScript %>
<!-- #include virtual="/Facturacion/include/global.asp" -->
<!-- #include virtual="/Facturacion/Utils.asp" -->

<%
	Data = request.item("Data")

	Client = request.item("Client")
	Data = request.item("Data")
	Comentari = request.item("Comentari")
	Usu = session("Usuari_nom") & " " & day(Now) & "/" & month(Now) & " "  & hour(Now) & ":" & minute(Now)
		
	rec "Delete      Agenda_" & year(now) & " where Concepto = 'ComandaClient_" & Client & "' and Fecha = convert(datetime,'" & Data & "',103) "
	rec "insert into Agenda_" & year(now) & " (Fecha, Concepto, Param1, Param2, Param3, Param4) values ('" & Data & "', 'ComandaClient_" & Client & "','" & Usu & "','" & Client & "', '" & Comentari & "', '" & now & "')"
	
	response.clear
	
%>
