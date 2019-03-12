<%

function getCarValue ( byval cad, byval buscar, byval separador )

	dim pos
	dim longitut
	dim valor

	pos      = 0
	longitut = 0

	if isnull ( separador ) then separador = "]"

	pos = instr ( cad, buscar )

	if pos = 0 then exit function

	pos         = pos + len ( buscar ) + 1
	longitut    = instr ( pos, cad, separador ) - pos
	valor       = mid ( cad, pos, longitut )
	getCarValue = valor

end function

function car ( byref C )

	dim i
	dim level

	i     = 0
	level = 0

	do
		i = i + 1
		if mid ( C, i, 1 ) = "]" then level = level - 1
		if mid ( C, i, 1 ) = "[" then level = level + 1
	loop while level <> 0 and i < len ( C )

	car = left ( C, i )
	if car <> "" then
		car = mid  ( car, 2, len ( car ) - 2 )
		C   = mid  ( C, i + 1 )
	end if

end function

function SolsAscii(St)
	
	st = join ( split ( st, "'" ), " " )
	st = join ( split ( st, "º" ), "o" )
	st = join ( split ( st, "ª" ), "a" )

	st = join ( split ( st, "á" ), "a" )
	st = join ( split ( st, "à" ), "a" )
	st = join ( split ( st, "â" ), "a" )
	st = join ( split ( st, "ä" ), "a" )

	st = join ( split ( st, "é" ), "e" )
	st = join ( split ( st, "è" ), "e" )
	st = join ( split ( st, "ê" ), "e" )
	st = join ( split ( st, "ë" ), "e" )

	st = join ( split ( st, "í" ), "i" )
	st = join ( split ( st, "ì" ), "i" )
	st = join ( split ( st, "î" ), "i" )
	st = join ( split ( st, "ï" ), "i" )

	st = join ( split ( st, "ó" ), "o" )
	st = join ( split ( st, "ò" ), "o" )
	st = join ( split ( st, "ô" ), "o" )
	st = join ( split ( st, "ö" ), "o" )

	st = join ( split ( st, "ú" ), "u" )
	st = join ( split ( st, "ù" ), "u" )
	st = join ( split ( st, "û" ), "u" )
	st = join ( split ( st, "ü" ), "u" )
	
	st = join ( split ( st, "Á" ), "a" )
	st = join ( split ( st, "À" ), "a" )
	st = join ( split ( st, "Â" ), "a" )
	st = join ( split ( st, "Ä" ), "a" )

	st = join ( split ( st, "É" ), "e" )
	st = join ( split ( st, "È" ), "e" )
	st = join ( split ( st, "Ê" ), "e" )
	st = join ( split ( st, "Ë" ), "e" )

	st = join ( split ( st, "Í" ), "i" )
	st = join ( split ( st, "Ì" ), "i" )
	st = join ( split ( st, "Î" ), "i" )
	st = join ( split ( st, "Ï" ), "i" )

	st = join ( split ( st, "Ö" ), "o" )
	st = join ( split ( st, "Ô" ), "o" )
	st = join ( split ( st, "Ô" ), "o" )
	st = join ( split ( st, "Ö" ), "o" )

	st = join ( split ( st, "Ú" ), "u" )
	st = join ( split ( st, "Ù" ), "u" )
	st = join ( split ( st, "Û" ), "u" )
	st = join ( split ( st, "Ü" ), "u" )

	SolsAscii = st
end function


%>