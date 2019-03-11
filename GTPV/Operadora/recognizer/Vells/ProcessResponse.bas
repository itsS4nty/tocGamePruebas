Attribute VB_Name = "ModuleProcessResponse"
Option Explicit

Private Enum ElemNamesEnum
    EN_Engine
    EN_Context
    EN_Grammar
    EN_Rule
    EN_Speak
    EN_Voice
    EN_Timer
    EN_Processor
    EN_Cookie
    EN_UnKnown
End Enum

Dim ElemNames() As String

Dim CurrentElemNames As Variant
Dim InitialElemNames() As String

Public Enum DefaultProcessorOrder
    OR_Xslt = 0
    OR_ActiveX = 100
    OR_Http = 200
End Enum

Public Type PropElemResponseType
    name As Variant
    activate As Boolean
    deactivate As Boolean
    remove As Boolean
    allEngines As Boolean
    selectedEngine As Boolean
    src As Variant
    initial As Boolean
    Class As Variant
    url As Variant
    order As Variant
    maxAge As Variant
    child As IXMLDOMNode
End Type

Public Sub InitArrayElemNames()
    ReDim ElemNames(EN_UnKnown - 1)
    Dim i As ElemNamesEnum
    Dim str As String
    For i = 0 To EN_UnKnown - 1
        Select Case i
            Case EN_Engine: str = "engine"
            Case EN_Context: str = "context"
            Case EN_Grammar: str = "grammar"
            Case EN_Rule: str = "rule"
            Case EN_Speak: str = "speak"
            Case EN_Voice: str = "voice"
            Case EN_Timer: str = "timer"
            Case EN_Processor: str = "processor"
            Case EN_Cookie: str = "cookie"
        End Select
        ElemNames(i) = str
    Next
    ReDim InitialElemNames(EN_UnKnown)
'    ReDim CurrentElemNames(EN_UnKnown)
End Sub

Private Function GetIdxElemNames(name As String) As ElemNamesEnum
    Dim i As Integer
    Dim LName As String
    LName = LCase(name)
    For i = 0 To EN_UnKnown - 1
        If LName = ElemNames(i) Then
            GetIdxElemNames = i
            Exit Function
        End If
    Next
    GetIdxElemNames = EN_UnKnown
End Function

Private Function IsEngineDependent(idxElemName As ElemNamesEnum) As Boolean
    Select Case idxElemName
        Case EN_Engine, EN_Context, EN_Grammar, EN_Rule, EN_Speak, EN_Voice, EN_Cookie
            IsEngineDependent = True
    End Select
End Function

Private Sub GetInitialElemNames(Request As DOMDocument30)
    Dim i As ElemNamesEnum
    For i = 0 To EN_UnKnown
        InitialElemNames(i) = ""
 '       CurrentElemNames(i) = ""
    Next
    If Not Request.selectSingleNode("/Event[@type=""Recognition""]") Is Nothing Then
        Dim node As IXMLDOMNode
        Set node = Request.documentElement.firstChild
        Do Until node Is Nothing
            Dim idxElemName As ElemNamesEnum
            idxElemName = GetIdxElemNames(node.nodeName)
            If idxElemName <> EN_UnKnown Then
                Dim attr As IXMLDOMNode
                Set attr = node.selectSingleNode("./@name")
                If Not attr Is Nothing Then
                    InitialElemNames(idxElemName) = attr.nodeValue
                End If
            End If
            Set node = node.nextSibling()
        Loop
    End If
End Sub

Function findAttr(attrName As String, Optional node As IXMLDOMNode) As Variant
    Static stNode As IXMLDOMNode
    If Not node Is Nothing Then
        Set stNode = node
    End If
    Dim a As IXMLDOMNode
    For Each a In stNode.Attributes
        If a.nodeName = attrName Then
            findAttr = a.nodeValue
            Exit Function
        End If
    Next
End Function

Function getAttrValue(attrName As String, node As IXMLDOMNode) As Variant
    Dim attr As IXMLDOMNode
    Set attr = node.Attributes.getNamedItem(attrName)
    If Not attr Is Nothing Then
        getAttrValue = attr.nodeValue
    End If
End Function

Function attrFound(attrName As String, Optional node As IXMLDOMNode) As Boolean
    attrFound = Not IsEmpty(getAttrValue(attrName, node))
End Function

Private Function nextEngine(Optional idxElemName As ElemNamesEnum = EN_UnKnown, _
                            Optional selected As Variant) As EngineClass
    Static iC As Integer
    Static stSelected As Boolean
    Static stIdxElem As ElemNamesEnum
    If Not IsMissing(selected) Then
        stSelected = selected
        stIdxElem = idxElemName
    End If
    
    Dim e As EngineClass
    If stSelected Then
        If idxElemName <> EN_UnKnown Then
            On Error Resume Next
            Set e = EnginesCollection(CurrentElemNames(idxElemName))
            On Error GoTo 0
        End If
    Else
        If idxElemName <> EN_UnKnown Then iC = 1
        If iC <= EnginesCollection.Count Then
            Set e = EnginesCollection(iC)
            iC = iC + 1
        End If
    End If

    If Not e Is Nothing Then
        If stIdxElem = EN_Engine Then
            If e.key = "" Then Set e = nextEngine()
        Else
            If e.removed Then Set e = nextEngine()
        End If
    End If
    
    Set nextEngine = e
