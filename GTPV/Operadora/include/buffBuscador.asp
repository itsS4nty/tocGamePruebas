<%@LANGUAGE="VBSCRIPT"%>

<!--#include virtual="/Facturacion/include/global.asp"-->
<!--#include virtual="/Facturacion/include/js.asp"-->

<%=setTit ( "", "" )%>
<%=setCss ( )%>

<%

que = ucase(request.item("que"))
txt = request.item("txt")
sql = ""

if que = "MATERIES" then

	sql = "select isnull(nombre,'') nom,isnull(descripcion,'') des,id from " & tablaMateriasPrimas ( ) & " where activo=1 "
	if txt <> "" then sql = sql & "and (nombre like '%" & txt & "%' or descripcion like '%" & txt & "%' ) "
	sql = sql & "order by nom,des"

	nou = Dic("Nova Materia")

elseif que = "PROVEÏDOR" then

	sql = "select id,isnull(nombre,isnull(nombreCorto,'')) nom,isnull(descripcion,'') des from " & tablaProveedores ( ) & " "
	sql = sql & "where activo=1 "
	if txt <> "" then
		sql = sql & "and (nombre like '%" & txt & "%' or descripcion like '%" & txt & "%' "
		sql = sql & "or nombrecorto like '%" & txt & "%') "
	end if
	sql = sql & "order by nom,des"

	nou = Dic("Nou Proveïdor")

elseif que = "RECEPTOR" then

	sql = "select distinct isnull(usuario,'') nom,'' des,isnull(usuario,'') id from " & tablaRecepcion ( ) & " "
	if txt <> "" then sql = sql & "where usuario like '%" & txt & "%' "
	sql = sql & "order by nom"

	nou = Dic("Nou Receptor")

elseif que = "USUARI" then

	sql = "select nom,'' des,codi id from dependentes "
	if txt <> "" then sql = sql & "where nom like '%" & txt & "%' "
	sql = sql & "order by nom"

	nou = Dic("Nou Usuari")

elseif que = "CLIENTS" or que = "CLIENT" then

	sql = "select nom,'' des,codi id from clients "
	if txt <> "" then sql = sql & "where nom like '%" & txt & "%' "
	sql = sql & "order by nom"

	nou = Dic("Nou Client")
	
elseif que = "RECURSOS" then
	sql = "select nombre nom,'' des, id from Recursos "
	if txt <> "" then sql = sql & "where nombre like '%" & txt & "%' "
	sql = sql & "order by nombre "
	nou = ""
	
elseif que = "MATERIASPRIMAS" then
	sql = "select nombre nom,'' des, id from ccMateriasprimas "
	if txt <> "" then sql = sql & "where nombre like '%" & txt & "%' "
	sql = sql & "order by nombre "
	nou = ""

elseif que = "MAGATZEM" then

	sql = "select isnull(nombre,'') nom,isnull(descripcion,'') des,id from " & tablaAlmacenes ( ) & " "
	if txt <> "" then sql = sql & "where nombre like '%" & txt & "%' or descripcion like '%" & txt & "%' "
	sql = sql & "order by nom"
	nou = Dic("Nou Magatzem")

end if
%>
</head>
<body scroll="no">

<%if sql <> "" then%>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<%	if nou <> "" then%>
 <tr>
  <td><input type="Button" class="boton2" value="<%=nou%>" style="width:100%;height:50;color:#ffffff;font:bold;" onclick="parent.retornarBusqueda('<%=id%>');"></td>
 </tr>
<%
	end if

	set rs = rec(sql)
	while not rs.eof
		id  = rs("id")
		nom = rs("nom")
		des = rs("des")
		val = ""
		if nom <> "" then
			if des <> "" then
				val = nom & ":" & vbcrlf & des
			else
				val = nom
			end if
		elseif des <> "" then
			val = des
		end if
%><tr>
  <td><input type="Button" class="boton" value="<%=left(val,30)%>" style="width:100%;height:50;" onclick="parent.retornar('<%=id%>');"></td>
 </tr><%
		rs.movenext
	wend
%></table><%
end if

%></body>

</html>