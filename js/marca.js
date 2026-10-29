/* ==================================================
   CatrinART
   MÓDULO: MARCA DE AGUA DEL CENTRO CULTURAL TEOPANZOLCO
   ==================================================
   Imprime el logo (assets/logo-teo.png, blanco con fondo transparente) en las fotos y videos:
   el logo en la parte de abajo, con una sombra suave para que se lea
   sobre fondos claros u oscuros. Es parte de la imagen, así que viaja con lo que se comparte o imprime.
   Ajustes en js/config.js: MARCA_AGUA, MARCA_ABAJO_ALFA/ANCHO, MARCA_EN_VIVO.
   ================================================== */

const marca = { logo: null, ratio: 0.277 };   // ratio = alto / ancho del logo

/** Carga el logo una sola vez y lo deja listo en un canvas. Si falla, la app sigue sin marca de agua. */
async function initMarca() {
  if (!CONFIG.MARCA_AGUA) return;   // desactivada: no se descarga el logo
  try {
    const img = new Image();
    img.src = CONFIG.LOGO_TEO;
    await img.decode();
    const w = 1024, h = Math.round(w * img.naturalHeight / img.naturalWidth);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, w, h);
    marca.ratio = h / w;
    marca.logo = cv;
  } catch (e) {
    console.warn('No se pudo cargar el logo para la marca de agua:', e);
  }
}

/** Dibuja la marca de agua (logo abajo, centrado) sobre un canvas de tamaño W x H. */
function dibujarMarcaAgua(c, W, H) {
  if (!CONFIG.MARCA_AGUA || !marca.logo) return;
  const base = Math.min(W, H * 1.1);            // en horizontal los logos no se agrandan de más
  c.save();
  c.shadowColor = 'rgba(0,0,0,.55)';
  c.shadowBlur = base * 0.006;

  const w = base * CONFIG.MARCA_ABAJO_ANCHO, h = w * marca.ratio;
  c.globalAlpha = CONFIG.MARCA_ABAJO_ALFA;
  c.drawImage(marca.logo, (W - w) / 2, H - h - H * 0.04, w, h);
  c.restore();
}

/** Devuelve el canvas que se exporta como foto: una copia con la marca de agua (si no está ya en la vista en vivo). */
function canvasParaExportar() {
  if (!CONFIG.MARCA_AGUA || !marca.logo || CONFIG.MARCA_EN_VIVO) return canvas;
  const t = document.createElement('canvas');
  t.width = canvas.width; t.height = canvas.height;
  const g = t.getContext('2d');
  g.drawImage(canvas, 0, 0);
  dibujarMarcaAgua(g, t.width, t.height);
  return t;
}
