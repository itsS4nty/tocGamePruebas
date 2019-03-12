H.Scripts.add("jqueryS", "", jQuery_mod);

H.HtmlFiles.add("/entryS2.html",
'<html>\n\
<head>\n\
<title>GTPV Sat 2</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" />\n\
<link type="text/css" href="css/gtpv/gtpv.css" rel="stylesheet" />\n\
<script src="/jqueryS.js"></script>\n\
<!--scripts-->\n\
<script src="/mainS.js"></script>\n\
</head>\n\
<body>\n\
<div id="javascript_no_activo">Javascript no activo</div>\n\
</body>\n\
</html>\n');

H.HtmlFiles.add("/entrySC.html",
'<html>\n\
<head>\n\
<title>GTPV Camarero</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">\n\
<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" />\n\
<link type="text/css" href="css/gtpv/gtpv.css" rel="stylesheet" />\n\
<script src="/jqueryS.js"></script>\n\
<!--scripts-->\n\
<script src="/mainSC.js"></script>\n\
</head>\n\
<body>\n\
<div id="javascript_no_activo">Javascript no activo</div>\n\
</body>\n\
</html>\n');

H.PhpFiles.add("/entryS.php", function(f, info){
	var idSat = "";
	if (info.query != null) {
		var match = info.query.match(/^(?:[^&]*&)*id=([^&]*)/);
		if (match != null) idSat = match[1];
	}
	
	var name;
	
	if (/^Camarero-/.test(idSat)) name = "/entrySC.html";
	else name = "/entryS2.html";

	return H.Web.findFile(H.Comm.handlersWeb, name, true, info);
});

H.Scripts.add("mainS", "", function() {
	$(function () {
		$("#javascript_no_activo").remove();
		try{
			layout.init();
			messages.setLang(LS.get("lang"));
			var idSat = location.search.match(/^\?(?:[^&]*&)?id=([^&]*)/);
			if (idSat != null) {
				idSat = idSat[1];
				idSat = decodeURIComponent(idSat);
				CommS.init(idSat);
			}
		} catch(e) {
			alert(e.toString());
		}
	});
});

H.Scripts.add("mainSC", "", function() {
	$(function () {
		$("#javascript_no_activo").remove();
		try{
			layoutC.init();
			//messages.setLang(LS.get("lang"));
			var idSat = location.search.match(/^\?(?:[^&]*&)?id=([^&]*)/);
			if (idSat != null) {
				idSat = idSat[1];
				idSat = decodeURIComponent(idSat);
				CommS.init(idSat);
			}
		} catch(e) {
			alert(e.toString());
		}
	});
});

H.HtmlFiles.add("/",
'<html nomanifest="gtpvSat.appcache">\n\
<head>\n\
<title>GTPV Sat</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<script src="/jqueryS.js"></script>\n\
<script src="/_detect/findHostS.js"></script>\n\
<script src="/_detect/HostData.php" type="text/javascript"></script>\n\
</head>\n\
<body>\n\
</body>\n\
</html>\n');

H.ManifestFiles.add("gtpvSat.appManifest",
'CACHE MANIFEST\n\
\n\
# gtpvSat.appcache\n\
# '+Date()+'\n\
\n\
CACHE:\n\
\n\
/jqueryS.js\n\
/_detect/findHostS.js\n\
/_detect/hostDataS.php\n');

H.HtmlFiles.addHandlerScripts(function(file, info) {
	if (file.name === "/entryS2.html") {
//		return [/* nameScripts */];	
		return H.Scripts.getNames("2");
	} else if (file.name === "/entrySC.html") {
		return H.Scripts.getNames("C");
	}
});

H.PhpFiles.add("/_detect/jsonp.php", function(f, info){
	var infoH = H.Comm.getHostInfo(info.localAddress, info.address);
	var match = (info.query != null) ? info.query.match(/^(?:[^&]*&)*callback=([^&]*)/) : null;
	var callbackName = (match != null) ? match[1] : "callback";  

	f.content = callbackName+"("+JSON.stringify(infoH)+");\n";

	return f;
});

H.PhpFiles.add("/_detect/HostData.php", function(f, info){
	var infoH = H.Comm.getHostInfo(info.localAddress, info.address);
	//var hosts = { user: infoH.user, ipLan: infoH.localAddress};	
	var content = "var hosts = [];\n"+
	              "setCookie('type', 'sat');\n"+
				  "setCookie('user', '"+infoH.user+"');\n"+
				  "setCookie('ipLanHost', '"+infoH.ipLanHost+"');\n";

	f.content = content;
	
	return f;
});

/*
H.HtmlFiles.add("/",
'<html>\n\
<head>\n\
<title>GTPV Sat</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<script src="/jqueryS.js"></script>\n\
<script src="/mainSn.js"></script>\n\
</head>\n\
<body>\n\
Reg: <input id="i1"/><input id="i2" type="button" value="id. Sat."/>\n\
</body>\n\
</html>\n');

H.Scripts.add("jqueryS", "", jQuery_mod);

H.Scripts.add("mainSn", "", function() {

$(function() {
	var i1 = $("#i1");
	i1.focus();

	function send() {
		if (i1.val().length > 0) {
			document.cookie = "id="+encodeURIComponent(i1.val())+"; path=/; max-age="+(36500*24*60*60);
			window.location.reload(true);	
		}
	}
	i1.keypress(function(e) {
		if (e.which !== "\r".charCodeAt(0)) return;
		send();
	});
	$("#i2").click(function(e) {
		if (e.button !== 0) return;
		send();
	});

});

}); // add Scripts mainSn
*/

(function() {
var nr =
'<html>\n\
<head>\n\
<title>GTPV desregistrar Sat</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<script type="text/javascript">\n\
document.cookie = "id=; path=/; max-age=0";\n\
window.location = "/";\n\
</script>\n\
</head>\n\
<body>\n\
</body>\n\
</html>\n'

H.HtmlFiles.add("/nr/", nr);

}());


if (H.CSSData) {
	H.CSSData.forEach(function(f) {
		f.path = "/css"+f.path;
		H.CSSFiles.add(f.path, f.content);
	});
}

//H.CSSFiles.localLoad("/css/ui-lightness/jquery-ui-1.8.13.custom.css");
//H.CSSFiles.localLoad("/css/gtpv/gtpv.css");


