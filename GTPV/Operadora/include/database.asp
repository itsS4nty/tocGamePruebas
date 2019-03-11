<%
' FUNCIONES PARA TRABAJAR CON LAS BASES DE DATOS

' --- Mira si existe la tabla -----------------------------------------------------------------------------------------------------------
function exists ( byval Nom )
	dim con
	exists = false
	on error resume next
	Set con = Server.CreateObject("ADODB.Recordset")
	con.Open "SELECT OBJECT_ID('" & Nom & "') id", Session("UserConnection")
	exists = Not isnull(con("id"))
	con.close
end function

function existsHit ( byval Nom )
	dim con
	existsHit = false
	on error resume next
	Set con = Server.CreateObject("ADODB.Recordset")
	con.Open "SELECT OBJECT_ID('" & Nom & "') id", Session("HitConnection")
	existsHit = Not isnull(con("id"))
	con.close
end function

function existsField (byval Taula, byval Columna)
	dim con
	existsField = false
	on error resume next
	Set con = Server.CreateObject("ADODB.Recordset")
	con.Open "SELECT Name FROM SysObjects O INNER JOIN SysColumns C ON O.ID=C.ID WHERE ObjectProperty(O.ID,'IsUserTable')=1 AND O.Name='" & Taula & "' AND C.Name='" & Columna &  "'", Session("UserConnection")
	existsField = Not isnull(con("Name"))
	con.close

'select * from INFORMATION_SCHEMA.COLUMNS 
'where TABLE_NAME='tablename' 
'and COLUMN_NAME='columname' 


end function


' *** CONEXIONES ************************************************************************************************************************

' --- Conexión con la base de datos master ----------------------------------------------------------------------------------------------
sub connectMaster ( )
	dim con

	if  not Session("conMaster") = "" then  
		if Session("conMaster").State = 1 then
			'debuga "NO CalConectar <Rb>" 
			exit sub 
		end if	
	end if
	
	Set con = Server.CreateObject ( "ADODB.Connection" )
	con.ConnectionTimeout = 1500
	session ( "conMasterOpen" ) = "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=master;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
	con.Open session ( "conMasterOpen" )
	set session ( "conMaster" ) = con
end sub

' --- Conexión con la base de datos de HIT ----------------------------------------------------------------------------------------------
sub connectHIT ( )
	dim con
	
	if  not Session("HitConnection") = "" then  
		if Session("HitConnection").State = 1 then
			'debuga "NO CalConectar <Rb>" 
			exit sub 
		end if	
	end if
	
	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	Session("HitConnectionOpen") = "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=Hit;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
	con.Open Session("HitConnectionOpen")
	Session("Iniciat") = "Si"
	set Session("HitConnection") = con
	
end sub

' --- Conexión con la base de datos de CRM ----------------------------------------------------------------------------------------------
sub connectCRM ( )
	dim con
	
	if  not Session("CrmConnection") = "" then  
		if Session("CrmConnection").State = 1 then
			'debuga "NO CalConectar <Rb>" 
			exit sub 
		end if	
	end if
	
	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	Session("CrmConnectionOpen") = "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=CRM;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
	con.Open Session("CrmConnectionOpen")
	Session("Iniciat") = "Si"
	set Session("CrmConnection") = con
end sub

' --- Conexión con la base de datos de residencias --------------------------------------------------------------------------------------
sub connectRES ( )
	dim con

	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	con.Open "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=Res;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
	Session("Iniciat") = "Si"
	set Session("ResConnection") = con
end sub

' --- Conexión con la base de datos de webkiosk -----------------------------------------------------------------------------------------
sub connectWK ( )
	dim con
	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	con.Open "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=WebKiosk;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
	Session("Iniciat") = "Si"
	set Session("WkConnection") = con
end sub

' --- Conexión con la base de datos del usuario -----------------------------------------------------------------------------------------
function connectUSER ( )
	connectUSER = true
	on error resume next
	if Session("Iniciat") <> "Si" then connectHIT

	if Session("Usuari_Empresa_Db")        = "" and Session("db")       <> "" then Session("Usuari_Empresa_Db")        = session("db")
	if Session("Usuari_Empresa_Db_User")   = "" and Session("dbUser")   <> "" then Session("Usuari_Empresa_Db_User")   = session("dbUser")
	if Session("Usuari_Empresa_Db_Pass")   = "" and Session("dbPass")   <> "" then Session("Usuari_Empresa_Db_Pass")   = session("dbPass")
	if Session("Usuari_Empresa_Db_Server") = "" and Session("dbSvr")    <> "" then Session("Usuari_Empresa_Db_Server") = session("dbSvr")
	if Session("Usuari_Empresa_Db_Server") = "" and Session("dbServer") <> "" then Session("Usuari_Empresa_Db_Server") = session("dbServer")

	connectUSER = connect ( "UserConnection", Session("Usuari_Empresa_Db") )

	session("Data_BKP_Servit") = ""
	if exists ("historicsDB") then
		set rs = rec("select max(dataBkp) dataBkp from historicsDB where concepte='SERVIT'")
		if not rs.eof then session("Data_BKP_Servit") = rs("dataBkp")
	end if

	session("Data_BKP_Mensuals") = ""
	if exists ("historicsDB") then
		set rs = rec("select max(dataBkp) dataBkp from historicsDB where concepte='MENSUAL'")
		if not rs.eof then session("Data_BKP_Mensuals") = rs("dataBkp")
	end if
	
	Session ( "UsuariLogat" ) = "Si"

	if exists ( "dependentes" ) then
		session ( "Usuari_Donde" ) = "FORN"
	elseif exists ( "usuarios" ) then
		session ( "Usuari_Donde" ) = "GR"
	elseif exists ( "wkConductor" ) then
		session ( "Usuari_Donde" ) = "WK"
	end if

	if session ( "Usuari_Donde" ) = "GR" then session ( "Usuari_DondeInicial" ) = "GR"

	if err.description <> "" then connectUSER = false

