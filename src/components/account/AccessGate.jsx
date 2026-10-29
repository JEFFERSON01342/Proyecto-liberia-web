import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AccessGate() {
  const { handleLogin, handleRegistration, enterGuest } = useApp();
  const [mode, setMode] = useState('login'); // login | register | guest

  // login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // register
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  // guest
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [busy, setBusy] = useState(false);

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

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase text-slate-600';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-900 p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:22px_22px]"></div>
        <div className="relative flex items-center gap-3">
          <div className="bg-white rounded-2xl shadow-lg flex items-center justify-center w-14 h-14 overflow-hidden">
            <img src="img/logo.png" alt="Librería Lisjuashde" className="w-full h-full object-contain p-1.5" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl leading-tight">Librería Lisjuashde</h1>
            <p className="text-sm text-indigo-200">Materiales, Impresiones y Útiles</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">Todo para tu año escolar, en un solo lugar.</h2>
          <ul className="space-y-3 text-indigo-100 text-sm">
            <li className="flex items-center gap-3"><i className="fa-solid fa-circle-check text-amber-400"></i> Catálogo completo de útiles y materiales</li>
            <li className="flex items-center gap-3"><i className="fa-solid fa-circle-check text-amber-400"></i> Reserva tus pedidos y recógelos en tienda</li>
            <li className="flex items-center gap-3"><i className="fa-solid fa-circle-check text-amber-400"></i> Envía documentos a imprimir en línea</li>
            <li className="flex items-center gap-3"><i className="fa-solid fa-circle-check text-amber-400"></i> Da seguimiento al estado de tus pedidos</li>
          </ul>
        </div>

        <div className="relative text-xs text-indigo-300">© {new Date().getFullYear()} Librería Lisjuashde. Todos los derechos reservados.</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 rounded-xl shadow flex items-center justify-center w-11 h-11 overflow-hidden">
              <img src="img/logo.png" alt="Librería Lisjuashde" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-slate-900">Librería Lisjuashde</h1>
              <p className="text-xs text-slate-500">Materiales, Impresiones y Útiles</p>
            </div>
          </div>

          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1 gap-1 text-sm">
            <button onClick={() => setMode('login')} className={mode === 'login' ? 'flex-1 rounded-xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm' : 'flex-1 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:text-slate-700'}>Iniciar sesión</button>
            <button onClick={() => setMode('register')} className={mode === 'register' ? 'flex-1 rounded-xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm' : 'flex-1 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:text-slate-700'}>Crear cuenta</button>
            <button onClick={() => setMode('guest')} className={mode === 'guest' ? 'flex-1 rounded-xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm' : 'flex-1 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:text-slate-700'}>Invitado</button>
          </div>

          {mode === 'login' && (
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h3>
                <p className="mt-1 text-sm text-slate-500">Ingresa para ver tus pedidos y comprar más rápido.</p>
              </div>
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contraseña</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" className={inputCls} />
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60">
                {busy ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
              <p className="text-center text-xs text-slate-400">¿No tienes cuenta? <button type="button" onClick={() => setMode('register')} className="text-indigo-600 font-semibold hover:underline">Créala aquí</button></p>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={onRegister} className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h3>
                <p className="mt-1 text-sm text-slate-500">Guarda tus datos y da seguimiento a tus pedidos.</p>
              </div>
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. María Pérez" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="tu@correo.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="Ej. 8888-8888" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Contraseña</label>
                  <input type="password" required minLength="8" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mín. 8 caracteres" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirmar</label>
                  <input type="password" required minLength="8" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="Repite la contraseña" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60">
                {busy ? 'Creando...' : 'Crear mi cuenta'}
              </button>
            </form>
          )}

          {mode === 'guest' && (
            <form onSubmit={onGuest} className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Continuar como invitado</h3>
                <p className="mt-1 text-sm text-slate-500">Solo necesitamos tu nombre y teléfono para reservar pedidos. (No podrás ver tu historial después).</p>
              </div>
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ej. Carlos Mendoza" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Teléfono de contacto</label>
                <input type="tel" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Ej. 8888-8888" className={inputCls} />
              </div>
              <button type="submit" className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-400 flex items-center justify-center gap-2">
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                Entrar a la tienda
              </button>
              <p className="text-center text-xs text-slate-400">¿Prefieres guardar tu historial? <button type="button" onClick={() => setMode('register')} className="text-indigo-600 font-semibold hover:underline">Crea una cuenta</button></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
