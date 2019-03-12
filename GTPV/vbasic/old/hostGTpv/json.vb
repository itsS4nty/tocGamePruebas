Imports System.Net.Sockets
Imports System.Net
Imports System.Threading
Imports System.IO
Imports System.Text
Imports System.Globalization


Namespace hostGTpv
    Public Class jsObject
        Inherits Dictionary(Of String, Object)
        Default Public Overloads Property Item(ByVal s As String) As Object
            Get
                Dim ret As Object = Nothing
                TryGetValue(s, ret)
                Return ret
            End Get
            Set(ByVal value As Object)
                MyBase.Item(s) = value
            End Set
        End Property
    End Class
    Public Class jsArray
        Inherits List(Of Object)
        Default Public Overloads Property Item(ByVal i As Integer) As Object
            Get
                If (i < 0) OrElse (i >= Count) Then Return Nothing
                Return MyBase.Item(i)
            End Get
            Set(ByVal value As Object)
                MyBase.Item(i) = value
            End Set
        End Property
    End Class
    Public Class jsFunction
        Private s As String
        Public Overrides Function ToString() As String
            Return s
        End Function
        Public Sub New(ByVal s As String)
            Me.s = s
        End Sub
    End Class

    Public Class json
        Private r As TextReader
        Private eof As Boolean
        Private c As Char
        Private pos As Integer
        Private sb As StringBuilder

        Private Sub nextC(ByVal throwEof As Boolean)
            Dim i = r.Read()
            If i = -1 Then
                eof = True
                c = ChrW(0)
                If (throwEof) Then Throw New FormatException()
                Return
            End If
            pos += 1
            c = ChrW(i)
            sb.Append(c)
        End Sub

        Private Sub SkipSpaces(ByVal throwEof As Boolean)
            While Not eof
                If Not Char.IsWhiteSpace(c) Then Return
                nextC(False)
            End While
            If (throwEof) Then Throw New FormatException()
        End Sub

        Private Function parseObj() As Object
            Dim obj = New jsObject()
            nextC(True)
            SkipSpaces(True)
            While True
                If c = "}"c Then
                    Exit While
                ElseIf c <> """"c Then
                    Throw New FormatException()
                End If
                Dim prop = parseString()
                SkipSpaces(True)
                If c <> ":"c Then
                    Exit While
                End If
                nextC(True)
                SkipSpaces(True)
                Dim value = ParseSomething()
                obj.Add(prop, value)
                SkipSpaces(True)
                If c = ","c Then
                    nextC(True)
                ElseIf c <> "}"c Then
                    Throw New FormatException()
                End If
            End While
            nextC(False)
            Return obj
        End Function

        Private Function parseArray() As Object
            Dim ar = New jsArray()
            nextC(True)
            SkipSpaces(True)
            While True
                If c = "]"c Then
                    Exit While
                End If
                Dim value = ParseSomething()
                ar.Add(value)
                SkipSpaces(True)
                If c = ","c Then
                    nextC(True)
                ElseIf c <> "]"c Then
                    Throw New FormatException()
                End If
            End While
            nextC(False)
            Return ar
        End Function

        Private Function parseString() As String
            Dim s As New StringBuilder()
            While True
                nextC(True)
                If c = """"c Then Exit While
                If c = "\"c Then
                    nextC(True)
                    If c = "u"c Then
                        Dim hex = New StringBuilder()
                        For i = 1 To 4
                            nextC(True)
                            If Not ((c >= "0"c And c <= "9"c) Or (c >= "a"c And c <= "f"c) Or (c >= "A"c And c <= "F"c)) Then
                                Throw New FormatException("\uXXXX")
                            End If
                            hex.Append(c)
                        Next
                        s.Append(Chr(Int32.Parse(hex.ToString(), NumberStyles.AllowHexSpecifier)))
                    Else
                        nextC(True)
                        Dim esc As Char
                        Select Case c
                            Case """"c, "/"c, "\"c
                                esc = c
                            Case "b"c
                                esc = ControlChars.Back
                            Case "f"c
                                esc = ControlChars.FormFeed
                            Case "n"c
                                esc = ControlChars.Lf
                            Case "r"c
                                esc = ControlChars.Cr
                            Case "t"c
                                esc = ControlChars.Tab
                            Case Else
                                Throw New FormatException("escape")
                        End Select
                        s.Append(esc)
                    End If
                Else
                    s.Append(c)
                End If
            End While
            nextC(False)
            Return s.ToString()
        End Function

        Private Function parseNumericValue() As Double
            Dim s As New StringBuilder()
            If c = "-"c Then s.Append(c) : nextC(True)
            If c = "0"c Then
                s.Append(c)
                nextC(False)
            ElseIf (c >= "1"c) And (c <= "9"c) Then
                While (c >= "0"c) And (c <= "9"c)
                    s.Append(c) : nextC(False)
                End While
            Else
                Throw New FormatException()
            End If
            If (c = "."c) Then
                s.Append(c) : nextC(True)
                While (c >= "0"c) And (c <= "9"c)
                    s.Append(c) : nextC(False)
                End While
            End If
            If (c = "e"c) Or (c = "E"c) Then
                s.Append(c) : nextC(True)
                If (c = "+"c) Or (c = "-"c) Then s.Append(c) : nextC(True)
                While (c >= "0"c) And (c <= "9"c)
                    s.Append(c) : nextC(False)
                End While
            End If
            'CultureInfo.InvariantCulture.NumberFormat.NumberDecimalSeparator
            Return Double.Parse(s.ToString(), NumberStyles.AllowDecimalPoint Or NumberStyles.AllowExponent Or NumberStyles.AllowLeadingSign,
                                CultureInfo.InvariantCulture.NumberFormat)
        End Function

        Private Function parseBoolean() As Boolean
            Dim b As Boolean = (c = "t"c)
            Dim comp As String = If(b, "true", "false")
            For i = 1 To comp.Length - 1
                nextC(True)
                If c <> comp(i) Then Throw New FormatException()
            Next
            nextC(False)
            Return b
        End Function

        Private Function parseNull() As Object
            Dim comp As String = "null"
            For i = 1 To comp.Length - 1
                nextC(True)
                If c <> comp(i) Then Throw New FormatException()
            Next
            nextC(False)
            Return Nothing
        End Function

        Private Function ParseSomething() As Object
            SkipSpaces(True)

            If c = "{"c Then
                Return parseObj()
            ElseIf c = "["c Then
                Return parseArray()
            ElseIf c = """"c Then
                Return parseString()
            ElseIf ((c >= "0"c) And (c <= "9"c)) Or (c = "-") Then
                Return parseNumericValue()
            ElseIf c = "t"c Or c = "f"c Then
                Return parseBoolean()
            ElseIf c = "n"c Then
                Return parseNull()
            End If
            Throw New FormatException()
        End Function

        Public Shared Function parse(ByVal r As TextReader) As Object
            Return (New json())._parse(r)
        End Function

        Private Function _parse(ByVal r As TextReader) As Object
            Me.r = r
            Me.eof = False
            Me.pos = 0
            Me.sb = New StringBuilder()
            nextC(True)
            Dim ret = ParseSomething()
            SkipSpaces(False)
            If Not eof Then Throw New FormatException()
            Return ret
        End Function

        Public Shared Sub stringify(ByVal o As Object, ByVal w As TextWriter)
            'Dim s As String = "yyy"
            'Dim t As TextReader = New StringReader(s)


        End Sub

        Public Shared Function toJsString(ByVal s As String, ByVal quotes As Boolean) As String
            Dim sb As New StringBuilder()
            If quotes Then sb.Append("""")
            For Each c As Char In s
                Select Case c
                    Case """"c, "/"c, "\"c
                        sb.Append("\" & c)
                    Case ControlChars.Back
                        sb.Append("\b")
                    Case ControlChars.FormFeed
                        sb.Append("\f")
                    Case ControlChars.Lf
                        sb.Append("\n")
                    Case ControlChars.Cr
                        sb.Append("\r")
                    Case ControlChars.Tab
                        sb.Append("\t")
                    Case Else
                        sb.Append(c)
                End Select
            Next
            If quotes Then sb.Append("""")
            Return sb.ToString()
        End Function

        Public Shared Function objectToUnEval(ByVal obj As Object, Optional ByVal stackObjs As Stack = Nothing) As String
            If stackObjs Is Nothing Then stackObjs = New Stack()
            If obj Is Nothing Then Return "null"
            If TypeOf obj Is Char Then obj = CStr(obj)
            If TypeOf obj Is String Then
                Return toJsString(obj, True)
            ElseIf TypeOf obj Is Boolean Then
                Return If(obj, "true", "false")
            ElseIf IsNumeric(obj) Then
                Dim d As Double = CDbl(obj)
                Return d.ToString(CultureInfo.InvariantCulture) 'decimales
            ElseIf TypeOf obj Is IEnumerable Then
                If stackObjs.Contains(obj) Then Throw New Exception("circular structure in objectToUnEval") '??
                stackObjs.Push(obj)
                Dim ret As String
                Dim coma As String = ""
                If TypeOf obj Is IDictionary Then
                    ret = "{"
                    For Each el As DictionaryEntry In DirectCast(obj, IDictionary)
                        ret &= coma & toJsString(el.Key, True) & ":" & objectToUnEval(el.Value, stackObjs)
                        coma = ","
                    Next
                    ret &= "}"
                Else
                    ret = "["
                    For Each el In obj
                        ret &= coma & objectToUnEval(el, stackObjs)
                        coma = ","
                    Next
                    ret &= "]"
                End If
                stackObjs.Pop()
                Return ret
            ElseIf TypeOf obj Is jsFunction Then
                Return obj.ToString()
            Else
                Throw New Exception()
            End If
        End Function
        Public Shared Function clone(ByVal obj As Object) As Object
            If Not (TypeOf obj Is IEnumerable) OrElse (TypeOf obj Is String) Then Return obj
            If TypeOf obj Is IDictionary Then
                Dim cloneObj As New jsObject
                For Each el As DictionaryEntry In DirectCast(obj, IDictionary)
                    cloneObj(el.Key) = clone(el.Value)
                Next
                Return cloneObj
            Else
                Dim cloneArray As New jsArray
                For Each el In obj
                    cloneArray.Add(clone(el))
                Next
                Return cloneArray
            End If
        End Function
    End Class

End Namespace