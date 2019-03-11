<?php

$config = array(
'+/',
'-/*',
'+/cliente/jquery/jquery-1.7.1.mod.js',
'+/cliente/findHost.js'
);

include('gen_manifest.php');

chdir('../..');

genManifest($config, 'gtpvSat.appcache', true/*outputRelative*/);

?>
<pre>
ok
</pre>