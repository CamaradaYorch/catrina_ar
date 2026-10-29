/* ==================================================
   CatrinART
   MÓDULO: MAQUILLAJE DE RESPALDO (dibujado por código)
   ==================================================
   Solo se usa como ÚLTIMO RESPALDO cuando no cargan ni la malla con textura ni el diseño de assets/catrina-diseno.png.
   Dibuja lo básico sobre los puntos de la cara: base blanca, cuencas con borde de cuentas, nariz de calavera y costuras
   en la boca. Ya no incluye filigrana ni flores: el diseño real viene de la textura y de assets/catrina-flores.png.
   ================================================== */

let COLOR = {
  tinta: '#141018', base: 'rgba(250,247,241,.95)', sombra: 'rgba(95,125,160,.32)',
  naranja: '#f08a24', ambar: '#f2a93b', amarillo: '#f4c430', rojo: '#b3202a', vino: '#7e1722', hoja: '#4f7a2a'
};

/** Sincroniza los colores del maquillaje por código con el diseño seleccionado */
function actualizarPaletaMaquillaje(idx) {
  if (CONFIG.DISENOS && CONFIG.DISENOS[idx] && CONFIG.DISENOS[idx].paletaMaquillaje) {
    Object.assign(COLOR, CONFIG.DISENOS[idx].paletaMaquillaje);
  }
}
const OVALO = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
const OJO_IZQ = [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246];
const OJO_DER = [362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398];
const TAU = Math.PI * 2;

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

  c.restore();
}
