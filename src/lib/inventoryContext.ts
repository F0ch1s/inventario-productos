import type { Product, Movement } from '../types';
import { calculateStock, getProductSalesRanking, getTotalEntryCost, getTotalExitCost } from './calculations';
import { $settings, formatMoney } from '../stores/settingsStore';

/**
 * Builds a comprehensive system prompt with real-time inventory data.
 * This gives the AI full context to answer strategic questions.
 */
export function buildSystemPrompt(products: Product[], movements: Movement[]): string {
  const settings = $settings.get();
  const currency = settings.currency;

  // --- Product summary with stock levels ---
  const productLines = products.map(p => {
    const stock = calculateStock(p.id, movements);
    const totalValue = stock * p.cost;
    const totalSales = movements
      .filter(m => m.productId === p.id && m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);
    const totalEntries = movements
      .filter(m => m.productId === p.id && m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);
    return `- ${p.code} | ${p.description} | Cat: ${p.category} | Mat: ${p.material} | Stock: ${stock} ${p.unit} | Costo: ${formatMoney(p.cost, currency)} | Valor en almacén: ${formatMoney(totalValue, currency)} | Entradas: ${totalEntries} | Salidas: ${totalSales}`;
  }).join('\n');

  // --- Category breakdown ---
  const categoryMap = new Map<string, { count: number; totalValue: number; totalSales: number }>();
  products.forEach(p => {
    const stock = calculateStock(p.id, movements);
    const sales = movements
      .filter(m => m.productId === p.id && m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);
    const existing = categoryMap.get(p.category) || { count: 0, totalValue: 0, totalSales: 0 };
    categoryMap.set(p.category, {
      count: existing.count + 1,
      totalValue: existing.totalValue + (stock * p.cost),
      totalSales: existing.totalSales + sales,
    });
  });

  const categoryLines = Array.from(categoryMap.entries())
    .map(([cat, data]) => `- ${cat}: ${data.count} productos, Valor: ${formatMoney(data.totalValue, currency)}, Ventas totales: ${data.totalSales} unidades`)
    .join('\n');

  // --- Top sellers and low sellers ---
  const topSellers = getProductSalesRanking(products, movements, 'desc', 5);
  const lowSellers = getProductSalesRanking(products, movements, 'asc', 5);

  const topLines = topSellers.map((p, i) => `${i + 1}. ${p.description} (${p.code}) - ${p.sales} salidas`).join('\n');
  const lowLines = lowSellers.map((p, i) => `${i + 1}. ${p.description} (${p.code}) - ${p.sales} salidas`).join('\n');

  // --- Financial summary ---
  const totalInventoryValue = products.reduce((acc, p) => acc + calculateStock(p.id, movements) * p.cost, 0);
  const totalEntries = getTotalEntryCost(movements);
  const totalExits = getTotalExitCost(movements);

  // --- Products with zero stock ---
  const zeroStock = products.filter(p => calculateStock(p.id, movements) <= 0);
  const zeroStockLines = zeroStock.length > 0
    ? zeroStock.map(p => `- ${p.code}: ${p.description}`).join('\n')
    : 'Ninguno';

  // --- Low stock products ---
  const lowStockThreshold = settings.lowStockThreshold;
  const lowStock = products.filter(p => {
    const stock = calculateStock(p.id, movements);
    return stock > 0 && stock < lowStockThreshold;
  });
  const lowStockLines = lowStock.length > 0
    ? lowStock.map(p => `- ${p.code}: ${p.description} (Stock: ${calculateStock(p.id, movements)})`).join('\n')
    : 'Ninguno';

  return `Eres el asistente de inventario de "${settings.companyName}", una empresa distribuidora.

REGLAS DE FORMATO ESTRICTAS:
- Responde en español, de forma BREVE y DIRECTA. Máximo 8-12 líneas por respuesta.
- NO uses emojis. NO uses tablas extensas a menos que el usuario lo pida explícitamente.
- Ve al grano: di qué hacer y por qué en pocas palabras.
- Usa listas cortas (3-5 puntos máximo) y negritas (**texto**) para resaltar lo importante.
- NO repitas datos que el usuario ya puede ver en el dashboard.
- Si el usuario pide algo extenso, da un resumen primero y pregunta si quiere más detalle.

AUDITORÍA DE DATOS (hacer SIEMPRE, en cada respuesta):
- Revisa los nombres de productos buscando errores ortográficos o incoherencias.
- Detecta precios sospechosos (demasiado altos o bajos comparados con productos similares).
- Busca posibles duplicados (productos con descripciones muy parecidas).
- Si encuentras algún problema, agrega al final de tu respuesta una línea con "Nota:" y el problema detectado, de forma breve.
- Si NO encuentras problemas, no menciones nada sobre auditoría.

Tu rol: analizar los datos y dar recomendaciones accionables de negocio.

=== DATOS DEL INVENTARIO ===

PRODUCTOS (${products.length}):
${productLines}

POR CATEGORÍA:
${categoryLines}

MÁS VENDIDOS:
${topLines || 'Sin datos de ventas aún'}

MENOS VENDIDOS:
${lowLines || 'Sin datos de ventas aún'}

FINANCIERO:
- Valor total inventario: ${formatMoney(totalInventoryValue, currency)}
- Costo entradas: ${formatMoney(totalEntries, currency)}
- Costo salidas: ${formatMoney(totalExits, currency)}
- Movimientos: ${movements.length}

SIN STOCK: ${zeroStock.length > 0 ? zeroStock.map(p => p.code).join(', ') : 'Ninguno'}
STOCK BAJO (< ${lowStockThreshold}): ${lowStock.length > 0 ? lowStock.map(p => `${p.code}(${calculateStock(p.id, movements)})`).join(', ') : 'Ninguno'}

Moneda: ${currency} | Fecha: ${new Date().toLocaleDateString('es-PE')}`;
}
