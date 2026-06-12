import * as XLSX from 'xlsx';
import type { Product, Movement } from '../types';
import { calculateStock, getProductSalesRanking, getTotalEntryCost, getTotalExitCost } from './calculations';
import { $settings, formatMoney } from '../stores/settingsStore';

/**
 * Import products from an Excel file
 */
export function parseExcelFile(binaryString: string): Product[] {
  const wb = XLSX.read(binaryString, { type: 'binary' });
  const wsname = wb.SheetNames[0];
  const ws = wb.Sheets[wsname];
  const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

  return data
    .map(
      (item): Product => ({
        id: crypto.randomUUID(),
        code: String(item.Codigo || item.CODE || ''),
        name: String(item.Producto || item.PRODUCTO || item.Nombre || ''),
        description: String(item.Descripcion || item.DESCRIPTION || ''),
        unit: String(item.Unidad || item.UNIT || 'Cajas'),
        cost: parseFloat(String(item.Costo || item.COST)) || 0,
      })
    )
    .filter(p => p.code && p.description);
}

/**
 * Export inventory data to Excel file
 */
export function exportInventoryToExcel(products: Product[], movements: Movement[]) {
  const workbook = XLSX.utils.book_new();
  const generatedAt = new Date();
  const dateLabel = generatedAt.toLocaleString();
  const fileDate = generatedAt.toISOString().slice(0, 10);
  const settings = $settings.get();

  const inventoryRows = products.map(p => {
    const stock = calculateStock(p.id, movements);
    return {
      Codigo: p.code,
      Producto: p.name,
      Categoria: p.category || '-',
      Sucursal: p.branch,
      Descripcion: p.description,
      Unidad: p.unit,
      CostoUnitario: p.cost,
      StockActual: stock,
      ValorTotal: stock * p.cost,
      Moneda: settings.currency,
    };
  });

  const movementsRows = movements
    .map(m => {
      const product = products.find(p => p.id === m.productId);
      const subtotal = m.quantity * m.cost;
      return {
        Fecha: m.date,
        Tipo: m.type === 'IN' ? 'Entrada' : 'Salida',
        Codigo: product?.code ?? '',
        Producto: product?.name ?? '',
        Descripcion: product?.description ?? '',
        Cantidad: m.quantity,
        CostoUnitario: m.cost,
        Subtotal: subtotal,
        Notas: m.notes ?? '',
      };
    })
    .sort((a, b) => String(a.Fecha).localeCompare(String(b.Fecha)));

  const rotationRows = getProductSalesRanking(products, movements, 'desc', products.length).map((p, index) => ({
    Posicion: index + 1,
    Codigo: p.code,
    Producto: p.name,
    Descripcion: p.description,
    Unidad: p.unit,
    Ventas: p.sales,
    StockActual: calculateStock(p.id, movements),
  }));

  const summaryRows = [
    { Indicador: 'Fecha de generación', Valor: dateLabel },
    { Indicador: 'Empresa', Valor: settings.companyName },
    { Indicador: 'Moneda', Valor: settings.currency },
    { Indicador: 'Total de productos', Valor: products.length },
    { Indicador: 'Total de movimientos', Valor: movements.length },
    { Indicador: 'Costo total de entradas', Valor: formatMoney(getTotalEntryCost(movements), settings.currency) },
    { Indicador: 'Costo total de salidas', Valor: formatMoney(getTotalExitCost(movements), settings.currency) },
    {
      Indicador: 'Valor actual del inventario',
      Valor: formatMoney(products.reduce((acc, p) => acc + calculateStock(p.id, movements) * p.cost, 0), settings.currency),
    },
  ];

  const inventorySheet = XLSX.utils.json_to_sheet(inventoryRows);
  const movementsSheet = XLSX.utils.json_to_sheet(movementsRows);
  const rotationSheet = XLSX.utils.json_to_sheet(rotationRows);
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);

  inventorySheet['!cols'] = [
    { wch: 16 },
    { wch: 34 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  movementsSheet['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 30 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
  ];
  rotationSheet['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 32 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
  ];
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 24 }];

  inventorySheet['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(inventorySheet['!ref'] as string)) };
  movementsSheet['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(movementsSheet['!ref'] as string)) };
  rotationSheet['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(rotationSheet['!ref'] as string)) };
  summarySheet['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(summarySheet['!ref'] as string)) };

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventario');
  XLSX.utils.book_append_sheet(workbook, movementsSheet, 'Movimientos');
  XLSX.utils.book_append_sheet(workbook, rotationSheet, 'Rotacion');

  XLSX.writeFile(workbook, `Reportes_${fileDate}.xlsx`);
}
