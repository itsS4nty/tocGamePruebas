<SCRIPT LANGUAGE=VBScript RUNAT=Server>

function Sec_Server_Name ()
	Sec_Server_Name = ucase ( Request.ServerVariables("SERVER_NAME") )
end function

Function Sec_Hit_User()
	if Sec_Server_Name() = "NEPTU" then
		Sec_Hit_User = "sa"
	else
		Sec_Hit_User = "SQL_Admin"
	end if
end function

Function Sec_Hit_Pswd()
	if Sec_Server_Name() = "NEPTU" then
		Sec_Hit_Pswd = "adminhit"
	else
		Sec_Hit_Pswd = "sql_admin4071"
	end if
end function

Function Sec_Hit_Server()
	if Sec_Server_Name() = "NEPTU" then
		Sec_Hit_Server = "neptu"
	else
		Sec_Hit_Server = "SERVERCLOUD"
	end if
end function

Function Sec_Super_Pswd()
   Sec_Super_Pswd = "vitrium21"
end function

</Script>

<%

function existeEmp ( byval nom )
	dim sqlEE
	sqlEE = "select id from cfg_empresses where upper(nom)='" & ucase(nom) & "'"
	Set rsEE = Server.CreateObject("ADODB.Recordset")
	rsEE.Open sqlEE, session("CDPConn")
	existeEmp = not rsEE.eof
end function

%>