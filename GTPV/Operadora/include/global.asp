<!-- #include virtual="/include/seguretat.asp" -->
<!-- #include virtual="/include/database.asp"  -->
<!-- #include virtual="/include/car.asp"       -->
<!-- #include virtual="/include/cookie.asp"    -->
<!-- #include virtual="/include/fecha.asp"     -->
<!-- #include virtual="/include/session.asp"   -->
<!-- #include virtual="/include/string.asp"    -->
<!-- #include virtual="/include/tablas.asp"    -->
<!-- #include virtual="/include/getNames.asp"  -->

<!-- #include virtual="/Facturacion/include/database.asp"  -->
<!-- #include virtual="/Facturacion/include/format.asp"    -->
<!-- #include virtual="/Facturacion/include/string.asp"    -->
<!-- #include virtual="/Facturacion/include/array.asp"     -->
<!-- #include virtual="/Facturacion/include/idioma.asp"  -->


<%if not PDFPRINTER then%>

<!-- #include virtual="/include/Script.asp" -->

<!-- #include virtual="/Facturacion/include/imgBtn.asp"      -->
<!-- #include virtual="/Facturacion/include/ActiveXTest.asp" -->

<%
end if

dim ROOT
ROOT = "/Facturacion"

dim ROOTDLL
ROOTDLL = ROOT & "/dll/"

dim ROOTFORN
ROOTFORN = ROOT & "/ElForn/"

dim ROOTCDP
ROOTCDP = ROOT & "/CDP/"

dim ROOTCDC
ROOTCDC = ROOT & "/ControlDeCompras/"

dim ROOTGR
ROOTGR = ""

dim ROOTREC
ROOTREC = ROOT & "/Recorda/"

dim ROOTCRM
ROOTCRM = ROOT & "/CRM/"

dim ROOTFILE
ROOTFILE = ROOT & "/Foto/"

dim SCRIPTS
SCRIPTS = ROOT & "/js/"

' ------------------------------------------------

dim ICOS
ICOS = ROOT & "/ico/"

dim ICOSFORN
ICOSFORN = ICOS & "ElForn/"

dim ICOSCDP
ICOSCDP = ICOS & "CDP/"

dim ICOSCDC
ICOSCDC = ICOS & "CDC/"

dim ICOSPROG
ICOSPROG = "/ico/"

' ------------------------------------------------

dim IMGS
IMGS = ROOT & "/img/"

dim IMGSFORN
IMGSFORN = IMGS & "ElForn/"

dim IMGSCDP
IMGSCDP = IMGS & "CDP/"

dim IMGSCDC
IMGSCDC = IMGS & "CDC/"

dim IMGSREC
IMGSREC = IMGS & "Recorda/"

dim IMGSDRV
IMGSDRV = IMGS & "drv/"

dim IMGSCRM
IMGSCRM = IMGS & "CRM/"

' ------------------------------------------------

dim BLANK
BLANK = ROOT & "/blank.asp"

' ------------------------------------------------

dim ENTRADA
ENTRADA = ROOT & "/Entrada/"

dim IMGSENTRADA
IMGSENTRADA = IMGS & "Entrada/"

' ------------------------------------------------

dim STYLES
STYLES = ROOT & "/Styles/"

' --- Estilo CSS ------------------------------------------------------------------------------------------------------------------------

dim gESTIL
dim glTIT
dim fColor1
dim fColor2
dim fColor3
dim fColor4
dim fColor5
dim CssCode
getCssByPortal ( )

