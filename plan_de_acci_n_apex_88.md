# 🏎️ Plan de Acción y Especificación Técnica: Racing Car (APEX-88)

Este documento contiene la hoja de ruta completa, la arquitectura de base de datos, el diseño visual extraído de la referencia y los prompts de generación de recursos para el desarrollo y despliegue del videojuego.

---

## 1. Especificación del Estilo Visual, HUD y Jugabilidad (JSON)

Guarda este bloque como `config/game-spec.json` en tu proyecto para centralizar las constantes de diseño, colores y cámaras:

```json
{
  "project_meta": {
    "title": "Racing Car - Apex 88",
    "genre": "Arcade Retro-Polygonal Racer",
    "reference_aesthetic": "Virtua Racing / Horizon Chase Turbo / 90s Flat-Shaded 3D + 16-bit Pixel HUD"
  },
  "visual_style": {
    "rendering": {
      "geometry": "Low-poly estricto sin suavizado de normales (flatShading: true)",
      "lighting": "Iluminación direccional cálida de atardecer con sombras duras proyectadas en asfalto",
      "skybox": "Degradado crepuscular (púrpura #5A3B76, coral #E86F52, dorado #F9C762) con efecto de tramado (dithering/halftone) y sol plano gigante",
      "particles": "Cubos blancos pixelados sin texturas complejas para el humo de escape y derrape"
    },
    "environment_themes": [
      {
        "id": "sunset_coast",
        "elements": [
          "Océano low-poly a la izquierda",
          "Palmeras facetadas",
          "Montañas distantes en silueta",
          "Pianos (bordillos) alternos rojo/blanco"
        ]
      },
      {
        "id": "emerald_grove",
        "name_display": "EMERALD GROVE",
        "elements": [
          "Pinos y árboles frondosos geométricos",
          "Colinas facetadas en verde y marrón",
          "Asfalto gris oscuro (#333538) con línea central discontinua blanca"
        ]
      }
    ],
    "player_vehicle": {
      "model_inspiration": "Ferrari F40 / Lamborghini Countach (años 80)",
      "color_palette": {
        "body": "#C81D25",
        "stripes": "#FFFFFF",
        "windows": "#1A1C23",
        "taillights_glow": "#FF2A2A",
        "headlights_glow": "#CCF2FF"
      },
      "details": [
        "Doble franja blanca longitudinal",
        "Matrícula trasera 'APEX-88'",
        "Cuatro salidas de escape",
        "Alerón trasero fijo",
        "Faros delanteros rectangulares con haz de luz volumétrico en asfalto"
      ]
    }
  },
  "hud_interface": {
    "typography": {
      "primary_font": "Pixel Art / Arcade 8-bit ('Press Start 2P')",
      "stroke": "Borde negro sólido de 2px a 4px con sombra paralela inferior",
      "title_logo_style": "Tipografía script años 80 con efecto cromo 3D y bisel rosa neón ('Racing Car')"
    },
    "layout": {
      "top_left": {
        "element": "Position Counter",
        "label": "POS",
        "label_color": "#FFFFFF",
        "value_format": "8/8",
        "value_gradient": ["#FFE600", "#FF8800"]
      },
      "top_center": {
        "element": "Dynamic Race Status / Zone Banner",
        "states": ["3... 2... 1... READY!", "GO!", "EMERALD GROVE"],
        "colors": {
          "countdown": "#FFD000",
          "zone_title": "#FFFFFF"
        }
      },
      "top_right": {
        "element": "Lap Counter",
        "label": "LAP",
        "label_color": "#FFFFFF",
        "value_format": "1/3",
        "value_gradient": ["#FFE600", "#FF8800"]
      },
      "bottom_left": {
        "element": "Speedometer",
        "icon": "Engranaje metálico pixel-art giratorio",
        "value_format": "{speed} MPH",
        "value_color": "#FFFFFF"
      },
      "bottom_right": {
        "element": "Minimap",
        "container": "Caja cuadrada semitransparente (rgba(0,0,0,0.65)) con borde gris de 2px",
        "content": "Trazado de pista en blanco/gris, borde costero azul y marcadores de posición (puntos rojo y amarillo)"
      }
    }
  },
  "gameplay_and_cameras": {
    "physics_model": "Arcade puro con derrape asistido en curvas cerradas (S-curves) y adherencia alta en rectas",
    "camera_modes": [
      {
        "id": "chase_cam",
        "description": "Tercera persona trasera baja, FOV de 65 grados, ligero balanceo lateral al girar"
      },
      {
        "id": "cinematic_aerial",
        "description": "Vista isométrica/dron elevada para mostrar el trazado sinuoso y el derrape entre árboles"
      },
      {
        "id": "reverse_hood_cam",
        "description": "Cámara frontal mirando hacia el morro del coche para repeticiones o pantalla de victoria"
      }
    ]
  }
}
```

