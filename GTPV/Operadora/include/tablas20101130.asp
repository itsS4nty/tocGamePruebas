<%

'Session.LCID=2057
'SetLocale(2057)


	if len(Session("conMasterOpen"))>0  then 
		Set con = Session("conMaster")
		if con.State = 0  then
			con.open Session("conMasterOpen")
			Set Session("conMaster") = con 
		end if	
	end if
'response.write Session("UsuariLogat")
	
'	if len(Session("UsuariLogat"))>0  then 
'response.write "Si"	
'		Reconecta = true
'		if isobject(Session("UserConnectionOpen")) then if Session("UserConnection").State = 1 then Reconecta =false
'		if Reconecta then 
'			Set miCon = Server.CreateObject("ADODB.Connection")
'			miCon.Open "WSID=" & Request.ServerVariables("REMOTE_ADDR") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=Hit;Server=" & Sec_Hit_Server() & ";Driver={SQL Server};DSN='';"
'			Session("Iniciat") = "Si"
'			set Session("HitConnection") = miCon
			
'			Set miCon = Server.CreateObject("ADODB.Connection")
'			miCon.Open "WSID=" & Us & "_" & Session("Usuari_Empresa_Db") & ";UID=" & Sec_Hit_User() & ";PWD=" & Sec_Hit_Pswd() & ";Database=" & Session("Usuari_Empresa_Db") & ";Server=" & Session("Usuari_Empresa_Servidor") & ";Driver={SQL Server};DSN='';"
'			Session("UserConnection") = miCon
'			Session("UsuariLogat")="Si"
'		end if	
'	end if
	
	if len(Session("HitConnectionOpen"))>0  then 
		Set con = Session("HitConnection")
		if con.State = 0  then
			con.open Session("HitConnectionOpen")
		Set Session("HitConnection") = con 
		end if	
	end if

camposTabla = split("Nom,Nif,Adresa,Ciutat,CodiPostal,Tel,Fax,Mail,ServidorSMTP,UsuariSMTP,ContrasenyaSMTP,PORT,Idioma,Mercantil,CompteCorrent,RSI,Lliure,SeguentFactura,SerieDeFactura,DSubcuenta,RecEquivalencia",",")
redim valoresTabla ( ubound(camposTabla) )

sub rellenaConstantsEmpresa ( byval n )
	for i=0 to ubound(camposTabla)
		rec "insert into ConstantsEmpresa(camp,valor) values('" & n & camposTabla(i) & "',null)"
	next
end sub

'----------------------------------------------------------------------------------------------------------------------------------------
'--- Repara las tablas antiguas de APPCC ------------------------------------------------------------------------------------------------

' if ( session("portal") = "RECORDA" or session("portal") = "CDC" ) and Session("UsuariLogat") = "Si"  and not session("ccReparado") = true then repareOldTables

sub repareOldTables ( )
	alterTable tablaMateriasPrimas ( ), "codigo",        "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "caducidad",     "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "refrigeracion", "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "barcode",       "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "almacen",       "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "etiqueta",      "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "proveedor",     "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "tipoEnvio",     "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "nevera",        "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "ubicacion",     "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "almacen",       "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "unidadesEnvio", "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "temperatura",   "nvarchar (255) NULL"
	alterTable tablaMateriasPrimas ( ), "etiquetado",    "bit NULL CONSTRAINT [DF_ccMateriasPrimas_etiquetado] DEFAULT (1)"
	alterTable tablaMateriasPrimas ( ), "envasado",      "bit NULL"
	alterTable tablaMateriasPrimas ( ), "unidades",      "numeric (18, 2) NULL"
	alterTable tablaMateriasPrimas ( ), "stockMin",      "numeric (18, 2) NULL"
	alterTable tablaPedidos ( ),        "recepcion",     "datetime NULL CONSTRAINT [DF_ccPedidos_recepcion]    DEFAULT (getdate())"
	alterTable tablaRecepcion ( ),      "caducidad",     "datetime NULL CONSTRAINT [DF_ccRecepcion_caducidad]  DEFAULT (getdate())"
	alterTable tablaStock ( ),          "activo",        "bit NULL CONSTRAINT [DF_ccStock_activo] DEFAULT (1)"
	alterTable tablaAppccTareas ( ),    "tipo",          "nvarchar (255) NULL"
	alterTable tablaAppccTareas ( ),    "donde",         "nvarchar (255) NULL"	
	rec "update " & tablaAppccTareas ( ) & " set tipo='NETEJA' where tipo is null"
	session("ccReparado") = true
end sub

' FUNCIONES PARA TRABAJAR CON LAS TABLAS DE LA BASE DE DATOS

' --- SI LAS TABLAS NO EXISTEN SE CREAN ---------------------------------------------------------------------------------------------------

function tablaFormulaMasa ( )
	tablaFormulaMasa = "formulaMasa"
	if not exists ( tablaFormulaMasa ) then
		dim sqlFM
		sqlFM = "create table " & tablaFormulaMasa & " ("
		sqlFM = sqlFM & "	id  numeric  (18, 0),"
		sqlFM = sqlFM & "	nom nvarchar (255),"
		sqlFM = sqlFM & "	kg  numeric  (18, 2),"
		sqlFM = sqlFM & "	grup nvarchar (255) NULL "
		sqlFM = sqlFM & ") on [primary]"
		rec sqlFM
	end if
end function

function tablaFormulaMasaZombis ( )
	tablaFormulaMasaZombis = "formulaMasaZombis"
	if not exists ( tablaFormulaMasaZombis ) then
		dim sqlFM
		sqlFM = "create table " & tablaFormulaMasaZombis & " ("
		sqlFM = sqlFM & "	id  numeric  (18, 0),"
		sqlFM = sqlFM & "	nom nvarchar (255),"
		sqlFM = sqlFM & "	kg  numeric  (18, 2),"
		sqlFM = sqlFM & "	grup nvarchar (255) NULL "		
		sqlFM = sqlFM & ") on [primary]"
		rec sqlFM
	end if
end function


function tablaFormulaMasaDetalle ( )
	tablaFormulaMasaDetalle = "formulaMasaDetalle"
	if not exists ( tablaFormulaMasaDetalle ) then
		dim sqlFM
		sqlFM = "create table " & tablaFormulaMasaDetalle & " ("
		sqlFM = sqlFM & "	id       nvarchar (255) null constraint [DF_" & tablaFormulaMasaDetalle & "_id] default (newid()), "
		sqlFM = sqlFM & "	formula  numeric  (18, 0) NULL, "
		sqlFM = sqlFM & "	materia  nvarchar (255) NULL, "
		sqlFM = sqlFM & "	kg       numeric  (18, 2) NULL, "
		sqlFM = sqlFM & "	tipo     nvarchar (50) NULL, "
		sqlFM = sqlFM & "	ordre    numeric  (18, 0) NULL, "
		sqlFM = sqlFM & "	unidades nvarchar (100) NULL "
		sqlFM = sqlFM & ") on [primary]"
		rec sqlFM
	end if
end function

function tablaVentas ( byval D )
    if Session("Usuari_NivellSeguretat") = 5 then
		tablaVentas = "[V_Venut_Previsio_" & year(D) & "-" & right("00" & month(D),2) & "]"
    else
		tablaVentas = "[V_Venut_" & year(D) & "-" & right("00" & month(D),2) & "]"
	end if
	if not exists (tablaVentas) then
		sqlCTV = "CREATE TABLE [dbo]." & tablaVentas & " ([Botiga] [float] NULL ,[Data] [datetime] NULL ,"
		sqlCTV = sqlCTV & "[Dependenta] [float] NULL ,[Num_tick] [float] NULL ,[Estat] [nvarchar] (25) NULL ,"
		sqlCTV = sqlCTV & "[Plu] [float] NULL ,[Quantitat] [float] NULL ,[Import] [float] NULL ,"
		sqlCTV = sqlCTV & "[Tipus_venta] [nvarchar] (25) NULL ,[FormaMarcar] [nvarchar] (255) NULL "
		sqlCTV = sqlCTV & "DEFAULT (''),[Otros] [nvarchar] (255) NULL "
		sqlCTV = sqlCTV & "DEFAULT ('')) ON [PRIMARY]"
		rec sqlCTV
	end if
end function

function tablaAnulats ( byval D )
	tablaAnulats = "[V_Anulats_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaAnulats) then
		sqlCTA = "CREATE TABLE [dbo]." & tablaAnulats & " ([Botiga] [float] NULL ,[Data] [datetime] NULL ,[Dependenta] [float] NULL ,"
		sqlCTA = sqlCTA & "[Num_tick] [float] NULL ,[Estat] [nvarchar] (25) NULL ,[Plu] [float] NULL ,[Quantitat] [float] NULL ,"
		sqlCTA = sqlCTA & "	[Import] [float] NULL ,[Tipus_venta] [nvarchar] (25) NULL ,[FormaMarcar] [nvarchar] (255) NULL ,"
		sqlCTA = sqlCTA & "[Otros] [nvarchar] (255) NULL) ON [PRIMARY]"
		rec sqlCTA
	end if
end function

function tablaAlertes ( byval D )
	tablaAlertes = "[V_Alertes_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaAlertes) then
		sqlCTA = "CREATE TABLE [dbo]." & tablaAlertes & " ([Id] [uniqueidentifier] NULL CONSTRAINT "
		sqlCTA = sqlCTA & "[DF__V_Alertes_" & year(D) & "_" & right("00" & month(D),2) & "_ID] DEFAULT (newid()),[Data] [datetime] NULL ,"
		sqlCTA = sqlCTA & "[Texte] [nvarchar] (255) NULL ,[Revisada] [int] NULL CONSTRAINT [DF__V_Alertes__Revis__01DB011D] DEFAULT (0),"
		sqlCTA = sqlCTA & "[Param1] [nvarchar] (255) NULL ,[Param2] [nvarchar] (255) NULL ,[Param3] [nvarchar] (255) NULL ,"
		sqlCTA = sqlCTA & "[Param4] [nvarchar] (255) NULL) ON [PRIMARY]"
		rec sqlCTA
	end if
end function

function tablaHoraris ( byval D )
	tablaHoraris = "[V_Horaris_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaHoraris) then
		sqlCTH = "CREATE TABLE [dbo]." & tablaHoraris & " ([Botiga] [float] NULL ,[Data] [datetime] NULL ,[Dependenta] [float] NULL ,"
		sqlCTH = sqlCTH & "[Operacio] [nvarchar] (25) NULL) ON [PRIMARY]"
		rec sqlCTH
	end if
end function

function tablaDependentesExtes()
	tablaDependentesExtes = "dependentesExtes"
	if not exists (tablaDependentesExtes) then
		sqlCTDE = "CREATE TABLE [dbo].[" & tablaDependentesExtes & "] ([id] [nvarchar] (255) NULL ,"
		sqlCTDE = sqlCTDE & "[nom] [nvarchar] (255) NULL ,[valor] [nvarchar] (255) NULL ) ON [PRIMARY]"
		rec sqlCTDE
	end if
end function

function tablaArticlesExtes()
	tablaArticlesExtes = "articlesExtes"
	if not exists (tablaArticlesExtes) then
		sqlCTAE = "CREATE TABLE [dbo].[" & tablaArticlesExtes & "] ([id] [nvarchar] (255) NULL ,"
		sqlCTAE = sqlCTAE & "[nom] [nvarchar] (255) NULL ,[valor] [nvarchar] (4000) NULL ) ON [PRIMARY]"
		rec sqlCTAE
	else
		set rsL = rec ( "select COL_LENGTH ('" & tablaArticlesExtes & "','valor')/2 c" )
		if not rsL.eof then
			if rsL("c") < 4000 then rec "alter table " & tablaArticlesExtes & " alter column valor nvarchar (4000)"
		end if
	end if
end function

function tablaMoviments ( byval D )
   tablaMoviments = "[V_Moviments_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaMoviments) then
		sqlCTM = "CREATE TABLE [dbo]." & tablaMoviments & " ("
		SqlCTM = SqlCTM & "[Botiga] [float] NULL , "
		SqlCTM = SqlCTM & "[Data] [datetime] NULL , "
		SqlCTM = SqlCTM & "[Dependenta] [float] NULL ,"
		SqlCTM = SqlCTM & "[Tipus_moviment] [nvarchar] (25) NULL ,"
		SqlCTM = SqlCTM & "[Import] [float] NULL ,"
		SqlCTM = SqlCTM & "[Motiu] [nvarchar] (250) NULL "
		SqlCTM = SqlCTM & ") ON [PRIMARY]"
		rec sqlCTM
	end if
end function

function tablaMovimentsExtendido ( byval D )
   tablaMovimentsExtendido = "[V_Moviments_" & year(D) & "-" & right("00" & month(D),2) & "_Extendido]"
   if not exists (tablaMovimentsExtendido) then
		sqlCTM = "CREATE TABLE [dbo]." & tablaMovimentsExtendido & " ("
		SqlCTM = SqlCTM & "[Id] [nvarchar] (255) NULL Default (NEWID()), "
		SqlCTM = SqlCTM & "[Botiga] [float] NULL, "
		SqlCTM = SqlCTM & "[Data] [datetime] NULL, "
		SqlCTM = SqlCTM & "[Tipus_moviment] [nvarchar] (25) NULL, "
		SqlCTM = SqlCTM & "[Estat] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Comentari] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Libre_1] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Libre_2] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Libre_3] [nvarchar] (255) NULL "
		SqlCTM = SqlCTM & ") ON [PRIMARY]"
		rec sqlCTM
   end if
end function 

function tablaMovimentsEstat ( byval D )
   tablaMovimentsEstat = "[V_Moviments_" & year(D) & "-" & right("00" & month(D),2) & "_Estat]"
   if not exists (tablaMovimentsEstat) then
		sqlCTM = "CREATE TABLE [dbo]." & tablaMovimentsEstat & " ("
		SqlCTM = SqlCTM & "[Id] [nvarchar] (255) NULL Default (NEWID()), "
		SqlCTM = SqlCTM & "[CodiBarres] [float] NULL, "
		SqlCTM = SqlCTM & "[Moviment] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Botiga] [float] NULL, "
		SqlCTM = SqlCTM & "[Data] [datetime] NULL, "
		SqlCTM = SqlCTM & "[Tipus_moviment] [nvarchar] (25) NULL, "
		SqlCTM = SqlCTM & "[Estat] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Comentari] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Libre_1] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Libre_2] [nvarchar] (255) NULL, "
		SqlCTM = SqlCTM & "[Libre_3] [nvarchar] (255) NULL "
		SqlCTM = SqlCTM & ") ON [PRIMARY]"
		rec sqlCTM
   end if
 end function 


function tablaAlbarans(byval D)
	tablaAlbarans = "[v_albarans_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaAlbarans) then
		sqlCTA = "CREATE TABLE [dbo]." & tablaAlbarans & " ([Botiga] [float] NULL ,[Data] [datetime] NULL ,[Dependenta] [float] NULL ,"
		sqlCTA = sqlCTA & "[Num_tick] [float] NULL ,[Estat] [nvarchar] (25) NULL ,[Plu] [float] NULL ,[Quantitat] [float] NULL ,"
		sqlCTA = sqlCTA & "[Import] [float] NULL ,[Tipus_venta] [nvarchar] (25) NULL ,"
		sqlCTA = sqlCTA & "[FormaMarcar] [nvarchar] (255) NULL CONSTRAINT "
		sqlCTA = sqlCTA & "[DF__V_Albaran_" & year(D) & "-" & right("00" & month(D),2) & "_FM] DEFAULT (''),"
		sqlCTA = sqlCTA & "[Otros] [nvarchar] (255) NULL CONSTRAINT "
		sqlCTA = sqlCTA & "[DF__V_Albaran__" & year(D) & "-" & right("00" & month(D),2) & "_OT] DEFAULT ('')) ON [PRIMARY]"
		rec sqlCTA
	end if
end function

function tablaRevisats ( byval D )
	tablaRevisats = "[V_Revisat_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaRevisats) then
		sql = "CREATE TABLE " & tablaRevisats & " ("
        sql = sql & "[Botiga]          [float]    NULL, "
        sql = sql & "[DataRevisio]     [datetime] NULL, "
        sql = sql & "[DataComanda]     [datetime] NULL, "
        sql = sql & "[Article]         [float]    NULL, "
        sql = sql & "[Viatge]          [nvarchar](255) NULL, "
        sql = sql & "[Equip]           [nvarchar](255) NULL, "
        sql = sql & "[Dependenta]      [float]    NULL, "
        sql = sql & "[Estat]           [nvarchar](25) NULL, "
        sql = sql & "[Aux]             [nvarchar](255) NULL "
        sql = sql & ") ON [PRIMARY]"
	
		rec sql
	end if
end function

