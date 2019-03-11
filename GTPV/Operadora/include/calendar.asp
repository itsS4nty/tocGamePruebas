<%

	function inputCalendarResumit(val, name) 
		inputCalendarResumit=  "<input type=""text"" 	value=""" & val & """  ondblclick =""showCal(this.form." & name & ",'');""   name=""" & name &	 """ size=""11"" maxlength=""10"" onBlur=""valFecha(this);"" onKeyPress=""esNum(event,this);"">"
	end function

	function inputCalendar(val, name) 
		strCalendar 	= ""
		strCalendar     = strCalendar & "<input type=""text"" 	value=""" & val & """ name=""" & name &	 """ size=""11"" maxlength=""10"" onBlur=""valFecha(this);"" onKeyPress=""esNum(event,this);"">"
		strCalendar 	= strCalendar & "<input type=""button"" value="""" name=""btnCalendar" &  name & """ onclick=""showCal(this.form." & name & ",'');"" class=""day"" >"
		inputCalendar 	=  strCalendar
	end function

	function inputCalendarSimple(val, name) 
		strCalendar 	= ""
		strCalendar     = strCalendar & "<input type=""text"" 	value=""" & val & """ name=""" & name &	 """ size=""11"" maxlength=""10"" onBlur=""valFecha(this);"" onKeyPress=""esNum(event,this);"">"
		inputCalendarSimple 	=  strCalendar
	end function
	
	function submitCalendarForm(val,name,cls)
		submitCalendarForm = "<input type=""Submit"" class=""" & cls & """ value=""" & val & """ name=""" & name & """>"
	end function
	
	function inputCalendarMenos(campo)
		inputCalendarMenos = "<img src=""" & ICOSFORN & "menos.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMenos(" & campo & ",true);"">"
	end function

	function inputCalendarMas(campo)
		inputCalendarMas = "<img src=""" & ICOSFORN & "mas.gif"" width=""18"" height=""18"" border=""0"" align=""absbottom"" style=""cursor:hand;"" onclick=""diaMas(" & campo & ", true);"">"
	end function
%>