function setCss ( )

	getCssByPortal ( )

	dim fs		' FileSystemObject
	dim f		' Archivo
	dim path	' Ruta local
	dim cssFile	' Nombre del archivo CSS

	if session("portal") = "CDC" then
		cssFile = gESTIL & ".css"
	elseif session("portal") = "CDP" then
		cssFile = gESTIL & ".css"
	else
		cssFile = session("Usuari_Empresa_Estil")
	end if
	CssCode  = ""

	on error resume next
	' Guardamos el contenido del archivo CSS en la variable CssCont para
	' posteriores usos en lugares donde los archivos CSS no sean funcionales
	set fs = Server.CreateObject("Scripting.FileSystemObject")
	path   = Server.MapPath(STYLES & cssFile)
	set f  = fs.OpenTextFile ( path )
	CssCode = f.ReadAll()

	' Asignamos los estilos a la página
	setCss = "<link href=""" & STYLES & cssFile & """ rel=""stylesheet"" type=""text/css"">" & vbcrlf
	setCss = setCss & " <link href=""" & STYLES & "btn" & cssFile & """ rel=""stylesheet"" type=""text/css"">" & vbcrlf

end function

function izqBarra ( )
	izqBarra = "<img src=""" & IMGSFORN & "izqBarra" & gESTIL & ".gif"" width=""13"" height=""26"" border=""0"">"
end function

function derBarra ( )
	derBarra = "<img src=""" & IMGSFORN & "derBarra" & gESTIL & ".gif"" width=""13"" height=""26"" border=""0"">"
end function

function topBarra ( )
	topBarra = "<img src=""" & IMGSFORN & "topBarra" & gESTIL & ".gif"" width=""26"" height=""13"" border=""0"">"
end function

function botBarra ( )
	botBarra = "<img src=""" & IMGSFORN & "botBarra" & gESTIL & ".gif"" width=""26"" height=""13"" border=""0"">"
end function

' --- Título de la página ---------------------------------------------------------------------------------------------------------------
function setTit ( sec, pag )
	session("Estat_Titol") = sec
	session("Estat_Pagina") = pag
	
	glTIT = glTIT & " > " & sec
	if pag <> "" then glTIT = glTIT & " > " & pag
	setTit = "<title>" & glTIT
	for i=0 to 50
		setTit = setTit & "&nbsp;"
	next
	setTit = setTit & "</title>"
end function

function getTit ( )
	getTit = glTIT
end function

' --- Obtiene el logo del cliente -------------------------------------------------------------------------------------------------------
function getLogo ( byval dir, byval pos )
	logoId = getLogoId ( dir, pos )
	if logoId <> "" then
		getLogo = ROOTFILE & "file.asp?id=" & logoId
	else
		getLogo = ROOTFILE & "NoFoto.jpg"
	end if
end function

function getLogoId ( byval dir, byval pos )
	getLogoId = ""
	sqlLogo = "select top 1 id from( "
	sqlLogo = sqlLogo & "select id,1 p from archivo where nombre='LOGO' and descripcion='<" & pos & dir & ">' union "
	sqlLogo = sqlLogo & "select id,2 p from archivo where nombre='LOGO' and descripcion='<" & dir & ">' union "
	sqlLogo = sqlLogo & "select id,3 p from archivo where nombre='LOGO' and descripcion='<" & pos & ">' union "
	sqlLogo = sqlLogo & "select id,4 p from archivo where nombre='LOGO' and descripcion='<0" & dir & ">' union "
	sqlLogo = sqlLogo & "select id,5 p from archivo where nombre='LOGO' and descripcion='<0>' ) k order by p"
	set rsLogo = rec ( sqlLogo )
	if not rsLogo.eof then getLogoId = rsLogo("id")
end function

' --- Guarda un registro en la tabla de logs --------------------------------------------------------------------------------------------
sub Loga ( byval Accio )
'	accio = change(accio,"'","´")
'	recHit "Insert Into Web_Log(Ip,Hora,Accio) Values('" & Request.ServerVariables("Remote_addr") & "','" & now & "','" & Accio & "')"
end sub

