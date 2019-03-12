<%

' FUNCIONES PARA TRABAJAR CON CADENAS

' --- Cambia una subcadena por otra en una cadena ---------------------------------------------------------------------------------------
function change ( byval str, byval str1, byval str2 )
	change = join ( split ( str, str1 ), str2 )
end function

' --- Si expr retorna a sino retorna b -----------------------------------------------------------------------------------------------------
function iif ( byval expr, byval a, byval b )
	if expr then
		iif = a
	else
		iif = b
	end if
end function

%>