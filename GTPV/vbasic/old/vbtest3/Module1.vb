Imports System.Collections
Imports System.Collections.Generic
Imports System.Net
Imports System.Net.NetworkInformation
Imports System.Net.Sockets
Imports System.Threading
Imports System.IO

Class h1
    Public c As Integer
End Class
Module Module1

    Class cl
        Private x As Integer
        Public Sub New(ByVal x As Integer)
            Me.x = x
        End Sub
        Public Function getx() As Integer
            Return x
        End Function
    End Class

    Delegate Function g() As Integer
    Function h() As Integer
        Return 8
    End Function
    Class chh
        Inherits Dictionary(Of String, System.Delegate)
    End Class
    Class c4
        Private x As Integer
        Sub New(ByVal x As Integer)
            Me.x = x
        End Sub
        Public Function f1(ByVal a As Integer, ByVal b As Integer, ByVal s As String) As Object
            Console.WriteLine(s)
            Return a + b + x
        End Function
        Public f2 As [Delegate] = Function(a As Integer, b As Integer, s As String) As Integer
                                      Console.WriteLine(s)
                                      Return a + b + x
                                  End Function
        Public f3 = Function(a As Integer, b As Integer, s As String) As Integer
                        Console.WriteLine(s)
                        Return a + b + x
                    End Function
        Public vv As Integer
    End Class
    Delegate Function ddd(ByVal a As Integer, ByVal b As Integer, ByVal s As Integer) As Integer
    Delegate Function del1() As Object

    Interface in1
        Sub f1(ByVal i As Integer)
    End Interface
    Class cin1
        Implements in1

        Public Sub f2(ByVal i As Integer) Implements in1.f1
            Console.WriteLine(i)
        End Sub
    End Class

    Class cl5
        Private x As Integer
        Class cl55
            Sub f()
                'Console.WriteLine(x)
            End Sub
        End Class
    End Class
    Dim b1 As Boolean?
    Dim w1 As Integer?
    Dim w2 As Integer?

    Dim bbb1 As ArrayList
    Structure qqq3
        Public s As Integer
    End Structure
    Class qqq31
        Public s As Integer
    End Class
    Class chh2
        Public hh2
    End Class
    Public Function getSiteLocalAddresses() As String()
        Dim localAddress As New List(Of String)
        Dim nis() As NetworkInterface = NetworkInterface.GetAllNetworkInterfaces()
        For Each ni As NetworkInterface In nis
            If ni.OperationalStatus = OperationalStatus.Up Then
                Dim prop = ni.GetIPProperties()
                For Each ua In prop.UnicastAddresses
                    If ua.Address.AddressFamily = AddressFamily.InterNetwork AndAlso Not IPAddress.IsLoopback(ua.Address) Then
                        Dim sAddr = ua.Address.ToString()
                        Dim prefLen As Integer = 0
                        Dim addrBytes = ua.IPv4Mask.GetAddressBytes()
                        For i = 0 To 3
                            Dim b As Byte = addrBytes(i)
                            If b = 255 Then
                                prefLen += 8
                            Else
                                While b <> 0
                                    prefLen += 1
                                    b <<= 1
                                End While
                                Exit For
                            End If
                        Next
                        sAddr &= "/" & prefLen
                        localAddress.Add(sAddr)
                    End If
                Next
            End If
        Next
        Return localAddress.ToArray()
    End Function

    Class ee1
        Public Shared a As Integer
    End Class

    Class ee2
        Inherits ee1
    End Class

    Public Sub h5()
    End Sub
    Public Function jj5() As Integer
        Return 1
    End Function

    Public Structure sw2
        Public a As Integer
    End Structure
    Sub hkh(ByRef s As sw2)
        s.a = 8
    End Sub
    Event f1 As Action(Of String)
    Event f2 As Action(Of String, String)

    Public dd4 As Func(Of Integer, Integer)

    Sub main()
        Dim Name = "hugo"
        Dim anonymousCust2 = New With {Key Name}
        Dim dir As New DirectoryInfo("..")
        Dim path As New FileInfo("../../notas1")

        Dim nnbbhh() As Double = New Double(4) {}


        Dim hhhj = Directory.GetDirectories("..\..")
        Dim uuu1 As New Dictionary(Of String, Boolean) From {{"g", True}, {"k", False}}
        Dim t = uuu1.GetType()
        'Console.WriteLine(TypeOf uuu1("g") Is KeyValuePair(Of String, Object))
        Console.WriteLine("d :" & (dd4 Is Nothing))
        Console.WriteLine(dd4(1))
        dd4 = Function(x) x + 1
        Console.WriteLine("d :" & (dd4 Is Nothing))
        Console.WriteLine(dd4(1))
        'Console.WriteLine(TypeOf AddressOf f2 Is [Delegate])
        Dim jjjjk As String = Nothing
        Dim jjjjk2 As Object = Nothing
        Dim kkks As String = DirectCast(jjjjk, String)
        Dim kkks2 As String = DirectCast(jjjjk2, String)
        Dim hfff As Double? = Nothing
        Console.WriteLine(IsNumeric(hfff))
        hfff = 3
        Console.WriteLine(IsNumeric(hfff))

        Dim ooop As New Dictionary(Of String, Object)
        ooop("rrr") = New Integer(2) {4, 5, 6}
        Dim iii9() As Integer = ooop("rrr")
        iii9(1) = 77
        Dim iii10() As Integer = ooop("rrr")

        Dim i As Integer
        For i = 0 To 1

        Next
        Console.WriteLine(i)
        Dim gggg As String = TryCast(Nothing, String)
        Dim str2 As String = Nothing
        Dim str3 As String = ""
        Console.WriteLine(str2 = str3)
        str2 &= "t"
        Console.WriteLine(str2)
        Dim ffff As New sw2()
        ffff.a = 2
        Console.WriteLine(ffff.a)
        hkh(ffff)
        Console.WriteLine(ffff.a)


        Call h5()
        jj5()
        With New Thread(AddressOf getSiteLocalAddresses)
            .Start()
        End With
        Call New Thread(AddressOf getSiteLocalAddresses).Start()
        'End With
        ee1.a = 4
        ee2.a = 6
        Console.WriteLine(ee1.a)
        Console.WriteLine(ee2.a)

        Dim uuu4 = getSiteLocalAddresses()
        Dim ee5 = NetworkInterface.GetAllNetworkInterfaces()
        Dim hh5(ee5.Length - 1)
        For i = 0 To hh5.Length - 1
            hh5(i) = ee5(i).GetIPProperties()
        Next

        Dim bbb2 = Dns.GetHostAddresses("")
        Dim nnn2 = Dns.GetHostName()
        Dim y1() As Integer
        y1 = New Integer(0) {}
        Dim y2() As Object
        y2 = New Object(-1) {}

        Dim ff3 = New List(Of String)
        ff3.Add("qq")
        ff3.Add("ww")
        Console.WriteLine(ff3(0))
        Console.WriteLine(ff3.Count)
        ff3.RemoveAt(0)
        Console.WriteLine(ff3(0))
        Console.WriteLine(ff3.Count)

        Dim a(3) As Integer
        a(0) = 1
        a(3) = 1
        'a(4) = 1
        Console.WriteLine(a.Length)

        Dim hh2 = Function(x As Integer)
                      Return x + 1
                  End Function
        Console.WriteLine(hh2.Method.GetParameters().Count)
        Dim fff111 As Integer = hh2.Method.Invoke(hh2.Target, New Object() {Nothing})
        Console.WriteLine(fff111)
        Dim jjj3 As qqq3
        jjj3 = Nothing
        Console.WriteLine(jjj3.s)
        Dim jjj31 As qqq31
        jjj31 = Nothing
        Console.WriteLine(jjj31.s)

        'Console.WriteLine(TypeOf bbb1 Is ArrayList)
        Dim aa As New ArrayList()
        aa.Add(3)
        aa(0) = 1
        aa(1) = 5
        Dim ii1 As Integer = w1
        Console.WriteLine(ii1)
        Console.WriteLine(w1)
        Console.WriteLine(w2)
        Console.WriteLine(w1 = w2)
        Console.ReadLine()
        If b1 Then

        End If
        Dim cl11 As New cin1
        Dim i1 As in1
        i1 = cl11
        i1.f1(3)
        Dim hh As chh = New chh()
        'hh.Add("rr", 1)
        Dim qq As New c4(77)
        Dim hhh As ddd = AddressOf qq.f1
        'Dim nn As [Delegate]
        qq.f2.DynamicInvoke(3, 2, "ww")
        Dim t33 = qq.f3.GetType()
        Dim nn2 As [Delegate] = qq.f3
        Dim s As Single = CType(qq.vv, Single)
        Dim jj As [Delegate] = CType(qq.f3, [Delegate])
        CType(qq.f3, [Delegate]).DynamicInvoke(3, 4, 5)
        ' Dim a = CType(AddressOf qq.f1, [Delegate])

        '  Dim bbb As del1 = AddressOf qq.f1

        'nn = qq.f1.

        'Dim jj As System.MulticastDelegate = AddressOf qq.f1
        ' hh.Add("zz", AddressOf qq.f1)

        Console.WriteLine(hh("rr"))
        Dim c1 As New cl(2)
        Dim f1 As g = AddressOf c1.getx
        Dim targ0 = f1.Target
        Console.WriteLine(c1 Is targ0)
        Console.WriteLine(f1())
        f1 = AddressOf h
        Dim m = f1.Method
        Dim targ = f1.Target
        Console.WriteLine(f1.GetType())
        Dim type As Type = f1.GetType()
        Console.WriteLine(f1())
        Console.ReadLine()

    End Sub
    Dim hash As New Hashtable
    Dim hashg As New Dictionary(Of Integer, String)
    Dim a(10) As Integer

    Delegate Function handlerFunc(ByVal path As String, ByVal byName As Boolean) As Integer

    Dim k As handlerFunc = Function(path, byname)
                               Return 1
                           End Function

    Sub Main2()
        Dim ticks0 As Long = #1/1/1970#.Ticks
        Dim ticks1 As Long = Date.UtcNow.Ticks
        Dim dif As Long = ticks1 - ticks0
        Dim ddif As Double = dif
        Console.WriteLine((ticks1 - ticks0) / 10000)
        Dim dddd As Double = 0.01
        Console.WriteLine(dddd)
        Console.WriteLine(dddd.ToString())
        Console.WriteLine(dddd.ToString(System.Globalization.CultureInfo.InvariantCulture))
        Dim date2 As Date = Date.UtcNow
        Dim date3 As Date = Date.Now
        Console.WriteLine(date2.Ticks)
        Console.WriteLine(date3.Ticks)
        'Dim l6 As Long
        Dim date1 As Date = Date.UtcNow
        'l6 = CLng(date1)
        Console.WriteLine(TypeOf k Is IEnumerable)
        hash.Add(2, "w"c)
        Dim u = hash.Item(2)
        Console.WriteLine(IsReference(u))
        Console.WriteLine(TypeOf u Is Object)
        Dim s2 = "abcd"
        Console.WriteLine(s2.Length)
        Console.WriteLine(s2(1))
        Console.WriteLine(1 Or 2)
        Dim i1 = 2
        Dim obj1 As Object = New Object()
        Dim t1 = obj1.GetType()
        Console.WriteLine(obj1.GetType())
        Console.WriteLine(IsReference(obj1))
        obj1 = CType(i1, Object)
        Console.WriteLine(obj1.GetType())
        Console.WriteLine(IsReference(obj1))
        Dim s1 As String = "hggjk"
        obj1 = CType(s1, Object)
        Console.WriteLine(obj1.GetType())
        Console.WriteLine(IsReference(obj1))

        Dim t = TryCast(a, IEnumerable)

        If TypeOf a Is IEnumerable Then
            Console.WriteLine("IEnumerable")
        End If
        hash.Add(2, "ww")
        hash.Add(3, "dd")
        Dim t2 = TryCast(hash, IEnumerable)
        Dim e2 = t2.GetEnumerator()
        e2.MoveNext()
        Dim cur2 = e2.Current
        Dim cur21 = CType(e2.Current, DictionaryEntry)
        If TypeOf (cur2) Is DictionaryEntry Then
            Console.WriteLine("DictionaryEntry")
        End If
        Dim cur22 As DictionaryEntry = cur2
        Console.WriteLine("{0}:{1}", cur22.Key, cur22.Value)
        Dim c2 As DictionaryEntry = e2.Current

        e2.MoveNext()
        '        Dim cur2 = TryCast(e2.Current, DictionaryEntry)
        '        Console.WriteLine(cur2.

        If TypeOf hash Is IDictionary Then
            Console.WriteLine("IDictionary")
        End If
        Dim d = TryCast(hash, IDictionary)
        Console.WriteLine(d)
        Dim e = hash.GetEnumerator()
        While e.MoveNext()
            Console.WriteLine("{0}:{1}", e.Key, e.Value)
        End While

        hashg.Add(2, "ww")
        hashg.Add(3, "dd")
        If TypeOf hashg Is IDictionary Then
            Console.WriteLine("IDictionary")
        End If
        Dim dg = TryCast(hashg, IDictionary)
        Console.WriteLine(dg)

        Dim eg = hash.GetEnumerator()
        While eg.MoveNext()
            Console.WriteLine("{0}:{1}", eg.Key, eg.Value)
        End While

        Console.ReadLine()
    End Sub

End Module
