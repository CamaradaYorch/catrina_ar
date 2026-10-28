/* ==================================================
   CatrinART
   MÓDULO: CAPTURA DE FOTOS, VIDEOS Y DESCARGAS (CAPTURE)
   ==================================================

   ÍNDICE:
   01. Variables Globales de Grabación y Buffers
   02. Gestión y Actualización del Último Medio Capturado (setMedia)
   03. Captura de Fotografías Estáticas (takePhoto)
   04. Grabación de Video, Integración de Audio y Temporizador (startRecording)
   05. Gestión de la Ventana Modal de Vista Previa (openModal, closeModal)
   06. Exportación y Descarga Local de Archivos (downloadMedia)

   ================================================== */


/* ============ 01. VARIABLES GLOBALES DE GRABACIÓN Y BUFFERS ============ */
let recorder;
let chunks = [];


/* ============ 02. GESTIÓN Y ACTUALIZACIÓN DEL ÚLTIMO MEDIO CAPTURADO ============ */
/**
 * Almacena el medio actual en el estado global, hace visible el botón de última captura
 * y pre-cachea el archivo para optimizar la acción de compartir.
 * @param {Object} media - Objeto con los datos del archivo ({ type, url, ext, mime, title }).
 */
function setMedia(media) {
  state.lastMedia = media;
  $('btnLast').classList.remove('invisible');
  prepareShareFile();
}


/* ============ 03. CAPTURA DE FOTOGRAFÍAS ESTÁTICAS ============ */
/**
 * Captura el fotograma actual del canvas como una imagen PNG estática,
 * la registra en el estado y abre el modal de vista previa.
 */
function takePhoto() {
  const url = canvasParaExportar().toDataURL('image/png');   // con marca de agua del Teopanzolco
  setMedia({ type: 'image', url, ext: 'png', mime: 'image/png', title: 'Mi CatrinART' });
  openModal();
}


/* ============ 04. GRABACIÓN DE VIDEO, INTEGRACIÓN DE AUDIO Y TEMPORIZADOR ============ */
/**
 * Inicia el proceso de grabación del canvas en formato de video, 
 * integrando opcionalmente el audio del micrófono del dispositivo.
 */
async function startRecording() {
  if (state.isRecording) return;
  
  if (!window.MediaRecorder) { 
    setStatus('Tu navegador no puede grabar video', 4000); 
    return; 
  }
  
  chunks = [];
  const stream = canvas.captureStream(30);

  // El micrófono se solicita únicamente al grabar; si el usuario lo deniega, el video se graba sin audio
  let mic = null;
  try { 
    mic = await navigator.mediaDevices.getUserMedia({ audio: true }); 
    mic.getAudioTracks().forEach(t => stream.addTrack(t)); 
  } catch (e) {}

  // Prioriza formatos MP4 (mejor compatibilidad con X y redes sociales); usa WebM como respaldo
  const mime = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 
    'video/mp4;codecs=avc1', 
    'video/mp4',
    'video/webm;codecs=vp9', 
    'video/webm;codecs=vp8', 
    'video/webm'
  ].find(m => MediaRecorder.isTypeSupported(m)) || '';
  
  recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const type = recorder.mimeType || 'video/webm';

  recorder.ondataavailable = e => { 
    if (e.data && e.data.size) chunks.push(e.data); 
  };
  
  recorder.onstop = () => {
    if (mic) mic.getTracks().forEach(t => t.stop());
    if (typeof playPixelSound === 'function') playPixelSound('stop');
    const url = URL.createObjectURL(new Blob(chunks, { type }));
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    
    setMedia({ 
      type: 'video', 
      url, 
      ext, 
      mime: type.split(';')[0], 
      title: `Mi video (${CONFIG.RECORD_SECONDS} s)` 
    });
    
    openModal();
    
    if (ext === 'webm') {
      setNote('Este navegador grabó en .webm: X y otras apps pueden no aceptarlo');
    }
  };

  recorder.start();
  state.isRecording = true;
  $('recBadge').classList.remove('hidden');
  $('btnPhoto').disabled = $('btnVideo').disabled = true;

  let left = CONFIG.RECORD_SECONDS;
  $('recTimer').textContent = `REC ${left}s`;
  
let recordTimer = null;

  recordTimer = setInterval(() => {
    left--;
    $('recTimer').textContent = `REC ${left}s`;
    if (left <= 0) {
      clearInterval(recordTimer);
      if (recorder && recorder.state === 'recording') recorder.stop();
      state.isRecording = false;
      $('recBadge').classList.add('hidden');
      $('btnPhoto').disabled = $('btnVideo').disabled = false;
    }
  }, 1000);
}

/**
 * Detiene inmediatamente la grabación si el usuario cambia de app o minimiza la ventana.
 */
function abortOrStopRecording() {
  if (state.isRecording) {
    clearInterval(recordTimer);
    if (recorder && recorder.state === 'recording') {
      try { recorder.stop(); } catch(e) {}
    }
    state.isRecording = false;
    $('recBadge')?.classList.add('hidden');
    if ($('btnPhoto')) $('btnPhoto').disabled = false;
    if ($('btnVideo')) $('btnVideo').disabled = false;
  }
}


/* ============ 05. GESTIÓN DE LA VENTANA MODAL DE VISTA PREVIA ============ */
/**
 * Muestra la última captura (imagen o video) dentro del modal emergente con sus opciones de compartir.
 */
function openModal() {
  const m = state.lastMedia;
  if (!m) return;
  
  const box = $('modalMedia');
  $('modalTitle').textContent = m.title; 
  box.innerHTML = ''; 
  setNote('');
  
  const el = document.createElement(m.type === 'video' ? 'video' : 'img');
  el.src = m.url;
  
  if (m.type === 'video') { 
    el.controls = true; 
    el.autoplay = true; 
    el.playsInline = true; 
  }
  
  box.appendChild(el);
  $('previewModal').classList.remove('hidden');
}

/**
 * Cierra la ventana modal de vista previa y limpia el contenedor multimedia.
 */
function closeModal() { 
  $('previewModal').classList.add('hidden'); 
  $('modalMedia').innerHTML = ''; 
}


/* ============ 06. EXPORTACIÓN Y DESCARGA LOCAL DE ARCHIVOS ============ */
/**
 * Genera un enlace temporal de descarga para guardar la foto o video directamente en el dispositivo.
 */
function downloadMedia() {
  const m = state.lastMedia;
  if (!m) return;
  
  if (typeof Analytics !== 'undefined') Analytics.downloadMedia(m.type);

  const a = document.createElement('a');
  a.href = m.url; 
  a.download = `${CONFIG.FILE_PREFIX}_${Date.now()}.${m.ext}`; 
  a.click();
}