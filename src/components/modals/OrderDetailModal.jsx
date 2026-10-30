import { useApp } from '../../context/AppContext';

export default function OrderDetailModal() {
  const { orderModal, closeOrderModal } = useApp();
  const { open, order } = orderModal;

  if (!open || !order) return null;

  const items = order.items || order.items_snapshot || [];
  const paymentMethod = order.paymentMethod || order.payment_method || '—';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">Detalle del Pedido {order.numero_orden ? <span className="text-[#9e2a2b]">{order.numero_orden}</span> : 'Reservado'}</h3>
          <button onClick={closeOrderModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <p><strong className="text-slate-700">Cliente:</strong> {order.customer}</p>
              <p><strong className="text-slate-700">Método de Pago:</strong> {paymentMethod}</p>
              <p><strong className="text-slate-700">Estado:</strong> {order.status}</p>
              <p><strong className="text-slate-700">Fecha:</strong> {order.created_at ? new Date(order.created_at).toLocaleString('es-GT') : '—'}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Productos</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((i, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded-lg">
                    <span>{i.name} <span className="text-xs text-slate-400">(x{i.quantity})</span></span>
                    <span className="font-bold">C${((i.price || 0) * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-base">
              <span>Total:</span>
              <span className="text-[#9e2a2b]">C${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button onClick={closeOrderModal} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