---

## 2. Base de Datos y Sistema de Dificultad (Supabase)

### 2.1. Script SQL de Inicialización
Ejecuta este bloque en el **SQL Editor** de tu proyecto en Supabase para crear la tabla `pilotos`, las políticas de seguridad (RLS) y la función de actualización atómica:

```sql
-- 1. Crear tabla de pilotos
CREATE TABLE public.pilotos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text UNIQUE NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 15),
  carreras_ganadas integer DEFAULT 0 NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.pilotos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso público (lectura, inserción y actualización sencilla)
CREATE POLICY "Lectura publica de pilotos" ON public.pilotos
  FOR SELECT USING (true);

CREATE POLICY "Insercion publica de pilotos" ON public.pilotos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualizacion publica de victorias" ON public.pilotos
  FOR UPDATE USING (true);

-- 4. Función RPC para registrar o incrementar victorias sin condiciones de carrera
CREATE OR REPLACE FUNCTION registrar_victoria(nombre_piloto text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  total_victorias integer;
BEGIN
  INSERT INTO public.pilotos (nombre, carreras_ganadas)
  VALUES (UPPER(TRIM(nombre_piloto)), 1)
  ON CONFLICT (nombre)
  DO UPDATE SET
    carreras_ganadas = pilotos.carreras_ganadas + 1,
    updated_at = now()
  RETURNING carreras_ganadas INTO total_victorias;

  RETURN total_victorias;
END;
$$;
```

### 2.2. Tabla de Escalado Dinámico de Dificultad
El juego consulta las victorias ($W$) del jugador al iniciar la partida y ajusta el comportamiento de los $7$ rivales controlados por la IA (`POS 8/8`):

| Nivel / Liga | Victorias ($W$) | Multiplicador Velocidad IA | Precisión en Curvas | Rubber-Banding (Rebufo IA) | Condición de Pista |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Novato (Bronce)** | $0 - 2$ | $0.85\times$ | Baja (frenan tarde) | Desactivado ($0\%$) | Seco / Atardecer despejado |
| **Piloto (Plata)** | $3 - 7$ | $0.95\times$ | Media | Leve ($+5\%$ si van detrás) | Atardecer con tráfico agrupado |
| **Apex (Oro)** | $8 - 15$ | $1.05\times$ | Alta (trazada óptima) | Moderado ($+10\%$ velocidad) | Curvas cerradas de alta velocidad |
| **Leyenda (Platino)** | $\ge 16$ | $1.15\times$ | Perfecta | Alto ($+15\%$ y bloqueo de paso) | Modo espejo + rivales sin errores |

Fórmulas de progresión continua en código:
* **Multiplicador de Velocidad IA:** $\min(0.85 + W \cdot 0.02, 1.20)$
* **Habilidad de Giro IA:** $\min(0.50 + W \cdot 0.03, 0.98)$
* **Factor Rubber-Banding:** $0$ si $W < 3$, de lo contrario $\min(W \cdot 0.01, 0.15)$

### 2.3. Cliente JavaScript (`src/services/supabaseClient.js`)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function obtenerPerfilYDificultad(nombre) {
  const cleanName = nombre.trim().toUpperCase();
  const { data } = await supabase
    .from('pilotos')
    .select('nombre, carreras_ganadas')
    .eq('nombre', cleanName)
    .maybeSingle();

  const victorias = data ? data.carreras_ganadas : 0;

  return {
    nombre: cleanName,
    victorias,
    aiSpeedMultiplier: Math.min(0.85 + victorias * 0.02, 1.20),
    aiCorneringSkill: Math.min(0.5 + victorias * 0.03, 0.98),
    rubberBandingFactor: victorias < 3 ? 0 : Math.min(victorias * 0.01, 0.15)
  };
}

