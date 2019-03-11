class C12 {
	protected t=1;
	h=2;
}

var v1 = new C12();

interface r1 {
	e:number;
	d:string;
}

var t:r1;

t= <r1>{ "e":1 };
var uu = {"f":1}

t = <r1>{};

var nn = new Boolean();

nn.hasOwnProperty("kk");
nn.toString();


var hhh= C12.prototype.h;

class d1 {
	static d() {
		return this;
	}
}

<T>(a:T) => { return Array<T>(); }

var f11 : ((a?:number, b?:number) => number);
f11 = function(a:number,b:number) { return a+b; }

f11();
 
var ww1: {
	[a:number] : boolean
} = [true];

var d = C12

var a1:any;

var t11 = ww1[a1];

var ggg1 = { a: 1, b:"rr"}

interface iggg2 { a: number }

var ggg2 = <iggg2>ggg1
var ggg4 = { c:1}
var ggg6:any;
var ggg66 = <iggg2>ggg6;

function fff1(a:string):string;
function fff1(a:number):string;
function fff1(a:any) {
	if (a === "div") return "rr";
	else return a;
}

interface dd {
	fff1(a:"div"):number;
	fff1(a:"number"):string;
	fff1(a:string)
	
}
function	fff2(a:"div"):string;
function	fff2(a:"div2"):string;
function 	fff2(a:string) { return "e"; }

var fff3 : {
	(a:"div") : number;
	(a:"number") : string;
	(a:string) : any;
} = (a:string) => {
	return "ff"
}

function attr(name: string): string;
function attr(name: string, value: string): number;
function attr(map: any): number;
/*function attr(nameOrMap: any, value?: string): any {
 if (nameOrMap && typeof nameOrMap === "string") {
 // handle string case
 }
 else {
 // handle map case
 }
}
*/

var ccc = document.createElement("div");
var s:string = "div";
var ddd = document.createElement(s);