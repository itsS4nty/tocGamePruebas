VERSION 5.00
Begin VB.Form Form1 
   Caption         =   "Form1"
   ClientHeight    =   6300
   ClientLeft      =   120
   ClientTop       =   420
   ClientWidth     =   12435
   Icon            =   "Form1.frx":0000
   LinkTopic       =   "Form1"
   ScaleHeight     =   6300
   ScaleWidth      =   12435
   StartUpPosition =   3  'Windows Default
   Begin VB.TextBox Text1 
      Height          =   285
      Left            =   240
      TabIndex        =   2
      Text            =   "Text1"
      Top             =   3120
      Width           =   10455
   End
   Begin VB.ListBox List2 
      Height          =   2595
      Left            =   120
      TabIndex        =   1
      Top             =   3480
      Width           =   12135
   End
   Begin VB.ListBox List1 
      Height          =   2985
      Left            =   120
      TabIndex        =   0
      Top             =   0
      Width           =   12135
   End
End
Attribute VB_Name = "Form1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'Dim a As Class1
'Dim RC As SpInProcRecoContext
'Dim g As ISpeechRecoGrammar
'Dim c As Collection



Private Sub Form_Load()
    Init
End Sub

Private Sub List1_DblClick()
   
   Text1 = List1.List(List1.ListIndex)

End Sub


Private Sub List2_DblClick()

   Text1 = List2.List(List2.ListIndex)
   
End Sub


