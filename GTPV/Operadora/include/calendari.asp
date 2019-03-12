<%if pag = "recepcioMateries" then%>
<script>

 function calMesMenos()
 	{
	var f = document.retorno;
	f.action          = "recepcioMateries.asp";
	f.modo.value      = "CADU";
	f.caducidad.value = "<%=formatdatetime(dateadd("m",-1,fCad),2)%>";
	f.submit();
	}

  function calMesMas()
  	{
	var f = document.retorno;
	f.action          = "recepcioMateries.asp";
	f.modo.value      = "CADU";
	f.caducidad.value = "<%=formatdatetime(dateadd("m",1,fCad),2)%>";
	f.submit();
	}

  function calAny ( )
  	{
	document.fCalc.resultado.value = document.calendarioTactil.btnAny.value;
	tapadera.style.visibility = V;
	calc1.style.visibility    = V;
	calc2.style.visibility    = V;
	}

  function calAnyOk ( a )
  	{
	var f = document.retorno;
	var d = "<%=formatdatetime(fCad,2)%>".split("/");
	d[2] = a;
	f.action          = "recepcioMateries.asp";
	f.modo.value      = "CADU";
	f.caducidad.value = d.join("/");
	f.submit();
	}

  function calAnyNo ( )
  	{
	tapadera.style.visibility = H;
	calc1.style.visibility    = H;
	calc2.style.visibility    = H;
	}

  function calReturn(d)
  	{
	var f = document.retorno;
	f.action          = "recepcioMateries.asp";
	f.modo.value      = "PARAMS";
	f.caducidad.value = d;
	f.submit();
	}

</script>
<%end if%>

 <form name="calendarioTactil">
 <tr valign="middle">
  <%if pag = "recepcioMateries" then%><td align="left"><input type="Button" class="boton" style="width:100%;" value="<<" onclick="calMesMenos();"></td><%end if%>
  <td colspan="<%=iif(pag = "recepcioMateries",5,7)%>" class="titulo" height="20" align="center"><%=mesesCAT(mes)%>&nbsp;<input type="Button" class="boton" style="width:100;" value="<%=any%>" onclick="calAny();" name="btnAny"></td>
  <%if pag = "recepcioMateries" then%><td align="right"><input type="Button" class="boton" style="width:100%;" value=">>" onclick="calMesMas();"></td><%end if%>
 </tr>
 </form>

 <tr>
<%	for i=2 to 8%>
  <td class="titulo<%if i=8 then%>R<%end if%>" height="20" align="center"><%=diaSemanaDia(i)%></td>
<%	next%>
 </tr>
 <tr>
<%
	f = cdate("1/" & mes & "/" & any)
	i = 1
	while i < weekday(f,2)
%>
   <td align="center">&nbsp;</td>
<%
		i = i + 1
	wend
	while month(f)=mes
%>
   <td align="center"><input class="boton<%if selected=day(f) then%>2<%elseif weekday(f,2)=7 then%>4<%end if%>" type="Button" style="width:100%;height:100%;" value="<%=day(f)%>"<%=events("calReturn('" & formatdatetime(f,2) & "');")%>></td>
<%
		f = dateadd("d",1,f)
		if weekday(f,2)=1 then
%>
  </tr>
  <tr>
<%
		end if
	wend
%>
 </tr>
 
<%
isYear    = true
tapadera  = true
valorCalc = any
%>

<!-- #include virtual="/Facturacion/include/calc.asp" -->