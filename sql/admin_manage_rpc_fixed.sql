-- Fixed RPCs to manage categories and suppliers with SECURITY DEFINER
-- Uses unique dollar tag $func$ to avoid unterminated dollar-quoted string issues

-- Create category
create or replace function public.rpc_create_category(p_name text, p_description text)
returns setof categories
language plpgsql
security definer
set search_path = public
as $func$
declare
  _row categories%rowtype;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  insert into categories (name, description, created_by)
  values (p_name, p_description, auth.uid())
  returning * into _row;

  return next _row;
  return;
end;
$func$;

-- Update category
create or replace function public.rpc_update_category(p_id_text text, p_name text, p_description text)
returns setof categories
language plpgsql
security definer
set search_path = public
as $func$
declare
  p_id uuid;
  _row categories%rowtype;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  begin
    p_id := p_id_text::uuid;
  exception when others then
    raise exception 'invalid id format';
  end;

  update categories set name = p_name, description = p_description, updated_at = now(), updated_by = auth.uid() where id = p_id returning * into _row;
  if _row is null then
    raise exception 'category not found';
  end if;
  return next _row;
  return;
end;
$func$;

-- Delete category
create or replace function public.rpc_delete_category(p_id_text text)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  p_id uuid;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  begin
    p_id := p_id_text::uuid;
  exception when others then
    raise exception 'invalid id format';
  end;

  begin
    delete from categories where id = p_id;
    return true;
  exception when others then
    raise exception 'delete failed: %', sqlerrm;
  end;
end;
$func$;

-- Create supplier
create or replace function public.rpc_create_supplier(p_name text, p_contact text)
returns setof suppliers
language plpgsql
security definer
set search_path = public
as $func$
declare
  _row suppliers%rowtype;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  insert into suppliers (name, contact_info, created_by)
  values (p_name, to_jsonb(p_contact), auth.uid())
  returning * into _row;

  return next _row;
  return;
end;
$func$;

-- Update supplier
create or replace function public.rpc_update_supplier(p_id_text text, p_name text, p_contact text)
returns setof suppliers
language plpgsql
security definer
set search_path = public
as $func$
declare
  p_id uuid;
  _row suppliers%rowtype;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  begin
    p_id := p_id_text::uuid;
  exception when others then
    raise exception 'invalid id format';
  end;

  update suppliers set name = p_name, contact_info = to_jsonb(p_contact), updated_at = now(), updated_by = auth.uid() where id = p_id returning * into _row;
  if _row is null then
    raise exception 'supplier not found';
  end if;
  return next _row;
  return;
end;
$func$;

-- Delete supplier
create or replace function public.rpc_delete_supplier(p_id_text text)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  p_id uuid;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  begin
    p_id := p_id_text::uuid;
  exception when others then
    raise exception 'invalid id format';
  end;

  begin
    delete from suppliers where id = p_id;
    return true;
  exception when others then
    raise exception 'delete failed: %', sqlerrm;
  end;
end;
$func$;
