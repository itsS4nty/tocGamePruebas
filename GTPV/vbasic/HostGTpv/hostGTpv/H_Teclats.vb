Namespace hostGTpv
    Public Class H_Teclats
        Private Shared jsTeclats As New jsArray()
        private Shared Version As Double = 1

        Public Shared Event evActualize(ByVal teclats() As CAmbient)

        Public Const nButtonsPerAmbient = 6 * 6

        Public Class CAmbient
            Public ambient As String
            Public buttons(nButtonsPerAmbient - 1) As CButton
            Public Sub New(ByVal ambient As String)
                Me.ambient = ambient
            End Sub
        End Class
        Public Class CButton
            Public codi As Double
            Public color As Double
            Public Sub New(ByVal codi As Double, ByVal color As Double)
                Me.codi = codi : Me.color = color
            End Sub
        End Class

        Private Shared Sub sortTeclat()
            jsTeclats.Sort(Function(a, b)
                               Dim strA As String = DirectCast(DirectCast(a, jsObject)("ambient"), String)
                               Dim strB As String = DirectCast(DirectCast(b, jsObject)("ambient"), String)
                               Return String.Compare(strA, strB)
                           End Function)
        End Sub
        Public Shared Sub actualize(ByVal _teclats() As CAmbient)
            jsTeclats.Clear()
            For Each a In _teclats
                If a.ambient Is Nothing Then Continue For
                Dim jsAmb As New jsObject()
                jsAmb("ambient") = a.ambient
                Dim jsBut(nButtonsPerAmbient - 1) As jsObject
                For i = 0 To nButtonsPerAmbient - 1
                    If a.buttons(i) IsNot Nothing Then
                        jsBut(i) = New jsObject() From {{"codi", a.buttons(i).codi}, {"color", a.buttons(i).color}}
                    End If
                Next
                jsAmb("buttons") = jsBut
                jsTeclats.Add(jsAmb)
            Next
            sortTeclat()
            Version += 1
            actualizeSat(actualizeSatType.All)
        End Sub
        Private Shared sats As New Dictionary(Of ISat, IObj)

        Private Shared Function getComHandler(ByVal obj As IObj) As delCallbackHS
            Return Sub(ret As Object, params As Object)
                       Dim data As CObjData = obj.data
                       If data.callbackCreateAct IsNot Nothing Then
                           Dim f = data.callbackCreateAct
                           data.callbackCreateAct = Nothing
                           f()
                       End If
                   End Sub
        End Function

        Private Class CObjData
            Public act_All As Boolean
            Public callbackCreateAct As action '??11
            Public comHandler As delCallbackHS
        End Class
        Public Shared Sub createSat(ByVal sat As ISat, ByVal callback As action)
            Dim obj = sat.createObj("Teclats", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
            sats(sat) = obj
            Dim data As CObjData = New CObjData()
            obj.data = data
            data.act_All = True
            data.comHandler = getComHandler(obj)
            data.callbackCreateAct = callback

        End Sub

        Public Shared Sub destroySat(ByVal sat As ISat)
            If sats.ContainsKey(sat) Then
                Dim obj = sats(sat)
                obj.data = Nothing
                sats.Remove(sat)
            End If
        End Sub

        Private Shared Sub availableCommHandler(ByVal objSat As IObj)
            Dim data As CObjData = objSat.data
            If data.act_All Then
                objSat.call("actualize", New jsArray() From {jsTeclats, Version}, data.comHandler)
                data.act_All = False
            End If
        End Sub

        Private Enum actualizeSatType
            All
        End Enum
        Private Shared Sub actualizeSat(ByVal type As actualizeSatType, Optional ByVal noActObj As IObj = Nothing)
            For Each kv As KeyValuePair(Of ISat, IObj) In sats
                Dim obj = kv.Value
                If noActObj Is obj Then Continue For
                Dim data As CObjData = obj.data
                If type = actualizeSatType.All Then data.act_All = True
                obj.readyComm()
            Next
        End Sub

        Private Shared Sub genEvActualize()
            Dim teclats As New List(Of CAmbient)
            For Each jsAmb In jsTeclats
                Dim amb As New CAmbient(jsAmb("ambient"))
                Dim jsButs() As jsObject = jsAmb("buttons")
                For i = 0 To nButtonsPerAmbient - 1
                    amb.buttons(i).codi = jsButs(i)("codi")
                    amb.buttons(i).color = jsButs(i)("color")
                Next
                teclats.Add(amb)
            Next
            RaiseEvent evActualize(teclats.ToArray())
        End Sub

        Private Shared Function getAmbient(ByVal ambientName As String, ByVal fCreate As Boolean) As jsObject
            If ambientName Is Nothing Then Return Nothing
            Dim amb As jsObject
            For Each o In jsTeclats
                amb = o
                'Dim name As String = amb("ambient")
                If (TryCast(amb("ambient"), String) = ambientName) Then Return amb
            Next
            If Not fCreate Then Return Nothing
            amb = New jsObject() From {{"ambient", ambientName}, {"buttons", New jsObject(nButtonsPerAmbient - 1) {}}}
            jsTeclats.Add(amb)
            sortTeclat()
            Return amb
        End Function
        Private Shared Function getButtons(ByVal ambientName As String, ByVal fCreate As Boolean) As jsObject()
            Dim ret = getAmbient(ambientName, fCreate)
            If ret Is Nothing Then Return Nothing
            Return ret("buttons")
        End Function

        Private Class CBut
            Public ambient As String
            Public pos As Integer
            Public codi As Double?
            Public color As Double?
        End Class
        Private Shared Function getInfoBut(ByVal but As jsObject) As CBut
            If but Is Nothing Then Return Nothing
            Dim ret As New CBut()
            ret.ambient = TryCast(but("ambient"), String)
            If ret.ambient Is Nothing Then Return Nothing
            Dim pos As Double = If(TypeOf but("pos") Is Double, but("pos"), -1)
            If (pos < 0) Or (pos >= nButtonsPerAmbient) Then Return Nothing
            ret.pos = Math.Truncate(pos)
            ret.codi = If(TypeOf but("codi") Is Double, but("codi"), Nothing)
            ret.color = If(TypeOf but("color") Is Double, but("color"), Nothing)
            Return ret
        End Function
        Private Shared Function createObjHost(ByVal objSat As IObj) As Dictionary(Of String, [Delegate])
            Return New Dictionary(Of String, [Delegate]) From
            {{"renAmbient", Function(oldAmbient As String, newAmbient As String, codiDep As Double, versionSat As Double) As Double
                                If (oldAmbient Is Nothing) Or (newAmbient Is Nothing) Then Return Version
                                Dim amb = getAmbient(oldAmbient, True)
                                amb("ambient") = newAmbient
                                sortTeclat()
                                Version += 1
                                actualizeSat(actualizeSatType.All, If(Version = versionSat, objSat, Nothing))
                                genEvActualize()
                                Return Version
                            End Function},
             {"delAmbient", Function(ambientName As String, versionSat As Double) As Double
                                Dim amb = getAmbient(ambientName, False)
                                If amb Is Nothing Then Return Version
                                jsTeclats.Remove(amb)
                                Version += 1
                                actualizeSat(actualizeSatType.All, If(Version = versionSat, objSat, Nothing))
                                genEvActualize()
                                Return Version
                            End Function},
             {"addArticle", Function(but As jsObject, codiDep As Double, versionSat As Double) As Double
                                Dim infoBut = getInfoBut(but)
                                If infoBut Is Nothing Then Return Version
                                Dim buts = getButtons(infoBut.ambient, True)
                                buts(infoBut.pos) = New jsObject() From {{"codi", infoBut.codi}, {"color", infoBut.color}}
                                Version += 1
                                actualizeSat(actualizeSatType.All, If(Version = versionSat, objSat, Nothing))
                                genEvActualize()
                                Return Version
                            End Function},
             {"delArticle", Function(but As jsObject, versionSat As Double) As Double
                                Dim infoBut = getInfoBut(but)
                                If infoBut Is Nothing Then Return Version
                                Dim buts = getButtons(infoBut.ambient, True)
                                buts(infoBut.pos) = Nothing
                                Version += 1
                                actualizeSat(actualizeSatType.All, If(Version = versionSat, objSat, Nothing))
                                genEvActualize()
                                Return Version
                            End Function},
             {"changeArticle", Function(but1 As jsObject, but2 As jsObject, codiDep As Double, versionSat As Double) As Double
                                   Dim infoBut1 = getInfoBut(but1)
                                   Dim infoBut2 = getInfoBut(but2)
                                   If (infoBut1 Is Nothing) Or (infoBut2 Is Nothing) Then Return Version
                                   Dim buts1 = getButtons(infoBut1.ambient, True)
                                   Dim buts2 = getButtons(infoBut1.ambient, True)
                                   buts1(infoBut1.pos) = New jsObject() From {{"codi", infoBut2.codi}, {"color", infoBut2.color}}
                                   buts2(infoBut2.pos) = New jsObject() From {{"codi", infoBut1.codi}, {"color", infoBut1.color}}
                                   Version += 1
                                   actualizeSat(actualizeSatType.All, If(Version = versionSat, objSat, Nothing))
                                   genEvActualize()
                                   Return Version
                               End Function},
             {"changeColorArticle", Function(but As jsObject, color As Double, codiDep As Double, versionSat As Double) As Double
                                        Dim infoBut = getInfoBut(but)
                                        If infoBut Is Nothing Then Return Version
                                        Dim buts = getButtons(infoBut.ambient, True)
                                        If buts(infoBut.pos) Is Nothing Then Return Version
                                        buts(infoBut.pos)("color") = color
                                        Version += 1
                                        actualizeSat(actualizeSatType.All, If(Version = versionSat, objSat, Nothing))
                                        genEvActualize()
                                        Return Version
                                    End Function}
             }
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createTeclatsS(host); }")

    End Class
End Namespace
