function mainSn() {
	jquery_mod();
	$(function() {
		var i = $("input");
		i.keypress(function(e) {
			if (e.which !== "\r".charCodeAt(0)) return;
			if (i.val().length > 0) {
				document.cookie = "id="+i.val()+" ;path='/' ;max-age="+(60*60*24*3650);
				window.location.reload(true);	
			}
		});
	});
}
