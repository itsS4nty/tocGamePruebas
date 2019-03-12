<%

dim dom, el

' Set dom = Server.CreateObject("Msxml2.DOMDocument.3.0")
' Set.dom = CreateObject("Microsoft.XMLDOM")
Set dom = CreateObject("Msxml2.DOMDocument.3.0")
dom.load(Server.MapPath("carn1.xml"))
Response.Write("parseError : " & dom.parseError.reason)
Response.Write("aaa")
Response.Write(dom.xml)

%>
