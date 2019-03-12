module D {
	export interface articleDB {
		codi: number;
		nom: string;
		preu: number;
		esSumable: boolean;
		familia: string;
	}
	
	export interface article extends articleDB {
		compareNom: string;
		idxFamilia: number;	
		lowerNom: string;
	}
	
	export interface familiaDB {
		nom: string;
		pare: string;
		nivell: number;
	}
	
	export interface familia extends familiaDB {
		idxPare?: number;
		subfamilies?:number[];
		articles?:number[];
	}
	
	export interface codiBarres {
		codi: number;
		producte: number;
	}
	
	export interface dependentaDB {
		codi: number;
		nom: string;
	}

	export interface dependenta extends dependentaDB {
//		password: string;
		noPassword: boolean;
//		tipusTreballador: string;
		esResponsable: boolean;
		compareNom: string;
	}
	
	export interface dependentaExtes {
		id: number;
		nom: string;
		valor: string;
	}
	
	var cfc_testChars    = "àáäèéëìíïòóöùúüñç";
	var cfc_replaceChars = "aaaeeeiiiooouuunc";
	var cfc_regExp = new RegExp("["+cfc_testChars+"]");
	var cfc_toChar = {};
	cfc_testChars.split("").forEach((c, i) => cfc_toChar[c] = cfc_replaceChars[i]);

	export function conversionForCompare(nom:string) {
		return nom.toLowerCase().replace(cfc_regExp, (s) => {return cfc_toChar[s];});
	}
}