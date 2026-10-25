<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Color Gradients for Sugar Skull Aesthetics -->
    <radialGradient id="cempasuchil" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF200"/>
      <stop offset="60%" stop-color="#FF7700"/>
      <stop offset="100%" stop-color="#E63900"/>
    </radialGradient>
    
    <radialGradient id="eyeSocketGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="80%" stop-color="#120216"/>
      <stop offset="100%" stop-color="#E0115F" stop-opacity="0.8"/>
    </radialGradient>

    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="50%" stop-color="#F5A623"/>
      <stop offset="100%" stop-color="#B87333"/>
    </linearGradient>

    <linearGradient id="magentaTurquoise" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E0115F"/>
      <stop offset="100%" stop-color="#00F5D4"/>
    </linearGradient>

    <!-- Reusable Decorative Petal -->
    <g id="petal">
      <path d="M 0,0 C -8,-20 -10,-35 0,-48 C 10,-35 8,-20 0,0 Z" fill="url(#cempasuchil)" stroke="#B87333" stroke-width="0.8"/>
    </g>
    <g id="smallDot">
      <circle cx="0" cy="0" r="3.5" fill="#00F5D4"/>
      <circle cx="0" cy="0" r="1.5" fill="#FFFFFF"/>
    </g>
  </defs>

  <!-- Layer Group: Transparent Background Main Container -->
  <g id="catrina-uv-texture">

    <!-- ========================================== -->
    <!-- 1. FOREHEAD & TEMPLE ORNAMENTATION (Frente) -->
    <!-- ========================================== -->
    <g id="forehead-ornaments" transform="translate(512, 230)">
      <!-- Central Forehead Cempasúchil Emblem -->
      <g id="central-flower">
        <!-- Outer Petal Ring -->
        <use href="#petal" transform="rotate(0)"/>
        <use href="#petal" transform="rotate(22.5)"/>
        <use href="#petal" transform="rotate(45)"/>
        <use href="#petal" transform="rotate(67.5)"/>
        <use href="#petal" transform="rotate(90)"/>
        <use href="#petal" transform="rotate(112.5)"/>
        <use href="#petal" transform="rotate(135)"/>
        <use href="#petal" transform="rotate(157.5)"/>
        <use href="#petal" transform="rotate(180)"/>
        <use href="#petal" transform="rotate(202.5)"/>
        <use href="#petal" transform="rotate(225)"/>
        <use href="#petal" transform="rotate(247.5)"/>
        <use href="#petal" transform="rotate(270)"/>
        <use href="#petal" transform="rotate(292.5)"/>
        <use href="#petal" transform="rotate(315)"/>
        <use href="#petal" transform="rotate(337.5)"/>
        <circle cx="0" cy="0" r="14" fill="#F5A623" stroke="#E0115F" stroke-width="2"/>
        <circle cx="0" cy="0" r="7" fill="#E0115F"/>
      </g>

      <!-- Symmetric Filigree Swirls (Forehead) -->
      <!-- Left Side -->
      <path d="M -25,-10 C -70,-50 -120,-30 -160,-60 C -180,-75 -170,-105 -145,-100 C -125,-96 -120,-70 -140,-65" 
            fill="none" stroke="#E0115F" stroke-width="4" stroke-linecap="round"/>
      <path d="M -25,-10 C -70,-50 -120,-30 -160,-60 C -180,-75 -170,-105 -145,-100 C -125,-96 -120,-70 -140,-65" 
            fill="none" stroke="url(#goldGradient)" stroke-width="1.8" stroke-linecap="round"/>
      
      <!-- Right Side -->
      <path d="M 25,-10 C 70,-50 120,-30 160,-60 C 180,-75 170,-105 145,-100 C 125,-96 120,-70 140,-65" 
            fill="none" stroke="#E0115F" stroke-width="4" stroke-linecap="round"/>
      <path d="M 25,-10 C 70,-50 120,-30 160,-60 C 180,-75 170,-105 145,-100 C 125,-96 120,-70 140,-65" 
            fill="none" stroke="url(#goldGradient)" stroke-width="1.8" stroke-linecap="round"/>

      <!-- Dots along forehead curve -->
      <use href="#smallDot" transform="translate(-50, -40)"/>
      <use href="#smallDot" transform="translate(-80, -48)"/>
      <use href="#smallDot" transform="translate(-110, -52)"/>
      <use href="#smallDot" transform="translate(50, -40)"/>
      <use href="#smallDot" transform="translate(80, -48)"/>
      <use href="#smallDot" transform="translate(110, -52)"/>
    </g>


    <!-- ========================================== -->
    <!-- 2. EYE SOCKETS & EMBELLISHMENTS (Ojos)     -->
    <!-- ========================================== -->
    
    <!-- LEFT EYE SOCKET (Anatomical Left / UV Canvas Right: ~660, 380) -->
    <g id="left-eye-socket" transform="translate(660, 385)">
      <!-- Main Dark Socket Envelope -->
      <ellipse cx="0" cy="0" rx="90" ry="80" fill="url(#eyeSocketGrad)" stroke="#E0115F" stroke-width="2"/>
      
      <!-- Scalloped Petal Ring Surrounding Eye Socket -->
      <g id="left-eye-petals">
        <path d="M 0,-80 C 15,-100 -15,-100 0,-80" fill="url(#cempasuchil)" stroke="#F5A623"/>
        <!-- Ring of 16 Petals around socket -->
        <g fill="url(#cempasuchil)" stroke="#E0115F" stroke-width="1">
          <circle cx="0" cy="-84" r="10"/>
          <circle cx="32" cy="-77" r="10"/>
          <circle cx="60" cy="-58" r="10"/>
          <circle cx="78" cy="-30" r="10"/>
          <circle cx="85" cy="0" r="10"/>
          <circle cx="78" cy="30" r="10"/>
          <circle cx="60" cy="58" r="10"/>
          <circle cx="32" cy="77" r="10"/>
          <circle cx="0" cy="84" r="10"/>
          <circle cx="-32" cy="77" r="10"/>
          <circle cx="-60" cy="58" r="10"/>
          <circle cx="-78" cy="30" r="10"/>
          <circle cx="-85" cy="0" r="10"/>
          <circle cx="-78" cy="-30" r="10"/>
          <circle cx="-60" cy="-58" r="10"/>
          <circle cx="-32" cy="-77" r="10"/>
        </g>
        <!-- Inner Cyan Beading -->
        <circle cx="0" cy="0" rx="82" ry="72" fill="none" stroke="#00F5D4" stroke-width="2" stroke-dasharray="4,6"/>
      </g>
    </g>

    <!-- RIGHT EYE SOCKET (Anatomical Right / UV Canvas Left: ~364, 380) -->
    <g id="right-eye-socket" transform="translate(364, 385)">
      <!-- Main Dark Socket Envelope -->
      <ellipse cx="0" cy="0" rx="90" ry="80" fill="url(#eyeSocketGrad)" stroke="#E0115F" stroke-width="2"/>
      
      <!-- Scalloped Petal Ring Surrounding Eye Socket -->
      <g id="right-eye-petals">
        <g fill="url(#cempasuchil)" stroke="#E0115F" stroke-width="1">
          <circle cx="0" cy="-84" r="10"/>
          <circle cx="32" cy="-77" r="10"/>
          <circle cx="60" cy="-58" r="10"/>
          <circle cx="78" cy="-30" r="10"/>
          <circle cx="85" cy="0" r="10"/>
          <circle cx="78" cy="30" r="10"/>
          <circle cx="60" cy="58" r="10"/>
          <circle cx="32" cy="77" r="10"/>
          <circle cx="0" cy="84" r="10"/>
          <circle cx="-32" cy="77" r="10"/>
          <circle cx="-60" cy="58" r="10"/>
          <circle cx="-78" cy="30" r="10"/>
          <circle cx="-85" cy="0" r="10"/>
          <circle cx="-78" cy="-30" r="10"/>
          <circle cx="-60" cy="-58" r="10"/>
          <circle cx="-32" cy="-77" r="10"/>
        </g>
        <!-- Inner Cyan Beading -->
        <circle cx="0" cy="0" rx="82" ry="72" fill="none" stroke="#00F5D4" stroke-width="2" stroke-dasharray="4,6"/>
      </g>
    </g>


    <!-- ========================================== -->
    <!-- 3. STYLIZED SKULL NOSE (Nariz)            -->
    <!-- ========================================== -->
    <!-- Positioned precisely over the nose bridge / cavity region (~512, 510) -->
    <g id="skull-nose" transform="translate(512, 515)">
      <!-- Classic inverted heart/butterfly cavity -->
      <path d="M 0,-35 
               C 12,-35 28,-20 28,5 
               C 28,22 15,35 0,48 
               C -15,35 -28,22 -28,5 
               C -28,-20 -12,-35 0,-35 Z" 
            fill="#0A0810" stroke="url(#goldGradient)" stroke-width="2.5"/>
      <!-- Inner accent dividing line -->
      <path d="M 0,-25 L 0,35" stroke="#E0115F" stroke-width="1.5" stroke-linecap="round"/>
    </g>


    <!-- ========================================== -->
    <!-- 4. CHEEKS & TEMPLE FILIGREE (Pómulos)       -->
    <!-- ========================================== -->
    <!-- Left Cheek Flourish -->
    <g id="left-cheek" transform="translate(710, 560)">
      <path d="M -20,0 C 20,10 50,30 40,60 C 30,85 0,80 -15,60 C -25,45 -5,30 10,40" 
            fill="none" stroke="#00F5D4" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M -20,0 C 20,10 50,30 40,60 C 30,85 0,80 -15,60 C -25,45 -5,30 10,40" 
            fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"/>
      <circle cx="40" cy="60" r="5" fill="#E0115F"/>
      <circle cx="-15" cy="60" r="3.5" fill="#F5A623"/>
    </g>

    <!-- Right Cheek Flourish -->
    <g id="right-cheek" transform="translate(314, 560)">
      <path d="M 20,0 C -20,10 -50,30 -40,60 C -30,85 0,80 15,60 C 25,45 5,30 -10,40" 
            fill="none" stroke="#00F5D4" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 20,0 C -20,10 -50,30 -40,60 C -30,85 0,80 15,60 C 25,45 5,30 -10,40" 
            fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"/>
      <circle cx="-40" cy="60" r="5" fill="#E0115F"/>
      <circle cx="15" cy="60" r="3.5" fill="#F5A623"/>
    </g>


    <!-- ========================================== -->
    <!-- 5. MOUTH, TEETH & STITCHES (Boca y Dientes)-->
    <!-- ========================================== -->
    <!-- Centered around y: 670 - 710; Lip seam line around y: 690 -->
    <g id="sugar-skull-mouth" transform="translate(512, 690)">
      <!-- Horizontal Base Mouth Seam extending to cheekbones -->
      <path d="M -160,-5 C -80,5 80,5 160,-5" fill="none" stroke="#0A0810" stroke-width="4" stroke-linecap="round"/>
      <path d="M -150,-5 C -75,5 75,5 150,-5" fill="none" stroke="url(#goldGradient)" stroke-width="1.8"/>

      <!-- Graphic Teeth (Aligned strictly to lip bands, keeping center aperture open) -->
      <!-- Upper Teeth Row -->
      <g fill="#FFFFF0" stroke="#0A0810" stroke-width="1.5">
        <path d="M -60, -2 Q -50,-22 -40, -2 Z"/>
        <path d="M -40, -2 Q -30,-25 -20, -2 Z"/>
        <path d="M -20, -2 Q -10,-26   0, -2 Z"/>
        <path d="M   0, -2 Q  10,-26  20, -2 Z"/>
        <path d="M  20, -2 Q  30,-25  40, -2 Z"/>
        <path d="M  40, -2 Q  50,-22  60, -2 Z"/>
      </g>

      <!-- Lower Teeth Row -->
      <g fill="#FFFFF0" stroke="#0A0810" stroke-width="1.5">
        <path d="M -60, 2 Q -50,22 -40, 2 Z"/>
        <path d="M -40, 2 Q -30,25 -20, 2 Z"/>
        <path d="M -20, 2 Q -10,26   0, 2 Z"/>
        <path d="M   0, 2 Q  10,26  20, 2 Z"/>
        <path d="M  20, 2 Q  30,25  40, 2 Z"/>
        <path d="M  40, 2 Q  50,22  60, 2 Z"/>
      </g>

      <!-- Cross Stitches extending to cheek edges -->
      <g stroke="#0A0810" stroke-width="2.5" stroke-linecap="round">
        <line x1="-140" y1="-12" x2="-140" y2="10"/>
        <line x1="-115" y1="-15" x2="-115" y2="12"/>
        <line x1="-90"  y1="-18" x2="-90"  y2="15"/>
        <line x1="90"   y1="-18" x2="90"   y2="15"/>
        <line x1="115"  y1="-15" x2="115"  y2="12"/>
        <line x1="140"  y1="-12" x2="140"  y2="10"/>
      </g>

      <!-- Decorative Filigree Endings on Mouth Corners -->
      <path d="M -160,-5 C -180,-15 -185,-35 -170,-40 C -155,-45 -150,-25 -165,-20" fill="none" stroke="#E0115F" stroke-width="2.5"/>
      <path d="M 160,-5 C 180,-15 185,-35 170,-40 C 155,-45 150,-25 165,-20" fill="none" stroke="#E0115F" stroke-width="2.5"/>
    </g>


    <!-- ========================================== -->
    <!-- 6. CHIN DESIGN (Barbilla)                 -->
    <!-- ========================================== -->
    <g id="chin-ornament" transform="translate(512, 825)">
      <!-- Central Marigold Flower on Chin -->
      <g id="chin-flower" transform="scale(0.75)">
        <use href="#petal" transform="rotate(0)"/>
        <use href="#petal" transform="rotate(30)"/>
        <use href="#petal" transform="rotate(60)"/>
        <use href="#petal" transform="rotate(90)"/>
        <use href="#petal" transform="rotate(120)"/>
        <use href="#petal" transform="rotate(150)"/>
        <use href="#petal" transform="rotate(180)"/>
        <use href="#petal" transform="rotate(210)"/>
        <use href="#petal" transform="rotate(240)"/>
        <use href="#petal" transform="rotate(270)"/>
        <use href="#petal" transform="rotate(300)"/>
        <use href="#petal" transform="rotate(330)"/>
        <circle cx="0" cy="0" r="10" fill="#F5A623" stroke="#E0115F" stroke-width="1.5"/>
      </g>

      <!-- Symmetric Swirl Base under Chin -->
      <path d="M -20,15 C -40,35 -70,25 -80,5" fill="none" stroke="#00F5D4" stroke-width="3" stroke-linecap="round"/>
      <path d="M 20,15 C 40,35 70,25 80,5" fill="none" stroke="#00F5D4" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-80" cy="5" r="3" fill="#E0115F"/>
      <circle cx="80" cy="5" r="3" fill="#E0115F"/>
    </g>

  </g>
</svg>