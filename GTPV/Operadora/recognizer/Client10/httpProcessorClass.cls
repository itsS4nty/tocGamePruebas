VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "httpProcessorClass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private httpReq As XMLHTTP30

Private prReq As DOMDocument30
Private prList As Collection
Private prIdxList As Integer

Private urlProcessor As String

Sub OnReadyStateChange()
Attribute OnReadyStateChange.VB_UserMemId = 0
'Informa "httpReq.readyState  --> " & httpReq.readyState
    If httpReq.readyState = 4 Then
        Dim resp As DOMDocument30
        Set resp = New DOMDocument30
        resp.loadXML httpReq.responseText
        
        Informa httpReq.responseText
        
        httpReq.OnReadyStateChange = Nothing
        Set httpReq = Nothing
        
        Dim GetSrc As httpGetSrcClass
        Set GetSrc = New httpGetSrcClass
        GetSrc.urlProcessor = urlProcessor
        
        If Not ProcessResponse(prReq, resp, GetSrc) Then
            ProcessRequestWithList prReq, prList, prIdxList + 1
        End If
    End If
End Sub

Public Sub Send(Request As DOMDocument30, url As String, List As Collection, idxList As Integer)
    Set httpReq = New XMLHTTP30
    httpReq.OnReadyStateChange = Me
    
    Set prReq = Request
    Set prList = List
    prIdxList = idxList
    
    urlProcessor = url
        
    httpReq.Open "POST", url, True
    httpReq.setRequestHeader "Content-Type", "text/plain; charset=utf-8"
    httpReq.Send Request.xml
    
    Informa Request.xml
End Sub

