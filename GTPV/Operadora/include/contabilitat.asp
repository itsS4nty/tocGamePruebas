<%

nombreMes = split("|ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE","|")
Trimestre = split("|Primer|Segundo|Tercer|Quarto|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE","|")

	Function ocultaValor(nValor) 	'Remplazamos el importe por *, para ocultarlo
		ocultaValor = nValor
		exit function 
		
		nValor = space((Len(nValor)))

		if len(nValor) >3 then  
			nValor = space((Len(nValor) -3))
			nValor = replace(nValor, " ", "#")
			nValor = nValor & ".##"
		else
			nValor = ""	
		end if  
		ocultaValor = nValor
	End Function


	sub CreaAsientoCtb (idN,O,C,Doc,Data,Desc,TipIva,Iva,SubC,Concepto,De,Ha,idFac) 	
		rec "Delete Norma43Conta Where IdNorma43 = '" & idN & "' And orden = '" & O & "' And Concepto in('HABER','DEBE','CONCEPTO','SUBCUENTA','IVA','T IVA','DESCRIPCIÓN','FECHA','N DOC','FacturaId','C') "

		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','FacturaId','" & idFac & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','C','" & C & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','N DOC','" & Doc & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','FECHA','" & Data & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','DESCRIPCIÓN','" & Desc & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','T IVA','" & TipIva & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','IVA','" & Iva & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','SUBCUENTA','" & SubC & "') "	
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','CONCEPTO','" & Concepto & "') "	
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','DEBE','" & De & "') "
		rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','HABER','" & Ha & "') "
	
		if O = 1 then 
			rec "Delete Norma43Conta Where IdNorma43 = '" & idN & "' And Concepto = 'NumRegistre'  AND Orden = '" & O & "'"
			rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'" & O & "', '" & idN & "','NumRegistre','" & ContabilitatNumRegistreNou  & "')  "
		end if
	end sub
	
sub GetaAsientoCtb (idN,O,C,Doc,Data,Desc,TipIva,Iva,SubC,Concepto,De,Ha) 	
	c =""
	set RsCtb = Rec("SELECT * FROM Norma43Conta WHERE idNorma43 = '" & idN & "' AND Orden  = '" & O & "' ")
	while not RsCtb.eof
	 	select case RsCtb("concepto")
			case "C" 
				c = RsCtb("Valor")
			case "N DOC" 
				Doc = RsCtb("Valor")
			case "FECHA" 
				Data = RsCtb("Valor")
			case "DESCRIPCIÓN" 
				Desc = RsCtb("Valor")
			case "T IVA" 
				TipIva = RsCtb("Valor")
			case "IVA" 
				iva = RsCtb("Valor")
			case "SUBCUENTA" 
				SubC = RsCtb("Valor")
			case "CONCEPTO" 
				Concepto = RsCtb("Valor")
			case "DEBE" 
				De = ocultaValor(RsCtb("Valor"))
			case "HABER" 
				Ha = ocultaValor(RsCtb("Valor"))
		end select
		RsCtb.movenext 
	wend
	RsCtb.close 
end sub

sub CreaRegistresCntbSiCal(idNorma43)
	if instr(idNorma43,"|") = 0 then 
		CreaRegistresCntbN43SiCal idNorma43
	else
		CreaRegistresCntMovbSiCal idNorma43
	end if	
end sub

sub CreaRegistresCntbN43SiCal(idNorma43)
	strSQL  = ""
	strSQL	= strSQL & "SELECT * FROM Norma43 " 
	strSQL  = strSQL & "RIGHT OUTER JOIN Norma43Conta ON Norma43.idNorma43 = Norma43Conta.idNorma43 "
	strSQL	= strSQL & "WHERE Norma43Conta.idNorma43 ='"  & idNorma43 & "' "
