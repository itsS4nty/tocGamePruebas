<%if position = "" then position = "absolute"%>

<script>
 var nombreDelCampo = '<%=name%>';
 var nombreDelForm  = 'teclado<%if mult then%><%=name%><%end if%>';

 function showKBD ( <%if mult then%>KBD<%end if%> )
 	{
<%if mult then%>
	nombreDelCampo = KBD;//añadido para poder trabajar con varios teclados a la vez
	nombreDelForm  = 'teclado'+KBD;//31/05/07
	eval ( "KBD" + KBD ).style.visibility = "visible";
<%else%>
	KBD.style.visibility = "visible";
<%end if%>
	}

 function hideKBD ( <%if mult then%>KBD<%end if%> )
 	{
<%if mult then%>
	eval ( "KBD" + KBD ).style.visibility = "hidden";
<%else%>
	KBD.style.visibility = "hidden";
<%end if%>
	}

</script>

<script id="jsKBD" src="<%=SCRIPTS%>teclado2.js"></script>

<table cellpadding="0" cellspacing="0" border="0" align="center" id="KBD<%if mult then%><%=name%><%end if%>" style="visibility:hidden;<%if position = "absolute" then%>position:absolute;top:0;left:0;<%end if%>" width="100%" height="100%" bgcolor="#ffffff">
 <tr>
  <td align="center" class="titulo" id="tituloKBD"><%=tit%></td>
 </tr>
 <tr>
  <td align="center">
   <form name="teclado<%if mult then%><%=name%><%end if%>"<%if onsubmit<>"" then%> onsubmit="<%=onsubmit%>"<%end if%> method="<%if metodo<>"" then%><%=metodo%><%else%>post<%end if%>" action="<%=action%>"<%if target<>"" then%> target="<%=target%>"<%end if%>>
    <input type="Hidden" name="origen" value="<%=origen%>">
    <input type="Hidden" name="id" value="<%=id%>">
    <input type="Hidden" name="loc" value="<%=loc%>">
    <table cellpadding="0" cellspacing="0" border="0">
     <tr>
      <td bgcolor="#ffffff">
	  <%if ucase(inp) = "TEXTAREA" then%>
      <textarea name="<%=name%>" class="teclado" onselectstart="return false;" readonly><%=value%></textarea>
	  <%else%>
      <input type="<%=inp%>" name="<%=name%>" value="<%=value%>" class="teclado" onselectstart="return false;" readonly="yes">
	  <%end if%>
      </td>
     </tr>
    </table>
   </form>
  </td>
 </tr>
 <tr>
  <td><br></td>
 </tr>
 <tr>
  <td align="center">
   <table cellpadding="0">
    <tr>
     <td width="27"></td>
<%for i=1 to 9%>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="<%=i%>" class="boton" <%=events("k(this);")%>></td>
<%next%>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="0" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="!" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="?" class="boton" <%=events("k(this);")%>></td>
    </tr>
   </table>

   <table cellpadding="0">
    <tr>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="Q" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="W" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="E" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="R" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="T" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="Y" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="U" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="I" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="O" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="P" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="Ç" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:86;height:57;font:bold medium;background:#ffcc00 url(<%=IMGSREC%>teclado/bo_.gif) no-repeat center;" value="" name="BACK" class="boton" <%=events("k(this);")%>></td>
    </tr>
   </table>

   <table cellpadding="0">
    <tr>
     <td width="27"></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="A" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="S" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="D" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="F" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="G" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="H" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="J" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="K" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="L" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="Ñ" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="$" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:86;height:57;font:bold x-small;" value="Bloq<%=vbcrlf%>Mayus" name="BLOQ" class="boton" <%=events("k(this);")%>></td>
    </tr>
   </table>

   <table cellpadding="0">
    <tr>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="@" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="Z" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="X" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="C" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="V" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="B" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="N" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="M" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="-" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="+" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="/" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="*" class="boton" <%=events("k(this);")%>></td>
    </tr>
   </table>

   <table cellpadding="0">
    <tr>
     <td><input type="Button" style="width:86;height:57;font:bold medium;background:#ffcc00 url(<%=IMGSREC%>teclado/no_.gif) no-repeat center;<%if position = "relative" then%>visibility:hidden;<%end if%>" value="" name="NO" id="NO" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="(" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value=")" class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:293;height:57;font:bold medium;" value=" " class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="," class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:57;height:57;font:bold medium;" value="." class="boton" <%=events("k(this);")%>></td>
     <td><input type="Button" style="width:86;height:57;font:bold medium;background:#ffcc00 url(<%=IMGSREC%>teclado/si_.gif) no-repeat center;<%if position = "relative" then%>visibility:hidden;<%end if%>" value="" name="SI" id="SI" class="boton" <%=events("k(this);")%>></td>
    </tr>
   </table>
  </td>
 </tr>
</table>
