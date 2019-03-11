<%@LANGUAGE="VBSCRIPT"%>
<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/recognizer/CarnUtils.asp"-->
<!-- #include virtual="/include/tablas.asp"    -->

<%
	dim resp
	connectHIT
	Set Rs = recHit("select * from web_empreses Where nom = 'daza' " )
	if not rs.eof then 
		Session("Usuari_Empresa_Logat") = "Si" 
		Session("Usuari_Empresa_Db") 		= Rs("Db")
		Session("Usuari_Empresa_db_user") 	= Rs("Db_user")
		Session("Usuari_Empresa_Db_pass") 	= Rs("Db_pass")
		Session("Usuari_Empresa_db_Server") = Rs("Db_Server") 
	end if	
	connectUSER	
	
Response.ContentType = "text/plain"
Response.Charset = "utf-8"
Response.CodePage = 65001

sub carregaTuplas()
	maxtupla=0
	session("Sinonim_Dije_" & maxtupla) = ""
	session("Sinonim_Digo_" & maxtupla) = ""
	
	Set Rs = rec("select * from " & CascosSinonims & " Order by Orden ")
	while not rs.eof
		session("Sinonim_Dije_" & maxtupla) = rs("Dije")
		session("Sinonim_Digo_" & maxtupla) = rs("Digo")
		maxtupla = maxtupla + 1
		rs.movenext
	wend
	session("Sinonim_Dije_Carregat") = "Si"
	session("Sinonim_Dije_" & maxtupla) = ""
	session("Sinonim_Digo_" & maxtupla) = ""
end sub

function Neteja(s)
	if not session("Sinonim_Dije_Carregat") = "Si" then carregaTuplas
	k=0 
	while not session("Sinonim_Dije_" & k) = ""
		s = join(split(s,session("Sinonim_Dije_" & k)),session("Sinonim_Digo_" & k))
		k=k+1
	wend
	Neteja = s
end function
	
function appendXML2(Xml,Node) 
	set domTemp=Server.CreateObject("MSXML2.DOMDocument")
	domTemp.loadXML(xml)
	set child = domTemp.documentElement.cloneNode(TRUE)
'	set child = node.ownerDocument.importNode(domTemp.documentElement, TRUE)
	node.appendChild(child)
	
	set appendXML2 = child
end function

function appendXML(Xml) 
	set appendXML = appendXML2 (Xml,Resp)
end function

Sub activateRule(ruleName) 
	appendXML("<Rule name='" & ruleName & "' activate=''></Rule>")
end sub

Sub deactivateRule(ruleName) 
	appendXML("<Rule name='" & ruleName & "' deactivate=''></Rule>")	
end sub

sub activateRuleState(ruleName)
	activateRule ruleName
	cookie "activateRule", ruleName
	cookie "state", ruleName
end sub

sub speak(speakStr) 
	appendXML("<Speak>" & speakStr & "</Speak>")
end sub

function getRule() 
	set rule = ev.selectSingleNode("./Rule")
'	rule = xpath.query("./Rule", Situacio)
'	rule = rule.item(0).textContent
	getRule = buscaattributes(rule.attributes, "name")
end function

function getProp(propName) 
	set prop = ev.selectSingleNode("./Property[@name='" & propName & "']")
'	prop = xpath.query("./Property[@name='" & propName & "]'", Situacio)
'	prop = prop.item(0).getAttribute("val")
	if not prop is nothing then
		getProp = buscaattributes(prop.attributes, "val")
	end if	
end function

function cookie(cookieName, cookieValue) 
	appendXML("<Cookie name='" & cookieName & "'>" & cookieValue & "</Cookie>")
end function

function getCookie(cookieName) 
	set cook = ev.selectSingleNode("./Cookie[@name='" & cookieName & "']")
'	cookie = xpath.query("./Cookie[@name='" & cookieName & "']", Situacio)
'	if cookieName="lote" then
'		response.write "cookie " & cook.text & " ----"
'	end if	
	if cook is Nothing then 
'		getCookie = -1
	else getCookie = cook.text
	end if 
end function

