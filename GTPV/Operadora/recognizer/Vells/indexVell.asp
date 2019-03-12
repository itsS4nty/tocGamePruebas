<%@LANGUAGE="VBSCRIPT"%>
<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/recognizer/CarnUtils.asp"-->
<!-- #include virtual="/include/tablas.asp"    -->

<%

	Empresa = request.item("Empresa")
	
	dia = now ' dateadd("d",-2,now)
	dim resp
	connectHIT
	
	Set Rs = recHit("select * from web_empreses Where Id = '" & Empresa & "' " )
	if rs.eof then 
		'set Rs = recHit("select * from web_empreses Where nom = 'daza' " )
		'Set Rs = recHit("select * from web_empreses Where nom = 'Paballsa' " )
		Set Rs = recHit("select * from web_empreses Where nom = 'pa natural' " )
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
	UltimDit=""
	calLote = false
	if Session("Usuari_Empresa_Db") = "Fac_Daza" then callote = true
	
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

function Canvia(St,viejo,nuevo)
	Canvia = St
	if not (isnull(st) or isnull(viejo) or isnull(nuevo)) then 
		Canvia = join(split(St,viejo),nuevo)
	end if		
end function

function Neteja(s)

	if not session("Sinonim_Dije_Carregat") = "Si" then carregaTuplas
	k=0 
	while not session("Sinonim_Dije_" & k) = ""
'response.write session("Sinonim_Dije_" & k)
	if instr(s,session("Sinonim_Dije_" & k)) > 0 then 
		s = Canvia(s,session("Sinonim_Dije_" & k),session("Sinonim_Digo_" & k))
	end if	
'response.write s
		k=k+1
	wend
'response.write "Tot Ok."
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
	if ruleName = "menu" then
		activateRuleState "hola"
		activateRule "corregir"
		activateRule "ayuda"
		activateRule "inicio"
		activateRule "repite"
		activateRule "hora"
		activateRule "gracias"
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
		Nom = Canvia(rs("Nom"),","," ")
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
		nom = Canvia(rs("Nom"),"&"," ")
		nom = Canvia(Nom,"/"," ")
		str = "<P VALSTR='" & rs("Codi") & "'>"
		str = str & "<P>Producto " & Nom & "</P>"
		str = str & "</P>"
		appendXML2 str, L_Article
		rs.movenext
	wend
	
	set L_Article = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir lote data']/L")
	d = DateSerial(year(now),1,1)
	while year(d) = year(now)
		dd = right("00" & day(d),2)
		mm = right("00" & month(d),2)
		str = "<P VALSTR='" & dd & "0" & mm & "'>"
		str = str & "<P>lote " & cdbl(dd) & " 0 " & cdbl(mm) & "</P>"
		str = str & "</P>"
		appendXML2 str, L_Article
		d = dateadd("d",1,d)
	wend

	set L_nombre = speechGram.selectSingleNode("/GRAMMAR/RULE[@NAME='pedir reparto']/L")
	Set Rs = rec("Select Distinct Viatge From " & tablaServits(Dia) & " order by Viatge ")
	str = "<P VALSTR='todos'>"
	str = str & "<P>Reparto todos</P>"
	str = str & "</P>"
	appendXML2 str, L_nombre
	session("CantaListaRepartos")  = ""
	while not rs.eof
		nom = Canvia(rs("Viatge"),"&"," ")
		session("CantaListaRepartos") = session("CantaListaRepartos") & "," &  nom
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
			activateRuleState "menu"
		case "Unidades","Peso" :
			if rule = "Peso" then 
				peso = getNum()
				cookie "peso entrat", peso
				speak peso & " gramos. "
			else
				unidades = getNum()
				cookie "unidades Entrat", peso
				speak unidades & " unidades. "
			end if
			iComercio = getCookie("Comercio")
			iProducto = getCookie("Producto")
			productoConfirmado
			iProducto=iProducto+1
			if iProducto < maxProductos(iComercio) then
				repartoProducto iComercio, iProducto
			else
				speak "Fin albaran. "
				iComercio = getCookie("Comercio")
				iComercio=iComercio+1
				if iComercio >= maxComercios() then iComercio = 0
				repartoComercio iComercio
				activateRule "inicio"
				activateRuleState "pedir reparto"
			end if
			
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
		case "pedir reparto" :
			Reparto = getProp("reparto")
			if Reparto = "todos" then
				speak session("CantaListaRepartos")
				activateRuleState "pedir reparto"
			else
				session("Reparto Actual") = Reparto
				session("Cliente Actual") = -1
				speak "Clientes del reparto " & Reparto & " ,"
				repartoComercio  0
			end if

		case "menu" :
			cookie "nombre", getCookie("nombreConfirmar")
			deleteCookie "nombreConfirmar"
			menu = getProp("menu")
			select case menu
				case "ruta" :
'					deactivateRule "corregir"
					deactivateRule "ayuda"
'					deactivateRule "inicio"
					deactivateRule "hora"
					deactivateRule "hola"
					deactivateRule "gracias"
					speak "Nombre del reparto?." 
					activateRuleState "pedir reparto"
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
'					speak "Opcion : " & menu
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
		case "navega cliente" :
			iComercio = getCookie("Comercio")
			select case getProp("navega cliente")
				case "anterior"
					iComercio=iComercio-1
					if iComercio < 0 then iComercio = 0
					repartoComercio iComercio
				case "siguiente"
					iComercio=iComercio+1
					if iComercio >= maxComercios() then iComercio = maxComercios() -1
					repartoComercio iComercio
				case "aceptar"
