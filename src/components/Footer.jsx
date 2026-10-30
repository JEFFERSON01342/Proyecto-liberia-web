import { useApp } from '../context/AppContext';

export default function Footer() {
  const { sucursales, sucursalId, setSucursal } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marca */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl shadow flex items-center justify-center w-10 h-10 overflow-hidden">
                <img src="/brand-mark.svg" alt="Logotipo de Librería Lisjuashde" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">Librería Lisjuashde</h3>
                <p className="text-xs text-slate-400">Materiales, Impresiones y Útiles</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Reservá tus útiles en línea y pasá a recogerlos en la sucursal que más te quede cerca.
            </p>
          </div>

          {/* Sucursales */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-amber-400"></i> Nuestras sucursales
            </h4>
            {(!sucursales || sucursales.length === 0) ? (
              <p className="text-sm text-slate-500">Pronto publicaremos la información de nuestras sucursales.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sucursales.map((s) => {
                  const activa = s.id === sucursalId;
                  return (
                    <div
                      key={s.id}
                      className={`rounded-2xl border p-4 transition-all ${activa ? 'border-amber-400 bg-slate-800' : 'border-slate-700 bg-slate-800/40'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-white text-sm flex items-center gap-2">
                          <i className="fa-solid fa-store text-indigo-400"></i> {s.nombre}
                        </h5>
                        {activa && (
                          <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">Elegida</span>
                        )}
                      </div>
                      {s.direccion && (
                        <p className="text-xs text-slate-400 flex items-start gap-2 mb-1">
                          <i className="fa-solid fa-map-pin text-slate-500 mt-0.5"></i>
                          <span>{s.direccion}</span>
                        </p>
                      )}
                      {s.telefono && (
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                          <i className="fa-solid fa-phone text-slate-500"></i>
                          <a href={`tel:${s.telefono}`} className="hover:text-white transition-colors">{s.telefono}</a>
                        </p>
                      )}
                      {!activa && (
                        <button
                          onClick={() => setSucursal(s.id)}
                          className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Ver disponibilidad aquí →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-500">
          © {year} Librería Lisjuashde. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
