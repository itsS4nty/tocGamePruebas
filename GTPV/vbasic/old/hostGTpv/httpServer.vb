Imports System.Net.Sockets
Imports System.Net
Imports System.Threading
Imports System.IO
Imports System.Text

Namespace hostGTpv
    Public Class httpExchange
        Private sock As TcpClient
        Private server As httpServer

        Public Sub New(ByVal sock As TcpClient, ByVal server As httpServer)
            Me.sock = sock
            Me.server = server
            Dim ep As IPEndPoint = sock.Client.LocalEndPoint
            localAddress = ep.Address.ToString()
            ep = sock.Client.RemoteEndPoint
            remoteAddress = ep.Address.ToString()
            Call New Thread(AddressOf process).Start()
        End Sub

        Private Function readLine() As String
            Dim line As New StringBuilder()
            While True
                Dim next_char = inputStream.ReadByte()
                If next_char = -1 Then Thread.Sleep(1) : Continue While
                Dim c As Char = Chr(next_char)
                If c = ControlChars.Cr Then Continue While
                If c = ControlChars.Lf Then Exit While
                line.Append(c)
            End While
            Return line.ToString()
        End Function

        Public localAddress As String
        Public remoteAddress As String
        Public method As String
        Public url As String
        Public version As String
        Public path As String
        Public query As String
        Private inputStream As BufferedStream
        Public requestHeaders As New Dictionary(Of String, String)
        'Public requestBody As StreamReader
        Public responseHeaders As New Dictionary(Of String, String)
        'Private outputStreamWriter As StreamWriter
        Private outputStream As BufferedStream

        Private statusCodeMessages As New Dictionary(Of Integer, String) From {
            {200, "OK"},
            {303, "See Other"},
            {400, "Bad Request"},
            {404, "Not Found"},
            {405, "Method Not Allowed"},
            {406, "Not Acceptable"}
        }

        Private Sub sendResponseHeaders(ByVal statusCode As Integer)
            Dim writer As New StreamWriter(outputStream)
            Dim statusMessage = statusCodeMessages(statusCode)
            If statusMessage Is Nothing Then statusMessage = "Unknown"
            writer.WriteLine("HTTP/1.0 {0} {1}", statusCode, statusMessage)
            For Each keyValue In responseHeaders
                writer.WriteLine("{0}: {1}", keyValue.Key, keyValue.Value)
            Next
            writer.WriteLine()
            writer.Flush()
        End Sub

        Public Sub close()
            Try
                outputStream.Close()
                sock.Close()
            Catch e As IOException
            End Try
        End Sub

        Private Sub parseRequest()
            Dim request As String = readLine()
            Dim tokens As String() = request.Split(" ")
            If tokens.Length <> 3 Then
                Throw New Exception("invalid http request line")
            End If
            method = tokens(0).ToUpper()
            url = tokens(1)
            version = tokens(2)
            Dim idx As Integer = url.IndexOf("?")
            If idx = -1 Then
                path = url
                query = Nothing
            Else
                path = url.Substring(0, idx)
                query = url.Substring(idx + 1)
            End If
            Console.WriteLine("starting: " + request)
            Debug.WriteLine("starting: " + request)
        End Sub

        Private Sub readHeaders()
            'Console.WriteLine("readHeaders()")
            Dim line As String = ""
            While True
                line = readLine()
                If line.Equals("") Then
                    'Console.WriteLine("got headers")
                    Return
                End If

                Dim separator As Integer = line.IndexOf(":")
                If separator = -1 Then
                    Throw New Exception("invalid http header line: " + line)
                End If
                Dim name As String = line.Substring(0, separator)
                Dim pos As Integer = separator + 1
                While (pos < line.Length) And (line(pos) = " ")
                    pos += 1 'strip any spaces
                End While

                Dim value As String = line.Substring(pos, line.Length - pos)
                'Console.WriteLine("header: {0}:{1}", name, value)
                requestHeaders(name) = value
            End While
        End Sub

        'Public Sub send(ByVal buf As Byte())
        '   outputStream.Write(buf, 0, buf.Length)
        'End Sub

        Public Sub sendResponse(ByVal statusCode As Integer)
            Try
                sendResponseHeaders(statusCode)
            Catch e As IOException
            End Try
            close()
        End Sub
        Public Sub sendResponse(ByVal statusCode As Integer, ByVal buffer As Byte())
            responseHeaders("Content-Length") = buffer.Length
            Try
                sendResponseHeaders(statusCode)
                outputStream.Write(buffer, 0, buffer.Length)
            Catch e As Exception
            End Try
            close()
        End Sub
        Public Sub sendResponse(ByVal statusCode As Integer, ByVal s As String, ByVal utf8 As Boolean)
            Dim e = Encoding.GetEncoding(If(utf8, "utf-8", "iso-8859-1"))
            Dim buffer = e.GetBytes(s)
            sendResponse(statusCode, buffer)
        End Sub

        Private Const MAX_POST_SIZE As Integer = 10 * 1024 * 1024  '10MB
        Private Const BUF_SIZE As Integer = 4096
        Public Function getRequestBody() As StreamReader
            'Console.WriteLine("get post data start")
            Dim content_len As Integer = 0
            Dim ms As New MemoryStream()
            If requestHeaders.ContainsKey("Content-Length") Then
                content_len = Convert.ToInt32(requestHeaders("Content-Length"))
                If (content_len > MAX_POST_SIZE) Then
                    Throw New Exception(
                        String.Format("POST Content-Length({0}) too big for this simple server",
                          content_len))
                End If
                Dim buf(BUF_SIZE) As Byte
                Dim to_read As Integer = content_len
                While to_read > 0
                    'Console.WriteLine("starting Read, to_read={0}", to_read)

                    Dim numread As Integer = inputStream.Read(buf, 0, Math.Min(BUF_SIZE, to_read))
                    'Console.WriteLine("read finished, numread={0}", numread)
                    If numread = 0 Then
                        If to_read = 0 Then
                            Exit While
                        Else
                            Throw New Exception("client disconnected during post")
                        End If
                    End If
                    to_read -= numread
                    ms.Write(buf, 0, numread)
                End While
                ms.Seek(0, SeekOrigin.Begin)
            End If
            'Console.WriteLine("get post data end")
            Return New StreamReader(ms)

        End Function

        Private Sub process()
            inputStream = New BufferedStream(sock.GetStream())
            outputStream = New BufferedStream(sock.GetStream())
            Try
                parseRequest()
                readHeaders()
                ' If method = "POST" Then requestBody = getRequestBody(inputStream)
                server.requestHandler(Me)
            Catch e As Exception
                Console.WriteLine("Exception: " + e.ToString())
                sock.Close()
            End Try
        End Sub
    End Class

    Public MustInherit Class httpServer
        Private active = False

        Public Sub start(ByVal port As Integer)
            active = True
            Try
                listener = New TcpListener(IPAddress.Any, port)
                listener.Start()
            Catch e As SocketException
                Return
            End Try
            Call New Thread(AddressOf listen).Start()
        End Sub
        Public Sub stopServer()
            If active Then
                active = False
                Try
                    If listener IsNot Nothing Then listener.Stop()
                Catch e As SocketException
                End Try
                listener = Nothing
            End If
        End Sub
        Protected Overrides Sub Finalize()
            stopServer()
        End Sub
        Private listener As TcpListener

        Private Sub listen()
            While active
                Try
                    Dim s As TcpClient = listener.AcceptTcpClient()
                    s.SendTimeout = 20000
                    s.ReceiveTimeout = 20000
                    Dim processor = New httpExchange(s, Me)
                Catch e As SocketException
                End Try
            End While
        End Sub

        Public MustOverride Sub requestHandler(ByVal p As httpExchange)

    End Class

End Namespace