End Function

Function GetPropElemResponse(node As IXMLDOMNode) As PropElemResponseType
    Dim p As PropElemResponseType
    Dim attr As IXMLDOMNode
    Dim LName As String
    Dim v As String
    
    For Each attr In node.Attributes
        v = attr.nodeValue
        LName = LCase(attr.nodeName)
        Select Case LName
            Case "name": p.name = v
            Case "activate": p.activate = True
            Case "deactivate": p.deactivate = True
            Case "remove": p.remove = True
            Case "allengines": p.allEngines = True
            Case "selectedengine": p.selectedEngine = True
            Case "src": p.src = v
            Case "initial": p.initial = True
            Case "type": p.Class = v
            Case "url": p.url = v
            Case "order": p.order = v
            Case "maxage": p.maxAge = v
        End Select
    Next
    Set p.child = node.lastChild
    GetPropElemResponse = p
End Function

Public Function GetCreateGrammar(Engine As EngineClass) As ISpeechRecoGrammar
    Dim Context As ContextClass
    Set Context = GetCreateContext(Engine)
        
    Dim Grammar As ISpeechRecoGrammar
    Dim GrammarName As String
    On Error Resume Next
    GrammarName = CurrentElemNames(EN_Grammar)
    Set Grammar = Context.GrammarsCollection(GrammarName)
    On Error GoTo 0
    If Grammar Is Nothing Then
        GrammarNamesCollection.Add GrammarName
        Set Grammar = Context.instance.CreateGrammar(GrammarNamesCollection.Count)
        Context.GrammarsCollection.Add Grammar, GrammarName
    End If
    Set GetCreateGrammar = Grammar
End Function

Public Function GetCreateContext(Engine As EngineClass) As ContextClass
    Dim Context As ContextClass
    Dim ContextName As String
    
    On Error Resume Next
    ContextName = CurrentElemNames(EN_Context)
    Set Context = Engine.ContextsCollection(ContextName)
    On Error GoTo 0
    If Context Is Nothing Then
        Set Context = Engine.ContextsCollection.Add(Engine.instance.CreateRecoContext, ContextName)
    End If
    Set GetCreateContext = Context
End Function

Public Function CompileGrammar(str As String) As Variant
    Dim strError As String
    Dim fso As FileSystemObject
    Set fso = New FileSystemObject
    Dim stream As TextStream
    Set stream = fso.CreateTextFile("grammarTmp.xml", True, True)
'    Debug.Print fso.GetAbsolutePathName("")
    stream.Write str
    stream.Close
    GrammarTmp.CmdLoadFromFile "grammarTmp.xml", SLODynamic
    CompileGrammar = GrammarTmp.Rules.CommitAndSave(strError)
    GrammarTmp.Reset
End Function

Public Sub AddProcessor(p As PropElemResponseType)
    Dim proc As New ProcessorClass
    Dim order As Integer
    
    proc.Class = p.Class
    proc.key = p.name
    If IsEmpty(p.order) Then
        Select Case p.Class
            Case "xslt": order = OR_Xslt
            Case "ActiveX": order = OR_ActiveX
            Case "http": order = OR_Http
        End Select
    Else
        order = CInt(p.order)
    End If
    proc.order = order
    Select Case p.Class
        Case "xslt"
            Dim Template As New XSLTemplate30
            Set Template.stylesheet = p.child
            Dim xslt As IXSLProcessor
            xslt = Template.createProcessor
            proc.data = xslt
        Case "ActiveX"
            Exit Sub
        Case "http"
            proc.data = p.url
        Case Else
            Exit Sub
    End Select
    
    ' Remove old processor
    If Not IsEmpty(p.name) Then
        On Error Resume Next
        ProcessorsCollection.remove p.name
        On Error GoTo 0
    End If
    
    ' Find insert
    Dim i As Integer
    For i = 1 To ProcessorsCollection.Count
        If order < ProcessorsCollection(i).order Then Exit For
        If order = ProcessorsCollection(i).order Then
            If StrComp(proc.key, ProcessorsCollection(i).key) < 0 Then Exit For
        End If
    Next
    
    If IsEmpty(p.name) Then
        If i <= ProcessorsCollection.Count Then
            ProcessorsCollection.Add proc, , i
        Else
            ProcessorsCollection.Add proc
        End If
    Else
        If i <= ProcessorsCollection.Count Then
            ProcessorsCollection.Add proc, p.name, i
        Else
            ProcessorsCollection.Add proc, p.name
        End If
    End If
End Sub

