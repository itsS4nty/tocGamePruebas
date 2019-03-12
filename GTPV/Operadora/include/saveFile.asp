<%@ Language="VBScript" %>

<!-- #include virtual="/Facturacion/include/global.asp" -->

<%
on error resume next
set objFile = Server.CreateObject("aspSmartUpload.SmartUpload")
objFile.Upload

set arc = objFile.Files("arc")
set f = objFile.Form

id     = f("id").values
nom    = f("nom").values
des    = f("des").values
tmp    = f("tmp").values
volver = f("volver").values
cod    = f("cod").values
fam    = f("fam").values
cad    = f("Caducitat").values
peso   = f("PesoPieza").values

if arc.size > 0 then
	ext  = ucase(arc.FileExt)
	mime = arc.TypeMIME & "/" & arc.SubTypeMIME
end if

set rs = recMod ( "select * from " & tablaArchivo() & " where id='" & id & "'" )

if not rs.eof then
	if nom = "" then nom = rs("nombre")
'	if des = "" then des = rs("descripcion")
	if tmp = "" then tmp = rs("tmp")
	if arc.Size <= 0 then
		archivo = rs("archivo")
		mime = rs("mime")
		ext = rs("extension")
	end if
end if

rec "delete from " & tablaArchivo() & " where id='" & id & "'"

set rs = recMod ( "select * from " & tablaArchivo() & " where id='" & id & "'" )

rs.AddNew
rs("id").value = id
rs("nombre").value = nom
rs("extension").value = ext
rs("descripcion").value = des
rs("mime").value = mime
rs("fecha").value = now
if arc.Size <= 0 then
	rs("archivo").value = archivo
else
	arc.FileToField rs("archivo")
end if
rs("tmp").value = cint(tmp)
rs.Update
rs.close

'FAMILIA
rec "update articles set familia='" & fam & "' where codi=" & id

'CADUCITAT
rec "delete from ArticlesPropietats where variable='Caducitat' and codiArticle=" & id
if cad<> "" then
	rec "insert into ArticlesPropietats (CodiArticle, Variable, Valor) values (" & id & ", 'Caducitat', '" & cad & "')"
end if

'PESO PIEZA
rec "delete from ArticlesPropietats where variable='PesoPieza' and codiArticle=" & id
if peso<> "" then
	rec "insert into ArticlesPropietats (CodiArticle, Variable, Valor) values (" & id & ", 'PesoPieza', '" & peso & "')"
end if

'CODI DE BARRES
rec "delete from codisBarres where producte=" & id
rec "insert into codisBarres(codi,producte) values('" & cod & "'," & id & ")"

response.redirect volver

%>