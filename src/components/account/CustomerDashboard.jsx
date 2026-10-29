import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const ORDER_STATUS_COLOR = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  LISTO: 'bg-indigo-100 text-indigo-700',
  ENTREGADO: 'bg-emerald-100 text-emerald-700',
  RECHAZADO: 'bg-rose-100 text-rose-700',
  CANCELADO: 'bg-slate-100 text-slate-600',
};

export default function CustomerDashboard() {
  const { currentProfile, handleLogout, viewOrderDetails, loadMyOrdersRef } = useApp();
  const [myOrders, setMyOrders] = useState([]);
  const [myPrints, setMyPrints] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [tab, setTab] = useState('pedidos');

  const loadMyOrders = useCallback(async () => {
    if (!supabase || !currentProfile?.id) return;
    try {
      const { data: pedidos, error } = await supabase
        .from('pedidos_web')
        .select('id_pedido,numero_orden,nombre_cliente,telefono,total,metodo_pago_preferido,tipo_entrega,direccion_entrega,notas,estado,estado_pago,creado_en,detalles_pedido_web(id_detalle_pedido,nombre_snapshot,cantidad,precio_unitario,imagen_snapshot)')
        .eq('user_id', currentProfile.id)
        .order('creado_en', { ascending: false });
      if (error) throw error;
      setMyOrders(pedidos || []);
      setOrdersError('');
    } catch (e) {
      console.error('Error cargando los pedidos de la cuenta:', e);
      setOrdersError(e.message || 'No se pudieron cargar tus pedidos.');
    }
    try {
      const { data: prints, error: errP } = await supabase
        .from('trabajos_impresion')
        .select('id_trabajo,numero_orden,archivo_nombre,modo_color,copias,tamano_papel,notas,precio_estimado,estado,created_at')
        .eq('user_id', currentProfile.id)
        .order('created_at', { ascending: false });
      if (errP) throw errP;
      setMyPrints(prints || []);
    } catch (e) {
      console.warn('loadMyOrders (prints):', e.message || e);
      setMyPrints([]);
    }
  }, [currentProfile]);

  useEffect(() => {
    loadMyOrdersRef.current = loadMyOrders;
    loadMyOrders();
    return () => { loadMyOrdersRef.current = null; };
  }, [loadMyOrders, loadMyOrdersRef]);

  const totalGastado = myOrders
    .filter((o) => o.estado === 'ENTREGADO' && o.estado_pago === 'CONFIRMADO')
    .reduce((s, o) => s + parseFloat(o.total || 0), 0);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const statusBadge = (estado) => ORDER_STATUS_COLOR[estado] || 'bg-slate-100 text-slate-600';

  const orderForDetail = (o) => ({
    id: o.id_pedido,
    numero_orden: o.numero_orden || `P-${String(o.id_pedido).padStart(4, '0')}`,
    customer: o.nombre_cliente,
    payment_method: o.metodo_pago_preferido,
    total: o.total,
    status: o.estado,
    items_snapshot: (o.detalles_pedido_web || []).map((i) => ({ name: i.nombre_snapshot, price: i.precio_unitario, quantity: i.cantidad, image: i.imagen_snapshot })),
    created_at: o.creado_en,
    tipo_entrega: o.tipo_entrega,
    direccion_entrega: o.direccion_entrega,
    notas: o.notas,
  });

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Mi cuenta</p>
          <h3 className="text-xl font-bold text-slate-900">{currentProfile?.nombre_completo || ''}</h3>
          <p className="text-xs text-slate-400">{currentProfile?.email}</p>
        </div>
        <button onClick={handleLogout} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-xs text-indigo-500 font-semibold uppercase">Pedidos</p>
          <p className="text-2xl font-extrabold text-indigo-700">{myOrders.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-500 font-semibold uppercase">Impresiones</p>
          <p className="text-2xl font-extrabold text-blue-700">{myPrints.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Total gastado</p>
          <p className="text-2xl font-extrabold text-emerald-700">C${totalGastado.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex rounded-2xl bg-slate-100 p-1 gap-1 text-sm">
        <button onClick={() => setTab('pedidos')} className={tab === 'pedidos' ? 'flex-1 rounded-xl bg-white px-3 py-2 font-semibold text-indigo-700 shadow-sm' : 'flex-1 rounded-xl px-3 py-2 font-semibold text-slate-500'}>
          <i className="fa-solid fa-bag-shopping mr-1.5"></i>Mis pedidos
        </button>
        <button onClick={() => setTab('impresiones')} className={tab === 'impresiones' ? 'flex-1 rounded-xl bg-white px-3 py-2 font-semibold text-indigo-700 shadow-sm' : 'flex-1 rounded-xl px-3 py-2 font-semibold text-slate-500'}>
          <i className="fa-solid fa-print mr-1.5"></i>Mis impresiones
        </button>
      </div>

      {tab === 'pedidos' && (
        <div className="space-y-3">
          {ordersError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{ordersError}</p>}
          {myOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <i className="fa-solid fa-bag-shopping text-3xl mb-2 opacity-30"></i>
              <p className="text-sm">Aún no tienes pedidos registrados</p>
            </div>
          ) : (
            myOrders.map((o) => {
              const items = o.detalles_pedido_web || [];
              const itemSummary = items.slice(0, 2).map((i) => i.nombre_snapshot).join(', ') + (items.length > 2 ? ` +${items.length - 2} más` : '');
              return (
                <div key={o.id_pedido} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600">Orden {o.numero_orden || `P-${String(o.id_pedido).padStart(4, '0')}`}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge(o.estado)}`}>{o.estado}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <i className="fa-regular fa-calendar text-slate-400"></i>{fmtDate(o.created_at)}
                    <span className="text-slate-300">•</span>
                    <i className="fa-solid fa-truck text-slate-400"></i>{o.tipo_entrega === 'DOMICILIO' ? 'Domicilio' : 'Retiro en tienda'}
                    <span className="text-slate-300">•</span>
                    <i className="fa-solid fa-credit-card text-slate-400"></i>{o.metodo_pago_preferido}
                  </div>
                  {itemSummary && <p className="text-xs text-slate-600 truncate"><i className="fa-solid fa-box-open text-slate-400 mr-1"></i>{itemSummary}</p>}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="font-extrabold text-slate-800 text-base">C${parseFloat(o.total || 0).toFixed(2)}</span>
                    <button onClick={() => viewOrderDetails(orderForDetail(o))} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                      Ver detalle <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'impresiones' && (
        <div className="space-y-3">
          {myPrints.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <i className="fa-solid fa-print text-3xl mb-2 opacity-30"></i>
              <p className="text-sm">Aún no tienes trabajos de impresión</p>
            </div>
          ) : (
            myPrints.map((p) => (
              <div key={p.id_trabajo} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600">Orden {p.numero_orden || `I-${String(p.id_trabajo).padStart(4, '0')}`}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge(p.estado)}`}>{p.estado}</span>
                </div>
                <p className="text-xs text-slate-600 truncate"><i className="fa-solid fa-file-lines mr-1 text-slate-400"></i>{p.archivo_nombre}</p>
                <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  <i className="fa-regular fa-calendar text-slate-400"></i>{fmtDate(p.created_at)}
                  <span className="text-slate-300">•</span>
                  {p.modo_color === 'color' ? 'Color' : 'B/N'}
                  <span className="text-slate-300">•</span>
                  {p.copias} {p.copias === 1 ? 'copia' : 'copias'}
                  <span className="text-slate-300">•</span>
                  {p.tamano_papel}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Costo estimado</span>
                  <span className="font-extrabold text-slate-800 text-base">C${parseFloat(p.precio_estimado || 0).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
