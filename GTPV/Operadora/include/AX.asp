<%@LANGUAGE="VBSCRIPT"%>

<%
obj  = request.item("obj")
modo = request.item("modo")
%>

<script>

<%
if modo = "SAVE" then
	session(obj) = true
%>

parent.activateActiveX ( "<%=obj%>" );

<%else%>

var ax = new ActiveXObject ( "<%=obj%>" );
location = "/Facturacion/include/AX.asp?obj=<%=obj%>&modo=SAVE";

<%end if%>

</script>
