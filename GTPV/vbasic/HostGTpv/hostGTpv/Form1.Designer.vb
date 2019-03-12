<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class Form1
    Inherits System.Windows.Forms.Form

    'Form reemplaza a Dispose para limpiar la lista de componentes.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Requerido por el Diseñador de Windows Forms
    Private components As System.ComponentModel.IContainer

    'NOTA: el Diseñador de Windows Forms necesita el siguiente procedimiento
    'Se puede modificar usando el Diseñador de Windows Forms.  
    'No lo modifique con el editor de código.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.CajaButton = New System.Windows.Forms.Button()
        Me.ListComandes = New System.Windows.Forms.ListBox()
        Me.ListComanda = New System.Windows.Forms.ListView()
        Me.id = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.n = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.codi = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.order = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.nom = CType(New System.Windows.Forms.ColumnHeader(), System.Windows.Forms.ColumnHeader)
        Me.ListDep = New System.Windows.Forms.CheckedListBox()
        Me.ListMesas = New System.Windows.Forms.ListBox()
        Me.ListArt = New System.Windows.Forms.ListBox()
        Me.openComanda = New System.Windows.Forms.Button()
        Me.cobrarComanda = New System.Windows.Forms.Button()
        Me.incComanda = New System.Windows.Forms.Button()
        Me.decComanda = New System.Windows.Forms.Button()
        Me.addArt = New System.Windows.Forms.Button()
        Me.ListLocalAddress = New System.Windows.Forms.ListBox()
        Me.Label1 = New System.Windows.Forms.Label()
        Me.Label2 = New System.Windows.Forms.Label()
        Me.Label3 = New System.Windows.Forms.Label()
        Me.Label4 = New System.Windows.Forms.Label()
        Me.Label5 = New System.Windows.Forms.Label()
        Me.Label6 = New System.Windows.Forms.Label()
        Me.SuspendLayout()
        '
        'CajaButton
        '
        Me.CajaButton.Location = New System.Drawing.Point(27, 30)
        Me.CajaButton.Name = "CajaButton"
        Me.CajaButton.Size = New System.Drawing.Size(216, 48)
        Me.CajaButton.TabIndex = 0
        Me.CajaButton.Text = "Abrir Caja"
        Me.CajaButton.UseVisualStyleBackColor = True
        '
        'ListComandes
        '
        Me.ListComandes.FormattingEnabled = True
        Me.ListComandes.Location = New System.Drawing.Point(262, 119)
        Me.ListComandes.Name = "ListComandes"
        Me.ListComandes.Size = New System.Drawing.Size(105, 446)
        Me.ListComandes.TabIndex = 2
        '
        'ListComanda
        '
        Me.ListComanda.Columns.AddRange(New System.Windows.Forms.ColumnHeader() {Me.id, Me.n, Me.codi, Me.order, Me.nom})
        Me.ListComanda.Location = New System.Drawing.Point(386, 119)
        Me.ListComanda.Name = "ListComanda"
        Me.ListComanda.Size = New System.Drawing.Size(334, 446)
        Me.ListComanda.TabIndex = 4
        Me.ListComanda.UseCompatibleStateImageBehavior = False
        Me.ListComanda.View = System.Windows.Forms.View.Details
        '
        'id
        '
        Me.id.Text = "id"
        '
        'n
        '
        Me.n.Text = "n"
        Me.n.Width = 69
        '
        'codi
        '
        Me.codi.Text = "codi"
        Me.codi.Width = 67
        '
        'order
        '
        Me.order.Text = "Orden"
        '
        'nom
        '
        Me.nom.Text = "nom"
        '
        'ListDep
        '
        Me.ListDep.FormattingEnabled = True
        Me.ListDep.Location = New System.Drawing.Point(27, 110)
        Me.ListDep.Name = "ListDep"
        Me.ListDep.Size = New System.Drawing.Size(216, 214)
        Me.ListDep.TabIndex = 5
        '
        'ListMesas
        '
        Me.ListMesas.FormattingEnabled = True
        Me.ListMesas.Location = New System.Drawing.Point(27, 366)
        Me.ListMesas.Name = "ListMesas"
        Me.ListMesas.Size = New System.Drawing.Size(213, 199)
        Me.ListMesas.TabIndex = 6
        '
        'ListArt
        '
        Me.ListArt.FormattingEnabled = True
        Me.ListArt.Location = New System.Drawing.Point(744, 119)
        Me.ListArt.Name = "ListArt"
        Me.ListArt.Size = New System.Drawing.Size(216, 446)
        Me.ListArt.TabIndex = 9
        '
        'openComanda
        '
        Me.openComanda.Location = New System.Drawing.Point(267, 587)
        Me.openComanda.Name = "openComanda"
        Me.openComanda.Size = New System.Drawing.Size(99, 22)
        Me.openComanda.TabIndex = 10
        Me.openComanda.Text = "abrir"
        Me.openComanda.UseVisualStyleBackColor = True
        '
        'cobrarComanda
        '
        Me.cobrarComanda.Location = New System.Drawing.Point(386, 587)
        Me.cobrarComanda.Name = "cobrarComanda"
        Me.cobrarComanda.Size = New System.Drawing.Size(99, 22)
        Me.cobrarComanda.TabIndex = 11
        Me.cobrarComanda.Text = "cobrar"
        Me.cobrarComanda.UseVisualStyleBackColor = True
        '
        'incComanda
        '
        Me.incComanda.Location = New System.Drawing.Point(516, 587)
        Me.incComanda.Name = "incComanda"
        Me.incComanda.Size = New System.Drawing.Size(99, 22)
        Me.incComanda.TabIndex = 12
        Me.incComanda.Text = "+"
        Me.incComanda.UseVisualStyleBackColor = True
        '
        'decComanda
        '
        Me.decComanda.Location = New System.Drawing.Point(621, 587)
        Me.decComanda.Name = "decComanda"
        Me.decComanda.Size = New System.Drawing.Size(99, 22)
        Me.decComanda.TabIndex = 13
        Me.decComanda.Text = "-"
        Me.decComanda.UseVisualStyleBackColor = True
        '
        'addArt
        '
        Me.addArt.Location = New System.Drawing.Point(744, 587)
        Me.addArt.Name = "addArt"
        Me.addArt.Size = New System.Drawing.Size(99, 22)
        Me.addArt.TabIndex = 14
        Me.addArt.Text = "Añadir"
        Me.addArt.UseVisualStyleBackColor = True
        '
        'ListLocalAddress
        '
        Me.ListLocalAddress.FormattingEnabled = True
        Me.ListLocalAddress.Location = New System.Drawing.Point(262, 30)
        Me.ListLocalAddress.Name = "ListLocalAddress"
        Me.ListLocalAddress.Size = New System.Drawing.Size(120, 56)
        Me.ListLocalAddress.TabIndex = 15
        '
        'Label1
        '
        Me.Label1.AutoSize = True
        Me.Label1.Location = New System.Drawing.Point(264, 6)
        Me.Label1.Name = "Label1"
        Me.Label1.Size = New System.Drawing.Size(63, 13)
        Me.Label1.TabIndex = 16
        Me.Label1.Text = "Dirección ip"
        '
        'Label2
        '
        Me.Label2.AutoSize = True
        Me.Label2.Location = New System.Drawing.Point(35, 94)
        Me.Label2.Name = "Label2"
        Me.Label2.Size = New System.Drawing.Size(71, 13)
        Me.Label2.TabIndex = 17
        Me.Label2.Text = "Dependentes"
        '
        'Label3
        '
        Me.Label3.AutoSize = True
        Me.Label3.Location = New System.Drawing.Point(35, 350)
        Me.Label3.Name = "Label3"
        Me.Label3.Size = New System.Drawing.Size(38, 13)
        Me.Label3.TabIndex = 18
        Me.Label3.Text = "Mesas"
        '
        'Label4
        '
        Me.Label4.AutoSize = True
        Me.Label4.Location = New System.Drawing.Point(264, 103)
        Me.Label4.Name = "Label4"
        Me.Label4.Size = New System.Drawing.Size(57, 13)
        Me.Label4.TabIndex = 19
        Me.Label4.Text = "Comandes"
        '
        'Label5
        '
        Me.Label5.AutoSize = True
        Me.Label5.Location = New System.Drawing.Point(393, 103)
        Me.Label5.Name = "Label5"
        Me.Label5.Size = New System.Drawing.Size(134, 13)
        Me.Label5.TabIndex = 20
        Me.Label5.Text = "Comanda (eliminados: n=0)"
        '
        'Label6
        '
        Me.Label6.AutoSize = True
        Me.Label6.Location = New System.Drawing.Point(741, 94)
        Me.Label6.Name = "Label6"
        Me.Label6.Size = New System.Drawing.Size(41, 13)
        Me.Label6.TabIndex = 21
        Me.Label6.Text = "Articles"
        '
        'Form1
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(994, 621)
        Me.Controls.Add(Me.Label6)
        Me.Controls.Add(Me.Label5)
        Me.Controls.Add(Me.Label4)
        Me.Controls.Add(Me.Label3)
        Me.Controls.Add(Me.Label2)
        Me.Controls.Add(Me.Label1)
        Me.Controls.Add(Me.ListLocalAddress)
        Me.Controls.Add(Me.addArt)
        Me.Controls.Add(Me.decComanda)
        Me.Controls.Add(Me.incComanda)
        Me.Controls.Add(Me.cobrarComanda)
        Me.Controls.Add(Me.openComanda)
        Me.Controls.Add(Me.ListArt)
        Me.Controls.Add(Me.ListMesas)
        Me.Controls.Add(Me.ListDep)
        Me.Controls.Add(Me.ListComanda)
        Me.Controls.Add(Me.ListComandes)
        Me.Controls.Add(Me.CajaButton)
        Me.Name = "Form1"
        Me.Text = "Form1"
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents CajaButton As System.Windows.Forms.Button
    Friend WithEvents ListComandes As System.Windows.Forms.ListBox
    Friend WithEvents ListComanda As System.Windows.Forms.ListView
    Friend WithEvents ListDep As System.Windows.Forms.CheckedListBox
    Friend WithEvents ListMesas As System.Windows.Forms.ListBox
    Friend WithEvents id As System.Windows.Forms.ColumnHeader
    Friend WithEvents n As System.Windows.Forms.ColumnHeader
    Friend WithEvents codi As System.Windows.Forms.ColumnHeader
    Friend WithEvents order As System.Windows.Forms.ColumnHeader
    Friend WithEvents nom As System.Windows.Forms.ColumnHeader
    Friend WithEvents ListArt As System.Windows.Forms.ListBox
    Friend WithEvents openComanda As System.Windows.Forms.Button
    Friend WithEvents cobrarComanda As System.Windows.Forms.Button
    Friend WithEvents incComanda As System.Windows.Forms.Button
    Friend WithEvents decComanda As System.Windows.Forms.Button
    Friend WithEvents addArt As System.Windows.Forms.Button
    Friend WithEvents ListLocalAddress As System.Windows.Forms.ListBox
    Friend WithEvents Label1 As System.Windows.Forms.Label
    Friend WithEvents Label2 As System.Windows.Forms.Label
    Friend WithEvents Label3 As System.Windows.Forms.Label
    Friend WithEvents Label4 As System.Windows.Forms.Label
    Friend WithEvents Label5 As System.Windows.Forms.Label
    Friend WithEvents Label6 As System.Windows.Forms.Label
End Class
