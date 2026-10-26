/* ==================================================
   CatrinART
   MÓDULO: AVISO PARA NAVEGADORES INTERNOS (inapp)
   ==================================================

   Cuando alguien abre el enlace desde Facebook, Instagram, LinkedIn, TikTok, etc., la página
   se abre dentro de un navegador interno de esa app, que suele bloquear la cámara y las descargas.
   Una página web no puede obligar a salir de ahí, pero sí puede:
     - Android: ofrecer un botón que abre el enlace en el navegador del teléfono.
     - iPhone:  dar el enlace para copiarlo y explicar el paso exacto (Apple no permite forzarlo).
   Esta pantalla se muestra encima del splash y se puede omitir con "Continuar aquí de todos modos".
   ================================================== */

// Palabras que identifican a los navegadores internos en el "user agent"
const IN_APP_UA = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|LinkedInApp|TikTok|musical_ly|BytedanceWebview|Snapchat|Pinterest|Line\/|MicroMessenger/i;

const isAndroid = /Android/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// Dirección actual sin el "#" final
function appUrl() { const u = new URL(location.href); u.hash = ''; return u.href; }

// Enlace especial de Android que pide abrir la dirección en el navegador del sistema
function androidIntentUrl() {
  const u = new URL(appUrl());
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(':', '')};action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(u.href)};end`;
}

// Copia el enlace; si el navegador interno no deja, queda seleccionado para copiarlo a mano
async function copyAppLink() {
  const input = $('gateUrl');
  try { await navigator.clipboard.writeText(appUrl()); return true; } catch (e) {}
  input.focus(); input.select(); input.setSelectionRange(0, 9999);
  try { return document.execCommand('copy'); } catch (e) { return false; }
}

function showInAppGate() {
  const insecure = !window.isSecureContext;
  const noCamera = !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const inApp = IN_APP_UA.test(navigator.userAgent);
  if (!insecure && !inApp && !noCamera) return;          // navegador normal: no se muestra nada

  const steps = [];
  let title = 'Ábrelo en tu navegador', text;

  if (insecure) {
    title = 'Falta una conexión segura';
    text = 'La cámara solo funciona en páginas seguras (https://) o en localhost. Abre la dirección con HTTPS.';
  } else if (inApp) {
    text = 'Estás en el navegador de otra app, que puede bloquear la cámara y no dejar guardar tus archivos. Ábrelo en tu navegador para usar CatrinART completo.';
    if (isAndroid) {
      $('gateOpen').href = androidIntentUrl();
      $('gateOpen').classList.remove('hidden');
      steps.push('Si el botón no funciona, toca ⋯ y elige «Abrir en el navegador».');
    } else if (isIOS) {
      steps.push('Toca ⋯ (o el ícono de compartir).', 'Elige «Abrir en Safari» o «Abrir en el navegador».', 'También puedes copiar el enlace de arriba y pegarlo en Safari.');
    } else {
      steps.push('Abre el menú ⋯ y elige «Abrir en el navegador».');
    }
  } else {
    text = 'Tu navegador no permite usar la cámara. Prueba con Chrome o Safari actualizados.';
  }

  $('gateTitle').textContent = title;
  $('gateText').textContent = text;
  $('gateUrl').value = appUrl();
  $('gateSteps').innerHTML = steps.map(s => `<li>${s}</li>`).join('');
  $('gateCopy').addEventListener('click', async () => {
    $('gateCopy').textContent = (await copyAppLink()) ? 'Enlace copiado ✓' : 'Mantén pulsado el enlace para copiarlo';
  });
  $('gateContinue').addEventListener('click', () => $('inAppGate').classList.add('hidden'));

  $('inAppGate').classList.remove('hidden');
  (isAndroid && inApp && !insecure ? $('gateOpen') : $('gateCopy')).focus({ preventScroll: true });
}

showInAppGate();
