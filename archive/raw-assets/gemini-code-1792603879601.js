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
    .single();

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