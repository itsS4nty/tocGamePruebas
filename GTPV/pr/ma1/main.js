jquery_mod();
var webSite = [];
var CH;
$(function() {
	function addFile(path, content) {
		var o = {
			path : path,
			registered : true,
			mediaType : "application/javascript",
			isUTF8 : true,
			content : content.toString()
		};
		webSite.push(o);
		return o;
	}
	addFile("/", htmlS).mediaType = "text/html";
	addFile("/mainS.js", mainS);
	addFile("/cs.js", cs);
	addFile("/jquery.js", jquery_mod);
	CH = new ch();
	CH.webSite = webSite;
	CH.init();
	$("<button>").text("create o1").appendTo("body").click(function() {
		CH.createObject("uu","2",o1.objS, o1.objLocal, function(e) { alert("create "+e); });
	});
	$("<button>").text("funcS1 o1").appendTo("body").click(function() {
		CH.sendMessage("uu","2","funcS1", ["hola","hola2"], function(ret) { alert("funcS1 ret: "+ret); }, function(e) { alert("funcS1 error: "+e); });
	});
	
});

var o1 = function () {
	var my = {};
	
	my.objLocal = function() {
		var my2 = {};
		
		my2.funcH1 = function(idObj, p1, p2) { alert(idObj+" : "+p1+" , "+p2); return "hola"; }
		
		return my2;
	}();
	
	my.objS = function(outputCom) {
		var my = {};
		my.funcS1 = function(p2,p3) { alert(p2+":"+p3); return "adios"; }
		$("<button>").text("funcH1 o1").appendTo("body").click(function() {
			outputCom("funcH1" ["hola","hola2"], function(ret) { alert("funcH1 ret: "+ret); }, function(e) { alert("funcH1 error: "+e); });
		});
		window.s = outputCom;
		return my;
	}
	
	return my;
}();
