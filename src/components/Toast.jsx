import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  const iconClass = toast.type === 'success'
    ? 'fa-solid fa-circle-check text-emerald-400 text-lg'
    : 'fa-solid fa-circle-exclamation text-rose-400 text-lg';

  return (
    <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 ${toast.visible ? '' : 'translate-y-24 opacity-0'}`}>
      <i className={iconClass}></i>
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}