function tablaServits(byval D)
	dim Sql,SqlCTS,Nomtaula
	
	tablaServits = "Servit-" & right(year(D),2) & "-" & right("00" & month(D),2) & "-" & right("00" & day(D),2) & ""
	Nomtaula = tablaServits
	
	if not exists ("[" & tablaServits & "]") then

		SqlCTS = "CREATE TABLE [dbo].[" & tablaServits & "] ("
		SqlCTS = SqlCTS & "[Id]                [uniqueidentifier] Default (NEWID()),"
		SqlCTS = SqlCTS & "[TimeStamp]         [datetime]              Default (GetDate())  ,"
		SqlCTS = SqlCTS & "[QuiStamp]          [nvarchar] (255)        Default (Host_Name()),"
		SqlCTS = SqlCTS & "[Client]            [float]          Null ,"
		SqlCTS = SqlCTS & "[CodiArticle]       [int]            Null ,"
		SqlCTS = SqlCTS & "[PluUtilitzat]      [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Viatge]            [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Equip]             [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[QuantitatDemanada] [float]                 Default (0),"
		SqlCTS = SqlCTS & "[QuantitatTornada]  [float]                 Default (0),"
		SqlCTS = SqlCTS & "[QuantitatServida]  [float]                 Default (0),"
		SqlCTS = SqlCTS & "[MotiuModificacio]  [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Hora]              [float]          Null ,"
		SqlCTS = SqlCTS & "[TipusComanda]      [float]          Null ,"
		SqlCTS = SqlCTS & "[Comentari]         [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[ComentariPer]      [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Atribut]           [Int]            Null ,"
		SqlCTS = SqlCTS & "[CitaDemanada]      [nvarchar] (255)        Default (''),"
		SqlCTS = SqlCTS & "[CitaServida]       [nvarchar] (255)        Default (''),"
		SqlCTS = SqlCTS & "[CitaTornada]       [nvarchar] (255)        Default ('') "
		SqlCTS = SqlCTS & ") ON [PRIMARY]"
		rec SqlCTS

		Sql = "CREATE TABLE [" & tablaServits & "Trace] ("
		Sql = Sql & "[Modificat]         [datetime]              Default (GetDate())  ,"
		Sql = Sql & "[Id]                [nvarchar] (255) Null ,"
		Sql = Sql & "[TimeStamp]         [datetime]       Null ,"
		Sql = Sql & "[QuiStamp]          [nvarchar] (255) Null ,"
		Sql = Sql & "[Client]            [float]          Null ,"
		Sql = Sql & "[CodiArticle]       [int]            Null ,"
		Sql = Sql & "[PluUtilitzat]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Viatge]            [nvarchar] (255) Null ,"
		Sql = Sql & "[Equip]             [nvarchar] (255) Null ,"
		Sql = Sql & "[QuantitatDemanada] [float]                 Default (0),"
		Sql = Sql & "[QuantitatTornada]  [float]                 Default (0),"
		Sql = Sql & "[QuantitatServida]  [float]                 Default (0),"
		Sql = Sql & "[MotiuModificacio]  [nvarchar] (255) Null ,"
		Sql = Sql & "[Hora]              [float]          Null ,"
		Sql = Sql & "[TipusComanda]      [float]          Null ,"
		Sql = Sql & "[Comentari]         [nvarchar] (255) Null ,"
		Sql = Sql & "[ComentariPer]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Atribut]           [Int]            Null ,"
		Sql = Sql & "[CitaDemanada]      [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaServida]       [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaTornada]       [nvarchar] (255)        Default ('') "
		Sql = Sql & ") ON [PRIMARY]"
		rec  Sql

		rec  "DROP TRIGGER [M_" & tablaServits & "] "

		Sql = "CREATE TRIGGER [M_" & Nomtaula & "] ON [" & Nomtaula & "] "
		Sql = Sql & "AFTER INSERT,UPDATE,DELETE AS "
		Sql = Sql & "Update [" & Nomtaula & "] Set [TimeStamp] = GetDate(),    [QuiStamp]  = Host_Name() Where Id In (Select Id From Inserted) "
		Sql = Sql & "Insert Into ComandesModificades Select Id As Id,GetDate() As [TimeStamp],'" & Nomtaula & "' As TaulaOrigen From Inserted "
		Sql = Sql & "Insert into [" & Nomtaula & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from [" & Nomtaula & "] Where Id In (Select Id From Inserted)"
		Sql = Sql & "Insert into [" & Nomtaula & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp]+'BORRAT!!!',Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from deleted Where not Id In (Select Id From Inserted) "
		Sql = Sql & "If Update (QuantitatTornada)  Update [" & Nomtaula & "] Set [CitaTornada]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatTornada  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaTornada]  AS VarChar(255)) Where Id In (Select Id From Inserted) "
		Sql = Sql & "If Update (QuantitatServida)  Update [" & Nomtaula & "] Set [CitaServida]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatServida  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaServida]  AS VarChar(255)) Where Id In (Select Id From Inserted) "
		Sql = Sql & "If Update (QuantitatDemanada) Update [" & Nomtaula & "] Set [CitaDemanada] = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatDemanada AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaDemanada] AS VarChar(255)) Where Id In (Select Id From Inserted) "
		rec  Sql
	end if

	if not exists ("[" & tablaServits & "Trace]") then
		Sql = "CREATE TABLE [" & tablaServits & "Trace] ("
		Sql = Sql & "[Modificat]         [datetime]              Default (GetDate())  ,"
		Sql = Sql & "[Id]                [nvarchar] (255) Null ,"
		Sql = Sql & "[TimeStamp]         [datetime]       Null ,"
		Sql = Sql & "[QuiStamp]          [nvarchar] (255) Null ,"
		Sql = Sql & "[Client]            [float]          Null ,"
		Sql = Sql & "[CodiArticle]       [int]            Null ,"
		Sql = Sql & "[PluUtilitzat]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Viatge]            [nvarchar] (255) Null ,"
		Sql = Sql & "[Equip]             [nvarchar] (255) Null ,"
		Sql = Sql & "[QuantitatDemanada] [float]                 Default (0),"
		Sql = Sql & "[QuantitatTornada]  [float]                 Default (0),"
		Sql = Sql & "[QuantitatServida]  [float]                 Default (0),"
		Sql = Sql & "[MotiuModificacio]  [nvarchar] (255) Null ,"
		Sql = Sql & "[Hora]              [float]          Null ,"
		Sql = Sql & "[TipusComanda]      [float]          Null ,"
		Sql = Sql & "[Comentari]         [nvarchar] (255) Null ,"
		Sql = Sql & "[ComentariPer]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Atribut]           [Int]            Null ,"
		Sql = Sql & "[CitaDemanada]      [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaServida]       [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaTornada]       [nvarchar] (255)        Default ('') "
		Sql = Sql & ") ON [PRIMARY]"
		rec  Sql
   
		Sql = "DROP TRIGGER [M_" & tablaServits & "] "
		rec  Sql
   
		Sql = "CREATE TRIGGER [M_" & Nomtaula & "] ON [" & Nomtaula & "] "
		Sql = Sql & "AFTER INSERT,UPDATE,DELETE AS "
		Sql = Sql & "Update [" & Nomtaula & "] Set [TimeStamp] = GetDate(),    [QuiStamp]  = Host_Name() Where Id In (Select Id From Inserted) "
		Sql = Sql & "Insert Into ComandesModificades Select Id As Id,GetDate() As [TimeStamp],'" & Nomtaula & "' As TaulaOrigen From Inserted "
		Sql = Sql & "Insert into [" & Nomtaula & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from [" & Nomtaula & "] Where Id In (Select Id From Inserted)"
		Sql = Sql & "Insert into [" & Nomtaula & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp]+'BORRAT!!!',Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from deleted Where not Id In (Select Id From Inserted) "
		Sql = Sql & "If Update (QuantitatTornada)  Update [" & Nomtaula & "] Set [CitaTornada]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatTornada  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaTornada]  AS VarChar(255)) Where Id In (Select Id From Inserted) "
		Sql = Sql & "If Update (QuantitatServida)  Update [" & Nomtaula & "] Set [CitaServida]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatServida  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaServida]  AS VarChar(255)) Where Id In (Select Id From Inserted) "
		Sql = Sql & "If Update (QuantitatDemanada) Update [" & Nomtaula & "] Set [CitaDemanada] = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatDemanada AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaDemanada] AS VarChar(255)) Where Id In (Select Id From Inserted) "
		
		rec  Sql
	end if
	
	tablaServits = "[" & tablaServits & "]"

end function

function tablaServitsJB (byval D)
	dim Sql,SqlCTS,Nomtaula
	
	tablaServitsJB = "Servit-" & right(year(D),2) & "-" & right("00" & month(D),2) & "-" & right("00" & day(D),2) 
	
	if not exists ("fac_jordibosch.dbo.[" & tablaServitsJB & "]") then

		SqlCTS = "CREATE TABLE fac_jordibosch.dbo.[" & tablaServitsJB & "] ("
		SqlCTS = SqlCTS & "[Id]                [uniqueidentifier] Default (NEWID()),"
		SqlCTS = SqlCTS & "[TimeStamp]         [datetime]              Default (GetDate())  ,"
		SqlCTS = SqlCTS & "[QuiStamp]          [nvarchar] (255)        Default (Host_Name()),"
		SqlCTS = SqlCTS & "[Client]            [float]          Null ,"
		SqlCTS = SqlCTS & "[CodiArticle]       [int]            Null ,"
		SqlCTS = SqlCTS & "[PluUtilitzat]      [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Viatge]            [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Equip]             [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[QuantitatDemanada] [float]                 Default (0),"
		SqlCTS = SqlCTS & "[QuantitatTornada]  [float]                 Default (0),"
		SqlCTS = SqlCTS & "[QuantitatServida]  [float]                 Default (0),"
		SqlCTS = SqlCTS & "[MotiuModificacio]  [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Hora]              [float]          Null ,"
		SqlCTS = SqlCTS & "[TipusComanda]      [float]          Null ,"
		SqlCTS = SqlCTS & "[Comentari]         [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[ComentariPer]      [nvarchar] (255) Null ,"
		SqlCTS = SqlCTS & "[Atribut]           [Int]            Null ,"
		SqlCTS = SqlCTS & "[CitaDemanada]      [nvarchar] (255)        Default (''),"
		SqlCTS = SqlCTS & "[CitaServida]       [nvarchar] (255)        Default (''),"
		SqlCTS = SqlCTS & "[CitaTornada]       [nvarchar] (255)        Default ('') "
		SqlCTS = SqlCTS & ") ON [PRIMARY]"
		rec SqlCTS

		Sql = "CREATE TABLE fac_jordibosch.dbo.[" & tablaServitsJB & "Trace] ("
		Sql = Sql & "[Modificat]         [datetime]              Default (GetDate())  ,"
		Sql = Sql & "[Id]                [nvarchar] (255) Null ,"
		Sql = Sql & "[TimeStamp]         [datetime]       Null ,"
		Sql = Sql & "[QuiStamp]          [nvarchar] (255) Null ,"
		Sql = Sql & "[Client]            [float]          Null ,"
		Sql = Sql & "[CodiArticle]       [int]            Null ,"
		Sql = Sql & "[PluUtilitzat]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Viatge]            [nvarchar] (255) Null ,"
		Sql = Sql & "[Equip]             [nvarchar] (255) Null ,"
		Sql = Sql & "[QuantitatDemanada] [float]                 Default (0),"
		Sql = Sql & "[QuantitatTornada]  [float]                 Default (0),"
		Sql = Sql & "[QuantitatServida]  [float]                 Default (0),"
		Sql = Sql & "[MotiuModificacio]  [nvarchar] (255) Null ,"
		Sql = Sql & "[Hora]              [float]          Null ,"
		Sql = Sql & "[TipusComanda]      [float]          Null ,"
		Sql = Sql & "[Comentari]         [nvarchar] (255) Null ,"
		Sql = Sql & "[ComentariPer]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Atribut]           [Int]            Null ,"
		Sql = Sql & "[CitaDemanada]      [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaServida]       [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaTornada]       [nvarchar] (255)        Default ('') "
		Sql = Sql & ") ON [PRIMARY]"
		rec  Sql

		rec  "DROP TRIGGER fac_jordibosch.dbo.[M_" & tablaServitsJB & "] "

		Sql = "CREATE TRIGGER fac_jordibosch.dbo.[M_" & tablaServitsJB & "] ON [fac_jordibosch.dbo.[" & tablaServitsJB & "] "
		Sql = Sql & "AFTER INSERT,UPDATE,DELETE AS "
		Sql = Sql & "Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [TimeStamp] = GetDate(),    [QuiStamp]  = Host_Name() Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "Insert Into fac_jordibosch.dbo.ComandesModificades Select Id As Id,GetDate() As [TimeStamp],'" & tablaServitsJB & "' As TaulaOrigen From fac_jordibosch.dbo.Inserted "
		Sql = Sql & "Insert into fac_jordibosch.dbo.[" & tablaServitsJB & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from fac_jordibosch.dbo.[" & tablaServitsJB & "] Where Id In (Select Id From fac_jordibosch.dbo.Inserted)"
		Sql = Sql & "Insert into fac_jordibosch.dbo.[" & tablaServitsJB & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp]+'BORRAT!!!',Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from fac_jordibosch.dbo.deleted Where not Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "If Update (QuantitatTornada)  Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [CitaTornada]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatTornada  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaTornada]  AS VarChar(255)) Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "If Update (QuantitatServida)  Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [CitaServida]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatServida  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaServida]  AS VarChar(255)) Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "If Update (QuantitatDemanada) Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [CitaDemanada] = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatDemanada AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaDemanada] AS VarChar(255)) Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		rec  Sql
	end if

	if not exists ("fac_jordibosch.dbo.[" & tablaServitsJB & "Trace]") then
		Sql = "CREATE TABLE fac_jordibosch.dbo.[" & tablaServitsJB & "Trace] ("
		Sql = Sql & "[Modificat]         [datetime]              Default (GetDate())  ,"
		Sql = Sql & "[Id]                [nvarchar] (255) Null ,"
		Sql = Sql & "[TimeStamp]         [datetime]       Null ,"
		Sql = Sql & "[QuiStamp]          [nvarchar] (255) Null ,"
		Sql = Sql & "[Client]            [float]          Null ,"
		Sql = Sql & "[CodiArticle]       [int]            Null ,"
		Sql = Sql & "[PluUtilitzat]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Viatge]            [nvarchar] (255) Null ,"
		Sql = Sql & "[Equip]             [nvarchar] (255) Null ,"
		Sql = Sql & "[QuantitatDemanada] [float]                 Default (0),"
		Sql = Sql & "[QuantitatTornada]  [float]                 Default (0),"
		Sql = Sql & "[QuantitatServida]  [float]                 Default (0),"
		Sql = Sql & "[MotiuModificacio]  [nvarchar] (255) Null ,"
		Sql = Sql & "[Hora]              [float]          Null ,"
		Sql = Sql & "[TipusComanda]      [float]          Null ,"
		Sql = Sql & "[Comentari]         [nvarchar] (255) Null ,"
		Sql = Sql & "[ComentariPer]      [nvarchar] (255) Null ,"
		Sql = Sql & "[Atribut]           [Int]            Null ,"
		Sql = Sql & "[CitaDemanada]      [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaServida]       [nvarchar] (255)        Default (''),"
		Sql = Sql & "[CitaTornada]       [nvarchar] (255)        Default ('') "
		Sql = Sql & ") ON [PRIMARY]"
		rec  Sql
   
		Sql = "DROP TRIGGER fac_jordibosch.dbo.[M_" & tablaServitsJB & "] "
		rec  Sql
   
		Sql = "CREATE TRIGGER fac_jordibosch.dbo.[M_" & tablaServitsJB & "] ON fac_jordibosch.dbo.[" & tablaServitsJB & "] "
		Sql = Sql & "AFTER INSERT,UPDATE,DELETE AS "
		Sql = Sql & "Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [TimeStamp] = GetDate(),    [QuiStamp]  = Host_Name() Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "Insert Into fac_jordibosch.dbo.ComandesModificades Select Id As Id,GetDate() As [TimeStamp],'" & tablaServitsJB & "' As TaulaOrigen From fac_jordibosch.dbo.Inserted "
		Sql = Sql & "Insert into fac_jordibosch.dbo.[" & tablaServitsJB & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from fac_jordibosch.dbo.[" & tablaServitsJB & "] Where Id In (Select Id From fac_jordibosch.dbo.Inserted)"
		Sql = Sql & "Insert into fac_jordibosch.dbo.[" & tablaServitsJB & "Trace] (Id,[TimeStamp],[QuiStamp],Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada) Select Id,[TimeStamp],[QuiStamp]+'BORRAT!!!',Client,CodiArticle,PluUtilitzat,Viatge,Equip,QuantitatDemanada,QuantitatTornada,QuantitatServida,MotiuModificacio,Hora,TipusComanda,Comentari,ComentariPer,Atribut,CitaDemanada  from fac_jordibosch.dbo.deleted Where not Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "If Update (QuantitatTornada)  Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [CitaTornada]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatTornada  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaTornada]  AS VarChar(255)) Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "If Update (QuantitatServida)  Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [CitaServida]  = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatServida  AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaServida]  AS VarChar(255)) Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		Sql = Sql & "If Update (QuantitatDemanada) Update fac_jordibosch.dbo.[" & tablaServitsJB & "] Set [CitaDemanada] = Cast(CAST(Host_Name() AS VarChar(255)) + ',' + CAST(QuantitatDemanada AS VarChar(255))  + ',' + CAST(GetDate() AS VarChar(255))  +  '/' + [CitaDemanada] AS VarChar(255)) Where Id In (Select Id From fac_jordibosch.dbo.Inserted) "
		
		rec  Sql
	end if
	
	tablaServitsJB = "[" & tablaServitsJB & "]"

end function


function taulaTornats ( byval D )
   taulaTornats = "[V_Tornat_" & year(D) & "-" & right("00" & month(D),2) & "]"
end function

function tablaAlertes ( byval D )
   tablaAlertes = "[V_Alertes_" & year(D) & "-" & right("00" & month(D),2) & "]"
end function

function tablaAnulats ( byval D )
   tablaAnulats = "[V_Anulats_" & year(D) & "-" & right("00" & month(D),2) & "]"
end function

function tablaHoraris ( byval D )
   tablaHoraris = "[V_Horaris_" & year(D) & "-" & right("00" & month(D),2) & "]"
end function

function tablaLogs ( byval D )
	tablaLogs = "[V_Log_" & year(D) & "-" & right("00" & month(D),2) & "]"
end function

function tablaDependentesExtes ( )
	tablaDependentesExtes = "dependentesExtes"
	if not exists ( tablaDependentesExtes ) then
		sql = "CREATE TABLE [dbo].[" & tablaDependentesExtes & "] ("
		sql = sql & "[id] [nvarchar] (255) NULL ,"
		sql = sql & "[nom] [nvarchar] (255) NULL ,"
		sql = sql & "[valor] [nvarchar] (255) NULL"
		sql = sql & ") ON [PRIMARY]"
		rec sql
	end if
end function

function tablaInventaris ( byval D )
	tablaInventaris = "[V_Inventaris_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists(tablaInventaris) then
		sqlCTI = "CREATE TABLE [dbo]." & tablaInventaris & " ([Botiga] [float] NULL ,[Data] [datetime] NULL ,[Dependenta] [float] NULL ,"
		sqlCTI = sqlCTI & "[Num_tick] [float] NULL ,[Estat] [nvarchar] (25) NULL ,[Plu] [float] NULL ,[Quantitat] [float] NULL ,"
		sqlCTI = sqlCTI & "[Import] [float] NULL ,[Tipus_venta] [nvarchar] (25) NULL) ON [PRIMARY]"
		rec sqlCTI
	end if
end function

function tablaArchivo()
	tablaArchivo = "archivo"
	if not exists(tablaArchivo) then
		sqlCAR = "CREATE TABLE [dbo].[" & tablaArchivo & "] ([id] [nvarchar] (255) NULL ,[nombre] [nvarchar] (255) NULL ,"
		sqlCAR = sqlCAR & "[extension] [nvarchar] (255) NULL ,[descripcion] [nvarchar] (4000) NULL ,[mime] [nvarchar] (255) NULL ,"
		sqlCAR = sqlCAR & "[archivo] [image] NULL,[fecha] [datetime] NULL,[propietario] [nvarchar] (255) NULL,[tmp] bit,[down] bit)"
		rec sqlCAR
	end if
end function