'	strSQL  = strSQL & "AND Norma43.Concepto1 LIKE 'COM%' "
	strSQL  = strSQL & "ORDER BY Norma43Conta.idNorma43, Norma43Conta.Orden "

	Set rsNorma43Conta 	= rec (strSQL)
	if rsNorma43Conta.eof then
		Set rsNorma43		= rec ("SELECT * FROM Norma43 RIGHT OUTER JOIN hit.dbo.CodigosEntidades c ON CAST( Norma43.Comu_Banco collate Modern_Spanish_CI_AS  AS CHAR(4)) = CAST(c.idEntidad AS CHAR(4)) WHERE Norma43.idNorma43 ='" & idNorma43 & "' ")

		if not rsNorma43.eof then
			nImporte 	= 0.0
			nImporte	= abs(rsNorma43("hit_Importe"))
			nFecha 	= rsNorma43("hit_DataOperacio")
			nDesc	= rsNorma43("Concepto1") & rsNorma43("Concepto2")
		
			nSubC1	= "4100" & rsNorma43("Comu_Banco")
			nSubC2  = "6645" & rsNorma43("Comu_Banco")
			nSubC3	= "47200000" ' & rsNorma43("Comu_Banco")
			nSubC4	= "5720" & rsNorma43("Comu_Banco")
			
			nConc	= rsNorma43("Entidad") & " PROVEÏDOR"
			nConc4	= rsNorma43("Entidad")

			dh = rsNorma43("DeveHaver")
			
			nIVA = (nImporte / 1.16) * 0.16
			nIVA = round(nIVA, 2)
			nIVA = abs(nIVA)	

			nCOM = (nImporte / 1.16)
			nCOM = round(nCOM, 2)
			NCOM = abs(nCOM)
			debe = ""
			haber = ""
			if rsNorma43("hit_Importe") < 0 then
				haber = cStr(nImporte)
			else
				debe = cStr(nImporte)
			end if
		
			nSubC1 = "572" & right("00000000" & rsNorma43("Comu_Banco"),5) 
			nConc = "No Asignado "			
		
			Select Case nConceptoComun
				Case "17","99":
					if ucase(trim(nDesc)) = "INTERESES" then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", cStr(nImporte), "", "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47300018" , "Hacienda Publica Retenciones 18% ", abs(nImporte - (nImporte / 0.82)),"", "Pendiente"
						CreaAsientoCtb idNorma43, "3", "C", "", nFecha, nDesc, "0", "", "7690" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", "", nImporte + ( abs(nImporte - (nImporte / 0.82)))  , "Pendiente"
'					elseif ucase(trim(nDesc)) = "COMISIONES BANCA A DISTANCIA" then 
'							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "...............", "", cStr(nImporte)
					elseif ucase(trim(nDesc))  = "ABON.LIQ.INT." or left(trim(nDesc),20) = "ABONAMENT INTERESSOS"  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", cStr(nImporte), "", "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "7690" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", "", nImporte  , "Pendiente"
					elseif ucase(trim(nDesc))  = "IMPOSTOS RET." then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Retencion Intereses a Cnta", cStr(nImporte), "", "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "4730" & rsNorma43("Comu_Banco") , "Retencion Intereses a Cnta", "", nImporte  , "Pendiente"
					elseif ucase(trim(nDesc))  = "COMISIONES" then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc, "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc , cStr(nImporte) , "", "Pendiente"
					elseif ucase(trim(nDesc))  = "MANTENIMENT" or ucase(trim(nDesc))  = "PREU SERVEI PAGAM."  then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc, "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc , cStr(nImporte) , "", "Pendiente"
					elseif left(trim(nDesc),7)  = "RETENCI" then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Retencion Intereses a Cnta", "",cStr(nImporte), "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "4730" & rsNorma43("Comu_Banco") , "Retencion Intereses a Cnta", nImporte,""   , "Pendiente"
					elseif ucase(trim(nDesc)) = "C.TRANSF.PL" then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					elseif ucase(trim(nDesc)) = "C.MANT. CCONL" then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					elseif ucase(trim(nDesc)) = "BONIF. COMIS." then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,   cStr(nImporte),"", "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, "", cStr(nImporte), "Pendiente"
					elseif ucase(trim(nDesc)) = "C.MANT. CCONL" then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					elseif ucase(trim(nDesc)) = "COM.DESCOBERT" or ucase(trim(nDesc)) = "SERVEI OB. DESCOB." then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					elseif ucase(trim(nDesc)) = "SERV.RECLAM.DESCUB"  then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					elseif ucase(trim(nDesc)) = "PREU SERVEI PAGAM."  then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					elseif left(trim(nDesc),20) = "IMPOST RENDA CAPITAL" then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "4730" & rsNorma43("Comu_Banco") , "Retencion " & nDesc, cStr(nImporte), "", "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "5720" & rsNorma43("Comu_Banco") , "Retencion " & nDesc, "", cStr(nImporte), "Pendiente"
					else
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, "0", "", "5720" & rsNorma43("Comu_Banco") , nDesc, "", cStr(nImporte), "Pendiente"
'							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, " ", "", "4000" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					end if	
				Case "02":
					if ucase(trim(nDesc)) = "COND. MANTENIMENT" then 
							CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,   cStr(nImporte),"", "Pendiente"
							CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, "", cStr(nImporte), "Pendiente"
					elseif ucase(trim(nDesc))  = "INTERESSOS" then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", cStr(nImporte), "", "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "7690" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", "", nImporte  , "Pendiente"
					elseif true then
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc, debe,haber, "Pendiente"
					end if
				Case "12":
					if left(trim(nDesc),20) = "PREU IMPAGAT TARG." then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc,  "", cStr(nImporte), "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "6260" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), "", "Pendiente"
					else
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc, debe,haber, "Pendiente"
					end if
				Case "04","03","15":
					if ucase(trim(nDesc)) = "ASSEGURANCES SOCIALS" then
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Seguretat Social Mes " & nombreMes(month(dateadd("m",-1,nfecha))) , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47600000" , "Seguretat Social Mes " & nombreMes(month(dateadd("m",-1,nfecha)))  , nImporte,"", "Pendiente"
					elseif instr(nDesc,"IMPUESTOS")>0 then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "63100000" , nDesc , nImporte,"", "Pendiente"
					elseif instr(nDesc,"SEG   UROS")>0 then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Seguretat Social Mes " & nombreMes(month(dateadd("m",-1,nfecha))) , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47600000" , "Seguretat Social Mes " & nombreMes(month(dateadd("m",-1,nfecha)))  , nImporte,"", "Pendiente"
					elseif instr(ucase(trim(nDesc)),"NOMINA") > 0   then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco")  , nDesc & " Mes " & nombreMes(month(nfecha)) , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "46500000" , nDesc & " Mes " & nombreMes(month(nfecha)) , nImporte,"", "Nomina"
						
						
						
					elseif instr(ucase(trim(nDesc)),"REBUT T.T.S.S.") > 0  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Seguretat Social Mes " & nombreMes(month(dateadd("m",-1,nfecha))) , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47600000" , "Seguretat Social Mes " & nombreMes(month(dateadd("m",-1,nfecha)))  , nImporte,"", "Pendiente"
					elseif instr(ucase(trim(nDesc)),"MOD 115") > 0  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Retenciones Alquileres " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47510002" , "Retenciones Alquileres " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , nImporte,"", "Pendiente"
					elseif instr(ucase(trim(nDesc)),"MOD 110") > 0  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Retenciones IRPF " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47510000" , "Retenciones IRPF " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , nImporte,"", "Pendiente"
					elseif instr(ucase(trim(nDesc)),"MOD 300") > 0  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "Importe Iva  " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47500000" , "Importe Iva  " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , nImporte,"", "Pendiente"
					elseif instr(ucase(trim(nDesc)),"MOD 202") > 0  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "A Cuenta Impuesto Sociedades " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47300000" , "A Cuenta Impuesto Sociedades " & Trimestre(int(month(nfecha) / 3) ) & " Trimestre" , nImporte,"", "Pendiente"
					elseif instr(ucase(trim(nDesc)),"MULTES") > 0  then 
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , ndesc , "", nImporte, "Pendiente"
						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "63100010" ,  ndesc, nImporte,"", "Pendiente"
					elseif true then
						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc, debe,haber, "Pendiente"
					end if
			
