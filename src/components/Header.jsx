import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    currentView, switchView,
    currentProfile, guestInfo,
    cartCount, setCartModalOpen,
    handleLogout, exitGuest,
    openLoginModal,
    sucursales, sucursalId, setSucursal,
  } = useApp();

  const isLoggedIn = !!currentProfile;
  const isGuest = !currentProfile && !!guestInfo;
  const isAnonymous = !currentProfile && !guestInfo;

  const displayName = currentProfile?.nombre_completo || guestInfo?.nombre || '';
  const firstName = displayName.split(' ')[0];

  const tabClass = (view) =>
    view === currentView
      ? 'whitespace-nowrap px-3 py-2 rounded-xl text-sm font-semibold transition-all bg-white text-[#7d1d22] shadow-sm flex items-center justify-center gap-2'
      : 'whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium transition-all text-[#6f1719] hover:bg-white/70 flex items-center justify-center gap-2';

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8dbca] bg-[#fbf7f1]/95 text-[#3f0a0b] shadow-sm backdrop-blur-md">
      <div className="bg-[#3f0a0b] text-[#fbf7f1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-9 flex items-center justify-between gap-3 text-xs">
          <span className="hidden sm:flex items-center gap-2 text-[#f4ece1]">
            <i className="fa-solid fa-book-open text-[#edc978]"></i>
            Una librería para aprender, crear y descubrir
          </span>
          {sucursales && sucursales.length > 0 && (
            <label className="ml-auto flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-[#edc978]"></i>
              <span className="hidden sm:inline">Disponibilidad en:</span>
              <select
                value={sucursalId || ''}
                onChange={(e) => setSucursal(e.target.value || null)}
                title="Elige la sucursal para ver su disponibilidad"
                aria-label="Sucursal para consultar disponibilidad"
                className="max-w-[155px] cursor-pointer rounded-md border border-white/20 bg-[#561011] px-2 py-1 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#edc978]"
              >
                <option value="" className="text-slate-800">Todas las sucursales</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id} className="text-slate-800">{s.nombre}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid min-h-[76px] grid-cols-[1fr_auto] gap-x-3 gap-y-2 py-3 lg:flex lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#f4ece1] bg-white shadow-sm">
            <img src="/brand-mark.svg" alt="Logotipo de Librería Lisjuashde" className="h-full w-full object-contain p-0.5" />
          </div>
          <div className="min-w-0">
            <h1 className="whitespace-nowrap font-serif text-lg font-bold leading-tight tracking-tight sm:text-xl">Librería Lisjuashde</h1>
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-[#9e2a2b] sm:block">Materiales · Impresiones · Útiles</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <nav aria-label="Navegación principal" className="hidden items-center gap-1 rounded-2xl border border-[#f4ece1] bg-[#f4ece1]/80 p-1 lg:flex">
            <button onClick={() => switchView('store')} className={tabClass('store')}>
              <i className="fa-solid fa-store" aria-hidden="true"></i><span>Tienda</span>
            </button>
            <button onClick={() => switchView('prints')} className={tabClass('prints')}>
              <i className="fa-solid fa-print" aria-hidden="true"></i><span>Impresiones</span>
            </button>
            <button onClick={() => switchView('access')} className={tabClass('access')}>
              <i className="fa-solid fa-user" aria-hidden="true"></i><span>Mi cuenta</span>
            </button>
          </nav>

          <div className="hidden items-center gap-2 text-xs sm:flex">
            {isAnonymous && (
              <button
                onClick={() => openLoginModal()}
                aria-label="Iniciar sesión"
                className="flex items-center gap-2 rounded-xl border border-[#e8dbca] bg-white px-3 py-2 font-bold text-[#6f1719] shadow-sm transition hover:bg-[#fdf3f3]"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                <span className="hidden xl:inline">Iniciar sesión</span>
              </button>
            )}

            {isLoggedIn && (
              <>
                <span className="text-[#6f1719]">
                  Hola, <span className="font-bold text-[#3f0a0b]">{firstName}</span>
                </span>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="rounded-xl bg-[#f4ece1] px-2.5 py-2 text-[#6f1719] transition hover:bg-[#f7cdcd]"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </>
            )}

            {isGuest && (
              <>
                <span className="text-[#6f1719]">
                  Invitado: <span className="font-bold text-[#3f0a0b]">{firstName}</span>
                </span>
                <button
                  onClick={exitGuest}
                  title="Salir del modo invitado"
                  className="rounded-xl bg-[#f4ece1] px-2.5 py-2 text-[#6f1719] transition hover:bg-[#f7cdcd]"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </>
            )}
          </div>

          {/* Carrito (solo en tienda) */}
          {currentView === 'store' && (
            <button
              onClick={() => setCartModalOpen(true)}
              aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} productos` : ''}`}
              className="relative flex items-center justify-center gap-2 rounded-xl bg-[#9e2a2b] px-3 py-2.5 text-white shadow-sm transition hover:bg-[#871f21]"
            >
              <i className="fa-solid fa-bag-shopping text-base"></i>
              <span className="hidden text-sm font-semibold sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#edc978] px-1 text-xs font-bold text-[#3f0a0b] shadow">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

        <nav aria-label="Navegación principal" className="col-span-2 flex items-center justify-between gap-1 rounded-2xl border border-[#f4ece1] bg-[#f4ece1]/80 p-1 lg:hidden">
          <button onClick={() => switchView('store')} className={`${tabClass('store')} flex-1`}><i className="fa-solid fa-store" aria-hidden="true"></i><span>Tienda</span></button>
          <button onClick={() => switchView('prints')} className={`${tabClass('prints')} flex-1`}><i className="fa-solid fa-print" aria-hidden="true"></i><span>Impresiones</span></button>
          <button onClick={() => switchView('access')} className={`${tabClass('access')} flex-1`}><i className="fa-solid fa-user" aria-hidden="true"></i><span>Mi cuenta</span></button>
        </nav>
      </div>
    </header>
  );
}
