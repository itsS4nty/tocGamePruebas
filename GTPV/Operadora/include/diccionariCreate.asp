<%
	function testDiccionariTable ()	
		'Comprobamos si existe la tabla 'Menus'
		set rsDicTable = rec ("SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[Diccionari]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1")
		
		if rsDicTable.eof then
			'Si no existe la tabla, la creamos. 
			createDiccionari()
		end if
	end function
	
	function createDiccionari()	
		strSQL = "CREATE TABLE [dbo].[Diccionari] ( "
		strSQL = strSQL & "	[idDiccionari] [int] IDENTITY (1, 1) NOT NULL , "
		strSQL = strSQL & "	[idIdioma] [varchar] (2)  NOT NULL , "
		strSQL = strSQL & "	[tipus] [varchar] (200) NOT NULL , "
		strSQL = strSQL & "	[textOriginal] [varchar] (200)  NOT NULL , "
		strSQL = strSQL & "	[textTraduit] [varchar] (200)  NOT NULL  "
		strSQL = strSQL & "	) ON [PRIMARY] "
			
		rec (strSQL)
	end function	
%>