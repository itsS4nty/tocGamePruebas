// JavaScript Document
db = openDatabase("DB_32_Principal","","",5000);


db.transaction(function(tx) {
	var statP = "SELECT d.codi, d.nom, e.valor as password " 
			   +"FROM dependentes as d "
			   +"INNER JOIN ("
			   +"    SELECT id, valor FROM dependentesextes "
			   +"    WHERE nom = 'PASSWORD'"
			   +") as e "
			   +"ON (d.codi = e.id)";
	tx.executeSql(statP,[],function(tx,r) { window.r1 = r; });
});


db.transaction(function(tx) {
	var statP = "select d.codi from dependentes as d";
	tx.executeSql(statP,[],function(tx,r) { window.r2 = r; });
});

db.transaction(function(tx) {
	var statP = "select d.codi, d.nom as nn from dependentes as d";
	tx.executeSql(statP,[],function(tx,r) { window.r3 = r; });
});

db.transaction(function(tx) {
	var statP = "SELECT d.codi " 
			   +"FROM dependentes as d "
			   +"INNER JOIN ("
			   +"    SELECT id, valor FROM dependentesextes "
			   +"    WHERE nom = 'PASSWORD'"
			   +") as e "
			   +"ON (d.codi = e.id)";
	tx.executeSql(statP,[],function(tx,r) { window.r4 = r; });
});

db.transaction(function(tx) {
	var statP = "SELECT d.codi as codi, d.nom as nom, e.valor as password " 
			   +"FROM dependentes as d "
			   +"INNER JOIN ("
			   +"    SELECT id, valor FROM dependentesextes "
			   +"    WHERE nom = 'PASSWORD'"
			   +") as e "
			   +"ON (d.codi = e.id)";
	tx.executeSql(statP,[],function(tx,r) { window.r5 = r; });
});

db.transaction(function(tx) {
	var statP = "select codi, nom from dependentes";
	tx.executeSql(statP,[],function(tx,r) { window.r6 = r; });
});

db.transaction(function(tx) {
	var statP = "select codi from dependentes";
	tx.executeSql(statP,[],function(tx,r) { window.r7 = r; });
});

db.transaction(function(tx) {
	var statP = "select codi as codi, nom as nom from dependentes";
	tx.executeSql(statP,[],function(tx,r) { window.r8 = r; });
});

db.transaction(function(tx) {
	var statP = "SELECT t.pos, a.* from (SELECT * FROM TeclatsTpv WHERE (Ambient = ?) AND (Llicencia = ?)) as t "
		        +"LEFT JOIN Articles as a ON (t.Article = a.codi)"; 

	tx.executeSql(statP,["Cafeteria", 55],function(tx,r) { window.r9 = r; }, function (tx,e) { window.e9 = e} );
});

db.transaction(function(tx) {
	var statP = "SELECT t.pos,f.* from test1 as f inner join test2 as t on t.pos = f.[t.pos]"; 

	tx.executeSql(statP,[],function(tx,r) { window.r10 = r; }, function (tx,e) { window.e10 = e} );
});
  
