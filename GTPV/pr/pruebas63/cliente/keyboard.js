var Keyboard = function(options) {
	
	var my = this;
	
	var input = $("<input type='text'>");
	this.setInput = function(_input) { input = _input; }
	var callback = function(message) {};
	this.setCallback = function(_callback) { callback = _callback; }

	function deleteSelection() {
		var start = input.get(0).selectionStart;
		var end = input.get(0).selectionEnd;
		if (start == end) return false;
		input.val(input.val().substr(0,start) + input.val().substr(end));
		setCursor(start);
		return true;
	}
	
	function insertInInput(str) {
		deleteSelection();
		var cursor = getCursor();
		input.val(input.val().substr(0,cursor) + str + input.val().substr(cursor));
		cursor += str.length;
		setCursor(cursor);
	}

	function unselect() {
		var start = input.get(0).selectionStart;
		var end = input.get(0).selectionEnd;
		setCursor(start);
		return (start != end);	
	}

	function setCursor(cursor) { input.get(0).setSelectionRange(cursor, cursor); }

	function getCursor() { return input.get(0).selectionEnd; }

	function clickButton(e) {
		var el = $(this), action = el.data("action");
		var message = null;
		switch (action) {
			case "enter" :
				message = "enter";
				break;
			case "cancel" :
				message = "cancel";
				break;	
			case "bksp" :
				if (!deleteSelection()) {
					var cursor = getCursor();
					if (cursor > 0) {
						input.val(input.val().substr(0, cursor-1)+ input.val().substr(cursor));
						setCursor(--cursor);
					}
				}
				message = "change";
				break;
			case "space" :
				insertInInput(' ');
				message = "change";
				break;
			case "shift" :
				switch (currentLayout) {
					case "default": currentLayout = "shift"; break;
					case "shift" : currentLayout = "default"; break;	
				}
				applyLayout(currentLayout);
				break;
			case "<-" :
				if (!unselect()) {
					var cursor = getCursor();
					if (cursor > 0) setCursor(--cursor);
				}
				break;
			case "->" :
				if (!unselect()) {
					var cursor = getCursor();
					if (cursor < input.val().length) setCursor(++cursor);
				}
				break;	
			default :
				if (action.length == 1) {
					insertInInput(action);
					message = "change";
				}	
		}
		callback(message, e);
	}

	function applyLayout(layoutName) {
		var rowsLayout = options.layout[layoutName];
		var nRows = rowsLayout.length;
		var divRows = div.children();
		for (var i=0; i<nRows; i++) {
			var rowLayout = rowsLayout[i];
			var buttons = divRows.eq(i).children();
			var splitRow = rowLayout.split(' ');
			for (var j=0; j<splitRow.length; j++) {
				var buttonLayout = splitRow[j];
				var button = buttons.eq(j);
				button.text((buttonLayout.length > 1) ? options.action[buttonLayout].text : buttonLayout);
				button.data("action", buttonLayout);
			}
		}
	}
	
	options = $.extend({},this.defaultOptions, options);
	
	this.buttons = {};
	this.getButtons = function(action) { return this.buttons[action]; }
	
	var currentLayout;
	this.getLayout = function() { return currentlayout; }
	this.setLayout = function(layoutName) {
		currentLayout = layoutName;
		applyLayout(layoutName);
	}
	this.reset = function() {
		this.setLayout("default");
	}

	var div = $("<div>").css({position: "absolute"});
	this.getDiv = function() { return div; }

	var rowsLayout = options.layout.default;
	var maxButtonsInRow = 0;
	var nRows = rowsLayout.length;
	for (var i=0; i<nRows; i++) {
		var rowLayout = rowsLayout[i];
		var divRow = $("<div>").css({textAlign: "center", width: "100%"});
		var numButtonsInRow =0;
		rowLayout.split(' ').forEach( function(buttonLayout) {
			var but = options.button.clone().css({height: "100%"});
			but.appendTo(divRow);
			numButtonsInRow += ((buttonLayout.length > 1) ? options.action[buttonLayout].width : 1);
			this.buttons[buttonLayout] = (this.buttons[buttonLayout] || $([])).add(but);
			but.click(clickButton);
		}, this);
		if (maxButtonsInRow < numButtonsInRow) maxButtonsInRow = numButtonsInRow;
		divRow.appendTo(div);
	}
	this.setLayout("default");
	
	this.getNumButtonsX = function() { return maxButtonsInRow; } 
	this.getNumButtonsY = function() { return nRows; } 
	
	var widthSimpleButton = 100/maxButtonsInRow;
	var heightSimpleButton = 100/nRows;
	div.children().each( function(i, row) {
		row = $(row);
		row.children().each( function(i, but) {
			but = $(but);
			var width = (but.data("action").length > 1) ? (options.action[but.data("action")].width) : 1;
			but.css({width : width*widthSimpleButton+"%"});
			if (but.data("action").length > 1) 
				but.css({backgroundColor : options.action[$(but).data("action")].backgroundColor});
		});
		row.css({height: heightSimpleButton + "%"});
	});

};

$.extend(Keyboard.prototype, {
	defaultOptions : {
		layout : {
			default : [ "1 2 3 4 5 6 7 8 9 0 bksp",
						"q w e r t y u i o p enter",
						"a s d e f g h j k l ñ",
						"z x c v b n m <- ->",
						"shift space shift cancel"],
			shift :   [ "! \" · $ % & / ( ) = bksp",
						"Q W E R T Y U I O P enter",
						"A S D E F G H J K L Ñ",
						"Z X C V B N M <- ->",
						"shift space shift cancel"],			
		},
		button : $("<button>").addClass("ui-corner-all"),
		action : (function () {
			var t = [["enter", "enter", 3, "green"],
 					 ["shift", "shift", 2, "gray"],
					 ["<-", "<", 1, "gray"],
					 ["->", ">", 1, "gray"],
					 ["alt", "alt", 3, "gray"],
					 ["bksp", "supr", 2, "gray"],
					 ["cancel", "cancel", 3, "red"],
					 ["space", "space", 4, "white"]];
			var o = {};
			t.forEach( function(val) {
				o[val[0]] = {
					text : val[1],
					width : val[2],
					backgroundColor	: val[3]
				}
			});
			return o;
		})(),
	}
});	
