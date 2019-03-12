Namespace hostGTpv

    Public Class H_Comandes
        Public Shared Event evComandaActualized(ByVal idComanda As String, ByVal c As CComanda)
        Public Shared Event evCobrarComanda(ByVal idComanda As String, ByVal c As CComanda)
        Public Shared Event evPrintTicket(ByVal idComanda As String, ByVal tsPrint As Double?)

        Public Shared Sub actualizeComanda(ByVal idComanda As String, ByVal c As CComanda)
            Dim oldC As CComandaP = Nothing
            comandes.TryGetValue(idComanda, oldC)
            Dim sameTs = False

            Dim cp As New CComandaP(idComanda)
            cp.ts = c.ts
            cp.ver = c.ver
            sameTs = (oldC IsNot Nothing) AndAlso (oldC.ts = cp.ts)
            If sameTs AndAlso (cp.ver <= oldC.ver) Then cp.ver = oldC.ver + 1
            If cp.ver <= 0 Then cp.ver = 1
            cp.nextIdItem = c.nextIdItem
            cp.states.fOpen = c.fOpen
            cp.states.fCobrada = c.fCobrada
            cp.props = json.clone(c.props)

            Dim fNoIds = False
            Dim maxId As Integer = 0
            For Each item In c.items
                Dim itemP As New jsObject()
                itemP("id") = item.id
                If item.id <= 0 Then
                    fNoIds = True
                Else
                    If maxId < item.id Then maxId = item.id
                End If
                itemP("n") = item.n
                itemP("codi") = item.codi
                itemP("preu") = item.preu
                itemP("esS") = item.esS
                itemP("ord") = item.ord
                cp.items.Add(itemP)
            Next
            maxId += 1
            If fNoIds Then
                For Each itemP As jsObject In cp.items
                    Dim idItem As Double = itemP("id")
                    If idItem <= 0 Then
                        itemP("id") = maxId
                        maxId += 1
                    End If
                Next
            End If
            If maxId > cp.nextIdItem Then cp.nextIdItem = maxId
            If sameTs AndAlso (cp.nextIdItem < oldC.nextIdItem) Then cp.nextIdItem = oldC.nextIdItem

            comandes(idComanda) = cp
            actualizeSats(idComanda)
        End Sub

        Public Shared Function getIdsComanda() As String()
            Dim ret As New List(Of String)
            For Each kv In comandes
                ret.Add(kv.Key)
            Next
            ret.Sort()
            Return ret.ToArray()
        End Function

        'si se cierra caja se borran las comandas
        Shared Sub New()
            AddHandler H_Caja.evCloseForH, Sub()
                                               For Each kv In comandes
                                                   Dim c = kv.Value
                                                   c.init()
                                                   actualizeSats(kv.Key)
                                               Next
                                           End Sub
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
            Public act_idsComanda As List(Of String)
            Public callbackCreateAct As action '??11
            Public comHandler As delCallbackHS
        End Class
        Public Shared Sub createSat(ByVal sat As ISat, ByVal callback As action)
            Dim obj = sat.createObj("Comandes", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
            sats(sat) = obj
            Dim data As CObjData = New CObjData()
            obj.data = data
            data.act_All = True
            data.act_idsComanda = New List(Of String)
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
                data.act_idsComanda.Clear()
                For Each kv In comandes
                    data.act_idsComanda.Add(kv.Key)
                Next
                data.act_All = False
            End If
            ' construct qs
            Dim qs As New jsArray()
            For Each id In data.act_idsComanda
                If comandes.ContainsKey(id) Then
                    Dim c = comandes(id)
                    Dim jsC As New jsObject()
                    jsC("id") = c.id
                    jsC("ts") = c.ts
                    jsC("ver") = c.ver
                    jsC("states") = c.states.toJSObject()
                    jsC("props") = c.props
                    jsC("items") = c.items
                    qs.Add(jsC)
                End If
            Next

            If (qs.Count > 0) OrElse (data.callbackCreateAct IsNot Nothing) Then
                objSat.call("actualize", New jsArray() From {qs}, data.comHandler)
            End If
            data.act_idsComanda.Clear()
        End Sub

        Private Shared Sub actualizeSats(ByVal idComanda As String, Optional ByVal noActObj As IObj = Nothing)
            For Each kv As KeyValuePair(Of ISat, IObj) In sats
                Dim obj = kv.Value
                If noActObj Is obj Then Continue For
                Dim data As CObjData = obj.data
                If Not data.act_idsComanda.Contains(idComanda) Then
                    data.act_idsComanda.Add(idComanda)
                    obj.readyComm()
                End If
            Next
            RaiseEvent evComandaActualized(idComanda, getComanda(idComanda))
        End Sub

        Public Shared Function getComanda(ByVal idComanda As String) As CComanda
            If Not comandes.ContainsKey(idComanda) Then Return Nothing
            Dim cp = comandes(idComanda)
            Dim c As New CComanda(idComanda)
            c.ver = cp.ver
            c.ts = cp.ts
            c.nextIdItem = cp.nextIdItem
            c.fOpen = cp.states.fOpen
            c.fCobrada = cp.states.fCobrada
            c.props = json.clone(cp.props)
            c.items.Clear()
            For Each item In cp.items
                c.items.Add(New CItem(DirectCast(item, jsObject)))
            Next
            Return c
        End Function

        Private Class CComandaP
            Public Structure CStates
                Public fOpen As Boolean
                Public fCobrada As Boolean
                Public Function toJSObject() As jsObject
                    Return New jsObject() From {{"fOpen", fOpen}, {"fCobrada", fCobrada}}
                End Function
            End Structure
            Public id As String
            Sub New(ByVal id As String)
                Me.id = id
            End Sub
            Public ver As Double
            Public ts As Double
            Public nextIdItem As Double
            Public states As CStates
            Public props As New jsObject()
            Public items As New jsArray()
            Public Sub init()
                ts = satServer.getHostTime()
                ver = 1
                nextIdItem = 1
                states.fOpen = False : states.fCobrada = False '"closed"
                props.Clear()
                items.Clear()
                'if (c.ticketsToPrint == null) c.ticketsToPrint = [];
                'if (c.comandaCobrada == null) c.comandaCobrada = [];
            End Sub
        End Class
        Private Shared comandes As New Dictionary(Of String, CComandaP)

        Public Class CItem
            Public id As Double
            Public n As Double
            Public codi As Double
            Public preu As Double
            Public esS As Boolean
            Public ord As Double
            Public Sub New(ByVal item As jsObject)
                id = item("id")
                n = item("n")
                codi = item("codi")
                preu = item("preu")
                esS = item("esS")
                ord = item("ord")
            End Sub
            Public Sub New(ByVal id As Double)
                Me.id = id
            End Sub
        End Class

        Public Class CComanda
            Public id As String
            Public ts As Double
            Public ver As Double
            Public nextIdItem As Double
            Public fOpen As Boolean
            Public fCobrada As Boolean
            Public props As New jsObject
            Public items As New List(Of CItem)
            Public Sub New(ByVal id)
                Me.id = id
                Me.ts = satServer.getHostTime()
                Me.ver = 1
                Me.nextIdItem = 1
            End Sub
            Public Function addItem() As CItem
                Dim item As New CItem(nextIdItem)
                nextIdItem += 1
                items.Add(item)
                Return item
            End Function
        End Class

        Private Shared Function createObjHost(ByVal objSat As IObj) As Dictionary(Of String, [Delegate])
            Return New Dictionary(Of String, [Delegate]) From {
                   {"orders", Function(comdSat As jsArray) As jsArray
                                  Dim answ As New jsArray()
                                  For csIdx = 0 To comdSat.Count - 1
                                      Dim cSat As jsObject = comdSat(csIdx)
                                      Dim cSat_id As String = cSat("id")
                                      If Not comandes.ContainsKey(cSat_id) Then
                                          comandes(cSat_id) = New CComandaP(cSat_id)
                                          comandes(cSat_id).init()
                                      End If
                                      Dim c = comandes(cSat_id)
                                      Dim answC As New jsObject()
                                      Dim tsSat As Double = cSat("ts")

                                      Dim isOpenComanda = Function() As Boolean ' is open comanda
                                                              Return c.states.fOpen
                                                          End Function

                                      Dim checkOpenComanda = Function() As Boolean ' check open comanda
                                                                 If isOpenComanda() AndAlso (tsSat = c.ts) Then Return True
                                                                 answC("er") = "H not open"
                                                                 Return False
                                                             End Function

                                      Dim checkClosedComanda = Function() As Boolean  ' check closed comanda
                                                                   If Not isOpenComanda() Then Return True
                                                                   answC("er") = "H not closed"
                                                                   Return False
                                                               End Function

                                      ' sat tenia la última versión, falta añadir orders de sat y incremantar ver.
                                      Dim sameVer = (c.ts = cSat("ts")) And (c.ver = cSat("ver"))
                                      Dim transIds As New Dictionary(Of String, List(Of Double)) From {{"h", New List(Of Double)}, {"s", New List(Of Double)}}

                                      Dim initTransIds = Sub()
                                                             transIds("h").Clear() : transIds("s").Clear()
                                                         End Sub

                                      Dim getIdItemHost = Function(idItem As Double) As Double?
                                                              If idItem > 0 Then Return idItem
                                                              Dim idx = transIds("s").IndexOf(idItem)
                                                              If idx <> -1 Then Return transIds("h")(idx)
                                                              Return Nothing
                                                          End Function

                                      Dim findIdxItem = Function(idItem As Double) As Double
                                                            Dim idItemN As Double? = getIdItemHost(idItem)
                                                            If idItemN Is Nothing Then Return -1
                                                            For i = 0 To c.items.Count - 1
                                                                If c.items(i)("id") = idItemN Then Return i
                                                            Next
                                                            Return -1
                                                        End Function

                                      Dim cSat_ord As jsArray = cSat("ord")
                                      For oIdx = 0 To cSat_ord.Count - 1
                                          Dim o = cSat_ord(oIdx)
                                          If Not (H_Caja.isOpen()) Then
                                              answC("er") = "H Caja not open"
                                              Continue For
                                          End If
                                          Dim o_cmd As String = o("cmd")
                                          Dim o_data As jsObject = o("data")
                                          Select Case o_cmd
                                              Case "app"
                                                  If Not checkOpenComanda() Then Exit Select
                                                  Dim item = o_data
                                                  transIds("s").Add(item("id"))
                                                  transIds("h").Add(c.nextIdItem)
                                                  item("id") = c.nextIdItem
                                                  c.nextIdItem += 1
                                                  c.items.Add(item)
                                              Case "rem"
                                                  If Not checkOpenComanda() Then Exit Select
                                                  Dim item = o_data
                                                  Dim idx = findIdxItem(item("id"))
                                                  If idx = -1 Then answC("er") = "H rem idx" : Exit Select
                                                  c.items.RemoveAt(idx)
                                              Case "mod"
                                                  If Not checkOpenComanda() Then Exit Select
                                                  Dim item = o_data
                                                  Dim idx = findIdxItem(item("id"))
                                                  If idx = -1 Then answC("er") = "H mod idx" : Exit Select
                                                  item("id") = c.items(idx)("id")
                                                  For Each kv As KeyValuePair(Of String, Object) In item
                                                      c.items(idx)(kv.Key) = kv.Value
                                                  Next
                                              Case "inc"
                                                  If Not checkOpenComanda() Then Exit Select
                                                  Dim item = o_data
                                                  Dim idx = findIdxItem(item("id"))
                                                  If idx = -1 Then answC("er") = "H inc idx" : Exit Select
                                                  Dim n As Double = c.items(idx)("n")
                                                  Dim incN As Double = o_data("incN")
                                                  If n + incN < 0 Then answC("er") = "H inc < 0" : Exit Select
                                                  c.items(idx)("n") = n + incN
                                              Case "abrir"
                                                  If Not checkClosedComanda() Then Exit Select
                                                  c.init()
                                                  c.states.fOpen = True : c.states.fCobrada = False
                                                  c.props = If(o_data IsNot Nothing, o_data, New jsObject())
                                                  tsSat = c.ts
                                                  initTransIds()
                                              Case "cobrar"
                                                  If Not checkOpenComanda() Then Exit Select
                                                  RaiseEvent evCobrarComanda(c.id, getComanda(c.id))
                                                  c.states.fOpen = False : c.states.fCobrada = True
                                                  initTransIds()
                                              Case "borrar", "cerrar"
                                                  If Not checkOpenComanda() Then Exit Select
                                                  c.states.fOpen = False : c.states.fCobrada = False
                                                  c.props.Clear()
                                                  c.items.Clear()
                                                  initTransIds()
                                              Case "temporal"
                                                  If Not checkClosedComanda() Then Exit Select
                                                  tsSat = c.ts
                                                  initTransIds()
                                              Case "temporal_o_abrir"
                                                  If Not isOpenComanda() Then
                                                      c.init()
                                                      c.states.fOpen = True : c.states.fCobrada = False
                                                      c.props = If(o_data IsNot Nothing, o_data, New jsObject())
                                                  End If
                                                  tsSat = c.ts
                                                  initTransIds()
                                              Case "printTicket"
                                                  Dim tsPrint As Double? = o("data")
                                                  RaiseEvent evPrintTicket(c.id, tsPrint)
                                              Case "setProp"
                                                  If o_data IsNot Nothing Then
                                                      For Each kv In o_data
                                                          c.props(kv.Key) = kv.Value
                                                      Next
                                                  End If
                                          End Select
                                          If answC.ContainsKey("er") Then
                                              answC("idxError") = oIdx
                                              Exit For
                                          End If
                                      Next ' for order
                                      c.ver += 1
                                      If cSat("ts") <> c.ts Then answC("ts") = c.ts
                                      answC("ver") = c.ver
                                      If Not sameVer Then  ' sat ya tiene la última versión y ya ha aplicado las ordenes se envia solo ver+1
                                          answC("states") = New jsObject() From {{"fOpen", c.states.fOpen}, {"fCobrada", c.states.fCobrada}}
                                          answC("props") = c.props
                                          answC("items") = c.items
                                      End If
                                      If transIds("h").Count > 0 Then
                                          answC("transIds") = transIds
                                      End If
                                      actualizeSats(cSat_id, objSat)
                                      answ.Add(answC)
                                  Next ' for comanda
                                  Return answ
                              End Function}}
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createComandesS(host); }")

    End Class

End Namespace