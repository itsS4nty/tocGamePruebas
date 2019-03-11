
<script>

function TogleCalc() {
	if (calc1.style.visibility == "visible")
	{CalcHidden();}
	else
	{CalcVisible();};
}

function CalcHidden(){
	calc1.style.visibility = "hidden";
	calc2.style.visibility = "hidden";
}

function CalcVisible(){
	calc1.style.visibility = "visible";
	calc2.style.visibility = "visible";
}

var modoCalc = 0;
var TotValor=0;
	
function c(n)
 	{
	var f = document.fCalc;
	switch(n)
		{
		case 'ok':
			ResultadoSi(document.fCalc.resultado.value);
			break;
		case 'no':
			ResultadoNo(document.fCalc.resultado.value);
		case 'tot':
			f.resultado.value = TotValor;
			break;
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
