<script>
 function bal(n,m)
 	{

	switch(n)
		{

		case 'ok':
			document.buffSave.location = "<%=ROOTREC%>facturar/Save.asp?modo=SAVE&qd=" + m + "&cliente=" + document.facturas.cliente.value + "&newArt=" + document.facturas.articulo.value + "&viaje=" + document.facturas.viaje.value + "&equipo=" +  document.facturas.equipo.value;
//			balanza1.style.visibility = H;
//			balanza2.style.visibility = H;			
			break;

		case 'no':
			balanza1.style.visibility=H;
			balanza2.style.visibility=H;
			break;

		case 'c':
			document.fBalanza.peso.value = "";
			break;

		case 'calc':
			bal('no');
			check(document.imgCheck1);
			document.buffArt.showEnterData(m);
			break;

		}

	}
</script>
<form name="fBalanza">
<table border="0" style="position:absolute;top:200;left:500;visibility:hidden;" cellpadding="0" cellspacing="0" id="balanza1">
 <tr>
  <td><img src="<%=IMGSREC%>teclado/balanza.gif" width="209" height="260" border="0"></td>
 </tr>
</table>
<table border="0" style="position:absolute;top:216;left:500;visibility:hidden;" cellpadding="1" id="balanza2" width="200">
 <tr>
  <td colspan="2" align="center"><input type="Text" class="calculator" name="peso" value="<%=valorCalc%>"></td>
 </tr>
 <tr>
  <td rowspan="2"><img src="<%=IMGSREC%>teclado/calc.gif" width="57" height="57" border="0"<%=events("bal('calc',1);")%>></td>
  <td style="color:#ffffff;" align="center"><b>TARA:</b></td>
 </tr>
 <tr>
  <td><input type="Text" class="calculator" name="tara" value="0" style="width:80;"></td>
 </tr>
 <tr>
  <td rowspan="2"><img src="<%=IMGSREC%>teclado/calc.gif" width="57" height="57" border="0"<%=events("bal('calc',2);")%>></td>
  <td style="color:#ffffff;" align="center"><b>PLUS:</b></td>
 </tr>
 <tr>
  <td><input type="Text" class="calculator" name="plus" value="0" style="width:80;"></td>
 </tr>
 <tr>
  <td colspan="2" height="8"></td>
 </tr>
 <tr align="center">
  <td colspan="2"><img src="<%=IMGSREC%>teclado/noc.gif" width="57" height="57" border="0"<%=events("bal('no');")%>></td>
 </tr>
</table>
</form>
