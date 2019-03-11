<%@LANGUAGE="VBSCRIPT"%>

<!-- #include virtual="/Facturacion/include/global.asp" -->
<!-- #include virtual="/Facturacion/include/recuperaSesion.asp" -->

<%

on error resume next

dim hamster
dim indexSearch
dim fpData
recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'i******************')"

'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 1')"
set hamster     = Server.CreateObject ( "NBioBSPCOM.NBioBSP" )
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 2')"
set indexSearch = hamster.IndexSearch
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 3')"
set fpData      = hamster.FPData
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 4')"

fir     = request.item ( "fir"     )
fir2    = request.item ( "fir2"    )
usuario = request.item ( "usuario" )
modo    = request.item ( "modo"    )
uId     = request.item ( "uId"     )
serv    = request.Item ( "serv"    )
loca    = request.Item ( "loc"     )
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 5')"

dim idArray()
dim uIdArray()
dim firArray()

'-----------------------------------------------------------------------------------------------------

' Errores
Const NBioAPIERROR_NONE        =    0
Const NBioAPIERROR_USER_CANCEL =  513
Const NBioBSPCOM_ERROR_UNKNOWN = 1286

' Niveles de seguridad
Const NBioAPI_FIR_SECURITY_LEVEL_LOWEST       = 1
Const NBioAPI_FIR_SECURITY_LEVEL_LOWER        = 2
Const NBioAPI_FIR_SECURITY_LEVEL_LOW          = 3
Const NBioAPI_FIR_SECURITY_LEVEL_BELOW_NORMAL = 4
Const NBioAPI_FIR_SECURITY_LEVEL_NORMAL       = 5
Const NBioAPI_FIR_SECURITY_LEVEL_ABOVE_NORMAL = 6
Const NBioAPI_FIR_SECURITY_LEVEL_HIGH         = 7
Const NBioAPI_FIR_SECURITY_LEVEL_HIGHER       = 8
Const NBioAPI_FIR_SECURITY_LEVEL_HIGHEST      = 9

Const NBioAPI_FIR_PURPOSE_VERIFY                         =  1
Const NBioAPI_FIR_PURPOSE_IDENTIFY                       =  2
Const NBioAPI_FIR_PURPOSE_ENROLL                         =  3
Const NBioAPI_FIR_PURPOSE_ENROLL_FOR_VERIFICATION_ONLY   =  4
Const NBioAPI_FIR_PURPOSE_ENROLL_FOR_IDENTIFICATION_ONLY =  5
Const NBioAPI_FIR_PURPOSE_AUDIT                          =  6
Const NBioAPI_FIR_PURPOSE_UPDATE                         = 10

Const NBioAPI_FINGER_ID_UNKNOWN      =  0
Const NBioAPI_FINGER_ID_RIGHT_THUMB  =  1
Const NBioAPI_FINGER_ID_RIGHT_INDEX  =  2
Const NBioAPI_FINGER_ID_RIGHT_MIDDLE =  3
Const NBioAPI_FINGER_ID_RIGHT_RING   =  4
Const NBioAPI_FINGER_ID_RIGHT_LITTLE =  5
Const NBioAPI_FINGER_ID_LEFT_THUMB   =  6
Const NBioAPI_FINGER_ID_LEFT_INDEX   =  7
Const NBioAPI_FINGER_ID_LEFT_MIDDLE  =  8
Const NBioAPI_FINGER_ID_LEFT_RING    =  9
Const NBioAPI_FINGER_ID_LEFT_LITTLE  = 10

Const MINCONV_TYPE_FDP     = 0
Const MINCONV_TYPE_FDU     = 1
Const MINCONV_TYPE_FDA     = 2
Const MINCONV_TYPE_OLD_FDA = 3
Const MINCONV_TYPE_FDAC    = 4

'-----------------------------------------------------------------------------------------------------
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 6')"

