import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import CustomerDashboard from './CustomerDashboard';

export default function AccessView() {
  const { currentProfile, guestInfo, exitGuest } = useApp();
  const [authTab, setAuthTab] = useState('register');

  // Logged-in customer: full dashboard with order history.
  if (currentProfile) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-8 sm:p-10">
          <CustomerDashboard />
        </div>
      </section>
    );
  }

  // Guest mode: invite to create an account to unlock history/tracking.
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 p-8 sm:p-10 text-white flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
              <i className="fa-solid fa-user-clock text-xl"></i>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Estás como invitado</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Hola, {guestInfo?.nombre?.split(' ')[0] || 'invitado'}</h2>
            <p className="mt-4 text-sm leading-6 text-indigo-100">Puedes reservar pedidos y enviar impresiones como invitado. Crea una cuenta para dar seguimiento a tus pedidos y ver tu historial cuando quieras.</p>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-indigo-100">
              <i className="fa-solid fa-circle-info text-indigo-300"></i>
              <span>Tus datos como invitado: {guestInfo?.nombre} · {guestInfo?.telefono}</span>
            </div>
            <button onClick={exitGuest} className="text-xs font-semibold text-indigo-200 hover:text-white underline">Salir del modo invitado</button>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <div className="space-y-4">
            <div className="flex rounded-2xl bg-slate-100 p-1 gap-1">
              <button type="button" onClick={() => setAuthTab('register')} className={authTab === 'register' ? 'flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all' : 'flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100'}>Crear cuenta</button>
              <button type="button" onClick={() => setAuthTab('login')} className={authTab === 'login' ? 'flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all' : 'flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100'}>Iniciar sesión</button>
            </div>

            {authTab === 'login' ? <LoginForm /> : <RegisterForm />}

            <p className="mt-4 text-xs leading-5 text-slate-400">Al crear una cuenta podrás consultar el estado de tus pedidos e impresiones en cualquier momento.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
