<%

destino = "TER" 'TER|A4|PANT
hayFuente = false

function tipo(f,s,b)
	c = iif(hayFuente,"</font>","")
	select case f
		case "A"
			if destino = "TER" or destino = "MAT" then
				c = iif(s,iif(b,"Y","Q"),iif(b,"I","A"))
			else
				c = iif(b,"<font size=""1"" style=""font:bold;"">","<font size=""1"">")
			end if
		case "B"
			if destino = "TER" or destino = "MAT" then
				c = iif(s,iif(b,"X","P"),iif(b,"H","B"))
			else
				c = iif(b,"<font size=""2"" style=""font:bold;"">","<font size=""2"">")
			end if
		case "C"
			if destino = "TER" or destino = "MAT" then
				c = iif(s,iif(b,"9","1"),iif(b,"i","a"))
			else
				c = iif(b,"<font size=""3"" style=""font:bold;"">","<font size=""3"">")
			end if
		case "D"
			if destino = "TER" or destino = "MAT" then
				c = iif(s,iif(b,"8","0"),iif(b,"h","b"))
			else
				c = iif(b,"<font size=""4"" style=""font:bold;"">","<font size=""4"">")
			end if
	end select
	if destino = "TER" or destino = "MAT" then
		tipo = chr(27) & "!" & c
	else
		tipo = c
	end if
	hayFuente=true
end function

function center(t,f)
	l = 0
	select case f
		case "A"
			l = 56
		case "B"
			l = 42
		case "C"
			l = 28
		case "D"
			l = 21
	end select
	if destino = "TER" or destino = "MAT" then
		t = left(t,l)
		center = space((l - len(t)) \ 2) & t
	else
		center = "<center>" & change(t," ","&nbsp;") & "</center>"
	end if
end function

function ri(t,f,l)
	if l then
		ri = right(space(l) & t,l)
	else
		select case f
			case "A"
				l = 56
			case "B"
				l = 42
			case "C"
				l = 28
			case "D"
				l = 21
		end select
		if destino = "TER" or destino = "MAT" then
			ri = right(space(l) & t,l)
		else
			ri = "<div align=""right"">" & change(t," ","&nbsp;") & "</div>"
		end if
	end if
end function

function lf(t,f,l)
	if l then
		lf = left(t & space(l),l)
	else
		select case f
			case "A"
				l = 56
			case "B"
				l = 42
			case "C"
				l = 28
			case "D"
				l = 21
		end select
		if destino = "TER" or destino = "MAT" then
			lf = right(space(l) & t,l)
		else
			lf = "<div align=""right"">" & change(t," ","&nbsp;") & "</div>"
		end if
	end if
end function

function cut()
	if destino = "TER" or destino = "MAT" then
		cut = vbcrlf & chr(29) & "VB" & vbcrlf
	else
		cut = "<br>"
	end if
end function

function print(code,mode,js) 'codigo a imprimir , "COM"|"TCP"

	if destino = "TER" or destino = "MAT" then

		aCode = split(join(split(code,""""),"\"""),vbcrlf)
		print = print & "<script>" & vbcrlf
		print = print & "var velocidad = 1;" & vbcrlf
		print = print & "var enviando = true;" & vbcrlf
		print = print & "var code = new Array();" & vbcrlf

		for i=0 to ubound(aCode)
			print = print & "code[" & i & "] = """ & aCode(i) & "\n"";" & vbcrlf
		next

		if mode = "TCP" then
			print = print & "var pr = new ActiveXObject(""GSSocket.TCPSock"");" & vbcrlf
			print = print & "var conexion = (pr.Connect(""192.9.199.70"",6001)==""OK"");" & vbcrlf
		elseif mode = "COM" then
			print = print & "var pr = new ActiveXObject(""SCommDLL.SComm"");" & vbcrlf
			print = print & "pr.ComPort = 1;" & vbcrlf
			print = print & "pr.ComSettings = ""9600,n,8,1"";" & vbcrlf
			print = print & "var conexion = pr.PortOpen();" & vbcrlf
		end if

		print = print & "if(!conexion)" & vbcrlf
		print = print & "	{" & vbcrlf
		print = print & "	alert(""No es troba la impresora tèrmica.\nAsseguri's de que està ben conectada."");" & vbcrlf
		print = print & "	}" & vbcrlf

		print = print & "function enviar(p)" & vbcrlf
		print = print & "	{" & vbcrlf 
		if mode = "COM" then
			print = print & "	if(pr.PortOpen() && p<code.length)" & vbcrlf
		elseif mode = "TCP" then
			print = print & "	if(conexion && p<code.length)" & vbcrlf
		end if
		print = print & "		{" & vbcrlf 
		print = print & "		if(enviando)" & vbcrlf
		print = print & "			{" & vbcrlf 
		print = print & "			c = '';" & vbcrlf 
		print = print & "			for(var v=0;v<velocidad && enviando;v++)c+=code[p+v];" & vbcrlf
		print = print & "			pr.Send(c);" & vbcrlf 
		print = print & "			setTimeout(""enviar("" + (p+velocidad) + "")"",1);" & vbcrlf
		print = print & "			}" & vbcrlf 
		print = print & "		else" & vbcrlf
		print = print & "			{" & vbcrlf 
		print = print & "			pr.Send(""\n\n\n\n\n\n\n\n\n\n"");" & vbcrlf 
		print = print & "			pr.Send(""" & join(split(cut(),vbcrlf),"\n") & "\n\n"");" & vbcrlf 
		print = print & "			setTimeout(""pr."
		if mode = "COM" then print = print & "Port"
		print = print & "Close()"",100);" & vbcrlf 
		print = print & "			}" & vbcrlf 
		print = print & "		}" & vbcrlf
		print = print & "	else parar(); " & vbcrlf
		print = print & "	}" & vbcrlf

		print = print & "function parar()" & vbcrlf
		print = print & "	{" & vbcrlf 
		print = print & "	enviando = false;" & vbcrlf
		print = print & "	setTimeout(""" & js & """,1000);" & vbcrlf
		print = print & "	}" & vbcrlf 

		print = print & "enviar(0);" & vbcrlf

		print = print & "</script>"

	elseif destino = "PANT" then

		print = "<font face=""Courier New"">" & code & "</font>"

	elseif destino = "A4" then

		print = "<font face=""Courier New"">" & code & "</font>" & vbcrlf
		print = print & "<script>self.print();</script>"

	end if

end function

%>
