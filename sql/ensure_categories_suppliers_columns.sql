-- Ensure categories and suppliers tables have audit columns required by the frontend and RPCs.
-- Adds columns only if they don't exist to be idempotent.

-- categories table
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- suppliers table
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Optional: ensure contact_info column exists on suppliers
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS contact_info text;

-- Optional: ensure description column exists on categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS description text;

-- Add simple index to help listing
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (lower(name));
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers (lower(name));
