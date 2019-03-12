<%@LANGUAGE="VBSCRIPT"%>

<!--#include virtual="/Facturacion/include/global.asp"-->
<!-- #include virtual="/Facturacion/include/recuperaSesion.asp" -->
<html>
<head>
 <%
	Variable = request.item("Variable")
	Titol    = request.item("Titol")
	StrCorrecte= request.item("StrCorrecte")
	
  %>
 <%=setTit ( "Appcc", "TempetaruresPop" )%>
 <%=setCss ( )%>

 <script>
StrCorrecte = '<%=StrCorrecte%>';
// Temperatura
function temp(c)
  	{
	var aux = "";
	var t = document.te.temperatura;
	if ( c == 'S' )
		{
		if ( t.value.charAt(0) == '-' ) t.value = t.value.substring(1);
		else t.value = "-" + t.value;
		}
	else if ( c == 'D' )
		{
		if ( t.value.indexOf('.5º') > -1 ) t.value = t.value.replace('.5','');
		else t.value = t.value.replace('º','.5º');
		}
	else
		{
		aux = ( t.value.charAt(0) == '-' ) ? '-' : '';
		if ( t.value.indexOf('.5º') > -1 ) t.value = aux + c + ".5º";
		else t.value = aux + c + "º";
		}
	}
	
function Correcte()
	{
	eval(StrCorrecte);
	self.close();
	}

</script>
<Form name="te" >
<table cellpadding="0" cellspacing="0" border="0"  width="100%"  align="center">

<Tr>
  <td ><input type="Button" class="boton" style="width:75;font:bold;height:80;" value="Si" onclick="Correcte();;"></td>
  <td align="center" class="titulo" colspan="5">Temperatura <%=Titol%></td>
  <td ><input type="Button" class="boton" style="width:75;font:bold;height:80;" value="No" onclick="self.close();"></td>
</Tr>


<%
	for i=10 to 0 step -1
		R = cstr(hex((i*16)\10))
		if len(R)>1 then R = "F"
		B = cstr(hex(((10-i)*16)\10))
		if len(B)>1 then B = "F"
		%><tr ><% 
			%><td></td><td></td><%
		
		%><td><input type="Button" class="botonBlanco" style="width:75;background:#<%=R%><%=R%>00<%=B%><%=B%>;" value="<%=i%>º" onclick="temp(<%=i%>);"></td><%

		if i=10 then 
			%><td rowspan="2" ><input type="Button" class="boton" style="width:75;font:bold;height:80;" value="+ / -" onclick="temp('S');"></td><%
		end if 	

		if i=8 then  
			%><td rowspan="2"><input type="Button" class="boton" style="width:75;font:bold;height:80;" value="+ 0.5" onclick="temp('D');"></td><% 
		end if 

		if i=6 then  
			%><td class="titulo" colspan="2"><input type="Text" name="temperatura" class="txt" style="text-align:right;width:150;height:40;" readonly="yes" value="<%=Temp%>"></td> <%
		end if 
		
		%></tr><%
	next
	
%></table>
</Form >
