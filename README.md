# CatrinART

<!-- Versión anterior: Filtro web de realidad aumentada del Centro Cultural Teopanzolco: -->
CatrinART - Experiencia de Realidad Aumentada: dibuja sobre tu rostro un maquillaje de Catrina inspirado en el Día de Muertos. Toma fotos, graba video de 10 segundos y compártelos con #CCT #CatrinART #Miquixtli. No guarda datos de los usuarios.

App publicada: https://catrina-ar.netlify.app/

## Estado
- Hecho: rostros (hasta 3 a la vez), malla facial con textura, flores del diseño de la Catrina, foto, video, compartir (fotos/videos y la propia app), logo del Centro Cultural al arrancar y como marca de agua, sonidos, aviso para navegadores internos de redes, splash, páginas legales y marca «PROTOTIPO».
- Pendiente: mascotas y retoque del arte con base en pruebas reales.
- Falta probar: cámara en celulares reales (iPhone y Android de gama media/baja), rendimiento y carga del modelo con conexión débil.

## Estructura
- `index.html` · `terminos.html` · `privacidad.html` · `manifest.webmanifest` · `_headers` (cabeceras de seguridad y caché para Netlify)
- `js/` (orden de carga en index.html): config · state · inapp · face · camera · maquillaje · malla-datos · malla · diseno · marca · sonido · catrina · share · capture · main
- `css/` styles.css (base) y catrina.css (identidad y ajustes)
- `assets/`: catrina-textura.svg (malla), catrina-flores.png, catrina-diseno.png, logo-teo.png, prototipo.svg, preview.jpg
- `img/`: logo.png, icons/ (favicon e íconos), at-arquitectos.png

## Probar y publicar
`python3 -m http.server 8000` y abre http://localhost:8000 (la cámara exige HTTPS o localhost; en celular usa un túnel como cloudflared). Es un sitio estático: sube la carpeta a Netlify. La dirección pública está en `SITE_URL` (js/config.js) y en las etiquetas og:url y og:image de index.html.

## Modelo de detección de rostros
Se descarga de Google Cloud Storage (`CONFIG.FACE_MODEL`). Para alojarlo en tu sitio, sigue `public/models/LEEME.txt` y actualiza privacidad.html.

## Ajustes útiles (js/config.js)
- **Google Analytics 4 (100% gratuito):** `GA_MEASUREMENT_ID: 'G-XXXXXXXXXX'`. Crea tu flujo web gratis en [Google Analytics](https://analytics.google.com) y pega tu ID para registrar visitas, fotos, videos y estilos elegidos.
- **Catálogo de estilos:** `CONFIG.DISENOS`: incluye 3 diseños (Cempasúchil Tradicional, Mictlán Neón y Calavera de Oro) que se alternan con el botón `🎨` para 1 a 3 personas simultáneas.
- **Rendimiento y fluidez (60 FPS):** La inferencia de IA está desacoplada del render principal; `TEXTURA_PX: 512` optimizado para GPU móvil.
- **Alcance cámara trasera:** `FACE_INPUT_SIDE_REAR: 640` y `REAR_ZOOM: 1.25` para captar rostros a 1.5 - 2 metros sin perder el filtro.
- Arranque: INTRO_LOGO_MS (duración del logo, 2.5 s).
- Marca «PROTOTIPO»: `MOSTRAR_PROTOTIPO: false` al aprobar el proyecto (o borra el bloque `#prototipoMarca` de index.html).
- Marca de agua del logo en fotos y videos: MARCA_AGUA, MARCA_ABAJO_ALFA, MARCA_ABAJO_ANCHO, MARCA_EN_VIVO, LOGO_TEO.
- Sonidos: SONIDOS, SONIDO_VOLUMEN.
- Compartir: SHARE_TEXT, APP_SHARE_TEXT, HASHTAGS, SITE_URL.

## Maquillaje
- **Malla multi-estilo (WebGL):** `js/malla.js` compila los estilos de `CONFIG.DISENOS` en texturas de GPU independientes. Al presionar el botón `🎨`, la textura cambia instantáneamente sin recargas.
- **Flores y respaldo (`js/diseno.js`):** `catrina-flores.png` (solo flores y hojas) se dibuja sobre la malla; `catrina-diseno.png` (calavera + flores) se usa si la malla no carga.
- **Último respaldo:** `js/maquillaje.js` dibuja con código todo el maquillaje si no cargan las imágenes, adaptando su paleta de color al estilo activo.

## Terceros declarados en privacidad.html
jsDelivr (librería y WASM de MediaPipe), Google Cloud Storage (modelo) y Google Fonts.

## Seguridad
`_headers` incluye HSTS, anti-iframe, permisos mínimos y una política CSP en modo prueba (Report-Only). Cuando la app funcione sin avisos en la consola (F12), cambia `Content-Security-Policy-Report-Only` por `Content-Security-Policy` para activarla.

## Cambios de la versión de publicación
- Pantalla de inicio: `assets/logo-app.svg` (antes el logo del Teopanzolco, que sigue en `assets/logo-teo.png` y comentado en index.html y catrina.css).
- El botón de inicio dice «INICIAR». Marca «PROTOTIPO» desactivada (`MOSTRAR_PROTOTIPO: false`). Marca de agua del logo desactivada (`MARCA_AGUA: false`).
- Pie de página: «Jorge Mera» enlaza a https://www.instagram.com/jorge_mortem/ (el bloque de AT Arquitectos quedó comentado en index.html).
- Compartir: título «CatrinART - Experiencia de Realidad Aumentada» y hashtags #Miquixtli #CatrinART #DiaDeMuertos (config.js; los textos anteriores quedaron comentados).
- Contador: se muestra en la consola del navegador (F12) y con `catrinartUsuarios()`. Para el total de todos los usuarios configura `COUNTER_WORKSPACE` (CounterAPI v2) o consulta el evento `visita_creador` en Google Analytics.
