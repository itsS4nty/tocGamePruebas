<!-- #include virtual="/Facturacion/include/suggest.asp" -->

<%
	if Session("UsuariLogat")="" then response.end 
%>
	<script>
		function TriatCliente()
		{
			document.comanda.submit ( );
			canviDeClient();
		}
	
		function init()
		{
		}
		
		function Resalta(el)
		{
			el.style.backgroundColor = "#FFFFFF";
			el.style.fontWeight = "bold";
		}
		
		function DesResalta(el)
		{
			el.style.backgroundColor = "";
			el.style.fontWeight = "";
		}

<% 	if llCom or Fcon then %>
 /*
 AJAX Functions BEGIN============================
 */
		function createRequestObject() 
		{
			var ro;
			var browser = navigator.appName;
			if(browser == "Microsoft Internet Explorer")
			{
				ro = new ActiveXObject("Microsoft.XMLHTTP");
			}
			else
			{
				ro = new XMLHttpRequest();
			}
			return ro;
		}
		
		var http;

		function handleResponse() 
		{
			if (http.readyState == 4) 
			{
				var v = http.responseText.split(",#,");
				document.getElementById('InfoClient').innerHTML = v[0];
				document.getElementById('ClientComentrari').value = ''
				if (v[1]) document.getElementById('ClientComentrari').value = v[1];
				ComentariCarrega();
			}	
		}

		function alertam() 
		{
			if (http.readyState == 4) alert(http.responseText);
		}

/*
 AJAX Functions END============================
*/

		function ComentariGuarda() {}

		function ComentariCarrega() 
		{
			if(document.getElementById('ClientComentrari').value=='') document.getElementById('ClientComentrari').value='Ok.';
		}

		function CargaClientsAmbComanda() 
		{
			http = createRequestObject();
			http.open('get', '/Facturacion/include/LlistaClientsAmbComanda.asp?Data='+document.comanda.fecha.value+'&hash=' + Math.random());
			http.onreadystatechange = handleResponseCargaClients;
			http.send(null);
			alert('demanat');
		}
	
		function canviDeClient() 
		{
			http = createRequestObject();
			http.open('get', '/Facturacion/include/informam.asp?codi='+document.getElementById('Cliente').value+'&Ordre='+document.getElementById('OrdreGraella').value+'&Data='+document.comanda.fecha.value+'&hash=' + Math.random());
			http.onreadystatechange = handleResponse;
			http.send(null);
		}
	
		function canviDeComentari() 
		{
			http = createRequestObject();
			http.open('get', '/Facturacion/include/GuardaComentariClientData.asp?Client='+document.getElementById('Cliente').value+'&Data='+document.comanda.fecha.value+'&Comentari='+document.getElementById('ClientComentrari').value+'&hash=' + Math.random());
			http.send(null);
		}

	
<% 	end if %>

		var mainFrame = getFrame ( top, "main" );

		var wTec;
		function tecnic ( )
		{
			wTec = window.open ( "<%=ROOTFORN%>popup/tecnic.asp", "tecnic", "width=400,height=400,top="+((screen.height-400)/2)+",left="+((screen.width-400)/2) );
			wTec.focus ( );
		}

		var wDrv;
		function drivers ( )
		{
			wDrv = window.open ( "<%=ROOTFORN%>popup/drivers.asp", "drivers", "width=400,height=600,top="+((screen.height-600)/2)+",left="+((screen.width-400)/2) );
			wDrv.focus ( );
		}

		var wForum;
		function forums ( foro )
		{
			wForum = window.open ( "<%=ROOTFORN%>forums.asp?ModoActual=0&Foro=" + foro, "forum","width=643,height=475,status=yes,top="+((screen.height-475)/2)+",left="+((screen.width-643)/2) );
			wForum.focus ( );
		}

		function mensajeria ( )
		{
			window.open ( "<%=ROOTFORN%>missatges/in.asp", "main", "" );
		}

		function goHome ( )
		{
			window.open ( "<%=ROOTFORN%><%=Session("Usuari_PaginaInici")%>", "main", "" );
		}

		function myDocuments ( )
		{
			window.open ( "<%=ROOTFORN%>file/?w=" + screen.width, "main", "" );
		}

		function estadoEnvios ( )
		{
			window.open ( "<%=ROOTFORN%>dades/estadoEnvios.asp?Reset=Si", "main", "" );
		}
	</script>
	
	<div align="center">
		<center>
			<body <%if(session("Usuari_Nom")="Anonim")then%>onload="javascript:document.f.user.focus();" <%elseif llCom or Fcon then%>onload="init();"<%end if%>>
<% 	if llCom then %>
			<script src="<%=SCRIPTS%>toolTips/wz_tooltip.js"></script>			
