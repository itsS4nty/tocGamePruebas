<%

if not DEF_COOKIE then

	DEF_COOKIE = true

	sub setCookie ( byval nom, byval cont )
		response.Cookies ( nom )         = cont
		Response.Cookies ( nom ).Expires = dateadd("yyyy",1,now)
	end sub

	sub setCookie2 ( byval nom, byval var, byval cont )
		response.Cookies ( nom )( var )  = cont
		Response.Cookies ( nom ).Expires = dateadd("yyyy",1,now)
	end sub

	function getCookie ( byval nom )
		getCookie = Request.Cookies ( nom )
	end function

	function getCookie2 ( byval nom, byval var )
		getCookie2 = Request.Cookies ( nom )( var )
	end function

end if

%>
