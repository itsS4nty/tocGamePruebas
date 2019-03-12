/// <reference path="httpServer.ts" />
HttpServer.create("", 1, [], function () { });
function u() {
    var t = 1;
    var o = (function () {
        function o() {
        }
        o.prototype.h = function () { return t++; };
        ;
        return o;
    })();
    return new o();
}
var jj = u();
jj.h();
function jjjjj() {
    function hola() {
        return 1;
    }
    function adios(d) {
        return "" + d;
    }
    return {
        hola: hola,
        adios: adios
    };
}
function kkk1(n) { return n + 1; }
var fff1 = kkk1;
fff1(1, 2);
var x = function (a) { return 0; };
var y = function (b, s) { return 0; };
y = x;
x = y;
var mj;
(function (mj) {
    function g() { return 1; }
    mj.g = g;
})(mj || (mj = {}));
var rr1 = { d: 1, f: 2 };
for (name1 in rr1) { }
var sd1;
var sd2 = { e: "n" };
sd1 = sd2;
var foo = {};
foo.bar = "asdf";
foo.baz = "boo";
foo.boo = "boo";
foo.bar = 123;
function isMap(obj) { return obj; }
var m = isMap({ x: 3, y: 5 });
m['foo'] = 'bar';
m['foo'] = 42;
//# sourceMappingURL=test4.js.map