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
    <section className="w-full bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-900 text-white overflow-hidden shadow-2xl relative" style={{ minHeight: '340px' }}>
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="bg-indigo-500/30 text-indigo-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider border border-indigo-400/30">Vuelta a Clases 2026</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Todo lo que necesitas para aprender y crear</h2>
          <p className="text-indigo-200 text-sm md:text-base">Encuentra los mejores libros, cuadernos, materiales y ahora envía tus documentos a imprimir directamente.</p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button onClick={scrollToProducts} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2">
              <span>Ver Catálogo</span>
              <i className="fa-solid fa-arrow-down"></i>
            </button>
            <button onClick={() => switchView('prints')} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl backdrop-blur border border-white/20 transition-all flex items-center space-x-2">
              <i className="fa-solid fa-print"></i>
              <span>Centro de Impresiones</span>
            </button>
          </div>
        </div>

        <div className="relative h-64 md:h-80 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm p-4 overflow-hidden">
          <div className="w-full h-full relative flex items-center justify-center">
            {prod && (
              <div key={prod.id} className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 w-full h-full px-4 animate-fade">
                <div className="w-36 h-36 md:w-44 md:h-44 flex items-center justify-center drop-shadow-2xl">
                  <img src={prod.image} alt={prod.name} className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_8px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-110" onError={(e) => { e.target.src = 'https://placehold.co/300x300/png?text=Util'; }} />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <span className="bg-amber-400 text-slate-900 font-bold text-xs px-2.5 py-1 rounded-full uppercase">{prod.category}</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white">{prod.name}</h3>
                  <p className="text-indigo-200 text-xs md:text-sm line-clamp-2">{prod.desc}</p>
                  <div className="text-lg font-extrabold text-amber-300">C${prod.price.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-all"><i className="fa-solid fa-chevron-left"></i></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-all"><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </section>
  );
}
