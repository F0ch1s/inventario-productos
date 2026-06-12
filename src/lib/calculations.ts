import type { Product, Movement, InventoryStats } from '../types';

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
