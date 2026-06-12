import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { Download, FileSpreadsheet, FileText, Sparkles, BarChart3 } from 'lucide-react';
import { $products, $movements } from '../stores/inventoryStore';
import { $settings, formatMoney } from '../stores/settingsStore';
import { getProductSalesRanking, getTotalEntryCost, getTotalExitCost, calculateStats } from '../lib/calculations';
import ReportCard from './ui/ReportCard';
import { exportInventoryToExcel } from '../lib/excelHandlers';
import exportInventoryToPDF from '../lib/pdfExporter';

export default function Reports() {
  const products = useStore($products);
  const movements = useStore($movements);
  const settings = useStore($settings);
  const stats = calculateStats(products, movements);

  const [format, setFormat] = useState<'pdf' | 'excel'>(settings.defaultReportFormat);

  React.useEffect(() => {
    setFormat(settings.defaultReportFormat);
  }, [settings.defaultReportFormat]);

  function handleExport() {
    if (format === 'excel') {
      exportInventoryToExcel(products, movements);
    } else {
      exportInventoryToPDF(products, movements);
    }
  }

  const topSellers = getProductSalesRanking(products, movements, 'desc', 5);
  const lowSellers = getProductSalesRanking(products, movements, 'asc', 5);
  const totalEntries = getTotalEntryCost(movements);
  const totalExits = getTotalExitCost(movements);

  return (
    <motion.div
      key="reports"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Reportes + exportación
            </div>
            <h2 className="text-3xl font-serif italic md:text-4xl">{settings.companyName}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Consulta la rotación de productos, los costos del inventario y exporta reportes profesionales en PDF o Excel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Productos</div>
              <div className="mt-1 text-2xl font-semibold">{products.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Movimientos</div>
              <div className="mt-1 text-2xl font-semibold">{movements.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Entradas</div>
              <div className="mt-1 text-xl font-semibold text-emerald-300">{formatMoney(totalEntries, settings.currency)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Valor actual</div>
              <div className="mt-1 text-xl font-semibold text-sky-300">{formatMoney(stats.totalValue, settings.currency)}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md">
            <Download className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Exportar reportes</p>
            <p className="text-xs text-slate-500">Elige el formato y descarga el informe listo para compartir.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Formato</label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value as 'pdf' | 'excel')}
              className="bg-transparent text-sm outline-none"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            {format === 'pdf' ? <FileText className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
            Exportar {format.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ReportCard title="Top 5 - Más Vendidos" description="Productos con mayor rotación de stock (Salidas)">
        <div className="flex flex-col gap-4">
          {topSellers.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-500 shadow-sm">#{idx + 1}</span>
                <div>
                  <div className="font-bold text-sm text-slate-900">{p.description}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{p.code}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-green-600">+{p.sales}</div>
                <div className="text-[10px] uppercase text-slate-400">{p.unit}</div>
              </div>
            </div>
          ))}
          {topSellers.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center italic text-slate-400">Sin datos de ventas</p>
          )}
        </div>
      </ReportCard>

        <ReportCard title="Top 5 - Menos Vendidos" description="Productos con baja rotación en el periodo">
        <div className="flex flex-col gap-4">
          {lowSellers.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition hover:bg-slate-100/80">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-500 shadow-sm">#{idx + 1}</span>
                <div>
                  <div className="font-bold text-sm text-slate-900">{p.description}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{p.code}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-orange-600">+{p.sales}</div>
                <div className="text-[10px] uppercase text-slate-400">{p.unit}</div>
              </div>
            </div>
          ))}
          {lowSellers.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center italic text-slate-400">Sin datos de ventas</p>
          )}
        </div>
      </ReportCard>

      {/* Economic Summary */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <h3 className="mb-6 text-2xl font-serif italic text-slate-900">Resumen Económico del Inventario</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Costo Total de Entradas</div>
            <div className="text-3xl font-mono text-slate-900">{formatMoney(totalEntries, settings.currency)}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Ingresos por Salidas (Costo)</div>
            <div className="text-3xl font-mono text-slate-900">{formatMoney(totalExits, settings.currency)}</div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Valor en Almacén Actual</div>
            <div className="text-3xl font-mono text-sky-700">{formatMoney(stats.totalValue, settings.currency)}</div>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
