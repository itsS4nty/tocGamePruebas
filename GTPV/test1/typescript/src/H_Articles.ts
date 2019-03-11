/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="db2.ts" />
/// <reference path="Host_Comm.ts" />
/// <reference path="defDatosApp.ts" />

module H_Articles {

	export function init(callbackInit) {
		DB.addReloadDBHandler(readDB);
		readDB(callbackInit);
	}

	function readDB(callback:()=>void) {
		var objectNames = [DB.appObjectNames.articles]; //??
		DB.createTransaction(objectNames, false, function(tr) {
			
			var articles: D.article[] = [];
			var nivell0 = <D.familia>{ nom:"nivell0", pare: null, nivell: 0 }; 
			var families:D.familia[] = [nivell0];
			var codisBarres:D.codiBarres[] = [];
				
			// read articles
			var os = tr.objectStore(DB.appObjectNames.articles); //??

			var req = os.openCursor();
			req.onsuccess = function(ev) {
				var cursor = <IDBCursorWithValue>req.result;
				if (cursor) {
					var val = <D.article>cursor.value;
					// val.codi = Number(val.codi); //??	
					if (val.nom == null) val.nom="sin nombre"; 
					val.esSumable = (<any>val.esSumable != 0); 
					val.compareNom = D.conversionForCompare(val.nom);
					val.lowerNom = val.nom.toLowerCase();
					articles.push(val);
				} else readFamilies();
 			}
			function readFamilies() {
				var os = tr.objectStore(DB.appObjectNames.families); 
				
				var req = os.openCursor();
				req.onsuccess = function(ev) {
					var cursor = <IDBCursorWithValue>req.result;
					if (cursor) {
						var val = <D.familia>cursor.value;
						val.subfamilies = [];
						val.articles = [];
						if (val.nivell == 0) families[0] = val;
						else families.push(val);
					} else readCodisBarres();
				}				
			} 
			function readCodisBarres() {
				var os = tr.objectStore(DB.appObjectNames.codisBarres); 
				
				var req = os.openCursor();
				req.onsuccess = function(ev) {
					var cursor = <IDBCursorWithValue>req.result;
					if (cursor) {
						var val = <D.codiBarres>cursor.value;
						codisBarres.push(val);
					} else postProcess();
				}				
			} 
			function postProcess() {
				function strcmp(s1: string, s2: string) {
					if (s1 < s2) return -1;
					if (s1 > s2) return 1;
					return 0;
				}
				function strBinarySearch(a: any[], lo: number, hi:number, target: string, compareFunc:(a:any, b:any)=>number) {
					while (lo <= hi) {
						var mid = Math.floor((lo+hi)/2);
						var cmp = compareFunc(a[mid], target);
						if (cmp < 0) hi = mid-1;
						else if (cmp > 0) lo = mid+1;
						else return mid;
					}
					return null;
				}
				function compareFuncNomFamilia(a:D.familia, b:D.familia) { return strcmp(a.nom, b.nom); }

				var lenFamilies = families.length; // save length
				function findPare(f: D.familia) {
					var nomPare = f.pare;
					if (f.nivell == 1) return 0;
					var idxPare = strBinarySearch(families, 1, lenFamilies-1, nomPare, compareFuncNomFamilia); // idx=0 es nivell0
					if (idxPare == null) return null;
					for (var i=idxPare; i < lenFamilies-1; i++) {
						if ((nomPare === families[i].nom) && (f.nivell-1 === families[i].nivell)) return i;
					}	
					for (var i=idxPare-1; i >= 0; i--) {
						if ((nomPare === families[i].nom) && (f.nivell-1 === families[i].nivell)) return i;
					}	
					return null;
				}
				
				var lastNivellInexistent = 0, idxLastNivellInexistent = 0;
				function getNivellInexistent(nivell: number) {
					while (lastNivellInexistent < nivell) {
						families[idxLastNivellInexistent].subfamilies.push(families.length);
						families.push({ nom: "Sin nombre", pare: null, nivell: lastNivellInexistent+1, 
									idxPare: idxLastNivellInexistent, subF: [], art: [] });
						lastNivellInexistent++;
						idxLastNivellInexistent = families.length-1;
					}
					return ((idxLastNivellInexistent-lastNivellInexistent)+nivell);
				}
				
				for (var i=0; i<lenFamilies; i++) {
					var f = families[i];
					if (f.nivell > 0) {
						var idxPare = findPare(f);
						if (idxPare == null) { idxPare = getNivellInexistent(f.nivell); } 
						f[idxPare].subF.push(i);
						f.idxPare = idxPare;
					}
				}
				
				for (var i=families.length-1; i>=lenFamilies; i--) { // nivellInexistent al final
					var subfamilia = families[families[i].idxPare].subfamilies;
					subfamilia.splice(subfamilia.indexOf(i), 1); 
					subfamilia.push(i);
				}
			
				function findFamilia(nom: string) {
					if (nom == null) return null;
					return strBinarySearch(families, 1, lenFamilies-1, nom, compareFuncNomFamilia);
				}
				
				articles = articles.sort(function(a,b) { return strcmp(a.lowerNom, b.lowerNom); });

				for (var iArt=0; iArt<articles.length; iArt++) {
					var art = articles[iArt];
					art.nom = (art.nom || "sin nombre");
					var idxFamilia = findFamilia(art.familia);
					if (idxFamilia == null) { idxFamilia = getNivellInexistent(1); }
					art.idxFamilia = idxFamilia;
					families[idxFamilia].articles.push(iArt);
					delete art.lowerNom;
				}
				actData = [articles, families, codisBarres];
				actualizeSat("All");
				callback();
			}	
		});
	}	

	function respRObjHandler(ret:any) {
	}
	
	var sats = <Host_Comm.IAppSat[]>[];
	var rObjs = <Host_Comm.IAppRObj[]>[];
	
	export function createSat(sat: Host_Comm.IAppSat , callback:()=>void) {
		var rObj = sat.createRObj("Articles", "return createArticles(host);", createStubHost, callback);
		rObj.commToSatAvailable = commToSatAvailable;
		sats.push(sat);
		rObjs.push(rObj);
		rObj.appData.actualize = { All : true };
	};
	
	export function destroySat(sat: Host_Comm.IAppSat) {
		var idx = sats.indexOf(sat);
		if (idx !== -1) {
			sats.splice(idx, 1);
			rObjs.splice(idx, 1)[0].appData = null; // referencia ciclica
		}
	}
	
	var actData:any[];
	
	function commToSatAvailable(rObj: Host_Comm.IAppRObj) {
		var act = rObj.appData.actualize;
		if (act.All) {
			rObj.call("actualize", actData, respRObjHandler);
			act.All = false;	
		}
	}
	
	function actualizeSat(type: string, rObjNoAct?: Host_Comm.IAppRObj) {
		rObjs.forEach(function(rObj) {
			if (rObjNoAct === rObj) return;
			rObj.appData.actualize[type] = true;
			rObj.sat.forceCommToSat();
		});
	}

	function createStubHost(idRObj: string) {
		return $.extend(Object.create(null), {
		});
	}
	
}
