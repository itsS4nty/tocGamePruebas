function mainS() {
	jquery_mod();
	$(function() {
		window.CS = new cs();
		var idSat = "";
		var s = document.cookie;
		var re = /\s*([^=]*)=([^\s;]*)\s*;?/g;
		var exec;
		while ((exec = re.exec(s)) != null) {
			if (exec[1] == "id") {
				idSat = exec[2];
				break;
			}
		}
		CS.setIdSat(idSat);
		CS.init();
	});
}
