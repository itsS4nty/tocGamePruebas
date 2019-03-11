<%

dim FS			' FileSystemObject
dim PDF			' Persist PDF Object
dim DOC()		' Documentos PDF
dim cDOC		' Páginas

dim VERDANA		' Fuente regular
dim VERDANAB	' Fuente negrita
dim VERDANAI	' Fuente cursiva

dim ARIAL		' Fuente regular
dim ARIALB		' Fuente negrita
dim ARIALI		' Fuente cursiva

dim COURIER		' Fuente regular
dim COURIERB	' Fuente negrita
dim COURIERI	' Fuente cursiva

cDOC = 0

' Crea los objetos necesarios para trabajar con PDF's
sub createPDFObject ( )
	set FS  = Server.CreateObject("Scripting.FileSystemObject")
	Set PDF = Server.CreateObject("Persits.Pdf")
end sub

'Carga los archivos de fuente TTF
function getPDFFonts ( font )
	set getPDFFonts  = DOC(cDOC).Fonts.LoadFromFile ( FS.GetSpecialFolder(0) & "/fonts/" & font )
end function

'Nueva página en el documento actual:
'	tit ---> Título
'	dir ---> Dirección de la página:
'		V:    Vertical en blanco
'		H:    Horizontal en blanco
'		NET:  NET.pdf   ( Pla de neteja i desinfecció )
'		CLOR: CLOR.pdf  ( Pla de control de la potabilitat de l'aigua )
'		BONES: BONES.PDF (Pla de Bones Pràctiques)
'		TICK: Ticket impresora USB
function getNewPage ( byval tit, byval dir )

	redim preserve DOC(cDOC)

	if len(dir) = 1 then

		set DOC(cDOC) = PDF.CreateDocument
		set retP = DOC(cDOC).Pages.Add ( iif(dir="V",595,841), iif(dir="V",841,595) )

	elseif dir = "TICK" then

		set DOC(cDOC) = PDF.CreateDocument
		set retP = DOC(cDOC).Pages.Add ( 209, 320 )

	else

		set DOC(cDOC) = PDF.OpenDocument ( Server.MapPath ( ROOTFORN & "file/" & dir & ".pdf" ) )
		set retP = DOC(cDOC).Pages(1)

	end if

	' Fuentes
	set VERDANA  = getPDFFonts ( "verdana.ttf"  )
	set VERDANAB = getPDFFonts ( "verdanab.ttf" )
	set VERDANAI = getPDFFonts ( "verdanai.ttf" )

	set ARIAL    = getPDFFonts ( "arial.ttf"   )
	set ARIALB   = getPDFFonts ( "arialbd.ttf" )
	set ARIALI   = getPDFFonts ( "ariali.ttf"  )

	set COURIER  = getPDFFonts ( "cour.ttf"    )
	set COURIERB = getPDFFonts ( "courbd.ttf"  )
	set COURIERI = getPDFFonts ( "couri.ttf"   )

	DOC(cDOC).Title = tit
	DOC(cDOC).Creator = "HIT Systems"

	retP.ResetCoordinates
	cDOC = cDOC + 1
	set getNewPage = retP

end function

' Crea una tabla en el documento
'	w: ancho
'	h: alto
'	r: filas
'	c: columnas
function createPDFTable ( byval w, byval h, byval r, byval c )
	Set createPDFTable = createPDFTableB ( w, h, r, c, 0, "000000", 0, "000000" )
end function

' Crea una tabla con bordes en el documento y espacios
'	w: ancho		b:   borde
'	h: alto			bc:  color borde
'	r: filas		cb:  borde celda
'	c: columnas		cbc: color borde celda
function createPDFTableB ( byval w, byval h, byval r, byval c, byval b, byval bc, byval cb, byval cbc )
	Set createPDFTableB = createPDFTableC ( w, h, r, c, b, bc, cb, cbc, 0, 0 )
end function

' Crea una tabla con bordes en el documento y espacios
'	w: ancho		b:   borde				cp: cellpadding
'	h: alto			bc:  color borde		cs: cellspacing
'	r: filas		cb:  borde celda
'	c: columnas		cbc: color borde celda
function createPDFTableC ( byval w, byval h, byval r, byval c, byval b, byval bc, byval cb, byval cbc, byval cp, byval cs )
	tCode = "width=" & w & ";height=" & h & ";rows=" & r & ";cols=" & c & ";cellpadding=" & cp & ";cellspacing=" & cs & ";"
	tCode = tCode & "border=" & b & ";bordercolor=&H" & bc & ";cellborder=" & cb & ";cellbordercolor=&H" & cbc & ";"
	Set createPDFTableC = DOC(ubound(DOC)).CreateTable ( tCode )
end function

' Obtiene una imagen
function openPDFImage ( byval id, byval donde )
	if donde = "FILE" then
		set openPDFImage = DOC(ubound(DOC)).OpenImage ( res )
	else
		set rsFot = rec("select archivo from archivo where id='" & id & "'")
		if not rsFot.eof then
			set openPDFImage = DOC(ubound(DOC)).OpenImageBinary ( rsFot("archivo").Value )
		else
			set openPDFImage = DOC(ubound(DOC)).OpenImage ( Server.MapPath(IMGSFORN & "NoFoto.jpg") )
		end if
	end if
end function

' Muestra el PDF en pantalla
sub printPDF ( )
	printPDFn "nuevo"
end sub