Public Function ProcessResponse(Request As DOMDocument30, Response As DOMDocument30, _
                         Optional GetSrc As httpGetSrcClass) As Boolean
    Dim root As IXMLDOMNode
    Dim node As IXMLDOMNode
    
    If Response Is Nothing Then Exit Function
    Set root = Response.documentElement
    If root Is Nothing Then: Exit Function
    If LCase(root.nodeName) <> "response" Then: Exit Function
            
    ProcessResponse = True
    
    GetInitialElemNames Request
    
    If GetSrc Is Nothing Then
        Set GetSrc = New httpGetSrcClass
    End If
    
    If Not IsEmpty(GetSrc.CurrentElemNames) Then
        CurrentElemNames = GetSrc.CurrentElemNames
    Else
        CurrentElemNames = InitialElemNames
    End If
    
    Dim ChildGrammar As Variant
    Dim v As Variant, m As Variant
        
    Do
        Set node = root.firstChild
        If node Is Nothing Then Exit Do
        
        Dim idxElemName As ElemNamesEnum
        idxElemName = GetIdxElemNames(node.nodeName)
        
        Dim p As PropElemResponseType
        p = GetPropElemResponse(node)
        
        If Not IsEmpty(p.name) Then CurrentElemNames(idxElemName) = p.name
        If p.initial Then CurrentElemNames(idxElemName) = InitialElemNames(idxElemName)
                
        If IsEngineDependent(idxElemName) Then
            Dim Engine As EngineClass
            Set Engine = nextEngine(idxElemName, p.selectedEngine)
            
            Do Until Engine Is Nothing
                Dim Context As ContextClass
                Dim Grammar As ISpeechRecoGrammar
                If Not IsEmpty(p.src) Then
                    If idxElemName = EN_Grammar Then
                        Set Grammar = GetCreateGrammar(Engine)
                        v = GetSrc.Cached((p.src))
                        If Not IsEmpty(v) Then
                            If GetSrc.Grammar Is Nothing Then
                                Set GetSrc.Grammar = New Collection
                            End If
                            Set m = Nothing
                            On Error Resume Next
                            Set m = GetSrc.Grammar(p.src)
                            On Error GoTo 0
                            If m Is Nothing Then
                                Set m = CompileGrammar((v))
                            End If
                            Grammar.CmdLoadFromMemory m, SLODynamic
                        Else
                            GetSrc.httpGet (p.src), Request, Response, CurrentElemNames
                            Exit Function
                        End If
                    End If
                End If
                If Not p.child Is Nothing Then
                    If idxElemName = EN_Grammar Then
                        Set Grammar = GetCreateGrammar(Engine)
                        If IsEmpty(ChildGrammar) Then
                            ChildGrammar = CompileGrammar(p.child.xml)
                        End If
                        Grammar.CmdLoadFromMemory ChildGrammar, SLODynamic
                        ' createGrammar p.child.xml
                    End If
                End If
                If (CurrentElemNames(EN_Engine) = Engine.key) Or p.allEngines Then
                    If p.activate Or p.deactivate Then
                        Select Case idxElemName
                            Case EN_Engine
                                If Engine.removed Then
                                    Set Engine.instance.AudioInput = Engine.AudioInput
                                    Engine.removed = False
                                End If
                                If p.activate Then
                                    Engine.instance.State = SRSActive
                                Else
                                    Engine.instance.State = SRSInactive
                                End If
                            Case EN_Context
                                Set Context = GetCreateContext(Engine)
                                If p.activate Then
                                    Context.instance.State = SRCS_Enabled
                                Else
                                    Context.instance.State = SRCS_Disabled
                                End If
                            Case EN_Grammar
                                Set Grammar = GetCreateGrammar(Engine)
                                If p.activate Then
                                    Grammar.State = SGSEnabled
                                Else
                                    Grammar.State = SGSDisabled
                                End If
                            Case EN_Rule
                                Set Grammar = GetCreateGrammar(Engine)
                                If p.activate Then
                                    Grammar.CmdSetRuleState CurrentElemNames(EN_Rule), SGDSActive
                                Else
                                    Grammar.CmdSetRuleState CurrentElemNames(EN_Rule), SGDSInactive
                                End If
                            Case EN_Voice
                        End Select
                    End If
                    If idxElemName = EN_Speak Then
                        Set Context = GetCreateContext(Engine)
                        If Not p.child Is Nothing Then
                            Context.instance.Voice.Speak p.child.Text
                        End If
                    End If
                    If idxElemName = EN_Cookie Then
                        Dim Cookie As CookieClass
                        On Error Resume Next
                        Engine.CookiesCollection.remove CurrentElemNames(EN_Cookie)
                        On Error GoTo 0
                        Set Cookie = New CookieClass
                        Cookie.key = p.name
                        Set Cookie.data = p.child
                        If Not IsEmpty(p.maxAge) Then
                            Cookie.expire = DateAdd("s", p.maxAge, Now)
                        End If
                        Engine.CookiesCollection.Add Cookie, CurrentElemNames(EN_Cookie)
                    End If
                End If
                If p.remove Then
                End If
                ' p.src
                ' p.child
                ' p.activate
                ' p.deactivate
                ' p.remove
                
                Set Engine = nextEngine()
            Loop
        Else
            If idxElemName = EN_Processor Then
                AddProcessor p
            End If
            
            
            ' Timer
            ' Processor
        End If
        ChildGrammar = Empty
        root.removeChild node
    Loop
End Function


