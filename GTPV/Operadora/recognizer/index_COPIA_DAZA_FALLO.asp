<%@LANGUAGE="VBSCRIPT"%>
<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/recognizer/IndexUtils.asp"-->
<!-- #include virtual="/include/tablas.asp"    -->
<%

Session.LCID=2057
SetLocale(2057)

	Debugant = true 
	Empresa = request.item("Empresa")
	dim resp
	connectHIT
	
	dim Rs
	Set Rs = recHit("select * from web_empreses Where Id = '" & Empresa & "' " )
	if rs.eof then 
		set Rs = recHit("select * from web_empreses Where nom = 'daza' " )
		'Set Rs = recHit("select * from web_empreses Where nom = 'pa natural' " )
		'Set Rs = recHit("select * from web_empreses Where nom = 'mariel' " )
		'Set Rs = recHit("select * from web_empreses Where nom = 'panet' " )
	end if
	
	if not rs.eof then 
		Session("Usuari_Empresa_Logat") 	= "Si" 
		Session("Usuari_Empresa_Db") 		= Rs("Db")
		Session("Usuari_Empresa_db_user") 	= Rs("Db_user")
		Session("Usuari_Empresa_Db_pass") 	= Rs("Db_pass")
		Session("Usuari_Empresa_db_Server") = Rs("Db_Server") 
	end if	
	connectUSER	

'****************************************************************************************************
' INIT VARIABLES  	
'****************************************************************************************************

	UltimDit=""
	calLote = false
	if Session("Usuari_Empresa_Db") = "Fac_Daza" then calLote = true
	
	if calLote  then
		session("OrdenArticles") = " s.comentari,cast(isnull(o.valor,9999) as numeric) "	
	else
		session("OrdenArticles")= " cast(isnull(o.valor,9999) as numeric) "	
	end if 
	
	'MODIFICADO POR FRAN 13/04/2011
	'session("CampOrdreClient") = "Ruta_Orden"
	'if not calLote then session("CampOrdreClient")  = "CodiContable"
	session("CampOrdreClient") = "Ruta_Orden"
	if not calLote then session("CampOrdreClient")  = "Ordreruta"

	if session("OrdenClientes") = "" then session("OrdenClientes") = " order by cast(isnull(cc.valor,isnull(ccc.valor,c.codi)) as numeric) ,nom "

	if session("FechaDeTrabajo") = "" then 
		session("FechaDeTrabajo") = now 
		if hour(session("FechaDeTrabajo")) < 9 then session("FechaDeTrabajo") = dateadd("d",-1,session("FechaDeTrabajo"))		
	end if	
	dia = session("FechaDeTrabajo")
	rec "delete s  from " & tablaServits(Dia) & " s left join articles a on s.codiarticle = a.codi where a.nom='' or a.nom is null"

	OrdreArticles = " cast(isnull(o.valor,9999) as numeric) "	
	
	if session("OrdenClientes") = "" then session("OrdenClientes") = " order by cast(isnull(cc.valor,isnull(ccc.valor,c.codi)) as numeric) ,nom "
'	if calLote  then
'		OrdreArticles = " c.nom "	
'	else
'		
'	end if 
	
'****************************************************************************************************
' 
'****************************************************************************************************


	
	Response.ContentType = "text/plain"
	Response.Charset = "utf-8"
	Response.CodePage = 65001
	
sub dbu (St)
	if Debugant then speak st
end sub

function MesNombre(d)
	MesNombre=""
	select case month(d)
		case  1 : MesNombre = "enero"
		case  2 : MesNombre = "febrero"
		case  3 : MesNombre = "marzo"
		case  4 : MesNombre = "abril"
		case  5 : MesNombre = "mayo"
		case  6 : MesNombre = "junio"
		case  7 : MesNombre = "julio"
		case  8 : MesNombre = "agosto"
		case  9 : MesNombre = "septiembre"
		case 10 : MesNombre = "octubre"
		case 11 : MesNombre = "noviembre"
		case 12 : MesNombre = "diciembre"
	end select
end function

	
sub carregaTuplasVell()
	maxtupla=0
	session("Sinonim_Dije_" & maxtupla) = ""
	session("Sinonim_Digo_" & maxtupla) = ""
	
	dim Rs
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


sub AddRule()
	appendXML("<Grammar name='gram1' allEngines='' activate=''/><RULE NAME='casa'  create='' ><P>seleccion</P><P>casa</P><P>casa</P></RULE></Grammar>")
	activateRule("casa") 		
end sub

function Canvia(St,viejo,nuevo)
	Canvia = St
	if not (isnull(st) or isnull(viejo) or isnull(nuevo)) then 
		Canvia = join(split(St,viejo),nuevo)
	end if		
end function

function Neteja(s)
	set RsNet = rec("Select * from " & CascosSinonims & " Order by Orden ")
	while not RsNet.eof
		if instr(s,RsNet("Dije")) > 0 then 
			s = Canvia(s,RsNet("Dije"),RsNet("Digo"))
		end if	
		RsNet.MoveNext
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
	if len(ruleName) = 0 then exit sub
	
	if session("nombreConfirmar") = "" then 
		appendXML("<Rule name='" & ruleName & "' activate=''></Rule>")
	else	
		Bloqueadas="FinAlbaran,Unidades Peso,Unidades,PesoTotal,Peso,corregir,ayuda,	"
		if instr(Bloqueadas,ruleName) = 0 then  appendXML("<Rule name='" & ruleName & "' activate=''></Rule>")
	end if
	
end sub

Sub deactivateRule(ruleName) 
	if len(ruleName) = 0 then exit sub
	appendXML("<Rule name='" & ruleName & "' deactivate=''></Rule>")	
end sub

sub activateRuleState(ruleName)
	if len(ruleName) = 0 then exit sub
	
	if ruleName = "navega cliente" then
		activateRule "inicio"
	end if
	
	if ruleName = "menu" then
		deactivateRule "Peso"
		deactivateRule "Unidades"
		deactivateRule "Otra Caja"
		deactivateRule "PesoTotal"
		deactivateRule "vale dame mas"
		deactivateRule "Producto Siguiente"
		deactivateRule "Producto Anterior"
		
		if calLote then 
			deactivateRule "lote numerico"
			deactivateRule "pedir lote data"
		end if	
		deactivateRule "vale dame mas"
		deactivateRule "pedir reparto"
		deactivateRule "Temperatura"
		deactivateRule "TemperaturaNegativa"
				
		activateRule "ayuda"
		activateRule "inicio"
		activateRule "repite"
		activateRule "hola"
