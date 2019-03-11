Namespace hostGTpv
    Public Class H_Mesas
        Public Shared jsComedores As New jsArray()
        Public Shared Version As Double = 1

        Public Class CComedor
            Public name As String
            Public mesas() As CMesa
            Public Sub New(ByVal name As String, ByVal mesas() As CMesa)
                Me.name = name : Me.mesas = mesas
            End Sub
        End Class
        Public Class CMesa
            Public name As String
            Public Sub New(ByVal name As String)
                Me.name = name
            End Sub
        End Class

        Public Shared Sub actualize(ByVal comedores() As CComedor)
            jsComedores.Clear()
            For Each c In comedores
                Dim jsC = New jsObject()
                jsC("name") = c.name
                Dim jsMs = New jsArray()
                For Each m In c.mesas
                    jsMs.Add(New jsObject() From {{"name", m.name}})
                Next
                jsC("mesas") = jsMs
                jsComedores.Add(jsC)
            Next
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
            Dim obj = sat.createObj("Mesas", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
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
                objSat.call("actualize", New jsArray() From {jsComedores, Version}, data.comHandler)
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

        Private Shared Function createObjHost(ByVal obj As IObj) As Dictionary(Of String, [Delegate])
            Return New Dictionary(Of String, [Delegate])
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createMesasS(host); }")

    End Class
End Namespace
