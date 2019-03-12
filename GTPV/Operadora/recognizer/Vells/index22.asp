<%@LANGUAGE="VBSCRIPT"%>
<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/recognizer/CarnUtils.asp"-->
<!-- #include virtual="/include/tablas.asp"    -->

<%

	dia = now ' dateadd("d",-2,now)
	dim resp
	connectHIT
	Set Rs = recHit("select * from web_empreses Where nom = 'daza' " )
'	Set Rs = recHit("select * from web_empreses Where nom = 'Paballsa' " )
	if not rs.eof then 
		Session("Usuari_Empresa_Logat") = "Si" 
		Session("Usuari_Empresa_Db") 		= Rs("Db")
		Session("Usuari_Empresa_db_user") 	= Rs("Db_user")
		Session("Usuari_Empresa_Db_pass") 	= Rs("Db_pass")
		Session("Usuari_Empresa_db_Server") = Rs("Db_Server") 
	end if	
	connectUSER	
	UltimDit=""
	
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
	UltimDit = UltimDit & " " & speakStr
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
	
	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir nombres']/L")
	Set Rs = rec("select * From Dependentes Order By Nom ")
	while not rs.eof
		Nom = join(split(rs("Nom"),",")," ")
		n = split(nom," ")
		str = "<P VALSTR='" & Nom & "'>"
		str = str & "<P>nombre</P>"
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

	set L_Article = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir articulo']/L")
	Set Rs = rec("select Codi,Nom from Articles where not nom='' and not left(nom,2) = '20' order by nom  ")
	while not rs.eof
		nom = join(split(rs("Nom"),"&")," ")
		str = "<P VALSTR='" & rs("Codi") & "'>"
		str = str & "<P>Producto " & Nom & "</P>"
		str = str & "</P>"
		appendXML2 str, L_Article
		rs.movenext
	wend

	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='reparto']/L")
	Set Rs = rec("Select Distinct Viatge From " & tablaServits(Dia) & " order by Viatge ")
	while not rs.eof
		nom = join(split(rs("Viatge"),"&")," ")
		str = "<P VALSTR='" & nom & "'>"
		str = str & "<P>Reparto " & Nom & "</P>"
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
	activateRule "repite"
	activateRule "hora"
	activateRule "gracias"
	
end function

