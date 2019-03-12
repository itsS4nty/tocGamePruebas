/// <reference path="../libs/jquery/jquery.d.ts" />
/// <reference path="db2.ts" />

"use strict"

module Server {
	interface SERVER_MSG {
		gtpv : any;
		clientInfo : CLIENTINFO;
		session : any;
		actions : string[];
		dbs : SERVER_DB[];
		communication : number;
	}
	
	interface CLIENT_MSG {
		gtpv : any;
		clientInfo : CLIENTINFO;
		session? : any;
		dbs? : CLIENT_DB[];
		//otherDbNames? : string[];
	}
	
	interface CLIENTINFO {
		user?: string;
		password?: string;
		idComm?: any;
		prefijoCliente?: string;
		Llicencia?: any;
		ipLan?: string;
	}
	
	interface SERVER_DB {
		dbName : string;
		schema? : schemaObjectStores;
		id? : string;
		abortOnError? : boolean;
		transaction : S_SUBTRANSACTION[];
	}
	
	interface CLIENT_DB {
		dbName : string;
		schema : schemaObjectStores;
		version: number;
		versionChange: boolean;
		id? : string;
		err? : string; 
		transaction : C_SUBTRANSACTION[];
	}
	
	interface S_SUBTRANSACTION {
		type: string;
		id?: string;
		objName: string;
		abortOnError? : boolean;
		index?: string;
		lower?: any;
		upper?: any;
		lowerOpen?: boolean;
		upperOpen?: boolean;
		only?: any;
		direction?: string;
		columns?: string[];
		allColumns?: boolean;
		values?: any[];
		valueTypes?: {[name:string]:string[]}
		keys?: any[];
		filter?: string;
		modify?: string;
		noValues?: boolean;
		withKeys?: boolean;
		withPrimaryKeys?: boolean;
	} 
	interface C_SUBTRANSACTION {
		type: string;
		id?: string;
		objName: string;
		columns?: string[];
		values?: any[];
		keys?: any[];
		primaryKeys?: any[];
		aborted?: boolean;
		abortError?: any;
		errors?: any[];
		err?: string;
	} 
	
	interface schemaObjectStores { [name:string]:schemaObjStore };

	interface schemaObjStore {
		keyPath?: string;
		autoIncrement?: boolean;
		indexs?: { [name:string]:schemaIndex };
	}
	interface schemaIndex {
		keyPath: string;
		unique: boolean;
		multiEntry: boolean;
	}
	
	var my = {};
	
	//var urlAjaxServidor = "../server/Ajax_XML_1.php"; // <base href="cliente/">
	var urlAjaxServidor = "http://inc.hiterp.com/gtpv/test1/server/ajax.php";
	var defaultDelayMinutesComServer = 60;
	var delayMinutesRetries = 5;
	var defaultRetriesComServer = 3;
	var retriesComServer = defaultRetriesComServer; 
	var timeoutComServerID:any;

	var initDataSendCom: { [p:string]:string } = null;
	export function setInitDataCom(_initData: { [p:string]:string }) { initDataSendCom = _initData; }
	
	var timeNextCom = -1;
	export function programCommunication(delay: number) {
		window.clearTimeout(timeoutComServerID);
		timeoutComServerID = window.setTimeout(startCom, delay);
		timeNextCom = Date.now()+delay;
	}

/*	function getIpLan(fInitCom) {
		var ip;
		ip = H.Comm.getSiteLocalAddresses();
		if (ip == null) {
			window.setTimeout(getIpLan, 1000, true);
			return null;			
		}
		ip = ip.join(" ");
		if (fInitCom) {
			if (fInCommunication) fPendingCommunication = true;
			else programCommunication(0);
		}
		return ip;
	}
*/	
	var fCommActive = false;
	var fCommPending = false;
	//var fInCommunication = false;
	//var fPendingCommunication = false;
	function endCom() {
/*		H.DB.endComServer(function() {
			fInCommunication = false;
			if (fPendingCommunication) {
				fPendingCommunication = false;
				startCom();
			}
		});
*/	}
	var fCommActive = false;
	function startCom() {
		timeNextCom = -1;
		if (fCommActive) {
			fCommPending = true;
			return false;
		} 
		fCommActive = true;
//		H.DB.startComServer(); //??

		resetSandbox("communication");

		var msg = createJsonMessage();
//		var ipLan = "111"; //??
//		var ipLan = getIpLan();
//		if (ipLan != null) msg.clientInfo.ipLan = ipLan; 
		send(msg); 
	}
	var idCom:string;
	var initialClientInfo:any;
	function createClientInfo():CLIENTINFO {
		return {
			idCom,//??
			ipLan : "111"
		}
	}
	export function startUserPassword(user: string, password: string) {
		initialClientInfo = {
			user,
			password,
			producto: "TPV", //??
			version: "0.1",  
			ipLan : "11112"
		};
		programCommunication(0);
	}
	function createJsonMessage() {
		return <CLIENT_MSG> {
			gtpv: ['client', 1],
			clientInfo: (initialClientInfo || createClientInfo()),
		};
	}

	function handleAjaxSuccess(data: any, textStatus: string, jqXHR: JQueryXHR) {
		// jQuery no detecta parserError como error, Chrome : html,body,parsererror, Firefox : parserError ??
		retriesComServer = defaultRetriesComServer;
		if ($.type(data) !== "object") {
			console.log("Error communiction server:");
			console.log(data);
			programCommunication(60*60*1000);
			return;
		}
		
		var err = processResponse(<SERVER_MSG>data);
		if (err != null) {
			console.log(err);
			programCommunication(60*60*1000);
			return;
		}
	}

	function handleAjaxError(jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
		endCom();

		var delayMinutes: number;
		if (retriesComServer > 0) {
			retriesComServer--;
			delayMinutes = delayMinutesRetries;
		} else {
			retriesComServer = defaultRetriesComServer;
			delayMinutes = defaultDelayMinutesComServer;
		}
		programCommunication(delayMinutes*60*1000);
	}

	function send(out: any) {
		(<any>window).outmsg= out;
		console.log(out);
		(<any>window).outJson = JSON.stringify(out);
		return;
		$.ajax({ 
			url: urlAjaxServidor,
			type: "POST",
			contentType: "application/json",
			data : JSON.stringify(out),
			dataType: "json",
			timeout: 60000,
			success: handleAjaxSuccess,
			error : handleAjaxError
		});
	}
	
	/*

		function processElemInit(eIn: Element, eOutParent: Element) {
			initDataSendCom = null;
			var fReinit = false;
			var prefijo = getAttribute(eIn, A.prefijoCliente);
			if (prefijo != null) {
				var prevPref = H.ConfigGTPV.get("prefijoCliente", false); 
				if (prevPref != prefijo) {			
					H.ConfigGTPV.setPrefijo(prefijo);
					LS.init(prefijo);	
					H.DB.init(prefijo, true);
					if (prevPref != null) fReinit = true; // ??
				} else prefijo = null;
			}
			var idComm = getAttribute(eIn, A.idComm);
			if (idComm != null) {
				if (idComm == "") idComm = null;
				if (H.ConfigGTPV.get("idCom") !== idComm)
					H.ConfigGTPV.set("idCom", idComm);
			}
			var llicencia = getAttribute(eIn, A.Llicencia);
			if (llicencia != null) {
				if (llicencia == "") llicencia = null;
				if (H.ConfigGTPV.get("Llicencia") !== llicencia)
					H.ConfigGTPV.set("Llicencia", llicencia);
			}
			if (prefijo != null) {
				var prefijos = (H.ConfigGTPV.get("prefijos", false) || []);
				prefijos.push(prefijo);
				H.ConfigGTPV.set([["prefijos", prefijos, false],
								  ["prefijoCliente", prefijo, false]], function() {
					if (fReinit) window.location.reload();
					else H.main.startApplication();
				});
			}
		}

		
		function processOrdersRespServer() {
	*//*		if (getUserData(docOut.documentElement).reloadDB === true) {
				H.DB.reloadDB();
	//			callbackReloadDBCom.run();
			}
	*//*		if (H.ConfigGTPV.get("idCom") != null) {
				if (getUserData(docOut.documentElement).sendRespServer === true) {
					insertIdCom(docOut.documentElement);
					send(docOut);
				} else {
					var delayMinutes = getUserData(docOut.documentElement).delayMinutes 
					if (delayMinutes != null) {
						if (delayMinutes < 0) delayMinutes = 0; 	
					} else delayMinutes = defaultDelayMinutesComServer;
					programCommunication(delayMinutes*60*1000);
					endCom();
	//				timeoutComunicacionID = setTimeout(comunicacionConServidor, delayMinutes*60*1000);
				}
			} else {
				if (H.ConfigGTPV.get("prefijoCliente", false) == null) {
					H.AppInicializarConServidor.start();
				}
			}
		}		
*/

	function processResponse(msg : SERVER_MSG) {
		if ($.type(msg) !== "object") return "msg"; //??
		if (!Array.isArray(msg.gtpv)) return "msg.gtpv"; //??
		// check msg.gtpv
		if ($.type(msg.clientInfo) !== "object") return "msg.clientInfo"; //??
		var dbs = msg.dbs;
		if ((dbs != null) && (!Array.isArray(dbs))) return "dbs"; //??
/*		if (fInitializingApp) {
			if (msg.clientInfo.idComm === null) {
				//reset app
			}
			if (typeof msg.clientInfo.prefijoCliente != "string") return "hh"; //??
			if (msg.clientInfo.Llicencia == null) msg.clientInfo.Llicencia = "";
			initializeApp(msg.clientInfo); 
		} else {
			if (msg.clientInfo.idComm === null) {
				//reset app
			}
			// new prefijoCliente o Llicencia
		}
*/
		// checkActions lockUD

		if ((dbs == null) || (dbs.length == 0)) {
			end();
			msg.communication //??
			// program communication 
			return null;
		}	

		resetSandbox("message");
		var outMsg = createJsonMessage();
		outMsg.session = msg.session;
		
		outMsg.dbs = [];

		iterateDBs(0);

		function iterateDBs(iDB:number) {
			if (iDB == dbs.length) { 
				end(); 
				send(outMsg);
				return;
			}	
			var outDbs = <CLIENT_DB>{};
			outMsg.dbs.push(outDbs);
			processDB(dbs[iDB], outDbs, () => { iterateDBs(iDB+1); });
		}

		function end() {
			// check postactions : unlockUD, reload
		}
		return null;
	}

	interface abortInfo {
		iSubtr: number;
		error?: any;
	}
	
	function processDB(servDB : SERVER_DB, outDB: CLIENT_DB, callback:()=>void) {
		if ($.type(servDB) !== "object") { outDB.err=""; callback(); return; } //??
		if ("id" in servDB) outDB.id = servDB.id;
		outDB.dbName = servDB.dbName;
		
		var dbName = servDB.dbName;
		if (typeof dbName !== "string") { outDB.err=""; callback(); return; } //?????
		
		processSchema(dbName, servDB.schema, function(db: IDBDatabase, versionChange: boolean, err: string) {
			if (err != null) { outDB.err = err; callback(); return; }
			
			var fCallback=false;
			function end() {
				if (!fCallback) { 
					fCallback=true; 
					db.close();
					// if (dbBlocked) unblock //??
					callback(); // por seguridad de no llamar dos veces
				}	
			}
			var servSubtransactions = servDB.transaction;
			if (servSubtransactions == null) servSubtransactions = [];
			if (!Array.isArray(servSubtransactions)) { outDB.err = "ooo"; end(); return; } //?? error

			var abortOnError = servDB.abortOnError;
			if (abortOnError !== false) abortOnError = true; 
			
			for (var i=0; i<servSubtransactions.length; i++) {
				var subtr = servSubtransactions[i];
				if ((subtr.modify != null) || (subtr.filter != null)) {
					// block database //??
				}
			}
			db.onerror = function(ev) { // error raro ?
				var req = <IDBRequest>ev.target;
				outDB.err = req.error.name+": "+(<any>req.error).message;
				end();	
			}

			resetSandbox("transaction");
			
			var iSubtr=0;
			outDB.transaction = [];
			var abortInfo:abortInfo = { iSubtr: 0, error: null };

			executeIDBTransaction(null);

			function executeIDBTransaction(tr: IDBTransaction) {
				var outSubtr:C_SUBTRANSACTION;
				var pendingSubtr:any[][] = [];

				if (!tr) {
					try {
						tr = db.transaction(db.objectStoreNames, "readwrite");
					} catch(e) {
						outDB.err = e.toString();
						end();
						return;
					}
				}
				tr.oncomplete = function(ev) {
					for (var i=iSubtr-1; i >= 0; i--) {
						if (outDB.transaction[i].aborted == null) outDB.transaction[i].aborted = false;
					}
					if (pendingSubtr.length > 0) {
						executePendingSubtr(db, servSubtransactions[iSubtr], abortOnError, outSubtr, pendingSubtr, abortInfo, 
							function(tr: IDBTransaction, err : string) {
								if (tr) {
									iSubtr++;
									if (!(tr instanceof IDBTransaction)) tr = null;
									executeIDBTransaction(tr);
								} else {
									if (err != null) outDB.err = err;
									end(); 
								} 	
							});
					} else end();
				}
				tr.onabort = function(ev) {
					for (var i=iSubtr-1; i >= 0; i--) {
						if (outDB.transaction[i].aborted == null) outDB.transaction[i].aborted = true;
					}
					if (abortInfo.error != null) {
						outDB.transaction[abortInfo.iSubtr].abortError = abortInfo.error;
					}
					end();
				}
				tr.onerror = function(ev) { // error transaction no request, ej: commit con QuotaExceededError, ...
					ev.stopPropagation();
					outDB.err = tr.error.name+": "+(<any>tr.error).message;
				}
	
				// schema
				if (outDB.schema == null) { // hay que hacerlo aqui por que falta tr
 					outDB.schema = {};
					for (var iOs=0; iOs<db.objectStoreNames.length; iOs++) {
						var os = tr.objectStore(db.objectStoreNames[iOs]);
						var outObj:schemaObjStore = {
							keyPath : os.keyPath,
							autoIncrement : (<any>os).autoIncrement
						}
						if (os.indexNames.length > 0) {
							outObj.indexs = {};
							for (var iIdx=0; iIdx<os.indexNames.length; iIdx++) {
								var index = os.index(os.indexNames[iIdx]);
								var outIndex:schemaIndex = {
									keyPath : index.keyPath,
									unique : index.unique,
									multiEntry : (<any>index).multiEntry
								}
								outObj.indexs[index.name] = outIndex;
							}
						}
						outDB.schema[os.name] = outObj;
					}
					outDB.version = +db.version;
					outDB.versionChange = versionChange;
				}
				iterateSubtransaction();
				function iterateSubtransaction() {
					if (iSubtr == servSubtransactions.length) return;
					outSubtr = <C_SUBTRANSACTION>{};
					outDB.transaction.push(outSubtr);
					resetSandbox("subtransaction");
					abortInfo.iSubtr = iSubtr;
					processSubtr(tr, servSubtransactions[iSubtr], abortOnError, outSubtr, pendingSubtr, abortInfo, 
							function() {
								if ((abortInfo.error == null) && (pendingSubtr.length == 0)) {
									iSubtr++;
									iterateSubtransaction();
								}	 
							}
					);
				}

			}
		});
	}

	function createIndex(os:IDBObjectStore, nameIdx:string, params:schemaIndex) {
		if (!os.indexNames.contains(nameIdx))
			os.createIndex(nameIdx, params.keyPath, {unique: params.unique, muliEntry: params.multiEntry});
	}

	function createAppIndexs(nameObj: string, db: IDBDatabase) {
		//??????????????	
	}	

/*		function checkKeyPath(keyPath: any) {
		if (keyPath == null) return true;
		if (typeof keyPath === "string") return true;
		if (!Array.isArray(keyPath)) return false;
		for (var i=0; i< (<[]>keyPath).length; i++)
			if (typeof keyPath[i] !== "string") return false;
		return true;	
	} 
*/
	function checkSchema(schema: schemaObjectStores) {
		if (typeof schema !== "object") return false;
		for (var nameObj in schema) {
			if (schema[nameObj] == null) schema[nameObj] = {};
			var msgObj = schema[nameObj];
			if (typeof msgObj !== "object") return false;
				
			if (msgObj.indexs == null) msgObj.indexs = {};
			if (typeof msgObj.indexs !== "object") return false;
		}
		return true;
	}			
	function processSchema(dbName: string, servSchema: schemaObjectStores, 
			callback:(db: IDBDatabase, versionChange: boolean, err?: string) => void) {
		var fCallback=false;
		function call_callback(db: IDBDatabase, versionChange: boolean, err?: string) {
			if (!fCallback) { fCallback=true; callback(db, versionChange, err); } // por seguridad de no llamar dos veces
		}
		var versionChange = false;
		if (servSchema == null) servSchema = {};
		if (!checkSchema(servSchema)) {
			call_callback(null, false, "checkSchema");
			return;
		}

		function onUpgradeSchema(ev: Event) {
			var openReq = <IDBOpenDBRequest>ev.target;
			var db = <IDBDatabase>openReq.result;
			var tr = openReq.transaction;
			tr.onabort = function(ev) { // error en upgrade, crear index con restricción, ...
				call_callback(null, false, tr.error.name+": "+(<any>tr.error).message);
			}
			var os:IDBObjectStore;
			try {
				for (var nameObj in servSchema) {
					var servObj = servSchema[nameObj];
					var create = !db.objectStoreNames.contains(nameObj);
					if (create) {
						os = db.createObjectStore(nameObj, 
								{ keyPath: servObj.keyPath, autoIncrement: servObj.autoIncrement });
					} else {
						os = tr.objectStore(nameObj);
					}	
					var servIndexs = servObj.indexs; 
					for (var nameIdx in servIndexs) {
						createIndex(os, nameIdx, servIndexs[nameIdx]);
					} 
					if (create) {
						createAppIndexs(nameObj, db);
					}	
				}
				// createAppObjects(db);
				versionChange = true;
			} catch (e) { 
				tr.abort();
				call_callback(null, false, e.toString());
			}
		}
		function onErrorSchema(ev: Event) { // error en upgrade, crear index con restricción, ...
			var openReq = <IDBOpenDBRequest>ev.target;
			var err = openReq.error;
			call_callback(null, false, err.name+": "+(<any>err).message);
		}	
		var openReq = indexedDB.open(dbName)
		openReq.onupgradeneeded = onUpgradeSchema;
		openReq.onsuccess = function(ev) {
			var db = <IDBDatabase>openReq.result;
			try {
				var tr = db.transaction(db.objectStoreNames);
				for (var nameObj in servSchema) {
					var os = tr.objectStore(nameObj);
					//check keyPath ?
					var servIndexs = servSchema[nameObj].indexs; 
					for (var nameIdx in servIndexs) {
						var idx = os.index(nameIdx);
						// check keyPath, unique, muliEntry ?
					}
				}	
			} catch(e) { // objStore o index no existe 
				db.close();
				openReq = indexedDB.open(dbName, +db.version+1);
				openReq.onupgradeneeded = onUpgradeSchema;
				openReq.onsuccess = function (ev) {
					var db = <IDBDatabase>openReq.result;
					call_callback(db, true);						
				}
				openReq.onerror = onErrorSchema;
				return;
			}
			call_callback(db, versionChange);
		}
		openReq.onerror = onErrorSchema;
	}	

	var portSandbox:MessagePort;
	export function initSandbox(callback:()=>void) {
		var jIframe = $("<iframe>").css("display", "none");
		var iframe = <HTMLIFrameElement>jIframe[0];
		iframe.onload = sandboxOnload;
		iframe.src = "sandbox.html";
		jIframe.appendTo("body");
		function sandboxOnload(ev: Event) {
			var channel = new MessageChannel();
			portSandbox = channel.port1;
			iframe.contentWindow.postMessage(
				{type:"Function", sharedDataProps:["golbal","communication","message","transaction","subtransaction"]}, 
				"*", [channel.port2]);
			portSandbox.onmessage = function(ev) {
				console.log("w port onmessage", ev, ev.data);
				var data = ev.data;
				if (data === "start") { callback(); return; }
				var func = functionsSandbox[data.name][data.idx];
				
				func.callback.apply(null, (<any[]>data.ret).concat(func.restArgs));
			}
		}
	}	
	
	interface funcSandbox {
		callback: {(...args:any[]):void};
		restArgs: any[];
	}	

	var functionsSandbox = <{[name:string]:funcSandbox[]}>Object.create(null);
		
	function createFunctionSandbox(name: string, body: string, argNames:string[]) {
		functionsSandbox[name] = [];
		portSandbox.postMessage({type:"create", name, argNames, body});		
		return function(...args:any[]) {
			var last = <{(...args:any[]):void}>args.pop();
			var idx = functionsSandbox[name].length;
			portSandbox.postMessage({type:"execute", name, args: args.splice(0,argNames.length), idx})
			functionsSandbox[name].push({ callback: last, restArgs: args});
		} 
	}
	function createModify(script: string, ...argNames:string[]) {
		if (script == null) {
			return function(...args:any[]) {
				var last = <Function>args.pop();
				last.apply(null, args);
			}
		} else return createFunctionSandbox("modify", script+"; return ["+argNames.join(",")+"];", argNames);
	}	
	function createFilter(script: string, ...argNames:string[]) {
		if (script == null) {
			return function(...args:any[]) {
				var last = <Function>args.pop();
				last.call(null, true);
			}
		} else return createFunctionSandbox("filter", "return [("+script+")];", argNames);
	}	
	function resetSandbox(prop: string) {
		portSandbox.postMessage({type: "reset", prop});
	}
	function deconstructValue(val: any, columns: string[], allColumns: boolean) {
		if (!columns) return val;
		if ((val == null) || (typeof val !== "object")) return null;
		if (allColumns) { 
			var newCols = Object.keys(val).filter(function(k) { return columns.indexOf(k) == -1; });
			Array.prototype.push(columns, newCols);
		}
		return columns.map(function(col) {
			if (col == null) return null;
			return val[col];
		});	
	}
	function cleanOutErrors(outSubtr:C_SUBTRANSACTION) {
		if (outSubtr.errors && (outSubtr.errors.length == 0)) delete outSubtr.errors;
	}

	function processSubtr(tr: IDBTransaction, servSubtr:S_SUBTRANSACTION, abortOnError: boolean, outSubtr:C_SUBTRANSACTION, 
			pendingSubtr:any[][], abortInfo: abortInfo, callback:()=>void) {

		var savedISubtr = abortInfo.iSubtr;	
		function fillAbortInfo(err: any) {
			if (abortInfo.error != null) return;
			abortInfo.iSubtr = savedISubtr;
			abortInfo.error = err;
		}	

		try {
			if ($.type(servSubtr) !== "object") throw "servSubtr";
			if ("id" in servSubtr) outSubtr.id = servSubtr.id;
			outSubtr.type = servSubtr.type;
			outSubtr.objName = servSubtr.objName;

			var os = tr.objectStore(servSubtr.objName);
			var index : IDBIndex; 
			if (servSubtr.index != null) index = os.index(servSubtr.index);
			
			var type = servSubtr.type;
			var values = servSubtr.values;  
			var keys = servSubtr.keys;
			var modify = servSubtr.modify;
			var filter = servSubtr.filter;
//					if (typeof type !== "string") throw message;
			if ((values != null) && (!Array.isArray(values)))	throw "values";
			if ((keys != null) && (!Array.isArray(keys)))	throw "keys"; 
			if ((modify != null) && (typeof modify !== "string"))	throw "modify"; 
			if ((filter != null) && (typeof filter !== "string"))	throw "filter"; 
			
			var fPending = ((modify != null) || (filter != null));
			
			var columns = servSubtr.columns;
			if ((columns != null) && (!Array.isArray(columns))) throw "columns"; 
			if (columns && !columns.every(function(col) { return ((col == null) || (typeof col === "string")); })) throw "columns every";
			
			var allColumns = !!servSubtr.allColumns;
			
			var valueTypes =servSubtr.valueTypes;
			if ((valueTypes != null) && (typeof valueTypes !== "object")) throw "valueTypes"; 
			if (valueTypes) {
				for (var t in valueTypes) { 
					if ((valueTypes[t] != null) && (!Array.isArray(valueTypes[t]))) throw "valueTypes inner"; 
				}	
			}	
					
			var upper = servSubtr.upper;
			var lower = servSubtr.lower;
			var keyRange:IDBKeyRange;
			if (lower != null) {
				if (upper != null) keyRange = IDBKeyRange.bound(lower, upper, servSubtr.lowerOpen, servSubtr.upperOpen);
				else keyRange = IDBKeyRange.lowerBound(lower, servSubtr.lowerOpen);
			} else if (upper != null) {
				keyRange = IDBKeyRange.upperBound(upper, servSubtr.upperOpen);
			} else if (servSubtr.only != null) keyRange = IDBKeyRange.only(servSubtr.only);
			
			var direction = servSubtr.direction;
			if ((direction != null) && (typeof direction !== "string")) throw "direction";

			var noValues = servSubtr.noValues;
			var withKeys = servSubtr.withKeys;
			var withPrimaryKeys = servSubtr.withPrimaryKeys;
			
			if (typeof servSubtr.abortOnError === "boolean") abortOnError = servSubtr.abortOnError;
			
			function constructValue(val: any[]) {
				function applyColumns() {
					if (!columns) return val;
					if (!Array.isArray(val)) return val;
					var objVal:any = Object.create(null);
					columns.forEach(function(col, idx) {
						if (col != null) objVal[col] = val[idx];	
					});
					return objVal;
				}
				var obj = applyColumns();
				if ($.type(obj) !== "object") return obj;
				if (!valueTypes) return obj;
				var colNames = valueTypes['Date'];
				if (colNames) {
					for (var name in colNames) {
						if (name in obj) obj[name] = new Date(obj[name]); 
					}
				}
				return obj;
			}
			
			switch (type) {
				case "put":
				case "add":
					if (values == null) throw "values put add"; 
					if ((keys != null) && (values.length != keys.length)) throw "keys put add";
					
					if (values.length == 0) { callback(); return; }

					outSubtr.errors = [];

					for (var i=0; i<values.length; i++) {
						var val = constructValue(values[i]);
						var key:any;
						if (keys) key = keys[i];

						if (fPending) {
							pendingSubtr.push([val, key]);
						} else {
							var fBreak = (function(val:any, key:any, i:number) {
								function generateError(ev: Event, tr: IDBTransaction, err: any) {
									if (abortInfo.error != null) return;
									var outError = {
										name : err.name,
										message : err.message,
										val,
										key,
										i 
									};
									outSubtr.errors.push(outError);
									if (abortOnError) {
										fillAbortInfo(outError);
										if (tr) tr.abort();
										//finalizeoutSubtr(true);
									} else {
										if (ev) ev.preventDefault();
										//checkLoopLastValue(i);
									}	
								}
								var req:IDBRequest;
								try {
									req = (type === "put") ? os.put(val, key) : os.add(val,key);
								} catch (e) {
									generateError(null, tr, e);
									return true;
								}
								req.onsuccess = function(ev) {
									if (i == values.length-1) cleanOutErrors(outSubtr);
								}
								req.onerror = function(ev) {
									ev.stopPropagation();
									generateError(ev, null, (<IDBRequest>ev.target).error);	
								}
								return false;
							})(val, key, i);
						}			
					}
					callback();
					break;
				case "get":
				case "delete":
				case "update":
					if (keys == null) {
						if (keyRange) keys = [keyRange];
						else keys = [undefined];
					}
					if (values && (values.length !== keys.length)) throw "values get delete update"; //??
					
					if (type === "get") {
						if (allColumns && (columns == null)) columns = []; 
						if (columns != null)  outSubtr.columns = columns;
					}
					
					if (!noValues) outSubtr.values = [];
					if (withKeys) outSubtr.keys = [];
					if (withPrimaryKeys) outSubtr.primaryKeys = [];

					outSubtr.errors = [];
	
					var fOpenKeyCursor = (noValues && index && (type === "get"));
					
					iterateKeys(0);

					function iterateKeys(iKey: number) {
						if (iKey == keys.length) {
							cleanOutErrors(outSubtr);
							callback();
							return;
						}
						var req:IDBRequest;
						try {
							if (fOpenKeyCursor) req = index.openKeyCursor(keys[iKey], direction);
							else req = ((index) ? index : os).openCursor(keys[iKey],direction);
						} catch(e) {
							if (abortInfo.error != null) return;
							var outError = {
								name : (<DOMException>e).name,
								message : (<DOMException>e).message,
								key : keys[iKey],
								i : iKey
							};
							outSubtr.errors.push(outError);
							if (abortOnError) {
								fillAbortInfo(outError);
								tr.abort();
								callback();
							} else {
								iterateKeys(iKey+1);
							}	
							return;
						}
						req.onsuccess = function(ev) {
							var req = <IDBRequest>ev.target;
							var cursor = <IDBCursorWithValue>req.result;
							if (cursor) {
								var val = cursor.value;
								var key = cursor.key;
								var primaryKey = cursor.primaryKey;
								var del = false;
								if (values) {
									var addVal = values[iKey]; 
									if (addVal == null) del = true;
									else if (typeof addVal === "object") {
										for (var prop in addVal) val[prop] = addVal[prop];
									} 
								}
								if (fPending) {
									pendingSubtr.push([val, key, primaryKey, del]);
								} else {
									switch (type) {
										case "get":
											if (outSubtr.values) 
												outSubtr.values.push(deconstructValue(val, columns, allColumns));
											if (outSubtr.keys) 
												outSubtr.keys.push(key);
											if (outSubtr.primaryKeys) 
												outSubtr.primaryKeys.push(primaryKey);
											break;
										case "delete":
											cursor.delete();
											break;
										case "update":
											function generateError(ev: Event, tr: IDBTransaction, err: any) {
												if (abortInfo.error != null) return;
												var outError = {
													name : err.name,
													message : err.message,
													val,
													key,
													primaryKey,
													i : iKey,
													del
												};
												outSubtr.errors.push(outError)
												if (abortOnError) {
													fillAbortInfo(outError);
													if (tr) tr.abort();
													callback();
												} else {
													if (ev) ev.preventDefault();
													cursor.continue();
												}
												
											}
											var req:IDBRequest;
											if (del) req = cursor.delete();
											else try {
												req = cursor.update(val);
											} catch (e) {
												generateError(null, tr, e);
												return;
											}	
											
											req.onsuccess = function(ev) {
												cursor.continue();
											} 
											req.onerror = function(ev) {
												ev.stopPropagation();
												generateError(ev, null, req.error);
											}	
											return;
									} // switch
								}	
								//} // if (accept)
								cursor.continue();
							} else { // if (cursor)
								iterateKeys(iKey+1);
							} 

						} // req.onsuccess de openCursor
					} // function iterateKeys
					break;
				case "clear":
					os.clear();
					callback();	
					break;
				default:
					throw "bad type";	
			} // switch(type)
		} catch (e) {
			outSubtr.err = (typeof e === "string") ? "error: "+e : e.toString();
			fillAbortInfo(outSubtr.err);
			try { tr.abort(); } catch(e) {} // try catch por seguridad, tr no tendria que haberse abortado antes 
			callback();
		}
	}

