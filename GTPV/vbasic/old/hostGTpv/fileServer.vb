Imports System.Net.Sockets
Imports System.Net
Imports System.Threading
Imports System.IO
Imports System.Text

Namespace hostGTpv
    Public Class FileServer
        Public Class infoReq
            Public method, path, query, remoteAddress, localAddress As String
            Public Sub New(ByVal method As String, ByVal path As String, ByVal query As String, ByVal remoteAddress As String, ByVal localAddress As String)
                Me.method = method
                Me.path = path
                Me.query = query
                Me.remoteAddress = remoteAddress
                Me.localAddress = localAddress
            End Sub
        End Class
        Public Class CFile
            'Public name As String
            Public path As String
            Public binary As Boolean
            Public content As String
            Public buffer As Byte()
            Public type As String
            Public utf8 As Boolean
        End Class

        Public Delegate Function delGetFile(ByVal path As String, ByVal info As infoReq) As CFile
        Public Shared Function find(ByVal handler As Object, ByVal path As String, ByVal info As infoReq) As CFile
            If handler Is Nothing Then
                handler = fileHandlers
            End If
            If TypeOf handler Is IEnumerable Then
                For Each h In handler
                    Dim ret As Object = find(h, path, info)
                    If ret IsNot Nothing Then Return ret
                Next
                Return Nothing
            ElseIf TypeOf handler Is delGetFile Then
                Return DirectCast(handler, delGetFile)(path, info)
            Else
                Dim f = TryCast(handler, CFile)
                If (f IsNot Nothing) AndAlso (f.path = path) Then
                    Return f
                Else
                    Return Nothing

                End If
            End If
        End Function

        Private Shared fileHandlers As New List(Of Object)
        Public Shared Sub add(ByVal o As Object)
            fileHandlers.Add(o)
        End Sub
        Public Shared Sub add(ByVal h As delGetFile)
            fileHandlers.Add(h)
        End Sub

        Public Shared Function getTextUtf8(ByVal drivePath As String) As String
            Using sr As StreamReader = New StreamReader(drivePath, Encoding.UTF8)
                Return sr.ReadToEnd()
            End Using
        End Function

        Public Shared Function getBinary(ByVal drivePath As String) As Byte()
            Dim buffer() As Byte
            Using fs As FileStream = New FileStream(drivePath, FileMode.Open)
                buffer = New Byte(fs.Length - 1) {}
                Dim numBytesToRead = buffer.Length
                Dim numBytesRead As Integer = 0

                While (numBytesToRead > 0)
                    Dim n As Integer = fs.Read(buffer, numBytesRead, numBytesToRead)
                    If (n = 0) Then
                        Exit While
                    End If
                    numBytesRead += n
                    numBytesToRead -= n
                End While
            End Using
            Return buffer
        End Function

        Public Class CPreProcessed
            Private handlers As New Dictionary(Of String, delGetFile)
            Public Sub New()
                FileServer.add(AddressOf handler)
            End Sub

            Public Sub add(ByVal path As String, ByVal handler As delGetFile)
                handlers.Add(path, handler)
            End Sub

            Private Function handler(ByVal path As String, ByVal info As infoReq) As CFile
                Dim h As delGetFile = Nothing
                If handlers.TryGetValue(path, h) Then Return h(path, info)
                Return Nothing
            End Function
        End Class
        Public Shared preProcessed As New CPreProcessed()

        Public Class CLocalFiles
            Public Sub New()
                FileServer.add(AddressOf handler)
            End Sub

            Public Class CExtInfo
                Public contentType As String
                Public binary As Boolean
                Public utf8 As Boolean
                Public Sub New(ByVal contentType As String, ByVal binary As Boolean, ByVal utf8 As Boolean)
                    Me.contentType = contentType : Me.binary = binary : Me.utf8 = utf8
                End Sub
            End Class
            Private extensions As New Dictionary(Of String, CExtInfo)
            Public Sub addExtension(ByVal ext As String, ByVal contentType As String, ByVal binary As Boolean, Optional ByVal utf8 As Boolean = True)
                extensions.Add(ext, New CExtInfo(contentType, binary, utf8))
            End Sub

            Private Class CPaths
                Public localPath As String
                Public webPath As String
                Public Sub New(ByVal localPath, ByVal webPath)
                    Me.localPath = localPath : Me.webPath = webPath
                End Sub
            End Class
            Private paths As New List(Of CPaths)
            Public Sub addLocalPath(ByVal localPath As String, ByVal webPath As String)
                paths.Add(New CPaths(localPath, webPath))
            End Sub

            Private Function handler(ByVal path As String, ByVal info As infoReq) As CFile
                For Each ps In paths
                    If path.StartsWith(ps.webPath) Then
                        Dim dir As New DirectoryInfo(ps.localPath)
                        Dim file As New FileInfo(dir.FullName & path.Substring(ps.webPath.Length))
                        If file.FullName.StartsWith(dir.FullName) AndAlso file.Exists Then ' no (..) parent subdirs
                            Dim extInfo As CExtInfo = Nothing
                            If extensions.TryGetValue(file.Extension, extInfo) Then
                                Dim ret As New CFile()
                                ret.binary = extInfo.binary
                                ret.utf8 = extInfo.utf8
                                ret.type = extInfo.contentType
                                Try
                                    If ret.binary Then
                                        ret.buffer = getBinary(file.FullName)
                                    Else
                                        ret.content = getTextUtf8(file.FullName)
                                    End If
                                    Return ret
                                Catch e As Exception
                                End Try
                            End If
                        End If
                    End If
                Next
                Return Nothing
            End Function
        End Class
        Public Shared localFiles As New CLocalFiles()

    End Class
End Namespace