<%@ Language=VBScript %>
<!-- #include virtual="/Facturacion/include/global.asp" -->
<!-- #include virtual="/Facturacion/Utils.asp" --><%
	Adresa= request.item("Adresa")
	C1= request.item("C1")
	C2= request.item("C2")
	C3= request.item("C3")
	C4= request.item("C4")

	Lo = request.item("Lo")
	La = request.item("La")

	Rec "Update Hit.dbo.Geocodes Set Estat = 0 where AdresaTxt = '" & Adresa & "'"
	Rec "Insert Into Hit.dbo.Geocodes (Estat,TmSt,[AdresaTxt],[Adresa],[Cp],[Ciutat],[Pais],Lo,La) Values  (1,getdate(),'" & Adresa & "','" & C1 & "','" & C2 & "','" & C3 & "','" & C4 & "','" & Lo & "','" & La & "') "
	
%>