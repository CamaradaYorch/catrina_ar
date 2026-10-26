/* ==================================================
   CatrinART
   MÓDULO: ARRANQUE Y CONTROLADOR PRINCIPAL (MAIN)
   ==================================================

   ÍNDICE:
   01. Configuración Inicial de Etiquetas y Accesibilidad (ARIA)
   02. Enlace de Eventos de la Interfaz Principal (Cámara y Controles)
   03. Manejador del Botón Global para Compartir la Aplicación
   04. Enlace de Eventos del Modal de Vista Previa y Accesibilidad por Teclado
   05. Funciones de Interfaz, Splash Screen y Secuencia de Arranque

   ================================================== */


/* ============ 01. CONFIGURACIÓN INICIAL DE ETIQUETAS Y ACCESIBILIDAD (ARIA) ============ */
// Actualiza dinámicamente el texto de la etiqueta del video usando la configuración global (ej. "Video 5 s")
$('videoLabel').textContent = `Video ${CONFIG.RECORD_SECONDS} s`;

// Asigna una etiqueta de accesibilidad (ARIA) al botón de video para lectores de pantalla
$('btnVideo').setAttribute('aria-label', `Grabar video de ${CONFIG.RECORD_SECONDS} segundos`);


/* ============ 02. ENLACE DE EVENTOS DE LA INTERFAZ PRINCIPAL ============ */
// Evento para tomar una foto al hacer clic (bloqueado si hay una grabación activa)
$('btnPhoto').addEventListener('click', () => { 
  if (!state.isRecording) takePhoto(); 
});

// Evento para iniciar la grabación de video
$('btnVideo').addEventListener('click', startRecording);

// Evento para abrir la ventana emergente (modal) con la última foto o video capturado
$('btnLast').addEventListener('click', openModal);

// Evento para alternar el modo espejo de la cámara y reiniciar la matriz de pixelado
$('btnToggleMirror').addEventListener('click', () => { 
  state.mirrored = !state.mirrored; 
  resetFace(); 
});

// Evento para alternar entre la cámara frontal (selfie) y la trasera
$('btnFlipCamera').addEventListener('click', flipCamera);


/* ============ 03. MANEJADOR DEL BOTÓN GLOBAL PARA COMPARTIR LA APLICACIÓN ============ */
// Utiliza el operador opcional "?." para evitar errores si el botón aún no existe en el DOM
$('btnShare')?.addEventListener('click', async () => {
  // Estructura de datos que se enviará al sistema operativo
  const shareData = {
    title: 'CatrinART',
    text: '¡Mira esta experiencia interactiva de realidad aumentada!',
    url: window.location.href
  };

  try {
    // Si el navegador soporta la API nativa de compartir, abre el menú del sistema
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Como alternativa en PC, copia directamente el enlace al portapapeles
      await navigator.clipboard.writeText(window.location.href);
      if (typeof setStatus === 'function') {
        setStatus('¡Enlace copiado al portapapeles!', 3000); // Notificación flotante temporal
      } else {
        alert('¡Enlace copiado al portapapeles!'); // Alerta de respaldo estándar
      }
    }
  } catch (err) {
    console.log('Error al compartir:', err); // Registro silencioso de cancelación o error
  }
});


/* ============ 04. EVENTOS DEL MODAL DE VISTA PREVIA Y TECLADO ============ */
// Enlace de botones de acción dentro de la ventana modal
$('modalWhatsappBtn').addEventListener('click', () => shareMedia('whatsapp'));
$('modalXBtn').addEventListener('click', () => shareMedia('x'));
$('modalDownloadBtn').addEventListener('click', downloadMedia);
$('btnClosePreview').addEventListener('click', closeModal);

// Escucha global de teclado: permite cerrar el modal instantáneamente al presionar la tecla "Escape"
document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeModal(); 
});


/* ============ 05. SPLASH SCREEN Y SECUENCIA DE ARRANQUE ============ */
// Flujo:
//  1) Carga la página -> corre la animación del splash (logo pulsando). NO se toca ninguna cámara.
//  2) A los 2 s aparece la leyenda "PULSA PARA COMENZAR".
//  3) Solo al hacer clic en la leyenda: se piden permisos y se enciende la cámara,
//     el splash se "apaga" como una TV antigua y la app se "enciende" con el filtro ya listo.

const SPLASH_READY_MS = 2000;  // = 1 ciclo de logoPulse (2 s). Cámbialo si cambias esa animación.
const CRT_OFF_MS = 380;        // duración de crtTurnOff en el CSS
const CRT_ON_MS = 1500;        // tiempo que dura el efecto de encendido (animación + parpadeo)

const splash = $('splashScreen');
const splashStart = $('splashStart');
let appLaunched = false;

// Prepara la IA y el bucle de dibujo desde ya (no usan cámara hasta que haya video)
initFace();
initMalla();
requestAnimationFrame(render);

// Mensaje de estado vacío mientras el splash esté visible
setStatus('');

// 2) Muestra la leyenda cuando termina la animación inicial
setTimeout(() => {
  splash.classList.add('is-ready');
  splashStart.disabled = false;
  splashStart.focus({ preventScroll: true });
}, SPLASH_READY_MS);

// 3) Clic en la leyenda: único punto de entrada para encender cámaras
splashStart.addEventListener('click', launchApp);

async function launchApp() {
  if (appLaunched) return;
  appLaunched = true;

  splashStart.disabled = true;
  splashStart.textContent = '> ENCENDIENDO <';
  splash.classList.add('is-starting');
  if (typeof playPixelSound === 'function') playPixelSound('poweron');

  // La cámara se pide DENTRO del gesto del usuario (requisito de iOS/Safari)
  setStatus('Cargando cámara y modelo…');
  let ok = false;
  try { ok = await initCamera(); } catch (e) { console.error(e); }
  if (ok) hideFlipButtonIfSingleCamera();
  if (face.ready) setStatus('');

  // TV antigua: el splash se apaga...
  splash.classList.add('splash--crt-off');
  await new Promise(r => setTimeout(r, CRT_OFF_MS));
  splash.remove();

  // ...y la app se enciende con líneas de barrido y parpadeo
  const crt = $('crtOverlay');
  stage.classList.remove('camera-crt-reveal');
  void stage.offsetWidth;                       // reinicia la animación
  stage.classList.add('camera-crt-reveal');
  crt.classList.add('is-active');
  setTimeout(() => {
    stage.classList.remove('camera-crt-reveal');
    crt.classList.remove('is-active');
  }, CRT_ON_MS + 100);
}
