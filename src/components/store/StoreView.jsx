import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import HeroSlider from './HeroSlider';
import ProductGrid from './ProductGrid';

// Banner de promociones activas (se oculta si no hay descuentos)
function PromoBanner() {
  const { descuentos } = useApp();
  if (!descuentos || descuentos.length === 0) return null;

  const etiqueta = (d) => {
    if (d.tipo === 'porcentaje') return `${Number(d.valor)}% OFF`;
    if (d.tipo === 'monto') return `C$${Number(d.valor)} OFF`;
    return '';
  };

  // Duplicamos los descuentos para un ticker continuo
  const items = [...descuentos, ...descuentos];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-fuchsia-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <span className="flex items-center gap-2 font-extrabold text-sm whitespace-nowrap flex-shrink-0">
          <i className="fa-solid fa-tags text-amber-300"></i>
          <span>¡Promociones!</span>
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-8 animate-[promo-marquee_28s_linear_infinite] whitespace-nowrap will-change-transform">
            {items.map((d, i) => (
              <span key={`${d.id}-${i}`} className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex items-center justify-center bg-amber-300 text-indigo-900 font-extrabold text-xs px-2 py-0.5 rounded-full">
                  {etiqueta(d)}
                </span>
                <span className="text-white/95">
                  {d.banner_texto || d.nombre}
                </span>
                {d.temporada ? (
                  <span className="text-white/70 text-xs italic">· {d.temporada}</span>
                ) : null}
                <i className="fa-solid fa-circle text-[4px] text-white/40 ml-2"></i>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes promo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function StoreView() {
  const { currentCategory, setCurrentCategory, categories, sucursalActual } = useApp();
  const [search, setSearch] = useState('');
  const anchorRef = useRef(null);

  const scrollToProducts = () => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <PromoBanner />
      <div className="pt-6">
        <HeroSlider scrollToProducts={scrollToProducts} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div ref={anchorRef} className="space-y-6 pt-4">
          {sucursalActual ? (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl px-4 py-2.5 text-sm">
              <i className="fa-solid fa-location-dot text-indigo-500"></i>
              <span>Mostrando disponibilidad de la sucursal <span className="font-bold">{sucursalActual.nombre}</span>. Cambiá de sucursal en la parte superior.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-sm">
              <i className="fa-solid fa-circle-info text-amber-500"></i>
              <span>Elegí una sucursal arriba para ver la disponibilidad real de cada producto en esa tienda.</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${currentCategory === cat ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[280px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i className="fa-solid fa-magnifying-glass text-sm"></i>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto, materia..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>

          <ProductGrid search={search} />
        </div>
      </div>
    </div>
  );
}