<%	end if %>
				<table border="0" bordercolor="#F8F5B6" cellPadding="0" cellSpacing="0" width="100%" id="tablaCabezera">
					<tr>
						<td class="bgtitcentro">
							<table border="0" cellPadding="0" cellSpacing="0" width="100%">
							<tbody>
								<tr>
									<td rowSpan="2" width="200"><img width="200" height="60" onclick="location='<%=ROOTFORN%>';" class="mano" alt="<%=session("Usuari_Empresa_Nom")%>" src="<%=getLogo(0,"")%>"></td>
									<td>
										<table border="0" cellpadding="0" cellspacing="0" width="100%">
											<tr>
												<td ALIGN="Left" VALIGN="bottom">
<%
	if nAlb then destino = request.item("destino")
	if llCom or fCon or nAlb then
		if eval(session("fechaComandes"))=0 then session("fechaComandes")=dateAdd("d",1,now)
		if session("fechaComandes")="" then session("fechaComandes")=dateAdd("d",1,now)
		ff = session("fechaComandes")
	if session("OrdreComandes")= "" then session("OrdreComandes")="Familia"
%>
													<table border="0" class="bgtitcentro">
														<tr>
															<Td nowrap>&nbsp;<%=Dic("Ordr.")%>
																<select id="OrdreGraella" style="width:100"   name="Ordre" size="1" class="txt">
																	<option value="Familia" <%if session("OrdreComandes")="Familia"  then%>selected<%end if%>><%=Dic("Familia")%></option>
																	<option value="Viatge"  <%if session("OrdreComandes")="Viatge"   then%>selected<%end if%>><%=Dic("Viatge")%></option>
																	<option value="Equip"   <%if session("OrdreComandes")="Equip"    then%>selected<%end if%>><%=Dic("Equip")%></option>
																	<option value="Producte"<%if session("OrdreComandes")="Producte" then%>selected<%end if%>><%=Dic("Producte")%></option>
																	<option value="Demanat" <%if session("OrdreComandes")="Demanat"  then%>selected<%end if%>><%=Dic("Demanat")%></option>
																	<option value="Servit" <%if session("OrdreComandes")="Servit"  then%>selected<%end if%>><%=Dic("Servit")%></option>
																	<option value="Tornat" <%if session("OrdreComandes")="Tornat"  then%>selected<%end if%>><%=Dic("Tornat")%></option>
																	<option value="Tipus" <%if session("OrdreComandes")="Tipus"  then%>selected<%end if%>><%=Dic("Tipus")%></option>
																	<option value="Modificat" <%if session("OrdreComandes")="Modificat"  then%>selected<%end if%>><%=Dic("Modificat")%></option>
																	<option value="Comentari" <%if session("OrdreComandes")="Comentari"  then%>selected<%end if%>><%=Dic("Albara")%></option>
																</select>
															</Td>
<%	if llCom or nAlb then%>
															<td><%=inputCalendarResumit(formatdatetime(ff,2),"fecha")%></td>
<%	elseif fCon then%>
															<td><%=Dic("Clients")%>:</td>
<%	end if
	if llCom or Fcon then
%>															<td>&nbsp;&nbsp;&nbsp;</td>
															<td><%=Dic("Client")%></td>
															<td>
<%=SeleccionCliente("Cliente","TriatCliente()")%>
<Input Type=Hidden name='elejido' value='" & Codi & "'>
															</td>
															<td>&nbsp;</td>
															<td>
<%		if llCom or Fcon then %>
																<%=submitCalendarForm("VER","Ver","")%>
<%		else	%>

																&nbsp;&nbsp;&nbsp;
<%		end if	%>
															</td>

<%	elseif nAlb then%>
															<td>&nbsp;&nbsp;&nbsp;</td>
															<td><%=Dic("Formato")%>:</td>
															<td>
																<select name="destino" onchange="parent.consMain.location='consMain.asp';">
																	<option value="PANT"<%if destino="PANT" then%> selected<%end if%>>Pantalla</option>
																	<option value="SP"<%if destino="SP" then%> selected<%end if%>>Formato SP</option>
																	<option value="A4"<%if destino="A4" then%> selected<%end if%>>Impresora A4</option>
																	<option value="TER"<%if destino="TER" then%> selected<%end if%>>Impresora Termica</option>
<% 		if ucase ( session ( "Usuari_Empresa_Nom" ) ) = "FORN RIBERA" then %>
																	<option value="MAT_RIPE"<%if destino="MAT_RIPE" then%> selected<%end if%>>Impresora Matricial</option>
<% 		else %>
																	<option value="MAT"<%if destino="MAT" then%> selected<%end if%>>Impresora Matricial</option>
