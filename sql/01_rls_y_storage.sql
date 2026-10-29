-- ============================================================================
-- RLS + STORAGE — Librería Lisjuashde
-- Seguridad por roles para las DOS webs que comparten esta base de datos.
--   - Tienda (anon): puede leer productos/categorías y crear pedidos/impresiones
--   - Cliente logueado: ve SUS pedidos e impresiones
--   - Staff (admin/vendedor/cajero): acceso completo al ERP
-- Idempotente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A) TABLAS DE REFERENCIA Y CATÁLOGO -> lectura pública (necesario en ambos)
-- ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'moneda','sector','pais','estado','unidades_medidas','tipo_cuenta','subtipo_cuenta'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS pub_read ON public.%I;', t);
    EXECUTE format('CREATE POLICY pub_read ON public.%I FOR SELECT TO anon, authenticated USING (true);', t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- B) TABLAS DEL ERP -> solo staff (admin/vendedor/cajero) acceso completo
-- ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'activos_fijos','clientes','compras','cuentas_empresa','cuentas_por_cobrar',
    'detalle_compra','detalle_ventas','empleados','gastos_fijos','movimiento',
    'pagos','prestamos','proveedores','ventas'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS staff_all ON public.%I;', t);
    EXECUTE format('CREATE POLICY staff_all ON public.%I FOR ALL TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());', t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- C) EMPRESA -> lectura pública (branding/nombre); escritura solo admin
-- ---------------------------------------------------------------------------
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS empresa_read  ON public.empresa;
DROP POLICY IF EXISTS empresa_write ON public.empresa;
CREATE POLICY empresa_read  ON public.empresa FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY empresa_write ON public.empresa FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());

-- ---------------------------------------------------------------------------
-- D) PRODUCTOS y CATEGORÍAS -> lectura pública (tienda); escritura staff
-- ---------------------------------------------------------------------------
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prod_read  ON public.productos;
DROP POLICY IF EXISTS prod_write ON public.productos;
CREATE POLICY prod_read  ON public.productos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY prod_write ON public.productos FOR ALL TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());

ALTER TABLE public.categorias_producto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cat_read  ON public.categorias_producto;
DROP POLICY IF EXISTS cat_write ON public.categorias_producto;
CREATE POLICY cat_read  ON public.categorias_producto FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY cat_write ON public.categorias_producto FOR ALL TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());

ALTER TABLE public.producto_imagenes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS img_read  ON public.producto_imagenes;
DROP POLICY IF EXISTS img_write ON public.producto_imagenes;
CREATE POLICY img_read  ON public.producto_imagenes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY img_write ON public.producto_imagenes FOR ALL TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());

-- ---------------------------------------------------------------------------
-- E) PEDIDOS WEB -> crea cualquiera (invitado); ve el dueño o el staff
-- ---------------------------------------------------------------------------
ALTER TABLE public.pedidos_web ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pw_insert ON public.pedidos_web;
DROP POLICY IF EXISTS pw_select ON public.pedidos_web;
DROP POLICY IF EXISTS pw_update ON public.pedidos_web;
DROP POLICY IF EXISTS pw_delete ON public.pedidos_web;
CREATE POLICY pw_insert ON public.pedidos_web FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pw_select ON public.pedidos_web FOR SELECT TO anon, authenticated
    USING (public.es_staff() OR (user_id IS NOT NULL AND user_id = auth.uid()));
CREATE POLICY pw_update ON public.pedidos_web FOR UPDATE TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());
CREATE POLICY pw_delete ON public.pedidos_web FOR DELETE TO authenticated USING (public.es_staff());

ALTER TABLE public.pedidos_web_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pwi_insert ON public.pedidos_web_items;
DROP POLICY IF EXISTS pwi_select ON public.pedidos_web_items;
DROP POLICY IF EXISTS pwi_mod    ON public.pedidos_web_items;
CREATE POLICY pwi_insert ON public.pedidos_web_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY pwi_select ON public.pedidos_web_items FOR SELECT TO anon, authenticated
    USING (public.es_staff() OR EXISTS (
        SELECT 1 FROM public.pedidos_web p
        WHERE p.id_pedido = pedidos_web_items.id_pedido
          AND p.user_id IS NOT NULL AND p.user_id = auth.uid()));
CREATE POLICY pwi_mod ON public.pedidos_web_items FOR ALL TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());

-- ---------------------------------------------------------------------------
-- F) TRABAJOS DE IMPRESIÓN -> igual que pedidos web
-- ---------------------------------------------------------------------------
ALTER TABLE public.trabajos_impresion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ti_insert ON public.trabajos_impresion;
DROP POLICY IF EXISTS ti_select ON public.trabajos_impresion;
DROP POLICY IF EXISTS ti_update ON public.trabajos_impresion;
DROP POLICY IF EXISTS ti_delete ON public.trabajos_impresion;
CREATE POLICY ti_insert ON public.trabajos_impresion FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY ti_select ON public.trabajos_impresion FOR SELECT TO anon, authenticated
    USING (public.es_staff() OR (user_id IS NOT NULL AND user_id = auth.uid()));
CREATE POLICY ti_update ON public.trabajos_impresion FOR UPDATE TO authenticated USING (public.es_staff()) WITH CHECK (public.es_staff());
CREATE POLICY ti_delete ON public.trabajos_impresion FOR DELETE TO authenticated USING (public.es_staff());

-- ---------------------------------------------------------------------------
-- G) PERFILES -> cada quien ve/edita el suyo; staff ve todos; admin edita todos
-- ---------------------------------------------------------------------------
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS perf_select ON public.perfiles;
DROP POLICY IF EXISTS perf_insert ON public.perfiles;
DROP POLICY IF EXISTS perf_update ON public.perfiles;
CREATE POLICY perf_select ON public.perfiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.es_staff());
CREATE POLICY perf_insert ON public.perfiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY perf_update ON public.perfiles FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.es_admin())
    WITH CHECK (id = auth.uid() OR public.es_admin());

-- ---------------------------------------------------------------------------
-- H) STORAGE BUCKETS
--    product-images -> público (fotos de productos)
--    print-files    -> privado (archivos que suben los clientes a imprimir)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images','product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('print-files','print-files', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DROP POLICY IF EXISTS "prodimg_read"   ON storage.objects;
DROP POLICY IF EXISTS "prodimg_write"  ON storage.objects;
DROP POLICY IF EXISTS "printfiles_ins" ON storage.objects;
DROP POLICY IF EXISTS "printfiles_read" ON storage.objects;

CREATE POLICY "prodimg_read" ON storage.objects FOR SELECT TO anon, authenticated
    USING (bucket_id = 'product-images');
CREATE POLICY "prodimg_write" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'product-images' AND public.es_staff())
    WITH CHECK (bucket_id = 'product-images' AND public.es_staff());

-- Cualquiera (invitado incluido) puede SUBIR un archivo a imprimir...
CREATE POLICY "printfiles_ins" ON storage.objects FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'print-files');
-- ...pero solo el staff puede LEER/descargar los archivos subidos
CREATE POLICY "printfiles_read" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'print-files' AND public.es_staff());
