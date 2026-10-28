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
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform sampler2D x;varying vec2 v;void main(){gl_FragColor=texture2D(x,v);}'));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

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
      if (d.filtroCss && d.filtroCss !== 'none') {
        g.filter = d.filtroCss;
      }
      g.drawImage(img, 0, 0, side, side);

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
