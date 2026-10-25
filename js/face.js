/* ==================================================
   CATRINA AR
   MÓDULO: DETECCIÓN DE ROSTROS (MEDIAPIPE FACE LANDMARKER)
   ==================================================
   Detecta hasta CONFIG.MAX_FACES rostros y entrega 478 puntos por rostro (x, y entre 0 y 1).
   Todo corre en el navegador; ninguna imagen se envía a un servidor.
   El modelo (.task) vive dentro del sitio: models/face_landmarker.task
   ================================================== */

const face = { model: null, loading: false, ready: false, faces: [], lastT: 0, lastTs: 0 };
const faceInput = document.createElement('canvas');   // copia reducida y recortada igual que la pantalla
const faceInputCtx = faceInput.getContext('2d');

/** Carga la librería y el modelo; intenta GPU y, si falla, CPU. */
async function initFace() {
  if (face.model || face.loading) return;
  face.loading = true;
  try {
    // 1) El archivo del modelo debe existir en el sitio (si no, se avisa con el nombre exacto)
    const externo = /^https?:/.test(CONFIG.FACE_MODEL);
    const head = externo ? { ok: true, headers: new Headers() } : await fetch(CONFIG.FACE_MODEL, { method: 'HEAD' }).catch(() => null);
    const type = head ? (head.headers.get('content-type') || '') : '';
    if (!head || !head.ok || type.includes('text/html')) {
      throw new Error('FALTA_MODELO');
    }
    // 2) La librería: primero como script clásico; si no expone nada, se importa el módulo oficial
    let T = [window, window.tasksVision, window.vision].find(o => o && o.FaceLandmarker);
    if (!T) T = await import(CONFIG.MEDIAPIPE_MJS);
    if (!T || !T.FaceLandmarker) throw new Error('FALTA_LIBRERIA');
    const files = await T.FilesetResolver.forVisionTasks(CONFIG.MEDIAPIPE_WASM);
    for (const delegate of ['GPU', 'CPU']) {
      try {
        face.model = await T.FaceLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: CONFIG.FACE_MODEL, delegate },
          runningMode: 'VIDEO',
          numFaces: CONFIG.MAX_FACES,
          outputFaceBlendshapes: false
        });
        break;
      } catch (e) { console.warn('Face Landmarker con', delegate, 'falló:', e); }
    }
    if (!face.model) throw new Error('No se pudo crear el modelo');
    face.ready = true;
    setStatus('');
  } catch (e) {
    console.error('Detector de rostros:', e);
    const msg = String(e && e.message);
    setStatus(msg === 'FALTA_MODELO' ? 'Falta el modelo: revisa que exista ' + CONFIG.FACE_MODEL
            : msg === 'FALTA_LIBRERIA' ? 'No cargó la librería de MediaPipe (¿sin internet?)'
            : 'No cargó el detector de rostros (abre la consola, F12, para ver el motivo)');
  }
  face.loading = false;
}

/** Tamaño estable de la entrada: lado largo = CONFIG.FACE_INPUT_SIDE, con la proporción de la pantalla. */
function sizeFaceInput(w, h) {
  const k = CONFIG.FACE_INPUT_SIDE / Math.max(w, h);
  faceInput.width = Math.round(w * k);
  faceInput.height = Math.round(h * k);
}

/** Pide nuevos puntos al modelo (limitado a CONFIG.DETECT_EVERY_MS) y los suaviza para evitar temblor. */
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
    const old = face.faces;
    face.faces = found.map((pts, i) => {
      const prev = old.length === found.length ? old[i] : null;
      return pts.map((p, j) => prev
        ? { x: prev[j].x * 0.4 + p.x * 0.6, y: prev[j].y * 0.4 + p.y * 0.6 }
        : { x: p.x, y: p.y });
    });
  } catch (e) { /* un cuadro fallido se ignora */ }
}

/** Olvida los rostros actuales (al voltear espejo o cambiar de cámara). */
function resetFace() { face.faces = []; }
