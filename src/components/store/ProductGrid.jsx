import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

// ── Lightbox modal ─────────────────────────────────────────────────────────────
function ImageModal({ product, onClose, onAdd }) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!product) return null;
  const outOfStock = product.stock <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen grande */}
        <div className="relative bg-slate-50 flex items-center justify-center p-8 min-h-64">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-72 max-w-full object-contain drop-shadow-lg"
            onError={(e) => { e.target.src = 'https://placehold.co/600x600/png?text=Util'; }}
          />
          {/* Badge stock */}
          {outOfStock && (
            <span className="absolute top-4 left-4 bg-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full font-bold uppercase">Agotado</span>
          )}
          {!outOfStock && product.stock <= 5 && (
            <span className="absolute top-4 left-4 bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold uppercase">Últimas {product.stock}</span>
          )}
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow text-slate-500 hover:text-slate-800 transition"
            aria-label="Cerrar"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-100">{product.category}</span>
              {product.materia && <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">{product.materia}</span>}
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl leading-snug">{product.name}</h3>
            {product.desc && <p className="text-sm text-slate-500 mt-1">{product.desc}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Precio</span>
              <span className="text-2xl font-extrabold text-indigo-600">C${product.price.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { onAdd(product.id); onClose(); }}
              disabled={outOfStock}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 text-sm font-bold active:scale-95"
            >
              <i className="fa-solid fa-cart-plus"></i>
              {outOfStock ? 'Agotado' : 'Reservar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Grid principal ─────────────────────────────────────────────────────────────
export default function ProductGrid({ search }) {
  const { products, currentCategory, addToCart, getDescuentoParaProducto } = useApp();
  const [imageModal, setImageModal] = useState(null); // producto seleccionado

  const searchVal = (search || '').toLowerCase();
  const filtered = products.filter((p) => {
    const matchesCat = currentCategory === 'Todos' || p.category === currentCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchVal) ||
      p.category.toLowerCase().includes(searchVal) ||
      (p.materia || '').toLowerCase().includes(searchVal) ||
      (p.desc || '').toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-3xl"></i>
        </div>
        <p className="text-slate-700 font-semibold text-lg">Sin resultados</p>
        <p className="text-slate-400 text-sm mt-1">
          {searchVal
            ? <>No encontramos productos para "<span className="text-indigo-600 font-medium">{searchVal}</span>"</>
            : 'No hay productos disponibles en esta categoría.'}
        </p>
        {searchVal && (
          <p className="text-slate-400 text-xs mt-2">Intenta con otro nombre o materia</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Contador de resultados */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-500">
          {searchVal || currentCategory !== 'Todos'
            ? <><span className="font-semibold text-slate-700">{filtered.length}</span> {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}{searchVal ? <> · "<span className="text-indigo-600">{searchVal}</span>"</> : ''}</>
            : <><span className="font-semibold text-slate-700">{filtered.length}</span> productos disponibles</>
          }
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => {
          const outOfStock = p.stock <= 0;
          const lowStock = p.stock > 0 && p.stock <= 5;
          const promo = getDescuentoParaProducto ? getDescuentoParaProducto(p.id, p.category_id, p.price) : null;
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              {/* Imagen clicable */}
              <div
                className="relative p-6 bg-slate-50/50 flex items-center justify-center h-48 group cursor-zoom-in"
                onClick={() => setImageModal(p)}
                title="Clic para ampliar imagen"
              >
                {outOfStock && <span className="absolute top-3 left-3 bg-rose-100 text-rose-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Agotado</span>}
                {lowStock && <span className="absolute top-3 left-3 bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Últimas {p.stock}</span>}
                {/* Badge de descuento */}
                {promo && (
                  <span className="absolute top-3 right-3 z-10 bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-full font-extrabold shadow-md animate-pulse">
                    {promo.label}
                  </span>
                )}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-36 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x300/png?text=Util'; }}
                />
                {/* Lupa en hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white/80 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow text-indigo-600">
                    <i className="fa-solid fa-magnifying-glass-plus text-base"></i>
                  </span>
                </div>
              </div>

              {/* Datos del producto */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="inline-flex mb-2 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-100">{p.category}</span>
                  {p.materia && <span className="inline-flex mb-2 ml-1 bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">{p.materia}</span>}
                  <h4 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-400 block">Precio</span>
                    {promo ? (
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-lg font-extrabold text-rose-600">C${promo.precioFinal.toFixed(2)}</span>
                        <span className="text-xs text-slate-400 line-through">C${p.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-extrabold text-indigo-600">C${p.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={outOfStock}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow transition-all flex items-center justify-center space-x-1 text-sm font-medium active:scale-90"
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                    <span className="text-xs">{outOfStock ? 'Agotado' : 'Reservar'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {imageModal && (
        <ImageModal
          product={imageModal}
          onClose={() => setImageModal(null)}
          onAdd={addToCart}
        />
      )}
    </>
  );
}
