/* ==================================================
   CatrinART
   MÓDULO: DISEÑO DE CATRINA (imagen con transparencia: SVG o PNG)
   ==================================================
   Usa el arte de la Catrina (calavera + rosas, cempasúchil, hojas y espirales) como maquillaje:

   - CONFIG.DISENO_FLORES   -> solo flores y hojas (sin calavera). Se dibuja ENCIMA de la malla con textura
                               y reemplaza las flores hechas con código (corona y mejillas).
   - CONFIG.DISENO_COMPLETO -> el diseño entero. Se usa como RESPALDO cuando la malla/textura no carga
                               (sin WebGL, SVG ausente, etc.). Reemplaza el dibujo hecho con código.

   Las imágenes se rasterizan UNA sola vez a un canvas; en cada cuadro solo se estiran y rotan sobre el rostro.
   Se pueden cambiar por archivos .svg o .png (fondo transparente) respetando el mismo encuadre que ANCLA.
   Si alguna imagen no carga, la app sigue con el dibujo de maquillaje.js.
   ================================================== */

const diseno = { flores: null, completo: null, lado: 0 };

/* Puntos de referencia del arte (fracción del ancho/alto de la imagen, 0 a 1).
   Si cambias el arte, ajusta estos valores:
   ojosX/ojosY = punto medio entre las dos cuencas · calaveraW = ancho máximo de la calavera · mentonY = parte baja de la mandíbula */
const ANCLA = { ojosX: 626 / 1254, ojosY: 712 / 1254, calaveraW: 542 / 1254, mentonY: 1157 / 1254 };
const DISENO_AJUSTE_ANCHO = 1.04;   // 1 = calavera del ancho exacto del rostro; >1 = un poco más grande

/** Carga una imagen (PNG/SVG) y la rasteriza a un canvas cuadrado. Devuelve null si falla. */
async function cargarDiseno(src) {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const lado = CONFIG.TEXTURA_PX || 1024;
    const cv = document.createElement('canvas');
    cv.width = cv.height = lado;
    const g = cv.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, lado, lado);
    diseno.lado = lado;
    return cv;
  } catch (e) {
    console.warn('No se pudo cargar el diseño', src, e);
    return null;
  }
}

async function initDiseno() {
  [diseno.flores, diseno.completo] = await Promise.all([cargarDiseno(CONFIG.DISENO_FLORES), cargarDiseno(CONFIG.DISENO_COMPLETO)]);
}

/** Dibuja el diseño sobre un rostro. cual: 'flores' | 'completo'. pts = puntos normalizados; W, H = tamaño del canvas. */
function dibujarDiseno(c, pts, W, H, cual) {
  const img = diseno[cual];
  if (!img || pts.length < 468) return;
  const P = k => ({ x: pts[k].x * W, y: pts[k].y * H });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ojoI = { x: (P(33).x + P(133).x) / 2, y: (P(33).y + P(133).y) / 2 };
  const ojoD = { x: (P(263).x + P(362).x) / 2, y: (P(263).y + P(362).y) / 2 };
  const mid = { x: (ojoI.x + ojoD.x) / 2, y: (ojoI.y + ojoD.y) / 2 };
  const roll = Math.atan2(ojoD.y - ojoI.y, ojoD.x - ojoI.x);
  const v = { x: -Math.sin(roll), y: Math.cos(roll) };          // "hacia abajo" siguiendo la inclinación de la cabeza

  const L = diseno.lado;
  const faceW = dist(P(234), P(454));
  const chin = P(152);
  const alto = (chin.x - mid.x) * v.x + (chin.y - mid.y) * v.y;  // de los ojos a la barbilla
  const sx = faceW * DISENO_AJUSTE_ANCHO / (ANCLA.calaveraW * L);
  let sy = alto / ((ANCLA.mentonY - ANCLA.ojosY) * L);
  sy = Math.min(Math.max(sy, sx * 0.8), sx * 1.25);              // evita deformaciones raras si la cabeza se inclina

  c.save();
  c.translate(mid.x, mid.y);
  c.rotate(roll);
  c.scale(sx, sy);
  c.drawImage(img, -ANCLA.ojosX * L, -ANCLA.ojosY * L, L, L);
  c.restore();
}
