import jsPDF from 'jspdf';

export function addReportHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 72, 'F');

  doc.setFillColor(59, 130, 246);
  doc.rect(0, 72, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(title, 40, 32);

  if (subtitle) {
    doc.setFontSize(10);
    doc.text(subtitle, 40, 52);
  }

  doc.setTextColor(0, 0, 0);
}

export function addReportMeta(doc: jsPDF, generatedAt: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generado: ${generatedAt}`, pageWidth - 40, 52, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

export function addReportFooter(doc: jsPDF, pageNumber: number, pageCount: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(226, 232, 240);
  doc.line(40, pageHeight - 30, pageWidth - 40, pageHeight - 30);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Página ${pageNumber} de ${pageCount}`, pageWidth - 40, pageHeight - 16, { align: 'right' });
  doc.text('Reporte generado automáticamente', 40, pageHeight - 16);
  doc.setTextColor(0, 0, 0);
}
