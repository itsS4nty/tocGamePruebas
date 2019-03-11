H.Scripts.add("jqueryS", "", jQuery_mod);

H.HtmlFiles.add("/entryS.html",
'<html>\n\
<head>\n\
<title>GTPV Sat main App</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" />\n\
<link type="text/css" href="css/gtpv/gtpv.css" rel="stylesheet" />\n\
<script src="/jqueryS.js"></script>\n\
<!--scripts-->\n\
<script src="/mainS.js"></script>\n\
</head>\n\
<body>\n\
</body>\n\
</html>\n');

H.Scripts.add("mainS", "", function() {
	$(function () {
	try{
		layout.init();
		messages.setLang(LS.get("lang"));
		var idSat = location.search.match(/^\?(?:.*&)*id=([^\&]*)/);
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
<script src="/_init/findHostS.js"></script>\n\
<script src="/_init/hostDataS.php" type="text/javascript"></script>\n\
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
/_init/findHostS.js\n\
/_init/hostDataS.php\n');

H.HtmlFiles.addHandlerScripts(function(file, info) {
	if (file.name === "/entryS.html") {
//		return [/* nameScripts */];	
		return H.Scripts.getNames("2");
	}
});

H.PhpFiles.add("/_init/hostIdentS.php", function(f, info){
	var infoH = H.Comm.getHostInfo(info.localAddress, info.address);
	content = [];
	content.push(infoH.user);
	content.push(infoH.localAddress);
	content.push(infoH.satAddress);
	content.push(infoH.idsSatAllowed);
	content.push(infoH.idsSat);
	content = content.map(function(item) { return JSON.stringify(item); });

	f.content = "hostIdent("+content.join(",")+");\n";

	return f;
});

H.PhpFiles.add("/_init/hostDataS.php", function(f, info){
	var infoH = H.Comm.getHostInfo(info.localAddress, info.address);
	var varHosts = { user: infoH.user, ipLan: infoH.localAddress};	
	var content = "var hosts = [];\n"+
	              "setCookie('type', 'sat');\n"+
				  "setCookie('user', '"+infoH.user+"');\n"+
				  "setCookie('ipLanHost', '"+infoH.localAddress+"');\n";

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