function RecognitionEvent() 
	appendXML("<Rule name='" & getCookie("activateRule") & "' deactivate=''/>")
	rule = getRule()
	state = getCookie("state")	

	select case rule
		case "repite" :
			processRepetir(state)
		case "hora" :
			processHora(state)
		case "gracias" :
			processGracias(state)
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
			speak "cual es tu nombre?"
			activateRuleState "pedir nombres"
		case "pedir nombres" :
			nombre = getProp("nombre")
			cookie "nombreConfirmar", nombre
			speak "Hola " & nombre
			activateRuleState "menu"
		case "reparto" :
			Reparto = getProp("nombre reparto")
			session("Reparto Actual") = Reparto
			speak "Clientes del reparto " & Reparto & " ,"
			repartoComercio 0
		case "menu" :
			cookie "nombre", getCookie("nombreConfirmar")
			deleteCookie "nombreConfirmar"
			menu = getProp("menu")
			select case menu
				case "ruta" :
					SeleccionRuta 
				case "EtiquetaPalet" :
					cookie "pedir articulo", "EtiquetaPalet"
					speak "Producto?"
					activateRuleState "pedir articulo"
				case "EntraPalet" :
					cookie "NumeroPalet", "EntraPalet"
					speak "Numero Palet ?" 
					activateRuleState "NumeroPalet"
				case "SacaPalet" :
					cookie "pedir articulo", "SacaPalet"
					speak "Producto?"
					activateRuleState "pedir articulo"
				case "ConsultaEstock" :
					speak "Estock del conjelador :"
					set rs = Rec("select a.nom Nom,count(*) Quedan  from palets p join articles a on a.codi = p.plu where p.estat = 'En Estanteria' group by a.nom order by a.nom")
					while not rs.eof
						speak rs("Nom") & " Quedan " & Rs("Quedan") & " Palets, "
						rs.movenext
					wend
					activateRuleState "menu"
				case else 
					speak "Opcion : " & menu
					activateRuleState "menu"
			end select	
		case "Cliente" :
			repartoComercio 0
		case "NumeroPalet" :
			Palet = getNum()
			if existeixPalet(Palet) = "No Existeix" then
				speak "No encuentro este palet"
				activateRuleState "menu"
			else
				cookie "NumeroPalet", Palet 
				select case getCookie("NumeroPalet")
					case "EntraPalet"
						if existeixPalet(Palet) = "Etiquetado" then
							cookie "NumeroEstanteria", "EntraPalet"
							speak "Dejas En Estanteria ?" 
							activateRuleState "NumeroEstanteria" 
						else
							speak "Imposible Este Palet Esta : " & existeixPalet(Palet)
							activateRuleState "menu"
						end if						
					case "SacaPalet"
						CodiBuscat = getCookie("SacaPalet Codi")
						if cdbl(Palet) = cdbl(CodiBuscat) then
							speak "Correcto, Saco Palet del conjelador "
							rec "Update Palets set estat = 'Vendido' Where Codi = " & Palet
						else
							speak "Existe un Palet anterior "
						end if
						activateRuleState "menu"
					case else
						speak "Selecctionado Palet " & Palet
				end select		
			end if			
		case "NumeroEstanteria" :
			Estanteria = getNum()
			cookie "NumeroEstanteria", Estanteria 
			select case getCookie("NumeroEstanteria")
				case "EntraPalet"
					Palet = getCookie("NumeroPalet")
					if existeixPalet(Palet) = "Etiquetado" then
						rec "Update Palets set estat = 'En Estanteria' , Posicion1 = '" & Estanteria & "' Where Codi = " & Palet
						speak "Dejamos El Palet Numero "  & Palet & " En La estanteria " & Estanteria 
						activateRuleState "menu"
					else
						speak "Este Palet esta " &  existeixPalet(Palet)
						activateRuleState "menu"
					end if					
				case "SacaPalet"
					cookie "NumeroPalet", "SacaPalet"
					speak "Numero Palet ?" 
					activateRuleState "NumeroPalet"
				case else
					speak "Selecctionado Palet " & Palet
			end select		
		case "pedir articulo" :
			CodiArticle = getProp("articulo")
			cookie "pedir articulo", CodiArticle 
			select case getCookie("pedir articulo")
				case "EtiquetaPalet"
					speak "Producto " & ArticleCodiNom(CodiArticle) & ", Numero de Etiquetas ?"
					activateRuleState "NumeroEtiquetas"
				case "SacaPalet"
					set Rs = Rec("Select * From Palets Where Plu = " & CodiArticle & " and estat = 'En Estanteria' Order by DataI desc " )
					if not rs.eof then
						speak "Coje El Palet " & Rs("Codi") & " De La Estanteria " & Rs("Posicion1")
						cookie "SacaPalet Codi", Rs("Codi")
						cookie "NumeroPalet", "SacaPalet"
						speak " Cantame el numero " 
						activateRuleState "NumeroPalet"
					else
						speak "No Queda ningun palet de " & ArticleCodiNom(CodiArticle)
						activateRuleState "menu"
					end if
				case else
					speak "Selecctionado " & ArticleCodiNom(CodiArticle)
			end select		
		case "NumeroEtiquetas" :
			NumEti = getNum()
			CodiArticle = getCookie("pedir articulo")
			if NumEti >10 then 
				speak "Pidelas de 10 en 10 !"
			else
				speak "Genero " & NumEti  & " Etiquetas de " & ArticleCodiNom(CodiArticle) & " ?"
				rec "Insert Into " & TaulaFax2 & " (tipus,  estat, receptor, Variables) Values ('EtiquetaPalet',  'Enviat', 'Cascos', '" & NumEti & "," & CodiArticle & "')"
			end if
			activateRuleState "menu"
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
			speak peso & " gramos "
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

sub SeleccionRuta
	speak "Nombre del reparto?." 
	activateRuleState "reparto"
