<%
function inputClock(val,name)
	inputCalendar = "<input type=""Button"" value=""" & val & """ onclick=""showClk(this.form." & name & ");"" class=""cal"" name=""btnClock" & name & """>"
	inputCalendar = inputCalendar & "<input type=""hidden"" value=""" & val & """ name=""" & name & """>"
	inputCalendar = inputCalendar & "<input type=""hidden"" value=""" & val & """ name=""includeClock" & name & """>"
end function
%>
<script>
var campo;
var popClk = window.createPopup();
var xClk,yClk;

function showClk(c,x,y)
	{
	var popBody = popClk.document.body;
	if(x && y)
		{
		xClk = x;
		yClk = y;
		}
	else if(event)
		{
		xClk = event.clientX - document.body.scrollLeft;
		yClk = event.clientY - document.body.scrollTop;
		}
	if(c)
		{
		campo = c;
		c = c.value.split(":");
		rellenaClk();
		}
	else
		{
		popBody.innerHTML = reloj.outerHTML;
   		popClk.show(0,0,0,0,document.body);
		popBody.children[0].style.visibility = "visible";
		popClk.show(xClk,yClk,popBody.children[0].clientWidth,popBody.children[0].clientHeight,document.body);
		}
	}

function hideClk()
	{
	popClk.hide();
	}

function rellenaClk()
	{

	hideClk();
	var row,cell;

	while(reloj.children[0].children.length>4)reloj.children[0].deleteRow();

	for(var i=0;i<11;i++)
		{
 		row = document.createElement("TR");
		row.align = "center";
		row.bGcolor ="#EEEEFF";
	  	for(var j=0;j<7;j++)
			{
			cell = document.createElement("TD");
			cell.style.cursor = "hand";
			cell.height = 20;
			cell.innerHTML = '<font id="dia' + ((6*i)+j+i) + '" onclick="parent.calReturn(this)" face="Verdana" size="1">&nbsp;</font></td>';
			row.appendChild(cell);
			}
		calendario.children[0].appendChild(row);
		}

	var F;
	var MES = FECHA.getMonth()+inc;
	var ANY = FECHA.getFullYear();
	
	if(MES<0)
		{
		MES += 12;
		ANY--;
		}
	else if(MES>11)
		{
		MES -= 12;
		ANY++;
		}
	
	FECHA = new Date(ANY,MES,1);
	var calFechaI = FECHA;
	nomMes.innerHTML = meses[MES] + " " + ANY;
	var calIni = calFechaI.getDay();
	if(!calIni)calIni = 7;
	var calFechaIni = calFechaI.dateAdd(1-calIni);
	var calLunIni = calFechaIni.getDate();
	var calF=calFechaI;

	for(var i=0;i<calIni-1;i++)
		{
		F = eval("dia" + i);
		F.color = "#95A1C3";
		F.parentElement.style.cursor = "default";
		F.innerHTML = calLunIni+i;
		}

	if(calIni>0)for(i=calIni-1;i<7;i++)
		{
	 	F = eval("dia" + i);
		F.color = "#000000";
		F.parentElement.style.cursor = "hand";
		F.innerHTML = calF.getDate();
		calF = calF.dateAdd(1);
		}

	while(i<43)
		{
		F = eval("dia" + i);
		if(calF.getMonth()!=calFechaI.getMonth())
			{
			F.color="#95A1C3";
			F.parentElement.style.cursor = "default";
			}
		else
			{
			F.color = "#000000";
			F.parentElement.style.cursor = "hand";
			}
		F.innerHTML = calF.getDate();
	 	calF = calF.dateAdd(1);
		i++;
		}

	while(calendario.children[0].children.length>10)calendario.children[0].deleteRow();

	showCal(false,xCal,yCal);
	}

function calReturn(t)
	{
	var INCLUDECALENDAR = eval("campo.form.includeCalendar" + campo.name);
	INCLUDECALENDAR.value=t.innerHTML + "/" + (FECHA.getMonth()+1) + "/" + FECHA.getFullYear();
	switch(queSeEnvia)
		{
		case "DATE":
			campo.value=INCLUDECALENDAR.value;
			break;

		case "DAY":
			campo.value=t.innerHTML;
			break;
			
		case "MONTH":
			campo.value=FECHA.getMonth()+1;
			break;
			
		case "YEAR":
			campo.value=FECHA.getFullYear();
			break;
			
		}
	eval("campo.form.btnCalendar" + campo.name).value = INCLUDECALENDAR.value;
	hideCal();
	if(seEnvia)eval("campo.form").submit();
	}

</script>
<table cellspacing="1" cellpadding="0" bgcolor="#000080" style="cursor:default;position:absolute;top:0;left:0;visibility:hidden;" id="calendario" width="218">
 <tr align="center" bgcolor="#EEEEFF">
  <td colspan="7">
   <table width="100%">
    <tr align="center">
	 <td style="cursor:hand;font-family:Webdings;" onClick="parent.calAnyMenos();">7</td>
     <td style="cursor:hand;font-family:Webdings;" onClick="parent.calMesMenos();">3</td>
     <td bgcolor="#95A1C3"><font size="1" face="Verdana"><b id="nomMes"><%=mesesCAT(month(now))%></b></font></td>
     <td style="cursor:hand;font-family:Webdings;" onClick="parent.calMesMas();">4</td>
     <td style="cursor:hand;font-family:Webdings;" onClick="parent.calAnyMas();">8</td>
	</tr>
   </table>
  </td>
 </tr>
 <tr>
  <td colspan="7" height="1"><img src="<%=ROOT%>/imagenes/trans.gif" width="1" height="1"></td>
 </tr>
 <tr align="center" style="color:#EEEEFF;">
  <td width="25" height="20"><font size="1" face="Verdana"><b>Dl</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dm</b></font></td><td width="25"><font size="1" face="Verdana"><b>Dx</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dj</b></font></td><td width="25"><font size="1" face="Verdana"><b>Dv</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Ds</b></font></td><td width="25"><font size="1" face="Verdana"><b>Dg</b></font></td>
 </tr>
 <tr>
  <td colspan="7" height="1"><img src="<%=ROOT%>/imagenes/trans.gif" width="1" height="1"></td>
 </tr>
<%
for i=0 to 10
 	response.write("<tr align=""center"" bgcolor=""#EEEEFF"">" & vbcrlf)
  	for j=0 to 6
		response.Write("<td height=""20"" onclick=""parent.calReturn(this)"" style=""cursor:hand;""><font id=""dia" & ((6*i)+j+i) & """ face=""Verdana"" size=""1"">&nbsp;</font></td>")
	next
 	response.write("</tr>" & vbcrlf)
next
%>
</table>

