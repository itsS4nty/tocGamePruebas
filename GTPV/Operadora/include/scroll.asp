<script>

 var winScrollUp = null;
 function scrollUp()
 	{
	if ( winScrollUp != null )
		{
		winScrollUp.scrollBy(0,-10);
		setTimeout("scrollUp()",1);
		}
	}

 var winScrollDn = null;
 function scrollDn()
 	{
	if ( winScrollDn != null )
		{
		winScrollDn.scrollBy(0,10);
		setTimeout("scrollDn()",1);
		}
	}

 function scrollUp2 ( w )
 	{
	w.scrollBy ( 0, -150 );
	}

 function scrollDn2 ( w )
 	{
	w.scrollBy ( 0, 150 );
	}

</script>

<%

function btnScrollUpLT ( byval w, byval x, byval y )
	btnScrollUpLT = "<img src=""" & IMGSREC & "scrollUp.gif"" width=""40"" height=""40"" border=""0"" "
	btnScrollUpLT = btnScrollUpLT & "style=""position:absolute;top:" & y & ";left:" & x & ";"" "
	btnScrollUpLT = btnScrollUpLT & "onClick=""winScrollDn=" & w & ".scrollBy(0,-80);"">"
end function

function btnScrollDnLT ( byval w, byval x, byval y )
	btnScrollDnLT = "<img src=""" & IMGSREC & "scrollDown.gif"" width=""40"" height=""40"" border=""0"" "
	btnScrollDnLT = btnScrollDnLT & "style=""position:absolute;top:" & y & ";left:" & x & ";"" "
	btnScrollDnLT = btnScrollDnLT & "onClick=""winScrollDn=" & w & ".scrollBy(0,80);"">"
end function

function btnScrollUp ( byval w )
	btnScrollUp = "<img src=""" & IMGSREC & "scrollUp.gif"" width=""40"" height=""40"" border=""0"" "
	btnScrollUp = btnScrollUp & "onClick=""winScrollDn=" & w & ".scrollBy(0,-80);"">"
end function

function btnScrollDn ( byval w )
	btnScrollDn = "<img src=""" & IMGSREC & "scrollDown.gif"" width=""40"" height=""40"" border=""0"" "
	btnScrollDn = btnScrollDn & "onClick=""winScrollDn=" & w & ".scrollBy(0,80);"">"
end function

function scrollControl ( byval w, byval x, byval y )
	scrollControl = "<img src=""" & IMGSREC & "scroll.gif"" width=""82"" height=""119"" border=""0"" "
	scrollControl = scrollControl & "style=""position:absolute;top:" & y & ";left:" & x & ";"" "
	scrollControl = scrollControl & "usemap=""#scrollMap"" name=""scrollControlIMG"">"
	scrollControl = scrollControl & "<map name=""scrollMap"">"
	scrollControl = scrollControl & "<area shape=""circle"" coords=""41,35,20"" nohref " & events ( "scrollUp2(" & w & ");") & ">"
	scrollControl = scrollControl & "<area shape=""circle"" coords=""41,84,20"" nohref " & events ( "scrollDn2(" & w & ");") & ">"
	scrollControl = scrollControl & "</map>"
end function

%>