	function executePendingSubtr(db: IDBDatabase, servSubtr:S_SUBTRANSACTION, abortOnError: boolean, outSubtr:C_SUBTRANSACTION, 
			pendingSubtr:any[][], abortInfo: abortInfo, callback:(tr:IDBTransaction, err: string)=>void) {

		var savedISubtr = abortInfo.iSubtr;	
		function fillAbortInfo(err: any) {
			if (abortInfo.error != null) return;
			abortInfo.iSubtr = savedISubtr;
			abortInfo.error = err;
		}	

		var fCallback=false;
		function end(tr:IDBTransaction, err: string) {
			if (!fCallback) { // por seguridad de no llamar dos veces
				fCallback=true; 
				callback(tr, err);
			}	
		}
		
		var type = servSubtr.type;
		
		var modify = servSubtr.modify;
		var filter = servSubtr.filter;

		switch (type) {
			case "put":
			case "add":
			case "delete":
			case "update":
				var argsFun = ["val", "key"];
				if (type === "delete") argsFun.push("primaryKey");
				if (type === "update") argsFun.push("primaryKey", "del");
				
				var funModify = <{(...a:[]):void}>createModify.apply(null, [modify].concat(argsFun));
				var funFilter = <{(...a:[]):void}>createFilter.apply(null, [filter].concat(argsFun));
			
				for (var i=0; i<pendingSubtr.length; i++) {
					var [val, key, primaryKey, del] = pendingSubtr[i];
					
					funModify(val, key, primaryKey, del, i, function(val:any, key:any, primaryKey:any, del:boolean,  i:number) {
						funFilter(val, key, primaryKey, del, function(accepted: boolean) {
							if (accepted) {
								pendingSubtr[i] = [val, key, primaryKey, del];
							} else {
								pendingSubtr[i] = null;
							}
							if (i == pendingSubtr.length-1) {
								var tr: IDBTransaction;
								var os: IDBObjectStore;	
								try {
									tr = db.transaction(db.objectStoreNames, "readwrite");
									os = tr.objectStore(servSubtr.objName);

								} catch(e) {
									var err = e.toString();
									fillAbortInfo(err);
									if (tr) tr.abort();	
									end(null, err);
									return;
								}
								var inlineKeys = (os.keyPath == null);
								 
								var iLastReqValid = -1;
								for (var i=0; i<pendingSubtr.length; i++) {
									if (pendingSubtr[i] == null) continue;
									
									iLastReqValid=i;	
									var [val, key, primaryKey, del] = pendingSubtr[i];
									(function(val:any, key:any, primaryKey:any, del:boolean, i:number) {
										function generateError(ev: Event, tr: IDBTransaction, err: any) {
											if (abortInfo.error != null) return;
											var outError:any = {
												name : err.name,
												message : err.message,
												val,
												key,
												i 
											};
											if (type == "update") {
												outError["primaryKey"] = primaryKey;
												outError["del"] = del;
											}
											outSubtr.errors.push(outError);
											if (abortOnError) {
												if (tr) tr.abort();
												end(null, null);
											} else {
												if (ev) ev.preventDefault();
												if (i == iLastReqValid) {
													end(tr, null);
												}
											}	
										}
										var req:IDBRequest;
										try {
											switch(type) {
												case "put":
													req = os.put(val, key);
													break;
												case "add":
													req = os.add(val, key);
													break;
												case "delete":
													req = os.delete(key);
													break;
												case "update":
													if (del) req = os.delete(key);
													else req = os.put(val, inlineKeys ? primaryKey : undefined);
													break;
											}
											req = (type === "put") ? os.put(val, key) : os.add(val,key);
										} catch (e) {
											generateError(null, tr, e);
											return;
										}
										req.onsuccess = function(ev) {
											if (i == iLastReqValid) {
												cleanOutErrors(outSubtr);
												end(tr, null);
											}
										}
										req.onerror = function(ev) {
											ev.stopPropagation();
											generateError(ev, null, (<IDBRequest>ev.target).error);	
										}
									})(val, key, primaryKey, del, i);
								}	
								if (iLastReqValid == -1) {
									cleanOutErrors(outSubtr);
									end(tr, null);
								}
							}	// if (i == pendingSubtr.length-1)
						}); // funFilter
					}); // funModify
				} // for (var i=0; i<pendingSubtr.length; i++) 
				break;
			case "get":
				var columns = outSubtr.columns;
				var allColumns = !!servSubtr.allColumns;

				var funModify = createModify(modify, "val", "key", "pk");
				var funFilter = createFilter(filter, "val", "key", "pk");
				for (var i=0; i<pendingSubtr.length; i++) {
					var [val, key, primaryKey] = pendingSubtr[i];

					funModify(val, key, primaryKey, i, function(val: any, key: any, primaryKey: any, i: number) {
						funFilter(val, key, primaryKey, function (accepted: boolean) {
							if (accepted) {
								if (outSubtr.values) 
									outSubtr.values.push(deconstructValue(val, columns, allColumns));
								if (outSubtr.keys) 
									outSubtr.keys.push(key);
								if (outSubtr.primaryKeys) 
									outSubtr.primaryKeys.push(primaryKey);
							}
							if (i == pendingSubtr.length-1) {
								cleanOutErrors(outSubtr);
								end(<any>true, null); // no hay transaction pero operación correcta, ya se creara
							}	
						});
					});		
				}
				break;
		} // switch(type)
	}

	
	export function debug_pr() {
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1855655e36867a17361.53131374","prefijoCliente":"test345_","Llicencia":"1.0"},"session":"synchronize","communication":60,"dbs":[{"dbName":"gtpv2","schema":{"_downloadSync":{"keyPath":"table"},"_uploadSync":{"keyPath":"table"}},"transaction":[{"id":"downloadSync","objName":"_downloadSync","type":"get","columns":["table","serverSync"]},{"id":"uploadSync","objName":"_uploadSync","type":"get","columns":["table","lastWrite"],"filter":"val.lastWrite > val.lastSync"}]}]}');
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1855655e36867a17361.53131374","prefijoCliente":"test345_","Llicencia":"1.0"},"session":"synchronize","communication":60,"dbs":[{"dbName":"gtpv2","transaction":[{"id":"downloadSync","objName":"_downloadSync","type":"get","columns":["table","serverSync"]},{"id":"uploadSync","objName":"_uploadSync","type":"get","columns":["table","lastWrite"],"filter":null}]}]}');
// tsc_test1_0
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1154355e4b9f81330a6.05051907","prefijoCliente":"tsc_test1_","Llicencia":"1.0"},"session":"synchronize","communication":60,"dbs":[{"dbName":"tsc_test1_gtpv","schema":{"_downloadSync":{"keyPath":"table"},"_uploadSync":{"keyPath":"table"}},"transaction":[{"id":"downloadSync","objName":"_downloadSync","type":"get","columns":["table","serverSync"]},{"id":"uploadSync","objName":"_uploadSync","type":"get","columns":["table","lastWrite"],"filter":"((val.lastSync == null) || (val.lastWrite > val.lastSync))"}]}]}');
//		idCom = "1154355e4b9f81330a6.05051907";
// tsc_test1_1
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1154355e4b9f81330a6.05051907","prefijoCliente":"tsc_test1_","Llicencia":"1.0"},"session":"synchronize","communication":60,"dbs":[{"dbName":"tsc_test1_gtpv","schema":{"articles":{"keyPath":"Codi"},"dependentes":{"keyPath":"CODI"},"dependentesextes":{"keyPath":["id","nom"]},"families":{"keyPath":["Nom","Pare","Nivell"]},"ConceptosEntrega":{"keyPath":["tipo","texto"]},"CodisBarres":{"keyPath":"Codi"},"_downloadSync":{"keyPath":"table"}},"transaction":[{"id":"download_inserts","objName":"articles","type":"put","columns":["Codi","NOM","PREU","PreuMajor","Desconte","EsSumable","Familia","CodiGenetic","TipoIva","NoDescontesEspecials"],"values":[["3000","T.R.Massap\u00e0 gran","16.5","11.550000000000001","3.0","1","3.4.1Tortells Reis","3000","2.0","1.0"],["213","Int. Rod\u00f3 1\/4 tallat","0.94999999999999996","0.83999999999999997","1.0","1","4.3.3Integral Rodons","213","1.0","0.0"],["2110","Pollastres al forn","8.75","7.0","2.0","1","6.3.3Plats Cuinats","2110","2.0","0.0"],["2141","Sandwich Beixamel","1.6499999999999999","1.0429999999999999","2.0","1","6.3.1Entrepans","2141","2.0","0.0"],["3916","Coca Full i Cabell 1\/2 Kg.","8.4499999999999993","6.0999999999999996","2.0","1","3.5.1Coques Sant Joan","3916","2.0","0.0"],["5634","FULL PETIT  ESPECIAL PLATA F4","7.5","5.25","1.0","1","5.6.2Mini","5634","2.0","0.0"],["1003","Coca 1\/2 Piny\u00f3","8.0","5.5999999999999996","2.0","1","5.2.2Coques Brioix","1003","2.0","0.0"],["1101","Berlina Xocolata.","0.80000000000000004","0.56499999999999995","2.0","1","5.5.1Berlines","1101","2.0","0.0"],["1224","Bra\u00e7 1\/4 Truf Piny\u00f3","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1224","2.0","0.0"],["4880","Cafe amb llet","1.3","1.3","1.0","1","Calentes","4880","2.0","0.0"],["1731","Peix Nata","10.0","7.0","2.0","1","5.4.3Nata Petita","1731","2.0","0.0"],["1060","Coca 1\/2 Fruita","8.0","5.5999999999999996","3.0","1","5.2.2Coques Brioix","1060","2.0","0.0"],["5475","Capuccino","1.8","1.8","1.0","1","Calentes","5475","2.0","0.0"],["2133","Gazpacho","2.25","1.6499999999999999","1.0","0","6.3.6Verdures","2133","2.0","1.0"],["1361","Crois. Vegetal","1.8999999999999999","1.3999999999999999","2.0","1","5.1.2Croissant","1361","2.0","0.0"],["4992","Tortell reis nata petit","15.5","10.85","3.0","1","3.4.1Tortells Reis","4992","2.0","0.0"],["4993","Tortell reis Nata gran","23.5","16.449999999999999","3.0","1","3.4.1Tortells Reis","4993","2.0","1.0"],["4998","Mousse S.Valenti Yogurt","8.8499999999999996","6.1950000000000003","3.0","1","3.6.8Diada Sant Valent\u00ed","4998","2.0","0.0"],["4999","Panini de pernil","1.6000000000000001","1.1200000000000001","2.0","1","6.3.2Pizzes","4999","2.0","0.0"],["5000","Panini de tonyina","1.6000000000000001","1.1200000000000001","2.0","1","6.3.2Pizzes","5000","2.0","0.0"],["5787","Ciabata rustica","0.94999999999999996","0.76000000000000001","1.0","1","","5787","1.0","0.0"],["5012","Barra Neu Arrissada.","0.94999999999999996","0.73999999999999999","1.0","1","4.1.2Pa Blanc Barres","5012","1.0","0.0"],["5038","Lionesa Super 8nata\/8trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","5038","2.0","0.0"],["5040","Bra\u00e7 ind. llimona","1.5","1.05","2.0","1","5.4.1Bra\u00e7os","5040","2.0","0.0"],["5047","Pa de Monta\u00f1a   1 porci\u00f3","1.3","1.01","1.0","1","4.1.1Artes\u00e0","5047","1.0","0.0"],["14","pages 2 kgs","4.2999999999999998","3.4399999999999999","1.0","1","4.1.3Rodons","14","1.0","0.0"],["3600","Bunyols Normals","15.0","12.0","2.0","0","3.3.1Bunyols","3600","2.0","0.0"],["7","Pag\u00e8s 400g","1.6000000000000001","1.28","1.0","1","4.1.3Rodons","7","1.0","0.0"],["3003","Tortell Reis N\/T gran ","23.5","16.449999999999999","3.0","1","3.4.1Tortells Reis","3003","2.0","1.0"],["1222","Bra\u00e7 1\/4 Piny\u00f3","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1222","2.0","0.0"],["1292","Pals amb xocolata","0.90000000000000002","0.65000000000000002","2.0","1","5.4.3Nata Petita","1292","2.0","0.0"],["1250","Past\u00eds N\/T\/Y","15.0","10.5","3.0","0","5.4.4Pastissos","1250","2.0","0.0"],["5501","NEULA XOCO","4.0","4.0","2.0","1","","5501","2.0","0.0"],["1711","Bra\u00e7 Ind. Nata","1.45","1.02","3.0","1","5.4.1Bra\u00e7os","1711","2.0","0.0"],["1710","Bra\u00e7 Ind. strataciella","1.5","1.05","3.0","1","5.4.1Bra\u00e7os","1710","2.0","0.0"],["5502","Fuet","0.65000000000000002","0.29499999999999998","1.0","1","4.5.3Precuit Barres","5502","1.0","0.0"],["24","Pag\u00e8s Rosca 800g","2.2000000000000002","1.72","1.0","1","4.1.3Rodons","24","1.0","0.0"],["30","Barra Pag\u00e8s 1\/2","1.5","1.2","1.0","1","4.1.2Pa Blanc Barres","30","1.0","0.0"],["1016","Bis. Casol\u00e0 Int.","8.5","5.2060000000000004","2.0","1","5.2.1Coca amb Motllo","1016","2.0","0.0"],["1110","Xuixo Crema","1.25","0.87","2.0","1","5.5.3Xuixos","1110","2.0","0.0"],["3","Ratlles 500 g","1.3","1.04","1.0","1","4.1.3Rodons","3","1.0","0.0"],["17","Pa Valls 500g","1.5","1.1699999999999999","1.0","1","4.1.3Rodons","17","2.0","0.0"],["3913","Reixeta Cabell","7.2999999999999998","5.1100000000000003","2.0","1","3.5.1Coques Sant Joan","3913","2.0","0.0"],["8","Pag\u00e8s 400g tallat","1.6000000000000001","1.28","1.0","1","4.1.3Rodons","8","1.0","0.0"],["1233","Crois. Trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1233","2.0","0.0"],["1237","Brioix Trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1237","2.0","0.0"],["3906","Coca Llardons petita","2.0","1.7","3.0","1","3.5.1Coques Sant Joan","3906","2.0","0.0"],["2111","Canelons 8 unitats","6.0","4.7999999999999998","2.0","1","6.3.3Plats Cuinats","2111","2.0","0.0"],["2029","brtes.semi petit farcit jam\u00f3n salado","1.3999999999999999","1.0980000000000001","1.0","1","6.1.2Pica-Pica","2029","1.0","0.0"],["4882","Infusi\u00f3n  TE","1.75","1.75","1.0","1","Calentes","4882","2.0","0.0"],["81","Sibarita","0.90000000000000002","0.69999999999999996","1.0","1","4.1.1Artes\u00e0","81","1.0","0.0"],["23","Pa Galleg 200g tallat","0.94999999999999996","0.83999999999999997","1.0","1","4.1.3Rodons","23","1.0","0.0"],["122","Rosca Sobada 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.8.3Sobat Rosca","122","1.0","0.0"],["1238","Trena Ind. Nata ","1.3","0.85799999999999998","2.0","1","5.4.3Nata Petita","1238","2.0","0.0"],["5153","mini reixeta cabell","1.8999999999999999","1.3300000000000001","3.0","1","Chocolatines","5153","2.0","0.0"],["5438","GRANIZAT","2.1000000000000001","1.9630000000000001","1.0","1","Fredes","5438","2.0","0.0"],["5556","XAPATA entrep\u00e0 variat","1.6000000000000001","1.28","2.0","1","6.3.1Entrepans","5556","2.0","0.0"],["5413","Mona Massini PETITA","24.0","16.800000000000001","2.0","1","3.3.4Mones","5413","2.0","0.0"],["5667","TASSA XOCOLATA DESFETA","2.25","2.25","2.0","1","","5667","2.0","0.0"],["5696","Bra\u00e7 individ. yema nata","1.6499999999999999","1.1499999999999999","2.0","1","","5696","2.0","0.0"],["5697","Bra\u00e7 individ. yema trufa","1.6499999999999999","1.26","2.0","1","","5697","2.0","0.0"],["5698","Bra\u00e7 individ. nata mermelada fresa","1.6499999999999999","1.1499999999999999","2.0","1","","5698","2.0","0.0"],["5731","cafeteria unidad DIPLOMATICO","0.38","0.38","2.0","1","","5731","2.0","0.0"],["5788","COCA BRIOIX 250 GRS CREMA O FRUITA","4.25","2.9750000000000001","2.0","1","","5788","2.0","0.0"],["5796"," PIZZA OFERTA 1.50\u0080 ATUN","1.5","1.389","2.0","1","","5796","2.0","0.0"],["5857","Pa de la salut BAIX EN SAL","0.63","0.53000000000000003","1.0","1","4.7.1Sense Sal Barra","5857","1.0","0.0"],["5874","3 FUETS Sol i Padris","1.8","1.4399999999999999","1.0","1","","5874","1.0","0.0"],["5730","cafeteria unidad CROISSANT MINI","0.38","0.38","2.0","1","","5730","2.0","0.0"],["5835","Aigua ampolla 1.5 l botiga","1.2","1.2","1.0","1","Fredes","5835","2.0","0.0"],["5939","CHUSCO MOTLLE PIPES","2.0","1.3999999999999999","1.0","1","","5939","2.0","0.0"],["5889","Pa Sant Jullia PRECO","0.94999999999999996","0.67000000000000004","1.0","1","","5889","2.0","0.0"],["6489","Focaccia besatta","1.8999999999999999","1.8999999999999999","4.0","1","","6489","2.0","0.0"],["5961","CHUSCO ESPELTA BLANCO","2.0","1.3999999999999999","1.0","1","","5961","2.0","0.0"],["6226","Amanides individual botiga","2.3999999999999999","2.222","1.0","1","6.1.1Pastissos Salats","6226","2.0","0.0"],["5089","canelons 4 unitats","3.8999999999999999","3.1200000000000001","2.0","1","6.3.3Plats Cuinats","5089","2.0","0.0"],["5096","Aigua De 50 cl.","1.05","1.05","1.0","1","Fredes","5096","2.0","0.0"],["1232","Merengues Forn","1.8500000000000001","1.48","2.0","1","5.4.3Nata Petita","1232","2.0","0.0"],["1216","Bra\u00e7 1\/2 Y\/Trufa","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1216","2.0","0.0"],["1215","Bra\u00e7 1\/4 Y\/Nata","6.0","4.2000000000000002","3.0","1","5.4.1Bra\u00e7os","1215","2.0","0.0"],["1013","Bis. Crema","9.5","6.6500000000000004","2.0","1","5.2.1Coca amb Motllo","1013","2.0","0.0"],["1285","Tortell Mini N\/T","2.0","2.0","3.0","1","5.4.6Tortells","1285","2.0","0.0"],["2002","c.Past\u00eds Salm\u00f3 a porc.","24.0","19.399999999999999","2.0","0","6.1.1Pastissos Salats","2002","2.0","0.0"],["101","Barra Sobada 1\/2 Curta","1.3999999999999999","1.0900000000000001","1.0","1","4.8.1Sobat Barra","101","1.0","0.0"],["3665","Mona Foto","22.0","15.4","2.0","1","3.3.4Mones","3665","2.0","0.0"],["1402","Canya Cabell","1.0","0.69999999999999996","2.0","1","5.6.1Canyes","1402","2.0","0.0"],["286","Integral Semi Petit","0.53000000000000003","0.40999999999999998","1.0","1","4.3.2Integral Pe\u00e7a Petita","286","2.0","0.0"],["5167","Suc Pinya 200 ml vidre","1.05","1.05","1.0","1","Fredes","5167","1.0","0.0"],["5168","Suc de taronja 200 ml vidre","1.05","1.05","1.0","1","Fredes","5168","1.0","0.0"],["5414","Mona nata\/trufa PETITA","22.0","15.4","2.0","1","3.3.4Mones","5414","2.0","0.0"],["5297","FIGURA PLANA COLOR","15.0","12.0","3.0","1","3.3.3Figures Mones","5297","2.0","0.0"],["5312","Plats de vidre","1.8999999999999999","1.335","2.0","1","5.2.3Coca amb Llauna","5312","2.0","0.0"],["5324","cervesa llauna","1.2","1.091","4.0","1","Fredes","5324","3.0","0.0"],["2117","Callos","7.4500000000000002","4.3529999999999998","1.0","0","6.3.3Plats Cuinats","2117","2.0","1.0"],["67","Pa de Ceba","1.3500000000000001","1.05","1.0","1","4.1.1Artes\u00e0","67","1.0","0.0"],["43","Barra farina 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.1.2Pa Blanc Barres","43","1.0","0.0"],["2164","Semi Rod\u00f3 Farcit de Pernill","1.6000000000000001","0.56799999999999995","2.0","1","6.3.1Entrepans","2164","2.0","0.0"],["3954","varis  ","0.01","0.01","4.0","1","CalMoure","3954","2.0","0.0"],["1357","Crois. pernil i formatge","1.2","0.87","2.0","1","5.1.2Croissant","1357","2.0","0.0"],["1331","Ens. Xocolata","1.0","0.69999999999999996","2.0","1","5.1.3Ensaimades","1331","2.0","0.0"],["1352","Crois. Far. Xocolata","1.05","0.73499999999999999","2.0","1","5.1.2Croissant","1352","2.0","0.0"],["38","Barra 1\/2 llenya","1.3500000000000001","1.0800000000000001","1.0","1","4.1.2Pa Blanc Barres","38","1.0","0.0"],["82","Pa de Castilla","1.6000000000000001","1.28","1.0","1","4.1.1Artes\u00e0","82","1.0","0.0"],["61","Pa Xef","0.94999999999999996","0.76000000000000001","1.0","1","4.1.1Artes\u00e0","61","1.0","0.0"],["4881"," cafe cortado (Tallat)..","1.05","1.05","1.0","1","Calentes","4881","2.0","0.0"],["4883","Got de llet","0.90000000000000002","0.82599999999999996","1.0","1","Calentes","4883","2.0","0.0"],["1330","Ensaimada","0.90000000000000002","0.59399999999999997","2.0","1","5.1.3Ensaimades","1330","2.0","0.0"],["3927","Mini Reixeta crema","1.8999999999999999","1.3300000000000001","3.0","1","3.5.1Coques Sant Joan","3927","2.0","0.0"],["1210","Bra\u00e7 1\/2 Nata","6.5","4.5499999999999998","3.0","1","5.4.1Bra\u00e7os","1210","2.0","0.0"],["1211","Bra\u00e7 1\/4 Nata","5.5","3.8500000000000001","3.0","1","5.4.1Bra\u00e7os","1211","2.0","0.0"],["1105","Berlina Crema","0.94999999999999996","0.66000000000000003","2.0","1","5.5.1Berlines","1105","2.0","0.0"],["5551","Roda primavera, plata","12.0","9.5","1.0","1","5.6.2Mini","5551","2.0","0.0"],["1366","Croissant mini F.crema","10.5","7.2999999999999998","1.0","1","5.1.2Croissant","1366","1.0","0.0"],["120","Rosca Estrella ","1.3999999999999999","1.0900000000000001","1.0","1","4.8.3Sobat Rosca","120","1.0","0.0"],["1243","Mousse Fruites Bosc","15.0","10.5","2.0","1","5.4.2Mousse","1243","2.0","0.0"],["303","S.Sal Int. Barra 200g ","0.94999999999999996","0.76000000000000001","2.0","1","4.7.1Sense Sal Barra","303","1.0","0.0"],["5568","palitos Pipas paquet","1.3999999999999999","1.3999999999999999","2.0","1","","5568","2.0","0.0"],["1307","Brioix Mini","10.0","7.0","2.0","0","5.1.1Brioix","1307","2.0","0.0"],["405","Brt. Semi Petita","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","405","1.0","0.0"],["5871","HORCHATA","1.2","1.2","4.0","1","","5871","2.0","0.0"],["457","Ninot de pa","0.88","0.68999999999999995","2.0","1","4.6.3Ninots","457","2.0","0.0"],["5","Pag\u00e8s 800g","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","5","1.0","0.0"],["4896","Caf\u00e9 con hielo","1.1499999999999999","1.1499999999999999","1.0","1","Calentes","4896","1.0","0.0"],["1501","Carquinyolis, kg","15.0","12.0","2.0","0","5.7.1Galetes Postre","1501","2.0","0.0"],["3420","Virutes de Sant Josep","20.0","15.0","2.0","0","3.6.7Diada Sant Josep","3420","2.0","0.0"],["1229","Bra\u00e7 1\/2 Fruites","9.5","6.0","3.0","1","5.4.1Bra\u00e7os","1229","2.0","0.0"],["1355","Crois. Mini Artes\u00e0","12.0","9.0","2.0","0","5.1.2Croissant","1355","2.0","0.0"],["65","Pa de S\u00e8gol","1.3999999999999999","1.0900000000000001","1.0","1","4.1.1Artes\u00e0","65","2.0","0.0"],["1235","Ens. Trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1235","2.0","0.0"],["2120","Truita de Patates","16.0","12.800000000000001","2.0","0","6.3.5Truites","2120","2.0","0.0"],["403","Brt. Semi Super","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","403","1.0","0.0"],["6195","Bollito nieve rizado CRU","0.68000000000000005","0.35999999999999999","1.0","1","","6195","1.0","0.0"],["3928"," mini Brioix-Crema","2.5","1.75","3.0","1","3.5.1Coques Sant Joan","3928","2.0","0.0"],["1112","Xuixo Nata","1.3","0.80200000000000005","2.0","1","5.5.3Xuixos","1112","2.0","0.0"],["2131","Pebrots","8.0","5.5999999999999996","2.0","0","6.3.6Verdures","2131","2.0","0.0"],["1400","Canya Crema","1.0","0.69999999999999996","2.0","1","5.6.1Canyes","1400","2.0","0.0"],["200","Int. Barra 400g","1.45","1.1599999999999999","1.0","1","4.3.1Integral Barra","200","1.0","0.0"],["5498","TURRON variado unidad","8.0","5.5999999999999996","2.0","1","","5498","2.0","0.0"],["69","Pa Laxant","0.65000000000000002","0.51000000000000001","1.0","1","4.1.1Artes\u00e0","69","2.0","0.0"],["3622","Mona Fruita GRAN","29.0","20.300000000000001","2.0","1","3.3.4Mones","3622","2.0","0.0"],["1792","Guapo Nata","1.7","1.1899999999999999","2.0","1","5.4.3Nata Petita","1792","2.0","0.0"],["41","Barra 1\/4 fr.","0.90000000000000002","0.71999999999999997","1.0","1","4.1.2Pa Blanc Barres","41","1.0","0.0"],["47","Baguette Neu..","1.05","0.81999999999999995","1.0","1","4.1.2Pa Blanc Barres","47","1.0","0.0"],["4884","Suc de taronja 200ml brick","1.05","1.05","1.0","1","Fredes","4884","1.0","0.0"],["1217","Bra\u00e7 1\/4 Y\/Trufa","6.0","4.2000000000000002","3.0","1","5.4.1Bra\u00e7os","1217","2.0","0.0"],["10","Pag\u00e8s 200g tallat","1.0","0.88","1.0","1","4.1.3Rodons","10","1.0","0.0"],["121","Rosca Sobada 1\/2","1.3999999999999999","1.0900000000000001","1.0","1","4.8.3Sobat Rosca","121","1.0","0.0"],["3621","Mona Nat\/Trufa GRAN","29.0","20.300000000000001","2.0","1","3.3.4Mones","3621","2.0","0.0"],["1346","Ens. Mini Xocolata","9.0500000000000007","5.9729999999999999","2.0","0","5.1.3Ensaimades","1346","2.0","0.0"],["1236","Brioix Nata","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1236","2.0","0.0"],["4757","Suc Pinya 200 ml brick","1.05","1.05","1.0","1","Fredes","4757","1.0","0.0"],["411","Frankfourt","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","411","1.0","0.0"],["504","Pa Motllo s.sal","1.8","1.3999999999999999","1.0","1","4.4.1Motllo blanc","504","1.0","0.0"],["302","S.Sal Brt. 100 g. ","0.63","0.48999999999999999","2.0","1","4.7.1Sense Sal Barra","302","1.0","0.0"],["3523","Polvorons Nevats","10.0","7.0","2.0","1","3.2.3Polvorons","3523","2.0","0.0"],["2172","Muslo pollo relleno","4.5","4.5","1.0","1","6.3.3Plats Cuinats","2172","2.0","0.0"],["5544","XAPATA PAGES","1.5","1.2","1.0","1","","5544","1.0","0.0"],["2145","Valencianets Farcits","1.3999999999999999","0.88300000000000001","2.0","1","6.3.1Entrepans","2145","2.0","0.0"],["2","Ratlles 800g tallades","2.2000000000000002","1.8200000000000001","1.0","1","4.1.3Rodons","2","1.0","0.0"],["3907","Coca Llardons gran","5.4000000000000004","3.7799999999999998","2.0","1","3.5.1Coques Sant Joan","3907","2.0","0.0"],["1370","Magd. Pinyons","9.0500000000000007","5.9729999999999999","2.0","0","5.1.4Magdalenes","1370","2.0","0.0"],["5453","Pa de Sant Juli\u00e0 ","0.94999999999999996","0.76000000000000001","1.0","1","","5453","1.0","0.0"],["3926","Mini Brioix Nata","3.2000000000000002","2.2400000000000002","3.0","1","3.5.1Coques Sant Joan","3926","2.0","0.0"],["1090","Biscuit damero (ajedrez)","12.0","8.4000000000000004","2.0","1","5.2.1Coca amb Motllo","1090","2.0","0.0"],["111","Rod\u00f3 Sobat 700g tallat","2.1000000000000001","1.74","1.0","1","4.8.2Sobat Rod\u00f3","111","1.0","0.0"],["1251","Past\u00eds Sant Marc","19.0","15.0","2.0","0","5.4.4Pastissos","1251","2.0","0.0"],["2116","Mandonguilles","12.199999999999999","5.1029999999999998","3.0","0","6.3.3Plats Cuinats","2116","2.0","0.0"],["3620","Mona Sara GRAN","29.0","20.300000000000001","2.0","1","3.3.4Mones","3620","2.0","0.0"],["1335","Ens. Cabell","1.0","0.69999999999999996","2.0","1","5.1.3Ensaimades","1335","2.0","0.0"],["4582","Farina ","1.7","1.05","1.0","0","1.2.1Derivats Pa","4582","1.0","1.0"],["4890","Coca cola","1.2","1.036","1.0","1","Fredes","4890","2.0","0.0"],["5072","brta. 100 gr.","0.57999999999999996","0.45000000000000001","1.0","1","4.1.2Pa Blanc Barres","5072","1.0","0.0"],["512","Pa Mot. Int. Petit","1.8","1.3999999999999999","1.0","1","4.4.2Motllo Integral","512","1.0","0.0"],["2135","Panadons tonyina","16.0","12.800000000000001","2.0","0","6.3.6Verdures","2135","2.0","0.0"],["2107","Pizza mini variada","15.0","12.0","2.0","0","6.3.2Pizzes","2107","2.0","0.0"],["1293","Tartaleta Flam","1.95","1.2869999999999999","2.0","1","5.4.3Nata Petita","1293","2.0","0.0"],["1716","Bra\u00e7 Ind. Trufa-","1.5","1.05","3.0","1","5.4.1Bra\u00e7os","1716","2.0","0.0"],["1325","Magd. Integrals","6.9000000000000004","4.5540000000000003","2.0","0","5.1.4Magdalenes","1325","2.0","0.0"],["5412","Mona fruita PETITA","22.0","15.4","2.0","1","3.3.4Mones","5412","2.0","0.0"],["5728","cafeteria unidad ENSAIMADA MINI","0.38","0.38","2.0","1","","5728","2.0","0.0"],["5336","suc de taronja natural","1.8","1.8","1.0","1","Fredes","5336","2.0","0.0"],["5940","CHUSCO MOTLLE PANSES I NOUS","2.0","1.3999999999999999","1.0","1","","5940","2.0","0.0"],["5360","pizza AMERICANA promocion","6.5","5.2000000000000002","2.0","1","6.2.1Pizzes Crues","5360","2.0","1.0"],["2142","Flautes Variades","1.8","0.88900000000000001","2.0","1","6.3.1Entrepans","2142","2.0","0.0"],["5490","3 croissants PROMOCIO","1.3","1.02","2.0","1","5.1.2Croissant","5490","2.0","0.0"],["1351","Crois. Xocolata","0.94999999999999996","0.66000000000000003","2.0","1","5.1.2Croissant","1351","2.0","0.0"],["36","Barra 1\/2 Curta","1.3","1.04","1.0","1","4.1.2Pa Blanc Barres","36","1.0","0.0"],["2119","Fideua","15.0","10.0","1.0","0","6.3.3Plats Cuinats","2119","2.0","1.0"],["422","Kellis","10.0","7.7999999999999998","2.0","0","4.6.1Barretes","422","2.0","0.0"],["1103","Berlina Nocilla","0.90000000000000002","0.51900000000000002","2.0","1","5.5.1Berlines","1103","2.0","0.0"],["5003","Pa Rustic","0.94999999999999996","0.76000000000000001","1.0","1","4.1.1Artes\u00e0","5003","1.0","0.0"],["3922","Coca Brioix Nocilla","9.5","6.6500000000000004","3.0","1","3.5.1Coques Sant Joan","3922","2.0","0.0"],["20","Pa Galleg Kg tallat","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","20","1.0","0.0"],["18","Pa Valls 500g tallat","1.5","1.27","1.0","1","4.1.3Rodons","18","1.0","0.0"],["3530","Roscos de Vi","10.0","7.0","2.0","0","3.2.4Roscos Nadal","3530","2.0","0.0"],["2122","Truita de Botifarra","16.0","12.800000000000001","3.0","0","6.3.5Truites","2122","2.0","0.0"],["6023","Bocadillo y bebida caliente","2.5","2.5","1.0","1","Calentes","6023","2.0","0.0"],["6361","TORRADA PERNIL   beguda","2.5","2.5","1.0","1","","6361","2.0","0.0"],["6369","HERRADURA CHOCOLATE  2 X 1.50 \u0080","1.5","1.05","2.0","1","5.6.3Pasta Individual","6369","2.0","0.0"],["64","Pa de Soja","1.3999999999999999","1.0900000000000001","1.0","1","4.1.1Artes\u00e0","64","1.0","0.0"],["22","Pa Galleg 200g","0.94999999999999996","0.73999999999999999","1.0","1","4.1.3Rodons","22","1.0","0.0"],["1321","Magd. Sucre","6.5","4.5499999999999998","2.0","0","5.1.4Magdalenes","1321","2.0","0.0"],["1393","Espardenya ","0.90000000000000002","0.59399999999999997","2.0","1","5.1.1Brioix","1393","2.0","0.0"],["215","Pa de Pipas","1.45","1.1599999999999999","1.0","1","4.3.3Integral Rodons","215","1.0","0.0"],["21","Pa Galleg 500g","1.6000000000000001","1.28","1.0","1","4.1.3Rodons","21","1.0","0.0"],["1350","Croissant","0.80000000000000004","0.56000000000000005","2.0","1","5.1.2Croissant","1350","2.0","0.0"],["4143","Foto Past\u00eds","6.4000000000000004","6.4000000000000004","4.0","1","1.1.5Decoraci\u00f3 Past\u00eds","4143","2.0","1.0"],["421","Flautes","0.63","0.48999999999999999","1.0","1","4.6.1Barretes","421","2.0","0.0"],["406","Brt. Col\u00b7legial","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","406","1.0","0.0"],["5028","pizza 1 promoci\u00f3","6.5","5.2000000000000002","2.0","1","6.3.2Pizzes","5028","2.0","1.0"],["2118","Espinacs amb beixamel","3.0","2.1000000000000001","3.0","1","6.3.3Plats Cuinats","2118","2.0","0.0"],["1219","Bra\u00e7 1\/4 Crema","6.5","4.5499999999999998","3.0","1","5.4.1Bra\u00e7os","1219","2.0","0.0"],["1364","c.Crois. Mini F.Salat","16.0","12.800000000000001","2.0","0","5.1.2Croissant","1364","2.0","0.0"],["1421","Delicies Crema","9.0500000000000007","5.2169999999999996","2.0","0","5.6.2Mini","1421","2.0","0.0"],["214","Int. Rod\u00f3 1\/2 s. sal","1.5","1.1699999999999999","1.0","1","4.3.3Integral Rodons","214","2.0","0.0"],["39","Barra 1\/4 llenya","0.90000000000000002","0.71999999999999997","1.0","1","4.1.2Pa Blanc Barres","39","1.0","0.0"],["301","S.Sal Barra 1\/4","0.94999999999999996","0.76000000000000001","2.0","1","4.7.1Sense Sal Barra","301","1.0","0.0"],["706","Ciabbata Baguette","0.90000000000000002","0.71999999999999997","1.0","1","4.2.1Ciabbates","706","1.0","0.0"],["4753","Cacaolat 200ml","1.25","1.087","1.0","1","Fredes","4753","1.0","0.0"],["1358","Crois. Frankfourt","1.2","0.83999999999999997","2.0","1","5.1.2Croissant","1358","2.0","0.0"],["1104","Berlina Maduixa","0.90000000000000002","0.48699999999999999","2.0","1","5.5.1Berlines","1104","2.0","0.0"],["3623","Mona artesanes Grans","22.0","15.4","2.0","1","3.3.4Mones","3623","2.0","0.0"],["3651","Figures xoco blanc SIMON COLL","29.699999999999999","20.154","3.0","0","3.3.3Figures Mones","3651","2.0","1.0"],["1100","Berlina normal","0.75","0.52500000000000002","2.0","1","5.5.1Berlines","1100","2.0","0.0"],["2147","Sandwich Int.","1.8","1.4399999999999999","2.0","1","6.3.1Entrepans","2147","2.0","0.0"],["50","Barra Pag\u00e8s Kg tallada ","2.25","1.8500000000000001","1.0","1","4.1.2Pa Blanc Barres","50","1.0","0.0"],["1281","Tortell N\/T gran","7.0","4.9000000000000004","2.0","1","5.4.6Tortells","1281","2.0","0.0"],["2162","Flautes far. Jam\u00f3n & Queso","1.8","1.1120000000000001","2.0","1","6.3.1Entrepans","2162","2.0","0.0"],["4879","Cafe","1.0","1.0","1.0","1","Calentes","4879","2.0","0.0"],["4750","Fanta llimona llauna","1.2","0.92700000000000005","1.0","1","Fredes","4750","1.0","0.0"],["412","Hamburguesa","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","412","1.0","0.0"],["513","Pa Motllo 5 cereals ","1.3500000000000001","1.05","1.0","1","4.4.2Motllo Integral","513","1.0","0.0"],["1249","Mousse 3 xocolates","15.0","10.5","2.0","1","5.4.2Mousse","1249","2.0","0.0"],["2121","Truita d\u00b4Espinacs","16.0","12.800000000000001","2.0","0","6.3.5Truites","2121","2.0","0.0"],["3520","Polvorons Ametllats","10.5","7.3499999999999996","2.0","1","3.2.3Polvorons","3520","2.0","0.0"],["2163","Semi Rod\u00f3 Farcit de Salat","1.5","0.45000000000000001","2.0","1","6.3.1Entrepans","2163","2.0","0.0"],["4","Ratlles 500g tallades","1.3","1.1399999999999999","1.0","1","4.1.3Rodons","4","1.0","0.0"],["6","Pag\u00e8s 800g tallat","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","6","1.0","0.0"],["210","Int. Rod\u00f3 1\/2 ","1.5","1.1699999999999999","1.0","1","4.3.3Integral Rodons","210","2.0","0.0"],["3912","Coca Nata\/Trufa","16.0","11.199999999999999","3.0","1","3.5.1Coques Sant Joan","3912","2.0","0.0"],["1124","Torrijas Sta. Teresa","8.0","7.407","3.0","0","5.5.2Fregit a Pes","1124","2.0","0.0"],["5761","Triangles coca de vidre","25.0","22.5","2.0","0","5.2.3Coca amb Llauna","5761","2.0","0.0"],["2149","Brtes. Col\u00b7legial far. Pernill salat","1.8","1.1120000000000001","2.0","1","6.3.1Entrepans","2149","2.0","0.0"],["1241","Mousse Xocolata","15.0","10.5","2.0","1","5.4.2Mousse","1241","2.0","0.0"],["1242","Mousse Iogurt","15.0","10.5","2.0","1","5.4.2Mousse","1242","2.0","0.0"],["1503","Pastes Te","15.0","12.0","2.0","1","5.7.1Galetes Postre","1503","2.0","0.0"],["704","Ciabbata Estirata","0.90000000000000002","0.71999999999999997","1.0","1","4.2.1Ciabbates","704","1.0","0.0"],["1120","Tronquets","9.5500000000000007","6.6849999999999996","2.0","0","5.5.2Fregit a Pes","1120","2.0","1.0"],["2171","Muslo pollo al ajillo","2.5","2.0","1.0","1","6.3.3Plats Cuinats","2171","1.0","0.0"],["2104","c.tires full nom\u00e9s Escalivada ","16.0","12.800000000000001","1.0","1","6.3.2Pizzes","2104","2.0","0.0"],["1214","Bra\u00e7 1\/2 Y\/Nata","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1214","2.0","0.0"],["1274","Tortell N\/T petit","5.0","3.5","2.0","1","3.3.2Carnestoltes","1274","2.0","0.0"],["440","Bast\u00f3 Normal petit","0.29999999999999999","0.23999999999999999","2.0","1","4.6.2Bastons","440","2.0","0.0"],["4855","Croissant GRATINAT","1.6000000000000001","1.1000000000000001","1.0","1","Salado ind.","4855","2.0","0.0"],["2170","Ensaladilla","9.5","8.0","2.0","1","6.3.3Plats Cuinats","2170","2.0","0.0"],["3924","Mini Brioix-Piny\u00f3","2.5","1.75","3.0","1","3.5.1Coques Sant Joan","3924","2.0","0.0"],["3625","Mona Massini GRAN","33.0","23.100000000000001","2.0","1","3.3.4Mones","3625","2.0","0.0"],["4769","Pa de truita","1.2","1.0","1.0","1","4.1.1Artes\u00e0","4769","1.0","0.0"],["456","N\u00famero de Pa","1.1299999999999999","0.88","1.0","1","4.6.3Ninots","456","1.0","0.0"],["3624","Mona Artesanes Petites","17.0","11.9","2.0","1","3.3.4Mones","3624","2.0","0.0"],["1420","Full Petit Especial PLATA F6","12.5","8.75","2.0","1","5.6.2Mini","1420","2.0","0.0"],["1017","Plum Cake","9.0500000000000007","6.335","2.0","0","5.2.1Coca amb Motllo","1017","2.0","0.0"],["207","Int. Baguettina ","1.0","0.80000000000000004","1.0","1","4.3.1Integral Barra","207","1.0","0.0"],["2124","Truita Xampinyons","16.0","12.800000000000001","3.0","0","6.3.5Truites","2124","2.0","0.0"],["413","Viena Llarg","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","413","2.0","0.0"],["2115","Rod\u00f3 Pavo","10.6","7.6429999999999998","3.0","0","6.3.3Plats Cuinats","2115","2.0","0.0"],["46","PA Campanya","1.1000000000000001","0.85999999999999999","1.0","1","4.1.2Pa Blanc Barres","46","1.0","0.0"],["4854","Crois. Tonyina","1.2","0.78000000000000003","1.0","1","5.7.3Salades","4854","2.0","0.0"],["37","Barra 1\/4 Curta","0.94999999999999996","0.73999999999999999","1.0","1","4.1.2Pa Blanc Barres","37","1.0","0.0"],["2136","Panadons Espinacs","16.0","12.800000000000001","2.0","0","6.3.6Verdures","2136","2.0","0.0"],["1422","Delicies Xocolata","9.0500000000000007","5.2169999999999996","2.0","0","5.6.2Mini","1422","2.0","0.0"],["5583","NESTEA llauna ","1.2","0.91000000000000003","2.0","1","Fredes","5583","2.0","0.0"],["112","Rod\u00f3 Sobat 1\/2","1.3999999999999999","1.0900000000000001","1.0","1","4.8.2Sobat Rod\u00f3","112","1.0","0.0"],["1412","Mil Fulls","1.8500000000000001","1.48","2.0","1","5.6.3Pasta Individual","1412","2.0","0.0"],["1200","Rebosteria","23.0","16.100000000000001","2.0","0","5.4.5Safata","1200","2.0","0.0"],["5533","fanta taronja llauna","1.2","0.96999999999999997","1.0","1","Fredes","5533","2.0","0.0"],["427","Mini Soja ","0.55000000000000004","0.374","1.0","1","4.6.1Barretes","427","1.0","0.0"],["311","S.Sal Rod\u00f3 1\/2 ","1.3999999999999999","1.0900000000000001","1.0","1","4.7.2Sense Sal Rod\u00f3","311","1.0","0.0"],["1000","Coca Brioix Llardons","9.1999999999999993","6.4400000000000004","3.0","1","5.2.2Coques Brioix","1000","2.0","0.0"],["1218","Bra\u00e7 1\/2 Crema","8.5","5.9500000000000002","3.0","1","5.4.1Bra\u00e7os","1218","2.0","0.0"],["1221","Bra\u00e7 1\/2 Piny\u00f3","11.0","8.0","3.0","1","5.4.1Bra\u00e7os","1221","2.0","0.0"],["1029","Tortas de C\u00f2rdova","1.0","0.80000000000000004","3.0","1","5.2.1Coca amb Motllo","1029","2.0","0.0"],["1333","Ens. Crema","1.05","0.72999999999999998","2.0","1","5.1.3Ensaimades","1333","2.0","0.0"],["506","Pa Motllo Petit","1.8","1.3999999999999999","1.0","1","4.4.1Motllo blanc","506","1.0","0.0"],["1339","Ens. Crema cremada","1.6499999999999999","1.1499999999999999","2.0","1","5.1.3Ensaimades","1339","2.0","0.0"],["1323","Magd. Poma","7.4500000000000002","4.9169999999999998","2.0","0","5.1.4Magdalenes","1323","2.0","0.0"],["2134","Alberginies Farcides","14.85","11.880000000000001","3.0","0","6.3.6Verdures","2134","2.0","0.0"],["2113","Peus de porc","7.9500000000000002","4.335","2.0","1","6.3.3Plats Cuinats","2113","2.0","0.0"],["282","int.barreta 50gr","0.53000000000000003","0.40000000000000002","2.0","1","4.3.2Integral Pe\u00e7a Petita","282","1.0","0.0"],["1328","Magd. Est. Xocolata","1.0","0.69999999999999996","2.0","1","5.1.4Magdalenes","1328","2.0","0.0"],["1345","Ens. Mini Crema","10.0","7.0","2.0","0","5.1.3Ensaimades","1345","2.0","0.0"],["19","Pa Galleg Kg","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","19","1.0","0.0"],["201","Int. Barra 200g","0.94999999999999996","0.76000000000000001","1.0","1","4.3.1Integral Barra","201","1.0","0.0"],["1712","Bra\u00e7 Ind. Crema","1.55","1.085","3.0","1","5.4.1Bra\u00e7os","1712","2.0","0.0"],["9","Pag\u00e8s 200g","1.0","0.78000000000000003","1.0","1","4.1.3Rodons","9","2.0","0.0"],["2018","c.Kellis Farcits","16.0","12.800000000000001","2.0","0","6.1.2Pica-Pica","2018","2.0","0.0"],["1730","Palo nata o trufa","1.5","1.05","2.0","1","5.4.3Nata Petita","1730","2.0","0.0"],["42","Barra farina 1\/2","1.3999999999999999","1.1200000000000001","1.0","1","4.1.2Pa Blanc Barres","42","1.0","0.0"],["1793","Guapo N\/T","1.7","1.1899999999999999","2.0","1","5.4.3Nata Petita","1793","2.0","0.0"],["1212","Bra\u00e7 1\/2 Trufa","6.5","4.5499999999999998","3.0","1","5.4.1Bra\u00e7os","1212","2.0","0.0"],["5552","Full Fruites plata F4","9.1999999999999993","6.75","2.0","1","5.6.2Mini","5552","2.0","0.0"],["1405","Canyes Xocolata Mini","0.5","0.22500000000000001","2.0","1","5.6.1Canyes","1405","2.0","0.0"],["1362","Crois. Mini","10.0","7.0","2.0","0","5.1.2Croissant","1362","2.0","0.0"],["35","Barra Gallega 1\/2","1.55","1.24","1.0","1","4.1.2Pa Blanc Barres","35","1.0","0.0"],["57","Panet de llet","0.68000000000000005","0.53000000000000003","1.0","1","4.1.2Pa Blanc Barres","57","1.0","1.0"],["5695","Bra\u00e7 indiv. crocanti trufa","1.6499999999999999","1.1499999999999999","2.0","1","","5695","2.0","0.0"],["2166","Entrep\u00e0 truita patata o variada","2.1000000000000001","1.357","2.0","1","6.3.1Entrepans","2166","2.0","0.0"],["3510","Tronc Nadal Petit","10.0","7.0","2.0","1","3.2.2Nadal Past\u00eds","3510","2.0","0.0"],["1401","Canya Xocolata","1.0","0.69999999999999996","2.0","1","5.6.1Canyes","1401","2.0","0.0"],["3531","Roscos An\u00eds","10.0","7.0","2.0","0","3.2.4Roscos Nadal","3531","2.0","0.0"],["3001","T.R.Massap\u00e0 petit","12.0","8.4000000000000004","3.0","1","3.4.1Tortells Reis","3001","2.0","1.0"],["415","Valencianets","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","415","2.0","0.0"],["3532","Roscos de Neu","9.5","6.5999999999999996","2.0","0","3.2.4Roscos Nadal","3532","2.0","0.0"],["113","Rod\u00f3 Sobat 1\/2 tallat","1.3999999999999999","1.1899999999999999","1.0","1","4.8.2Sobat Rod\u00f3","113","1.0","0.0"],["3925","Mini Brioix Fruita","2.5","1.75","3.0","1","3.5.1Coques Sant Joan","3925","2.0","0.0"],["2154","Pudding a peso","10.5","7.5","2.0","0","6.3.4Postres","2154","2.0","0.0"],["1511","Rosco Panses","10.0","7.0","2.0","0","5.7.2Roscos","1511","2.0","0.0"],["1012","Bis. Casol\u00e0","8.5","5.2060000000000004","2.0","1","5.2.1Coca amb Motllo","1012","2.0","0.0"],["1344","Ens. Minis","10.0","7.0","2.0","0","5.1.3Ensaimades","1344","2.0","0.0"],["212","Int. Rod\u00f3 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.3.3Integral Rodons","212","2.0","0.0"],["1329","Magdalenes Mini","10.0","7.0","2.0","0","5.1.4Magdalenes","1329","2.0","0.0"],["71","Pa Oli i Panses","1.3","1.01","1.0","1","4.1.1Artes\u00e0","71","1.0","0.0"],["3904","Coca 1\/2 Crema S.J","8.0","5.5999999999999996","2.0","1","3.5.1Coques Sant Joan","3904","2.0","0.0"],["93","Pa Osona Petit","0.94999999999999996","0.76000000000000001","1.0","1","4.1.1Artes\u00e0","93","1.0","0.0"],["94","Pa Osona Gran","1.6000000000000001","1.28","1.0","1","4.1.1Artes\u00e0","94","2.0","0.0"],["25","Pag\u00e8s Rosca 400g","1.5","1.2","1.0","1","4.1.3Rodons","25","1.0","0.0"],["102","Barra Sobada 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.8.1Sobat Barra","102","1.0","0.0"],["1213","Bra\u00e7 1\/4 Trufa","5.5","3.8500000000000001","3.0","1","5.4.1Bra\u00e7os","1213","2.0","0.0"],["3004","Tortell Reis N\/T pet. ","15.5","10.85","3.0","1","3.4.1Tortells Reis","3004","2.0","1.0"],["1410","Orelles","0.90000000000000002","0.63","2.0","1","5.6.3Pasta Individual","1410","2.0","0.0"],["3650","Figures xoco negre  SIMON-COLL","26.5","16.960000000000001","3.0","0","3.3.3Figures Mones","3650","2.0","0.0"],["5694","Bra\u00e7 individ. crocanti nata","1.6499999999999999","1.1499999999999999","2.0","1","","5694","2.0","0.0"],["312","S.Sal Rod\u00f3 1\/2 tallat","1.3999999999999999","1.1899999999999999","1.0","1","4.7.2Sense Sal Rod\u00f3","312","1.0","0.0"],["1363","Crois. Mini F.Xoc","10.5","7.3499999999999996","2.0","0","5.1.2Croissant","1363","2.0","0.0"],["16","Pa Valls Kg tallat","2.2000000000000002","1.8200000000000001","1.0","1","4.1.3Rodons","16","1.0","0.0"],["417","Semi Rod\u00f3 Petit","0.47999999999999998","0.37","1.0","1","4.6.1Barretes","417","2.0","0.0"],["4100","Espelmes 1 any","0.34999999999999998","0.34999999999999998","4.0","1","1.1.4Espelmes","4100","3.0","1.0"],["4103","Espelmes n\u00fam. petit","0.75","0.75","4.0","1","1.1.4Espelmes","4103","3.0","1.0"],["3914","Reixeta Crema","7.2999999999999998","5.1100000000000003","2.0","1","3.5.1Coques Sant Joan","3914","2.0","0.0"],["1296","Tarrina Nata 1\/4","2.1499999999999999","1.419","3.0","1","5.4.3Nata Petita","1296","2.0","0.0"],["2152","Flam","0.90000000000000002","0.33900000000000002","2.0","1","6.3.4Postres","2152","2.0","0.0"],["1320","Magdalenes","6.5","4.5499999999999998","2.0","0","5.1.4Magdalenes","1320","2.0","0.0"],["3602","Bunyols Xocolata","15.0","12.0","2.0","0","3.3.1Bunyols","3602","2.0","0.0"],["1507","Murcianos","9.5","6.6500000000000004","2.0","0","5.7.1Galetes Postre","1507","2.0","0.0"],["73","Banderillas","0.65000000000000002","0.51000000000000001","1.0","1","4.1.1Artes\u00e0","73","1.0","1.0"],["1322","Magd. Far. Xocolata","6.4000000000000004","4.2240000000000002","2.0","0","5.1.4Magdalenes","1322","2.0","0.0"],["5727","cafeteria unidad MAGDALENA MINI","0.14999999999999999","0.14999999999999999","2.0","1","","5727","2.0","0.0"],["1257","Past\u00eds de Formatge","13.0","9.0999999999999996","2.0","1","5.4.4Pastissos","1257","2.0","0.0"],["2112","Lassanya","6.1500000000000004","3.573","2.0","0","6.3.3Plats Cuinats","2112","2.0","0.0"],["2010","c.Croquetes","16.0","12.800000000000001","2.0","0","6.1.2Pica-Pica","2010","2.0","0.0"],["2143","Flautes int. Far.","1.8","0.88900000000000001","2.0","1","6.3.1Entrepans","2143","2.0","0.0"],["1049","Coca d\u00b4Oli","9.0","7.0","2.0","0","5.2.3Coca amb Llauna","1049","2.0","0.0"],["4581","Pa Sec Sacs","1.3999999999999999","0.96899999999999997","2.0","1","1.2.1Derivats Pa","4581","2.0","0.0"],["3601","Bunyols Crema","15.0","12.0","2.0","0","3.3.1Bunyols","3601","2.0","0.0"],["612","Ciab. Mini Precuit","0.23000000000000001","0.23000000000000001","1.0","1","4.5.4Precuit Barretes","612","1.0","1.0"],["1324","Magd. Civada","6.9000000000000004","4.5540000000000003","2.0","0","5.1.4Magdalenes","1324","2.0","0.0"],["5411","MONA SARA PETITA","22.0","15.4","2.0","1","3.3.4Mones","5411","2.0","0.0"],["5164","suc pressec 200ml brick","1.05","1.05","1.0","1","Fredes","5164","1.0","0.0"],["5166","suc pressec 200 ml vidre","1.05","1.05","1.0","1","Fredes","5166","1.0","0.0"],["5171","t\u00e9","0.0","0.0","1.0","1","Calentes","5171","1.0","0.0"],["5175","TE BOLSITA","1.2","1.2","1.0","1","Calentes","5175","1.0","0.0"],["5187","kellis con ajo","11.699999999999999","7.6580000000000004","2.0","0","Chocolatines","5187","2.0","0.0"],["5180","panini gordo","2.1499999999999999","1.72","2.0","1","6.1.1Pastissos Salats","5180","2.0","0.0"],["2100","Pizza Gran Variada","16.0","12.800000000000001","1.0","0","6.3.2Pizzes","2100","2.0","0.0"],["4583","Pa Ratllat","2.1499999999999999","1.591","2.0","1","1.2.1Derivats Pa","4583","2.0","0.0"],["110","Rod\u00f3 Sobat 700g","2.1000000000000001","1.6399999999999999","1.0","1","4.8.2Sobat Rod\u00f3","110","1.0","0.0"],["2020","Voulevants salats mini","20.0","12.5","2.0","1","6.1.2Pica-Pica","2020","2.0","0.0"],["1500","Coquets","15.0","12.0","2.0","0","5.7.1Galetes Postre","1500","2.0","0.0"],["2001","c.Past\u00eds de Tonyina","16.0","12.800000000000001","2.0","0","6.1.1Pastissos Salats","2001","2.0","0.0"],["2146","Ciabbata Farcida","1.95","1.137","2.0","1","6.3.1Entrepans","2146","2.0","0.0"],["100","Barra Sobada 1\/2","1.3999999999999999","1.1100000000000001","1.0","1","4.8.1Sobat Barra","100","1.0","0.0"],["5922","CHUSCO MOTLLE CEREALS ","2.0","1.3999999999999999","1.0","1","","5922","2.0","0.0"],["6480","MUFFINS","1.5","1.2","2.0","1","","6480","2.0","0.0"],["6527","PAN QUEMAO PROMOCION 2 X 1.50 \u0080","1.5","1.2","2.0","1","","6527","2.0","0.0"],["3521","Mantecados Canyella","10.0","7.0","4.0","0","3.2.3Polvorons","3521","2.0","0.0"],["1353","Crois. Crema","1.05","0.73499999999999999","2.0","1","5.1.2Croissant","1353","2.0","0.0"],["404","Brt. Semi Gran","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","404","1.0","0.0"],["115","Cordov\u00e8s","1.3500000000000001","1.05","2.0","1","4.8.2Sobat Rod\u00f3","115","1.0","0.0"],["3114","Moniatos","4.2000000000000002","2.9769999999999999","2.0","1","3.1.1Panellets","3114","2.0","0.0"],["2140","Sandwich ","1.8","1.4399999999999999","2.0","1","6.3.1Entrepans","2140","2.0","0.0"],["1234","Ens. Nata","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1234","2.0","0.0"],["1239","Trena Ind. Trufa","1.3","0.85799999999999998","2.0","1","5.4.3Nata Petita","1239","2.0","0.0"],["1258","Past\u00eds amb forma","23.0","18.0","3.0","0","5.4.4Pastissos","1258","2.0","0.0"],["1426","Orejas mini","11.699999999999999","7.6050000000000004","2.0","1","5.6.2Mini","1426","2.0","0.0"],["40","Barra 1\/2 fr.","1.3","1.04","1.0","1","4.1.2Pa Blanc Barres","40","1.0","0.0"],["1300","Brioix normal","0.59999999999999998","0.41999999999999998","2.0","1","5.1.1Brioix","1300","2.0","0.0"],["3860","Mousse S. Valenti llimona","8.8499999999999996","6.1950000000000003","3.0","1","3.6.8Diada Sant Valent\u00ed","3860","2.0","0.0"],["1240","Mousse Llimona","15.0","10.5","2.0","1","5.4.2Mousse","1240","2.0","0.0"],["414","Viena Rod\u00f3","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","414","2.0","0.0"],["1244","Mousse de Wisky","15.0","10.5","2.0","1","5.4.2Mousse","1244","2.0","0.0"],["1326","Magd. Grans","5.8499999999999996","3.8610000000000002","2.0","0","5.1.4Magdalenes","1326","2.0","0.0"],["1390","Pa Cremat ","1.05","0.69299999999999995","1.0","1","5.1.1Brioix","1390","2.0","0.0"],["1042","Coca Forner Gr.","9.0","6.2999999999999998","2.0","0","5.2.3Coca amb Llauna","1042","2.0","1.0"],["1327","Magd. Estrella","0.84999999999999998","0.59499999999999997","2.0","1","5.1.4Magdalenes","1327","2.0","0.0"],["1230","Crois. Nata","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1230","2.0","0.0"],["418","Semi Rod\u00f3 Gran","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","418","2.0","0.0"],["1510","Roscos Vent","12.0","8.4000000000000004","2.0","0","5.7.2Roscos","1510","2.0","1.0"],["1504","Galetes Integrals","12.199999999999999","8.5399999999999991","2.0","0","5.7.1Galetes Postre","1504","2.0","1.0"],["72","Rosca d\u00b4oli 200g","1.25","0.97999999999999998","1.0","1","4.1.1Artes\u00e0","72","1.0","0.0"],["5628","AIGUA 50 CL PER EMPORTAR","0.94999999999999996","0.94999999999999996","1.0","1","Fredes","5628","1.0","0.0"],["1126","Pastisets Tortosa","10.6","7.4199999999999999","2.0","1","5.5.2Fregit a Pes","1126","2.0","0.0"],["2165","Bocadillo Jam\u00f3n Salado","2.1000000000000001","1.357","2.0","1","6.3.1Entrepans","2165","2.0","0.0"],["2144","Brtes. Col\u00b7legial Far","1.3","0.80200000000000005","2.0","1","6.3.1Entrepans","2144","2.0","0.0"],["407","Brt. Semi mini","0.47999999999999998","0.37","2.0","1","4.6.1Barretes","407","1.0","0.0"],["1","Ratlles 800g","2.2000000000000002","1.72","1.0","1","4.1.3Rodons","1","1.0","0.0"],["15","Pa Valls Kg","2.2000000000000002","1.72","1.0","1","4.1.3Rodons","15","1.0","0.0"],["3910","Coca Crema Quemada","15.0","10.5","2.0","1","3.5.1Coques Sant Joan","3910","2.0","0.0"],["13","Pag\u00e8s 2 Kg","4.2999999999999998","3.4399999999999999","1.0","1","4.1.3Rodons","13","1.0","0.0"],["304","S.Sal Int. Brt. 100g ","0.63","0.48999999999999999","2.0","1","4.7.1Sense Sal Barra","304","1.0","0.0"],["1223","Bra\u00e7 1\/2 Trufa Piny\u00f3","11.0","8.0","3.0","1","5.4.1Bra\u00e7os","1223","2.0","0.0"],["300","S.Sal Barra de 1\/2","1.45","1.1299999999999999","1.0","1","4.7.1Sense Sal Barra","300","1.0","0.0"],["1430","Fruitis","1.5","1.2","2.0","1","5.6.3Pasta Individual","1430","2.0","0.0"],["1411","Orelles Xocolata","1.0","0.69999999999999996","2.0","1","5.6.3Pasta Individual","1411","2.0","0.0"],["1205","Lioneses Variades","14.0","9.8000000000000007","3.0","0","5.4.5Safata","1205","2.0","0.0"],["2114","Macarrons","10.0","7.0","2.0","0","6.3.3Plats Cuinats","2114","2.0","0.0"],["281","Int. Barra 100g ","0.63","0.48999999999999999","1.0","1","4.3.2Integral Pe\u00e7a Petita","281","1.0","0.0"],["5172","tila","0.0","0.0","1.0","1","Calentes","5172","1.0","0.0"],["5212","Xocolatina ","0.69999999999999996","0.53800000000000003","1.0","1","Chocolatines","5212","1.0","0.0"],["211","Int. Rod\u00f3 1\/2 tallat","1.5","1.27","1.0","1","4.3.3Integral Rodons","211","1.0","0.0"],["1419","Tarta Poma Ind","1.05","0.73499999999999999","2.0","1","5.6.3Pasta Individual","1419","2.0","0.0"],["5443","Mousse individual sabores","1.95","1.6499999999999999","2.0","1","5.4.2Mousse","5443","2.0","0.0"],["6371","LAZO DE CHOCOLATE PROMOCION 2 X 1.50 \u0080","1.5","1.05","2.0","1","","6371","1.0","0.0"],["6385","ENSAIMADA PROMOCION 2 X1 ... 1.50 \u0080","1.5","1.05","1.0","1","","6385","1.0","0.0"],["6521","COCA DIJOUS GRAS verduras,sardina o butifarra,unitat","3.5","3.0","1.0","1","","6521","2.0","0.0"],["5964","garrafa subirat 8 l.","1.6499999999999999","1.6499999999999999","1.0","1","Fredes","5964","1.0","0.0"],["6022","Bocadillo y bebida fria","2.5","2.5","1.0","1","Fredes","6022","2.0","0.0"],["6100","Pasta individual full SENSE SUCRE","0.69999999999999996","0.69999999999999996","2.0","1","","6100","2.0","0.0"],["6462","NATURCAO PROMOCIO 2 X 1.50 \u0080","1.5","1.05","1.0","1","","6462","2.0","0.0"]]},{"id":"download_inserts","objName":"dependentes","type":"put","columns":["CODI","NOM","MEMO","TELEFON","ADRE\u00c7A","Icona","Hi Editem Horaris","Tid"],"values":[["1191","pare","pare_WEB","","","","0",""],["1154","Gladys F. Garcia ","Gladys","","sabadell","","1",""],["2145","Marta Martinez","Marta Martinez","937239902","Avda Can deu 4,2\u00ba1\u00aa","","1",""],["2146","Montse Roca","Montse Roca","","","","1",""],["2097","Estrella Perez ","Estrella Perez Apera","937272599","Miguel Angel 13 2 1","","1",""],["2061","Soledad Martinez","Soledad Martinez","","","","1",""],["2147","Marta Adell Carpio","Marta Adell","931915907","Via Favencia 14 2\u00ba1\u00aa","","1",""],["2098","Hortensia Carmona","Hortensia Carmona","937461016","","","1",""],["2141","Zaira Ruz","Zaira Ruz","","","","1",""],["1189","josep","josep_WEB","","","","0",""],["2142","Laura Obejo","Laura Obejo","652016554","","","1",""],["2143","Alba","Alba","685113575","","","1",""],["2148","Nuria Lagunas","Nuria Lagunas","","","","1",""],["2139","Maria Invernon","Maria Invernon","931267247","eDUARD bROSSA, 90 BAIXOS","","1",""],["2123","Yolanda Romero Sakapan","YOLANDA ROMERO SAKAP","93 7240289","","","1",""],["1967","M\u00aa Carmen Cuevas","M\u00aa Carmen Cuevas","937450336","Walter Benjamin, 23","","1",""],["1990","Monica Aguilar","Monica Aguilar","635243334","","","1",""],["1112","Cristina Camacho","Cristina Camacho","","","","1",""],["1166","Louie Pesta\u00f1o ","Louie"," NOU 657184837","prullans, 5","","0",""],["2149","Ana Maria Murray","Ana Maria Murray","","","","1",""],["2051","Ana Sanchez","Ana Sanchez","937235075","Llu\u00e7anes 42 1\u00ba2\u00aa","","1",""],["2104","Marta Matalonga","Marta Matalonga","937163064","","","1",""],["1168","Monica Perez-Muelas","MONICA_WEB","937257846","","","1",""],["2150","Juan Sastre","Juan Sastre","","","","1",""],["2105","Estefania Pomares","Estefania Pomares","","","","1",""],["2124","Angeles Jimenez ","Angeles Jimenez Dardallo","","","","1",""],["1940","Soumaya Amalluuk","Soumaya","","","","1",""],["2041","Marta Boned","Marta Boned","937231122","concordia","","1",""],["18","Sonia Pardo Matin","Sonia P.","937173978","c\/ Tarragona","","1",""],["2050","Sara Cuevas","Sara Cuevas","937233115","","","1",""],["1139","Luis Collazos Marinl","Luis","937171552","Ramon Jover, 15","","0",""],["1141","Eloy Mendez","EloyMendez","937182857","99","","0",""],["2004","Emelia Anselmo ","Emelia Anselmo Pesta","","Prullans, 5 baixos","","1",""],["2080","Rosa Maria Pintado","Rosa Maria Pintado","","Can Viloca 39 5 2","","1",""],["1147","Emilio","Emilio","937173233","1","","0",""],["1151","Pepe Martinez","pepe","937176438","1","","0",""],["1152","Antonio Hernandez","q","937257846","1","","0",""],["1176","Maribel Andres Matas","Maribel","931914074","","","1",""],["2057","Meri Lopez","Meri Lopez","666392215","","","1",""],["1955","Conchi Guillen","Conchi Guillen","","","","0",""],["2082","Judith Pardo","Judith Pardo","","","","1",""],["2059","Erika Corpas","Erika Corpas","937235720","","","1",""],["2083","Maria Martinez","Maria Martinez","","","","1",""],["2086","Erney","Erney","","","","0",""],["1213","Esther Pujala","Esther Pujala","937233760","93 7161084","","1",""],["103","Dana","Dana","937804610","932257940","","1",""],["2134","Judit Pasalodos","Judit Pasalodos","","Baltarga,13 1\u00ba3\u00aa","","1",""],["2091","Paqui Linero","Paqui Linero","937243095","Josep Pla 76","","1",""],["1197","Sofia Garcia","Sofia","616851074","","","1",""],["1184","Carles Bosch","Carles Bosch_WEB","937257846","","","0",""],["1216","Patri Melero","Patri","937179388","","","1",""],["1208","Natalia Pellicer","Natalia","665610214","","","1",""],["1903","susana","susana_WEB","","","","0",""],["1904","Edwin  Wilber Rojas ","Edwin","662636985","","","0",""],["1183","ANNA","ANNA_WEB","","","","0",""],["1991","OLGA","Olga Soto","610858662","","","1",""],["1215","Josep Bosch Maso ","Josep Bosch Maso_WEB","937237039","Andorra, 24","","1",""],["1008","Antonio Romero","Toni","937165274","","","0","1803401ROAR0660108009^ANTONIO ROMERO ARANDA         ^  ^991^0304^0000000000^8034016251180660108009=0"],["1010","Leandro Sastre","Leandro","937234821","1","","0","1803401SAMO0610505001^LEANDRO SASTRE MORATON        ^  ^931^1196^0000000000^8034016414750610505001=0"],["1958","Pilar Cano","Pilar Cano","937209212","","","1",""],["1039","Graciela Lencina","Graciela","937278419","Montserrat, 48 bajos  ","","1",""],["1984","Mayra Mariela Solis","Mayra Mariela Solis","","J.Aparici,25 4\u00ba2\u00aa","","1",""],["2114","Jessica Velasco","Jessica","","","","1",""],["1100","Marleny Quintero","Marleny","937171552","","","1",""],["1156","Amancio","Amancio","937118260","sabadell.","","0",""],["1157","Maria Jesus Carpio","1","1","sabadell","","0",""],["1009","Jose Castillo","Jose","937238696","1","","0","1803401CAVE0700708005^JOSE ANTONIO CASTILLO VERA    ^  ^991^0704^0000000000^8034011617350700708005=0"],["2019","Sarita Caceres Garcia","Sarita Caceres Garci","","","","1",""],["2067","Lidia Armengol","Lidia Armengol","937273254","algersuariPascual51","","1",""],["12","Encarna Sanchez ","Encarna","937106737","Elcano, 11  ","BITER PRIMERA.ICO","1",""],["31","Mari Garcia Ramos","Mari","937177456","Collsalarca228 6\u00ba2\u00aa","PA NATURAL PRIMERA.ICO","1",""],["1005","Antonio Vilchez Mu\u00f1o","Antonio","937166742","Asam.Cataaluny","","0","1803401VIMU0700906007^ANTONIO VILCHEZ MU#EOZ         ^  ^981^0603^0000000000^8034017394810700906007=0"],["1965","Chari Rubio","Chari Rubio","937165151","","","1",""],["2109","Ana Fernandez","Ana Fernandez","","","","1",""],["1949","Celia Botella","Celia_WEB","","Smirna, 5","","1",""],["1084","Pila Maso","Pila Mas","937104645","Elcano, 25","","1",""],["2024","Maravillas Botella","Maravillas ","637923222","","","1",""],["2122","Gemma Alcaraz","Gemma Alcaraz","937172426","","","1",""],["2095","Teresa Cordova Yauri","Teresa Cordova Yauri","608420457","","","0",""],["1158","Maria del Mar ","M Mar","937184483","Barbera","","1",""],["1951","Anabel Lozano","Anabel_WEB","937242476","Roma, 1","","1",""],["60","Lidia Pareja","Lidia ","","Granja del Pas, 18.","","1",""],["1148","Isidoro","sidoro_WEB","937101200","1","","0",""],["2103","Montse Sanroma","Montse Sanroma","","","","1",""],["2035","Dolores Hallado","Dolores Hallado","652970887","","","1",""],["2020","Janet Caceres Garcia","Janet Caceres Garcia_WEB","","","","1",""],["2033","Josefina Nicolas","Josefina Nicolas","931911028","NORTE 8 B 7 4","","1",""],["1150","Tutusaus Josep Maria","q","937169363","1","","0",""]]},{"id":"download_inserts","objName":"dependentesextes","type":"put","columns":["id","nom","valor"],"values":[["1005","PASSWORD",""],["1005","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1008","PASSWORD",""],["1008","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1009","PASSWORD",""],["1009","TIPUSTREBALLADOR","PRODUCCIO"],["1010","PASSWORD",""],["1010","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["103","PASSWORD",""],["103","TIPUSTREBALLADOR","DEPENDENTA"],["1039","PASSWORD",""],["1039","TIPUSTREBALLADOR","DEPENDENTA"],["1084","TIPUSTREBALLADOR","DEPENDENTA"],["1100","PASSWORD",""],["1100","TIPUSTREBALLADOR","DEPENDENTA"],["1112","PASSWORD",""],["1112","TIPUSTREBALLADOR","DEPENDENTA"],["1139","PASSWORD",""],["1139","TIPUSTREBALLADOR","REPARTIDOR"],["1141","PASSWORD",""],["1141","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1147","PASSWORD",""],["1147","TIPUSTREBALLADOR","REPARTIDOR"],["1148","PASSWORD",""],["1148","TIPUSTREBALLADOR","AUXILIAR"],["1150","PASSWORD",""],["1150","TIPUSTREBALLADOR","REPARTIDOR"],["1151","PASSWORD",""],["1151","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1152","PASSWORD",""],["1152","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1154","PASSWORD",""],["1154","TIPUSTREBALLADOR","PRODUCCIO"],["1156","PASSWORD",""],["1156","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1157","PASSWORD",""],["1157","TIPUSTREBALLADOR","AUXILIAR"],["1158","PASSWORD",""],["1158","TIPUSTREBALLADOR","DEPENDENTA"],["1166","PASSWORD",""],["1166","TIPUSTREBALLADOR","NETEJA"],["1168","PASSWORD",""],["1168","TIPUSTREBALLADOR","ADMINISTRACIO"],["1176","PASSWORD",""],["1176","TIPUSTREBALLADOR","DEPENDENTA"],["1183","PASSWORD","marta"],["1183","TIPUSTREBALLADOR","GERENT_2"],["1184","PASSWORD","monica"],["1184","TIPUSTREBALLADOR","GERENT"],["1189","PASSWORD","pep"],["1189","TIPUSTREBALLADOR","GERENT"],["1191","PASSWORD","daina"],["1191","TIPUSTREBALLADOR","GERENT"],["1197","PASSWORD",""],["1197","TIPUSTREBALLADOR","DEPENDENTA"],["12","PASSWORD",""],["12","TIPUSTREBALLADOR","DEPENDENTA"],["1208","TIPUSTREBALLADOR","DEPENDENTA"],["1213","PASSWORD",""],["1213","TIPUSTREBALLADOR","DEPENDENTA"],["1215","PASSWORD",""],["1215","TIPUSTREBALLADOR","GERENT"],["1216","PASSWORD",""],["1216","TIPUSTREBALLADOR","DEPENDENTA"],["18","PASSWORD",""],["18","TIPUSTREBALLADOR","DEPENDENTA"],["1903","PASSWORD","sus"],["1903","TIPUSTREBALLADOR","GERENT_2"],["1904","PASSWORD",""],["1904","TIPUSTREBALLADOR","REPARTIDOR"],["1940","PASSWORD",""],["1940","TIPUSTREBALLADOR","DEPENDENTA"],["1949","PASSWORD",""],["1949","TIPUSTREBALLADOR","DEPENDENTA"],["1951","PASSWORD",""],["1951","TIPUSTREBALLADOR","DEPENDENTA"],["1955","PASSWORD",""],["1955","TIPUSTREBALLADOR","AUXILIAR"],["1958","PASSWORD",""],["1958","TIPUSTREBALLADOR","DEPENDENTA"],["1965","PASSWORD",""],["1965","TIPUSTREBALLADOR","DEPENDENTA"],["1967","PASSWORD",""],["1967","TIPUSTREBALLADOR","DEPENDENTA"],["1984","PASSWORD",""],["1984","TIPUSTREBALLADOR","DEPENDENTA"],["1990","PASSWORD",""],["1990","TIPUSTREBALLADOR","DEPENDENTA"],["1991","PASSWORD",""],["1991","TIPUSTREBALLADOR","DEPENDENTA"],["2004","PASSWORD",""],["2004","TIPUSTREBALLADOR","NETEJA"],["2019","PASSWORD",""],["2019","TIPUSTREBALLADOR","DEPENDENTA"],["2020","PASSWORD","janet"],["2020","TIPUSTREBALLADOR","ADMINISTRACIO"],["2024","PASSWORD",""],["2024","TIPUSTREBALLADOR","DEPENDENTA"],["2033","PASSWORD",""],["2033","TIPUSTREBALLADOR","DEPENDENTA"],["2035","PASSWORD",""],["2035","TIPUSTREBALLADOR","DEPENDENTA"],["2041","PASSWORD",""],["2041","TIPUSTREBALLADOR","DEPENDENTA"],["2050","PASSWORD",""],["2050","TIPUSTREBALLADOR","DEPENDENTA"],["2051","PASSWORD",""],["2051","TIPUSTREBALLADOR","DEPENDENTA"],["2057","PASSWORD",""],["2057","TIPUSTREBALLADOR","DEPENDENTA"],["2059","PASSWORD",""],["2059","TIPUSTREBALLADOR","DEPENDENTA"],["2061","PASSWORD",""],["2061","TIPUSTREBALLADOR","DEPENDENTA"],["2067","PASSWORD",""],["2067","TIPUSTREBALLADOR","DEPENDENTA"],["2080","PASSWORD",""],["2080","TIPUSTREBALLADOR","DEPENDENTA"],["2082","PASSWORD",""],["2082","TIPUSTREBALLADOR","DEPENDENTA"],["2083","PASSWORD",""],["2083","TIPUSTREBALLADOR","DEPENDENTA"],["2086","PASSWORD",""],["2086","TIPUSTREBALLADOR","PRODUCCIO"],["2091","PASSWORD",""],["2091","TIPUSTREBALLADOR","DEPENDENTA"],["2095","PASSWORD",""],["2095","TIPUSTREBALLADOR","PRODUCCIO"],["2097","PASSWORD",""],["2097","TIPUSTREBALLADOR","DEPENDENTA"],["2098","PASSWORD",""],["2098","TIPUSTREBALLADOR","DEPENDENTA"],["2103","PASSWORD",""],["2103","TIPUSTREBALLADOR","DEPENDENTA"],["2104","PASSWORD",""],["2104","TIPUSTREBALLADOR","DEPENDENTA"],["2105","PASSWORD",""],["2105","TIPUSTREBALLADOR","DEPENDENTA"],["2109","PASSWORD",""],["2109","TIPUSTREBALLADOR","DEPENDENTA"],["2114","PASSWORD",""],["2114","TIPUSTREBALLADOR","DEPENDENTA"],["2122","PASSWORD",""],["2122","TIPUSTREBALLADOR","DEPENDENTA"],["2123","PASSWORD",""],["2123","TIPUSTREBALLADOR","DEPENDENTA"],["2124","PASSWORD",""],["2124","TIPUSTREBALLADOR","DEPENDENTA"],["2134","PASSWORD",""],["2134","TIPUSTREBALLADOR","DEPENDENTA"],["2139","PASSWORD",""],["2139","TIPUSTREBALLADOR","DEPENDENTA"],["2141","PASSWORD",""],["2141","TIPUSTREBALLADOR","DEPENDENTA"],["2142","PASSWORD",""],["2142","TIPUSTREBALLADOR","DEPENDENTA"],["2143","PASSWORD",""],["2143","TIPUSTREBALLADOR","DEPENDENTA"],["2145","PASSWORD",""],["2145","TIPUSTREBALLADOR","DEPENDENTA"],["2146","PASSWORD",""],["2146","TIPUSTREBALLADOR","DEPENDENTA"],["2147","PASSWORD",""],["2147","TIPUSTREBALLADOR","DEPENDENTA"],["2148","PASSWORD",""],["2148","TIPUSTREBALLADOR","DEPENDENTA"],["2149","PASSWORD",""],["2149","TIPUSTREBALLADOR","DEPENDENTA"],["2150","PASSWORD",""],["2150","TIPUSTREBALLADOR","FORNER"],["31","PASSWORD",""],["31","TIPUSTREBALLADOR","DEPENDENTA"],["60","PASSWORD",""],["60","TIPUSTREBALLADOR","DEPENDENTA"]]},{"id":"download_inserts","objName":"families","type":"put","columns":["Nom","Pare","Estatus","Nivell","Utilitza"],"values":[[" Amanides","Article","","1",""],["01 Pa:","Article","4","1","0"],["02 Pastisseria","Article","4","1","1"],["03 Cafeteria","Article","4","1",""],["04 Diades","Article","4","1","3"],["05 Accessoris","Article","4","1","9"],["06 Altres","Article","","1",""],["1.1.1Blondes","Cartronatge","4","3","0"],["1.1.2Bosses","Cartronatge","4","3","12"],["1.1.3Caixes","Cartronatge","4","3","34"],["1.1.4Espelmes","Cartronatge","4","3","5"],["1.1.5Decoraci\u00f3 Past\u00eds","Cartronatge","4","3","9"],["1.1.6Neteja","Cartronatge","4","3","6"],["1.1.7Paper","Cartronatge","4","3","7"],["1.1.8Plats i Safates","Cartronatge","4","3","8"],["1.2.1Derivats Pa","Mat\u00e8ries Primes","4","3","23"],["1.2.2Gelats","Mat\u00e8ries Primes","4","3","67"],["1.2.3M\u00e0nigues","Mat\u00e8ries Primes","4","3","45"],["1.2.4Mat.Prim.B\u00e0siques","Mat\u00e8ries Primes","4","3","89"],["3.1.1Panellets","Castanyada","4","3","1"],["3.2.1Nadal Pans","Nadal","4","3","0"],["3.2.2Nadal Past\u00eds","Nadal","4","3","1"],["3.2.3Polvorons","Nadal","4","3","2"],["3.2.4Roscos Nadal","Nadal","4","3","3"],["3.2.5Torrons","Nadal","4","3","4"],["3.3.1Bunyols","Quaresma","4","3","0"],["3.3.2Carnestoltes","Quaresma","4","3","1"],["3.3.3Figures Mones","Quaresma","4","3","56"],["3.3.4Mones","Quaresma","4","3","234"],["3.4.1Tortells Reis","Reis","4","3","01"],["3.5.1Coques Sant Joan","Sant Joan","4","3","0123"],["3.6.1Diada Mare","Santos","4","3","3"],["3.6.2Diada Montserrat","Santos","4","3","4"],["3.6.3Diada Sant Antoni","Santos","4","3","9"],["3.6.4Diada Sant Blai","Santos","4","3","0"],["3.6.5Diada Sant Honorat","Santos","4","3","1"],["3.6.6Diada Sant Jordi","Santos","4","3","5"],["3.6.7Diada Sant Josep","Santos","4","3","2"],["3.6.8Diada Sant Valent\u00ed","Santos","4","3","68"],["3.6.9Diada Sta Teresa","Santos","4","3","7"],["4.1.1Artes\u00e0","Blanc","4","3","6789"],["4.1.2Pa Blanc Barres","Blanc","4","3","345"],["4.1.3Rodons","Blanc","4","3","012"],["4.2.1Ciabbates","Ciabbates.","4","3","0"],["4.3.1Integral Barra","Integrals","4","3","0"],["4.3.2Integral Pe\u00e7a Petita","Integrals","4","3","89"],["4.3.3Integral Rodons","Integrals","4","3","1"],["4.4.1Motllo blanc","Motllo","4","3","0"],["4.4.2Motllo Integral","Motllo","4","3","1"],["4.4.3Motllo Pag\u00e8s","Motllo","4","3","2"],["4.5.1Cru Barres","No Cuit","4","3","2"],["4.5.2Cru Barretes","No Cuit","4","3","3"],["4.5.3Precuit Barres","No Cuit","4","3","0"],["4.5.4Precuit Barretes","No Cuit","4","3","1"],["4.6.1Barretes","Paneteria","4","3","0123"],["4.6.2Bastons","Paneteria","4","3","4"],["4.6.3Ninots","Paneteria","4","3","5"],["4.6.4Paneteria Coques","Paneteria","4","3","6"],["4.7.1Sense Sal Barra","Sense Sal","4","3","0"],["4.7.2Sense Sal Rod\u00f3","Sense Sal","4","3","1"],["4.8.1Sobat Barra","Sobats","4","3","0"],["4.8.2Sobat Rod\u00f3","Sobats","4","3","1"],["4.8.3Sobat Rosca","Sobats","4","3","2"],["5.1.1Brioix","Bolleria","4","3","019"],["5.1.2Croissant","Bolleria","4","3","56"],["5.1.3Ensaimades","Bolleria","4","3","34"],["5.1.4Magdalenes","Bolleria","4","3","2"],["5.2.1Coca amb Motllo","Coques","4","3","1239"],["5.2.2Coques Brioix","Coques","4","3","06"],["5.2.3Coca amb Llauna","Coques","4","3","4"],["5.2.4Past\u00eds Pe\u00e7a Petita","Coques","4","3","5"],["5.3.1Bolleria Crua","Cru","4","3","678"],["5.3.2Coques Crues","Cru","4","3","1235"],["5.3.3Mini Crus","Cru","4","3","04"],["5.4.1Bra\u00e7os","Fred","4","3","12"],["5.4.2Mousse","Fred","4","3","4"],["5.4.3Nata Petita","Fred","4","3","39"],["5.4.4Pastissos","Fred","4","3","56"],["5.4.5Safata","Fred","4","3","0"],["5.4.6Tortells","Fred","4","3","78"],["5.5.1Berlines","Fregit","4","3","0"],["5.5.2Fregit a Pes","Fregit","4","3","2"],["5.5.3Xuixos","Fregit","4","3","1"],["5.6.1Canyes","Full","4","3","0"],["5.6.2Mini","Full","4","3","2"],["5.6.3Pasta Individual","Full","4","3","13"],["5.6.4Placa","Full","4","3","4"],["5.7.1Galetes Postre","Galetes","4","3","0"],["5.7.2Roscos","Galetes","4","3","1"],["5.7.3Salades","Galetes","4","3","2"],["6.1.1Pastissos Salats","Aperitius","4","3","0"],["6.1.2Pica-Pica","Aperitius","4","3","12"],["6.2.1Pizzes Crues","Cru.","4","3","0"],["6.3.1Entrepans","Entrants","4","3","46"],["6.3.2Pizzes","Entrants","4","3","0"],["6.3.3Plats Cuinats","Entrants","4","3","178"],["6.3.4Postres","Entrants","4","3","5"],["6.3.5Truites","Entrants","4","3","2"],["6.3.6Verdures","Entrants","4","3","3"],["Aperitius","06 Altres","4","2","0"],["Article","","0","0"," "],["AutoAsignats","06 Altres","","2",""],["Bebidas","Productes Tercers","4","3",""],["Begudes","03 Cafeteria","4","2",""],["Begudes.","article","","1",""],["Blanc","01 Pa:","4","2","0"],["Bolleria","02 Pastisseria","4","2","3"],["Brioxeria","Article","","1",""],["Calentes","Begudes","4","3",""],["CalMoure","AutoAsignats","","3",""],["Cartronatge","05 Accessoris","4","2","01"],["Castanyada","04 Diades","4","2","1"],["Catering","Article","","1",""],["Chocolatines","Revenda","4","3","2"],["Ciabbates.","01 Pa:","4","2","7"],["Congelat barres","No Cuit","4","3","45"],["Coques","02 Pastisseria","4","2","0"],["Coques.","Article","","1",""],["Cru","02 Pastisseria","4","2","6"],["Cru.","06 Altres","4","2","2"],["Cuina","Article","","1",""],["Entrants","06 Altres","4","2","1"],["Especialitats temporals","Article","","1",""],["Fred","02 Pastisseria","4","2","27"],["Fredes","Begudes","4","3",""],["Fregit","02 Pastisseria","4","2","1"],["Full","02 Pastisseria","4","2","4"],["Galetes","02 Pastisseria","4","2","5"],["Integrals","01 Pa:","4","2","2"],["Liquits","Revenda","4","3","0"],["materiales","article","","1",""],["Mat\u00e8ries Primes","05 Accessoris","4","2","56"],["Motllo","01 Pa:","4","2","5"],["Nadal","04 Diades","4","2","5"],["No Cuit","01 Pa:","4","2","6"],["Paneteria","01 Pa:","4","2","4"],["papel","materiales","","2",""],["Pastas","Productes Tercers","4","3",""],["Productes Tercers","05 Accessoris","4","2",""],["Quaresma","04 Diades","4","2","6"],["Reis","04 Diades","4","2","0"],["Revenda","05 Accessoris","4","2","9"],["Salado ind.","Productes Tercers","4","3",""],["Sant Joan","04 Diades","4","2","9"],["Santos","04 Diades","4","2","3478"],["Sense Sal","01 Pa:","4","2","3"],["Sobats","01 Pa:","4","2","1"],["Surtido","Productes Tercers","4","3",""],["Velas","Productes Tercers","4","3",""],["Xocolata","Article","","1",""]]},{"id":"download_inserts","objName":"ConceptosEntrega","type":"put","columns":["tipo","texto"],"values":[["O","Entrega Di\u00e0ria"],["O","Hores"],["A","Entrada de Canvi"]]},{"id":"download_inserts","objName":"CodisBarres","type":"put","columns":["Codi","Producte"],"values":[["8410507504437","10046"],["8412201000130","5175"],["8412147150012","5220"],["8412945454510","5197"],["4892169000320","4104"],["8410128001681","4957"],["8416400888131","5262"],["8424372021555","5096"],["5449000050205","4801"],["54491472","5272"],["5449000006271","5273"],["0","6625"],["8410507504444","4759"],["8413907906009","3650"],["8413907409005","3651"],["646587","5143"],["5449000000996","4890"],["55555","73"],["8411002101305","3928"]]},{"objName":"_downloadSync","type":"put","columns":["table","serverSync","debugServerDatetime"],"values":[["articles","2015-08-31 17:38:40.863","2015-08-31 19:38:40.863"],["dependentes","2015-08-31 17:38:41.440","2015-08-31 19:38:41.440"],["dependentesextes","2015-08-31 17:38:41.677","2015-08-31 19:38:41.677"],["families","2015-08-31 17:38:41.923","2015-08-31 19:38:41.923"],["ConceptosEntrega","2015-08-31 17:38:42.273","2015-08-31 19:38:42.273"],["CodisBarres","2015-08-31 17:38:42.400","2015-08-31 19:38:42.400"]]},{"objName":"_downloadSync","id":"downloadSync_UD","type":"get","columns":["table","serverSync"]}]}]}');
// tsc_test1_2
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1154355e4b9f81330a6.05051907","prefijoCliente":"tsc_test1_","Llicencia":"1.0"},"session":"synchronize","communication":60}');
	
		
/*		var msg = <any>{
			"gtpv":["server",1],
			"clientInfo":{"idCom":"1154355e4b9f81330a6.05051907","prefijoCliente":"tsc_test1_","Llicencia":"1.0"},
			"session":"synchronize",
			"communication":60,
			"dbs":[
				{
					"dbName":"tsc_test1_gtpv",
					"schema":{
						"articles":{"keyPath":"Codi"},
						"dependentes":{"keyPath":"CODI"},
						"dependentesextes":{"keyPath":["id","nom"]},
						"families":{"keyPath":["Nom","Pare","Nivell"]},
						"ConceptosEntrega":{"keyPath":["tipo","texto"]},
						"CodisBarres":{"keyPath":"Codi"},
						"_downloadSync":{"keyPath":"table"}
					},
					"transaction":[
						{
							"id":"download_inserts",
							"objName":"articles",
							"type":"add",
							"columns":[
								"Codi",
								"NOM",
								"PREU",
								"PreuMajor",
								"Desconte",
								"EsSumable",
								"Familia",
								"CodiGenetic",
								"TipoIva",
								"NoDescontesEspecials"
							],"values":[
								[
									"3000",
									"T.R.Massap\u00e0 gran",
									"16.5","11.550000000000001",
									"3.0",
									"1",
									"3.4.1Tortells Reis",
									"3000",
									"2.0",
									"1.0"
								],
								[
									"test1",
									"T.R.Massap\u00e0 gran",
									"16.5","11.550000000000001",
									"3.0",
									"1",
									"3.4.1Tortells Reis",
									"3000",
									"2.0",
									"1.0"
								]
							]
						},
						{
							"id":"download_inserts",
							"objName":"dependentes",
							"type":"put",
							"columns":[
								"CODI",
								"NOM",
								"MEMO",
								"TELEFON",
								"ADRE\u00c7A",
								"Icona",
								"Hi Editem Horaris",
								"Tid"
							],"values":[
								[
									"test2",
									"pare",
									"pare_WEB",
									"",
									"",
									"",
									"0",
									""
								],
								[
									"test3",
									"pare",
									"pare_WEB",
									"",
									"",
									"",
									"0",
									""
								]
							]
						}		
					]			
				}
			]
		};	
*/		

		idCom = "1002055e8b417abffd6.75747588";
//tsc_test2_0
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1002055e8b417abffd6.75747588","prefijoCliente":"tsc_test2__","Llicencia":"1.0"},"session":"synchronize","communication":60,"dbs":[{"dbName":"tsc_test2__gtpv","schema":{"_downloadSync":{"keyPath":"table"},"_uploadSync":{"keyPath":"table"}},"transaction":[{"id":"downloadSync","objName":"_downloadSync","type":"get","columns":["table","serverSync"]},{"id":"uploadSync","objName":"_uploadSync","type":"get","columns":["table","lastWrite"],"filter":"((val.lastSync == null) || (val.lastWrite > val.lastSync))"}]}]}');
//tsc_test2_1		
//		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1002055e8b417abffd6.75747588","prefijoCliente":"tsc_test2__","Llicencia":"1.0"},"session":"synchronize","communication":60,"dbs":[{"dbName":"tsc_test2__gtpv","schema":{"articles":{"keyPath":"codi"},"dependentes":{"keyPath":"codi"},"dependentesExtes":{"keyPath":["id","nom"]},"families":{"keyPath":["nom","pare","nivell"]},"conceptosEntrega":{"keyPath":["tipo","texto"]},"codisBarres":{"keyPath":"codi"},"_downloadSync":{"keyPath":"table"}},"transaction":[{"id":"download_inserts","objName":"articles","type":"put","columns":["codi","nom","preu","preuMajor","desconte","esSumable","familia","codiGenetic","tipoIva","noDescontesEspecials"],"values":[["3000","T.R.Massap\u00e0 gran","16.5","11.550000000000001","3.0","1","3.4.1Tortells Reis","3000","2.0","1.0"],["213","Int. Rod\u00f3 1\/4 tallat","0.94999999999999996","0.83999999999999997","1.0","1","4.3.3Integral Rodons","213","1.0","0.0"],["2110","Pollastres al forn","8.75","7.0","2.0","1","6.3.3Plats Cuinats","2110","2.0","0.0"],["2141","Sandwich Beixamel","1.6499999999999999","1.0429999999999999","2.0","1","6.3.1Entrepans","2141","2.0","0.0"],["3916","Coca Full i Cabell 1\/2 Kg.","8.4499999999999993","6.0999999999999996","2.0","1","3.5.1Coques Sant Joan","3916","2.0","0.0"],["5634","FULL PETIT  ESPECIAL PLATA F4","7.5","5.25","1.0","1","5.6.2Mini","5634","2.0","0.0"],["1003","Coca 1\/2 Piny\u00f3","8.0","5.5999999999999996","2.0","1","5.2.2Coques Brioix","1003","2.0","0.0"],["1101","Berlina Xocolata.","0.80000000000000004","0.56499999999999995","2.0","1","5.5.1Berlines","1101","2.0","0.0"],["1224","Bra\u00e7 1\/4 Truf Piny\u00f3","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1224","2.0","0.0"],["4880","Cafe amb llet","1.3","1.3","1.0","1","Calentes","4880","2.0","0.0"],["1731","Peix Nata","10.0","7.0","2.0","1","5.4.3Nata Petita","1731","2.0","0.0"],["1060","Coca 1\/2 Fruita","8.0","5.5999999999999996","3.0","1","5.2.2Coques Brioix","1060","2.0","0.0"],["5475","Capuccino","1.8","1.8","1.0","1","Calentes","5475","2.0","0.0"],["2133","Gazpacho","2.25","1.6499999999999999","1.0","0","6.3.6Verdures","2133","2.0","1.0"],["1361","Crois. Vegetal","1.8999999999999999","1.3999999999999999","2.0","1","5.1.2Croissant","1361","2.0","0.0"],["4992","Tortell reis nata petit","15.5","10.85","3.0","1","3.4.1Tortells Reis","4992","2.0","0.0"],["4993","Tortell reis Nata gran","23.5","16.449999999999999","3.0","1","3.4.1Tortells Reis","4993","2.0","1.0"],["4998","Mousse S.Valenti Yogurt","8.8499999999999996","6.1950000000000003","3.0","1","3.6.8Diada Sant Valent\u00ed","4998","2.0","0.0"],["4999","Panini de pernil","1.6000000000000001","1.1200000000000001","2.0","1","6.3.2Pizzes","4999","2.0","0.0"],["5000","Panini de tonyina","1.6000000000000001","1.1200000000000001","2.0","1","6.3.2Pizzes","5000","2.0","0.0"],["5787","Ciabata rustica","0.94999999999999996","0.76000000000000001","1.0","1","","5787","1.0","0.0"],["5012","Barra Neu Arrissada.","0.94999999999999996","0.73999999999999999","1.0","1","4.1.2Pa Blanc Barres","5012","1.0","0.0"],["5038","Lionesa Super 8nata\/8trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","5038","2.0","0.0"],["5040","Bra\u00e7 ind. llimona","1.5","1.05","2.0","1","5.4.1Bra\u00e7os","5040","2.0","0.0"],["5047","Pa de Monta\u00f1a   1 porci\u00f3","1.3","1.01","1.0","1","4.1.1Artes\u00e0","5047","1.0","0.0"],["14","pages 2 kgs","4.2999999999999998","3.4399999999999999","1.0","1","4.1.3Rodons","14","1.0","0.0"],["3600","Bunyols Normals","15.0","12.0","2.0","0","3.3.1Bunyols","3600","2.0","0.0"],["7","Pag\u00e8s 400g","1.6000000000000001","1.28","1.0","1","4.1.3Rodons","7","1.0","0.0"],["3003","Tortell Reis N\/T gran ","23.5","16.449999999999999","3.0","1","3.4.1Tortells Reis","3003","2.0","1.0"],["1222","Bra\u00e7 1\/4 Piny\u00f3","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1222","2.0","0.0"],["1292","Pals amb xocolata","0.90000000000000002","0.65000000000000002","2.0","1","5.4.3Nata Petita","1292","2.0","0.0"],["1250","Past\u00eds N\/T\/Y","15.0","10.5","3.0","0","5.4.4Pastissos","1250","2.0","0.0"],["5501","NEULA XOCO","4.0","4.0","2.0","1",null,"5501","2.0","0.0"],["1711","Bra\u00e7 Ind. Nata","1.45","1.02","3.0","1","5.4.1Bra\u00e7os","1711","2.0","0.0"],["1710","Bra\u00e7 Ind. strataciella","1.5","1.05","3.0","1","5.4.1Bra\u00e7os","1710","2.0","0.0"],["5502","Fuet","0.65000000000000002","0.29499999999999998","1.0","1","4.5.3Precuit Barres","5502","1.0","0.0"],["24","Pag\u00e8s Rosca 800g","2.2000000000000002","1.72","1.0","1","4.1.3Rodons","24","1.0","0.0"],["30","Barra Pag\u00e8s 1\/2","1.5","1.2","1.0","1","4.1.2Pa Blanc Barres","30","1.0","0.0"],["1016","Bis. Casol\u00e0 Int.","8.5","5.2060000000000004","2.0","1","5.2.1Coca amb Motllo","1016","2.0","0.0"],["1110","Xuixo Crema","1.25","0.87","2.0","1","5.5.3Xuixos","1110","2.0","0.0"],["3","Ratlles 500 g","1.3","1.04","1.0","1","4.1.3Rodons","3","1.0","0.0"],["17","Pa Valls 500g","1.5","1.1699999999999999","1.0","1","4.1.3Rodons","17","2.0","0.0"],["3913","Reixeta Cabell","7.2999999999999998","5.1100000000000003","2.0","1","3.5.1Coques Sant Joan","3913","2.0","0.0"],["8","Pag\u00e8s 400g tallat","1.6000000000000001","1.28","1.0","1","4.1.3Rodons","8","1.0","0.0"],["1233","Crois. Trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1233","2.0","0.0"],["1237","Brioix Trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1237","2.0","0.0"],["3906","Coca Llardons petita","2.0","1.7","3.0","1","3.5.1Coques Sant Joan","3906","2.0","0.0"],["2111","Canelons 8 unitats","6.0","4.7999999999999998","2.0","1","6.3.3Plats Cuinats","2111","2.0","0.0"],["2029","brtes.semi petit farcit jam\u00f3n salado","1.3999999999999999","1.0980000000000001","1.0","1","6.1.2Pica-Pica","2029","1.0","0.0"],["4882","Infusi\u00f3n  TE","1.75","1.75","1.0","1","Calentes","4882","2.0","0.0"],["81","Sibarita","0.90000000000000002","0.69999999999999996","1.0","1","4.1.1Artes\u00e0","81","1.0","0.0"],["23","Pa Galleg 200g tallat","0.94999999999999996","0.83999999999999997","1.0","1","4.1.3Rodons","23","1.0","0.0"],["122","Rosca Sobada 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.8.3Sobat Rosca","122","1.0","0.0"],["1238","Trena Ind. Nata ","1.3","0.85799999999999998","2.0","1","5.4.3Nata Petita","1238","2.0","0.0"],["5153","mini reixeta cabell","1.8999999999999999","1.3300000000000001","3.0","1","Chocolatines","5153","2.0","0.0"],["5438","GRANIZAT","2.1000000000000001","1.9630000000000001","1.0","1","Fredes","5438","2.0","0.0"],["5556","XAPATA entrep\u00e0 variat","1.6000000000000001","1.28","2.0","1","6.3.1Entrepans","5556","2.0","0.0"],["5413","Mona Massini PETITA","24.0","16.800000000000001","2.0","1","3.3.4Mones","5413","2.0","0.0"],["5667","TASSA XOCOLATA DESFETA","2.25","2.25","2.0","1",null,"5667","2.0","0.0"],["5696","Bra\u00e7 individ. yema nata","1.6499999999999999","1.1499999999999999","2.0","1",null,"5696","2.0","0.0"],["5697","Bra\u00e7 individ. yema trufa","1.6499999999999999","1.26","2.0","1",null,"5697","2.0","0.0"],["5698","Bra\u00e7 individ. nata mermelada fresa","1.6499999999999999","1.1499999999999999","2.0","1",null,"5698","2.0","0.0"],["5731","cafeteria unidad DIPLOMATICO","0.38","0.38","2.0","1",null,"5731","2.0","0.0"],["5788","COCA BRIOIX 250 GRS CREMA O FRUITA","4.25","2.9750000000000001","2.0","1",null,"5788","2.0","0.0"],["5796"," PIZZA OFERTA 1.50\u0080 ATUN","1.5","1.389","2.0","1",null,"5796","2.0","0.0"],["5857","Pa de la salut BAIX EN SAL","0.63","0.53000000000000003","1.0","1","4.7.1Sense Sal Barra","5857","1.0","0.0"],["5874","3 FUETS Sol i Padris","1.8","1.4399999999999999","1.0","1",null,"5874","1.0","0.0"],["5730","cafeteria unidad CROISSANT MINI","0.38","0.38","2.0","1",null,"5730","2.0","0.0"],["5835","Aigua ampolla 1.5 l botiga","1.2","1.2","1.0","1","Fredes","5835","2.0","0.0"],["5939","CHUSCO MOTLLE PIPES","2.0","1.3999999999999999","1.0","1",null,"5939","2.0","0.0"],["5889","Pa Sant Jullia PRECO","0.94999999999999996","0.67000000000000004","1.0","1",null,"5889","2.0","0.0"],["6489","Focaccia besatta","1.8999999999999999","1.8999999999999999","4.0","1","","6489","2.0","0.0"],["5961","CHUSCO ESPELTA BLANCO","2.0","1.3999999999999999","1.0","1",null,"5961","2.0","0.0"],["6226","Amanides individual botiga","2.3999999999999999","2.222","1.0","1","6.1.1Pastissos Salats","6226","2.0","0.0"],["5089","canelons 4 unitats","3.8999999999999999","3.1200000000000001","2.0","1","6.3.3Plats Cuinats","5089","2.0","0.0"],["5096","Aigua De 50 cl.","1.05","1.05","1.0","1","Fredes","5096","2.0","0.0"],["1232","Merengues Forn","1.8500000000000001","1.48","2.0","1","5.4.3Nata Petita","1232","2.0","0.0"],["1216","Bra\u00e7 1\/2 Y\/Trufa","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1216","2.0","0.0"],["1215","Bra\u00e7 1\/4 Y\/Nata","6.0","4.2000000000000002","3.0","1","5.4.1Bra\u00e7os","1215","2.0","0.0"],["1013","Bis. Crema","9.5","6.6500000000000004","2.0","1","5.2.1Coca amb Motllo","1013","2.0","0.0"],["1285","Tortell Mini N\/T","2.0","2.0","3.0","1","5.4.6Tortells","1285","2.0","0.0"],["2002","c.Past\u00eds Salm\u00f3 a porc.","24.0","19.399999999999999","2.0","0","6.1.1Pastissos Salats","2002","2.0","0.0"],["101","Barra Sobada 1\/2 Curta","1.3999999999999999","1.0900000000000001","1.0","1","4.8.1Sobat Barra","101","1.0","0.0"],["3665","Mona Foto","22.0","15.4","2.0","1","3.3.4Mones","3665","2.0","0.0"],["1402","Canya Cabell","1.0","0.69999999999999996","2.0","1","5.6.1Canyes","1402","2.0","0.0"],["286","Integral Semi Petit","0.53000000000000003","0.40999999999999998","1.0","1","4.3.2Integral Pe\u00e7a Petita","286","2.0","0.0"],["5167","Suc Pinya 200 ml vidre","1.05","1.05","1.0","1","Fredes","5167","1.0","0.0"],["5168","Suc de taronja 200 ml vidre","1.05","1.05","1.0","1","Fredes","5168","1.0","0.0"],["5414","Mona nata\/trufa PETITA","22.0","15.4","2.0","1","3.3.4Mones","5414","2.0","0.0"],["5297","FIGURA PLANA COLOR","15.0","12.0","3.0","1","3.3.3Figures Mones","5297","2.0","0.0"],["5312","Plats de vidre","1.8999999999999999","1.335","2.0","1","5.2.3Coca amb Llauna","5312","2.0","0.0"],["5324","cervesa llauna","1.2","1.091","4.0","1","Fredes","5324","3.0","0.0"],["2117","Callos","7.4500000000000002","4.3529999999999998","1.0","0","6.3.3Plats Cuinats","2117","2.0","1.0"],["67","Pa de Ceba","1.3500000000000001","1.05","1.0","1","4.1.1Artes\u00e0","67","1.0","0.0"],["43","Barra farina 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.1.2Pa Blanc Barres","43","1.0","0.0"],["2164","Semi Rod\u00f3 Farcit de Pernill","1.6000000000000001","0.56799999999999995","2.0","1","6.3.1Entrepans","2164","2.0","0.0"],["3954","varis  ","0.01","0.01","4.0","1","CalMoure","3954","2.0","0.0"],["1357","Crois. pernil i formatge","1.2","0.87","2.0","1","5.1.2Croissant","1357","2.0","0.0"],["1331","Ens. Xocolata","1.0","0.69999999999999996","2.0","1","5.1.3Ensaimades","1331","2.0","0.0"],["1352","Crois. Far. Xocolata","1.05","0.73499999999999999","2.0","1","5.1.2Croissant","1352","2.0","0.0"],["38","Barra 1\/2 llenya","1.3500000000000001","1.0800000000000001","1.0","1","4.1.2Pa Blanc Barres","38","1.0","0.0"],["82","Pa de Castilla","1.6000000000000001","1.28","1.0","1","4.1.1Artes\u00e0","82","1.0","0.0"],["61","Pa Xef","0.94999999999999996","0.76000000000000001","1.0","1","4.1.1Artes\u00e0","61","1.0","0.0"],["4881"," cafe cortado (Tallat)..","1.05","1.05","1.0","1","Calentes","4881","2.0","0.0"],["4883","Got de llet","0.90000000000000002","0.82599999999999996","1.0","1","Calentes","4883","2.0","0.0"],["1330","Ensaimada","0.90000000000000002","0.59399999999999997","2.0","1","5.1.3Ensaimades","1330","2.0","0.0"],["3927","Mini Reixeta crema","1.8999999999999999","1.3300000000000001","3.0","1","3.5.1Coques Sant Joan","3927","2.0","0.0"],["1210","Bra\u00e7 1\/2 Nata","6.5","4.5499999999999998","3.0","1","5.4.1Bra\u00e7os","1210","2.0","0.0"],["1211","Bra\u00e7 1\/4 Nata","5.5","3.8500000000000001","3.0","1","5.4.1Bra\u00e7os","1211","2.0","0.0"],["1105","Berlina Crema","0.94999999999999996","0.66000000000000003","2.0","1","5.5.1Berlines","1105","2.0","0.0"],["5551","Roda primavera, plata","12.0","9.5","1.0","1","5.6.2Mini","5551","2.0","0.0"],["1366","Croissant mini F.crema","10.5","7.2999999999999998","1.0","1","5.1.2Croissant","1366","1.0","0.0"],["120","Rosca Estrella ","1.3999999999999999","1.0900000000000001","1.0","1","4.8.3Sobat Rosca","120","1.0","0.0"],["1243","Mousse Fruites Bosc","15.0","10.5","2.0","1","5.4.2Mousse","1243","2.0","0.0"],["303","S.Sal Int. Barra 200g ","0.94999999999999996","0.76000000000000001","2.0","1","4.7.1Sense Sal Barra","303","1.0","0.0"],["5568","palitos Pipas paquet","1.3999999999999999","1.3999999999999999","2.0","1",null,"5568","2.0","0.0"],["1307","Brioix Mini","10.0","7.0","2.0","0","5.1.1Brioix","1307","2.0","0.0"],["405","Brt. Semi Petita","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","405","1.0","0.0"],["5871","HORCHATA","1.2","1.2","4.0","1",null,"5871","2.0","0.0"],["457","Ninot de pa","0.88","0.68999999999999995","2.0","1","4.6.3Ninots","457","2.0","0.0"],["5","Pag\u00e8s 800g","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","5","1.0","0.0"],["4896","Caf\u00e9 con hielo","1.1499999999999999","1.1499999999999999","1.0","1","Calentes","4896","1.0","0.0"],["1501","Carquinyolis, kg","15.0","12.0","2.0","0","5.7.1Galetes Postre","1501","2.0","0.0"],["3420","Virutes de Sant Josep","20.0","15.0","2.0","0","3.6.7Diada Sant Josep","3420","2.0","0.0"],["1229","Bra\u00e7 1\/2 Fruites","9.5","6.0","3.0","1","5.4.1Bra\u00e7os","1229","2.0","0.0"],["1355","Crois. Mini Artes\u00e0","12.0","9.0","2.0","0","5.1.2Croissant","1355","2.0","0.0"],["65","Pa de S\u00e8gol","1.3999999999999999","1.0900000000000001","1.0","1","4.1.1Artes\u00e0","65","2.0","0.0"],["1235","Ens. Trufa","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1235","2.0","0.0"],["2120","Truita de Patates","16.0","12.800000000000001","2.0","0","6.3.5Truites","2120","2.0","0.0"],["403","Brt. Semi Super","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","403","1.0","0.0"],["6195","Bollito nieve rizado CRU","0.68000000000000005","0.35999999999999999","1.0","1",null,"6195","1.0","0.0"],["3928"," mini Brioix-Crema","2.5","1.75","3.0","1","3.5.1Coques Sant Joan","3928","2.0","0.0"],["1112","Xuixo Nata","1.3","0.80200000000000005","2.0","1","5.5.3Xuixos","1112","2.0","0.0"],["2131","Pebrots","8.0","5.5999999999999996","2.0","0","6.3.6Verdures","2131","2.0","0.0"],["1400","Canya Crema","1.0","0.69999999999999996","2.0","1","5.6.1Canyes","1400","2.0","0.0"],["200","Int. Barra 400g","1.45","1.1599999999999999","1.0","1","4.3.1Integral Barra","200","1.0","0.0"],["5498","TURRON variado unidad","8.0","5.5999999999999996","2.0","1",null,"5498","2.0","0.0"],["69","Pa Laxant","0.65000000000000002","0.51000000000000001","1.0","1","4.1.1Artes\u00e0","69","2.0","0.0"],["3622","Mona Fruita GRAN","29.0","20.300000000000001","2.0","1","3.3.4Mones","3622","2.0","0.0"],["1792","Guapo Nata","1.7","1.1899999999999999","2.0","1","5.4.3Nata Petita","1792","2.0","0.0"],["41","Barra 1\/4 fr.","0.90000000000000002","0.71999999999999997","1.0","1","4.1.2Pa Blanc Barres","41","1.0","0.0"],["47","Baguette Neu..","1.05","0.81999999999999995","1.0","1","4.1.2Pa Blanc Barres","47","1.0","0.0"],["4884","Suc de taronja 200ml brick","1.05","1.05","1.0","1","Fredes","4884","1.0","0.0"],["1217","Bra\u00e7 1\/4 Y\/Trufa","6.0","4.2000000000000002","3.0","1","5.4.1Bra\u00e7os","1217","2.0","0.0"],["10","Pag\u00e8s 200g tallat","1.0","0.88","1.0","1","4.1.3Rodons","10","1.0","0.0"],["121","Rosca Sobada 1\/2","1.3999999999999999","1.0900000000000001","1.0","1","4.8.3Sobat Rosca","121","1.0","0.0"],["3621","Mona Nat\/Trufa GRAN","29.0","20.300000000000001","2.0","1","3.3.4Mones","3621","2.0","0.0"],["1346","Ens. Mini Xocolata","9.0500000000000007","5.9729999999999999","2.0","0","5.1.3Ensaimades","1346","2.0","0.0"],["1236","Brioix Nata","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1236","2.0","0.0"],["4757","Suc Pinya 200 ml brick","1.05","1.05","1.0","1","Fredes","4757","1.0","0.0"],["411","Frankfourt","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","411","1.0","0.0"],["504","Pa Motllo s.sal","1.8","1.3999999999999999","1.0","1","4.4.1Motllo blanc","504","1.0","0.0"],["302","S.Sal Brt. 100 g. ","0.63","0.48999999999999999","2.0","1","4.7.1Sense Sal Barra","302","1.0","0.0"],["3523","Polvorons Nevats","10.0","7.0","2.0","1","3.2.3Polvorons","3523","2.0","0.0"],["2172","Muslo pollo relleno","4.5","4.5","1.0","1","6.3.3Plats Cuinats","2172","2.0","0.0"],["5544","XAPATA PAGES","1.5","1.2","1.0","1",null,"5544","1.0","0.0"],["2145","Valencianets Farcits","1.3999999999999999","0.88300000000000001","2.0","1","6.3.1Entrepans","2145","2.0","0.0"],["2","Ratlles 800g tallades","2.2000000000000002","1.8200000000000001","1.0","1","4.1.3Rodons","2","1.0","0.0"],["3907","Coca Llardons gran","5.4000000000000004","3.7799999999999998","2.0","1","3.5.1Coques Sant Joan","3907","2.0","0.0"],["1370","Magd. Pinyons","9.0500000000000007","5.9729999999999999","2.0","0","5.1.4Magdalenes","1370","2.0","0.0"],["5453","Pa de Sant Juli\u00e0 ","0.94999999999999996","0.76000000000000001","1.0","1",null,"5453","1.0","0.0"],["3926","Mini Brioix Nata","3.2000000000000002","2.2400000000000002","3.0","1","3.5.1Coques Sant Joan","3926","2.0","0.0"],["1090","Biscuit damero (ajedrez)","12.0","8.4000000000000004","2.0","1","5.2.1Coca amb Motllo","1090","2.0","0.0"],["111","Rod\u00f3 Sobat 700g tallat","2.1000000000000001","1.74","1.0","1","4.8.2Sobat Rod\u00f3","111","1.0","0.0"],["1251","Past\u00eds Sant Marc","19.0","15.0","2.0","0","5.4.4Pastissos","1251","2.0","0.0"],["2116","Mandonguilles","12.199999999999999","5.1029999999999998","3.0","0","6.3.3Plats Cuinats","2116","2.0","0.0"],["3620","Mona Sara GRAN","29.0","20.300000000000001","2.0","1","3.3.4Mones","3620","2.0","0.0"],["1335","Ens. Cabell","1.0","0.69999999999999996","2.0","1","5.1.3Ensaimades","1335","2.0","0.0"],["4582","Farina ","1.7","1.05","1.0","0","1.2.1Derivats Pa","4582","1.0","1.0"],["4890","Coca cola","1.2","1.036","1.0","1","Fredes","4890","2.0","0.0"],["5072","brta. 100 gr.","0.57999999999999996","0.45000000000000001","1.0","1","4.1.2Pa Blanc Barres","5072","1.0","0.0"],["512","Pa Mot. Int. Petit","1.8","1.3999999999999999","1.0","1","4.4.2Motllo Integral","512","1.0","0.0"],["2135","Panadons tonyina","16.0","12.800000000000001","2.0","0","6.3.6Verdures","2135","2.0","0.0"],["2107","Pizza mini variada","15.0","12.0","2.0","0","6.3.2Pizzes","2107","2.0","0.0"],["1293","Tartaleta Flam","1.95","1.2869999999999999","2.0","1","5.4.3Nata Petita","1293","2.0","0.0"],["1716","Bra\u00e7 Ind. Trufa-","1.5","1.05","3.0","1","5.4.1Bra\u00e7os","1716","2.0","0.0"],["1325","Magd. Integrals","6.9000000000000004","4.5540000000000003","2.0","0","5.1.4Magdalenes","1325","2.0","0.0"],["5412","Mona fruita PETITA","22.0","15.4","2.0","1","3.3.4Mones","5412","2.0","0.0"],["5728","cafeteria unidad ENSAIMADA MINI","0.38","0.38","2.0","1",null,"5728","2.0","0.0"],["5336","suc de taronja natural","1.8","1.8","1.0","1","Fredes","5336","2.0","0.0"],["5940","CHUSCO MOTLLE PANSES I NOUS","2.0","1.3999999999999999","1.0","1",null,"5940","2.0","0.0"],["5360","pizza AMERICANA promocion","6.5","5.2000000000000002","2.0","1","6.2.1Pizzes Crues","5360","2.0","1.0"],["2142","Flautes Variades","1.8","0.88900000000000001","2.0","1","6.3.1Entrepans","2142","2.0","0.0"],["5490","3 croissants PROMOCIO","1.3","1.02","2.0","1","5.1.2Croissant","5490","2.0","0.0"],["1351","Crois. Xocolata","0.94999999999999996","0.66000000000000003","2.0","1","5.1.2Croissant","1351","2.0","0.0"],["36","Barra 1\/2 Curta","1.3","1.04","1.0","1","4.1.2Pa Blanc Barres","36","1.0","0.0"],["2119","Fideua","15.0","10.0","1.0","0","6.3.3Plats Cuinats","2119","2.0","1.0"],["422","Kellis","10.0","7.7999999999999998","2.0","0","4.6.1Barretes","422","2.0","0.0"],["1103","Berlina Nocilla","0.90000000000000002","0.51900000000000002","2.0","1","5.5.1Berlines","1103","2.0","0.0"],["5003","Pa Rustic","0.94999999999999996","0.76000000000000001","1.0","1","4.1.1Artes\u00e0","5003","1.0","0.0"],["3922","Coca Brioix Nocilla","9.5","6.6500000000000004","3.0","1","3.5.1Coques Sant Joan","3922","2.0","0.0"],["20","Pa Galleg Kg tallat","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","20","1.0","0.0"],["18","Pa Valls 500g tallat","1.5","1.27","1.0","1","4.1.3Rodons","18","1.0","0.0"],["3530","Roscos de Vi","10.0","7.0","2.0","0","3.2.4Roscos Nadal","3530","2.0","0.0"],["2122","Truita de Botifarra","16.0","12.800000000000001","3.0","0","6.3.5Truites","2122","2.0","0.0"],["6023","Bocadillo y bebida caliente","2.5","2.5","1.0","1","Calentes","6023","2.0","0.0"],["6361","TORRADA PERNIL   beguda","2.5","2.5","1.0","1",null,"6361","2.0","0.0"],["6369","HERRADURA CHOCOLATE  2 X 1.50 \u0080","1.5","1.05","2.0","1","5.6.3Pasta Individual","6369","2.0","0.0"],["64","Pa de Soja","1.3999999999999999","1.0900000000000001","1.0","1","4.1.1Artes\u00e0","64","1.0","0.0"],["22","Pa Galleg 200g","0.94999999999999996","0.73999999999999999","1.0","1","4.1.3Rodons","22","1.0","0.0"],["1321","Magd. Sucre","6.5","4.5499999999999998","2.0","0","5.1.4Magdalenes","1321","2.0","0.0"],["1393","Espardenya ","0.90000000000000002","0.59399999999999997","2.0","1","5.1.1Brioix","1393","2.0","0.0"],["215","Pa de Pipas","1.45","1.1599999999999999","1.0","1","4.3.3Integral Rodons","215","1.0","0.0"],["21","Pa Galleg 500g","1.6000000000000001","1.28","1.0","1","4.1.3Rodons","21","1.0","0.0"],["1350","Croissant","0.80000000000000004","0.56000000000000005","2.0","1","5.1.2Croissant","1350","2.0","0.0"],["4143","Foto Past\u00eds","6.4000000000000004","6.4000000000000004","4.0","1","1.1.5Decoraci\u00f3 Past\u00eds","4143","2.0","1.0"],["421","Flautes","0.63","0.48999999999999999","1.0","1","4.6.1Barretes","421","2.0","0.0"],["406","Brt. Col\u00b7legial","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","406","1.0","0.0"],["5028","pizza 1 promoci\u00f3","6.5","5.2000000000000002","2.0","1","6.3.2Pizzes","5028","2.0","1.0"],["2118","Espinacs amb beixamel","3.0","2.1000000000000001","3.0","1","6.3.3Plats Cuinats","2118","2.0","0.0"],["1219","Bra\u00e7 1\/4 Crema","6.5","4.5499999999999998","3.0","1","5.4.1Bra\u00e7os","1219","2.0","0.0"],["1364","c.Crois. Mini F.Salat","16.0","12.800000000000001","2.0","0","5.1.2Croissant","1364","2.0","0.0"],["1421","Delicies Crema","9.0500000000000007","5.2169999999999996","2.0","0","5.6.2Mini","1421","2.0","0.0"],["214","Int. Rod\u00f3 1\/2 s. sal","1.5","1.1699999999999999","1.0","1","4.3.3Integral Rodons","214","2.0","0.0"],["39","Barra 1\/4 llenya","0.90000000000000002","0.71999999999999997","1.0","1","4.1.2Pa Blanc Barres","39","1.0","0.0"],["301","S.Sal Barra 1\/4","0.94999999999999996","0.76000000000000001","2.0","1","4.7.1Sense Sal Barra","301","1.0","0.0"],["706","Ciabbata Baguette","0.90000000000000002","0.71999999999999997","1.0","1","4.2.1Ciabbates","706","1.0","0.0"],["4753","Cacaolat 200ml","1.25","1.087","1.0","1","Fredes","4753","1.0","0.0"],["1358","Crois. Frankfourt","1.2","0.83999999999999997","2.0","1","5.1.2Croissant","1358","2.0","0.0"],["1104","Berlina Maduixa","0.90000000000000002","0.48699999999999999","2.0","1","5.5.1Berlines","1104","2.0","0.0"],["3623","Mona artesanes Grans","22.0","15.4","2.0","1","3.3.4Mones","3623","2.0","0.0"],["3651","Figures xoco blanc SIMON COLL","29.699999999999999","20.154","3.0","0","3.3.3Figures Mones","3651","2.0","1.0"],["1100","Berlina normal","0.75","0.52500000000000002","2.0","1","5.5.1Berlines","1100","2.0","0.0"],["2147","Sandwich Int.","1.8","1.4399999999999999","2.0","1","6.3.1Entrepans","2147","2.0","0.0"],["50","Barra Pag\u00e8s Kg tallada ","2.25","1.8500000000000001","1.0","1","4.1.2Pa Blanc Barres","50","1.0","0.0"],["1281","Tortell N\/T gran","7.0","4.9000000000000004","2.0","1","5.4.6Tortells","1281","2.0","0.0"],["2162","Flautes far. Jam\u00f3n & Queso","1.8","1.1120000000000001","2.0","1","6.3.1Entrepans","2162","2.0","0.0"],["4879","Cafe","1.0","1.0","1.0","1","Calentes","4879","2.0","0.0"],["4750","Fanta llimona llauna","1.2","0.92700000000000005","1.0","1","Fredes","4750","1.0","0.0"],["412","Hamburguesa","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","412","1.0","0.0"],["513","Pa Motllo 5 cereals ","1.3500000000000001","1.05","1.0","1","4.4.2Motllo Integral","513","1.0","0.0"],["1249","Mousse 3 xocolates","15.0","10.5","2.0","1","5.4.2Mousse","1249","2.0","0.0"],["2121","Truita d\u00b4Espinacs","16.0","12.800000000000001","2.0","0","6.3.5Truites","2121","2.0","0.0"],["3520","Polvorons Ametllats","10.5","7.3499999999999996","2.0","1","3.2.3Polvorons","3520","2.0","0.0"],["2163","Semi Rod\u00f3 Farcit de Salat","1.5","0.45000000000000001","2.0","1","6.3.1Entrepans","2163","2.0","0.0"],["4","Ratlles 500g tallades","1.3","1.1399999999999999","1.0","1","4.1.3Rodons","4","1.0","0.0"],["6","Pag\u00e8s 800g tallat","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","6","1.0","0.0"],["210","Int. Rod\u00f3 1\/2 ","1.5","1.1699999999999999","1.0","1","4.3.3Integral Rodons","210","2.0","0.0"],["3912","Coca Nata\/Trufa","16.0","11.199999999999999","3.0","1","3.5.1Coques Sant Joan","3912","2.0","0.0"],["1124","Torrijas Sta. Teresa","8.0","7.407","3.0","0","5.5.2Fregit a Pes","1124","2.0","0.0"],["5761","Triangles coca de vidre","25.0","22.5","2.0","0","5.2.3Coca amb Llauna","5761","2.0","0.0"],["2149","Brtes. Col\u00b7legial far. Pernill salat","1.8","1.1120000000000001","2.0","1","6.3.1Entrepans","2149","2.0","0.0"],["1241","Mousse Xocolata","15.0","10.5","2.0","1","5.4.2Mousse","1241","2.0","0.0"],["1242","Mousse Iogurt","15.0","10.5","2.0","1","5.4.2Mousse","1242","2.0","0.0"],["1503","Pastes Te","15.0","12.0","2.0","1","5.7.1Galetes Postre","1503","2.0","0.0"],["704","Ciabbata Estirata","0.90000000000000002","0.71999999999999997","1.0","1","4.2.1Ciabbates","704","1.0","0.0"],["1120","Tronquets","9.5500000000000007","6.6849999999999996","2.0","0","5.5.2Fregit a Pes","1120","2.0","1.0"],["2171","Muslo pollo al ajillo","2.5","2.0","1.0","1","6.3.3Plats Cuinats","2171","1.0","0.0"],["2104","c.tires full nom\u00e9s Escalivada ","16.0","12.800000000000001","1.0","1","6.3.2Pizzes","2104","2.0","0.0"],["1214","Bra\u00e7 1\/2 Y\/Nata","7.5","5.25","3.0","1","5.4.1Bra\u00e7os","1214","2.0","0.0"],["1274","Tortell N\/T petit","5.0","3.5","2.0","1","3.3.2Carnestoltes","1274","2.0","0.0"],["440","Bast\u00f3 Normal petit","0.29999999999999999","0.23999999999999999","2.0","1","4.6.2Bastons","440","2.0","0.0"],["4855","Croissant GRATINAT","1.6000000000000001","1.1000000000000001","1.0","1","Salado ind.","4855","2.0","0.0"],["2170","Ensaladilla","9.5","8.0","2.0","1","6.3.3Plats Cuinats","2170","2.0","0.0"],["3924","Mini Brioix-Piny\u00f3","2.5","1.75","3.0","1","3.5.1Coques Sant Joan","3924","2.0","0.0"],["3625","Mona Massini GRAN","33.0","23.100000000000001","2.0","1","3.3.4Mones","3625","2.0","0.0"],["4769","Pa de truita","1.2","1.0","1.0","1","4.1.1Artes\u00e0","4769","1.0","0.0"],["456","N\u00famero de Pa","1.1299999999999999","0.88","1.0","1","4.6.3Ninots","456","1.0","0.0"],["3624","Mona Artesanes Petites","17.0","11.9","2.0","1","3.3.4Mones","3624","2.0","0.0"],["1420","Full Petit Especial PLATA F6","12.5","8.75","2.0","1","5.6.2Mini","1420","2.0","0.0"],["1017","Plum Cake","9.0500000000000007","6.335","2.0","0","5.2.1Coca amb Motllo","1017","2.0","0.0"],["207","Int. Baguettina ","1.0","0.80000000000000004","1.0","1","4.3.1Integral Barra","207","1.0","0.0"],["2124","Truita Xampinyons","16.0","12.800000000000001","3.0","0","6.3.5Truites","2124","2.0","0.0"],["413","Viena Llarg","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","413","2.0","0.0"],["2115","Rod\u00f3 Pavo","10.6","7.6429999999999998","3.0","0","6.3.3Plats Cuinats","2115","2.0","0.0"],["46","PA Campanya","1.1000000000000001","0.85999999999999999","1.0","1","4.1.2Pa Blanc Barres","46","1.0","0.0"],["4854","Crois. Tonyina","1.2","0.78000000000000003","1.0","1","5.7.3Salades","4854","2.0","0.0"],["37","Barra 1\/4 Curta","0.94999999999999996","0.73999999999999999","1.0","1","4.1.2Pa Blanc Barres","37","1.0","0.0"],["2136","Panadons Espinacs","16.0","12.800000000000001","2.0","0","6.3.6Verdures","2136","2.0","0.0"],["1422","Delicies Xocolata","9.0500000000000007","5.2169999999999996","2.0","0","5.6.2Mini","1422","2.0","0.0"],["5583","NESTEA llauna ","1.2","0.91000000000000003","2.0","1","Fredes","5583","2.0","0.0"],["112","Rod\u00f3 Sobat 1\/2","1.3999999999999999","1.0900000000000001","1.0","1","4.8.2Sobat Rod\u00f3","112","1.0","0.0"],["1412","Mil Fulls","1.8500000000000001","1.48","2.0","1","5.6.3Pasta Individual","1412","2.0","0.0"],["1200","Rebosteria","23.0","16.100000000000001","2.0","0","5.4.5Safata","1200","2.0","0.0"],["5533","fanta taronja llauna","1.2","0.96999999999999997","1.0","1","Fredes","5533","2.0","0.0"],["427","Mini Soja ","0.55000000000000004","0.374","1.0","1","4.6.1Barretes","427","1.0","0.0"],["311","S.Sal Rod\u00f3 1\/2 ","1.3999999999999999","1.0900000000000001","1.0","1","4.7.2Sense Sal Rod\u00f3","311","1.0","0.0"],["1000","Coca Brioix Llardons","9.1999999999999993","6.4400000000000004","3.0","1","5.2.2Coques Brioix","1000","2.0","0.0"],["1218","Bra\u00e7 1\/2 Crema","8.5","5.9500000000000002","3.0","1","5.4.1Bra\u00e7os","1218","2.0","0.0"],["1221","Bra\u00e7 1\/2 Piny\u00f3","11.0","8.0","3.0","1","5.4.1Bra\u00e7os","1221","2.0","0.0"],["1029","Tortas de C\u00f2rdova","1.0","0.80000000000000004","3.0","1","5.2.1Coca amb Motllo","1029","2.0","0.0"],["1333","Ens. Crema","1.05","0.72999999999999998","2.0","1","5.1.3Ensaimades","1333","2.0","0.0"],["506","Pa Motllo Petit","1.8","1.3999999999999999","1.0","1","4.4.1Motllo blanc","506","1.0","0.0"],["1339","Ens. Crema cremada","1.6499999999999999","1.1499999999999999","2.0","1","5.1.3Ensaimades","1339","2.0","0.0"],["1323","Magd. Poma","7.4500000000000002","4.9169999999999998","2.0","0","5.1.4Magdalenes","1323","2.0","0.0"],["2134","Alberginies Farcides","14.85","11.880000000000001","3.0","0","6.3.6Verdures","2134","2.0","0.0"],["2113","Peus de porc","7.9500000000000002","4.335","2.0","1","6.3.3Plats Cuinats","2113","2.0","0.0"],["282","int.barreta 50gr","0.53000000000000003","0.40000000000000002","2.0","1","4.3.2Integral Pe\u00e7a Petita","282","1.0","0.0"],["1328","Magd. Est. Xocolata","1.0","0.69999999999999996","2.0","1","5.1.4Magdalenes","1328","2.0","0.0"],["1345","Ens. Mini Crema","10.0","7.0","2.0","0","5.1.3Ensaimades","1345","2.0","0.0"],["19","Pa Galleg Kg","2.2999999999999998","1.8400000000000001","1.0","1","4.1.3Rodons","19","1.0","0.0"],["201","Int. Barra 200g","0.94999999999999996","0.76000000000000001","1.0","1","4.3.1Integral Barra","201","1.0","0.0"],["1712","Bra\u00e7 Ind. Crema","1.55","1.085","3.0","1","5.4.1Bra\u00e7os","1712","2.0","0.0"],["9","Pag\u00e8s 200g","1.0","0.78000000000000003","1.0","1","4.1.3Rodons","9","2.0","0.0"],["2018","c.Kellis Farcits","16.0","12.800000000000001","2.0","0","6.1.2Pica-Pica","2018","2.0","0.0"],["1730","Palo nata o trufa","1.5","1.05","2.0","1","5.4.3Nata Petita","1730","2.0","0.0"],["42","Barra farina 1\/2","1.3999999999999999","1.1200000000000001","1.0","1","4.1.2Pa Blanc Barres","42","1.0","0.0"],["1793","Guapo N\/T","1.7","1.1899999999999999","2.0","1","5.4.3Nata Petita","1793","2.0","0.0"],["1212","Bra\u00e7 1\/2 Trufa","6.5","4.5499999999999998","3.0","1","5.4.1Bra\u00e7os","1212","2.0","0.0"],["5552","Full Fruites plata F4","9.1999999999999993","6.75","2.0","1","5.6.2Mini","5552","2.0","0.0"],["1405","Canyes Xocolata Mini","0.5","0.22500000000000001","2.0","1","5.6.1Canyes","1405","2.0","0.0"],["1362","Crois. Mini","10.0","7.0","2.0","0","5.1.2Croissant","1362","2.0","0.0"],["35","Barra Gallega 1\/2","1.55","1.24","1.0","1","4.1.2Pa Blanc Barres","35","1.0","0.0"],["57","Panet de llet","0.68000000000000005","0.53000000000000003","1.0","1","4.1.2Pa Blanc Barres","57","1.0","1.0"],["5695","Bra\u00e7 indiv. crocanti trufa","1.6499999999999999","1.1499999999999999","2.0","1",null,"5695","2.0","0.0"],["2166","Entrep\u00e0 truita patata o variada","2.1000000000000001","1.357","2.0","1","6.3.1Entrepans","2166","2.0","0.0"],["3510","Tronc Nadal Petit","10.0","7.0","2.0","1","3.2.2Nadal Past\u00eds","3510","2.0","0.0"],["1401","Canya Xocolata","1.0","0.69999999999999996","2.0","1","5.6.1Canyes","1401","2.0","0.0"],["3531","Roscos An\u00eds","10.0","7.0","2.0","0","3.2.4Roscos Nadal","3531","2.0","0.0"],["3001","T.R.Massap\u00e0 petit","12.0","8.4000000000000004","3.0","1","3.4.1Tortells Reis","3001","2.0","1.0"],["415","Valencianets","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","415","2.0","0.0"],["3532","Roscos de Neu","9.5","6.5999999999999996","2.0","0","3.2.4Roscos Nadal","3532","2.0","0.0"],["113","Rod\u00f3 Sobat 1\/2 tallat","1.3999999999999999","1.1899999999999999","1.0","1","4.8.2Sobat Rod\u00f3","113","1.0","0.0"],["3925","Mini Brioix Fruita","2.5","1.75","3.0","1","3.5.1Coques Sant Joan","3925","2.0","0.0"],["2154","Pudding a peso","10.5","7.5","2.0","0","6.3.4Postres","2154","2.0","0.0"],["1511","Rosco Panses","10.0","7.0","2.0","0","5.7.2Roscos","1511","2.0","0.0"],["1012","Bis. Casol\u00e0","8.5","5.2060000000000004","2.0","1","5.2.1Coca amb Motllo","1012","2.0","0.0"],["1344","Ens. Minis","10.0","7.0","2.0","0","5.1.3Ensaimades","1344","2.0","0.0"],["212","Int. Rod\u00f3 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.3.3Integral Rodons","212","2.0","0.0"],["1329","Magdalenes Mini","10.0","7.0","2.0","0","5.1.4Magdalenes","1329","2.0","0.0"],["71","Pa Oli i Panses","1.3","1.01","1.0","1","4.1.1Artes\u00e0","71","1.0","0.0"],["3904","Coca 1\/2 Crema S.J","8.0","5.5999999999999996","2.0","1","3.5.1Coques Sant Joan","3904","2.0","0.0"],["93","Pa Osona Petit","0.94999999999999996","0.76000000000000001","1.0","1","4.1.1Artes\u00e0","93","1.0","0.0"],["94","Pa Osona Gran","1.6000000000000001","1.28","1.0","1","4.1.1Artes\u00e0","94","2.0","0.0"],["25","Pag\u00e8s Rosca 400g","1.5","1.2","1.0","1","4.1.3Rodons","25","1.0","0.0"],["102","Barra Sobada 1\/4","0.94999999999999996","0.73999999999999999","1.0","1","4.8.1Sobat Barra","102","1.0","0.0"],["1213","Bra\u00e7 1\/4 Trufa","5.5","3.8500000000000001","3.0","1","5.4.1Bra\u00e7os","1213","2.0","0.0"],["3004","Tortell Reis N\/T pet. ","15.5","10.85","3.0","1","3.4.1Tortells Reis","3004","2.0","1.0"],["1410","Orelles","0.90000000000000002","0.63","2.0","1","5.6.3Pasta Individual","1410","2.0","0.0"],["3650","Figures xoco negre  SIMON-COLL","26.5","16.960000000000001","3.0","0","3.3.3Figures Mones","3650","2.0","0.0"],["5694","Bra\u00e7 individ. crocanti nata","1.6499999999999999","1.1499999999999999","2.0","1",null,"5694","2.0","0.0"],["312","S.Sal Rod\u00f3 1\/2 tallat","1.3999999999999999","1.1899999999999999","1.0","1","4.7.2Sense Sal Rod\u00f3","312","1.0","0.0"],["1363","Crois. Mini F.Xoc","10.5","7.3499999999999996","2.0","0","5.1.2Croissant","1363","2.0","0.0"],["16","Pa Valls Kg tallat","2.2000000000000002","1.8200000000000001","1.0","1","4.1.3Rodons","16","1.0","0.0"],["417","Semi Rod\u00f3 Petit","0.47999999999999998","0.37","1.0","1","4.6.1Barretes","417","2.0","0.0"],["4100","Espelmes 1 any","0.34999999999999998","0.34999999999999998","4.0","1","1.1.4Espelmes","4100","3.0","1.0"],["4103","Espelmes n\u00fam. petit","0.75","0.75","4.0","1","1.1.4Espelmes","4103","3.0","1.0"],["3914","Reixeta Crema","7.2999999999999998","5.1100000000000003","2.0","1","3.5.1Coques Sant Joan","3914","2.0","0.0"],["1296","Tarrina Nata 1\/4","2.1499999999999999","1.419","3.0","1","5.4.3Nata Petita","1296","2.0","0.0"],["2152","Flam","0.90000000000000002","0.33900000000000002","2.0","1","6.3.4Postres","2152","2.0","0.0"],["1320","Magdalenes","6.5","4.5499999999999998","2.0","0","5.1.4Magdalenes","1320","2.0","0.0"],["3602","Bunyols Xocolata","15.0","12.0","2.0","0","3.3.1Bunyols","3602","2.0","0.0"],["1507","Murcianos","9.5","6.6500000000000004","2.0","0","5.7.1Galetes Postre","1507","2.0","0.0"],["73","Banderillas","0.65000000000000002","0.51000000000000001","1.0","1","4.1.1Artes\u00e0","73","1.0","1.0"],["1322","Magd. Far. Xocolata","6.4000000000000004","4.2240000000000002","2.0","0","5.1.4Magdalenes","1322","2.0","0.0"],["5727","cafeteria unidad MAGDALENA MINI","0.14999999999999999","0.14999999999999999","2.0","1",null,"5727","2.0","0.0"],["1257","Past\u00eds de Formatge","13.0","9.0999999999999996","2.0","1","5.4.4Pastissos","1257","2.0","0.0"],["2112","Lassanya","6.1500000000000004","3.573","2.0","0","6.3.3Plats Cuinats","2112","2.0","0.0"],["2010","c.Croquetes","16.0","12.800000000000001","2.0","0","6.1.2Pica-Pica","2010","2.0","0.0"],["2143","Flautes int. Far.","1.8","0.88900000000000001","2.0","1","6.3.1Entrepans","2143","2.0","0.0"],["1049","Coca d\u00b4Oli","9.0","7.0","2.0","0","5.2.3Coca amb Llauna","1049","2.0","0.0"],["4581","Pa Sec Sacs","1.3999999999999999","0.96899999999999997","2.0","1","1.2.1Derivats Pa","4581","2.0","0.0"],["3601","Bunyols Crema","15.0","12.0","2.0","0","3.3.1Bunyols","3601","2.0","0.0"],["612","Ciab. Mini Precuit","0.23000000000000001","0.23000000000000001","1.0","1","4.5.4Precuit Barretes","612","1.0","1.0"],["1324","Magd. Civada","6.9000000000000004","4.5540000000000003","2.0","0","5.1.4Magdalenes","1324","2.0","0.0"],["5411","MONA SARA PETITA","22.0","15.4","2.0","1","3.3.4Mones","5411","2.0","0.0"],["5164","suc pressec 200ml brick","1.05","1.05","1.0","1","Fredes","5164","1.0","0.0"],["5166","suc pressec 200 ml vidre","1.05","1.05","1.0","1","Fredes","5166","1.0","0.0"],["5171","t\u00e9","0.0","0.0","1.0","1","Calentes","5171","1.0","0.0"],["5175","TE BOLSITA","1.2","1.2","1.0","1","Calentes","5175","1.0","0.0"],["5187","kellis con ajo","11.699999999999999","7.6580000000000004","2.0","0","Chocolatines","5187","2.0","0.0"],["5180","panini gordo","2.1499999999999999","1.72","2.0","1","6.1.1Pastissos Salats","5180","2.0","0.0"],["2100","Pizza Gran Variada","16.0","12.800000000000001","1.0","0","6.3.2Pizzes","2100","2.0","0.0"],["4583","Pa Ratllat","2.1499999999999999","1.591","2.0","1","1.2.1Derivats Pa","4583","2.0","0.0"],["110","Rod\u00f3 Sobat 700g","2.1000000000000001","1.6399999999999999","1.0","1","4.8.2Sobat Rod\u00f3","110","1.0","0.0"],["2020","Voulevants salats mini","20.0","12.5","2.0","1","6.1.2Pica-Pica","2020","2.0","0.0"],["1500","Coquets","15.0","12.0","2.0","0","5.7.1Galetes Postre","1500","2.0","0.0"],["2001","c.Past\u00eds de Tonyina","16.0","12.800000000000001","2.0","0","6.1.1Pastissos Salats","2001","2.0","0.0"],["2146","Ciabbata Farcida","1.95","1.137","2.0","1","6.3.1Entrepans","2146","2.0","0.0"],["100","Barra Sobada 1\/2","1.3999999999999999","1.1100000000000001","1.0","1","4.8.1Sobat Barra","100","1.0","0.0"],["5922","CHUSCO MOTLLE CEREALS ","2.0","1.3999999999999999","1.0","1",null,"5922","2.0","0.0"],["6480","MUFFINS","1.5","1.2","2.0","1",null,"6480","2.0","0.0"],["6527","PAN QUEMAO PROMOCION 2 X 1.50 \u0080","1.5","1.2","2.0","1",null,"6527","2.0","0.0"],["3521","Mantecados Canyella","10.0","7.0","4.0","0","3.2.3Polvorons","3521","2.0","0.0"],["1353","Crois. Crema","1.05","0.73499999999999999","2.0","1","5.1.2Croissant","1353","2.0","0.0"],["404","Brt. Semi Gran","0.57999999999999996","0.45000000000000001","1.0","1","4.6.1Barretes","404","1.0","0.0"],["115","Cordov\u00e8s","1.3500000000000001","1.05","2.0","1","4.8.2Sobat Rod\u00f3","115","1.0","0.0"],["3114","Moniatos","4.2000000000000002","2.9769999999999999","2.0","1","3.1.1Panellets","3114","2.0","0.0"],["2140","Sandwich ","1.8","1.4399999999999999","2.0","1","6.3.1Entrepans","2140","2.0","0.0"],["1234","Ens. Nata","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1234","2.0","0.0"],["1239","Trena Ind. Trufa","1.3","0.85799999999999998","2.0","1","5.4.3Nata Petita","1239","2.0","0.0"],["1258","Past\u00eds amb forma","23.0","18.0","3.0","0","5.4.4Pastissos","1258","2.0","0.0"],["1426","Orejas mini","11.699999999999999","7.6050000000000004","2.0","1","5.6.2Mini","1426","2.0","0.0"],["40","Barra 1\/2 fr.","1.3","1.04","1.0","1","4.1.2Pa Blanc Barres","40","1.0","0.0"],["1300","Brioix normal","0.59999999999999998","0.41999999999999998","2.0","1","5.1.1Brioix","1300","2.0","0.0"],["3860","Mousse S. Valenti llimona","8.8499999999999996","6.1950000000000003","3.0","1","3.6.8Diada Sant Valent\u00ed","3860","2.0","0.0"],["1240","Mousse Llimona","15.0","10.5","2.0","1","5.4.2Mousse","1240","2.0","0.0"],["414","Viena Rod\u00f3","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","414","2.0","0.0"],["1244","Mousse de Wisky","15.0","10.5","2.0","1","5.4.2Mousse","1244","2.0","0.0"],["1326","Magd. Grans","5.8499999999999996","3.8610000000000002","2.0","0","5.1.4Magdalenes","1326","2.0","0.0"],["1390","Pa Cremat ","1.05","0.69299999999999995","1.0","1","5.1.1Brioix","1390","2.0","0.0"],["1042","Coca Forner Gr.","9.0","6.2999999999999998","2.0","0","5.2.3Coca amb Llauna","1042","2.0","1.0"],["1327","Magd. Estrella","0.84999999999999998","0.59499999999999997","2.0","1","5.1.4Magdalenes","1327","2.0","0.0"],["1230","Crois. Nata","1.5","0.98999999999999999","2.0","1","5.4.3Nata Petita","1230","2.0","0.0"],["418","Semi Rod\u00f3 Gran","0.53000000000000003","0.40999999999999998","1.0","1","4.6.1Barretes","418","2.0","0.0"],["1510","Roscos Vent","12.0","8.4000000000000004","2.0","0","5.7.2Roscos","1510","2.0","1.0"],["1504","Galetes Integrals","12.199999999999999","8.5399999999999991","2.0","0","5.7.1Galetes Postre","1504","2.0","1.0"],["72","Rosca d\u00b4oli 200g","1.25","0.97999999999999998","1.0","1","4.1.1Artes\u00e0","72","1.0","0.0"],["5628","AIGUA 50 CL PER EMPORTAR","0.94999999999999996","0.94999999999999996","1.0","1","Fredes","5628","1.0","0.0"],["1126","Pastisets Tortosa","10.6","7.4199999999999999","2.0","1","5.5.2Fregit a Pes","1126","2.0","0.0"],["2165","Bocadillo Jam\u00f3n Salado","2.1000000000000001","1.357","2.0","1","6.3.1Entrepans","2165","2.0","0.0"],["2144","Brtes. Col\u00b7legial Far","1.3","0.80200000000000005","2.0","1","6.3.1Entrepans","2144","2.0","0.0"],["407","Brt. Semi mini","0.47999999999999998","0.37","2.0","1","4.6.1Barretes","407","1.0","0.0"],["1","Ratlles 800g","2.2000000000000002","1.72","1.0","1","4.1.3Rodons","1","1.0","0.0"],["15","Pa Valls Kg","2.2000000000000002","1.72","1.0","1","4.1.3Rodons","15","1.0","0.0"],["3910","Coca Crema Quemada","15.0","10.5","2.0","1","3.5.1Coques Sant Joan","3910","2.0","0.0"],["13","Pag\u00e8s 2 Kg","4.2999999999999998","3.4399999999999999","1.0","1","4.1.3Rodons","13","1.0","0.0"],["304","S.Sal Int. Brt. 100g ","0.63","0.48999999999999999","2.0","1","4.7.1Sense Sal Barra","304","1.0","0.0"],["1223","Bra\u00e7 1\/2 Trufa Piny\u00f3","11.0","8.0","3.0","1","5.4.1Bra\u00e7os","1223","2.0","0.0"],["300","S.Sal Barra de 1\/2","1.45","1.1299999999999999","1.0","1","4.7.1Sense Sal Barra","300","1.0","0.0"],["1430","Fruitis","1.5","1.2","2.0","1","5.6.3Pasta Individual","1430","2.0","0.0"],["1411","Orelles Xocolata","1.0","0.69999999999999996","2.0","1","5.6.3Pasta Individual","1411","2.0","0.0"],["1205","Lioneses Variades","14.0","9.8000000000000007","3.0","0","5.4.5Safata","1205","2.0","0.0"],["2114","Macarrons","10.0","7.0","2.0","0","6.3.3Plats Cuinats","2114","2.0","0.0"],["281","Int. Barra 100g ","0.63","0.48999999999999999","1.0","1","4.3.2Integral Pe\u00e7a Petita","281","1.0","0.0"],["5172","tila","0.0","0.0","1.0","1","Calentes","5172","1.0","0.0"],["5212","Xocolatina ","0.69999999999999996","0.53800000000000003","1.0","1","Chocolatines","5212","1.0","0.0"],["211","Int. Rod\u00f3 1\/2 tallat","1.5","1.27","1.0","1","4.3.3Integral Rodons","211","1.0","0.0"],["1419","Tarta Poma Ind","1.05","0.73499999999999999","2.0","1","5.6.3Pasta Individual","1419","2.0","0.0"],["5443","Mousse individual sabores","1.95","1.6499999999999999","2.0","1","5.4.2Mousse","5443","2.0","0.0"],["6371","LAZO DE CHOCOLATE PROMOCION 2 X 1.50 \u0080","1.5","1.05","2.0","1",null,"6371","1.0","0.0"],["6385","ENSAIMADA PROMOCION 2 X1 ... 1.50 \u0080","1.5","1.05","1.0","1",null,"6385","1.0","0.0"],["6521","COCA DIJOUS GRAS verduras,sardina o butifarra,unitat","3.5","3.0","1.0","1",null,"6521","2.0","0.0"],["5964","garrafa subirat 8 l.","1.6499999999999999","1.6499999999999999","1.0","1","Fredes","5964","1.0","0.0"],["6022","Bocadillo y bebida fria","2.5","2.5","1.0","1","Fredes","6022","2.0","0.0"],["6100","Pasta individual full SENSE SUCRE","0.69999999999999996","0.69999999999999996","2.0","1",null,"6100","2.0","0.0"],["6462","NATURCAO PROMOCIO 2 X 1.50 \u0080","1.5","1.05","1.0","1",null,"6462","2.0","0.0"]]},{"id":"download_inserts","objName":"dependentes","type":"put","columns":["codi","nom","memo","telefon","adre\u00e7a","icona","hi editem horaris","tid"],"values":[["1191","pare","pare_WEB",null,null,null,"0",null],["1154","Gladys F. Garcia ","Gladys","","sabadell","","1",""],["2145","Marta Martinez","Marta Martinez","937239902","Avda Can deu 4,2\u00ba1\u00aa",null,"1",null],["2146","Montse Roca","Montse Roca","","",null,"1",null],["2097","Estrella Perez ","Estrella Perez Apera","937272599","Miguel Angel 13 2 1",null,"1",null],["2061","Soledad Martinez","Soledad Martinez","","",null,"1",null],["2147","Marta Adell Carpio","Marta Adell","931915907","Via Favencia 14 2\u00ba1\u00aa",null,"1",null],["2098","Hortensia Carmona","Hortensia Carmona","937461016","",null,"1",null],["2141","Zaira Ruz","Zaira Ruz","","",null,"1",null],["1189","josep","josep_WEB",null,null,null,"0",null],["2142","Laura Obejo","Laura Obejo","652016554","",null,"1",null],["2143","Alba","Alba","685113575","",null,"1",null],["2148","Nuria Lagunas","Nuria Lagunas","","",null,"1",null],["2139","Maria Invernon","Maria Invernon","931267247","eDUARD bROSSA, 90 BAIXOS",null,"1",null],["2123","Yolanda Romero Sakapan","YOLANDA ROMERO SAKAP","93 7240289","",null,"1",null],["1967","M\u00aa Carmen Cuevas","M\u00aa Carmen Cuevas","937450336","Walter Benjamin, 23",null,"1",null],["1990","Monica Aguilar","Monica Aguilar","635243334","",null,"1",null],["1112","Cristina Camacho","Cristina Camacho","","","","1",""],["1166","Louie Pesta\u00f1o ","Louie"," NOU 657184837","prullans, 5","","0",""],["2149","Ana Maria Murray","Ana Maria Murray","","",null,"1",null],["2051","Ana Sanchez","Ana Sanchez","937235075","Llu\u00e7anes 42 1\u00ba2\u00aa",null,"1",null],["2104","Marta Matalonga","Marta Matalonga","937163064","",null,"1",null],["1168","Monica Perez-Muelas","MONICA_WEB","937257846","","","1",""],["2150","Juan Sastre","Juan Sastre","","",null,"1",null],["2105","Estefania Pomares","Estefania Pomares","","",null,"1",null],["2124","Angeles Jimenez ","Angeles Jimenez Dardallo","","",null,"1",null],["1940","Soumaya Amalluuk","Soumaya","","",null,"1",null],["2041","Marta Boned","Marta Boned","937231122","concordia",null,"1",null],["18","Sonia Pardo Matin","Sonia P.","937173978","c\/ Tarragona","","1",""],["2050","Sara Cuevas","Sara Cuevas","937233115","",null,"1",null],["1139","Luis Collazos Marinl","Luis","937171552","Ramon Jover, 15","","0",""],["1141","Eloy Mendez","EloyMendez","937182857","99","","0",""],["2004","Emelia Anselmo ","Emelia Anselmo Pesta","","Prullans, 5 baixos",null,"1",null],["2080","Rosa Maria Pintado","Rosa Maria Pintado","","Can Viloca 39 5 2",null,"1",null],["1147","Emilio","Emilio","937173233","1","","0",""],["1151","Pepe Martinez","pepe","937176438","1","","0",""],["1152","Antonio Hernandez","q","937257846","1","","0",""],["1176","Maribel Andres Matas","Maribel","931914074","",null,"1",null],["2057","Meri Lopez","Meri Lopez","666392215","",null,"1",null],["1955","Conchi Guillen","Conchi Guillen","","",null,"0",null],["2082","Judith Pardo","Judith Pardo","","",null,"1",null],["2059","Erika Corpas","Erika Corpas","937235720","",null,"1",null],["2083","Maria Martinez","Maria Martinez","","",null,"1",null],["2086","Erney","Erney","","",null,"0",null],["1213","Esther Pujala","Esther Pujala","937233760","93 7161084",null,"1",null],["103","Dana","Dana","937804610","932257940","","1",""],["2134","Judit Pasalodos","Judit Pasalodos","","Baltarga,13 1\u00ba3\u00aa",null,"1",null],["2091","Paqui Linero","Paqui Linero","937243095","Josep Pla 76",null,"1",null],["1197","Sofia Garcia","Sofia","616851074","",null,"1",null],["1184","Carles Bosch","Carles Bosch_WEB","937257846","",null,"0",null],["1216","Patri Melero","Patri","937179388","",null,"1",null],["1208","Natalia Pellicer","Natalia","665610214","",null,"1",null],["1903","susana","susana_WEB","","",null,"0",null],["1904","Edwin  Wilber Rojas ","Edwin","662636985","",null,"0",null],["1183","ANNA","ANNA_WEB","","",null,"0",null],["1991","OLGA","Olga Soto","610858662","",null,"1",null],["1215","Josep Bosch Maso ","Josep Bosch Maso_WEB","937237039","Andorra, 24",null,"1",null],["1008","Antonio Romero","Toni","937165274","","","0","1803401ROAR0660108009^ANTONIO ROMERO ARANDA         ^  ^991^0304^0000000000^8034016251180660108009=0"],["1010","Leandro Sastre","Leandro","937234821","1","","0","1803401SAMO0610505001^LEANDRO SASTRE MORATON        ^  ^931^1196^0000000000^8034016414750610505001=0"],["1958","Pilar Cano","Pilar Cano","937209212","",null,"1",null],["1039","Graciela Lencina","Graciela","937278419","Montserrat, 48 bajos  ","","1",""],["1984","Mayra Mariela Solis","Mayra Mariela Solis","","J.Aparici,25 4\u00ba2\u00aa",null,"1",null],["2114","Jessica Velasco","Jessica","","",null,"1",null],["1100","Marleny Quintero","Marleny","937171552","","","1",""],["1156","Amancio","Amancio","937118260","sabadell.","","0",""],["1157","Maria Jesus Carpio","1","1","sabadell","","0",""],["1009","Jose Castillo","Jose","937238696","1","","0","1803401CAVE0700708005^JOSE ANTONIO CASTILLO VERA    ^  ^991^0704^0000000000^8034011617350700708005=0"],["2019","Sarita Caceres Garcia","Sarita Caceres Garci","","",null,"1",null],["2067","Lidia Armengol","Lidia Armengol","937273254","algersuariPascual51",null,"1",null],["12","Encarna Sanchez ","Encarna","937106737","Elcano, 11  ","BITER PRIMERA.ICO","1",""],["31","Mari Garcia Ramos","Mari","937177456","Collsalarca228 6\u00ba2\u00aa","PA NATURAL PRIMERA.ICO","1",""],["1005","Antonio Vilchez Mu\u00f1o","Antonio","937166742","Asam.Cataaluny","","0","1803401VIMU0700906007^ANTONIO VILCHEZ MU#EOZ         ^  ^981^0603^0000000000^8034017394810700906007=0"],["1965","Chari Rubio","Chari Rubio","937165151","",null,"1",null],["2109","Ana Fernandez","Ana Fernandez","","",null,"1",null],["1949","Celia Botella","Celia_WEB","","Smirna, 5",null,"1",null],["1084","Pila Maso","Pila Mas","937104645","Elcano, 25","","1",""],["2024","Maravillas Botella","Maravillas ","637923222","",null,"1",null],["2122","Gemma Alcaraz","Gemma Alcaraz","937172426","",null,"1",null],["2095","Teresa Cordova Yauri","Teresa Cordova Yauri","608420457","",null,"0",null],["1158","Maria del Mar ","M Mar","937184483","Barbera","","1",""],["1951","Anabel Lozano","Anabel_WEB","937242476","Roma, 1",null,"1",null],["60","Lidia Pareja","Lidia ","","Granja del Pas, 18.","","1",""],["1148","Isidoro","sidoro_WEB","937101200","1","","0",""],["2103","Montse Sanroma","Montse Sanroma","","",null,"1",null],["2035","Dolores Hallado","Dolores Hallado","652970887","",null,"1",null],["2020","Janet Caceres Garcia","Janet Caceres Garcia_WEB","","",null,"1",null],["2033","Josefina Nicolas","Josefina Nicolas","931911028","NORTE 8 B 7 4",null,"1",null],["1150","Tutusaus Josep Maria","q","937169363","1","","0",""]]},{"id":"download_inserts","objName":"dependentesExtes","type":"put","columns":["id","nom","valor"],"values":[["1005","PASSWORD",""],["1005","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1008","PASSWORD",""],["1008","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1009","PASSWORD",""],["1009","TIPUSTREBALLADOR","PRODUCCIO"],["1010","PASSWORD",""],["1010","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["103","PASSWORD",""],["103","TIPUSTREBALLADOR","DEPENDENTA"],["1039","PASSWORD",""],["1039","TIPUSTREBALLADOR","DEPENDENTA"],["1084","TIPUSTREBALLADOR","DEPENDENTA"],["1100","PASSWORD",""],["1100","TIPUSTREBALLADOR","DEPENDENTA"],["1112","PASSWORD",""],["1112","TIPUSTREBALLADOR","DEPENDENTA"],["1139","PASSWORD",""],["1139","TIPUSTREBALLADOR","REPARTIDOR"],["1141","PASSWORD",""],["1141","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1147","PASSWORD",""],["1147","TIPUSTREBALLADOR","REPARTIDOR"],["1148","PASSWORD",""],["1148","TIPUSTREBALLADOR","AUXILIAR"],["1150","PASSWORD",""],["1150","TIPUSTREBALLADOR","REPARTIDOR"],["1151","PASSWORD",""],["1151","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1152","PASSWORD",""],["1152","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1154","PASSWORD",""],["1154","TIPUSTREBALLADOR","PRODUCCIO"],["1156","PASSWORD",""],["1156","TIPUSTREBALLADOR","PASTISSER\/FORNER"],["1157","PASSWORD",""],["1157","TIPUSTREBALLADOR","AUXILIAR"],["1158","PASSWORD",""],["1158","TIPUSTREBALLADOR","DEPENDENTA"],["1166","PASSWORD",""],["1166","TIPUSTREBALLADOR","NETEJA"],["1168","PASSWORD",""],["1168","TIPUSTREBALLADOR","ADMINISTRACIO"],["1176","PASSWORD",""],["1176","TIPUSTREBALLADOR","DEPENDENTA"],["1183","PASSWORD","marta"],["1183","TIPUSTREBALLADOR","GERENT_2"],["1184","PASSWORD","monica"],["1184","TIPUSTREBALLADOR","GERENT"],["1189","PASSWORD","pep"],["1189","TIPUSTREBALLADOR","GERENT"],["1191","PASSWORD","daina"],["1191","TIPUSTREBALLADOR","GERENT"],["1197","PASSWORD",""],["1197","TIPUSTREBALLADOR","DEPENDENTA"],["12","PASSWORD",""],["12","TIPUSTREBALLADOR","DEPENDENTA"],["1208","TIPUSTREBALLADOR","DEPENDENTA"],["1213","PASSWORD",""],["1213","TIPUSTREBALLADOR","DEPENDENTA"],["1215","PASSWORD",""],["1215","TIPUSTREBALLADOR","GERENT"],["1216","PASSWORD",""],["1216","TIPUSTREBALLADOR","DEPENDENTA"],["18","PASSWORD",""],["18","TIPUSTREBALLADOR","DEPENDENTA"],["1903","PASSWORD","sus"],["1903","TIPUSTREBALLADOR","GERENT_2"],["1904","PASSWORD",""],["1904","TIPUSTREBALLADOR","REPARTIDOR"],["1940","PASSWORD",""],["1940","TIPUSTREBALLADOR","DEPENDENTA"],["1949","PASSWORD",""],["1949","TIPUSTREBALLADOR","DEPENDENTA"],["1951","PASSWORD",""],["1951","TIPUSTREBALLADOR","DEPENDENTA"],["1955","PASSWORD",""],["1955","TIPUSTREBALLADOR","AUXILIAR"],["1958","PASSWORD",""],["1958","TIPUSTREBALLADOR","DEPENDENTA"],["1965","PASSWORD",""],["1965","TIPUSTREBALLADOR","DEPENDENTA"],["1967","PASSWORD",""],["1967","TIPUSTREBALLADOR","DEPENDENTA"],["1984","PASSWORD",""],["1984","TIPUSTREBALLADOR","DEPENDENTA"],["1990","PASSWORD",""],["1990","TIPUSTREBALLADOR","DEPENDENTA"],["1991","PASSWORD",""],["1991","TIPUSTREBALLADOR","DEPENDENTA"],["2004","PASSWORD",""],["2004","TIPUSTREBALLADOR","NETEJA"],["2019","PASSWORD",""],["2019","TIPUSTREBALLADOR","DEPENDENTA"],["2020","PASSWORD","janet"],["2020","TIPUSTREBALLADOR","ADMINISTRACIO"],["2024","PASSWORD",""],["2024","TIPUSTREBALLADOR","DEPENDENTA"],["2033","PASSWORD",""],["2033","TIPUSTREBALLADOR","DEPENDENTA"],["2035","PASSWORD",""],["2035","TIPUSTREBALLADOR","DEPENDENTA"],["2041","PASSWORD",""],["2041","TIPUSTREBALLADOR","DEPENDENTA"],["2050","PASSWORD",""],["2050","TIPUSTREBALLADOR","DEPENDENTA"],["2051","PASSWORD",""],["2051","TIPUSTREBALLADOR","DEPENDENTA"],["2057","PASSWORD",""],["2057","TIPUSTREBALLADOR","DEPENDENTA"],["2059","PASSWORD",""],["2059","TIPUSTREBALLADOR","DEPENDENTA"],["2061","PASSWORD",""],["2061","TIPUSTREBALLADOR","DEPENDENTA"],["2067","PASSWORD",""],["2067","TIPUSTREBALLADOR","DEPENDENTA"],["2080","PASSWORD",""],["2080","TIPUSTREBALLADOR","DEPENDENTA"],["2082","PASSWORD",""],["2082","TIPUSTREBALLADOR","DEPENDENTA"],["2083","PASSWORD",""],["2083","TIPUSTREBALLADOR","DEPENDENTA"],["2086","PASSWORD",""],["2086","TIPUSTREBALLADOR","PRODUCCIO"],["2091","PASSWORD",""],["2091","TIPUSTREBALLADOR","DEPENDENTA"],["2095","PASSWORD",""],["2095","TIPUSTREBALLADOR","PRODUCCIO"],["2097","PASSWORD",""],["2097","TIPUSTREBALLADOR","DEPENDENTA"],["2098","PASSWORD",""],["2098","TIPUSTREBALLADOR","DEPENDENTA"],["2103","PASSWORD",""],["2103","TIPUSTREBALLADOR","DEPENDENTA"],["2104","PASSWORD",""],["2104","TIPUSTREBALLADOR","DEPENDENTA"],["2105","PASSWORD",""],["2105","TIPUSTREBALLADOR","DEPENDENTA"],["2109","PASSWORD",""],["2109","TIPUSTREBALLADOR","DEPENDENTA"],["2114","PASSWORD",""],["2114","TIPUSTREBALLADOR","DEPENDENTA"],["2122","PASSWORD",""],["2122","TIPUSTREBALLADOR","DEPENDENTA"],["2123","PASSWORD",""],["2123","TIPUSTREBALLADOR","DEPENDENTA"],["2124","PASSWORD",""],["2124","TIPUSTREBALLADOR","DEPENDENTA"],["2134","PASSWORD",""],["2134","TIPUSTREBALLADOR","DEPENDENTA"],["2139","PASSWORD",""],["2139","TIPUSTREBALLADOR","DEPENDENTA"],["2141","PASSWORD",""],["2141","TIPUSTREBALLADOR","DEPENDENTA"],["2142","PASSWORD",""],["2142","TIPUSTREBALLADOR","DEPENDENTA"],["2143","PASSWORD",""],["2143","TIPUSTREBALLADOR","DEPENDENTA"],["2145","PASSWORD",""],["2145","TIPUSTREBALLADOR","DEPENDENTA"],["2146","PASSWORD",""],["2146","TIPUSTREBALLADOR","DEPENDENTA"],["2147","PASSWORD",""],["2147","TIPUSTREBALLADOR","DEPENDENTA"],["2148","PASSWORD",""],["2148","TIPUSTREBALLADOR","DEPENDENTA"],["2149","PASSWORD",""],["2149","TIPUSTREBALLADOR","DEPENDENTA"],["2150","PASSWORD",""],["2150","TIPUSTREBALLADOR","FORNER"],["31","PASSWORD",""],["31","TIPUSTREBALLADOR","DEPENDENTA"],["60","PASSWORD",""],["60","TIPUSTREBALLADOR","DEPENDENTA"]]},{"id":"download_inserts","objName":"families","type":"put","columns":["nom","pare","nivell","estatus","utilitza"],"values":[[" Amanides","Article","1",null,null],["01 Pa:","Article","1","4","0"],["02 Pastisseria","Article","1","4","1"],["03 Cafeteria","Article","1","4",""],["04 Diades","Article","1","4","3"],["05 Accessoris","Article","1","4","9"],["06 Altres","Article","1","",""],["1.1.1Blondes","Cartronatge","3","4","0"],["1.1.2Bosses","Cartronatge","3","4","12"],["1.1.3Caixes","Cartronatge","3","4","34"],["1.1.4Espelmes","Cartronatge","3","4","5"],["1.1.5Decoraci\u00f3 Past\u00eds","Cartronatge","3","4","9"],["1.1.6Neteja","Cartronatge","3","4","6"],["1.1.7Paper","Cartronatge","3","4","7"],["1.1.8Plats i Safates","Cartronatge","3","4","8"],["1.2.1Derivats Pa","Mat\u00e8ries Primes","3","4","23"],["1.2.2Gelats","Mat\u00e8ries Primes","3","4","67"],["1.2.3M\u00e0nigues","Mat\u00e8ries Primes","3","4","45"],["1.2.4Mat.Prim.B\u00e0siques","Mat\u00e8ries Primes","3","4","89"],["3.1.1Panellets","Castanyada","3","4","1"],["3.2.1Nadal Pans","Nadal","3","4","0"],["3.2.2Nadal Past\u00eds","Nadal","3","4","1"],["3.2.3Polvorons","Nadal","3","4","2"],["3.2.4Roscos Nadal","Nadal","3","4","3"],["3.2.5Torrons","Nadal","3","4","4"],["3.3.1Bunyols","Quaresma","3","4","0"],["3.3.2Carnestoltes","Quaresma","3","4","1"],["3.3.3Figures Mones","Quaresma","3","4","56"],["3.3.4Mones","Quaresma","3","4","234"],["3.4.1Tortells Reis","Reis","3","4","01"],["3.5.1Coques Sant Joan","Sant Joan","3","4","0123"],["3.6.1Diada Mare","Santos","3","4","3"],["3.6.2Diada Montserrat","Santos","3","4","4"],["3.6.3Diada Sant Antoni","Santos","3","4","9"],["3.6.4Diada Sant Blai","Santos","3","4","0"],["3.6.5Diada Sant Honorat","Santos","3","4","1"],["3.6.6Diada Sant Jordi","Santos","3","4","5"],["3.6.7Diada Sant Josep","Santos","3","4","2"],["3.6.8Diada Sant Valent\u00ed","Santos","3","4","68"],["3.6.9Diada Sta Teresa","Santos","3","4","7"],["4.1.1Artes\u00e0","Blanc","3","4","6789"],["4.1.2Pa Blanc Barres","Blanc","3","4","345"],["4.1.3Rodons","Blanc","3","4","012"],["4.2.1Ciabbates","Ciabbates.","3","4","0"],["4.3.1Integral Barra","Integrals","3","4","0"],["4.3.2Integral Pe\u00e7a Petita","Integrals","3","4","89"],["4.3.3Integral Rodons","Integrals","3","4","1"],["4.4.1Motllo blanc","Motllo","3","4","0"],["4.4.2Motllo Integral","Motllo","3","4","1"],["4.4.3Motllo Pag\u00e8s","Motllo","3","4","2"],["4.5.1Cru Barres","No Cuit","3","4","2"],["4.5.2Cru Barretes","No Cuit","3","4","3"],["4.5.3Precuit Barres","No Cuit","3","4","0"],["4.5.4Precuit Barretes","No Cuit","3","4","1"],["4.6.1Barretes","Paneteria","3","4","0123"],["4.6.2Bastons","Paneteria","3","4","4"],["4.6.3Ninots","Paneteria","3","4","5"],["4.6.4Paneteria Coques","Paneteria","3","4","6"],["4.7.1Sense Sal Barra","Sense Sal","3","4","0"],["4.7.2Sense Sal Rod\u00f3","Sense Sal","3","4","1"],["4.8.1Sobat Barra","Sobats","3","4","0"],["4.8.2Sobat Rod\u00f3","Sobats","3","4","1"],["4.8.3Sobat Rosca","Sobats","3","4","2"],["5.1.1Brioix","Bolleria","3","4","019"],["5.1.2Croissant","Bolleria","3","4","56"],["5.1.3Ensaimades","Bolleria","3","4","34"],["5.1.4Magdalenes","Bolleria","3","4","2"],["5.2.1Coca amb Motllo","Coques","3","4","1239"],["5.2.2Coques Brioix","Coques","3","4","06"],["5.2.3Coca amb Llauna","Coques","3","4","4"],["5.2.4Past\u00eds Pe\u00e7a Petita","Coques","3","4","5"],["5.3.1Bolleria Crua","Cru","3","4","678"],["5.3.2Coques Crues","Cru","3","4","1235"],["5.3.3Mini Crus","Cru","3","4","04"],["5.4.1Bra\u00e7os","Fred","3","4","12"],["5.4.2Mousse","Fred","3","4","4"],["5.4.3Nata Petita","Fred","3","4","39"],["5.4.4Pastissos","Fred","3","4","56"],["5.4.5Safata","Fred","3","4","0"],["5.4.6Tortells","Fred","3","4","78"],["5.5.1Berlines","Fregit","3","4","0"],["5.5.2Fregit a Pes","Fregit","3","4","2"],["5.5.3Xuixos","Fregit","3","4","1"],["5.6.1Canyes","Full","3","4","0"],["5.6.2Mini","Full","3","4","2"],["5.6.3Pasta Individual","Full","3","4","13"],["5.6.4Placa","Full","3","4","4"],["5.7.1Galetes Postre","Galetes","3","4","0"],["5.7.2Roscos","Galetes","3","4","1"],["5.7.3Salades","Galetes","3","4","2"],["6.1.1Pastissos Salats","Aperitius","3","4","0"],["6.1.2Pica-Pica","Aperitius","3","4","12"],["6.2.1Pizzes Crues","Cru.","3","4","0"],["6.3.1Entrepans","Entrants","3","4","46"],["6.3.2Pizzes","Entrants","3","4","0"],["6.3.3Plats Cuinats","Entrants","3","4","178"],["6.3.4Postres","Entrants","3","4","5"],["6.3.5Truites","Entrants","3","4","2"],["6.3.6Verdures","Entrants","3","4","3"],["Aperitius","06 Altres","2","4","0"],["Article","","0","0"," "],["AutoAsignats","06 Altres","2","",""],["Bebidas","Productes Tercers","3","4",""],["Begudes","03 Cafeteria","2","4",""],["Begudes.","article","1",null,null],["Blanc","01 Pa:","2","4","0"],["Bolleria","02 Pastisseria","2","4","3"],["Brioxeria","Article","1",null,null],["Calentes","Begudes","3","4",""],["CalMoure","AutoAsignats","3","",""],["Cartronatge","05 Accessoris","2","4","01"],["Castanyada","04 Diades","2","4","1"],["Catering","Article","1",null,null],["Chocolatines","Revenda","3","4","2"],["Ciabbates.","01 Pa:","2","4","7"],["Congelat barres","No Cuit","3","4","45"],["Coques","02 Pastisseria","2","4","0"],["Coques.","Article","1",null,null],["Cru","02 Pastisseria","2","4","6"],["Cru.","06 Altres","2","4","2"],["Cuina","Article","1",null,null],["Entrants","06 Altres","2","4","1"],["Especialitats temporals","Article","1",null,null],["Fred","02 Pastisseria","2","4","27"],["Fredes","Begudes","3","4",""],["Fregit","02 Pastisseria","2","4","1"],["Full","02 Pastisseria","2","4","4"],["Galetes","02 Pastisseria","2","4","5"],["Integrals","01 Pa:","2","4","2"],["Liquits","Revenda","3","4","0"],["materiales","article","1",null,null],["Mat\u00e8ries Primes","05 Accessoris","2","4","56"],["Motllo","01 Pa:","2","4","5"],["Nadal","04 Diades","2","4","5"],["No Cuit","01 Pa:","2","4","6"],["Paneteria","01 Pa:","2","4","4"],["papel","materiales","2",null,null],["Pastas","Productes Tercers","3","4",""],["Productes Tercers","05 Accessoris","2","4",""],["Quaresma","04 Diades","2","4","6"],["Reis","04 Diades","2","4","0"],["Revenda","05 Accessoris","2","4","9"],["Salado ind.","Productes Tercers","3","4",""],["Sant Joan","04 Diades","2","4","9"],["Santos","04 Diades","2","4","3478"],["Sense Sal","01 Pa:","2","4","3"],["Sobats","01 Pa:","2","4","1"],["Surtido","Productes Tercers","3","4",""],["Velas","Productes Tercers","3","4",""],["Xocolata","Article","1",null,null]]},{"id":"download_inserts","objName":"conceptosEntrega","type":"put","columns":["tipo","texto"],"values":[["O","Entrega Di\u00e0ria"],["O","Hores"],["A","Entrada de Canvi"]]},{"id":"download_inserts","objName":"codisBarres","type":"put","columns":["codi","producte"],"values":[["8410507504437","10046"],["8412201000130","5175"],["8412147150012","5220"],["8412945454510","5197"],["4892169000320","4104"],["8410128001681","4957"],["8416400888131","5262"],["8424372021555","5096"],["5449000050205","4801"],["54491472","5272"],["5449000006271","5273"],["0","6625"],["8410507504444","4759"],["8413907906009","3650"],["8413907409005","3651"],["646587","5143"],["5449000000996","4890"],["55555","73"],["8411002101305","3928"]]},{"objName":"_downloadSync","type":"put","columns":["table","serverSync","debugServerDatetime"],"values":[["articles","2015-09-03 21:09:24.687","2015-09-03 23:09:24.687"],["dependentes","2015-09-03 21:09:25.340","2015-09-03 23:09:25.340"],["dependentesExtes","2015-09-03 21:09:25.640","2015-09-03 23:09:25.640"],["families","2015-09-03 21:09:25.997","2015-09-03 23:09:25.997"],["conceptosEntrega","2015-09-03 21:09:26.417","2015-09-03 23:09:26.417"],["codisBarres","2015-09-03 21:09:26.660","2015-09-03 23:09:26.660"]]},{"objName":"_downloadSync","id":"downloadSync_UD","type":"get","columns":["table","serverSync"]}]}]}');
//tsc_test2_2
		var msg = JSON.parse('{"gtpv":["server",1],"clientInfo":{"idCom":"1002055e8b417abffd6.75747588","prefijoCliente":"tsc_test2__","Llicencia":"1.0"},"session":"synchronize","communication":60}');		
		console.log(msg);
		var ret = processResponse(msg);
		console.log(ret);
	}
}
	
//	return my;
//}();

/*var callbackReloadDBCom = function() {
	var my = {};
	var callbackFunctions = [];
	my.add = function(f) {
		if (callbackFunctions.indexOf(f) == -1) 
			callbackFunctions.push(f);	
	}
	my.run = function() {
		for (var i=0; i<callbackFunctions.length; i++) {
			callbackFunctions[i]();
		}
	}
	return my;
}();
*/