If indexSearch.ErrorCode <> NBioAPIERROR_NONE Then
	recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 6ERR')"
	response.write "Page_Load: " & indexSearch.ErrorDescription & " [" & indexSearch.ErrorCode & "]<br>"
End If

If modo = "ENROLL" Then
'	recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 7a')"
	createUser
'	recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 8a')"
ElseIf modo = "IDENTIFY" Then
'	recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 7b')"
	loadUsers
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 8b')"
	identifyUser
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 9b')"
End If
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha 10')"

'--------------------------------------------------------------------------------------------
'   Identificación del usuario
'--------------------------------------------------------------------------------------------
Sub identifyUser ( )

	Dim i
recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'" & len(fir) & "')"
recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'" & fir & "')"

on error resume next

    indexSearch.IdentifyUser cstr ( fir ), NBioAPI_FIR_SECURITY_LEVEL_NORMAL
recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha i-- 2')"

If Err.Number <> 0 then
	Error.Clear
	recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'!!!!!!!!!!!!!!!! Un Error ')"
End If


    If indexSearch.ErrorCode <> NBioAPIERROR_NONE Then
        If indexSearch.ErrorCode = NBioBSPCOM_ERROR_UNKNOWN Then
recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'NOFINGER****')"
            response.redirect loca & "?err=NOFINGER"
            Exit Sub
        End If
        response.write "identifyUser: " & indexSearch.ErrorDescription & " [" & indexSearch.ErrorCode & "]<br>"
    Else
        For i = 0 To UBound(uIdArray)
            If cdbl(uIdArray(i)) = cdbl(indexSearch.UserID) Then
recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'IdentOk ****')"
                response.redirect loca & "?err=IDENTOK&uId=" & idArray(i)
                Exit Sub
            End If
        Next
    End If
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha i-- Fi')"

End Sub

'--------------------------------------------------------------------------------------------
'   Creación de un usuario
'--------------------------------------------------------------------------------------------
Sub createUser ( )

    Dim sql

    indexSearch.AddFIR fir, CInt ( uId )

    rec "delete from " & tablaDedos() & " where usuario='" & usuario & "'"
    rec "insert into " & tablaDedos() & "(usuario,userId,fir) " & "values('" & usuario & "'," & uId & ",'" & fir & "')"
    rec "delete from " & tablaDedos() & " where fir = '' "

recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'f**********EnrollOk*****')"
    response.redirect loca & "?err=ENROLLOK&uId=" & usuario

End Sub

'--------------------------------------------------------------------------------------------
'   Carga de los usuarios
'--------------------------------------------------------------------------------------------
Sub loadUsers ( )

    Dim i
    Dim rs

	i = 0
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha load -- 1')"
    set rs = rec ( "select * from " & tablaDedos() & " order by userId" )
    While Not rs.EOF

        ReDim Preserve idArray(i)
        ReDim Preserve uIdArray(i)
        ReDim Preserve firArray(i)

        idArray(i)  = rs("usuario")
        uIdArray(i) = rs("userId")
        firArray(i) = rs("fir")
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha load -- " & rs("usuario") & "')"
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha load -- 1 " & rs("usuario") & "')"
        indexSearch.AddFIR cstr ( firArray(i) ), cint ( uIdArray(i) )
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha load -- 1 " & rs("usuario") & " Ok')"
        If indexSearch.ErrorCode <> NBioAPIERROR_NONE Then
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'Err " & indexSearch.ErrorDescription & " [" & indexSearch.ErrorCode & "] ')"
            response.write "loadUsers: " & indexSearch.ErrorDescription & " [" & indexSearch.ErrorCode & "]<br>"
            Exit Sub
        End If

        i = i + 1
        rs.MoveNext

    wend
'recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'FingerFicha load -- Fi')"
End Sub

recHit "Insert Into Web_Log(nomuser,Ip,Hora,Accio) Values('" & session("Usuari_Empresa_Nom") & "','" & Request.ServerVariables("Remote_addr") & "',getdate(),'f******************')"

%>
