VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "httpGetSrcClass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private httpReq As XMLHTTP30

Private Sources As Collection
Public Grammar As Collection

Private urlSrc As String

Private prReq As DOMDocument30
Private prResp As DOMDocument30
Public CurrentElemNames As Variant

Public urlProcessor As String

Sub OnReadyStateChange()
Attribute OnReadyStateChange.VB_UserMemId = 0
    If httpReq.readyState = 4 Then
        If Sources Is Nothing Then Set Sources = New Collection
        Sources.Add httpReq.responseText, urlSrc
                        
        httpReq.OnReadyStateChange = Nothing
        Set httpReq = Nothing
        
        ProcessResponse prReq, prResp, Me
    End If
End Sub

Public Function CompleteUrl(src As String) As String
    CompleteUrl = src
End Function

Public Function Cached(src As String) As Variant
    On Error Resume Next
    Dim v As Variant
    v = Sources(CompleteUrl(src))
    Cached = v
End Function

Public Function httpGet(src As String, Request As DOMDocument30, Response As DOMDocument30, _
                        CurrentElemNamesPar As Variant) As Variant
    If Not httpReq Is Nothing Then
        Set httpReq = New XMLHTTP30
        httpReq.OnReadyStateChange = Me
    End If
    
    urlSrc = CompleteUrl(src)
    
    Set prReq = Request
    Set prResp = Response
    CurrentElemNames = CurrentElemNamesPar
    
    httpReq.Open "Get", urlSrc, True
    httpReq.Send
End Function




