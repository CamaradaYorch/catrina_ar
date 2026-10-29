/* ==================================================
   CatrinART
   MÓDULO: SONIDOS DE LA INTERFAZ (estilo "pixel", generados con Web Audio)
   ==================================================
   No usa archivos de audio: los sonidos se sintetizan en el momento, así no pesan ni dependen de la red.
   - Todos los botones suenan con un "clic" por defecto; MAPA_SONIDOS asigna uno distinto a cada botón.
   - Se activan en CONFIG.SONIDOS y el volumen en CONFIG.SONIDO_VOLUMEN.
   - El audio del navegador solo se habilita tras un toque del usuario: el primer toque lo desbloquea.
   - En iPhone, si el interruptor de silencio está activado, no suena (es una regla del sistema).
   ================================================== */

let audioCtx = null;

function audioListo() {
  if (!CONFIG.SONIDOS) return null;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (e) { return null; }
}

/** Nota corta: frecuencia (Hz), inicio (s desde ahora), duración (s), forma de onda, volumen relativo y glissando opcional. */
function nota(a, f, ini, dur, tipo = 'square', vol = 1, haciaF = null) {
  const t0 = a.currentTime + ini, o = a.createOscillator(), g = a.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t0);
  if (haciaF) o.frequency.exponentialRampToValueAtTime(haciaF, t0 + dur);
  const v = Math.max(0.0001, CONFIG.SONIDO_VOLUMEN * vol * 0.4);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

/** Ráfaga de ruido (para el "clic" del obturador). */
function ruido(a, ini, dur, vol = 1) {
  const n = Math.max(1, Math.floor(a.sampleRate * dur)), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t0 = a.currentTime + ini;
  f.type = 'bandpass'; f.frequency.value = 2200;
  g.gain.value = CONFIG.SONIDO_VOLUMEN * vol * 0.5;
  s.buffer = b; s.connect(f).connect(g).connect(a.destination); s.start(t0);
}

const SONIDOS = {
  click:   a => { nota(a, 880, 0, 0.06, 'square', 0.8, 1320); },
  switch:  a => { nota(a, 660, 0, 0.06); nota(a, 990, 0.07, 0.08); },
  shutter: a => { ruido(a, 0, 0.05); nota(a, 1500, 0, 0.03, 'square', 0.6); ruido(a, 0.09, 0.07); nota(a, 1000, 0.09, 0.05, 'square', 0.6); },
  rec:     a => { nota(a, 440, 0, 0.07); nota(a, 660, 0.08, 0.07); nota(a, 880, 0.16, 0.1); },
  stop:    a => { nota(a, 880, 0, 0.07); nota(a, 660, 0.08, 0.07); nota(a, 440, 0.16, 0.12); },
  share:   a => { nota(a, 660, 0, 0.06); nota(a, 990, 0.07, 0.06); nota(a, 1320, 0.14, 0.1); },
  save:    a => { nota(a, 988, 0, 0.07); nota(a, 1319, 0.08, 0.14); },
  close:   a => { nota(a, 520, 0, 0.07, 'square', 0.8, 330); },
  poweron: a => { nota(a, 110, 0, 0.35, 'sawtooth', 0.7, 880); nota(a, 1320, 0.34, 0.12); },
};

/** Sonido de cada botón por su id; los que no aparecen usan "click"; null = sin sonido (ya lo reproduce otra parte). */
const MAPA_SONIDOS = {
  btnCorona: 'switch',
  splashStart: null,                       // lo reproduce launchApp con "poweron"
  btnPhoto: 'shutter', btnVideo: 'rec',
  btnShare: 'share', btnBrandShare: 'share', modalShareBtn: 'share', modalWhatsappBtn: 'share', modalXBtn: 'share',
  modalDownloadBtn: 'save', btnClosePreview: 'close',
  btnToggleMirror: 'switch', btnFlipCamera: 'switch',
};

function playPixelSound(nombre) {
  const a = audioListo();
  if (a && SONIDOS[nombre]) SONIDOS[nombre](a);
}

// Un solo escucha para todos los botones y enlaces (en captura: suena antes de que actúe el botón)
document.addEventListener('click', e => {
  const el = e.target.closest('button, a.btn, .gate__skip');
  if (!el || el.disabled) return;
  const nombre = el.id in MAPA_SONIDOS ? MAPA_SONIDOS[el.id] : 'click';
  if (nombre) playPixelSound(nombre);
}, true);
