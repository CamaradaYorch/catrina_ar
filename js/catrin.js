/* ==================================================
   CATRINA AR
   MÓDULO: ESTILO CATRÍN (hombre)
   ==================================================
   Maquillaje geométrico (rombos), bigote estilizado y sombrero de copa. Arte original dibujado con código.
   Usa IDX, P2 y flower() de catrin-little.js (se carga antes).
   ================================================== */

function dibujarCatrin(c, pts, W, H) {
  const P = k => ({ x: pts[k].x * W, y: pts[k].y * H });
  const faceW = P2(P(234), P(454)), faceH = P2(P(10), P(152));
  const roll = Math.atan2(P(263).y - P(33).y, P(263).x - P(33).x);
  const u = { x: Math.cos(roll), y: Math.sin(roll) }, v = { x: -Math.sin(roll), y: Math.cos(roll) };
  const at = (o, du, dv) => ({ x: o.x + u.x * du + v.x * dv, y: o.y + u.y * du + v.y * dv });
  const poly = pl => { c.beginPath(); pl.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); };
  const INK = '#16121a', ORANGE = '#ff8a00', ink = Math.max(2, faceW * 0.012);

  c.save();
  c.lineJoin = c.lineCap = 'round';

  // 1) Base blanca
  poly(IDX.oval.map(P));
  c.fillStyle = c.strokeStyle = 'rgba(248,244,236,.93)'; c.lineWidth = faceW * 0.03;
  c.fill(); c.stroke();

  // 2) Ojos: rombos oscuros con rayos y centro naranja
  [[33, 133], [263, 362]].forEach(([o, i]) => {
    const a = P(o), b = P(i), e = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, ew = P2(a, b);
    c.fillStyle = INK;
    poly([at(e, 0, -ew * 1.05), at(e, ew * 0.95, 0), at(e, 0, ew * 1.05), at(e, -ew * 0.95, 0)]); c.fill();
    c.strokeStyle = INK; c.lineWidth = ink;
    for (let s = -1; s <= 1; s++) {
      const p1 = at(e, s * ew * 0.5, -ew * 1.1), p2 = at(e, s * ew * 0.75, -ew * 1.65);
      c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke();
    }
    c.fillStyle = ORANGE; c.beginPath(); c.arc(e.x, e.y, ew * 0.13, 0, 6.2832); c.fill();
  });

  // 3) Pómulos: rombos naranja con borde oscuro
  [50, 280].forEach(k => {
    const p = P(k), r = faceW * 0.05;
    poly([at(p, 0, -r), at(p, r, 0), at(p, 0, r), at(p, -r, 0)]);
    c.fillStyle = ORANGE; c.fill(); c.strokeStyle = INK; c.lineWidth = ink; c.stroke();
  });

  // 4) Nariz: triángulo oscuro
  c.fillStyle = INK; poly([P(6), P(98), P(327)]); c.fill();

  // 5) Bigote estilizado
  const C = P(164);
  [-1, 1].forEach(s => {
    const tip = at(P(s < 0 ? 61 : 291), s * faceW * 0.1, -faceH * 0.03);
    const low = at(C, s * faceW * 0.16, faceH * 0.075), up = at(C, s * faceW * 0.15, -faceH * 0.01);
    c.fillStyle = INK; c.beginPath();
    c.moveTo(C.x, C.y); c.quadraticCurveTo(low.x, low.y, tip.x, tip.y); c.quadraticCurveTo(up.x, up.y, C.x, C.y); c.fill();
  });

  // 6) Costuras sobre los labios
  const m1 = P(61), m2 = P(291), mw = P2(m1, m2), mid = { x: (m1.x + m2.x) / 2, y: (m1.y + m2.y) / 2 };
  const halfH = Math.max(P2(P(0), P(17)) * 0.8, faceH * 0.045);
  c.strokeStyle = INK; c.lineWidth = ink;
  c.beginPath(); c.moveTo(m1.x, m1.y); c.lineTo(m2.x, m2.y); c.stroke();
  for (let t = -0.4; t <= 0.41; t += 0.1) {
    const a = at(mid, t * mw, -halfH), b = at(mid, t * mw, halfH);
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  }

  // 7) Sombrero de copa con banda naranja y flor (gira con la cabeza)
  const top = P(10), hw = faceW * 0.62;
  c.translate(top.x, top.y); c.rotate(roll);
  c.fillStyle = INK;
  c.beginPath(); c.ellipse(0, faceH * 0.02, hw, faceW * 0.07, 0, 0, 6.2832); c.fill();
  c.fillRect(-hw * 0.62, -faceH * 0.5, hw * 1.24, faceH * 0.52);
  c.fillStyle = ORANGE; c.fillRect(-hw * 0.62, -faceH * 0.13, hw * 1.24, faceH * 0.07);
  flower(c, hw * 0.42, -faceH * 0.095, faceW * 0.07, '#d6246e', '#ffd400');

  c.restore();
}
