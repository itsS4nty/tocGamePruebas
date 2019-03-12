H.Applet = function() {
	var my = {};
	var applet;
	
	function getApplet() {
		applet = applet || $("#g_applet").get(0);	
		return applet;
	}
	
	my.get = function() { 
		return getApplet(); 
	};
	my.getHttpServer = function() { 
		try {
			return getApplet().getHttpServer();
		} catch(e) {
			return null;
		}		
	};
	my.getSerial = function() { 
		try {
			return getApplet().getSerial(); 
		} catch(e) {
			return null;
		}	
	}	
	
	my.state = function() {
		try {
			return getApplet().isActive() ? true : false;
		} catch(e) {
			return null;
		}
	}
	return my;
}();
