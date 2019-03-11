<%

redim letra    ( 90 )
redim caracter (  5 )

' Cuadro vacio
caracter ( 0 ) = " "

' Cuadro completo
caracter ( 1 ) = chr ( 219 )

' Medio cuadro inferior
caracter ( 2 ) = chr ( 220 )

' Medio cuadro izquierdo
caracter ( 3 ) = chr ( 221 )

' Medio cuadro derecho
caracter ( 4 ) = chr ( 222 )

' Medio cuadro superior
caracter ( 5 ) = chr ( 223 )

'''''''''''''''''''''''''''''''''''''''''

' espacio
letra(  0) = "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             "

' Ç
letra(  1) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "111    22    " & vbcrlf & _
             "1112 21152111" & vbcrlf & _
             " 51111111115 " & vbcrlf & _
             "  215        "

' Ñ
letra(  2) = "5555555555555" & vbcrlf & _
             "111112    111" & vbcrlf & _
             "11151112  111" & vbcrlf & _
             "111  51112111" & vbcrlf & _
             "111    511111" & vbcrlf & _
             "111      5111"

'''''''''''''''''''''''''''''''''''''''''

' (
letra( 40) = " 2111        " & vbcrlf & _
             "1115         " & vbcrlf & _
             "111          " & vbcrlf & _
             "111          " & vbcrlf & _
             "1112         " & vbcrlf & _
             " 5111        "

' )
letra( 41) = "        1112 " & vbcrlf & _
             "         5111" & vbcrlf & _
             "          111" & vbcrlf & _
             "          111" & vbcrlf & _
             "         2111" & vbcrlf & _
             "        1115 "

' *
letra( 42) = "             " & vbcrlf & _
             " 11121112111 " & vbcrlf & _
             " 22111111122 " & vbcrlf & _
             " 55111111155 " & vbcrlf & _
             " 11151115111 " & vbcrlf & _
             "             "

' +
letra( 43) = "             " & vbcrlf & _
             "     111     " & vbcrlf & _
             " 22221112222 " & vbcrlf & _
             " 55551115555 " & vbcrlf & _
             "     111     " & vbcrlf & _
             "             "

' ,
letra( 44) = "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "    21115    " & vbcrlf & _
             "  21115      " & vbcrlf & _
             "1115         "

' -
letra( 45) = "             " & vbcrlf & _
             "             " & vbcrlf & _
             " 22222222222 " & vbcrlf & _
             " 55555555555 " & vbcrlf & _
             "             " & vbcrlf & _
             "             "

' .
letra( 46) = "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "  21112      " & vbcrlf & _
             "  51115      "

' /
letra( 47) = "         2111" & vbcrlf & _
             "       21115 " & vbcrlf & _
             "     21115   " & vbcrlf & _
             "   21115     " & vbcrlf & _
             " 21115       " & vbcrlf & _
             "1115         "

' 0
letra( 48) = " 21111111112 " & vbcrlf & _
             "1115   211111" & vbcrlf & _
             "111  21115111" & vbcrlf & _
             "11121115  111" & vbcrlf & _
             "111115   2111" & vbcrlf & _
             " 51111111115 "

' 1
letra( 49) = "    211111   " & vbcrlf & _
             "       111   " & vbcrlf & _
             "       111   " & vbcrlf & _
             "       111   " & vbcrlf & _
             "       111   " & vbcrlf & _
             "    211111112"

' 2
letra( 50) = " 21111111112 " & vbcrlf & _
             "1115   21115 " & vbcrlf & _
             "     21115   " & vbcrlf & _
             "   21115     " & vbcrlf & _
             " 21115       " & vbcrlf & _
             "1111111111111"

' 3
letra( 51) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "     22221115" & vbcrlf & _
             "     55551112" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' 4
