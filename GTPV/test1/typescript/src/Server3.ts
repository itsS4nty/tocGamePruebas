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
			console.log("sandboxonload 0");
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
			function deconstructValue(val: any) {
				if (!columns) return val;
				if ((val == null) || (typeof val !== "object")) return null;
				return columns.map(function(col) {
					if (col == null) return null;
					return val[col];
				});	
			}
			function cleanOutErrors() {
				if (outSubtr.errors && (outSubtr.errors.length == 0)) delete outSubtr.errors;
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
									if (i == values.length-1) cleanOutErrors();
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
					
					if (type === "get") outSubtr.columns = columns;
					
					if (!noValues) outSubtr.values = [];
					if (withKeys) outSubtr.keys = [];
					if (withPrimaryKeys) outSubtr.primaryKeys = [];

					outSubtr.errors = [];
	
					var fOpenKeyCursor = (noValues && index && (type === "get"));
					
					iterateKeys(0);

					function iterateKeys(iKey: number) {
						if (iKey == keys.length) {
							cleanOutErrors();
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
												outSubtr.values.push(deconstructValue(val));
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

		var columns = servSubtr.columns;
		
		function deconstructValue(val: any) {
			if (!columns) return val;
			if ((val == null) || (typeof val !== "object")) return null;
			return columns.map(function(col) {
				if (col == null) return null;
				return val[col];
			});	
		}
		function cleanOutErrors() {
			if (outSubtr.errors && (outSubtr.errors.length == 0)) delete outSubtr.errors;
		}
				
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
												cleanOutErrors();
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
									cleanOutErrors();
									end(tr, null);
								}
							}	// if (i == pendingSubtr.length-1)
						}); // funFilter
					}); // funModify
				} // for (var i=0; i<pendingSubtr.length; i++) 
				break;
			case "get":
				var funModify = createModify(modify, "val", "key", "pk");
				var funFilter = createFilter(filter, "val", "key", "pk");
				for (var i=0; i<pendingSubtr.length; i++) {
					var [val, key, primaryKey] = pendingSubtr[i];

					funModify(val, key, primaryKey, i, function(val: any, key: any, primaryKey: any, i: number) {
						funFilter(val, key, primaryKey, function (accepted: boolean) {
							if (accepted) {
								if (outSubtr.values) 
									outSubtr.values.push(deconstructValue(val));
								if (outSubtr.keys) 
									outSubtr.keys.push(key);
								if (outSubtr.primaryKeys) 
									outSubtr.primaryKeys.push(primaryKey);
							}
							if (i == pendingSubtr.length-1) {
								cleanOutErrors();
								end(<any>true, null); // no hay transaction pero operación correcta, ya se creara
							}	
						});
					});		
				}
				break;
		} // switch(type)
	}

	
	export function debug_pr() {
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
