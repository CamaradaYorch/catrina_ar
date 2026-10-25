/* ==================================================
   CATRINA AR
   MÓDULO: MALLA FACIAL CON TEXTURA SVG (WebGL)
   ==================================================
   Estira assets/catrina-textura.svg sobre los triángulos de la cara (datos en malla-datos.js).
   Las zonas transparentes del SVG dejan ver la cara real, y el interior de ojos y boca no se dibuja,
   así que las facciones se conservan. Si algo falla (sin WebGL, SVG ausente), quedan solo los dibujos
   de maquillaje.js y la app sigue funcionando.
   ================================================== */

const malla = { listo: false, gl: null, cv: null, pos: new Float32Array(468 * 2), bufPos: null, n: MALLA.tri.length };

async function initMalla() {
  try {
    const img = new Image();
    img.src = CONFIG.TEXTURA_SVG;
    await img.decode();
    const tex = document.createElement('canvas');          // el SVG se rasteriza una sola vez
    tex.width = tex.height = CONFIG.TEXTURA_PX;
    tex.getContext('2d').drawImage(img, 0, 0, tex.width, tex.height);

    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('Sin WebGL');

    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;attribute vec2 t;varying vec2 v;void main(){v=t;gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform sampler2D x;varying vec2 v;void main(){gl_FragColor=texture2D(x,v);}'));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = (tipo, datos, uso) => { const b = gl.createBuffer(); gl.bindBuffer(tipo, b); gl.bufferData(tipo, datos, uso); return b; };
    malla.bufPos = buf(gl.ARRAY_BUFFER, malla.pos, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, 'p'));
    gl.vertexAttribPointer(gl.getAttribLocation(prog, 'p'), 2, gl.FLOAT, false, 0, 0);
    buf(gl.ARRAY_BUFFER, new Float32Array(MALLA.uv), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, 't'));
    gl.vertexAttribPointer(gl.getAttribLocation(prog, 't'), 2, gl.FLOAT, false, 0, 0);
    buf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(MALLA.tri), gl.STATIC_DRAW);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    malla.gl = gl; malla.cv = cv; malla.listo = true;
  } catch (e) {
    console.warn('Malla con textura no disponible; se usa el dibujo de respaldo:', e);
  }
}

/** Dibuja la textura sobre todos los rostros y la copia al canvas principal. Devuelve false si no está lista. */
function dibujarMalla(c, rostros, W, H) {
  if (!malla.listo) return false;
  const { gl, cv, pos } = malla;
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (const pts of rostros) {
    if (pts.length < 468) continue;
    for (let i = 0; i < 468; i++) { pos[2 * i] = pts[i].x * 2 - 1; pos[2 * i + 1] = 1 - pts[i].y * 2; }
    gl.bindBuffer(gl.ARRAY_BUFFER, malla.bufPos);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    gl.drawElements(gl.TRIANGLES, malla.n, gl.UNSIGNED_SHORT, 0);
  }
  c.drawImage(cv, 0, 0);
  return true;
}