letra( 52) = "   21111111  " & vbcrlf & _
             " 21115  111  " & vbcrlf & _
             "1115    111  " & vbcrlf & _
             "1112222211122" & vbcrlf & _
             "5555555511155" & vbcrlf & _
             "        111  "

' 5
letra( 53) = "1111111111111" & vbcrlf & _
             "111          " & vbcrlf & _
             "11122222222  " & vbcrlf & _
             "5555555551112" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' 6
letra( 54) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "11122222222  " & vbcrlf & _
             "1111555551112" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' 7
letra( 55) = "1111111111111" & vbcrlf & _
             "       21115 " & vbcrlf & _
             "     21115   " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     "

' 8
letra( 56) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "5111222221115" & vbcrlf & _
             "2111555551112" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' 9
letra( 57) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "5111222221111" & vbcrlf & _
             "  55555555111" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' :
letra( 58) = "   21112     " & vbcrlf & _
             "   51115     " & vbcrlf & _
             "             " & vbcrlf & _
             "             " & vbcrlf & _
             "   21112     " & vbcrlf & _
             "   51115     "

letra( 59) = "    21112    " & vbcrlf & _
             "    51115    " & vbcrlf & _
             "             " & vbcrlf & _
             "    21115    " & vbcrlf & _
             "  21115      " & vbcrlf & _
             "1115         "

'''''''''''''''''''''''''''''''''''''''''

' A
letra( 65) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "1111111111111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111"

' B
letra( 66) = "111111111112 " & vbcrlf & _
             "111      5111" & vbcrlf & _
             "1112222221115" & vbcrlf & _
             "1115555551112" & vbcrlf & _
             "111      2111" & vbcrlf & _
             "111111111115 "

' C
letra( 67) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "111          " & vbcrlf & _
             "111          " & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' D
letra( 68) = "11111111112  " & vbcrlf & _
             "111     51112" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111     21115" & vbcrlf & _
             "11111111115  "

' E
letra( 69) = "1111111111111" & vbcrlf & _
             "111          " & vbcrlf & _
             "11122222     " & vbcrlf & _
             "11155555     " & vbcrlf & _
             "111          " & vbcrlf & _
             "1111111111111"

' F
letra( 70) = "1111111111111" & vbcrlf & _
             "111          " & vbcrlf & _
             "11122222     " & vbcrlf & _
             "11155555     " & vbcrlf & _
             "111          " & vbcrlf & _
             "111          "

' G
letra( 71) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "111          " & vbcrlf & _
             "111   1111111" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' H
letra( 72) = "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "1112222222111" & vbcrlf & _
             "1115555555111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111"

' I
letra( 73) = "   1111111   " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "   1111111   "

' J
letra( 74) = "          111" & vbcrlf & _
             "          111" & vbcrlf & _
             "          111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' K
letra( 75) = "111      2111" & vbcrlf & _
             "111    21115 " & vbcrlf & _
             "1112221115   " & vbcrlf & _
             "1115551112   " & vbcrlf & _
             "111    51112 " & vbcrlf & _
             "111      5111"

' L
letra( 76) = "111          " & vbcrlf & _
             "111          " & vbcrlf & _
             "111          " & vbcrlf & _
             "111          " & vbcrlf & _
             "111          " & vbcrlf & _
             "1111111111111"

' M
letra( 77) = "1112     2111" & vbcrlf & _
             "111112 211111" & vbcrlf & _
             "1115111115111" & vbcrlf & _
             "111  515  111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111"

' N
letra( 78) = "1112      111" & vbcrlf & _
             "111112    111" & vbcrlf & _
             "11151112  111" & vbcrlf & _
             "111  51112111" & vbcrlf & _
             "111    511111" & vbcrlf & _
             "111      5111"

' O
letra( 79) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' P
letra( 80) = "111111111112 " & vbcrlf & _
             "111      5111" & vbcrlf & _
             "1112222221115" & vbcrlf & _
             "11155555555  " & vbcrlf & _
             "111          " & vbcrlf & _
             "111          "

' Q
letra( 81) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111   5112111" & vbcrlf & _
             "1112    51111" & vbcrlf & _
             " 51111111115 "

' R
letra( 82) = "111111111112 " & vbcrlf & _
             "111      5111" & vbcrlf & _
             "1112222221115" & vbcrlf & _
             "11155511115  " & vbcrlf & _
             "111    51112 " & vbcrlf & _
             "111      5111"

' S
letra( 83) = " 21111111112 " & vbcrlf & _
             "1115     5111" & vbcrlf & _
             "51112222222  " & vbcrlf & _
             "  55555551112" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' T
letra( 84) = "1111111111111" & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     "

' U
letra( 85) = "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51111111115 "

' V
letra( 86) = "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "1112     2111" & vbcrlf & _
             " 51112 21115 " & vbcrlf & _
             "   5111115   "

' W
letra( 87) = "111       111" & vbcrlf & _
             "111       111" & vbcrlf & _
             "111  212  111" & vbcrlf & _
             "1112111112111" & vbcrlf & _
             "111115 511111" & vbcrlf & _
             "1115     5111"

' X
letra( 88) = "1112     2111" & vbcrlf & _
             " 51112 21115 " & vbcrlf & _
             "   5111115   " & vbcrlf & _
             "   2111112   " & vbcrlf & _
             " 21115 51112 " & vbcrlf & _
             "1115     5111"

' Y
letra( 89) = "1112     2111" & vbcrlf & _
             " 51112 21115 " & vbcrlf & _
             "   5111115   " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     " & vbcrlf & _
             "     111     "

' Z
letra( 90) = "1111111111111" & vbcrlf & _
             "       21115 " & vbcrlf & _
             "     21115   " & vbcrlf & _
             "   21115     " & vbcrlf & _
             " 21115       " & vbcrlf & _
             "1111111111111"

'''''''''''''''''''''''''''''''''''''''''

