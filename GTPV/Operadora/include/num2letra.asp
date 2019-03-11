<%
strUnidad = strUnidad & "|un|dos|tres|quatre|cinc|sis|set|vuit|nou"
vUnidad = split(strUnidad,"|")

strDecena = "|deu|vint|trenta|quaranta|cincuanta|seixanta|setanta|vuitanta|noranta"
vDecena = split(strDecena,"|")

strCentena = "|cent|-cents|-cents|-cents|-cents|-cents|-cents|-cents|-cents"
vCentena = split(strCentena,"|")

strMillar =  "|mil|-mil|-mil|-mil|-mil|-mil|-mil|-mil|-mil"
vMillar = split(strMillar,"|")

Function Numero2Letra(strNum,vLo,vMoneda,vCentimos)
	E = int(strNum)
	D = int(strNum * 100 - E * 100)
	cadenaEntero = cstr(E)
	cadenaDecimal = cstr(D)
	Numero2Letra = UnNumero(cadenaEntero) & " " & vMoneda & " amb " & UnNumero(cadenaDecimal) & " " & vCentimos
End Function

Function UnNumero(strNum)

	UnNumero=""
	strNumero=""
	for i=1 to len(strNum)
		strNumero = mid(strNum,i,1) & strNumero
	next

	strNum=strNumero

	for i=1 to len(strNum)

		n=mid(strNum,i,1)
if n="-" then n=len(strNum)
		select case i
			case 1
				UnNumero = vunidad(n)
			case 2
				U=UnNumero
				UnaDecena n,U
				UnNumero=U
			case 3
				if n=1 then
					UnNumero = "cent " & UnNumero
				else
					UnNumero = vunidad(n) & " " & vcentena(n) & " " & UnNumero
				end if
			case 4
				if n=1 then
					UnNumero = "mil " & UnNumero
				else
					UnNumero = vunidad(n) & vmillar(n) & " " & UnNumero
				end if
			case 5
				U=vunidad(cint(mid(strNum,4,1)))
				UnaDecena n,U
				UnNumero = U & vmillar(n) & " " & UnNumero
			case 6
				U=vunidad(cint(mid(strNum,4,1)))
				UnaDecena cint(mid(strNum,5,1)),U
				if n=1 then
					U = "cent " & U
				else
					U = vunidad(n) & " " & vcentena(n) & " " & U
				end if
				UnNumero = U & vmillar(n) & " " & UnNumero
		end select

	next

	if UnNumero="" then UnNumero="zero"
	
End Function 

sub UnaDecena(n,byref U)
	U = vdecena(n) & U
	if U = "deuun" then
		U = "onze"
	elseif U = "deudos" then
		U = "dotze"
	elseif U = "deutres" then
		U = "tretze"
	elseif U = "deuquatre" then
		U = "catorze"
	elseif U = "deucinc" then
		U = "quinze"
	elseif U = "deusis" then
		U = "setze"
	elseif U <> "deu" and U <> "vint" and U <> "trenta" and U <> "quaranta" and U <> "cincuanta" and U <> "seixanta" and U <> "setanta" and U <> "vuitanta" and U <> "noranta" then
		U = join(split(U,"deu"),"di")
		U = join(split(U,"vint"),"vint-i-")
		U = join(split(U,"trenta"),"trenta-")
		U = join(split(U,"quaranta"),"quaranta-")
		U = join(split(U,"cincuanta"),"cincuanta-")
		U = join(split(U,"seixanta"),"seixanta-")
		U = join(split(U,"setanta"),"setanta-")
		U = join(split(U,"vuitanta"),"vuitanta-")
		U = join(split(U,"noranta"),"noranta-")
	end if
end sub
%>