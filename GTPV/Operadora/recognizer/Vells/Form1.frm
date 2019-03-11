VERSION 5.00
Begin VB.Form Form1 
   Caption         =   "Form1"
   ClientHeight    =   3060
   ClientLeft      =   120
   ClientTop       =   420
   ClientWidth     =   4560
   LinkTopic       =   "Form1"
   ScaleHeight     =   3060
   ScaleWidth      =   4560
   StartUpPosition =   3  'Windows Default
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

