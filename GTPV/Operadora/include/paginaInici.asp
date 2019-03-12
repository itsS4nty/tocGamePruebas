<%

' --- PAGINAS DE INICIO -----------------------------------------------------------------------------------------------------------------

function paginas ( byval n )
	select case n
		case 2:
			paginas = "Resultats"
		case 4:
			paginas = "Gestió"
		case 5:
			paginas = "Gestió|Comandes|Factures|Resultats|TPV|CRM|APPCC"
		case 9, 99:
			paginas = "Gestió|Comandes|Factures|Resultats|TPV|CRM|APPCC|Útils"
		case else:
			paginas = "Gestió|Comandes|TPV|CRM|APPCC"
	end select
end function

function paginasV ( byval n )
	select case n
		case 2:
			paginasV = "/resultados/"
		case 4:
			paginasV = "/gestion/"
		case 5:
			paginasV = "/gestion/|/comandes/|/facturas/|/resultados/|/hw/|/crm/|/appcc/"
		case 9, 99:
			paginasV = "/gestion/|/comandes/|/facturas/|/resultados/|/hw/|/crm/|/appcc/|/utils/"
		case else:
			paginasV = "/gestion/|/comandes/|/hw/|/crm/|/appcc/"
	end select
end function

%>