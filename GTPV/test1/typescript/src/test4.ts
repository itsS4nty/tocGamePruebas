/// <reference path="httpServer.ts" />

HttpServer.create("",1,[],()=>{});

		function u() {
			var t=1;
			class o {
				h() { return t++; };	
			}
			return new o();
		}
		
		var jj = u();
		jj.h();

function jjjjj() {
	function hola() {
		return 1;
	}
	function adios(d:number) {
		return ""+d;
	}
	return {
		hola,
		adios
	}
}

interface hhhh {
	(...rest:any[]) : any
}

function kkk1(n:number) { return n+1; }

var fff1:hhhh = kkk1

fff1(1,2);

var x = (a: number) => 0;
var y = (b: number, s: string) => 0;

y = x; // OK
x = y; // Error

//var tt1 = 


module mj {
	export function g() { return 1; }
}

var rr1 = { d:1,f:2}
for (name1 in rr1) {}

interface ddd1 {
	[p:string] : string;
}

var sd1:ddd1

var sd2 = { e: "n" }

sd1 = sd2

interface IFoo{
    bar:string;
    baz:string;
    boo:string;     
}

// How I tend to intialize 
var foo:IFoo = <number>{};

foo.bar = "asdf";
foo.baz = "boo";
foo.boo = "boo";

// the following is an error, 
// so you haven't lost type safety
foo.bar = 123; 

function isMap<T>(obj: { [n: string]: T }) { return obj; }

var m = isMap({x: 3, y: 5});
m['foo'] = 'bar'; // Error
m['foo'] = 42; // OK