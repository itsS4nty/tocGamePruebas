var mmm11;
(function (mmm11) {
    var a = {
        ggg: "gg1",
        uuu: "uu1"
    };
    function hhhh(u) {
        return u + "tt";
    }
    var uuu = "uu";
    hhhh(a.ggg);
    var kl;
    (function (kl) {
        kl[kl["q"] = 0] = "q";
        kl[kl["w"] = 1] = "w";
    })(kl || (kl = {}));
    var d1 = kl.q;
    var d2 = 9;
    mmm11.f = 1;
    var aaa = undefined;
    var bbb;
    var ttt = bbb;
    var ggg = 1;
    function f1() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return args;
    }
    f1("d", "r");
    var foo = '123';
    if (true) {
        var foo_1 = 123;
    }
    var funcs = [];
    // create a bunch of functions
    for (var i = 0; i < 3; i++) {
        // Error: Loop contains block-scoped variable 'i' referenced by a function in the loop. 
        // This is only supported in ECMAScript 6 or higher.
        funcs.push(function () {
            console.log(i);
        });
    }
    // call them
    for (var j = 0; j < 3; j++) {
        funcs[j]();
    }
    var a11 = 1;
})(mmm11 || (mmm11 = {}));
//# sourceMappingURL=test5.js.map