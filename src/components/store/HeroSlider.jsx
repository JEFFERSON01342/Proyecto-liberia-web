import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

export default function HeroSlider({ scrollToProducts }) {
  const { products, switchView } = useApp();
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const startAuto = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => i + 1);
    }, 5000);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(timerRef.current);
  }, [startAuto]);

  const next = () => { setIndex((i) => i + 1); startAuto(); };
  const prev = () => { setIndex((i) => (i - 1 + products.length) % products.length); startAuto(); };

  const prod = products.length > 0 ? products[index % products.length] : null;

  return (
    <section aria-label="Presentación de la tienda" className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#9e2a2b] via-[#7d1d22] to-[#3f0a0b] text-[#fffdfa] shadow-xl">
      <div className="absolute inset-0 opacity-[0.11] bg-[radial-gradient(#fffdfa_1px,transparent_1px)] [background-size:22px_22px]"></div>
      <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10"></div>
      <div className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-white/10"></div>

      <div className="relative grid grid-cols-1 items-center gap-8 px-6 py-8 sm:px-10 md:grid-cols-2 md:gap-10 md:px-12 md:py-12">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4ece1]">
            <i className="fa-solid fa-book-open text-[#edc978]"></i>
            Librería · Papelería · Impresiones
          </span>
          <h2 className="max-w-xl font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Un espacio para aprender, crear y descubrir</h2>
          <p className="max-w-lg text-sm leading-relaxed text-[#f4ece1] sm:text-base">Encuentra libros, útiles y materiales para tus ideas. También puedes enviar tus documentos a imprimir y elegir dónde recogerlos.</p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button onClick={scrollToProducts} className="flex items-center gap-2 rounded-xl bg-[#edc978] px-5 py-3 font-bold text-[#3f0a0b] shadow-lg transition hover:bg-[#f4d99b]">
              <span>Ver Catálogo</span>
              <i className="fa-solid fa-arrow-down"></i>
            </button>
            <button onClick={() => switchView('prints')} className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20">
              <i className="fa-solid fa-print"></i>
              <span>Solicitar impresión</span>
            </button>
          </div>
        </div>

        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/20 bg-[#fbf7f1] p-4 text-[#3f0a0b] shadow-lg sm:min-h-72">
          <div className="relative flex h-full min-h-56 w-full items-center justify-center">
            {prod && (
              <div key={prod.id} className="flex w-full animate-fade flex-col items-center justify-center gap-4 px-6 sm:flex-row sm:gap-6">
                <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-sm sm:h-44 sm:w-44">
                  <img src={prod.image} alt={prod.name} className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_8px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-110" onError={(e) => { e.target.src = 'https://placehold.co/300x300/png?text=Util'; }} />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <span className="inline-block rounded-full bg-[#f7cdcd] px-2.5 py-1 text-xs font-bold uppercase text-[#6f1719]">{prod.category}</span>
                  <h3 className="line-clamp-2 font-serif text-xl font-bold sm:text-2xl">{prod.name}</h3>
                  <p className="line-clamp-2 text-xs text-[#6f1719]/75 sm:text-sm">{prod.desc}</p>
                  <div className="text-lg font-extrabold text-[#9e2a2b]">C${prod.price.toFixed(2)}</div>
                </div>
              </div>
            )}
            {!prod && (
              <div className="flex max-w-xs flex-col items-center gap-3 text-center">
                <img src="/brand-mark.svg" alt="" className="h-20 w-20" />
                <h3 className="font-serif text-xl font-bold">Explora nuestro catálogo</h3>
                <p className="text-sm text-[#6f1719]/75">Consulta las categorías y productos disponibles en la tienda.</p>
              </div>
            )}
          </div>
          {products.length > 1 && (
            <>
              <button onClick={prev} aria-label="Producto anterior" className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#6f1719] text-white shadow transition hover:bg-[#3f0a0b]"><i className="fa-solid fa-chevron-left"></i></button>
              <button onClick={next} aria-label="Siguiente producto" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#6f1719] text-white shadow transition hover:bg-[#3f0a0b]"><i className="fa-solid fa-chevron-right"></i></button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
