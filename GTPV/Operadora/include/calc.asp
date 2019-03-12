<script>
 var modoCalc = 0;

 function c(n)
 	{
	
	var f = document.fCalc;

<%if pag = "tabla" then%>
	var t=quienFoco();
	var i=getIJ(t,'i');
	var j=getIJ(t,'j');
<%end if%>

	switch(n)
		{

		case 'ok':
<%if isYear then%>
			calAnyOk ( f.resultado.value );
<%elseif pag = "tabla" then%>
			tabla.children[0].children[i-art0+2].children[j-cli0+2].innerHTML = f.resultado.value;
			qs[i][j] = eval(f.resultado.value.split(",").join("."));
			save(t,i,j);
<%elseif pag = "factor" then%>
			location = "changeGrupo.asp?sec=save&factor=" + f.resultado.value + "&art=<%=art%>&pag=<%=page%>&eq=<%=eq%>&via=<%=via%>&grup=<%=grup%>";
<%elseif pag = "etiquetas" then%>
			location = "<%=ROOTREC%>print/etiquetas.asp?sec=save&art=<%=art%>&client=<%=cli%>&modo=<%=modo%>&qua=" + f.resultado.value;
<%elseif pag = "confImpresora" then%>
			port(f.resultado);
<%elseif pag = "facturar" then%>
			if ( modoCalc == 0 )
				{
				document.buffSave.location = "<%=ROOTREC%>facturar/Save.asp?modo=SAVE&qd=" + f.resultado.value + "&cliente=" + document.facturas.cliente.value + "&newArt=" + document.facturas.articulo.value + "&viaje=" + document.facturas.viaje.value + "&equipo=" +  document.facturas.equipo.value;
				}
			else if ( modoCalc == 1 )
				{
				document.fBalanza.tara.value = f.resultado.value;
				document.buffArt.showBalanza();
				}
			else if ( modoCalc == 2 )
				{
				document.fBalanza.plus.value = f.resultado.value;
				document.buffArt.showBalanza();
				}
			calc1.style.visibility = H;
			calc2.style.visibility = H;
<%elseif pag = "recepcioMateries" then%>
			var f = document.retorno;
			f.<%if name = "etiq" then%>etiq<%elseif name="preu" then%>preu<%else%>cantidad<%end if%>.value = document.fCalc.resultado.value.split(",").join(".");
			calc1.style.visibility=H;
			calc2.style.visibility=H;
			f.modo.value = <%if name = "etiq" then%>"PARAMS"<%else%>"SENSEC"<%end if%>;
			f.submit();
<%elseif pag = "recepcioMateriesParams" then%>
			var f = document.retorno;
			f.nEtiq.value = document.fCalc.resultado.value.split(",").join(".");
			calc1.style.visibility=H;
			calc2.style.visibility=H;
			f.submit();
<%elseif pag = "autovenda" then%>
			var f = document.retorno;
			f.<%if name = "inicial" then%>inicial<%elseif name="recaudat" then%>recaudat<%else%>final<%end if%>.value = document.fCalc.resultado.value.split(",").join(".");
			calc1.style.visibility=H;
			calc2.style.visibility=H;
			f.modo.value = <%if name = "inicial" then%>"SENSEC"<%else%>"SENSEC"<%end if%>;
			f.submit();
<%elseif pag = "appccRecepcionSacar" then%>
			var f = document.escaner;
			f.cod.value = document.fCalc.resultado.value;
			hideCalc ( );
			f.submit ( );
<%else%>
			location = "devoluciones.asp?sec=4&w=<%=w%>&art=<%=articulo%>&cli=<%=cliente%>&qt="+f.resultado.value;
<%end if%>
			break;

		case 'no':
<%if isYear then%>
			calAnyNo ( );
<%elseif pag = "tabla" or pag = "facturar" then%>
			calc1.style.visibility=H;
			calc2.style.visibility=H;
<%elseif pag = "factor" then%>
			location = "editMasas.asp?sec=viatges&pag=<%=page%>&eq=<%=eq%>&via=<%=via%>&art=<%=art%>";
<%elseif pag = "etiquetas" then%>
			location = "<%=ROOTREC%>print/etiquetas.asp?sec=articles&pag=<%=p%>";
<%elseif pag = "confImpresora" then%>
			calc2.style.visibility = 'hidden';
			divPORT.style.visibility = 'hidden';
<%elseif pag = "recepcioMateries" then%>
			cancelar();
<%elseif pag = "appccRecepcionSacar" then%>

<%else%>
			location = "devoluciones.asp?sec=2&w=<%=w%>&cli=<%=cliente%>"
<%end if%>
			break;
<%if pag = "tabla" then%>
		case 'tot':
			f.resultado.value = qd[i][j];
			break;
<%end if%>

		case 'c':
			f.resultado.value = "";
			break;

		default:
			f.resultado.value += n;
		
		}

	selEndCalc ( );
	
	}
	
