/* ==================================================
   CATRINA AR
   MÓDULO: ESTILO LITTLE CATRÍN (niñas y niños)
   ==================================================
   Arte 100% original, dibujado con código sobre los puntos de la cara (sin imágenes ni personajes con derechos).
   Estilo INFANTIL (little catrín): colores vivos y trazos simples para niñas y niños.
   ================================================== */

const STYLES = {
  little: {
    base: 'rgba(252,248,240,.94)',
    dark: '#2b1a4a',                          // morado oscuro: más amable que el negro
    petals: ['#00c2c7', '#ff4fa3'],           // turquesa y rosa
    crown: ['#ffd400', '#ff7a00', '#ff4fa3']
  }
};

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
function dibujarCatrinLittle(c, pts, W, H) {
  const S = STYLES.little;
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

