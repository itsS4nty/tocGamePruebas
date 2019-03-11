module mmm11 {
	interface EXString extends String {}
	
	var a : { [n:string]:EXString } = {
		ggg : "gg1",
		uuu : "uu1"
	}
	
	function hhhh(u: EXString) {
		return u+"tt";
	} 
	
	var uuu = "uu"
	hhhh(a.ggg);
	
	enum kl {
		q,
		w
	}
	
	var d1:number = kl.q;
	var d2:kl = 9;

	export var f = 1;	
	var aaa:any = undefined;
	var bbb:any;
	var ttt= <(a)=>void>bbb;
	var ggg:number = 1;
	
	function f1(...args:string[]) {
		return args;
	}
	f1("d","r");
	
	var foo = '123';
	if (true) {
	let foo = 123;
	}
var funcs:any = [];
// create a bunch of functions
for (var i = 0; i < 3; i++) { 
    // Error: Loop contains block-scoped variable 'i' referenced by a function in the loop. 
    // This is only supported in ECMAScript 6 or higher.
    funcs.push(function() {
        console.log(i);
    })
}
// call them
for (var j = 0; j < 3; j++) {
    funcs[j]();
}
var a11 = 1;
}

