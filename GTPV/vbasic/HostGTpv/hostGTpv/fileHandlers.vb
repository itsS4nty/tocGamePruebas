Imports System.Text.RegularExpressions
Imports System.IO

Namespace hostGTpv

    Public Class fileHandlers

        Private Shared localPathRoot As String = "..\..\satWeb\"
        Public Shared Sub init()
            Console.WriteLine(Directory.GetCurrentDirectory())

            FileServer.localFiles.addLocalPath(localPathRoot, "/")

            FileServer.localFiles.addExtension(".html", "text/html; charset=""utf-8""", False)
            FileServer.localFiles.addExtension(".htm", "text/html; charset=""utf-8""", False)
            FileServer.localFiles.addExtension(".js", "text/javascript; charset=""utf-8""", False)
            FileServer.localFiles.addExtension(".jpeg", "image/jpeg", True)
            FileServer.localFiles.addExtension(".gif", "image/gif", True)
            FileServer.localFiles.addExtension(".png", "image/png", True)
            FileServer.localFiles.addExtension(".css", "text/css; charset=""utf-8""", False)

            FileServer.preProcessed.add("/",
                                        Function(path As String, info As FileServer.infoReq) As FileServer.CFile
                                            Return FileServer.find(Nothing, "/index.html", info)
                                        End Function)

            phpInit()
        End Sub

        Private Shared Sub phpInit()
            FileServer.preProcessed.add("/entryS.php",
                                        Function(path As String, info As FileServer.infoReq) As FileServer.CFile
                                            Dim idSat As String = ""
                                            If info.query IsNot Nothing Then
                                                Dim m = Regex.Match(info.query, "^(?:[^&]*&)*id=([^&]*)")
                                                If m.Success Then idSat = m.Groups(1).Value
                                            End If
                                            Dim redir As String
                                            If Regex.IsMatch(idSat, "^Camarero-") Then
                                                redir = "/cam_entryS.html"
                                            Else
                                                redir = "/toc_entryS.html"
                                            End If
                                            Dim f As New FileServer.CFile()
                                            f.binary = False
                                            f.utf8 = True
                                            f.type = "text/html; charset=""utf-8"""
                                            f.content = "<html><body><script>window.location=""" & redir & "?/id=" & idSat & """;</script></body></html>"
                                            Return f
                                        End Function)
            FileServer.preProcessed.add("/_detect/jsonp.php",
                                        Function(path As String, info As FileServer.infoReq) As FileServer.CFile
                                            Dim f As New FileServer.CFile()
                                            f.binary = False
                                            f.utf8 = True
                                            f.type = "text/javascript; charset=""utf-8"""

                                            Dim infoH = satServer.getHostInfo(info.localAddress, info.remoteAddress)
                                            Dim callbackName = "callback"
                                            If info.query IsNot Nothing Then
                                                Dim m = Regex.Match(info.query, "^(?:[^&]*&)*callback=([^&]*)")
                                                If m.Success Then callbackName = m.Groups(1).Value
                                            End If
                                            f.content = callbackName & "(" & json.objectToUnEval(infoH) & ")" & vbLf
                                            Return f
                                        End Function)
            FileServer.preProcessed.add("/_detect/HostData.php",
                                        Function(path As String, info As FileServer.infoReq) As FileServer.CFile
                                            Dim f As New FileServer.CFile()
                                            f.binary = False
                                            f.utf8 = True
                                            f.type = "text/javascript; charset=""utf-8"""

                                            Dim infoH = satServer.getHostInfo(info.localAddress, info.remoteAddress)

                                            f.content = "var hosts = [];" & vbLf & _
                                                        "setCookie('type', 'sat');" & vbLf & _
                                                        "setCookie('user', '" & infoH("user") & "');" & vbLf & _
                                                        "setCookie('ipLanHost', '" & infoH("ipLanHost") & "');" & vbLf
                                            Return f
                                        End Function)
        End Sub
    End Class
End Namespace