function tablaFacturacioIva ( byval D )
	tablaFacturacioIva = "[facturacio_" & year(D) & "-" & right("0" & month(D),2) & "_iva]"
	if not exists ( tablaFacturacioIva ) then
		sqlFI = "CREATE TABLE " & tablaFacturacioIva & " ("
		sqlFI = sqlFI & "	IdFactura nvarchar (255) NULL,"
		sqlFI = sqlFI & "	NumFactura float NULL,"
		sqlFI = sqlFI & "	EmpresaCodi float NULL,"
		sqlFI = sqlFI & "	Serie nvarchar (255) NULL,"
		sqlFI = sqlFI & "	DataInici datetime NULL,"
		sqlFI = sqlFI & "	DataFi datetime NULL,"
		sqlFI = sqlFI & "	DataFactura datetime NULL,"
		sqlFI = sqlFI & "	DataEmissio datetime NULL,"
		sqlFI = sqlFI & "	DataVenciment datetime NULL,"
		sqlFI = sqlFI & "	FormaPagament nvarchar (255) NULL,"
		sqlFI = sqlFI & "	Total float NULL,"
		sqlFI = sqlFI & "	ClientCodi float NULL,"
		sqlFI = sqlFI & "	ClientCodiFac nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientNom nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientNif nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientAdresa nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientCp nvarchar (255) NULL,"
		sqlFI = sqlFI & "	Tel nvarchar (255) NULL,"
		sqlFI = sqlFI & "	Fax nvarchar (255) NULL,"
		sqlFI = sqlFI & "	eMail nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientLliure nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientCiutat nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpNom nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpNif nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpAdresa nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpCp nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpTel nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpFax nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpeMail nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpLliure nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpCiutat nvarchar (255) NULL,"
		sqlFI = sqlFI & "	CampMercantil nvarchar (255) NULL,"
		sqlFI = sqlFI & "	BaseIva1 float NULL,"
		sqlFI = sqlFI & "	Iva1 float NULL,"
		sqlFI = sqlFI & "	BaseIva2 float NULL,"
		sqlFI = sqlFI & "	Iva2 float NULL,"
		sqlFI = sqlFI & "	BaseIva3 float NULL,"
		sqlFI = sqlFI & "	Iva3 float NULL,"
		sqlFI = sqlFI & "	BaseIva4 float NULL,"
		sqlFI = sqlFI & "	Iva4 float NULL,"
		sqlFI = sqlFI & "	BaseRec1 float NULL,"
		sqlFI = sqlFI & "	Rec1 float NULL,"
		sqlFI = sqlFI & "	BaseRec2 float NULL,"
		sqlFI = sqlFI & "	Rec2 float NULL,"
		sqlFI = sqlFI & "	BaseRec3 float NULL,"
		sqlFI = sqlFI & "	Rec3 float NULL,"
		sqlFI = sqlFI & "	BaseRec4 float NULL,"
		sqlFI = sqlFI & "	Rec4 float NULL,"
		sqlFI = sqlFI & "	valorIva1 float NULL,"
		sqlFI = sqlFI & "	valorIva2 float NULL,"
		sqlFI = sqlFI & "	valorIva3 float NULL,"
		sqlFI = sqlFI & "	valorIva4 float NULL,"
		sqlFI = sqlFI & "	valorRec1 float NULL,"
		sqlFI = sqlFI & "	valorRec2 float NULL,"
		sqlFI = sqlFI & "	valorRec3 float NULL,"
		sqlFI = sqlFI & "	valorRec4 float NULL,"
		sqlFI = sqlFI & "	IvaRec1 float NULL,"
		sqlFI = sqlFI & "	IvaRec2 float NULL,"
		sqlFI = sqlFI & "	IvaRec3 float NULL,"
		sqlFI = sqlFI & "	IvaRec4 float NULL,"
		sqlFI = sqlFI & "	Reservat nvarchar (255) NULL"
		sqlFI = sqlFI & "	)"
		rec sqlFI
	end if
end function

function tablaFacturacioData ( byval D )
	tablaFacturacioData = "[facturacio_" & year(D) & "-" & right("0" & month(D),2) & "_Data]"
	if not exists ( tablaFacturacioData ) then
		sqlFD = "CREATE TABLE " & tablaFacturacioData & " ("
		sqlFD = sqlFD & "	IdFactura nvarchar (255) NULL,"
		sqlFD = sqlFD & "	Data datetime NULL,"
		sqlFD = sqlFD & "	Client float NULL,"
		sqlFD = sqlFD & "	Producte float NULL,"
		sqlFD = sqlFD & "	ProducteNom nvarchar  (255) NULL,"
		sqlFD = sqlFD & "	Acabat float NULL,"
		sqlFD = sqlFD & "	Preu float NULL,"
		sqlFD = sqlFD & "	Import float NULL,"
		sqlFD = sqlFD & "	Desconte float NULL,"
		sqlFD = sqlFD & "	TipusIva float NULL,"
		sqlFD = sqlFD & "	Iva float NULL,"
		sqlFD = sqlFD & "	rec float NULL,"
		sqlFD = sqlFD & "	Referencia nvarchar  (255) NULL,"
		sqlFD = sqlFD & "	Servit float NULL,"
		sqlFD = sqlFD & "	Tornat float NULL"
		sqlFD = sqlFD & "	)"
		rec sqlFD
	end if
end function

function tablaPressupostData ( byval D )
	tablaPressupostData = "[pressupost_" & year(D) & "-" & right("0" & month(D),2) & "_Data]"
	if not exists ( tablaPressupostData ) then
		sqlFD = "CREATE TABLE " & tablaPressupostData & " ("
		sqlFD = sqlFD & "	IdFactura nvarchar (255) NULL,"
		sqlFD = sqlFD & "	Data datetime NULL,"
		sqlFD = sqlFD & "	Client float NULL,"
		sqlFD = sqlFD & "	Producte float NULL,"
		sqlFD = sqlFD & "	ProducteNom nvarchar  (255) NULL,"
		sqlFD = sqlFD & "	Acabat float NULL,"
		sqlFD = sqlFD & "	Preu float NULL,"
		sqlFD = sqlFD & "	Import float NULL,"
		sqlFD = sqlFD & "	Desconte float NULL,"
		sqlFD = sqlFD & "	TipusIva float NULL,"
		sqlFD = sqlFD & "	Iva float NULL,"
		sqlFD = sqlFD & "	rec float NULL,"
		sqlFD = sqlFD & "	Referencia nvarchar  (255) NULL,"
		sqlFD = sqlFD & "	Servit float NULL,"
		sqlFD = sqlFD & "	Tornat float NULL"
		sqlFD = sqlFD & "	)"
		rec sqlFD
	end if
end function

function tablaPressupostIva ( byval D )
	tablaPressupostIva = "[pressupost_" & year(D) & "-" & right("0" & month(D),2) & "_iva]"
	if not exists ( tablaPressupostIva ) then
		sqlFI = "CREATE TABLE " & tablaPressupostIva & " ("
		sqlFI = sqlFI & "	IdFactura nvarchar (255) NULL,"
		sqlFI = sqlFI & "	NumFactura float NULL,"
		sqlFI = sqlFI & "	EmpresaCodi float NULL,"
		sqlFI = sqlFI & "	Serie nvarchar (255) NULL,"
		sqlFI = sqlFI & "	DataInici datetime NULL,"
		sqlFI = sqlFI & "	DataFi datetime NULL,"
		sqlFI = sqlFI & "	DataFactura datetime NULL,"
		sqlFI = sqlFI & "	DataEmissio datetime NULL,"
		sqlFI = sqlFI & "	DataVenciment datetime NULL,"
		sqlFI = sqlFI & "	FormaPagament nvarchar (255) NULL,"
		sqlFI = sqlFI & "	Total float NULL,"
		sqlFI = sqlFI & "	ClientCodi float NULL,"
		sqlFI = sqlFI & "	ClientCodiFac nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientNom nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientNif nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientAdresa nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientCp nvarchar (255) NULL,"
		sqlFI = sqlFI & "	Tel nvarchar (255) NULL,"
		sqlFI = sqlFI & "	Fax nvarchar (255) NULL,"
		sqlFI = sqlFI & "	eMail nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientLliure nvarchar (255) NULL,"
		sqlFI = sqlFI & "	ClientCiutat nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpNom nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpNif nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpAdresa nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpCp nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpTel nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpFax nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpeMail nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpLliure nvarchar (255) NULL,"
		sqlFI = sqlFI & "	EmpCiutat nvarchar (255) NULL,"
		sqlFI = sqlFI & "	CampMercantil nvarchar (255) NULL,"
		sqlFI = sqlFI & "	BaseIva1 float NULL,"
		sqlFI = sqlFI & "	Iva1 float NULL,"
		sqlFI = sqlFI & "	BaseIva2 float NULL,"
		sqlFI = sqlFI & "	Iva2 float NULL,"
		sqlFI = sqlFI & "	BaseIva3 float NULL,"
		sqlFI = sqlFI & "	Iva3 float NULL,"
		sqlFI = sqlFI & "	BaseIva4 float NULL,"
		sqlFI = sqlFI & "	Iva4 float NULL,"
		sqlFI = sqlFI & "	BaseRec1 float NULL,"
		sqlFI = sqlFI & "	Rec1 float NULL,"
		sqlFI = sqlFI & "	BaseRec2 float NULL,"
		sqlFI = sqlFI & "	Rec2 float NULL,"
		sqlFI = sqlFI & "	BaseRec3 float NULL,"
		sqlFI = sqlFI & "	Rec3 float NULL,"
		sqlFI = sqlFI & "	BaseRec4 float NULL,"
		sqlFI = sqlFI & "	Rec4 float NULL,"
		sqlFI = sqlFI & "	valorIva1 float NULL,"
		sqlFI = sqlFI & "	valorIva2 float NULL,"
		sqlFI = sqlFI & "	valorIva3 float NULL,"
		sqlFI = sqlFI & "	valorIva4 float NULL,"
		sqlFI = sqlFI & "	valorRec1 float NULL,"
		sqlFI = sqlFI & "	valorRec2 float NULL,"
		sqlFI = sqlFI & "	valorRec3 float NULL,"
		sqlFI = sqlFI & "	valorRec4 float NULL,"
		sqlFI = sqlFI & "	IvaRec1 float NULL,"
		sqlFI = sqlFI & "	IvaRec2 float NULL,"
		sqlFI = sqlFI & "	IvaRec3 float NULL,"
		sqlFI = sqlFI & "	IvaRec4 float NULL,"
		sqlFI = sqlFI & "	Reservat nvarchar (255) NULL"
		sqlFI = sqlFI & "	)"
		rec sqlFI
	end if
end function


function tablaFacturacioReb ( byval D )
	tablaFacturacioReb = "[facturacio_" & year(D) & "-" & right("0" & month(D),2) & "_reb]"
	if not exists ( tablaFacturacioReb ) then
		sqlFR = "CREATE TABLE " & tablaFacturacioReb & "("
  	    sqlFR = sqlFR & "[IdRebut] [nvarchar] (255) NULL , "
  	    sqlFR = sqlFR & "[DataCobrat] [datetime] NULL , "
  	    sqlFR = sqlFR & "[Estat1] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat2] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat3] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat4] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat5] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[IdFactura] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[NumFactura] [float] NULL ,"
  	    sqlFR = sqlFR & "[EmpresaCodi] [float] NULL ,"
  	    sqlFR = sqlFR & "[Serie] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[DataInici] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataFi] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataFactura] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataEmissio] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataVenciment] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[FormaPagament] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Total] [float] NULL ,"
  	    sqlFR = sqlFR & "[ClientCodi] [float] NULL ,"
  	    sqlFR = sqlFR & "[ClientCodiFac] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientNom] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientNif] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientAdresa] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientCp] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Tel] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Fax] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[eMail] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientLliure] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientCiutat] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientCompte] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpNom] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpNif] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpAdresa] [nvarchar] (255)  NULL ,"
  	    sqlFR = sqlFR & "[EmpCp] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpTel] [nvarchar] (255)  NULL ,"
  	    sqlFR = sqlFR & "[EmpFax] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpeMail] [nvarchar] (255)  NULL ,"
  	    sqlFR = sqlFR & "[EmpLliure] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpCiutat] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[CampMercantil] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpCompte] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[BaseIva1] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva1] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseIva2] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva2] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseIva3] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva3] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseIva4] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva4] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva1] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva2] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva3] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva4] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[Reservat] [nvarchar] (255) NULL "
  	    sqlFR = sqlFR & ")"
		rec sqlFR
	end if
end function

function tablaPressupostReb ( byval D )
	tablaPressupostReb = "[pressupost_" & year(D) & "-" & right("0" & month(D),2) & "_reb]"
	if not exists ( tablaPressupostReb ) then
		sqlFR = "CREATE TABLE " & tablaPressupostReb & "("
  	    sqlFR = sqlFR & "[IdRebut] [nvarchar] (255) NULL , "
  	    sqlFR = sqlFR & "[DataCobrat] [datetime] NULL , "
  	    sqlFR = sqlFR & "[Estat1] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat2] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat3] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat4] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Estat5] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[IdFactura] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[NumFactura] [float] NULL ,"
  	    sqlFR = sqlFR & "[EmpresaCodi] [float] NULL ,"
  	    sqlFR = sqlFR & "[Serie] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[DataInici] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataFi] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataFactura] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataEmissio] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[DataVenciment] [datetime] NULL ,"
  	    sqlFR = sqlFR & "[FormaPagament] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Total] [float] NULL ,"
  	    sqlFR = sqlFR & "[ClientCodi] [float] NULL ,"
  	    sqlFR = sqlFR & "[ClientCodiFac] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientNom] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientNif] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientAdresa] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientCp] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Tel] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[Fax] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[eMail] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientLliure] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientCiutat] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[ClientCompte] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpNom] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpNif] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpAdresa] [nvarchar] (255)  NULL ,"
  	    sqlFR = sqlFR & "[EmpCp] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpTel] [nvarchar] (255)  NULL ,"
  	    sqlFR = sqlFR & "[EmpFax] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpeMail] [nvarchar] (255)  NULL ,"
  	    sqlFR = sqlFR & "[EmpLliure] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpCiutat] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[CampMercantil] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[EmpCompte] [nvarchar] (255) NULL ,"
  	    sqlFR = sqlFR & "[BaseIva1] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva1] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseIva2] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva2] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseIva3] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva3] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseIva4] [float] NULL ,"
  	    sqlFR = sqlFR & "[Iva4] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[BaseRec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[Rec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva1] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva2] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva3] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorIva4] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[valorRec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec1] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec2] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec3] [float] NULL ,"
  	    sqlFR = sqlFR & "[IvaRec4] [float] NULL ,"
  	    sqlFR = sqlFR & "[Reservat] [nvarchar] (255) NULL "
  	    sqlFR = sqlFR & ")"
		rec sqlFR
	end if
end function


function tablaFacturacioProvisionalIva()
	tablaFacturacioProvisionalIva = "Facturacio_Provisional_Iva"
	if not exists(tablaFacturacioProvisionalIva) then
		sqlCFPI = "CREATE TABLE [dbo]." & tablaFacturacioProvisionalIva & " ("
		sqlCFPI = sqlCFPI & "	[IdFactura] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[NumFactura] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpresaCodi] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Serie] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[DataInici] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataFi] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataFactura] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataEmissio] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataVenciment] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[FormaPagament] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[Total] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCodi] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCodiFac] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientNom] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientNif] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientAdresa] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCp] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[Tel] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[Fax] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[eMail] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientLliure] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCiutat] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpNom] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpNif] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpAdresa] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpCp] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpTel] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpFax] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpeMail] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpLliure] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpCiutat] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[CampMercantil] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Reservat] [nvarchar] (255) NULL"
		sqlCFPI = sqlCFPI & "	)"
		rec sqlCFPI
	end if
end function

function tablaFacturacioProvisionalData()
	tablaFacturacioProvisionalData = "Facturacio_Provisional_Data"
	if not exists (tablaFacturacioProvisionalData) then
		sqlCFPD = "CREATE TABLE [dbo]." & tablaFacturacioProvisionalData & " ("
		sqlCFPD = sqlCFPD & "	[IdFactura] [nvarchar] (255) NULL ,"
		sqlCFPD = sqlCFPD & "	[Data] [datetime] NULL ,"
		sqlCFPD = sqlCFPD & "	[Client] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Producte] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[ProducteNom] [nvarchar] (255) NULL ,"
		sqlCFPD = sqlCFPD & "	[Acabat] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Preu] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Import] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Desconte] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[TipusIva] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Iva] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[rec] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Referencia] [nvarchar] (255) NULL ,"
		sqlCFPD = sqlCFPD & "	[Servit] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Tornat] [float] NULL "
		sqlCFPD = sqlCFPD & "	) ON [PRIMARY]"
		rec sqlCFPD
	end if
end function

function tablaPressupostProvisionalIva()
	tablaPressupostProvisionalIva = "Pressupost_Provisional_Iva"
	if not exists(tablaPressupostProvisionalIva) then
		sqlCFPI = "CREATE TABLE [dbo]." & tablaPressupostProvisionalIva & " ("
		sqlCFPI = sqlCFPI & "	[IdFactura] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[NumFactura] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpresaCodi] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Serie] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[DataInici] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataFi] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataFactura] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataEmissio] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[DataVenciment] [datetime] NULL ,"
		sqlCFPI = sqlCFPI & "	[FormaPagament] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[Total] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCodi] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCodiFac] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientNom] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientNif] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientAdresa] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCp] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[Tel] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[Fax] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[eMail] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientLliure] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[ClientCiutat] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpNom] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpNif] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpAdresa] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpCp] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpTel] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpFax] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpeMail] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpLliure] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[EmpCiutat] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[CampMercantil] [nvarchar] (255) NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseIva4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Iva4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[BaseRec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Rec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorIva4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[valorRec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec1] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec2] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec3] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[IvaRec4] [float] NULL ,"
		sqlCFPI = sqlCFPI & "	[Reservat] [nvarchar] (255) NULL"
		sqlCFPI = sqlCFPI & "	)"
		rec sqlCFPI
	end if
end function

function tablaPressupostProvisionalData()
	tablaPressupostProvisionalData = "Pressupost_Provisional_Data"
	if not exists (tablaPressupostProvisionalData) then
		sqlCFPD = "CREATE TABLE [dbo]." & tablaPressupostProvisionalData & " ("
		sqlCFPD = sqlCFPD & "	[IdFactura] [nvarchar] (255) NULL ,"
		sqlCFPD = sqlCFPD & "	[Data] [datetime] NULL ,"
		sqlCFPD = sqlCFPD & "	[Client] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Producte] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[ProducteNom] [nvarchar] (255) NULL ,"
		sqlCFPD = sqlCFPD & "	[Acabat] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Preu] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Import] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Desconte] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[TipusIva] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Iva] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[rec] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Referencia] [nvarchar] (255) NULL ,"
		sqlCFPD = sqlCFPD & "	[Servit] [float] NULL ,"
		sqlCFPD = sqlCFPD & "	[Tornat] [float] NULL "
		sqlCFPD = sqlCFPD & "	) ON [PRIMARY]"
		rec sqlCFPD
	end if
end function



