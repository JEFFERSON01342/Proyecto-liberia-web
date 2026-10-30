import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const PRINT_PRICE = { bn: 1, color: 5 };

export default function PrintsView() {
  const { submitPrintOrder, currentProfile, guestInfo, openLoginModal } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState(null);
  const [colorMode, setColorMode] = useState('bn');
  const [copies, setCopies] = useState(1);
  const [paperSize, setPaperSize] = useState('Carta');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setName((prev) => prev || currentProfile?.nombre_completo || guestInfo?.nombre || '');
    setPhone((prev) => prev || currentProfile?.telefono || guestInfo?.telefono || '');
  }, [currentProfile, guestInfo]);

  const copiesNum = parseInt(copies, 10) || 1;
  const estimated = (colorMode === 'color' ? PRINT_PRICE.color : PRINT_PRICE.bn) * copiesNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Si no hay sesión ni modo invitado → pedir login antes de enviar
    if (!currentProfile && !guestInfo) {
      openLoginModal(null, null);
      return;
    }
    const ok = await submitPrintOrder({
      name: name.trim(),
      phone: phone.trim(),
      mode: colorMode,
      copies: copiesNum,
      paperSize,
      notes: notes.trim() || 'Sin notas',
      file,
    });
    if (ok) {
      setName(''); setPhone(''); setFile(null); setColorMode('bn');
      setCopies(1); setPaperSize('Carta'); setNotes('');
    }
  };

  const fileLabel = file ? `Archivo cargado: ${file.name}` : 'Haz clic para seleccionar o arrastra tu archivo aquí';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#9e2a2b] to-[#3f0a0b] p-8 text-white shadow-xl md:flex-row">
        <div className="space-y-2">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f4ece1]">Servicio de impresiones</span>
          <h2 className="font-serif text-3xl font-bold tracking-tight">Imprime tus documentos</h2>
          <p className="max-w-lg text-sm leading-relaxed text-[#f4ece1]">Envía tu documento o imagen, elige las opciones de impresión y coordina el retiro en el local.</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur">
          <i className="fa-solid fa-file-arrow-up mb-2 text-4xl text-[#edc978]"></i>
          <p className="text-xs font-medium">PDF, Word, JPG, PNG</p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#f4ece1] bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Nombre para retirar</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej. Carlos Mendoza" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30" />
              <p className="mt-1 text-xs text-slate-400">Con este nombre identificarás tu pedido al llegar.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Teléfono de contacto</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Ej. 555-0192" className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-4 py-3 text-sm text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Archivo a imprimir (documento o foto)</label>
            <div className="relative cursor-pointer rounded-2xl border-2 border-dashed border-[#e8dbca] bg-[#fbf7f1] p-6 text-center transition-all hover:border-[#9e2a2b] hover:bg-[#fdf3f3]">
              <input type="file" required onChange={(e) => setFile(e.target.files[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <div className="space-y-2 pointer-events-none">
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-[#9e2a2b]"></i>
                <h4 className="text-sm font-bold text-[#3f0a0b]">{fileLabel}</h4>
                <p className="text-xs text-slate-400">Soporta PDF, Word, Excel, PNG y JPG</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Tipo de impresión</label>
              <select value={colorMode} onChange={(e) => setColorMode(e.target.value)} className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-3 py-2.5 text-sm text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30">
                <option value="bn">Blanco y Negro (C$1 c/u)</option>
                <option value="color">Color (C$5 c/u)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Número de copias</label>
              <input type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} required className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-3 py-2.5 text-sm text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Tamaño de papel</label>
              <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-3 py-2.5 text-sm text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30">
                <option value="Carta">Carta (Standard)</option>
                <option value="Oficio">Oficio</option>
                <option value="A4">A4</option>
                <option value="Fotográfico 10x15">Fotográfico 10x15</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-[#6f1719]">Instrucciones especiales / notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" placeholder="Ej. Anillado espiral, imprimir solo de la página 1 a la 10..." className="w-full rounded-xl border border-[#e8dbca] bg-[#fbf7f1] px-3 py-3 text-sm text-[#3f0a0b] focus:outline-none focus:ring-2 focus:ring-[#9e2a2b]/30"></textarea>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#f7cdcd] bg-[#fdf3f3] px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-[#6f1719]">
              <i className="fa-solid fa-receipt text-[#9e2a2b]"></i>
              <span>Costo estimado ({copiesNum} {copiesNum === 1 ? 'copia' : 'copias'} · {colorMode === 'color' ? 'Color' : 'B/N'})</span>
            </div>
            <span className="text-2xl font-extrabold text-[#9e2a2b]">C${estimated.toFixed(2)}</span>
          </div>

          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9e2a2b] py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#871f21]">
            <i className="fa-solid fa-paper-plane"></i>
            <span>Enviar Documento a Imprimir</span>
          </button>
          <p className="text-center text-xs text-slate-400">El precio final puede variar según el número de páginas del documento. Pagas al retirar.</p>
        </form>
      </div>
    </div>
  );
}