'				Case "98":
'					if ucase(trim(nDesc)) = "INTERESES" then 
'						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", cStr(nImporte), ""
'						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "47300018" & rsNorma43("Comu_Banco") , "Hacienda Publica Retenciones 18% ", "", cStr(nImporte * 0.18)
'						CreaAsientoCtb idNorma43, "3", "C", "", nFecha, nDesc, "0", "", "7690" & rsNorma43("Comu_Banco") , "INTERESES Bancarios", "", cStr(nImporte - (nImporte * 0.18))
'					else
'						CreaAsientoCtb idNorma43, "2", "C", "", nFecha, nDesc, "0", "", "5720" & rsNorma43("Comu_Banco") , nDesc, cStr(nImporte), ""
'						CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "6260" & rsNorma43("Comu_Banco") , nDesc, "", cStr(nImporte)
'					end if					
				Case Else
					CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "", "5720" & rsNorma43("Comu_Banco") , nDesc, debe,haber, "Pendiente"
			End Select	
			Set rsNorma43Conta 	= rec (strSQL)
		
		end if
		
		rsNorma43.Close
	end if
end sub 

sub CreaRegistresCntMovbSiCal(idNorma43)
	
	idNormaArr = split(idNorma43, "|")
	
	strSQL  = ""
	strSQL	= strSQL & "SELECT * FROM Norma43Conta "
	strSQL	= strSQL & "WHERE idnorma43 ='"  & idNorma43 & "' "
	strSQL  = strSQL & "ORDER BY idNorma43, Orden "

	Set rsNorma43Conta 	= rec (strSQL)
	if rsNorma43Conta.eof then
		Set rsNorma43M = rec ("SELECT * FROM " & tablaMoviments(idNormaArr(1)) & " where botiga='" & idNormaArr(0) & "' and data='" & idNormaArr(1) & "' and dependenta=" & idNormaArr(2))
		
		if not rsNorma43M.eof then
			nImporte 	= 0.0
			nImporte	= abs(rsNorma43M("Import"))
			nFecha 	= rsNorma43M("Data")
			nDesc	= rsNorma43M("Motiu") 
		
			nSubC1	= "40000001"
			nSubC2  = "57000000"
			nSubC3	= "57000000"
			nSubC4	= "57200001"
			
			nConc	= "CAJA EUROS EFECTIVO"
			nConc4	= "CAJA EUROS EFECTIVO"

			debe = ""
			haber = ""
			if rsNorma43M("Import")<0 then
				haber = cStr(nImporte)
			else
				debe= cStr(nImporte)
			end if
			nSubC1 = "57000000"
			nSubC1 = "570" & right("00000000" & idNormaArr(0),5)
			nConc = nDesc
			CreaAsientoCtb idNorma43, "1", "C", "", nFecha, nDesc, " ", "  ", nSubC1, nConc, debe, haber, "Pendiente"
			
			if rsNorma43M("Tipus_moviment") ="A"	 then
				if left(nDesc,7) = "Albara " then ' Albara 50403 a SILES
					p = instr(nDesc," ")
					pp = instr(p+2,nDesc,"a")
					AlbaraNum = mid(nDesc,p,pp-p)
					Data = 	rsNorma43M("Data")
					Botiga = rsNorma43M("Botiga") 
					Set rsNorma43M = rec ("SELECT Otros FROM " & tablaAlbarans(Data) & " where botiga='" & Botiga & "' and day(data) = '" & day(Data) & "' And num_tick = '" & AlbaraNum & "' ")
					B_Cliente = rsNorma43M ("Otros")
					ReferenciaInterna = B_Cliente 
					set rsCli = rec("SELECT c.* , cc.valor CodiContable FROM clients c left join constantsclient cc on c.codi=cc.codi and cc.variable='CodiContable' WHERE c.codi='" & B_Cliente & "'")
					CONCEP 	  = "Pago Albara N. " & AlbaraNum  				
					nConc  	  = "Pago A Cnta " & rsCli("Nom") 
					DATA_FAC  = Data 
					TOTAL_FAC = nImporte
					nSubC1 = "43" & right("00000000" & rsCli("CodiContable"),6)
					CreaAsientoCtb idNorma43, "2", "C", "", nFecha, CONCEP, " ", "  ", nSubC1, nConc,  haber,debe, "Pendiente"
					rec "Delete Norma43Conta Where IdNorma43 = '" & idNorma43 & "' And Concepto = 'ReferenciaInterna' and orden = 2 "		
					rec "Insert into Norma43Conta (idConta, Orden, idNorma43, concepto, valor) Values (newId(),'2', '" & idNorma43 & "','ReferenciaInterna','" & ReferenciaInterna & "') "
				end if
			end if
		
		end if
	end if
