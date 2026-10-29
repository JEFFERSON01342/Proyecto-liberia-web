-- Categories policies
alter table public.categories enable row level security;

drop policy if exists "Categories allow select to authenticated" on public.categories;
create policy "Categories allow select to authenticated"
on public.categories for select
to authenticated
using (true);

drop policy if exists "Categories allow insert by admin" on public.categories;
create policy "Categories allow insert by admin"
on public.categories for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Categories allow update by admin" on public.categories;
create policy "Categories allow update by admin"
on public.categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Categories allow delete by admin" on public.categories;
create policy "Categories allow delete by admin"
on public.categories for delete
to authenticated
using (public.is_admin());

-- Suppliers policies
alter table public.suppliers enable row level security;

drop policy if exists "Suppliers allow select to authenticated" on public.suppliers;
create policy "Suppliers allow select to authenticated"
on public.suppliers for select
to authenticated
using (true);

drop policy if exists "Suppliers allow insert by admin" on public.suppliers;
create policy "Suppliers allow insert by admin"
on public.suppliers for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Suppliers allow update by admin" on public.suppliers;
create policy "Suppliers allow update by admin"
on public.suppliers for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Suppliers allow delete by admin" on public.suppliers;
create policy "Suppliers allow delete by admin"
on public.suppliers for delete
to authenticated
using (public.is_admin());