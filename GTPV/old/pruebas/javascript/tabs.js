/***************************/
//@Author: Adrian Mato Gondelle
//@website: http://web.ontuts.com
//@email: yensamg@gmail.com
//@license: Feel free to use it, but keep this credits please!					
/***************************/

$(document).ready(function(){
	/*
    $(".menu > li").click(function(e){
        var a = e.target.id;
        //desactivamos seccion y activamos elemento de menu
        $(".menu li.active").removeClass("active");
        $(".menu #"+a).addClass("active");
        //ocultamos divisiones, mostramos la seleccionada
        $(".contenido").css("display", "none");
        $("."+a).fadeIn();
    });
	*/
	
	// Evento clic del menú principal:
	$(".menu > li").click(function(e){
        var a = e.target.id;
        //desactivamos seccion y activamos elemento de menu
        $(".menu li.active").removeClass("active");
        $(".menu #"+a).addClass("active");
        //ocultamos divisiones, mostramos la seleccionada
        $(".contenido").css("display", "none");
        $("."+a).fadeIn();
    });
	
	// Evento clic del submenú 1
	$(".subUno > li").click(function(e){
        var a = e.target.id;
        //desactivamos seccion y activamos elemento de menu
        $(".subUno li.active").removeClass("active");
        $(".subUno #"+a).addClass("active");
        //ocultamos divisiones, mostramos la seleccionada
        $(".subContUno").css("display", "none");
        $("."+a).fadeIn();
    });
	
	// Evento clic del submenú 2
	$(".subDos > li").click(function(e){
        var a = e.target.id;
        //desactivamos seccion y activamos elemento de menu
        $(".subDos li.active").removeClass("active");
        $(".subDos #"+a).addClass("active");
        //ocultamos divisiones, mostramos la seleccionada
        $(".subContDos").css("display", "none");
        $("."+a).fadeIn();
    });
	
	// Evento clic del submenú 3
	$(".subTres > li").click(function(e){
        var a = e.target.id;
        //desactivamos seccion y activamos elemento de menu
        $(".subTres li.active").removeClass("active");
        $(".subTres #"+a).addClass("active");
        //ocultamos divisiones, mostramos la seleccionada
        $(".subContTres").css("display", "none");
        $("."+a).fadeIn();
    });
});