function tablaFacturaProforma ( byval D )
	tablaFacturaProforma = "[ccFacturas_" & year(D) & "_Iva]"
	if exists ( tablaFacturaProforma ) then
		rec "ALTER TABLE " & tablaFacturaProforma & "  ALTER COLUMN numfactura nvarchar (250)  null" 
	else
		sqlFP = "CREATE TABLE " & tablaFacturaProforma & " ("
		sqlFP = sqlFP & "	IdFactura nvarchar (255) NULL,"
		sqlFP = sqlFP & "	NumFactura float NULL,"
		sqlFP = sqlFP & "	EmpresaCodi nvarchar (255) NULL,"
		sqlFP = sqlFP & "	Serie nvarchar (255) NULL,"
		sqlFP = sqlFP & "	DataInici datetime NULL,"
		sqlFP = sqlFP & "	DataFi datetime NULL,"
		sqlFP = sqlFP & "	DataFactura datetime NULL,"
		sqlFP = sqlFP & "	DataEmissio datetime NULL,"
		sqlFP = sqlFP & "	DataVenciment datetime NULL,"
		sqlFP = sqlFP & "	FormaPagament nvarchar (255) NULL,"
		sqlFP = sqlFP & "	Total float NULL,"
		sqlFP = sqlFP & "	ClientCodi nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientCodiFac nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientNom nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientNif nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientAdresa nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientCp nvarchar (255) NULL,"
		sqlFP = sqlFP & "	Tel nvarchar (255) NULL,"
		sqlFP = sqlFP & "	Fax nvarchar (255) NULL,"
		sqlFP = sqlFP & "	eMail nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientLliure nvarchar (255) NULL,"
		sqlFP = sqlFP & "	ClientCiutat nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpNom nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpNif nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpAdresa nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpCp nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpTel nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpFax nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpeMail nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpLliure nvarchar (255) NULL,"
		sqlFP = sqlFP & "	EmpCiutat nvarchar (255) NULL,"
		sqlFP = sqlFP & "	CampMercantil nvarchar (255) NULL,"
		sqlFP = sqlFP & "	BaseIva1 float NULL,"
		sqlFP = sqlFP & "	Iva1 float NULL,"
		sqlFP = sqlFP & "	BaseIva2 float NULL,"
		sqlFP = sqlFP & "	Iva2 float NULL,"
		sqlFP = sqlFP & "	BaseIva3 float NULL,"
		sqlFP = sqlFP & "	Iva3 float NULL,"
		sqlFP = sqlFP & "	BaseIva4 float NULL,"
		sqlFP = sqlFP & "	Iva4 float NULL,"
		sqlFP = sqlFP & "	BaseRec1 float NULL,"
		sqlFP = sqlFP & "	Rec1 float NULL,"
		sqlFP = sqlFP & "	BaseRec2 float NULL,"
		sqlFP = sqlFP & "	Rec2 float NULL,"
		sqlFP = sqlFP & "	BaseRec3 float NULL,"
		sqlFP = sqlFP & "	Rec3 float NULL,"
		sqlFP = sqlFP & "	BaseRec4 float NULL,"
		sqlFP = sqlFP & "	Rec4 float NULL,"
		sqlFP = sqlFP & "	valorIva1 float NULL,"
		sqlFP = sqlFP & "	valorIva2 float NULL,"
		sqlFP = sqlFP & "	valorIva3 float NULL,"
		sqlFP = sqlFP & "	valorIva4 float NULL,"
		sqlFP = sqlFP & "	valorRec1 float NULL,"
		sqlFP = sqlFP & "	valorRec2 float NULL,"
		sqlFP = sqlFP & "	valorRec3 float NULL,"
		sqlFP = sqlFP & "	valorRec4 float NULL,"
		sqlFP = sqlFP & "	IvaRec1 float NULL,"
		sqlFP = sqlFP & "	IvaRec2 float NULL,"
		sqlFP = sqlFP & "	IvaRec3 float NULL,"
		sqlFP = sqlFP & "	IvaRec4 float NULL,"
		sqlFP = sqlFP & "	Reservat nvarchar (255) NULL"
		sqlFP = sqlFP & "	)"
		rec sqlFP
	end if
end function

function tablaFacturaProformaData ( byval D )
	tablaFacturaProformaData = "[ccFacturas_" & year(D) & "_Data]"
	if not exists ( tablaFacturaProformaData ) then
		sqlFPD = "CREATE TABLE " & tablaFacturaProformaData & " ("
		sqlFPD = sqlFPD & "	IdFactura nvarchar (255) NULL,"
		sqlFPD = sqlFPD & "	Data datetime NULL,"
		sqlFPD = sqlFPD & "	Client nvarchar (255) NULL,"
		sqlFPD = sqlFPD & "	Producte nvarchar (255) NULL,"
		sqlFPD = sqlFPD & "	ProducteNom nvarchar (255) NULL,"
		sqlFPD = sqlFPD & "	Acabat float NULL,"
		sqlFPD = sqlFPD & "	Preu float NULL,"
		sqlFPD = sqlFPD & "	Import float NULL,"
		sqlFPD = sqlFPD & "	Desconte float NULL,"
		sqlFPD = sqlFPD & "	TipusIva float NULL,"
		sqlFPD = sqlFPD & "	Iva float NULL,"
		sqlFPD = sqlFPD & "	rec float NULL,"
		sqlFPD = sqlFPD & "	Referencia nvarchar (255) NULL,"
		sqlFPD = sqlFPD & "	Servit float NULL,"
		sqlFPD = sqlFPD & "	Tornat float NULL"
		sqlFPD = sqlFPD & "	)"
		rec sqlFPD
	end if
end function

function tablaTipusIva ( byVal D)
	tablaTipusIvaNou = "TipusIva"
	tablaTipusIvaAntic = "TipusIvaAntic"
	
	if not exists (tablaTipusIvaAntic) then
		sqlTI = "CREATE TABLE [dbo].[" & tablaTipusIvaAntic & "] ("
		sqlTI = sqlTI & "[Tipus] [nvarchar] (255) NULL,"
		sqlTI = sqlTI & "[Iva] [float] NOT NULL ,"
		sqlTI = sqlTI & "[Irpf] [float] NOT NULL"
		sqlTI = sqlTI & ") ON [PRIMARY]"
		rec sqlTI

		rec "Insert Into " & tablaTipusIvaAntic & " (Tipus, Iva, Irpf) values('1',  4, 0.5)"
		rec "Insert Into " & tablaTipusIvaAntic & " (Tipus, Iva, Irpf) values('2',  7, 1)"
		rec "Insert Into " & tablaTipusIvaAntic & " (Tipus, Iva, Irpf) values('3', 16, 4)"
		rec "Insert Into " & tablaTipusIvaAntic & " (Tipus, Iva, Irpf) values('4',  0, 0)"
	end if
	
	if not exists (tablaTipusIvaNou) then
		sqlTI = "CREATE TABLE [dbo].[" & tablaTipusIvaNou & "] ("
		sqlTI = sqlTI & "[Tipus] [nvarchar] (255) NULL,"
		sqlTI = sqlTI & "[Iva] [float] NOT NULL ,"
		sqlTI = sqlTI & "[Irpf] [float] NOT NULL"
		sqlTI = sqlTI & ") ON [PRIMARY]"
		rec sqlTI

		rec "Insert Into " & tablaTipusIvaNou & " (Tipus, Iva, Irpf) values('1',  4, 0.5)"
		rec "Insert Into " & tablaTipusIvaNou & " (Tipus, Iva, Irpf) values('2',  8, 1)"
		rec "Insert Into " & tablaTipusIvaNou & " (Tipus, Iva, Irpf) values('3', 18, 4)"
		rec "Insert Into " & tablaTipusIvaNou & " (Tipus, Iva, Irpf) values('4',  0, 0)"
	end if
	'response.write "FECHA IVA: [" & D & "]<br>"
	if (year(D)<2010) or (month(D)<7 and year(D)=2010) then
		tablaTipusIva = tablaTipusIvaAntic
	else
		tablaTipusIva = tablaTipusIvaNou
	end if
	
end function

function tablaFacturacioComentaris()
	tablaFacturacioComentaris = "FacturacioComentaris"
	if not exists (tablaFacturacioComentaris) then
		sqlFC = "CREATE TABLE [dbo].[" & tablaFacturacioComentaris & "] ( "
		sqlFC = sqlFC & "[IdFactura] [nvarchar] (255) NULL , "
		sqlFC = sqlFC & "[Data] [datetime] NULL , "
		sqlFC = sqlFC & "[Comentari] [nvarchar] (255) NULL , "
		sqlFC = sqlFC & "[Cobrat] [nvarchar] (1) NULL CONSTRAINT [DF_FacturacioComentaris_Cobrat] DEFAULT ('S') "
		sqlFC = sqlFC & ") ON [PRIMARY]"
		rec sqlFC
	end if
end function

function tablaMissatgesAEnviar()
	tablaMissatgesAEnviar = "MissatgesAEnviar"
	if not exists(tablaMissatgesAEnviar) then
		sqlMAE = "CREATE TABLE [dbo].[" & tablaMissatgesAEnviar & "] ("
		sqlMAE = sqlMAE & "[Tipus] [varchar] (255) NULL,"
		sqlMAE = sqlMAE & "[Param] [varchar] (255) NULL "
		sqlMAE = sqlMAE & ") ON [PRIMARY]"
		rec sqlMAE
	end if
end function

function tablaQueTinc()
	tablaQueTinc = "QueTinc"
	if not exists(tablaQueTinc) then
		sqlQT = "CREATE TABLE [dbo].[" & tablaQueTinc & "] ("
		sqlQT = sqlQT & "[QueEs] [nvarchar] (255) NULL,"
		sqlQT = sqlQT & "[QuinEs] [nvarchar] (255) NULL"
		sqlQT = sqlQT & ") ON [PRIMARY]"
		rec sqlQT
	end if
end function

function tablaCafradas()
	tablaCafradas = "cafradas"
	if not exists ( tablaCafradas ) then
		sqlCCF = "CREATE TABLE [dbo].[" & tablaCafradas & "] ("
		sqlCCF = sqlCCF & "[empresa] [nvarchar] (255) null,"
		sqlCCF = sqlCCF & "[usuario] [nvarchar] (255) null,"
		sqlCCF = sqlCCF & "[fecha] [datetime] null,"
		sqlCCF = sqlCCF & "[accion] [nvarchar] (4000) null "
		sqlCCF = sqlCCF & ") on [primary]"
		rec sqlCCF
	end if
end function

function tablaDependentesZombis ( )
	tablaDependentesZombis = "Dependentes_Zombis"
	if not exists ( tablaDependentesZombis ) then
		sqlDZ = " CREATE TABLE [dbo].[" & tablaDependentesZombis & "] ("
		sqlDZ = sqlDZ & "[TimeStamp] [datetime] NULL,"
		sqlDZ = sqlDZ & "[CODI] [int] NULL,"
		sqlDZ = sqlDZ & "[NOM] [nvarchar] (255) NULL,"
		sqlDZ = sqlDZ & "[MEMO] [nvarchar] (255) NULL,"
		sqlDZ = sqlDZ & "[TELEFON] [nvarchar] (255) NULL,"
		sqlDZ = sqlDZ & "[ADREÇA] [nvarchar] (255) NULL,"
		sqlDZ = sqlDZ & "[Icona] [nvarchar] (255) NULL,"
		sqlDZ = sqlDZ & "[Hi Editem Horaris] [int] NULL,"
		sqlDZ = sqlDZ & "[Tid] [nvarchar] (255) NULL"
		sqlDZ = sqlDZ & ") ON [PRIMARY]"
		rec sqlDZ
	end if
end function

function tablaArticlesZombis ( )
	tablaArticlesZombis = "Articles_Zombis"
	if not exists(tablaArticlesZombis) then
		sqlAZ = "CREATE TABLE [dbo].[" & tablaArticlesZombis & "] ("
		sqlAZ = sqlAZ & "[TimeStamp] [datetime] NULL,"
		sqlAZ = sqlAZ & "[Codi] [numeric](18, 0) NULL,"
		sqlAZ = sqlAZ & "[NOM] [nvarchar] (255) NULL,"
		sqlAZ = sqlAZ & "[PREU] [float] NOT NULL,"
		sqlAZ = sqlAZ & "[PreuMajor] [float] NULL,"
		sqlAZ = sqlAZ & "[Desconte] [float] NULL,"
		sqlAZ = sqlAZ & "[EsSumable] [bit] NOT NULL,"
		sqlAZ = sqlAZ & "[Familia] [nvarchar] (255) NULL,"
		sqlAZ = sqlAZ & "[CodiGenetic] [int] NOT NULL,"
		sqlAZ = sqlAZ & "[TipoIva] [float] NULL,"
		sqlAZ = sqlAZ & "[NoDescontesEspecials] [float] NULL"
		sqlAZ = sqlAZ & ") ON [PRIMARY]"
		rec sqlAZ
	end if
end function

function tablaClientsFinalsZombis ( )
	tablaClientsFinalsZombis = "ClientsFinals_Zombis"
	if not exists (tablaClientsFinalsZombis) then
		sqlCFZ = " CREATE TABLE [dbo].[" & tablaClientsFinalsZombis & "] ("
		sqlCFZ = sqlCFZ & "[TimeStamp] [datetime] NULL,"
		sqlCFZ = sqlCFZ & "[Id] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[Nom] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[Telefon] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[Adreca] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[emili] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[Descompte] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[Altres] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[Nif] [nvarchar] (255) NULL,"
		sqlCFZ = sqlCFZ & "[IdExterna] [nvarchar] (255) NULL"
		sqlCFZ = sqlCFZ & ") ON [PRIMARY]"
		rec sqlCFZ
	end if
end function

function tablaClientsZombis ( )
	tablaClientsZombis = "Clients_Zombis"
	if not exists (tablaClientsZombis) then
		sqlCZ = "CREATE TABLE [dbo].[" & tablaClientsZombis & "] ( "
		sqlCZ = sqlCZ & "[TimeStamp] [datetime] NULL , "
		sqlCZ = sqlCZ & "[Codi] [int] NULL , "
		sqlCZ = sqlCZ & "[Nom] [nvarchar] (255) NULL , "
		sqlCZ = sqlCZ & "[Nif] [nvarchar] (255)  NULL , "
		sqlCZ = sqlCZ & "[Adresa] [nvarchar] (255) NULL , "
		sqlCZ = sqlCZ & "[Ciutat] [nvarchar] (255) NULL , "
		sqlCZ = sqlCZ & "[Cp] [nvarchar] (255)  NULL , "
		sqlCZ = sqlCZ & "[Lliure] [nvarchar] (255)  NULL , "
		sqlCZ = sqlCZ & "[Nom Llarg] [nvarchar] (255)  NULL , "
		sqlCZ = sqlCZ & "[Tipus Iva] [int] NULL , "
		sqlCZ = sqlCZ & "[Preu Base] [int] NULL , "
		sqlCZ = sqlCZ & "[Desconte ProntoPago] [int] NULL , "
		sqlCZ = sqlCZ & "[Desconte 1] [int] NULL , "
		sqlCZ = sqlCZ & "[Desconte 2] [int] NULL , "
		sqlCZ = sqlCZ & "[Desconte 3] [int] NULL , "
		sqlCZ = sqlCZ & "[Desconte 4] [int] NULL , "
		sqlCZ = sqlCZ & "[Desconte 5] [int] NULL , "
		sqlCZ = sqlCZ & "[AlbaraValorat] [int] NULL "
		sqlCZ = sqlCZ & ") ON [PRIMARY]"
		rec sqlCZ
	end if
end function

function tablaTarifesEspecials ( )
	tablaTarifesEspecials = "TarifesEspecials"
	if not exists(tablaTarifesEspecials) then
		sqlTE = "CREATE TABLE [dbo].[" & tablaTarifesEspecials & "] ("
		sqlTE = sqlTE & "[TarifaCodi] [int] NULL,"
		sqlTE = sqlTE & "[TarifaNom] [nvarchar] (20) NULL,"
		sqlTE = sqlTE & "[Codi] [int] NULL,"
		sqlTE = sqlTE & "[PREU] [float] NOT NULL,"
		sqlTE = sqlTE & "[PreuMajor] [float] NULL"
		sqlTE = sqlTE & ") ON [PRIMARY]"
		rec sqlTE
	end if
end function

function tablaConstantsClient ( )
	tablaConstantsClient = "constantsclient"
	if not exists(tablaConstantsClient) then
		sqlCC = "CREATE TABLE [dbo].[ConstantsClient]("
		sqlCC = sqlCC & "[Codi] [numeric](18, 0) NULL,"
		sqlCC = sqlCC & "[Variable] [nvarchar](255) NULL ,"
		sqlCC = sqlCC & "[Valor] [nvarchar] (255) NULL"
		sqlCC = sqlCC & ") ON [PRIMARY]"
		rec sqlCC
	end if
end function

