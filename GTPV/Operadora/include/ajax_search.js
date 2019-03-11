
<Script>

function getXmlHttpRequestObject() {
	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} else if(window.ActiveXObject) {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		alert("Your Browser Sucks!\nIt's about time to upgrade don't you think?");
	}
}
//Our XmlHttpRequest object to get the auto suggest
var searchReq = getXmlHttpRequestObject();
var UltimaBusqueda;

//Called from keyup on the search textbox.
//Starts the AJAX request.
var Actual=0;
function ResaltaActual(Resaltat){
	var El = parent.document.getElementById('element_'+Actual);
	if(El){
		if (Resaltat) {
			El.style.background="black";
			El.style.color="white";
			El.style.zoom="1.5";
		}
		else{
			El.style.background="white";
			El.style.color="black";
			El.style.zoom="1";
		}
	}	
}
		
function searchSuggestPress(Control,Tipus) {
	UltimaBusqueda = Control;
	var cursorKey = window.event.keyCode;
	if (cursorKey == 13 ) {  // Intro
		PremutIntro(Control);
		window.event.keyCode=0;
		}
	if (cursorKey == 40 || cursorKey == 38) {  // Dwn
		var Antic=Actual;
		ResaltaActual(0);
		if (cursorKey == 40) Actual++;   // Dwn
		if (cursorKey == 38) Actual--;   // Up
		var El = parent.document.getElementById('element_'+Actual);
		if (!El) Actual = Antic;
		ResaltaActual(1);
		window.event.keyCode=0;
		}
}

var GlobalPendentIntro=false;
function PremutIntro(Control) {
	GlobalPendentIntro=false;
	var x = parent.document.getElementById('element_'+Actual);
	if (x && !PeticioEnCurs){
		var n = parent.document.getElementById('element_Mostrar_'+Actual);
		if (x.value==-1) {
			searchSuggest(Control,"");
			}
		else {
			document.getElementById('Suggest_'+Control).value = n.value;
			document.getElementById(Control).value = x.value;
			eval(document.getElementById(Control+"_Ok").value);
//			document.comanda.submit ( );
//			canviDeClient();
			parent.document.getElementById("search_suggest").style.visibility="hidden";
			GlobalPendentIntro=false;
			}
		}
	else{
	GlobalPendentIntro=true;
	};	
}

var UltimBuscat,UltimBuscatMaxim,UltimBuscatTipus;
var PeticioEnCurs=false;
function searchSuggest(Control,Tipus) {
//	if (searchReq.readyState == 4 || searchReq.readyState == 0) {
		var bb    = document.getElementById('Suggest_'+Control);
		var ss    = parent.document.getElementById('search_suggest');
		var Maxim = parent.document.getElementById('search_suggest_Resultats').value;
//		if (bb.value=="") ss.style.visibility="hidden";
		if (UltimBuscat!=bb.value || UltimBuscatMaxim!=Maxim || UltimBuscatTipus!=Tipus ){
			UltimBuscat=bb.value;
			UltimBuscatMaxim=Maxim;
			UltimBuscatTipus=Tipus;
			var k = Math.random();
			searchReq.open('GET', '/Facturacion/include/busca.asp?Control='+Control+'&Tipus='+Tipus+'&search='+escape(bb.value)+'&Maxim='+Maxim+'&Rnd='+k+'&FrameName='+self.name , true);
			searchReq.onreadystatechange = handleSearchSuggest; 
			PeticioEnCurs=true;
			searchReq.send(null);
			
//			ss.style.left = bb.style.left;
			if(Tipus=="Clients"){
			ss.style.left = 473;
			ss.style.top = bb.style.top+21;
			}
			if(Tipus=="Articles"){
			ss.style.left = 77;
			ss.style.top = 87;
			}
			
			ss.style.height = 30;
			ss.style.width = bb.style.width;
		}	
		else {	
		ss.style.visibility="visible";
		}
//	}		
}
var lAmago=0;
function ValidaContingut(Camp) {
	lAmago=1;
	setTimeout ( "AmagaLlista()", 500 );
 	}

function AmagaLlista(){
		if (lAmago) parent.document.getElementById("search_suggest").style.visibility="hidden";
	}

	
//Called when the AJAX response is returned.
function handleSearchSuggest() {
	if (searchReq.readyState == 4) {
		var ss = parent.document.getElementById('search_suggest')
		ss.innerHTML = unescape(searchReq.responseText);
		Actual=0;
		parent.document.getElementById("search_suggest_Clicat").value =0;
		ResaltaActual(1);
		ss.style.visibility="visible";
		PeticioEnCurs=false;
		if(GlobalPendentIntro) PremutIntro(UltimaBusqueda);

//		ss.innerHTML = '';
//		var str = searchReq.responseText.split("\n");
//		for(i=0; i < str.length - 1; i++) {
//			var suggest = '<div onmouseover="javascript:suggestOver(this);" ';
//			suggest += 'onmouseout="javascript:suggestOut(this);" ';
//			suggest += 'onclick="javascript:setSearch(this.innerHTML);" ';
//			suggest += 'class="suggest_link">' + str[i] + '</div>';
//			ss.innerHTML += suggest;
//		}
	}
}

//Mouse over function
function suggestOver(div_value) {
	div_value.className = 'suggest_link_over';
}
//Mouse out function
function suggestOut(div_value) {
	div_value.className = 'suggest_link';
}
//Click function
function setSearch(value) {
//	document.getElementById('txtSearch').value = value;
	parent.document.getElementById('search_suggest').innerHTML = '';
}
</Script>
