import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginModal() {
  const {
    loginModalOpen, closeLoginModal,
    handleLogin, handleRegistration, enterGuest,
  } = useApp();

  const [mode, setMode] = useState('login');

  // login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  // guest fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [busy, setBusy] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (loginModalOpen) {
      setMode('login');
      setEmail(''); setPassword('');
      setFullName(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegConfirm('');
      setGuestName(''); setGuestPhone('');
      setBusy(false);
    }
  }, [loginModalOpen]);

  useEffect(() => {
    if (!loginModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLoginModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loginModalOpen, closeLoginModal]);

  if (!loginModalOpen) return null;

  const onLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    await handleLogin({ email: email.trim(), password });
    setBusy(false);
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    await handleRegistration({
      fullName: fullName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
      confirmation: regConfirm,
    });
    setBusy(false);
  };

  const onGuest = (e) => {
    e.preventDefault();
    enterGuest({ nombre: guestName, telefono: guestPhone });
  };

  const inputCls = 'w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';
  const tabActive = 'flex-1 rounded-xl bg-[#9e2a2b] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all';
  const tabInactive = 'flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3f0a0b]/60 backdrop-blur-sm"
        onClick={closeLoginModal}
      />

      {/* Modal */}
      <div role="dialog" aria-modal="true" aria-labelledby="login-modal-title" className="relative max-h-[90dvh] w-full overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-md sm:rounded-3xl">

        {/* Header decorativo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#9e2a2b] to-[#3f0a0b] px-6 pb-8 pt-6 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />

          {/* Botón cerrar */}
          <button
            onClick={closeLoginModal}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/15 hover:text-white"
            aria-label="Cerrar ventana y seguir navegando"
            title="Seguir navegando sin iniciar sesión"
          >
            <i className="fa-solid fa-xmark text-base" />
          </button>

          <div className="relative flex items-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 border border-white/20">
              <i className="fa-solid fa-lock text-xl" />
            </div>
            <div>
              <h2 id="login-modal-title" className="font-extrabold text-lg leading-tight">Para continuar</h2>
              <p className="text-[#f4ece1] text-sm">Inicia sesión o continúa como invitado</p>
            </div>
          </div>

          {/* Beneficios rápidos */}
          <div className="relative mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#f4ece1]">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-[#edc978]" />
              Reserva pedidos
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-[#edc978]" />
              Historial de compras
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-[#edc978]" />
              Impresiones online
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-1 flex gap-1">
            <button type="button" onClick={() => setMode('login')} className={mode === 'login' ? tabActive : tabInactive}>
              <i className="fa-solid fa-right-to-bracket mr-1.5" />Iniciar sesión
            </button>
            <button type="button" onClick={() => setMode('register')} className={mode === 'register' ? tabActive : tabInactive}>
              <i className="fa-solid fa-user-plus mr-1.5" />Crear cuenta
            </button>
            <button type="button" onClick={() => setMode('guest')} className={mode === 'guest' ? tabActive : tabInactive}>
              <i className="fa-solid fa-user mr-1.5" />Invitado
            </button>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="px-5 pt-4 pb-6">

          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={onLogin} className="space-y-4">
              <p className="text-sm text-slate-500">¿Ya tienes cuenta? Ingresa con tus datos.</p>
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contraseña</label>
                <input
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#9e2a2b] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#871f21] active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin" />Ingresando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-right-to-bracket" />Iniciar sesión
                  </span>
                )}
              </button>
              <p className="text-center text-xs text-slate-400">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => setMode('register')} className="font-semibold text-[#9e2a2b] hover:underline">
                  Créala aquí
                </button>
              </p>
            </form>
          )}

          {/* REGISTRO */}
          {mode === 'register' && (
            <form onSubmit={onRegister} className="space-y-3">
              <p className="text-sm text-slate-500">Crea tu cuenta y sigue tus pedidos fácilmente.</p>
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. María Pérez" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Correo</label>
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="tu@correo.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="8888-8888" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Contraseña</label>
                  <input type="password" required minLength="8" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mín. 8 caracteres" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirmar</label>
                  <input type="password" required minLength="8" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="Repite la contraseña" className={inputCls} />
                </div>
              </div>
              <button
                type="submit" disabled={busy}
                className="w-full rounded-xl bg-[#9e2a2b] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#871f21] active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin" />Creando cuenta...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-user-plus" />Crear mi cuenta</span>
                )}
              </button>
            </form>
          )}

          {/* INVITADO */}
          {mode === 'guest' && (
            <form onSubmit={onGuest} className="space-y-4">
              <p className="text-sm text-slate-500">Sin registrarte, solo necesitamos tu nombre y teléfono para el pedido.</p>
              <div>
                <label className={labelCls}>Tu nombre</label>
                <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ej. Carlos Mendoza" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Teléfono de contacto</label>
                <input type="tel" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Ej. 8888-8888" className={inputCls} />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#edc978] py-3.5 text-sm font-bold text-[#3f0a0b] shadow-lg transition hover:bg-[#f4d99b] active:scale-[0.98]"
              >
                <i className="fa-solid fa-arrow-right" />Entrar como invitado
              </button>
              <p className="text-center text-xs text-slate-400">
                ¿Quieres ver tu historial?{' '}
                <button type="button" onClick={() => setMode('register')} className="font-semibold text-[#9e2a2b] hover:underline">
                  Crea una cuenta
                </button>
              </p>
            </form>
          )}

          <div className="mt-5 border-t border-[#f4ece1] pt-4 text-center">
            <button type="button" onClick={closeLoginModal} className="text-sm font-semibold text-[#6f1719] underline decoration-[#c99b94] underline-offset-4 transition hover:text-[#9e2a2b]">
              Seguir navegando sin iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