sub tablaHoresFetes ( byval tablaSortida, byval Di, byval Df, byval Grup1, byval Grup2, byval Grup3, byval comI, byval minI, byval comF, byval minF )
	if exists (tablaSortida & "_Tmp") then rec "Drop table [" & tablaSortida & "_Tmp" & "]"
	rec "CREATE TABLE [dbo].[" & tablaSortida & "_Tmp" & "] ([Botiga] [float] NULL , [Data] [datetime] NULL , [Dependenta] [float] NULL, [Operacio] [nvarchar] NULL ) ON [PRIMARY]"
	auxSql=""
	if len(Grup1)>0 then  auxSql = auxSql & " Dependenta In(SELECT Codi FROM Dependentes_laboral Where Equiptreball In (" & Grup1 & ")) "
	if len(Grup2)>0 then
		if len(auxSql)>0 then auxSql = auxSql & " Or "
		auxSql = auxSql & " Botiga In (" & Grup2 & ") "
	end if
	if len(Grup3)>0 then
		if len(auxSql)>0 then auxSql = auxSql & " Or "
		auxSql = auxSql & " Dependenta In (" & Grup3 & ") "
	end if
	Dk = Di
	while (year(Dk) * 1000 + month(Dk)) <= (year(Df) * 1000 + month(Df))
	   tabla = tablaHoraris(Dk)
	   if exists (tabla) then
	     llistaDies = ""
	     D1 = 1
	     D2 = 31
	     if month(Dk) = month(di) then D1 = day(di)
	     if month(Dk) = month(Df) then D2 = day(Df)
	     if D1 = 1 And D2 = 31 then
	 		Sql = "Insert Into [" & tablaSortida & "_Tmp" & "] ([Botiga], [Data], [Dependenta], [Operacio]) SELECT Botiga, Data, Dependenta, Operacio FROM " & tabla & " "
	 		if len(auxSql)>0 then Sql = Sql & " Where (" &  auxSql & ")"
	     else
	 		Sql = "Insert Into [" & tablaSortida & "_Tmp" & "] ([Botiga], [Data], [Dependenta], [Operacio]) SELECT Botiga, Data, Dependenta, Operacio FROM " & tabla & " WHERE Day(data) >=  " & d1 & " And Day(data) <=  " & d2 & " "
	 		if len(auxSql)>0 then Sql = Sql & " And (" &  auxSql & ")"
	     end if
	     rec Sql
	   end if
	   Dk = dateadd("m",1,Dk)
	wend
	if exists (tablaSortida)then    rec "Drop table " & tablaSortida & ""
	rec "CREATE TABLE [dbo].[" & tablaSortida &  "] ([Dependenta] [float] NULL,[Botigainici] [float] NULL , [Datainici] [datetime] NULL , [Botigafinal] [float] NULL , [Datafinal] [datetime] NULL ,[Estat] [int] NULL ,[MinutsTreballats] [int] NULL) ON [PRIMARY]"
	set Rs = rec("SELECT * FROM " & tablaSortida & "_Tmp" & " Order by Dependenta, Data ")
    Set Q = Server.CreateObject("ADODB.Command")
    Q.ActiveConnection = Session("UserConnection")
    Q.CommandText = "Insert Into [" & tablaSortida &  "] ([Dependenta], [Botigainici], [Datainici],[Botigafinal], [Datafinal],[Estat],[MinutsTreballats]) VALUES (?,?,?,?,?,?,?)"
    if not rs.eof then
		LastDep = rs("Dependenta")
		dins= "no"
		horaentrada = Di
		horasalida = Di
		botiga=rs("botiga")
	end if
	while not rs.eof
	  if minI <> "0" and minF <> "0" then
			if rs("operacio")= "E" then
				min = minI
				com = comI
			else
				min = minF
				com = comF
			end if
			select case com
			case "Inferior"
				aux = int(DATEPART("n",rs("data"))/min)*min
			case "Superior"
				aux = (int(DATEPART("n",rs("data"))/min) + 1 ) * min
			case "Proxim"
				aux = round(DATEPART("n",rs("data"))/min,0) * min
			case else
				aux=10
			end select
			DataHora=dateadd("n",-DATEPART("n",rs("data"))+ aux,rs("data"))
		else
			DataHora=rs("data")
		end if
		if LastDep <> rs("Dependenta")  then
			if dins = "si" then
				Q.Parameters(0) = LastDep
				Q.Parameters(1) = botiga
				Q.Parameters(2) = horaentrada
				Q.Parameters(3) = botiga
				Q.Parameters(4) = Df
				Q.Parameters(5) = 1
				Q.Parameters(6) = DATEDIFF("n",horaentrada,Df)
				Q.Execute
			end if
			horaentrada = di
			horasalida = di
			dins= "no"
			LastDep = rs("Dependenta")
			botiga=rs("botiga")
		end if
	    if rs("operacio")= "E" then
	      if dins = "si" then
				Q.Parameters(0) = LastDep
				Q.Parameters(1) = botiga
				Q.Parameters(2) = horaentrada
				Q.Parameters(3) = rs("botiga")
				Q.Parameters(4) = DataHora
				if rs("botiga") = botiga then
					Q.Parameters(5) = 1
				else
					Q.Parameters(5) = 3
				end if
				Q.Parameters(6) = DATEDIFF("n",horaentrada,DataHora)
				Q.Execute
	      end if
	      dins= "si"
	      horaentrada = DataHora
	      botiga= rs("botiga")
	    end if
	    if rs("operacio")= "P"   then
	       if  dins = "no" then
				Q.Parameters(0) = LastDep
				Q.Parameters(1) = botiga
				Q.Parameters(2) = horasalida
				Q.Parameters(3) = rs("botiga")
				Q.Parameters(4) = DataHora
				if rs("botiga") = botiga then
					Q.Parameters(5) = 2
				else
					Q.Parameters(5) = 3
				end if
				Q.Parameters(6) = DATEDIFF("n",horasalida,DataHora)
				Q.Execute
	       else
				Q.Parameters(0) = LastDep
				Q.Parameters(1) = botiga
				Q.Parameters(2) = horaentrada
				Q.Parameters(3) = rs("botiga")
				Q.Parameters(4) = DataHora
				if rs("botiga") = botiga then
					Q.Parameters(5) = 0
				else
					Q.Parameters(5) = 3
				end if
				Q.Parameters(6) = DATEDIFF("n",horaentrada,DataHora)
				Q.Execute
	       end if
			dins= "no"
			horasalida = DataHora
			botiga= rs("botiga")
	    end if
	rs.Movenext
	wend
	if dins = "si" then
		Q.Parameters(0) = LastDep
		Q.Parameters(1) = botiga
		Q.Parameters(2) = horaentrada
		Q.Parameters(3) = botiga
		Q.Parameters(4) = Df
		Q.Parameters(5) = 1
		Q.Parameters(6) = DATEDIFF("n",horaentrada,Df)
		Q.Execute
	end if
	rs.close
	rec "Drop table [" & tablaSortida & "_Tmp" & "]"
end Sub

function tablaDependentesHores ( byval d )

	tablaDependentesHores = "Dependentes_Hores_" & year(d)

	if not exists (tablaDependentesHores) then

		sqlDH = "CREATE TABLE [dbo].[" & tablaDependentesHores & "] ("
		sqlDH = sqlDH & "[Id] [uniqueidentifier] NULL,"
		sqlDH = sqlDH & "[TimeStamp] [datetime] NULL,"
		sqlDH = sqlDH & "[Treballador] [int] NULL,"
		sqlDH = sqlDH & "[LlocTreball] [int] NULL,"
		sqlDH = sqlDH & "[HoraInici] [datetime] NULL,"
		sqlDH = sqlDH & "[HoraFi] [datetime] NULL,"
		sqlDH = sqlDH & "[MinutsTreballats] [float] NULL,"
		sqlDH = sqlDH & "[ProcedenciaDades] [nvarchar] (1) NULL,"
		sqlDH = sqlDH & "[Pagat] [int] NULL"
		sqlDH = sqlDH & ") ON [PRIMARY]"
		rec sqlDH

		sqlDH = "ALTER TABLE [" & tablaDependentesHores & "] WITH NOCHECK ADD "
		sqlDH = sqlDH & "CONSTRAINT [DF_Dependentes_Hores_2001_Id] DEFAULT (newid()) FOR [Id],"
		sqlDH = sqlDH & "CONSTRAINT [DF_Dependentes_Hores_2001] DEFAULT (getdate()) FOR [TimeStamp] "
		rec sqlDH
	end if

end function

function tablaComandesPlantilles ( )
	tablaComandesPlantilles = "ComandesPlantilles"
	if not exists (tablaComandesPlantilles) then
		sqlCP = "CREATE TABLE [dbo].[ComandesPlantilles] ("
		sqlCP = "[Nom] [nvarchar] (50),"
		sqlCP = "[Pos] [numeric](18, 0) NULL,"
		sqlCP = "[Article] [numeric](18, 0) NULL,"
		sqlCP = "[viatge] [nvarchar] (50) NULL,"
		sqlCP = "[Equip] [nvarchar] (50) NULL"
		sqlCP = ") ON [PRIMARY]"
		rec sqlCP
	end if
end function

function tablaComandesParams ( )
	tablaComandesParams = "ComandesParams"
	if not exists (tablaComandesParams) then
		sqlCP = "CREATE TABLE [dbo].[ComandesParams]("
		sqlCP = sqlCP & "[Tipus] [numeric](18, 0) NULL,"
		sqlCP = sqlCP & "[Camp] [numeric](18, 0) NULL,"
		sqlCP = sqlCP & "[Valor] [numeric](18, 0) NULL,"
		sqlCP = sqlCP & "[Descripcio] [nvarchar] (255)"
		sqlCP = sqlCP & ") ON [PRIMARY] "
		rec sqlCP
	end if
end function

function tablaEscandalls ( )
	tablaEscandalls = "escandalls"
	if not exists (tablaEscandalls) then
		sqlE = "CREATE TABLE [dbo].[Escandalls] ("
		sqlE = sqlE & "[Article] [numeric] (18, 0) NULL,"
		sqlE = sqlE & "[Materia] [nvarchar] (255)NULL,"
		sqlE = sqlE & "[Quantitat] [float] NULL,"
		sqlE = sqlE & "[Unitats] [nvarchar] (255) NULL"
		sqlE = sqlE & ") ON [PRIMARY]"
		rec sqlE
	end if
end function

function tablaCodisBarres ( )
	tablaCodisBarres = "CodisBarres"
	if not exists (tablaCodisBarres) then
		sqlCB = "CREATE TABLE [dbo].[" & tablaCodisBarres & "] ( "
		sqlCB = sqlCB & "[Codi] [nvarchar] (255) NULL,"
		sqlCB = sqlCB & "[Producte] [int] NULL "
		sqlCB = sqlCB & ") ON [PRIMARY]"
		rec sqlCB
	end if
end function

function tablaArticlesPropietats ( )
	tablaArticlesPropietats = "ArticlesPropietats"
	if not exists (tablaArticlesPropietats) then
		sqlCB = "CREATE TABLE [dbo].[" & tablaArticlesPropietats & "] ( "
		sqlCB = sqlCB & "[CodiArticle] [decimal] (18,0) NULL , "
		sqlCB = sqlCB & "[Variable] [nvarchar] (255) NULL , "
		sqlCB = sqlCB & "[Valor] [nvarchar] (4000) NULL  "
		sqlCB = sqlCB & ") ON [PRIMARY]"
		rec sqlCB
	end if
end function

function tablaDependentesHoresPreferencies ( )
	tablaDependentesHoresPreferencies = "Dependentes_Hores_Preferencies"
	if not exists (tablaDependentesHoresPreferencies) then
		sqlDHP = "CREATE TABLE [dbo].[" & tablaDependentesHoresPreferencies & "]("
		sqlDHP = sqlDHP & "[Camp] [nvarchar](255) NULL,"
		sqlDHP = sqlDHP & "[Valor] [nvarchar](255) NULL"
		sqlDHP = sqlDHP & ") ON [PRIMARY]"
		rec sqlDHP
	end if
end function

function tablaProductesEquivalents ( )
	tablaProductesEquivalents = "EquivalenciaProductes"
	if not exists (tablaProductesEquivalents) then
		sqlPE = "CREATE TABLE [dbo].[" & tablaProductesEquivalents & "] ( "
		sqlPE = sqlPE & " [ProdVenut] [decimal](18, 0) NULL , "
		sqlPE = sqlPE & " [ProdServit] [decimal](18, 0) NULL , "
		sqlPE = sqlPE & " [UnitatsEquivalencia] [decimal](5, 0) NULL "
		sqlPE = sqlPE & ") ON [PRIMARY]"
		rec sqlPE
	end if
end function

function tablaEstadisticas ( byval D )
	tablaEstadisticas = "[V_Estadis_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (tablaEstadisticas) then  
		sqlE = "CREATE TABLE [dbo]." & tablaEstadisticas & " ("
		sqlE = sqlE & "[Tipus] [float] NULL ,"
		sqlE = sqlE & "[Data] [datetime] NULL ,"
		sqlE = sqlE & "[Dia] [float] NULL ,"
		sqlE = sqlE & "[Hora] [float] NULL ,"
		sqlE = sqlE & "[Client] [float] NULL ,"
		sqlE = sqlE & "[Producte] [float] NULL ,"
		sqlE = sqlE & "[Quantitat] [float] NULL"
		sqlE = sqlE & ") ON [PRIMARY]"
	    rec sqlE
	end if
end function

function tablaPromocions ( )
	tablaPromocions = "promocions"
	if not exists (tablaPromocions) then
		sqlP = "CREATE TABLE [dbo].[" & tablaPromocions & "] ("
		sqlP = sqlP & "[di] [datetime] NULL ,"
		sqlP = sqlP & "[df] [datetime] NULL ,"
		sqlP = sqlP & "[botiga] [numeric](18, 0) NULL ,"
		sqlP = sqlP & "[article] [numeric](18, 0) NULL ,"
		sqlP = sqlP & "[punts] [numeric](18, 0) NULL"
		sqlP = sqlP & ") ON [PRIMARY]"
		rec sqlP
	end if
end function

function tablaProductesPromocionats ( )
	tablaProductesPromocionats = "ProductesPromocionats"
	if not exists (tablaProductesPromocionats) then
		sqlPP = "CREATE TABLE [dbo].[" & tablaProductesPromocionats & "] ("
		sqlPP = sqlPP & "[Id] [nvarchar](50) NULL,"
		sqlPP = sqlPP & "[Di] [datetime] NULL,"
		sqlPP = sqlPP & "[Df] [datetime] NULL,"
		sqlPP = sqlPP & "[D_Producte] [float] NULL,"
		sqlPP = sqlPP & "[D_Quantitat] [float] NULL,"
		sqlPP = sqlPP & "[S_Producte] [float] NULL,"
		sqlPP = sqlPP & "[S_Quantitat] [float] NULL,"
		sqlPP = sqlPP & "[S_Preu] [float] NULL,"
		sqlPP = sqlPP & "[Client] [nvarchar](50) NULL"
		sqlPP = sqlPP & ") ON [PRIMARY]"
		rec sqlPP
	end if
end function

function tablaEquipos ( )
	if gESTIL = "CDP" then
		tablaEquipos = "cdpEquips"
		if not exists (tablaEquipos) then
			sqlE = "CREATE TABLE [" & tablaEquipos & "] ("
			sqlE = sqlE & "[Nombre] [nvarchar] (255) NULL"
			sqlE = sqlE & ") ON [PRIMARY]"
			rec sqlE
		end if
	else
		tablaEquipos = "EquipsDeTreball"
		if not exists (tablaEquipos) then
			sqlE = "CREATE TABLE [dbo].[" & tablaEquipos & "] ("
			sqlE = sqlE & "[Nom] [nvarchar] (255) NULL ,"
			sqlE = sqlE & "[Defecte] [bit] NOT NULL "
			sqlE = sqlE & ") ON [PRIMARY]"
			rec sqlE
		end if
	end if
end function

function tablaEquiposUsuario ( )
	tablaEquiposUsuario = "cdpEquiposUsuario"
	if not exists (tablaEquiposUsuario) then
		sqlEU = "CREATE TABLE [dbo].[" & tablaEquiposUsuario & "] ("
		sqlEU = sqlEU & "[Nombre] [nvarchar] (255) NULL,"
		sqlEU = sqlEU & "[Usuario] [nvarchar] (255) NULL"
		sqlEU = sqlEU & ") ON [PRIMARY]"
		rec sqlEU
	end if
end function

function tablaCdpParametros ( )
	tablaCdpParametros = "cdpParametros"
	if not exists (tablaCdpParametros) then
		sqlP = "CREATE TABLE [dbo].[" & tablaCdpParametros & "] ("
		sqlP = sqlP & "[Id] [nvarchar](255) NULL, "
		sqlP = sqlP & "[Variable] [nvarchar](255) NULL, "
		sqlP = sqlP & "[Valor] [nvarchar](4000) NULL "
		sqlP = sqlP & ") ON [PRIMARY] "
		rec sqlP
	end if
end function


function tablaTurnos ( )
	tablaTurnos = "cdpTurnos"
	if not exists (tablaTurnos) then
		sqlT = "CREATE TABLE [dbo].[" & tablaTurnos & "] ("
		sqlT = sqlT & "[nombre] [nvarchar] (255) NULL,"
		sqlT = sqlT & "[horaInicio] [nvarchar] (255) NULL,"
		sqlT = sqlT & "[horaFin] [nvarchar] (255) NULL,"
		sqlT = sqlT & "[idTurno] [nvarchar] (255) NULL CONSTRAINT [DF_idTurno] DEFAULT (newid()),"
		sqlT = sqlT & "[totalHoras] [numeric](18, 0) NULL,"
		sqlT = sqlT & "[festivos] [nvarchar] (255) NULL,"
		sqlT = sqlT & "[diaInicio] [numeric](18, 0) NULL,"
		sqlT = sqlT & "[color] [nvarchar] (255) NULL"
		sqlT = sqlT & ")ON [PRIMARY]"
		rec sqlT
	end if
end function

function tablaCentros ( )
	tablaCentros = "cdpCentros"
	if not exists (tablaCentros) then
		sqlC = "CREATE TABLE [dbo].[" & tablaCentros & "] ("
		sqlC = sqlC & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_centros_id] DEFAULT (newid()),"
		sqlC = sqlC & "[nombre] [nvarchar] (255) NULL,"
		sqlC = sqlC & "[direccion] [nvarchar] (255) NULL,"
		sqlC = sqlC & "[poblacion] [nvarchar] (255) NULL "
		sqlC = sqlC & ")ON [PRIMARY]"
		rec sqlC
	end if
end function

function tablaPagado ( )
	tablaPagado = "cdpPagado"
	if not exists ( tablaPagado ) then
		sqlP = "CREATE TABLE [" & tablaPagado & "] ("
		sqlP = sqlP & "[fecha] [datetime] NOT NULL ,"
		sqlP = sqlP & "[trabajador] [numeric](18, 0) NOT NULL ,"
		sqlP = sqlP & "[totalHoras] [float] NULL ,"
		sqlP = sqlP & "[totalHorasBase] [float] NULL ,"
		sqlP = sqlP & "[totalHorasFestivas] [float] NULL ,"
		sqlP = sqlP & "[totalHorasExtra] [float] NULL ,"
		sqlP = sqlP & "[horasBase] [float] NULL ,"
		sqlP = sqlP & "[precioBase] [float] NULL ,"
		sqlP = sqlP & "[precioFestivo] [float] NULL ,"
		sqlP = sqlP & "[precioExtra] [float] NULL ,"
		sqlP = sqlP & "[id] [numeric](18, 0) IDENTITY (1, 1) NOT NULL ,"
		sqlP = sqlP & ") ON [PRIMARY]"
		rec sqlP
	end if
end function

function tablaPlanning ( byval any )
	tablaPlanning = "Planning" & any
	if not exists ( tablaPlanning ) then
		sqlP = "CREATE TABLE [" & tablaPlanning & "] ("
		sqlP = sqlP & "[idUsuario]	[numeric](18, 0) NULL ,"
		sqlP = sqlP & "[Dia]		[numeric](18, 0) NULL ,"
		sqlP = sqlP & "[Mes]		[numeric](18, 0) NULL ,"
		sqlP = sqlP & "[HInicio]	[datetime] NULL ,"
		sqlP = sqlP & "[Horas]		[numeric](18, 0) NULL ,"
		sqlP = sqlP & "[Turno]		[nvarchar] (255) NULL ,"
		sqlP = sqlP & "[Comentario]	[nvarchar] (255) NULL ,"
		sqlP = sqlP & "[Creado]		[nvarchar] (255) NULL CONSTRAINT [DF_" & tablaPlanning & "_Creado] DEFAULT (getdate()),"
		sqlP = sqlP & "[Modificado]	[nvarchar] (255) NULL ,"
		sqlP = sqlP & "[Lugar]		[numeric](18, 0) NULL ,"
		sqlP = sqlP & "[Ano]		[numeric](18, 0) NULL "
		sqlP = sqlP & ") ON [PRIMARY]"
		rec sqlP
	end if
end function

function tablaAgenda ( )
	tablaAgenda = "Agenda"
	if not exists (tablaAgenda) then
		sqlA = "CREATE TABLE [dbo].[Agenda] ( "
		sqlA = sqlA & "[Id] [timestamp] NOT NULL , "
		sqlA = sqlA & "[Fecha] [datetime] NOT NULL , "
		sqlA = sqlA & "[Comentario] [nvarchar] (500) NULL , "
		sqlA = sqlA & "[TipoDia] [nvarchar] (10)  NULL , "
		sqlA = sqlA & "[Usuario] [nvarchar] (255) NULL , "
		sqlA = sqlA & "[DocAdjunto] [nvarchar] (255) NULL "
		sqlA = sqlA & ") ON [PRIMARY]"
		rec sqlA
	end if
end function

function tablaAgendaAnual ( byval any )
	tablaAgendaAnual = "Agenda_" & any
	if not exists (tablaAgendaAnual) then
		sqlA = "CREATE TABLE [dbo].[" & tablaAgendaAnual & "] ( "
		sqlA = sqlA & "[Id] [nvarchar] (255) NULL CONSTRAINT [DF_Agenda_" & any & "_id] DEFAULT (newid()),	"
		sqlA = sqlA & "[Fecha] [datetime] NOT NULL , "
		sqlA = sqlA & "[Concepto] [nvarchar] (255) NULL , "
		sqlA = sqlA & "[Param1] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param2] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param3] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param4] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param5] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param6] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param7] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param8] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param9] [nvarchar] (255)  NULL , "
		sqlA = sqlA & "[Param10] [nvarchar] (255)  NULL  "
		sqlA = sqlA & ") ON [PRIMARY]"
		rec sqlA
	end if
