 <script>

  function selectionDialog ( que, t )
  	{
	t.value = window.showModalDialog("<%=ROOTFORN%>popup/selection.asp?que=" + que,"","dialogHeight:400px;dialogWidth:300px;center:yes;edge:raised;help:no;resizable:no;scroll:no;status:no;unadorned:yes;");
	}

 </script>

<%
function seleccionBTN ( byval txt, byval nom, byval val, byval cls )
	seleccionBTN = "<input type=""Button"" name=""btn" & nom & """ value=""" & txt & """ class=""" & cls & """ onclick=""selectionDialog('" & txt & "',this.form." & nom & ");"">"
	seleccionBTN = seleccionBTN & "<input type=""Hidden"" name=""" & nom & """ value=""" & val & """>"
end function
%>