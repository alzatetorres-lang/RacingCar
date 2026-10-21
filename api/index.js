// Vercel Serverless Function API for APEX-88

let pilotsMemory = [
  { id: '1', nombre: 'APEX-88', carreras_ganadas: 15, updated_at: new Date().toISOString() },
  { id: '2', nombre: 'SLICK', carreras_ganadas: 12, updated_at: new Date().toISOString() },
  { id: '3', nombre: 'ZEPHYR', carreras_ganadas: 10, updated_at: new Date().toISOString() },
  { id: '4', nombre: 'CHASE', carreras_ganadas: 8, updated_at: new Date().toISOString() },
  { id: '5', nombre: 'TURBO-T', carreras_ganadas: 7, updated_at: new Date().toISOString() },
  { id: '6', nombre: 'VIPER', carreras_ganadas: 5, updated_at: new Date().toISOString() },
  { id: '7', nombre: 'PHOENIX', carreras_ganadas: 3, updated_at: new Date().toISOString() },
  { id: '8', nombre: 'BLAZE', carreras_ganadas: 2, updated_at: new Date().toISOString() }
];

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

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. Health check
  if (pathname === '/api/health') {
    return res.json({ status: 'ok', server: 'Racing Car Vercel API', total_pilotos: pilotsMemory.length });
  }

  // 2. Ranking Top 10
  if (pathname === '/api/pilotos/ranking') {
    const ranking = [...pilotsMemory]
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
    return res.json(ranking);
  }

  // 3. Register victory
  if (pathname === '/api/pilotos/victoria' || pathname === '/rest/v1/rpc/registrar_victoria') {
    const rawNombre = req.body?.nombre || req.body?.nombre_piloto;
    if (!rawNombre || typeof rawNombre !== 'string' || rawNombre.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre de piloto inválido (2-15 caracteres)' });
    }

    const cleanName = rawNombre.trim().toUpperCase().slice(0, 15);
    let piloto = pilotsMemory.find(p => p.nombre === cleanName);

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
      pilotsMemory.push(piloto);
    }

    if (pathname.includes('/rpc/')) {
      return res.json(piloto.carreras_ganadas);
    }

    return res.json({
      success: true,
      nombre: cleanName,
      carreras_ganadas: piloto.carreras_ganadas,
      profile: calculateDifficulty(cleanName, piloto.carreras_ganadas)
    });
  }

  // 4. Pilot profile by name
  if (pathname.startsWith('/api/pilotos/')) {
    const pilotName = decodeURIComponent(pathname.replace('/api/pilotos/', '')).trim().toUpperCase();
    const piloto = pilotsMemory.find(p => p.nombre === pilotName);
    const victorias = piloto ? piloto.carreras_ganadas : 0;
    return res.json(calculateDifficulty(pilotName, victorias));
  }

  // 5. Supabase query fallback
  if (pathname.startsWith('/rest/v1/pilotos')) {
    const ranking = [...pilotsMemory].sort((a, b) => b.carreras_ganadas - a.carreras_ganadas);
    return res.json(ranking);
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
