<script src="/Facturacion/js/roll.js"></script>
<%
' SUBMIT
function imgBtn ( byval name, byval src, byval alt )

	dim code

	code = "<a href=""#"" onclick=""this.children[0].click();"" class=""imgBtn"" title=""" & alt & """>&nbsp;"
	code = code & "<input name=""" & name & """ src=""" & src & """ type=""image"" value=""" & alt & """ "
	code = code & "alt=""" & alt & """ align=""absmiddle"" class=""chk"" "
	code = code & "onmouseover=""rollIco(this);"" onmouseout=""resIco(this);"">&nbsp;" & alt & "&nbsp;</a>"

	imgBtn = code

end function

' JAVASCRIPT
function imgBtnJs ( byval name, byval src, byval alt, byval js )

	dim code

	code = "<a href=""#"" onclick=""" & js & """ class=""imgBtn"" title=""" & alt & """>&nbsp;"
	code = code & "<img name=""" & name & """ src=""" & src & """ alt=""" & alt & """ "
	code = code & "align=""absmiddle"" class=""mano"" onclick=""" & js & """ border=""0"" "
	code = code & "onmouseover=""rollIco(this);"" onmouseout=""resIco(this);"">&nbsp;" & alt & "&nbsp;</a>"

	imgBtnJs = code

end function

' URL
function imgBtnGo ( byval name, byval src, byval alt, byval url )

	dim code

	code = "<a href=""" & url & """ class=""imgBtn"" title=""" & alt & """>&nbsp;"
	code = code & "<img name=""" & name & """ src=""" & src & """ alt=""" & alt & """ "
	code = code & "align=""absmiddle"" class=""mano"" border=""0"" "
	code = code & "onmouseover=""rollIco(this);"" onmouseout=""resIco(this);"">&nbsp;" & alt & "&nbsp;</a>"

	imgBtnGo = code

end function
%>

