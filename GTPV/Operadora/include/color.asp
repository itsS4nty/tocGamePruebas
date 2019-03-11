<script>
var popColor = window.createPopup();
var popBody  = popColor.document.body;
var xCol,yCol,campo,boton;

function showCol(c,b)
	{
	campo = c;
	boton = b;
	if(event)
		{
		xCol = event.clientX - document.body.scrollLeft;
		yCol = event.clientY - document.body.scrollTop;
		}
	popBody.innerHTML = tablaDeColores.outerHTML;
	popColor.show(0,0,0,0,document.body);
	popBody.children[0].style.visibility = "visible";
	popColor.show(xCol,yCol,popBody.children[0].clientWidth,popBody.children[0].clientHeight,document.body);
	}

function hideCol()
	{
	popColor.hide();
	}

function colorReturn(c)
	{
	c = c.style.background;
	eval ( campo + " = '" + c + "'" );
	boton.style.background = c;
	hideCol();
	}

var R = 0;
function hex ( n )
	{
	if ( n < 10 ) return n;
	else return String.fromCharCode ( 65 + ( n % 10 ) );
	}

function ponRojo ( )
	{
	if ( R < 15 ) R+=3;
	ponColor ( );
	}

function quitaRojo ( )
	{
	if ( R > 0 ) R-=3;
	ponColor ( );
	}

function ponColor ( )
	{
	var btn, c, rojo = "#" + hex(R) + hex(R);
	for ( var i=0; i<25; i++ )
		{
		btn = eval ( "popColor.document.fColores.btn" + i );
		c = btn.style.background.substring(3);
		btn.style.background = rojo + c;
		}
	}

</script>

<%
BOR = ""
if gESTIL = "CDP" then BOR = "border: 1 solid #000000;"
%>

<table cellspacing="<%=iif(gESTIL = "CDP",0,1)%>" cellpadding="0" bgcolor="#<%=fColor1%>" style="cursor:default;position:absolute;top:0;left:0;visibility:hidden;" id="tablaDeColores">

<form name="fColores">

 <tr>
<%
   p = 0
   For i = 0 To 3
      For j = 0 To 3
         For k = 0 To 3
			m = "#" & hex(255 * Cos(i / 2)) & hex(255 * Cos(j / 2)) & hex( 255 * Cos(k / 2))
			%><td><input name="btn<%=p%>" type="Button" style="background:<%=m%>;width:40;height:40;<%=BOR%>" onclick="parent.colorReturn(this);"></td><%
            p = p + 1
			if (p mod 8) = 0 then 
				%></tr><tr><%
			end if
         Next
      Next
   Next
%>
  </tr>
</form>

</table>

