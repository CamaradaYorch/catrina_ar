/* ==================================================
   CatrinART
   MÓDULO: BUCLE DE DIBUJO (cámara -> rostros -> maquillaje)
   ================================================== */

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
  const W = canvas.width, H = canvas.height;
  const conMalla = dibujarMalla(ctx, face.faces, W, H);                                    // 3) textura SVG sobre la malla (si está lista)
  face.faces.forEach(pts => {
    if (conMalla) {
      // 4) Con malla: adornos de código sobre la calavera + flores del diseño (si no cargaron, las flores de código)
      const capas = diseno.flores ? CONFIG.ADORNOS_SOBRE_CALAVERA.filter(n => n !== 'corona' && n !== 'mejillas') : CONFIG.ADORNOS_SOBRE_CALAVERA;
      dibujarMaquillaje(ctx, pts, W, H, capas);
      if (diseno.flores) dibujarDiseno(ctx, pts, W, H, 'flores');
    } else if (diseno.completo) {
      dibujarDiseno(ctx, pts, W, H, 'completo');           // 4b) Sin malla: diseño completo (calavera + flores)
    } else {
      dibujarMaquillaje(ctx, pts, W, H, null);             // 4c) Último respaldo: todo dibujado con código
    }
  });
}
