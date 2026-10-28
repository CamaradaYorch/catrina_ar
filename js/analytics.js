/* ==================================================
   CatrinART
   MÓDULO: ANALÍTICA Y MEDICIÓN (GOOGLE ANALYTICS 4 - GRATUITO)
   ==================================================
   Permite medir el uso cultural de la app (fotos, videos, cambios de estilo,
   cámara y redes sociales) de forma 100% anónima y sin enviar datos biométricos.
   ================================================== */

(function () {
  const GA_ID = (typeof CONFIG !== 'undefined' && CONFIG.GA_MEASUREMENT_ID) || '';

  // Inicializa gtag si hay un ID configurado y no es el marcador de posición
  if (GA_ID && GA_ID !== 'G-XXXXXXXXXX') {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
  } else {
    // Modo simulación local: no falla y muestra eventos en consola si se desea depurar
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.debug('[GA4 Demo]', ...arguments);
        }
      };
    }
  }
})();

/**
 * Registra un evento de interacción en Google Analytics de forma segura.
 * @param {string} eventName - Nombre del evento en snake_case
 * @param {Object} [params] - Parámetros descriptivos del evento
 */
function trackEvent(eventName, params = {}) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (e) {
    // Si el usuario usa bloqueador de anuncios o está sin red, la app continúa sin errores
  }
}

// Helpers para eventos específicos de CatrinART
const Analytics = {
  appStart: () => trackEvent('app_start', { timestamp: Date.now() }),
  changeDesign: (designId, designName, faceCount) => trackEvent('change_design', {
    design_id: designId,
    design_name: designName,
    faces_detected: faceCount || 0
  }),
  takePhoto: (faceCount) => trackEvent('take_photo', {
    faces_detected: faceCount || 0,
    facing: (typeof state !== 'undefined' && state.facing) || 'user'
  }),
  recordVideo: (durationSec, faceCount) => trackEvent('record_video', {
    duration_seconds: durationSec,
    faces_detected: faceCount || 0,
    facing: (typeof state !== 'undefined' && state.facing) || 'user'
  }),
  flipCamera: (facing) => trackEvent('flip_camera', { facing_mode: facing }),
  toggleMirror: (mirrored) => trackEvent('toggle_mirror', { is_mirrored: mirrored }),
  shareApp: (channel) => trackEvent('share_app', { method: channel || 'generic' }),
  shareMedia: (channel, mediaType) => trackEvent('share_media', { method: channel, media_type: mediaType }),
  downloadMedia: (mediaType) => trackEvent('download_media', { media_type: mediaType }),

  /**
   * Contador de visitas sin base de datos ni servidor propio.
   * REGLA: Solo se activa y empieza a contar en 0 cuando se aprueba la app (CONFIG.MOSTRAR_PROTOTIPO = false).
   * Mientras sea prototipo, NO se incrementa para que las pruebas no inflen el número.
   */
  initVisitorCounter: async () => {
    const counterEl = document.getElementById('visitorCounter');
    const countNum = document.getElementById('visitorCountNum');
    if (!counterEl || !countNum) return;

    // Si aún está en modo prototipo (pruebas de desarrollo), no se activa el contador oficial
    if (typeof CONFIG !== 'undefined' && CONFIG.MOSTRAR_PROTOTIPO) {
      counterEl.classList.add('hidden');
      return;
    }

    // Modo producción (aprobado): mostramos el contador e incrementamos la visita
    counterEl.classList.remove('hidden');

    try {
      // API pública gratuita de conteo sin servidor (CounterAPI)
      const res = await fetch('https://api.counterapi.dev/v1/catrinart_cct_oficial/visitas/up');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.count !== 'undefined') {
          countNum.textContent = Number(data.count).toLocaleString('es-MX');
        }
      }
    } catch (e) {
      // Si el usuario no tiene conexión en ese instante o la red bloquea la petición
      counterEl.classList.add('hidden');
    }
  }
};

// Intenta inicializar el contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Analytics !== 'undefined') {
    Analytics.initVisitorCounter();
  }
});
