window.onmessage = function(ev) {
	var port = <MessagePort>ev.ports[0];
	var sharedDataProps = <string[]>ev.data.sharedDataProps;
	var sharedData = <{[name:string]:any}>{};

	function resetSharedData(propInit:string) {
		var i=sharedDataProps.indexOf(propInit);
		if (i>=0) {
			while (i<sharedDataProps.length) 
				sharedData[sharedDataProps[i++]] = {};
		}		
	}
	resetSharedData(sharedDataProps[0]);
	
	var funcs:{[name:string]:Function} = {};
	
	port.onmessage = function(ev) {
		console.log("sandbox port onmessage", ev, ev.data);
		var data = ev.data;
		switch (data.type) {
			case "create" :
				var argNames = <string[]>data.argNames;
				argNames.unshift("shared");
				funcs[data.name] = new Function(argNames.join(","), data.body);	
				break;
			case "execute" :
				var args = <any[]>data.args;
				args.unshift(sharedData);
				var ret = funcs[data.name].apply(sharedData, args);
				port.postMessage({name: data.name, idx: data.idx, ret: ret});
				break;
			case "reset" :
				resetSharedData(data.prop);	
				break;		
		}
	}
	port.postMessage("start");
}

