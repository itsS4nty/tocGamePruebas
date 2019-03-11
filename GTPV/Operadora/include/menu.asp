<!-- #include virtual="/Facturacion/include/database.asp" -->
<!-- #include virtual="/Facturacion/include/tablas.asp" -->

<script>
var contando 	= false;
var timerMenu 	= -1;

var popMenu = window.createPopup ( );

function showMenu ( n, t )
	{
	var l = 0;

	for(var i=t.parentElement.parentElement.children.length-1;i>=0;i--)
		{
		l += t.parentElement.parentElement.children[i].clientWidth;
		if(t.parentElement.parentElement.children[i].children[0])
			if(t.innerText == t.parentElement.parentElement.children[i].children[0].innerText)
				break;
		}

	l = tablaCabezera.clientWidth - l;
   	var popBody = popMenu.document.body;
	var code ='<table cellspacing="1" border="0" bgcolor="#<%=fColor5%>" width="0" onselectstart="return false;">';

	for(i=0;i<popMenuArray[n].length;i++)
		{
		if(popMenuArray[n][i][0])
			{
			code += '<tr><td nowrap height="14" bgcolor="#<%=fColor1%>" style="cursor:hand;color:#ffffff;font:xx-small Verdana;" '
			code += 'onmouseover="parent.roll(this);" onmouseout="parent.res(this);" onclick="parent.goMenu(\'';
			code += popMenuArray[n][i][1] + '\');">' + popMenuArray[n][i][0] + '</td></tr>';
			}
		}

	code += '</table>';

    popBody.innerHTML = code;
	popBody.onmouseout = new Function("timerMenu=200;if(!contando)counterMenu();");
	popBody.onmouseover = new Function("timerMenu=-1");
   	popMenu.show(0,0,0,0,document.body);
   	popMenu.show(l,65 - document.body.scrollTop,popBody.children[0].clientWidth,popBody.children[0].clientHeight,document.body);
	popMenuvisible = true;
	}

var mainFrame = getFrame ( top, "main" );
function goMenu ( p )
	{
	mainFrame.location = p;
	}

function hideMenu ( )
	{
	contando = false;
	timerMenu = -1;
	popMenu.hide();
	popMenuvisible = false;
	}

function counterMenu ( )
	{
	contando = true;
	if(!timerMenu)hideMenu();
	else if(timerMenu>0)timerMenu--;
	setTimeout("counterMenu()",1);
	}

var popMenuArray = new Array();
function roll(t){t.style.color="#ff8800";}
function res(t){t.style.color="#ffffff";}

function Array3(a,b,c)
	{
	A = new Array(a);
	for(var i=0;i<a;i++)
		{
		A[i] = new Array(b);
		for(var j=0;j<b;j++)A[i][j] = new Array(c);
		}
	return A;
	}

var popMenuvisible = false;

function ObrirMenu(indexMenu,Obj,dir){
	var cond=document.getElementById(Obj.id+"_in");
	var ocults=document.getElementsByTagName("input")
	if (cond.value==1){
		for (i=0;i<ocults.length;i++){
			if (ocults[i].type=="hidden"){
				ocults[i].value=0;
			}
		}
		location=dir;
	}else{
		for (i=0;i<ocults.length;i++){
			if (ocults[i].type=="hidden"){
				ocults[i].value=0;
			}
		}
		cond.value=1;
		showMenu(indexMenu,Obj);
	}
}

