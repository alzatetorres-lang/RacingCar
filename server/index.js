import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../database/racing_data.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initial seed data
const initialPilotos = [
  { id: '1', nombre: 'APEX-88', carreras_ganadas: 15, updated_at: new Date().toISOString() },
  { id: '2', nombre: 'SLICK', carreras_ganadas: 12, updated_at: new Date().toISOString() },
  { id: '3', nombre: 'ZEPHYR', carreras_ganadas: 10, updated_at: new Date().toISOString() },
  { id: '4', nombre: 'CHASE', carreras_ganadas: 8, updated_at: new Date().toISOString() },
  { id: '5', nombre: 'TURBO-T', carreras_ganadas: 7, updated_at: new Date().toISOString() },
  { id: '6', nombre: 'VIPER', carreras_ganadas: 5, updated_at: new Date().toISOString() },
  { id: '7', nombre: 'PHOENIX', carreras_ganadas: 3, updated_at: new Date().toISOString() },
  { id: '8', nombre: 'BLAZE', carreras_ganadas: 2, updated_at: new Date().toISOString() }
];

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial seed:', err);
  }
  saveDatabase({ pilotos: initialPilotos });
  return { pilotos: initialPilotos };
}

function saveDatabase(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

let db = loadDatabase();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Racing Car APEX-88 Backend', total_pilotos: db.pilotos.length });
});

// Calculate difficulty parameters based on wins W
function calculateDifficulty(nombre, victorias) {
  const cleanName = nombre.trim().toUpperCase();
  let league = 'BRONZE';
  if (victorias >= 16) league = 'PLATINUM';
  else if (victorias >= 8) league = 'GOLD';
  else if (victorias >= 3) league = 'SILVER';

  return {
    nombre: cleanName,
    victorias,
    league,
    aiSpeedMultiplier: Math.min(0.85 + victorias * 0.02, 1.20),
    aiCorneringSkill: Math.min(0.50 + victorias * 0.03, 0.98),
    rubberBandingFactor: victorias < 3 ? 0 : Math.min(victorias * 0.01, 0.15)
  };
}

// 1. Obtener Top 10 Ranking
app.get('/api/pilotos/ranking', (req, res) => {
  const ranking = [...db.pilotos]
    .sort((a, b) => b.carreras_ganadas - a.carreras_ganadas)
    .slice(0, 10)
    .map((p, idx) => {
      let league = 'BRONZE';
      if (p.carreras_ganadas >= 16) league = 'PLATINUM';
      else if (p.carreras_ganadas >= 8) league = 'GOLD';
      else if (p.carreras_ganadas >= 3) league = 'SILVER';
      return {
        rank: idx + 1,
        id: p.id,
        nombre: p.nombre,
        carreras_ganadas: p.carreras_ganadas,
        league
      };
    });
  res.json(ranking);
});

// 2. Obtener perfil y dificultad por nombre
app.get('/api/pilotos/:nombre', (req, res) => {
  const cleanName = req.params.nombre.trim().toUpperCase();
  const piloto = db.pilotos.find(p => p.nombre === cleanName);
  const victorias = piloto ? piloto.carreras_ganadas : 0;
  res.json(calculateDifficulty(cleanName, victorias));
});

// 3. Registrar victoria (atómico)
app.post('/api/pilotos/victoria', (req, res) => {
  const rawNombre = req.body.nombre || req.body.nombre_piloto;
  if (!rawNombre || typeof rawNombre !== 'string' || rawNombre.trim().length < 2) {
    return res.status(400).json({ error: 'Nombre de piloto inválido (2-15 caracteres)' });
  }

  const cleanName = rawNombre.trim().toUpperCase().slice(0, 15);
  let piloto = db.pilotos.find(p => p.nombre === cleanName);

  if (piloto) {
    piloto.carreras_ganadas += 1;
    piloto.updated_at = new Date().toISOString();
  } else {
    piloto = {
      id: String(Date.now()),
      nombre: cleanName,
      carreras_ganadas: 1,
      updated_at: new Date().toISOString()
    };
    db.pilotos.push(piloto);
  }

  saveDatabase(db);
  res.json({
    success: true,
    nombre: cleanName,
    carreras_ganadas: piloto.carreras_ganadas,
    profile: calculateDifficulty(cleanName, piloto.carreras_ganadas)
  });
});

// 4. Supabase RPC compatibility endpoint
app.post('/rest/v1/rpc/registrar_victoria', (req, res) => {
  const nombre = req.body.nombre_piloto;
  if (!nombre) return res.status(400).json({ error: 'Missing nombre_piloto' });
  const cleanName = nombre.trim().toUpperCase().slice(0, 15);
  let piloto = db.pilotos.find(p => p.nombre === cleanName);
  if (piloto) {
    piloto.carreras_ganadas += 1;
    piloto.updated_at = new Date().toISOString();
  } else {
    piloto = {
      id: String(Date.now()),
      nombre: cleanName,
      carreras_ganadas: 1,
      updated_at: new Date().toISOString()
    };
    db.pilotos.push(piloto);
  }
  saveDatabase(db);
  res.json(piloto.carreras_ganadas);
});

// 5. Supabase REST query compatibility for /rest/v1/pilotos
app.get('/rest/v1/pilotos', (req, res) => {
  const ranking = [...db.pilotos].sort((a, b) => b.carreras_ganadas - a.carreras_ganadas);
  res.json(ranking);
});

app.listen(PORT, () => {
  console.log(`🏎️ [APEX-88 Backend] Running on http://localhost:${PORT}`);
  console.log(`   Database loaded: ${db.pilotos.length} pilots registered.`);
});
