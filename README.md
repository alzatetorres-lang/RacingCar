# 🏎️ Racing Car: Apex 88 (Retro Arcade Racer)

Un videojuego de carreras arcade 3D retro inspirado en clásicos como **Virtua Racing**, **Horizon Chase Turbo**, **OutRun** y los arcades poligonales flat-shaded de los años 90 (Sega Model 1), con HUD pixel art de 16-bits, sintetizador de audio retro por Web Audio API, físicas de manejo suaves y estables, 4 circuitos dinámicos y backend conectado con **Supabase**, listo para desplegar en **Vercel** o ejecutar en local.

---

## 📸 Características Principales

- **Físicas de Manejo Arcade Mejoradas**:
  - Control suave y progresivo: se eliminó la sobre-sensibilidad para brindar giros predecibles y estables en rectas y curvas.
  - Autocentraje suave y guiado por trazada para evitar trompos o desvíos bruscos.
  - Mecánica de **Derrape Asistido** (`Space` o giro a alta velocidad) con ángulo de slip visible, humo denso pixelado y **Turbo Boost** al salir de la curva.
  - Penalización suave en césped/arcén sin perder el control del vehículo.

- **4 Circuitos y Entornos Dinámicos**:
  1. **Emerald Grove & Sunset Coast**: Atardecer crepuscular con océano low-poly, palmeras costeras, colinas verdes y pinos.
  2. **Neon Cyber City (Tokyo Expressway)**: Autopista nocturna elevada entre rascacielos iluminados, bordillos neón cian/magenta y horizonte cyberpunk.
  3. **Mojave Desert Canyon**: Cañones de arenisca roja, mesetas, cactus saguaro y rectas de máxima velocidad bajo un cielo dorando.
  4. **Nordic Frost Summit**: Paso alpino nevado con picos helados, coníferas cubiertas de nieve y bordillos gélidos.

- **7 Rivales Controlados por IA**: Coches rivales con libreas ochenteras, trazada personalizada, colisiones elásticas y escalado de dificultad dinámico según tus victorias.
- **3 Modos de Cámara**:
  1. *Chase Cam* (Cámara trasera baja, FOV 65°, balanceo dinámico).
  2. *Cinematic Aerial* (Vista isométrica/dron para apreciar el circuito).
  3. *Reverse Front Cam* (Cámara frontal hacia el morro para el podio de victoria).
- **HUD Pixel Art Retro ('Press Start 2P')**:
  - Contador de posición dinámico (`POS 8/8`).
  - Contador de vueltas (`LAP 1/3`).
  - Banner dinámico de carrera y cuenta atrás (`3... 2... 1... READY!` -> `★ GO! ★`).
  - Velocímetro con engranaje pixel art giratorio sincronizado a las RPM.
  - Minimapa en tiempo real adaptativo a cada uno de los 4 circuitos.
- **Sintetizador de Sonido Retro (Web Audio API)**:
  - Motor con modulación armónica y filtro dinámico según velocidad.
  - Ruido blanco filtrado para derrapes.
  - Beeps de cuenta atrás, campanilla de vuelta y fanfarria de victoria.
- **Base de Datos y Backend (Supabase + Vercel / Local)**:
  - Guarda victorias del piloto y calcula parámetros de dificultad en tiempo real (`aiSpeedMultiplier`, `aiCorneringSkill`, `rubberBandingFactor`).
  - Tabla de posiciones / Hall of Fame con Top 10 pilotos.
  - Soporte dual: Supabase Cloud oficial o API Serverless integrada en Vercel / Local.

---

## 🎮 Controles

| Tecla / Acción | Función |
| :--- | :--- |
| **W / Flecha Arriba** | Acelerar |
| **S / Flecha Abajo** | Frenar / Marcha atrás |
| **A / Flecha Izquierda** | Girar a la izquierda (suave y estable) |
| **D / Flecha Derecha** | Girar a la derecha (suave y estable) |
| **Espacio (Space)** | Freno de mano / Derrape asistido + Boost de salida |
| **C** | Alternar cámara (Chase / Aerial / Front) |
| **Esc / P** | Menú de Pausa |
| **Pantalla táctil** | Controles táctiles virtuales en pantalla para móviles |

---

## 🚀 Despliegue en Vercel

El proyecto está 100% configurado para desplegarse en **Vercel** con un solo clic:

1. Ve a [Vercel](https://vercel.com/) e importa tu repositorio: `https://github.com/alzatetorres-lang/RacingCar.git`.
2. Vercel detectará automáticamente el archivo `vercel.json` y la configuración de Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. *(Opcional)* Si quieres conectar con tu base de datos de **Supabase en la nube**:
   - Agrega las variables de entorno en el panel de Vercel:
     - `VITE_SUPABASE_URL`: Tu URL de Supabase (`https://xxx.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima pública
4. Haz clic en **Deploy**. La aplicación web y las funciones serverless (`/api/*`) quedarán activas globalmente.

---

## 🛠️ Instalación y Ejecución en Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/alzatetorres-lang/RacingCar.git
cd RacingCar

# 2. Instalar dependencias
npm install

# 3. Iniciar juego y backend local
npm start
```

Abre en tu navegador: **`http://localhost:5173`**

---

## 🗄️ Esquema de Supabase

Si utilizas Supabase, ejecuta [`database/schema.sql`](file:///Users/natanaelalzatetorres/Desktop/Racing%20car/database/schema.sql) en el **SQL Editor** para crear la tabla `pilotos`, las políticas RLS y la función RPC atómica `registrar_victoria`.
