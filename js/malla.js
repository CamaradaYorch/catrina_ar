/* ==================================================
   CatrinART
   MÓDULO: MALLA FACIAL CON TEXTURA MULTI-DISEÑO (WebGL)
   ==================================================
   Estira las texturas SVG de Catrina sobre los 468 triángulos de la cara.
   Soporta múltiples diseños pre-renderizados en GPU que se intercambian al instante
   (sin recargas) para 1 persona o hasta 3 personas simultáneas.
   ================================================== */

const malla = {
  listo: false,
  gl: null,
  cv: null,
  pos: new Float32Array(468 * 2),
  bufPos: null,
  texturas: [] // Array de texturas WebGL precargadas para cada diseño
};

/** Inicializa WebGL y compila las texturas para cada estilo de Catrina. */
async function initMalla() {
  try {
    const img = new Image();
    img.src = CONFIG.TEXTURA_SVG;
    await img.decode();

    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('Sin WebGL');

    const sh = (tipo, src) => {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;attribute vec2 t;varying vec2 v;void main(){v=t;gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform sampler2D x;uniform float a;varying vec2 v;void main(){gl_FragColor=texture2D(x,v)*a;}'));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    malla.locAlfa = gl.getUniformLocation(prog, 'a');   // opacidad del maquillaje (CONFIG.TEXTURA_OPACIDAD)

    const buf = (tipo, datos, uso) => {
      const b = gl.createBuffer();
      gl.bindBuffer(tipo, b);
      gl.bufferData(tipo, datos, uso);
      return b;
    };
    malla.bufPos = buf(gl.ARRAY_BUFFER, malla.pos, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, 'p'));
    gl.vertexAttribPointer(gl.getAttribLocation(prog, 'p'), 2, gl.FLOAT, false, 0, 0);
    buf(gl.ARRAY_BUFFER, new Float32Array(MALLA.uv), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, 't'));
    gl.vertexAttribPointer(gl.getAttribLocation(prog, 't'), 2, gl.FLOAT, false, 0, 0);
    buf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(MALLA.tri), gl.STATIC_DRAW);

    // Precarga de cada diseño definido en CONFIG.DISENOS a texturas WebGL
    const disenos = (CONFIG.DISENOS && CONFIG.DISENOS.length) ? CONFIG.DISENOS : [{ id: 'tradicional', filtroCss: 'none' }];
    const side = CONFIG.TEXTURA_PX || 512;
    malla.texturas = [];

    for (let i = 0; i < disenos.length; i++) {
      const d = disenos[i];
      const texCanvas = document.createElement('canvas');
      texCanvas.width = texCanvas.height = side;
      const g = texCanvas.getContext('2d');
      const filtro = d.filtroCss && d.filtroCss !== 'none' ? d.filtroCss : null;
      const nativo = 'filter' in g;                       // Safari/iOS antiguos no lo soportan
      if (filtro && nativo) g.filter = filtro;
      g.drawImage(img, 0, 0, side, side);
      if (filtro && !nativo) aplicarFiltroPixeles(g, side, filtro);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      malla.texturas.push(texture);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    malla.gl = gl;
    malla.cv = cv;
    malla.listo = true;
    document.getElementById('btnCorona')?.classList.remove('invisible');   // el botón de corona aparece cuando la malla está lista
  } catch (e) {
    console.warn('Malla con textura no disponible; se usa el dibujo de respaldo:', e);
  }
}

/**
 * Dibuja la textura sobre todos los rostros detectados (de 1 a 3 personas).
 * Aplica el diseño seleccionado actualmente o diseño asignado por rostro.
 */
