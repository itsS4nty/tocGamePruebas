VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "ContextsCollectionClass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Attribute VB_Ext_KEY = "SavedWithClassBuilder6" ,"Yes"
Attribute VB_Ext_KEY = "Collection" ,"ContextClass"
Attribute VB_Ext_KEY = "Member0" ,"ContextClass"
Attribute VB_Ext_KEY = "Top_Level" ,"Yes"
Private mCol As Collection

Public Function Add(instance As ISpeechRecoContext, key As String, _
                    Optional GrammarsCollection As Collection) As ContextClass
    Dim objNewMember As ContextClass
    Set objNewMember = New ContextClass

    Set objNewMember.instance = instance
    objNewMember.key = key
    If GrammarsCollection Is Nothing Then Set GrammarsCollection = New Collection
    Set objNewMember.GrammarsCollection = GrammarsCollection
    
    mCol.Add objNewMember, key

    Set Add = objNewMember
    Set objNewMember = Nothing
End Function

Public Property Get Item(vntIndexKey As Variant) As ContextClass
Attribute Item.VB_UserMemId = 0
    If TypeOf vntIndexKey Is ISpeechRecoContext Then
        Dim i As ContextClass
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

