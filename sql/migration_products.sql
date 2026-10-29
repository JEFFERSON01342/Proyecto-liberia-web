-- Migration: Productos, inventario, ventas, auditoría e imágenes
-- Crea tablas y funciones para gestionar productos, entradas de inventario (compras), items de pedidos, facturas
-- y auditoría de cambios. Diseñado para PostgreSQL/Supabase.

-- 1) Suppliers
create table if not exists public.suppliers (
  id bigint generated always as identity primary key,
  name text not null,
  ruc text,
  contact_info jsonb,
  created_at timestamptz not null default now()
);

-- 2) Categories
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- 3) Products
create table if not exists public.products (
  id bigint generated always as identity primary key,
  sku text unique,
  name text not null,
  category_id bigint references public.categories(id) on delete set null,
  default_supplier_id bigint references public.suppliers(id) on delete set null,
  description text,
  unit_price numeric(12,2) not null default 0,
  current_stock integer not null default 0,
  active boolean not null default true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to keep updated_at
create or replace function public.set_updated_at_products()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at_products();

-- 4) Product inventory entries (cuando se "añade un producto" o se recibe compra)
-- Cada registro representa una entrada de inventario: cantidad agregada, precio de compra (unit_cost),
-- precio de venta sugerido (unit_price), notas (ruc, cotizaciones, etc).
create table if not exists public.product_entries (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  supplier_id bigint references public.suppliers(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2) not null check (unit_cost >= 0), -- precio de compra por unidad
  unit_price numeric(12,2) not null check (unit_price >= 0), -- precio de venta por unidad sugerido
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  -- ganancia por esta entrada (por unidad * cantidad) generada
  profit_per_unit numeric(12,2) generated always as (unit_price - unit_cost) stored,
  total_profit numeric(14,2) generated always as ((unit_price - unit_cost) * quantity) stored
);

-- When a product_entry is inserted, increase products.current_stock accordingly
create or replace function public.handle_product_entry_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.products
    set current_stock = products.current_stock + new.quantity
    where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists trg_product_entry_insert on public.product_entries;
create trigger trg_product_entry_insert
  after insert on public.product_entries
  for each row execute procedure public.handle_product_entry_insert();

-- 5) Product images (recommended: use Supabase Storage and save file_url here)
create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  file_url text, -- URL en Supabase Storage o URL público
  file_name text,
  content_type text,
  file_size bigint,
  uploaded_by uuid,
  uploaded_at timestamptz not null default now(),
  image_data bytea -- opcional: si quieres almacenar binario en la BD (no recomendado para muchos archivos)
);

-- 6) Audit: historial de cambios a productos (insert, update, delete)
create table if not exists public.product_audit (
  id bigint generated always as identity primary key,
  product_id bigint,
  action text not null,
  changed_by uuid,
  old_data jsonb,
  new_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create or replace function public.product_audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_product_id bigint;
  v_changed_by uuid;
begin
  -- Determine the product_id and changed_by depending on which table fired the trigger
  if (tg_table_name = 'product_entries') then
    if (tg_op = 'INSERT') then
      v_product_id := new.product_id;
      v_changed_by := new.created_by;
    elsif (tg_op = 'UPDATE') then
      v_product_id := new.product_id;
      v_changed_by := new.updated_by;
    elsif (tg_op = 'DELETE') then
      v_product_id := old.product_id;
      v_changed_by := null;
    end if;
  else
    -- default: products table
    if (tg_op = 'INSERT') then
      v_product_id := new.id;
      v_changed_by := new.created_by;
    elsif (tg_op = 'UPDATE') then
      v_product_id := new.id;
      v_changed_by := new.updated_by;
    elsif (tg_op = 'DELETE') then
      v_product_id := old.id;
      v_changed_by := null;
    end if;
  end if;

  if (tg_op = 'INSERT') then
    insert into public.product_audit(product_id, action, changed_by, old_data, new_data, created_at)
    values (v_product_id, 'created', v_changed_by, null, row_to_json(new)::jsonb, now());
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.product_audit(product_id, action, changed_by, old_data, new_data, created_at)
    values (v_product_id, 'updated', v_changed_by, row_to_json(old)::jsonb, row_to_json(new)::jsonb, now());
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.product_audit(product_id, action, changed_by, old_data, new_data, created_at)
    values (v_product_id, 'deleted', v_changed_by, row_to_json(old)::jsonb, null, now());
    return old;
  end if;

  return null;
end;
$$;

-- Attach audit trigger to products and product_entries (to track additions/edits)
drop trigger if exists trg_products_audit on public.products;
create trigger trg_products_audit
  after insert or update or delete on public.products
  for each row execute procedure public.product_audit_trigger();

-- Also audit product_entries (to track purchases/entries)
drop trigger if exists trg_product_entries_audit on public.product_entries;
create trigger trg_product_entries_audit
  after insert or update or delete on public.product_entries
  for each row execute procedure public.product_audit_trigger();

-- 7) Orders / order_items (ventas)
-- public.orders ya existia en repo, pero aqui definimos order_items que guarden snapshot de precios
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0), -- precio de venta al momento
  unit_cost numeric(12,2) not null check (unit_cost >= 0), -- costo de compra al momento (snapshot)
  total numeric(14,2) generated always as (unit_price * quantity) stored
);

