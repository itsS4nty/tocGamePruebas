<%
	tit      = "Buscar " & Dic(que) & ":"
	inp      = "text"
	name     = "txt"
	value    = txt
	action   = ROOT & "/include/buffBuscador.asp?que=" & que 
	position = "relative"
	target   = "bufferBuscador"

	if volver = "" then volver = "volver();"

	code = "<iframe name=""bufferBuscador"" frameborder=""0"" hspace=""0"" marginheight=""0"" marginwidth=""0"" scrolling=""No"" vspace=""0"" "
	code = code & "src=""" & ROOT & "/include/buffBuscador.asp?que=" & que & """ width=""260"" height=""" & session("h")-60 & """></iframe>"
%>

	<body onload="showKBD();" scroll="no">

		<table width="<%=session("w")%>" height="<%=session("h")-60%>" border="0">
			<tr>
				<td><!-- #include virtual="/Facturacion/include/teclado.asp" --></td>
				<td width="300" id="buffRow" rowspan="2" align="center" valign="top"><%=code%></td>
			</tr>
			<tr>
				<td height="300" valign="top" align="right">
					<img src="<%=IMGSREC%>cerrar.gif" width="54" height="54" border="0" hspace="100" vspace="10" <%=events(volver)%>>
					<%=scrollControl("document.bufferBuscador",650,400)%>
				</td>
			</tr>
		</table>
		
<!-- #include virtual="/Facturacion/include/scroll.asp" -->
		<script>

			var enviaTeclado = true;

			function retornarBusqueda(t)
			{
				if ( t != "" ) retornar(t);
				else
				{
					var f = document.teclado;
					tituloKBD.innerHTML = "<%=Dic("Nou " & que)%>:";
					document.scrollControlIMG.style.visibility = "hidden";
					buffRow.innerHTML = "";
					f.txt.value = "";
					f.target = "_self";
					f.action = "javascript:retornarBusqueda(document.teclado.txt.value);";
					//jsKBD.src = "js/teclado2.js";
					enviaTeclado = false;
					SI.style.visibility = "visible";
					NO.style.visibility = "visible";
					eNO = "buscaOtraVez()";
				}
			}

			function buscaOtraVez()
			{
				var f = document.teclado;
				tituloKBD.innerHTML = "<%=tit%>";
				document.scrollControlIMG.style.visibility = "visible";
				buffRow.innerHTML = "<%=change(code,"""","\""")%>";
				f.txt.value = "";
				f.target = "<%=target%>";
				f.action = "<%=action%>";
				//jsKBD.src = "js/teclado3.js";
				enviaTeclado = true;
				SI.style.visibility = "hidden";
				NO.style.visibility = "hidden";
				eNO = "";
				showKBD();
			}

		</script>

	</body>