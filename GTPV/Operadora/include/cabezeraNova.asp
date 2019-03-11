<%

if Session("UsuariLogat")="Si" then

if not exists("constantsclient") then
	rec "create table ConstantsClient (Codi numeric(18, 0) NULL,Variable nvarchar(255) NULL,Valor nvarchar(255) NULL) ON PRIMARY"
end if

%>

<script>

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
	wDrv = window.open ( "<%=ROOTFORN%>popup/drivers.asp", "drivers", "width=400,height=400,top="+((screen.height-400)/2)+",left="+((screen.width-400)/2) );
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

<%
if llCom or Fcon then
%>

	var clients = new Array ();
<%
	set RsCli = rec("select c.Codi as Codi ,c.Nom As Nom ,isnull(o.valor,'') as Tip from clients c left join constantsclient o on c.codi = o.codi and o.variable = 'Grup_client'  order by Nom")
	j = 0
	while not RsCli.eof
%>

	clients[<%=j%>] = new Array();
 	clients[<%=j%>][0] = "<%=RsCli("codi")%>";
 	clients[<%=j%>][1] = "<%=Replace(RsCli("Nom"), """", "'")%>";
 	clients[<%=j%>][2] = "<%=Replace(RsCli("Tip"), """", "'")%>";

<%
	j = j + 1
	RsCli.movenext
wend
RsCli.close
%>

function cargarClientes ( )
	{
	selectCli     = document.comanda.cliente;
	while (selectCli.length > 0){selectCli.options[0] = null;}
	var gc_index = document.comanda.Grup_client.selectedIndex;
	//alert (document.form1.Per_Facturacio.options[fact_index].value);
	//document.write(fact_index);
	//document.write(document.form1.Per_Facturacio.options[fact_index].value + 'hay o no hay?');
		for (var i = 0; i<clients.length; i++)
			{
			if (document.comanda.Grup_client.options[gc_index].value == '') {
				var cli = new Option(clients[i][1],clients[i][0]);
				selectCli.options[selectCli.length]=cli;
			}
			else if (document.comanda.Grup_client.options[gc_index].value == clients[i][2]){
				var cli = new Option(clients[i][1],clients[i][0]);
				selectCli.options[selectCli.length]=cli;
			}
			}
	}

function init()
	{
	cargarClientes(0);
	}
<%
end if
%>

</script>
<div align="center">
<center>
<body <%if(session("Usuari_Nom")="Anonim")then%>onload="javascript:document.f.user.focus();" <%elseif llCom or Fcon then%>onload="init();"<%end if%>>
<table border  = 0 bordercolor="#F8F5B6" cellPadding="0" cellSpacing="0" width="100%" id="tablaCabezera">
 <tr>
  <td class="bgtitcentro">
   <table border  = 0 cellPadding="0" cellSpacing="0" width="100%">
    <tbody>
     <tr>
      <td rowSpan="2" width="200"><img width="200" height="60" onclick="location='<%=ROOTFORN%>';" class="mano" alt="<%=session("Usuari_Empresa_Nom")%>" src="<%=getLogo(0,"")%>"></td>
      <td>
       <table border  = 0 cellpadding="0" cellspacing="0" width="100%">
		<tr>
		 <td width="50">&nbsp;</td>
	     <td ALIGN="center" VALIGN="bottom">
<%
if nAlb then destino = request.item("destino")
if llCom or fCon or nAlb then
	if eval(session("fechaComandes"))=0 then session("fechaComandes")=dateAdd("d",1,now)
	if session("fechaComandes")="" then session("fechaComandes")=dateAdd("d",1,now)
	ff = session("fechaComandes")
%>
		  <table border  = 0 class="bgtitcentro">
	       <tr>
<%	if llCom or nAlb then%>
	        <td>Dia</td>
	        <td><%=inputCalendar(formatdatetime(ff,2),"fecha")%></td>
<%	elseif fCon then%>
	        <td></td>
	        <td>Clients:</td><%
	else
		        %><td></td><%
	end if

	if llCom or Fcon then
%>
			<td></td>
			<td>Grup</td>
  <td>
   <select style="width:150;" name="Grup_client" size="1" class="txt" onchange="cargarClientes()">
   	<option value="" <%if session("GrupComandes")="" then%>selected<%end if%>>Tots</option>
<%
	sqlgrupclient = "select distinct valor from constantsclient where variable like 'Grup_client' order by valor "
	set Rs = rec(sqlgrupclient)
	while not rs.eof
%>
		<option value="<%=rs("valor")%>"<%if session("GrupComandes")=rs("valor") then%>selected<%end if%>><%=rs("valor")%></option>
<%
		rs.movenext
	wend
%>
   </select>
	        <td>Client</td>
	        <td><select style="width:200" name="cliente" style="width:200;">
<%		if fCon then%>
	          <option value="-1">[TOTS]</option>
<%
		end if
		'set rs = rec("select codi,nom from clients order by nom")
		'while not rs.eof
%>

<%
			'rs.movenext
		'wend
%>
	        </select>
			 </td>
<td>
<%if llCom or Fcon then %>
  <%=submitCalendarForm("VER","Ver","")%>
<%else%>
  &nbsp;&nbsp;&nbsp;
<%end if%>
</td>

<%	elseif nAlb then%>
	         <td>&nbsp;&nbsp;&nbsp;</td>
	         <td>Formato:</td>
	         <td>
	          <select name="destino" onchange="parent.consMain.location='consMain.asp';">
	           	<option value="PANT"<%if destino="PANT" then%> selected<%end if%>>Pantalla</option>
			<option value="SP"<%if destino="SP" then%> selected<%end if%>>Formato SP</option>
	           	<option value="A4"<%if destino="A4" then%> selected<%end if%>>Impresora A4</option>
	           	<option value="TER"<%if destino="TER" then%> selected<%end if%>>Impresora Termica</option>
	     	   	<option value="MAT"<%if destino="MAT" then%> selected<%end if%>>Impresora Matricial</option>
	           	<option value="ASC"<%if destino="ASC" then%> selected<%end if%>>ASCII</option>
	          </select>&nbsp;
	         </td>
	         <td><input type="Button" onclick="totServit();" value="Tot Servit">&nbsp;</td>
