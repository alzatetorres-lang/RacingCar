CREATE TABLE public.pilotos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text UNIQUE NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 15),
  carreras_ganadas integer DEFAULT 0 NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pilotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de pilotos" ON public.pilotos
  FOR SELECT USING (true);

CREATE POLICY "Insercion publica de pilotos" ON public.pilotos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualizacion publica de victorias" ON public.pilotos
  FOR UPDATE USING (true);

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