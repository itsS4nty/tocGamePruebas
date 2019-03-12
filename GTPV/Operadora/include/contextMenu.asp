<script>

 function contextMenu(n)
 	{
	this.name = n;
	this.elements = new Array();
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.popup = window.createPopup();
	this.body = this.popup.document.body;
	this.add = contextMenuAdd;
	this.show = contextMenuShow;
	}

 function contextMenuElement(t,j)
 	{
	this.text = t;
	this.js = j;
	}

 function contextMenuAdd(t,j)
 	{
	this.elements[this.elements.length] = new contextMenuElement(t,j);
	var row = document.createElement("TR");
	var cell = document.createElement("TD");
	cell.innerHTML = '<font face="Verdana" size="1" color="#000000" onclick="' + j + ';parent.' + this.name + '.popup.hide();">' + t + '</font>';
	row.appendChild(cell);
	row.style.cursor = "hand";
	CONTEXTMENUNAMEBody.appendChild(row);
	}

 function contextMenuShow()
 	{
	this.x = event.x;
	this.y = event.y;
	this.body.innerHTML = contextMenuCode.outerHTML.split("CONTEXTMENUNAME").join(this.name);
	this.popup.show(0,0,0,0,document.body);
	this.body.children[0].style.visibility = "visible";
	this.h = this.body.children[0].offsetHeight;
	this.w = this.body.children[0].offsetWidth;
	this.popup.show(this.x,this.y,this.w,this.h,document.body);
	}
</script>

<table bgcolor="#eeeeff" id="contextMenuCode" style="position:absolute;top:0;left:0;visibility:hidden;border:1px solid #000000;" onselectstart="return false;">
 <tbody id="CONTEXTMENUNAMEBody"></tbody>
</table>