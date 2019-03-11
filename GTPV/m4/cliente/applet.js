H.Applet = function() {
	var my = {};
	var applet;
	
	my.get = function() { return applet; }
	
	my.state = function() {
		try {
			return applet.isActive() ? true : false;
		} catch(e) {
			return null;
		}
	}
	my.init = function() {
		applet = $("#g_applet").get(0);	
	}
	return my;
}();
