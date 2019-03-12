<?php

$config = array(
'+/',
'-/*',
'+/cliente/*',
'-/cliente/applet/*',
'+/cliente/applet/g_applet.jar',
'-/cliente/css/getAllCSS.php',
'-/cliente/css/redmond/*',
'-/cliente/jquery/*',
'+/cliente/jquery/jquery-1.7.1.mod.js',
'-/cliente/old/*',
'-/cliente/p/*'
);

include('gen_manifest.php');

chdir('../..');

genManifest($config, 'gtpv.appcache', true/*outputRelative*/);

?>
<pre>
ok
</pre>