<%

' FUNCIONES PARA TRABAJAR CON FECHAS

' --- Vector de dias de la semana -------------------------------------------------------------------------------------------------------
diasSemanaCAT = split(",Dilluns,Dimarts,Dimecres,Dijous,Divendres,Dissabte,Diumenge",",")
diasSemanaCAS = split(",Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo",",")
diasSemanaLet = split("S,D,L,M,X,J,V,S,D",",")
diasSemana    = split("Sábado,Domingo,Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo",",")

' --- Vector de meses -------------------------------------------------------------------------------------------------------------------
mesesCAT = split("DESEMBRE,GENER,FEBRER,MARÇ,ABRIL,MAIG,JUNY,JULIOL,AGOST,SETEMBRE,OCTUBRE,NOVEMBRE,DESEMBRE",",")
mesesCAS = split("DICIEMBRE,ENERO,FEBRERO,MARZO,ABRIL,MAYO,JUNIO,JULIO,AGOSTO,SEPTIEMBRE,OCTUBRE,NOVIEMBRE,DICIEMBRE",",")
meses    = split("DIC,ENE,FEB,MAR,ABR,MAY,JUN,JUL,AGO,SEP,OCT,NOV,DIC",",")

' --- Retorna un formato de fecha SQL ---------------------------------------------------------------------------------------------------
function dataSql ( byval D )
	dataSql = "convert(datetime,'" & formatdatetime(D,2) & "',103)"
end function

' --- Retorna un formato de hora SQL ----------------------------------------------------------------------------------------------------
function horaSql ( byval D )
	horaSql = "convert(datetime,'" & formatdatetime(D,3) & "',108)"
end function

' --- Pasa de minutos a horas -----------------------------------------------------------------------------------------------------------
function minToHoras ( byval m )
	minToHoras = m\60 & ":" & right("0" & m mod 60,2)
end function

' --- Pasa de Segundoa  a horas -----------------------------------------------------------------------------------------------------------
function secToHoras ( byval s )
	nS = s mod 60
	s = int(s / 60)
	nM = s mod 60
	s = int(s / 60)
	nH =  s mod 60

	secToHoras = right("0" & nH,2) & "`" & right("0" & nM,2) & "``" & right("0" & nS,2)
	
end function


' --- Mira si el dia pasado por parámetro es festivo o no -------------------------------------------------------------------------------
function esFestivo ( byval D )

	esFestivo = false

	' Si el dia es domingo
	if weekday ( D ) = 1 then
		set rsEF = rec("select dia from cdpFestius where dia='Domingos'")
		if not rsEF.eof then
			esFestivo = true
			exit function
		end if
	end if

	' Si es sabado
	if weekday ( D ) = 7 then
		set rsEF = rec("select dia from cdpFestius where dia='Sábados'")
		if not rsEF.eof then
			esFestivo = true
			exit function
		end if
	end if

	' Si no es sábado ni domingo o si lo es pero no ha superado el control anterior

	set rsEF = rec("select dia from cdpFestius where dia='" & formatdatetime(D,2) & "'")
	if not rsEF.eof then esFestivo = true

end function

' --- Pasa de minutos a horas -----------------------------------------------------------------------------------------------------------
function minToHora ( byval m )
	minToHora = m / 60
end function

' --- Retorna la fecha del lunes de la semana de la fecha pasada por parámetro ----------------------------------------------------------
function getMonday ( byval f )
	dim d
	d = weekday ( f, vbMonday )
	while d > 1
		f = dateadd ( "d", -1, f )
		d = weekday ( f, vbMonday )
	wend
	getMonday = f
end function

' --- Retorna la fecha del primer dia del mes de la fecha pasada por parámetro ----------------------------------------------------------
function getFirstDay ( byval f )
	f = cdate ( "01/" & month(f) & "/" & year(f) )
	getFirstDay = f
end function

' --- Retorna la fecha del último dia del mes de la fecha pasada por parámetro ----------------------------------------------------------
function getLastDay ( byval f )
	f = cdate ( "01/" & month(f) & "/" & year(f) )
	f = dateadd ( "m",  1, f )
	f = dateadd ( "d", -1, f )
	getLastDay = f
end function

' --- Dias que hay en el mes de la fecha pasada por parámetro ---------------------------------------------------------------------------
function diasPorMes( byval D )
	diasPorMes = day ( getLastDay(D) )
end function


function diasSemanaIdioma (wd)
	if session("Usuari_IDIOMA") = "ES" then
		diasSemanaIdioma = diasSemanaCAS(wd)
	else
		diasSemanaIdioma = diasSemanaCAT(wd)
	end if
end function



function diaSemanaFecha (byval fecha)
	diaSemanaFecha = diaSemanaDia (weekday(fecha,2))
end function

function diaSemanaDia (wd)
	if session("Usuari_IDIOMA") = "ES" then
		diaSemanaDia = diasSemanaCAS(wd) 
	else
		diaSemanaDia = diasSemanaCAT(wd) 
	end if
end function

%>