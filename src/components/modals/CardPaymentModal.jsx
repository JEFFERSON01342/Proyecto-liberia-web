import { useState, useEffect } from 'react';

// Validación simple para simulación: solo verifica que tenga 13-19 dígitos
function luhnValido(numero) {
  const limpio = (numero || '').replace(/\D/g, '');
  return limpio.length >= 13 && limpio.length <= 19;
}

// Detecta la marca de la tarjeta por el primer dígito / prefijo
function detectarMarca(numero) {
  const limpio = (numero || '').replace(/\D/g, '');
  if (/^4/.test(limpio)) return 'VISA';
  if (/^5[1-5]/.test(limpio) || /^2[2-7]/.test(limpio)) return 'MasterCard';
  if (/^3[47]/.test(limpio)) return 'AMEX';
  return 'TARJETA';
}

// Formatea "1234 5678 9012 3456"
function formatearNumero(valor) {
  const limpio = valor.replace(/\D/g, '').slice(0, 19);
  return limpio.replace(/(.{4})/g, '$1 ').trim();
}

export default function CardPaymentModal({ open, onClose, total, customerName, onSuccess }) {
  const [numero, setNumero] = useState('');
  const [titular, setTitular] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('form'); // 'form' | 'procesando' | 'exito'

  // Prellenar titular con el nombre del cliente y reiniciar al abrir
  useEffect(() => {
    if (open) {
      setTitular((prev) => prev || (customerName || '').toUpperCase());
      setEstado('form');
      setErrores({});
    }
  }, [open, customerName]);

  if (!open) return null;

  const marca = detectarMarca(numero);

  const onNumeroChange = (e) => setNumero(formatearNumero(e.target.value));

  const onExpChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    setExp(v);
  };

  const onCvvChange = (e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));

  const validar = () => {
    const errs = {};
    if (!luhnValido(numero)) errs.numero = 'Número de tarjeta inválido';
    if (!titular.trim()) errs.titular = 'Ingresa el nombre del titular';
    const m = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m) {
      errs.exp = 'Fecha inválida (MM/AA)';
    } else {
      const mes = parseInt(m[1], 10);
      const anio = 2000 + parseInt(m[2], 10);
      if (mes < 1 || mes > 12) {
        errs.exp = 'Mes inválido';
      } else {
        const ahora = new Date();
        const finMes = new Date(anio, mes, 0, 23, 59, 59);
        if (finMes < ahora) errs.exp = 'Tarjeta vencida';
      }
    }
    if (cvv.length < 3) errs.cvv = 'CVV inválido';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePagar = () => {
    if (!validar()) return;
    setEstado('procesando');
    setTimeout(() => {
      setEstado('exito');
      setTimeout(() => {
        onSuccess?.();
      }, 1200);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={estado === 'form' ? onClose : undefined}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-credit-card text-[#9e2a2b] text-lg"></i>
            <h3 className="font-bold text-lg text-slate-900">Pago con Tarjeta</h3>
          </div>
          {estado === 'form' && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          )}
        </div>

        {/* Contenido */}
        {estado === 'exito' ? (
          <div className="px-6 py-12 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-check text-emerald-600 text-4xl animate-[pop_0.4s_ease-out]"></i>
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">¡Pago aprobado!</h4>
            <p className="text-sm text-slate-500">
              Se procesó el pago simulado por <span className="font-bold text-slate-700">C${Number(total).toFixed(2)}</span>
            </p>
            <style>{`@keyframes pop {0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);}}`}</style>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Tarjeta visual */}
            <div className="relative h-52 rounded-2xl bg-gradient-to-br from-[#3f0a0b] via-[#561011] to-[#9e2a2b] text-white p-5 shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#edc978]/20 blur-2xl"></div>
              <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-2xl"></div>
              <div className="relative flex items-start justify-between">
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner"></div>
                <span className="font-extrabold italic tracking-wide text-lg">{marca}</span>
              </div>
              <div className="relative mt-7">
                <p className="text-xl sm:text-2xl font-mono tracking-widest drop-shadow">
                  {numero || '•••• •••• •••• ••••'}
                </p>
              </div>
              <div className="relative mt-6 flex items-end justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Titular</p>
                  <p className="text-sm font-semibold truncate max-w-[180px]">
                    {titular || 'NOMBRE APELLIDO'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Expira</p>
                  <p className="text-sm font-semibold font-mono">{exp || 'MM/AA'}</p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Número de Tarjeta</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numero}
                  onChange={onNumeroChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full rounded-xl border bg-[#fbf7f1] px-3 py-2.5 text-sm font-mono text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/20 ${errores.numero ? 'border-rose-400' : 'border-[#e8dbca]'}`}
                />
                {errores.numero && <p className="text-xs text-rose-500 mt-1">{errores.numero}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Titular</label>
                <input
                  type="text"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value.toUpperCase())}
                  placeholder="NOMBRE APELLIDO"
                  className={`w-full rounded-xl border bg-[#fbf7f1] px-3 py-2.5 text-sm uppercase text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/20 ${errores.titular ? 'border-rose-400' : 'border-[#e8dbca]'}`}
                />
                {errores.titular && <p className="text-xs text-rose-500 mt-1">{errores.titular}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Expira (MM/AA)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={exp}
                    onChange={onExpChange}
                    placeholder="MM/AA"
                    className={`w-full rounded-xl border bg-[#fbf7f1] px-3 py-2.5 text-sm font-mono text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/20 ${errores.exp ? 'border-rose-400' : 'border-[#e8dbca]'}`}
                  />
                  {errores.exp && <p className="text-xs text-rose-500 mt-1">{errores.exp}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={onCvvChange}
                    placeholder="•••"
                    className={`w-full rounded-xl border bg-[#fbf7f1] px-3 py-2.5 text-sm font-mono text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/20 ${errores.cvv ? 'border-rose-400' : 'border-[#e8dbca]'}`}
                  />
                  {errores.cvv && <p className="text-xs text-rose-500 mt-1">{errores.cvv}</p>}
                </div>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={handlePagar}
              disabled={estado === 'procesando'}
              className="w-full rounded-xl bg-[#9e2a2b] py-3 font-bold text-white shadow-md transition-all hover:bg-[#871f21] flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {estado === 'procesando' ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Procesando pago...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock"></i>
                  <span>Pagar C${Number(total).toFixed(2)}</span>
                </>
              )}
            </button>

            {/* Aviso de simulación */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Simulación:</span> no se realizan cobros reales. No ingreses datos de una tarjeta verdadera.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
