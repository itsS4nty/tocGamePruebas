Namespace hostGTpv
    Public Class H_SatConfig

        Private Shared sats As New Dictionary(Of ISat, IObj)

        Private Class CObjData
            Public config As jsObject
        End Class

        Public Shared Sub createSat(ByVal sat As ISat, ByVal callback As action)
            Dim obj = sat.createObj("SatConfig", createObjSat, AddressOf createObjHost,
                                    Sub(ret As Object, params As Object)
                                        refreshConfig(sat, callback)
                                    End Sub)
            sats(sat) = obj
            obj.data = New CObjData()
        End Sub

        Public Shared Sub destroySat(ByVal sat As ISat)
            If sats.ContainsKey(sat) Then
                Dim obj = sats(sat)
                obj.data = Nothing
                sats.Remove(sat)
            End If
        End Sub

        Public Shared Sub refreshConfig(ByVal sat As ISat, ByVal callback As action)
            If sats.ContainsKey(sat) Then
                Dim obj = sats(sat)
                obj.call("refreshConfig", Nothing, Sub(config As jsObject, params As Object)
                                                       Dim data As CObjData = obj.data
                                                       data.config = config
                                                       If callback IsNot Nothing Then callback()
                                                   End Sub)
            Else
                If callback IsNot Nothing Then callback()
            End If
        End Sub

        Public Shared Function getConfig(ByVal sat As ISat) As jsObject
            If sats.ContainsKey(sat) Then
                Dim obj = sats(sat)
                Return obj.data.config
            End If
            Return Nothing
        End Function

        Private Shared Function createObjHost(ByVal obj As IObj) As Dictionary(Of String, [Delegate])
            Return New Dictionary(Of String, [Delegate])
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createSatConfigS(host);	}")

    End Class
End Namespace
