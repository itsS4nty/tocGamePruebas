Namespace hostGTpv
    Public Class H_Dependentes

        Public Shared Event evActivesActualized(ByVal codiActives() As Double)
        Public Shared Event evAddActive(ByVal codi As Double)
        Public Shared Event evDelActive(ByVal codi As Double)

        Public Class CDependenta
            Public codi As Double
            Public nom As String
            Public password As String
            Public tipusTreballador As String
            Public Sub New(ByVal codi As Double, ByVal nom As String, ByVal password As String, ByVal tipusTreballador As String)
                Me.codi = codi : Me.nom = nom : Me.password = password : Me.tipusTreballador = tipusTreballador
            End Sub
        End Class
        Private Class CDependenta2
            Inherits CDependenta
            Public Sub New(ByVal d As CDependenta)
                MyBase.New(d.codi, d.nom, d.password, d.tipusTreballador)
            End Sub
            Public compareNom As String
            Public esResponsable As Boolean = False
            Public noPassword As Boolean
        End Class

        Public Shared Sub actualize(ByVal _dependentes() As CDependenta, ByVal _codiActives() As Double)
            If _dependentes IsNot Nothing Then
                Dim hayResponsable = False
                dependentes.Clear()
                For Each _d In _dependentes
                    Dim d As New CDependenta2(_d)
                    If d.nom Is Nothing Then d.nom = ""
                    d.compareNom = H_main.conversionForCompare(d.nom)
                    If d.tipusTreballador = "RESPONSABLE" Then
                        d.esResponsable = True
                        hayResponsable = True
                    End If
                    d.noPassword = (d.password = "") Or (d.password Is Nothing) ' Nothing = "" en visual basic
                    dependentes.Add(d)
                Next
                If Not hayResponsable Then dependentes.ForEach(Sub(d) d.esResponsable = True)
                dependentes.Sort(Function(a, b) String.Compare(a.compareNom, b.compareNom))

                arrayDepToSat.Clear()
                For Each d In dependentes
                    Dim jsO = New jsObject() From {
                        {"codi", d.codi},
                        {"nom", d.nom},
                        {"tipusTreballador", d.tipusTreballador},
                        {"esResponsable", d.esResponsable},
                        {"noPassword", d.noPassword}}
                    arrayDepToSat.Add(jsO)
                Next
            End If

            codiActives.Clear()
            codiDepActivesToSat.Clear()
            For Each d In dependentes
                If _codiActives.Contains(d.codi) Then
                    codiActives.Add(d.codi)
                    codiDepActivesToSat.Add(d.codi)
                End If
            Next

            actualizeSat(If(_dependentes IsNot Nothing, actualizeSatType.All, actualizeSatType.Actives))
        End Sub

        Public Shared Sub addActiva(ByVal codi As Double)
            If Not codiActives.Contains(codi) Then
                codiActives.Add(codi)
                actualizeActives()
            End If
        End Sub
        Public Shared Sub delActiva(ByVal codi As Double)
            If codiActives.Contains(codi) Then
                codiActives.Remove(codi)
                actualizeActives()
            End If
        End Sub

        Private Shared Sub actualizeActives(Optional ByVal objSat As IObj = Nothing)
            codiDepActivesToSat.Clear()
            For Each d2 In dependentes
                If codiActives.Contains(d2.codi) Then codiDepActivesToSat.Add(d2.codi)
            Next
            Version += 1
            actualizeSat(actualizeSatType.Actives, objSat)
        End Sub

        Public Shared Function getCodiActives() As Double()
            Dim ret(codiDepActivesToSat.Count - 1) As Double
            For i = 0 To codiDepActivesToSat.Count - 1
                ret(i) = codiDepActivesToSat(i)
            Next
            Return ret
        End Function

        Public Shared Function getDependentes() As CDependenta()
            Return dependentes.ToArray()
        End Function

        Private Shared dependentes As New List(Of CDependenta2)
        Private Shared codiActives As New List(Of Double)
        Private Shared arrayDepToSat As New jsArray()
        Private Shared codiDepActivesToSat As New jsArray()
        Private Shared Version As Double = 1

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
            Public act_Actives As Boolean
            Public callbackCreateAct As action '??11
            Public comHandler As delCallbackHS
        End Class
        Public Shared Sub createSat(ByVal sat As ISat, ByVal callback As action)
            Dim obj = sat.createObj("Dependentes", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
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
            If data.act_All Or data.act_Actives Then
                objSat.call("actualize", New jsArray() From {If(data.act_All, arrayDepToSat, Nothing), codiDepActivesToSat, Version},
                            data.comHandler)
                data.act_All = False
                data.act_Actives = False
            End If
        End Sub
        Private Enum actualizeSatType
            All
            Actives
        End Enum
        Private Shared Sub actualizeSat(ByVal type As actualizeSatType, Optional ByVal noActObj As IObj = Nothing)
            For Each kv As KeyValuePair(Of ISat, IObj) In sats
                Dim obj = kv.Value
                If noActObj Is obj Then Continue For
                Dim data As CObjData = obj.data
                If type = actualizeSatType.All Then
                    data.act_All = True
                Else
                    data.act_Actives = True
                End If
                obj.readyComm()
            Next
            RaiseEvent evActivesActualized(getCodiActives())
        End Sub

        Private Shared Function createObjHost(ByVal objSat As IObj) As Dictionary(Of String, [Delegate])
            Return New Dictionary(Of String, [Delegate]) From
                {{"addActiva", Function(codi As Double, password As String) As Boolean
                                   For Each d In dependentes
                                       If d.codi = codi Then
                                           If codiActives.Contains(codi) Then Return True
                                           If (d.password IsNot Nothing) AndAlso (d.password <> password) Then Return False
                                           codiActives.Add(codi)
                                           actualizeActives()
                                           RaiseEvent evAddActive(codi)
                                           Return True
                                       End If
                                   Next
                                   Return False
                               End Function},
                 {"delActiva", Function(codi As Double, versionSat As Double) As Double
                                   If codiActives.Contains(codi) Then
                                       codiActives.Remove(codi)
                                       actualizeActives(If(Version + 1 = versionSat, objSat, Nothing))
                                       RaiseEvent evDelActive(codi)
                                   End If
                                   Return Version
                               End Function}}
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createDependentesS(host); }")

    End Class
End Namespace
