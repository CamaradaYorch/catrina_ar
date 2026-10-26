/* ==================================================
   CatrinART
   MÓDULO: MAQUILLAJE DE CATRINA (único diseño)
   ==================================================
   Dibujo vectorial original, trazado con código sobre los puntos de la cara. Motivos tradicionales del
   Día de Muertos: base blanca, cuencas con borde de cuentas, filigrana en la frente, nariz de calavera,
   costuras en la boca, adorno en la barbilla y corona de flores de cempasúchil y rosas.
   Para cambiar colores o tamaños, edita la paleta COLOR y los factores de cada bloque.
   ================================================== */

const COLOR = {
  tinta: '#141018', base: 'rgba(250,247,241,.95)', sombra: 'rgba(95,125,160,.32)',
  naranja: '#f08a24', ambar: '#f2a93b', amarillo: '#f4c430', rojo: '#b3202a', vino: '#7e1722', hoja: '#4f7a2a'
};
const OVALO = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
const OJO_IZQ = [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246];
const OJO_DER = [362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398];
const TAU = Math.PI * 2;

/** Flor de capas (pétalos redondos): tonos = [exterior, medio, centro]. */
function flor(c, x, y, r, tonos) {
  [[1, 9, tonos[0]], [0.72, 7, tonos[1]], [0.42, 5, tonos[2]]].forEach(([k, n, col], j) => {
    c.fillStyle = col; c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = Math.max(1, r * 0.04);
    for (let i = 0; i < n; i++) {
      const a = i * TAU / n + j * 0.5;
      c.beginPath(); c.arc(x + Math.cos(a) * r * k * 0.55, y + Math.sin(a) * r * k * 0.55, r * k * 0.5, 0, TAU);
      c.fill(); c.stroke();
    }
  });
}

