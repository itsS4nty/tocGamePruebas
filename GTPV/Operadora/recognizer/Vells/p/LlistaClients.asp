<%@LANGUAGE="VBSCRIPT"%>
<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/PistolatUtils.asp"-->
<!-- #include virtual="/include/tablas.asp"    -->
<html>
<body>
<%

dim resp

function appendXML2(Xml,Node) 
	set domTemp=Server.CreateObject("MSXML2.DOMDocument")
	domTemp.loadXML(xml)
	set child = node.ownerDocument.importNode(domTemp.documentElement, TRUE)
	node.appendChild(child)
	
	return child
end function

function appendXML(Xml) 
	return appendXML2 (Xml,Resp)
end function

Sub activateRule(ruleName) 
	appendXML("<Rule name='" & ruleName & "' activate=''></Rule>")
	cookie "state", ruleName
end sub

Sub deactivateRule(ruleName) 
	appendXML("<Rule name='" & ruleName & "' deactivate=''></Rule>")	
end sub


sub speak(speakStr) 
	appendXML("<Speak>" & speakStr & "</Speak>")
end sub

function getRule() 
	rule = xpath.query("./Rule", Situacio)
	rule = rule.item(0).textContent
	return rule
end function

function getProp(propName) 
	prop = xpath.query("./Property[@name='" & propName & "]'", Situacio)
	prop = prop.item(0).getAttribute("val")
	return prop
end function

function cookie(cookieName, cookieValue) 
	appendXML("<Cookie name='" & cookieName & "'>" & cookieValue & "</Cookie>")
end function

function getCookie(cookieName) 
	cookie = xpath.query("./Cookie[@name='" & cookieName & "']", Situacio)
	if cookie.length = 0 then return NULL
	return cookie.item(0).textContent
end function

function deleteCookie(cookieName) 
	appendXML("<Cookie name='" & cookieName & "' maxAge='0'></Cookie>")
end function

function getGetText() 
	getText = xpath.query("./GetText", Situacio)
	getText = getText.item(0).textContent
	return getText
end function


function getNum() 

	if (func_num_args() = 1) then nodes = Situacio else nodes = func_get_arg(1)
	
	num = 0
	nodes = xpath.query("./Property", nodes)
	for i=0 to nodes.length
		node = nodes.item(i)
		propName = node.getAttribute("name")
		select case propName
			case "MM":
				num = num + node.getNum(node)*1000000
			case "M":
				num = num + node.getNum(node)*1000
			case "C":
				num = num + node.getNum(node)*100
			case "D":
				num = num + node.getNum(node)*10
			case "U":
				num = num + node.getAttribute("val")
		end select
	next		
	return num
end function


