<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Test de impresión</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
    <script src="Script.js" type="text/javascript" language="javascript"></script>
</head>

<body>
    <div class="titulo">
        <h1><span></span>Test de impresión</h1>
        <hr/>
    </div>

    <div class="Content">
        <form enctype="text/plain" action="Test.php" method="get" >

        	<div class="pasos">
                <label for="puerto">Escoge el puerto para enviar datos: </label><select id="puerto" name="puerto"/>
                    <option value="COM1">COM1</option>
                    <option value="COM2">COM2</option>
                    <option value="COM3">COM3</option>
                    <option value="" selected="selected"> </option>
                </select><br/><br/>

                <div class="etiquetas">
	                <label>Etiquetas definidas</label><br/>
                    <center>
                    <label>Acciones: </label>
                    <input type="button" value="SaltoLinea" onClick="etiquetas(this.form.Impresion, 'salto')"/>
                    <input type="button" value="CortarPapel" onClick="etiquetas(this.form.Impresion, 'cortar')"/><br/>
                    <label>Alinear: </label>
                    <input type="button" value="Izquierda" onClick="etiquetas(this.form.Impresion, 'izq')"/>
                    <input type="button" value="Centro" onClick="etiquetas(this.form.Impresion, 'cen')"/>                    <input type="button" value="Derecha" onClick="etiquetas(this.form.Impresion, 'der')"/><br/>
                    <label>Fuentes: </label>
                    <input type="button" value="FuenteA" onClick="etiquetas(this.form.Impresion, 'fA')"/>
                    <input type="button" value="FuenteB" onClick="etiquetas(this.form.Impresion, 'fB')"/>                    <input type="button" value="FuenteC" onClick="etiquetas(this.form.Impresion, 'fC')"/>
                    <input type="button" value="FuenteD" onClick="etiquetas(this.form.Impresion, 'fD')"/><br/>
                    <label>Otros: </label>
                    <input type="button" value="NoSubrayar" onClick="etiquetas(this.form.Impresion, 'subNo')"/>
                    <input type="button" value="Subrayado1" onClick="etiquetas(this.form.Impresion, 'sub1')"/>
                    <input type="button" value="Subrayado2" onClick="etiquetas(this.form.Impresion, 'sub2')"/>
                    <input type="button" value="Invertir" onClick="etiquetas(this.form.Impresion, 'invertir')"/><br/>
                    <label>Codigos de Barras: </label>
                    <input type="button" value="EAN8" onClick="etiquetas(this.form.Impresion, 'EAN8')"/>
                    <input type="button" value="EAN13" onClick="etiquetas(this.form.Impresion, 'EAN13')"/>
                    <input type="button" value="CODE128A" onClick="etiquetas(this.form.Impresion, 'CODE128A')"/>
                    <input type="button" value="CODE128B" onClick="etiquetas(this.form.Impresion, 'CODE128B')"/>
                    <input type="button" value="CODE128C" onClick="etiquetas(this.form.Impresion, 'CODE128C')"/>
                    <br/><br>
                    <label>Por defecto: </label>
                    <input type="button" value="Normal" onClick="etiquetas(this.form.Impresion, 'normal')"/>
                    </center>
                </div>

            	<p><label for="Impresion">Introduce lo que quieras imprimir: </label><br>
            	<textarea id="Impresion" name="Impresion" cols="60" rows="10" ><?php echo $Imprimir ?></textarea><br/>
                <input type="button" value="BORRAR" onClick="etiquetas(this.form.Impresion, 'borrar')"/><br/>
            	<input type="submit" value="Imprimir" /></p><br/>
            </div><br>
        </form>
    </div>

    <!-- Parte de PHP (validar que se hayan realizado todos los pasos) -->
    <?php
		$Imprimir = $_GET[Impresion];
		$puerto = $_GET[puerto];

		$b=false;
		if($Imprimir == ""){
			$b = false;
		}else{
			$b = true;
		}
		if($b==true){
			if($puerto == ""){
				$b = false;
				echo "<script language='JavaScript'>
				alert('Debes escoger un puerto.');
				</script>";
			}
		}
	?>

	<!-- APPLET de JAVA (Solo se ejecutara cuando se hayan realizado todos los pasos) -->
	<?php if($b==true){ ?>
    <div id="applet">
        <applet code="AppletImp" archive="SerialPort.jar" name="applet" width="240" height="50">
        No puedes imprimir...
            <param name="Imprimir" value='<?php echo $Imprimir; ?>'/>
            <param name="puerto" value='<?php echo $puerto; ?>'/>
        </applet>
    </div>
    <?php }	?>

</body>
</html>