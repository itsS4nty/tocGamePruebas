<html>
<body>

<%
Set fs = Server.CreateObject("Scripting.FileSystemObject")
Set rs = fs.GetFile(Server.MapPath("demo_lastmodified.asp"))
modified = rs.DateLastModified
%>
This file was last modified on: <%response.write(modified)
Set rs = Nothing
Set fs = Nothing
%>

</body>
</html>