/** Dibuja el maquillaje sobre un rostro. pts = 478 puntos normalizados; W, H = tamaño del canvas. */
function dibujarMaquillaje(c, pts, W, H, capas) {   // capas: lista de bloques a dibujar; null = todos (respaldo sin malla)
  const P = k => ({ x: pts[k].x * W, y: pts[k].y * H });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const faceW = dist(P(234), P(454)), faceH = dist(P(10), P(152));
  const roll = Math.atan2(P(263).y - P(33).y, P(263).x - P(33).x);
  const u = { x: Math.cos(roll), y: Math.sin(roll) }, v = { x: -Math.sin(roll), y: Math.cos(roll) };
  const at = (o, du, dv) => ({ x: o.x + u.x * du + v.x * dv, y: o.y + u.y * du + v.y * dv });
  const trazo = Math.max(1.5, faceW * 0.011);
  const camino = ids => { c.beginPath(); ids.forEach((k, i) => { const p = P(k); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }); c.closePath(); };
  const punto = (p, r, relleno) => { c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); relleno ? c.fill() : c.stroke(); };

  const ver = n => !capas || capas.includes(n);
  c.save();
  c.lineJoin = c.lineCap = 'round';


  if (ver('base')) {
  // 1) Base blanca con sombra azulada en la mandíbula
  camino(OVALO);
  c.fillStyle = c.strokeStyle = COLOR.base; c.lineWidth = faceW * 0.03; c.fill(); c.stroke();
  [172, 397].forEach(k => {
    const p = P(k), g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, faceW * 0.3);
    g.addColorStop(0, COLOR.sombra); g.addColorStop(1, 'rgba(95,125,160,0)');
    c.fillStyle = g; punto(p, faceW * 0.3, true);
  });

  }

  if (ver('frente')) {
  // 2) Frente: rombo central, línea con círculo, volutas y puntos
  const f = P(9), d = faceW * 0.045;
  c.strokeStyle = COLOR.tinta; c.lineWidth = trazo;
  [-1, 1].forEach(s => {
    const a = at(f, s * d, 0), b = at(f, s * faceW * 0.13, -faceH * 0.11), e = at(f, s * faceW * 0.24, -faceH * 0.06);
    c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(b.x, b.y, e.x, e.y); c.stroke();
    c.fillStyle = COLOR.tinta; punto(e, trazo * 1.4, true);
    punto(at(f, s * faceW * 0.12, -faceH * 0.02), faceW * 0.02, false);
  });
  const top = at(f, 0, -faceH * 0.15);
  c.beginPath(); c.moveTo(at(f, 0, -d).x, at(f, 0, -d).y); c.lineTo(top.x, top.y); c.stroke();
  c.fillStyle = COLOR.base; punto(top, faceW * 0.02, true); punto(top, faceW * 0.02, false);
  c.beginPath(); [at(f, 0, -d), at(f, d * 0.75, 0), at(f, 0, d * 1.2), at(f, -d * 0.75, 0)].forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
  c.closePath(); c.fillStyle = COLOR.ambar; c.fill(); c.stroke();
  c.fillStyle = COLOR.rojo; punto(f, d * 0.22, true);

  }

  if (ver('cuencas')) {
  // 3) Cuencas: marco negro con borde de cuentas blancas; el ojo real queda a la vista
  [[OJO_IZQ, 33, 133], [OJO_DER, 263, 362]].forEach(([ojo, o, i]) => {
    const a = P(o), b = P(i), e = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, ew = dist(a, b);
    const rx = ew * 0.98, ry = ew * 0.82;
    c.strokeStyle = COLOR.tinta; c.lineWidth = trazo;
    c.beginPath(); c.ellipse(e.x, e.y, rx * 1.28, ry * 1.55, roll, Math.PI * 1.08, Math.PI * 1.92); c.stroke();   // arco sobre la ceja
    for (let n = 0; n <= 6; n++) {
      const t = Math.PI * 1.15 + n * (Math.PI * 0.7 / 6), q = at(e, Math.cos(t) * rx * 1.4, Math.sin(t) * ry * 1.75);
      c.fillStyle = COLOR.base; punto(q, ew * 0.05, true); punto(q, ew * 0.05, false);
    }
    c.fillStyle = COLOR.tinta; c.beginPath();
    c.ellipse(e.x, e.y, rx, ry, roll, 0, TAU);
    ojo.forEach((k, j) => { const p = P(k); j ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); });
    c.closePath(); c.fill('evenodd');
    c.fillStyle = COLOR.base;
    for (let n = 0; n < 18; n++) { const t = n * TAU / 18; punto(at(e, Math.cos(t) * rx * 0.93, Math.sin(t) * ry * 0.93), ew * 0.045, true); }
  });

  }

  if (ver('nariz')) {
  // 4) Nariz de calavera
  const ap = P(6), nl = P(98), nr = P(327), nb = P(2);
  c.fillStyle = COLOR.tinta; c.beginPath(); c.moveTo(ap.x, ap.y);
  c.quadraticCurveTo(at(nl, -faceW * 0.01, -faceH * 0.04).x, at(nl, -faceW * 0.01, -faceH * 0.04).y, nl.x, nl.y);
  c.quadraticCurveTo(nb.x, nb.y + faceH * 0.025, nr.x, nr.y);
  c.quadraticCurveTo(at(nr, faceW * 0.01, -faceH * 0.04).x, at(nr, faceW * 0.01, -faceH * 0.04).y, ap.x, ap.y);
  c.fill();

  }

  if (ver('boca')) {
  // 5) Boca: línea, costuras arriba y abajo y puntadas hacia las mejillas
  const m1 = P(61), m2 = P(291), mc = { x: (P(13).x + P(14).x) / 2, y: (P(13).y + P(14).y) / 2 };
  const ctl = { x: 2 * mc.x - (m1.x + m2.x) / 2, y: 2 * mc.y - (m1.y + m2.y) / 2 };
  const curva = t => ({ x: (1 - t) ** 2 * m1.x + 2 * t * (1 - t) * ctl.x + t * t * m2.x, y: (1 - t) ** 2 * m1.y + 2 * t * (1 - t) * ctl.y + t * t * m2.y });
  c.strokeStyle = COLOR.tinta; c.lineWidth = trazo;
  c.beginPath(); c.moveTo(m1.x, m1.y); c.quadraticCurveTo(ctl.x, ctl.y, m2.x, m2.y); c.stroke();
  for (let n = 1; n < 14; n++) {
    const t = n / 14, p = curva(t), L = faceH * (0.03 + 0.03 * Math.sin(t * Math.PI));
    const a = at(p, 0, -L), b = at(p, 0, L);
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  }
  [[m1, m2], [m2, m1]].forEach(([m, otro]) => {
    const dir = { x: (m.x - otro.x) / dist(m, otro), y: (m.y - otro.y) / dist(m, otro) };
    c.strokeStyle = COLOR.vino;
    for (let n = 0; n <= 4; n++) {
      const p = { x: m.x + dir.x * faceW * 0.035 * n * 1.2, y: m.y + dir.y * faceW * 0.035 * n * 1.2 - faceH * 0.008 * n };
      const a = at(p, 0, -faceH * 0.025), b = at(p, 0, faceH * 0.025);
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    }
  });

  }

  if (ver('barbilla')) {
  // 6) Adorno en la barbilla: flor negra con centro blanco
  const ch = at(P(152), 0, -faceH * 0.075);
  c.fillStyle = COLOR.tinta;
  for (let n = 0; n < 6; n++) { const t = n * TAU / 6 + roll; c.beginPath(); c.ellipse(ch.x + Math.cos(t) * faceW * 0.03, ch.y + Math.sin(t) * faceW * 0.03, faceW * 0.028, faceW * 0.016, t, 0, TAU); c.fill(); }
  c.fillStyle = COLOR.base; punto(ch, faceW * 0.012, true);

  }

  // 6b) Flores en las mejillas
  if (ver('mejillas')) {
    [50, 280].forEach(k => { const p = P(k); flor(c, p.x, p.y, faceW * 0.06, [COLOR.vino, COLOR.rojo, COLOR.naranja]); });
  }

  if (ver('corona')) {
  // 7) Corona: hojas y flores en arco sobre la frente
  const cen = at(P(10), 0, faceH * 0.28), rxc = faceW * 0.66, ryc = faceH * 0.62, N = 9;
  const pos = i => { const t = Math.PI * (1.04 + 0.92 * i / (N - 1)); return { p: at(cen, Math.cos(t) * rxc, Math.sin(t) * ryc), t }; };
  c.fillStyle = COLOR.hoja;
  for (let i = 0; i < N - 1; i++) {
    const q = pos(i), r = pos(i + 1), m = { x: (q.p.x + r.p.x) / 2, y: (q.p.y + r.p.y) / 2 };
    c.beginPath(); c.ellipse(m.x, m.y, faceW * 0.09, faceW * 0.035, (q.t + r.t) / 2 + Math.PI / 2, 0, TAU); c.fill();
  }
  const tonos = [[COLOR.naranja, COLOR.ambar, COLOR.amarillo], [COLOR.vino, COLOR.rojo, COLOR.naranja], [COLOR.amarillo, COLOR.ambar, COLOR.naranja]];
  for (let i = 0; i < N; i++) {
    const { p } = pos(i), grande = 1 - Math.abs(i - (N - 1) / 2) / N;
    flor(c, p.x, p.y, faceW * (0.1 + 0.07 * grande), tonos[i % 3]);
  }

  }

  c.restore();
}