end sub 

function TaulaNorma43Conta()
	TaulaNorma43Conta = "Norma43Conta"
	if not exists ( TaulaNorma43Conta ) then
		dim sql
		sql = "Create Table " & TaulaNorma43Conta  & " ("
		sql = sql & "[idConta] [nvarchar](255) NULL, "
		sql = sql & "[idNorma43] [nvarchar](255) NULL, "
		sql = sql & "[valor] [nvarchar](255) NULL, "
		sql = sql & "[concepto] [nvarchar](255) NULL, "
		sql = sql & "[orden] [nvarchar](255) NULL "
		sql = sql & ") ON [PRIMARY] "
		rec sql
	end if
	
	if Session("IndexosCreatTots") ="" then
		rec "CREATE INDEX Norma43ContaIdConceptoOrden       ON Norma43Conta (IdNorma43,Concepto,orden)"	
		rec "CREATE INDEX Norma43ContaidContaConceptoOrden  ON Norma43Conta (idConta  ,Concepto,orden)"	
		rec "CREATE INDEX Norma43IdConceptoOrden  ON Norma43  (idNorma43)"	
		Session("IndexosCreatTots") ="Si"
	end if
	
end function

function ContabilitatNumRegistreNou()
		set rss = rec("Select isnull(max(cast(valor as numeric)),0) From Norma43Conta Where concepto = 'NumRegistre' ")
		ContabilitatNumRegistreNou = 10
		if not rss.eof then ContabilitatNumRegistreNou = cdbl(rss(0))
		ContabilitatNumRegistreNou = ContabilitatNumRegistreNou + 1
end function

		
%>