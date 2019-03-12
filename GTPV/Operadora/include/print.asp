<%
function printTables(tit)
	printTables = "<input type=""Button"" class=""pri"" value=""Imprimir"" onclick=""printTables('" & tit & "')"">"
end function
%>

<script>
 var winPrint;

 function printTables(c)
 	{

	winPrint = window.open("<%=BLANK%>","winPrint","width=600,height=400,resizable=yes,scrollbars=yes");
	winPrint.document.title = c;
	winPrint.document.body.innerHTML = '<div id="capaPreparando" style="position:absolute;top:0;left:0;">' +
									   '<b><font face="verdana">Preparando página de impresión</font></b></div>' +
									   '<div id="capaImpresion" style="position:absolute;top:0;left:0;visibility:hidden;">' +
									   '<center><b><font face="Verdana" size="2" color="#000000">' +
									   c + '</font></b></center><br><br>' + document.body.innerHTML + '</div>';

	var t = winPrint.document.all.tags("TABLE");
	var tTR,tTD;

	for(var i=0;i<t.length;i++) //TABLE
		{
		t[i].border = 1;
		t[i].cellSpacing = 0;
		t[i].width = "100%";
		t[i].bgColor = "#FFFFFF";
		for(var j=0;j<t[i].children.length;j++) //THEAD,TBODY,TFOOT
			{
			t[i].children[j].bgColor = "#FFFFFF";
			for(var k=0;k<t[i].children[j].children.length;k++) //TR
				{
				tTR = t[i].children[j].children[k];
				tTR.bgColor = "#FFFFFF";
				for(var l=0;l<tTR.children.length;l++) //TD
					{
					tTD = tTR.children[l];
					tTD.bgColor = "#FFFFFF";
					tTD.innerHTML = '<font face="Verdana" size="1" color="#000000">' + tTD.innerHTML + '</font></td>';
					}
				}
			}
		}
	
	winPrint.document.body.innerHTML = winPrint.document.body.innerHTML.split("onmouseover").join("o");
	winPrint.document.body.innerHTML = winPrint.document.body.innerHTML.split("onmouseout").join("o");
	winPrint.capaPreparando.style.visibility = "hidden";
	winPrint.capaImpresion.style.visibility = "visible";
	if(confirm('Imprimir "' + c + '"?'))winPrint.print();
	if(!winPrint.closed)winPrint.focus();
	}

</script>