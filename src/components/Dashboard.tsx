import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { FileBox, TrendingUp, TrendingDown, History, AlertCircle } from 'lucide-react';
import { $products, $movements, getStock } from '../stores/inventoryStore';
import { calculateStats, getCriticalProducts } from '../lib/calculations';
import { $settings, formatMoney } from '../stores/settingsStore';
import StatCard from './ui/StatCard';

export default function Dashboard() {
  const products = useStore($products);
  const movements = useStore($movements);
  const settings = useStore($settings);
  const stats = calculateStats(products, movements);
  const criticalProducts = getCriticalProducts(products, movements, settings.lowStockThreshold).slice(0, 5);

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <StatCard
        title="Valor Inventario"
        value={formatMoney(stats.totalValue, settings.currency)}
        subtitle="Basado en costo unitario"
        icon={<FileBox className="text-blue-600" />}
      />
      <StatCard
        title="Más Vendido"
        value={stats.mostSold?.name || 'N/A'}
        subtitle={`${stats.mostSold?.sales || 0} unidades despachadas`}
        icon={<TrendingUp className="text-green-600" />}
      />
      <StatCard
        title="Baja Rotación"
        value={stats.leastSold?.name || 'N/A'}
        subtitle={`${stats.leastSold?.sales || 0} unidades despachadas`}
        icon={<TrendingDown className="text-orange-600" />}
      />
      <StatCard
        title="Movimientos"
        value={stats.totalMovements.toString()}
        subtitle="Total histórico"
        icon={<History className="text-purple-600" />}
      />

      {/* Critical Stock Table */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
        <div className="bg-white border border-[#141414] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-serif italic">Productos Críticos / Bajo Stock</h2>
            <AlertCircle className="text-red-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#141414] text-xs uppercase opacity-50 font-mono">
                  <th className="py-2">Código</th>
                  <th className="py-2">Descripción</th>
                  <th className="py-2">Stock Actual</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {criticalProducts.map(p => (
                  <tr key={p.id} className="border-b border-[#141414] hover:bg-gray-50">
                    <td className="py-3">{p.code}</td>
                    <td className="py-3">{p.description}</td>
                    <td className="py-3">{getStock(p.id)} {p.unit}</td>
                    <td className="py-3">
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">CRÍTICO</span>
                    </td>
                  </tr>
                ))}
                {criticalProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center opacity-50">Sin alertas de stock</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
