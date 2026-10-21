import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.origin.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3001');

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log(
  `🏎️ [Database Mode] ${isSupabaseConfigured ? 'Supabase Cloud (' + supabaseUrl + ')' : 'Local Backend (' + backendUrl + ')'}`
);

// Fallback seed pilots for pure offline if backend is unreachable
const defaultLeaderboard = [
  { rank: 1, nombre: 'APEX-88', carreras_ganadas: 15, league: 'GOLD' },
  { rank: 2, nombre: 'SLICK', carreras_ganadas: 12, league: 'SILVER' },
  { rank: 3, nombre: 'ZEPHYR', carreras_ganadas: 10, league: 'SILVER' },
  { rank: 4, nombre: 'CHASE', carreras_ganadas: 8, league: 'BRONZE' },
  { rank: 5, nombre: 'TURBO-T', carreras_ganadas: 7, league: 'BRONZE' },
  { rank: 6, nombre: 'VIPER', carreras_ganadas: 5, league: 'BRONZE' },
  { rank: 7, nombre: 'PHOENIX', carreras_ganadas: 3, league: 'BRONZE' },
  { rank: 8, nombre: 'BLAZE', carreras_ganadas: 2, league: 'BRONZE' }
];

function calculateParams(cleanName, victorias) {
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

/**
 * Consulta las victorias del jugador y ajusta la dificultad de la IA
 */
export async function obtenerPerfilYDificultad(nombre) {
  const cleanName = (nombre || 'APEX-88').trim().toUpperCase().slice(0, 15);

  // 1. Try Supabase Cloud if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pilotos')
        .select('nombre, carreras_ganadas')
        .eq('nombre', cleanName)
        .maybeSingle();

      if (!error && data) {
        return calculateParams(cleanName, data.carreras_ganadas);
      }
      if (!error && !data) {
        return calculateParams(cleanName, 0);
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local backend:', err);
    }
  }

  // 2. Try Local Backend
  try {
    const res = await fetch(`${backendUrl}/api/pilotos/${encodeURIComponent(cleanName)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Local backend fetch failed, using local storage fallback:', err);
  }

  // 3. Fallback: LocalStorage
  const localKey = `apex88_pilot_${cleanName}`;
  const storedWins = parseInt(localStorage.getItem(localKey) || '0', 10);
  return calculateParams(cleanName, storedWins);
}

/**
 * Incrementa atómicamente la victoria del piloto
 */
export async function sumarVictoria(nombre) {
  const cleanName = (nombre || 'APEX-88').trim().toUpperCase().slice(0, 15);

  // 1. Try Supabase RPC
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('registrar_victoria', {
        nombre_piloto: cleanName
      });
      if (!error && typeof data === 'number') {
        return data;
      }
    } catch (err) {
      console.warn('Supabase RPC error, trying local backend:', err);
    }
  }

  // 2. Try Local Backend
  try {
    const res = await fetch(`${backendUrl}/api/pilotos/victoria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: cleanName })
    });
    if (res.ok) {
      const json = await res.json();
      return json.carreras_ganadas;
    }
  } catch (err) {
    console.warn('Local backend post failed, using local storage fallback:', err);
  }

  // 3. Fallback: LocalStorage
  const localKey = `apex88_pilot_${cleanName}`;
  const current = parseInt(localStorage.getItem(localKey) || '0', 10);
  const next = current + 1;
  localStorage.setItem(localKey, String(next));
  return next;
}

/**
 * Obtiene el ranking Top 10 de pilotos
 */
export async function obtenerRankingTop10() {
  // 1. Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pilotos')
        .select('nombre, carreras_ganadas')
        .order('carreras_ganadas', { ascending: false })
        .limit(10);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((p, idx) => {
          let league = 'BRONZE';
          if (p.carreras_ganadas >= 16) league = 'PLATINUM';
          else if (p.carreras_ganadas >= 8) league = 'GOLD';
          else if (p.carreras_ganadas >= 3) league = 'SILVER';
          return {
            rank: idx + 1,
            nombre: p.nombre,
            carreras_ganadas: p.carreras_ganadas,
            league
          };
        });
      }
    } catch (err) {
      console.warn('Supabase ranking failed, trying local backend:', err);
    }
  }

  // 2. Try Local Backend
  try {
    const res = await fetch(`${backendUrl}/api/pilotos/ranking`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Local backend ranking fetch failed, using fallback:', err);
  }

  // 3. Fallback
  return defaultLeaderboard;
}