' --- Guarda un registro en la tabla de cafradas ----------------------------------------------------------------------------------------
sub cafradas ( byval accio )
'	sqlCF =  "insert into " & tablaCafradas() & "(empresa,usuario,accion,fecha) "
'	sqlCF = sqlCF & "values('" & Session("Usuari_Empresa") & "','" & session("Usuari_Nom") & "',"
'	sqlCF = sqlCF & "'" & accio & "',getdate())"
'	rec sqlCF
end sub

' --- Mira si el ticket es sospechoso ---------------------------------------------------------------------------------------------------
Function EsTicketSospitos ( byval Botiga, byval Num_Tick, byval Data )

	NomTaula = tablaAlertes(Data)
	EsTicketSospitos = 1

	if exists(NomTaula) then

		sqlETS = "Select Count(*) From " & NomTaula & " Where Param1=" & Botiga & " And Param2=" & Num_Tick & " And "
		sqlETS = sqlETS & "Day(Data)=" & day(Data) & " And DATEPART(hh,Data)=" & Hour(Data) & " And "
		sqlETS = sqlETS & "DATEPART(n,Data)=" & Minute(Data) & " And DATEPART(s,Data)=" & Second(Data) & " And "
		sqlETS = sqlETS & "Texte='Ticket Anulat Sospitos '"
		set Rss = rec(sqlETS)
		if not Rss.eof then
			if not isnull(Rss(0)) then
				if Rss(0) > 0 then  EsTicketSospitos = 2
			end if
		end if

		if EsTicketSospitos = 1 then
			sqlETS = "Select Count(*) From " & NomTaula & " Where Param1=" & Botiga & " And Param2=" & Num_Tick & " And "
			sqlETS = sqlETS & "Day(Data)=" & day(Data) & " And DATEPART(hh,Data)=" & Hour(Data) & " And "
			sqlETS = sqlETS & "DATEPART(n,Data)=" & Minute(Data) & " And DATEPART(s,Data)=" & Second(Data) & " And "
			sqlETS = sqlETS & "Texte='Ticket Anulat Poc Sospitos '"
			set Rss = rec(sqlETS)
			if not Rss.eof then
				if not isnull(Rss(0)) then
					if Rss(0) > 0 then  EsTicketSospitos = 3
				end if
			end if
		end if

	end if
end function

' --- Comunicación con TPV mediante pizarra compartida en base de datos -----------------------------------------------------------------
sub MissatgesCalEnviar ( byval Tipus )
	dim t
	t = tablaMissatgesAEnviar()
	rec "Delete " & t & " Where Tipus='" & Tipus & "'"
	if Tipus = "Articles" then
		if QuePucFerGet ( "EnviarArticles" ) = "No" Then exit sub
	end if
	rec "Insert Into " & t & " (Tipus,Param) Values ('" & Tipus & "',' ')"
End Sub

Sub MissatgesCalEnviar2 ( byval Tipus, byval Param )
	dim t
	t = tablaMissatgesAEnviar()
	rec "Delete from " & t & " Where Tipus='" & Tipus & "' and Param = '" & param & "' "
	if Tipus = "Articles" then
		if QuePucFerGet ( "EnviarArticles") = "No" Then exit sub
	end if
	rec "Insert Into " & t & " (Tipus,Param) Values ('" & Tipus & "','" & Param & "')"
End Sub

function QuePucFerGet ( byval QueEs )
	dim t
	t = tablaQueTinc()
	set RsQuePucFer = rec("SELECT QuinEs FROM " & t & " Where QueEs='" & QueEs & "'")
	QuePucFerGet=""
	if not RsQuePucFer.eof then
		if not isnull(RsQuePucFer(0)) then QuePucFerGet = RsQuePucFer(0)
	end if
end function

Sub QuePucFerPut( byval QueEs, byval QuinEs )
	dim t
	t = tablaQueTinc()
	rec "Delete " & t & " Where QueEs='" & QueEs &  "' "
	rec "Insert Into " & t & " (QueEs,QuinEs) Values('" & QueEs & "','" & QuinEs & "') "
	if QueEs ="EnviarArticles" then	MissatgesCalEnviar "Articles"
