-- ==============================================================================
-- RACING CAR: APEX-88 DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. Crear tabla de pilotos
CREATE TABLE IF NOT EXISTS public.pilotos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text UNIQUE NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 15),
  carreras_ganadas integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.pilotos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso público
DROP POLICY IF EXISTS "Lectura publica de pilotos" ON public.pilotos;
CREATE POLICY "Lectura publica de pilotos" ON public.pilotos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion publica de pilotos" ON public.pilotos;
CREATE POLICY "Insercion publica de pilotos" ON public.pilotos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizacion publica de victorias" ON public.pilotos;
CREATE POLICY "Actualizacion publica de victorias" ON public.pilotos
  FOR UPDATE USING (true);

-- 4. Función RPC para registrar o incrementar victorias
CREATE OR REPLACE FUNCTION registrar_victoria(nombre_piloto text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 5. Semilla inicial de pilotos legendarios de referencia retro arcade
INSERT INTO public.pilotos (nombre, carreras_ganadas)
VALUES 
  ('APEX-88', 15),
  ('SLICK', 12),
  ('ZEPHYR', 10),
  ('CHASE', 8),
  ('TURBO-T', 7),
  ('VIPER', 5),
  ('PHOENIX', 3),
  ('BLAZE', 2)
ON CONFLICT (nombre) DO NOTHING;
