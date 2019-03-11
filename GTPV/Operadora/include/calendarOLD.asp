<%

function inputSubmitCalendarOLD(val,name,que)'que = DATE | DAY | MONTH | YEAR
	isc = "<input type=""Button"" value=""" & val & """ onclick=""showCal(this.form." & name & ");queSeEnvia='" & que & "';seEnvia=true;"" class=""day"" name=""btnCalendar" & name & """>"
	isc = isc & "<input type=""hidden"" value=""" & val & """ name=""" & name & """>"
	isc = isc & "<input type=""hidden"" value=""" & val & """ name=""includeCalendar" & name & """>"
	inputSubmitCalendarOLD = isc
end function

function inputCalendarOLD(val,name)
	ic = "<input type=""Button"" value=""" & val & """ onclick=""showCal(this.form." & name & ");queSeEnvia='DATE';seEnvia=false;"" class=""day"" name=""btnCalendar" & name & """>"
	ic = ic & "<input type=""hidden"" value=""" & val & """ name=""" & name & """>"
	ic = ic & "<input type=""hidden"" value=""" & val & """ name=""includeCalendar" & name & """>"
	inputCalendarOLD = ic
end function

function inputCalendarMenosOLD(campo)
	inputCalendarMenosOLD = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos(" & campo & ");"">"
end function

function inputSubmitCalendarMenosOLD(campo)
	inputSubmitCalendarMenosOLD = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos(" & campo & ",true);"">"
end function

function inputCalendarMasOLD(campo)
	inputCalendarMasOLD = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas(" & campo & ");"">"
end function

function inputSubmitCalendarMasOLD(campo)
	inputSubmitCalendarMasOLD = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas(" & campo & ",true);"">"
end function

function submitCalendarFormOLD(val,name,cls)
	submitCalendarFormOLD = "<input type=""Submit"" class=""" & cls & """ value=""" & val & """ name=""" & name & """>"
end function

function buttonCalendarFormOLD(val,name,cls)
	buttonCalendarFormOLD = "<input type=""Submit"" class=""" & cls & """ value=""" & val & """ name=""" & name & """>"
end function
%>
<script>
var popCal = window.createPopup();
var xCal,yCal;
var campo;
var FECHA;
var seEnvia = false;
var queSeEnvia = "DATE";

var calForm;

function showCal(c,x,y)
	{
	var popBody = popCal.document.body;
	if(x && y)
		{
		xCal = x;
		yCal = y;
		}
	else if(event)
		{
		xCal = event.clientX - document.body.scrollLeft;
		yCal = event.clientY - document.body.scrollTop;
		}
	if(c)
		{
		campo = c;
		c = c.value.split("/");
		c[0] = ("0" + c[0]).substring(("0" + c[0]).length-2);
		c[1] = ("0" + c[1]).substring(("0" + c[1]).length-2);
		c[2] = ("20" + c[2]).substring(("20" + c[2]).length-4);
		FECHA = c.join("/");
		loadFecha(FECHA);
		}
	else
		{
		popBody.innerHTML = document.buffCalendar.document.body.innerHTML;
		popCal.show(0,0,0,0,document.body);
		popBody.children[0].style.visibility = "visible";
		popCal.show(xCal,yCal,popBody.children[0].clientWidth,popBody.children[0].clientHeight,document.body);
		}
	}

function hideCal()
	{
	popCal.hide();
	}

function loadFecha(f)
	{
	document.buffCalendar.location = "/Facturacion/include/buffCalendar.asp?data=" + f + "&ver=SI";
	}

function calReturn(t)
	{
	var INCLUDECALENDAR = eval("campo.form.includeCalendar" + campo.name);
	INCLUDECALENDAR.value=t.children[0].innerText + "/" + FECHA.split("/")[1] + "/" + FECHA.split("/")[2];
	switch(queSeEnvia)
		{
		case "DATE":
			campo.value=INCLUDECALENDAR.value;
			break;

		case "DAY":
			campo.value=t.children[0].innerHTML;
			break;
			
		case "MONTH":
			campo.value=FECHA.split("/")[1];
			break;
			
		case "YEAR":
			campo.value=FECHA.split("/")[2];
			break;
		}
	eval("campo.form.btnCalendar" + campo.name).value = INCLUDECALENDAR.value;
	hideCal();
	if(seEnvia)campo.form.submit();
	}

function diaReturn(n,e)
	{
	var c = campo.value.split("/");
	c[2] = "20" + c[2];
	c[2] = c[2].right(4);
	var f = new Date(c[2],parseInt(c[1])-1,c[0]);
	f = f.dateAdd(n);
	FECHA = f.getDate() + "/" + (f.getMonth()+1) + "/" + f.getFullYear();
	campo.value = FECHA;
	eval("campo.form.btnCalendar" + campo.name).value = campo.value;
	if(e)campo.form.submit();
	}

function diaMas(c,e)
	{
	campo = c;
	diaReturn(1,e);
	}

function diaMenos(c,e)
	{
	campo = c;
	diaReturn(-1,e);
	}

function calMesMenos()
	{
	rellenaCal(-1);
	}

function calMesMas()
	{
	rellenaCal(1);
	}

function calAnyMenos()
	{
	rellenaCal(-12);
	}

function calAnyMas()
	{
	rellenaCal(12);
	}

function rellenaCal(inc)
	{
	var c = FECHA.split("/");
	if(Math.abs(inc)==1)
		{
		c[1] = parseInt(c[1]) + inc;
		if(c[1]==0)
			{
			c[1] = 12;
			c[2] = parseInt(c[2]) - 1;
			}
		else if(c[1]==13)
			{
			c[1] = 1;
			c[2] = parseInt(c[2]) + 1;
			}
		}
	else if(Math.abs(inc)==12)c[2] = parseInt(c[2]) + (inc/12);
	if(parseInt(c[0]) > maxMes(c[1])) c[0] = maxMes(c[1]);
	FECHA = c.join("/");
	loadFecha(FECHA);
	}

function maxMes(m)
	{
	var D = new Date();
	var d = 1;
	if(m == 12) m = 0;
	var a = D.getYear();
	D = new Date(a,m,d);
	D = new Date(D.getTime() - (24 * 60 * 60 * 1000));
	return D.getDate();
	}

function rollCal(t)
	{
	t.bgColor="#<%=fColor4%>";
	}

function resCal(t)
	{
	t.bgColor="";
	}
</script>
<iframe name="buffCalendar" src="/Facturacion/include/buffCalendar.asp?data=<%=formatdatetime(now,2)%>" style="position:absolute;top:0;left:0;width:0;height:0;visibility:hidden;"></iframe>
