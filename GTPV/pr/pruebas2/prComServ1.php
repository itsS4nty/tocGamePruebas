<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Documento sin título</title>
<script src="jquery-1.5.1.js"></script>
<script src="comServ.js"></script>
<script type="text/javascript">
$(function() {
d = new DOMParser();
req = $.ajax({
	url : "pr1.xml",
	async : false,	
});
x = new XMLSerializer()
$("pre").text(x.serializeToString(req.responseText));
});
</script>
</head>

<body>
<pre>
</pre>

</body>
</html>
