C=0;
S=0;

$(function() {
	var B1 = 1;
	$("body").width("90%").height("90%").css("text-align", "center");
	
	$("<button>").text("clear").click(function() {
		S.css("top",0);
		S.empty();
	}).appendTo("body");
	$("<button>").text("clear2").click(function() {
		S.css("top",0);
/*		var a = S.children().toArray();
		a.splice(a.length-1, 1);
		$(a).remove();
*/		S.empty();
		$("<div>").css({backgroundColor: "black"}).height(1).appendTo(S);
	}).appendTo("body");
	$("<button>").text("add").click(function() {
		for (var i=0; i<3; i++)
			$("<div>").text("123456789"+(B1++)).appendTo(S);
	}).appendTo("body");
	$("<button>").text("up").click(function() {
		var top = parseInt(S.css("top"));
		S.css("top", top-10);
	}).appendTo("body");
	$("<button>").text("down").click(function() {
		var top = parseInt(S.css("top"));
		S.css("top", top+10);
	}).appendTo("body");
	
	$("<br>").appendTo("body");
	for (var i=0; i<800; i++) {
		for (var j=0, s=""; j<i%4+1; j++) { s+="a"; }
		$("<button>").text(s).width((i%10+1)*3).appendTo("body");	
	}
	C = $("<div>").width("500px").height("300px").css("border", "1px solid black").css("overflow", "hidden").css("margin","auto").appendTo("body");
	C.css("position","absolute");
	C.css("top", "400px");
	C.css("left", "300px");
	S = $("<div>").width("100%").css("position","relative").appendTo(C);
	S.css("top", 0);
	
	
})