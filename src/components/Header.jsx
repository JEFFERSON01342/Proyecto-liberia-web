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
      ? 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-white text-indigo-700 shadow-sm flex items-center space-x-2'
      : 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-indigo-100 hover:text-white flex items-center space-x-2';

  return (
    <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y nombre */}
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-xl shadow flex items-center justify-center w-10 h-10 overflow-hidden">
            <img src="img/logo.png" alt="Logotipo de Librería Lisjuashde" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Librería Lisjuashde</h1>
            <p className="text-xs text-indigo-200 hidden sm:block">Materiales, Impresiones y Útiles</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Selector de sucursal */}
          {sucursales && sucursales.length > 0 && (
            <div className="flex items-center gap-1.5 bg-indigo-700/60 border border-indigo-500/30 rounded-xl px-2.5 py-1.5">
              <i className="fa-solid fa-location-dot text-amber-300 text-sm"></i>
              <select
                value={sucursalId || ''}
                onChange={(e) => setSucursal(e.target.value || null)}
                title="Elige la sucursal para ver su disponibilidad"
                className="bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer max-w-[130px]"
              >
                <option value="" className="text-slate-800">Todas las sucursales</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id} className="text-slate-800">{s.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Navegación */}
          <div className="bg-indigo-700/60 p-1 rounded-xl flex space-x-1 border border-indigo-500/30">
            <button onClick={() => switchView('store')} className={tabClass('store')}>
              <i className="fa-solid fa-store"></i>
              <span className="hidden sm:inline">Tienda</span>
            </button>
            <button onClick={() => switchView('prints')} className={tabClass('prints')}>
              <i className="fa-solid fa-print"></i>
              <span className="hidden sm:inline">Impresiones</span>
            </button>
            <button onClick={() => switchView('access')} className={tabClass('access')}>
              <i className="fa-solid fa-user"></i>
              <span className="hidden sm:inline">Mi cuenta</span>
            </button>
          </div>

          {/* Estado de sesión */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {isAnonymous && (
              /* Sin sesión → botón de login llamativo */
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-3 py-1.5 rounded-lg shadow hover:bg-indigo-50 transition-all"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Iniciar sesión</span>
              </button>
            )}

            {isLoggedIn && (
              /* Sesión activa */
              <>
                <span className="text-indigo-100">
                  Hola, <span className="font-bold text-white">{firstName}</span>
                </span>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="bg-indigo-500/50 hover:bg-indigo-500 px-2 py-1.5 rounded-lg transition-all"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </>
            )}

            {isGuest && (
              /* Modo invitado */
              <>
                <span className="text-indigo-100">
                  Invitado: <span className="font-bold text-white">{firstName}</span>
                </span>
                <button
                  onClick={exitGuest}
                  title="Salir del modo invitado"
                  className="bg-indigo-500/50 hover:bg-indigo-500 px-2 py-1.5 rounded-lg transition-all"
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
              className="relative bg-indigo-500 hover:bg-indigo-400 text-white p-2.5 rounded-xl transition-all flex items-center justify-center"
            >
              <i className="fa-solid fa-cart-shopping text-lg"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
