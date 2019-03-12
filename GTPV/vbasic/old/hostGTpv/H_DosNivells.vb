Namespace hostGTpv
    Public Class H_DosNivells
        Private Shared jsDosNivells As New jsArray()
        'Private Shared dosNivells As New List(Of CDosNivells)
        Private Shared Version As Double = 1

        Public Class CDosNivells
            Public tag As String
            Public texte As String
            Public Sub New(ByVal tag As String, ByVal texte As String)
                Me.tag = tag : Me.texte = texte
            End Sub
        End Class

        Public Shared Sub actualize(ByVal _dosNivells() As CDosNivells)
            jsDosNivells.Clear()
            If _dosNivells IsNot Nothing Then
                For Each d In _dosNivells
                    jsDosNivells.Add(New jsObject() From {{"tag", d.tag}, {"texte", d.texte}})
                Next
            End If
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
            Dim obj = sat.createObj("DosNivells", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
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
                objSat.call("actualize", New jsArray() From {jsDosNivells, Version}, data.comHandler)
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
        Private Shared createObjSat As New jsFunction("function(host) { return createDatosDosNivellsS(host); }")

    End Class
End Namespace