function deleteCookie(cookieName) 
	appendXML("<Cookie name='" & cookieName & "' maxAge='0'></Cookie>")
end function

function getGetText() 
	set getText = ev.selectSingleNode("./GetText")
'	getText = xpath.query("./GetText", Situacio)
'	getText = getText.item(0).textContent
	return getText.text
end function


function getNum() 
	getNum = getNum2(ev)
end function

function getNum2(currentNode)

	num = 0
	set nodes = currentNode.selectNodes("./Property")
'	nodes = xpath.query("./Property", nodes)
	for i=0 to nodes.length-1
		set node = nodes.item(i)
		propname = buscaattributes(node.attributes, "name")
		select case propName
			case "MM":
				num = num + getNum2(node)*1000000
			case "M":
				num = num + getNum2(node)*1000
			case "C":
				num = num + getNum2(node)*100
			case "D":
				num = num + getNum2(node)*10
			case "U":
				num = num + buscaattributes(node.attributes, "val")
		end select
	next
	getNum2 = num
end function


function StartEvent() 
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
'		set child = domo.importNode(engines.item(i), TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next
	
	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))
	
	
	'set xpathSG=Server.CreateObject("MSXML2.DOMXPath")
	'xpathSG = new DOMXPath(speechGram)
	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir nombres']/L")
'	L_nombre = xpathSG.query("/GRAMMAR/RULE[@NAME='pedir nombres']/L")
'	L_nombre = L_nombre.item(0)

	Set Rs = rec("select * from dependentes order by nom ")
	while not rs.eof
		n = split(rs("Nom")," ")
		str = "<P VALSTR='" & rs("Nom") & "'>"
		if ubound(n) = 0 then 
			str = str & "<P>" & n(0) & "</P>"
		else
			str = str & "<O>" & n(0) & "</O>"
			str = str & "<P>" & n(1) & "</P>"
			if ubound(n) >= 2 then
				str = str & "<O>" & n(2) & "</O>"
			end if
		end if
		str = str & "</P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend

	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))

	activateRuleState "hola"
	activateRule "corregir"
	activateRule "ayuda"
	activateRule "inicio"
end function

function RecognitionEvent() 
	appendXML("<Rule name='" & getCookie("activateRule") & "' deactivate=''/>")
	rule = getRule()
	state = getCookie("state")	

	select case rule
		case "corregir" :
			processCorregirRule(state)
		case "ayuda" :
			processAyudaRule(state)
		case "inicio" :
			speak "inicio"
			activateRuleState "hola"
		case else :
			processActiveRule(state)				
	end select
end function

function processActiveRule(state) 
	select case state
		case "hola" :
			speak "Como te llamas?"
			activateRuleState "pedir nombres"
		case "pedir nombres" :
			nombre = getProp("nombre")
			cookie "nombreConfirmar", nombre
			speak "Hola " & nombre
			activateRuleState "menu"
		case "menu" :
			cookie "nombre", getCookie("nombreConfirmar")
			deleteCookie "nombreConfirmar"
			menu = getProp("menu")
			select case menu
				case "ruta" :
					repartoComercio 0
			end select	
		case "comercio aceptar" :
			productoConfirmado()
			iComercio = getCookie("Comercio")
			aceptar_o_cancelar = getProp("aceptar o cancelar")
			if aceptar_o_cancelar = "aceptar" then
'				cookie "Producto", 0
'				ar = array_values(comercios)
				repartoProducto iComercio, 0
'				speak Comercio(0)
'				activateRuleState "lote"
			else 
				iComercio=iComercio+1
				if iComercio >= maxComercios() then iComercio = 0
				repartoComercio iComercio
			end if
		case "lote" :
			productoConfirmado
			lote = getNum()
			cookie "lote", lote
			speak "lote " & lote & " Peso ?"
			activateRuleState "peso"
		case "peso" :
			peso = getNum()
			cookie "peso", peso
			speak peso & " gramos. "
			iComercio = getCookie("Comercio")
			iProducto = getCookie("Producto")
			cookie "ComercioConfirmar", iComercio
			cookie "ProductoConfirmar", iProducto
			
			iProducto=iProducto+1
			if iProducto < maxProductos(iComercio) then
				repartoProducto iComercio, iProducto
			else
				speak "Fin albaran. "
				iComercio = getCookie("Comercio")
				iComercio=iComercio+1
				if iComercio >= maxComercios() then iComercio = 0
				repartoComercio iComercio
				'activateRuleState "menu"
			end if
