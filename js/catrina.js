/* ==================================================
   CatrinART
   MÓDULO: BUCLE DE DIBUJO Y DETECCIÓN FLUIDA (60 FPS)
   ==================================================
   Desacopla la inferencia de la IA del bucle de renderizado para evitar
   micro-congelamientos (lag) en dispositivos móviles.
   El canvas dibuja a 60 FPS constantes con interpolación suave de rostros.
   ================================================== */

let sizedAspect = 0;
let isDetecting = false;

// Almacén de rostros renderizados para interpolación continua a 60 FPS
let smoothFaces = [];

/** Adapta el canvas a la pantalla con resolución balanceada para máxima fluidez en celular. */
function setupSizes() {
  const sw = stage.clientWidth || 360, sh = stage.clientHeight || 640;
  // En móviles usamos hasta 960px en vista en vivo para garantizar 60 FPS sin saturar la GPU
  const maxSide = Math.min(CONFIG.MAX_CANVAS_SIDE || 1280, 960);
  const k = maxSide / Math.max(sw, sh);
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
    for (let i = 0; i < targetFaces.length; i++) {
      const targetPts = targetFaces[i];
      const sPts = smoothFaces[i];
      if (sPts && targetPts && sPts.length === targetPts.length) {
        for (let j = 0; j < targetPts.length; j++) {
          sPts[j].x += (targetPts[j].x - sPts[j].x) * 0.45;
          sPts[j].y += (targetPts[j].y - sPts[j].y) * 0.45;
        }
      }
    }
  }

  // 3) Dibuja la textura WebGL sobre la malla 3D de los rostros
  const conMalla = dibujarMalla(ctx, smoothFaces, W, H);

  // 4) Flores y hojas del diseño sobre cada rostro (con malla); sin malla, el diseño completo de respaldo
  smoothFaces.forEach(pts => {
    if (conMalla) {
      if (diseno.flores) dibujarDiseno(ctx, pts, W, H, 'flores');
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
