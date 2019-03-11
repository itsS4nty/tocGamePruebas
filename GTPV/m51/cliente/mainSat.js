H.HtmlFiles.add("/",
'<html>\n\
<head>\n\
<title>GTPV Sat</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.13.custom.css" rel="stylesheet" />\n\
<link type="text/css" href="css/gtpv/gtpv.css" rel="stylesheet" />\n\
<script src="/jqueryS.js"></script>\n\
<!--scripts-->\n\
<script src="/mainS.js"></script>\n\
</head>\n\
<body>\n\
</body>\n\
</html>\n', true);

H.Scripts.add("mainS", "", function() {
	$(function () {
	try{
		layout.init();
		messages.setLang(LS.get("lang"));
		var idSat = (/(?:^|[^;];)*\s*id=([^;]*)/g).exec(document.cookie)[1];
		if (idSat != null) {
			idSat = decodeURIComponent(idSat);
			CommS.init(idSat);
		}
	} catch(e) {
		alert(e.toString());
	}
	});
});

H.HtmlFiles.addHandlerScripts(function(file, idSat) {
	if ((file.name == "/") && (idSat != null)) {
//		return [/* nameScripts */];	
		return H.Scripts.getNames(true, "2");
	}
});

H.HtmlFiles.add("/",
'<html>\n\
<head>\n\
<title>GTPV Registrar Sat</title>\n\
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\
<script src="/jqueryS.js"></script>\n\
<script src="/mainSn.js"></script>\n\
</head>\n\
<body>\n\
Reg: <input id="i1"/><input id="i2" type="button" value="id. Sat."/>\n\
</body>\n\
</html>\n', false);

H.Scripts.add("jqueryS", "", jQuery_mod, null, "both");
//H.Scripts.add("jquerySn", jQuery_mod, null, false);

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

}, null, false); // add Scripts mainSn

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

H.HtmlFiles.add("/nr/", nr, true);
H.HtmlFiles.add("/nr/", nr, false);

}());

