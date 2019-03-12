debug = 0;

var Keyboard = function(options) {
	
	var my;
	
	function clickButton() {
		my.clickHandler.apply(my, [$(this)].concat(Array.prototype.slice.call(arguments)));
		my.changeHandler.apply(my, [$(this)].concat(Array.prototype.slice.call(arguments)));
	}
	
	my = this;
	this.options = options = $.extend({},this.defaultOptions, options);
	
	this.clickHandler = this.defaultClickHandler;
	this.changeHandler = this.defaultChangeHandler;
	
	this.actionButtons = {};
	this.normalButtons = {};
	this.currentLayout = "default";
	
	this.div = $("<div>").css({position: "absolute"});
	this.getDiv = function() { return this.div; }
	var rowsLayout = options.layout.default;
	var maxSimpleButtonsRow = 0;
	var nRows = rowsLayout.length;
	var simpleButtonsRow = [];
	for (var i=0; i<nRows; i++) {
		var rowLayout = rowsLayout[i];
		var divRow = $("<div>").css({textAlign: "center", width: "100%"});
		simpleButtonsRow[i] =0;
		rowLayout.split(' ').forEach( function(buttonLayout) {
			var button = options.button.clone().css({height: "100%"});
			var buttonSet;
			button.appendTo(divRow);
				 
			if (buttonLayout.length > 1) {
				simpleButtonsRow[i] += options.action[buttonLayout].width;
//				button.val(options.action[buttonLayout].text); //? value
//				button.data("action", buttonLayout);
				buttonSet = this.actionButtons; 
			} else {
				simpleButtonsRow[i]++;
//				button.val(buttonLayout); //? value
				buttonSet = this.normalButtons;
			}
			if (buttonSet[buttonLayout] == undefined) buttonSet[buttonLayout] = $([]);
			buttonSet[buttonLayout] = buttonSet[buttonLayout].add(button);
			button.click(clickButton);
		}, this);
		if (simpleButtonsRow[i] > maxSimpleButtonsRow) maxSimpleButtonsRow = simpleButtonsRow[i];
		divRow.appendTo(this.div);
	}
	this.applyLayout(this.currentLayout);
	
	var widthSimpleButton = 100/maxSimpleButtonsRow;
	var heightSimpleButton = 100/nRows;
	this.div.children().each( function(i, row) {
		row = $(row);
		row.children().each( function(i, button) {
			button = $(button);
			var width = (button.data("action")) ? (options.action[button.data("action")].width) : 1;
			button.css({width : width*widthSimpleButton+"%"});
			if (button.data("action")) 
				button.css({backgroundColor : options.action[$(button).data("action")].backgroundColor});
		});
		row.css({height: heightSimpleButton + "%"});
	});
};

