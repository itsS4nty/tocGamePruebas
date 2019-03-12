Namespace hostGTpv

    Public Class H_Caja
        Public Shared clasesMonedas() As Double = {0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500}
        Public Shared Event evAbrir(ByVal codiDep As Double, ByVal canvi() As Double)
        Public Shared Event evCerrar(ByVal codiDep As Double, ByVal canvi() As Double)
        Public Shared Event evMovimiento(ByVal add As Boolean, ByVal tipoMov As String, ByVal mov As jsObject)

        Public Shared Sub abrir(Optional ByVal _canvi() As Double = Nothing)
            oberta = True
            canvi = New Double(clasesMonedas.Length - 1) {}
            If _canvi IsNot Nothing Then
                Try
                    For i = 0 To clasesMonedas.Length - 1
                        canvi(i) = _canvi(i)
                    Next
                Catch e As Exception
                End Try
            End If
            movimientos.Clear()
            ts = satServer.getHostTime()
            actualizeSat(actualizeSatType.All)
        End Sub
        Public Shared Sub cerrar(Optional ByVal _canvi() As Double = Nothing)
            oberta = False
            canvi = New Double(clasesMonedas.Length - 1) {}
            If _canvi IsNot Nothing Then
                Try
                    For i = 0 To clasesMonedas.Length - 1
                        canvi(i) = _canvi(i)
                    Next
                Catch e As Exception
                End Try
            End If
            movimientos.Clear()
            actualizeSat(actualizeSatType.All)
            RaiseEvent evCloseForH() 'runCloseHandlers()

        End Sub
        Public Shared Sub movimiento(ByVal add As Boolean, ByVal tipoMov As String, ByVal mov As jsObject)
            movimientoToSat(add, tipoMov, mov)
        End Sub
        Private Shared ts As Double = -1
        Private Shared oberta As Boolean = False
        Private Shared canvi(clasesMonedas.Length - 1) As Double
        Private Shared movimientos As New Dictionary(Of String, jsArray)

        Public Shared Function isOpen() As Boolean
            Return oberta
        End Function

        Public Shared Event evCloseForH()

        Private Shared sats As New Dictionary(Of ISat, IObj)

        Private Shared Function getComHandler(ByVal obj As IObj) As delCallbackHS
            Return Sub(ret As Object, params As Object)
                       Dim obj_Data As CObjData = obj.data
                       If obj_Data.callbackCreateAct IsNot Nothing Then
                           Dim f = obj_Data.callbackCreateAct
                           obj_Data.callbackCreateAct = Nothing
                           f()
                       End If
                   End Sub
        End Function

        Private Shared Function totalCanvi(ByVal canvi() As Double) As Double
            Dim total As Double = 0
            For i = 0 To clasesMonedas.Length - 1
                total += clasesMonedas(i) * canvi(i)
            Next
            Return total
        End Function

        Private Class CObjData
            Public act_All As Boolean
            Public act_infoCaja As Boolean
            Public act_movimientos As New Dictionary(Of String, jsArray)
            Public isAdmin As Boolean
            Public callbackCreateAct As action '??11
            Public comHandler As delCallbackHS
        End Class
        Public Shared Sub createSat(ByVal sat As ISat, ByVal isAdmin As Boolean, ByVal callback As action)
            Dim obj = sat.createObj("caja", New Object() {createObjSat, isAdmin}, getcreateObjHost(isAdmin), Nothing, AddressOf availableCommHandler)
            sats(sat) = obj
            Dim data As CObjData = New CObjData()
            obj.data = data
            data.act_All = True
            data.act_movimientos = New Dictionary(Of String, jsArray)
            data.comHandler = getComHandler(obj)
            data.isAdmin = isAdmin
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
            Dim infoCajaSat = New jsObject() From {{"oberta", oberta}}
            If data.isAdmin Then infoCajaSat("canvi") = canvi.Clone()
            If (data.act_All) Then
                objSat.call("actualize", New jsArray() From {ts, infoCajaSat, If(data.isAdmin, movimientos, Nothing)}, data.comHandler)
                data.act_All = False : data.act_infoCaja = False : data.act_movimientos.Clear()
                Return
            End If
            If data.act_infoCaja Then
                objSat.call("infoCaja", New jsArray() From {infoCajaSat}, data.comHandler)
                data.act_infoCaja = False
            End If
            If data.act_movimientos.Count > 0 Then
                Dim movimientosSat As New Dictionary(Of String, jsArray)
                For Each kv In data.act_movimientos
                    Dim tipoMov = kv.Key
                    movimientosSat(tipoMov) = New jsArray()
                    For Each m In data.act_movimientos(tipoMov)
                        Dim a_d = If((movimientos.ContainsKey(tipoMov)) AndAlso (movimientos(tipoMov).Contains(m)), "a", "d")
                        movimientosSat(tipoMov).Add(New jsArray() From {a_d, m})
                    Next
                Next
                objSat.call("movimientos", New jsArray() From {movimientosSat}, data.comHandler)
                data.act_movimientos.Clear()
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

        Private Shared Sub movimientoToSat(ByVal add As Boolean, ByVal tipoMov As String, ByVal mov As jsObject, Optional ByVal noActObj As IObj = Nothing)
            For Each kv As KeyValuePair(Of ISat, IObj) In sats
                Dim obj = kv.Value
                If noActObj Is obj Then Return
                Dim data As CObjData = obj.data
                If Not data.isAdmin Then Return
                Dim allMovs = data.act_movimientos
                If Not allMovs.ContainsKey(tipoMov) Then allMovs(tipoMov) = New jsArray()
                Dim movs = allMovs(tipoMov)
                If Not add Then
                    Dim idx = gIndexOf(movs, mov)
                    If idx <> -1 Then
                        movs.RemoveAt(idx) ' aún estaba para añadir, se borra
                        Return
                    End If
                End If
                movs.Add(mov)
                obj.readyComm()
            Next
        End Sub

        Public Shared Function gIndexOf(ByVal a As jsArray, ByVal obj As jsObject) As Integer
            Dim eq = Function(obj1 As jsObject, obj2 As jsObject) As Boolean
                         For Each kv1 In obj1
                             If kv1.Value <> obj2(kv1.Key) Then Return False
                         Next
                         Return True
                     End Function
            For i = 0 To a.Count - 1
                If eq(a(i), obj) Then Return i
            Next
            Return -1
        End Function

        Private Shared Sub insertMovimientoEnCaja(ByVal objSat As IObj, ByVal tipoMov As String, ByVal mov As jsObject, ByVal movimientos As Dictionary(Of String, jsArray))
            If Not movimientos.ContainsKey(tipoMov) Then movimientos(tipoMov) = New jsArray()
            movimientos(tipoMov).Add(mov)
            movimientoToSat(True, tipoMov, mov, objSat)
            RaiseEvent evMovimiento(True, tipoMov, mov)
        End Sub

        Private Shared Sub deleteMovimientoEnCaja(ByVal objSat As IObj, ByVal tipoMov As String, ByVal mov As jsObject, ByVal movimientos As Dictionary(Of String, jsArray))
            If Not movimientos.ContainsKey(tipoMov) Then Return
            Dim idx = gIndexOf(movimientos(tipoMov), mov)
            If idx = -1 Then Return
            Dim remMov = movimientos(tipoMov)(idx)
            movimientos(tipoMov).RemoveAt(idx)
            movimientoToSat(False, tipoMov, remMov, objSat)
            RaiseEvent evMovimiento(False, tipoMov, mov)
        End Sub

        Private Shared ticks0 As Long = #1/1/1970#.Ticks
        Public Shared Function getTs() As Double
            Return Math.Round((Date.UtcNow.Ticks - ticks0) / 10000.0)
        End Function

        Private Shared Function getcreateObjHost(ByVal isAdmin As Boolean) As delCreateObjHost
            Return Function(obj As IObj) As Dictionary(Of String, [Delegate])
                       Return createObjHost(obj, isAdmin)
                   End Function
        End Function
        Private Shared Function createObjHost(ByVal objSat As IObj, ByVal isAdmin As Boolean) As Dictionary(Of String, [Delegate])
            Dim ret = New Dictionary(Of String, [Delegate])
            If isAdmin Then
                ret("insertMovimiento") = Function(_ts As Double, tipoMov As String, mov As jsObject) As Boolean
                                              If _ts <> ts Then Return False
                                              Select Case tipoMov
                                                  Case "apuntes"
                                                      If Not oberta Then Return False
                                                      insertMovimientoEnCaja(objSat, tipoMov, mov, movimientos)

                                                      Return True
                                                  Case Else
                                                      Return False
                                              End Select
                                          End Function
                ret("deleteMovimiento") = Function(_ts As Double, tipoMov As String, mov As jsObject) As Boolean
                                              If _ts <> ts Then Return False
                                              Select Case tipoMov
                                                  Case "tickets"
                                                      If Not oberta Then Return False
                                                      deleteMovimientoEnCaja(objSat, tipoMov, mov, movimientos)
                                                      Return True
                                                  Case Else
                                                      Return False
                                              End Select
                                          End Function
                ret("abrir") = Function(_ts As Double, _canvi As jsArray, codiDep As Double) As Boolean
                                   If (_ts <> ts) Or oberta Then Return False
                                   oberta = True
                                   canvi = New Double(clasesMonedas.Length - 1) {}
                                   Try
                                       For i = 0 To clasesMonedas.Length - 1
                                           canvi(i) = _canvi(i)
                                       Next
                                   Catch e As Exception
                                   End Try
                                   movimientos.Clear()
                                   ts = satServer.getHostTime()
                                   actualizeSat(actualizeSatType.All)
                                   RaiseEvent evAbrir(codiDep, canvi)
                                   Return True
                               End Function
                ret("cerrar") = Function(_ts As Double, _canvi As jsArray, codiDep As Double) As Boolean
                                    If (_ts <> ts) Or Not oberta Then Return False

                                    oberta = False
                                    canvi = New Double(clasesMonedas.Length - 1) {}
                                    Try
                                        For i = 0 To clasesMonedas.Length - 1
                                            canvi(i) = _canvi(i)
                                        Next
                                    Catch e As Exception
                                    End Try
                                    movimientos.Clear()
                                    actualizeSat(actualizeSatType.All)
                                    RaiseEvent evCerrar(codiDep, canvi)
                                    RaiseEvent evCloseForH() 'runCloseHandlers()
                                    Return True
                                End Function
            End If
            Return ret
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createCajaS(host); }")
    End Class

End Namespace