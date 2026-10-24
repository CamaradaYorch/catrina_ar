/* ==================================================
   CATRINA AR
   MÓDULO: COMPARTIR Y ADAPTACIÓN DE DISPOSITIVOS
   ==================================================

   ÍNDICE:
   01. Adaptación UI del Modal según el Dispositivo (IIFE)
   02. Gestión de Caché y Preparación Multimedia
   03. Manejador de Eventos: Botón Universal (Móvil)
   04. Manejador de Eventos: Compartir en PC (WhatsApp y X)

   ================================================== */


/* ============ 01. ADAPTACIÓN UI SEGÚN EL DISPOSITIVO ============ */
// Se envuelve en una función autoejecutable para que se aplique de inmediato al leer el script,
// evitando el problema de que DOMContentLoaded ya haya ocurrido al estar el script al final del body.
(function() {
  // Detección estricta de dispositivo móvil (por User Agent y ancho de pantalla)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  const shareBtn = document.getElementById('modalShareBtn');
  const waBtn = document.getElementById('modalWhatsappBtn');
  const xBtn = document.getElementById('modalXBtn');

  if (isMobile) {
    // Si es Celular: Muestra el botón universal de compartir y oculta los de PC
    if (shareBtn) shareBtn.classList.remove('hidden');
    if (waBtn) waBtn.classList.add('hidden');
    if (xBtn) xBtn.classList.add('hidden');
  } else {
    // Si es PC: Oculta el botón universal y muestra los botones específicos de WhatsApp y X
    if (shareBtn) shareBtn.classList.add('hidden');
    if (waBtn) waBtn.classList.remove('hidden');
    if (xBtn) xBtn.classList.remove('hidden');
  }
})();


// ============ COMPARTIR: Gestión de caché y archivos multimedia ============
let shareCache = null;

/**
 * Convierte la foto o video actual en un objeto File. 
 * Se prepara de antemano de forma asíncrona para que el menú de compartir abra al instante.
 */
function prepareShareFile() {
  const m = state.lastMedia;
  if (!m) return Promise.resolve(null);
  if (!shareCache || shareCache.url !== m.url) {
    shareCache = { 
      url: m.url, 
      promise: fetch(m.url)
        .then(r => r.blob())
        .then(b => new File([b], `${CONFIG.FILE_PREFIX}.${m.ext}`, { type: m.mime }))
        .catch(() => null) 
    };
  }
  return shareCache.promise;
}


// ============ EVENTO PARA EL BOTÓN UNIVERSAL (Dispositivos Móviles) ============
document.getElementById('modalShareBtn')?.addEventListener('click', async () => {
  if (!state.lastMedia) { 
    if (typeof setNote === 'function') setNote('Primero toma una foto o graba un video'); 
    return; 
  }
  
  // Prepara los textos y hashtags configurados globalmente
  const hashtags = CONFIG.HASHTAGS.map(h => '#' + h).join(' ');
  const text = [CONFIG.SHARE_TEXT, hashtags, CONFIG.SITE_URL].filter(Boolean).join(' ');

  try {
    const file = await prepareShareFile();
    // Abre el menú nativo del celular con el archivo adjunto y el texto listo para elegir app (WhatsApp, IG, etc.)
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text });
    } else {
      await navigator.share({ text, url: window.location.href });
    }
  } catch (e) {
    // Si el usuario cancela el menú de compartir, se ignora el error de forma silenciosa (AbortError)
    if (e.name !== 'AbortError') console.log('Error al compartir:', e);
  }
});


// ============ COMPARTIR EN ESCRITORIO (WhatsApp y X) ============
// target: 'x' o 'whatsapp'
async function shareMedia(target) {
  if (!state.lastMedia) { 
    if (typeof setNote === 'function') setNote('Primero toma una foto o graba un video'); 
    return; 
  }
  
  const hashtags = CONFIG.HASHTAGS.map(h => '#' + h).join(' ');
  const text = [CONFIG.SHARE_TEXT, hashtags, CONFIG.SITE_URL].filter(Boolean).join(' ');

  // Intento de respaldo por si se invoca la función directamente en móvil
  try {
    const file = await prepareShareFile();
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { 
      await navigator.share({ files: [file], text }); 
      return; 
    }
  } catch (e) { 
    if (e.name === 'AbortError') return; 
  }

  // En PC: Como no se pueden adjuntar archivos directo por enlace web, 
  // se descarga automáticamente el archivo multimedia y se abre la app web con el texto preparado.
  downloadMedia();
  const url = target === 'x'
    ? `${CONFIG.X_INTENT_URL}?text=${encodeURIComponent([CONFIG.SHARE_TEXT, CONFIG.SITE_URL].filter(Boolean).join(' '))}&hashtags=${CONFIG.HASHTAGS.join(',')}`
    : `${CONFIG.WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
  
  window.open(url, '_blank', 'noopener');
  
  if (typeof setNote === 'function') {
    setNote(`Archivo guardado: adjúntalo en ${target === 'x' ? 'X' : 'WhatsApp'}`);
  }
}