'		activateRule "gracias"
		activateRule "RegistroTemperatura"
	end if

	if session("nombreConfirmar") = "" then
		deactivateRule "Adios"
	else
'		activateRule "Adios"
	end if
	
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
	deleteCookie cookieName
	appendXML("<Cookie name='" & cookieName & "'>" & cookieValue & "</Cookie>")
	session(cookieName) = cookieValue
end function

function getCookie(cookieName) 
	set cook = ev.selectSingleNode("./Cookie[@name='" & cookieName & "']")
	getCookie = 0	
	if not cook is Nothing then getCookie = cook.text
end function

function deleteCookie(cookieName) 
	appendXML("<Cookie name='" & cookieName & "' maxAge='0'></Cookie>")
end function

function GetText() 
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

function XmlOk(St)
	St = Canvia(St,"ñ","n")
	St = Canvia(St,"&"," ")
	St = Canvia(St,"/"," ")
	St = Canvia(St,"<"," ")
	St = Canvia(St,">"," ")
	St = Canvia(St,""""," ")
	St = Canvia(St,"'"," ")
	St = Canvia(St,"*"," ")
'	St2 = ""
'	for i=1 to len(st)
'		c=mid(St,i,1) 
		'if c < "a" or c > "Z" then 
			'St2 = st2 & "*"	
		'else
			'St2 = st2 & c	
		'end if
	'next
	XmlOk = St
end function

function StartEvent() 
	EnviaTreballadors= ""
	EnviaViatges= ""
	EnviaLots= "" 
	EnviaCamaras= ""
		
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))
	
'	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir nombres']/L")
'	dim Rs
'	Set Rs = rec("select " & EnviaTreballadors & " Codi,Nom From Dependentes Where not nom = '' Order By Nom ")
'	while not rs.eof
'		Nom = XmlOk(rs("Nom"))
'		Nom = Canvia(Nom,","," ")
'		n = split(nom," ")
'		str = "<P VALSTR='" & rs("Codi") & "'>"
'		str = str & "<P>nombre</P>"
'		if ubound(n) = 0 then 
'			str = str & "<P>" & n(0) & "</P>"
'		else
'			str = str & "<O>" & n(0) & "</O>"
'			str = str & "<P>" & n(1) & "</P>"
'			if ubound(n) >= 2 then
'				str = str & "<O>" & n(2) & "</O>"
'			end if
'		end if
'		str = str & "<P>fin</P></P>"
'		appendXML2 str, L_nombre
'		rs.movenext
'	wend


'	set L_Article = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir articulo']/L")
'	Set Rs = rec("select " & EnviaArticles & "Codi,Nom from Articles where not nom='' and not left(nom,2) = '20' order by nom  ")
'	while not rs.eof
'		Nom = XmlOk(rs("Nom"))
'		str = "<P VALSTR='" & rs("Codi") & "'>"
'		str = str & "<P>Producto " & Nom & "</P><P>fin</P>"
'		str = str & "</P>"
'		appendXML2 str, L_Article
'		rs.movenext
'	wend
	
'	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='Seleccion Nevera']/L")
'	Set Rs = rec("select " & EnviaCamaras & " distinct tarea from appcctareas  where tipo = 'TEMPERATURA' and len(tarea) > 0")
'	session("CantaListaNeveras")  = ""
'	while not rs.eof
'		nom = XmlOk(rs("tarea"))
'		session("CantaListaNeveras") = session("CantaListaNeveras") & "," &  nom
'		str = "<P VALSTR='" & nom & "'>"
'		str = str & "<P>Camara " & Nom & "</P><P>FIN</P>"
'		str = str & "</P>"
'		appendXML2 str, L_nombre
'		rs.movenext
'	wend

	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))

	activateRuleState "menu"
	activateRule "ayuda"
	activateRule "inicio"
	activateRule "repite"
	activateRule "hola"
	activateRule "gracias"
	speak "A tu servicio"
end function

function StartEventReparto() 
	dim Rs
	EnviaTreballadors= ""
	EnviaViatges= ""
	EnviaLots= "" 
	EnviaCamaras= ""

	'JORGE 30/03/2011
'	session("FiltreLots") = "" '" and not comentari like '%Lote:%' "
'	if not calLote then session("FiltreLots") = session("FiltreLots") & " and (QuantitatServida>0 or comentari like '%Lote%')  "
	session("FiltreLots") = ""
'	if calLote then session("FiltreLots") = " and not comentari like '%Lote:%' "
	if not calLote then session("FiltreLots") = session("FiltreLots") & " and (QuantitatServida>0 or comentari like '%Lote%')  "
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))
	
'	set L_Article = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir lote data']/L")
'	Set rs = rec("Select distinct nom as Nom from appLots where datediff(d,datai,getdate()) < 60 Order By nom ")
'	while not rs.eof
'		Nom = XmlOk(rs("Nom"))
'		str = "<P VALSTR='" & Nom & "'>"
'		str = str & "<P>lote " & mid(Nom,3,2) & " "  & mid(Nom,5,2) & " "  & mid(Nom,7,2) & " " & "</P><P>fin</P>"
'		str = str & "</P>"
'		appendXML2 str, L_Article
'		rs.movenext
'	wend
	
	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir reparto']/L")
	Set Rs = rec("Select " & EnviaViatges & " Distinct Viatge From " & tablaServits(Dia) & " where not Viatge = '' order by Viatge ")
	session("CantaListaTodos")  = ""
	while not rs.eof
		nom = XmlOk(rs("Viatge"))
		session("CantaListaTodos") = session("CantaListaTodos") & "," &  nom
		str = "<P VALSTR='" & nom & "'>"
		str = str & "<P>Reparto " & lcase(Nom) & "</P><P>FIN</P>"
		str = str & "</P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend
	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))

end function

function StartEventLogin() 
	dim Rs
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))

	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir nombres']/L")
'	Set Rs = rec("select Codi,Nom From Dependentes Where not nom = '' Order By Nom ")
	Set Rs = rec("select Codi,Nom From Dependentes  Where not nom = '' and codi in (select a.usuari from (select usuari,MAX(TmSt) Hi from cdpDadesFichador where (YEAR(tmst) = YEAR(getdate()) and month(tmst) = month(getdate()) and day(tmst) = day(getdate()) or YEAR(tmst) = YEAR(dateadd(d,-1,getdate())) and month(tmst) = month(dateadd(d,-1,getdate())) and day(tmst) = day(dateadd(d,-1,getdate()))) and accio = 1 group By Usuari)  a left join  (select usuari,MAX(TmSt) Hf from cdpDadesFichador where YEAR(tmst) = YEAR(getdate()) and month(tmst) = month(getdate()) and day(tmst) = day(getdate()) and accio = 2 group By Usuari)  b on a.usuari = b.usuari and b.Hf < a.Hi ) and not codi in (select id from dependentesextes  where nom = 'TIPUSTREBALLADOR' and valor = 'DEPENDENTA')")
	
	session("CantaListaTodos")  = ""
	while not rs.eof
		Nom = XmlOk(lcase(rs("Nom")))
		session("CantaListaTodos") = session("CantaListaTodos") & "," &  nom
		Nom = Canvia(Nom,","," ")
		n = split(nom," ")
		str = "<P VALSTR='" & rs("Codi") & "'>"
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
		str = str & "<P>FIN</P></P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend

	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))

end function

function StartEventCamaras() 
	dim Rs
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))

	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='Seleccion Nevera']/L")
	Set Rs = rec("select " & EnviaCamaras & " distinct tarea from appcctareas  where tipo = 'TEMPERATURA' and len(tarea) > 0")
	session("CantaListaTodos")  = ""
	while not rs.eof
		nom = XmlOk(rs("tarea"))
		session("CantaListaTodos") = session("CantaListaTodos") & "," &  nom
		str = "<P VALSTR='" & nom & "'>"
		str = str & "<P>Camara " & Nom & "</P><P>FIN</P>"
		str = str & "</P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend

	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))
	activateRule "inicio"
end function

function StartEventArticlesMaquina(Id) 
	dim Rs
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))

	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir articulo']/L")
	Set Rs = rec("select codi,nom from articles a  Join recursosextes e on  id  = '" & Id & "' and variable = 'ARTICLE' and a.codi = e.valor ")
	session("CantaListaTodos")  = ""
	while not rs.eof
		nom = XmlOk(rs("nom"))
		session("CantaListaTodos") = session("CantaListaTodos") & "," &  nom
		str = "<P VALSTR='" & rs("Codi") & "'>"
		str = str & "<P>Producto " & Nom & "</P><P>FIN</P>"
		str = str & "</P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend

	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))
	activateRule "inicio"
end function

function StartEventMaquina() 
	dim Rs
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))

	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='Seleccion Maquina']/L")
	Set Rs = rec("select distinct id,nombre from recursos  where tipo = 'MAQUINA'")
	session("CantaListaTodos")  = ""
	while not rs.eof
		nom = XmlOk(rs("Nombre"))
		session("CantaListaTodos") = session("CantaListaTodos") & "," &  nom
		str = "<P VALSTR='" & rs("Id") & "'>"
		str = str & "<P>Maquina " & Nom & "</P><P>FIN</P>"
		str = str & "</P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend

	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))
	activateRule "inicio"
end function

function StartEventCliente() 
	set engines = ev.selectNodes("./Engine")
	for i=0 to engines.length-1
		set child = engines.item(i).cloneNode(TRUE)
		child.setAttribute "activate", ""
		resp.appendChild child
	next

	set speechGram=Server.CreateObject("MSXML2.DOMDocument")
	speechGram.Load(Server.MapPath("SintaxiBase.xml"))

	
	set L_Article = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir lote data']/L")
	d = DateSerial(year(now),1,1)
	while year(d) = year(now)
		P1 = right("00" & datepart("W",d,2),2) 
		P2 = right("00" & DatePart("ww",d),2) 
		for k=1 to 99 
			P3 = right("00" & k,2) 
			str = "<P VALSTR='" & P1 & P2 & P3 & "'>"
			str = str & "<P>lote " & cdbl(P1) & " " & cdbl(P2) & " " & cdbl(P3) & "</P><P>FIN</P>"
			str = str & "</P>"
			appendXML2 str, L_Article
		next	
		d = dateadd("d",1,d)
	wend
		
	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir cliente']/L")
	Set Rs = rec("Select Distinct c.nom Nom ,c.Codi Codi From " & tablaServits(Dia) & " s Join Clients C on c.codi = s.client  where not Viatge = '' order by c.nom")
	while not rs.eof
		nom = XmlOk(rs("Nom"))
		str = "<P VALSTR='" & rs("Codi") & "'>"
		str = str & "<P>Cliente " & Nom & "</P><P>FIN</P>"
		str = str & "</P>"
		appendXML2 str, L_nombre
		rs.movenext
	wend
	set gram = appendXML("<Grammar name='gram1' allEngines='' activate=''/>")
	gram.appendChild(speechGram.documentElement.cloneNode(TRUE))

end function

function RecognitionEvent() 
	deactivateRule "Confirmacion"
	appendXML("<Rule name='" & getCookie("activateRule") & "' deactivate=''/>")
	rule = getRule()
	state = getCookie("state")	
	select case rule
		case "Adios":
			speak "Hasta Pronto " & DependentaCodiNom(session("nombreConfirmar"))
			session("nombreConfirmar") = "" 
			deactivateRule "Adios"
		case "repite" :
			processRepetir(state)
		case "hora" :
			processHora(state)
		case "gracias" :
			processGracias(state)
		case "corregir" :
			processCorregirRule(state)
		case "ayuda" :
			speak Neteja(session("Texto Ayuda Parte1"))
			processAyudaRule(state)
		case "inicio" :
			speak "Di, estoy muy seguro."
			activateRule "Confirmacion"
		case "Confirmacion" :
			StartEvent()
			speak "Menu Principal"
			activateRuleState "menu"
		case "Temperatura","TemperaturaNegativa" :
			Temperatura = getNum()
			if rule = "TemperaturaNegativa" then Temperatura = Temperatura * -1
			speak "Registrada Temperatura de " & session("Nevera Actual") & " a "  & Temperatura & " Grados "
'			if Temperatura < 0 and Temperatura > -8 then speak ", Demasiado alta , llama a Cesar , 636 95 42 73" 
'			if Temperatura >  10 then speak ", Demasiado alta , llama a Cesar , 636 95 42 73" 
			GuardaTemperatura session("Nevera Actual"), session("nombreConfirmar"),Temperatura
			activateRuleState "menu"
		case "Producto Siguiente"
			if EsEof("IdAlbara") then
				FinAlbaran
			else
				productoMueve "Siguiente"
				ProductoReparte
				activateRule "corregir"
			end if
		case "FinAlbaran"
			FinAlbaran
		case "Producto Anterior"
			productoMueve "Anterior"
			ProductoReparte
			activateRule "corregir"
		case "Otra Caja"	
			OtraCaja
		case "Unidades","Peso","PesoTotal","vale dame mas":
			ProductoAcabado = false
			select case rule 
				case "Peso" 
					peso = getNum()
					if session("Ordinal Peso Entrado") = "" then 
						session("Ordinal Peso Entrado") = 1
					else
						session("Ordinal Peso Entrado") = session("Ordinal Peso Entrado") + 1
					end if				
					cookie "peso " & session("Ordinal Peso Entrado") & " entrat", peso
					if cdbl(session("Ordinal Peso Entrado")) = cdbl(session("Ordinal Peso Pedido")) then 
						ProductoAcabado = true
					else
						activateRuleState "Unidades Peso" 
						activateRule "Peso"
						speak "Peso " & peso & " gramos. Faltan " & cdbl(session("Ordinal Peso Pedido")) - cdbl(session("Ordinal Peso Entrado"))
					end if				
				case "Unidades"
					unidades = getNum()
					cookie "unidades Entrat", unidades
					speak unidades & " unidades. "
					ProductoAcabado = true
				case "PesoTotal"
					unidades = getNum()
					cookie "PesoTotal Entrat", unidades
					speak unidades & " Gramos. "
					ProductoAcabado = true
				case "vale dame mas"
					'unidades = cdbl(session("Ordinal Peso Pedido"))
					'session("unidades Entrat") = unidades
					'cookie "PesoTotal Entrat", unidades
					'speak "  Vale. "
					ProductoAcabado = true	
			end select	
			
			if ProductoAcabado then 
				if session("nombreConfirmar") <> "" and session("LlevamosCajas") = "0" then 
					speak "Cuento una caja . "
					session("LlevamosCajas") = session("LlevamosCajas") + 1
				end if	
				rec "Update " & tablaServits(Dia) & " Set ComentariPer = '[CjN:" & session("LlevamosCajas") & "][CjH:" & now() & "][CjU:" & session("nombreConfirmar") & "]' + isnull(ComentariPer,'') Where Id = '" & session("IdAlbara") & "' "  
			    if not rule = "vale dame mas" then productoConfirmado
				if EsEof("IdAlbara") then
					finAlbaran
				else
					productoMueve "Siguiente"
					ProductoReparte
					activateRule "corregir"
				end if
			end if	
		case else :
			processActiveRule(state)				
	end select
end function

function FinAlbaran
	session("Texto Ayuda Parte1") = ""
	speak "Fin albaran. "
	if EsEof("Comercio") then 
		StartEvent()
		speak "Menu Principal"
		activateRuleState "menu"
	else
		ComercioMueve "Siguiente"
		ComercioCanta
		deactivateRule "Unidades"
		if calLote then 
			deactivateRule "PesoTotal"
			deactivateRule "Peso"
		end if
		deactivateRule "Otra Caja"
		deactivateRule "vale dame mas"
		deactivateRule "Producto Siguiente"
		deactivateRule "Producto Anterior"
		deactivateRule "lote numerico"
		deactivateRule "pedir lote data"
		activateRule "inicio"
		activateRuleState "navega cliente"
	end if
end function 

function processActiveRule(state) 
	dim Rs
	select case state
		case "pedir nombres" :
			nombre = getProp("nombre") 
'			speak "Entendi " & nombre
			if not trim(nombre) = "todos" then 
'				speak "El trim es  " & trim(nombre)  &  " todos " 
				cookie "nombreConfirmar", nombre
				speak "Hola " & DependentaCodiNom(nombre)
			end if	
			activateRuleState "menu"
		case "Seleccion Maquina" :
			Maquina = getProp("Maquina")
			if Maquina = "todos" then
				speak session("CantaListaTodos")
				activateRuleState "Seleccion Maquina"
			else
				session("Maquina Actual") = Maquina
				speak "Producto de la Maquina  " & RecursIdNom(Maquina) & " ? "
				StartEventArticlesMaquina(Maquina)
				activateRuleState "pedir articulo"
			end if
		case "Seleccion Nevera" :
			Nevera = getProp("Nevera")
			if Nevera = "todos" then
				speak session("CantaListaTodos")
				activateRuleState "Seleccion Nevera"
			else
				session("Nevera Actual") = Nevera
				speak "Temperatura de la Camara  " & Nevera & " ? "
				activateRule "Temperatura"
				activateRule "TemperaturaNegativa"
			end if
		case "pedir reparto" :
			Reparto = getProp("reparto")
			if Reparto = "todos" then
				speak session("CantaListaTodos")
				activateRuleState "pedir reparto"
			else
				session("Reparto Actual") = Reparto
				if session("TipoReparto") = "equipo" then 
					session("Reparto Actual Condicio") = "Equip = '" & session("Reparto Actual") & "' "
					speak "Clientes del Equipo " & Reparto & " ,"
				else
					session("Reparto Actual Condicio") = "Viatge = '" & session("Reparto Actual") & "' "
					speak "Clientes del reparto " & Reparto & " ,"
				end if
				ComercioMueve "Primero"
				ComercioCanta
			end if
		case "Menu Mesa" :
			speak getProp("Menu Mesa")
			activateRuleState "Menu Mesa"
		case "menu" :
			cookie "nombre", getCookie("nombreConfirmar")
			deleteCookie "nombreConfirmar"
			menu = getProp("menu")
			select case menu
				case "RegistroProcuccion" :
					deactivateRule "ayuda"
					deactivateRule "hora"
					deactivateRule "hola"
					deactivateRule "gracias"
					if session("nombreConfirmar") = "" then
						speak "No se con quien hablo, cual es tu nombre ? " 
						StartEventLogin
						activateRuleState "pedir nombres"
					else
						speak "Nombre de la Maquina ?." 
						StartEventMaquina
						activateRuleState "Seleccion Maquina"
					end if
				case "RegistroTemperatura" :
					deactivateRule "ayuda"
					deactivateRule "hora"
					deactivateRule "hola"
					deactivateRule "gracias"
					if session("nombreConfirmar") = "" then
						speak "No se con quien hablo, cual es tu nombre ? " 
						StartEventLogin
						activateRuleState "pedir nombres"
					else
						speak "Nombre de la Camara ?." 
						StartEventCamaras
						activateRuleState "Seleccion Nevera"
					end if
				case "ruta" :
					deactivateRule "ayuda"
					deactivateRule "hola"
					deactivateRule "gracias"
					speak "Nombre del reparto?." 
					StartEventReparto
					activateRuleState "pedir reparto"
				case "Fecha"					
					speak "Fecha Actual : " & join(split(FormatDateTime(Dia,1)," 0")," ")
					activateRuleState "Menu Fecha"
					activateRule "inicio"
'				case "cliente" :
'					deactivateRule "ayuda"
'					deactivateRule "hola"
'					deactivateRule "gracias"
'					speak "Nombre del cliente ?." 
'					StartEventCliente
'					activateRuleState "pedir cliente"
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
				case "Camarero Sale" :
					activateRuleState "Menu Mesa"
					speak "i a mi que coño me importa"
				case "ConsultaEstock" :
					speak "Estock del conjelador :"
					Set Rs = rec("select a.nom Nom,count(*) Quedan  from palets p join articles a on a.codi = p.plu where p.estat = 'En Estanteria' group by a.nom order by a.nom")
					while not rs.eof
						speak rs("Nom") & " Quedan " & Rs("Quedan") & " Palets, "
						rs.movenext
					wend
					activateRuleState "menu"
				case "hola" :
					speak "cual es tu nombre?"
					StartEventLogin
					activateRuleState "pedir nombres"
				case else 
					activateRuleState "menu"
			end select	
		case "Cliente" :
			repartoComercio 0
		case "NumeroPalet" :
			Palet = getNum()
			if existeixPalet(Palet) = "No Existeix" then
'				speak "No encuentro este palet"
				activateRuleState "NumeroPalet"
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
			if estatnteria = 0 then
				activateRuleState "NumeroEstanteria" 
			else
				cookie "NumeroEstanteria", Estanteria 
				select case getCookie("NumeroEstanteria")
					case "EntraPalet"
						Palet = getCookie("NumeroPalet")
						if existeixPalet(Palet) = "Etiquetado" then
							rec "Update Palets set estat = 'En Estanteria' , Posicion1 = '" & Estanteria & "' Where Codi = " & Palet
							speak "Dejamos El Palet Numero "  & Palet & " de " & ProductoPalet(Palet) & "En La estanteria " & Estanteria 
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
			end if	
		case "pedir articulo" :
			CodiArticle = getProp("articulo")
			cookie "pedir articulo", CodiArticle 
			select case getCookie("pedir articulo")
				case "EtiquetaPalet"
					speak "Producto " & ArticleCodiNom(CodiArticle) & ", Numero de Etiquetas ?"
					activateRuleState "NumeroEtiquetas"
				case "SacaPalet"
					Set Rs = rec("Select * From Palets Where Plu = " & CodiArticle & " and estat = 'En Estanteria' Order by DataI desc " )
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
		case "navega Producto"
			select case getProp("navega producto")
				case "Orden Cliente"
					speak "Canvio de orden a Cliente "
					ComercioMueve "Primero"
					activateRuleState "navega Cliente"
					ComercioCanta
				case "Terminar"
					speak "Fin Reparto "
					StartEvent()
					speak "Menu Principal"
					activateRuleState "menu"
				case "Anterior","Siguiente"
					if EsEof("Comercio") and getProp("navega producto") = "Siguiente" then 
						speak "No Quedan Mas"
						activateRuleState "navega producto"
					elseif EsBof("Comercio") and getProp("navega producto") = "Anterior" then 
						speak "No Quedan Mas"
						activateRuleState "navega producto"
					else
						ProductoMueve getProp("navega producto")
						ProductoCanta
					end if
				case "Aceptar"
					ProductoMueve "Primero"
					ProductoReparte
			end select
		case "Menu Fecha" :
			select case getProp("Menu Fecha")
				case "Siguiente"
					dia = dateadd("d", 1,dia)				
					activateRuleState "Menu Fecha"
					activateRule "inicio"
				case "Anterior"
					dia = dateadd("d",-1,dia)				
					activateRuleState "Menu Fecha"
					activateRule "inicio"
				case "Manana"
					dia = dateadd("d", 1,now)				
					activateRuleState "Menu Fecha"
					activateRule "inicio"
				case "Hoy"
					dia = now
					activateRuleState "Menu Fecha"
					activateRule "inicio"
				case "Aceptar"
					activateRuleState "menu"
			end select
			session("FechaDeTrabajo") = dia
			speak "Fecha Actual : " & join(split(FormatDateTime(Dia,1)," 0")," ")
		case "navega cliente" :
			select case getProp("navega cliente")
				case "Orden Inverso"
					if not callote then 
						if session("OrdenClientes") = " order by cast(isnull(cc.valor,isnull(ccc.valor,c.codi)) as numeric) ,nom " then
							session("OrdenClientes") = " order by cast(isnull(cc.valor,isnull(ccc.valor,c.codi)) as numeric) Desc ,nom " 
							speak "Orden Normal. "  
						else
							session("OrdenClientes") = " order by cast(isnull(cc.valor,isnull(ccc.valor,c.codi)) as numeric) ,nom " 
							speak "Orden Inverso. "  
						end if
						ComercioMueve "Primero"
						ComercioCanta
					end if	
				case "Algunos"
'					session("FiltreLots") = " and not comentari like '%Lote:%' "
					if not calLote then session("FiltreLots") = session("FiltreLots") & " and (QuantitatServida>0 or comentari like '%Lote%') "
					speak "Canto solo los pedidos sin lote. "
					ComercioMueve "Primero"
					ComercioCanta
				case "Todos"
					session("FiltreLots") = ""
					if not calLote then session("FiltreLots") = session("FiltreLots") & " and (QuantitatServida>0 or comentari like '%Lote%') "
					speak "Canto todos los Pedidos. "
					ComercioMueve "Primero"
					ComercioCanta
				case "EstadoSistema"
					k = ElementsPendentsGravar()
					if k=0 then
						speak "Lo tengo Todo Guardadito."					
					else
						speak "Tengo " & k & " Pedidos Pendientes de guardar."					
					end if
					activateRuleState "navega cliente"
				case "Orden Producto"
					speak "Canvio de orden a producto "
					activateRuleState "navega Producto"
					ComercioMueve "Terminar"
					ProductoCanta
				case "Terminar"
					speak "Fin Reparto "
					StartEvent()
					speak "Menu Principal"
					activateRuleState "menu"
				case "Anterior","Siguiente"
					if EsEof("Comercio") and getProp("navega cliente") = "Siguiente" then 
						speak "No Quedan Mas"
						activateRuleState "navega cliente"
					elseif EsBof("Comercio") and getProp("navega cliente") = "Anterior" then 
						speak "No Quedan Mas"
						activateRuleState "navega cliente"
					else
						ComercioMueve getProp("navega cliente")
						ComercioCanta
					end if
				case "Aceptar"
'					deactivateRule "inicio"
					session("LlevamosCajas") = 0
					ProductoMueve "Primero"
					ProductoReparte
			end select
		case "pedir lote data","lote numerico" :  
			lote = getProp("lote data")
			if lote = "" then lote = getNum()
			cookie "lote data" , lote
			speak "lote " & lote & " Peso ?"
			session("Texto Ayuda Parte1") = "Esperando Peso Para Cliente " & ClienteCodiNom(session("Comercio")) & ". Producto " & ArticleIdAlbaraNom(session("IdAlbara")) & ". Unidades " & session("Ordinal Peso Pedido")
			activateRuleState "Unidades Peso" 
			activateRule "Unidades"
			activateRule "Otra Caja"
			activateRule "PesoTotal"
			activateRule "Peso"
			activateRule "vale dame mas"
			activateRule "corregir"
			deactivateRule "Producto Siguiente"
			deactivateRule "Producto Anterior"
	end select
end function

sub ProductoCanta() 
	speak ProductoNombre(ArticleIdAlbaraCodiA(session("IdAlbara")))
	activateRuleState "navega Producto"
end sub

sub ComercioCanta() 
	speak comercioNombre(session("Comercio"))
	activateRuleState "navega cliente"
end sub

sub ComercioMueve(posicion) 
	dim Rs
	Set Rs = rec("Select Distinct c.Codi codi ,Nom,cast(isnull(cc.valor,9999) as numeric) from  " & tablaServits(Dia) & " s left join Clients c on c.codi = s.Client left join constantsclient cc on isnumeric(cc.valor)= 1 and cc.codi = s.Client and cc.variable = '" & session("CampOrdreClient") & "'  Where " & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by cast(isnull(cc.valor,9999) as numeric),nom")
	session("Comercio") = MueveRs (Rs,posicion,"Comercio")
end sub

function comercioNombre(CodiComercio) 
	comercioNombre = ""
	dim Rs
	Set Rs = rec("Select Nom From Clients Where Codi = " & CodiComercio )
	if not rs.eof then comercioNombre = rs("Nom") 
end function

function ProductoPalet(Codi) 
	ProductoPalet = "" 
	dim Rs
	Set Rs = rec("select a.nom from palets p join articles a on a.codi = p.plu and p.codi = " & Codi & " ")
    if not rs.eof then ProductoPalet = rs("Nom")
end function

function ArticleIdAlbaraNom(IdAlbara) 
    ArticleIdAlbaraNom = ArticleCodiNom(ArticleIdAlbaraCodiA(IdAlbara))
end function

function ArticleIdAlbaraComentari(IdAlbara) 
	dim Rs
	Set Rs = rec("Select Comentari From " & tablaServits(Dia) & " Where Id = '" & IdAlbara & "' ")
	ArticleIdAlbaraComentari=""
	if not rs.eof then ArticleIdAlbaraComentari = rs("Comentari")
	while instr(ArticleIdAlbaraComentari,"[") >0 
		p = instr(ArticleIdAlbaraComentari,"]")
		ArticleIdAlbaraComentari = right(ArticleIdAlbaraComentari,len(ArticleIdAlbaraComentari) - p )
	wend
	
end function
	
function ArticleIdAlbaraCodiA(IdAlbara) 
	dim Rs,CodiA
	Set Rs = rec("Select CodiArticle From " & tablaServits(Dia) & " Where Id = '" & IdAlbara & "' ")
	ArticleIdAlbaraCodiA=0
	if not rs.eof then ArticleIdAlbaraCodiA = rs("CodiArticle")
end function
						
function ArticleCodiNom(Codi) 
	ArticleCodiNom = "Articulo " & Codi
	dim Rs
	Set Rs = rec("select  Nom From Articles Where codi = " & Codi & " ")
    if not rs.eof then ArticleCodiNom = rs("Nom")
end function

function ClienteCodiNom(Codi) 
	ClienteCodiNom = "Cliente " & Codi
	dim Rs
	Set Rs = rec("select Nom From Clients Where codi = " & Codi & " ")
    if not rs.eof then ClienteCodiNom = rs("Nom")
end function

function ElementsPendentsGravar() 
	ElementsPendentsGravar = 0 
	dim Rs
	Set Rs = rec("Select Count(*) From  CalEnviar ")
    if not rs.eof then if not isnull(rs(0)) then ElementsPendentsGravar = rs(0)
end function

function DependentaCodiNom(Codi) 
	DependentaCodiNom = "Empleado " & Codi
	dim Rs
	Set Rs = rec("select Nom From Dependentes Where codi = " & Codi & " ")
    if not rs.eof then DependentaCodiNom = rs("Nom")
end function

function RecursIdNom(Codi) 
	RecursIdNom = " una "
	dim Rs
	Set Rs = rec("select nombre From Recursos Where Id = '" & Codi & "' ")
    if not rs.eof then RecursIdNom = rs("nombre")
end function


function existeixPalet(Codi) 
	existeixPalet = "No Existeix"
	dim Rs
	Set Rs = rec("select Estat From Palets Where codi = " & Codi & " ")
    if not rs.eof then existeixPalet = rs("Estat")
end function

function buscaCuantitat(IdAlbara)
	buscaCuantitat = ""
	dim Rs
	if calLote then
		Set Rs = rec("select sum(Quantitatdemanada) Q from " & tablaServits(Dia) & " Where Id = '" & IdAlbara & "' " )
	else
		Set Rs = rec("select sum(QuantitatServida) Q from " & tablaServits(Dia) & " Where Id = '" & IdAlbara & "' " )
	end if
	if not rs.eof then buscaCuantitat = Canvia(rs("Q"),".",",")
end function


sub OtraCaja
	session("LlevamosCajas") = session("LlevamosCajas") + 1
	speak "Llevamos " & session("LlevamosCajas") & " Cajas."
end sub

sub ProductoReparte()
	session("Ordinal Peso Pedido") = buscaCuantitat(session("IdAlbara"))
	session("Ordinal Peso Entrado") = ""
	
	comentari = ArticleIdAlbaraComentari(session("IdAlbara"))
	speak trim(ProductoNombre(ArticleIdAlbaraCodiA(session("IdAlbara")))) & ". " & session("Ordinal Peso Pedido")
	
	activateRule "Producto Siguiente"
	activateRule "Producto Anterior"
	activateRule "FinAlbaran"
	
	if calLote then
		deActivateRule "Unidades"
		deactivateRule "Otra Caja"
		deActivateRule "PesoTotal"
		deActivateRule "Peso"
		deactivateRule "vale dame mas"
		activateRuleState "lote numerico"
		activateRuleState "pedir lote data"
		session("Texto Ayuda Parte1") = "Esperando Lote Para Cliente " & ClienteCodiNom(session("Comercio")) & ". Producto " & ArticleIdAlbaraNom(session("IdAlbara")) & ". Unidades " & session("Ordinal Peso Pedido")
	else
		session("Texto Ayuda Parte1") = "Esperando Peso Para Cliente " & ClienteCodiNom(session("Comercio")) & ". Producto " & ArticleIdAlbaraNom(session("IdAlbara")) & ". Unidades " & session("Ordinal Peso Pedido")
		activateRuleState "Unidades Peso" 
		activateRule "Unidades"
		activateRule "Otra Caja"
		activateRule "PesoTotal"
		activateRule "Peso"
		activateRule "vale dame mas"
	end if
	activateRule "corregir"
	activateRule "ayuda"
	activateRule "inicio"
end sub

function CondicionCliente()
	CondicionCliente=""
	if len(session("Comercio")) > 0 then CondicionCliente = " Client = '" & session("Comercio") & "' and "
end function

sub ProductoMueve(posicion) 
	dim Rs
	Set Rs = rec("select isnull(o.valor,9999) ,c.Nom,c.Codi,Id         from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle left join articlespropietats o on o.variable = 'CODI_PROD'  and isnumeric(o.valor) =1 and o.CodiArticle = s.codiarticle   Where " & session("Reparto Actual Condicio")  & " And " & CondicionCliente & " s." & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by " & OrdreArticles & " ,c.nom " )
'speak "select isnull(o.valor,9999) ,c.Nom,c.Codi,Id         from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle left join articlespropietats o on o.variable = 'CODI_PROD'  and isnumeric(o.valor) =1 and o.CodiArticle = s.codiarticle   Where " & session("Reparto Actual Condicio")  & " And " & CondicionCliente & " s." & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by " & OrdreArticles & " ,c.nom " 
	session("IdAlbara") = MueveRs (Rs,posicion,"IdAlbara")	
end sub

function EsBof(Taula) 
	dim Rs
	EsBof = false 
	
	if Taula = "IdAlbara" then
	    Set Rs = rec("select isnull(o.valor,9999) ,c.Nom,c.Codi,Id         from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle left join articlespropietats o on o.variable = 'CODI_PROD'  and isnumeric(o.valor) =1 and o.CodiArticle = s.codiarticle   Where " & session("Reparto Actual Condicio")  & " And " & CondicionCliente & " s." & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by " & OrdreArticles & " ,c.nom " )
'		Set Rs = rec("select c.Nom,c.Codi,Id,o.Orden                       from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle join ordenreparto o on o.Reparto = '" & session("Reparto Actual") & "' and o.codi = c.codi and o.Tipus='Article' Where " & session("Reparto Actual Condicio") & " " & CondicionCliente & " s." & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by Orden,c.nom ")
		if not Rs.eof then if session("IdAlbara") = Rs("Id") then EsBof = true  ' Es el primer !!
	else
		Set Rs = rec("Select Distinct c.Codi codi ,Nom,cast(isnull(cc.valor,9999) as numeric) from  " & tablaServits(Dia) & " s left join Clients c on c.codi = s.Client left join constantsclient cc on isnumeric(cc.valor)= 1 and cc.codi = s.Client and cc.variable = '" & session("CampOrdreClient") & "'  Where " & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by cast(isnull(cc.valor,9999) as numeric),nom")
'		Set Rs = rec("select Distinct c.Codi codi ,Nom,cast(isnull(cc.valor,0) as numeric),isnull(orden,99999) from (select cc.*,Orden  from Clients cC left join ordenreparto o on o.codi = cc.codi and tipus='Client' and reparto = '" & session("Reparto Actual") & "') c join " & tablaServits(Dia) & " s on c.codi = s.client left join constantsclient cc on isnumeric(cc.valor)= 1 and cc.codi = c.codi and cc.variable = 'Ruta_Orden'  Where " & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by isnull(orden,99999),cast(isnull(cc.valor,0) as numeric) ,nom ")
		if not Rs.eof then if cdbl(session(Taula)) = cdbl(Rs("Codi")) then EsBof = true
	end if

end function

function EsEof(Taula) 
	dim Rs
	
	EsEof = false
	if Taula = "IdAlbara" then
	    Set Rs = rec("select isnull(o.valor,9999) ,c.Nom,c.Codi,Id         from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle left join articlespropietats o on o.variable = 'CODI_PROD'  and isnumeric(o.valor) =1 and o.CodiArticle = s.codiarticle   Where " & session("Reparto Actual Condicio")  & " And " & CondicionCliente & " s." & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by " & OrdreArticles & " ,c.nom " )
'		Set Rs = rec("select c.Nom,c.Codi,Id,o.Orden from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle join ordenreparto o on o.Reparto = '" & session("Reparto Actual") & "' and o.codi = c.codi and o.Tipus='Article' Where " & CondicionCliente & " s." & session("Reparto Actual Condicio") &  " " & session("FiltreLots") & " order by Orden,c.nom ")
		if session(Taula) = MueveRs (Rs,"Siguiente",Taula) then EsEof = true
	else
		Set Rs = rec("Select Distinct c.Codi codi ,Nom,cast(isnull(cc.valor,9999) as numeric) from  " & tablaServits(Dia) & " s left join Clients c on c.codi = s.Client left join constantsclient cc on isnumeric(cc.valor)= 1 and cc.codi = s.Client and cc.variable = '" & session("CampOrdreClient") & "'  Where " & session("Reparto Actual Condicio") & " " & session("FiltreLots") & " order by cast(isnull(cc.valor,9999) as numeric),nom")
'		Set Rs = rec("select Distinct c.Codi codi ,Nom,cast(isnull(cc.valor,0) as numeric),isnull(orden,99999) from (select cc.*,Orden  from Clients cC left join ordenreparto o on o.codi = cc.codi and tipus='Client' and reparto = '" & session("Reparto Actual") & "' ) c join " & tablaServits(Dia) & " s on c.codi = s.client left join constantsclient cc on isnumeric(cc.valor)= 1 and cc.codi = c.codi and cc.variable = 'Ruta_Orden'  Where " &  session("Reparto Actual Condicio") & "  " & session("FiltreLots") & " order by isnull(orden,99999),cast(isnull(cc.valor,0) as numeric) ,nom ")
		if cdbl(session(Taula)) = cdbl(MueveRs (Rs,"Siguiente",Taula)) then EsEof = true
	end if
	
end function

function MueveRs (Rs,posicion,Tipus)
	dim Actual
	if isnumeric(session(Tipus)) then
		Actual = Cdbl(session(Tipus))
	else
		Actual = session(Tipus)
	end if
	
	MueveRs = Actual
	dim Variable
	
	if Tipus = "IdAlbara" then
		Variable= "Id"
	else
		Variable= "Codi"
	end if

	select Case Posicion
		case "Primero"
			if not rs.eof then 
				MueveRs = Rs(Variable)
				exit function	
			end if	
		case "Siguiente"
'			dim ElPrimero
'			ElPrimero = Actual
'			if not rs.eof then ElPrimero = cdbl(Rs(Variable))
			while not rs.eof
				if Actual = Rs(Variable) then
					rs.movenext
					if not rs.eof then MueveRs = Rs(Variable)
					exit function	
				end if	
				rs.movenext
			wend
'			MueveRs = ElPrimero  ' Per si no el troba
		case "Anterior"
			Ultim = Actual
			while not rs.eof 
				if Actual = Rs(Variable) then 
					MueveRs = ultim
					exit function
				end if	
				ultim = Rs(Variable)
				rs.movenext
			wend
		case "Actual"
			MueveRs = Actual
		end select
	if not rs.eof then MueveRs = Rs(Variable)	
end function

function ProductoNombre(Codi) 
	ProductoNombre = ""
	dim Rs
	Set Rs = rec("select Nom from Articles Where Codi = " & Codi)
	if not rs.eof then ProductoNombre = Neteja(lcase(rs("Nom")))  ' & " , 
end function

sub productoConfirmado() 
	Comercio = session("Comercio")
	Producto = ArticleIdAlbaraCodiA(session("IdAlbara"))
	lote      = session("lote data")
	
	peso=0
	if len (session("unidades Entrat")) > 0 then  
		peso = session("unidades Entrat")
	else	
		Cantala = false 
		if len (session("PesoTotal Entrat")) > 0 then  peso = cdbl(session("PesoTotal Entrat"))
		if len (session("peso 1 entrat")) > 0 and len(session("Ordinal Peso Entrado")) > 0 then 
			for i= 1 to session("Ordinal Peso Entrado")
				Cantala = true 
				peso = peso + session("peso " & i & " entrat")
			next
		end if
		peso = round(Peso/1000,3)
		if Cantala then speak "Peso Total " & peso & " Kilos , "
	end if

	rec "Update " & tablaServits(Dia) & " Set Comentari = '[Lote:" & lote & "][Cad:10-02-09]' + Comentari  ,QuantitatServida = '" & peso & "' Where Id = '" & session("IdAlbara") & "' "  
	'speak "Update " & tablaServits(Dia) & " Set Comentari = '[Lote:" & lote & "][Cad:10-02-09]' + Comentari  ,QuantitatServida = '" & peso & "' Where Id = '" & session("IdAlbara") & "' "  	
	rec "Insert Into CalEnviar (Id,Taula,TmSt) Values ('" & session("IdAlbara") & "','" & "[Servit-" & right(year(Dia),2) & "-" & right("00" & month(Dia),2) & "-" & right("00" & day(Dia),2) & "]',GetDate()) " 
	
	session("lote data") = ""
	session("peso entrat") = "" 
	session("unidades Entrat") = ""
	session("PesoTotal Entrat") = ""
	session("Ordinal Peso Entrado") = ""
	session("Ordinal Peso Pedido") = 0
end sub	

sub GuardaTemperatura (Nevera,Nombre,Temperatura)
	dim Rs
	Set Rs = rec("select id From Appcctareas where tipo = 'TEMPERATURA' and tarea = '" & Nevera & "'")
	if not rs.eof then
		IdT = Rs("Id")
		set Rs = rec("Select id from AppccTareasAsignadas where tarea = '" & IdT & "' and usuario = " & Nombre )
		if rs.eof then
			rec "insert into AppccTareasAsignadas (Id,Tarea,Usuario,Activo) values (newid(),'" & IdT & "','" & Nombre & "',1)" 
			set Rs = rec("Select id from AppccTareasAsignadas where tarea = '" & IdT & "' and usuario = " & Nombre )
		end if
		if not rs.eof then
			IdA = Rs("Id")
			rec "Insert Into AppccTareasResueltas (resuelto,comentario,tareaAsignada,fecha,desde) values('" & Temperatura & "','HIGIENE:1,ESTIVA:1','" & IdA & "',getdate(), 'Voz' )"
		end if	
	end if
end sub


function processCorregirRule(state) 
	select case (state) 
		case "hola" : 
		case "pedir nombres" :
		case "menu" :
		case "navega cliente ---- " :
		case "navega cliente" :
		
		case "Unidades Peso":	
				ProductoReparte			
		case "pedir lote data","lote numerico":  	
			if EsBof("IdAlbara") then
				speak "Es el primero"
			else
				productoMueve "Anterior"
			end if
			ProductoReparte			
	end select
end function

function processAyudaRule(state)
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
		case "navega cliente" :
			speak ""
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

set ev = domi.selectSingleNode("/Event")

if Not ev  Is Nothing  then

	select case buscaattributes(ev.attributes,"type")
		case "Start" : 
			StartEvent()
		case "Recognition" :
			RecognitionEvent()
			session("UltimDit") = UltimDit
		case "FalseRecognition" :' de moment no fem help
'speak "Como ? " 
		'	FalseRecognitionEvent()
	end select	
end if

	response.write  domo.xml


%>