end function

function tablaConfiguraRecorda ( )
	tablaConfiguraRecorda = "configuraRecorda"
	if not exists ( tablaConfiguraRecorda ) then
		sqlCR = "CREATE TABLE [dbo].[" & tablaConfiguraRecorda & "]( "
		sqlCR = sqlCR & "tipo nvarchar(10) null Default ('NORMAL'),"
		sqlCR = sqlCR & "mode nvarchar(3) null Default ('COM'),"
		sqlCR = sqlCR & "port numeric null Default (1),"
		sqlCR = sqlCR & "ip nvarchar (15) null Default('192.9.199.70')"
		sqlCR = sqlCR & ") ON [PRIMARY]"
		rec sqlCR
	end if
end function

function tablaFax ( )
	tablaFax = "fax"
	if not exists (tablaFax) then
		sqlF = "CREATE TABLE [dbo].[" & tablaFax & "] ("
		sqlF = sqlF & "[fecha] [datetime] NULL CONSTRAINT [DF_" & tablaFax & "_fecha] DEFAULT (getdate()),"
		sqlF = sqlF & "[viaje] [nvarchar] (255) NULL,"
		sqlF = sqlF & "[cliente] [numeric](18,0) NULL,"
		sqlF = sqlF & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaFax & "_id] DEFAULT (newid())"
		sqlF = sqlF & ") ON [PRIMARY]"
		rec sqlF
	end if
end function

function tablaOrdenArticulos ( )
	tablaOrdenArticulos = "ordenArticulos"
	if not exists (tablaOrdenArticulos) then
		sqlOA = "CREATE TABLE [dbo].[" & tablaOrdenArticulos & "] ("
		sqlOA = sqlOA & "[plu] [numeric](18, 0) NULL ,"
		sqlOA = sqlOA & "[veces] [numeric](18, 0) NULL "
		sqlOA = sqlOA & ") ON [PRIMARY]"
		rec sqlOA
	end if
end function

function tablaCajas ( )
	tablaCajas = "cajas"
	if not exists (tablaCajas) then
		sqlC = "CREATE TABLE [dbo].[" & tablaCajas & "] ("
		sqlC = sqlC & "[caja] [numeric](18,0) IDENTITY (1,1) NOT FOR REPLICATION  NOT NULL,"
		sqlC = sqlC & "[plu] [numeric](18,0) NULL,"
		sqlC = sqlC & "[ini] [datetime] NULL CONSTRAINT [DF_" & tablaCajas & "_ini] DEFAULT (getdate()),"
		sqlC = sqlC & "[fin] [datetime] NULL,"
		sqlC = sqlC & "[estado] [numeric](18,0) NULL CONSTRAINT [DF_" & tablaCajas & "_estado] DEFAULT (1),"
		sqlC = sqlC & "[facturada] [numeric](18,0) NULL CONSTRAINT [DF_" & tablaCajas & "_facturada] DEFAULT (0)"
		sqlC = sqlC & ") ON [PRIMARY]"
		rec sqlC
	end if
end function

function tablaDedos ( )
	tablaDedos = "dedos"
	if not exists (tabladedos) then
		sqlD = "CREATE TABLE [dbo].[" & tablaDedos & "] ("
		sqlD = sqlD & "[usuario] [nvarchar] (255) NULL ,"
		sqlD = sqlD & "[fir] [nvarchar] (4000) NULL ,"
		sqlD = sqlD & "[userId] [numeric](18, 0) NULL "
		sqlD = sqlD & ") ON [PRIMARY]"
		rec sqlD
	end if
end function

function tablaLimbo ( byval db )
	tablaLimbo = "Emp_" & db & "_Usuaris_Limbo"
	if not exists (tablaLimbo) then
		sqlL = "CREATE TABLE [dbo].[" & tablaLimbo & "] ("
		sqlL = sqlL & "[Ids] [nvarchar] (255) NULL ,"
		sqlL = sqlL & "[tmst] [datetime] NULL ,"
		sqlL = sqlL & "[fichador] [numeric](18, 0) NULL "
		sqlL = sqlL & ") ON [PRIMARY]"
		rec sqlL
	end if
end function

function tablaArticlesHistorial ( )
	tablaArticlesHistorial = "articlesHistorial"
	if not exists (tablaArticlesHistorial) then
		rec "select top 1 * into " & tablaArticlesHistorial & " from articles"
		rec "delete from " & tablaArticlesHistorial
		rec "alter table " & tablaArticlesHistorial & " add fechaModif datetime null constraint df_" & tablaArticlesHistorial & "_fechaModif default (getdate())"
		rec "alter table " & tablaArticlesHistorial & " add usuarioModif nvarchar (255) null"
		rec "insert into " & tablaArticlesHistorial & " select *,getdate(),'INICIAL' from articles "
	end if
end function

function tablaTarifesHistorial ( )
	tablaTarifesHistorial = "tarifesHistorial"
	if not exists (tablaTarifesHistorial) then
		rec "select top 1 * into " & tablaTarifesHistorial & " from tarifesEspecials"
		rec "delete from " & tablaTarifesHistorial
		rec "alter table " & tablaTarifesHistorial & " add fechaModif datetime null constraint df_" & tablaTarifesHistorial & "_fechaModif default (getdate())"
		rec "alter table " & tablaTarifesHistorial & " add usuarioModif nvarchar (255) null"
		rec "insert into " & tablaTarifesHistorial & " select *,getdate(),'INICIAL' from tarifesEspecials "
	end if
end function

function tablatarifesespecialsclients ( )
	tablatarifesespecialsclients = "tarifesespecialsclients"
	if not exists ( tablatarifesespecialsclients ) then
		dim sqlFM
		sqlFM = "create table " & tablatarifesespecialsclients & " ("
		sqlFM = sqlFM & "[Id] [nvarchar] (255) NULL Default (NEWID()), "
		sqlFM = sqlFM & "[Client] [int] NULL , "
		sqlFM = sqlFM & "[Codi] [int] NULL , "
		sqlFM = sqlFM & "[PREU] [float] NOT NULL , "
		sqlFM = sqlFM & "[PreuMajor] [float] NULL, " 
		sqlFM = sqlFM & "[Di] [datetime] NULL , "
		sqlFM = sqlFM & "[Df] [datetime] NULL , "
		sqlFM = sqlFM & "[Qmin] [float] NOT NULL , "
		sqlFM = sqlFM & "[Aux1] [nvarchar] (255) NULL" 
		sqlFM = sqlFM & ") ON [PRIMARY] "
		rec sqlFM
	end if
end function

function tablaTarifesClientsHistorial ( )
	tablaTarifesClientsHistorial = "tarifesClientsHistorial"
	if not exists (tablaTarifesClientsHistorial) then
		rec "select top 1 * into " & tablaTarifesClientsHistorial & " from tarifesespecialsclients"
		rec "delete from " & tablaTarifesClientsHistorial
		rec "alter table " & tablaTarifesClientsHistorial & " add fechaModif datetime null constraint df_" & tablaTarifesClientsHistorial & "_fechaModif default (getdate())"
		rec "alter table " & tablaTarifesClientsHistorial & " add usuarioModif nvarchar (255) null"
		rec "insert into " & tablaTarifesClientsHistorial & " select *,getdate(),'INICIAL' from tarifesespecialsclients "
	end if
end function

function tablaClientsHistorial ( )
	tablaClientsHistorial = "clientsHistorial"
	if not exists (tablaClientsHistorial) then
		rec "select top 1 * into " & tablaClientsHistorial & " from clients"
		rec "delete from " & tablaClientsHistorial
		rec "alter table " & tablaClientsHistorial & " add fechaModif datetime null constraint df_" & tablaClientsHistorial & "_fechaModif default (getdate())"
		rec "alter table " & tablaClientsHistorial & " add usuarioModif nvarchar (255) null"
		rec "insert into " & tablaClientsHistorial & " select *,getdate(),'INICIAL' from clients "
	end if
end function

function tablaConstantsClientHistorial ( )
	tablaConstantsClientHistorial = "constantsClientHistorial"
	if not exists (tablaConstantsClientHistorial) then
		rec "select top 1 * into " & tablaConstantsClientHistorial & " from constantsClient"
		rec "delete from " & tablaConstantsClientHistorial
		rec "alter table " & tablaConstantsClientHistorial & " add fechaModif datetime null constraint df_" & tablaConstantsClientHistorial & "_fechaModif default (getdate())"
		rec "alter table " & tablaConstantsClientHistorial & " add usuarioModif nvarchar (255) null"
		rec "insert into " & tablaConstantsClientHistorial & " select *,getdate(),'INICIAL' from constantsClient "
	end if
end function


function tablaConstantsEmpresa ( )
	tablaConstantsEmpresa = "ConstantsEmpresa"
	if not exists (tablaConstantsEmpresa) then
		sqlCE = "CREATE TABLE [dbo].[" & tablaConstantsEmpresa & "] ("
		sqlCE = sqlCE & "[Camp] [nvarchar] (255) NULL ,"
		sqlCE = sqlCE & "[Valor] [nvarchar] (255) NULL"
		sqlCE = sqlCE & ") ON [PRIMARY]"
		rec sqlCE
		rellenaConstantsEmpresa primeraEmpresa
	end if
end function

function tablaRutas ( )

	tablaRutas = "rutas"

	if not exists (tablaRutas) then

		sqlR = "CREATE TABLE [" & tablaRutas & "] ("
		sqlR = sqlR & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaRutas & "_id] DEFAULT (newid()),"
		sqlR = sqlR & "[nom] [nvarchar] (255) NULL "
		sqlR = sqlR & ") ON [PRIMARY]"
		rec sqlR
		rec "insert into " & tablaRutas & " (nom) values ('inicial')"
	end if

end function

function tablaRutasCli ( )
	tablaRutasCli = "rutasCli"
	if not exists (tablaRutasCli) then
		sqlRC = "CREATE TABLE [" & tablaRutasCli & "] ("
		sqlRC = sqlRC & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaRutasCli & "_id] DEFAULT (newid()),"
		sqlRC = sqlRC & "[ruta] [nvarchar] (255) ,"
		sqlRC = sqlRC & "[cli] [numeric](18, 0) NULL "
		sqlRC = sqlRC & ") ON [PRIMARY]"
		rec sqlRC
	end if
end function

function tablaRutaTrab ( )
	tablaRutaTrab = "rutaTrab"
	if not exists (tablaRutaTrab) then
		sqlRC = "CREATE TABLE [" & tablaRutaTrab & "] ("
		sqlRC = sqlRC & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaRutaTrab & "_id] DEFAULT (newid()),"
		sqlRC = sqlRC & "[ruta] [nvarchar] (255) NULL ,"
		sqlRC = sqlRC & "[trabajador] [nvarchar] (255) NULL "
		sqlRC = sqlRC & ") ON [PRIMARY]"
		rec sqlRC
	end if
end function

function tablaLoginLog ( )
	tablaLoginLog = "loginLog"
	if not exists ( tablaLoginLog ) then
		sqlLL = "CREATE TABLE [" & tablaLoginLog & "] ("
		sqlLL = sqlLL & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaLoginLog & "_id] DEFAULT (newid()),"
		sqlLL = sqlLL & "[user] [nvarchar] (255) NULL ,"
		sqlLL = sqlLL & "[pass] [nvarchar] (255) NULL ,"
		sqlLL = sqlLL & "[fecha] [datetime] NULL CONSTRAINT [DF_" & tablaLoginLog & "_fecha] DEFAULT (getdate()),"
		sqlLL = sqlLL & "[accion] [nvarchar] (255) NULL "
		sqlLL = sqlLL & ") ON [PRIMARY]"
		rec sqlLL
	end if
end function

function tablaIngredients ( )
	tablaIngredients = "ingredients"
	if not exists ( tablaIngredients ) then
		sqlI = "create table [" & tablaIngredients & "] ("
		sqlI = sqlI & "[article]   [decimal]  (18, 0) NULL ,"
		sqlI = sqlI & "[materia]   [nvarchar] (255)   NULL ,"
		sqlI = sqlI & "[quantitat] [decimal]  (18, 2) NULL ,"
		sqlI = sqlI & "[comentari] [nvarchar] (4000)  NULL"
		sqlI = sqlI & ") on [PRIMARY]"
	end if
end function

' --- Tablas de Control de Compras ------------------------------------------------------------------------------------------------------

function tablaMateriasPrimas ( )
	tablaMateriasPrimas = "ccMateriasPrimas"
	if not exists (tablaMateriasPrimas) then
		sqlMP = "CREATE TABLE [dbo].[" & tablaMateriasPrimas & "] ("
		sqlMP = sqlMP & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_ccMateriasPrimas_id] DEFAULT (newid()), "
		sqlMP = sqlMP & "[nombre] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[descripcion] [nvarchar] (4000) NULL ,"
		sqlMP = sqlMP & "[alta] [datetime] NULL CONSTRAINT [DF_ccMateriasPrimas_alta] DEFAULT (getdate()),"
		sqlMP = sqlMP & "[activo] [bit] NULL CONSTRAINT [DF_ccMateriasPrimas_activo] DEFAULT (1),"
		sqlMP = sqlMP & "[codigo] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[caducidad] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[refrigeracion] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[etiquetado] [bit] NULL ,"
		sqlMP = sqlMP & "[barcode] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[envasado] [bit] NULL ,"
		sqlMP = sqlMP & "[unidades] [numeric](18, 2) NULL ,"
		sqlMP = sqlMP & "[almacen] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[etiqueta] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[proveedor] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[tipoEnvio] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[nevera] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[ubicacion] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[unidadesEnvio] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[temperatura] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[stockMin] [numeric](18, 2) NULL ,"
		sqlMP = sqlMP & "[precio] [numeric](18, 4) NULL ,"
		sqlMP = sqlMP & "[iva] [float] NULL "
		sqlMP = sqlMP & ") ON [PRIMARY]"
		rec sqlMP

		sqlMP = "insert into ccMateriasPrimasZombis  ([id],[nombre],[descripcion],[alta],[activo],[codigo],[caducidad],[refrigeracion],[etiquetado],[barcode],[envasado],[unidades],[almacen],[etiqueta],[proveedor],[tipoEnvio],[nevera],[ubicacion],[unidadesEnvio],[temperatura],[stockMin],[precio],[iva]) "
		sqlMP = sqlMP & ") select [id],[nombre],[descripcion],[alta],[activo],[codigo],[caducidad],[refrigeracion],[etiquetado],[barcode],[envasado],[unidades],[almacen],[etiqueta],[proveedor],[tipoEnvio],[nevera],[ubicacion],[unidadesEnvio],[temperatura],[stockMin],[precio],[iva] "
		sqlMP = sqlMP & ") from ccMateriasPrimas where activo = 0 "
		rec sqlMP

		rec "Delete ccMateriasPrimasZombis where activo = 0 "
		
	end if
	
	if not exists (tablaMateriasPrimas & "Zombis") then
		sqlMP = "CREATE TABLE [dbo].[" & tablaMateriasPrimas & "Zombis] ("
		sqlMP = sqlMP & "[id] [nvarchar] (255) NULL , "
		sqlMP = sqlMP & "[nombre] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[descripcion] [nvarchar] (4000) NULL ,"
		sqlMP = sqlMP & "[alta] [datetime] NULL ,"
		sqlMP = sqlMP & "[activo] [bit] NULL ,"
		sqlMP = sqlMP & "[codigo] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[caducidad] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[refrigeracion] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[etiquetado] [bit] NULL ,"
		sqlMP = sqlMP & "[barcode] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[envasado] [bit] NULL ,"
		sqlMP = sqlMP & "[unidades] [numeric](18, 2) NULL ,"
		sqlMP = sqlMP & "[almacen] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[etiqueta] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[proveedor] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[tipoEnvio] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[nevera] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[ubicacion] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[unidadesEnvio] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[temperatura] [nvarchar] (255) NULL ,"
		sqlMP = sqlMP & "[stockMin] [numeric](18, 2) NULL ,"
		sqlMP = sqlMP & "[precio] [numeric](18, 2) NULL ,"
		sqlMP = sqlMP & "[iva] [float] NULL,"
		sqlMP = sqlMP & "[DataBaixa] [datetime] NULL CONSTRAINT [DF_ccMateriasPrimasZombis_Baixa] DEFAULT (getdate()),"
		sqlMP = sqlMP & ") ON [PRIMARY]"
		rec sqlMP

	end if
	
end function

function tablaMateriasPrimasBase()
	tablaMateriasPrimasBase = "ccMateriasPrimasBase"
	if not exists (tablaMateriasPrimasBase) then
		sql = "CREATE TABLE [dbo].[" & tablaMateriasPrimasBase & "] "
		sql = sql & "([id] [nvarchar] (255) NULL CONSTRAINT [DF_ccMateriasPrimasBase_id]  DEFAULT (newid()) , "
		sql = sql & "[nombre] [nvarchar] (255) NULL,  "
		sql = sql & "[descripcion] [nvarchar] (255) NULL,  "
		sql = sql & "[predeterminada] [nvarchar] (255) NULL  "
		sql = sql & ") ON [PRIMARY]"
		rec sql
	end if
end function

function tablaProveedores ( )
	tablaProveedores = "ccProveedores"
	if not exists (tablaProveedores) then
		sqlP = "CREATE TABLE [dbo].[" & tablaProveedores & "] ("
		sqlP = sqlP & "[id] [nvarchar](255) NULL CONSTRAINT [DF_ccProveedores_id]  DEFAULT (newid()), "
		sqlP = sqlP & "[nombre] [nvarchar](255) NULL,"
		sqlP = sqlP & "[nombreCorto] [nvarchar](255) NULL,"
		sqlP = sqlP & "[descripcion] [nvarchar](4000) NULL,"
		sqlP = sqlP & "[nif] [nvarchar](255) NULL,"
		sqlP = sqlP & "[direccion] [nvarchar](255) NULL,"
		sqlP = sqlP & "[cp] [nvarchar](5) NULL,"
		sqlP = sqlP & "[ciudad] [nvarchar](255) NULL,"
		sqlP = sqlP & "[provincia] [nvarchar](255) NULL,"
		sqlP = sqlP & "[pais] [nvarchar](255) NULL,"
		sqlP = sqlP & "[tlf1] [nvarchar](20) NULL,"
		sqlP = sqlP & "[tlf2] [nvarchar](20) NULL,"
		sqlP = sqlP & "[fax] [nvarchar](20) NULL,"
		sqlP = sqlP & "[alta] [datetime] NULL CONSTRAINT [DF_ccProveedores_alta]  DEFAULT (getdate()),"
		sqlP = sqlP & "[activo] [bit] NULL CONSTRAINT [DF_ccProveedores_activo]  DEFAULT ((1)),"
		sqlP = sqlP & "[eMail] [nvarchar](255) NULL,"
		sqlP = sqlP & "[via] [nvarchar](255) NULL,"
		sqlP = sqlP & "[pedidoPeriodo] [nvarchar](255) NULL,"
		sqlP = sqlP & "[codi] [nvarchar](20) NULL,"
		sqlP = sqlP & "[numFacturacion] [nvarchar](255) NULL,"
		sqlP = sqlP & "[facturaPeriodo] [nvarchar](50) NULL,"
		sqlP = sqlP & "[tipoCobro] [nvarchar](50) NULL,"
		sqlP = sqlP & "[descuento] [decimal](18, 0) NOT NULL CONSTRAINT [DF_ccProveedores_descuento]  DEFAULT ((0)),"
		sqlP = sqlP & "[Tipo] [nvarchar](255) NULL,"
		sqlP = sqlP & "[Cc] [nvarchar](255) NULL,"
		sqlP = sqlP & "[Contra4] [nvarchar](255) NULL,"
		sqlP = sqlP & "[Contra7] [nvarchar](255) NULL,"
		sqlP = sqlP & "[Contra16] [nvarchar](255) NULL"	
		sqlP = sqlP & ") ON [PRIMARY]"
		rec sqlP
	end if
