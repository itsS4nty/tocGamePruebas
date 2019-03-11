scripts.alertDialog = function() {

window.createAlertDialog = function () {
	var my = {};
	
	var div = $("<div style='position: absolute; width: 100%; height: 100%'>\
	                <div class='ui-widget-overlay' style='z-index: 1000'></div>\
                    <div class='ui-widget-content ui-corner-all' style='position: absolute; z-index: 1001; width: 30%'>\
                       <div class='ui-widget-header ui-corner-all' style='margin: .5em 1em; padding: .5em 1em'></div>\
                       <div class='ui-widget-content' style='margin: .5em 1em; padding: .5em 1em'>\
                          <span class='ui-icon ui-icon-alert' style='float:left; margin-right:1em'></span>\
                          <span></span>\
                       </div>\
                       <div class='ui-widget-content' style='margin: .5em 1em'></div>\
                       <div style='text-align: right'></div>\
                    </div>\
                 </div>");

	var divAlert = div.children().eq(1);
	var divHeader = divAlert.children().eq(0);
	var divContent = divAlert.children().eq(1).children().eq(1);
	var divButtons = divAlert.children().eq(3);
	
	my.getDiv = function() { return div; }
	my.text = function(text) { divContent.text(text); return my; }
	my.header = function(text) { divHeader.text(text); return my; }	
	my.setButtons = function(butArray, handler) {
		divButtons.empty();
		function getClickHandler(text, i) { 
			return function(e) { 
				if (e.button !== 0) return;
				my.hide(); 
				handler(text, i); 
			} 
		}
		for (var i=0; i<butArray.length; i++) {
			$("<button>").text(butArray[i])
			             .css({margin: ".5em 1em", padding: ".5em 1em"}).addClass("ui-state-default ui-corner-all")
			             .appendTo(divButtons).click(getClickHandler(butArray[i], i)); 
		}
		return my;
	}
	my.show = function() {
		div.show();
		var left = Math.floor((div.width()-divAlert.width())/2),
		    top = Math.floor((div.height()-divAlert.height())/2)
		divAlert.css({left: left+"px", top: top+"px"});
		return my;
	}
	my.hide = function() {
		div.hide();
		return my;
	}

	return my;
}

}
