<%

function inputCalendarAPPLET ( val, name )
	isc = "<input type=""Button"" value=""" & val & """ onclick=""showCal(this.form." & name & ",'');"" class=""day"" name=""btnCalendar" & name & """>"
	isc = isc & "<input type=""hidden"" value=""" & val & """ name=""" & name & """>"
	inputCalendarAPPLET = isc
end function

function inputSubmitCalendarAPPLET ( val, name, que )'que = DATE | DAY | MONTH | YEAR
	isc = "<input type=""Button"" value=""" & val & """ onclick=""showCal(this.form." & name & ",'" & que & "');"" class=""day"" name=""btnCalendar" & name & """>"
	isc = isc & "<input type=""hidden"" value=""" & val & """ name=""" & name & """>"
	inputSubmitCalendarAPPLET = isc
end function

function inputCalendarMenosAPPLET(campo)
	inputCalendarMenosAPPLET = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos(" & campo & ");"">"
end function

function inputSubmitCalendarMenosAPPLET(campo)
	inputSubmitCalendarMenosAPPLET = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos(" & campo & ",true);"">"
end function

function inputCalendarMasAPPLET(campo)
	inputCalendarMasAPPLET = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas(" & campo & ");"">"
end function

function inputSubmitCalendarMasAPPLET(campo)
	inputSubmitCalendarMasAPPLET = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas(" & campo & ",true);"">"
end function

function submitCalendarFormAPPLET(val,name,cls)
	submitCalendarFormAPPLET = "<input type=""Submit"" class=""" & cls & """ value=""" & val & """ name=""" & name & """>"
end function

function buttonCalendarFormAPPLET(val,name,cls)
	buttonCalendarFormAPPLET = "<input type=""Submit"" class=""" & cls & """ value=""" & val & """ name=""" & name & """>"
end function

%>

<script>

var campo;
var queEnvia = "";

function showCal ( hid, que )
	{
	queEnvia = que;
	campo    = hid;
	javaCalendar ( eval ( "hid.form.btnCalendar" + hid.name ), hid, hid.value, que, event );
	}

function diaReturn ( n, e )
	{
	var c = campo.value.split ( "/" );
	var f = new Date ( c[2], c[1]-1, c[0] );
	f = f.dateAdd ( n );
	var FECHA = ("0" + f.getDate()).right(2) + "/" + ("0" + (f.getMonth()+1)).right(2) + "/" + f.getFullYear();
	campo.value = FECHA;
	eval ( "campo.form.btnCalendar" + campo.name ).value = campo.value;
	if ( e ) campo.form.submit();
	}

function diaMas(c,e)
	{
	campo = c;
	diaReturn ( 1, e );
	}

function diaMenos ( c, e )
	{
	campo = c;
	diaReturn ( -1, e );
	}

</script>
