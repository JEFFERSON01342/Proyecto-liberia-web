-- RPC to insert a product_images row as the owner to avoid RLS blocking client inserts
-- Run this as project Owner in Supabase SQL Editor.

create or replace function public.rpc_insert_product_image(
  p_product_id_text text,
  p_storage_path text,
  p_file_url text,
  p_file_name text,
  p_content_type text,
  p_file_size bigint
)
returns setof product_images
language plpgsql
security definer
set search_path = public
as $func$
declare
  p_product_id uuid;
  _row product_images%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  begin
    p_product_id := p_product_id_text::uuid;
  exception when others then
    raise exception 'invalid product id format';
  end;

  insert into product_images (product_id, storage_path, file_url, file_name, content_type, file_size, uploaded_by, uploaded_at)
  values (p_product_id, p_storage_path, p_file_url, p_file_name, p_content_type, p_file_size, (select auth.uid()), now())
  returning * into _row;

  return next _row;
  return;
end;
$func$;