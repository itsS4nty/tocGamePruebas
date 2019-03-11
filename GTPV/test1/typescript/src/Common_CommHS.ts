module Common_CommHS {
	export interface REQ_MSG {
		tsInit: number;
		idSat: string;
		ts: number;
		seq: number;
	}
	export interface RESP_MSG {
		ts: number;
		error?: string;
	}
	export interface SH_REQ_MSG extends REQ_MSG {
		s_quest: QUEST[];		
	}
	export interface SH_RESP_MSG extends RESP_MSG {
		h_answ: ANSW[];
	}
	export interface HS_RESP_MSG extends RESP_MSG {
		h_quest?: QUEST[];
	} 
	export interface HS_REQ_MSG extends REQ_MSG {
		s_answ: ANSW[];
	}

	export interface SendRespMsg {
		( respMsg?: RESP_MSG ) : void;
	}
	
	export interface QUEST extends ANSW{
		type: string;
		age?: number;
		idRObj?: string; 
		funcName?: string;
		args?: any[];
		script?: string;
		tsInit?: number;
	}
	export interface ANSW {
		ret?: any;
		er?: string;
		asyncAge?: number;
//		age?: number;
		asyncId?: number;
	}
	export var TYPE_QUEST = {
		func: "func",
		create: "create",
		script: "script",
		init: "init",
		async: "async",
		destroy: "destroy"
	}
}