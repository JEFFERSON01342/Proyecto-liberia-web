/* ============================================================
   CONFIGURACIÓN COMPLETA DE SUPABASE
   ============================================================

   Incluye:

   1. Tabla profiles
   2. Creación automática del perfil al registrarse
   3. Nombre completo
   4. Roles: admin / customer
   5. Usuario administrador
   6. Actualización automática de updated_at
   7. Row Level Security (RLS)
   8. Tabla orders
   9. Tabla print_requests
   10. Políticas para usuarios
   11. Políticas para administradores
   12. Protección del campo role
   13. Función is_admin()

   Este script puede ejecutarse completo en Supabase.
   ============================================================ */


/* ============================================================
   1. TABLA PROFILES
   ============================================================ */

create table if not exists public.profiles (
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    full_name text not null
        default 'Usuario'
        check (char_length(trim(full_name)) >= 2),

    role text not null
        default 'customer'
        check (role in ('admin', 'customer')),

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()
);


/* ============================================================
   2. AGREGAR COLUMNAS SI LA TABLA YA EXISTÍA
   ============================================================ */

alter table public.profiles
add column if not exists full_name text;

alter table public.profiles
add column if not exists role text;

alter table public.profiles
add column if not exists created_at timestamptz;

alter table public.profiles
add column if not exists updated_at timestamptz;


/* ============================================================
   3. CORREGIR VALORES EXISTENTES
   ============================================================ */

update public.profiles
set full_name = 'Usuario'
where full_name is null
   or char_length(trim(full_name)) < 2;

update public.profiles
set role = 'customer'
where role is null
   or role not in ('admin', 'customer');

update public.profiles
set created_at = now()
where created_at is null;

update public.profiles
set updated_at = now()
where updated_at is null;


/* ============================================================
   4. ESTABLECER DEFAULTS
   ============================================================ */

alter table public.profiles
alter column full_name set default 'Usuario';

alter table public.profiles
alter column role set default 'customer';

alter table public.profiles
alter column created_at set default now();

alter table public.profiles
alter column updated_at set default now();


/* ============================================================
   5. FUNCIÓN PARA ACTUALIZAR updated_at
   ============================================================ */

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


/* ============================================================
   6. TRIGGER updated_at
   ============================================================ */

drop trigger if exists set_profiles_updated_at
on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


/* ============================================================
   7. FUNCIÓN PARA CREAR EL PERFIL AUTOMÁTICAMENTE
      AL REGISTRARSE EN SUPABASE AUTH
   ============================================================ */

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        full_name,
        role
    )
    values (
        new.id,

        coalesce(
            nullif(
                trim(new.raw_user_meta_data ->> 'full_name'),
                ''
            ),
            'Usuario'
        ),

        case
            when lower(coalesce(new.email, ''))
                = lower('jefflorescor@gmail.com')
            then 'admin'

            else 'customer'
        end
    )

    on conflict (id) do nothing;

    return new;

end;
$$;


/* ============================================================
   8. PERMISOS DE LA FUNCIÓN
   ============================================================ */

revoke all
on function public.handle_new_user()
from public;

grant execute
on function public.handle_new_user()
to postgres, service_role;


/* ============================================================
   9. TRIGGER PARA NUEVOS USUARIOS
   ============================================================ */

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


/* ============================================================
   10. ACTUALIZAR PERFILES EXISTENTES DESDE auth.users
   ============================================================ */

insert into public.profiles (
    id,
    full_name,
    role
)

select
    u.id,

    coalesce(
        nullif(
            trim(u.raw_user_meta_data ->> 'full_name'),
            ''
        ),
        'Usuario'
    ),

    case
        when lower(coalesce(u.email, ''))
            = lower('jefflorescor@gmail.com')
        then 'admin'

        else 'customer'
    end

from auth.users u

on conflict (id)
do update set

    full_name = excluded.full_name,

    role = excluded.role;


/* ============================================================
   11. FUNCIÓN PARA COMPROBAR SI EL USUARIO ES ADMIN
   ============================================================ */

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;


/* ============================================================
   12. PROTEGER LA FUNCIÓN is_admin()
   ============================================================ */

revoke all
on function public.is_admin()
from public;

grant execute
on function public.is_admin()
to authenticated;


/* ============================================================
   13. RLS DE PROFILES
   ============================================================ */

alter table public.profiles
enable row level security;


/* ============================================================
   14. POLÍTICAS DE PROFILES
   ============================================================ */

drop policy if exists "Users can view their own profile"
on public.profiles;

create policy "Users can view their own profile"

on public.profiles

for select

to authenticated

using (
    (select auth.uid()) = id
);


/* ============================================================
   15. ACTUALIZAR PERFIL PROPIO
   ============================================================ */

drop policy if exists "Users can update their own profile"
on public.profiles;

create policy "Users can update their own profile"

on public.profiles

for update

to authenticated

using (
    (select auth.uid()) = id
)

with check (
    (select auth.uid()) = id
);


/* ============================================================
   16. INSERTAR PERFIL MANUALMENTE
      Normalmente no será necesario porque el trigger lo crea.
   ============================================================ */

drop policy if exists "Users can insert their own profile"
on public.profiles;

create policy "Users can insert their own profile"

on public.profiles

for insert

to authenticated

with check (
    (select auth.uid()) = id
);


/* ============================================================
   17. EVITAR QUE EL USUARIO CAMBIE SU ROLE
   ============================================================ */

revoke update (role)
on public.profiles
from authenticated;