end function

function tablaProveedoresExtes()
	tablaProveedoresExtes = "ccProveedoresExtes"
	if not exists (tablaProveedoresExtes) then
		sql = "CREATE TABLE [dbo].[" & tablaProveedoresExtes & "] "
		sql = sql & "([id] [nvarchar] (255) NULL , "
		sql = sql & "[nom] [nvarchar] (255) NULL , "
		sql = sql & "[valor] [nvarchar] (255) NULL ) ON [PRIMARY]"
		rec sql
	end if
end function


function tablaRecepcion ( )
	tablaRecepcion = "ccRecepcion"
	if not exists (tablaRecepcion) then
		sqlTR = "CREATE TABLE [dbo].[" & tablaRecepcion & "] ("
		sqlTR = sqlTR & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaRecepcion & "_id] DEFAULT (newid()),"
		sqlTR = sqlTR & "[proveedor] [nvarchar] (255) ,"
		sqlTR = sqlTR & "[matPrima] [nvarchar] (255) ,"
		sqlTR = sqlTR & "[albaran] [nvarchar] (255) ,"
		sqlTR = sqlTR & "[pedido] [nvarchar] (255) ,"
		sqlTR = sqlTR & "[temperatura] [numeric](18, 2) NULL ,"
		sqlTR = sqlTR & "[caract] [bit] NULL ,"
		sqlTR = sqlTR & "[envas] [bit] NULL ,"
		sqlTR = sqlTR & "[usuario] [nvarchar] (255) ,"
		sqlTR = sqlTR & "[fecha] [datetime] NULL CONSTRAINT [DF_" & tablaRecepcion & "_fecha] DEFAULT (getdate()),"
		sqlTR = sqlTR & "[aceptado] [bit] NULL, "
		sqlTR = sqlTR & "[lote] [nvarchar] (255), "
		sqlTR = sqlTR & "[facturado] bit NULL CONSTRAINT [DF_" & tablaRecepcion & "_facturado] DEFAULT (0), "
		sqlTR = sqlTR & "[caducidad] [datetime] NULL CONSTRAINT [DF_" & tablaRecepcion & "_caducidad] DEFAULT (getdate()) "
		sqlTR = sqlTR & ") ON [PRIMARY]"
		rec sqlTR
	end if
end function

function tablaAlmacenes ( )
	tablaAlmacenes = "ccAlmacenes"
	if not exists (tablaAlmacenes) then
		sqlA = "CREATE TABLE [dbo].[" & tablaAlmacenes & "]("
		sqlA = sqlA & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaAlmacenes & "_id] DEFAULT (newid()),"
		sqlA = sqlA & "[nombre] [nvarchar] (255),"
		sqlA = sqlA & "[descripcion] [nvarchar] (4000),"
		sqlA = sqlA & "[alta] [datetime] NULL CONSTRAINT [DF_" & tablaAlmacenes & "_alta] DEFAULT (getdate()),"
		sqlA = sqlA & "[activo] [bit] NULL CONSTRAINT [DF_" & tablaAlmacenes & "_activo] DEFAULT (1)"
		sqlA = sqlA & ") ON [PRIMARY]"
		rec sqlA
	end if
end function

		sqlCTDE = "CREATE TABLE [dbo].[" & tablaDependentesExtes & "] ([id] [nvarchar] (255) NULL ,"
		sqlCTDE = sqlCTDE & "[nom] [nvarchar] (255) NULL ,[valor] [nvarchar] (255) NULL ) ON [PRIMARY]"

function tablaAlmacenesExtes ( )
	tablaAlmacenesExtes = "ccAlmacenesExtes"
	if not exists (tablaAlmacenesExtes) then
		sqlA = "CREATE TABLE [dbo].[" & tablaAlmacenesExtes & "]("
		sqlA = sqlA & "[id] [nvarchar] (255), "
		sqlA = sqlA & "[nombre] [nvarchar] (255), "
		sqlA = sqlA & "[valor] [nvarchar] (255) "
		sqlA = sqlA & ") ON [PRIMARY]"
		rec sqlA
	end if
end function


function tablaPedidos ( )
	tablaPedidos = "ccPedidos"
	if not exists (tablaPedidos) then
		sqlP = "CREATE TABLE [dbo].[" & tablaPedidos & "] ("
		sqlP = sqlP & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaPedidos & "_id] DEFAULT (newid()),"
		sqlP = sqlP & "[materiaPrima] [nvarchar] (255),"
		sqlP = sqlP & "[proveedor] [nvarchar] (255),"
		sqlP = sqlP & "[almacen] [nvarchar] (255),"
		sqlP = sqlP & "[cantidad] [numeric](18, 2) NULL,"
		sqlP = sqlP & "[fecha] [datetime] NULL CONSTRAINT [DF_" & tablaPedidos & "_fecha] DEFAULT (getdate()),"
		sqlP = sqlP & "[recepcion] [datetime] NULL CONSTRAINT [DF_" & tablaPedidos & "_recepcion] DEFAULT (getdate()),"
		sqlP = sqlP & "[precio] [numeric](18, 2) NULL,"
		sqlP = sqlP & "[activo] [bit] NULL CONSTRAINT [DF_" & tablaPedidos & "_activo] "
		sqlP = sqlP & "DEFAULT (1)) ON [PRIMARY]"
		rec sqlP
	end if
end function

function tablaBarCode ( )
	tablaBarCode = "ccBarcode"
	if not exists (tablaBarCode) then
		sqlBC = "CREATE TABLE [dbo].[" & tablaBarCode & "] ("
		sqlBC = sqlBC & "[id] [nvarchar] (255) NULL ,"
		sqlBC = sqlBC & "[barcode] [numeric](18, 0) IDENTITY (1, 1) NOT NULL ,"
		sqlBC = sqlBC & "[tipo] [nvarchar] (255) NULL ,"
		sqlBC = sqlBC & "[ean13] [nvarchar] (13) NULL "
		sqlBC = sqlBC & ") ON [PRIMARY]"
		rec sqlBC
	end if
end function

function tablaOfertas ( )
	tablaOfertas = "ccOfertas"
	if not exists (tablaOfertas) then
		sqlO = "CREATE TABLE [dbo].[" & tablaOfertas & "] ("
		sqlO = sqlO & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaOfertas & "_id] DEFAULT (newid()),"
		sqlO = sqlO & "[materiaPrima] [nvarchar] (255),"
		sqlO = sqlO & "[proveedor] [nvarchar] (255),"
		sqlO = sqlO & "[fecha] [datetime] NULL,"
		sqlO = sqlO & "[precio] [numeric](18, 2) NULL,"
		sqlO = sqlO & "[unidades]  [numeric](18, 2) NULL,"
		sqlO = sqlO & "[descuento] [numeric](18, 2) NULL,"
		sqlO = sqlO & "[activo] [bit] NULL CONSTRAINT [DF_" & tablaOfertas & "_activo] DEFAULT (1), "
		sqlO = sqlO & "[fechaIni] [datetime] NOT NULL CONSTRAINT [DF_" & tablaOfertas & "_fechaIni]  DEFAULT (getdate()), "
		sqlO = sqlO & "[fechaFin] [datetime] NOT NULL CONSTRAINT [DF_" & tablaOfertas & "_fechaFin]  DEFAULT (getdate()), "
		sqlO = sqlO & "[comentario] [nvarchar](max) "
		sqlO = sqlO & ") ON [PRIMARY]"
		rec sqlO
	end if
end function

function tablaStock ( )
	tablaStock = "ccStock"
	
	if not exists (tablaStock) then
		sqlS = "CREATE TABLE [dbo].[" & tablaStock & "] ("
		sqlS = sqlS & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaStock & "_id] DEFAULT (newid()),"
		sqlS = sqlS & "[pedido] [nvarchar] (255) NULL,"
		sqlS = sqlS & "[matPrima] [nvarchar] (255) NULL,"
		sqlS = sqlS & "[cantidad] [numeric] (18, 2) NULL,"
		sqlS = sqlS & "[barcode] [nvarchar] (255) NULL,"
		sqlS = sqlS & "[estado] [nvarchar] (255) NULL,"
		sqlS = sqlS & "[fechaSalida] [datetime] NULL CONSTRAINT [DF_" & tablaStock & "_fechaSalida] DEFAULT (getdate()),"
		sqlS = sqlS & "[fechaEntrada] [datetime] NULL CONSTRAINT [DF_" & tablaStock & "_fechaEntrada] DEFAULT (getdate()),"
		sqlS = sqlS & "[usuarioSalida] [nvarchar] (255) NULL , "
		sqlS = sqlS & "[activo] [bit] NULL CONSTRAINT [DF_" & tablaStock & "_activo]  DEFAULT (1), " 
		sqlS = sqlS & "[Almacen] [nvarchar](255) NULL "
		sqlS = sqlS & ") ON [PRIMARY]"
		rec sqlS
	else
		alterTable tablaStock, "[activo]"," [bit] NULL CONSTRAINT [DF_" & tablaStock & "_activo]  DEFAULT (1), " 
		alterTable tablaStock, "[Almacen]"," [nvarchar](255) NULL "
	end if
end function

function tablaNombreValor ( )
	tablaNombreValor = "ccNombreValor"
	if not exists (tablaNombreValor) then

		sqlNV = "CREATE TABLE [dbo].[" & tablaNombreValor & "] ("
		sqlNV = sqlNV & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaNombreValor & "_id] DEFAULT (newid()),"
		sqlNV = sqlNV & "[nombre] [nvarchar] (255),"
		sqlNV = sqlNV & "[valor] [nvarchar] (255)"
		sqlNV = sqlNV & ") ON [PRIMARY]"
		rec sqlNV

		SetValueCC "CADUCIDAD", "15 Dias"
		SetValueCC "CADUCIDAD", "1 Mes"
		SetValueCC "CADUCIDAD", "3 Meses"
		SetValueCC "CADUCIDAD", "6 Meses"

		SetValueCC "REFRIGERACION", "Sin refrigerar"
		SetValueCC "REFRIGERACION", "Fresco"
		SetValueCC "REFRIGERACION", "Congelado"
		SetValueCC "REFRIGERACION", "Ultracongelado"

	end if
end function

function tablaProveedorPedido ( )
	tablaProveedorPedido = "ccProveedorPedido"
	if not exists ( tablaProveedorPedido ) then
		sqlPP = "CREATE TABLE [" & tablaProveedorPedido & "] ("
		sqlPP = sqlPP & "[id] [nvarchar] (255) CONSTRAINT [DF_" & tablaProveedorPedido & "_id] DEFAULT (newid()),"
		sqlPP = sqlPP & "[proveedor] [nvarchar] (255),"
		sqlPP = sqlPP & "[cliente] [nvarchar] (255),"
		sqlPP = sqlPP & "[articulo] [nvarchar] (255)"
		sqlPP = sqlPP & ") ON [PRIMARY]"
		rec sqlPP
	end if
end function

function tablaccRegistroPagoEnv ( )
	tablaccRegistroPagoEnv = "ccRegistroPagoEnv"
	if not exists ( tablaccRegistroPagoEnv ) then
		sqlPP = "CREATE TABLE [" & tablaccRegistroPagoEnv & "] ("
		sqlPP = sqlPP & "[idRemesa]     [nvarchar] (255), "
		sqlPP = sqlPP & "[fechaEmision] [datetime] NULL, "
		sqlPP = sqlPP & "[codiEmisor]   [nvarchar] (255) NULL, "
		sqlPP = sqlPP & "[codiReceptor] [nvarchar] (255) NULL, "
		sqlPP = sqlPP & "[dataFactura]  [datetime] NULL, "
		sqlPP = sqlPP & "[idFactura]    [nvarchar] (2000) NULL, "
		sqlPP = sqlPP & "[numFactura]   [nvarchar] (255) NULL, "
		sqlPP = sqlPP & "[nCuenta]      [nvarchar] (255) NULL, "		
		sqlPP = sqlPP & "[importeTotal] [float] NULL, "
		sqlPP = sqlPP & "[comentario]   [nvarchar] (255) NULL, "		
		sqlPP = sqlPP & "[validado]     [bit] NULL "		
		sqlPP = sqlPP & ") ON [PRIMARY]"
		rec sqlPP
	end if
end function

' --- Tablas de APPCC -------------------------------------------------------------------------------------------------------------------

function tablaAppccComo ( )

	tablaAppccComo = "appccComo"

	if not exists ( tablaAppccComo ) then

		sqlAC = "CREATE TABLE [dbo].[" & tablaAppccComo & "] ("
		sqlAC = sqlAC & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaAppccComo & "_id] DEFAULT (newid()),"
		sqlAC = sqlAC & "[como] [nvarchar] (255) NULL "
		sqlAC = sqlAC & ") ON [PRIMARY]"
		rec sqlAC

		sqlAC = "insert into [dbo].[" & tablaAppccComo & "] (id,como) values (newid(),"

		rec sqlAC & "'Plus lavavajillas')"
		rec sqlAC & "'Anfolan SFB')"
		rec sqlAC & "'Anfobid DBA Plus')"
		rec sqlAC & "'Anfolan SFB, Plus lavavajillas')"
		rec sqlAC & "'Deter-Clarex')"

	end if

end function

function tablaAppccCuando ( )

	tablaAppccCuando = "appccCuando"

	if not exists ( tablaAppccCuando ) then

		sqlAC = "CREATE TABLE [dbo].[" & tablaAppccCuando & "] ("
		sqlAC = sqlAC & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaAppccCuando & "_id] DEFAULT (newid()),"
		sqlAC = sqlAC & "[cuando] [nvarchar] (255) NULL, "
		sqlAC = sqlAC & "[orden] [int] NULL "
		sqlAC = sqlAC & ") ON [PRIMARY]"
		rec sqlAC

		sqlAC = "insert into [dbo].[" & tablaAppccCuando & "] (id, cuando, orden) values (newid(),"

		rec sqlAC & "'Cada vegada', 1)"
		rec sqlAC & "'Diari', 2)"
		rec sqlAC & "'Setmanal', 3)"
		rec sqlAC & "'Mensual', 4)"
		rec sqlAC & "'Trimestral', 5)"
		rec sqlAC & "'Semestral', 6)"
		rec sqlAC & "'Anual', 7)"		
	end if

end function

sub updateTablaAppccTareas ( byval nom, byval tip, byval q, byval c )

	dim rsUAT
	dim sqlUAT

	set rsUAT = rec ( "select * from [dbo].[appccTareas] where tarea='" & nom & "' and tipo='" & tip & "'" )
	if rsUAT.eof then
		sqlUAT = "insert into [dbo].[appccTareas] (id,tarea,tipo,cuando,como) "
		if c <> "" and q <> "" then
			sqlUAT = sqlUAT & "select top 1 newid(),'" & nom & "','" & tip & "',q.id,c.id "
			sqlUAT = sqlUAT & "from [dbo].[" & tablaAppccCuando & "] q,[dbo].[" & tablaAppccComo & "] c "
			sqlUAT = sqlUAT & "where q.cuando='" & q & "' and c.como='" & c & "'"
		else
			sqlUAT = sqlUAT & "values(newid(),'" & nom & "','" & tip & "','','')"
		end if
		rec sqlUAT
	end if

end sub

function tablaAppccTareas ( )

	tablaAppccTareas = "appccTareas"

	if not exists ( tablaAppccTareas ) then

		sqlAT = "CREATE TABLE [dbo].[" & tablaAppccTareas & "] ("
		sqlAT = sqlAT & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaAppccTareas & "_id] DEFAULT (newid()),"
		sqlAT = sqlAT & "[tarea] [nvarchar] (255) NULL, "
		sqlAT = sqlAT & "[cuando] [nvarchar] (255) NULL, "
		sqlAT = sqlAT & "[como] [nvarchar] (255) NULL, "
		sqlAT = sqlAT & "[donde] [nvarchar] (255) NULL, "		
		sqlAT = sqlAT & "[tipo] [nvarchar] (255) NULL "
		sqlAT = sqlAT & ") ON [PRIMARY]"
		rec sqlAT

	end if

	' Neteja
	'updateTablaAppccTareas "Recipients i estris d''us frequent",         "NETEJA", "Cada vegada", "Plus lavavajillas"
	'updateTablaAppccTareas "Exterior dels equips i repàs",               "NETEJA", "Diari",       "Anfolan SFB"
	'updateTablaAppccTareas "Superficies de treball (taules inox)",       "NETEJA", "Diari (c/v)", "Anfolan SFB"
	'updateTablaAppccTareas "Llaunes per enfornar",                       "NETEJA", "Diari",       "Anfobid DBA Plus"
	'updateTablaAppccTareas "Montadores nata (3), batedora Kenwood",      "NETEJA", "Diari",       "Anfolan SFB, Plus lavavajillas"
	'updateTablaAppccTareas "Màquina gelatinadora",                       "NETEJA", "Diari",       "Anfolan SFB"
	'updateTablaAppccTareas "Talladora de fiambres (quan s''utilitzi)",   "NETEJA", "Diari (c/v)", "Anfolan SFB"
	'updateTablaAppccTareas "Balança",                                    "NETEJA", "Diari",       "Anfolan SFB"
	'updateTablaAppccTareas "Pica de rentat i rentamans, rentavaixelles", "NETEJA", "Diari",       "Deter-Clarex"
	'updateTablaAppccTareas "Cubell d''escombraries",                     "NETEJA", "Diari",       "Deter-Clarex"
	'updateTablaAppccTareas "Nevera repàs",                               "NETEJA", "Diari",       "Anfolan SFB"
	'updateTablaAppccTareas "Terres",                                     "NETEJA", "Diari",       "Deter-Clarex"
	'updateTablaAppccTareas "Carros",                                     "NETEJA", "Setmanal",    "Anfolan SFB"
	'updateTablaAppccTareas "Prestatges i calaixos",                      "NETEJA", "Setmanal",    "Anfolan SFB"
	'updateTablaAppccTareas "Armari magatzem",                            "NETEJA", "Setmanal",    "Anfolan SFB"
	'updateTablaAppccTareas "Racons i zones de difícil accés",            "NETEJA", "Setmanal",    "Anfolan SFB"
	'updateTablaAppccTareas "Parets a fons",                              "NETEJA", "Mensual",     "Anfolan SFB"
	'updateTablaAppccTareas "Llums i sostres",                            "NETEJA", "Setmanal",    "Anfolan SFB"'

	' Bones práctiques
	'updateTablaAppccTareas "Mans - Ungles curtes i netes",                                     "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Mans - Sense joies",                                               "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Mans - Sense ferides o amb aposit impermeable",                    "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Mans - Mètode de rentat correcte",                                 "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Indumentaria - Completa",                                          "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Indumentaria - El barret cobreix bé el cabell",                    "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Indumentaria - Roba de colors clars i neta",                       "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Hàbits - Ni es fuma, ni es menja, ni es mastega xiclet",           "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Hàbits - Ningú tus o esternuda sobre els aliments",                "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Hàbits - S''utilitzen estris per no tocar el menjas amb les mans", "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Hàbits - Els aliments es tasten amb coberts",                      "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Hàbits - No s''utilitzen draps",                                   "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Salut - Ningú pateix diarrea",                                     "BONES PRACTIQUES", "", ""
	'updateTablaAppccTareas "Salut - Ningú està constipat",                                     "BONES PRACTIQUES", "", ""

	' Clor a l'aigua
	'updateTablaAppccTareas "Aixeta obrador pastissers", "CLOR", "", ""
	'updateTablaAppccTareas "Aixeta obrador forners",    "CLOR", "", ""
	'updateTablaAppccTareas "Sortida aigua amassadora",  "CLOR", "", ""

	' Temperatures
	'updateTablaAppccTareas "Cambra - Pastisseria", "TEMPERATURA", "", ""
	'updateTablaAppccTareas "Cambra - Forneria",    "TEMPERATURA", "", ""
	'updateTablaAppccTareas "Cambra - Botiga",      "TEMPERATURA", "", ""
	'updateTablaAppccTareas "Congelador - Precuit", "TEMPERATURA", "", ""
	'updateTablaAppccTareas "Magetzem - Planta 0",  "TEMPERATURA", "", ""
	'updateTablaAppccTareas "Magetzem - Planta 1",  "TEMPERATURA", "", ""
	'updateTablaAppccTareas "Magetzem - Planta 2",  "TEMPERATURA", "", ""

	' Manipulació
	' Fermentació i cocció
	' Oli de fregir
	' Incidències

