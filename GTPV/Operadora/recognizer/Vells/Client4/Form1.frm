VERSION 5.00
Begin VB.Form Form1 
   Caption         =   "Form1"
   ClientHeight    =   3255
   ClientLeft      =   120
   ClientTop       =   420
   ClientWidth     =   12480
   Icon            =   "Form1.frx":0000
   LinkTopic       =   "Form1"
   ScaleHeight     =   3255
   ScaleWidth      =   12480
   StartUpPosition =   3  'Windows Default
   Begin VB.ListBox List1 
      Height          =   2985
      Left            =   120
      TabIndex        =   0
      Top             =   120
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

'    Set a = New Class1
'    Set RC = a.RecoContext
'    Set RC.Recognizer.AudioInput = RC.Recognizer.GetAudioInputs.Item(0)
'    Set g = RC.CreateGrammar
'    g.CmdLoadFromFile "numero2.xml"
'    g.CmdSetRuleIdState 0, SGDSActive
'    Set c = New Collection
'    c.Add RC, "RC"
'    c.Add a, "a"
'    On Error Resume Next
'    Dim w
'    Set w = c("rc")
'    Set w = Nothing
'    Set w = c("rc1")
End Sub

