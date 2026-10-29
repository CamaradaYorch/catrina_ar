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
  
  /* ============ GOOGLE ANALYTICS 4 (100% GRATUITO) ============ */
  GA_MEASUREMENT_ID: 'G-9DDCDDFES5',

  /* ============ 01. PARÁMETROS DE GRABACIÓN Y RESOLUCIÓN GRÁFICA ============ */
  RECORD_SECONDS: 10,           // Duración predeterminada de la grabación de video (en segundos)
  MAX_FACES: 3,                // Rostros simultáneos (hasta 3 personas)
  DETECT_EVERY_MS: 66,         // Pausa entre detecciones de la IA (~15 por segundo, mientras el render corre a 60 FPS)
  FACE_INPUT_SIDE: 480,        // Lado largo para cámara frontal (selfie cercana, mínimo consumo de batería)
  FACE_INPUT_SIDE_REAR: 640,   // Lado largo para cámara trasera (permite detectar rostros a 1.5 - 2 metros)
  FACE_MODEL: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',   // Modelo de detección de rostros
  MEDIAPIPE_MJS: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
  MEDIAPIPE_WASM: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
  TEXTURA_SVG: 'assets/catrina-textura.svg',   // Diseño base del maquillaje sobre la malla (ver README)
  DISENO_COMPLETO: 'assets/catrina-diseno.png',   // Respaldo: diseño completo (calavera + flores)
  DISENO_FLORES: 'assets/catrina-flores.png',     // Solo las flores y hojas
  TEXTURA_PX: 512,            // 512 px corre a 60 FPS ultra fluidos en móviles (1024 en equipos potentes)
  MALLA_CUBRIR_OJOS: true,     // true: la textura cubre también los ojos
  MALLA_CUBRIR_BOCA: false,    // false: al abrir la boca se ve la boca real
  MAX_CANVAS_SIDE: 1280,       // Resolución máxima para fotos y videos exportados
  INTRO_LOGO_MS: 2500,         // Duración del logo del Centro Cultural al encender la app
  // MOSTRAR_PROTOTIPO: true,   // (modo prueba: muestra la marca roja «PROTOTIPO»)
  MOSTRAR_PROTOTIPO: false,     // true: marca de agua roja «PROTOTIPO». Ponlo en false al aprobar el proyecto
  LOGO_TEO: 'assets/logo-teo.png',   // Logo del Centro Cultural (blanco, fondo transparente)
  // MARCA_AGUA: true,   // (logo del Teopanzolco en fotos y videos: desactivado; para volver a usarlo, activa esta línea y comenta la siguiente)
  MARCA_AGUA: false,            // true: el logo del Centro Cultural se imprime abajo en fotos y videos
  MARCA_ABAJO_ALFA: 0.8,       // Opacidad del logo (0 a 1)
  MARCA_ABAJO_ANCHO: 0.34,     // Ancho del logo como fracción del ancho de la imagen
  SONIDOS: true,               // true: los botones y la cámara tienen sonido
  SONIDO_VOLUMEN: 0.3,         // Volumen de los sonidos (0 a 1)
  MARCA_EN_VIVO: false,        // false: el logo solo se ve en lo capturado; true: también en vivo
  FILE_PREFIX: 'catrinart',     // Prefijo asignado en el nombre de archivos multimedia
  REAR_ZOOM: 1.25,             // Ligero zoom en cámara trasera para compensar el gran angular y detectar rostros lejanos

  /* ============ CATÁLOGO DE ESTILOS DE CATRINA (INTERCAMBIABLES CON EL BOTÓN 🎨) ============ */
  // Funciona automáticamente tanto si hay 1 sola persona como si hay hasta 3 personas en escena.
  DISENOS: [
    {
      id: 'tradicional',
      nombre: 'Cempasúchil Tradicional',
      badge: '1',
      desc: 'Flores de cempasúchil y calavera mexicana clásica',
      colorTema: '#f2a93b',
      filtroCss: 'none',
      paletaMaquillaje: {
        tinta: '#141018', base: 'rgba(250,247,241,.95)', sombra: 'rgba(95,125,160,.32)',
        naranja: '#f08a24', ambar: '#f2a93b', amarillo: '#f4c430', rojo: '#b3202a', vino: '#7e1722', hoja: '#4f7a2a'
      }
    },
    {
      id: 'mictlan_neon',
      nombre: 'Mictlán Neón',
      badge: '2',
      desc: 'Tonos místicos violeta, cian y magenta luminiscente',
      colorTema: '#c026d3',
      filtroCss: 'hue-rotate(185deg) saturate(1.8) contrast(1.1)',
      paletaMaquillaje: {
        tinta: '#0d0714', base: 'rgba(240,235,255,.95)', sombra: 'rgba(120,40,180,.4)',
        naranja: '#ec4899', ambar: '#d946ef', amarillo: '#06b6d4', rojo: '#a855f7', vino: '#701a75', hoja: '#10b981'
      }
    },
    {
      id: 'oro_azteca',
      nombre: 'Calavera de Oro',
      badge: '3',
      desc: 'Tonos oro bruñido, ámbar brillante y rubí imperial',
      colorTema: '#eab308',
      filtroCss: 'sepia(0.7) hue-rotate(15deg) saturate(2.4) contrast(1.2)',
      paletaMaquillaje: {
        tinta: '#1c1305', base: 'rgba(255,250,230,.96)', sombra: 'rgba(180,130,20,.35)',
        naranja: '#f59e0b', ambar: '#fbbf24', amarillo: '#fde047', rojo: '#dc2626', vino: '#991b1b', hoja: '#15803d'
      }
    },
    {
      id: 'rosa_mexicano',
      nombre: 'Rosa Mexicano',
      badge: '4',
      desc: 'Rosa mexicano vibrante, alegre y festivo',
      colorTema: '#ec4899',
      filtroCss: 'sepia(0.5) hue-rotate(290deg) saturate(2.2) contrast(1.1)',
      paletaMaquillaje: {
        tinta: '#1a0a14', base: 'rgba(255,240,246,.95)', sombra: 'rgba(200,60,130,.35)',
        naranja: '#f472b6', ambar: '#ec4899', amarillo: '#fde047', rojo: '#be185d', vino: '#831843', hoja: '#16a34a'
      }
    },
    {
      id: 'jade_olmeca',
      nombre: 'Jade Olmeca',
      badge: '5',
      desc: 'Verde jade de las culturas mesoamericanas',
      colorTema: '#22c55e',
      filtroCss: 'sepia(0.6) hue-rotate(75deg) saturate(1.8) contrast(1.1)',
      paletaMaquillaje: {
        tinta: '#07140c', base: 'rgba(240,255,244,.95)', sombra: 'rgba(30,140,80,.35)',
        naranja: '#34d399', ambar: '#10b981', amarillo: '#facc15', rojo: '#047857', vino: '#064e3b', hoja: '#15803d'
      }
    }
  ],

  /* ============ 02. CONFIGURACIÓN DE MENSAJES, HASHTAGS Y ENLACES SOCIALES ============ */
  // Texto predeterminado para compartir, compatible con saltos de línea (\n) y negritas (*texto*)
  // ---- Versión anterior (desactivada) ----
  //   SHARE_TEXT: `*¡Ven al Centro Cultural Teopanzolco y crea tu propia CatrinART!* 💀
  //
  // ¡Anímate a tomar la tuya, vive la tradición y compártela con todos tus amigos! ✨`,
  //
  //   HASHTAGS: ['CCT', 'CatrinART', 'Miquixtli'], // Etiquetas (hashtags) asociadas
  //
  //   // Mensaje amistoso al tocar el nombre «CatrinART» (o el botón de compartir de la cabecera). El enlace se agrega al final.
  //   APP_SHARE_TITLE: 'CatrinART',
  //   APP_SHARE_TEXT: `¡Hola! 💀🌼 Te invito a crear tu propia CatrinART con realidad aumentada, cortesía del Centro Cultural Teopanzolco. Es gratis y se usa desde tu celular. ¡Anímate y compártela con tus amigos! ✨`,
  //
  //   SITE_URL: 'https://catrina-ar.netlify.app/',                               // URL pública de despliegue (se incluye automáticamente al compartir enlaces)
  // ---- Fin versión anterior ----

  // Título que ven los usuarios en el menú de compartir
  SHARE_TITLE: 'CatrinART - Experiencia de Realidad Aumentada',
  SHARE_TEXT: `*¡Crea tu propia CatrinART!* 💀

CatrinART - Experiencia de Realidad Aumentada. ¡Anímate a tomar la tuya, vive la tradición y compártela con todos tus amigos! ✨`,

  HASHTAGS: ['Miquixtli', 'CatrinART', 'DiaDeMuertos'],   // Etiquetas (hashtags) asociadas

  // Mensaje amistoso al tocar el nombre «CatrinART» (o el botón de compartir de la cabecera). El enlace se agrega al final.
  APP_SHARE_TITLE: 'CatrinART - Experiencia de Realidad Aumentada',
  APP_SHARE_TEXT: `¡Hola! 💀🌼 Te invito a vivir CatrinART, una experiencia de realidad aumentada para Día de Muertos. Es gratis y se usa desde tu celular. ¡Anímate y compártela con tus amigos! ✨`,

  SITE_URL: 'https://catrina-ar.netlify.app/',   // URL pública de despliegue (se incluye automáticamente al compartir enlaces)

  // Contador de usuarios (se muestra en la consola del navegador). Servicio CounterAPI v2: crea una cuenta en counterapi.dev,
  // un workspace y una clave, y pon aquí el nombre del workspace. Vacío = solo cuenta en cada dispositivo.
  COUNTER_WORKSPACE: '',
  COUNTER_TOKEN: '',

  X_INTENT_URL: 'https://x.com/intent/tweet', // URL base oficial para los intents de publicación en la red social X
  WHATSAPP_URL: 'https://api.whatsapp.com/send',   // URL base oficial para la API de mensajes de WhatsApp
};