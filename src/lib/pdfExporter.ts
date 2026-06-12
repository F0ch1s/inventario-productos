import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Product, Movement } from '../types';
import { calculateStock } from './calculations';
import { addReportFooter, addReportHeader, addReportMeta } from './reportTemplate';
import { $settings, formatMoney } from '../stores/settingsStore';

export function exportInventoryToPDF(products: Product[], movements: Movement[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const settings = $settings.get();
  const title = 'Reporte de Inventario';
  const date = new Date().toLocaleString();
  const totalValue = products.reduce((acc, p) => acc + calculateStock(p.id, movements) * p.cost, 0);

  addReportHeader(doc, title, `${settings.companyName} · Inventario, stock y valoración actual`);
  addReportMeta(doc, date);

  const summaryY = 92;
  const summaryCards = [
    { label: 'Productos', value: String(products.length) },
    { label: 'Movimientos', value: String(movements.length) },
    { label: 'Valor total', value: formatMoney(totalValue, settings.currency) },
  ];

  summaryCards.forEach((card, index) => {
    const x = 40 + index * 175;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, summaryY, 160, 54, 10, 10, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 16, summaryY + 18);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(card.value, x + 16, summaryY + 38);
  });

  const head = [['Código', 'Producto', 'Categoría', 'Sucursal', 'Unidad', 'Stock', 'Costo', 'Valor Total']];

  const body = products.map(p => {
    const stock = calculateStock(p.id, movements);
    const valor = stock * p.cost;
    return [p.code || '', p.name || '', p.category || '-', p.branch || '', p.unit || '', String(stock), formatMoney(p.cost, settings.currency), formatMoney(valor, settings.currency)];
  });

  (doc as any).autoTable({
    startY: 164,
    head: head,
    body: body,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 210 },
      2: { cellWidth: 70 },
      3: { halign: 'right', cellWidth: 56 },
      4: { halign: 'right', cellWidth: 70 },
      5: { halign: 'right', cellWidth: 82 },
    },
    margin: { top: 164, left: 40, right: 40, bottom: 44 },
    didDrawPage: (data: { pageNumber: number }) => {
      addReportFooter(doc, data.pageNumber, doc.getNumberOfPages());
    },
  });

  doc.save(`Reporte_${new Date().toISOString().slice(0,10)}.pdf`);
}

export default exportInventoryToPDF;
