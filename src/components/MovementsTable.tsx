import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { $products, $movements } from '../stores/inventoryStore';
import { $settings, formatMoney } from '../stores/settingsStore';
import MovementModal from './modals/MovementModal';

export default function MovementsTable() {
  const products = useStore($products);
  const movements = useStore($movements);
  const settings = useStore($settings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedMovements = [...movements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <motion.div
      key="movements"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#141414] text-white px-6 py-2 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <ArrowDownLeft size={18} /> Registrar Movimiento
        </button>
      </div>

      <div className="bg-white border border-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white text-xs uppercase font-mono">
                <th className={`${settings.compactTables ? 'p-3' : 'p-4'} border-r border-white/20`}>Fecha</th>
                <th className={`${settings.compactTables ? 'p-3' : 'p-4'} border-r border-white/20`}>Producto</th>
                <th className={`${settings.compactTables ? 'p-3' : 'p-4'} border-r border-white/20`}>Tipo</th>
                <th className={`${settings.compactTables ? 'p-3' : 'p-4'} border-r border-white/20 text-right`}>Cantidad</th>
                <th className={`${settings.compactTables ? 'p-3' : 'p-4'} border-r border-white/20 text-right`}>Costo unit.</th>
                <th className={settings.compactTables ? 'p-3' : 'p-4'}>Notas</th>
              </tr>
            </thead>
            <tbody className={`font-mono ${settings.compactTables ? 'text-xs' : 'text-sm'}`}>
              {sortedMovements.map(m => {
                const prod = products.find(p => p.id === m.productId);
                return (
                  <tr key={m.id} className="border-b border-[#141414] hover:bg-gray-50 transition-colors">
                    <td className={`${settings.compactTables ? 'p-3' : 'p-4'} whitespace-nowrap text-xs`}>
                      {new Date(m.date).toLocaleString()}
                    </td>
                    <td className={settings.compactTables ? 'p-3' : 'p-4'}>
                      <div className="font-bold">{prod?.code}</div>
                      <div className="text-xs opacity-60">{prod?.description}</div>
                    </td>
                    <td className={settings.compactTables ? 'p-3' : 'p-4'}>
                      <span
                        className={`px-2 py-1 flex items-center gap-1 w-fit text-[10px] uppercase font-bold ${
                          m.type === 'IN'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {m.type === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                        {m.type === 'IN' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className={`${settings.compactTables ? 'p-3' : 'p-4'} text-right font-bold`}>
                      {m.quantity} {prod?.unit}
                    </td>
                    <td className={`${settings.compactTables ? 'p-3' : 'p-4'} text-right`}>{formatMoney(m.cost, settings.currency)}</td>
                    <td className={`${settings.compactTables ? 'p-3' : 'p-4'} opacity-70 italic text-xs`}>{m.notes}</td>
                  </tr>
                );
              })}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center opacity-30 italic">
                    No hay movimientos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MovementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}
