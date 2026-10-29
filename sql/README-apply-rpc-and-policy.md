Instrucciones para aplicar RPCs y asegurar is_admin() — ejecutar en Supabase SQL Editor

1) Asegúrate de que tienes privilegios de administrador en el proyecto Supabase (Owner)

2) Aplicar la función is_admin (si no existe o quieres reemplazarla)
   - Abrir el archivo: dist/sql/ensure_is_admin.sql
   - Copiar su contenido y ejecutar en SQL Editor de Supabase

3) Aplicar las funciones RPC para gestión de categorías/proveedores
   - Abrir el archivo: dist/sql/admin_manage_rpc.sql
   - Ejecutar su contenido en SQL Editor de Supabase

4) Confirmar tablas y columnas requeridas existen
   - categories debe tener: id (uuid PK default gen_random_uuid()), name text not null, description text, created_by uuid, created_at timestamptz default now(), updated_at timestamptz default now(), updated_by uuid
   - suppliers debe tener: id, name, contact_info, created_by, created_at, updated_at, updated_by
   - Si usaste mi migration_products.sql, esas tablas ya deberían existir

5) Verificar owner y permisos
   - Las funciones fueron creadas con SECURITY DEFINER (se ejecutan con los permisos del owner/propietario de la función). Asegúrate de que el owner de las funciones es un rol con permisos suficientes (ej. el rol `postgres` o el rol de servicio del proyecto).
   - Si deseas limitar ejecución a usuarios autenticados, puedes otorgar EXECUTE sobre la función a `authenticated` (o un rol específico):
     GRANT EXECUTE ON FUNCTION public.rpc_create_category(text,text) TO authenticated;
   - Sin embargo, las funciones ya validan public.is_admin(), por lo que no se recomienda otorgar execute a `authenticated` sin revisar la lógica.

6) Probar desde la app
   - Abrir la app y loguear como usuario admin.
   - Intenta crear/editar/borrar categorías y proveedores desde el panel Admin. Si hay errores, revisa la consola del navegador y el SQL Editor (logs de ejecución) en Supabase.

7) Depuración común
   - Si recibes error 'permission denied' desde la RPC: revisa public.is_admin(), si el perfil del usuario existe y tiene role='admin'.
   - Si recibes error sobre owner o privileges: re-crea la función como un owner con privilegios (ejecutando el SQL desde el rol Owner en SQL Editor) o cambia owner usando ALTER FUNCTION ... OWNER TO postgres;

Si quieres, puedo ejecutar cambios adicionales: crear vistas de auditoría para categories/suppliers, o convertir los RPCs para devolver mensajes de error más descriptivos. También puedo modificar el front-end para hacer paginación server-side completa con filtros en la consulta.
