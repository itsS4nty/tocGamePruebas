Attribute VB_Name = "ModuleProcessRequest"
Public EnginesCollection As EnginesCollectionClass
Public GrammarNamesCollection As Collection

Public RecoContextTmp As SpInProcRecoContext
Public GrammarTmp As ISpeechRecoGrammar

Public ProcessorsCollection As Collection
Dim Voice As New SpVoice
Sub Digues(Texte As String)

    Voice.Speak Texte, SVSFlagsAsync + SVSFPurgeBeforeSpeak
    Form1.List2.AddItem "Digo ->" & Texte, 0
    
End Sub

'Function GetEngine(Reco As SpInProcRecoContext) As EngineType
'    Dim Engine As EngineType
'    For Each Engine In EnginesCollection
'        If Reco = Engine.Recognizer Then
'            Set GetEngine = Engine
'            Exit For
'        End If
'    Next
'End Function

'Function GetContext(RecoCtx As SpInProcRecoContext, Engine As EngineType) As ContextType
'    Dim ctx As ContextType
'    For Each ctx In Engine.ContextsCollection
'        If RecoCtx = ctx.Context Then
'            Set GetContext = ctx
'            Exit For
'        End If
'    Next
'End Function

Sub Init()
    Set EnginesCollection = New EnginesCollectionClass
    Dim EngineTmp As New SpInprocRecognizer
    EnginesCollection.Add EngineTmp, "", Nothing
    EnginesCollection(1).removed = False
    Set GrammarNamesCollection = New Collection
    
    Set RecoContextTmp = New SpInProcRecoContext
    Set GrammarTmp = RecoContextTmp.CreateGrammar
    
    Set ProcessorsCollection = New Collection
    
    InitArrayElemNames
    
    Dim AudioInputsCollection As ISpeechObjectTokens
    Set AudioInputsCollection = EngineTmp.GetAudioInputs
    
    Dim AudioInput As SpObjectToken
    
    For Each AudioInput In AudioInputsCollection
        Set EngineTmp = New SpInprocRecognizer
        If InStr(AudioInput.GetDescription, "CS50") > 0 Then EnginesCollection.Add EngineTmp, AudioInput.GetDescription, AudioInput
    Next
    
    Dim cmdLine As Variant
    cmdLine = Split(Trim(Command), " ")
    
    If UBound(cmdLine) < 0 Then
        cmdLine = Array("Init.xml")
    End If
    
    If InStr(LCase(cmdLine(0)), "http://") = 1 Then
        Dim propTmp As PropElemResponseType
        
        propTmp.Class = "http"
        propTmp.url = cmdLine(0)
        Informa "Peticio : " & cmdLine(0)
        AddProcessor propTmp
    Else
        Dim fso As New FileSystemObject
        Dim stream As TextStream
        Set stream = fso.OpenTextFile(cmdLine(0), ForReading)
        Dim str As String
        str = stream.ReadAll
        Dim req As New DOMDocument30
        req.loadXML "<Event type=""Initial""/>"
        Dim resp As New DOMDocument30
        resp.loadXML str
        Informa "Peticio : " & str
        ProcessResponse req, resp
    End If
    
    StartEvent
       
    Exit Sub
    Dim Grammar As ISpeechRecoGrammar
    Dim strP As Variant
    
    strP = "prueba1"
'    Set Grammar = TmpRecoCtx.CreateGrammar(10000000000#)
    
    Dim dom As DOMDocument30
    Set dom = New DOMDocument30