function dibujarMalla(c, rostros, W, H) {
  if (!malla.listo || !malla.texturas.length) return false;
  const { gl, cv, pos } = malla;
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(malla.locAlfa, Math.min(1, Math.max(0, CONFIG.TEXTURA_OPACIDAD == null ? 1 : CONFIG.TEXTURA_OPACIDAD)));

  const totalTexturas = malla.texturas.length;
  const activoGlobal = (state.disenoIndex || 0) % totalTexturas;

  for (let faceIdx = 0; faceIdx < rostros.length; faceIdx++) {
    const pts = rostros[faceIdx];
    if (!pts || pts.length < 468) continue;

    // Vincula la textura del diseño actual
    const tex = malla.texturas[activoGlobal];
    gl.bindTexture(gl.TEXTURE_2D, tex);

    for (let i = 0; i < 468; i++) {
      pos[2 * i] = pts[i].x * 2 - 1;
      pos[2 * i + 1] = 1 - pts[i].y * 2;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, malla.bufPos);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);

    const G = MALLA.grupos;
    const cuerpo = G.base + (CONFIG.MALLA_CUBRIR_OJOS ? G.ojos : 0);
    gl.drawElements(gl.TRIANGLES, cuerpo * 3, gl.UNSIGNED_SHORT, 0); // Cara (+ ojos si se cubren)

    if (CONFIG.MALLA_CUBRIR_BOCA) {
      gl.drawElements(gl.TRIANGLES, G.boca * 3, gl.UNSIGNED_SHORT, (G.base + G.ojos) * 6); // Boca
    }
  }

  c.drawImage(cv, 0, 0);
  return true;
}


/** Respaldo del filtro CSS (hue-rotate, saturate, sepia, contrast, brightness) aplicado píxel por píxel. Se hace una sola vez por diseño. */
function aplicarFiltroPixeles(g, side, filtro) {
  const ops = [...filtro.matchAll(/([\w-]+)\(([^)]*)\)/g)].map(m => [m[1], parseFloat(m[2])]);
  const datos = g.getImageData(0, 0, side, side), d = datos.data;
  const mats = ops.map(([n, v]) => {
    if (n === 'hue-rotate') {
      const t = v * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
      return [.213 + c * .787 - s * .213, .715 - c * .715 - s * .715, .072 - c * .072 + s * .928,
              .213 - c * .213 + s * .143, .715 + c * .285 + s * .140, .072 - c * .072 - s * .283,
              .213 - c * .213 - s * .787, .715 - c * .715 + s * .715, .072 + c * .928 + s * .072];
    }
    if (n === 'grayscale') { const q = 1 - v; return [.2126 + .7874 * q, .7152 - .7152 * q, .0722 - .0722 * q, .2126 - .2126 * q, .7152 + .2848 * q, .0722 - .0722 * q, .2126 - .2126 * q, .7152 - .7152 * q, .0722 + .9278 * q]; }
    if (n === 'saturate') return [.213 + .787 * v, .715 - .715 * v, .072 - .072 * v, .213 - .213 * v, .715 + .285 * v, .072 - .072 * v, .213 - .213 * v, .715 - .715 * v, .072 + .928 * v];
    if (n === 'sepia') { const a = 1 - v; return [.393 + .607 * a, .769 - .769 * a, .189 - .189 * a, .349 - .349 * a, .686 + .314 * a, .168 - .168 * a, .272 - .272 * a, .534 - .534 * a, .131 + .869 * a]; }
    return null;
  });
  const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] / 255, gr = d[i + 1] / 255, b = d[i + 2] / 255;
    for (let k = 0; k < ops.length; k++) {
      const n = ops[k][0], v = ops[k][1], m = mats[k];
      if (m) { const R = m[0] * r + m[1] * gr + m[2] * b, G = m[3] * r + m[4] * gr + m[5] * b, B = m[6] * r + m[7] * gr + m[8] * b; r = clamp(R); gr = clamp(G); b = clamp(B); }
      else if (n === 'contrast') { r = clamp((r - .5) * v + .5); gr = clamp((gr - .5) * v + .5); b = clamp((b - .5) * v + .5); }
      else if (n === 'brightness') { r = clamp(r * v); gr = clamp(gr * v); b = clamp(b * v); }
    }
    d[i] = r * 255; d[i + 1] = gr * 255; d[i + 2] = b * 255;
  }
  g.putImageData(datos, 0, 0);
}
