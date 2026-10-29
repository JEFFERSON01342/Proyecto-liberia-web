-- ============================================================================
-- MIGRACIÓN UNIFICADA — Librería Lisjuashde
-- Extiende el motor contable de FinanceERP con el "puente" que conecta
-- la WEB DE CLIENTES con el PANEL ADMINISTRATIVO (una sola base de datos).
--
-- Requisitos previos: el esquema FinanceERP ya está restaurado en esta BD
-- (tablas productos, ventas, movimiento, cuentas_empresa, etc. + SPs).
--
-- Este script es IDEMPOTENTE: se puede ejecutar varias veces sin romper.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1) PERFILES DE USUARIO (staff administrativo + clientes web)
--    Ligado a auth.users. El campo "rol" define permisos:
--      admin    -> dueño: acceso total (finanzas, reportes, usuarios)
--      vendedor -> registra ventas mostrador, ve pedidos web e impresiones
--      cajero   -> caja / cobros del día
--      cliente  -> usuario de la web de clientes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo text,
    email           text,
    telefono        text,
    rol             text NOT NULL DEFAULT 'cliente'
                    CHECK (rol IN ('admin','vendedor','cajero','cliente')),
    id_empresa      integer REFERENCES public.empresa(id_empresa) ON DELETE SET NULL,
    created_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.perfiles IS 'Perfil de cada usuario autenticado; rol define permisos (admin/vendedor/cajero/cliente).';

-- Helper: saber si el usuario actual es staff (admin/vendedor/cajero)
CREATE OR REPLACE FUNCTION public.es_staff()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol IN ('admin','vendedor','cajero')
    );
$$;

CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    );
$$;

-- Crear automáticamente un perfil (rol 'cliente') al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre_completo, email, telefono, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.raw_user_meta_data->>'fullName', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'telefono',
        COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2) EXTENDER productos PARA EL ESCAPARATE WEB
-- ----------------------------------------------------------------------------
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS visible_web       boolean DEFAULT true;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS imagen_principal  text;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS materia           text;  -- Matemáticas, Lenguaje, etc. (filtro tienda)

-- ----------------------------------------------------------------------------
-- 3) GALERÍA DE IMÁGENES DE PRODUCTO
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.producto_imagenes (
    id_imagen   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_producto integer NOT NULL REFERENCES public.productos(id_producto) ON DELETE CASCADE,
    url         text NOT NULL,
    orden       integer DEFAULT 0,
    created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prod_img_producto ON public.producto_imagenes(id_producto);

-- ----------------------------------------------------------------------------
-- 4) PEDIDOS WEB (los que hace el cliente desde la tienda en línea)
--    Al ser aceptados por el staff se convierten en una venta real
--    mediante sp_registrar_venta (contabilidad de partida doble).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pedidos_web (
    id_pedido       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empresa      integer NOT NULL REFERENCES public.empresa(id_empresa) ON DELETE CASCADE,
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- null = invitado
    nombre_cliente  text NOT NULL,
    telefono        text NOT NULL,
    email           text,
    total           numeric(14,2) NOT NULL DEFAULT 0,
    metodo_pago     text NOT NULL DEFAULT 'Pago en Local',
    tipo_entrega    text NOT NULL DEFAULT 'retiro',   -- retiro en tienda
    notas           text,
    estado          text NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente','Confirmado','Listo','Entregado','Rechazado')),
    id_venta        integer REFERENCES public.ventas(id_venta) ON DELETE SET NULL, -- venta generada al confirmar
    created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pedidos_web_estado  ON public.pedidos_web(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_web_user    ON public.pedidos_web(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_web_empresa ON public.pedidos_web(id_empresa);

CREATE TABLE IF NOT EXISTS public.pedidos_web_items (
    id_item         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido       bigint NOT NULL REFERENCES public.pedidos_web(id_pedido) ON DELETE CASCADE,
    id_producto     integer REFERENCES public.productos(id_producto) ON DELETE SET NULL,
    nombre          text NOT NULL,
    cantidad        integer NOT NULL CHECK (cantidad > 0),
    precio_unitario numeric(14,2) NOT NULL,
    imagen          text
);
CREATE INDEX IF NOT EXISTS idx_pedidos_web_items_pedido ON public.pedidos_web_items(id_pedido);

-- ----------------------------------------------------------------------------
-- 5) TRABAJOS DE IMPRESIÓN (el cliente sube un archivo desde la web;
--    el staff lo imprime, registra la venta y lo marca "Listo para retiro")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trabajos_impresion (
    id_trabajo      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empresa      integer NOT NULL REFERENCES public.empresa(id_empresa) ON DELETE CASCADE,
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_cliente  text NOT NULL,
    telefono        text,
    archivo_nombre  text,
    archivo_url     text,
    storage_path    text,
    modo_color      text DEFAULT 'bn'  CHECK (modo_color IN ('bn','color')),
    copias          integer DEFAULT 1 CHECK (copias > 0),
    tamano_papel    text DEFAULT 'Carta',
    notas           text,
    precio_estimado numeric(14,2) DEFAULT 0,
    estado          text NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente','Listo','Entregado','Rechazado')),
    id_venta        integer REFERENCES public.ventas(id_venta) ON DELETE SET NULL,
    created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_impresion_estado  ON public.trabajos_impresion(estado);
CREATE INDEX IF NOT EXISTS idx_impresion_user    ON public.trabajos_impresion(user_id);

-- ----------------------------------------------------------------------------
-- 6) VISTA PÚBLICA DE PRODUCTOS (lo que consume la tienda del cliente)
--    Solo productos visibles, activos y con stock informativo.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_productos_web AS
SELECT
    p.id_producto,
    p.id_empresa,
    p.nombre,
    p.descripcion,
    p.precio_venta,
    p.stock,
    p.imagen_principal,
    p.materia,
    p.id_categoria,
    c.nombre AS categoria
FROM public.productos p
LEFT JOIN public.categorias_producto c ON c.id_categoria = p.id_categoria
WHERE p.estado = true AND COALESCE(p.visible_web, true) = true;

COMMIT;