function StartSituacio() 
	engines = xpath.query("./Engine", Situacio)
	for i=0 to engines.length-1
		child = domo.importNode(engines.item(i), TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next
	
	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load("carn1.xml")
	
	
	set xpathSG=Server.CreateObject("MSXML2.DOMXPath")
	'xpathSG = new DOMXPath(speechGram)
	L_nombre = xpathSG.query("/GRAMMAR/RULE[@NAME='pedir nombres']/L")
	L_nombre = L_nombre.item(0)

	for each nombre in nombres 
		n = split(nombre," ")
		str = "<P VALSTR='" & nombre & "'><O>" & n(0) & "</O><P>" & n(1) & "</P>"
		if ubound(n) >= 2 then str = str & "<O>" & n(2) & "</O>"
		str = str & "</P>"
		appendXML str, L_nombre
	next

	gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(domo.importNode(speechGram.documentElement, TRUE))

	activateRule("hola")
	activateRule("corregir")
	activateRule("ayuda")
end function

function RecognitionSituacio(Situacio, xpath, domo, resp) 
	appendXML '<Rule name="'. getCookie("activeRule"). '" deactivate=""/>'
	rule = getRule()
	state = getCookie("state")	

	select case rule
		case "corregir" :
			processCorregirRule(state)
		case "ayuda" :
			processAyudaRule(state)
		case else :
			processActiveRule(state)				
	end select
end function

function processActiveRule(state) 
	select case state
		case "hola" :
			speak "Como te llamas?"
			activateRule("pedir nombres")
		case "pedir nombres" :
			nombre = getProp("nombre")
			cookie "nombreConfirmar", nombre
			speak "Hola " & nombre
			activateRule("menu")
		case "menu" :
			cookie "nombre", getCookie("nombreConfirmar")
			menu = getProp("menu")
			select case menu
				case "reparto" :
				case else :
					repartoComercio(0)	
			end select	
		case "comercio si o no" :	
			productoConfirmado()
			iComercio = getCookie("Comercio")
			si_no = getProp("si o no")
			if si_no = "si" then
				cookie "Producto", 0
				ar = array_values(comercios)
				speak Comercio(0)
				activateRule "lote"
			else 
				iComercio=iComercio+1
				if iComercio >= ubound(comercios) then  iComercio = 0 
				repartoComercio iComercio
			end if
		case "lote" :
			productoConfirmado
			lote = getNum()
			cookie "lote", lote
			speak "lote " & lote & ". Peso ?"
			activateRule("peso")
		case "peso" :
			peso = getNum()
			cookie "peso", peso
			speak peso & " gramos. "
			iComercio = getCookie("Comercio")
			iProducto = getCookie("Producto")
			cookie "ComercioConfirmar", iComercio
			cookie "ProductoConfirmar", iProducto
						
			iProducto=iProducto+1
			ar = array_values(comercios)
			if iProducto < count(ar(iComercio)) then
				cookie "Producto", iProducto
				ar = array_values(comercios)
				activateRule("lote")
			else 
				speak "Fin albaran"
				iComercio = getCookie("Comercio")
				iComercio=iComercio+1
				if iComercio >= count(comercios) then iComercio = 0	
				repartoComercio(iComercio)
			end if
	end select
end function


function repartoComercio(iComercio) 
	cookie "Comercio", iComercio
	ar = array_keys(comercios)
	speak "Comercio " & ar(iComercio)
	activateRule("comercio si o no")
end function

function productoConfirmado() 
	iComercio = getCookie("ComercioConfirmar")
	iProducto = getCookie("ProductoConfirmar")
	if isnull(iComercio) then return
	lote = getCookie("lote")
	peso = getCookie("peso")
	' guardar iComercio, iProducto, lote, peso
	deleteCookie("ComercioConfirmar")
	deleteCookie("ProductoConfirmar")
end function

function processCorregirRule(state) 

'	select case (state) 
'		case "hola" :
'			activateRule("hola") //??
'			break
'		case "pedir nombres" :
'			activateRule("hola") //??
'			break
'		case "menu" :
'			processActiveRule("hola")
			'break 		
		'case "comercio si o no" :	
'			productoCorregido()
'			// generar Situacioo Recognition
'			break
'		case "lote" :
			'break
		'case "peso" :
			'break
'	}
end function

function productoCorregido() 
	iComercio = getCookie("ComercioConfirmar")
	iProducto = getCookie("ProductoConfirmar")
	if isnull(iComercio) then
		// mensaje no es posible corregir
	else 
		cookie "Comercio", iComercio
		cookie "Producto", iProducto
	end if
	// speak producto
	deleteCookie("ComercioConfirmar")
	deleteCookie("ProductoConfirmar")
end function

function FalseRecognitionSituacio() 
	state = getCookie("state")
	select case (state) 
		case "hola" :
			speak "hola"
		case "pedir nombres" :
			speak "Como te llamas?"
		case "reparto" :
			speak "reparto"
		case "si no" :
			speak "si o no?"
		case "lote" :
			speak "Lote?"
		case "peso" :
			speak "Peso?"
	end select
end function

set domi=Server.CreateObject("MSXML2.DOMDocument")
dim a,b
a=Request.TotalBytes
b=Request.BinaryRead(a)


domi.load b

set domo=Server.CreateObject("MSXML2.DOMDocument")
set resp = domo.createElement("Response")
domo.appendChild resp

' set xpath=Server.CreateObject("MSXML2.DOMXPath")
set Situacio = domi.selectSingleNode("//Event")

if Not Situacio  Is Nothing  then
'	Situacio = Situacio.item(0)
	select case Situacio.attributes("type")
		case "Start" : 
			StartSituacio()
		case "Recognition" :
			RecognitionSituacio()
		case "FalseRecognition" :
			FalseRecognitionSituacio()
	end select	
end if

	response.write  domo.xml

'	connectHIT
'	Set Rs = recHit("select * from web_empreses Where nom = 'daza' " )
'	if not rs.eof then 
'		Session("Usuari_Empresa_Logat") = "Si" 
'		Session("Usuari_Empresa_Db") 		= Rs("Db")
'		Session("Usuari_Empresa_db_user") 	= Rs("Db_user")
'		Session("Usuari_Empresa_Db_pass") 	= Rs("Db_pass")
'		Session("Usuari_Empresa_db_Server") = Rs("Db_Server") 
'	end if	
'	connectUSER	
'
'	Set Rs = rec("select * from dependentes order by nom ")
'	while not rs.eof
'		response.write Rs("Nom") & " --> " & Rs("Codi") & "<Br>"
'		rs.movenext
'	wend
%>
</body>
</html>
