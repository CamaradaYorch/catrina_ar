/* ==================================================
   CatrinART
   MÓDULO: GESTIÓN DE CÁMARA Y HARDWARE (CAMERA)
   ==================================================

   ÍNDICE:
   01. Inicialización y Activación del Flujo de la Cámara (initCamera)
   02. Cambio y Rotación entre Cámaras Frontal y Trasera (flipCamera)
   03. Ocultamiento de Botón si el Dispositivo Posee una Sola Lente (hideFlipButtonIfSingleCamera)
   04. Apagado y Liberación Total de Recursos del Sensor (stopCamera)
   05. Control de Visibilidad y Cierre de Sesión (Event Listeners)

   ================================================== */

// Bandera para asegurar que la cámara NUNCA se active sola al cargar la página
let appStarted = false;


/* ============ 01. INICIALIZACIÓN Y ACTIVACIÓN DEL FLUJO DE LA CÁMARA ============ */
/**
 * Inicializa el flujo de video de la cámara según la orientación actual y la lente seleccionada.
 * Configura los constreñimientos de resolución y gestiona los permisos del usuario.
 * @returns {Promise<boolean>} Devuelve true si la cámara inició con éxito, de lo contrario false.
 */
async function initCamera() {
  try {
    appStarted = true; // Marcamos que la app ya inició oficialmente por acción del usuario
    
    const videoEl = document.getElementById('video') || (typeof video !== 'undefined' ? video : null);
    if (videoEl && videoEl.srcObject) {
      videoEl.srcObject.getTracks().forEach(t => t.stop());
    }
    if (typeof resetFace === 'function') resetFace();

    const isFront = (typeof state !== 'undefined' && state.facing === 'user');
    if (isFront) {
      document.body.classList.add('is-front');
    } else {
      document.body.classList.remove('is-front');
    }

    // Cámara trasera: se pide la proporción NATIVA del sensor (16:9, sin forzar vertical).
    // Antes se pedía 720x1280 (9:16) y el navegador recortaba el sensor => "zoom" extra.
    const videoConstraints = isFront
      ? { facingMode: 'user' }
      : {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints, 
      audio: false 
    });
    
    // Si el dispositivo permite zoom por hardware, lo deja en el valor configurado (CONFIG.REAR_ZOOM)
    if (!isFront) await applyRearZoom(stream);

    if (videoEl) {
      videoEl.srcObject = stream;
      await videoEl.play();
    }
    return true;
  } catch (e) {
    console.error("Error al iniciar la cámara:", e);
    if (typeof setStatus === 'function') {
      setStatus('Sin acceso a la cámara. Revisa los permisos.');
    }
    return false; 
  }
}


/**
 * Ajusta el zoom de la cámara trasera (si el navegador/dispositivo lo soporta, p. ej. Chrome en Android).
 * 1 = sin zoom adicional; valores menores (0.5) usan lente más amplia si el equipo la expone.
 * El valor se limita al rango real que reporta el dispositivo; si no hay soporte, no hace nada.
 */
async function applyRearZoom(stream) {
  try {
    const track = stream.getVideoTracks()[0];
    const caps = track && track.getCapabilities ? track.getCapabilities() : null;
    if (!caps || !caps.zoom) return;
    const want = (typeof CONFIG !== 'undefined' && CONFIG.REAR_ZOOM) || 1;
    const zoom = Math.min(Math.max(want, caps.zoom.min), caps.zoom.max);
    await track.applyConstraints({ advanced: [{ zoom }] });
  } catch (e) { /* sin soporte de zoom: se ignora */ }
}


/* ============ 02. CAMBIO Y ROTACIÓN ENTRE CÁMARAS ============ */
/**
 * Alterna entre la cámara frontal y la trasera del dispositivo.
 * Si la operación falla, revierte automáticamente a la lente anterior.
 */
async function flipCamera() {
  if (typeof state !== 'undefined' && state.isRecording) return;
  
  const prev = state.facing;
  state.facing = prev === 'user' ? 'environment' : 'user';
  
  if (await initCamera()) { 
    state.mirrored = state.facing === 'user'; 
  } else { 
    state.facing = prev; 
    await initCamera(); 
    if (typeof setStatus === 'function') setStatus('No se pudo cambiar de cámara', 4000); 
  }
}


/* ============ 03. VERIFICACIÓN DE LENTES DISPONIBLES ============ */
/**
 * Comprueba el número de lentes de video disponibles en el hardware del dispositivo.
 * Si cuenta con una sola cámara, oculta el botón de cambio de lente para simplificar la interfaz.
 */
async function hideFlipButtonIfSingleCamera() {
  try {
    const cams = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
    const btn = document.getElementById('btnFlipButton') || document.getElementById('btnFlipCamera');
    if (cams.length < 2 && btn) btn.classList.add('hidden');
  } catch (e) {}
}


/* ============ 04. APAGADO Y LIBERACIÓN DE RECURSOS DEL SENSOR ============ */
/**
 * Detiene por completo todas las pistas activas del flujo de video y libera el sensor de la cámara del dispositivo.
 */
function stopCamera() {
  const videoEl = document.getElementById('video') || (typeof video !== 'undefined' ? video : null);
  if (videoEl && videoEl.srcObject) {
    const stream = videoEl.srcObject;
    stream.getTracks().forEach(track => track.stop());
    videoEl.srcObject = null;
  }
}


/* ============ 05. CONTROL DE VISIBILIDAD Y CIERRE DE SESIÓN ============ */
// Gestiona el cambio de pestaña asegurando que SOLO se reinicie la cámara 
// si el usuario ya interactuó previamente con el botón "Pulsa para comenzar".
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopCamera();
  } else if (appStarted) {
    initCamera();
  }
});

// Libera y detiene la cámara de forma definitiva cuando la página se oculta o se cierra
window.addEventListener('pagehide', () => {
  stopCamera();
});