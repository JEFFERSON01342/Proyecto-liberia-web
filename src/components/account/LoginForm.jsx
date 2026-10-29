import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginForm() {
  const { handleLogin, handleGoogleSignIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email: email.trim(), password });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h3>
          <p className="mt-2 text-sm text-slate-500">Ingresa con el correo y la contrasena de tu cuenta.</p>
        </div>
        <div>
          <label htmlFor="loginEmail" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Correo electronico</label>
          <input id="loginEmail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="loginPassword" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Contrasena</label>
          <input id="loginPassword" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contrasena" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">Iniciar sesion</button>
      </form>
      <div className="mt-4">
        <button onClick={handleGoogleSignIn} className="w-full rounded-xl bg-white border border-slate-200 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
          <i className="fab fa-google text-red-600"></i>
          <span>Iniciar sesión con Google</span>
        </button>
      </div>
    </>
  );
}