end sub

sub repartoComercio(iComercio) 
	cookie "Comercio", iComercio
	speak comercioNombre(iComercio)
	activateRuleState "comercio aceptar"
end sub

function maxComercios()
	rec "delete s  from " & tablaServits(Dia) & " s left join articles a on s.codiarticle = a.codi where a.nom='' or a.nom is null"
	Set Rs = rec("select Distinct Nom from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client order by nom ")
	maxComercios = 0
	do until rs.eof
		maxComercios = maxComercios + 1
		rs.movenext
	loop
end function

function comercioNombre(iComercio) 
	comercioNombre = ""
	Reparto = session("Reparto Actual")
	Set Rs = rec("select Distinct Nom,cc.valor from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client left join  constantsclient cc on cc.codi = c.codi and cc.variable = 'Ruta_Orden'  Where Viatge = '" & Reparto & "'  order by cc.valor,nom ")
	for i = 0 to iComercio-1
		if not rs.eof then rs.movenext
	next
	
	if not rs.eof then comercioNombre = rs("Nom") ' & ", iComercio "  & iComercio
end function

function ArticleCodiNom(Codi) 
	ArticleCodiNom = "Articulo " & Codi
	Set Rs = rec("select Nom From Articles Where codi = " & Codi & " ")
    if not rs.eof then ArticleCodiNom = rs("Nom")
end function

function existeixPalet(Codi) 
	existeixPalet = "No Existeix"
	Set Rs = rec("select Estat From Palets Where codi = " & Codi & " ")
    if not rs.eof then existeixPalet = rs("Estat")
end function

function buscaCuantitat(iComercio, iProducto)
	buscaCuantitat = ""
	Set Rs = rec("select sum(Quantitatdemanada) Q from " & tablaServits(Dia) & " Where Client = '" & comercioIaCodi(iComercio) & "' and CodiArticle = '" & productoIaCodi(iProducto,iComercio) & "' " )
	if not rs.eof then buscaCuantitat = rs("Q") ' & ", iComercio "  & iComercio
end function

function comercioIaCodi(iComercio) 
	comercioIaCodi = 0
	Set Rs = rec("select Distinct Nom,Codi from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client order by nom ")
	for i = 0 to iComercio
		if not rs.eof then rs.movenext
	next
	if not rs.eof then comercioIaCodi = rs("Codi") 
end function

function productoIaCodi(iProducto,iComercio) 
	productoIaCodi = 0
	Set Rs = rec("select Distinct Nom,Codi from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")
	for i = 0 to iProducto-1
		if not rs.eof then rs.movenext
	next
	if not rs.eof then productoIaCodi = Neteja(rs("Codi")) ' & " , iComercio " & iComercio  & " , iProducto " & iProducto 
end function

sub repartoProducto(iComercio, iProducto)
	cookie "Producto", iProducto
	speak Neteja(ProductoNombre(iComercio,iProducto)) & ", " & join(split(buscaCuantitat(iComercio, iProducto),"."),",")
	activateRuleState "lote"
end sub

function maxProductos(iComercio)
	Set Rs = rec("Select Distinct Nom From Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")

	maxProductos = 0
	do until rs.eof
		maxProductos = maxProductos + 1
		rs.movenext
	loop
end function

function ProductoNombre(iComercio,iProducto) 
	ProductoNombre = ""
	Set Rs = rec("select Distinct Nom from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")
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
	speak "Puedes : "
	speak "Seleccion Ruta," 
	speak "Congelador etiqueta palet," 
	speak "congelador entro palet," 
	speak "congelador saco palet," 
	speak "Congelador Consulta inventario," 

	activateRuleState state
end function

function processHora(state)
	speak "Son Las " & hour(now) & ":" & minute(now) & "."
 	activateRuleState state
end function

function processGracias(state)
	speak "A ti ho maestro!"
 	activateRuleState state
end function



function processRepetir(state)
	speak "Repito : " & session("UltimDit")
	UltimDit = session("UltimDit")
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
			session("UltimDit") = UltimDit
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
