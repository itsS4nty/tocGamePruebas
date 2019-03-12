<%

'********************************* VARIABLES GLOBALS ***************************
OpcioCreada = 0
PLinea = 0
LineaEmphatitzada = -1

'*********************************************************************************
' --- Conexión con la base de datos de HIT ----------------------------------------------------------------------------------------------

sub connectHIT ( )
	dim con
	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	con.Open "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=Hit;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
	Session("Iniciat") = "Si"
	set Session("HitConnection") = con
end sub

function rec ( byval rSql )
	set RsDR = Server.CreateObject("ADODB.Recordset")
	on error resume next
	RsDR.Open rSql, Session("UserConnection")
	if err.Number <> 0 then
		RsDR.Open "Select * From iisErrorCtrl Where id=newid() And id=newid()", Session("HitConnection")
	end if
	set rec = RsDR
end function

' --- Recordset de HIT ------------------------------------------------------------------------------------------------------------------
function recHit ( byval rSql )
	set RsDR = Server.CreateObject("ADODB.Recordset")
	on error resume next
	RsDR.Open rSql, Session("HitConnection")
	set objerr=Server.GetLastError()
	if objerr.Number = 0 then
		RsDR.Open "Select * From web_users Where nom='a' And nom='b'", Session("HitConnection")
	end if
	set recHit = RsDR
end function

function connectUSER ( )
	connectUSER = true
	on error resume next
	if Session("Iniciat") <> "Si" then connectHIT
	connectUSER = connect ( "UserConnection", Session("Usuari_Empresa_Db") )
	Session ( "UsuariLogat" ) = "Si"
	if err.description <> "" then connectUSER = false
	
end function

' --- Conexión con datos de variables de sesión -----------------------------------------------------------------------------------------
function connect ( byval nom, byval db )

	connect = true

	on error resume next

	dim con
	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	con.Open "WSID=USER_" & Session("Usuari_Empresa_Db") & ";UID=" & Session("Usuari_Empresa_db_user") & ";PWD=" & Session("Usuari_Empresa_Db_pass") & ";Database=" & db & ";Server=" & Session("Usuari_Empresa_db_Server") & ";Driver={SQL Server};DSN='';"
	set session ( nom ) = con
	if err.description <> "" then connect = false
end function

function exists ( byval Nom )
	dim con
	exists = false
	on error resume next
	Set con = Server.CreateObject("ADODB.Recordset")
	con.Open "SELECT OBJECT_ID('" & Nom & "') id", Session("UserConnection")
	exists = Not isnull(con("id"))
	con.close
end function

function dataSql(d)
	dataSql = "convert(datetime,'" & right(0 & day(d),2) & "/" & right(0 & month(d),2) & "/" & right(cstr(year(d)),2) & "',3)"
end function

Function Car(ByRef s) 
   Dim P , p1 , p2 , c , Acc , Result ,Le 
   
   Acc = 0
   Result = ""
   Le = Len(s)
   While Le > 0
      c = Left(s, 1)
      Le = Le - 1
      s = Right(s, Le)
      Result = Result & c
      Select Case c
         Case "[": Acc = Acc + 1
         Case "]":
            Acc = Acc - 1
            If Acc <= 0 Then
                If Acc = -1 Then
                   Car = Mid(Result, 2, Len(Result) - 1)
                Else
                   Car = Mid(Result, 2, Len(Result) - 2)
                End If
               Exit Function
            End If
      End Select
   Wend
   Car = ""
   s = ""
End Function

' ***************************Registre Horari

function CascosSinonims ( )
	dim sqlSNI
	CascosSinonims  = "CascosSinonims"
	if not exists ( CascosSinonims ) then
		sqlSNI = "create table " & CascosSinonims & " ( "
		sqlSNI = sqlSNI & "[Id]     [nvarchar](255) NULL CONSTRAINT [DF_CascosSinonims_Id] DEFAULT (newid()), "
		sqlSNI = sqlSNI & "[TmSt]   [datetime]      NULL, "
		sqlSNI = sqlSNI & "[Dije]   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Digo]   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Orden]  [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux1]   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux2] 	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux3] 	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux4] 	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux5] 	[nvarchar](255) NULL "
		sqlSNI = sqlSNI & ") ON [PRIMARY] "
		rec sqlSNI
	end if
end function

