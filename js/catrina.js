/* ==================================================
   CATRINA AR
   MÓDULO: BUCLE DE DIBUJO (cámara -> rostros -> estilo de cada rostro -> maquillaje)
   ==================================================
   Cada rostro recibe su propio estilo (ver anthropometry.js):
   catrina (mujer) · catrin (hombre) · little (niñas y niños).
   ================================================== */

const RENDERERS = { catrina: dibujarCatrinaFemenina, catrin: dibujarCatrin, little: dibujarCatrinLittle };
/* ============ BUCLE DE DIBUJO ============ */
let sizedAspect = 0;

/** Adapta el canvas a la pantalla (pantalla completa, dimensiones pares para el codificador de video). */
function setupSizes() {
  const sw = stage.clientWidth || 360, sh = stage.clientHeight || 640;
  const k = CONFIG.MAX_CANVAS_SIDE / Math.max(sw, sh);
  canvas.width = Math.round(sw * k / 2) * 2;
  canvas.height = Math.round(sh * k / 2) * 2;
  sizeFaceInput(canvas.width, canvas.height);
  sizedAspect = sw / sh;
}

function render() {
  requestAnimationFrame(render);
  if (video.readyState < 2 || !video.videoWidth) return;

  const aspect = stage.clientWidth / stage.clientHeight;
  if (!sizedAspect || Math.abs(aspect / sizedAspect - 1) > 0.03) setupSizes();

  drawCover(ctx, video, canvas.width, canvas.height);   // 1) cámara a pantalla completa
  detectFaces();                                         // 2) puntos de la cara
  for (const pts of face.faces) drawCatrina(ctx, pts, canvas.width, canvas.height, currentStyle);   
}
