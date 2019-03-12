Imports System.Net.Sockets
Imports System.Net
Imports System.Threading
Imports System.IO
Imports System.Text
Imports System.Net.NetworkInformation

Namespace hostGTpv
    Public Delegate Function delCreateObjHost(ByVal obj As IObj) As Dictionary(Of String, [Delegate])
    Public Interface ISat
        Function getId() As String
        Function isValid() As Boolean
        Function checkReadyComm() As Boolean
        Sub readyComm()
        Function getTime() As Double
        Function diffTime(ByVal timeSat0) As Double
        Function getAgeLastCom() As Double
        Sub destroy()
        Function createObj(ByVal idObj As String, ByVal createObjSat As Object, ByVal createObjHost As delCreateObjHost,
                           ByVal callback As delCallbackHS, Optional ByVal availableCommHandler As delAvailableCommHandler = Nothing) As IObj
        Sub sendScript(ByVal s As String, Optional ByVal callback As delCallbackHS = Nothing)
        Sub sendFunctionExecute(ByVal s As String, Optional ByVal callback As delCallbackHS = Nothing)
        Sub sendObjectAssign(ByVal name As String, ByVal obj As Object, Optional ByVal callback As delCallbackHS = Nothing)
        Property data As Object
    End Interface
    Public Interface IObj
        Function getId() As String
        Function isValid() As Boolean
        Sub setMaxAge(ByVal maxAge As Double?)
        Sub [call](ByVal func As String, ByVal args As jsArray, ByVal callback As delCallbackHS)
        Sub destroy(ByVal callback As delCallbackHS)
        Property data As Object
        Function getSat() As ISat
        Function getAsyncRet() As interfaceAsyncRet
        Function getPendingResp() As Integer
        Function checkReadyComm() As Boolean ': sat.interfaceApp.checkReadyComm,
        Sub readyComm() ': sat.interfaceApp.readyComm,
    End Interface
    Public Interface interfaceAsyncRet
        Sub callback(ByVal ret As Object, ByVal er As String)
    End Interface

    Public Class paramsCallbackHS
        Public er As String
        Public diffTime As Double
        Public age As Double
        Sub New(ByVal er As String, ByVal diffTime As Double, ByVal age As Double)
            Me.er = er
            Me.diffTime = diffTime
            Me.age = age
        End Sub
    End Class
    Public Delegate Sub delCallbackHS(ByVal ret As Object, ByVal params As paramsCallbackHS)
    Public Delegate Sub delAvailableCommHandler(ByVal obj As IObj)

    Public Class satServer
        Inherits httpServer

        Public Shared idsSatAllowed As New List(Of String)
        Public Shared userGTpv As String = ""

        Private Shared server As satServer
        Public Shared Sub run(ByVal port As Integer)
            If server Is Nothing Then
                server = New satServer()
                server.start(port)
            End If
        End Sub

        Public Shared Sub [stop]()
            If server IsNot Nothing Then
                server.stopServer()
                server = Nothing
            End If
        End Sub

        Public Delegate Function delControlInvoke(ByVal method As [Delegate]) As Object
        Public Shared ControlInvoke As delControlInvoke = Function(method As [Delegate]) method.DynamicInvoke()
        Delegate Function delRegistrationHandler(ByVal sat As ISat, ByVal oldSat As ISat) As Boolean
        Public Shared registrationHandler As delRegistrationHandler

        Private Shared serverLock As New Object()
        Public Shared Function getServerLock() As Object
            Return serverLock
        End Function

        Private Shared satellites As New Dictionary(Of String, CSat)

        Public Shared Function getSats() As ISat()
            SyncLock serverLock
                Dim ret As New List(Of CSat)
                For Each kv As KeyValuePair(Of String, CSat) In satellites
                    ret.Add(kv.Value)
                Next
                Return ret.ToArray()
            End SyncLock
        End Function

        Private Structure SLocalAddress
            Public addr As String
            Public prefLen As Integer
        End Structure
        Private Shared Function _getLocalAddresses() As SLocalAddress()
            Dim localAddress As New List(Of SLocalAddress)
            Dim nis() As NetworkInterface = NetworkInterface.GetAllNetworkInterfaces()
            For Each ni As NetworkInterface In nis
                If ni.OperationalStatus = OperationalStatus.Up Then
                    Dim prop = ni.GetIPProperties()
                    For Each ua In prop.UnicastAddresses
                        If ua.Address.AddressFamily = AddressFamily.InterNetwork AndAlso Not IPAddress.IsLoopback(ua.Address) Then
                            Dim sAddr = ua.Address.ToString()
                            Dim prefLen As Integer = 0
                            Dim mask = ua.IPv4Mask
                            If mask Is Nothing Then Continue For
                            Dim addrBytes = mask.GetAddressBytes()
                            For i = 0 To 3
                                Dim b As Byte = addrBytes(i)
                                If b = 255 Then
                                    prefLen += 8
                                Else
                                    While b <> 0
                                        prefLen += 1
                                        b <<= 1
                                    End While
                                    Exit For
                                End If
                            Next
                            localAddress.Add(New SLocalAddress With {.addr = sAddr, .prefLen = prefLen})
                        End If
                    Next
                End If
            Next
            Return localAddress.ToArray()
        End Function

        Public Shared Function getSiteLocalAddresses() As String()
            Dim addrs = _getLocalAddresses()
            Dim ret(addrs.Length - 1) As String
            For i = 0 To addrs.Length - 1
                ret(i) = addrs(i).addr & "/" & addrs(i).prefLen
            Next
            Return ret
        End Function

        Public Shared Function getHostInfo(ByVal localAddress As String, ByVal satAddress As String) As jsObject
            Dim info As New jsObject
            info("user") = userGTpv
            Dim addrs = _getLocalAddresses()
            Dim prefLen = 24
            For i = 0 To addrs.Length - 1
                If addrs(i).addr = localAddress Then prefLen = addrs(i).prefLen : Exit For
            Next
            localAddress &= "/" & prefLen
            info("localAddress") = localAddress
            info("ipLanHost") = localAddress
            info("satAddress") = satAddress
            Dim idsSat As New List(Of String)
            For Each kv As KeyValuePair(Of String, CSat) In satellites
                idsSat.Add(kv.Key)
            Next
            info("idsSat") = idsSat.ToArray()
            Dim allowed As New List(Of String)
            For Each id In idsSatAllowed
                If Not satellites.ContainsKey(id) Then allowed.Add(id)
            Next
            info("idsSatAllowed") = allowed.ToArray()
            Return info
        End Function

        Private Class CSat
            Implements ISat

            Private objs As New List(Of ClObj) ' para mantener el orden de creacion al llamar a obj.availableCommHandler

            Private Function findObj(ByVal id As String) As ClObj
                For Each obj In objs
                    If obj.getId() = id Then Return obj
                Next
                Return Nothing
            End Function

            Private lockSendHS As New Object()

            Private tsInit As Double
            Public Function getTsInit() As Double
                Return tsInit
            End Function

            Private idSat As String
            Public Function getId() As String Implements ISat.getId
                Return idSat
            End Function

            Public Sub New(ByVal idSat As String, ByVal tsSat As Double, ByVal prevTsInit As Double?)
                Me.idSat = idSat
                lastSatTime = tsSat
                tsInit = getCurrentTime()
                If tsInit = prevTsInit Then tsInit += 1 '??
                send(New jsObject From {{"type", "i"}, {"tsInit", tsInit}})
            End Sub

            Private lastDataSH As jsObject
            Private lastSecSH As Double
            Private lastSecHS As Double = 0
            Private exchangeHS As httpExchange
            Private pendingHS As New List(Of CPendingHS)
            Private pendingResponseHS As List(Of CPendingHS)
            Private lastSatTime As Double
            Private hostTimeInLastSatTime As Double = getCurrentTime()
            Private lastTsComHS As Double = getCurrentTime()

            Private Function diffCurTime(ByVal time0 As Double)
                Dim t = getCurrentTime() - time0
                Return If((t >= 0), t, 0)
            End Function

            Private Function getTime() As Double Implements ISat.getTime
                Dim delta = getCurrentTime() - hostTimeInLastSatTime
                If delta < 0 Then delta = 0
                Return lastSatTime + delta
            End Function

            Private Function diffTime(ByVal timeSat0) As Double Implements ISat.diffTime
                Dim diff = getTime() - timeSat0
                Return If((diff >= 0), diff, 0)
            End Function

            Private Function getAgeLastCom() As Double Implements ISat.getAgeLastCom
                Dim age = getCurrentTime() - lastTsComHS
                Return If((age >= 0), age, 0)
            End Function

            Private valid As Boolean = True
            Public Function isValid() As Boolean Implements ISat.isValid
                Return valid
            End Function
            Public Sub destroy() Implements ISat.destroy
                closeExchangeHS()
                Try
                    If satellites(idSat) Is Me Then
                        satellites.Remove(idSat)
                    End If
                Catch e As Exception
                End Try
                data = Nothing
                valid = False
            End Sub

            Private Class CPendingHS

                Public q As jsObject
                Public callback As delCallbackHS
                Public ts As Double
                Public tsSend As Double
                Public params As interfaceParamsSend
                'var o = { q: $.extend(true, {}, q), callback: callback, ts: getCurrentTime(), params: params }; 
                'if (params) params.pendingResp++;

            End Class
            Interface interfaceParamsSend
                Property pendingResp As Integer
                Property maxAge As Double?
                Property qMaxAge As jsObject
            End Interface

            Public Function processMessage(ByVal isSH As Boolean, ByVal m As jsObject, ByVal exchange As httpExchange) As Integer
                lastSatTime = m("ts")
                hostTimeInLastSatTime = getCurrentTime()
                Dim m_sec As Double? = If(TypeOf m("sec") Is Double, m("sec"), Nothing)
                If isSH Then
                    Dim m_q As jsArray = TryCast(m("q"), jsArray)
                    If (lastDataSH Is Nothing) OrElse (lastSecSH <> m_sec) Then
                        If (m_sec Is Nothing) OrElse (m_q Is Nothing) Then Return 406
                        lastSecSH = m_sec
                        Dim answers As New jsArray
                        For Each question In m_q
                            Dim answer = processQuestion(question)
                            answers.Add(json.clone(answer)) ' deep-copy
                        Next
                        lastDataSH = New jsObject From {{"a", answers}}
                    End If
                    responseToS(exchange, lastSecSH, lastDataSH)
                Else
                    closeExchangeHS()
                    lastTsComHS = getCurrentTime()
                    exchangeHS = exchange
                    If pendingResponseHS IsNot Nothing Then
                        If lastSecHS <> m_sec Then
                            Dim dataHS = constructDataHS(pendingResponseHS)
                            responseToS(exchangeHS, lastSecHS, dataHS)
                            exchangeHS = Nothing
                            If currentAliveHostCom IsNot Nothing Then currentAliveHostCom.abort = True
                            currentAliveHostCom = New CAliveHostCom(Me)
                            Return 0 ' No error
                        End If
                        Dim m_a As jsArray = TryCast(m("a"), jsArray)
                        If (m_a Is Nothing) OrElse (m_a.Count <> pendingResponseHS.Count) Then Return 406

                        Dim resp = pendingResponseHS
                        pendingResponseHS = Nothing 'para readyCommToHost_HS
                        For i As Integer = 0 To m_a.Count - 1
                            processAnswer(m_a(i), resp(i))
                        Next
                        asyncRetAnswerIdsNotArrivedYet.Clear() 'No tendria que quedar ninguno pendiente
                    End If

                    ' no sendPendingHS() evitar que el mismo thread y la misma cola de llamada vayan de host a sat a host a ...
                    programSendPendingHS(False)
                End If
                Return 0 ' No error
            End Function

            Private asyncRetId As Integer = 1
            Private Class CAsyncRet
                Implements interfaceAsyncRet
                Dim answer As New jsObject From {{"type", "y"}}
                Dim ready As Boolean = False
                Dim sat As CSat
                Public Sub New(ByVal sat As CSat)
                    Me.sat = sat
                End Sub
                Private Sub sendAsyncRet()
                    If (answer("id") IsNot Nothing) And ready Then
                        sat.send(answer, Nothing, Nothing)
                    End If
                End Sub
                Public Function activate(ByVal age) As Integer
                    answer("id") = sat.asyncRetId
                    sat.asyncRetId += 1
                    answer("age") = age
                    sendAsyncRet()
                    Return answer("id")
                End Function
                Public Sub callback(ByVal ret As Object, ByVal er As String) Implements interfaceAsyncRet.callback
                    answer("ret") = ret
                    answer("er") = er
                    ready = True
                    sendAsyncRet()
                End Sub
            End Class

            Private Function processQuestion(ByVal question As jsObject) As jsObject
                Dim answer As New jsObject()
                'var idObj = getIdObj(q.idObj);
                If question Is Nothing Then Return answer
                Dim q_type As String = TryCast(question("type"), String)
                Select Case q_type
                    Case "f"
                        Dim q_id As String = TryCast(question("id"), String)
                        Dim obj As ClObj = Nothing
                        If q_id IsNot Nothing Then obj = findObj(q_id)
                        If obj Is Nothing Then
                            answer("er") = "Error-G: Object undefined"
                        Else
                            Dim q_age As Double = If(TypeOf question("age") Is Double, question("age"), Nothing)
                            obj.ageQuestion = q_age
                            Dim asyncRet As New CAsyncRet(Me)
                            obj.asyncRet = asyncRet
                            Dim func = TryCast(question("func"), String)
                            Dim args = TryCast(question("args"), jsArray)
                            Try
                                If (func Is Nothing) OrElse (obj.objHost Is Nothing) OrElse Not (obj.objHost.ContainsKey(func)) Then
                                    Throw New Exception("func: " & func & " Not found")
                                End If
                                Dim funcHost As [Delegate] = obj.objHost(func)
                                If funcHost Is Nothing Then Throw New Exception("func: " & func & " Not found")
                                If args Is Nothing Then args = New jsArray()
                                Dim params(funcHost.Method.GetParameters().Count - 1) As Object
                                For i = 0 To args.Count - 1
                                    If i >= params.Length Then Exit For
                                    params(i) = args(i)
                                Next
                                Dim ret = funcHost.Method.Invoke(funcHost.Target, params)
                                If ret Is asyncRet Then
                                    answer("asyncId") = asyncRet.activate(q_age)
                                Else
                                    answer("ret") = ret
                                End If
                            Catch e As Exception
                                Console.WriteLine(e.Message)
                                answer("er") = e.Message
                            End Try
                            obj.ageQuestion = Nothing
                            obj.asyncRet = Nothing
                        End If
                    Case "y"  ' async
                        Dim q_id As Integer = If(TypeOf question("id") Is Integer, question("id"), -1)

                        If asyncRetPendResponses.ContainsKey(q_id) Then
                            Dim tempPendResp = asyncRetPendResponses(q_id)
                            asyncRetPendResponses.Remove(q_id)
                            processAnswer(question, tempPendResp)
                        Else
                            asyncRetAnswerIdsNotArrivedYet(q_id) = question
                        End If
                End Select
                answer("age") = question("age")
                Return answer

            End Function

            Private asyncRetPendResponses As New Dictionary(Of Integer, CPendingHS) 'respuesta normal
            Private asyncRetAnswerIdsNotArrivedYet As New Dictionary(Of Integer, jsObject) 'respuesta asincrona llega antes que normal

            Private Sub processAnswer(ByVal answer As Object, ByVal pendResp As CPendingHS)
                If Not TypeOf answer Is jsObject Then answer = New jsObject()
                Dim asyncId As Integer? = If(TypeOf answer("asyncId") Is Integer, answer("asyncId"), Nothing)
                If asyncId IsNot Nothing Then
                    If Not asyncRetAnswerIdsNotArrivedYet.ContainsKey(asyncId) Then
                        'resp asincrona no ha llegado aún
                        asyncRetPendResponses(asyncId) = pendResp
                        Return
                    Else
                        answer = asyncRetAnswerIdsNotArrivedYet(asyncId)
                        asyncRetAnswerIdsNotArrivedYet.Remove(asyncId)
                    End If
                End If
                If pendResp.params IsNot Nothing Then pendResp.params.pendingResp -= 1
                If pendResp.callback IsNot Nothing Then
                    Try
                        'callback siempre se llama, si hay retorno o error
                        'var obj = null;
                        'if (pendResp.q.id != null) obj = findObj(pendResp.q.id).interfaceApp;
                        'pendResp.callback.call(obj, answer.ret, answer.er, diffCurTime(pendResp.ts), answer.age );

                        Dim ret As Object = answer("ret")
                        Dim params As New paramsCallbackHS(answer("er"), diffCurTime(pendResp.ts), answer("age"))
                        pendResp.callback(ret, params)

                        'pendResp.callback(answer("ret"), New paramsCallbackHS(answer("er"), diffCurTime(pendResp.ts), answer("age")))
                    Catch e As Exception
                        Console.WriteLine(e.Message)
                    End Try
                End If
            End Sub

            Dim fSendPendingHS As Boolean = False
            Dim dataAvailableHS As Boolean = False

            Private Sub programSendPendingHS(ByVal setDataAvailableHS As Boolean)
                SyncLock serverLock
                    If setDataAvailableHS Then dataAvailableHS = True
                    If Not fSendPendingHS Then
                        fSendPendingHS = True
                        ' esperar a que acabe el thread actual y lanzarlo en el mismo thread
                        Call New Thread(Sub()
                                            Try
                                                ControlInvoke(Sub()
                                                                  SyncLock serverLock
                                                                      sendPendingHS()
                                                                  End SyncLock
                                                              End Sub)
                                            Catch e As Exception 'se ha cerrado el control
                                            End Try
                                        End Sub).Start()
                        'window.setTimeout(sendPendingHS, 0)
                    End If
                End SyncLock
            End Sub
            Private Sub send(ByVal q As jsObject,
                                 Optional ByVal callback As delCallbackHS = Nothing, Optional ByVal params As interfaceParamsSend = Nothing)
                SyncLock serverLock
                    Dim o As New CPendingHS() With {.q = json.clone(q), .callback = callback, .ts = getCurrentTime(), .params = params} ' q.clone ??11
                    If params IsNot Nothing Then params.pendingResp += 1
                    pendingHS.Add(o)
                    programSendPendingHS(True)
                End SyncLock
            End Sub

            Private Function constructDataHS(ByVal pendingHS As List(Of CPendingHS)) As jsObject
                Dim dataHS As New jsObject
                Dim aq As New jsArray
                For Each pr In pendingHS
                    Dim q As jsObject = pr.q

                    pr.tsSend = diffCurTime(pr.ts)
                    Dim parm = pr.params
                    If (parm IsNot Nothing) AndAlso (parm.maxAge IsNot Nothing) AndAlso (pr.tsSend > parm.maxAge) Then
                        q = parm.qMaxAge
                    End If
                    q("age") = pr.tsSend
                    aq.Add(q)
                Next
                dataHS("q") = aq
                Return dataHS
            End Function

            Public Function readyCommToSat_HS() As Boolean Implements ISat.checkReadyComm
                SyncLock serverLock
                    Return (exchangeHS IsNot Nothing) AndAlso (pendingResponseHS Is Nothing)
                End SyncLock
            End Function

            Public Sub readyComm() Implements ISat.readyComm
                programSendPendingHS(True)
            End Sub
            Private Function sendPendingHS() As Boolean
                fSendPendingHS = False
                If readyCommToSat_HS() AndAlso dataAvailableHS Then
                    For Each obj In objs
                        If obj.availableCommHandler IsNot Nothing Then obj.availableCommHandler(obj) ' ??11 interfaceApp
                    Next

                    If currentAliveHostCom IsNot Nothing Then currentAliveHostCom.abort = True
                    currentAliveHostCom = New CAliveHostCom(Me)

                    lastSecHS += 1

                    Dim dataHS = constructDataHS(pendingHS)
                    pendingResponseHS = pendingHS
                    pendingHS = New List(Of CPendingHS)
                    dataAvailableHS = False

                    Dim exchange = exchangeHS ' // respuesta en el mismo thread en satelite local
                    exchangeHS = Nothing
                    responseToS(exchange, lastSecHS, dataHS)

                    Return True
                End If
                Return False
            End Function

            Private Const delayAliveHostCom = 10000
            Private Class CAliveHostCom
                Public abort As Boolean = False
                Sub New(ByVal sat As CSat)
                    Call New Thread(Sub()
                                        Thread.Sleep(delayAliveHostCom)
                                        SyncLock serverLock
                                            If Not abort Then sat.programSendPendingHS(True)
                                        End SyncLock
                                    End Sub).Start()
                End Sub
            End Class

            Private currentAliveHostCom As CAliveHostCom

            Private Function createMessage(ByVal sec As Integer?, ByVal data As jsObject) As jsObject
                Dim m As New jsObject From {{"ts", getCurrentTime()}}
                If sec IsNot Nothing Then m("sec") = sec ' sec siempre es != null en Host ?
                For Each kv As KeyValuePair(Of String, Object) In data
                    m(kv.Key) = kv.Value
                Next
                Return m
            End Function

            Private Sub responseToS(ByVal exchange As httpExchange, ByVal sec As Integer, ByVal data As jsObject)
                Dim m = createMessage(sec, data)
                sendMessageToExchange(m, exchange)
            End Sub

            Private Sub closeExchangeHS()
                If exchangeHS IsNot Nothing Then
                    exchangeHS.close()
                    exchangeHS = Nothing
                End If
            End Sub

            Function createObj(ByVal idObj As String, ByVal createObjSat As Object, ByVal createObjHost As delCreateObjHost,
                               ByVal callback As delCallbackHS, Optional ByVal availableCommHandler As delAvailableCommHandler = Nothing) _
                           As IObj Implements ISat.createObj
                SyncLock serverLock
                    Dim obj As ClObj = findObj(idObj)
                    If obj IsNot Nothing Then
                        If callback IsNot Nothing Then callback(Nothing, New paramsCallbackHS("G-Error: Object already defined", 0, 0))
                        Return Nothing
                    End If
                    Dim argsSat As New jsArray()
                    If Not ((TypeOf createObjSat Is String) Or (TypeOf createObjSat Is jsFunction)) Then
                        Dim l = TryCast(createObjSat, IList)
                        If (l Is Nothing) Or (l.Count = 0) Then
                            callback(Nothing, New paramsCallbackHS("G-Error: createObjSat error", 0, 0))
                            Return Nothing
                        End If
                        For i = 1 To l.Count - 1
                            argsSat.Add(l(i))
                        Next
                        createObjSat = createObjSat(0)
                    End If
                    If TypeOf createObjSat Is String Then createObjSat = New jsFunction(createObjSat)
                    obj = New ClObj(Me, idObj, availableCommHandler)
                    objs.Add(obj)
                    obj.objHost = createObjHost(obj)

                    send(New jsObject() From {{"id", idObj}, {"type", "c"}, {"obj", createObjSat}, {"args", argsSat}}, callback, obj)

                    Return obj
                End SyncLock
            End Function

            Private Class ClObj
                Implements IObj, interfaceParamsSend

                Private id As String
                Public Function getId() As String Implements IObj.getId
                    Return id
                End Function
                Private sat As CSat
                Public Function getSat() As ISat Implements IObj.getSat
                    Return sat
                End Function
                Public availableCommHandler As delAvailableCommHandler

                Public Sub New(ByVal sat As CSat, ByVal idObj As String, ByVal availableCommHandler As delAvailableCommHandler)
                    Me.sat = sat
                    Me.id = idObj
                    Me.availableCommHandler = availableCommHandler
                End Sub

                Public ageQuestion As Double?
                Public asyncRet As interfaceAsyncRet
                Public Function getAsyncRet() As interfaceAsyncRet Implements IObj.getAsyncRet
                    Return asyncRet
                End Function
                Public objHost As Dictionary(Of String, [Delegate])
                Private valid As Boolean = True
                Public Function isValid() As Boolean Implements IObj.isValid
                    Return valid
                End Function
                Public Sub setMaxAge(ByVal maxAge As Double?) Implements IObj.setMaxAge
                    SyncLock serverLock
                        Me.maxAge = maxAge
                    End SyncLock
                End Sub
                Public Sub [call](ByVal func As String, ByVal args As jsArray, ByVal callback As delCallbackHS) Implements IObj.call
                    sat.send(New jsObject() From {{"id", id}, {"type", "f"}, {"func", func}, {"args", args}}, callback, Me)
                End Sub
                Public Sub destroy(ByVal callback As delCallbackHS) Implements IObj.destroy
                    SyncLock serverLock
                        valid = False
                        Dim idx = sat.objs.IndexOf(Me)
                        If idx <> -1 Then sat.objs.RemoveAt(idx)
                        sat.send(New jsObject() From {{"id", id}, {"type", "d"}}, callback, Me)
                    End SyncLock
                End Sub
                Property data As Object = New jsObject() Implements IObj.data
                Public Function getPendingResp() As Integer Implements IObj.getPendingResp
                    Return pendingResp
                End Function
                Public Function checkReadyComm() As Boolean Implements IObj.checkReadyComm
                    Return sat.readyCommToSat_HS()
                End Function
                Public Sub readyComm() Implements IObj.readyComm
                    sat.readyComm()
                End Sub
                Public Property pendingResp As Integer = 0 Implements interfaceParamsSend.pendingResp
                Property maxAge As Double? = Nothing Implements interfaceParamsSend.maxAge
                Property qMaxAge As jsObject = New jsObject() From {{"id", id}, {"type", "e"}, {"er", "G-Error: MaxAge"}} Implements interfaceParamsSend.qMaxAge

            End Class

            Public Sub sendScript(ByVal s As String, Optional ByVal callback As delCallbackHS = Nothing) Implements ISat.sendScript
                send(New jsObject() From {{"type", "s"}, {"script", s}}, callback)
            End Sub
            Public Sub sendFunctionExecute(ByVal s As String, Optional ByVal callback As delCallbackHS = Nothing) Implements ISat.sendFunctionExecute
                send(New jsObject() From {{"type", "s"}, {"script", "(" & s & ")();"}}, callback)
            End Sub
            Public Sub sendObjectAssign(ByVal name As String, ByVal obj As Object, Optional ByVal callback As delCallbackHS = Nothing) Implements ISat.sendObjectAssign
                send(New jsObject() From {{"type", "s"}, {"script", name & " = " & json.objectToUnEval(obj) & ";"}}, callback)
            End Sub

            Public Property data As Object = New jsObject() Implements ISat.data

        End Class

        Private Shared Function getCurrentTime() As Double
            If time_SameTime IsNot Nothing Then Return time_SameTime
            Return getHostTime()
        End Function

        Private Shared time_SameTime As Double?

        Private Shared Sub sameTime(ByVal fSame As Boolean)
            time_SameTime = If(fSame, getHostTime(), Nothing)
        End Sub

        Private Shared ticks0 As Long = #1/1/1970#.Ticks
        Public Shared Function getHostTime() As Double
            Return Math.Round((Date.UtcNow.Ticks - ticks0) / 10000.0)
        End Function

        Private Shared Sub sendMessageToExchange(ByVal message As Object, ByVal exchange As httpExchange)
            If exchange Is Nothing Then Return
            exchange.responseHeaders("Content-Type") = "text/plain"
            Dim strMessage As String = json.objectToUnEval(message)
            Call New Thread(Sub()
                                exchange.sendResponse(200, strMessage, True)
                            End Sub).Start()
        End Sub

        Private Shared Function processReqBodySat(ByVal isSH As Boolean, ByVal reqBody As StreamReader, ByVal exchange As httpExchange) As Integer
            Try
                Dim body = reqBody.ReadToEnd()
                Dim m As jsObject = json.parse(New StringReader(body))
                'Dim m As jsObject = json.parse(reqBody)
                If m Is Nothing Then Throw New Exception()
                Dim idSat As String = m("idSat")
                Dim sat As CSat = Nothing
                satellites.TryGetValue(idSat, sat)

                If (Not isSH) And (m("i") Is Nothing) Then
                    Dim newSat = New CSat(idSat, m("ts"), If(sat IsNot Nothing, sat.getTsInit(), Nothing))

                    If registrationHandler(newSat, sat) Then

                        If (sat IsNot Nothing) Then sat.destroy()
                        sat = newSat
                        satellites(idSat) = sat
                    Else
                        newSat.destroy()
                        Return 401
                    End If
                Else

                    If (sat Is Nothing) OrElse (m("i") <> sat.getTsInit()) Then
                        Dim mResp As New jsObject From {
                            {"r", True}, {"ts", getCurrentTime()}, {"er", If(sat IsNot Nothing, "conflict", "reinit")}}
                        sendMessageToExchange(mResp, exchange)
                        Return 0
                    End If
                End If
                If sat Is Nothing Then Return 401
                Return sat.processMessage(isSH, m, exchange)

            Catch e As Exception
                Return 400
            End Try


        End Function

        Public Overrides Sub requestHandler(ByVal exchange As httpExchange)
            exchange.responseHeaders("Cache-Control") = "no-cache"
            exchange.responseHeaders("Conection") = "close"
            exchange.responseHeaders("Server") = "GTPV Server"

            Select Case exchange.method
                Case "GET"
                Case "POST"
                Case "HEAD"
                    Exit Select
                Case Else
                    exchange.sendResponse(405)
                    Return
            End Select

            Dim isSH As Boolean
            If (exchange.method = "POST") And ((exchange.path = "/sh/") Or (exchange.path = "/hs/")) Then
                isSH = (exchange.path = "/sh/")
                Dim reqBody = exchange.getRequestBody()
                Try
                    ControlInvoke(Sub()
                                      SyncLock serverLock
                                          Dim rCode = processReqBodySat(isSH, reqBody, exchange)
                                          If (rCode <> 0) Then
                                              exchange.sendResponse(rCode)
                                          End If
                                      End SyncLock
                                  End Sub)
                Catch e As Exception ' se ha cerrado el control
                End Try
            ElseIf (exchange.method = "GET") And (exchange.path = "/r") And (exchange.query Is Nothing) Then
                Dim idSat = exchange.query
                exchange.responseHeaders("Set-Cookie") = String.Format("id={0}; Path=/; Max-age={1};", idSat, 36500L * 24 * 60 * 60)
                exchange.responseHeaders("Location") = "/"
                exchange.sendResponse(303)
            Else
                Dim file = FileServer.find(Nothing, exchange.path,
                                           New FileServer.infoReq(exchange.method, exchange.path, exchange.query, exchange.remoteAddress, exchange.localAddress))
                sendResponseFile(file, exchange)
            End If
        End Sub

        Private Shared Sub sendResponseFile(ByVal f As FileServer.CFile, ByVal exchange As httpExchange)
            If f IsNot Nothing Then
                exchange.responseHeaders("Content-Type") = f.type
                If exchange.method = "HEAD" Then
                    Dim len As Integer
                    If (f.binary) Then
                        len = f.buffer.Length
                    Else
                        Dim e = Encoding.GetEncoding(If(f.utf8, "utf-8", "iso-8859-1"))
                        len = e.GetBytes(f.content).Length
                    End If
                    exchange.responseHeaders("Content-Length") = len
                    exchange.sendResponse(200)
                Else
                    If (f.binary) Then
                        exchange.sendResponse(200, f.buffer)
                    Else
                        exchange.sendResponse(200, f.content, f.utf8)
                    End If
                End If
            Else
                exchange.sendResponse(404)
            End If
        End Sub

    End Class

End Namespace