'			if iProducto >= maxProductos(iComercio) then
'			ar = array_values(comercios)
'			if iProducto < count(ar(iComercio)) then
'				cookie "Producto", iProducto
'				ar = array_values(comercios)
'				activateRuleState "lote"
'			else 
'				speak "Fin albaran"
'				iComercio = getCookie("Comercio")
'				iComercio=iComercio+1

'				if iComercio >= count(comercios) then iComercio = 0	
'				repartoComercio(iComercio)
'			end if
	end select
end function

sub repartoComercio(iComercio) 
	cookie "Comercio", iComercio
	speak comercioNombre(iComercio)
	activateRuleState "comercio aceptar"
end sub

function maxComercios()
	rec "delete s  from " & tablaServits(now) & " s left join articles a on s.codiarticle = a.codi where a.nom='' or a.nom is null"
	Set Rs = rec("select Distinct Nom from Clients c join " & tablaServits(now) & " s on c.codi = s.client order by nom ")
	maxComercios = 0
	do until rs.eof
		maxComercios = maxComercios + 1
		rs.movenext
	loop
end function

function comercioNombre(iComercio) 
	comercioNombre = ""
	Set Rs = rec("select Distinct Nom from Clients c join " & tablaServits(now) & " s on c.codi = s.client order by nom ")

	for i = 0 to iComercio-1
		if not rs.eof then rs.movenext
	next
	
	if not rs.eof then comercioNombre = rs("Nom") ' & ", iComercio "  & iComercio
end function

function buscaCuantitat(iComercio, iProducto)
	buscaCuantitat = ""
	Set Rs = rec("select sum(Quantitatdemanada) Q from " & tablaServits(now) & " Where Client = '" & comercioIaCodi(iComercio) & "' and CodiArticle = '" & productoIaCodi(iProducto,iComercio) & "' " )
	if not rs.eof then buscaCuantitat = rs("Q") ' & ", iComercio "  & iComercio
end function

function comercioIaCodi(iComercio) 
	comercioIaCodi = 0
	Set Rs = rec("select Distinct Nom,Codi from Clients c join " & tablaServits(now) & " s on c.codi = s.client order by nom ")
	for i = 0 to iComercio
		if not rs.eof then rs.movenext
	next
	if not rs.eof then comercioIaCodi = rs("Codi") 
end function

