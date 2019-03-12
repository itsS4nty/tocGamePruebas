<%

' --- Busca la posición de un elemento en un vector -------------------------------------------------------------------------------------
function busca ( byval v, byval e )
	busca = -1
	for i=0 to ubound(v)
		if v(i) = e then
			busca = i
			exit function
		end if
	next
end function

' --- Split quitando espacios en cada elemento ------------------------------------------------------------------------------------------
function trimSplit ( byval str, byval token )

	dim arr
	dim iArr

	arr = split ( str, token )

	for iArr = 0 to ubound ( arr )
		arr ( iArr ) = trim ( arr ( iArr ) )
	next

	trimSplit = arr

end function

' --- Elimina un elemento de un vector pasando como parámetro el valor del elemento -----------------------------------------------------
function dropByValue ( byval v, byval t )

	dim i, j
	dim a()

	j = 0
	redim a ( ubound ( v ) - 1 )
	for i=0 to ubound ( v )
		if j <= ubound ( a ) then
			if v ( i ) <> t then
				a ( j ) = v ( i )
				j = j + 1
			end if
		end if
	next

	dropByValue = a

end function

%>