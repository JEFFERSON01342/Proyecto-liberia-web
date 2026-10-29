import { useApp } from '../../context/AppContext';

export default function ConfirmModal() {
  const { confirmState, resolveConfirm } = useApp();
  if (!confirmState.visible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Confirmar acción</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-700 whitespace-pre-line">{confirmState.message}</p>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button onClick={() => resolveConfirm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl">Cancelar</button>
          <button onClick={() => resolveConfirm(true)} className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-xl">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