end sub

function llistatcombo ( grup )
	select case grup
	case "ET"
		set Rs = rec("SELECT * FROM EquipsDeTreball order by defecte")
		llistaequiptreball="<select name='ET' class='txt'  multiple><option value='Tots' selected>Tots</option>"
		while not rs.eof
			llistaequiptreball = llistaequiptreball & "<option  value=""'" & rs("Nom") & "'"" class='txt'>" & rs("Nom") & "</option>"
		rs.movenext
		wend
		llistaequiptreball = llistaequiptreball & "</select>"
		rs.close
		aux=llistaequiptreball
	case "Botigues"
		set Rs = rec("SELECT * FROM Clients order by nom")
		llistabotiga="<select name='Botigues'class='txt'  multiple><option value='Tots' selected  class='txt'>Tots</option>"
		while not rs.eof
			llistabotiga = llistabotiga & "<option value='" & rs("Codi") & "' class='txt'>" & rs("Nom") & "</option>"
		rs.movenext
		wend
		llistabotiga = llistabotiga & "</select>"
		rs.close
		aux=llistabotiga
	case "Dependentes"
		set Rs = rec("SELECT * FROM Dependentes order by nom")
		llistadependenta="<select name='Dependentes' class='txt' multiple><option value='Tots' selected class='txt'>Tots</option>"
		while not rs.eof
			llistadependenta = llistadependenta & "<option value='" & rs("Codi") & "' class='txt'>" & rs("Nom") & "</option>"
		rs.movenext
		wend
		llistadependenta = llistadependenta & "</select>"
		rs.close
		aux=llistadependenta
	end select
	llistatcombo = aux
end Function

sub script ( byval s )
	response.write "<script>" & s & "</script>"
end sub

' Retorna el valor RGB decimal de una cadena con formato RGB hexadecimal
function getRGB ( byval c )
	dim R, G, B
	R = cdbl ( "&H" & left ( c, 2 ) )
	G = cdbl ( "&H" & mid  ( c, 3, 2 ) )
	B = cdbl ( "&H" & right ( c, 2 ) )
	getRGB = rgb ( R, G, B )
end function

' Retorna el valor RGB como un numero entero
function getRGBInt ( byval c )
	getRGBInt = cdbl ( "&H" & c )
end function

function BotigaCodiLlicencia(Codi)
	BotigaCodiLlicencia = codi
   set RsNom = rec ( "Select Codi From " & tablaParamsHw() & " Where Tipus=1 And Valor1=" & Codi )
   if not RsNom.eof then BotigaCodiLlicencia = RsNom(0)
   RsNom.close
end function

'Obtención siguiente número de factura --------------------------------------------------------------------------------------------------------
function getFacNum (empresa)
  fNum = 0
  for i=1 to 12
    d = formatdatetime("1/" & i & "/" & year(now),2)
    if exists (tablaFacturacioData(d)) Then
		set rs = rec ("Select isnull(max(numfactura),'') nf from " & tablaFacturacioIva(d) & " Where EmpresaCodi = " & iif(empresa="",0,empresa) & "  ")
		if Not rs.eof then 
			if rs("nf")<>"" then if rs("nf") > fNum then fNum = rs("nf")
        end if
	end if
'response.write "Select isnull(max(numfactura),'') nf from " & tablaFacturacioIva(d) & " Where EmpresaCodi = " & iif(empresa="",0,empresa) & "  "  	
  next
  fNum = fNum + 1
  getFacNum = fNum
end function

if not PDFPRINTER then

%>

<script>

// --- Obtiene el objeto window de un nombre concreto -----------------------------------------------------------------------------------

function getFrame ( fIni, fName )
	{
	var ret = null;
	if ( fIni.name == fName )
		return fIni;
	else
		for ( var iM=0; iM<fIni.frames.length; iM++ )
			if ( ret == null )
				ret = getFrame ( fIni.frames[iM], fName );
	return ret;
	}

