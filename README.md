# 🏎️ Racing Car: Apex 88 (Retro Arcade Racer)

Un videojuego de carreras arcade 3D retro inspirado en clásicos como **Virtua Racing**, **Horizon Chase Turbo** y los arcades poligonales flat-shaded de los años 90 (Sega Model 1), con HUD pixel art de 16-bits, sintetizador de audio retro por Web Audio API y backend conectado con **Supabase** y servidor local de respaldo.

---

## 📸 Características Principales

- **Renderizado 3D Low-Poly Flat-Shaded**: Iluminación crepuscular cálida, sombras duras sobre el asfalto y skybox panorámico con sol plano y montañas distantes.
- **Físicas Arcade y Derrape Asistido**: Conducción ágil con física de derrape en curvas cerradas (`Space` o giro pronunciado) acompañada de partículas de humo pixeladas y chirrido de neumáticos.
- **Circuitos y Biomas Dinámicos**:
  - **Tramo 1 (Sunset Coast)**: Océano a la izquierda, palmeras poligonales y bordillos rojo/blanco.
  - **Tramo 2 (Emerald Grove)**: S-curves a través de colinas verdes y pinos geométricos.
- **7 Rivales Controlados por IA**: Coches rivales con libreas ochenteras, trazada de carrera personalizada, colisiones arcade elásticas y escalado dinámico de dificultad.
- **3 Modos de Cámara**:
  1. *Chase Cam* (Cámara trasera baja, FOV 65°, balanceo lateral dinámico).
  2. *Cinematic Aerial* (Vista isométrica/dron para apreciar el trazado).
  3. *Reverse Front Cam* (Cámara frontal hacia el morro para victorias).
- **HUD Pixel Art Retro ('Press Start 2P')**:
  - Contador de posición dinámico (`POS 8/8`).
  - Contador de vueltas (`LAP 1/3`).
  - Banner de carrera y cuenta atrás (`3... 2... 1... READY!` -> `★ GO! ★`).
  - Velocímetro con engranaje pixel art giratorio sincronizado a las RPM.
  - Minimapa en tiempo real con trazado vectorial y posiciones de los 8 bólidos.
- **Sintetizador de Sonido Retro (Web Audio API)**:
  - Motor con modulación armónica y filtro dinámico según velocidad.
  - Ruido blanco filtrado para derrapes.
  - Beeps de cuenta atrás, campanilla de vuelta y fanfarria de victoria.
- **Base de Datos y Backend (Supabase + Local Dual-Mode)**:
  - Guarda victorias del piloto y calcula parámetros de dificultad en tiempo real (`aiSpeedMultiplier`, `aiCorneringSkill`, `rubberBandingFactor`).
  - Tabla de posiciones / Hall of Fame con Top 10 pilotos.
  - Funciona 100% en local con servidor Node/Express y almacén persistente JSON, y se conecta automáticamente a Supabase Cloud al configurar las variables de entorno.

---

## 🎮 Controles

| Tecla / Acción | Función |
| :--- | :--- |
| **W / Flecha Arriba** | Acelerar |
| **S / Flecha Abajo** | Frenar / Marcha atrás |
| **A / Flecha Izquierda** | Girar a la izquierda |
| **D / Flecha Derecha** | Girar a la derecha |
| **Espacio (Space)** | Freno de mano / Derrape asistido |
| **C** | Alternar cámara (Chase / Aerial / Front) |
| **Esc / P** | Menú de Pausa |
| **Pantalla táctil** | Botones táctiles virtuales en móviles y tablets |

---

## 🛠️ Instalación y Ejecución en Local

### 1. Clonar o acceder al proyecto
```bash
git clone https://github.com/alzatetorres-lang/RacingCar.git
cd RacingCar
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en local (Frontend + Backend)

Para iniciar ambos servicios a la vez:
```bash
npm start
```

O en terminales separadas:
```bash
# Terminal 1: Backend API (Puerto 3001)
npm run server

# Terminal 2: Frontend Vite (Puerto 5173)
npm run dev
```

Abre tu navegador en: **`http://localhost:5173`**

---

## 🗄️ Configuración de Supabase (Opcional)

Si deseas conectar el juego a tu propio proyecto de **Supabase**:

1. Abre el **SQL Editor** en tu panel de Supabase y ejecuta el contenido de `database/schema.sql`.
2. Edita tu archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   VITE_BACKEND_URL=http://localhost:3001
   ```
3. Reinicia el servidor frontend (`npm run dev`). El juego detectará automáticamente Supabase Cloud y sincronizará las victorias y el ranking global.

---

## 📁 Estructura del Proyecto

```
RacingCar/
├── archive/              # Recursos originales respaldados
├── assets/               # Imágenes y videos de referencia
│   ├── images/
│   └── video/
├── config/
│   └── game-spec.json    # Constantes de diseño y jugabilidad
├── database/
│   ├── schema.sql        # Esquema SQL y función RPC para Supabase
│   └── racing_data.json  # Almacén local persistente de pilotos
├── public/
│   └── assets/           # Archivos multimedia servidos por Vite
├── server/
│   └── index.js          # Servidor REST + API Supabase-compatible
├── src/
│   ├── game/
│   │   ├── audio.js          # Sintetizador retro Web Audio API
│   │   ├── carModel.js       # Generador procedural 3D de superdeportivos
│   │   ├── track.js          # Spline del circuito, asfalto, bordillos y biomas
│   │   ├── vehicle.js        # Físicas del jugador y derrape
│   │   ├── aiRivals.js       # IA de los 7 bólidos rivales
│   │   ├── cameraManager.js  # Cámaras 3D dinámicas
│   │   ├── minimap.js        # Renderizado 2D en canvas del minimapa
│   │   └── particles.js      # Sistema de partículas cúbicas de humo
│   ├── services/
│   │   └── supabaseClient.js # Cliente dual Supabase Cloud / Backend Local
│   ├── main.js           # Bucle principal del juego y máquina de estados
│   └── style.css         # Estilos retro arcade y HUD
├── index.html            # Pantalla principal del juego y maquetación de vistas
├── package.json
└── vite.config.js
```
