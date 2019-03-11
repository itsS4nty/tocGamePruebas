window.onmessage = function (ev) {
    var port = ev.ports[0];
    var sharedDataProps = ev.data.sharedDataProps;
    var sharedData = {};
    function resetSharedData(propInit) {
        var i = sharedDataProps.indexOf(propInit);
        if (i >= 0) {
            while (i < sharedDataProps.length)
                sharedData[sharedDataProps[i++]] = {};
        }
    }
    resetSharedData(sharedDataProps[0]);
    var funcs = {};
    port.onmessage = function (ev) {
        console.log("sandbox port onmessage", ev, ev.data);
        var data = ev.data;
        switch (data.type) {
            case "create":
                var argNames = data.argNames;
                argNames.unshift("shared");
                funcs[data.name] = new Function(argNames.join(","), data.body);
                break;
            case "execute":
                var args = data.args;
                args.unshift(sharedData);
                var ret = funcs[data.name].apply(sharedData, args);
                port.postMessage({ name: data.name, idx: data.idx, ret: ret });
                break;
            case "reset":
                resetSharedData(data.prop);
                break;
        }
    };
    port.postMessage("start");
};
//# sourceMappingURL=sandbox.js.map