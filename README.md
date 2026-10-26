# CatrinART

Filtro web de realidad aumentada: dibuja sobre tu rostro un maquillaje de Catrina inspirado en el Día de Muertos. Toma fotos, graba video de 10 segundos y comparte por Redes sociales con #CatrinaAR y #DiaDeMuertos. No guarda datos de los usuarios.


## Estado: fase 1
- Hecho: rostros de personas (hasta 3 a la vez), estilo Catrina dibujado con código (arte original), foto, video, compartir, aviso de navegadores internos, splash y páginas legales.
- Pendiente: selector de estilo (Catrín, niña, niño), mascotas, retoque del arte con base en pruebas reales.
- NO probado: cámara en celular real, rendimiento en gama media y la carga del modelo. Se probó solo la lógica de dibujo con un rostro simulado.

## Antes de usarlo: descarga el modelo (una vez)
Sigue `models/LEEME.txt`: guarda `face_landmarker.task` dentro de `models/`. Sin ese archivo se ve solo el video.

## Estructura de js/ (orden de carga en index.html)
config.js (ajustes) · state.js · inapp.js · face.js (MediaPipe Face Landmarker) · camera.js · catrina.js (maquillaje y bucle) · share.js · capture.js · main.js

## Probar y publicar
`python3 -m http.server 8000` y abre http://localhost:8000 (la cámara exige HTTPS o localhost; en celular usa un túnel como cloudflared). Es un sitio estático: sube la carpeta a Netlify. Después pon tu dirección en `SITE_URL` (js/config.js) y agrega las etiquetas og:url y og:image en index.html.

## Ajustes útiles (js/config.js)
MAX_FACES (rostros), DETECT_EVERY_MS y FACE_INPUT_SIDE (rendimiento), SHARE_TEXT, HASHTAGS.

## Terceros declarados en privacidad.html
jsDelivr (librería y WASM de MediaPipe) y Google Fonts. El modelo va en tu propio sitio.

## Maquillaje
- **Malla con textura (principal):** `assets/catrina-textura.svg` se estira sobre la malla facial (`js/malla.js`, datos en `js/malla-datos.js`, generados del `canonical_face_model.obj` de MediaPipe). El SVG está en el espacio UV: se diseña sobre `canonical_face_model_uv_visualization.png` como guía. Fondo transparente, 1024x1024, sin filtros ni imágenes incrustadas.
- **Corona y respaldo:** `js/maquillaje.js` dibuja la corona de flores y, si la malla no carga, todo el maquillaje.
