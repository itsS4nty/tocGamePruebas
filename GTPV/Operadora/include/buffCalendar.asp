<%@ Language=VBScript %>
<!-- #include virtual="/Facturacion/include/global.asp" -->
<%
data = cdate(request.item("data")) 'DD/MM/AAAA
ver = request.item("ver")
diaIni = cdate("01/" & right(0 & month(data),2) & "/" & year(data))
%>
<html>
<head>
 <title><%=mesesCAT(month(data))%>&nbsp;<%=year(data)%></title>
</head>
<body<%if ver="SI" then%> onload="parent.showCal();"<%end if%>>
<table cellspacing="1" cellpadding="0" bgcolor="#<%=fColor1%>" style="cursor:default;position:absolute;top:0;left:0;" id="calendario" width="218">
 <tr align="center" bgcolor="#<%=fColor2%>">
  <td colspan="7">
   <table width="100%">
    <tr align="center" valign="middle">
	 <td style="cursor:hand;font-family:Webdings;" onClick="parent.calAnyMenos();">7</td>
     <td style="cursor:hand;font-family:Webdings;" onClick="parent.calMesMenos();">3</td>
     <td bgcolor="#<%=fColor4%>"><font size="1" face="Verdana"><b id="nomMes"><%=mesesCAT(month(data))%>&nbsp;<%=year(data)%></b></font></td>
     <td style="cursor:hand;font-family:Webdings;" onClick="parent.calMesMas();">4</td>
     <td style="cursor:hand;font-family:Webdings;" onClick="parent.calAnyMas();">8</td>
	</tr>
   </table>
  </td>
 </tr>
 <tr>
  <td colspan="7" height="1"><img src="<%=ROOT%>/imagenes/trans.gif" width="1" height="1"></td>
 </tr>
 <tr align="center" style="color:#<%=fColor2%>;" valign="middle">
  <td width="25" height="20"><font size="1" face="Verdana"><b>Dl</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dm</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dx</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dj</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dv</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Ds</b></font></td>
  <td width="25"><font size="1" face="Verdana"><b>Dg</b></font></td>
 </tr>
 <tr>
  <td colspan="7" height="1"><img src="<%=ROOT%>/imagenes/trans.gif" width="1" height="1"></td>
 </tr>
 <tr align="center" bgcolor="#<%=fColor2%>">
<%for i=1 to weekday(diaIni,2)-1%>
  <td height="20">&nbsp;</td>
<%
next
aux = diaIni
for i=weekday(diaIni,2) to 7
%>
  <td height="20" onmouseover="parent.rollCal(this);" onmouseout="parent.resCal(this);" onclick="parent.calReturn(this);" style="cursor:hand;"><font id="dia<%=i%>" face="Verdana" size="1" color="#<%if weekday(aux,2)=7 then%><%=fColor1%><%else%>000000<%end if%>"><%if day(aux)=day(data) then%><b><%end if%><%=day(aux)%><%if day(aux)=day(data) then%></b><%end if%></font></td>
<%
	aux = dateadd("d",1,aux)
next
%>
 </tr>
<%
while month(aux) = month(data)
	if weekday(aux,2)=1 then
%>
 <tr align="center" bgcolor="#<%=fColor2%>">
<%	end if%>
  <td height="20" onmouseover="parent.rollCal(this);" onmouseout="parent.resCal(this);" onclick="parent.calReturn(this);" style="cursor:hand;"><font id="dia<%=((6*i)+j+i)%>" face="Verdana" size="1" color="#<%if weekday(aux,2)=7 then%><%=fColor1%><%else%>000000<%end if%>"><%if day(aux)=day(data) then%><b><%end if%><%=day(aux)%><%if day(aux)=day(data) then%></b><%end if%></font></td>
<%	if weekday(aux,2)=7 then%>
 </tr>
<%
	end if
	aux = dateadd("d",1,aux)
wend
while weekday(aux,2)<=7 and weekday(aux,2)>1
%>
  <td height="20">&nbsp;</td>
<%
	aux = dateadd("d",1,aux)
wend
%>
 </tr>
</table>
</body>
</html>