function selEndCalc ( )
	{
	var r = document.fCalc.resultado.createTextRange ( );
	r.scrollIntoView(false)
	}
</script>

<%
' Esta tabla sirve para que no se puedan tocar los botones que quedan debajo de la calculadora, para mostrarla:
'	tapadera.style.visibility = "visible";
%>
<table width="100%" height="100%" id="tapadera" style="position:absolute;top:0;left:0;visibility:hidden;">
 <tr>
  <td>&nbsp;</td>
 </tr>
</table>

<form name="fCalc">
<table border="0" style="position:absolute;top:200;left:500;visibility:hidden;" cellpadding="0" cellspacing="0" id="calc1">
 <tr>
  <td><img src="<%=IMGSREC%>teclado/calculadora.gif" width="209" height="382" border="0"></td>
 </tr>
</table>
<table border="0" style="position:absolute;top:218;left:513;visibility:hidden;" id="calc2">
 <tr>
  <td colspan="3" align="center"><input type="Text" class="calculator" name="resultado" value="<%=valorCalc%>"></td>
 </tr>
 <tr>
  <td colspan="3" height="8"></td>
 </tr>
 <tr>
  <td><img src="<%=IMGSREC%>teclado/7.gif" width="57" height="57" border="0"<%=events("c(7);")%>></td>
  <td><img src="<%=IMGSREC%>teclado/8.gif" width="57" height="57" border="0"<%=events("c(8);")%>></td>
  <td><img src="<%=IMGSREC%>teclado/9.gif" width="57" height="57" border="0"<%=events("c(9);")%>></td>
 </tr>
 <tr>
  <td><img src="<%=IMGSREC%>teclado/4.gif" width="57" height="57" border="0"<%=events("c(4);")%>></td>
  <td><img src="<%=IMGSREC%>teclado/5.gif" width="57" height="57" border="0"<%=events("c(5);")%>></td>
  <td><img src="<%=IMGSREC%>teclado/6.gif" width="57" height="57" border="0"<%=events("c(6);")%>></td>
 </tr>
 <tr>
  <td><img src="<%=IMGSREC%>teclado/1.gif" width="57" height="57" border="0"<%=events("c(1);")%>></td>
  <td><img src="<%=IMGSREC%>teclado/2.gif" width="57" height="57" border="0"<%=events("c(2);")%>></td>
  <td><img src="<%=IMGSREC%>teclado/3.gif" width="57" height="57" border="0"<%=events("c(3);")%>></td>
 </tr>
 <tr>
  <td><img src="<%=IMGSREC%>teclado/0.gif" width="57" height="57" border="0"<%=events("c(0);")%>></td>
<%if pag <> "appccRecepcionSacar" then%>
  <td><img src="<%=IMGSREC%>teclado/coma.gif" width="57" height="57" border="0"<%=events("c(',');")%>></td>
<%end if%>
  <td><img src="<%=IMGSREC%>teclado/c.gif" width="57" height="57" border="0"<%=events("c('c');")%>></td>
 </tr>
 <tr>
  <td><img src="<%=IMGSREC%>teclado/okc.gif" width="57" height="57" border="0"<%=events("c('ok');")%>></td>
  <td><img src="<%=IMGSREC%>teclado/noc.gif" width="57" height="57" border="0"<%=events("c('no');")%>></td>
  <td><%if pag = "tabla" then%><img src="<%=IMGSREC%>teclado/tot.gif" width="57" height="57" border="0"<%=events("c('tot');")%>><%end if%></td>
 </tr>
</table>
</form>