function parse ( byval c )

	parse = ""

	c  = ucase ( c )

	if c = "Á" or c = "À" or c = "Â" or c = "Ä" then c = "A"
	if c = "É" or c = "È" or c = "Ê" or c = "Ë" then c = "E"
	if c = "Í" or c = "Ì" or c = "Î" or c = "Ï" then c = "I"
	if c = "Ó" or c = "Ò" or c = "Ô" or c = "Ö" then c = "O"
	if c = "Ú" or c = "Ù" or c = "Û" or c = "Ü" then c = "U"

	if c = " " or c = vbtab or c = vbcrlf then
		ch = letra ( 0 )
	elseif c = "Ñ" then
		ch = letra ( 1 )
	elseif c = "Ç" then
		ch = letra ( 2 )
	elseif ( asc ( c ) >= asc ( "(" ) and asc ( c ) <= asc ( ";" ) ) or ( asc ( c ) >= asc ( "A" ) and asc ( c ) <= asc ( "Z" ) ) then
		ch = letra ( asc(c) )
	else
		ch = ""
	end if

	if ch <> "" then

		ch = change ( ch, "0", caracter(0) )
		ch = change ( ch, "1", caracter(1) )
		ch = change ( ch, "2", caracter(2) )
		ch = change ( ch, "3", caracter(3) )
		ch = change ( ch, "4", caracter(4) )
		ch = change ( ch, "5", caracter(5) )

		parse = ch & vbcrlf & vbcrlf

	end if

end function

