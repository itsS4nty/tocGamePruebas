<html>

<head>

<%

PORTAL_CDP = "GR"

if PORTAL_CDP = "GR" then
	menuColor = "#315B3F"
	rollColor = "#70C18B"
elseif PORTAL_CDP = "FORN" then
	menuColor = "#224078"
	rollColor = "#95A1C3"
else
	menuColor = "#217B3F"
	rollColor = "#B2C891"
end if

function tituloSeccion ( byval tit, byval img )
	tituloSeccion = "<br><br><table><tr valign=""top""><td>&nbsp;&nbsp;&nbsp;</td><td>"
	tituloSeccion = tituloSeccion & "<img src=""" & img & """ width=""30"" height=""18"" alt=""CDP > " & tit & """ "
	tituloSeccion = tituloSeccion & "border=""0"" class=""img""></td>"
	tituloSeccion = tituloSeccion & "<td>&nbsp;</td><td><b>CDP > " & tit & "</b>"
	tituloSeccion = tituloSeccion & "<hr size=""1"" color=""" & menuColor & """ noshade></td></tr></table>"
end function

%>

<style>

body
	{
	margin: 0 0 0 0;
	scrollbar-face-color: <%=menuColor%>;
	scrollbar-arrow-color: #FFFFFF;
	font: xx-small Verdana;
	color: #000000;
	}

td
	{
	font: xx-small Verdana;
	color: #000000;
	}

.img
	{
	background: <%=menuColor%>;
	border: 1px solid <%=menuColor%>;
	}

.mano
	{
	cursor: hand;
	}

.imgMano
	{
	background: <%=menuColor%>;
	border: 1px solid <%=menuColor%>;
	cursor: hand;
	}

.negro
	{
	color: #000000;
	}

.fecha
	{
	color: #880000;
	}

.blanco
	{
	color: #ffffff;
	}

a
	{
	font: xx-small Verdana;
	color: #FFFFFF;
	text-decoration: none;
	}

a:hover
	{
	font: xx-small Verdana;
	color: #FFFFFF;
	text-decoration: underline;
	}

select, input
	{
	font: xx-small Verdana;
	color: <%=iif ( PORTAL_CDP = "FORN", "#000000", "#ffffff" )%>;
	background: <%=rollColor%>;
	}

.buffer
	{
	position: absolute;
	top: 0;
	left: 0;
	visibility: hidden;
	}

</style>

<script>

 var menuColor = "<%=menuColor%>";
 var rollColor = "<%=rollColor%>";

 function roll ( t )
 	{
	t.bgColor = rollColor;
	}

 function roll2 ( t, c )
 	{
	t.bgColor = c;
	}

 function res ( t )
 	{
	t.bgColor = "";
	}

 function res2 ( t )
 	{
	t.bgColor = menuColor;
	}

var contando = false;
var timerMenu = -1;

var popMenu = window.createPopup ( );

function showMenu ( n, t )
	{

   	var popBody = popMenu.document.body;
	var code    ='<table cellspacing="1" border="0" bgcolor="#FFFFFF" width="0" onselectstart="return false;">';

	for ( i=0; i<popMenuArray[n].length; i++ )
		{
		if ( popMenuArray[n][i][0] )
			{
			code += '<tr><td nowrap height="14" bgcolor="' + menuColor + '" style="cursor:hand;color:#ffffff;font:xx-small Verdana;" ';
			code += 'onmouseover="parent.roll(this);" onmouseout="parent.res2(this);" onclick="parent.goMenu(\'';
			code += popMenuArray[n][i][2] + '\');">';
			code += '<img src="' + popMenuArray[n][i][1] + '" width="30" height="18" alt="' + popMenuArray[n][i][0] + '" border="0" align="absmiddle">';
			code += '&nbsp;' + popMenuArray[n][i][0] + '</td></tr>';
			}
		}

	code += '</table>';

    popBody.innerHTML   = code;
	popBody.onmouseout  = new Function("timerMenu=200;if(!contando)counterMenu();");
	popBody.onmouseover = new Function("timerMenu=-1");
   	popMenu.show ( 0, 0, 0, 0, document.body );
	popMenu.show ( ( n * 180 ) + 1, tablaCabezera.offsetHeight, popBody.children[0].clientWidth, popBody.children[0].clientHeight, document.body );

	}

function hideMenu ( )
	{
	contando = false;
	timerMenu = -1;
	popMenu.hide();
	}

function counterMenu ( )
	{
	contando = true;
	if(!timerMenu)hideMenu();
	else if(timerMenu>0)timerMenu--;
	setTimeout("counterMenu()",1);
	}

var popMenuArray = new Array3 ( 3, 4, 3 );

function Array3(a,b,c)
	{
	A = new Array(a);
	for(var i=0;i<a;i++)
		{
		A[i] = new Array(b);
		for(var j=0;j<b;j++)A[i][j] = new Array(c);
		}
	return A;
	}

function goMenu ( p )
	{
	location = p;
	}

//Planificación
popMenuArray[0][0][0] = 'Planificación de horarios';
popMenuArray[0][0][1] = '<%=ICOSCDP%>Planificacion.gif';
popMenuArray[0][0][2] = '<%=ROOTCDP%>Planificacion/Planificacion.asp';
popMenuArray[0][1][0] = 'Listados';
popMenuArray[0][1][1] = '<%=ICOSCDP%>Listados.gif';
popMenuArray[0][1][2] = '<%=ROOTCDP%>Planificacion/Listados.asp';
popMenuArray[0][2][0] = 'Puntualidad';
popMenuArray[0][2][1] = '<%=ICOSCDP%>Puntualidad.gif';
popMenuArray[0][2][2] = '<%=ROOTCDP%>Planificacion/Puntualidad.asp';
popMenuArray[0][3][0] = '¿Quién trabaja ahora?';
popMenuArray[0][3][1] = '<%=ICOSCDP%>QuienAhora.gif';
popMenuArray[0][3][2] = '<%=ROOTCDP%>Planificacion/QuienAhora.asp';

//Horas
popMenuArray[1][0][0] = 'Horas por trabajador';
popMenuArray[1][0][1] = '<%=ICOSCDP%>Horas.gif';
popMenuArray[1][0][2] = '#';
popMenuArray[1][1][0] = 'Horas por periodo';
popMenuArray[1][1][1] = '<%=ICOSCDP%>Puntualidad.gif';
popMenuArray[1][1][2] = '#';
popMenuArray[1][2][0] = 'Cálculo de nóminas';
popMenuArray[1][2][1] = '<%=ICOSCDP%>Nominas.gif';
popMenuArray[1][2][2] = '#';
popMenuArray[1][3][0] = 'Imprimir pagos';
popMenuArray[1][3][1] = '<%=ICOSCDP%>Imprimir.gif';
popMenuArray[1][3][2] = '#';

//Planes de limpieza
popMenuArray[2][0][0] = 'Planificación de tareas';
popMenuArray[2][0][1] = '<%=ICOSCDP%>PlanificacionLimpieza.gif';
popMenuArray[2][0][2] = '<%=ROOTCDP%>APPCC/Planificacion.asp';
popMenuArray[2][1][0] = 'Revisión de tareas';
popMenuArray[2][1][1] = '<%=ICOSCDP%>RevisionTareas.gif';
popMenuArray[2][1][2] = '<%=ROOTCDP%>APPCC/Revision.asp';
popMenuArray[2][2][0] = 'Impresiones';
popMenuArray[2][2][1] = '<%=ICOSCDP%>Imprimir.gif';
popMenuArray[2][2][2] = '<%=ROOTCDP%>APPCC/Imprimir.asp';
popMenuArray[2][3][0] = 'Táctil';
popMenuArray[2][3][1] = '<%=ICOSCDP%>Tactil.gif';
popMenuArray[2][3][2] = '<%=ROOTCDP%>APPCC/Tactil.asp';

var ajustando = false;

function moveBar ( )
  	{
	ajustando = true;
	var dist = Math.abs ( tablaCabezera.style.pixelTop - document.body.scrollTop );
	var m = 1;
	if ( dist < 10 )
		m = 1;
	else if ( dist < 100 )
		m = 10;
	else
		m = 100;
	if ( tablaCabezera.style.pixelTop < document.body.scrollTop )
		tablaCabezera.style.pixelTop += m;
	else if ( tablaCabezera.style.pixelTop > document.body.scrollTop )
		tablaCabezera.style.pixelTop -= m;
	if ( tablaCabezera.style.pixelTop != document.body.scrollTop )
		setTimeout ( "moveBar()", 1 );
	else
		ajustando = false;
	}

</script>

</head>

<body bgcolor="#F8F5B6" onscroll="if(!ajustando)moveBar();">

<table width="100%" bgcolor="<%=menuColor%>" cellpadding="0" cellspacing="0" border="0" id="tablaCabezera" style="position:absolute;top:0;left:0;">

 <tr>
  <td colspan="14" height="1" bgcolor="#ffffff"></td>
 </tr>

 <tr>
  <td width="1" height="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td colspan="6"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
 </tr>

 <tr>
  <td width="1" height="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1"></td>
  <td colspan="6"></td>
  <td width="1"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
 </tr>

 <tr>
  <td bgcolor="#ffffff"></td>
  <td></td>
  <td></td>
  <td class="mano" width="180" onmouseover="roll(this);showMenu(0,this);" onmouseout="res(this);"><img src="<%=ICOSCDP%>Planificacion.gif" width="30" height="18" alt="Planificación" border="0" align="absmiddle">&nbsp;<span class="blanco">Planificación</span></td>
  <td class="mano" width="180" onmouseover="roll(this);showMenu(1,this);" onmouseout="res(this);"><img src="<%=ICOSCDP%>Horas.gif" width="30" height="18" alt="Horas" border="0" align="absmiddle">&nbsp;<span class="blanco">Horas</span></td>
  <td class="mano" width="180" onmouseover="roll(this);showMenu(2,this);" onmouseout="res(this);"><img src="<%=ICOSCDP%>PlanLimpieza.gif" width="30" height="18" alt="Planes de limpieza" border="0" align="absmiddle">&nbsp;<span class="blanco">Planes de limpieza</span></td>
  <td class="mano" width="180" onmouseover="roll(this);hideMenu();" onmouseout="res(this);"><img src="<%=ICOSCDP%>Tecnico.gif" width="30" height="18" alt="Equipo técnico" border="0" align="absmiddle">&nbsp;<span class="blanco">Equipo técnico</span></td>
  <td width="*">&nbsp;</td>
  <td class="mano" width="17" onmouseover="roll(this);hideMenu();" onmouseout="res(this);" align="center"><img src="<%=ICOSCDP%>Eliminar.gif" width="13" height="13" alt="Salir" border="0"></td>
  <td></td>
  <td></td>
  <td bgcolor="#ffffff"></td>
 </tr>

 <tr>
  <td width="1" height="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1"></td>
  <td colspan="6"></td>
  <td width="1"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
 </tr>

 <tr>
  <td width="1" height="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td colspan="6"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
  <td width="1" bgcolor="#ffffff"></td>
 </tr>
 <tr>
  <td colspan="12" height="1" bgcolor="#ffffff"></td>
 </tr>

</table>

