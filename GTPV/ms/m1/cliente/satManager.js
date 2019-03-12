H.AppSatManager = function() {
	var my = {};

	var div0 = $("<div>")._100x100();
	
	var applet;

	var alertAppletNotLoaded = newAlertDialog().appendTo(div0);
	function showAppletNotLoaded() {
		alertAppletNotLoaded.header(M("Error")).text(M("Applet no actiu"))
								               .setButtons(["Ok"], function(text, i) { mp.finApp(); }).show();
	}

	var divP = $("<div>")._100x100().addClass("ui-widget-content").appendTo(div0);

	var localAddresses;
	
	var paramsLocalAddressesScroll = {
		arrows : "_ud",
		getNItems : function() { return localAddresses.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementLocalAddresses;
			var el = localAddressesModel.clone(true).text(localAddresses[idx]);
			return el;
		},
	};

	var localAddressesModel = $("<div>").addClass("ui-state-default");

	var defaultElementLocalAddresses = localAddressesModel.clone(false).html("X"); 
	var localAddressesScroll = newGScroll(paramsLocalAddressesScroll);
	localAddressesScroll.getDiv().css({ padding: SEP });
	localAddressesScroll.getDiv().absolutePos(0, 0, 30, 100).appendTo(divP);
	
	var sats;
	
	var paramsSatellitesScroll = {
		arrows : "_ud",
		getNItems : function() { return sats.length; },
		getItem : function(idx) {
			if (idx === -1) return defaultElementSatellites;
			var sat = sats[idx];
			var text = sat.isLocal() ? "+ local" : sat.getId();
			text = text.fillSpaceR(15);
			text+=": "+(sat.getAgeLastCom()/1000); 
			var el = satellitesModel.clone(true).text(text);
			return el;
		},
	};

	var satellitesModel = $("<div>").addClass("ui-state-default");

	var defaultElementSatellites = satellitesModel.clone(false).html("X"); 
	var satellitesScroll = newGScroll(paramsSatellitesScroll);
	satellitesScroll.getDiv().css({ padding: SEP });
	satellitesScroll.getDiv().absolutePos(40, 0, 100, 100).appendTo(divP);
	
	
	my.init = function(div00) {
		div0.appendTo(div00).hide();
		applet = H.Applet.get();
	}

	var mp;
	
	my.start = function(_mp) {
		mp = _mp;
		div0.showAlone();
		divP.showAlone();
		
		var fAppletActive = false;
		localAddresses = [ M("Applet no actiu") ];
		
		function refresh() {
			if (!fAppletActive) {
				try {
					localAddresses = applet.http_getSiteLocalAddresses();
					localAddresses = Array.prototype.slice.call(localAddresses);
					fAppletActive = true;
				} catch(e) {
				}
			}
			localAddressesScroll.redraw();
			
			sats = H.Comm.getSats();
			satellitesScroll.redraw();
			setTimeout(refresh,2000);
		}
		
		refresh();
	}
	
	return my;
}();
