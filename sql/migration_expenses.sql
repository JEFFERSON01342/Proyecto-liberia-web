-- =========================================================
-- MIGRACION: Tablas de Gastos para Panel de Administracion
-- Ejecutar en Supabase -> SQL Editor
-- =========================================================

-- 1) Categorias de gastos
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  color text default '#6366f1',
  created_at timestamptz not null default now()
);

-- 2) Gastos generales (puntuales)
CREATE TABLE IF NOT EXISTS public.expenses (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  category_id bigint references public.expense_categories(id) on delete set null,
  expense_date date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now()
);

-- 3) Gastos al contado (cuotas / pagos a plazos)
CREATE TABLE IF NOT EXISTS public.installment_expenses (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  category_id bigint references public.expense_categories(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status text not null default 'activo' check (status in ('activo','pagado','vencido')),
  created_by uuid,
  created_at timestamptz not null default now()
);

-- 4) Activar Row Level Security
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_expenses ENABLE ROW LEVEL SECURITY;

-- 5) Politicas (solo admin puede gestionar)
CREATE POLICY "Admin manage expense_categories"
  ON public.expense_categories FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin manage expenses"
  ON public.expenses FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin manage installment_expenses"
  ON public.installment_expenses FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- 6) Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_installments_end_date ON public.installment_expenses(end_date);

-- Migracion completa
