import { useEffect } from 'react';

/**
 * Lightbox minimalista: muestra una imagen grande sobre fondo oscuro.
 * Se cierra con clic en el fondo, botón ✕ o tecla Escape.
 * z-[60] para quedar por encima de otros modales (z-50).
 */
export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-600 hover:text-slate-900 transition z-10"
          aria-label="Cerrar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Imagen */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full flex items-center justify-center min-h-64">
          <img
            src={src}
            alt={alt}
            className="max-h-[70vh] max-w-full object-contain drop-shadow-lg"
            onError={(e) => { e.target.src = 'https://placehold.co/600x600/png?text=Producto'; }}
          />
        </div>

        {/* Nombre debajo */}
        {alt && (
          <p className="text-white text-center font-bold mt-4 text-base drop-shadow">{alt}</p>
        )}
      </div>
    </div>
  );
}
