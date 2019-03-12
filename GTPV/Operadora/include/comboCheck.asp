<%
function inputComboCheck(val,obj,lt,w)
	if w="" or w="0" then w="this.offsetWidth"
	inputComboCheck = "<input type=""Button"" value=""" & val & """ onclick=""" & obj & ".show(" & lt & "," & w & ");"" class=""txt"" name=""boton" & obj & """>"
end function
%>

<script>
 chkDefault = 0;
 chkTrue = 1;
 chkFalse = 2;

 function comboCheck(nom,camp)
 	{
	this.name = nom;
	this.inputElement = camp;
	this.elements = new Array();
	this.popup = window.createPopup();
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.body = this.popup.document.body;
	this.addElement = comboCheckAddElement;
	this.show = comboCheckShow;
	this.hide = comboCheckHide;
	this.selectAll = comboCheckSelectAll;
	this.unSelectAll = comboCheckUnSelectAll;
	this.getValues = comboCheckGetValues;
	this.whatSelect = comboCheckWhatSelect;
	this.images = false;
	}

 function comboChekElement(txt,val,par)
 	{
	this.text = txt;
	this.value = val;
	this.checked = false;
	this.index = par.elements.length;
	this.parent = par;
	par.elements[this.index] = this;
	this.select = comboCheckElementSelect;
	}

 function comboCheckAddElement(txt,val)
 	{
	var e = new comboChekElement(txt,val,this);
	}

 function comboCheckShow(l,t,w)
 	{
	var row,cell,e,todos=true,alguno=false;
	while(comboCkeckBody.children.length)comboCkeckBody.deleteRow();
	for(var i=0;i<this.elements.length;i++)
		{
		e = this.elements[i];
		todos = todos && e.checked;
		alguno = alguno || e.checked;
		row = document.createElement("TR");
		cell = document.createElement("TD");
		cell.innerHTML = '<img src="' + (e.checked?chkOn.src:chkOff.src) + '" name="' + this.name + e.index +'" onclick="parent.' + this.name + '.elements[' + e.index + '].select()" hspace="2">';
		row.appendChild(cell);
		cell = document.createElement("TD");
		row.appendChild(cell);
		cell.innerHTML = '<font face="Verdana" size="1" color="#<%=fColor1%>" onclick="parent.' + this.name + '.elements[' + e.index + '].select();">' + e.text + '</font>';
		cell.style.cursor = "hand";
		cell = document.createElement("TD");
		cell.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		row.appendChild(cell);
		comboCkeckBody.appendChild(row);
		this.images = true;
		}
	document.COMBOCHECKNAMEAll.src = (todos?chkOn.src:(alguno?chkGris.src:chkOff.src));
	this.x = l;
	this.y = t;
	this.w = w;
	this.body.innerHTML = comboCheckCode.outerHTML.split("COMBOCHECKNAME").join(this.name);
	this.popup.show(0,0,0,0,document.body);
	this.body.children[0].style.visibility = "visible";
	this.h = this.body.children[0].style.pixelHeight;
	this.getValues();
	this.popup.show(this.x,this.y,this.w,this.h,document.body);
	}

 function comboCheckHide(e)
 	{
	this.popup.hide();
	}
	
 function comboCheckElementSelect(c)
 	{
	this.checked = c?(c==chkTrue):!this.checked;
	if(this.parent.images)
		{
		eval("document." + this.parent.name + this.index).src = this.checked?chkOn.src:chkOff.src;
		eval(this.parent.name + ".popup.document." + this.parent.name + this.index).src = this.checked?chkOn.src:chkOff.src;
		}
	if(!c)this.parent.getValues();
	}

 function comboCheckSelectAll()
 	{
	for(var i=0;i<this.elements.length;i++)
		this.elements[i].select(chkTrue);
	this.getValues();
	}

 function comboCheckUnSelectAll()
 	{
	for(var i=0;i<this.elements.length;i++)
		this.elements[i].select(chkFalse);
	this.getValues();
	}

 function comboCheckWhatSelect()
 	{
	var s = eval(this.name + ".popup.document." + this.name + "All");
	if(s.src==chkOn.src)
		{
		s.src = chkOff.src;
		this.unSelectAll();
		}
	else
		{
		s.src = chkOn.src;
		this.selectAll();
		}
	document.COMBOCHECKNAMEAll.src = s.src;
	}

 function comboCheckGetValues()
 	{
	var todos = true;
	var alguno = false;
	var c = "",o;
	if(this.inputElement.tagName == "SELECT")while(this.inputElement.options.length)this.inputElement.remove(0);
	var s = eval(this.name + ".popup.document." + this.name + "All");
	for(var i=0;i<this.elements.length;i++)
		if(this.elements[i].checked)
			{
			if(this.inputElement.tagName == "SELECT")
				{
				o = document.createElement("OPTION");
				o.value = this.elements[i].value;
				o.text = this.elements[i].text;
				this.inputElement.add(o);
				}
			else c += "," + this.elements[i].value;
			alguno = true;
			}
		else todos = false;
	if(c!="")
		{
		if(this.inputElement.tagName != "SELECT")this.inputElement.value = c.substring(1);
		}
	if(this.images)
		{
		if(todos)s.src = chkOn.src;
		else if(alguno)s.src = chkGris.src;
		else s.src = chkOff.src;
		document.COMBOCHECKNAMEAll.src = s.src;
		}
	}

</script>

<div id="comboCheckCode" style="width:100%;height:121;position:absolute;top:0;left:0;visibility:hidden;border:1px solid #<%=fColor1%>;" onselectstart="return false;">
 <table cellspacing="0" border="0" cellpadding="0" bgcolor="#<%=fColor2%>" width="100%">
  <thead>
   <tr style="cursor:hand;font:bold xx-small Verdana;color:#<%=fColor1%>;">
    <td height="19" onclick="parent.COMBOCHECKNAME.whatSelect();"><img src="<%=ICOSFORN%>chkOff.gif" hspace="2" name="COMBOCHECKNAMEAll"> Tots</td>
	<td align="right"><button style="width:17;height:17;background:#<%=fColor3%>;" onclick="parent.COMBOCHECKNAME.popup.hide();"><img src="<%=ICOSFORN%>up.gif" width="9" height="10" alt="OK" border="0"></button></td>
   </tr>
  </thead>
  <tbody>
   <tr>
    <td colspan="2">
	 <div style="scrollbar-face-color:#<%=fColor3%>;scrollbar-arrow-color:#000000;overflow-y:scroll;width:100%;height:100;">
	  <table cellpadding="0" cellspacing="0" border="0">
	   <tbody id="comboCkeckBody"></tbody>
	  </table>
	 </div>
	</td>
   </tr>
  </tbody>
 </table>
</div>

<img src="<%=ICOSFORN%>chkOn.gif" id="chkOn" style="visibility:hidden;position:absolute;top:0;left:0">
<img src="<%=ICOSFORN%>chkOff.gif" id="chkOff" style="visibility:hidden;position:absolute;top:0;left:0">
<img src="<%=ICOSFORN%>chkGris.gif" id="chkGris" style="visibility:hidden;position:absolute;top:0;left:0">
 