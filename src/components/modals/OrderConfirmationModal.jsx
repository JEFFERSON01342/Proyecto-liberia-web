import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generarFacturaClientePDF } from '../../utils/generarFacturaClientePDF';

export default function OrderConfirmationModal() {
  const { orderConfirmation, closeOrderConfirmation } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedAccessToken, setCopiedAccessToken] = useState(false);

  if (!orderConfirmation) return null;

  const {
    numeroOrden,
    tipo,
    precio,
    nombre,
    email,
    telefono,
    metodo_pago,
    estado_pago,
    tipo_entrega,
    direccion_entrega,
    notas,
    items,
    fecha,
    sucursal,
    idPedido,
    tokenAcceso,
  } = orderConfirmation;
  const esImpresion = tipo === 'impresion';
  const esRetiro = ['retiro', 'recoger en tienda'].includes((tipo_entrega || '').toLowerCase());

  const descargarFactura = () => {
    generarFacturaClientePDF({
      numeroOrden,
      nombre,
      email,
      telefono,
      items: items || [],
      total: precio,
      metodo_pago,
      tipo_entrega,
      notas,
      fecha,
    });
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(numeroOrden || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  const copyAccessToken = async () => {
    try {
      await navigator.clipboard.writeText(`${idPedido}:${tokenAcceso}`);
      setCopiedAccessToken(true);
      setTimeout(() => setCopiedAccessToken(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeOrderConfirmation} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Cabecera de éxito */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-8 pb-6 text-white text-center relative">
          <button
            onClick={closeOrderConfirmation}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
            aria-label="Cerrar"
          >
            <i className="fa-solid fa-xmark text-base" />
          </button>
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-3 border border-white/30">
            <i className="fa-solid fa-check text-3xl" />
          </div>
          <h2 className="font-extrabold text-xl">
            {esImpresion ? '¡Trabajo enviado!' : '¡Pedido reservado!'}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            {esImpresion ? 'Tu documento se imprimirá pronto' : 'Te avisaremos cuando esté listo'}
          </p>
        </div>

        {/* Número de orden */}
        <div className="px-6 py-6 space-y-5">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Tu número de orden
            </p>
            <div className="rounded-2xl border-2 border-dashed border-[#c99b94] bg-[#fdf3f3] px-4 py-5">
              <p className="text-4xl font-extrabold tracking-widest text-[#6f1719]">
                {numeroOrden || '—'}
              </p>
            </div>
            <button
              onClick={copyNumber}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#9e2a2b] transition-colors hover:text-[#6f1719]"
            >
              <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
              {copied ? '¡Copiado!' : 'Copiar número'}
            </button>
          </div>

          {/* Instrucción clave */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <i className="fa-solid fa-circle-info text-amber-500 text-lg mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-0.5">¡Importante! Anota este número</p>
              <p className="text-xs leading-relaxed">
                Cuando llegues a la tienda, dile este número al cajero
                {nombre ? <> o menciona tu nombre <span className="font-semibold">({nombre})</span></> : null} para
                encontrar tu {esImpresion ? 'impresión' : 'pedido'} rápidamente.
              </p>
            </div>
          </div>

          {!esImpresion && sucursal && esRetiro && (
            <div className="flex gap-3 rounded-2xl border border-[#f7cdcd] bg-[#fdf3f3] p-4">
              <i className="fa-solid fa-store mt-0.5 text-lg text-[#9e2a2b]" />
              <div className="text-sm text-[#6f1719]">
                <p className="font-bold mb-0.5">Retiro en sucursal {sucursal}</p>
                <p className="text-xs leading-relaxed">Pasá por tu pedido a esta sucursal cuando te confirmemos que está listo.</p>
              </div>
            </div>
          )}

          {!esImpresion && tipo_entrega === 'DOMICILIO' && direccion_entrega && (
            <div className="rounded-2xl border border-[#f7cdcd] bg-[#fdf3f3] p-4 text-sm text-[#6f1719]">
              <p className="font-bold">Dirección de entrega</p>
              <p className="text-xs">{direccion_entrega}</p>
            </div>
          )}

          {!esImpresion && estado_pago === 'SIMULADO' && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              El pago con tarjeta fue únicamente una simulación. No se realizó ningún cobro; el personal confirmará el pago real al entregar el pedido.
            </div>
          )}

          {!esImpresion && tokenAcceso && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-bold">Clave privada del pedido de invitado</p>
              <p className="mt-1 break-all font-mono text-xs">{tokenAcceso}</p>
              <button onClick={copyAccessToken} className="mt-2 text-xs font-semibold text-[#9e2a2b] hover:underline">
                {copiedAccessToken ? 'Clave copiada' : 'Copiar clave de seguimiento'}
              </button>
              <p className="mt-1 text-xs text-slate-500">Guárdala junto al número de orden. Permite consultar este pedido y no debes compartirla públicamente.</p>
            </div>
          )}

          {precio != null && (
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-500">
                {esImpresion ? 'Costo estimado' : 'Total del pedido'}
              </span>
              <span className="text-lg font-extrabold text-slate-800">C${Number(precio).toFixed(2)}</span>
            </div>
          )}

          {!esImpresion && email && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
              <i className="fa-solid fa-envelope-circle-check text-emerald-500 text-lg mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-bold mb-0.5">Correo asociado al pedido</p>
                <p className="text-xs leading-relaxed">
                  Registramos <span className="font-semibold">{email}</span> como medio de contacto.
                </p>
              </div>
            </div>
          )}

          {!esImpresion && (
            <button
              onClick={descargarFactura}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#9e2a2b] py-3 text-sm font-bold text-[#9e2a2b] transition hover:bg-[#fdf3f3] active:scale-[0.98]"
            >
              <i className="fa-solid fa-file-pdf" />
              Descargar Factura PDF
            </button>
          )}

          <button
            onClick={closeOrderConfirmation}
            className="w-full rounded-xl bg-[#9e2a2b] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#871f21] active:scale-[0.98]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
