VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "EngineClass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Attribute VB_Ext_KEY = "SavedWithClassBuilder6" ,"Yes"
Attribute VB_Ext_KEY = "Member0" ,"EnginesCollectionClass"
Attribute VB_Ext_KEY = "Top_Level" ,"Yes"
Public instance As ISpeechRecognizer
Public key As Variant
Public AudioInput As SpObjectToken
Public removed As Boolean
Public ContextsCollection As ContextsCollectionClass
Public CookiesCollection As Collection

Private Sub Class_Initialize()
    removed = True
End Sub
