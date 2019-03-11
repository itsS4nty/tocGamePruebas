<%

	function insertMenuItems()
		strSQL = ""
		insert = "INSERT INTO [hit].[dbo].[Menus] (Menu, SubMenu, MenuText, Url, Img, Visible, Ordre) VALUES "
		
		'Menus Principales
		strSQL = strSQL & insert & "('ELFORN', NULL,'','', '', 1,0 ) "
		strSQL = strSQL & insert & "('RECORDA', NULL,'Recorda','recorda.asp', '', 1,1 ) "
		strSQL = strSQL & insert & "('CCOMPRES', NULL,'Gestió','compres.asp', '', 1,2 ) "
		strSQL = strSQL & insert & "('CPERSONAL', NULL,'Gestió','personal.asp', '', 1,3 ) "
		
		'Menus de ElForn
		strSQL = strSQL & insert & "('ELFORN','GESTIO','Gestió','gestion/', '', 1,0 ) "
		strSQL = strSQL & insert & "('ELFORN','COMANDES','Comandes','comandes/', '', 1,1 ) "
		strSQL = strSQL & insert & "('ELFORN','FACTURES','Factures','facturas/', '', 1,2 ) "
		strSQL = strSQL & insert & "('ELFORN','RESULTATS','Resultats','resultados/', '', 1,3 ) "
		strSQL = strSQL & insert & "('ELFORN','CRM','CRM','crm/', '', 1,4 ) "
		strSQL = strSQL & insert & "('ELFORN','APPCC','APPCC','appcc/', '', 1,5 ) "
		strSQL = strSQL & insert & "('ELFORN','UTILS','Útils','utils/', '', 1,6 ) "
		strSQL = strSQL & insert & "('ELFORN','TPV','TPV','hw/', '', 1,7 ) "
		
		'Menus de ElForn > Gestió
		strSQL = strSQL & insert & "('GESTIO','','Equips','gestion/equips.asp', '', 1,0 ) "
		strSQL = strSQL & insert & "('GESTIO','','Dependentes - Treballadors','gestion/treballadors.asp', 'dependentes.gif', 1,1 ) "
		strSQL = strSQL & insert & "('GESTIO','','Grups de Treball','gestion/equips.asp', 'viatgeEquip.gif', 1,2 ) "
		strSQL = strSQL & insert & "('GESTIO','','Viatges','gestion/viatges.asp', 'viatgeEquip.gif', 1,3 ) "
		strSQL = strSQL & insert & "('GESTIO','','Rutes','gestion/rutes.asp', 'viatgeEquip.gif', 1,4 ) "
		strSQL = strSQL & insert & "('GESTIO','','Productes','gestion/productes.asp', 'productes.gif', 1,5 ) "
		strSQL = strSQL & insert & "('GESTIO','','Tarifes Especials','gestion/tarifesp.asp', 'productes.gif', 1,6 ) "
		strSQL = strSQL & insert & "('GESTIO','','Families de Productes','gestion/families.asp', 'families.gif', 1,7 ) "
		strSQL = strSQL & insert & "('GESTIO','','Botigues i Clients','gestion/botigues.asp', 'botigues.gif', 1,8 ) "
		strSQL = strSQL & insert & "('GESTIO','','Horaris','gestion/hores.asp', 'horaris.gif', 1,9 ) "
		strSQL = strSQL & insert & "('GESTIO','','Fórmules','gestion/formulas.asp', 'masses.gif', 1,10 ) "
		strSQL = strSQL & insert & "('GESTIO','','Masses','gestion/masas.asp', 'masses.gif', 1,11 ) "
		
		'Menus de ElForn > Comandes
		strSQL = strSQL & insert & "('COMANDES','','Plantilles','comandes/plantilles.asp', 'plantilles.gif', 1, 0 ) "
		strSQL = strSQL & insert & "('COMANDES','','Comandes','comandes/llistaComandes.asp', 'comandes.gif', 1, 1 ) "
		strSQL = strSQL & insert & "('COMANDES','','Albarans','comandes/albarans.asp', 'albarans.gif', 1, 2 ) "
		strSQL = strSQL & insert & "('COMANDES','','Consultes','comandes/consultes.asp', 'consultes.gif', 1, 3 ) "
		strSQL = strSQL & insert & "('COMANDES','','Llistats','comandes/llistats.asp', '', 1, 4 ) "
		strSQL = strSQL & insert & "('COMANDES','','Útils','comandes/configFrames.asp', 'utils.gif', 1, 5 ) "
		strSQL = strSQL & insert & "('COMANDES','','Vendes','comandes/vendes.asp', 'vendes.gif', 1, 6 ) "
		strSQL = strSQL & insert & "('COMANDES','','Carros','comandes/carros.asp', 'carros.gif', 1, 7 ) "
		
		'Menus de ElForn > Factures
		strSQL = strSQL & insert & "('FACTURES','','Petició de Factura','facturas/peticio.asp', 'peticioFactura.gif', 1, 0 ) "
		strSQL = strSQL & insert & "('FACTURES','','Paràmetres de Factura','facturas/parametres.asp', 'parametresFactura.gif', 1, 1 ) "
		strSQL = strSQL & insert & "('FACTURES','','Factura Directa','facturas/facturaDirecta.asp', 'facturaDirecta.gif', 1, 2 ) "
		strSQL = strSQL & insert & "('FACTURES','','Factura en PDF','facturas/facturaPDF.asp', 'facturaPDF.gif', 1, 3 ) "
		strSQL = strSQL & insert & "('FACTURES','','Diari Vendes','facturas/diariVendes.asp', 'diariVendes.gif', 1, 4 ) "
		strSQL = strSQL & insert & "('FACTURES','','Validar Factures','facturas/validarFactura.asp', 'validarFactura.gif', 1, 5 ) "
		strSQL = strSQL & insert & "('FACTURES','','Gestió de Rebuts','facturas/GestioRebuts.asp', '', 1, 6 ) "

		'Menus de ElForn > Resultats
		strSQL = strSQL & insert & "('RESULTATS','','Consultar Vendes','resultados/vendes.asp', 'consultarvendes.gif', 1, 0 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Consultar Factures','resultados/factures.asp', 'consultarvendes.gif', 1, 1 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Veure Tickets','resultados/padretiquet.asp', 'veuretickets.gif', 1, 2 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Moviments','resultados/moviments.asp', 'calculs.gif', 1, 3 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Hores Realitzades','resultados/horarios.asp?reset=si', 'horesrealitzades.gif', 1, 4 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Càlculs','resultados/calculs.asp', 'calculs.gif', 1, 5 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Magatzem','resultados/magatzem.asp', 'magatzem.gif', 1, 6 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Quadrar Caixa','resultados/resumdia.asp', 'quadrarcaixa.gif', 1, 7 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Gràfic Vendes','resultados/graficaVentas.asp', 'graficsvendes.gif', 1, 8 ) "
		strSQL = strSQL & insert & "('RESULTATS','','Bancs','resultados/bancs.asp', 'bancs.gif', 1, 9 ) "

		'Menus de ElForn > CRM
		strSQL = strSQL & insert & "('CRM','','Promocions','crm/promocions.asp', 'promocions.gif', 1,0 ) "
		strSQL = strSQL & insert & "('CRM','','Clients Finals','crm/llistaclient.asp?Reset=si', 'clientsFinals.gif', 1,1 ) "
		strSQL = strSQL & insert & "('CRM','','Demanar Targetes','crm/targetes.asp', 'targetes.gif', 1,2 ) "
		strSQL = strSQL & insert & "('CRM','','Resultats Productes','crm/resultats.asp?modo=articles', 'resultatsProductes.gif', 1,3 ) "
		strSQL = strSQL & insert & "('CRM','','Resultats Clients','crm/resultats.asp?modo=clientsFinals', 'resultatsClients.gif', 1,4 ) "
		
		'Menus de ElForn > APPCC
		strSQL = strSQL & insert & "('APPCC','','Neteja','appcc/neteja.asp', 'neteja.gif', 1,0 ) "
		strSQL = strSQL & insert & "('APPCC','','Aixetes','appcc/aixetes.asp', 'aixetes.gif', 1,1 ) "
		strSQL = strSQL & insert & "('APPCC','','Asignació de tasques','appcc/tareas.asp', 'AsignacioTasques.gif', 1,2 ) "
		strSQL = strSQL & insert & "('APPCC','','Freqüència de la neteja','appcc/tasques.asp', 'tasques.gif', 1,3 ) "
		
		'Menus de ElForn > UTILS
		strSQL = strSQL & insert & "('UTILS','','Usuaris','utils/usuaris.asp', 'usuaris.gif', 1,0 ) "
		strSQL = strSQL & insert & "('UTILS','','Agenda','utils/agenda.asp', 'agenda.gif', 1,1 ) "
		
		'Menus de ElForn > TPV
		strSQL = strSQL & insert & "('TPV','','Teclats','hw/teclats.asp', 'teclats.gif', 1,0 ) "
		strSQL = strSQL & insert & "('TPV','','Vendes al detall','hw/', 'vendesDetall.gif', 1,1 ) "
					
		rec (strSQL)
	end function
%>