'    str1 = "<Event type=""Recognition""><Engine>audio1</Engine></Event>"
'    str1 = str1 + "<Event type=""Timer"">100</Event>"
    str1 = "<xml>" + vbNewLine + "   <Event>" + vbNewLine + "      data" + vbNewLine + "   </Event></xml>" + vbNewLine
    str1 = "<xml><Event type=""Recognition"" all="""">data</Event></xml>"
    str1 = _
        "<?xml version=""1.0""?><?xml-stylesheet type=""text/xsl"" href=""hello.xsl""?>" + _
        "<hello-world> <greeter>An XSLT Programmer</greeter> <greeting>Hello, World</greeting></hello-world>"
        
    MsgBox str1
    Informa str1
    
    dom.loadXML str1
    
'    dom.documentElement.appendChild dom.createCDATASection("ejemplo ]]>")
    
'    dom.firstChild.insertBefore dom.createElement("t2"), dom.firstChild.firstChild
    
    strP = dom.xml
    MsgBox strP
    Informa strP
    
    Dim v11 As Variant
    
    f2
    v11 = Empty
    f2 v11
    v11 = Empty
    f2 (v11)
    v11 = ""
    f2 v11
    
    Dim nodes As IXMLDOMNodeList
    
    Set nodes = dom.selectNodes("/")
    
    Dim reco As SpInprocRecognizer
'    Set reco = New SpInprocRecognizer
    
'    Set reco.AudioInput = Nothing
    
    Dim Cont As ISpeechRecoContext
'    Set Cont = reco.CreateRecoContext
    
    Dim reco2 As SpSharedRecognizer
'    Set reco2 = New SpSharedRecognizer
    
'    reco2.State = SRSInactive
    
'    Set reco2.AudioInput = Nothing
    
    Dim Cont2 As ISpeechRecoContext
'    Set Cont2 = reco2.CreateRecoContext
    
    Dim v111 As Variant, v112 As Variant
    v111 = Array("123", "321", "999")
    v112 = v111
    v112(0) = "777"
    
    Dim ar11() As String
    Dim ar12() As String
    
    ReDim ar11(10)
    ar11(0) = "123"
    ar11(1) = "321"
    ar11(2) = "999"
    
    ar12 = ar11
    ar12(0) = "888"
    
    v111 = ar11
'    ar12 = v112

    Dim GC As Object
    Dim SR As Object
    
    Set SR = CreateObject("SAPI.SpSharedRecognizer")
    ' Set GC = CreateObject("SAPI.SpGrammarCompiler")
    
End Sub
Sub Informa(St)

    Form1.List1.AddItem St, 0
    
    Debug.Print St
    
End Sub
Sub f2(Optional v)
    Debug.Print IsMissing(v)
    Debug.Print IsEmpty(v)
    v = "prueba8"
End Sub


Function GenTabs(ident As Integer) As String
    Dim str As String, i As Integer
    str = ""
    For i = 1 To i: str = str + vbTab: Next
    GenTabs = str
End Function

Function RuleToXML(rule As ISpeechPhraseRule, ident As Integer) As String
    Dim str As String, child As ISpeechPhraseRule
    If rule Is Nothing Then
        RuleToXML = ""
        Exit Function
    End If
    str = GenTabs(ident) + "<Rule name=""" + rule.name + """>" + vbNewLine
    If Not (rule.Children Is Nothing) Then
        For Each child In rule.Children
            str = str + RuleToXML(child, ident + 1)
        Next
    End If
    str = str + GenTabs(ident) + "</Rule>" + vbNewLine
    RuleToXML = str
End Function

Function PropertiesToXML(props As ISpeechPhraseProperties, ident As Integer) As String
    Dim str As String, child As ISpeechPhraseProperty
    str = ""
    If Not (props Is Nothing) Then
        For Each child In props
            str = str & GenTabs(ident) & "<Property name=""" & child.name & """ val =""" & child.Value & """>" & vbNewLine
            str = str & PropertiesToXML(child.Children, ident + 1)
            str = str & GenTabs(ident) & "</Property>" & vbNewLine
        Next
    End If
    PropertiesToXML = str
End Function

Function CookiesToXML(Engine As EngineClass) As String
    Dim Cookie As CookieClass
    Dim str As String
    Dim n As Date
    
    str = ""
    n = Now
    
    For Each Cookie In Engine.CookiesCollection
        Dim secDiff As Long
        secDiff = 1
        
        If Not IsEmpty(Cookie.expire) Then
            secDiff = DateDiff("s", n, Cookie.expire)
        End If
        If secDiff <= 0 Then
            Engine.CookiesCollection.remove Cookie.key
        Else
            str = str + "<Cookie name=""" + Cookie.key + """"
            If Not IsEmpty(Cookie.expire) Then
                str = str + " maxAge=""" + secDiff + """"
            End If
            str = str + ">"
            If Not (Cookie.data Is Nothing) Then
                str = str + Cookie.data.xml
            End If
            str = str + "</Cookie>"
        End If
    Next
    
    CookiesToXML = str
End Function

Sub RecognitionEvent(Result As ISpeechRecoResult, Optional FalseRecognition As Boolean)
    Dim Engine As EngineClass
    Dim Context As ContextClass
    Dim GrammarName As String
    
    Dim typeEvent As String
    
'Informa "!!"
    
    
    If FalseRecognition Then typeEvent = "FalseRecognition" Else typeEvent = "Recognition"
    
    Dim str As String
    
'    Dim dom As DOMDocument30
    Set Engine = EnginesCollection(Result.RecoContext.Recognizer)
    Set Context = Engine.ContextsCollection(Result.RecoContext)
    
    Informa "Rebut -> " & Result.PhraseInfo.GetText
    For Each PhraseElem In Result.PhraseInfo.Elements
        Informa PhraseElem.ActualConfidence & "  " & PhraseElem.DisplayText
        If Not PhraseElem.ActualConfidence = 0 Then typeEvent = "FalseRecognition"
    Next
    
    If Not typeEvent = "FalseRecognition" Then
        Form1.List2.AddItem "Oigo -> " & Result.PhraseInfo.GetText, 0
    Else
        For Each PhraseElem In Result.PhraseInfo.Elements
            Form1.List2.AddItem "Oigo -> " & PhraseElem.ActualConfidence & "  " & PhraseElem.DisplayText, 0
        Next
    End If
    
    
    

    On Error Resume Next
    GrammarName = GrammarNamesCollection(Result.PhraseInfo.GrammarId)
    On Error GoTo 0
    
    str = _
        "<Event type=""" + typeEvent + """>" + vbNewLine + _
        "   <Engine name=""" + Engine.key + """/>" + vbNewLine + _
        "   <Context name=""" + Context.key + """/>" + vbNewLine + _
        "   <Grammar name=""" + GrammarName + """/>" + vbNewLine + _
        RuleToXML(Result.PhraseInfo.rule, 1) + _
        PropertiesToXML(Result.PhraseInfo.Properties, 1) + _
        "   <GetText>" + Result.PhraseInfo.GetText + "</GetText>" + vbNewLine + _
        CookiesToXML(Engine) + _
        "</Event>" + vbNewLine
        
        
    Dim Request As New DOMDocument30
    
    Request.loadXML str
    
    ProcessRequest Request
End Sub

Sub FalseRecognitionEvent(Result As ISpeechRecoResult)
    RecognitionEvent Result, True
End Sub

Sub StartEvent()
    Dim Request As New DOMDocument30
    Dim str As String
    
    str = "<Event type=""Start"">"
    
    Dim i As Integer
    For i = 2 To EnginesCollection.Count
        str = str + "<Engine name=""" + EnginesCollection(i).key + """/>"
    Next
            
    str = str + "</Event>"
            
    Request.loadXML str
    
    ProcessRequest Request
End Sub


Sub ProcessRequest(Request As DOMDocument30)
    Dim c As New Collection
    Dim el As ProcessorClass
        
    For Each el In ProcessorsCollection
        c.Add el
    Next
    
    ProcessRequestWithList Request, c, 1
End Sub

Sub ProcessRequestWithList(Request As DOMDocument30, List As Collection, iL As Integer)
    ' for each ordrered eventProcessor in EventProcessorsCollection
    While iL <= List.Count
    '   switch eventProcessor type
        Dim p As ProcessorClass
        Set p = List(iL)
        Select Case p.Class
            Case "xslt"
                Dim xslt As IXSLProcessor
                Set xslt = p.data
                xslt.input = Request
                xslt.Transform
                If (ProcessResponse(Request, xslt.output)) Then
                    Exit Sub
                End If
                iPL = iPL + 1
            Case "ActiveX"
                Exit Sub
            Case "http"
                Dim httpProc As New httpProcessorClass
                httpProc.Send Request, (p.data), List, iL
                Exit Sub
        End Select
    Wend
End Sub