<script>
	// CALENDARIO ------------------------------------------------------------------------------------------------------------------
	var campo;
	var queEnvia = "";

	function showCal ( hid, que )
	{
		queEnvia = que;
		campo    = hid;
		javaCalendar ( eval ( "hid.form.btnCalendar" + hid.name ), hid, hid.value, que, event );
	}

	function diaReturn ( n, e )
	{
		var c = campo.value.split ( "/" );
		var f = new Date ( c[2], c[1]-1, c[0] );
		f = f.dateAdd ( n );
		var FECHA = ("0" + f.getDate()).right(2) + "/" + ("0" + (f.getMonth()+1)).right(2) + "/" + f.getFullYear();
		campo.value = FECHA;
		eval ( "campo.form.btnCalendar" + campo.name ).value = "";
		if ( e ) campo.form.submit();
	}

	function diaMas(c,e)
	{
		campo = c;
		diaReturn ( 1, e );
	}

	function diaMenos ( c, e )
	{
		campo = c;
		diaReturn ( -1, e );
	}

	var dia = ['Diumenge','Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte'];
	// VALIDACIÓN CARÁCTERES -----------------------------------------------------------------------------------------------------------
	function esNum(sEvent,El)
	{
		//Controlamos la entrada de carácteres númericos, mediante los códigos ASCII (. = 46, - = 45)
		var sASCII	= sEvent.keyCode;
		if(((sASCII > 47) && (sASCII < 58)) || (sASCII == 47)) 
		{
			return true;
		}
		else if ((sASCII == 46))
		{
			sEvent.keyCode = 47;
			return true;
		}
		else if ((sASCII == 43) )  // +
		{
			var c = El.value.split ( "/" );
			var f = new Date ( c[2], c[1]-1, c[0] );
			f = f.dateAdd ( 1 );
			var FECHA = ("0" + f.getDate()).right(2) + "/" + ("0" + (f.getMonth()+1)).right(2) + "/" + f.getFullYear();
			El.value = FECHA;
		}
		else if ((sASCII == 45) )  // -
		{
			var c = El.value.split ( "/" );
			var f = new Date ( c[2], c[1]-1, c[0] );
			f = f.dateAdd ( -1 );
			var FECHA = ("0" + f.getDate()).right(2) + "/" + ("0" + (f.getMonth()+1)).right(2) + "/" + f.getFullYear();
			El.value = FECHA;
		}
		else if ((sASCII == 42) )  // *
		{
			var c = El.value.split ( "/" );
			var f = new Date ( c[2], c[1]-1, c[0] );
			var ara = new Date()
			var dies = Math.ceil((f.getTime() - ara.getTime()) / (24*60*60*1000));
			var St =  dia[f.getDay()];
			if (dies == -2) St = St + ' Avants d Ahir'
			if (dies == -1) St = St + ' Ahir'
			if (dies ==  0) St = St + ' Avui'
			if (dies ==  1) St = St + ' Demà'
			if (dies ==  2) St = St + ' Passat demà'
			if (dies < -2 && dies > -7) St = St + ' Passat'
			if (dies >  2 && dies <  7) St = St + ' Vinent'
			alert(St);
		}
		else if ((sASCII == 97) )  // a
		{
			var ara = new Date()
			var FECHA = ("0" + ara.getDate()).right(2) + "/" + ("0" + (ara.getMonth()+1)).right(2) + "/" + ara.getFullYear();
			El.value = FECHA;
		}
		else if ((sASCII == 13) )  // Intro
		{
			var form = El.form;
			for (var i = 0 ; i < form.elements.length && form.elements[i].name != El.name; i++) ;
			sEvent.keyCode =0;
			form.elements[i+1].focus ( );
			form.elements[i+1].select ( );
			return false;
		}
			
		else if ((sASCII < 47) || (sASCII > 58))
		{
		}
		sEvent.keyCode = 0;
		return false;
	}

	// VALIDACIÓN DE FECHAS ------------------------------------------------------------------------------------------------------------
	function esDigito(sChr)
	{	//Controlamos la entrada de carácteres númericos
		var sCod = sChr.charCodeAt(0);
		return ((sCod > 47) && (sCod < 58));
	}

	function valSep(oTxt)
	{
		//Comprueba las diferentes combinaciones de fechas 
		var bOk   = false;
		var sLen  = oTxt.value;

		if(oTxt.value.indexOf("/") == -1 )
		{
			if(sLen.length == 6)
			{				
				oTxt.value =  sLen.substr(0, 2) + "/" + sLen.substr(2, 2) + "/20" + sLen.substr(4, 2);
			}
			else if(sLen.length == 8)
			{
				oTxt.value =  sLen.substr(0, 2) + "/" + sLen.substr(2, 2) + "/" + sLen.substr(4, 4);
			}
			sLen = oTxt.value;		
		}

		if(sLen.length == 10)
		{	// dd/mm/aaaa
			bOk = bOk || ((oTxt.value.charAt(2) == "/") && (oTxt.value.charAt(5) == "/"));
		}

		if(sLen.length == 8)
		{	// d/m/aaaa
			bOk = bOk || ((oTxt.value.charAt(1) == "/") && (oTxt.value.charAt(3) == "/"));
		}

		if(sLen.length == 9)
		{
			if((oTxt.value.charAt(1) == "-") || (oTxt.value.charAt(1) == "/"))
			{	// d/mm/aaaa
				bOk = bOk || ((oTxt.value.charAt(1) == "/") && (oTxt.value.charAt(4) == "/"));
			}

			if((oTxt.value.charAt(2) == "-") || (oTxt.value.charAt(2) == "/"))
			{	// dd/m/aaaa
				bOk = bOk || ((oTxt.value.charAt(2) == "/") && (oTxt.value.charAt(4) == "/"));
			}
		}

		return bOk;
	}

	function finMes(oTxt)
	{
		var sMes = oTxt.value.split("/");
		var nMes = parseInt(sMes[1], 10);
		var nRes = 0;
		switch (nMes){
			case 1: nRes = 31; break;
			case 2: nRes = 29; break;
			case 3: nRes = 31; break;
			case 4: nRes = 30; break;
			case 5: nRes = 31; break;
			case 6: nRes = 30; break;
			case 7: nRes = 31; break;
			case 8: nRes = 31; break;
			case 9: nRes = 30; break;
			case 10: nRes = 31; break;
			case 11: nRes = 30; break;
			case 12: nRes = 31; break;
		}
		return nRes;
	}

	function valDia(oTxt)
	{
		var bOk  = false;
		var sDia = oTxt.value.split("/");
		var nDia = parseInt(sDia[0], 10);
		bOk = bOk || ((nDia >= 1) && (nDia <= finMes(oTxt)));
		return bOk;
	}

	function valMes(oTxt)	
	{
		var bOk   = false;
		var sMes  = oTxt.value.split("/");
		var nMes  = parseInt(sMes[1], 10);
		bOk = bOk || ((nMes >= 1) && (nMes <= 12)); 
		return bOk;
	}

	function valAno(oTxt)
	{
		var bOk  = true;
		var sAno = oTxt.value.split("/");
		var nAno = sAno[2];
		bOk = bOk && ((nAno.length == 2) || (nAno.length == 4));
		if (bOk){
			for (var i = 0; i < nAno.length; i++){
				bOk = bOk && esDigito(nAno.charAt(i));
			}
		}
		return bOk;
	}

	function valFecha(oTxt)
	{
		var bOk = true;
		if (oTxt.value != ""){
			bOk = bOk && (valSep(oTxt));
			bOk = bOk && (valAno(oTxt));
			bOk = bOk && (valMes(oTxt));
			bOk = bOk && (valDia(oTxt));
			
			if (!bOk){
				oTxt.value = "";
				oTxt.focus();
			}
		}
	}
</script>