-- Agregar columna user_id a orders (para vincular pedido con cliente registrado)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total numeric(14,2) DEFAULT 0;

-- Agregar items a orders como JSONB (snapshot del carrito sin necesitar order_items por ahora)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items_snapshot jsonb;

-- Política para que cada usuario pueda ver SUS pedidos
CREATE POLICY IF NOT EXISTS "Users see own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (SELECT public.is_admin()));

CREATE POLICY IF NOT EXISTS "Authenticated insert orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admin update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY IF NOT EXISTS "Admin delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));
