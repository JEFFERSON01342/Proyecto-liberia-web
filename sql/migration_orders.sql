-- =========================================================
-- MIGRACION: Sistema de pedidos con ventas + historial cliente
-- Ejecutar en Supabase -> SQL Editor
-- =========================================================

-- 1) Crear tabla orders si no existe
CREATE TABLE IF NOT EXISTS public.orders (
  id bigint generated always as identity primary key,
  customer text not null,
  payment_method text not null default 'Pago en Local',
  total numeric(14,2) not null default 0,
  status text not null default 'Pendiente' check (status in ('Pendiente','Completado','Rechazado')),
  user_id uuid references auth.users(id) on delete set null,
  items_snapshot jsonb,
  created_at timestamptz not null default now()
);

-- 2) Si la tabla ya existia, agregar columnas nuevas
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total numeric(14,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items_snapshot jsonb;

-- 3) Activar Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4) Eliminar politicas antiguas si existen (para recrearlas limpias)
DROP POLICY IF EXISTS "Users see own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;

-- 5) Politicas nuevas
-- Clientes ven solo sus pedidos; admins ven todos
CREATE POLICY "Users see own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (SELECT public.is_admin()));

-- Cualquier usuario autenticado puede crear un pedido
CREATE POLICY "Authenticated insert orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Solo admins actualizan (aceptar pedido -> Completado)
CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()));

-- Solo admins eliminan (rechazar pedido)
CREATE POLICY "Admin delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

-- 6) Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Migracion completa
