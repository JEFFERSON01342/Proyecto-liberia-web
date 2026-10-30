import { useApp } from '../context/AppContext';

export default function Footer() {
  const { sucursales, sucursalId, setSucursal, switchView } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-[#e8dbca] bg-white text-[#3f0a0b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#f4ece1] bg-[#fbf7f1] shadow-sm">
                <img src="/brand-mark.svg" alt="Logotipo de Librería Lisjuashde" className="h-full w-full object-contain p-0.5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold leading-tight">Librería Lisjuashde</h3>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9e2a2b]">Materiales · Impresiones · Útiles</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#6f1719]/75">
              Explora el catálogo, consulta disponibilidad por sucursal y solicita impresiones desde la tienda en línea.
            </p>
            <button onClick={() => switchView('prints')} className="inline-flex items-center gap-2 rounded-xl bg-[#9e2a2b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#871f21]">
              <i className="fa-solid fa-print" aria-hidden="true"></i>
              Servicio de impresiones
            </button>
          </div>

          <div className="md:col-span-8">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#3f0a0b]">
              <i className="fa-solid fa-location-dot text-[#9e2a2b]"></i> Sucursales y contacto
            </h4>
            {(!sucursales || sucursales.length === 0) ? (
              <p className="text-sm text-[#6f1719]/65">La información de las sucursales no está disponible por el momento.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sucursales.map((s) => {
                  const activa = s.id === sucursalId;
                  return (
                    <div
                      key={s.id}
                      className={`rounded-2xl border p-4 transition-all ${activa ? 'border-[#9e2a2b] bg-[#fdf3f3]' : 'border-[#f4ece1] bg-[#fbf7f1]/70'}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h5 className="flex items-center gap-2 text-sm font-bold text-[#3f0a0b]">
                          <i className="fa-solid fa-store text-[#9e2a2b]"></i> {s.nombre}
                        </h5>
                        {activa && (
                          <span className="rounded-full bg-[#edc978] px-2 py-0.5 text-[10px] font-bold uppercase text-[#3f0a0b]">Elegida</span>
                        )}
                      </div>
                      {s.direccion && (
                        <p className="mb-1 flex items-start gap-2 text-xs text-[#6f1719]/70">
                          <i className="fa-solid fa-map-pin mt-0.5 text-[#9e2a2b]"></i>
                          <span>{s.direccion}</span>
                        </p>
                      )}
                      {s.telefono && (
                        <p className="flex items-center gap-2 text-xs text-[#6f1719]/70">
                          <i className="fa-solid fa-phone text-[#9e2a2b]"></i>
                          <a href={`tel:${s.telefono}`} className="transition-colors hover:text-[#9e2a2b]">{s.telefono}</a>
                        </p>
                      )}
                      {!activa && (
                        <button
                          onClick={() => setSucursal(s.id)}
                          className="mt-3 text-xs font-semibold text-[#9e2a2b] transition-colors hover:text-[#6f1719]"
                        >
                          Consultar disponibilidad aquí →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-[#f4ece1] pt-6 text-center text-xs text-[#6f1719]/60">
          © {year} Librería Lisjuashde
        </div>
      </div>
    </footer>
  );
}
