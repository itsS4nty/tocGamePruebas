<script>

// Muestra una alerta para la tactil:
//	n:	Nombre de la alerta
//	f:	[opcional] función que se ejecutará pasado un tiempo
//	t:	[opcional] tiempo que tardará en ejecutarse la función (milisegundos)
function showMsgTactil ( n, f, t )
	{
	eval("msgTabla" + n).style.visibility = "visible";
	if ( t ) setTimeout ( f, t );
	}

// Oculta una alerta para la tactil:
//	n:	Nombre de la alerta
function hideMsgTactil ( n )
	{
	eval("msgTabla" + n).style.visibility = "hidden";
	}

// Cambia el texto y los botones de una alerta para la tactil:
//	n:	Nombre de la alerta
//	t:	Texto nuevo
//	b:	Botones nuevos
//	s:	Tipo de espaciado
function changeMsg ( n, t, b, s )
	{
	changeMsgText ( n, t );
	changeMsgBtn  ( n, b, s );
	}

// Cambia el texto de una alerta para la tactil:
//	n:	Nombre de la alerta
//	t:	Texto nuevo
function changeMsgText ( n, t )
	{
	eval("msgTexto" + n).innerHTML = t;
	}

// Cambia los botones de una alerta para la tactil:
//	n:	Nombre de la alerta
//	b:	Botones nuevos
//	s:	Tipo de espaciado
function changeMsgBtn ( n, b, s )
	{
	var t   = "";
	if ( b != "" )
		{
		var btn = b.split ( "|" );
		for ( var i=0; i<btn.length; i+=2 )
			{
			t += '<input type="Button" class="titulo" value="' + btn[i] + '" style="width:200;background:#0080ff;" onclick="' + btn[i+1] + '">';
			if ( s.toUpperCase ( ) == "SP" )      t += "&nbsp;&nbsp;&nbsp;";
			else if ( s.toUpperCase ( ) == "BR" ) t += "<br>";
			}
		}
	eval ( "msgBtn" + n ).innerHTML = t;
	}

</script>

<%
' msgTactil(name,txt,vec,sp) :
'	name -> Nombre del objeto creado para poder acceder a el desde JavaScript
'	txt  -> Texto a mostrar en la alerta
'	vec  -> Vector de botones: texto_botón_1|JS_botón_1|texto_botón_2|JS_botón_2|...|texto_botón_N|JS_botón_N
'	sp   -> Tipo de espacio entre botones: BR -> Vertical, SP -> Horizontal
function msgTactil ( name, txt, vec, sp )

	vec = split(vec,"|")

	msgTactil = "<table id=""msgTabla" & name & """ border=""0"" style=""position:absolute;top:0;left:0;visibility:hidden;"" width=""100%"" height=""100%"">" & vbcrlf
	msgTactil = msgTactil & " <tr>" & vbcrlf
	msgTactil = msgTactil & "  <td align=""center"" valign=""middle"">" & vbcrlf
	msgTactil = msgTactil & "   <table width=""500"" height=""300"" bgcolor=""#000000"" cellspacing=""1"">" & vbcrlf
	msgTactil = msgTactil & "    <tr bgcolor=""#ffcc00"">" & vbcrlf
	msgTactil = msgTactil & "	  <td class=""titulo"" align=""center"" valign=""middle"">" & vbcrlf
	msgTactil = msgTactil & "      <br><span id=""msgTexto" & name & """>" & txt & "</span>" & vbcrlf
	msgTactil = msgTactil & "     </td>" & vbcrlf
	msgTactil = msgTactil & "	 </tr>" & vbcrlf
	msgTactil = msgTactil & "	 <tr bgcolor=""#ffcc00"">" & vbcrlf
	msgTactil = msgTactil & "	  <td class=""titulo"" align=""center"" valign=""middle"" height=""50"" id=""msgBtn" & name & """>" & vbcrlf
	for i=0 to ubound(vec) step 2
		msgTactil = msgTactil & "	   <input type=""Button"" class=""titulo"" value=""" & vec(i) & """ style=""width:200;background:#0080ff;""" & events(vec(i+1)) & ">" & vbcrlf
		if i<ubound(vec) then
			if sp = "SP" then
				msgTactil = msgTactil & "	   &nbsp;&nbsp;&nbsp;" & vbcrlf
			elseif sp = "BR" then
				msgTactil = msgTactil & "	   <br>" & vbcrlf
			end if
		end if
	next
	msgTactil = msgTactil & "	  </td>" & vbcrlf
	msgTactil = msgTactil & "	 </tr>" & vbcrlf
	msgTactil = msgTactil & "   </table>" & vbcrlf
	msgTactil = msgTactil & "  </td>" & vbcrlf
	msgTactil = msgTactil & " </tr>" & vbcrlf
	msgTactil = msgTactil & "</table>" & vbcrlf

end function
%>
