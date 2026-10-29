/* ==================================================
   CatrinART
   MÓDULO: ESTADO Y UTILIDADES COMPARTIDAS (STATE)
   ==================================================

   ÍNDICE:
   01. Utilidad de Selección Rápida del DOM
   02. Referencias a Elementos Principales del DOM
   03. Objeto de Estado Global de la Aplicación
   04. Función de Renderizado y Ajuste de Imagen (drawCover)
   05. Gestión de Mensajes de Estado en Pantalla (setStatus)
   06. Gestión de Notas en la Vista Previa Modal (setNote)

   ================================================== */


/* ============ 01. UTILIDAD DE SELECCIÓN RÁPIDA DEL DOM ============ */
/**
 * Función abreviada para obtener elementos del DOM por su ID.
 * @param {string} id - Identificador único del elemento.
 * @returns {HTMLElement|null}
 */
const $ = id => document.getElementById(id);


/* ============ 02. REFERENCIAS A ELEMENTOS PRINCIPALES DEL DOM ============ */
const stage = $('stage');           // Contenedor principal de pantalla completa
const video = $('webcam');          // Elemento <video> oculto que procesa el flujo de la cámara
const canvas = $('pixelCanvas');    // Lienzo interactivo donde se pinta el filtro (lo que ve el usuario y se graba)
const ctx = canvas.getContext('2d'); // Contexto de renderizado 2D para el canvas


/* ============ 03. OBJETO DE ESTADO GLOBAL DE LA APLICACIÓN ============ */
const state = {
  facing: 'user',                   // Dirección de la cámara: 'user' = frontal, 'environment' = trasera
  mirrored: true,                   // Estado del modo espejo (true invierte horizontalmente la vista previa)
  isRecording: false,               // Indicador booleano de si hay una grabación de video en curso
  lastMedia: null,                  // Almacena la última captura: { type: 'image' | 'video', url, ext, mime, title }
  corona: true,                     // true: se dibuja la corona de flores (botón 🌼 del lado derecho)
  disenoIndex: 0,                   // Índice del diseño activo en CONFIG.DISENOS (cambia con botón 🎨)
};


/* ============ 04. FUNCIÓN DE RENDERIZADO Y AJUSTE DE IMAGEN (DRAWCOVER) ============ */
/**
 * Dibuja un recurso (video o imagen) cubriendo todo el espacio de destino (efecto "cover"),
 * recortando los excedentes y aplicándole el efecto espejo si está activo.
 * Garantiza que lo visualizado en pantalla sea exactamente lo capturado.
 * 
 * @param {CanvasRenderingContext2D} c - Contexto 2D del canvas.
 * @param {HTMLVideoElement|HTMLImageElement} src - Recurso de origen a dibujar.
 * @param {number} dw - Ancho de destino.
 * @param {number} dh - Alto de destino.
 */
function drawCover(c, src, dw, dh) {
  const sw = src.videoWidth || src.width;
  const sh = src.videoHeight || src.height;
  const srcAspect = sw / sh;
  const dstAspect = dw / dh;
  
  let cw = sw, ch = sh, cx = 0, cy = 0;

  // Cálculo para ajustar manteniendo la proporción (object-fit: cover)
  if (srcAspect > dstAspect) { 
    cw = sh * dstAspect; 
    cx = (sw - cw) / 2; 
  } else { 
    ch = sw / dstAspect; 
    cy = (sh - ch) / 2; 
  }

  c.save();
  // Aplica efecto de espejo horizontal si el estado lo requiere
  if (state.mirrored) { 
    c.translate(dw, 0); 
    c.scale(-1, 1); 
  }
  c.drawImage(src, cx, cy, cw, ch, 0, 0, dw, dh);
  c.restore();
}


/* ============ 05. GESTIÓN DE MENSAJES DE ESTADO EN PANTALLA ============ */
let statusTimer;

/**
 * Muestra un mensaje temporal o permanente en la barra de estado sobre la cámara.
 * @param {string} text - Texto del mensaje a mostrar.
 * @param {number} [ms] - Tiempo en milisegundos antes de borrarlo automáticamente (opcional).
 */
function setStatus(text, ms) {
  $('statusMsg').textContent = text;
  clearTimeout(statusTimer);
  if (ms) {
    statusTimer = setTimeout(() => { 
      $('statusMsg').textContent = ''; 
    }, ms);
  }
}


/* ============ 06. GESTIÓN DE NOTAS EN LA VISTA PREVIA MODAL ============ */
/**
 * Actualiza el texto de notificación dentro de la ventana modal de vista previa.
 * @param {string} text - Mensaje informativo o de error para el usuario.
 */
function setNote(text) { 
  $('modalNote').textContent = text || ''; 
}