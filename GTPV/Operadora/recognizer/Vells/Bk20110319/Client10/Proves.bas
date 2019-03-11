Attribute VB_Name = "Proves"
Option Explicit

Private V As SpeechLib.SpVoice
Private T As SpeechLib.SpObjectToken

Sub Prova()
    On Error GoTo EH
    
    Set V = New SpVoice
    Call ShowAudioOutputs

EH:
    If Err.Number Then ShowErrMsg
End Sub

Private Sub Command1_Click()
    On Error GoTo EH

    If Form1.List1.ListIndex > -1 Then
        Set V.AudioOutput = V.GetAudioOutputs().Item(Form1.List1.ListIndex)
        Call ShowAudioOutputs
    End If

EH:
    If Err.Number Then ShowErrMsg
End Sub

Private Sub ShowAudioOutputs()
    On Error GoTo EH

    Dim strAudio As String
    Dim strCurrentAudio As String

    Form1.Show
    Form1.List1.Clear
    Set T = V.AudioOutput               'Token for current audio output
    strCurrentAudio = T.GetDescription  'Get description from token

    'Show all available outputs; highlight the one in use

    For Each T In V.GetAudioOutputs
        strAudio = T.GetDescription     'Get description from token
        If strAudio = strCurrentAudio Then
            strAudio = strAudio & " (CURRENT)"  'Show current device
        End If
        Form1.List1.AddItem strAudio          'Add description to list box
    Next

EH:
    If Err.Number Then ShowErrMsg
End Sub

Private Sub ShowErrMsg()

    ' Declare identifiers:
    Dim T As String

    T = "Desc: " & Err.Description & vbNewLine
    T = T & "Err #: " & Err.Number
    MsgBox T, vbExclamation, "Run-Time Error"
    End

End Sub

