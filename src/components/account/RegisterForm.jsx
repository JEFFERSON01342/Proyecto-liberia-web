import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function RegisterForm() {
  const { handleRegistration } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleRegistration({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password, confirmation });
  };

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h3>
        <p className="mt-2 text-sm text-slate-500">Registrate para guardar y consultar tus pedidos.</p>
      </div>
      <div>
        <label htmlFor="registerFullName" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Nombre completo</label>
        <input id="registerFullName" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. Maria Perez" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="registerEmail" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Correo electronico</label>
        <input id="registerEmail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="registerPhone" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Teléfono</label>
        <input id="registerPhone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 8888-8888" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="registerPassword" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Contrasena</label>
          <input id="registerPassword" type="password" required minLength="8" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 8 caracteres" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="registerPasswordConfirm" className="mb-1.5 block text-xs font-semibold uppercase text-slate-600">Confirmar contrasena</label>
          <input id="registerPasswordConfirm" type="password" required minLength="8" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Repite la contrasena" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">Crear mi cuenta</button>
    </form>
  );
}
