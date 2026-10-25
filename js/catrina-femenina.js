/**
 * Renderizador de Maquillaje de Catrina Femenina (Estilo Ilustración Fina)
 * Sincronizado con MediaPipe Face Mesh (468 landmarks)
 */

function dibujarCatrinaFemenina(ctx, landmarks, canvasWidth, canvasHeight) {
  if (!landmarks || landmarks.length < 468) return;

  // Convertir coordenadas normalized (0-1) a píxeles en el Canvas
  const getPoint = (index) => ({
    x: landmarks[index].x * canvasWidth,
    y: landmarks[index].y * canvasHeight,
    z: landmarks[index].z * canvasWidth
  });

  // Puntos clave de MediaPipe Face Mesh
  const frenteArriba = getPoint(10);
  const entrecejo = getPoint(9);
  const narizPunta = getPoint(1);
  const barbilla = getPoint(152);
  const ojoIzqCentro = getPoint(468) || getPoint(159); // Pupila/Centro ojo izq
  const ojoDerCentro = getPoint(473) || getPoint(386); // Pupila/Centro ojo der
  const comisuraIzq = getPoint(61);
  const comisuraDer = getPoint(291);
  const mejillaIzq = getPoint(234);
  const mejillaDer = getPoint(454);

  // Calcular escala facial dinámica (distancia entre sienes/mejillas)
  const anchoRostro = Math.hypot(mejillaDer.x - mejillaIzq.x, mejillaDer.y - mejillaIzq.y);
  const escala = anchoRostro / 200; // Factor de escala normalizado

  // Calcular rotación Z (ladeo de la cabeza)
  const anguloRotacion = Math.atan2(ojoDerCentro.y - ojoIzqCentro.y, ojoDerCentro.x - ojoIzqCentro.x);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#111111'; // Color de tinta oscura fina

  // --- 1. DIBUJAR TELARAÑA Y FILIGRANA EN LA FRENTE ---
  dibujarTelarañaFrente(ctx, frenteArriba, entrecejo, escala, anguloRotacion);

  // --- 2. DIBUJAR MARCOS DE CUENCAS OCULARES Y ARABESCOS ---
  dibujarMarcoOjo(ctx, ojoIzqCentro, escala, true);
  dibujarMarcoOjo(ctx, ojoDerCentro, escala, false);

  // --- 3. DIBUJAR DETALLES EN PÓMULOS Y MEJILLAS ---
  dibujarArabescoMejilla(ctx, mejillaIzq, ojoIzqCentro, escala, true);
  dibujarArabescoMejilla(ctx, mejillaDer, ojoDerCentro, escala, false);

  // --- 4. DIBUJAR CAVIDAD NASAL ESTILIZADA ---
  dibujarNarizCatrina(ctx, narizPunta, escala);

  // --- 5. DIBUJAR COSTURAS DE LA BOCA Y LABIOS ---
  dibujarSonrisaCosturas(ctx, comisuraIzq, comisuraDer, escala);

  // --- 6. DIBUJAR DETALLE CORAZÓN EN LA BARBILLA ---
  dibujarCorazonBarbilla(ctx, barbilla, escala);

  ctx.restore();
}

/**
 * 🕸️ 1. Telaraña con Lis Real de la Frente
 */