function NomTaulaCodiRegistreHorari ( )
	dim sqlSNI
	NomTaulaCodiRegistreHorari = "CodiRegistreHorari"
	if not exists ( NomTaulaCodiRegistreHorari ) then
		sqlSNI = "create table " & NomTaulaCodiRegistreHorari & " ( "
		sqlSNI = sqlSNI & "[Id]   		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[data] 		[datetime] NULL,"
		sqlSNI = sqlSNI & "[CodiB]  	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Producte]  	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Estat] 		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[T1]  		[datetime] NULL,"
		sqlSNI = sqlSNI & "[T2]  		[datetime] NULL,"
		sqlSNI = sqlSNI & "[T3]  		[nvarchar](255) NULL "
		sqlSNI = sqlSNI & ") ON [PRIMARY] "
		rec sqlSNI
	end if
end function

function NomTaulaCajaUsada ( D )
	dim sqlSNI
	NomTaulaCajaUsada = "[CajaUsada_" & year(d) & "-" & month(d) & "]"
	if not exists ( NomTaulaCajaUsada ) then
		sqlSNI = "create table " & NomTaulaCajaUsada & " ( "
		sqlSNI = sqlSNI & "[id]        [nvarchar] (255)NULL Default (NEWID()), "
		sqlSNI = sqlSNI & "[Hora]      [datetime]      NULL Default (GETDATE()), "
		sqlSNI = sqlSNI & "[User]      [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Productes] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Quantitats][nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Hi]        [datetime]      NULL , "
		sqlSNI = sqlSNI & "[Hf]        [datetime]      NULL , "
		sqlSNI = sqlSNI & "[Origen]    [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Estat] 	   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux1] 	   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux2] 	   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux3] 	   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux4] 	   [nvarchar](255) NULL "
		sqlSNI = sqlSNI & ") ON [PRIMARY] "
		rec sqlSNI
	end if
end function

function NomTaulaProduccioEscandall( )
	dim sqlSNI
	NomTaulaProduccioEscandall = "ProduccioEscandall"
	if not exists ( NomTaulaProduccioEscandall ) then
		sqlSNI = "create table " & NomTaulaProduccioEscandall & " ( "
		sqlSNI = sqlSNI & "[Id]   		   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[data] 		   [datetime] NULL,"
		sqlSNI = sqlSNI & "[IdProduccio]   [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Producte]      [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[MateriaPrima]  [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[MateriaPrimaCb][nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[IdRecepcio]    [nvarchar](255) NULL "
		sqlSNI = sqlSNI & ") ON [PRIMARY] "
		rec sqlSNI
	end if
end function

function DonamCodiRegistreHorari(Article,Data)
	dim Sql

	set Rs4 = Rec("Select max(CodiB) Cb from " &  NomTaulaCodiRegistreHorari() & " "  )
	Cb = 299000000000
	if not Rs4.eof then if not isnull(Rs4("Cb")) then  Cb = cdbl(Rs4("Cb")) + 1 			

	Rec "Insert into " &  NomTaulaCodiRegistreHorari() & " ([Id],[data],[CodiB],[Producte],[Estat],[T1],[T2],[T3]) Values (newid(),getdate(),'" & Cb & "','" & Article & "','Impres','','','') "  
	DonamCodiRegistreHorari =  Cb
end function 


'***************************
function P_linea(St)
	if St = "ECHO" then 
		p_Linea = session("p_Linea" & PLinea) 
	else
		p_Linea = "Chr(27)E" 
		if session("UltimaOpcion")  <> "" and PLinea = 3 then  
			p_Linea = p_Linea & "Chr(27)[7m" 
			p_Linea = p_Linea & left(session("UltimaOpcion_Menu_Opcio" & session("UltimaOpcion_Menu_Index")) & "                 ",16) 
			p_Linea = p_Linea & "Chr(27)[0m" 
		else
			p_Linea = p_Linea & left(St,16) 
		end if		
	end if	
	session("p_Linea" & PLinea) = p_Linea
	PLinea = PLinea + 1
end function

sub Debuga (St)
	if not (debu="") then response.write St & "<Br>"
end sub

function P_Fi()
	P_Fi = "Chr(13)"
end function

function NomTaulaccPistolat ( )
	NomTaulaccPistolat = "ccPistolat"
	if not exists (  NomTaulaccPistolat ) then
		dim sqlFC
		sql = "Create Table " & NomTaulaccPistolat & " ("
		sql = sql & " [id]       [nvarchar] (255)   NULL Default (NEWID()),"
		sql = sql & " [Hora]     [datetime]         NULL,"
		sql = sql & " [Lectura]  [nvarchar] (255)   NULL,"
		sql = sql & " [Aux1]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux2]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux3]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux4]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux5]     [nvarchar] (255)   NULL"
		sql = sql & " ) ON [PRIMARY]"
		rec sql
	end if
