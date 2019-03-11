<%

function inputCalendarOCX(val,name)

	' Cambiar colores según el portal

	ic = "<object id=""includeCalendar" & name & """ classid=""CLSID:20DD1B9E-87C4-11D1-8BE3-0000F8754DA1"" width=""100"" height=""20"" class=""txt"" codebase=""http://activex.microsoft.com/controls/vb6/MSComCt2.cab"" type=""screen"" align=""absmiddle"" type=""application/x-oleobject"">" & vbcrlf
	ic = ic & " <param name=""CalendarBackColor"" value=""" & getRGB(fColor4) & """>" & vbcrlf
	ic = ic & " <param name=""CalendarForeColor"" value=""0"">" & vbcrlf
	ic = ic & " <param name=""CalendarTitleBackColor"" value=""" & getRGB(fColor1) & """>" & vbcrlf
	ic = ic & " <param name=""CalendarTitleForeColor"" value=""" & getRGB(fColor2) & """>" & vbcrlf
	ic = ic & " <param name=""CalendarTrailingForeColor"" value=""" & getRGB(fColor3) & """>" & vbcrlf
	ic = ic & " <param name=""CustomFormat"" value=""dd/MM/yy"">" & vbcrlf
	ic = ic & " <param name=""Format"" value=""3"">" & vbcrlf
	ic = ic & "</object>" & vbcrlf
	ic = ic & "<script>" & vbcrlf
	ic = ic & "	CALENDARIOS[CALENDARIOS.length] = """ & name & """;" & vbcrlf
	ic = ic & "</script>" & vbcrlf
	ic = ic & "<input type=""Hidden"" name=""" & name & """ value=""" & val & """>" & vbcrlf

	inputCalendarOCX = ic

end function

'No implementado todavía
function inputSubmitCalendarOCX(val,name,que)'que = DATE | DAY | MONTH | YEAR
	inputSubmitCalendarOCX = ""
end function

function inputCalendarMenosOCX(campo)
	inputCalendarMenosOCX = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos('" & campo & "');"">"
end function

function inputSubmitCalendarMenosOCX(campo)
	inputSubmitCalendarMenosOCX = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos('" & campo & "',true);"">"
end function

function inputCalendarMasOCX(campo)
	inputCalendarMasOCX = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas('" & campo & "');"">"
end function

function inputSubmitCalendarMasOCX(campo)
	inputSubmitCalendarMasOCX = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas('" & campo & "',true);"">"
end function

'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'' IMPORTANTE:                                                                                                       ''
'' La función submitCalendarFormOCX retorna el código HTML necesario para enviar los calendarios de un formulario    ''
'' PARÁMETROS:                                                                                                       ''
''     val:  Texto que muestra el botón                                                                              ''
''     name: Nombre del botón                                                                                        ''
''     cls:  Nombre de la clase del estilo CSS del botón                                                             ''
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
function submitCalendarFormOCX(val,name,cls)
	submitCalendarFormOCX = "<input type=""Button"" class=""" & cls & """ value=""" & val & """ name=""" & name & """ onclick=""submitCalendarForm(this.form);"">"
end function
%>
<script>
var CALENDARIOS = new Array();
var FORMULARIOS = new Array();
var CAMPOSTEXTO = new Array();

function diaMas(c,e)
	{
	sumaDia(1,c,e);
	}

function diaMenos(c,e)
	{
	sumaDia(-1,c,e);
	}

function sumaDia ( d, c, e )
	{
	var i = getIndex(c);
	var f = FORMULARIOS[i];
	var t = CAMPOSTEXTO[i];
	var campo = document.getElementById("includeCalendar" + c);
	var dd = campo.day + d;
	var mm = campo.month;
	var yy = campo.year;
	if(dd < 1)
		{
		mm--;
		if(mm == 0)
			{
			mm = 12;
			yy--;
			}
		dd = lastDayOfMonth(mm,yy);
		}
	else if(dd > lastDayOfMonth(campo.month,campo.year))
		{
		dd = 1;
		mm++;
		if(mm > 12)
			{
			mm = 1;
			yy++;
			}
		}
	t.value     = dd + "/" + mm + "/" + yy;
	campo.value = t.value;
	if(e)f.submit();
	}

function submitCalendarForm(t)
	{

	var fec;

	for ( var i=0; i<CALENDARIOS.length; i++ )
		{

		fec = document.getElementById("includeCalendar" + CALENDARIOS[i]);

		var DD = "0" + fec.day;
		DD = DD.substring(DD.length-2);

		var MM = "0" + fec.month;
		MM = MM.substring(MM.length-2);

		var AA = "20" + fec.year;
		AA = AA.substring(AA.length-4);

		CAMPOSTEXTO[i].value = DD + "/" + MM + "/" + AA;

		}

	t.submit();

	}

/*********************************************************************************************************************/
/* IMPORTANTE:                                                                                                       */
/* La función loadDates() debe ir siempre en el evento onLoad del tab BODY, si no no se enviarán los calendarios     */
/*********************************************************************************************************************/
function loadDates()
	{
	var cal;
	var campo;
	for(var i=0;i<CALENDARIOS.length;i++)
		{
		cal = document.getElementById("includeCalendar" + CALENDARIOS[i]);
		FORMULARIOS[i] = findDateForm(CALENDARIOS[i],false);
		CAMPOSTEXTO[i] = findDateForm(CALENDARIOS[i],true);
		FORMULARIOS[i].onsubmit = submitDates;
		cal.value = CAMPOSTEXTO[i].value;
		}
	}

function findDateForm(c,e)
	{
	var i,j,f;
	for(i=0;i<document.forms.length;i++)
		{
		f = document.forms[i];
		for(j=0;j<f.elements.length;j++)
			{
			if(f.elements[j].name == c)
				{
				if(e)return f.elements[j];
				else return f;
				}
			}
		}
	}

function getIndex(c)
	{
	for(var i=0;i<CALENDARIOS.length;i++)
		if(CALENDARIOS[i] == c)
			return i;
	}

function getIndexForm(f)
	{
	for(var i=0;i<FORMULARIOS.length;i++)
		if(FORMULARIOS[i] == f)
			return i;
	}

function lastDayOfMonth(m,a)
	{
	var D = new Date();
	var d = 1;
	if(m == 12) m = 0;
	D = new Date(a,m,d);
	D = new Date(D.getTime() - (24 * 60 * 60 * 1000));
	return D.getDate();
	}

function submitDates()
	{
	var f = event.srcElement;
	var j = getIndexForm(f);
	var c;
	for(var i=0;i<FORMULARIOS.length;i++)
		{
		if(f == FORMULARIOS[j])
			{
			c = getElementById("includeCalendar" + CAMPOSTEXTO[i]);
			CAMPOSTEXTO[i].value = c.day + "/" + c.month + "/" + c.year;
			}
		}
	}
</script>

