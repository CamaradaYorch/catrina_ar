/* ==================================================
   CatrinART
   MÓDULO: DETECCIÓN DE ROSTROS (MEDIAPIPE FACE LANDMARKER)
   ==================================================
   Detecta hasta CONFIG.MAX_FACES rostros y entrega 468 puntos por rostro (x, y entre 0 y 1).
   Todo corre en el navegador; ninguna imagen se envía a un servidor.
   El modelo (.task) y MediaPipe viven dentro del sitio: vendor/mediapipe/ (con respaldo en servidores externos si fallan)
   ================================================== */

const face = { model: null, loading: false, ready: false, faces: [], lastT: 0, lastTs: 0 };
const faceInput = document.createElement('canvas');   // copia reducida y recortada igual que la pantalla
const faceInputCtx = faceInput.getContext('2d');

/**
 * Crea el detector con una fuente de archivos (en tu sitio o en el servidor externo de respaldo); intenta GPU y, si falla, CPU.
 * f = { nombre, mjs, wasm, modelo }
 */
async function crearDetector(f) {
  // 1) El modelo local debe existir en el sitio (si no, se avisa con el nombre exacto)
  if (!/^https?:/.test(f.modelo)) {
    const head = await fetch(f.modelo, { method: 'HEAD' }).catch(() => null);
    const type = head ? (head.headers.get('content-type') || '') : '';
    if (!head || !head.ok || type.includes('text/html')) throw new Error('FALTA_MODELO');
  }
  // 2) La librería: primero como script clásico; si no expone nada, se importa el módulo
  let T = [window, window.tasksVision, window.vision].find(o => o && o.FaceLandmarker);
  if (!T) T = await import(f.mjs);
  if (!T || !T.FaceLandmarker) throw new Error('FALTA_LIBRERIA');
  const files = await T.FilesetResolver.forVisionTasks(f.wasm);
  for (const delegate of ['GPU', 'CPU']) {
    try {
      return await T.FaceLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: f.modelo, delegate },
        runningMode: 'VIDEO',
        numFaces: CONFIG.MAX_FACES,
        outputFaceBlendshapes: false,

        // CLAVE: Desactiva los puntos extra de iris/ojos para fijar la malla en 468 vértices exactos
        refineLandmarks: false,
        // Umbrales calibrados para captar rostros lejanos a 1-2 metros sin perderlos ante movimientos
        minFaceDetectionConfidence: 0.35,
        minFacePresenceConfidence: 0.35,
        minTrackingConfidence: 0.35
      });
    } catch (e) { console.warn('Face Landmarker (' + f.nombre + ') con', delegate, 'falló:', e); }
  }
  throw new Error('No se pudo crear el modelo');
}

/** Carga la librería y el modelo: primero desde tu sitio (vendor/mediapipe) y, si falla, desde el respaldo externo. */
async function initFace() {
  if (face.model || face.loading) return;
  face.loading = true;
  const fuentes = [{ nombre: 'sitio', mjs: CONFIG.MEDIAPIPE_MJS, wasm: CONFIG.MEDIAPIPE_WASM, modelo: CONFIG.FACE_MODEL }];
  if (CONFIG.MEDIAPIPE_MJS_CDN) fuentes.push({ nombre: 'externo', mjs: CONFIG.MEDIAPIPE_MJS_CDN, wasm: CONFIG.MEDIAPIPE_WASM_CDN, modelo: CONFIG.FACE_MODEL_CDN });

  let ultimoError = null;
  for (const fu of fuentes) {
    try {
      face.model = await crearDetector(fu);
      if (fu.nombre !== 'sitio') console.info('MediaPipe cargado desde el respaldo externo');
      break;
    } catch (e) {
      ultimoError = e;
      console.warn('Detector de rostros (' + fu.nombre + '):', e);
    }
  }
  if (face.model) {
    face.ready = true;
    setStatus('');
  } else {
    const msg = String(ultimoError && ultimoError.message);
    setStatus(msg === 'FALTA_MODELO' ? 'Falta el modelo: revisa que exista ' + CONFIG.FACE_MODEL
            : msg === 'FALTA_LIBRERIA' ? 'No cargó la librería de MediaPipe (¿sin internet?)'
            : 'No cargó el detector de rostros (abre la consola, F12, para ver el motivo)');
  }
  face.loading = false;
}

/** Tamaño estable de la entrada: ajusta según cámara frontal (480px) o trasera (640px) para largo alcance. */
function sizeFaceInput(w, h) {
  const isRear = (typeof state !== 'undefined' && state.facing === 'environment');
  const baseSide = isRear ? (CONFIG.FACE_INPUT_SIDE_REAR || 640) : (CONFIG.FACE_INPUT_SIDE || 480);
  const k = baseSide / Math.max(w, h);
  faceInput.width = Math.round(w * k);
  faceInput.height = Math.round(h * k);
}

/** Pide nuevos puntos al modelo con tolerancia temporal (no pierde el filtro a distancia si hay 1 fotograma borroso). */
function detectFaces() {
  if (!face.model) return;
  const now = performance.now();
  if (now - face.lastT < CONFIG.DETECT_EVERY_MS) return;
  face.lastT = now;

  // Mismo recorte y espejo que la imagen final: los puntos caen directo sobre el canvas
  drawCover(faceInputCtx, video, faceInput.width, faceInput.height);
  face.lastTs = Math.max(Math.round(now), face.lastTs + 1);   // la marca de tiempo debe crecer siempre

  try {
    const found = face.model.detectForVideo(faceInput, face.lastTs).faceLandmarks || [];
    
    // Si la persona se aleja a 1m o más, un parpadeo o sombra no tira el filtro de inmediato (tolerancia de 3 cuadros)
    if (found.length === 0) {
      face.lostCount = (face.lostCount || 0) + 1;
      if (face.lostCount <= 3 && face.faces.length > 0) {
        return; // Mantiene el tracking sin parpadeo
      }
      face.faces = [];
      return;
    }
    face.lostCount = 0;

    const old = face.faces;
    // Mapeo uniforme y seguro para toda la malla 3D (evita cualquier ruptura de triángulos)
    face.faces = found.map((pts, i) => {
      const prev = old.length === found.length ? old[i] : null;
      return pts.map((p, j) => prev
        ? { x: prev[j].x * 0.35 + p.x * 0.65, y: prev[j].y * 0.35 + p.y * 0.65 }
        : { x: p.x, y: p.y });
    });
  } catch (e) { /* un cuadro fallido se ignora */ }
}

/** Olvida los rostros actuales (al voltear espejo o cambiar de cámara). */
function resetFace() { 
  face.faces = [];
  face.lostCount = 0;
}