' Muestra el PDF en pantalla y le asigna un nombre
sub printPDFn ( byval nombre )

	Set FINAL = PDF.OpenDocumentBinary( DOC(0).SaveToMemory )
	if ubound(DOC) > 0 then
		for i=1 to ubound(DOC)
			Set aux = PDF.OpenDocumentBinary( DOC(i).SaveToMemory )
			FINAL.AppendDocument aux
		next
	end if

	Response.ContentType = "application/pdf"
	response.addHeader "Content-Disposition","filename=" & nombre & ".pdf"
	Response.BinaryWrite FINAL.SaveToMemory()

end sub

' Guarda el PDF en la base de datos
function savePDF ( byval name, byval title )

	dim rs
	dim idF

	Set FINAL = PDF.OpenDocumentBinary( DOC(0).SaveToMemory )
	if ubound(DOC) > 0 then
		for i=1 to ubound(DOC)
			Set aux = PDF.OpenDocumentBinary( DOC(i).SaveToMemory )
			FINAL.AppendDocument aux
		next
	end if

	set rs = rec("select newid() i")
	idF = rs("i")

	set rs = recMod ( "select * from " & tablaArchivo() & " where fecha=(select max(fecha) from " & tablaArchivo() & ")" )
	rs.AddNew

	if name = "" then name = left ( change ( change ( change ( idF, "-", "" ), "{", "" ), "}", "" ), 20 )

	rs("id").value          = idF
	rs("nombre").value      = name
	rs("extension").value   = "PDF"
	rs("descripcion").value = title
	rs("mime").value        = "application/pdf"
	rs("propietario").value = session("Usuari_Nom")
	rs("archivo").value     = FINAL.SaveToMemory()
	rs("fecha").value       = now
	rs("tmp").value         = 1

	rs.Update
	rs.close

	savePDF = idF

end function

sub getAsistidos ( byref a, byval ini , byval est)
    if est="VIGENTE" then
		sql = "select residente as id from librosregistro where libro='RESIDENCIA ASISTIDA' and estado='VIGENTE' order by registro	"
	else
		sql = "select id from librosregistro where libro='RESIDENCIA ASISTIDA' order by registro"
	end if
	set rs = rec(sql)
	while not rs.eof
		redim preserve ids(ini)
		a(ini) = rs("id")
		ini = ini + 1
		rs.movenext
	wend
end sub

sub getTutelados(byref a, byval ini, byval est)
    if est="VIGENTE" then
		sql = "select residente as id from librosregistro where libro='CENTRO DE DÍA' and estado='VIGENTE' order by registro"
	else
		sql = "select id from librosregistro where libro='CENTRO DE DÍA' order by registro"
	end if
	set rs = rec(sql)
	while not rs.eof
		redim preserve ids(ini)
		a(ini) = rs("id")
		ini = ini + 1
		rs.movenext
	wend
end sub

sub getHogar(byref a,byval ini, byval est)
    if est="VIGENTE" then
		sql = "select residente as id from librosregistro where libro='HOGAR RESIDENCIAL' and estado='VIGENTE' order by registro"
	else
		sql = "select id from librosregistro where libro='HOGAR RESIDENCIAL' order by registro"
	end if
	set rs = rec(sql)
	while not rs.eof
		redim preserve ids(ini)
		a(ini) = rs("id")
		ini = ini + 1
		rs.movenext
	wend
end sub

function buscaValor(n,e)
	buscaValor = ""
	if e(0)<> "VACIO" then
		for i=0 to ubound(e)
			if split(e(i),"=")(0) = n then
				buscaValor = split(e(i),"=")(1)
				exit function
			end if
		next
	end if
end function

sub linea ( byref pagina, byval x0, byval y0, byval x1, byval y1, byval lw, byval c )
	if c <> "" then c = "; color=&H" & c
	with pagina.Canvas
		.SetParams "LineWidth=" & lw & c
		.MoveTo x0,y0
		.LineTo x1,y1
		.Stroke
	end with
end sub

sub lineaDiscontinua ( byref pagina, byval x0, byval y0, byval x1, byval y1, byval lw, byval c )
	if c <> "" then c = "; color=&H" & c
	with pagina.Canvas
		.SaveState
		.SetParams "Dash1=3; DashPhase=0; LineWidth=" & lw & c
		.MoveTo x0,y0
		.LineTo x1,y1
		.Stroke
		.RestoreState
	end with
end sub

sub cuadro ( byref pagina, byval x, byval y, byval w, byval h, byval lw, byval c )
	if c <> "" then c = "; color=&H" & c
	with pagina.Canvas
		.SetParams "LineWidth=" & lw & c
		.MoveTo x,y
		.LineTo x+w,y
		.LineTo x+w,y+h
		.LineTo x,y+h
		.LineTo x,y
		.Stroke
	end with
end sub

sub pdfCheck ( byref pagina, byval x, byval y, byval c )
	cuadro pagina, x, y, 7, 7, 1, "000000"
	if c then
		linea pagina, x+1, y+1, x+6, y+6, 1, "000000"
		linea pagina, x+6, y+1, x+1, y+6, 1, "000000"
	end if
end sub

sub getIdsArray ( byref a, byref i, byval r , byval est)
	select case i
		case "ALL"
			getAsistidos a, 0, est
			getTutelados a, ubound(a)+1, est
			getHogar     a, ubound(a)+1, est
		case "ALLa"
			getAsistidos a, 0, est
		case "ALLt"
			getTutelados a, 0, est
		case "ALLh"
			getHogar a, 0, est
		case ""
			set rsIds = rec("select id from residentes where registro = " & r)
			i = rsIds("id")
			a(0) = id
	end select
end sub
%>