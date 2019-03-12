	<link rel="StyleSheet" type="text/css" href="\Facturacion\include\googlesuggestclone.css" /> 
	<script>		
	function clicatTot(FrameName,Camp,Tipus){
		document.getElementById("search_suggest_Resultats").value =10000;
		self.frames[FrameName].lAmago=0;
//		self.frames[FrameName].document.getElementById("Suggest_"+Camp).value='b';
		self.frames[FrameName].searchSuggest(Camp,Tipus);
		}

	function clicatRanglo(k,FrameName,Camp,Tipus){
		self.frames[FrameName].ResaltaActual(0);
		self.frames[FrameName].lAmago=0;
		self.frames[FrameName].Actual = k;
		self.frames[FrameName].ResaltaActual(1);
		self.frames[FrameName].document.getElementById("Suggest_"+Camp).focus();
		}
	function clicatRanglo2(k,FrameName,Camp,Tipus){
		document.getElementById("search_suggest_Clicat").value = k;
		self.frames[FrameName].PremutIntro(Camp);
		}
</script>		
<input type='hidden' Id ='search_suggest_Clicat'    value=1>
<input type='hidden' Id ='search_suggest_Resultats' value=40>

		<div id='search_suggest' name='search_suggest' style='position:absolute;visibility:hidden;overflow:yes;' ></div>