$.extend(Keyboard.prototype, {
	defaultClickHandler : function(el) {
		var input = this.input;
		switch (el.data("action")) {
			case "enter" :
				this.callback("enter");
				break;
			case "cancel" :
				this.callback("cancel");
				break;	
			case "bksp" :
				if (!this.deleteSelection()) {
					var cursor = this.getCursor();
					if (cursor > 0) {
						input.val(input.val().substr(0, cursor-1)+ input.val().substr(cursor));
						this.setCursor(--cursor);
					}
				}
				break;
			case "space" :
				this.insertInInput(' ');
				break;
			case "shift" :
				switch (this.currentLayout) {
					case "default": this.currentLayout = "shift"; break;
					case "shift" : this.currentLayout = "default"; break;	
				}
				this.applyLayout(this.currentLayout);
				break;
			case "<-" :
				if (!this.unselect()) {
					var cursor = this.getCursor();
					if (cursor > 0) this.setCursor(--cursor);
				}
				break;
			case "->" :
				if (!this.unselect()) {
					var cursor = this.getCursor();
					if (cursor < input.val().length) this.setCursor(++cursor);
				}
				break;	
			case undefined :
				this.insertInInput(el.val());
		}
	},

	defaultChangeHandler : function(el) {
	},	
	
	callback : function(message) {
	},
/*	
	applyLayout : function(layoutName) {
		var rowsLayout = this.options.layout[layoutName];
		var nRows = rowsLayout.length;
		for (var i=0; i<nRows; i++) {
			var rowLayout = rowsLayout[i];
			var divRow = $(this.div.children()[i]);
			rowLayout.split(' ').forEach( function(buttonLayout, j) {
				var button = $(divRow.children()[j]);
				 
				if (buttonLayout.length > 1) {
					button.val(this.options.action[buttonLayout].text); //? value
					button.data("action", buttonLayout);
				} else {
					button.val(buttonLayout); //? value
					button.removeData("action");
				}
			}, this);
		}
	},
*/
/*	applyLayout : function(layoutName) {
		var rowsLayout = this.options.layout[layoutName];
		var nRows = rowsLayout.length;
		
		for (var i=0, divRow = this.div.get(0).firstChild; i<nRows; i++, divRow = divRow.nextSibling) {
			var rowLayout = rowsLayout[i];
//			var divRow = $(this.div.children()[i]);
			var splitRow = rowLayout.split(' ');
			for (var j=0, button = divRow.firstChild; j<splitRow.length; j++, button = button.nextSibling) {
				var buttonLayout = splitRow[j];
//				var button = $(divRow.children()[j]);
				 
				if (buttonLayout.length > 1) {
					$(button).val(this.options.action[buttonLayout].text); //? value
					$(button).data("action", buttonLayout);
				} else {
					$(button).val(buttonLayout); //? value
					$(button).removeData("action");
				}
			}
		}
	},
*/
	applyLayout : function(layoutName) {
		var rowsLayout = this.options.layout[layoutName];
		var nRows = rowsLayout.length;
		var divRows = this.div.children();
		for (var i=0; i<nRows; i++) {
			var rowLayout = rowsLayout[i];
			var buttons = divRows.eq(i).children();
			var splitRow = rowLayout.split(' ');
			for (var j=0; j<splitRow.length; j++) {
				var buttonLayout = splitRow[j];
				var button = buttons.eq(j);
				if (buttonLayout.length > 1) {
					button.val(this.options.action[buttonLayout].text); //? value
					button.data("action", buttonLayout);
				} else {
					button.val(buttonLayout); //? value
					button.removeData("action");
				}
			}
		}
	},

	reset : function() {
		this.currentLayout = "default";
		this.applyLayout(this.currentLayout);
	},
	
	insertInInput : function (str) {
		this.deleteSelection();
		var input = this.input;
		var cursor = this.getCursor();
		input.val(input.val().substr(0,cursor) + str + input.val().substr(cursor));
		cursor += str.length;
		this.setCursor(cursor);
	},

	deleteSelection : function() {
		var input = this.input;
		var start = input[0].selectionStart;
		var end = input[0].selectionEnd;
		if (start == end) return false;
		input.val(input.val().substr(0,start) + input.val().substr(end));
		this.setCursor(start);
		return true;
	},

	unselect : function() {
		var input = this.input;
		var start = input[0].selectionStart;
		var end = input[0].selectionEnd;
		this.setCursor(start);
		return (start != end);	
	},

	setCursor : function(cursor) { 
		this.input[0].setSelectionRange(cursor, cursor); 
	},

	getCursor : function() { 
		return this.input[0].selectionEnd; 
	},
//yy
	defaultOptions : {
	gg:1,
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
		button : $("<input type='button'/>").addClass("ui-corner-all"),
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

 if (debug) {

 function positionDiv(div,x0,y0,x1,y1) {
	if (div == null) div = "<div>";
	div = $(div);
	div.css({position: "absolute", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

	$(function() {
	try {
		var k = new Keyboard();
		$("body").addClass("ui-widget").css({margin: 0});
		positionDiv("body",0,0,100,100);
		positionDiv(k.div, 10,10,60,40);
		k.div.appendTo("body");
	} catch (e) {
		throw e;
	}	
	});
 }