end function

function tablaAppccTareasExtes()
	tablaAppccTareasExtes = "AppccTareasExtes"
	if not exists (tablaAppccTareasExtes) then
		sqlATE = "CREATE TABLE [dbo].[" & tablaAppccTareasExtes & "] ("
		sqlATE = sqlATE & "[id] [nvarchar] (255) NULL ,"
		sqlATE = sqlATE & "[nom] [nvarchar] (255) NULL ,"
		sqlATE = sqlATE & "[valor] [nvarchar] (255) NULL ) ON [PRIMARY]"
		rec sqlATE
	end if
end function

function tablaAppccTareasAsignadas ( )
	tablaAppccTareasAsignadas = "appccTareasAsignadas"
	if not exists ( tablaAppccTareasAsignadas ) then
		sqlATA = "CREATE TABLE [dbo].[" & tablaAppccTareasAsignadas & "] ("
		sqlATA = sqlATA & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaAppccTareasAsignadas & "_id] DEFAULT (newid()),"
		sqlATA = sqlATA & "[tarea] [nvarchar] (255) NULL ,"
		sqlATA = sqlATA & "[usuario] [nvarchar] (255) NULL,"
		sqlATA = sqlATA & "[activo] [bit] NULL CONSTRAINT [DF_" & tablaAppccTareasAsignadas & "_activo] DEFAULT (1), "
		sqlATA = sqlATA & ") ON [PRIMARY]"
		rec sqlATA
	end if
end function

function tablaAppccTareasResueltas ( )
	' RESUELTO:
	'	NETEJA:	 			0=NO, 1=SI, 2=A MEDIAS, 3=MAL
	'	BONES PRACTIQUES:	0=NO, 1=SI
	'	CLOR:				0=NO, 1=<0.2, 2=0.2 a 0.8, 3=>0.8
	'	TEMPERATURES:		grados
	' COMENTARIO:
	'	TEMPERATURES:		HIGIENE:0|1,ESTIVA=0|1
	tablaAppccTareasResueltas = "appccTareasResueltas"
	if not exists ( tablaAppccTareasResueltas ) then
		sqlATR = "CREATE TABLE [dbo].[" & tablaAppccTareasResueltas & "] ("
		sqlATR = sqlATR & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaAppccTareasResueltas & "_id] DEFAULT (newid()),"
		sqlATR = sqlATR & "[resuelto] [decimal] (18, 2) NULL ,"
		sqlATR = sqlATR & "[fecha] [datetime] NULL CONSTRAINT [DF_" & tablaAppccTareasResueltas & "_fecha] DEFAULT (getdate()),"
		sqlATR = sqlATR & "[fechaMod] [datetime] NULL CONSTRAINT [DF_" & tablaAppccTareasResueltas & "_fechaMod] DEFAULT (getdate()),"
		sqlATR = sqlATR & "[tareaAsignada] [nvarchar] (255) NULL,"
		sqlATR = sqlATR & "[desde] [nvarchar] (255) NULL, "
		sqlATR = sqlATR & "[comentario] [nvarchar] (4000) NULL "
		sqlATR = sqlATR & ") ON [PRIMARY]"
		rec sqlATR
	end if
end function

function tablaAppccListaRevision ( )
	tablaAppccListaRevision = "appccListaRevision"
	if not exists ( tablaAppccListaRevision ) then
		sqlATA = "CREATE TABLE [dbo].[" & tablaAppccListaRevision & "] ( "
		sqlATA = sqlATA & "[id] [nvarchar] (255) NULL CONSTRAINT [DF_" & tablaAppccListaRevision & "_id] DEFAULT (newid()), "
		sqlATA = sqlATA & "[fechaEjecucion] [datetime] NULL , "
		sqlATA = sqlATA & "[tarea] [nvarchar] (255) NULL , "
		sqlATA = sqlATA & "[usuario] [nvarchar] (255) NULL, "
		sqlATA = sqlATA & "[nota] [nvarchar] (1) NULL, "
		sqlATA = sqlATA & "[observaciones] [nvarchar] (4000) NULL, "		
		sqlATA = sqlATA & "[revisor] [nvarchar] (255) NULL, "
		sqlATA = sqlATA & "[fechaRevision] [datetime] NULL CONSTRAINT [DF_" & tablaAppccListaRevision & "_fecha] DEFAULT (getdate()) "
		sqlATA = sqlATA & ") ON [PRIMARY]"
		rec sqlATA
	end if
end function


' --- Discriminación de aplicación: Facturacion y Residencias ---------------------------------------------------------------------------

' Parámetros:
'	"TBL"	->	Retorna el nombre de la tabla ( usuarios, dependentes )
'	"ID"	->	Retorna el campo de código ( id, codi )
'	"NOM"	->	Retorna el campo de nombre ( apellidos+nombre, nom )
function usuarios ( c )

	usuarios = ""

	if exists ( "usuarios" ) then

		if c = "TBL" then
			usuarios = "usuarios"
		elseif c = "ID" then
			usuarios = "id"
		elseif c = "NOM" then
			usuarios = "isnull(apellidos,'') + ', ' + isnull(nombre,'')"
		end if

	elseif exists ( "dependentes" ) then

		if c = "TBL" then
			usuarios = "dependentes"
		elseif c = "ID" then
			usuarios = "codi"
		elseif c = "NOM" then
			usuarios = "nom"
		end if

	end if

end function

sub alterTable ( tab, cam, tip )
	on error resume next
	rec "alter table " & tab & " add " & cam & " " & tip
end sub

function tablaParamsHw (  )

	tablaParamsHW = "ParamsHw"

	if session("Usuari_codi") <> 858 then 
		exit function
	end if 
	if not exists ("UsuariBotiga") then
		sqlUB = "CREATE TABLE [dbo].[UsuariBotiga] ( "
		sqlUB = sqlUB & " [Usuari] [int] NULL , "
		sqlUB = sqlUB & " [Botiga] [int] NULL) ON [PRIMARY]"
		rec sqlUB
   end if

	set rs = rec ("select botiga from UsuariBotiga where Usuari = " & session("Usuari_codi"))

	if rs.eof then
		tablaParamsHW = "ParamsHw"
		if not exists (tablaParamsHW) then
			sqlPHW = "CREATE TABLE [dbo].[ParamsHw] ( "
			sqlPHW = sqlPHW & " [Tipus] [numeric](18, 0) NULL , "
			sqlPHW = sqlPHW & " [Codi] [numeric](18, 0) NULL , "
			sqlPHW = sqlPHW & " [Valor1] [nvarchar] (255) NULL , "
			sqlPHW = sqlPHW & " [Valor2] [nvarchar] (255) NULL , "
			sqlPHW = sqlPHW & " [Valor3] [nvarchar] (255) NULL , "
			sqlPHW = sqlPHW & " [Valor4] [nvarchar] (255) NULL , "
			sqlPHW = sqlPHW & " [Descripcio] [nvarchar] (255) NULL) ON [PRIMARY]"
			rec sqlPHW
		end if
	else
	   tablaParamsHW = "ParamsHw_tmp"
	   rec "drop table ParamsHw_tmp"
	   sqlPHW_t = "CREATE TABLE [dbo].[ParamsHw_tmp] ( "
	   sqlPHW_t = sqlPHW_t & " [Tipus] [numeric](18, 0) NULL , "
       sqlPHW_t = sqlPHW_t & " [Codi] [numeric](18, 0) NULL , "
       sqlPHW_t = sqlPHW_t & " [Valor1] [nvarchar] (255) NULL , "
       sqlPHW_t = sqlPHW_t & " [Valor2] [nvarchar] (255) NULL , "
       sqlPHW_t = sqlPHW_t & " [Valor3] [nvarchar] (255) NULL , "
       sqlPHW_t = sqlPHW_t & " [Valor4] [nvarchar] (255) NULL , "
       sqlPHW_t = sqlPHW_t & " [Descripcio] [nvarchar] (255) NULL) ON [PRIMARY]"
       rec sqlPHW_t

	   rec "insert into ParamsHw_tmp select * from ParamsHw where valor1 in (select botiga from UsuariBotiga where Usuari = " & session("Usuari_codi") & ")"

	end if

end function

'CDP======================================================================================================================

function tablacdpDadesFichador (  )
	tablacdpDadesFichador = "cdpDadesFichador"
	if not exists ("[cdpDadesFichador]") then
		sqlCDPDF = "CREATE TABLE [cdpDadesFichador] ("
		sqlCDPDF = sqlCDPDF & " [id] [decimal](18, 0) NULL,"
		sqlCDPDF = sqlCDPDF & " [tmst] [datetime] NULL,"
		sqlCDPDF = sqlCDPDF & " [accio] [decimal](18, 0) NULL,"
		sqlCDPDF = sqlCDPDF & " [usuari] [nvarchar] (255) NULL,"
		sqlCDPDF = sqlCDPDF & " [idr] [nvarchar] (255) NULL Default (NEWID()),"
		sqlCDPDF = sqlCDPDF & " [editor] [nvarchar] (255) NULL,"
		sqlCDPDF = sqlCDPDF & " [historial] [nvarchar] (255) NULL,"
		sqlCDPDF = sqlCDPDF & " [lloc] [nvarchar] (255) NULL,"
		sqlCDPDF = sqlCDPDF & " [comentari] [nvarchar] (255) NULL"
		sqlCDPDF = sqlCDPDF & " ) ON [PRIMARY]"
		rec sqlCDPDF
   else
   		if not existsField(tablacdpDadesFichador, "idr") then
			sqlCDPDF_alter = "ALTER TABLE cdpDadesFichador ADD [idr] [nvarchar] (255) NULL Default (NEWID())"
			rec sqlCDPDF_alter
		end if
		if not existsField(tablacdpDadesFichador, "editor") then
			sqlCDPDF_alter = "ALTER TABLE cdpDadesFichador ADD [editor] [nvarchar] (255) NULL"
			rec sqlCDPDF_alter
		end if
		if not existsField(tablacdpDadesFichador, "historial") then
			sqlCDPDF_alter = "ALTER TABLE cdpDadesFichador ADD [historial] [nvarchar] (255) NULL"
			rec sqlCDPDF_alter
		end if
		if not existsField(tablacdpDadesFichador, "lloc") then
			sqlCDPDF_alter = "ALTER TABLE cdpDadesFichador ADD [lloc] [nvarchar] (255) NULL"
			rec sqlCDPDF_alter
		end if
		if not existsField(tablacdpDadesFichador, "comentari") then
			sqlCDPDF_alter = "ALTER TABLE cdpDadesFichador ADD [comentari] [nvarchar] (255) NULL"
			rec sqlCDPDF_alter
		end if
		
   		
   end if
   
end function


function taulaComptabilitzats ( byval D )
	taulaComptabilitzats = "[Comptabilitzats_" & year(D) & "-" & right("00" & month(D),2) & "]"
	if not exists (taulaComptabilitzats) then
		sqlTC = "CREATE TABLE " & taulaComptabilitzats & " ("
		sqlTC = sqlTC & " [id] [nvarchar] (255) NULL Default (NEWID()),"
		sqlTC = sqlTC & " [tipus] [nvarchar] (255) NULL,"
		sqlTC = sqlTC & " [numero] [decimal](18, 0) NULL,"
		sqlTC = sqlTC & " [id_doc] [nvarchar] (255) NULL,"
		sqlTC = sqlTC & " [data_doc] [datetime] NULL,"
		sqlTC = sqlTC & " [comptabilitzat] [nvarchar] (255) NULL,"
		sqlTC = sqlTC & " [data_comptab] [datetime] NULL,"
		sqlTC = sqlTC & " ) ON [PRIMARY]"
		rec sqlTC
	end if
end function


function tablaEncarrecs ( byval D )
	tablaEncarrecs = "[v_encarre_" & year(D) & "-" & right("0" & month(D),2) & "]"
	if not exists ( tablaEncarrecs ) then
		sqlE = "CREATE TABLE " & tablaEncarrecs & " ("
		sqlE = sqlE & "	[Id] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[Dependenta] [float] NULL,"
		sqlE = sqlE & "	[Client] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[Data] [datetime] NULL,"
		sqlE = sqlE & "	[Estat] [float] NULL,"
		sqlE = sqlE & "	[Tipus] [float] NULL,"
		sqlE = sqlE & "	[Anticip] [float] NULL,"
		sqlE = sqlE & "	[Botiga] [float] NULL,"
		sqlE = sqlE & "	[Detall] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[Periode] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[Article] [float] NULL,"
		sqlE = sqlE & "	[Quantitat] [float] NULL,"
		sqlE = sqlE & "	[Import] [float] NULL,"
		sqlE = sqlE & "	[Descompte] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[MarcatDesde] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[Comentari] [nvarchar](255) NULL,"
		sqlE = sqlE & "	[Importat] [nvarchar](255) NULL"
		sqlE = sqlE & "	) ON [PRIMARY]"
		rec sqlE
	end if
end function

function tablaCodisBarresNoTrobats ()
	tablaCodisBarresNoTrobats = "CodisBarresNoTrobats"
	if not exists ( tablaCodisBarresNoTrobats ) then
		sqlCB = "CREATE TABLE " & tablaCodisBarresNoTrobats & " ("
		sqlCB = sqlCB & "[TimeStamp]  [datetime] Default (GetDate())  ,"
		sqlCB = sqlCB & "[CodiBarres] [nvarchar](255) "
		sqlCB = sqlCB& ") ON [PRIMARY]"
		rec sqlCB
	end if
end function

function tablaccCuentas ( )
	tablaccCuentas = "ccCuentas"
	if not exists ( tablaccCuentas ) then
		dim sqlCC
		sqlCC = "create table " & tablaccCuentas & " ("
		sqlCC = sqlCC & "[Id] [nvarchar] (255) NOT NULL Default (NEWID()), "
		sqlCC = sqlCC & "[Nombre] [nvarchar] (255) NULL , "
		sqlCC = sqlCC & "[Descripcion] [nvarchar] (255) NULL , "
		sqlCC = sqlCC & "[Saldo] [nvarchar] (255) NULL , "
		sqlCC = sqlCC & "[Cuenta] [nvarchar] (255) NULL "
		sqlCC = sqlCC & ") ON [PRIMARY] "
		rec sqlCC
	end if
end function

function CascosSinonims ( )
	dim sqlSNI
	CascosSinonims = "CascosSinonims"
	if not exists ( CascosSinonims ) then
		sqlSNI = "create table " & CascosSinonims & " ( "
		sqlSNI = sqlSNI & "[Id]     [nvarchar](255) NULL CONSTRAINT [DF_CascosSinonims_Id] DEFAULT (newid()), "
		sqlSNI = sqlSNI & "[TmSt]   [datetime]      NULL, "
		sqlSNI = sqlSNI & "[Dije] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Digo] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Orden] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux1] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux2] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux3] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux4] [nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Aux5] [nvarchar](255) NULL "
		sqlSNI = sqlSNI & ") ON [PRIMARY] "
		rec sqlSNI
	end if
end function

function tablaProduccion ( )
	tablaProduccion = "Produccion"
	if not exists (tablaProduccion) then
		sqlC = "CREATE TABLE [dbo].[" & tablaProduccion & "] ("
		sqlC = sqlC & "[plu] [numeric](18,0) NULL,"
		sqlC = sqlC & "[fecha] [datetime] NULL CONSTRAINT [DF_" & tablaProduccion & "_fecha] DEFAULT (getdate()),"
		sqlC = sqlC & "[nCajas] [float] NULL "
		sqlC = sqlC & ") ON [PRIMARY]"
		rec sqlC
	end if
end function

function tablaViatgesPropietats ( )
	tablaViatgesPropietats = "ViatgesPropietats"
	if not exists (tablaViatgesPropietats) then
		sqlCB = "CREATE TABLE [dbo].[" & tablaViatgesPropietats & "] ( "
		sqlCB = sqlCB & "[NomViatge] [nvarchar] (255) , "
		sqlCB = sqlCB & "[Variable] [nvarchar] (255) NULL , "
		sqlCB = sqlCB & "[Valor] [nvarchar] (4000) NULL  "
		sqlCB = sqlCB & ") ON [PRIMARY]"
		rec sqlCB
	end if
end function

function NomTaulaCodiRegistreHorari ( )
	dim sqlSNI
	NomTaulaCodiRegistreHorari = "CodiRegistreHorari"
	if not exists ( NomTaulaCodiRegistreHorari ) then
		sqlSNI = "create table " & NomTaulaCodiRegistreHorari & " ( "
		sqlSNI = sqlSNI & "[Id]   		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[data] 		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[CodiB]  	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Producte]  	[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[Estat] 		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[T1]  		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[T2]  		[nvarchar](255) NULL, "
		sqlSNI = sqlSNI & "[T3]  		[nvarchar](255) NULL "
		sqlSNI = sqlSNI & ") ON [PRIMARY] "
		rec sqlSNI
	end if
end function

%>