function productoIaCodi(iProducto,iComercio) 
	productoIaCodi = 0
	Set Rs = rec("select Distinct Nom,Codi from Articles c join " & tablaServits(now) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")
	for i = 0 to iProducto-1
		if not rs.eof then rs.movenext
	next
	if not rs.eof then productoIaCodi = Neteja(rs("Codi")) ' & " , iComercio " & iComercio  & " , iProducto " & iProducto 
end function

sub repartoProducto(iComercio, iProducto)
	cookie "Producto", iProducto
	speak Neteja(ProductoNombre(iComercio,iProducto)) & " , " & buscaCuantitat(iComercio, iProducto)
	activateRuleState "lote"
end sub

function maxProductos(iComercio)
	Set Rs = rec("Select Distinct Nom From Articles c join " & tablaServits(now) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")

	maxProductos = 0
	do until rs.eof
		maxProductos = maxProductos + 1
		rs.movenext
	loop
end function

function ProductoNombre(iComercio,iProducto) 
	ProductoNombre = ""
	Set Rs = rec("select Distinct Nom from Articles c join " & tablaServits(now) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")
	for i = 0 to iProducto-1
		if not rs.eof then rs.movenext
	next
	if not rs.eof then ProductoNombre = Neteja(rs("Nom"))  ' & " , iComercio " & iComercio  & " , iProducto " & iProducto 
	
end function

sub productoConfirmado() 
	iComercio = getCookie("ComercioConfirmar")
	iProducto = getCookie("ProductoConfirmar")
	if isEmpty(iComercio) then exit sub
	lote = getCookie("lote")
	peso = getCookie("peso")
	' guardar iComercio, iProducto, lote, peso
	deleteCookie("ComercioConfirmar")
	deleteCookie("ProductoConfirmar")
end sub	

function processCorregirRule(state) 
	select case (state) 
		case "hola" :
			speak "hola"
			activateRuleState "hola" 
		case "pedir nombres" :
			speak "hola"
			activateRuleState "hola" 
		case "menu" :
			processActiveRule("hola")
		case "comercio aceptar" :
			if not productoCorregido() then
				iComercio = getCookie("Comercio")
				if iComercio = 0 then
					speak "menu"
					activateRuleState "menu"
				else
					repartoComercio iComercio
				end if
			end if
		case "lote" :
			if not ProductoCorregido() then
				iComercio = getCookie("Comercio")
				iProducto = getCookie("Producto")
				if iProducto = 0 then
					repartoComercio iComercio
				else
					repartoProducto iComercio, iProducto
				end if	
			end if
		case "peso" :
			iComercio = getCookie("Comercio")
			iProducto = getCookie("Producto")
			repartoProducto iComercio, iProducto
	end select
end function

function productoCorregido() 
	iComercio = getCookie("ComercioConfirmar")
	iProducto = getCookie("ProductoConfirmar")
	if isEmpty(iComercio) then 
		productoCorregido = FALSE
		exit function
	end if
	deleteCookie("ComercioConfirmar")
	deleteCookie("ProductoConfirmar")
	repartoProducto iComercio, iProducto
	productoCorregido = TRUE
end function

function processAyudaRule(state)
	speak "ayuda"
	FalseRecognitionEvent()
	activateRuleState state
end function

function FalseRecognitionEvent() 
	state = getCookie("state")
	select case (state) 
		case "hola" :
			speak "hola"
		case "pedir nombres" :
			speak "Como te llamas?"
		case "menu" :
			speak "Seleccion Ruta"
		case "comercio aceptar" :
			speak "aceptar o cancelar"
		case "lote" :
			speak "Lote?"
		case "peso" :
			speak "Peso?"
	end select
end function

function buscaattributes(atri,Clau)
	For i = 0 To (atri.length - 1)
		if atri.Item(i).name = clau then 
			buscaattributes = atri.Item(i).value
			exit for
		end if	
	Next
end function

set domi=Server.CreateObject("MSXML2.DOMDocument")

'for each x in Request.ServerVariables
'	response.write x & " : " & Request.ServerVariables(x) & " ;;"
'next

dim a,b
a=Request.TotalBytes
b=Request.BinaryRead(a)
'response.write ubound(b)
' Response.write b

'set st = Server.CreateObject("ADODB.Stream")
'st.Type = 1
'st.open
'if Request.TotalBytes > 0 then
'	st.write Request.BinaryRead(Request.TotalBytes)
'end if
'st.Position = 0
'st.Type = 2
' st.CharSet = "ISO-8859-1"
'str = st.readText
' response.write str & "----"
domi.load b
 
' response.write domi.xml

set domo=Server.CreateObject("MSXML2.DOMDocument")
set resp = domo.createElement("Response")
domo.appendChild resp

' set xpath=Server.CreateObject("MSXML2.DOMXPath")
set ev = domi.selectSingleNode("/Event")

if Not ev  Is Nothing  then
	select case buscaattributes(ev.attributes,"type")
		case "Start" : 
			StartEvent()
		case "Recognition" :
			RecognitionEvent()
		case "FalseRecognition NONONONO" :' de moment no fem help
			FalseRecognitionEvent()
	end select	
end if

set Rs = rec("select Nom From Clients order by nom")
' response.write Rs("Nom") & " ----- " & Rs.RecordCount
'for i = 0 to 100
'	response.write Rs("Nom") & " ----- "
'	rs.movenext
'next
' response.write Rs("Nom") & " ----- " & Rs.RecordCount

	response.write  domo.xml




%>
