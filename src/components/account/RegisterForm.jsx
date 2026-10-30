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
        <h3 className="font-serif text-2xl font-bold text-[#3f0a0b]">Crea tu cuenta</h3>
        <p className="mt-2 text-sm text-slate-500">Registrate para guardar y consultar tus pedidos.</p>
      </div>
      <div>
        <label htmlFor="registerFullName" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Nombre completo</label>
        <input id="registerFullName" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. María Pérez" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
      </div>
      <div>
        <label htmlFor="registerEmail" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Correo electrónico</label>
        <input id="registerEmail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
      </div>
      <div>
        <label htmlFor="registerPhone" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Teléfono</label>
        <input id="registerPhone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 8888-8888" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="registerPassword" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Contraseña</label>
          <input id="registerPassword" type="password" required minLength="8" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
        </div>
        <div>
          <label htmlFor="registerPasswordConfirm" className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Confirmar contraseña</label>
          <input id="registerPasswordConfirm" type="password" required minLength="8" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Repite la contraseña" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] outline-none transition focus:border-[#9e2a2b] focus:ring-2 focus:ring-[#9e2a2b]/20" />
        </div>
      </div>
      <button type="submit" className="w-full rounded-xl bg-[#9e2a2b] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#871f21]">Crear mi cuenta</button>
    </form>
  );
}
