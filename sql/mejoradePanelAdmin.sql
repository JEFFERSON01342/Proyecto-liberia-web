-- Categorías de gastos
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  color text default '#6366f1',
  created_at timestamptz not null default now()
);

-- Gastos generales (gasto puntual)
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

-- Gastos al contado (abonos/cuotas periódicas)
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

-- RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas (solo admin puede ver/editar)
CREATE POLICY "Admin manage expense_categories" ON public.expense_categories FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "Admin manage expenses" ON public.expenses FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "Admin manage installment_expenses" ON public.installment_expenses FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
