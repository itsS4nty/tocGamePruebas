<%

'********* /gdr/includeAsp/sf_email.asp
'* Funciones genéricas de envio de email
'* Función simple de envío de e-mail.
'***************************************************************************************************
'*sf_enviarMail. Funcion para enviar e-mails desde el servidor de Hit
'* Espera:	Dirección de correo desde la que enviamos. Por defecto info@hit.cat
'*					Direccion de correo a la que queremos enviar
'*					Asunto. Por defecto, "Sin Asunto"
'*					Cuerpo del mensaje en formato HTML
'*					Nombre de un posible fichero adjunto desde la raiz de la url
'* 					Si las direcciones son incorrectas, no envia y devuelve false
'*					Si el adjunto no existe, no lo envia
'*					Siempre que envia devuelve true
'***************************************************************************************************
function sf_enviarMail(byVal sls_de,byVal sls_a,byVal sls_asunto,byVal sls_cuerpo,byVal sls_adjunto)
'**** Constantes
	const SLN_SENDUSING=2
	const SLS_SMTPSERVER="10.1.2.1"
	const SLN_SMTPSERVERPORT=25
	const SLB_SMTPUSESSL=false
	const SLN_SMTPCONNTIMEOUT=60
	const SLN_SMTPAUTENTICATE=1
	const SLS_SMTPUSERNAME="info"
	const SLS_SMTPPASSWORD="IYp2rKygQnb"
	const SLS_DEFAULTDE="info@hit.cat"
'**** Valores por defecto
	if sls_de="" then
		sls_de=SLS_DEFAULTDE
	end if
	if sls_asunto="" then
		sls_asunto="Sin Asunto"
	end if
	if sls_cuerpo="" then
		sls_cuerpo="Sin texto"
	end if
'**** validamos email a
	dim sls_regEx
	Set sls_regEx=New RegExp
	sls_regEx.Pattern="^[a-z][\w\.-]*[\w-]@[\da-z][\w-]*[\.]?[\w-]*[\w]\.[a-z]{2,3}$"
	sls_regEx.IgnoreCase=True
	if not sls_regEx.test(sls_a) then
		sf_enviarMail=false
		exit function
	end if
'**** Validamos e-mail de
	if not sls_regEx.test(sls_de) then
		sls_de=SLS_DEFAULTDE
'		sf_enviarMail=false
'		exit function
	end if
'sls_adjunto=""
	set rs = recMod ("select archivo,nombre,isnull(extension,'') ext,mime,tmp,isnull(down,0) down from archivo where id='" & sls_adjunto & "'  ")
	if not rs.eof then 
		sls_adjunto = ROOTFORN & "gestion/Pedido.pdf"
		sls_adjunto = "c:\Inetpub\wwwroot\Facturacion\foto\Pedido.pdf"
		SaveBinaryDataStream sls_adjunto,rs("archivo")
	else
		sls_adjunto = ""	
	end if	
	rs.close
	
'**** Validamos que exista el fichero a adjuntar. Si no existe, no lo adjuntamos
'	if sls_adjunto<>"" then
'		sls_adjunto=Server.MapPath(sls_adjunto)
'		if not sf_ficheroExiste(sls_adjunto) then
'			sls_adjunto=""
		'end if
'	end if

'**** Configuración Objeto eMail
	Dim ObjSendMail
	Set ObjSendMail=server.CreateObject("CDO.Message") 
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusing")=SLN_SENDUSING
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserver")=SLS_SMTPSERVER
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserverport")=SLN_SMTPSERVERPORT
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpusessl")=SLB_SMTPUSESSL
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpconnectiontimeout")=SLN_SMTPCONNTIMEOUT
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate")=SLN_SMTPAUTENTICATE
	ObjSendMail.Configuration.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusername")=SLS_SMTPUSERNAME
	ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendpassword")=SLS_SMTPPASSWORD
	ObjSendMail.Configuration.Fields.Update
'**** datos del eMail
	ObjSendMail.From=sls_de
	ObjSendMail.To=sls_a
	ObjSendMail.Subject=sls_asunto
	ObjSendMail.HTMLBody=sls_cuerpo
	 	 
	ObjSendMail.AddAttachment sls_adjunto
	
'	if sls_adjunto<>"" then
'		ObjSendMail.AddAttachment sls_adjunto
'	end if
'**** Envio del eMail
	ObjSendMail.Send
	Set ObjSendMail=Nothing
	sf_enviarMail=true
end function
'************************************************************************
'* sf_ficheroExiste(fichero)
'* Devuelve verdadero si el fichero existe, y falso en caso contrario
'* Espera el camino al fichero ya mapeado
'************************************************************************
function sf_ficheroExiste(byVal sls_file)
	if sls_file=""  then
		sf_ficheroExiste=false
		exit function
	end if
	dim slo_file
	set slo_file=Server.CreateObject("Scripting.FileSystemObject")
	sf_ficheroExiste=(slo_file.FileExists(sls_file))
	set slo_file=nothing   
end function

Function RecurseMKDir(ByVal Path)
	Dim FS
	Set FS=CreateObject("Scripting.FileSystemObject")
	Path=sf_replace(Path,"/","\")
	If Right(Path,1)<>"\" Then Path=Path&"\"
	Dim Pos,n
	n=0
	Pos=InStr(1,Path,"\")
	do while Pos>0
		On Error Resume Next
		FS.CreateFolder Left(Path,Pos-1)
		If Err=0 Then n=n+1
		Pos=InStr(Pos+1,Path,"\")
	Loop
	RecurseMKDir=n
End Function
'***********************************************************************
'**** Salva una cadena binaria usando ADODB Stream
'***********************************************************************
Function SaveBinaryDataStream(FileName,ByteArray)
	Dim BinaryStream
	Set BinaryStream=createobject("ADODB.Stream")
	BinaryStream.Type=1 'Binary
	BinaryStream.Open
	if lenb(ByteArray)>0 then BinaryStream.Write ByteArray
	On error Resume next
	BinaryStream.SaveToFile FileName,2 'Overwrite
	if Err=&Hbbc then '**** No encuentra el camino y lo creará
		On error Goto 0
		RecurseMKDir GetPath(FileName)
		On error Resume next
		BinaryStream.SaveToFile FileName,2 'Overwrite
	end if
	Dim ErrMessage,ErrNumber
	ErrMessage=Err.Description
	ErrNumber=Err
	On Error Goto 0
	if ErrNumber<>0 then Err.Raise ErrNumber,"SaveBinaryData",FileName&":"&ErrMessage
End Function


%> 