'					deactivateRule "inicio"
					repartoProducto iComercio, 0
			end select
		case "lote numeric" :  '  "pedir lote data"
			'lote = getProp("lote data")
			Lote = getNum()
			cookie "lote data" , lote
'			productoConfirmado
			speak "lote " & lote & " Peso ?"
			activateRule "Unidades"
			activateRule "Peso"
	end select
end function

sub repartoComercio(iComercio) 
	cookie "Comercio", iComercio
	speak comercioNombre(iComercio)
	activateRuleState "navega cliente"
end sub

function maxComercios()
	rec "delete s  from " & tablaServits(Dia) & " s left join articles a on s.codiarticle = a.codi where a.nom='' or a.nom is null"
	Reparto = session("Reparto Actual")
'	Set Rs = rec("select Distinct Nom from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client order by nom ")
	Set Rs = rec("select Distinct Nom,cc.valor from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client left join  constantsclient cc on cc.codi = c.codi and cc.variable = 'Ruta_Orden'  Where Viatge = '" & session("Reparto Actual") & "'  order by cc.valor,nom ")
	maxComercios = 0
	do until rs.eof
		maxComercios = maxComercios + 1
		rs.movenext
	loop
end function

function comercioNombre(iComercio) 
	comercioNombre = ""
	Set Rs = rec("select Distinct Nom,cc.valor from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client left join  constantsclient cc on cc.codi = c.codi and cc.variable = 'Ruta_Orden'  Where Viatge = '" & session("Reparto Actual") & "'  order by cc.valor,nom ")
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
	Set Rs = rec("select sum(Quantitatdemanada) Q from " & tablaServits(Dia) & " Where Client = '" & comercioIaCodi(iComercio) & "' and CodiArticle = '" & productoIaCodi(iProducto) & "' " )
	if not rs.eof then buscaCuantitat = rs("Q") ' & ", iComercio "  & iComercio
end function

function comercioIaCodi(iComercio) 
	comercioIaCodi = 0
	Set Rs = rec("select Distinct Nom,Codi from Clients c join " & tablaServits(Dia) & " s on c.codi = s.client order by nom ")
	for i = 1 to iComercio
		if not rs.eof then rs.movenext
	next
	if not rs.eof then comercioIaCodi = rs("Codi") 
end function

function productoIaCodi(iProducto) 
	productoIaCodi = 0
	Set Rs = rec("select Distinct Nom,Codi from Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")
	for i = 0 to iProducto-1
		if not rs.eof then rs.movenext
	next
	if not rs.eof then productoIaCodi = Neteja(rs("Codi")) ' & " , iComercio " & iComercio  & " , iProducto " & iProducto 
end function

sub repartoProducto(iComercio, iProducto)
	cookie "Producto", iProducto

	speak Neteja(ProductoNombre(iComercio,iProducto)) & ", " & Canvia(buscaCuantitat(iComercio, iProducto),".",",")
	if callote then
		activateRuleState "lote numeric" ' "pedir lote data"
	else
		activateRule "Unidades"
		activateRule "Peso"
	end if
end sub

function maxProductos(iComercio)
	Set Rs = rec("Select Distinct Nom From Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom ")
	
'response.write "Select Distinct Nom From Articles c join " & tablaServits(Dia) & " s on c.codi = s.CodiArticle Where Client = '" & comercioIaCodi(iComercio) & "' order by nom "

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
	iComercio = getCookie("Comercio")
	iProducto = getCookie("Producto")
	lote      = getCookie("lote data")
	peso      = getCookie("peso entrat")
	Unidades  = session("unidades Entrat")

'	speak " iComercio " & iComercio & " iProducto " & iProducto & " lote " &  lote & "  peso " &  peso
speak " lote  : " & lote & " , peso :  " & peso & " , Unidades :  " & Unidades & " : "
'response.write "Update " & tablaServits(Dia) & " Set Comentari = '[Lote:" & lote & "][Cad:10-02-09]' + Comentari  ,QuantitatServida = '" & peso & "' Where CodiArticle = '" & productoIaCodi(iProducto) & "' and client = " & comercioIaCodi(iComercio)   
	rec "Update " & tablaServits(Dia) & " Set Comentari = '[Lote:" & lote & "][Cad:10-02-09]' + Comentari  ,QuantitatServida = '" & peso & "' Where CodiArticle = '" & productoIaCodi(iProducto) & "' and client = " & comercioIaCodi(iComercio)   
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
		case "navega cliente ---- " :
			if not productoCorregido() then
				iComercio = getCookie("Comercio")
				if iComercio = 0 then
					speak "menu"
					activateRuleState "menu"
				else
					repartoComercio iComercio
				end if
			end if
		case "pedir lote data" :
			if not ProductoCorregido() then
				iComercio = getCookie("Comercio")
				iProducto = getCookie("Producto")
				if iProducto = 0 then
					repartoComercio iComercio
				else
					repartoProducto iComercio, iProducto
				end if	
			end if
		case "navega cliente" :
			iComercio = getCookie("Comercio")
			iProducto = getCookie("Producto") -1
			if iProducto < 0 then iProducto=0
			repartoProducto iComercio, iProducto
	end select
end function

function productoCorregido() 
	iComercio = getCookie("Comercio")
	iProducto = getCookie("Producto")
	
	if isEmpty(iComercio) then 
		productoCorregido = FALSE
		exit function
	end if

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
