-- Ensure public.is_admin() exists and grants a consistent check
-- This function returns true when the current authenticated user has role = 'admin' in public.profiles

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
select exists(
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
);
$$;

-- Optionally, you can GRANT execute on this function to public if needed, but SECURITY DEFINER already runs with function owner privileges.
-- Example: GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
