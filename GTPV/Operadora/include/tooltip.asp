<script>
var ToolTipBegin = '<table cellpadding="0" cellspacing="1" border="0" bgcolor="#<%=fColor1%>" width="100%"><tr><td nowrap>' +
                   '<table cellpadding="0" cellspacing="0" border="0" bgcolor="#<%=fColor3%>" width="100%"><tr><td nowrap>';
var ToolTipEnd   = '</td></tr></table></td></tr></table>';

function ToolTip ( nom, cod )
	{
	
	// Propiedades
	this.name  = nom;
	this.code  = cod;
	this.x     = 0;
	this.y     = 0;
	this.popup = window.createPopup();
	this.body  = this.popup.document.body;

	// Métodos
	this.show = ShowToolTip;
	this.hide = HideToolTip;
	
	}

function ShowToolTip ( x, y )
	{

	if ( x && y )
		{
		this.x = x;
		this.y = y;
		}
	else if ( event )
		{
		this.x = event.clientX - document.body.scrollLeft + 10;
		this.y = event.clientY - document.body.scrollTop  + 10;
		}

	this.code = SetStyleFromClassName(this.code);
	this.code = this.code.change("<td","<td style='" + GetPropertyesFromCssElem("td") + "'");

	this.body.innerHTML = ToolTipBegin + this.code + ToolTipEnd;
	this.popup.show(0,0,0,0,document.body);
	this.body.children[0].style.visibility = "visible";
	this.popup.show(this.x,this.y,this.body.children[0].clientWidth,this.body.children[0].clientHeight,document.body);
	
	}

function HideToolTip()
	{
	this.popup.hide();
	}

// e: si es una CLASE o un ID tiene que contener '.' o '#'
function GetPropertyesFromCssElem(e)
	{

	var CssCode = "<%=change(CssCode,vbcrlf,"\n")%>";
	var pos, ini, fin;
	var i = 0;
	var c;
	var aL = "";
	var aV = "";
	var aA = "";
	var aH = "";
	
	// buscar la posición de la coincidencia:
	while ( i < CssCode.length && i >= 0 )
		{
		i = CssCode.indexOf ( e, i ) + 1;
		if ( i == 0 ) i--;
		else
			{
			c =  CssCode.substring( i-2, i-1 );
			if ( c == "" || c == "\n" || c == " " ) pos = i-1;
			else if ( c == "." )
				{
				if ( CssCode.substring(i-3,i-2).toUpperCase() == "A" )
					{
					pos = i-2;
					c = CssCode.substring(CssCode.indexOf(":",i)+1).toUpperCase();
					/*
					if ( c.indexOf("LINK")    == 0 )
					if ( c.indexOf("VISITED") == 0 )
					if ( c.indexOf("ACTIVE")  == 0 )
					if ( c.indexOf("HOVER")   == 0 )
					*/
					}
				}
			}
		}
	
	// buscar las llaves
	ini = CssCode.indexOf ( "{", pos ) + 1;
	fin = CssCode.indexOf ( "}", pos );
	
	c = CssCode.substring( ini, fin ).split("\n");
	for ( i=0; i<c.length; i++ )
		{
		c[i] = c[i].trim();
		}

	return c.join(" ").trim();

	}

function SetStyleFromClassName(c)
	{
	
	var i   = 0;
	var j   = 0;
	var k   = 0;
	var c2  = c.toUpperCase();
	var nom = new Array();
	var val = new Array();
	var pos = new Array();
	var n   = "";
	var v   = "";
	
	// buscar la posición de CLASS:
	while ( i < c2.length && i >= 0 )
		{
		i = c2.indexOf ( "CLASS", i ) + 1;
		if ( i == 0 ) i--;
		else
			{
			j   = c2.indexOf(" ",i);
			k   = c2.indexOf(">",i);
			n   = c.substring(i-1,(j<k?j:k));
			v   = n.split("=")[1].trim();
			v   = v.change("\"","").change("'","");
			v   = 'style="' + GetPropertyesFromCssElem("."+v) + '"';
			nom[nom.length] = n;
			val[val.length] = v;
			}
		}
	
	for(i=0;i<nom.length;i++)
		{
		c = c.change ( nom[i], val[i] );
		}
	
	return c;

	}

</script>