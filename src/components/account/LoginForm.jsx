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
          <h3 className="font-serif text-2xl font-bold text-[#3f0a0b]">Bienvenido de nuevo</h3>
          <p className="mt-2 text-sm text-slate-500">Ingresa con el correo y la contrasena de tu cuenta.</p>
        </div>
        <div>
          <label htmlFor="loginEmail" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Correo electrónico</label>
          <input id="loginEmail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
        </div>
        <div>
          <label htmlFor="loginPassword" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Contraseña</label>
          <input id="loginPassword" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-[#9e2a2b] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#871f21]">Iniciar sesión</button>
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
