<%

dim AX(9)

AX(0) = "hit.com"
AX(1) = "hit.HW"
AX(2) = "hit.sys"
AX(3) = "hit.ftp"
AX(4) = "GSSocket.TCPSock"
AX(5) = "SCommDLL.SComm"
AX(6) = "NBioBSPCOM.NBioBSP"
AX(7) = "Scripting.FileSystemObject"
AX(8) = "hit.Tick"
AX(9) = "hit.http"

' Puerto serie
'	n: Nombre de la variable de JavaScript
function newHitCom ( n )
	newHitCom = newDll ( n, AX(0) )
end function

' Control de HW
'	n: Nombre de la variable de JavaScript
function newHitHW ( n )
	newHitHW = newDll ( n, AX(1) )
end function

' Funciones de sistema
'	n: Nombre de la variable de JavaScript
function newHitSys ( n )
	newHitSys = newDll ( n, AX(2) )
end function

' Protocolo FTP
'	n: Nombre de la variable de JavaScript
function newHitFtp ( n )
	newHitFtp = newDll ( n, AX(3) )
end function

' Puerto USB
'	n: Nombre de la variable de JavaScript
function newHitTick ( n )
	newHitTick = newDll ( n, AX(8) )
end function

' Cockets
'	n: Nombre de la variable de JavaScript
function newSock ( n )
	newSock = newDll ( n, AX(4) )
end function

' Puerto serie
'	n: Nombre de la variable de JavaScript
function newCom ( n )
	newCom = newDll ( n, AX(5) )
end function

' Driver del Hamster
'	n: Nombre de la variable de JavaScript
function newNBio ( n )
	newNBio = newDll ( n, AX(6) )
end function

' Sistema de ficheros de Windows
'	n: Nombre de la variable de JavaScript
function newFS ( n )
	newFS = newDll ( n, AX(7) )
end function

' Protocolo HTTP
'	n: Nombre de la variable de JavaScript
function newHTTP ( n )
	newHTTP = newDll ( n, AX(9) )
end function

' Crea un objeto ActiveX en JavaScript
'	n: Nombre de la variable de JavaScript
'	t: Tipo de ActiveX
function newDll ( n, t )
	newDll = "<script>" & vbcrlf
	newDll = newDll & "var " & n & " = null;" & vbcrlf
	newDll = newDll & "if ( " & change ( t, ".", "_" ) & " )" & vbcrlf
	newDll = newDll & "	" & n & " = new ActiveXObject('" & t & "');" & vbcrlf
	newDll = newDll & "</script>" & vbcrlf
end function

%>

<script>

<%for axI=0 to ubound(AX)%>
var <%=change(AX(axI),".","_")%> = <%=iif(session(AX(axI)),"true","false")%>;
<%next%>

function activateActiveX ( ax )
	{
	eval ( ax.change(".","_") + "=true" );
	}

</script>

<%

' Pone todas las variables de sesión de ActiveX a false
sub resetActiveX ( )
	for axI=0 to ubound(AX)
		session(AX(axI)) = false
	next
end sub

' Comprueba si existen los controles ActiveX
sub testActiveX ( )
	for axI=0 to ubound(AX)
		if not session(AX(axI)) then
%>
<iframe name="textActiveX<%=axI%>" src="/Facturacion/include/AX.asp?obj=<%=AX(axI)%>" style="position:absolute;top:0;left:0;visibility:hidden;"></iframe>
<%
		end if
	next
end sub
%>
