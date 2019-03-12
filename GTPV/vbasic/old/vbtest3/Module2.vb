Imports System
Imports Microsoft.VisualBasic

' This class contains strings. It has a member method that
' accepts a multicast delegate as a parameter and calls it
Partial Class h1
    Public Sub g(ByVal d As Integer)
        Me.c = d
    End Sub
End Class
Class HoldsStrings

    ' The following line causes the compiler to generate
    ' a new delegate class named CheckAndPrintDelegate that
    ' inherits from System.MulticastDelegate.
    Delegate Function CheckAndPrintDelegate(ByVal str As String) As String
    ' An ArrayList that holds strings
    Private myStringArray As New System.Collections.ArrayList()

    Public Sub addstring(ByVal str As String)
        myStringArray.Add(str)
    End Sub 'addstring

    ' Iterate through the strings and invoke the method(s) that the delegate points to
    Public Function PrintAllQualified(ByVal myDelegate As CheckAndPrintDelegate) As String
        Dim str As String
        Dim ret As String = Nothing
        For Each str In myStringArray
            ret = myDelegate(str)
        Next str
        Return ret
    End Function 'PrintAllQualified

End Class     'end of class HoldsStrings

' This class contains a few sample methods
Class StringFuncs
    Public Shared i As Integer = 0
    ' This method prints a string that it is passed if the string starts with a vowel
    Public Shared Function ConStart(ByVal str As String)
        i += 1
        If Not (str.Chars(0) = "a"c Or str.Chars(0) = "e"c Or str.Chars(0) = "i"c Or str.Chars(0) = "o"c Or str.Chars(0) = "u"c) Then
            Console.WriteLine(str & i)
        End If
        Return "con" & i
    End Function 'ConStart

    ' This method prints a string that it is passed if the string starts with a consonant
    Public Shared Function VowelStart(ByVal str As String)
        If (str.Chars(0) = "a"c Or str.Chars(0) = "e"c Or str.Chars(0) = "i"c Or str.Chars(0) = "o"c Or str.Chars(0) = "u"c) Then
            Console.WriteLine(str & i)
        End If
        Return "vow" & i
    End Function 'VowelStart
End Class 'StringFuncs

' This class demonstrates using Delegates, including using the Remove and
' Combine methods to create and modify delegate combinations.
Class Test

    Public Shared Sub Main()
        ' Declare the HoldsStrings class and add some strings
        Dim myHoldsStrings As New HoldsStrings()
        myHoldsStrings.addstring("this")
        myHoldsStrings.addstring("is")
        myHoldsStrings.addstring("a")
        myHoldsStrings.addstring("multicast")
        myHoldsStrings.addstring("delegate")
        myHoldsStrings.addstring("example")

        ' Create two delegates individually using different methods
        Dim ConStartDel = New HoldsStrings.CheckAndPrintDelegate(AddressOf StringFuncs.ConStart)

        Dim VowStartDel As New HoldsStrings.CheckAndPrintDelegate(AddressOf StringFuncs.VowelStart)

        ' Demonstrate that MulticastDelegates may store only one delegate
        Dim DelegateList() As [Delegate]

        ' Returns an array of all delegates stored in the linked list of the
        ' MulticastDelegate. In these cases the lists will hold only one (Multicast) delegate
        DelegateList = ConStartDel.GetInvocationList()
        Console.WriteLine("ConStartDel contains " + DelegateList.Length.ToString() + " delegate(s).")

        DelegateList = VowStartDel.GetInvocationList()
        Console.WriteLine(("ConStartVow contains " + DelegateList.Length.ToString() + " delegate(s)."))

        ' Determine whether the delegates are System.Multicast delegates
        If TypeOf ConStartDel Is System.MulticastDelegate And TypeOf VowStartDel Is System.MulticastDelegate Then
            Console.WriteLine("ConStartDel and ConStartVow are System.MulticastDelegates")
        End If

        ' Run the two single delegates one after the other
        Console.WriteLine("Running ConStartDel delegate:")
        Console.WriteLine("aa: " & myHoldsStrings.PrintAllQualified(ConStartDel))
        Console.WriteLine("Running VowStartDel delegate:")
        Console.WriteLine("bb: " & myHoldsStrings.PrintAllQualified(VowStartDel))

        ' Create a new, empty MulticastDelegate
        Dim MultiDel As HoldsStrings.CheckAndPrintDelegate

        ' Delegate.Combine receives an unspecified number of MulticastDelegates as parameters
        MultiDel = CType([Delegate].Combine(ConStartDel, VowStartDel), HoldsStrings.CheckAndPrintDelegate)

        ' How many delegates is this delegate holding?
        DelegateList = MultiDel.GetInvocationList()
        Console.WriteLine((ControlChars.Cr + "MulitDel contains " + DelegateList.Length.ToString() + " delegates."))

        ' What happens when this mulitcast delegate is passed to PrintAllQualified
        Console.WriteLine("Running the multiple delegate that combined the first two")
        Console.WriteLine("cc: " & myHoldsStrings.PrintAllQualified(MultiDel))

        ' The Remove and Combine methods modify the multiple delegate
        MultiDel = CType([Delegate].Remove(MultiDel, VowStartDel), HoldsStrings.CheckAndPrintDelegate)
        MultiDel = CType([Delegate].Combine(MultiDel, ConStartDel), HoldsStrings.CheckAndPrintDelegate)

        ' Finally, pass the combined delegates to PrintAllQualified again
        Console.WriteLine(ControlChars.Cr + "Running the multiple delegate that contains two copies of ConStartDel:")
        Console.WriteLine("dd: " & myHoldsStrings.PrintAllQualified(MultiDel))

        Return
    End Sub 'end of main
End Class 'end of Test