-- 8) Invoices (facturas virtuales)
create table if not exists public.invoices (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  invoice_number text unique,
  total numeric(14,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

-- Function to accept an order: decrement stock, create invoice, set order.status
create or replace function public.accept_order(p_order_id bigint, p_accepted_by uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  ord record;
  item record;
  total_sum numeric(14,2) := 0;
  invoice_no text;
begin
  select * into ord from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;
  if ord.status = 'Completado' or ord.status = 'Aceptado' then
    raise exception 'Order already processed';
  end if;

  -- Calculate totals and check stock
  for item in select * from public.order_items where order_id = p_order_id loop
    -- Check stock
    if (select current_stock from public.products where id = item.product_id) < item.quantity then
      raise exception 'Not enough stock for product %', item.product_id;
    end if;
    -- Decrement stock
    update public.products set current_stock = current_stock - item.quantity where id = item.product_id;
    total_sum := total_sum + item.total;
  end loop;

  -- Create invoice
  invoice_no := 'INV-' || to_char(now(),'YYYYMMDD') || '-' || p_order_id;
  insert into public.invoices(order_id, invoice_number, total) values (p_order_id, invoice_no, total_sum);

  -- Mark order as completed/accepted
  update public.orders set status = 'Completado' where id = p_order_id;
end;
$$;

-- 9) Views/queries para estadísticas
-- Ventas por dia (suma total de invoices)
create or replace view public.sales_by_day as
select date_trunc('day', i.created_at) as day, sum(i.total) as total_sales, count(*) as invoices_count
from public.invoices i
group by date_trunc('day', i.created_at)
order by day desc;

-- Ganancia aproximada por día (usa order_items unit_price - unit_cost)
create or replace view public.profit_by_day as
select date_trunc('day', o.created_at) as day,
       sum((oi.unit_price - oi.unit_cost) * oi.quantity) as profit
from public.orders o
join public.order_items oi on oi.order_id = o.id
where o.status = 'Completado'
group by date_trunc('day', o.created_at)
order by day desc;

-- Ventas por categoría
create or replace view public.sales_by_category as
select c.id as category_id, c.name as category_name, sum(oi.unit_price * oi.quantity) as total_sales
from public.order_items oi
join public.products p on p.id = oi.product_id
left join public.categories c on c.id = p.category_id
join public.orders o on o.id = oi.order_id
where o.status = 'Completado'
group by c.id, c.name
order by total_sales desc;

-- Productos con bajo stock
create or replace view public.low_stock_products as
select id, name, current_stock from public.products where current_stock <= 5 and active = true order by current_stock asc;

-- Indexes recomendados para rendimiento
create index if not exists idx_product_entries_product_id_created_at on public.product_entries(product_id, created_at desc);
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_invoices_order_id on public.invoices(order_id);
create index if not exists idx_products_category_id on public.products(category_id);

-- 10) Enable RLS on new tables and sensible default policies
alter table public.products enable row level security;
alter table public.product_entries enable row level security;
alter table public.product_images enable row level security;
alter table public.product_audit enable row level security;
alter table public.order_items enable row level security;
alter table public.invoices enable row level security;

-- Policies: allow admin to view everything and users to manage their own created rows where appropriate
-- We assume public.is_admin() exists (from earlier migration). If not, create it first.

-- Products: admins manage, authenticated can select/view
create policy "Admin manage products" on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Authenticated select products" on public.products for select to authenticated using (true);

-- product_entries: authenticated users can insert entries for products they add (with check), admin can view all
create policy "Users insert product_entries" on public.product_entries for insert to authenticated with check ((select auth.uid()) = created_by);
create policy "Admin select product_entries" on public.product_entries for select to authenticated using ((select public.is_admin()));

-- order_items and invoices: admins can view, users can view their orders (orders policies already exist)
create policy "Admin select order_items" on public.order_items for select to authenticated using ((select public.is_admin()));
create policy "Admin select invoices" on public.invoices for select to authenticated using ((select public.is_admin()));

-- Audit: only admins can read
create policy "Admin select product_audit" on public.product_audit for select to authenticated using ((select public.is_admin()));

-- End of migration
