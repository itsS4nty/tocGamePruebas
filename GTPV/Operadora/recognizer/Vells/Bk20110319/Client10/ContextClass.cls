VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "ContextClass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Attribute VB_Ext_KEY = "SavedWithClassBuilder6" ,"Yes"
Attribute VB_Ext_KEY = "Top_Level" ,"No"
Attribute VB_Ext_KEY = "Member0" ,"ContextsCollectionClass"
Option Explicit

Public WithEvents instance As SpInProcRecoContext
Attribute instance.VB_VarHelpID = -1
Public key As String
Public GrammarsCollection As Collection

Private Sub instance_AudioLevel(ByVal StreamNumber As Long, ByVal StreamPosition As Variant, ByVal AudioLevel As Long)
'Informa "instance_AudioLevel"
End Sub

Private Sub instance_FalseRecognition(ByVal StreamNumber As Long, ByVal StreamPosition As Variant, ByVal Result As SpeechLib.ISpeechRecoResult)
    FalseRecognitionEvent Result
End Sub

Private Sub instance_PhraseStart(ByVal StreamNumber As Long, ByVal StreamPosition As Variant)

    'Informa "instance_PhraseStart"

End Sub


Private Sub instance_Recognition(ByVal StreamNumber As Long, ByVal StreamPosition As Variant, ByVal RecognitionType As SpeechLib.SpeechRecognitionType, ByVal Result As SpeechLib.ISpeechRecoResult)
    RecognitionEvent Result
End Sub

Private Sub instance_RecognizerStateChange(ByVal StreamNumber As Long, ByVal StreamPosition As Variant, ByVal NewState As SpeechLib.SpeechRecognizerState)
    
    'Informa "instance_RecognizerStateChange"

End Sub


Private Sub instance_SoundStart(ByVal StreamNumber As Long, ByVal StreamPosition As Variant)
    'Informa "instance_SoundStart"
End Sub


