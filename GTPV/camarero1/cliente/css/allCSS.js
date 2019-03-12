H = (window.H || {});
H.CSSData = (H.CSSData || []);
H.CSSData.push({
path:
"/gtpv/gtpv.css",
content:
"/*CSS aplicado a todos los botones\n\
*Carga imagen png semitransparente y la expande para ocupar todo el espacio disponible\n\
*Dos estados: normal, pulsado\n\
*/\n\
\n\
* { margin: 0px; }         /* (chrome) margin 2px en button 0em getOW */\n\
\n\
html { font-size: 14px; }\n\
body { font-family: Trebuchet MS, Tahoma, Verdana, Arial, sans-serif; font-size: 1.1em; }\n\
\n\
\n\
/*button.buttonPuerta {\n\
background-image: url(img/bot.png) , url(img/iconoPuerta.png);\n\
background-position: center bottom, 8px center; \n\
-o-background-size: 100% 100%,contain;\n\
-webkit-background-size: 100% 100%, contain;\n\
-moz-background-size: 100% 100%,contain;\n\
}\n\
button.buttonPuerta:active {\n\
background-image: url(img/bot_pulsado.png) , url(img/iconoPuerta.png);\n\
}\n\
button.buttonPuerta.g-state-active:active {\n\
background-image: url(img/bot.png) , url(img/iconoPuerta.png);\n\
}\n\
button.buttonPuerta.g-state-active:active {\n\
background-image: url(img/bot_pulsado.png) , url(img/iconoPuerta.png);\n\
}\n\
\n\
button.buttonVenda {\n\
background-image: url(img/bot.png) , url(img/iconoVenda.png);\n\
background-position: center bottom, 8px center; \n\
-o-background-size: 100% 100%,contain;\n\
-webkit-background-size: 100% 100%,contain;\n\
-moz-background-size: 100% 100%,contain;\n\
}\n\
button.buttonEditorTeclats  {\n\
background-image: url(img/bot.png) , url(img/iconoEditorTeclats.png);\n\
background-position: center bottom, 8px center; \n\
-o-background-size: 100% 100%,contain;\n\
-webkit-background-size: 100% 100%,contain;\n\
-moz-background-size: 100% 100%,contain;\n\
}\n\
button.buttonCajaFuerte {\n\
background-image: url(img/bot.png) , url(img/iconoCajaFuerte.png);\n\
background-position: center bottom, 8px center; \n\
-o-background-size: 100% 100%,contain;\n\
-webkit-background-size: 100% 100%,contain;\n\
-moz-background-size: 100% 100%,contain;\n\
}\n\
*/\n\
\n\
button.but_TeclatsTpv {\n\
background-image: url(img/bot_TeclatsTpv.png) ;\n\
}\n\
\n\
\n\
/*.ui-widget-content { border: 1px solid #dddddd; background: #eeeeee url(ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top repeat-x; color: #333333; }*/\n\
.g-widget-content { \n\
	/*Gradiente blanco-gris*/\n\
	border: 1px solid #dddddd;\n\
	background: #ffffff; /* Old browsers */\n\
	background: -moz-linear-gradient(top, #ffffff 0%, #e5e5e5 100%); /* FF3.6+ */\n\
	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffffff), color-stop(100%,#e5e5e5)); /* Chrome,Safari4+ */\n\
	background: -webkit-linear-gradient(top, #ffffff 0%,#e5e5e5 100%); /* Chrome10+,Safari5.1+ */\n\
	background: -o-linear-gradient(top, #ffffff 0%,#e5e5e5 100%); /* Opera11.10+ */\n\
	background: -ms-linear-gradient(top, #ffffff 0%,#e5e5e5 100%); /* IE10+ */\n\
	filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#e5e5e5',GradientType=0 ); /* IE6-9 */\n\
	background: linear-gradient(top, #ffffff 0%,#e5e5e5 100%); /* W3C */\n\
	color: #333333; \n\
}\n\
\n\
.g-widget-header { border: 1px solid #e78f08; background: lightgray; color: #ffffff; font-weight: bold; }\n\
\n\
.g-state-default { border: 1px solid #cccccc; background-color: #f6f6f6; font-weight: bold; color: #1c94c4; }\n\
.g-state-active { border: 1px solid #fbd850; background-color: #ffffff; font-weight: bold; color: #eb8f00; }\n\
\n\
.g-button {\n\
	border:0px; \n\
	display:inline-block;\n\
	background-image: url(img/bot.png);\n\
	background-repeat: no-repeat;\n\
	background-position: center bottom; \n\
	font-family: Trebuchet MS, Verdana, Arial, sans-serif;\n\
	font-weight: bold;\n\
	font-size:15px;\n\
	text-align:center;\n\
	overflow:hidden;\n\
	background-size: 100% 100%;\n\
}\n\
\n\
.g-button:active{\n\
	background-image: url(img/bot_pulsado.png);\n\
}\n\
.g-button:disabled{\n\
	background-image: url(img/bot.png);\n\
}\n\
\n\
/*button.g-state-default { \n\
	background-image: url(img/bot.png) ;\n\
}\n\
button.g-state-default:active{\n\
	background-image: url(img/bot_pulsado.png);\n\
}*/\n\
.g-button.g-state-active {\n\
	border:0px; \n\
	background-image: url(img/bot_activo.png) ;\n\
}\n\
.g-button.g-state-active:active {\n\
	background-image: url(img/bot_pulsado.png) ;\n\
}\n\
\n\
\n\
.ticket_recent_mod {\n\
	color: #FF0000;\n\
}\n\
"}
);
H.CSSData.push({
path:
"/ui-lightness/jquery-ui-1.8.13.custom.css",
content:
"/*\n\
 * jQuery UI CSS Framework 1.8.13\n\
 *\n\
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)\n\
 * Dual licensed under the MIT or GPL Version 2 licenses.\n\
 * http://jquery.org/license\n\
 *\n\
 * http://docs.jquery.com/UI/Theming/API\n\
 */\n\
\n\
/* Layout helpers\n\
----------------------------------*/\n\
.ui-helper-hidden { display: none; }\n\
.ui-helper-hidden-accessible { position: absolute !important; clip: rect(1px 1px 1px 1px); clip: rect(1px,1px,1px,1px); }\n\
.ui-helper-reset { margin: 0; padding: 0; border: 0; outline: 0; line-height: 1.3; text-decoration: none; font-size: 100%; list-style: none; }\n\
.ui-helper-clearfix:after { content: \".\"; display: block; height: 0; clear: both; visibility: hidden; }\n\
.ui-helper-clearfix { display: inline-block; }\n\
/* required comment for clearfix to work in Opera \\*/\n\
* html .ui-helper-clearfix { height:1%; }\n\
.ui-helper-clearfix { display:block; }\n\
/* end clearfix */\n\
.ui-helper-zfix { width: 100%; height: 100%; top: 0; left: 0; position: absolute; opacity: 0; filter:Alpha(Opacity=0); }\n\
\n\
\n\
/* Interaction Cues\n\
----------------------------------*/\n\
.ui-state-disabled { cursor: default !important; }\n\
\n\
\n\
/* Icons\n\
----------------------------------*/\n\
\n\
/* states and images */\n\
.ui-icon { display: block; text-indent: -99999px; overflow: hidden; background-repeat: no-repeat; }\n\
\n\
\n\
/* Misc visuals\n\
----------------------------------*/\n\
\n\
/* Overlays */\n\
.ui-widget-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }\n\
\n\
\n\
/*\n\
 * jQuery UI CSS Framework 1.8.13\n\
 *\n\
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)\n\
 * Dual licensed under the MIT or GPL Version 2 licenses.\n\
 * http://jquery.org/license\n\
 *\n\
 * http://docs.jquery.com/UI/Theming/API\n\
 *\n\
 * To view and modify this theme, visit http://jqueryui.com/themeroller/?ffDefault=Trebuchet%20MS,%20Tahoma,%20Verdana,%20Arial,%20sans-serif&fwDefault=bold&fsDefault=1.1em&cornerRadius=4px&bgColorHeader=f6a828&bgTextureHeader=12_gloss_wave.png&bgImgOpacityHeader=35&borderColorHeader=e78f08&fcHeader=ffffff&iconColorHeader=ffffff&bgColorContent=eeeeee&bgTextureContent=03_highlight_soft.png&bgImgOpacityContent=100&borderColorContent=dddddd&fcContent=333333&iconColorContent=222222&bgColorDefault=f6f6f6&bgTextureDefault=02_glass.png&bgImgOpacityDefault=100&borderColorDefault=cccccc&fcDefault=1c94c4&iconColorDefault=ef8c08&bgColorHover=fdf5ce&bgTextureHover=02_glass.png&bgImgOpacityHover=100&borderColorHover=fbcb09&fcHover=c77405&iconColorHover=ef8c08&bgColorActive=ffffff&bgTextureActive=02_glass.png&bgImgOpacityActive=65&borderColorActive=fbd850&fcActive=eb8f00&iconColorActive=ef8c08&bgColorHighlight=ffe45c&bgTextureHighlight=03_highlight_soft.png&bgImgOpacityHighlight=75&borderColorHighlight=fed22f&fcHighlight=363636&iconColorHighlight=228ef1&bgColorError=b81900&bgTextureError=08_diagonals_thick.png&bgImgOpacityError=18&borderColorError=cd0a0a&fcError=ffffff&iconColorError=ffd27a&bgColorOverlay=666666&bgTextureOverlay=08_diagonals_thick.png&bgImgOpacityOverlay=20&opacityOverlay=50&bgColorShadow=000000&bgTextureShadow=01_flat.png&bgImgOpacityShadow=10&opacityShadow=20&thicknessShadow=5px&offsetTopShadow=-5px&offsetLeftShadow=-5px&cornerRadiusShadow=5px\n\
 */\n\
\n\
\n\
/* Component containers\n\
----------------------------------*/\n\
.ui-widget { font-family: Trebuchet MS, Tahoma, Verdana, Arial, sans-serif; font-size: 1.1em; }\n\
.ui-widget .ui-widget { font-size: 1em; }\n\
.ui-widget input, .ui-widget select, .ui-widget textarea, .ui-widget button { font-family: Trebuchet MS, Tahoma, Verdana, Arial, sans-serif; font-size: 1em; }\n\
.ui-widget-content { border: 1px solid #dddddd; background: #eeeeee url(images/ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top repeat-x; color: #333333; }\n\
.ui-widget-content a { color: #333333; }\n\
.ui-widget-header { border: 1px solid #e78f08; background: #f6a828 url(images/ui-bg_gloss-wave_35_f6a828_500x100.png) 50% 50% repeat-x; color: #ffffff; font-weight: bold; }\n\
.ui-widget-header a { color: #ffffff; }\n\
\n\
/* Interaction states\n\
----------------------------------*/\n\
.ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default { border: 1px solid #cccccc; background: #f6f6f6 url(images/ui-bg_glass_100_f6f6f6_1x400.png) 50% 50% repeat-x; font-weight: bold; color: #1c94c4; }\n\
.ui-state-default a, .ui-state-default a:link, .ui-state-default a:visited { color: #1c94c4; text-decoration: none; }\n\
.ui-state-hover, .ui-widget-content .ui-state-hover, .ui-widget-header .ui-state-hover, .ui-state-focus, .ui-widget-content .ui-state-focus, .ui-widget-header .ui-state-focus { border: 1px solid #fbcb09; background: #fdf5ce url(images/ui-bg_glass_100_fdf5ce_1x400.png) 50% 50% repeat-x; font-weight: bold; color: #c77405; }\n\
.ui-state-hover a, .ui-state-hover a:hover { color: #c77405; text-decoration: none; }\n\
.ui-state-active, .ui-widget-content .ui-state-active, .ui-widget-header .ui-state-active { border: 1px solid #fbd850; background: #ffffff url(images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: bold; color: #eb8f00; }\n\
.ui-state-active a, .ui-state-active a:link, .ui-state-active a:visited { color: #eb8f00; text-decoration: none; }\n\
.ui-widget :active { outline: none; }\n\
\n\
/* Interaction Cues\n\
----------------------------------*/\n\
.ui-state-highlight, .ui-widget-content .ui-state-highlight, .ui-widget-header .ui-state-highlight  {border: 1px solid #fed22f; background: #ffe45c url(images/ui-bg_highlight-soft_75_ffe45c_1x100.png) 50% top repeat-x; color: #363636; }\n\
.ui-state-highlight a, .ui-widget-content .ui-state-highlight a,.ui-widget-header .ui-state-highlight a { color: #363636; }\n\
.ui-state-error, .ui-widget-content .ui-state-error, .ui-widget-header .ui-state-error {border: 1px solid #cd0a0a; background: #b81900 url(images/ui-bg_diagonals-thick_18_b81900_40x40.png) 50% 50% repeat; color: #ffffff; }\n\
.ui-state-error a, .ui-widget-content .ui-state-error a, .ui-widget-header .ui-state-error a { color: #ffffff; }\n\
.ui-state-error-text, .ui-widget-content .ui-state-error-text, .ui-widget-header .ui-state-error-text { color: #ffffff; }\n\
.ui-priority-primary, .ui-widget-content .ui-priority-primary, .ui-widget-header .ui-priority-primary { font-weight: bold; }\n\
.ui-priority-secondary, .ui-widget-content .ui-priority-secondary,  .ui-widget-header .ui-priority-secondary { opacity: .7; filter:Alpha(Opacity=70); font-weight: normal; }\n\
.ui-state-disabled, .ui-widget-content .ui-state-disabled, .ui-widget-header .ui-state-disabled { opacity: .35; filter:Alpha(Opacity=35); background-image: none; }\n\
\n\
/* Icons\n\
----------------------------------*/\n\
\n\
/* states and images */\n\
.ui-icon { width: 16px; height: 16px; background-image: url(images/ui-icons_222222_256x240.png); }\n\
.ui-widget-content .ui-icon {background-image: url(images/ui-icons_222222_256x240.png); }\n\
.ui-widget-header .ui-icon {background-image: url(images/ui-icons_ffffff_256x240.png); }\n\
.ui-state-default .ui-icon { background-image: url(images/ui-icons_ef8c08_256x240.png); }\n\
.ui-state-hover .ui-icon, .ui-state-focus .ui-icon {background-image: url(images/ui-icons_ef8c08_256x240.png); }\n\
.ui-state-active .ui-icon {background-image: url(images/ui-icons_ef8c08_256x240.png); }\n\
.ui-state-highlight .ui-icon {background-image: url(images/ui-icons_228ef1_256x240.png); }\n\
.ui-state-error .ui-icon, .ui-state-error-text .ui-icon {background-image: url(images/ui-icons_ffd27a_256x240.png); }\n\
\n\
/* positioning */\n\
.ui-icon-carat-1-n { background-position: 0 0; }\n\
.ui-icon-carat-1-ne { background-position: -16px 0; }\n\
.ui-icon-carat-1-e { background-position: -32px 0; }\n\
.ui-icon-carat-1-se { background-position: -48px 0; }\n\
.ui-icon-carat-1-s { background-position: -64px 0; }\n\
.ui-icon-carat-1-sw { background-position: -80px 0; }\n\
.ui-icon-carat-1-w { background-position: -96px 0; }\n\
.ui-icon-carat-1-nw { background-position: -112px 0; }\n\
.ui-icon-carat-2-n-s { background-position: -128px 0; }\n\
.ui-icon-carat-2-e-w { background-position: -144px 0; }\n\
.ui-icon-triangle-1-n { background-position: 0 -16px; }\n\
.ui-icon-triangle-1-ne { background-position: -16px -16px; }\n\
.ui-icon-triangle-1-e { background-position: -32px -16px; }\n\
.ui-icon-triangle-1-se { background-position: -48px -16px; }\n\
.ui-icon-triangle-1-s { background-position: -64px -16px; }\n\
.ui-icon-triangle-1-sw { background-position: -80px -16px; }\n\
.ui-icon-triangle-1-w { background-position: -96px -16px; }\n\
.ui-icon-triangle-1-nw { background-position: -112px -16px; }\n\
.ui-icon-triangle-2-n-s { background-position: -128px -16px; }\n\
.ui-icon-triangle-2-e-w { background-position: -144px -16px; }\n\
.ui-icon-arrow-1-n { background-position: 0 -32px; }\n\
.ui-icon-arrow-1-ne { background-position: -16px -32px; }\n\
.ui-icon-arrow-1-e { background-position: -32px -32px; }\n\
.ui-icon-arrow-1-se { background-position: -48px -32px; }\n\
.ui-icon-arrow-1-s { background-position: -64px -32px; }\n\
.ui-icon-arrow-1-sw { background-position: -80px -32px; }\n\
.ui-icon-arrow-1-w { background-position: -96px -32px; }\n\
.ui-icon-arrow-1-nw { background-position: -112px -32px; }\n\
.ui-icon-arrow-2-n-s { background-position: -128px -32px; }\n\
.ui-icon-arrow-2-ne-sw { background-position: -144px -32px; }\n\
.ui-icon-arrow-2-e-w { background-position: -160px -32px; }\n\
.ui-icon-arrow-2-se-nw { background-position: -176px -32px; }\n\
.ui-icon-arrowstop-1-n { background-position: -192px -32px; }\n\
.ui-icon-arrowstop-1-e { background-position: -208px -32px; }\n\
.ui-icon-arrowstop-1-s { background-position: -224px -32px; }\n\
.ui-icon-arrowstop-1-w { background-position: -240px -32px; }\n\
.ui-icon-arrowthick-1-n { background-position: 0 -48px; }\n\
.ui-icon-arrowthick-1-ne { background-position: -16px -48px; }\n\
.ui-icon-arrowthick-1-e { background-position: -32px -48px; }\n\
.ui-icon-arrowthick-1-se { background-position: -48px -48px; }\n\
.ui-icon-arrowthick-1-s { background-position: -64px -48px; }\n\
.ui-icon-arrowthick-1-sw { background-position: -80px -48px; }\n\
.ui-icon-arrowthick-1-w { background-position: -96px -48px; }\n\
.ui-icon-arrowthick-1-nw { background-position: -112px -48px; }\n\
.ui-icon-arrowthick-2-n-s { background-position: -128px -48px; }\n\
.ui-icon-arrowthick-2-ne-sw { background-position: -144px -48px; }\n\
.ui-icon-arrowthick-2-e-w { background-position: -160px -48px; }\n\
.ui-icon-arrowthick-2-se-nw { background-position: -176px -48px; }\n\
.ui-icon-arrowthickstop-1-n { background-position: -192px -48px; }\n\
.ui-icon-arrowthickstop-1-e { background-position: -208px -48px; }\n\
.ui-icon-arrowthickstop-1-s { background-position: -224px -48px; }\n\
.ui-icon-arrowthickstop-1-w { background-position: -240px -48px; }\n\
.ui-icon-arrowreturnthick-1-w { background-position: 0 -64px; }\n\
.ui-icon-arrowreturnthick-1-n { background-position: -16px -64px; }\n\
.ui-icon-arrowreturnthick-1-e { background-position: -32px -64px; }\n\
.ui-icon-arrowreturnthick-1-s { background-position: -48px -64px; }\n\
.ui-icon-arrowreturn-1-w { background-position: -64px -64px; }\n\
.ui-icon-arrowreturn-1-n { background-position: -80px -64px; }\n\
.ui-icon-arrowreturn-1-e { background-position: -96px -64px; }\n\
.ui-icon-arrowreturn-1-s { background-position: -112px -64px; }\n\
.ui-icon-arrowrefresh-1-w { background-position: -128px -64px; }\n\
.ui-icon-arrowrefresh-1-n { background-position: -144px -64px; }\n\
.ui-icon-arrowrefresh-1-e { background-position: -160px -64px; }\n\
.ui-icon-arrowrefresh-1-s { background-position: -176px -64px; }\n\
.ui-icon-arrow-4 { background-position: 0 -80px; }\n\
.ui-icon-arrow-4-diag { background-position: -16px -80px; }\n\
.ui-icon-extlink { background-position: -32px -80px; }\n\
.ui-icon-newwin { background-position: -48px -80px; }\n\
.ui-icon-refresh { background-position: -64px -80px; }\n\
.ui-icon-shuffle { background-position: -80px -80px; }\n\
.ui-icon-transfer-e-w { background-position: -96px -80px; }\n\
.ui-icon-transferthick-e-w { background-position: -112px -80px; }\n\
.ui-icon-folder-collapsed { background-position: 0 -96px; }\n\
.ui-icon-folder-open { background-position: -16px -96px; }\n\
.ui-icon-document { background-position: -32px -96px; }\n\
.ui-icon-document-b { background-position: -48px -96px; }\n\
.ui-icon-note { background-position: -64px -96px; }\n\
.ui-icon-mail-closed { background-position: -80px -96px; }\n\
.ui-icon-mail-open { background-position: -96px -96px; }\n\
.ui-icon-suitcase { background-position: -112px -96px; }\n\
.ui-icon-comment { background-position: -128px -96px; }\n\
.ui-icon-person { background-position: -144px -96px; }\n\
.ui-icon-print { background-position: -160px -96px; }\n\
.ui-icon-trash { background-position: -176px -96px; }\n\
.ui-icon-locked { background-position: -192px -96px; }\n\
.ui-icon-unlocked { background-position: -208px -96px; }\n\
.ui-icon-bookmark { background-position: -224px -96px; }\n\
.ui-icon-tag { background-position: -240px -96px; }\n\
.ui-icon-home { background-position: 0 -112px; }\n\
.ui-icon-flag { background-position: -16px -112px; }\n\
.ui-icon-calendar { background-position: -32px -112px; }\n\
.ui-icon-cart { background-position: -48px -112px; }\n\
.ui-icon-pencil { background-position: -64px -112px; }\n\
.ui-icon-clock { background-position: -80px -112px; }\n\
.ui-icon-disk { background-position: -96px -112px; }\n\
.ui-icon-calculator { background-position: -112px -112px; }\n\
.ui-icon-zoomin { background-position: -128px -112px; }\n\
.ui-icon-zoomout { background-position: -144px -112px; }\n\
.ui-icon-search { background-position: -160px -112px; }\n\
.ui-icon-wrench { background-position: -176px -112px; }\n\
.ui-icon-gear { background-position: -192px -112px; }\n\
.ui-icon-heart { background-position: -208px -112px; }\n\
.ui-icon-star { background-position: -224px -112px; }\n\
.ui-icon-link { background-position: -240px -112px; }\n\
.ui-icon-cancel { background-position: 0 -128px; }\n\
.ui-icon-plus { background-position: -16px -128px; }\n\
.ui-icon-plusthick { background-position: -32px -128px; }\n\
.ui-icon-minus { background-position: -48px -128px; }\n\
.ui-icon-minusthick { background-position: -64px -128px; }\n\
.ui-icon-close { background-position: -80px -128px; }\n\
.ui-icon-closethick { background-position: -96px -128px; }\n\
.ui-icon-key { background-position: -112px -128px; }\n\
.ui-icon-lightbulb { background-position: -128px -128px; }\n\
.ui-icon-scissors { background-position: -144px -128px; }\n\
.ui-icon-clipboard { background-position: -160px -128px; }\n\
.ui-icon-copy { background-position: -176px -128px; }\n\
.ui-icon-contact { background-position: -192px -128px; }\n\
.ui-icon-image { background-position: -208px -128px; }\n\
.ui-icon-video { background-position: -224px -128px; }\n\
.ui-icon-script { background-position: -240px -128px; }\n\
.ui-icon-alert { background-position: 0 -144px; }\n\
.ui-icon-info { background-position: -16px -144px; }\n\
.ui-icon-notice { background-position: -32px -144px; }\n\
.ui-icon-help { background-position: -48px -144px; }\n\
.ui-icon-check { background-position: -64px -144px; }\n\
.ui-icon-bullet { background-position: -80px -144px; }\n\
.ui-icon-radio-off { background-position: -96px -144px; }\n\
.ui-icon-radio-on { background-position: -112px -144px; }\n\
.ui-icon-pin-w { background-position: -128px -144px; }\n\
.ui-icon-pin-s { background-position: -144px -144px; }\n\
.ui-icon-play { background-position: 0 -160px; }\n\
.ui-icon-pause { background-position: -16px -160px; }\n\
.ui-icon-seek-next { background-position: -32px -160px; }\n\
.ui-icon-seek-prev { background-position: -48px -160px; }\n\
.ui-icon-seek-end { background-position: -64px -160px; }\n\
.ui-icon-seek-start { background-position: -80px -160px; }\n\
/* ui-icon-seek-first is deprecated, use ui-icon-seek-start instead */\n\
.ui-icon-seek-first { background-position: -80px -160px; }\n\
.ui-icon-stop { background-position: -96px -160px; }\n\
.ui-icon-eject { background-position: -112px -160px; }\n\
.ui-icon-volume-off { background-position: -128px -160px; }\n\
.ui-icon-volume-on { background-position: -144px -160px; }\n\
.ui-icon-power { background-position: 0 -176px; }\n\
.ui-icon-signal-diag { background-position: -16px -176px; }\n\
.ui-icon-signal { background-position: -32px -176px; }\n\
.ui-icon-battery-0 { background-position: -48px -176px; }\n\
.ui-icon-battery-1 { background-position: -64px -176px; }\n\
.ui-icon-battery-2 { background-position: -80px -176px; }\n\
.ui-icon-battery-3 { background-position: -96px -176px; }\n\
.ui-icon-circle-plus { background-position: 0 -192px; }\n\
.ui-icon-circle-minus { background-position: -16px -192px; }\n\
.ui-icon-circle-close { background-position: -32px -192px; }\n\
.ui-icon-circle-triangle-e { background-position: -48px -192px; }\n\
.ui-icon-circle-triangle-s { background-position: -64px -192px; }\n\
.ui-icon-circle-triangle-w { background-position: -80px -192px; }\n\
.ui-icon-circle-triangle-n { background-position: -96px -192px; }\n\
.ui-icon-circle-arrow-e { background-position: -112px -192px; }\n\
.ui-icon-circle-arrow-s { background-position: -128px -192px; }\n\
.ui-icon-circle-arrow-w { background-position: -144px -192px; }\n\
.ui-icon-circle-arrow-n { background-position: -160px -192px; }\n\
.ui-icon-circle-zoomin { background-position: -176px -192px; }\n\
.ui-icon-circle-zoomout { background-position: -192px -192px; }\n\
.ui-icon-circle-check { background-position: -208px -192px; }\n\
.ui-icon-circlesmall-plus { background-position: 0 -208px; }\n\
.ui-icon-circlesmall-minus { background-position: -16px -208px; }\n\
.ui-icon-circlesmall-close { background-position: -32px -208px; }\n\
.ui-icon-squaresmall-plus { background-position: -48px -208px; }\n\
.ui-icon-squaresmall-minus { background-position: -64px -208px; }\n\
.ui-icon-squaresmall-close { background-position: -80px -208px; }\n\
.ui-icon-grip-dotted-vertical { background-position: 0 -224px; }\n\
.ui-icon-grip-dotted-horizontal { background-position: -16px -224px; }\n\
.ui-icon-grip-solid-vertical { background-position: -32px -224px; }\n\
.ui-icon-grip-solid-horizontal { background-position: -48px -224px; }\n\
.ui-icon-gripsmall-diagonal-se { background-position: -64px -224px; }\n\
.ui-icon-grip-diagonal-se { background-position: -80px -224px; }\n\
\n\
\n\
/* Misc visuals\n\
----------------------------------*/\n\
\n\
/* Corner radius */\n\
.ui-corner-tl { -moz-border-radius-topleft: 4px; -webkit-border-top-left-radius: 4px; border-top-left-radius: 4px; }\n\
.ui-corner-tr { -moz-border-radius-topright: 4px; -webkit-border-top-right-radius: 4px; border-top-right-radius: 4px; }\n\
.ui-corner-bl { -moz-border-radius-bottomleft: 4px; -webkit-border-bottom-left-radius: 4px; border-bottom-left-radius: 4px; }\n\
.ui-corner-br { -moz-border-radius-bottomright: 4px; -webkit-border-bottom-right-radius: 4px; border-bottom-right-radius: 4px; }\n\
.ui-corner-top { -moz-border-radius-topleft: 4px; -webkit-border-top-left-radius: 4px; border-top-left-radius: 4px; -moz-border-radius-topright: 4px; -webkit-border-top-right-radius: 4px; border-top-right-radius: 4px; }\n\
.ui-corner-bottom { -moz-border-radius-bottomleft: 4px; -webkit-border-bottom-left-radius: 4px; border-bottom-left-radius: 4px; -moz-border-radius-bottomright: 4px; -webkit-border-bottom-right-radius: 4px; border-bottom-right-radius: 4px; }\n\
.ui-corner-right {  -moz-border-radius-topright: 4px; -webkit-border-top-right-radius: 4px; border-top-right-radius: 4px; -moz-border-radius-bottomright: 4px; -webkit-border-bottom-right-radius: 4px; border-bottom-right-radius: 4px; }\n\
.ui-corner-left { -moz-border-radius-topleft: 4px; -webkit-border-top-left-radius: 4px; border-top-left-radius: 4px; -moz-border-radius-bottomleft: 4px; -webkit-border-bottom-left-radius: 4px; border-bottom-left-radius: 4px; }\n\
.ui-corner-all { -moz-border-radius: 4px; -webkit-border-radius: 4px; border-radius: 4px; }\n\
\n\
/* Overlays */\n\
.ui-widget-overlay { background: #666666 url(images/ui-bg_diagonals-thick_20_666666_40x40.png) 50% 50% repeat; opacity: .50;filter:Alpha(Opacity=50); }\n\
.ui-widget-shadow { margin: -5px 0 0 -5px; padding: 5px; background: #000000 url(images/ui-bg_flat_10_000000_40x100.png) 50% 50% repeat-x; opacity: .20;filter:Alpha(Opacity=20); -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; }/*\n\
 * jQuery UI Dialog 1.8.13\n\
 *\n\
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)\n\
 * Dual licensed under the MIT or GPL Version 2 licenses.\n\
 * http://jquery.org/license\n\
 *\n\
 * http://docs.jquery.com/UI/Dialog#theming\n\
 */\n\
.ui-dialog { position: absolute; padding: .2em; width: 300px; overflow: hidden; }\n\
.ui-dialog .ui-dialog-titlebar { padding: .4em 1em; position: relative;  }\n\
.ui-dialog .ui-dialog-title { float: left; margin: .1em 16px .1em 0; } \n\
.ui-dialog .ui-dialog-titlebar-close { position: absolute; right: .3em; top: 50%; width: 19px; margin: -10px 0 0 0; padding: 1px; height: 18px; }\n\
.ui-dialog .ui-dialog-titlebar-close span { display: block; margin: 1px; }\n\
.ui-dialog .ui-dialog-titlebar-close:hover, .ui-dialog .ui-dialog-titlebar-close:focus { padding: 0; }\n\
.ui-dialog .ui-dialog-content { position: relative; border: 0; padding: .5em 1em; background: none; overflow: auto; zoom: 1; }\n\
.ui-dialog .ui-dialog-buttonpane { text-align: left; border-width: 1px 0 0 0; background-image: none; margin: .5em 0 0 0; padding: .3em 1em .5em .4em; }\n\
.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset { float: right; }\n\
.ui-dialog .ui-dialog-buttonpane button { margin: .5em .4em .5em 0; cursor: pointer; }\n\
.ui-dialog .ui-resizable-se { width: 14px; height: 14px; right: 3px; bottom: 3px; }\n\
.ui-draggable .ui-dialog-titlebar { cursor: move; }\n\
"}
);
