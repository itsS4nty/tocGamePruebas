
<script>

 function check ( t )
 	{
	var c = document.entrada.siempre;
	if ( c.value == "on" )
		{
		t.src   = off.src;
		c.value = "off";
		}
	else
		{
		t.src   = on.src;
		c.value = "on";
		}
	}

 function borrar ( )
 	{
	var e = document.entrada;
	e.user.value    = "";
	e.pass.value    = "";
	e.siempre.value = "on";
	document.imgCheck.src = on.src;
	}

 function entrar ( )
 	{
	document.entrada.w.value = screen.width;
	document.entrada.submit ( );
	}

 var enviaTeclado = false;
 
 function retornaValores ( q )
 	{
	if ( q == "kUSER" )
		document.entrada.user.value = document.tecladokUSER.kUSER.value;
	else
		document.entrada.pass.value = document.tecladokPASS.kPASS.value;
	hideKBD ( q );
	}

</script>

<img src="<%=IMGSREC%>checkon.gif" width="54" height="54" border="0" id="on" style="visibility:hidden;position:absolute;">
<img src="<%=IMGSREC%>checkoff.gif" width="54" height="54" border="0" id="off" style="visibility:hidden;position:absolute;">

<table width="100%" height="100%" style="position:absolute;top:0;left:0;">
 <tr>
  <td align="right" height="54"><img src="<%=IMGSREC%>salir.gif" width="54" height="54" border="0"<%=events("showMsgTactil('ShutDown');")%> hspace="50"></td>
 </tr>
 <tr>
  <td align="center" valign="middle">
   <form name="entrada" action="inicial.asp" method="post">
    <input type="Hidden" name="siempre" value="on">
	<input type="Hidden" name="w">
    <table width="800" height="600">
     <tr>
      <td align="center" valign="middle">
       <table>
	    <tr>
		 <td colspan="2">Empressa:</td>
		</tr>
        <tr>
         <td><input type="text" value="<%=session("Usuari_Empresa_Nom")%>" name="user" class="txt"></td>
         <td><img src="<%=IMGSREC%>teclado.gif" width="54" height="54" border="0" <%=events("nombreDelCampo='kUSER';nombreDelForm='tecladokUSER';showKBD('kUSER');")%>></td>
        </tr>
	    <tr>
		 <td colspan="2">Contrasenya:</td>
		</tr>
        <tr>
         <td><input type="password" value="<%=session("Usuari_Empresa_Password")%>" name="pass" class="txt"></td>
         <td><img src="<%=IMGSREC%>teclado.gif" width="54" height="54" border="0"<%=events("nombreDelCampo='kPASS';nombreDelForm='tecladokPASS';showKBD('kPASS');")%>></td>
        </tr>
        <tr>
         <td class="titulo">Memoritzar dades:</td>
         <td><img name="imgCheck" src="<%=IMGSREC%>checkon.gif" width="54" height="54" border="0"<%=events("check(this);")%>></td>
        </tr>
        <tr>
         <td colspan="2" align="center">
          <img src="<%=IMGSREC%>teclado/si.gif" width="87" height="57" border="0"<%=events("entrar();")%>>
          <img src="<%=IMGSREC%>teclado/no.gif" width="86" height="57" border="0"<%=events("borrar();")%>>
         </td>
        </tr>
       </table>
      </td>
     </tr>
    </table>
   </form>
  </td>
 </tr>
</table>

<%
mult   = true
name   = "kUSER"
inp    = "text"
action = "javascript:retornaValores('" & name & "');"
%>
<!-- #include virtual="/Facturacion/include/teclado.asp" -->

<%
name   = "kPASS"
inp    = "password"
action = "javascript:retornaValores('" & name & "');"
%>
<!-- #include virtual="/Facturacion/include/teclado.asp" -->