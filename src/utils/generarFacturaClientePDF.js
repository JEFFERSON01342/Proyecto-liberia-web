import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Colores de marca
const INDIGO = [79, 70, 229]; // indigo-600
const SLATE = [71, 85, 105]; // slate-600
const SLATE_DARK = [30, 41, 59]; // slate-800

function formatearFecha(fecha) {
  try {
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    return d.toLocaleString('es-NI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Genera y descarga una factura PDF para el cliente.
 * @param {Object} datos
 * @param {string} datos.numeroOrden
 * @param {string} datos.nombre
 * @param {string} [datos.email]
 * @param {string} [datos.telefono]
 * @param {Array<{name:string, quantity:number, price:number}>} datos.items
 * @param {number} datos.total
 * @param {string} [datos.metodo_pago]
 * @param {string} [datos.tipo_entrega]
 * @param {string} [datos.notas]
 * @param {Date|string} [datos.fecha]
 */
export function generarFacturaClientePDF({
  numeroOrden,
  nombre,
  email,
  telefono,
  items = [],
  total = 0,
  metodo_pago,
  tipo_entrega,
  notas,
  fecha,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  // ===== Encabezado =====
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageWidth, 90, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('LIBRERÍA LISJUASHDE', marginX, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Papelería · Útiles escolares · Impresiones', marginX, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FACTURA DE VENTA', pageWidth - marginX, 42, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Orden: ${numeroOrden || '—'}`, pageWidth - marginX, 60, { align: 'right' });

  // ===== Datos del cliente =====
  let y = 120;
  doc.setTextColor(...SLATE_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Datos del cliente', marginX, y);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SLATE);

  const infoIzq = [
    `Nombre: ${nombre || '—'}`,
    `Teléfono: ${telefono || '—'}`,
    `Correo: ${email || '—'}`,
  ];
  const infoDer = [
    `Fecha: ${formatearFecha(fecha || new Date())}`,
    `Método de pago: ${metodo_pago || '—'}`,
    `Entrega: ${tipo_entrega || '—'}`,
  ];

  infoIzq.forEach((t, i) => doc.text(t, marginX, y + i * 15));
  infoDer.forEach((t, i) => doc.text(t, pageWidth / 2 + 10, y + i * 15));

  y += infoIzq.length * 15 + 15;

  // ===== Tabla de productos =====
  const body = items.map((it) => [
    it.name,
    String(it.quantity),
    `C$${Number(it.price).toFixed(2)}`,
    `C$${(Number(it.price) * Number(it.quantity)).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'Cantidad', 'Precio unit.', 'Subtotal']],
    body,
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 10, cellPadding: 6, textColor: SLATE_DARK },
    headStyles: { fillColor: INDIGO, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] }, // slate-100
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 70 },
      2: { halign: 'right', cellWidth: 90 },
      3: { halign: 'right', cellWidth: 90 },
    },
  });

  // ===== Total =====
  let finalY = (doc.lastAutoTable?.finalY || y) + 20;

  doc.setFillColor(...INDIGO);
  doc.roundedRect(pageWidth - marginX - 220, finalY, 220, 34, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - marginX - 205, finalY + 22);
  doc.setFontSize(14);
  doc.text(`C$${Number(total).toFixed(2)}`, pageWidth - marginX - 12, finalY + 22, { align: 'right' });

  finalY += 55;

  // ===== Notas =====
  if (notas && notas.trim()) {
    doc.setTextColor(...SLATE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notas:', marginX, finalY);
    doc.setFont('helvetica', 'normal');
    const notasLineas = doc.splitTextToSize(notas.trim(), pageWidth - marginX * 2);
    doc.text(notasLineas, marginX, finalY + 14);
    finalY += 14 + notasLineas.length * 13 + 10;
  }

  // ===== Pie de página =====
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(marginX, pageHeight - 70, pageWidth - marginX, pageHeight - 70);
  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('¡Gracias por su compra!', pageWidth / 2, pageHeight - 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Librería Lisjuashde · Orden ${numeroOrden || '—'} · Documento generado automáticamente`,
    pageWidth / 2,
    pageHeight - 36,
    { align: 'center' }
  );
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.text(
    'Comprobante simulado con fines de demostración. No tiene validez fiscal.',
    pageWidth / 2,
    pageHeight - 24,
    { align: 'center' }
  );

  // ===== Descargar =====
  const nombreArchivo = `Factura_${(numeroOrden || 'pedido').toString().replace(/[^\w-]/g, '')}.pdf`;
  doc.save(nombreArchivo);
}

export default generarFacturaClientePDF;
