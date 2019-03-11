<%if pag = "recepcioMateries" then%>
<script>

  function cadReturn ( d )
  	{
	var f = document.retorno;
	var g = document.fCadTactil;
	if ( d == "" ) d = "01/" + g.mes.value + "/" + g.any.value;
	f.action          = "recepcioMateries.asp";
	f.modo.value      = "PARAMS";
	f.modoSave.value  = "CADUCIDAD";
	f.caducidad.value = d;
	f.submit ( );
	}

  function selectMes ( t, m )
  	{
	document.fCadTactil.mes.value = m;
	for ( var i=1; i<=12; i++ )
		eval ( "document.fCadTactil.bMes" + i ).className = "boton";
	t.className = "boton2";
	}

  function selectAny ( t )
  	{
	document.fCadTactil.any.value = t.value;
	for ( var i=1; i<=12; i++ )
		eval ( "document.fCadTactil.bAny" + i ).className = "boton";
	t.className = "boton2";
	}

</script>

<%end if%>

<table align="left" width="450">

 <form name="fCadTactil">

  <input type="Hidden" name="mes" value="<%=right(0 & month(session("fCad")),2)%>">
  <input type="Hidden" name="any" value="<%=year(session("fCad"))%>">
 
 <tr align="center">
  <td width="50"></td>
  <td class="titulo" width="200">Mes:</td>
  <td width="50"></td>
  <td class="titulo" width="200">Any:</td>
 </tr>
 
<%for i=1 to 12%>
 <tr>
  <td></td>
  <td><input type="Button" name="bMes<%=i%>" class="boton<%if i=month(session("fCad")) then%>2<%end if%>" style="width:100%;" value="<%=mesesCAT(i)%>" onclick="selectMes(this,'<%=right( 0 & i,2)%>');"></td>
  <td></td>
  <td><input type="Button" name="bAny<%=i%>" class="boton<%if i-1+year(session("fecha"))=year(session("fCad")) then%>2<%end if%>" style="width:100%;" value="<%=year(session("fecha"))+i-1%>" onclick="selectAny(this);"></td>
 </tr>
<%next%>

 <tr>
  <td></td>
  <td colspan="3"><input type="Button" class="boton" style="width:100%;" value="Aceptar" onclick="cadReturn('');"></td>
 </tr>

</table>

<table align="right" width="250">

 <tr align="center">
  <td class="titulo">Temps fixe:</td>
  <td width="50"></td>
 </tr>

 <tr>
  <td><input type="Button" class="boton<%if formatdatetime(dateadd("d",3,session("fecha")),2) = formatdatetime(session("fCad"),2) then%>2<%end if%>" style="width:100%;" value="3 Dies" onclick="cadReturn('<%=formatdatetime(dateadd("d",3,session("fecha")),2)%>');"></td>
  <td></td>
 </tr>

 <tr>
  <td><input type="Button" class="boton<%if formatdatetime(dateadd("ww",1,session("fecha")),2) = formatdatetime(session("fCad"),2) then%>2<%end if%>" style="width:100%;" value="1 Setmana" onclick="cadReturn('<%=formatdatetime(dateadd("ww",1,session("fecha")),2)%>');"></td>
  <td></td>
 </tr>

 <tr>
  <td><input type="Button" class="boton<%if formatdatetime(dateadd("d",15,session("fecha")),2) = formatdatetime(session("fCad"),2) then%>2<%end if%>" style="width:100%;" value="15 Dies" onclick="cadReturn('<%=formatdatetime(dateadd("d",15,session("fecha")),2)%>');"></td>
  <td></td>
 </tr>

 </form>

</table>

