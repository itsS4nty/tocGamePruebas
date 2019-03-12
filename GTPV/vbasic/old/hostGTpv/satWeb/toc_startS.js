(function () {
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
			} else idSat = getCookie("id");
			if (idSat != null) CommS.init(idSat);
		} catch(e) {
			alert(e.toString());
		}
	});
})(window);
