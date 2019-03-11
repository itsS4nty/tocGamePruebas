Namespace hostGTpv
    Public Class H_Articles

        Private Shared datosArticles As New jsArray()
        Private Shared datosFamilies As New jsObject() From {{"idxN0", -1}, {"maxN", 0}, {"families", New jsArray()}}
        Private Shared datosCodisBarres As New jsArray()
        Private Shared version As Double = 1

        Public Class CArticle
            Public codi As Double
            Public nom As String
            Public preu As Double
            Public esSumable As Boolean
            Public familia As String
            Public Sub New(ByVal codi As Double, ByVal nom As String, ByVal preu As Double, ByVal esSumable As Boolean, ByVal familia As String)
                Me.codi = codi : Me.nom = nom : Me.preu = preu : Me.esSumable = esSumable : Me.familia = familia
            End Sub
        End Class
        Private Class CArticle2
            Inherits CArticle
            Public Sub New(ByVal art As CArticle)
                MyBase.New(art.codi, art.nom, art.preu, art.esSumable, art.familia)
            End Sub
            Public lowerNom As String
            Public idxFamilia As Integer
        End Class

        Public Class CFamilia
            Public nom As String
            Public pare As String
            Public nivell As Integer
            Public Sub New(ByVal nom As String, ByVal pare As String, ByVal nivell As Integer)
                Me.nom = nom : Me.pare = pare : Me.nivell = nivell
            End Sub
        End Class
        Private Class CFamilia2
            Inherits CFamilia
            Public Sub New(ByVal f As CFamilia)
                MyBase.New(f.nom, f.pare, f.nivell)
            End Sub
            Public subF As New List(Of Integer)
            Public art As New List(Of Integer)
            Public idxPare As Integer
        End Class
        Public Class CCodiBarres
            Public codi As String
            Public codiArt As Double
            Public Sub New(ByVal codi As String, ByVal codiArt As Double)
                Me.codi = codi : Me.codiArt = codiArt
            End Sub
        End Class

        Public Shared Sub actualize(ByVal articles() As CArticle, ByVal families() As CFamilia, ByVal codisBarres() As CCodiBarres)
            Dim tmpArticles As New List(Of CArticle2)
            For Each art In articles
                Dim tmpArt As New CArticle2(art)
                If tmpArt.nom Is Nothing Then tmpArt.nom = ""
                tmpArt.lowerNom = tmpArt.nom.ToLower()
                tmpArticles.Add(tmpArt)
            Next
            tmpArticles.Sort(Function(a As CArticle2, b As CArticle2) String.Compare(a.lowerNom, b.lowerNom))

            Dim tmpCodisBarres As New List(Of CCodiBarres)
            For Each c In codisBarres
                tmpCodisBarres.Add(New CCodiBarres(c.codi, c.codiArt))
            Next
            tmpCodisBarres.Sort(Function(a As CCodiBarres, b As CCodiBarres) a.codi.CompareTo(b.codi))

            Dim tmpFamilies As New List(Of CFamilia2)
            Dim idxN0 As Integer = -1
            For i = 0 To families.Count - 1
                Dim tmpF As New CFamilia2(families(i))
                If tmpF.nom Is Nothing Then tmpF.nom = ""
                If tmpF.nivell = 0 Then idxN0 = i : tmpF.idxPare = -1
                tmpFamilies.Add(tmpF)
            Next

            If idxN0 = -1 Then
                idxN0 = tmpFamilies.Count
                tmpFamilies.Add(New CFamilia2(New CFamilia("", Nothing, 0)))
            End If

            Dim lenFamilies = tmpFamilies.Count
            Dim lastNivellSinNombre = 0
            Dim idxLastNivellSinNombre = idxN0

            Dim getNivellSinNombre = Function(nivell As Integer) As Integer
                                         While lastNivellSinNombre < nivell
                                             tmpFamilies(idxLastNivellSinNombre).subF.Add(tmpFamilies.Count)
                                             Dim f = New CFamilia2(New CFamilia("Sin nombre", "", lastNivellSinNombre + 1))
                                             f.idxPare = idxLastNivellSinNombre
                                             tmpFamilies.Add(f)
                                             lastNivellSinNombre += 1
                                             idxLastNivellSinNombre = tmpFamilies.Count - 1
                                         End While
                                         Return ((idxLastNivellSinNombre - lastNivellSinNombre) + nivell) 'niveles intermedios
                                     End Function

            Dim findPare = Function(fam As CFamilia2) As Integer
                               If fam.nivell = 1 Then Return idxN0
                               For i = 0 To lenFamilies - 1
                                   If (fam.pare = tmpFamilies(i).nom) AndAlso (fam.nivell - 1 = tmpFamilies(i).nivell) Then Return i
                               Next
                               Return -1
                           End Function

            For i = 0 To lenFamilies - 1
                Dim f = tmpFamilies(i)
                If f.nivell > 0 Then
                    Dim idxPare = findPare(f)
                    If idxPare = -1 Then idxPare = getNivellSinNombre(f.nivell)
                    tmpFamilies(idxPare).subF.Add(i)
                    f.idxPare = idxPare
                End If
            Next

            Dim findFamilia = Function(nom As String) As Integer
                                  If nom Is Nothing Then Return Nothing
                                  For i = 0 To tmpFamilies.Count - 1
                                      If (tmpFamilies(i).nom = nom) AndAlso (tmpFamilies(i).nivell > 0) Then Return i
                                  Next
                                  Return -1
                              End Function

            For i = 0 To tmpArticles.Count - 1
                Dim article = tmpArticles(i)
                '//article.nom = (article.nom || "");
                Dim idxFamilia = findFamilia(article.familia)
                If idxFamilia = -1 Then idxFamilia = getNivellSinNombre(1)
                article.idxFamilia = idxFamilia
                tmpFamilies(idxFamilia).art.Add(i)
            Next

            For i = tmpFamilies.Count - 1 To lenFamilies Step -1 ' sin nombre al final
                Dim subF = tmpFamilies(tmpFamilies(i).idxPare).subF
                subF.Remove(i) : subF.Add(i)
            Next

            ' eliminar familias sin elementos
            Dim deleteIfNeeded As Action(Of Integer) = Nothing 'forward declaration
            Dim deleteFamilia = Sub(i As Integer)
                                    Dim fam = tmpFamilies(i)
                                    Dim idxPare = fam.idxPare
                                    If idxPare <> -1 Then
                                        Dim pare = tmpFamilies(idxPare)
                                        pare.subF.Remove(i)
                                        fam.idxPare = -1
                                        deleteIfNeeded(idxPare)
                                    End If
                                End Sub

            deleteIfNeeded = Sub(i As Integer)
                                 Dim fam = tmpFamilies(i)
                                 If (fam.subF.Count = 0) AndAlso (fam.art.Count = 0) Then deleteFamilia(i)
                             End Sub

            For i = 0 To tmpFamilies.Count - 1
                deleteIfNeeded(i)
            Next

            Dim maxN = 0
            For Each fam In tmpFamilies
                If (fam.subF.Count = 0) AndAlso (fam.art.Count = 0) Then
                    If (maxN < fam.nivell) Then maxN = fam.nivell
                End If
            Next

            Dim jsA As New jsArray()
            For Each art In tmpArticles
                jsA.Add(New jsObject() From {
                    {"codi", art.codi},
                    {"nom", art.nom},
                    {"preu", art.preu},
                    {"esSumable", art.esSumable},
                    {"familia", art.familia},
                    {"idxFamilia", art.idxFamilia}
                }) 'familia no se necesita
            Next
            datosArticles = jsA

            datosFamilies("idxN0") = idxN0
            datosFamilies("maxN") = maxN
            jsA = New jsArray()
            For Each fam In tmpFamilies
                jsA.Add(New jsObject() From {
                        {"nom", fam.nom},
                        {"pare", fam.pare},
                        {"nivell", fam.nivell},
                        {"subF", fam.subF},
                        {"art", fam.art},
                        {"idxPare", fam.idxPare}
                })
            Next
            datosFamilies("families") = jsA

            jsA = New jsArray()
            For Each c In tmpCodisBarres
                jsA.Add(New jsObject() From {
                        {"codi", c.codi},
                        {"codiArt", c.codiArt}
                })
            Next
            datosCodisBarres = jsA

			version += 1
			
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
            Dim obj = sat.createObj("Articles", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
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
                objSat.call("actualize", New jsArray() From {datosArticles, datosFamilies, datosCodisBarres, version}, data.comHandler)
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
        Private Shared createObjSat As New jsFunction("function(host) { return createDatosArticlesS(host); }")

    End Class
End Namespace
