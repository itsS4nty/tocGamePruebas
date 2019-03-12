jquery_mod();
var webSite = [];
var CH;
$(function() {
	function addFile(path, content, registered, mediaType) {
		if (mediaType == null) mediaType="application/javascript";
		var o = {
			path : path,
			registered : registered,
			mediaType : mediaType,
			isUTF8 : true,
			content : content.toString()
		};
		webSite.push(o);
		return o;
	}
	addFile("/", htmlS, true, "text/html");
	addFile("/mainS.js", mainS, true);
	addFile("/cs.js", cs, true);
	addFile("/jquery.js", jquery_mod, null);
	addFile("/", htmlSn, false, "text/html");
	addFile("/mainSn.js", mainSn, false);
	CH = new ch();
	CH.webSite = webSite;
	CH.init(null, function(idSat) {
		CH.createObject("uu-"+idSat, idSat, o1.objS, o1.objLocal, function(e) { console.log("create "+e); });
		$("<button>").text("funcS1 "+idSat).click(function(e) {
			CH.sendMessage("uu-"+idSat, idSat, "funcS1", [idSat,"hola"], 
		               function(ret) { console.log("funcS1 ret: "+ret); }, 
					   function(e) { console.log("funcS1 error: "+e); });
		}).appendTo("body");
		return true;		
	});
});

var o1 = function () {
	var my = {};
	
	my.objLocal = function() {
		var my2 = {};
		
		my2.funcH1 = function(idObj, p1, p2) { console.log(idObj+" : "+p1+" , "+p2); return "hola"; }
		
		return my2;
	}();
	
	my.objS = function(outputCom) {
		var my = {};
		my.funcS1 = function(p2,p3) { console.log(p2+":"+p3); return "adios"; }
		$("<button>").text("funcH1 o1").appendTo("body").click(function() {
			outputCom("funcH1", ["hola","hola2"], 
			          function(ret) { console.log("funcH1 ret: "+ret); }, 
					  function(e) { console.log("funcH1 error: "+e); });
		});
		window.s = outputCom;
		return my;
	}
	
	return my;
}();