grant update (full_name)
on public.profiles
to authenticated;


/* ============================================================
   18. TABLA ORDERS
   ============================================================ */

create table if not exists public.orders (

    id bigint
        generated always as identity
        primary key,

    user_id uuid not null
        references public.profiles(id)
        on delete restrict,

    customer_name text not null,

    items jsonb not null,

    total numeric(10,2) not null
        check (total >= 0),

    payment_method text not null,

    status text not null
        default 'Reservado',

    created_at timestamptz not null
        default now()
);


/* ============================================================
   19. TABLA PRINT_REQUESTS
   ============================================================ */

create table if not exists public.print_requests (

    id bigint
        generated always as identity
        primary key,

    user_id uuid not null
        references public.profiles(id)
        on delete restrict,

    customer_name text not null,

    phone text not null,

    file_name text not null,

    color_mode text not null,

    copies integer not null
        check (copies > 0),

    paper_size text not null,

    notes text,

    status text not null
        default 'Pendiente de imprimir',

    created_at timestamptz not null
        default now()
);


/* ============================================================
   20. RLS DE ORDERS
   ============================================================ */

alter table public.orders
enable row level security;


/* ============================================================
   21. RLS DE PRINT_REQUESTS
   ============================================================ */

alter table public.print_requests
enable row level security;


/* ============================================================
   22. POLÍTICAS ORDERS
   ============================================================ */


/* Usuario puede ver sus propios pedidos */

drop policy if exists "Users view own orders"
on public.orders;

create policy "Users view own orders"

on public.orders

for select

to authenticated

using (
    (select auth.uid()) = user_id
);


/* Usuario puede crear sus propios pedidos */

drop policy if exists "Users create own orders"
on public.orders;

create policy "Users create own orders"

on public.orders

for insert

to authenticated

with check (
    (select auth.uid()) = user_id
);


/* Usuario puede actualizar sus propios pedidos */

drop policy if exists "Users update own orders"
on public.orders;

create policy "Users update own orders"

on public.orders

for update

to authenticated

using (
    (select auth.uid()) = user_id
)

with check (
    (select auth.uid()) = user_id
);


/* ============================================================
   23. POLÍTICAS PRINT_REQUESTS
   ============================================================ */


/* Usuario puede ver sus propias solicitudes */

drop policy if exists "Users view own print requests"
on public.print_requests;

create policy "Users view own print requests"

on public.print_requests

for select

to authenticated

using (
    (select auth.uid()) = user_id
);


/* Usuario puede crear sus propias solicitudes */

drop policy if exists "Users create own print requests"
on public.print_requests;

create policy "Users create own print requests"

on public.print_requests

for insert

to authenticated

with check (
    (select auth.uid()) = user_id
);


/* Usuario puede actualizar sus propias solicitudes */

drop policy if exists "Users update own print requests"
on public.print_requests;

create policy "Users update own print requests"

on public.print_requests

for update

to authenticated

using (
    (select auth.uid()) = user_id
)

with check (
    (select auth.uid()) = user_id
);


/* ============================================================
   24. ADMINISTRADORES - ORDERS
   ============================================================ */


/* Admin puede ver todos los pedidos */

drop policy if exists "Admin views all orders"
on public.orders;

create policy "Admin views all orders"

on public.orders

for select

to authenticated

using (
    (select public.is_admin())
);


/* Admin puede actualizar pedidos */

drop policy if exists "Admin updates all orders"
on public.orders;

create policy "Admin updates all orders"

on public.orders

for update

to authenticated

using (
    (select public.is_admin())
)

with check (
    (select public.is_admin())
);


/* Admin puede eliminar pedidos */

drop policy if exists "Admin deletes all orders"
on public.orders;

create policy "Admin deletes all orders"

on public.orders

for delete

to authenticated

using (
    (select public.is_admin())
);


/* ============================================================
   25. ADMINISTRADORES - PRINT_REQUESTS
   ============================================================ */


/* Admin puede ver todas las solicitudes */

drop policy if exists "Admin views all print requests"
on public.print_requests;

create policy "Admin views all print requests"

on public.print_requests

for select

to authenticated

using (
    (select public.is_admin())
);


/* Admin puede actualizar solicitudes */

drop policy if exists "Admin updates all print requests"
on public.print_requests;

create policy "Admin updates all print requests"

on public.print_requests

for update

to authenticated

using (
    (select public.is_admin())
)

with check (
    (select public.is_admin())
);


/* Admin puede eliminar solicitudes */

drop policy if exists "Admin deletes all print requests"
on public.print_requests;

create policy "Admin deletes all print requests"

on public.print_requests

for delete

to authenticated

using (
    (select public.is_admin())
);


/* ============================================================
   26. ADMINISTRADOR
   ============================================================

   Si el usuario ya existe en Supabase Auth,
   esta consulta lo convierte en administrador.

   Si todavía no existe, simplemente no hará nada.
   ============================================================ */

update public.profiles p

set role = 'admin'

from auth.users u

where p.id = u.id

  and lower(coalesce(u.email, ''))
      = lower('jefflorescor@gmail.com');


/* ============================================================
   27. VERIFICACIÓN FINAL
   ============================================================ */

select
    p.id,
    p.full_name,
    p.role,
    u.email,
    p.created_at,
    p.updated_at

from public.profiles p

left join auth.users u
    on u.id = p.id

order by p.created_at desc;


/* ============================================================
   FIN DEL SCRIPT
   ============================================================ */