end function

function NomTaulaccPendienteRecepcion ( )
	NomTaulaccPendienteRecepcion = "ccPendienteRecepcion"
	if not exists (  NomTaulaccPendienteRecepcion ) then
		dim sqlFC
		sql = "Create Table " & NomTaulaccPendienteRecepcion & " ("
		sql = sql & " [id]       [nvarchar] (255)   NULL Default (NEWID()),"
		sql = sql & " [Hora]     [datetime]         NULL,"
		sql = sql & " [Lectura]  [nvarchar] (255)   NULL,"
		sql = sql & " [CodiProd]     [nvarchar] (255)   NULL,"
		sql = sql & " [FechaCaducidad]     [nvarchar] (255)   NULL,"
		sql = sql & " [Peso]     [nvarchar] (255)   NULL,"
		sql = sql & " [Lote]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux1]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux2]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux3]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux4]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux5]     [nvarchar] (255)   NULL,"
		sql = sql & " [Aux6]     [nvarchar] (255)   NULL "
		sql = sql & " ) ON [PRIMARY]"
		rec sql
	end if
end function

function DesEncode(Str)
	DesEncode = Str
'response.write DesEncode & "<Br>"
    While InStr(DesEncode, "Chr(") > 0
        P = InStr(DesEncode, "Chr(")
        P2 = InStr(P + 1, DesEncode, ")")
        DesEncode = Left(DesEncode, P - 1) & Chr(Mid(DesEncode, P + 4, P2 - P - 4)) & Right(DesEncode, Len(DesEncode) - P2)
     Wend
'response.write DesEncode & "<Br>"
end function

' --- Pasa de minutos a horas -----------------------------------------------------------------------------------------------------------
function Mod60DosD ( byval m )
	Mod60DosD = right("00" & m mod 60,2) 
end function

function TempsPassatEntre(D1,D2)
	if d1="" then d1 = now
	if d2="" then d2 = now
	TempsPassatEntre = Mod60DosD(datediff("h",D1,D2)) & ":" & Mod60DosD(datediff("n",D1,D2)) & ":" & Mod60DosD(datediff("s",D1,D2))
end function 

' ***************************** FUNCIONS MENUS PISTOLA **********************
sub PosaMenuTotOk()
	session("NextUltimaOpcion_Menu_Index")	 = 0
	session("NextUltimaOpcion_Menu_OpcioCreadaMaximBicoMin") = 0
 	session("NextUltimaOpcion_Menu_OpcioCreadaMaximBicoMax") = session("NextUltimaOpcion_Menu_OpcioCreadaMaxim")

	Lin3 = session("NextUltimaOpcion_Menu_Opcio" & session("NextUltimaOpcion_Menu_Index"))
end sub

sub PosaMenu (TitolMenu)
	session("NextUltimaOpcion") = TitolMenu
	OpcioCreada = 0
end sub
		
sub PosaMenuOpcio(Opcio)
	session("NextUltimaOpcion_Menu_Opcio" & OpcioCreada)  = Opcio
	session("NextUltimaOpcion_Menu_OpcioCreadaMaxim")  = OpcioCreada
	OpcioCreada = OpcioCreada + 1
	session("NextUltimaOpcion_Menu_Opcio" & OpcioCreada)  = ""
end sub

sub MenuAsignaNext()
	session("UltimaOpcion")  = session("NextUltimaOpcion") 
	session("UltimaOpcion_Menu_Index")  = session("NextUltimaOpcion_Menu_Index") 
	session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMin")  = session("NextUltimaOpcion_Menu_OpcioCreadaMaximBicoMin") 
	session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMax")  = session("NextUltimaOpcion_Menu_OpcioCreadaMaximBicoMax") 
	session("UltimaOpcion_Menu_OpcioCreadaMaxim")  = session("NextUltimaOpcion_Menu_OpcioCreadaMaxim") 
	for OpcioCreada = 0 to  session("UltimaOpcion_Menu_OpcioCreadaMaxim") 
		session("UltimaOpcion_Menu_Opcio" & OpcioCreada)  = session("NextUltimaOpcion_Menu_Opcio" & OpcioCreada)
	next
end sub


