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
   * CONTADOR DE INTERACCIONES (solo el número). Suma UNO cada vez que alguien toma una foto o graba un video.
   * Hay DOS cuentas independientes, para no mezclar las pruebas con el uso real:
   *   - «prototipo»  : se usa mientras CONFIG.MOSTRAR_PROTOTIPO = true. Conserva su número entre sesiones de prueba.
   *   - «produccion» : se usa cuando MOSTRAR_PROTOTIPO = false (proyecto aprobado). Empieza en 0 y, si vuelves a prototipo
   *                    para corregir errores y luego regresas, continúa justo donde se quedó.
   * Cada interacción también se manda a Google Analytics como el evento «visita_creador» (con el parámetro modo).
   */
  countCreator: async (tipo) => {
    const modo = Analytics.modo();
    trackEvent('visita_creador', { tipo, modo });
    await Analytics.contador('up');
  },

  /** Cuenta activa según el modo de la marca PROTOTIPO. */
  modo: () => (typeof CONFIG !== 'undefined' && CONFIG.MOSTRAR_PROTOTIPO) ? 'prototipo' : 'produccion',

  // ---- Versión anterior del contador en la página (CounterAPI v1, ya retirada; desactivada) ----
  // /** Muestra el número de la cuenta activa ('get') o le suma uno y lo muestra ('up'). Siempre visible: si el servicio falla, muestra el último número conocido. */
  // contador: async (accion) => {
  //   const box = document.getElementById('visitorCounter');
  //   const num = document.getElementById('visitorCountNum');
  //   if (!box || !num) return;
  //   const modo = Analytics.modo();
  //   const CACHE = 'catrinart_contador_' + modo;
  //   const mostrar = n => { num.textContent = Number(n || 0).toLocaleString('es-MX'); box.classList.remove('hidden'); };
  //   let ultimo = 0;
  //   try { ultimo = parseInt(localStorage.getItem(CACHE) || '0', 10) || 0; } catch (e) {}
  //   if (accion !== 'up') mostrar(ultimo);          // se ve de inmediato con el último valor conocido
  //   try {
  //     const url = 'https://api.counterapi.dev/v1/catrinart_cct_oficial/usuarios_' + modo + (accion === 'up' ? '/up' : '');
  //     const res = await fetch(url);
  //     if (res.status === 404) { mostrar(0); return; }   // aún no existe: va en cero
  //     if (!res.ok) throw new Error('contador ' + res.status);
  //     const data = await res.json();
  //     mostrar(data.count);
  //     try { localStorage.setItem(CACHE, String(data.count || 0)); } catch (e) {}
  //   } catch (e) {
  //     console.warn('Contador no disponible:', e);
  //     if (accion === 'up') mostrar(ultimo + 1);       // sin red: se muestra la suma local para no dejar la cifra congelada
  //   }
  // }
  // ---- Fin versión anterior ----

  /**
   * CONTADOR EN LA CONSOLA. Suma uno por cada foto o video ('up') o solo consulta el total ('get') y lo escribe en la
   * consola del navegador (F12 > Consola). También puedes escribir  catrinartUsuarios()  en la consola para verlo.
   * - Con CONFIG.COUNTER_WORKSPACE (CounterAPI v2) el total es el de TODOS los usuarios.
   * - Sin él, solo cuenta lo que ese dispositivo ha creado (el total real de todos está en Google Analytics: evento «visita_creador»).
   */
  contador: async (accion) => {
    const modo = Analytics.modo();
    const CACHE = 'catrinart_contador_' + modo;
    let local = 0;
    try { local = parseInt(localStorage.getItem(CACHE) || '0', 10) || 0; } catch (e) {}
    if (accion === 'up') { local++; try { localStorage.setItem(CACHE, String(local)); } catch (e) {} }

    let total = null, origen = 'solo este dispositivo; configura COUNTER_WORKSPACE para el total de todos';
    if (typeof CONFIG !== 'undefined' && CONFIG.COUNTER_WORKSPACE) {
      try {
        const url = 'https://api.counterapi.dev/v2/' + encodeURIComponent(CONFIG.COUNTER_WORKSPACE) + '/usuarios_' + modo + (accion === 'up' ? '/up' : '');
        const res = await fetch(url, CONFIG.COUNTER_TOKEN ? { headers: { Authorization: 'Bearer ' + CONFIG.COUNTER_TOKEN } } : {});
        if (!res.ok) throw new Error('CounterAPI respondió ' + res.status);
        const n = Analytics.numeroDe(await res.json());
        if (n !== null) { total = n; origen = 'todos los usuarios'; }
      } catch (e) {
        console.warn('Contador remoto no disponible:', e.message || e);
      }
    }
    const n = total !== null ? total : local;
    console.info('%c👥 CatrinART · usuarios (' + modo + '): ' + n.toLocaleString('es-MX') + ' %c(' + origen + ')',
      'font-weight:700;color:#ff8a00;font-size:13px', 'color:#999');
    return n;
  },

  /** Busca el valor numérico del contador en la respuesta (count, up_count o value), sin depender del formato exacto. */
  numeroDe: (j) => {
    if (j == null) return null;
    if (typeof j === 'number') return j;
    if (typeof j !== 'object') return null;
    for (const k of ['count', 'up_count', 'value']) if (typeof j[k] === 'number') return j[k];
    for (const k of Object.keys(j)) { const r = Analytics.numeroDe(j[k]); if (r !== null) return r; }
    return null;
  }
};

// Al cargar la página solo se MUESTRA el número actual de la cuenta activa (no suma).
document.addEventListener('DOMContentLoaded', () => Analytics.contador('get'));
window.catrinartUsuarios = () => Analytics.contador('get');   // escribe  catrinartUsuarios()  en la consola para ver el total