end function

' --- Conexión con datos de variables de sesión -----------------------------------------------------------------------------------------
 
if session("TrazaConectada_UserConnection") = "Si" then
		Reconecta = true
		if isobject(Session("UserConnection")) then if Session("UserConnection").State = 1 then Reconecta =false
		if Reconecta then 
			Session("Usuari_Empresa_Db")        = session("TrazaConectada_UserConnection_Usuari_Empresa_Db") 
			Session("Usuari_Empresa_db_user")   = session("TrazaConectada_UserConnection_Usuari_Empresa_db_user") 
			Session("Usuari_Empresa_Db_pass")   = session("TrazaConectada_UserConnection_Usuari_Empresa_Db_pass") 
			Session("Usuari_Empresa_db_Server") = session("TrazaConectada_UserConnection_Usuari_Empresa_db_Server") 
			connect "UserConnection", session("TrazaConectada_UserConnection_db") 
		end if	
end if

function connect ( byval nom, byval db )
	connect = true
	on error resume next

	dim con
	Set con = Server.CreateObject("ADODB.Connection")
	con.ConnectionTimeout = 1500
	
	'session ( nom & "Open" ) = "WSID=USER_" & Session("Usuari_Empresa_Db") & "$" & session("Usuari_Nom") & ";UID=" & Session("Usuari_Empresa_db_user") & ";PWD=" & Session("Usuari_Empresa_Db_pass") & ";Database=" & db & ";Server=" & Session("Usuari_Empresa_db_Server") & ";Driver={SQL Server};DSN='';"
	session ( nom & "Open" ) = "WSID=USER_" & session("Usuari_Nom") & ";UID=" & Session("Usuari_Empresa_db_user") & ";PWD=" & Session("Usuari_Empresa_Db_pass") & ";Database=" & db & ";Server=" & Session("Usuari_Empresa_db_Server") & ";Driver={SQL Server};DSN='';"	
	con.Open session ( nom & "Open" )
	set session ( nom ) = con

	if err.description <> "" then connect = false
	session("TrazaConectada_" & nom) = ""
	if connect then
		session("TrazaConectada_" & nom) = "Si"
		session("TrazaConectada_" & nom & "_Usuari_Empresa_Db") = Session("Usuari_Empresa_Db")
		session("TrazaConectada_" & nom & "_Usuari_Empresa_db_user") = Session("Usuari_Empresa_db_user")
		session("TrazaConectada_" & nom & "_Usuari_Empresa_Db_pass") = Session("Usuari_Empresa_Db_pass")
		session("TrazaConectada_" & nom & "_db") = db
		session("TrazaConectada_" & nom & "_Usuari_Empresa_db_Server") = Session("Usuari_Empresa_db_Server")
	end if

end function

' *** RECORDSETS ************************************************************************************************************************

' --- Recordset de la db master ---------------------------------------------------------------------------------------------------------
sub recMaster ( byval Sql )
	dim ComMaster
	Set ComMaster = Server.CreateObject ( "ADODB.Command" )
	ComMaster.ActiveConnection = session ( "conMaster" )
	ComMaster.CommandText      = Sql
	ComMaster.CommandTimeout   = 0
	ComMaster.Execute
	if ComMaster.State <> 0 then  response.write "Problema : " &  Sql  & "<Br>"
	response.flush
end sub

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

' --- Recordset de RES ------------------------------------------------------------------------------------------------------------------
function recRes ( byval rSql )
	set RsDR = Server.CreateObject("ADODB.Recordset")
	on error resume next
	RsDR.Open rSql, Session("ResConnection")
	set objerr=Server.GetLastError()
	if objerr.Number = 0 then
		RsDR.Open "Select * From empresas Where nombre='a' And nombre='b'", Session("ResConnection")
	end if
	set recRes = RsDR
end function

' --- Recordset de WEBKIOSK -------------------------------------------------------------------------------------------------------------
function recWk ( byval rSql )
	set RsDR = Server.CreateObject("ADODB.Recordset")
	on error resume next
	RsDR.Open rSql, Session("WkConnection")
	set objerr=Server.GetLastError()
	if objerr.Number = 0 then
		RsDR.Open "Select * From WebKiosk Where db='a' And db='b'", Session("WkConnection")
	end if
	set recWk = RsDR
end function

' --- Recordset del usuario -------------------------------------------------------------------------------------------------------------
function rec ( byval rSql )
	set RsDR = Server.CreateObject("ADODB.Recordset")
	on error resume next

	if session("portal") = "CRM" then
		if not Session("CrmConnection").state="1" then connectCRM
		RsDR.Open rSql, Session("CrmConnection")
	else
		if not Session("UserConnection").state="1" then connectUSER
		RsDR.Open rSql, Session("UserConnection")
	end if

	if err.Number <> 0 then
		RsDR.Open "Select * From iisErrorCtrl Where id=newid() And id=newid()", Session("HitConnection")
	end if
	set rec = RsDR
end function

' --- Recordset del usuario modificable -------------------------------------------------------------------------------------------------
function recMod ( byval rSql )
	set RsDR = Server.CreateObject("ADODB.Recordset")
	on error resume next
	RsDR.Open rSql, Session("UserConnection"),3,3
	set objerr=Server.GetLastError()
	if objerr.Number = 0 then
		RsDR.Open "Select * From iisErrorCtrl Where id=newid() And id=newid()", Session("HitConnection"),3,3
	end if
	set recMod = RsDR
end function

%>
