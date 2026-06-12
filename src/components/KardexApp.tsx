import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { AnimatePresence } from 'motion/react';
import { FileUp, FileDown } from 'lucide-react';
import { $products, $movements, loadFromDatabase, importProducts } from '../stores/inventoryStore';
import { $settings } from '../stores/settingsStore';
import { parseExcelFile, exportInventoryToExcel } from '../lib/excelHandlers';
import exportInventoryToPDF from '../lib/pdfExporter';
import type { TabType } from '../types';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ProductsTable from './ProductsTable';
import MovementsTable from './MovementsTable';
import Reports from './Reports';
import SettingsPanel from './SettingsPanel';
import NotificationContainer from './ui/Notification';
import ChatBot from './ChatBot';

// Feature flag: Asistente IA (Groq) desactivado temporalmente.
// Para reactivarlo, cambiar a `true`. No requiere ningún otro cambio.
const ASSISTANT_ENABLED = false;

const TAB_TITLES: Record<'es' | 'en', Record<TabType, string>> = {
  es: {
    dashboard: 'Resumen General',
    products: 'Catálogo de Productos',
    movements: 'Historial de Kardex',
    reports: 'Análisis de Rotación',
    settings: 'Configuración',
  },
  en: {
    dashboard: 'General Overview',
    products: 'Product Catalog',
    movements: 'Kardex History',
    reports: 'Rotation Analysis',
    settings: 'Settings',
  },
};

export default function KardexApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const products = useStore($products);
  const movements = useStore($movements);
  const settings = useStore($settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from Supabase on mount
  useEffect(() => {
    loadFromDatabase();
  }, []);

  // Excel import handler
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        if (typeof bstr === 'string') {
          const newProducts = parseExcelFile(bstr);
          await importProducts(newProducts);
        }
      } catch {
        // Error is handled by parseExcelFile
      }
    };
    reader.readAsBinaryString(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="ml-20 md:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif italic mb-1">
              {TAB_TITLES[settings.language][activeTab]}
            </h1>
            <p className="text-[#141414] opacity-60 text-sm">{settings.companyName}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white border border-[#141414] px-4 py-2 text-sm font-medium hover:bg-[#141414] hover:text-white transition-colors"
            >
              <FileUp size={16} /> <span className="hidden sm:inline">Importar</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx,.xls"
              className="hidden"
            />

            <button
              onClick={() => (settings.defaultReportFormat === 'pdf' ? exportInventoryToPDF(products, movements) : exportInventoryToExcel(products, movements))}
              className="flex items-center gap-2 bg-white border border-[#141414] px-4 py-2 text-sm font-medium hover:bg-[#141414] hover:text-white transition-colors"
            >
              <FileDown size={16} />
              <span className="hidden sm:inline">Exportar {settings.defaultReportFormat.toUpperCase()}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="max-w-7xl">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'products' && <ProductsTable />}
            {activeTab === 'movements' && <MovementsTable />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'settings' && <SettingsPanel />}
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications */}
      <NotificationContainer />

      {/* AI Chatbot */}
      {ASSISTANT_ENABLED && <ChatBot />}
    </div>
  );
}