export async function sumarVictoria(nombre) {
  const { data, error } = await supabase.rpc('registrar_victoria', {
    nombre_piloto: nombre
  });
  if (error) throw error;
  return data;
}

export async function obtenerRankingTop10() {
  const { data, error } = await supabase
    .from('pilotos')
    .select('nombre, carreras_ganadas')
    .order('carreras_ganadas', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
}
```

---

## 3. Plan de Acción Paso a Paso (Checklist de Desarrollo)

### Fase 1: Repositorio y Entorno Base (GitHub + Vite)
- [ ] Inicializar el proyecto con Vite: `npm create vite@latest apex-88-racer -- --template vanilla`
- [ ] Instalar dependencias: `npm install three @supabase/supabase-js`
- [ ] Crear archivo `.gitignore` asegurando que incluya `node_modules/`, `dist/` y `.env`.
- [ ] Crear archivo `.env.example` con las claves vacías:
  ```env
  VITE_SUPABASE_URL=tu_url_de_supabase
  VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
  ```
- [ ] Subir el commit inicial a un nuevo repositorio en **GitHub**.

### Fase 2: Escena 3D Low-Poly (Three.js)
- [ ] Configurar `THREE.WebGLRenderer` con `antialias: false` (o resolución escalada) para acentuar el look retro.
- [ ] Aplicar `flatShading: true` en todos los materiales (`THREE.MeshLambertMaterial` o `THREE.MeshStandardMaterial`) de coches, árboles y montañas.
- [ ] Construir la pista mediante `THREE.CatmullRomCurve3` extruyendo el asfalto gris (`#333538`) y generando los bordillos alternos rojos y blancos en los márgenes.
- [ ] Dividir la decoración del circuito en dos biomas:
  - **Tramo 1 (Costa):** Plano de agua low-poly a la izquierda y palmeras facetadas a la derecha.
  - **Tramo 2 (Emerald Grove):** Colinas verdes/marrones y pinos geométricos a ambos lados de las curvas en S.
- [ ] Crear el sistema de partículas de derrape y escape usando un pool de `THREE.BoxGeometry(0.2, 0.2, 0.2)` con material blanco básico sin sombras.
- [ ] Programar los $3$ modos de cámara:
  - Cámara 1: Persecución trasera baja ($\text{FOV} = 65^\circ$).
  - Cámara 2: Aérea isométrica/dron en curvas S.
  - Cámara 3: Frontal mirando hacia el capó para el cierre con el logo `Racing Car`.

### Fase 3: Interfaz de Usuario Retro (HUD HTML/CSS)
- [ ] Importar la fuente `'Press Start 2P'` desde Google Fonts en `index.html`.
- [ ] Maquetar el contenedor `#hud-overlay` en CSS Grid/Flexbox superpuesto al canvas:
  - **Arriba Izquierda:** Texto `POS` en blanco y contador `8/8` con degradado vertical amarillo-naranja (`#FFE600` a `#FF8800`) y borde negro.
  - **Arriba Derecha:** Texto `LAP` en blanco y contador `1/3` con el mismo degradado.
  - **Centro Superior:** Banner dinámico para la cuenta atrás (`3... 2... 1... READY!`, `GO!`) y anuncios de zona (`EMERALD GROVE`).
  - **Abajo Izquierda:** Icono de engranaje pixel-art rotando según las RPM + texto dinámico `0 MPH`.
  - **Abajo Derecha:** `<canvas id="minimap">` de $140 \times 140\text{ px}$ con fondo semitransparente, dibujando la spline de la pista y los puntos de posición (jugador y rivales).

### Fase 4: Bucle de Juego, Registro y Conectividad con Supabase
- [ ] Crear pantalla de inicio con la portada generada por IA y un campo de texto simple: *"INTRODUCE TU NOMBRE DE PILOTO"*.
- [ ] Al pulsar **START**, llamar a `obtenerPerfilYDificultad(nombre)` y aplicar los multiplicadores a los $7$ vehículos de la IA.
- [ ] Implementar detector de vueltas (checkpoints invisibles a lo largo de la spline para evitar trampas).
- [ ] Al completar la vuelta `3/3` en `POS 1/8`:
  - Activar la cámara frontal mirando al coche.
  - Mostrar animación del logo cromado `Racing Car`.
  - Ejecutar `sumarVictoria(nombre)` en Supabase.
  - Mostrar tabla modal con el Top 10 de pilotos (`obtenerRankingTop10()`).

### Fase 5: Despliegue Continuo (Netlify)
- [ ] Iniciar sesión en **Netlify** y seleccionar **Add new site > Import an existing project > GitHub**.
- [ ] Elegir el repositorio `apex-88-racer`.
- [ ] Configurar opciones de compilación:
  - **Build command:** `npm run build`
  - **Publish directory:** `dist`
- [ ] Ir a **Site configuration > Environment variables** y registrar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- [ ] Ejecutar el despliegue y verificar que las victorias se guardan en Supabase desde la URL pública de Netlify.

---

## 4. Prompts para Generación de Imágenes (Assets del Juego)

Copia y pega estos prompts en tu generador de imágenes (Midjourney v6, Flux.1 o Ideogram):

### [ ] Prompt 1: Skybox Panorámico de Atardecer (Fondo 360/2D)
> **Herramienta recomendada:** Midjourney v6 / Flux.1
```text
Seamless panoramic 2D skybox texture for a retro arcade racing game, warm sunset gradient transitioning from deep violet at the top to coral orange and golden yellow at the horizon, a large flat bright yellow sun, subtle 16-bit pixel dithering halftone pattern in the sky, distant flat-shaded low-poly mountain silhouettes along the bottom edge, coastal ocean horizon, no cars, no foreground trees, Horizon Chase Turbo aesthetic --ar 16:9 --tile
```

### [ ] Prompt 2: Vistas Ortográficas del Coche (`APEX-88`)
> **Herramienta recomendada:** Midjourney v6 / Flux.1 (Ideal como referencia para modelar o pasar a una IA de imagen a 3D como Trellis/Tripo3D/Meshy)
```text
3D model turnaround sheet of a 1980s red wedge-shaped supercar inspired by Ferrari F40 and Lamborghini Countach, strict flat-shaded low-poly geometry, hard faceted edges, no smooth shading, two white racing stripes down the center, rear wing spoiler, quad exhaust pipes, license plate reading "APEX-88", front, back, side, and top orthographic views on a neutral dark grey background, Virtua Racing aesthetic --ar 16:9
```

### [ ] Prompt 3: Spritesheet de Iconos para el HUD (Engranaje, Trofeos y Marcos)
> **Herramienta recomendada:** Midjourney v6 / Flux.1
```text
16-bit arcade racing game UI asset sheet on a solid black background, including a metallic pixel-art cogwheel gear icon, a square minimap frame border, retro pixel trophy icons in bronze silver and gold, and pixelated white smoke cube sprites, sharp pixel edges, Sega Model 1 and 90s arcade HUD style, flat 2D vector pixel art --ar 1:1
```

### [ ] Prompt 4: Logo Cromado Ochentero (`Racing Car`)
> **Herramienta recomendada:** Ideogram 2.0 / Flux.1 (Por su precisión en textos)
```text
Retro 1980s synthwave chrome typography logo reading "RACING CAR" in cursive script font, glossy metallic silver reflection on the top half and vibrant neon magenta pink bevel on the bottom half, isolated on a solid black background, OutRun and vintage arcade cabinet title graphic style, high contrast --ar 16:9
```

### [ ] Prompt 5: Key Art / Pantalla de Inicio y Registro de Piloto
> **Herramienta recomendada:** Midjourney v6 / Flux.1
```text
Low-poly 3D arcade racing game key art, a red faceted sports car with white stripes drifting around an S-curve on a dark asphalt road with red and white kerbs, surrounded by geometric flat-shaded green pine trees and coastal palm trees at sunset, blocky white pixel smoke coming from the tires, dramatic low-angle chase view, vibrant retro colors, Horizon Chase Turbo and Virtua Racing style --ar 16:9
```