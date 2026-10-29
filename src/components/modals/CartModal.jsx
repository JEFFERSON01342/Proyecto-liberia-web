import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ImageLightbox from './ImageLightbox';
import CardPaymentModal from './CardPaymentModal';

export default function CartModal() {
  const { cartModalOpen, setCartModalOpen, cart, changeQty, removeFromCart, checkoutOrder, currentProfile, guestInfo, showToast, getDescuentoParaProducto, sucursales, sucursalId, setSucursal, sucursalActual } = useApp();

  // Precio efectivo de un item aplicando el descuento vigente (si existe).
  const infoDescuento = (item) => getDescuentoParaProducto?.(item.id, item.category, item.price) || null;
  const precioEfectivo = (item) => {
    const info = infoDescuento(item);
    return info && info.precioFinal != null ? info.precioFinal : item.price;
  };
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('local');
  const [tipoEntrega, setTipoEntrega] = useState('recoger');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [lightboxItem, setLightboxItem] = useState(null); // { src, alt }
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // Prefill from logged-in profile or guest info
  useEffect(() => {
    if (cartModalOpen) {
      setCustomerName((prev) => prev || currentProfile?.nombre_completo || guestInfo?.nombre || '');
      setPhone((prev) => prev || currentProfile?.telefono || guestInfo?.telefono || '');
    }
  }, [cartModalOpen, currentProfile, guestInfo]);

  if (!cartModalOpen) return null;

  const total = cart.reduce((sum, item) => sum + precioEfectivo(item) * item.quantity, 0);

  const finalizarPedido = async () => {
    const ok = await checkoutOrder({
      name: customerName.trim(),
      phone: phone.trim(),
      email: currentProfile?.email || null,
      paymentMethod,
      tipoEntrega,
      direccionEntrega,
      notas,
    });
    if (ok) {
      setNotas('');
    }
    return ok;
  };

  const handleCheckout = async () => {
    if (sucursales?.length > 0 && !sucursalId) {
      showToast('Elige la sucursal que preparará el pedido', 'error');
      return;
    }
    if (tipoEntrega === 'domicilio' && direccionEntrega.trim().length < 5) {
      showToast('Ingresa una dirección válida para la entrega a domicilio', 'error');
      return;
    }
    // Si el método es tarjeta, abrimos el modal de pago simulado antes de confirmar
    if (paymentMethod === 'tarjeta') {
      if (!customerName.trim()) {
        showToast('Ingresa el nombre del cliente', 'error');
        return;
      }
      if (!phone.trim()) {
        showToast('Ingresa un teléfono de contacto', 'error');
        return;
      }
      if (cart.length === 0) {
        showToast('Agrega productos antes de reservar', 'error');
        return;
      }
      setCardModalOpen(true);
      return;
    }
    await finalizarPedido();
  };

  const handleCardSuccess = async () => {
    setCardModalOpen(false);
    await finalizarPedido();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-bag-shopping text-indigo-600 text-lg"></i>
            <h3 className="font-bold text-lg text-slate-900">Carrito y Reserva de Pedido</h3>
          </div>
          <button onClick={() => setCartModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-basket-shopping text-4xl mb-2"></i>
              <p className="text-sm font-medium">Tu lista de reserva está vacía</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div
                    className="relative group cursor-zoom-in flex-shrink-0"
                    onClick={() => setLightboxItem({ src: item.image, alt: item.name })}
                    title="Clic para ampliar imagen"
                  >
                    <img src={item.image} className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-slate-200 group-hover:border-indigo-400 transition" onError={(e) => { e.target.src = 'https://placehold.co/100x100/png?text=Util'; }} />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/85 rounded-full w-5 h-5 flex items-center justify-center shadow text-indigo-600">
                        <i className="fa-solid fa-magnifying-glass-plus text-[9px]"></i>
                      </span>
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{item.name}</h5>
                    {infoDescuento(item) ? (
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <span className="text-slate-400 line-through">C${item.price.toFixed(2)}</span>
                        <span className="text-rose-600">C${precioEfectivo(item).toFixed(2)} c/u</span>
                      </span>
                    ) : (
                      <span className="text-xs text-indigo-600 font-semibold">C${item.price.toFixed(2)} c/u</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
                    <button onClick={() => changeQty(item.id, -1)} className="text-slate-500 hover:text-slate-800 px-1"><i className="fa-solid fa-minus text-xs"></i></button>
                    <span className="text-xs font-bold px-1">{item.quantity}</span>
                    <button onClick={() => changeQty(item.id, 1)} className="text-slate-500 hover:text-slate-800 px-1"><i className="fa-solid fa-plus text-xs"></i></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700 p-1"><i className="fa-solid fa-trash text-sm"></i></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total a Pagar:</span>
            <span className="text-indigo-600">C${total.toFixed(2)}</span>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ej. María Pérez" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 8888-8888" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Entrega</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 p-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                  <input type="radio" name="entrega" value="recoger" checked={tipoEntrega === 'recoger'} onChange={(e) => setTipoEntrega(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium flex items-center space-x-1.5"><i className="fa-solid fa-store text-indigo-600"></i> <span>Recoger</span></span>
                </label>
                <label className="flex items-center space-x-2 p-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                  <input type="radio" name="entrega" value="domicilio" checked={tipoEntrega === 'domicilio'} onChange={(e) => setTipoEntrega(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium flex items-center space-x-1.5"><i className="fa-solid fa-truck text-amber-600"></i> <span>Domicilio</span></span>
                </label>
              </div>
            </div>

            {tipoEntrega === 'domicilio' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dirección de entrega</label>
                <textarea
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Barrio, dirección y referencias"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {sucursales && sucursales.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  {tipoEntrega === 'recoger' ? 'Sucursal de retiro' : 'Sucursal que prepara el pedido'}
                </label>
                <select
                  value={sucursalId || ''}
                  onChange={(e) => setSucursal(e.target.value || null)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Selecciona una sucursal…</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                {sucursalActual ? (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-location-dot"></i>
                    {tipoEntrega === 'recoger' ? 'Retiro en' : 'Preparado en'} sucursal {sucursalActual.nombre}{sucursalActual.direccion ? ` · ${sucursalActual.direccion}` : ''}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info"></i>
                    Elige la sucursal que preparará tu pedido.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Método de Pago</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 p-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                  <input type="radio" name="paymentMethod" value="local" checked={paymentMethod === 'local'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium flex items-center space-x-1.5"><i className="fa-solid fa-shop text-amber-600"></i> <span>En el Local</span></span>
                </label>
                <label className="flex items-center space-x-2 p-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                  <input type="radio" name="paymentMethod" value="tarjeta" checked={paymentMethod === 'tarjeta'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium flex items-center space-x-1.5"><i className="fa-solid fa-credit-card text-indigo-600"></i> <span>Tarjeta simulada</span></span>
                </label>
                <label className="flex items-center space-x-2 p-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                  <input type="radio" name="paymentMethod" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium flex items-center space-x-1.5"><i className="fa-solid fa-building-columns text-indigo-600"></i> <span>Transferencia</span></span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notas (opcional)</label>
              <input type="text" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej. Llamar antes de entregar" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          <button onClick={handleCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
            <i className="fa-solid fa-check-circle"></i>
            <span>Confirmar y Reservar Pedido</span>
          </button>
          <p className="text-center text-xs text-slate-400">La tarjeta es solo una simulación y no realiza cobros. El pago real se confirma al entregar el pedido.</p>
        </div>
      </div>

      {/* Lightbox de imagen */}
      {lightboxItem && (
        <ImageLightbox
          src={lightboxItem.src}
          alt={lightboxItem.alt}
          onClose={() => setLightboxItem(null)}
        />
      )}

      {/* Modal de pago con tarjeta (simulado) */}
      <CardPaymentModal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        total={total}
        customerName={customerName}
        onSuccess={handleCardSuccess}
      />
    </div>
  );
}
