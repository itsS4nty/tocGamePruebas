H.Scripts.add("jqueryS", "", jQuery_mod);

H.HtmlFiles.add("/toc_entryS.html",
'<html>\n\
<head>\n\
<title>GTPV Sat 2</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" />\n\
<link type="text/css" href="css/gtpv/gtpv.css" rel="stylesheet" />\n\
<script src="/jqueryS.js"></script>\n\
<!--scripts-->\n\
<script src="/toc_startS.js"></script>\n\
</head>\n\
<body>\n\
<div id="javascript_no_activo">Javascript no activo</div>\n\
</body>\n\
</html>\n');

H.HtmlFiles.add("/cam_entryS.html",
'<html>\n\
<head>\n\
<title>GTPV Camarero</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">\n\
<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" />\n\
<link type="text/css" href="css/gtpv/gtpv.css" rel="stylesheet" />\n\
<script src="/jqueryS.js"></script>\n\
<!--scripts-->\n\
<script src="/cam_startS.js"></script>\n\
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
	
	var redir;
	
	if (/^Camarero-/.test(idSat)) redir = "/cam_entryS.html";
	else redir = "/toc_entryS.html?id="+idSat;

	f = { 
		binary: false, 
		utf8 : true,
		type : "text/html; charset=utf-8"
	};
	f.content = '<html>\n<body>\n<script>\nwindow.location="'+redir+'?id='+idSat+'";\n</script>\n</body>\n</html>\n';
	return f;
});

H.Scripts.add("toc_startS", "", function() {
	$(function () {
		$("#javascript_no_activo").remove();
		try{
			setTitle();
			layout.init();
			messages.setLang(LS.get("lang"));
			var idSat = location.search.match(/^\?(?:[^&]*&)?id=([^&]*)/);
			if (idSat != null) {
				idSat = idSat[1];
				idSat = decodeURIComponent(idSat);
				setCookie("id", idSat);
			} else idSat = getCookie("id");
			if (idSat != null) CommS.init(idSat);
		} catch(e) {
			alert(e.toString());
		}
	});
});

H.Scripts.add("cam_startS", "", function() {
	$(function () {
		$("#javascript_no_activo").remove();
		try{
			setTitle();
			cam_layout.init();
			//messages.setLang(LS.get("lang"));
			var idSat = location.search.match(/^\?(?:[^&]*&)?id=([^&]*)/);
			if (idSat != null) {
				idSat = idSat[1];
				idSat = decodeURIComponent(idSat);
				setCookie("id", idSat);
			} else idSat = getCookie("id");
			if (idSat != null) CommS.init(idSat);
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
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">\n\
<script src="/jqueryS.js"></script>\n\
<script src="/findHostS.js"></script>\n\
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
/findHostS.js\n\
/_detect/hostDataS.php\n');

H.HtmlFiles.addHandlerScripts(function(file, info) {
	if (file.name === "/toc_entryS.html") {
		return H.Scripts.getNames("T");
	} else if (file.name === "/cam_entryS.html") {
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


