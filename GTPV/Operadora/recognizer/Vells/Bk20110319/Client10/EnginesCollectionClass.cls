VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "EnginesCollectionClass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Attribute VB_Ext_KEY = "SavedWithClassBuilder6" ,"Yes"
Attribute VB_Ext_KEY = "Collection" ,"EngineClass"
Attribute VB_Ext_KEY = "Member0" ,"EngineClass"
Attribute VB_Ext_KEY = "Top_Level" ,"Yes"
Private mCol As Collection

Public Function Add(instance As ISpeechRecognizer, key As String, AudioInput As SpObjectToken, _
                    Optional ContextsCollection As ContextsCollectionClass, _
                    Optional CookiesCollection As Collection _
                    ) As EngineClass
    Dim objNewMember As EngineClass
    Set objNewMember = New EngineClass

    Set objNewMember.instance = instance
    objNewMember.key = key
    Set objNewMember.AudioInput = AudioInput
    If ContextsCollection Is Nothing Then Set ContextsCollection = New ContextsCollectionClass
    Set objNewMember.ContextsCollection = ContextsCollection
    If CookiesCollection Is Nothing Then Set CookiesCollection = New Collection
    Set objNewMember.CookiesCollection = CookiesCollection
    
    mCol.Add objNewMember, key

    Set Add = objNewMember
    Set objNewMember = Nothing
End Function

Public Property Get Item(vntIndexKey As Variant) As EngineClass
Attribute Item.VB_UserMemId = 0
    If TypeOf vntIndexKey Is ISpeechRecognizer Then
        Dim i As EngineClass
        For Each i In mCol
            If i.instance Is vntIndexKey Then
                Set Item = i
                Exit For
            End If
        Next
        Exit Property
    End If
    On Error Resume Next
    Set Item = mCol(vntIndexKey)
End Property

Public Property Get Count() As Long
    Count = mCol.Count
End Property

Public Sub remove(vntIndexKey As Variant)
    mCol.remove vntIndexKey
End Sub

Private Sub Class_Initialize()
    Set mCol = New Collection
End Sub

Private Sub Class_Terminate()
    Set mCol = Nothing
End Sub