function dibujarTelarañaFrente(ctx, frente, entrecejo, escala, angulo) {
  ctx.save();
  ctx.translate(entrecejo.x, entrecejo.y - 15 * escala);
  ctx.rotate(angulo);

  const radioWeb = 65 * escala;
  const lineasSpokes = 7;

  // Trazar rayos principales de la telaraña
  ctx.lineWidth = 1.8 * escala;
  ctx.beginPath();
  for (let i = 0; i < lineasSpokes; i++) {
    const angle = -Math.PI / 1.1 + (Math.PI / (lineasSpokes - 1)) * i;
    const x = Math.cos(angle) * radioWeb;
    const y = Math.sin(angle) * radioWeb;
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Trazar arcos cóncavos de la red
  ctx.lineWidth = 1.2 * escala;
  const niveles = 3;
  for (let n = 1; n <= niveles; n++) {
    const r = (radioWeb / niveles) * n;
    ctx.beginPath();
    for (let i = 0; i < lineasSpokes - 1; i++) {
      const a1 = -Math.PI / 1.1 + (Math.PI / (lineasSpokes - 1)) * i;
      const a2 = -Math.PI / 1.1 + (Math.PI / (lineasSpokes - 1)) * (i + 1);
      const x1 = Math.cos(a1) * r;
      const y1 = Math.sin(a1) * r;
      const x2 = Math.cos(a2) * r;
      const y2 = Math.sin(a2) * r;
      
      const midAngle = (a1 + a2) / 2;
      const ctrlX = Math.cos(midAngle) * (r * 0.85);
      const ctrlY = Math.sin(midAngle) * (r * 0.85);

      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
    }
    ctx.stroke();
  }

  // Adorno central Flor de Lis / Joya
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(0, 5 * escala, 4 * escala, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 👁️ 2. Marco Ocular de Pétalos Finos y Pestañas
 */
function dibujarMarcoOjo(ctx, centroOjo, escala, esIzquierdo) {
  ctx.save();
  ctx.translate(centroOjo.x, centroOjo.y);

  const radioOjo = 38 * escala;
  const numPetalos = 16;

  // Anillo exterior de pequeños festones/pétalos
  ctx.lineWidth = 1.5 * escala;
  ctx.beginPath();
  for (let i = 0; i < numPetalos; i++) {
    const angle = (Math.PI * 2 / numPetalos) * i;
    const px = Math.cos(angle) * radioOjo;
    const py = Math.sin(angle) * radioOjo;

    ctx.arc(px, py, 4 * escala, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Puntos decorativos punteados
  ctx.fillStyle = '#111111';
  for (let i = 0; i < numPetalos; i++) {
    const angle = (Math.PI * 2 / numPetalos) * i + 0.2;
    const px = Math.cos(angle) * (radioOjo + 8 * escala);
    const py = Math.sin(angle) * (radioOjo + 8 * escala);

    ctx.beginPath();
    ctx.arc(px, py, 1.5 * escala, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 🌀 3. Arabescos y Filigranas para Pómulos
 */
function dibujarArabescoMejilla(ctx, mejilla, ojoCentro, escala, esIzquierdo) {
  ctx.save();
  const dir = esIzquierdo ? 1 : -1;
  ctx.translate(mejilla.x + (10 * dir * escala), mejilla.y);

  ctx.lineWidth = 1.8 * escala;
  ctx.beginPath();

  // Curva elegante de filigrana
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    20 * dir * escala, -20 * escala,
    35 * dir * escala, -10 * escala,
    25 * dir * escala, 15 * escala
  );
  ctx.bezierCurveTo(
    15 * dir * escala, 30 * escala,
    -5 * dir * escala, 20 * escala,
    5 * dir * escala, 5 * escala
  );
  ctx.stroke();

  // Pequeños puntos de gota flotantes
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(30 * dir * escala, -5 * escala, 2 * escala, 0, Math.PI * 2);
  ctx.arc(36 * dir * escala, -12 * escala, 1.5 * escala, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 👃 4. Cavidad Nasal en Corazón Invertido Afilado
 */
function dibujarNarizCatrina(ctx, narizPunta, escala) {
  ctx.save();
  ctx.translate(narizPunta.x, narizPunta.y - 5 * escala);

  const w = 12 * escala;
  const h = 22 * escala;

  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2); // Punta superior afilada
  ctx.bezierCurveTo(-w, 0, -w, h / 2, 0, h / 2); // Ala izquierda
  ctx.bezierCurveTo(w, h / 2, w, 0, 0, -h / 2); // Ala derecha
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 👄 5. Costuras Elegantes de la Boca
 */
function dibujarSonrisaCosturas(ctx, comisuraIzq, comisuraDer, escala) {
  ctx.save();

  // Línea base alargada hacia las mejillas
  ctx.lineWidth = 1.8 * escala;
  ctx.beginPath();
  
  // Extender ligeramente más allá de las comisuras reales
  const extX = (comisuraDer.x - comisuraIzq.x) * 0.15;
  const startX = comisuraIzq.x - extX;
  const endX = comisuraDer.x + extX;
  const midY = (comisuraIzq.y + comisuraDer.y) / 2;

  ctx.moveTo(startX, midY);
  ctx.quadraticCurveTo(
    (comisuraIzq.x + comisuraDer.x) / 2,
    midY + 5 * escala,
    endX,
    midY
  );
  ctx.stroke();

  // Trazar puntadas/costuras verticales cruzadas
  const numPuntadas = 12;
  ctx.lineWidth = 1.2 * escala;
  for (let i = 0; i <= numPuntadas; i++) {
    const t = i / numPuntadas;
    const px = startX + (endX - startX) * t;
    const py = midY;

    // Altura variable: más largas al centro, más cortas en los extremos
    const factorAltura = Math.sin(t * Math.PI) * 16 * escala + 6 * escala;

    ctx.beginPath();
    ctx.moveTo(px, py - factorAltura / 2);
    ctx.lineTo(px, py + factorAltura / 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 🖤 6. Corazón en la Barbilla
 */
function dibujarCorazonBarbilla(ctx, barbilla, escala) {
  ctx.save();
  ctx.translate(barbilla.x, barbilla.y - 10 * escala);

  const size = 10 * escala;
  ctx.lineWidth = 1.5 * escala;
  ctx.beginPath();
  ctx.moveTo(0, size / 4);
  ctx.quadraticCurveTo(0, 0, -size / 2, 0);
  ctx.quadraticCurveTo(-size, 0, -size, size / 2);
  ctx.quadraticCurveTo(-size, size, 0, size * 1.3);
  ctx.quadraticCurveTo(size, size, size, size / 2);
  ctx.quadraticCurveTo(size, 0, size / 2, 0);
  ctx.quadraticCurveTo(0, 0, 0, size / 4);
  ctx.stroke();

  ctx.restore();
}