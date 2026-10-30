/* ==================================================
   CatrinART
   MÓDULO: BUCLE DE DIBUJO Y DETECCIÓN FLUIDA (CONFIG.FPS_MAX, por defecto 30)
   ==================================================
   Desacopla la inferencia de la IA del bucle de renderizado para evitar
   micro-congelamientos (lag) en dispositivos móviles.
   El canvas dibuja a CONFIG.FPS_MAX cuadros por segundo con interpolación suave de rostros y, si el celular va lento,
   baja solo la resolución (CONFIG.CALIDAD_AUTO).
   ================================================== */

let sizedAspect = 0;
// Resolución actual del lienzo: arranca en el máximo y la calidad automática puede bajarla si el celular va lento
const calidad = { lado: Math.min(CONFIG.MAX_CANVAS_SIDE || 1280, 960) };
let ultimoCuadro = 0, msPromedio = 1000 / (CONFIG.FPS_MAX || 30), cuadros = 0, segundosLentos = 0, ultimoChequeo = 0;

/** Calidad automática: si va por debajo de ~22 cuadros/s tres segundos seguidos, baja la resolución un 15% (nunca durante una grabación). */
function ajustarCalidad(ahora) {
  if (!CONFIG.CALIDAD_AUTO || state.isRecording || cuadros < 150) return;   // se ignora el arranque (~5 s)
  if (ahora - ultimoChequeo < 1000) return;
  ultimoChequeo = ahora;
  segundosLentos = msPromedio > 45 ? segundosLentos + 1 : 0;
  if (segundosLentos >= 3 && calidad.lado > (CONFIG.CALIDAD_MIN_LADO || 640)) {
    calidad.lado = Math.max(CONFIG.CALIDAD_MIN_LADO || 640, Math.round(calidad.lado * 0.85));
    segundosLentos = 0; msPromedio = 1000 / (CONFIG.FPS_MAX || 30);
    console.info('Calidad automática: resolución a', calidad.lado, 'px');
    setupSizes();
  }
}
let isDetecting = false;

// Almacén de rostros renderizados para interpolación continua a 60 FPS
let smoothFaces = [];

/** Adapta el canvas a la pantalla con resolución balanceada para máxima fluidez en celular. */
function setupSizes() {
  const sw = stage.clientWidth || 360, sh = stage.clientHeight || 640;
  // Hasta 960 px en vista en vivo (la calidad automática puede bajarlo si el celular va lento)
  const k = calidad.lado / Math.max(sw, sh);
  canvas.width = Math.round(sw * k / 2) * 2;
  canvas.height = Math.round(sh * k / 2) * 2;
  sizeFaceInput(canvas.width, canvas.height);
  sizedAspect = sw / sh;
}

/**
 * Bucle asíncrono de detección de la IA (corre a ~15 veces/segundo sin congelar el render de 60 FPS).
 */
function scheduleFaceDetection() {
  if (appStarted && face.ready && !isDetecting && video.readyState >= 2 && video.videoWidth) {
    isDetecting = true;
    try {
      detectFaces();
    } catch (e) {
      console.warn('Error en detección:', e);
    }
    isDetecting = false;
  }
  setTimeout(scheduleFaceDetection, CONFIG.DETECT_EVERY_MS || 66);
}

// Inicia el bucle de detección independiente
setTimeout(scheduleFaceDetection, 200);

/** Bucle principal de dibujo a 60 FPS constantes. */
function render() {
  requestAnimationFrame(render);
  if (video.readyState < 2 || !video.videoWidth) return;

  // Límite de cuadros por segundo: menos trabajo por segundo = menos lag, menos calor y más batería
  const ahora = performance.now();
  const dt = ahora - ultimoCuadro;
  if (dt < 1000 / (CONFIG.FPS_MAX || 30) - 3) return;
  ultimoCuadro = ahora;
  cuadros++;
  msPromedio = msPromedio * 0.92 + Math.min(dt, 250) * 0.08;
  ajustarCalidad(ahora);

  const aspect = stage.clientWidth / stage.clientHeight;
  if (!sizedAspect || Math.abs(aspect / sizedAspect - 1) > 0.03) setupSizes();

  // 1) Dibuja el feed de la cámara a pantalla completa
  drawCover(ctx, video, canvas.width, canvas.height);

  const W = canvas.width, H = canvas.height;
  const targetFaces = face.faces || [];

  // 2) Suavizado e interpolación de puntos entre fotogramas de la IA
  if (smoothFaces.length !== targetFaces.length) {
    smoothFaces = targetFaces.map(pts => pts.map(p => ({ x: p.x, y: p.y })));
  } else {
    const alfa = 1 - Math.exp(-Math.min(dt, 100) / 30);   // suavizado por tiempo (igual de fluido a 30 o a 60 cuadros)
    for (let i = 0; i < targetFaces.length; i++) {
      const targetPts = targetFaces[i];
      const sPts = smoothFaces[i];
      if (sPts && targetPts && sPts.length === targetPts.length) {
        for (let j = 0; j < targetPts.length; j++) {
          sPts[j].x += (targetPts[j].x - sPts[j].x) * alfa;
          sPts[j].y += (targetPts[j].y - sPts[j].y) * alfa;
        }
      }
    }
  }

  // 3) Dibuja la textura WebGL sobre la malla 3D de los rostros
  const conMalla = dibujarMalla(ctx, smoothFaces, W, H);

  // 4) Flores y hojas del diseño sobre cada rostro (con malla); sin malla, el diseño completo de respaldo
  smoothFaces.forEach(pts => {
    if (conMalla) {
      if (diseno.flores && state.corona !== false) dibujarDiseno(ctx, pts, W, H, 'flores');   // corona de flores (botón 🌼)
    } else if (diseno.completo) {
      dibujarDiseno(ctx, pts, W, H, 'completo');
    } else {
      dibujarMaquillaje(ctx, pts, W, H, null);   // Último respaldo: dibujo básico por código
    }
  });

  // 5) Marca de agua del Centro Cultural Teopanzolco (siempre dentro del video grabado o si está activa en vivo)
  if (CONFIG.MARCA_EN_VIVO || state.isRecording) {
    dibujarMarcaAgua(ctx, W, H);
  }
}