// --- Implementación de la clase Array -------------------------------------------------------------------------------------------------

Array.prototype.indexOf = arrIndexOf;

function arrIndexOf ( v )
	{
	for ( var i=0; i<this.length; i++ )
		if ( this[i] == v )
			return i;
	return -1;
	}

// --- Implementación de la clase String ------------------------------------------------------------------------------------------------

String.prototype.right  = strRight;
String.prototype.left   = strLeft;
String.prototype.change = strChange;
String.prototype.lTrim  = strLTrim;
String.prototype.rTrim  = strRTrim;
String.prototype.trim   = strTrim;

function strRight(n)
	{
	return this.substring(this.length-n);
	}

function strLeft(n)
	{
	return this.substring(0,n);
	}

function strChange(a,b)
	{
	return this.split(a).join(b);
	}

function strLTrim()
	{
	var i   = 0;
	var str = this;
	while ( i<this.length && ( this.charAt(i)==" " || this.charAt(i)=="\t" ) )
		{
		i++;
		str = this.substring(i);
		}
	return str;
	}

function strRTrim()
	{
	var i   = this.length - 1;
	var str = this;
	while ( i>0 && ( this.charAt(i)==" " || this.charAt(i)=="\t" ) )
		{
		str = this.substring(0,i);
		i--;
		}
	return str;
	}

function strTrim()
	{
	return this.lTrim().rTrim();
	}

// --- Implementación de la clase Date --------------------------------------------------------------------------------------------------

Date.prototype.dateAdd = sumaFecha;

function sumaFecha(d)
	{
	//controlamos:
	//* si incrementamos dias y la fecha no aumenta
	//* si decrementamos dias y la fecha no disminuye
	if(d>0 && (new Date(Date.parse(this)+(24*60*60*1000))).getDate()==this.getDate())d++;
	else if(d<0 && (new Date(Date.parse(this)-(24*60*60*1000))).getDate()==this.getDate())d--;
	return new Date(Date.parse(this)+(d*24*60*60*1000));
	}

// --- Formato --------------------------------------------------------------------------------------------------------------------------

//numero,decimales --> ffloat
function ffloat(n,d)
	{

	var n2 = parseInt(n);
	var n3 = Math.pow(10,d);

	n = Math.round((n-n2)*n3).toString();

	if(n.length>d)
		{
		n2 += 1;
		n = n.substring(1);
		}

	for ( var i=n.length; i<d; i++ )
		n = "0"+n;

	return parseFloat(n2+"."+n);

	}

//numero,decimales --> string
function floatStr(n,d)
	{

	var n2="";

	n = ffloat(n,d).toString().split(".");

	if ( n.length == 1 )
		n[1] = "";

	for ( var i=n[1].length; i<d; i++ )
		n[1]+="0";i=0;

	return n.join(".");

	}

<%
	if not isPOPUP then
		if session("portal") <> "RECORDA" and session("portal") <> "ENTRADA" then
%>

// --- Frame de PopUps ------------------------------------------------------------------------------------------------------------------

var popupFrame = getFrame ( top, "popup" );

function viajeEquipo ( mi, art, equ, cli, fec, qd, via, pag, tar )
	{
	popupFrame.viajeEquipo ( mi, art, equ, cli, fec, qd, via, pag, tar );
	}

function llistaArticles ( js, id, fr, btn )
	{
	popupFrame.llistaArticles ( js, id, fr, btn );
	}

function javaCalendar ( btn, hid, fecha, que, ev )
	{
	popupFrame.javaCalendar ( btn, hid, fecha, que, ev );
	}

	
// --- Frame de Datos -------------------------------------------------------------------------------------------------------------------

var dataFrame = getFrame ( top, "data" );

<%
		end if
	end if
%>
	
</script>

<%end if%>