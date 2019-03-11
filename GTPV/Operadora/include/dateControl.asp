
<%
if dateI  = "" then dateI  = "mini"
if dateP  = "" then dateP  = "absolute"
if dateX  = "" then dateX  = "10"
if dateY  = "" then dateY  = "5"
if dateV  = "" then dateV  = "visible"
if dateJS = "" then dateJS = "makeSelection ( document.buffer );"
%>

<img src="<%=IMGSREC%><%=iif(dateI="mini","fecha","fecha2")%>.gif" name="displayFecha" border="0" style="position:<%=dateP%>;top:<%=dateY%>;left:<%=dateX%>;visibility:<%=dateV%>;" usemap="#botonesFecha">
<div id="fecha" style="position:<%=dateP%>;top:<%=dateY+30%>;left:<%=dateX+35%>;visibility:<%=dateV%>;font:large Verdana;color:#000080;"><%=formatdatetime(session("fecha"),2)%></div>
<div id="diasem" style="position:<%=dateP%>;top:<%=dateY+20%>;left:<%=dateX+35%>;visibility:<%=dateV%>;font:x-small Verdana;color:#000080;"><%=split(formatdatetime(session("fecha"),1),",")(0)%></div>

<map name="botonesFecha">
 <area shape="circle" coords="41,90,20"<%=events("menos();")%>>
 <area shape="circle" coords="169,90,20"<%=events("mas();")%>>
 <area shape="circle" coords="91,90,20"<%=events("hoy();")%>>
 <area shape="circle" coords="121,90,20"<%=events("hoy();")%>>
 <area shape="rect"   coords="91,70,121,110"<%=events("hoy();")%>>
<%if dateI = "big" then%>
 <area shape="circle" coords="41,132,20"<%=events("menosMes();")%>>
 <area shape="circle" coords="169,132,20"<%=events("masMes();")%>>
 <area shape="circle" coords="41,174,20"<%=events("menosAno();")%>>
 <area shape="circle" coords="169,174,20"<%=events("masAno();")%>>
 <area shape="circle" coords="140,218,20"<%=events("fAceptar();")%>>
 <area shape="circle" coords="69,218,20"<%=events("fAceptar();")%>>
 <area shape="rect"   coords="68,238,140,198"<%=events("fAceptar();")%>>
<%end if%>
</map>

<script>

function makeSelection ( w )
	{
	w.location = 'selectEquip.asp?fecha=' + fecha.innerHTML;
	}

function makeFormSelection ( f )
	{
	f.fecha.value = fecha.innerHTML;
	f.submit();
	}

// Avanza un día
function mas()
	{
	var f = fecha.innerHTML.toDate().tomorrow();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

// Retrocede un día
function menos()
	{
	var f = fecha.innerHTML.toDate().yesterday();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

// Se situa en el día actual
function hoy()
	{
	var f = new Date();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

<%if dateI = "big" then%>

// Avanza un mes
function masMes()
	{
	var f = fecha.innerHTML.split("/");
	//var m = parseInt ( f[1] );
	f[1]++;
	//m += 1;
	
	if ( f[1] > 12 )
	{
		f[1] = f[1] - 12;
		f[2] = parseInt ( f[2] ) + 1;
	}
	
	//f[1] = ( "0" + m.toString() ).right(2);
	f = f.join("/").toDate();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

// Retrocede un mes
function menosMes()
	{
	var f = fecha.innerHTML.split("/");
	//var m = parseInt ( f[1] );
	f[1]--;	
	//m -= 1;
	
	if ( f[1] < 1 )
	{
		f[1] = f[1] + 12;
		f[2] = parseInt ( f[2] ) - 1;
	}
	
	//f[1] = ( "0" + m.toString() ).right(2);
	f = f.join("/").toDate();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

// Avanza un año
function masAno()
	{
	var f = fecha.innerHTML.split("/");
	f[2] = parseInt ( f[2] ) + 1;
	f = f.join("/").toDate();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

// Retrocede un año
function menosAno()
	{
	var f = fecha.innerHTML.split("/");
	f[2] = parseInt ( f[2] ) - 1;
	f = f.join("/").toDate();
	fecha.innerHTML  = f.formatDateTime(2);
	diasem.innerHTML = f.weekDay();
	<%=dateJS%>
	}

 function fAceptar()
 	{
	<%=dateJS%>
	<%=dateOK%>
	}

<%end if%>

</script>