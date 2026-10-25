/* ==================================================
   CATRINA AR
   MÓDULO: ESTILO POR ROSTRO (proporciones de la malla facial)
   ==================================================
   Para cada rostro estima dos puntajes entre 0 y 1: "nino" y "masc".
     niño/niña -> little · adulto con puntaje masculino -> catrin · si no -> catrina
   Aviso: estima por proporciones y puede equivocarse. Por eso:
     - los puntajes se suavizan en el tiempo y se siguen por rostro (no parpadean),
     - tocar un rostro cambia su estilo a mano (Automático > Catrina > Catrín > Little),
     - agregar #debug al final de la dirección muestra las medidas para calibrar CONFIG.ANTRO.
   No se guarda nada; todo ocurre en el dispositivo.
   ================================================== */

const NOMBRE_ESTILO = { catrina: 'Catrina', catrin: 'Catrín', little: 'Little Catrín' };
const ORDEN_MANUAL = [null, 'catrina', 'catrin', 'little'];
let tracks = [];

const rampa = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));   // 0 en a, 1 en b (si a > b, invierte)

/** Medidas del rostro, normalizadas para no depender de la distancia a la cámara. */
function metricas(pts, W, H) {
  const d = (a, b) => Math.hypot((pts[a].x - pts[b].x) * W, (pts[a].y - pts[b].y) * H);
  const ipd = d(468, 473) || d(33, 263);          // distancia entre pupilas
  const w = d(234, 454), h = d(10, 152);          // ancho y alto del rostro
  return {
    ah: w / h,                                    // redondez
    tercio: d(2, 152) / h,                        // nariz-barbilla
    mand: d(58, 288) / w,                         // anchura de mandíbula
    ceja: (d(105, 159) + d(334, 386)) / 2 / ipd   // distancia ceja-ojo
  };
}

function puntajes(m) {
  const A = CONFIG.ANTRO;
  return {
    nino: (rampa(m.ah, A.ahMin, A.ahMax) + rampa(m.tercio, A.tercioMax, A.tercioMin)) / 2,
    masc: (rampa(m.mand, A.mandMin, A.mandMax) + rampa(m.ceja, A.cejaMax, A.cejaMin)) / 2
  };
}

/** Une cada rostro detectado con su seguimiento anterior (por cercanía de la nariz) y actualiza sus puntajes. */
function asignarEstilos(faces, W, H) {
  const usados = new Set(), k = CONFIG.ANTRO.suavizado;
  const out = faces.map(pts => {
    const n = pts[1], m = metricas(pts, W, H), s = puntajes(m);
    let mejor = -1, dist = 0.12;
    tracks.forEach((t, i) => {
      const dd = Math.hypot(t.x - n.x, t.y - n.y);
      if (!usados.has(i) && dd < dist) { dist = dd; mejor = i; }
    });
    let t;
    if (mejor < 0) { t = { nino: s.nino, masc: s.masc, override: null, labelUntil: 0, miss: 0 }; tracks.push(t); usados.add(tracks.length - 1); }
    else { t = tracks[mejor]; usados.add(mejor); t.nino += (s.nino - t.nino) * k; t.masc += (s.masc - t.masc) * k; }
    t.x = n.x; t.y = n.y; t.miss = 0; t.m = m;
    t.ancho = Math.abs(pts[454].x - pts[234].x); t.alto = Math.abs(pts[152].y - pts[10].y);
    return t;
  });
  tracks.forEach((t, i) => { if (!usados.has(i)) t.miss++; });
  tracks = tracks.filter(t => t.miss < 90);       // se olvida un rostro tras ~1.5 s sin verlo
  return out;
}

function estiloDe(t) {
  if (t.override) return t.override;
  const A = CONFIG.ANTRO;
  if (t.nino >= A.umbralNino) return 'little';
  return t.masc >= A.umbralMasc ? 'catrin' : 'catrina';
}

/** Etiqueta breve al cambiar el estilo a mano; con #debug muestra además las medidas. */
function dibujarRotulo(c, t, W, H) {
  const lineas = [];
  if (performance.now() < t.labelUntil) lineas.push(t.override ? NOMBRE_ESTILO[t.override] : 'Automático');
  if (location.hash === '#debug' && t.m) {
    const m = t.m;
    lineas.push('ah ' + m.ah.toFixed(2) + ' tercio ' + m.tercio.toFixed(2) + ' mand ' + m.mand.toFixed(2) + ' ceja ' + m.ceja.toFixed(2));
    lineas.push('niño ' + t.nino.toFixed(2) + ' masc ' + t.masc.toFixed(2) + ' = ' + estiloDe(t));
  }
  if (!lineas.length) return;
  c.save();
  c.font = 'bold ' + Math.round(W * 0.035) + 'px sans-serif';
  c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#000'; c.fillStyle = '#fff';
  lineas.forEach((txt, i) => {
    const y = (t.y + t.alto * 0.75) * H + i * W * 0.04;
    c.strokeText(txt, t.x * W, y); c.fillText(txt, t.x * W, y);
  });
  c.restore();
}

/* Tocar un rostro cambia su estilo: Automático > Catrina > Catrín > Little */
canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  const t = tracks.find(t => Math.abs(x - t.x) < t.ancho * 0.6 && Math.abs(y - t.y) < t.alto * 0.6);
  if (!t) return;
  t.override = ORDEN_MANUAL[(ORDEN_MANUAL.indexOf(t.override) + 1) % ORDEN_MANUAL.length];
  t.labelUntil = performance.now() + 1500;
});