function OpcioMenuActual(Op)
	OpcioMenuActual = false 
	if Op = session("UltimaOpcion_Menu_Opcio" & session("UltimaOpcion_Menu_Index"))   then OpcioMenuActual = true
end function 


sub MenuRepeteix()
	session("NextUltimaOpcion")  = session("UltimaOpcion") 
	session("NextUltimaOpcion_Menu_Index")  = session("UltimaOpcion_Menu_Index") 
	session("NextUltimaOpcion_Menu_OpcioCreadaMaximBicoMin")  = session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMin") 
	session("NextUltimaOpcion_Menu_OpcioCreadaMaximBicoMax")  = session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMax") 
	session("NextUltimaOpcion_Menu_OpcioCreadaMaxim")  = session("UltimaOpcion_Menu_OpcioCreadaMaxim") 
	for OpcioCreada = 0 to  session("UltimaOpcion_Menu_OpcioCreadaMaxim") 
		session("NextUltimaOpcion_Menu_Opcio" & OpcioCreada)  = session("UltimaOpcion_Menu_Opcio" & OpcioCreada)
	next
end sub


sub EjecutaUltimaOpcionMenu(Lectura)
	if session("UltimaOpcion") = "" then  exit sub
	if not (Debu="") then response.write "UltimaOpcion 	-" & session("UltimaOpcion") & "-<Br>"	  
	
	if Lectura = "<" or Lectura = ">"  then 
		lin0 = "ECHO" 
		lin1 = "ECHO" 
		lin2 = "ECHO" 
		if session("UltimaOpcion_Menu_OpcioCreadaMaxim") < 10 or (session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMax") - session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMin")) < 10 then
			if Lectura = "<" then 
				session("UltimaOpcion_Menu_Index") = session("UltimaOpcion_Menu_Index") - 1
				if session("UltimaOpcion_Menu_Index") < 0 then session("UltimaOpcion_Menu_Index") = session("UltimaOpcion_Menu_OpcioCreadaMaxim")
			end if
			if Lectura = ">" then 
				session("UltimaOpcion_Menu_Index") = session("UltimaOpcion_Menu_Index") + 1
				if session("UltimaOpcion_Menu_Index") > session("UltimaOpcion_Menu_OpcioCreadaMaxim") then  session("UltimaOpcion_Menu_Index") = 0
			end if
		else
			if Lectura = "<" then 
				k = session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMin") + int((  session("UltimaOpcion_Menu_Index") - session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMin")) /2)
				session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMax") =  session("UltimaOpcion_Menu_Index")
				session("UltimaOpcion_Menu_Index") = k
			end if
			if Lectura = ">" then 
				k = session("UltimaOpcion_Menu_Index")  + int((session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMax") -  session("UltimaOpcion_Menu_Index") )/2)
				session("UltimaOpcion_Menu_OpcioCreadaMaximBicoMin") =  session("UltimaOpcion_Menu_Index")
				session("UltimaOpcion_Menu_Index") = k
			end if
		end if
		if session("UltimaOpcion_Menu_Index") < 0 then session("UltimaOpcion_Menu_Index") = session("UltimaOpcion_Menu_OpcioCreadaMaxim")
		if session("UltimaOpcion_Menu_Index") > session("UltimaOpcion_Menu_OpcioCreadaMaxim") then  session("UltimaOpcion_Menu_Index") = 0
		if session("UltimaOpcion_Menu_Opcio" & session("UltimaOpcion_Menu_Index"))  = ""  then  session("UltimaOpcion_Menu_Index") = 0
		MenuRepeteix
	end if
	
	if Lectura = "="  then 	ExecutaOpcioMenu
	
end sub

function TaulaFax2 ( )
	TaulaFax2 = "FaxVersio2"
	if not exists ( TaulaFax2 ) then
		dim sqlFC
		sql = "Create Table " & TaulaFax2 & " ("
		sql = sql & " [id] 			[nvarchar] (255)   NULL Default (NEWID()),"
		sql = sql & " [Tipus]  		[nvarchar] (255)   NULL,"
		sql = sql & " [Data]   		[datetime]         NULL,"
		sql = sql & " [Estat]  		[nvarchar] (255)   NULL,"
		sql = sql & " [Receptor]	[nvarchar] (255)   NULL,"
		sql = sql & " [IdDesti] 	[nvarchar] (255)   NULL,"
		sql = sql & " [Variables]  	[nvarchar] (255)   NULL"
		sql = sql & " ) ON [PRIMARY]"
		rec sql
	end if
end function


'***********************************************************************************
 
 %>