<%
	if len(session("StructMenu")) = 0 then
		'Comprobamos el tipo de usuario
		Mn = ""
		set rsTipo		= rec ("SELECT valor FROM dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'TIPUSTREBALLADOR' ")
		if (not rsTipo.eof) then tipo = rsTipo("valor")
		if (tipo <> "") and ((tipo = "CONTABILITAT") or (tipo = "GERENT") or (tipo = "GERENT_2")) then
			set rsMenus 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu IS NOT NULL AND Visible = 1 ORDER BY Ordre")
			set rsMenusNum 	= rec ("SELECT count(*) as num FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu IS NOT NULL AND Visible = 1")
		elseif (tipo = "GESTOR DE PRODUCTE") then
			set rsMenus 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu = 'GESTIO' AND Visible = 1 ORDER BY Ordre")
			set rsMenusNum 	= rec ("SELECT count(*) as num FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu = 'GESTIO' AND Visible = 1")
		elseif (tipo = "ADMINISTRACIO") then
			set rsMenus 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu <> 'RESULTATS' AND Visible = 1 ORDER BY Ordre")
			set rsMenusNum 	= rec ("SELECT count(*) as num FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu <> 'RESULTATS' AND Visible = 1")
		elseif (tipo = "SANITARIO") then
			set rsMenus 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu in ('GESTIO','APPCC') AND Visible = 1 ORDER BY Ordre")
			set rsMenusNum 	= rec ("SELECT count(*) as num FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu in ('GESTIO','APPCC') AND Visible = 1")
		else
			set rsMenus 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu <> 'RESULTATS' AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU') ORDER BY Ordre")
			set rsMenusNum 	= rec ("SELECT count(*) as num FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu <> 'RESULTATS' AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU')")
		end if

		nMenus			= cInt(rsMenusNum("num"))
		Mn = Mn & "var nMenus			= " & nMenus & ";"
		Mn = Mn & "var popMenuArray 	= new Array3( nMenus, 14, 2);"
		index 	= 0

		while not rsMenus.eof
			indexSub	= 0
			menu		= rsMenus("SubMenu")
			set rsSubMenus	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = '" & menu & "' AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & "AND nom = 'MENU') ORDER BY Ordre")

			while not rsSubMenus.eof
				menu		= rsSubMenus("MenuText")
				url			= ROOTFORN & rsSubMenus("Url")
				tipo		= "MENU_" & ucase(rsSubMenus("Menu"))
				textoMenu	= Dic(menu)  ' tradTexto("CA", tipo, menu)
				Mn = Mn & "popMenuArray[" & index & "][" & indexSub & "][0] = '" & textoMenu & "';"
				Mn = Mn & "popMenuArray[" & index & "][" & indexSub & "][1] = '" & url & "';"
				indexSub = indexSub + 1
				rsSubMenus.MoveNext()
			wend

			index = index + 1
			rsMenus.MoveNext()
		wend

		rsSubMenus.Close()
		rsMenus.Close()
		session("StructMenu") = Mn
	end if
	response.write session("StructMenu")
	%>

</script>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
	<tr>
	<%
	function fornMenu ( )

		'COMPROBAMOS SI EXISTE UNA ESTRUCTURA DE MENUS, SI NO EXISTE LA GENERAMOS CON LOS VALORES DE LA BD
		if len(session("topMenu")) = 0 then
			testMenuTable()

			set rsTipo		= rec ("SELECT valor FROM dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'TIPUSTREBALLADOR' ")
	 		if (not rsTipo.eof) then tipo = rsTipo("valor")

			if (tipo <> "") and ((tipo = "CONTABILITAT") or (tipo = "GERENT") or (tipo = "GERENT_2")) then
				set rsMenu 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu IS NOT NULL AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU') ORDER BY Ordre")
			elseif (tipo = "GESTOR DE PRODUCTE") then
				set rsMenu 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu = 'GESTIO' AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU') ORDER BY Ordre")
			elseif (tipo = "ADMINISTRACIO") then
				set rsMenu 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu <> 'RESULTATS' AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU') ORDER BY Ordre")
			elseif (tipo = "SANITARIO") then
				set rsMenu 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu IN ('GESTIO','APPCC') AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU') ORDER BY Ordre")
			else
				set rsMenu 	= rec ("SELECT * FROM " & tablaMenus ( ) & " WHERE Menu = 'ELFORN' AND SubMenu <> 'RESULTATS' AND Visible = 1 AND IdMenu NOT IN (select valor from dependentesextes WHERE id =" & session ( "Usuari_Codi" ) & " AND nom = 'MENU') ORDER BY Ordre")
			end if

			indexMenu	= 0
			top 		= ""

			while not rsMenu.Eof
				top 		= top & "<td nowrap class=""va""><a id="""&dic(rsMenu("MenuText"))&""" class=""menuopt"" style=""cursor:pointer;"" target=""main"" onclick=""ObrirMenu(" & indexMenu & ",this,'"&ROOTFORN & rsMenu("url")&"')"" ><input type=""hidden"" id="""&dic(rsMenu("MenuText"))&"_in"" value=""0""/>" & dic(rsMenu("MenuText")) & " </a>| </td>"
				indexMenu 	= indexMenu + 1
				rsMenu.MoveNext()
			wend

			rsMenu.Close()
			session("topMenu") = top
		end if

		response.write session("topMenu")
	end function
	%>
	</tr>
</table>