<%
	end if
%>
					</tr>
	       </table>
<%	else%>
	       &nbsp;
<%	end if%>
		  </td>
	      <td align="right" valign="bottom" width="150">
<%	if session("Usuari_Nom") <> "Anonim" then%>
	       <table border  = 0>
			<tr>
			 <td><img src="<%=ICOSFORN%>noFumar.gif" alt="Cartells llei anti-tabac" border="0" class="mano" onclick="window.open('/facturacion/horitretol.pdf');"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td><img src="<%=ICOSFORN%>carpeta.gif" width="18" height="18" alt="Els Meus Documents" border="0" class="mano" onclick="myDocuments();"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td><img src="<%=ICOSFORN%>llaveIng.gif" width="18" height="18" alt="Drivers" border="0" class="mano" onclick="drivers();"></td>
			 <td>&nbsp;&nbsp;</td>
			 <td><img src="<%=ICOSFORN%>martillo.gif" width="20" height="18" alt="Equip tècnic" border="0" class="mano" onclick="tecnic();"></td>
			 <td>&nbsp;&nbsp;</td>
<%
		nous = 0
		set RsNous = rec("SELECT count(TimeStamp) as num FROM Missatges WHERE (Desti LIKE '%Direcció%') and DataRebut is null")
		if not RsNous.Eof then nous = RsNous("num")
%>
			 <td><img src="<%=ICOSFORN%>sobre<%if nous>0 then%>2<%end if%>.gif" width="18" height="18" border="0" alt="<%=iif(nous>0,"Nou Missatge","Missatjeria")%>" onclick="mensajeria();" class="mano"></td>
			 <td>&nbsp;&nbsp;</td>
<%
		' AHORA NO HAY FOROS
		Set RsForum = recHit("select Foro,UltimaVisita from Foro_Users where Usuario = '" & Session("Usuari_Nom") & "' order by Foro")
		if not RsForum.EOF then
			Set RsData = recHit("select * from foro_datos where fecha > (Select max(UltimaVisita) as UltimaVisita From foro_users where usuario = '" & session("Usuari_Nom") & "')")
%>
			 <td><img src="<%=ICOSFORN%>libro<%if rsdata.eof then%>2<%end if%>.gif" alt="<%=iif(rsdata.eof,"Forum/Chat ElForn.net","Nous comentaris!!")%>" class="mano" onclick="forums('<%=rsForum("Foro")%>');"></td>
			 <td>&nbsp;&nbsp;</td>
<%
	    end if
		' AHORA NO HAY ADMINISTRADOR DE FOROS
		if session("Usuari_Empresa")="Pa Natural" and Session("Usuari_Nom")="" then
%>
			 <td><img alt="Forum/Chat ElForn.net" src="<%=ICOSFORN%>libro.gif" class="mano" onclick="forums('Soporte');"></td>
			 <td>&nbsp;&nbsp;</td>
<%		end if%>
             <td><img src="<%=ICOSFORN%>pc.gif" border="0" width="18" height="18" alt="Dades" class="mano" onclick="estadoEnvios();"></td>
			</tr>
		   </table>
<%	end if%>
	      </td>
		 </tr>
		</table>
       </td>
      </tr>
<td>

<Table border  = 0 cellPadding="0" cellSpacing="0" width="100%" height ="25">
<%if llCom or Fcon then
 if session("OrdreComandes")= "" then session("OrdreComandes")="Familia"%>
 <td style="width:180" >Dia F <%=inputCalendar(formatdatetime(ff,2),"fechaF")%></td>
 <Td>Ordr. <select style="width:150;" name="Ordre" size="1" class="txt">
	   <option value="Familia" <%if session("OrdreComandes")="Familia"  then%>selected<%end if%>>Familia</option>
   	 <option value="Viatge"  <%if session("OrdreComandes")="Viatge"   then%>selected<%end if%>>Viatge</option>
   	 <option value="Equip"   <%if session("OrdreComandes")="Equip"    then%>selected<%end if%>>Equip</option>
   	 <option value="Producte"<%if session("OrdreComandes")="Producte" then%>selected<%end if%>>Producte</option>
   	 <option value="Demanat" <%if session("OrdreComandes")="Demanat"  then%>selected<%end if%>>Demanat</option>
   	 <option value="Servit" <%if session("OrdreComandes")="Servit"  then%>selected<%end if%>>Servit</option>
   	 <option value="Tornat" <%if session("OrdreComandes")="Tornat"  then%>selected<%end if%>>Tornat</option>
   	 <option value="Tipus" <%if session("OrdreComandes")="Tipus"  then%>selected<%end if%>>Tipus</option>
   	 <option value="Modificat" <%if session("OrdreComandes")="Modificat"  then%>selected<%end if%>>Modificat</option>
   </select>
<% else %>
<td height ="25"><B><%=Session("Usuari_Empresa_Descripcio")%></Td></b>
<td height ="25"><B> <%=formatdatetime(now,1)%></Td></b>
<% end if %>

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
               <td class="fecha" width="30%">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="<%=ROOTFORN%>log.asp?modo=LOGOUT" target="_parent" class="menuopt"><b>[ Log Out ]</b> Usuari: <%=Session("Usuari_Nom")%></a></td>
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
<%	end if%>

<!-- #include virtual="/Facturacion/include/menu.asp" -->
