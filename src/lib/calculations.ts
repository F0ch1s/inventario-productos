import type { Product, Movement, InventoryStats, Unit } from '../types';

/**
 * Units that represent discrete, indivisible items (cannot have a fractional quantity).
 * 'Yardas' is excluded because fabric length is legitimately fractional (e.g. 14.5 yardas).
 */
export function isDiscreteUnit(unit: Unit): boolean {
  return unit === 'Cajas' || unit === 'Unidades';
}

/**
 * Coerces an arbitrary string (e.g. from an Excel import) into a valid Unit,
 * falling back to 'Cajas' instead of letting unknown values flow into calculations.
 */
export function sanitizeUnit(value: unknown): Unit {
  return value === 'Yardas' || value === 'Unidades' ? value : 'Cajas';
}

/**
 * Validates a quantity against the rules for its unit:
 * - must be a finite, positive number
 * - must be a whole number when the unit is discrete (Cajas/Unidades)
 */
export function validateQuantity(quantity: number, unit: Unit): { valid: boolean; error?: string } {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { valid: false, error: 'La cantidad debe ser un número mayor a 0' };
  }
  if (isDiscreteUnit(unit) && !Number.isInteger(quantity)) {
    return { valid: false, error: `La unidad "${unit}" no admite decimales. Ingresa un número entero` };
  }
  return { valid: true };
}

/**
 * Formats a quantity for display, rounding discrete units defensively
 * in case legacy/imported data contains fractional values.
 */
export function formatQuantity(quantity: number, unit: Unit): string {
  const value = isDiscreteUnit(unit) ? Math.round(quantity) : quantity;
  return value.toLocaleString('es-PE', { maximumFractionDigits: isDiscreteUnit(unit) ? 0 : 2 });
}

/**
 * Calculate stock for a specific product based on movements
 */
export function calculateStock(productId: string, movements: Movement[]): number {
  return movements
    .filter(m => m.productId === productId)
    .reduce((acc, m) => (m.type === 'IN' ? acc + m.quantity : acc - m.quantity), 0);
}

/**
 * Filter products by search term (searches in description, code, and color)
 */
export function filterProducts(products: Product[], searchTerm: string): Product[] {
  const term = searchTerm.toLowerCase();
  return products.filter(
    p =>
      p.description.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      (p.category?.toLowerCase().includes(term) ?? false) ||
      (p.material?.toLowerCase().includes(term) ?? false) ||
      p.branch.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term)
  );
}

/**
 * Calculate overall inventory statistics
 */
export function calculateStats(products: Product[], movements: Movement[]): InventoryStats {
  const totalValue = products.reduce(
    (acc, p) => acc + calculateStock(p.id, movements) * p.cost,
    0
  );

  const productSales = products.map(p => {
    const sales = movements
      .filter(m => m.productId === p.id && m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);
    return { name: p.description, sales, code: p.code };
  });

  const sorted = [...productSales].sort((a, b) => b.sales - a.sales);
  const mostSold = sorted.length > 0 ? sorted[0] : null;
  const leastSold = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  return {
    totalItems: products.length,
    totalValue,
    totalMovements: movements.length,
    mostSold,
    leastSold,
  };
}

/**
 * Get products with critical stock (below threshold)
 */
export function getCriticalProducts(
  products: Product[],
  movements: Movement[],
  threshold: number = 3
): Product[] {
  return products.filter(p => calculateStock(p.id, movements) < threshold);
}

/**
 * Get sorted product sales data for reports
 */
export function getProductSalesRanking(
  products: Product[],
  movements: Movement[],
  order: 'asc' | 'desc' = 'desc',
  limit: number = 5
) {
  return products
    .map(p => ({
      ...p,
      sales: movements
        .filter(m => m.productId === p.id && m.type === 'OUT')
        .reduce((acc, m) => acc + m.quantity, 0),
    }))
    .sort((a, b) => (order === 'desc' ? b.sales - a.sales : a.sales - b.sales))
    .slice(0, limit);
}

/**
 * Calculate total cost of entries
 */
export function getTotalEntryCost(movements: Movement[]): number {
  return movements
    .filter(m => m.type === 'IN')
    .reduce((acc, m) => acc + m.quantity * m.cost, 0);
}

/**
 * Calculate total cost of exits
 */
export function getTotalExitCost(movements: Movement[]): number {
  return movements
    .filter(m => m.type === 'OUT')
    .reduce((acc, m) => acc + m.quantity * m.cost, 0);
}
