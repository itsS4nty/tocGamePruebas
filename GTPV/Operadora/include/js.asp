<%

if viaje<>"" then
	viajeDepurado = join(split(viaje,"&"),"{AMP}")
else
	viajeDepurado = ""
end if

function events(t)
	events = " onmousedown=""" & t & """"
end function

%>

<script>
function nuevoAjax()
	{
  	var xmlhttp=false;
  	try
		{
   			// Creación del objeto ajax para navegadores diferentes a Explorer
   			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  		} catch (e) {
   		// o bien
   		try {
     		// Creación del objet ajax para Explorer
     		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); } catch (E) {
     		xmlhttp = false;
   			}
  		}

  		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
   			xmlhttp = new XMLHttpRequest();
  		}
  		return xmlhttp;
	} 

 var indexAjax = 0;
 var ajax = new Array(50);
 
 var V = 'visible';
 var H = 'hidden';
 var fontTam=7;
 var cellTam=30;
 var i,j;
 
 //pone todos los qs=qd donde qs=0
function totServit()
{
	if (confirm("¿Actualitzar el valor servit de la comanda?"))
	{
		var x,y,t;
		document.buffer.location = "totServit.asp?viatge=<%=viajeDepurado%>&fecha=<%=fecha%>";
		for(var i=1;i<tabla.children[0].children.length;i++)
			for(var j=1;j<tabla.children[0].children[0].children.length;j++)
			{
				t=tabla.children[0].children[i].children[j];
				if(t.className=='cellRed' || t.className=='cellYellow' || t.className=='cellOrange')
				{
					x=getIJ(t,'i')+art0-1;
					y=getIJ(t,'j')+cli0-1;
					qs[x][y]=qd[x][y];
					t.innerHTML=qs[x][y];
					if(t.innerHTML!='&nbsp;')t.className='cellGreen';
				}
			}
	}
}

 	//guarda los cambios de la celda
	function save(t,i,j)
	{
		datos[i+1][j+1] = cellCont(i,j);
		t.innerHTML = cellCont(i,j);
		t.className = cellClassName(i,j);

		if(indexAjax == 50)
		{
			indexAjax = 0;
		}
		else
		{
			indexAjax = indexAjax++;
		}
		
		
		//aqui creamos una instancia del objeto ajax 	
		ajax[indexAjax]=nuevoAjax();
		
		// con esto enviamos al archivo .asp el valor del estado para que sea ejecutado 
		ajax[indexAjax].open("GET", "save.asp?qd=" + qd[i][j] + "&qs=" + qs[i][j] + "&cli=" + codPosCli[j] + "&art=" + codPosArt[i] + "&viatge=<%=viajeDepurado%>&fecha=<%=fecha%>",true);
		
		// aqui se hace el envio del objeto 
		ajax[indexAjax].send(null);
		
		////document.buffer.location="save.asp?qd=" + qd[i][j] + "&qs=" + qs[i][j] + "&cli=" + codPosCli[j] + "&art=" + codPosArt[i] + "&viatge=<%=viajeDepurado%>&fecha=<%=fecha%>";	
	}

	function ponHora()
	{
		var f = new Date();
		var m = "0" + f.getMinutes();
		horaAct.innerHTML = f.getHours() + ":" + m.right(2);
		setTimeout("ponHora()",1000);
	}

</script>

<script src="<%=SCRIPTS%>date.js"></script>
<script src="<%=SCRIPTS%>string.js"></script>
<script src="<%=SCRIPTS%>go.js"></script>