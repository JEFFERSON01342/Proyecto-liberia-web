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
        <div className="relative flex min-h-64 items-center justify-center bg-[#fbf7f1] p-8">
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
              <span className="rounded-full border border-[#f7cdcd] bg-[#fdf3f3] px-2.5 py-1 text-xs font-semibold text-[#6f1719]">{product.category}</span>
              {product.materia && <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">{product.materia}</span>}
            </div>
            <h3 className="font-extrabold text-slate-900 text-xl leading-snug">{product.name}</h3>
            {product.desc && <p className="text-sm text-slate-500 mt-1">{product.desc}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Precio</span>
              <span className="text-2xl font-extrabold text-[#9e2a2b]">C${product.price.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { onAdd(product.id); onClose(); }}
              disabled={outOfStock}
              className="flex items-center gap-2 rounded-xl bg-[#9e2a2b] px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-[#871f21] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
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
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ece1]">
          <i className="fa-solid fa-magnifying-glass text-3xl text-[#9e2a2b]/60"></i>
        </div>
        <p className="text-lg font-semibold text-[#3f0a0b]">Sin resultados</p>
        <p className="mt-1 text-sm text-slate-500">
          {searchVal
            ? <>No encontramos productos para "<span className="font-medium text-[#9e2a2b]">{searchVal}</span>"</>
            : 'No hay productos disponibles en esta categoría.'}
        </p>
        {searchVal && (
          <p className="mt-2 text-xs text-slate-500">Intenta con otro nombre o materia</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Contador de resultados */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-[#6f1719]/65">
          {searchVal || currentCategory !== 'Todos'
            ? <><span className="font-semibold text-[#3f0a0b]">{filtered.length}</span> {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}{searchVal ? <> · "<span className="text-[#9e2a2b]">{searchVal}</span>"</> : ''}</>
            : <><span className="font-semibold text-[#3f0a0b]">{filtered.length}</span> productos disponibles</>
          }
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => {
          const outOfStock = p.stock <= 0;
          const lowStock = p.stock > 0 && p.stock <= 5;
          const promo = getDescuentoParaProducto ? getDescuentoParaProducto(p.id, p.category_id, p.price) : null;
          return (
            <div key={p.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#f4ece1] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              {/* Imagen clicable */}
              <div
                className="group relative flex h-48 cursor-zoom-in items-center justify-center bg-[#fbf7f1] p-6"
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#9e2a2b] shadow backdrop-blur-sm">
                    <i className="fa-solid fa-magnifying-glass-plus text-base"></i>
                  </span>
                </div>
              </div>

              {/* Datos del producto */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="mb-2 inline-flex rounded-full border border-[#f7cdcd] bg-[#fdf3f3] px-2.5 py-1 text-xs font-semibold text-[#6f1719]">{p.category}</span>
                  {p.materia && <span className="inline-flex mb-2 ml-1 bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">{p.materia}</span>}
                  <h4 className="text-base font-bold leading-snug text-[#3f0a0b]">{p.name}</h4>
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
                      <span className="text-lg font-extrabold text-[#9e2a2b]">C${p.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={outOfStock}
                    className="flex items-center justify-center gap-1 rounded-xl bg-[#9e2a2b] p-2.5 text-sm font-medium text-white shadow transition-all hover:bg-[#871f21] active:scale-90 disabled:cursor-not-allowed disabled:bg-slate-300"
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
