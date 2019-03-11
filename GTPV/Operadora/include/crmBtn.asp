<% 

Response.addHeader "pragma", "no-cache"
Response.CacheControl = "Public"
Response.Expires = 0

function button ( byval val, byval js )
	button = "<table width=""151"" height=""67"" cellpadding=""0"" cellspacing=""0"" border=""0"" "
	button = button & "background=""" & IMGSCRM & "boton.gif"" style=""cursor:hand;"" "
	button = button & "onclick=""" & js & """><tr><td class=""btn"" align=""center"">" & val
	button = button & "</td></tr></table>"
end function

function button2 ( byval val, byval js )
	button2 = "<table width=""396"" height=""67"" cellpadding=""0"" cellspacing=""0"" border=""0"" "
	button2 = button2 & "background=""" & IMGSCRM & "boton2.gif"" style=""cursor:hand;"" "
	button2 = button2 & "onclick=""" & js & """><tr><td class=""titulo"" align=""center"">" & val
	button2 = button2 & "</td></tr></table>"
end function

%>