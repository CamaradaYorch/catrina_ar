/* ==================================================
   CATRINA AR
   MÓDULO: MAQUILLAJE DE CATRINA Y BUCLE DE DIBUJO
   ==================================================
   Arte 100% original, dibujado con código sobre los puntos de la cara (sin imágenes ni personajes con derechos).
   Estilos: hoy solo "catrina"; los demás (catrin, nina, nino) se agregan en STYLES.
   ================================================== */

const STYLES = {
  catrina: {
    base: 'rgba(250,246,238,.93)',   // base blanca
    dark: '#15101a',                 // cuencas, nariz y labios
    petals: ['#ff8a00', '#d6246e'],  // pétalos alrededor de los ojos
    crown: ['#ff9f0a', '#ffd400', '#d6246e']  // cempasúchil y flor magenta
  }
};
let currentStyle = 'catrina';

// Puntos de referencia de MediaPipe (índices de los 478)
const IDX = {
  oval: [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109],
  lips: [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146]
};

const P2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function flower(c, x, y, r, petal, core) {
  c.fillStyle = petal;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    c.beginPath(); c.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.46, 0, 6.2832); c.fill();
  }
  c.fillStyle = core;
  c.beginPath(); c.arc(x, y, r * 0.38, 0, 6.2832); c.fill();
}

/** Dibuja la Catrina sobre un rostro. pts = 478 puntos normalizados; W,H = tamaño del canvas. */
function drawCatrina(c, pts, W, H, style) {
  const S = STYLES[style] || STYLES.catrina;
  const P = k => ({ x: pts[k].x * W, y: pts[k].y * H });
  const faceW = P2(P(234), P(454)), faceH = P2(P(10), P(152));
  const roll = Math.atan2(P(263).y - P(33).y, P(263).x - P(33).x);   // inclinación de la cabeza
  const u = { x: Math.cos(roll), y: Math.sin(roll) };                 // "derecha" de la cara
  const v = { x: -Math.sin(roll), y: Math.cos(roll) };                // "abajo" de la cara
  const at = (o, du, dv) => ({ x: o.x + u.x * du + v.x * dv, y: o.y + u.y * du + v.y * dv });

  c.save();
  c.lineJoin = c.lineCap = 'round';

  // 1) Base blanca (el trazo del mismo color suaviza el borde)
  c.beginPath();
  IDX.oval.forEach((k, i) => { const p = P(k); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); });
  c.closePath();
  c.fillStyle = c.strokeStyle = S.base; c.lineWidth = faceW * 0.03;
  c.fill(); c.stroke();

  // 2) Cuencas oscuras con pétalos alrededor
  [[33, 133], [263, 362]].forEach(([outer, inner]) => {
    const a = P(outer), b = P(inner);
    const e = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, ew = P2(a, b);
    for (let i = 0; i < 12; i++) {
      const ang = roll + i * Math.PI / 6;
      c.fillStyle = S.petals[i % 2];
      c.beginPath();
      c.ellipse(e.x + Math.cos(ang) * ew * 0.95, e.y + Math.sin(ang) * ew * 0.95, ew * 0.34, ew * 0.2, ang, 0, 6.2832);
      c.fill();
    }
    c.fillStyle = S.dark;
    c.beginPath(); c.ellipse(e.x, e.y, ew * 0.82, ew * 0.92, roll, 0, 6.2832); c.fill();
    c.fillStyle = S.petals[0];
    c.beginPath(); c.arc(e.x, e.y, ew * 0.14, 0, 6.2832); c.fill();
  });

  // 3) Nariz de calavera: corazón invertido oscuro
  const apex = at(P(6), 0, 0), nl = P(98), nr = P(327), nb = P(2);
  c.fillStyle = S.dark;
  c.beginPath();
  c.moveTo(apex.x, apex.y);
  c.quadraticCurveTo(nl.x - faceW * 0.02, nl.y - faceH * 0.03, nl.x, nl.y);
  c.quadraticCurveTo(nb.x, nb.y + faceH * 0.01, nr.x, nr.y);
  c.quadraticCurveTo(nr.x + faceW * 0.02, nr.y - faceH * 0.03, apex.x, apex.y);
  c.fill();

  // 4) Dientes de calavera sobre los labios
  const m1 = P(61), m2 = P(291), mw = P2(m1, m2);
  const mid = { x: (m1.x + m2.x) / 2, y: (m1.y + m2.y) / 2 };
  const halfH = Math.max(P2(P(0), P(17)) * 0.8, faceH * 0.045);
  c.strokeStyle = S.dark; c.lineWidth = Math.max(2, faceW * 0.012);
  c.beginPath();
  IDX.lips.forEach((k, i) => { const p = P(k); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); });
  c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(m1.x, m1.y); c.lineTo(m2.x, m2.y); c.stroke();
  for (let t = -0.4; t <= 0.41; t += 0.1) {
    const a = at(mid, t * mw, -halfH), b = at(mid, t * mw, halfH);
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  }

  // 5) Corona de cempasúchil sobre la frente y flores en las mejillas
  const top = P(10);
  for (let i = -4; i <= 4; i++) {
    const t = i / 4;
    const p = at(top, t * faceW * 0.52, -faceH * (0.07 + 0.07 * (1 - t * t)));
    const r = faceW * (i % 2 ? 0.075 : 0.095);
    flower(c, p.x, p.y, r, i % 2 ? S.crown[0] : S.crown[2], S.crown[1]);
  }
  [50, 280].forEach(k => { const p = P(k); flower(c, p.x, p.y, faceW * 0.05, S.crown[2], S.crown[1]); });

  c.restore();
}

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
  for (const pts of face.faces) drawCatrina(ctx, pts, canvas.width, canvas.height, currentStyle);   // 3) maquillaje
}
