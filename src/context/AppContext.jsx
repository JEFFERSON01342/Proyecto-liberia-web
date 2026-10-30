import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// Single-company storefront. Empresa fixed by env (defaults to 1).
const EMPRESA_ID = parseInt(import.meta.env.VITE_LIBRERIA_EMPRESA_ID || '1', 10);
const GUEST_KEY = 'libreria_guest';
const SUCURSAL_KEY = 'libreria_sucursal';

// Print pricing convention (NIO / C$) — matches admin service products.
const PRINT_PRICE = { bn: 1, color: 5 };

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // ===== Global state =====
  const [baseProducts, setBaseProducts] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  // ===== Sucursales (tiendas físicas) =====
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState(() => {
    try { const v = localStorage.getItem(SUCURSAL_KEY); return v ? parseInt(v, 10) : null; } catch { return null; }
  });
  const [stockSucursalMap, setStockSucursalMap] = useState(null); // null = stock global (sin sucursal elegida)
  const [cart, setCart] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const cartForCheckoutRef = useRef(null);

  // ===== Descuentos / promociones =====
  const [descuentos, setDescuentos] = useState([]);
  // Mapas de aplicación: descuento -> productos / categorías
  const [descuentoProductos, setDescuentoProductos] = useState([]); // [{ id_descuento, id_producto }]
  const [descuentoCategorias, setDescuentoCategorias] = useState([]); // [{ id_descuento, categoria_nombre }]
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [currentView, setCurrentView] = useState('store');

  // Auth / access
  const [currentProfile, setCurrentProfile] = useState(null); // logged-in user profile
  const [guestInfo, setGuestInfo] = useState(null); // { nombre, telefono }
  const [authLoading, setAuthLoading] = useState(true);

  // ===== Toast =====
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const toastTimer = useRef(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3000);
  }, []);

  // ===== Confirm modal (returns Promise<boolean>) =====
  const [confirmState, setConfirmState] = useState({ visible: false, message: '' });
  const confirmResolver = useRef(null);
  const openConfirmModal = useCallback((message) => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState({ visible: true, message });
    });
  }, []);
  const resolveConfirm = useCallback((value) => {
    setConfirmState({ visible: false, message: '' });
    if (confirmResolver.current) {
      confirmResolver.current(value);
      confirmResolver.current = null;
    }
  }, []);

  // ===== Login modal (shown when unauthenticated user tries cart/prints) =====
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const pendingCartItem = useRef(null);   // product id to add after login
  const pendingNavigation = useRef(null); // view to navigate to after login

  const openLoginModal = useCallback((productId = null, targetView = null) => {
    pendingCartItem.current = productId;
    pendingNavigation.current = targetView;
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    pendingCartItem.current = null;
    pendingNavigation.current = null;
    setLoginModalOpen(false);
  }, []);

  // ===== Modals =====
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [orderModal, setOrderModal] = useState({ open: false, order: null });
  const viewOrderDetails = useCallback((order) => setOrderModal({ open: true, order }), []);
  const closeOrderModal = useCallback(() => setOrderModal({ open: false, order: null }), []);

  // ===== Confirmación de orden (muestra el número de orden en grande) =====
  const [orderConfirmation, setOrderConfirmation] = useState(null); // { numeroOrden, tipo, precio, nombre }
  const closeOrderConfirmation = useCallback(() => setOrderConfirmation(null), []);

  const isSupabaseConfigured = useCallback(() => {
    if (supabase) return true;
    showToast('Configura la URL y la clave anónima en el archivo .env.', 'error');
    return false;
  }, [showToast]);

  // ===== Access gate (kept for account view checks) =====
  const hasAccess = !!currentProfile || !!guestInfo;

  // Stock efectivo: si hay una sucursal elegida, el stock mostrado es el de esa sucursal.
  const products = useMemo(() => {
    if (!stockSucursalMap) return baseProducts;
    return baseProducts.map((p) => ({ ...p, stock: stockSucursalMap[p.id] ?? 0 }));
  }, [baseProducts, stockSucursalMap]);

  // Sucursal actualmente seleccionada (objeto completo)
  const sucursalActual = useMemo(
    () => sucursales.find((s) => s.id === sucursalId) || null,
    [sucursales, sucursalId]
  );

  // ===== productsRef: always-current reference to avoid stale closure in effects =====
  const productsRef = useRef([]);
  useEffect(() => { productsRef.current = products; }, [products]);

  // ===== View switching =====
  const switchView = useCallback((view) => {
    // 'access' view requires login
    if (view === 'access' && !currentProfile && !guestInfo) {
      openLoginModal(null, 'access');
      return;
    }
    setCurrentView(view);
  }, [currentProfile, guestInfo, openLoginModal]);

  // ===== Execute pending action after login/guest =====
  useEffect(() => {
    if (currentProfile || guestInfo) {
      // Navigate to pending view
      if (pendingNavigation.current) {
        const nav = pendingNavigation.current;
        pendingNavigation.current = null;
        setCurrentView(nav);
      }
      // Add pending cart item
      if (pendingCartItem.current) {
        const id = pendingCartItem.current;
        pendingCartItem.current = null;
        const product = productsRef.current.find((p) => p.id === id);
        if (product && product.stock > 0) {
          setCart((prev) => {
            const existing = prev.find((item) => item.id === id);
            if (existing) {
              if (existing.quantity < product.stock) {
                return prev.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
              }
              return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
          });
          showToast(`¡Añadido al carrito: ${product.name}!`);
          setCartModalOpen(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile, guestInfo]);

  // ===== Load products from storefront view =====
  const loadProducts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('catalogo_web_productos')
        .select('id_producto,id_empresa,nombre,descripcion,precio_venta,cantidad_disponible,imagen_principal,id_categoria,categoria')
        .eq('id_empresa', EMPRESA_ID)
        .order('nombre', { ascending: true });
      if (error) throw error;
      const byId = new Map();
      (data || []).forEach((p) => {
        const existing = byId.get(p.id_producto);
        if (existing) {
          existing.stock += Number(p.cantidad_disponible || 0);
          return;
        }
        byId.set(p.id_producto, {
          id: p.id_producto,
          name: p.nombre,
          desc: p.descripcion || '',
          price: Number(p.precio_venta || 0),
          stock: Number(p.cantidad_disponible || 0),
          image: p.imagen_principal || 'https://placehold.co/300x300/png?text=Util',
          category_id: p.id_categoria,
          category: p.categoria || 'General',
        });
      });
      const mapped = [...byId.values()];
      setBaseProducts(mapped);

      // Build category list dynamically from available products.
      const cats = Array.from(new Set(mapped.map((p) => p.category).filter(Boolean))).sort();
      setCategories(['Todos', ...cats]);
    } catch (err) {
      console.error('loadProducts exception:', err);
    }
  }, []);

  // ===== Sucursales + stock por sucursal =====
  const loadSucursales = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('sucursales')
        .select('id_sucursal,nombre,direccion,telefono,es_principal')
        .eq('id_empresa', EMPRESA_ID)
        .eq('activa', true)
        .order('id_sucursal', { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((s) => ({
        ...s,
        id: s.id_sucursal,
      }));
      setSucursales(mapped);
      if (!mapped.some((s) => s.id === sucursalId)) {
        const defaultSucursal = mapped.find((s) => s.es_principal) || mapped[0];
        const id = defaultSucursal?.id || null;
        setSucursalId(id);
        try {
          if (id) localStorage.setItem(SUCURSAL_KEY, String(id));
          else localStorage.removeItem(SUCURSAL_KEY);
        } catch { /* local storage is optional */ }
      }
    } catch (err) {
      console.error('loadSucursales exception:', err);
    }
  }, [sucursalId]);

  const loadStockSucursal = useCallback(async (idSuc) => {
    if (!supabase || !idSuc) { setStockSucursalMap(null); return; }
    try {
      const { data, error } = await supabase
        .from('catalogo_web_productos')
        .select('id_producto, cantidad_disponible')
        .eq('id_empresa', EMPRESA_ID)
        .eq('id_sucursal', idSuc);
      if (error) throw error;
      const map = {};
      (data || []).forEach((r) => { map[r.id_producto] = Number(r.cantidad_disponible || 0); });
      setStockSucursalMap(map);
    } catch (err) {
      console.error('loadStockSucursal exception:', err);
      setStockSucursalMap(null);
    }
  }, []);

  const setSucursal = useCallback((id) => {
    const parsed = id ? parseInt(id, 10) : null;
    setSucursalId(parsed);
    try {
      if (parsed) localStorage.setItem(SUCURSAL_KEY, String(parsed));
      else localStorage.removeItem(SUCURSAL_KEY);
    } catch { /* ignore */ }
  }, []);

  // Al cambiar la sucursal elegida, recargamos el stock de esa sucursal.
  useEffect(() => {
    loadStockSucursal(sucursalId);
  }, [sucursalId, loadStockSucursal]);

  // ===== Load descuentos (promociones activas) =====
  const loadDescuentos = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase.rpc('listar_promociones_web', {
      p_id_empresa: EMPRESA_ID,
    });
    if (error) {
      console.error('loadDescuentos error:', error);
      setDescuentos([]);
      setDescuentoProductos([]);
      setDescuentoCategorias([]);
      showToast('No se pudieron cargar las promociones vigentes.', 'error');
      return;
    }

    const promociones = Array.isArray(data) ? data : [];
    setDescuentos(promociones);
    setDescuentoProductos(promociones.flatMap((d) =>
      (d.productos || []).map((idProducto) => ({
        id_descuento: Number(d.id),
        id_producto: Number(idProducto),
      }))
    ));
    setDescuentoCategorias(promociones.flatMap((d) =>
      (d.categorias || []).map((categoria) => ({
        id_descuento: Number(d.id),
        id_categoria: Number(categoria.id_categoria),
        categoria_nombre: categoria.categoria_nombre || '',
      }))
    ));
  }, [isSupabaseConfigured, showToast]);

  // Determina si un descuento aplica a un producto dado.
  const descuentoAplica = useCallback((d, productId, categoryId) => {
    const aplica = d.aplica_a || 'todos';
    if (aplica === 'todos') return true;
    if (aplica === 'productos') {
      return descuentoProductos.some((r) =>
        r.id_descuento === Number(d.id) && r.id_producto === Number(productId)
      );
    }
    if (aplica === 'categorias') {
      return descuentoCategorias.some((r) =>
        r.id_descuento === Number(d.id) && r.id_categoria === Number(categoryId)
      );
    }
    return false;
  }, [descuentoProductos, descuentoCategorias]);

  // Devuelve el mejor descuento para un producto, o null.
  // { descuento, precioFinal, ahorro, label } — requiere el precio original.
  const getDescuentoParaProducto = useCallback((productId, categoryId, precioOriginal) => {
    if (!descuentos || descuentos.length === 0) return null;

    const precio = Number(precioOriginal);
    // Si no se pasa precio (uso solo para label), buscamos igual el descuento aplicable.
    const aplicables = descuentos.filter((d) => descuentoAplica(d, productId, categoryId));
    if (aplicables.length === 0) return null;

    // Elegimos el que genera mayor ahorro sobre este precio.
    let mejor = null;
    for (const d of aplicables) {
      let ahorro = 0;
      if (d.tipo === 'porcentaje') {
        ahorro = (precio || 0) * (Number(d.valor) / 100);
      } else {
        ahorro = Number(d.valor);
      }
      ahorro = Math.round(ahorro * 100) / 100;
      if (precio) {
        const maximoAhorro = Math.max(Math.round(precio * 100) - 1, 0) / 100;
        ahorro = Math.min(ahorro, maximoAhorro);
      }
      if (!mejor || ahorro > mejor.ahorro) {
        const label = d.tipo === 'porcentaje'
          ? `${Number(d.valor)}% OFF`
          : `C$${Number(d.valor).toFixed(2)} OFF`;
        mejor = { descuento: d, ahorro, label };
      }
    }
    if (!mejor) return null;

    const precioFinal = precio
      ? Math.round((precio - mejor.ahorro) * 100) / 100
      : null;
    return { descuento: mejor.descuento, precioFinal, ahorro: mejor.ahorro, label: mejor.label };
  }, [descuentos, descuentoAplica]);

  // ===== Auth =====
  const loadMyOrdersRef = useRef(null);

  const loadCurrentProfile = useCallback(async (user) => {
    try {
      const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, email, telefono, rol')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      const profileObj = {
        id: user.id,
        email: perfil?.email || user.email,
        full_name: perfil?.nombre_completo || user.email,
        nombre_completo: perfil?.nombre_completo || user.email,
        telefono: perfil?.telefono || '',
        rol: perfil?.rol || 'cliente',
      };
      setCurrentProfile(profileObj);
      return profileObj;
    } catch (err) {
      console.warn('loadCurrentProfile fallback:', err.message || err);
      const profileObj = {
        id: user.id,
        email: user.email,
        full_name: (user.user_metadata && user.user_metadata.nombre_completo) || user.email,
        nombre_completo: (user.user_metadata && user.user_metadata.nombre_completo) || user.email,
        telefono: '',
        rol: 'cliente',
      };
      setCurrentProfile(profileObj);
      return profileObj;
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!currentProfile?.id) {
      setCartHydrated(true);
      return () => { active = false; };
    }
    if (baseProducts.length === 0) {
      setCartHydrated(false);
      return () => { active = false; };
    }

    setCartHydrated(false);
    const cargarCarrito = async () => {
      try {
        const { data, error } = await supabase
          .from('carritos_web')
          .select('detalles_carrito_web(id_producto,cantidad)')
          .eq('id_empresa', EMPRESA_ID)
          .eq('user_id', currentProfile.id)
          .maybeSingle();
        if (error) throw error;
        if (!active) return;
        const productosPorId = new Map(baseProducts.map((product) => [product.id, product]));
        const savedCart = (data?.detalles_carrito_web || [])
          .map((item) => {
            const product = productosPorId.get(item.id_producto);
            return product ? { ...product, quantity: Number(item.cantidad) } : null;
          })
          .filter(Boolean);
        setCart(savedCart);
      } catch (error) {
        console.error('Error cargando el carrito guardado:', error);
        if (active) showToast('No se pudo cargar el carrito guardado.', 'error');
      } finally {
        if (active) setCartHydrated(true);
      }
    };
    cargarCarrito();
    return () => { active = false; };
  }, [currentProfile?.id, baseProducts, showToast]);

  useEffect(() => {
    if (!currentProfile?.id || !cartHydrated || !supabase) return undefined;
    const timeout = setTimeout(async () => {
      try {
        const { error } = await supabase.rpc('actualizar_carrito_web', {
          p_items: cart.map((item) => ({
            id_producto: item.id,
            cantidad: item.quantity,
          })),
        });
        if (error) throw error;
      } catch (error) {
        console.error('Error guardando el carrito:', error);
        showToast('No se pudo guardar el carrito en tu cuenta.', 'error');
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [currentProfile?.id, cart, cartHydrated, showToast]);

  const handleRegistration = useCallback(async ({ fullName, email, password, confirmation, phone }) => {
    if (!isSupabaseConfigured()) return;
    if (password !== confirmation) { showToast('Las contraseñas no coinciden.', 'error'); return; }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: fullName, telefono: phone || '', rol: 'cliente' } },
    });
    if (error) { showToast(error.message, 'error'); return; }
    if (data.session) {
      await loadCurrentProfile(data.user);
      clearGuest();
      setLoginModalOpen(false);
      showToast('¡Cuenta creada! Sesión iniciada correctamente.');
    } else {
      showToast('Cuenta creada. Revisa tu correo para confirmar la cuenta.');
    }
    return data;
  }, [isSupabaseConfigured, showToast, loadCurrentProfile]);

  const handleLogin = useCallback(async ({ email, password }) => {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { showToast(error.message, 'error'); return; }
    await loadCurrentProfile(data.user);
    clearGuest();
    setLoginModalOpen(false);
    showToast('¡Bienvenido/a de nuevo!');
    return data;
  }, [isSupabaseConfigured, showToast, loadCurrentProfile]);

  const handleGoogleSignIn = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) { showToast(error.message || 'Error iniciando sesión con Google', 'error'); return; }
      if (data && data.url) window.location.href = data.url;
    } catch (err) {
      console.error('handleGoogleSignIn error:', err);
      showToast('Error al iniciar sesión con Google.', 'error');
    }
  }, [isSupabaseConfigured, showToast]);

  const handleLogout = useCallback(async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); }
      catch (err) { console.error('Error al cerrar sesión:', err.message || err); }
    }
    setCurrentProfile(null);
    setCart([]);
    setCurrentView('store');
    showToast('Sesión cerrada.');
  }, [showToast]);

  // ===== Guest mode =====
  const clearGuest = () => {
    try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
    setGuestInfo(null);
  };

  const enterGuest = useCallback(({ nombre, telefono }) => {
    if (!nombre || !nombre.trim()) { showToast('Ingresa tu nombre para continuar', 'error'); return false; }
    if (!telefono || !telefono.trim()) { showToast('Ingresa tu teléfono para continuar', 'error'); return false; }
    const info = { nombre: nombre.trim(), telefono: telefono.trim() };
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(info)); } catch { /* ignore */ }
    setGuestInfo(info);
    setLoginModalOpen(false);
    showToast(`¡Bienvenido/a, ${info.nombre}!`);
    return true;
  }, [showToast]);

  const exitGuest = useCallback(() => {
    clearGuest();
    setCurrentView('store');
    showToast('Has salido del modo invitado.');
  }, [showToast]);

  // ===== Cart =====
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = useCallback((id) => {
    // Si no hay sesión ni modo invitado → pedir login primero
    if (!currentProfile && !guestInfo) {
      openLoginModal(id, null);
      return;
    }
    const product = products.find((p) => p.id === id);
    if (!product || product.stock <= 0) { showToast('Producto sin stock disponible', 'error'); return; }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prev.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        showToast('No hay más stock disponible', 'error');
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Añadido: ${product.name}`);
  }, [products, showToast, currentProfile, guestInfo, openLoginModal]);

  const changeQty = useCallback((id, delta) => {
    const product = products.find((p) => p.id === id);
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      let newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((i) => i.id !== id);
      if (product && newQty > product.stock) {
        newQty = product.stock;
        showToast('Límite de stock alcanzado', 'error');
      }
      return prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i);
    });
  }, [products, showToast]);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ===== Checkout through the new account and guest RPCs =====
  const checkoutOrder = useCallback(async ({
    name,
    phone,
    email,
    paymentMethod,
    tipoEntrega,
    direccionEntrega,
    notas,
  }) => {
    if (cart.length === 0) { showToast('Agrega productos antes de reservar', 'error'); return false; }
    if (!name || !name.trim()) { showToast('Ingresa el nombre del cliente', 'error'); return false; }
    if (!phone || !phone.trim()) { showToast('Ingresa un teléfono de contacto', 'error'); return false; }
    if (!sucursalId) { showToast('Selecciona una sucursal para validar las existencias', 'error'); return false; }
    if (tipoEntrega === 'domicilio' && (!direccionEntrega || direccionEntrega.trim().length < 5)) {
      showToast('Ingresa una dirección válida para la entrega a domicilio', 'error');
      return false;
    }
    if (!isSupabaseConfigured()) return false;

    const items = cart.map((item) => ({ id_producto: item.id, cantidad: item.quantity }));
    const metodo = paymentMethod === 'tarjeta'
      ? 'TARJETA_SIMULADA'
      : paymentMethod === 'transferencia'
        ? 'TRANSFERENCIA'
        : 'EFECTIVO';
    const simularPago = paymentMethod === 'tarjeta';
    const entrega = tipoEntrega === 'domicilio' ? 'DOMICILIO' : 'RETIRO';
    const emailCliente = email?.trim() || currentProfile?.email || '';
    const datosPedido = {
      id_sucursal: sucursalId,
      nombre_cliente: name.trim(),
      telefono: phone.trim(),
      email: emailCliente,
      tipo_entrega: entrega,
      direccion_entrega: entrega === 'DOMICILIO' ? direccionEntrega.trim() : null,
      metodo_pago: metodo,
      notas: notas?.trim() || null,
    };
    const firma = JSON.stringify({ datosPedido, items, simularPago });
    try {
      if (!cartForCheckoutRef.current || cartForCheckoutRef.current.firma !== firma) {
        if (!globalThis.crypto?.randomUUID) throw new Error('Este navegador no permite generar una clave segura para el pedido.');
        cartForCheckoutRef.current = { firma, clave: globalThis.crypto.randomUUID() };
      }

      let rpcData;
      if (currentProfile?.id) {
        const { error: cartError } = await supabase.rpc('actualizar_carrito_web', {
          p_items: items,
        });
        if (cartError) throw cartError;
        const { data, error } = await supabase.rpc('checkout_carrito_web', {
          p_datos: datosPedido,
          p_clave_idempotencia: cartForCheckoutRef.current.clave,
          p_pago_simulado: simularPago,
        });
        if (error) throw error;
        rpcData = data;
      } else {
        const { data, error } = await supabase.rpc('crear_pedido_web_invitado', {
          p_datos: datosPedido,
          p_items: items,
          p_clave_idempotencia: cartForCheckoutRef.current.clave,
          p_pago_simulado: simularPago,
        });
        if (error) throw error;
        rpcData = data;
      }

      if (!rpcData?.id_pedido || !rpcData?.numero_orden || Number(rpcData.total) <= 0) {
        throw new Error('La base de datos no devolvió la confirmación completa del pedido.');
      }
      const numeroOrden = rpcData.numero_orden;
      const total = Number(rpcData.total);
      const itemsFactura = (Array.isArray(rpcData.items) ? rpcData.items : cart).map((item) => ({
        name: item.name || item.nombre,
        quantity: Number(item.quantity ?? item.cantidad),
        price: Number(item.precio_unitario ?? item.price),
        precioLista: Number(item.precio_lista_unitario ?? item.price),
        descuento: Number(item.descuento_linea || 0),
      }));
      if (currentProfile?.id && loadMyOrdersRef.current) await loadMyOrdersRef.current();

      cartForCheckoutRef.current = null;
      setCart([]);
      setCartModalOpen(false);
      setOrderConfirmation({
        idPedido: rpcData?.id_pedido,
        tokenAcceso: rpcData?.token_acceso || null,
        numeroOrden,
        tipo: 'pedido',
        precio: total,
        nombre: name.trim(),
        email: emailCliente,
        telefono: phone.trim(),
        metodo_pago: metodo,
        estado_pago: rpcData?.estado_pago,
        tipo_entrega: entrega,
        direccion_entrega: datosPedido.direccion_entrega,
        notas: notas?.trim() || '',
        sucursal: sucursalActual ? sucursalActual.nombre : null,
        items: itemsFactura,
        fecha: new Date(),
      });
      return { ok: true, numeroOrden, tipo: 'pedido' };
    } catch (err) {
      console.error('checkout error:', err);
      showToast(err.message || 'Error guardando el pedido', 'error');
      return false;
    }
  }, [cart, currentProfile, showToast, isSupabaseConfigured, sucursalId, sucursalActual]);

  // ===== Print order -> trabajos_impresion =====
  const submitPrintOrder = useCallback(async ({ name, phone, mode, copies, paperSize, notes, file }) => {
    if (!name || !name.trim()) { showToast('Ingresa tu nombre para retirar', 'error'); return false; }
    if (!phone || !phone.trim()) { showToast('Ingresa tu teléfono de contacto', 'error'); return false; }
    if (!file) { showToast('Selecciona un archivo para imprimir', 'error'); return false; }
    if (!isSupabaseConfigured()) return false;

    const copiesNum = parseInt(copies, 10) || 1;
    const modoColor = mode === 'color' ? 'color' : 'bn';
    const precioEstimado = (modoColor === 'color' ? PRINT_PRICE.color : PRINT_PRICE.bn) * copiesNum;

    let storagePath = null;
    const fileName = file.name;
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      storagePath = `prints/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage.from('print-files').upload(storagePath, file, { upsert: false });
      if (upErr) { console.warn('Storage upload failed:', upErr.message); showToast('No se pudo subir el archivo. Intenta de nuevo.', 'error'); return false; }
    } catch (err) {
      console.warn('Upload error:', err);
      showToast('Error subiendo el archivo.', 'error');
      return false;
    }

    let numeroOrden = null;
    try {
      const userId = currentProfile?.id || null;
      const { data: insertData, error: dbErr } = await supabase
        .from('trabajos_impresion')
        .insert([{
          id_empresa: EMPRESA_ID,
          user_id: userId,
          nombre_cliente: name.trim(),
          telefono: phone.trim(),
          archivo_nombre: fileName,
          storage_path: storagePath,
          modo_color: modoColor,
          copias: copiesNum,
          tamano_papel: paperSize,
          notas: notes?.trim() || null,
          precio_estimado: precioEstimado,
          estado: 'Pendiente',
        }])
        .select('id_trabajo, numero_orden')
        .single();
      if (dbErr) throw dbErr;
      numeroOrden = insertData?.numero_orden || (insertData?.id_trabajo ? `I-${String(insertData.id_trabajo).padStart(4, '0')}` : null);
    } catch (err) {
      console.error('submitPrintOrder error:', err);
      showToast(err.message || 'Error guardando el trabajo de impresión', 'error');
      return false;
    }

    if (currentProfile?.id && loadMyOrdersRef.current) await loadMyOrdersRef.current();
    setCurrentView('store');
    setOrderConfirmation({ numeroOrden, tipo: 'impresion', precio: precioEstimado, nombre: name.trim() });
    return { ok: true, numeroOrden, tipo: 'impresion', precio: precioEstimado, nombre: name.trim() };
  }, [currentProfile, showToast, isSupabaseConfigured]);

  // ===== Initialization =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Restore guest session
      try {
        const raw = localStorage.getItem(GUEST_KEY);
        if (raw) setGuestInfo(JSON.parse(raw));
      } catch { /* ignore */ }

      if (!supabase) { setAuthLoading(false); return; }

      await loadProducts();
      await loadSucursales();
      await loadDescuentos();

      try {
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session && session.user) {
            await loadCurrentProfile(session.user);
          } else {
            setCurrentProfile(null);
          }
        });
        const { data } = await supabase.auth.getSession();
        const session = data ? data.session : null;
        if (session && session.user) {
          await loadCurrentProfile(session.user);
        }
      } catch (err) {
        console.error('initializeAuth error:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    // state
    products,
    categories,
    cart, cartCount,
    currentCategory, setCurrentCategory,
    currentView, switchView,
    // access
    currentProfile, guestInfo, hasAccess, authLoading,
    enterGuest, exitGuest,
    // data loaders
    loadProducts,
    // sucursales
    sucursales, sucursalId, sucursalActual, setSucursal, loadSucursales,
    // descuentos / promociones
    descuentos, loadDescuentos, getDescuentoParaProducto,
    // toast + confirm
    toast, showToast,
    confirmState, openConfirmModal, resolveConfirm,
    // login modal
    loginModalOpen, openLoginModal, closeLoginModal,
    // modals
    cartModalOpen, setCartModalOpen,
    orderModal, viewOrderDetails, closeOrderModal,
    orderConfirmation, closeOrderConfirmation,
    // auth
    handleRegistration, handleLogin, handleLogout, handleGoogleSignIn,
    loadMyOrdersRef,
    // cart actions
    addToCart, changeQty, removeFromCart, checkoutOrder,
    // prints
    submitPrintOrder,
    // supabase
    supabase,
    EMPRESA_ID,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
