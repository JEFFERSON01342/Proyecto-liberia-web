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
    <div className="relative overflow-hidden bg-[#6f1719] text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 py-2.5">
        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-extrabold">
          <i className="fa-solid fa-tags text-[#edc978]"></i>
          <span>¡Promociones!</span>
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max gap-8 whitespace-nowrap motion-safe:animate-[promo-marquee_28s_linear_infinite]">
            {items.map((d, i) => (
              <span key={`${d.id}-${i}`} className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex items-center justify-center rounded-full bg-[#edc978] px-2 py-0.5 text-xs font-extrabold text-[#3f0a0b]">
                  {etiqueta(d)}
                </span>
                <span className="text-white">
                  {d.banner_texto || d.nombre}
                </span>
                {d.temporada ? (
                  <span className="text-white/75 text-xs italic">· {d.temporada}</span>
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
  const { currentCategory, setCurrentCategory, categories, sucursalActual, switchView } = useApp();
  const [search, setSearch] = useState('');
  const anchorRef = useRef(null);

  const scrollToProducts = () => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const featuredCategories = categories.filter((category) => category !== 'Todos').slice(0, 4);
  const categoryIcon = (category) => {
    const name = category.toLowerCase();
    if (name.includes('libro') || name.includes('lect')) return 'fa-book-open';
    if (name.includes('papel') || name.includes('arte') || name.includes('escrit')) return 'fa-pen-nib';
    if (name.includes('escolar') || name.includes('útil') || name.includes('util')) return 'fa-graduation-cap';
    if (name.includes('oficina') || name.includes('organiz')) return 'fa-briefcase';
    return 'fa-layer-group';
  };

  return (
    <div className="space-y-12 pb-12">
      <PromoBanner />
      <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
        <HeroSlider scrollToProducts={scrollToProducts} />
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {featuredCategories.length > 0 && (
          <section aria-labelledby="featured-categories-title">
            <div className="mb-5 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9e2a2b]">Explora la tienda</span>
              <h2 id="featured-categories-title" className="mt-1 font-serif text-2xl font-bold text-[#3f0a0b] sm:text-3xl">Encuentra tu próxima idea</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {featuredCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    setCurrentCategory(category);
                    setSearch('');
                    scrollToProducts();
                  }}
                  className={`group rounded-2xl border p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5 ${currentCategory === category ? 'border-[#9e2a2b] bg-[#fdf3f3]' : 'border-[#f4ece1] bg-white hover:border-[#e8dbca]'}`}
                >
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf3f3] text-xl text-[#9e2a2b] transition group-hover:bg-[#9e2a2b] group-hover:text-white">
                    <i className={`fa-solid ${categoryIcon(category)}`} aria-hidden="true"></i>
                  </span>
                  <span className="block font-bold text-sm text-[#3f0a0b]">{category}</span>
                  <span className="mt-1 block text-xs text-[#6f1719]/70">Ver productos</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section ref={anchorRef} aria-labelledby="catalog-title" className="scroll-mt-36 space-y-5">
          {sucursalActual ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#f7cdcd] bg-[#fdf3f3] px-4 py-2.5 text-sm text-[#6f1719]">
              <i className="fa-solid fa-location-dot text-[#9e2a2b]"></i>
              <span>Disponibilidad de <span className="font-bold">{sucursalActual.nombre}</span>. Cambia la sucursal desde la barra superior.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-[#edc978]/60 bg-[#fff9e9] px-4 py-2.5 text-sm text-[#6f4a12]">
              <i className="fa-solid fa-circle-info text-[#a66a13]"></i>
              <span>Elige una sucursal en la parte superior para consultar la disponibilidad de cada producto.</span>
            </div>
          )}
          <div className="flex flex-col gap-4 border-b border-[#e8dbca] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#9e2a2b]">Catálogo</span>
              <h2 id="catalog-title" className="mt-1 font-serif text-2xl font-bold text-[#3f0a0b] sm:text-3xl">Productos para cada día</h2>
              <p className="mt-1 text-sm text-[#6f1719]/70">Explora las categorías y encuentra lo que necesitas.</p>
            </div>

          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  aria-pressed={currentCategory === cat}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${currentCategory === cat ? 'bg-[#9e2a2b] text-white shadow-sm' : 'border border-[#e8dbca] bg-white text-[#6f1719] hover:border-[#9e2a2b] hover:bg-[#fdf3f3]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full xl:max-w-sm">
              <label htmlFor="catalog-search" className="sr-only">Buscar en el catálogo</label>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#9e2a2b]">
                <i className="fa-solid fa-magnifying-glass text-sm"></i>
              </span>
              <input
                id="catalog-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto o materia..."
                className="w-full rounded-full border border-[#e8dbca] bg-white py-3 pl-11 pr-10 text-sm text-[#3f0a0b] shadow-sm transition placeholder:text-[#8f7774] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8f7774] transition hover:text-[#6f1719]"
                  title="Limpiar búsqueda"
                  aria-label="Limpiar búsqueda"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>

          <ProductGrid search={search} />
        </section>

        <section aria-label="Servicios de la librería" className="grid gap-4 md:grid-cols-3">
          <button onClick={() => switchView('prints')} className="flex items-center gap-4 rounded-2xl border border-[#f4ece1] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fdf3f3] text-xl text-[#9e2a2b]"><i className="fa-solid fa-print" aria-hidden="true"></i></span>
            <span><span className="block font-bold text-[#3f0a0b]">Servicio de impresiones</span><span className="mt-1 block text-xs text-[#6f1719]/70">Envía tu archivo y consulta el costo estimado.</span></span>
          </button>
          <div className="flex items-center gap-4 rounded-2xl border border-[#f4ece1] bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff9e9] text-xl text-[#a66a13]"><i className="fa-solid fa-location-dot" aria-hidden="true"></i></span>
            <span><span className="block font-bold text-[#3f0a0b]">Consulta por sucursal</span><span className="mt-1 block text-xs text-[#6f1719]/70">{sucursalActual ? `Viendo ${sucursalActual.nombre}.` : 'Elige una sucursal para consultar existencias.'}</span></span>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#f4ece1] bg-white p-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fdf3f3] text-xl text-[#9e2a2b]"><i className="fa-solid fa-tags" aria-hidden="true"></i></span>
            <span><span className="block font-bold text-[#3f0a0b]">Promociones</span><span className="mt-1 block text-xs text-[#6f1719]/70">Los descuentos activos se identifican junto al producto en el catálogo.</span></span>
          </div>
        </section>
      </div>
    </div>
  );
}
