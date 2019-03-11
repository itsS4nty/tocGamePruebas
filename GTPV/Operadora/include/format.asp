<%

' FUNCIONES PARA DAR FORMATO

' --- String to Date --------------------------------------------------------------------------------------------------------------------
function getDate ( byval expr, byval formato)

	Dim iDia, iMes, iAno, iArr, iStr

	if isNull(expr) then expr = now

	iStr = formatdatetime ( expr, 2 )
	iArr = split ( iStr, "/" )

	iDia = iArr(0)
	iMes = iArr(1)
	iAno = iArr(2)

	if formato then
		getDate = DateSerial ( iAno, iMes, iDia )
	else
		getDate = DateSerial ( iAno, iDia, iMes)
	end if

end function

' --- Date to String --------------------------------------------------------------------------------------------------------------------
function formatDate ( byval expr )
	if isNull(expr) then expr = now
	formatDate = formatDateTime ( expr, 2 )
end function

' --- Formatea un número con 2 decimales y usando el punto '.' para separarlos ----------------------------------------------------------
function formatFloat ( byval num )
  if isnull(num) then num = 0
  formatFloat = formatnumber(num,2,-1,0,0)
  formatFloat = change(formatFloat,",",".")
end function

' --- Formatea un número con 3 decimales y usando el punto '.' para separarlos ----------------------------------------------------------
function formatFloat3 ( byval num )
  if isnull(num) then num = 0
  formatFloat3 = formatnumber(num,3,-1,0,0)
  formatFloat3 = change(formatFloat3,",",".")
end function

' --- Formatea una cadena dejando sólo caracteres del '0' al '9', del 'A' al 'Z' y cambiando lo demás por '_' ---------------------------
function formatAlphaNumeric ( byval str )

	dim aux
	aux = ""

	for i=1 to len(str)
		c = mid(str,i,1)
		if ((c >= "A" And c <= "Z") Or (c >= "0" And c <= "9")) then
			aux = aux & c
		else
			aux = aux & "_"
		end if
	next

	formatAlphaNumeric = aux

end function

' --- Formatea un número para utilizarlo en una cadena de SQL ---------------------------------------------------------------------------
function SqlNum(N)
	SqlNum = change(N,",",".")
end function

' --- Pasa de un número decimal que representa los minutos a una cadena HH:MM -----------------------------------------------------------
function decimalToHoras(dd)
	d = dd
	if dd < 0 then d = d * -1
	H=int(d/60)
	M=d-(H*60)
	if M<10 then M = "0" & M
	decimalToHoras = H & ":" & M
	if dd < 0 then decimalToHoras = "-" & decimalToHoras 
end function

' --- Pasa de horas y minutos a un decima -----------------------------------------------------------------------------------------------
function horasToDecimal(H,M)
	horasToDecimal=H+(M/60)
end function
%>