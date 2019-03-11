HtmlFiles.add("/",
'<html>\n\
<head>\n\
<script src="jquery.js"></script>\n\
<script src="cs.js"></script>\n\
<!--scripts-->\n\
<script src="mainS.js"></script>\n\
<script>mainS();</script>\n\
</head>\n\
<body>\n\
</body>\n\
</html>\n', null, true);

HtmlFiles.addHandlerScripts(function(file, idSat) {
	if ((file.name == "/") && (idSat != null)) {
		return [/* nameScripts */];	
	}
});

HtmlFiles.add("/",
'<html>\n\
<head>\n\
<script src="jquery.js"></script>\n\
<script src="mainSn.js"></script>\n\
<script>mainSn();</script>\n\
</head>\n\
<body>\n\
Reg: <input></input>\n\
</body>\n\
</html>\n', null, false);