<% 		end if %>
																	<option value="ASC"<%if destino="ASC" then%> selected<%end if%>>ASCII</option>
																</select>&nbsp;
															</td>
															<td><input type="Button" onclick="totServit();" value="<%=Dic("Tot Servit")%>">&nbsp;</td>
<%
	end if
%>
														</tr>
													</table>
<%	else	%>
	       &nbsp;
<%	end if%>
		  </td>
	      <td align="left valign="bottom" width="200">
<%	if session("Usuari_Nom") <> "Anonim" then%>
	       <table border="0" cellpadding="0" cellspacing="0">
			<tr>
			 <td><img src="<%=ICOSFORN%>noFumar.gif" alt="<%=Dic("Cartells llei anti-tabac")%>" border="0" class="mano" onclick="window.open('/facturacion/horitretol.pdf');"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td><img src="<%=ICOSFORN%>carpeta.gif" width="18" height="18" alt="<%=Dic("Els Meus Documents")%>" border="0" class="mano" onclick="myDocuments();"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td><img src="<%=ICOSFORN%>llaveIng.gif" width="18" height="18" alt="Drivers" border="0" class="mano" onclick="drivers();"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td><img src="<%=ICOSFORN%>Interrogante.gif" alt="<%=Dic("Ajuda")%>" border="0" class="mano" onclick="window.open('http://86.109.98.189/');"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td></td>
			 <td>&nbsp;&nbsp;</td>
<%
		nous = 0
		set RsNous = rec("SELECT count(TimeStamp) as num FROM Missatges WHERE (Desti LIKE '%Direcció%') and DataRebut is null")
		if not RsNous.Eof then nous = RsNous("num")
%>
			 <td><img src="<%=ICOSFORN%>sobre<%if nous>0 then%>2<%end if%>.gif" width="18" height="18" border="0" alt="<%=iif(nous>0,Dic("Nou Missatge"),Dic("Missatjeria"))%>" onclick="mensajeria();" class="mano"></td>
			 <td>&nbsp;&nbsp;</td>
<%
		' AHORA NO HAY FOROS
		Set RsForum = recHit("select Foro,UltimaVisita from Foro_Users where Usuario = '" & Session("Usuari_Nom") & "' order by Foro")
		if not RsForum.EOF then
			Set RsData = recHit("select * from foro_datos where fecha > (Select max(UltimaVisita) as UltimaVisita From foro_users where usuario = '" & session("Usuari_Nom") & "')")
%>			 <td><img src="<%=ICOSFORN%>libro<%if rsdata.eof then%>2<%end if%>.gif" alt="<%=iif(rsdata.eof,"Forum/Chat ElForn.net","Nous comentaris!!")%>" class="mano" onclick="forums('<%=rsForum("Foro")%>');"></td>
			 <td>&nbsp;&nbsp;</td>
<%	    end if%>
            <td><img src="<%=ICOSFORN%>pc.gif" border="0" width="18" height="18" alt="<%=Dic("Dades")%>" class="mano" onclick="estadoEnvios();"></td>
			</tr>
		   </table>
<%	end if%>
	      </td>
		 </tr>
		</table>
       </td>
      </tr>
<td>
<Table border  = 0 cellPadding="0" cellSpacing="0" width="100%" height = 25 >
<%if llCom or Fcon then%>
<Td width="40%" align="left" >&nbsp;<B><%=Dic("Nota.")%></B>
	<Input id="ClientComentrari"  onblur="canviDeComentari()" onfocus="ComentariCarrega(this)"  Type="Text" style="width:200;" name="ClientComentrari" class="txt" >
</Td>
<Td width="100%" id="InfoClient" align="left" >.</Td>
<%	end if%>
        <table border  = 0 cellPadding="0" cellSpacing="0" width="100%">
         <tbody>
          <tr>
           <td height="1"></td>
           <td class="bgtitmenu" height="1"><img height="1" width="1"></td>
		  </tr>
          <tr>
           <td vAlign="bottom" width="1"><img src="<%=IMGSFORN%>es<%=session("Usuari_Estil")%>.gif" width="15" height="15"></td></td>
           <td class="bgmenu">
            <table border  = 0 cellPadding="0" cellSpacing="0" width="100%">
             <tbody>
              <tr>
               <td nowrap class="fecha" width="30%"><a href="<%=ROOTFORN%>log.asp?modo=LOGOUT" target="_parent" class="menuopt"><b>[ Log Out.]</b> Usuari: <%=Session("Usuari_Nom")%></a></td>
               <td align="right" class="fecha" width="70%" nowrap><%fornMenu%></td>
              </tr>
			 </tbody>
            </table>
	       </td>
          </tr>
         </tbody>
        </table>
       </td>
      </tr>
     </table>
    </td>
   </tr>
  </table>

<!-- #include virtual="/Facturacion/include/menu.asp" -->
