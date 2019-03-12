// JAVASCRIPT

function etiquetas(form,s){
	// Para escribir en pantalla los comandos definidos y los códigos de barra (cuando el usuario apreta los botones)
	if(s == 'salto'){
		form.value = form.value+"[SALTOLINEA]";
	}
	if(s == 'cortar'){
		form.value = form.value+"[CORTARPAPEL]";
	}

	// FUENTES
	if(s == 'fA'){
		form.value = form.value+"[FUENTEA]";
	}
	if(s == 'fB'){
		form.value = form.value+"[FUENTEB]";
	}
	if(s == 'fC'){
		form.value = form.value+"[FUENTEC]";
	}
	if(s == 'fD'){
		form.value = form.value+"[FUENTED]";
	}

	// ALINEADO
	if(s == 'izq'){
		form.value = form.value+"[IZQUIERDA]";
	}
	if(s == 'cen'){
		form.value = form.value+"[CENTRO]";
	}
	if(s == 'der'){
		form.value = form.value+"[DERECHA]";
	}

	// SUBRAYADO
	if(s == 'subNo'){
		form.value = form.value+"[NOSUBRAYADO]";
	}
	if(s == 'sub1'){
		form.value = form.value+"[SUBRAYADO1]";
	}
	if(s == 'sub2'){
		form.value = form.value+"[SUBRAYADO2]";
	}
	if(s == 'invertir'){
		form.value = form.value+"[INVERTIR]";
	}

	// POR DEFECTO
	if(s == 'normal'){
		form.value = form.value+"[NORMAL]";
	}

	// CÓDIGOS DE BARRAS
	if(s == 'EAN8'){
		form.value = form.value+"[EAN8:]";
	}
	if(s == 'EAN13'){
		form.value = form.value+"[EAN13:]";
	}
	if(s == 'CODE128A'){
		form.value = form.value+"[CODE128A:]";
	}
	if(s == 'CODE128B'){
		form.value = form.value+"[CODE128B:]";
	}
	if(s == 'CODE128C'){
		form.value = form.value+"[CODE128C:]";
	}

	// EN ESTA VERSIÓN, SÓLO SE EJECUTARÁ ESTE IF
	if(s == 'borrar'){
		form.value = "";
	}
}