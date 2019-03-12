Imports System.IO
Imports System.Text
Imports System.Windows.Forms
Imports Toc_Test.hostGTpv

Public Class Form1
    Private Shared jsDebugDatos As New jsObject()

    Private Shared articles As New List(Of H_Articles.CArticle)
    Private Shared families As New List(Of H_Articles.CFamilia)
    Private Shared codisBarres As New List(Of H_Articles.CCodiBarres)
    Private Shared dosNivells As New List(Of H_DosNivells.CDosNivells)
    Private Shared dependentes As New List(Of H_Dependentes.CDependenta)
    Private Shared comedores As New List(Of H_Mesas.CComedor)
    Private Shared teclats As New List(Of H_Teclats.CAmbient)

    Private Shared codiToArticle As New Dictionary(Of Double, H_Articles.CArticle)

    Private Sub Form1_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        ' cargar datos Test
        Dim DebugDatosRead As String

        Using sr As New StreamReader("..\..\testData\DebugDatos.json")
            DebugDatosRead = sr.ReadToEnd()
        End Using

        jsDebugDatos = json.parse(New StringReader(DebugDatosRead))

        Dim jsResArticles As jsArray = jsDebugDatos("resArticles")
        For Each jsA In jsResArticles
            Dim art = New H_Articles.CArticle(jsA("codi"), jsA("nom"), jsA("preu"), jsA("esSumable") <> 0, jsA("familia"))
            articles.Add(art)
            codiToArticle.Add(art.codi, art)
        Next
        Dim jsResFamilies As jsArray = jsDebugDatos("resFamilies")
        For Each jsF In jsResFamilies
            families.Add(New H_Articles.CFamilia(jsF("nom"), jsF("pare"), jsF("nivell")))
        Next
        Dim jsResCodisBarres As jsArray = jsDebugDatos("resCodisBarres")
        For Each jsC In jsResCodisBarres
            codisBarres.Add(New H_Articles.CCodiBarres(jsC("codi"), jsC("codiArt")))
        Next
        Dim jsDosNivells As jsArray = jsDebugDatos("datosDosNivells")
        For Each jsD In jsDosNivells
            dosNivells.Add(New H_DosNivells.CDosNivells(jsD("tag"), jsD("texte")))
        Next
        Dim jsDependentes As jsArray = jsDebugDatos("arrayDependentes")
        For Each jsD In jsDependentes
            dependentes.Add(New H_Dependentes.CDependenta(jsD("codi"), jsD("nom"), jsD("password"), jsD("tipusTreballador")))
        Next
        Dim jsComedores As jsArray = jsDebugDatos("arrayComedores")
        For Each jsC In jsComedores
            Dim ms As New List(Of H_Mesas.CMesa)
            Dim jsMesas As jsArray = jsC("mesas")
            For Each jsM As jsObject In jsMesas
                ms.Add(New H_Mesas.CMesa(jsM("name")))
            Next
            comedores.Add(New H_Mesas.CComedor(jsC("name"), ms.ToArray()))
        Next
        Dim jsTeclats As jsArray = jsDebugDatos("datosTeclats")
        For Each jsT As jsObject In jsTeclats
            Dim t As New H_Teclats.CAmbient(jsT("ambient"))
            Dim i = 0
            Dim jsButtons As jsArray = jsT("buttons")
            For Each jsB As jsObject In jsButtons
                If i = H_Teclats.nButtonsPerAmbient Then Exit For
                If jsB IsNot Nothing Then t.buttons(i) = New H_Teclats.CButton(jsB("codi"), jsB("color"))
                i += 1
            Next
            teclats.Add(t)
        Next

        ' Actualizar datos en Host
        H_Articles.actualize(articles.ToArray(), families.ToArray(), codisBarres.ToArray())
        H_DosNivells.actualize(dosNivells.ToArray())
        H_Dependentes.actualize(dependentes.ToArray(), New Double() {})
        H_Mesas.actualize(comedores.ToArray())
        H_Teclats.actualize(teclats.ToArray())
        H_ConceptosEntrega.actualize(New Dictionary(Of String, String()) From {{"O", New String() {}}, {"A", New String() {}}})

        H_main.init(AddressOf Me.Invoke)

        ' controles y eventos
        '  caja
        setCajaButtonText()
        AddHandler H_Caja.evAbrir, Sub()
                                       setCajaButtonText()
                                   End Sub
        AddHandler H_Caja.evCerrar, Sub()
                                        setCajaButtonText()
                                    End Sub
        '  dependentes
        ListDep.Items.Clear()
        For Each d In H_Dependentes.getDependentes()
            ListDep.Items.Add(d.nom)
        Next
        For Each codi As Double In H_Dependentes.getCodiActives()
            setCheckDep(codi, True)
        Next
        AddHandler H_Dependentes.evAddActive, Sub(codi As Double) setCheckDep(codi, True)
        AddHandler H_Dependentes.evDelActive, Sub(codi As Double) setCheckDep(codi, False)
        AddHandler ListDep.ItemCheck, Sub(sender2 As Object, e2 As ItemCheckEventArgs)
                                          Dim dep = H_Dependentes.getDependentes()
                                          If e2.NewValue = CheckState.Checked Then
                                              H_Dependentes.addActiva(dep(e2.Index).codi)
                                          Else
                                              H_Dependentes.delActiva(dep(e2.Index).codi)
                                          End If
                                      End Sub

        '  comandes
        AddHandler H_Comandes.evComandaActualized, Sub(id As String, c As H_Comandes.CComanda)
                                                       If Not (ListComandes.Items.Contains(id)) Then
                                                           ListComandes.Items.Add(id)
                                                       End If
                                                       If id = ListComandes.SelectedItem Then
                                                           updateComanda(c)
                                                       End If
                                                   End Sub
        updateComanda(Nothing)
        For Each art In articles
            ListArt.Items.Add(art.nom)
        Next
    End Sub

    Private Sub setCheckDep(ByVal codi As Double, ByVal check As Boolean)
        Dim dep = H_Dependentes.getDependentes()
        For i = 0 To dep.Length - 1
            If codi = dep(i).codi Then ListDep.SetItemChecked(i, check)
        Next
    End Sub

    Private Sub Caja_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles CajaButton.Click
        If H_Caja.isOpen() Then
            H_Caja.cerrar()
        Else
            H_Caja.abrir()
        End If
        setCajaButtonText()
    End Sub

    Private Sub setCajaButtonText()
        If H_Caja.isOpen() Then
            CajaButton.Text = "Cerrar Caja"
        Else
            CajaButton.Text = "Abrir Caja"
        End If
    End Sub

    Private Sub Form1_FormClosed(ByVal sender As System.Object, ByVal e As System.Windows.Forms.FormClosedEventArgs) Handles MyBase.FormClosed
        satServer.stop()
    End Sub

    Private Sub updateComanda(ByVal c As H_Comandes.CComanda)
        ListComanda.Items.Clear()
        If c Is Nothing Then Return
        openComanda.Text = If(c.fOpen, "Cerrar Comanda", "Abrir Comanda")
        cobrarComanda.Text = If(c.fCobrada, "", "Cobrar Comanda")
        For Each item In c.items
            Dim lvi As New ListViewItem(item.id)
            lvi.SubItems.Add(item.n)
            lvi.SubItems.Add(item.codi)
            lvi.SubItems.Add(item.ord)
            Dim art As H_Articles.CArticle = Nothing
            If codiToArticle.TryGetValue(item.codi, art) Then
                lvi.SubItems.Add(art.nom)
            End If
            lvi.Tag = item.id
            ListComanda.Items.Add(lvi)
        Next
    End Sub

    Private Function getComanda() As H_Comandes.CComanda
        Dim id = ListComandes.SelectedItem
        If id Is Nothing Then Return Nothing
        Return H_Comandes.getComanda(id)
    End Function
    Private Sub ListComandes_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles ListComandes.SelectedIndexChanged
        updateComanda(getComanda())
    End Sub

    Private Sub openComanda_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles openComanda.Click
        Dim c = getComanda()
        If c Is Nothing Then Return
        If c.fOpen Then
            c.fOpen = False
        Else
            c.fOpen = True
            c.fCobrada = False
        End If
        H_Comandes.actualizeComanda(c.id, c)
    End Sub


    Private Sub cobrarComanda_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cobrarComanda.Click
        Dim c = getComanda()
        If c Is Nothing Then Return
        c.fCobrada = Not c.fCobrada
        H_Comandes.actualizeComanda(c.id, c)
    End Sub


    Private Sub incComanda_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles incComanda.Click
        Dim c = getComanda()
        If c Is Nothing Then Return
        Dim selItems = ListComanda.SelectedItems
        If selItems.Count = 0 Then Return
        Dim selItem = selItems(0)
        Dim idItem As Double = selItem.Tag
        For Each item In c.items
            If item.id = idItem Then
                item.n += 1
                H_Comandes.actualizeComanda(c.id, c)
                Return
            End If
        Next
    End Sub

    Private Sub decComanda_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles decComanda.Click
        Dim c = getComanda()
        If c Is Nothing Then Return
        Dim selItems = ListComanda.SelectedItems
        If selItems.Count = 0 Then Return
        Dim selItem = selItems(0)
        Dim idItem As Double = selItem.Tag
        For Each item In c.items
            If item.id = idItem Then
                If item.n >= 1 Then
                    item.n -= 1
                    H_Comandes.actualizeComanda(c.id, c)
                    Return
                End If
            End If

        Next

    End Sub

    Private Sub addArt_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles addArt.Click
        Dim c = getComanda()
        If c Is Nothing Then Return
        Dim selIdxs = ListArt.SelectedIndices
        If selIdxs.Count = 0 Then Return
        Dim selIdx = selIdxs(0)
        Dim codi As Double = articles(selIdx).codi
        Dim item = c.addItem()
        item.n = 1
        item.codi = codi
        item.ord = 1
        item.preu = articles(selIdx).preu
        item.esS = False
        H_Comandes.actualizeComanda(c.id, c)
    End Sub
End Class