'''''''''''''''''''''''''''''''''''''''''

class printer

	dim prMode

	public function initPrinter(mode,js)

		dim c

		prMode = mode

		c = "<span class=""titulo"">IMPRIMIENDO...[" & mode & "]</span>"
		c = c & "<img src=""" & IMGSREC & "pix2.gif"" height=""22"" width=""378"" style=""position:absolute;left:5;top:40;"">"
		c = c & "<img src=""" & IMGSREC & "pix.gif"" height=""20"" width=""0%"" name=""barra"" style=""position:absolute;left:6;top:41;"">"
		c = c & "<div id=""porciento"" style=""position:absolute;top:45;left:180;color:#ffcc00;font:bold;"">0 %</div>" & vbcrlf
		c = c & "<img src=""" & IMGSREC & "stop.gif"" width=""45"" height=""45""border=""0"" style=""position:absolute;top:80;left:175;""" & events("parar();") & ">"

		select case mode
			case "TCP":
				c = c & newSock ( "pr" ) & vbcrlf
			case "COM":
				c = c & newCom ( "pr" ) & vbcrlf
			case "HIT":
				c = c & newHitCom ( "pr" ) & vbcrlf
			case "ETQ":
				c = c & newHitCom ( "pr" ) & vbcrlf
			case "BIG":
				c = c & newHitCom ( "pr" ) & vbcrlf
			case "USB":
				c = c & newHitTick ( "pr" ) & vbcrlf
		end select

		c = c & vbcrlf & vbcrlf & "<script>" & vbcrlf

		if mode <> "USB" then
			c = c & "var enviando = true;" & vbcrlf
			c = c & "var maxCode = 1;" & vbcrlf
			c = c & "var code = new Array();" & vbcrlf
		end if
		c = c & "var conexion;" & vbcrlf

		c = c & "if ( pr != null )" & vbcrlf
		c = c & "	{" & vbcrlf

		select case mode

			case "TCP":
				c = c & "conexion = (pr.Connect(""192.9.199.70"",6001)==""OK"");" & vbcrlf

			case "COM":
				c = c & "pr.ComPort = 1;" & vbcrlf
				c = c & "pr.ComSettings = ""9600,n,8,1"";" & vbcrlf
				c = c & "conexion = pr.PortOpen();" & vbcrlf

			case "HIT":
				c = c & "pr.settings = ""9600,n,8,1"";" & vbcrlf
				c = c & "conexion = pr.loadPrinter(1);" & vbcrlf

			case "ETQ":
				c = c & "pr.settings = ""9600,n,8,1"";" & vbcrlf
				c = c & "conexion = pr.loadPrinter(2);" & vbcrlf

			case "BIG": 'Etiquetas grandes
				c = c & "pr.settings = ""9600,n,8,1"";" & vbcrlf
				if ucase(Request.ServerVariables("SERVER_NAME")) = "NEPTU" then
					c = c & "conexion = pr.loadPrinter(1);" & vbcrlf
				else
					if ucase(session("Usuari_Empresa_Nom")) = "PADECAVA" then 
						c = c & "conexion = pr.loadPrinter(1);" & vbcrlf
					else
						c = c & "conexion = pr.loadPrinter(2);" & vbcrlf
					end if
				end if

			case "USB":
				c = c & "conexion = ( pr != null && pr != undefined );" & vbcrlf

		end select

		c = c & "	}" & vbcrlf & vbcrlf

		c = c & "function progreso(p)" & vbcrlf
		c = c & "	{" & vbcrlf
		c = c & "	if ( pr != null )" & vbcrlf
		c = c & "		{" & vbcrlf

		if mode = "USB" then

			c = c & "		if(p==0)pr.clearTick();" & vbcrlf
			c = c & "		if(conexion && p<code.length)" & vbcrlf
			c = c & "			{" & vbcrlf
			c = c & "			interpreta(code[p]);" & vbcrlf
			c = c & "			setTimeout(""progreso("" + (p+1) + "")"",1);" & vbcrlf
			c = c & "			}" & vbcrlf
			c = c & "		else" & vbcrlf
			c = c & "			{" & vbcrlf
			c = c & "			pr.printTick()" & vbcrlf
			c = c & "			parar();" & vbcrlf
			c = c & "			}" & vbcrlf

		elseif mode = "TCP" or mode = "COM" then

			if mode = "COM" then
				c = c & "		if(pr.PortOpen() && p<code.length)" & vbcrlf
			else
				c = c & "		if(conexion && p<code.length)" & vbcrlf
			end if

			c = c & "			{" & vbcrlf 
			c = c & "			if(enviando)" & vbcrlf
			c = c & "				{" & vbcrlf 
			c = c & "				var m = Math.round((p * 100) / maxCode);" & vbcrlf
			c = c & "				porciento.innerHTML = m + "" %"";" & vbcrlf 
			c = c & "				if(m>50)porciento.style.color = ""#000080"";" & vbcrlf
			c = c & "				if(m==100)document.barra.width = 376;" & vbcrlf
			c = c & "				else document.barra.width = m*3.74;" & vbcrlf
			c = c & "				pr.Send(code[p]);" & vbcrlf 
			c = c & "				setTimeout(""progreso("" + (p+1) + "")"",1);" & vbcrlf
			c = c & "				}" & vbcrlf
			c = c & "			else" & vbcrlf
			c = c & "				{" & vbcrlf
			c = c & "				pr.Send(""\n\n\n\n\n\n\n\n\n\n"");" & vbcrlf 
			c = c & "				pr.Send(""" & join(split(cut(),vbcrlf),"\n") & "\n\n"");" & vbcrlf 
			c = c & "				setTimeout(""pr."
			if mode = "COM" then c = c & "Port"
			c = c & "Close()"",100);" & vbcrlf 
			c = c & "				}" & vbcrlf 
			c = c & "			}" & vbcrlf
			c = c & "		else parar(); " & vbcrlf
		else
			c = c & "			if(enviando)" & vbcrlf
			c = c & "				{" & vbcrlf 
			c = c & "				porciento.innerHTML = p + ' De ' + maxCode;" & vbcrlf 
			c = c & "               pr.comPrint(code[p]);" & vbcrlf
			c = c & "				setTimeout(""progreso("" + (p+1) + "")"",200);" & vbcrlf
			c = c & "				if (p > maxCode) enviando = false;" & vbcrlf
			c = c & "				}" & vbcrlf
			c = c & "			else" & vbcrlf
			c = c & "				{" & vbcrlf
			c = c & "				setTimeout(""" & js & """,1000);" & vbcrlf
			c = c & "				}" & vbcrlf 
		end if

		c = c & "		}" & vbcrlf
		c = c & "	}" & vbcrlf

		c = c & "function parar()" & vbcrlf
		c = c & "	{" & vbcrlf
		c = c & "	enviando = false;" & vbcrlf
		c = c & "	setTimeout(""" & js & """,1000);" & vbcrlf
		c = c & "	}" & vbcrlf & vbcrlf

		c = c & "</script>"

		initPrinter = c

	end function

	public function print(code) 'codigo a imprimir , "COM"|"TCP"
		code = join(split(code,"{BR}"),vbcrlf)
		code = join(split(code,"{c:"),"{C:")
		code = join(split(code,vbcrlf),"\n")
		aCode = split(code,"{C:29}V{C:0}")

		c = "<script>" & vbcrlf
		if prMode = "ETQ" or prMode = "HIT" or prMode = "COM" or prMode = "TCP" or prMode = "USB" then
			c = c & "code = new Array();" & vbcrlf
			c = c & "maxCode = " & ubound(aCode)+1 & ";" & vbcrlf
			if len(code) > 0 then c = c & "code[0] = ""{C:13}{C:10}{C:27}{C:64}{C:13}{C:10}"";" & vbcrlf
			for i=0 to ubound(aCode)
				if instr(aCode(i),"{CUT}") > 0 then
					aaCode = split(acode,"{CUT}")
					for j=0 to ubound(aaCode)
						c = c & "code[" & i+1 & "] = """ & aaCode(i) & "{CUT}"";" & vbcrlf
					next
				else
					c = c & "code[" & i+1 & "] = """ & aCode(i) & "{C:29}V{C:0}"";" & vbcrlf
				end if
			next
			if len(code) > 0 then if instr(aCode(i-1),"{CUT}")=0  and  instr(aCode(i-1),cut())=0 then  c = c & "code[" & i+1 & "] = ""{CUT}"";" & vbcrlf
		else
			c = c & "if ( pr != null ) pr.comPrint(""" & change(code,vbcrlf,"\n") & """);" & vbcrlf
		end if

		c = c & "if(conexion)progreso(0);" & vbcrlf
		c = c & "else alert(""No es troba la impresora tèrmica.\nAsseguri's de que està ben conectada."");" & vbcrlf
		c = c & "</script>" & vbcrlf

		print = c

	end function

end class

function print2(code,mode)

	if mode = "TCP" then
		print2 = newSock ( "pr" ) & vbcrlf
	elseif mode = "COM" then
		print2 = newCom ( "pr" ) & vbcrlf
	end if

	print2 = print2 & "<script>" & vbcrlf
	print2 = print2 & "var code = """ & change(change(code,vbcrlf,"\n"),"""","\""") & """;" & vbcrlf
	print2 = print2 & "if ( pr != null )" & vbcrlf
	print2 = print2 & "	{" & vbcrlf

	if mode = "TCP" then
		print2 = print2 & "	var conexion = (pr.Connect(""192.9.199.70"",6001)==""OK"");" & vbcrlf
	elseif mode = "COM" then
		print2 = print2 & "	pr.ComPort = 1;" & vbcrlf
		print2 = print2 & "	pr.ComSettings = ""9600,n,8,1"";" & vbcrlf
		print2 = print2 & "	var conexion = pr.PortOpen();" & vbcrlf
	end if

	print2 = print2 & "	if(!conexion)" & vbcrlf
	print2 = print2 & "		{" & vbcrlf
	print2 = print2 & "		alert(""No es troba la impresora tèrmica.\nAsseguri's de que està ben conectada."");" & vbcrlf
	print2 = print2 & "		}" & vbcrlf
	print2 = print2 & "	}" & vbcrlf

	print2 = print2 & "function enviar()" & vbcrlf
	print2 = print2 & "	{" & vbcrlf 
	print2 = print2 & "	if ( pr != null )" & vbcrlf 
	print2 = print2 & "		{" & vbcrlf 
	if mode = "COM" then
		print2 = print2 & "		if(pr.PortOpen())" & vbcrlf
	elseif mode = "TCP" then
		print2 = print2 & "		if(conexion)" & vbcrlf
	end if
	print2 = print2 & "			{" & vbcrlf 
	print2 = print2 & "			pr.Send(code);" & vbcrlf 
	print2 = print2 & "			}" & vbcrlf
	print2 = print2 & "		}" & vbcrlf
	print2 = print2 & "	}" & vbcrlf

	print2 = print2 & "enviar();" & vbcrlf

	print2 = print2 & "</script>"

end function

function tipo(f,s,b)

	c = ""

	select case f
		case "A"
			c = iif(s,iif(b,"Y","Q"),iif(b,"I","A"))
		case "B"
			c = iif(s,iif(b,"X","P"),iif(b,"H","B"))
		case "C"
			c = iif(s,iif(b,"9","1"),iif(b,"i","a"))
		case "D"
			c = iif(s,iif(b,"8","0"),iif(b,"h","b"))
	end select

	tipo = chr(27) & "!" & c

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

	t = left(t,l)
	center = space((l - len(t)) \ 2) & t

end function

function ri(t,f)

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

	ri = right(space(l) & t,l)

end function

function cut()
	cut = vbcrlf & chr(29) & "VB" & vbcrlf
end function

function cadenaASCII (cadena)
	cadenaRET = cadena
	cadenaRET = replace(replace(replace(replace(cadenaRET, "á", chr(160)), "Á", chr(181)), "à", chr(133)), "À", chr(145))
	cadenaRET = replace(replace(replace(replace(cadenaRET, "é", chr(130)), "É", chr(144)), "è", chr(138)), "È", chr(138))
	cadenaRET = replace(replace(cadenaRET, "í", chr(161)), "Í", chr(214))
	cadenaRET = replace(replace(replace(replace(cadenaRET, "ó", chr(162)), "Ó", chr(162)), "ò", chr(149)), "Ò", chr(169))
	cadenaRET = replace(replace(cadenaRET, "ú", chr(163)), "Ú", chr(233))
	cadenaRET = replace(replace(cadenaRET, "ç", chr(135)), "Ç", chr(128))
		
	cadenaASCII = cadenaRET
end function

%>

<%=newFS ( "fileSystem" )%>

<script>

function interpreta( c )
	{

	var ini = 5;
	var txt = c.substring ( ini, c.length - 2 );
	var tam = 0;
	var bol = 0;
	var aux1 = "";
	var aux2 = "";
	var x0, x1, y0, y1;
	var fill = false;

	if ( c.indexOf("{IMG:") == 0 )
		{
		pr.setPhoto ( fileSystem.GetSpecialFolder ( 2 ) + "\\" + txt );
		}

	else if ( c.indexOf("{TXT:") == 0 )
		{
		if ( txt.indexOf("|SIZE:") > 0 )
			{
			aux1 = txt.substring ( 0, txt.indexOf("|SIZE:") );
			aux2 = txt.substring ( txt.indexOf("|SIZE:") + 6 );
			tam  = parseInt ( aux2 ).toString ( );
			txt  = aux1 + aux2.substring ( tam.length );
			}
		if ( txt.indexOf("|BOLD:") > 0 )
			{
			aux1 = txt.substring ( 0, txt.indexOf("|BOLD:") );
			aux2 = txt.substring ( txt.indexOf("|BOLD:") + 6 );
			bol  = parseInt ( aux2 ).toString ( );
			txt  = aux1 + aux2.substring ( bol.length );
			}
		if ( tam )
			{
			if ( bol ) pr.setText ( txt, tam, bol );
			else       pr.setText ( txt, tam );
			}
		else
			{
			if ( bol ) pr.setText ( txt, 9, bol );
			else       pr.setText ( txt );
			}
		}

	else if ( c.indexOf("{BAR:") == 0 )
		{
		pr.setBarCode ( txt );
		}

	else if ( c.indexOf("{LIN:") == 0 )
		{
		aux1 = txt.split ( "," );
		x0   = parseInt ( aux1 [ 0 ] );
		y0   = parseInt ( aux1 [ 1 ] );
		x1   = parseInt ( aux1 [ 2 ] );
		y1   = parseInt ( aux1 [ 3 ] );
		pr.setLine ( x0, y0, x1, y1 );
		}

	else if ( c.indexOf("{SQR:") == 0 )
		{
		aux1 = txt.split ( "," );
		x0   = parseInt ( aux1 [ 0 ] );
		y0   = parseInt ( aux1 [ 1 ] );
		x1   = parseInt ( aux1 [ 2 ] );
		y1   = parseInt ( aux1 [ 3 ] ); // radio
		if ( aux1.length == 5 ) fill = ( aux [ 4 ] = "1" ); // relleno
		pr.setSquare ( x0, y0, x1, y1, fill );
		}

	else if ( c.indexOf("{CIR:") == 0 )
		{
		aux1 = txt.split ( "," );
		x0   = parseInt ( aux1 [ 0 ] );
		y0   = parseInt ( aux1 [ 1 ] );
		aux2 = parseInt ( aux1 [ 2 ] ); // radio
		if ( aux1.length == 4 ) fill = ( aux [ 3 ] = "1" ); // relleno
		pr.setCircle ( x0, y0, aux2, fill );
		}

	}
</script>