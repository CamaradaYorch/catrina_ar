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
  takePhoto: (faceCount) => { Analytics.countCreator('foto'); trackEvent('take_photo', {
    faces_detected: faceCount || 0,
    facing: (typeof state !== 'undefined' && state.facing) || 'user'
  }); },
  recordVideo: (durationSec, faceCount) => { Analytics.countCreator('video'); trackEvent('record_video', {
    duration_seconds: durationSec,
    faces_detected: faceCount || 0,
    facing: (typeof state !== 'undefined' && state.facing) || 'user'
  }); },
  flipCamera: (facing) => trackEvent('flip_camera', { facing_mode: facing }),
  toggleMirror: (mirrored) => trackEvent('toggle_mirror', { is_mirrored: mirrored }),
  shareApp: (channel) => trackEvent('share_app', { method: channel || 'generic' }),
  shareMedia: (channel, mediaType) => trackEvent('share_media', { method: channel, media_type: mediaType }),
  downloadMedia: (mediaType) => trackEvent('download_media', { media_type: mediaType }),

  /**
   * CONTADOR (solo el número). Cuenta UNA vez por visita a cada persona que crea contenido (toma una foto o graba un video).
   * - Se manda a Google Analytics como el evento «visita_creador» (siempre, con modo prototipo/produccion para poder filtrar).
   * - El número visible del pie de página se suma con un servicio de conteo gratuito (CounterAPI) y solo cuando
   *   CONFIG.MOSTRAR_PROTOTIPO = false, para que las pruebas no inflen la cifra.
   */
  countCreator: async (tipo) => {
    const FLAG = 'catrinart_contado';
    try { if (sessionStorage.getItem(FLAG)) return; sessionStorage.setItem(FLAG, '1'); } catch (e) { /* sin sessionStorage: puede contar de más, no falla */ }

    const enPrueba = !!(typeof CONFIG !== 'undefined' && CONFIG.MOSTRAR_PROTOTIPO);
    trackEvent('visita_creador', { tipo, modo: enPrueba ? 'prototipo' : 'produccion' });
    if (enPrueba) return;
    await Analytics.contador('up');
  },

  /** Muestra el número actual del contador ('get') o suma uno y lo muestra ('up'). */
  contador: async (accion) => {
    const box = document.getElementById('visitorCounter');
    const num = document.getElementById('visitorCountNum');
    if (!box || !num) return;
    try {
      const res = await fetch('https://api.counterapi.dev/v1/catrinart_cct_oficial/usuarios' + (accion === 'up' ? '/up' : ''));
      if (!res.ok) throw new Error('contador ' + res.status);
      const data = await res.json();
      num.textContent = Number(data.count || 0).toLocaleString('es-MX');
      box.classList.remove('hidden');
    } catch (e) {
      // Sin red o servicio no disponible: el contador simplemente no se muestra
      if (accion !== 'up') box.classList.add('hidden');
    }
  }
};

// Al cargar la página solo se MUESTRA el número actual (no suma). Se oculta mientras el proyecto sea prototipo.
document.addEventListener('DOMContentLoaded', () => {
  if (typeof CONFIG !== 'undefined' && !CONFIG.MOSTRAR_PROTOTIPO) Analytics.contador('get');
});
