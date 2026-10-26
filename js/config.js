/* ==================================================
   CatrinART
   MÓDULO: CONFIGURACIÓN GLOBAL (CONFIG)
   ==================================================

   ÍNDICE:
   01. Parámetros de Grabación y Resolución Gráfica
   02. Configuración de Mensajes, Hashtags y Enlaces Sociales

   ================================================== */


/* ============ CONFIGURACIÓN CENTRAL DE LA APLICACIÓN ============ */
// Este archivo agrupa todos los parámetros clave para personalizaciones rápidas sin modificar la lógica del sistema.
const CONFIG = {
  
  /* ============ 01. PARÁMETROS DE GRABACIÓN Y RESOLUCIÓN GRÁFICA ============ */
  RECORD_SECONDS: 10,           // Duración predeterminada de la grabación de video (en segundos)
  MAX_FACES: 3,                // Rostros simultáneos (más rostros = más carga en celulares de gama media)
  DETECT_EVERY_MS: 66,         // Pausa mínima entre detecciones (66 ms ≈ 15 por segundo)
  FACE_INPUT_SIDE: 480,        // Lado largo de la imagen que ve el modelo (menor = más rápido)
  FACE_MODEL: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',   // Modelo alojado en este sitio (ver models/LEEME.txt)
  MEDIAPIPE_MJS: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
  MEDIAPIPE_WASM: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
  TEXTURA_SVG: 'assets/catrina-textura.svg',   // Diseño del maquillaje sobre la malla (ver README)
  DISENO_COMPLETO: 'assets/catrina-diseno.png',   // Respaldo: diseño completo (calavera + flores) si la malla/textura no carga. Puedes usar un .svg o .png transparente
  DISENO_FLORES: 'assets/catrina-flores.png',     // Solo las flores y hojas (sin calavera): se dibujan sobre la malla en lugar de las flores hechas con código
  TEXTURA_PX: 1024,            // Resolución a la que se rasteriza el SVG (512 en celulares muy lentos)
  MALLA_CUBRIR_OJOS: true,     // true: la textura cubre también los ojos (la calavera no deja ver los ojos reales)
  MALLA_CUBRIR_BOCA: false,    // false: al abrir la boca se ve la boca real; true: la textura la cubre también
  ADORNOS_SOBRE_CALAVERA: ['frente', 'mejillas', 'barbilla', 'corona'],   // Capas de maquillaje sobre la textura; también: 'cuencas', 'nariz', 'boca'
  MAX_CANVAS_SIDE: 1280,       // Resolución máxima del lado más largo para la foto o video final (en píxeles)
  FILE_PREFIX: 'catrinart',     // Prefijo asignado en el nombre de los archivos multimedia descargados
  REAR_ZOOM: 1,                // Zoom de la cámara trasera (1 = sin zoom; 0.5 = más abierto, si el dispositivo lo permite)

  /* ============ 02. CONFIGURACIÓN DE MENSAJES, HASHTAGS Y ENLACES SOCIALES ============ */
  // Texto predeterminado para compartir, compatible con saltos de línea (\n) y negritas (*texto*)
  SHARE_TEXT: `*¡Ven al Centro Cultural Teopanzolco y crea tu propia CatrinART!* 💀

¡Anímate a tomar la tuya, vive la tradición y compártela con todos tus amigos! ✨`,

  HASHTAGS: ['CCT', 'CatrinART', 'Miquixtli'], // Etiquetas (hashtags) asociadas

  // Mensaje amistoso al tocar el nombre «CatrinART» (o el botón de compartir de la cabecera). El enlace se agrega al final.
  APP_SHARE_TITLE: 'CatrinART',
  APP_SHARE_TEXT: `¡Hola! 💀🌼 Te invito a crear tu propia CatrinART con realidad aumentada, cortesía del Centro Cultural Teopanzolco. Es gratis y se usa desde tu celular. ¡Anímate y compártela con tus amigos! ✨`,
  
  SITE_URL: 'https://catrina-ar.netlify.app/',                               // URL pública de despliegue (se incluye automáticamente al compartir enlaces)
  
  X_INTENT_URL: 'https://x.com/intent/tweet', // URL base oficial para los intents de publicación en la red social X
  WHATSAPP_URL: 'https://api.whatsapp.com/send',   // URL base oficial para la API de mensajes de WhatsApp
};