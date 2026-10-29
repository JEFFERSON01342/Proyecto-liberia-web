-- =========================================================
-- MIGRACION: Tabla print_jobs + politicas RLS
-- Ejecutar en Supabase -> SQL Editor
-- =========================================================

-- 1) Tabla principal de trabajos de impresion
CREATE TABLE IF NOT EXISTS public.print_jobs (
  id bigint generated always as identity primary key,
  customer_name text not null,
  phone text,
  file_name text not null,
  file_url text,                          -- URL publica del PDF en Storage
  storage_path text,                      -- Ruta en bucket print-files para eliminarlo
  color_mode text not null default 'Blanco y Negro ( / pag.)',
  copies integer not null default 1,
  paper_size text not null default 'Carta',
  notes text,
  status text not null default 'Pendiente' check (status in ('Pendiente','Completado','Rechazado')),
  total_income numeric(12,2),             -- Ingreso calculado al aceptar
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2) RLS
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage print_jobs" ON public.print_jobs;
DROP POLICY IF EXISTS "Authenticated insert print_jobs" ON public.print_jobs;

-- Admin ve y gestiona todo
CREATE POLICY "Admin manage print_jobs" ON public.print_jobs
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Cliente autenticado puede insertar su propio trabajo
CREATE POLICY "Authenticated insert print_jobs" ON public.print_jobs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Cliente ve sus propios trabajos
CREATE POLICY "Users see own print_jobs" ON public.print_jobs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (SELECT public.is_admin()));

-- 3) Indices
CREATE INDEX IF NOT EXISTS idx_print_jobs_status     ON public.print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created_at ON public.print_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_print_jobs_user_id    ON public.print_jobs(user_id);

-- =========================================================
-- STORAGE: Crear bucket print-files si no existe
-- Ejecutar tambien en Supabase -> SQL Editor
-- =========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'print-files',
  'print-files',
  false,
  26214400,  -- 25 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Politicas de storage
DROP POLICY IF EXISTS "Admin read print-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload print-files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete print-files" ON storage.objects;

CREATE POLICY "Admin read print-files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'print-files' AND (SELECT public.is_admin()));

CREATE POLICY "Authenticated upload print-files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'print-files');

CREATE POLICY "Admin delete print-files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'print-files' AND (SELECT public.is_admin()));

-- Migracion completa
